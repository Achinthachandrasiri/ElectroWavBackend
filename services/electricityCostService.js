// services/electricityCostService.js (or fourMinSocketService.js)
const Average4Min = require("../models/Average4Min");
const { calculateBillSriLanka } = require("../utils/electricityCostCalculate");

async function sendFourMinAverage(io) {
    try {
        // Get the latest 4-min average entry
        const latestAverage = await Average4Min.findOne().sort({ timestamp: -1 });
        if (!latestAverage) return;

        const energy = parseFloat(latestAverage.energy);
        const bill = calculateBillSriLanka(energy);

        const dataToSend = {
            voltage: latestAverage.voltage.toFixed(2),
            ampere: latestAverage.current.toFixed(2),  
            watt: latestAverage.realPower.toFixed(2), 
            energy: energy.toFixed(4),
            bill: bill.toFixed(2),
            timestamp: latestAverage.timestamp,
            count: latestAverage.count,
            interval: "4min"
        };

        io.emit("sensor-average-4min", dataToSend);
        console.log("[4MIN AVERAGE + BILL SENT]", dataToSend);
    } catch (err) {
        console.error("Error sending 4-min average:", err.message);
    }
}

async function calculateMonthlyBill() {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const tomorrow = new Date(yesterday);
  tomorrow.setHours(23, 59, 59, 999);

  const daily = await Average1Day.findOne({
    timestamp: { $gte: yesterday, $lte: tomorrow }
  });

  if (!daily) return { bill: 0, message: "No daily average found" };

  const dailyKWh = daily.energy / 1000;
  const monthlyKWh = dailyKWh * 30;
  const bill = calculateBillSriLanka(monthlyKWh);

  return {
    dailyKWh: dailyKWh.toFixed(2),
    monthlyKWh: monthlyKWh.toFixed(2),
    bill: bill.toFixed(2)
  };
}

module.exports = { sendFourMinAverage, calculateMonthlyBill };