const cron = require("node-cron");
const Coupon = require("../models/coupon.model");

/* =========================
   COUPON AUTO EXPIRY CRON
========================= */
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();

    const result = await Coupon.updateMany(
      {
        isActive: true,
        endDate: { $lt: now }
      },
      { $set: { isActive: false } }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ ${result.modifiedCount} coupon(s) expired automatically`);
    }

  } catch (err) {
    console.error("Coupon cron error:", err);
  }
});
