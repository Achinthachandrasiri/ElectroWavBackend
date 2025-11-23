const Average4Min = require("../models/Average4Min");

const getPeakPowerByPeriod = async (req, res) => {
  try {
    const deviceId = req.query.deviceId || "ESP32_01";

    console.log(`📊 Querying energy consumption for device: ${deviceId}`);

    const energyByPeriod = await Average4Min.aggregate([
      { $match: { deviceId } },
      {
        $project: {
          energy: 1,
          timestamp: 1,
          hour: { $hour: { date: "$timestamp", timezone: "UTC" } },
        },
      },
      {
        $group: {
          _id: null,
          morningEnergy: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$hour", 6] }, { $lt: ["$hour", 12] }] },
                "$energy",
                0,
              ],
            },
          },
          afternoonEnergy: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$hour", 12] }, { $lt: ["$hour", 18] }] },
                "$energy",
                0,
              ],
            },
          },
          eveningEnergy: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$hour", 18] }, { $lt: ["$hour", 22] }] },
                "$energy",
                0,
              ],
            },
          },
          nightEnergy: {
            $sum: {
              $cond: [
                {
                  $or: [{ $lt: ["$hour", 6] }, { $gte: ["$hour", 22] }],
                },
                "$energy",
                0,
              ],
            },
          },
          totalRecords: { $sum: 1 },
          minDate: { $min: "$timestamp" },
          maxDate: { $max: "$timestamp" },
        },
      },
    ]);

    const data = energyByPeriod.length
      ? energyByPeriod[0]
      : {
          morningEnergy: 0,
          afternoonEnergy: 0,
          eveningEnergy: 0,
          nightEnergy: 0,
          totalRecords: 0,
        };

    const result = {
      morning: { energy: parseFloat((data.morningEnergy / 1000).toFixed(4)) },
      afternoon: { energy: parseFloat((data.afternoonEnergy / 1000).toFixed(4)) },
      evening: { energy: parseFloat((data.eveningEnergy / 1000).toFixed(4)) },
      night: { energy: parseFloat((data.nightEnergy / 1000).toFixed(4)) },
    };

    // Determine highest energy period
    const highestPeriod = Object.entries(result).reduce(
      (max, [period, values]) =>
        values.energy > max.value ? { period, value: values.energy } : max,
      { period: "morning", value: 0 }
    );

    result.highestUsagePeriod = highestPeriod.period;
    result.highestEnergy = highestPeriod.value;

    console.log("📡 API returning energy by period:", result);

    res.status(200).json({
      success: true,
      deviceId,
      count: data.totalRecords,
      from: data.minDate,
      to: data.maxDate,
      data: result,
    });
  } catch (err) {
    console.error("❌ Error fetching peak power by period:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports = { getPeakPowerByPeriod };
