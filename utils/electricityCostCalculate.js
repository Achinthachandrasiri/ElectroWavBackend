// utils/electricityCostCalculate.js

function calculateBillSriLanka(units) {
  units = Number(units);

  if (isNaN(units) || units < 0) {
    return 0;
  }

  let energyCost = 0;
  let fixedCharge = 80; // LKR fixed charge

  // 0–30 units
  if (units <= 30) {
    energyCost = units * 30;
  }

  // 31–60 units
  else if (units <= 60) {
    energyCost =
      (30 * 30) +                // first 30 units
      ((units - 30) * 37);       // next units
  }

  // 61–90 units
  else if (units <= 90) {
    energyCost =
      (30 * 30) +                // 0–30
      (30 * 37) +                // 31–60
      ((units - 60) * 42);       // 61–90
  }

  // above 90 units
  else {
    energyCost =
      (30 * 30) +                // 0–30
      (30 * 37) +                // 31–60
      (30 * 42) +                // 61–90
      ((units - 90) * 50);       // 90+
  }

  const totalBill = energyCost + fixedCharge;

  return Number(totalBill.toFixed(2));
}

module.exports = { calculateBillSriLanka };