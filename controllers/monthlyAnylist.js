// controllers/energyController.js
const MonthlyEnergy = require("../models/MonthlyEnergy");

const getMonthlyEnergyByYear = async (req, res) => {
  try {
    const deviceId = req.query.deviceId || "ESP32_01";
    const year = req.query.year || new Date().getFullYear();

    console.log(`Querying monthly energy for device: ${deviceId}, year: ${year}`);

    // Fetch all monthly records for the device and year
    const monthlyData = await MonthlyEnergy.find({
      deviceId,
      year: parseInt(year)
    }).sort({ month: 1 });

    // Initialize array with 12 months (0 energy by default)
    const monthlyEnergyArray = Array(12).fill(0);

    // Fill in actual data
    monthlyData.forEach(record => {
      if (record.month >= 1 && record.month <= 12) {
        monthlyEnergyArray[record.month - 1] = record.totalEnergyKWh;
      }
    });

    // Find highest usage month
    const maxEnergy = Math.max(...monthlyEnergyArray);
    const highestMonth = monthlyEnergyArray.indexOf(maxEnergy) + 1;
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const totalYearlyEnergy = monthlyEnergyArray.reduce((sum, val) => sum + val, 0);

    console.log("📡 API returning monthly energy data:", monthlyEnergyArray);

    res.status(200).json({
      success: true,
      deviceId,
      year: parseInt(year),
      data: {
        monthlyEnergy: monthlyEnergyArray,
        totalYearlyEnergy: parseFloat(totalYearlyEnergy.toFixed(2)),
        highestMonth: monthNames[highestMonth - 1],
        highestEnergy: parseFloat(maxEnergy.toFixed(2)),
        averageMonthly: parseFloat((totalYearlyEnergy / 12).toFixed(2))
      }
    });
  } catch (err) {
    console.error("❌ Error fetching monthly energy data:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports = { getMonthlyEnergyByYear };