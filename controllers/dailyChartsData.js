const Average1Day = require("../models/Average1Day");

// GET /api/daily
const getDailyDetails = async (req, res) => {
  try {
    // Optional filters
    const { deviceId, startDate, endDate } = req.query;

    // Build query
    const query = {};
    if (deviceId) query.deviceId = deviceId;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Fetch data sorted by date
    const data = await Average1Day.find(query).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("Error fetching daily details:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

module.exports = {
  getDailyDetails
};