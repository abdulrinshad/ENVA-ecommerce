module.exports = (cart) => {
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  cart.total = total;

  if (cart.coupon && cart.coupon.discount) {
    cart.finalTotal = Math.max(total - cart.coupon.discount, 0);
  } else {
    cart.finalTotal = total;
    cart.coupon = null;
  }
};