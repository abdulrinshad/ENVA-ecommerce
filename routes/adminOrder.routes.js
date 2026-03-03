const express = require("express");
const router = express.Router();

const {
  getAllOrders,
  getOrdersForManagement,   // 👈 ADD THIS
  updateOrderStatus,
  acceptItemReturn,
  declineItemReturn,
  schedulePickup,
  completeReturn,
  acceptItemCancel,
  declineItemCancel

} = require("../controllers/adminOrder.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");

/* =========================
   ADMIN ORDER ROUTES
========================= */

// GET ALL ORDERS
router.get(
  "/orders",
  protect,
  adminOnly,
  getAllOrders
);

// 🔹 ORDER MANAGEMENT (RAW)
router.get(
  "/orders/management",
  protect,
  adminOnly,
  getOrdersForManagement
);

// UPDATE ORDER STATUS
router.put(
  "/orders/:orderId/status",
  protect,
  adminOnly,
  updateOrderStatus
);

// ✅ ACCEPT RETURN (PER ITEM)
router.put(
  "/orders/:orderId/items/:itemId/accept-return",
  protect,
  adminOnly,
  acceptItemReturn
);

// ✅ DECLINE RETURN (PER ITEM)
router.put(
  "/orders/:orderId/items/:itemId/decline-return",
  protect,
  adminOnly,
  declineItemReturn
);

// SCHEDULE PICKUP (OPTIONAL – FUTURE)
router.put(
  "/orders/:orderId/return/pickup",
  protect,
  adminOnly,
  schedulePickup
);

// COMPLETE RETURN (OPTIONAL – FUTURE)
router.put(
  "/orders/:orderId/return/complete",
  protect,
  adminOnly,
  completeReturn
);


// ✅ ACCEPT CANCEL
router.put(
  "/orders/:orderId/items/:itemId/cancel/accept",
  protect,
  adminOnly,
  acceptItemCancel
);

// ✅ DECLINE CANCEL
router.put(
  "/orders/:orderId/items/:itemId/cancel/decline",
  protect,
  adminOnly,
  declineItemCancel
);
module.exports = router;
