// utils/billing.js
function calculateBillSriLanka(energyKWh) {
    const fixedCharge = 80; // LKR
    const blocks = [
        { upto: 60, rate: 6.0 },
        { upto: 30, rate: 14.0 },
        { upto: 30, rate: 20.0 },
        { upto: null, rate: 25.0 }
    ];

    let remaining = energyKWh;
    let bill = fixedCharge;

    for (const block of blocks) {
        if (remaining <= 0) break;

        if (block.upto === null) {
            bill += remaining * block.rate;
            remaining = 0;
        } else {
            const blockKWh = Math.min(remaining, block.upto);
            bill += blockKWh * block.rate;
            remaining -= blockKWh;
        }
    }

    return bill;
}

module.exports = { calculateBillSriLanka };
