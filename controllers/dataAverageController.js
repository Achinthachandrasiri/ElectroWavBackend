// controllers/sensorAverageController.js
const Average4Min = require("../models/Average4Min");
const Average1Hour = require("../models/Average1Hour");
const Average1Day = require("../models/Average1Day");

async function saveAverage4Min(data) {
  try {
    const avg = new Average4Min(data);
    await avg.save();
    return avg;
  } catch (err) {
    console.error("Error saving 4-min average:", err.message);
    throw err;
  }
}

async function saveAverage1Hour(data) {
  try {
    const avg = new Average1Hour(data);
    await avg.save();
    return avg;
  } catch (err) {
    console.error("Error saving 1-hour average:", err.message);
    throw err;
  }
}

async function saveAverage1Day(data) {
  try {
    const avg = new Average1Day(data);
    await avg.save();
    return avg;
  } catch (err) {
    console.error("Error saving 1-day average:", err.message);
    throw err;
  }
}

module.exports = { saveAverage4Min, saveAverage1Hour, saveAverage1Day,};
