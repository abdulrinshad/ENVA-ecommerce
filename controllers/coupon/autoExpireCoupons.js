const Coupon = require("../../models/coupon.model");

module.exports = async () => {
  const now = new Date();

  await Coupon.updateMany(
    {
      isActive: true,
      endDate: { $lt: now }
    },
    {
      $set: { isActive: false }
    }
  );
};