// services/consumerService.js
const { connectRabbitMQ } = require("../config/rabbitmq");
const { saveAverage4Min, saveAverage1Hour, saveAverage1Day } = require("../controllers/dataAverageController");
const MonthlyEnergy = require("../models/MonthlyEnergy");
const { predictMonthlyBill } = require("../controllers/billingController");

async function startSensorService(io, queueName = "sensor_data") {
  try {
    const channel = await connectRabbitMQ();
    console.log("✅ Sensor service connected to RabbitMQ");

    // Buffers for averaging
    let buffer4min = [];
    let buffer1hr = [];
    let buffer1day = [];

    // Helper to validate sensor data
    const isValidSensorData = (data) => {
      if (!data || typeof data !== 'object') return false;
      
      const requiredFields = ['voltage', 'current', 'realPower', 'energyWh', 'deviceId'];
      
      for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
          return false;
        }
        
        if (field !== 'deviceId' && (isNaN(data[field]) || !isFinite(data[field]))) {
          return false;
        }
      }
      
      return true;
    };

    // Helper to calculate averages
    const calculateAndEmit = async (buffer, label) => {
      if (!buffer.length) {
        return;
      }

      try {
        const sum = buffer.reduce(
          (acc, val) => {
            acc.voltage += Number(val.voltage) || 0;
            acc.current += Number(val.current) || 0;
            acc.realPower += Number(val.realPower) || 0;
            acc.energy += Number(val.energyWh) || 0;
            return acc;
          },
          { voltage: 0, current: 0, realPower: 0, energy: 0 }
        );

        const count = buffer.length;
        
        // Safe calculations with defaults
        const avgVoltage = (count > 0 && sum.voltage) ? sum.voltage / count : 0;
        const avgCurrent = (count > 0 && sum.current) ? sum.current / count : 0;
        const avgRealPower = (count > 0 && sum.realPower) ? sum.realPower / count : 0;
        const avgEnergy = (count > 0 && sum.energy) ? sum.energy / count : 0;

        // Skip if all zeros
        if (avgVoltage === 0 && avgCurrent === 0 && avgRealPower === 0 && avgEnergy === 0) {
          return;
        }

        const averageData = {
          deviceId: buffer[0]?.deviceId || "unknown",
          voltage: Number(avgVoltage.toFixed(2)),
          current: Number(avgCurrent.toFixed(2)),
          realPower: Number(avgRealPower.toFixed(2)),
          energy: Number(avgEnergy.toFixed(4)),
          timestamp: new Date(),
          count,
          interval: label,
        };

        // Emit to frontend
        io.emit(`sensor-average-${label}`, averageData);

        // Save to database
        if (label === "4min") await saveAverage4Min(averageData);
        if (label === "1hr") await saveAverage1Hour(averageData);
        if (label === "1day") await saveAverage1Day(averageData);

        console.log(`✅ ${label} average saved`);

      } catch (err) {
        console.error(`Error in ${label} average:`, err.message);
      }
    };

    // Consume messages from RabbitMQ
    channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;

        try {
          const data = JSON.parse(msg.content.toString());

          // Validate incoming data
          if (!isValidSensorData(data)) {
            channel.ack(msg);
            return;
          }

          // Push data into buffers
          buffer4min.push(data);
          buffer1hr.push(data);
          buffer1day.push(data);

          // Emit raw data to frontend
          io.emit("sensor-data", data);

          // Update monthly cumulative energy
          await updateMonthlyEnergy(data);

          // Emit monthly prediction
          const prediction = await predictMonthlyBill(data.deviceId);
          io.emit("monthly-prediction", prediction);

          channel.ack(msg);
        } catch (err) {
          console.error("❌ Error processing message:", err.message);
          channel.nack(msg, false, true);
        }
      },
      { noAck: false }
    );

    console.log('⏰ Setting up intervals...');

    // Set intervals
    setInterval(() => { 
      calculateAndEmit(buffer4min, "4min"); 
      buffer4min = []; 
    }, 4 * 60 * 1000);
    
    setInterval(() => { 
      calculateAndEmit(buffer1hr, "1hr"); 
      buffer1hr = []; 
    }, 60 * 60 * 1000);
    
    setInterval(() => { 
      calculateAndEmit(buffer1day, "1day"); 
      buffer1day = []; 
    }, 24 * 60 * 60 * 1000);

    console.log('✅ Consumer service running');

  } catch (err) {
    console.error("❌ Failed to start sensor service:", err.message);
    setTimeout(() => startSensorService(io, queueName), 5000);
  }
}

// Monthly cumulative updater
async function updateMonthlyEnergy(data) {
  try {
    if (!data || !data.timestamp || !data.deviceId || data.energyWh === undefined) {
      throw new Error("Missing required fields in data");
    }

    const ts = new Date(data.timestamp);
    if (isNaN(ts.getTime())) {
      throw new Error(`Invalid timestamp: ${data.timestamp}`);
    }

    const year = ts.getFullYear();
    const month = ts.getMonth() + 1;
    const energyKWh = Number(data.energyWh) / 1000;

    if (isNaN(energyKWh) || !isFinite(energyKWh)) {
      throw new Error(`Invalid energyWh value: ${data.energyWh}`);
    }

    if (energyKWh < 0) {
      return;
    }

    await MonthlyEnergy.findOneAndUpdate(
      { deviceId: data.deviceId, year, month },
      { $inc: { totalEnergyKWh: energyKWh } },
      { upsert: true, new: true }
    );

  } catch (err) {
    console.error("❌ Failed to update monthly energy:", err.message);
  }
}

module.exports = { startSensorService };