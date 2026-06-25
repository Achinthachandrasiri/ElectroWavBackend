// controllers/billingController.js
const MonthlyEnergy = require("../models/MonthlyEnergy");

// ⚡ Tiered rates (same as before)
// Sri Lanka electricity tiers with fixed charge
const tieredRates = [
  { limit: 30, rate: 10, fixed: 75 },
  { limit: 60, rate: 20, fixed: 150 },
  { limit: 90, rate: 30, fixed: 400 },
  { limit: 120, rate: 40, fixed: 1000 },
  { limit: 180, rate: 50, fixed: 1500 },
  { limit: Infinity, rate: 75, fixed: 2000 }
];

function calculateTieredBill(kWh) {

  let totalBill = 0;
  let remaining = kWh;
  let previousLimit = 0;
  let fixedCharge = 0;

  for (const tier of tieredRates) {

    const tierSize = tier.limit - previousLimit;
    const consumption = Math.min(remaining, tierSize);

    if (consumption <= 0) break;

    totalBill += consumption * tier.rate;
    remaining -= consumption;

    fixedCharge = tier.fixed; 
    previousLimit = tier.limit;
  }

  const finalBill = totalBill + fixedCharge;

  return parseFloat(finalBill.toFixed(2));
}
/**
 * Predict monthly bill
 */
async function predictMonthlyBill(deviceId) {
  try {
    const today = new Date();

    const year = today.getUTCFullYear();               
    const month = today.getUTCMonth() + 1;             
    const currentDay = today.getUTCDate();            

    // ✅ Days in current month
    const daysInMonth = new Date(year, month, 0).getDate();  
    const daysRemaining = daysInMonth - currentDay;        

    // ✅ Fetch monthly cumulative energy
    const monthlyEnergy = await MonthlyEnergy.findOne({ deviceId, year, month }); 
    const energySoFar = monthlyEnergy ? monthlyEnergy.totalEnergyKWh : 0;         
    // ✅ Avoid unrealistic prediction for very early days
    if (currentDay < 2 || energySoFar <= 0) {              
      return {
        energySoFar: parseFloat(energySoFar.toFixed(2)),  
        currentBill: calculateTieredBill(energySoFar),     
        predictedEnergy: null,
        predictedBill: null,
        avgDailyKWh: null,
        daysElapsed: currentDay,
        daysRemaining,
        year,
        month,
        message: "Not enough data to predict yet. Please check back after a few days." 
      };
    }

    // ✅ Calculate daily average consumption
    const avgDailyKWh = energySoFar / currentDay;       

    // ✅ Project remaining consumption
    const predictedRemainingKWh = avgDailyKWh * daysRemaining;  
    const predictedTotalKWh = energySoFar + predictedRemainingKWh; 

    // ✅ Compute bills
    const currentBill = calculateTieredBill(energySoFar);          
    const predictedBill = calculateTieredBill(predictedTotalKWh);  

    return {
      energySoFar: parseFloat(energySoFar.toFixed(2)),      
      currentBill,
      predictedEnergy: parseFloat(predictedTotalKWh.toFixed(2)), 
      predictedBill,
      avgDailyKWh: parseFloat(avgDailyKWh.toFixed(2)),     
      daysElapsed: currentDay,
      daysRemaining,
      year,
      month
    };
  } catch (err) {
    console.error("❌ Failed to calculate monthly bill:", err.message);
    return {
      energySoFar: 0,
      currentBill: 0,
      predictedEnergy: 0,
      predictedBill: 0,
      error: err.message
    };
  }
}

module.exports = { predictMonthlyBill, calculateTieredBill };
