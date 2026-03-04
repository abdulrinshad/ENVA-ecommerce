const Order = require("../../models/order.model");
const Cart = require("../../models/cart.model");
const User = require("../../models/user.model");
const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product", "name price");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const subtotal = cart.total;
    const shipping = 5;
    const total = cart.finalTotal + shipping;

    const count = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${count + 1}`;

    if (paymentMethod === "wallet") {
      const user = await User.findById(userId);

      if (user.wallet.balance < total) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance"
        });
      }

      user.wallet.balance -= total;
      user.wallet.transactions.push({
        type: "debit",
        amount: total,
        description: "Order purchase"
      });

      await user.save();
    }

    for (const item of cart.items) {

      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      const size = item.size;
      const orderedQty = item.qty;

      if (product.sizes && size) {

        if (!product.sizes[size] || product.sizes[size] < orderedQty) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${product.name} (${size})`
          });
        }

        product.sizes[size] -= orderedQty;

      } else if (product.stock !== undefined) {

        if (product.stock < orderedQty) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items left`
          });
        }

        product.stock -= orderedQty;
      }

      await product.save();
    }

    const order = await Order.create({
      orderNumber,
      user: userId,

      items: cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        size: item.size,
        returnStatus: "NONE",
        cancelStatus: "NONE",
        returnedQty: 0,
        requestedReturnQty: 0,
        adminMessage: ""
      })),

      subtotal,
      shipping,
      total,
      finalAmount: total,

      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      status: "Placed"
    });

    cart.items = [];
    cart.coupon = null;
    cart.total = 0;
    cart.finalTotal = 0;

    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });

  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Order failed"
    });
  }
};