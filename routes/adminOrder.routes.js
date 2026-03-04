const express = require("express");
const router = express.Router();

const getAllOrders = require("../controllers/admin-order/getAllOrders.controller");
const getOrdersForManagement = require("../controllers/admin-order/getOrdersForManagement.controller");
const updateOrderStatus = require("../controllers/admin-order/updateOrderStatus.controller");
const acceptItemReturn = require("../controllers/admin-order/acceptItemReturn.controller");
const declineItemReturn = require("../controllers/admin-order/declineItemReturn.controller");
const schedulePickup = require("../controllers/admin-order/schedulePickup.controller");
const completeReturn = require("../controllers/admin-order/completeReturn.controller");
const acceptItemCancel = require("../controllers/admin-order/acceptItemCancel.controller");
const declineItemCancel = require("../controllers/admin-order/declineItemCancel.controller");
const getSingleOrder = require("../controllers/admin-order/getSingleOrder.controller");

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

// GET SINGLE ORDER DETAILS
router.get(
  "/orders/:id",
  protect,
  adminOnly,
  getSingleOrder
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
