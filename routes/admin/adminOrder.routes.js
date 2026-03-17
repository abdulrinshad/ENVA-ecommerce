const express = require("express");
const router = express.Router();

const getAllOrders = require("../../controllers/admin-order/getAllOrders.controller");
const getOrdersForManagement = require("../../controllers/admin-order/getOrdersForManagement.controller");
const updateOrderStatus = require("../../controllers/admin-order/updateOrderStatus.controller");
const acceptItemReturn = require("../../controllers/admin-order/acceptItemReturn.controller");
const declineItemReturn = require("../../controllers/admin-order/declineItemReturn.controller");
const schedulePickup = require("../../controllers/admin-order/schedulePickup.controller");
const completeReturn = require("../../controllers/admin-order/completeReturn.controller");
const acceptItemCancel = require("../../controllers/admin-order/acceptItemCancel.controller");
const declineItemCancel = require("../../controllers/admin-order/declineItemCancel.controller");
const getSingleOrder = require("../../controllers/admin-order/getSingleOrder.controller");

const { protect, adminOnly } = require("../../middleware/auth.middleware");

/* =========================
   ADMIN ORDER ROUTES
========================= */

// GET ALL ORDERS
router.get("/", protect, adminOnly, getAllOrders);

// ORDER MANAGEMENT
router.get("/management", protect, adminOnly, getOrdersForManagement);

// GET SINGLE ORDER
router.get("/:id", protect, adminOnly, getSingleOrder);

// UPDATE ORDER STATUS
router.put("/:orderId/status", protect, adminOnly, updateOrderStatus);

// ACCEPT RETURN
router.put("/:orderId/items/:itemId/accept-return", protect, adminOnly, acceptItemReturn);

// DECLINE RETURN
router.put("/:orderId/items/:itemId/decline-return", protect, adminOnly, declineItemReturn);

// SCHEDULE PICKUP
router.put("/:orderId/return/pickup", protect, adminOnly, schedulePickup);

// COMPLETE RETURN
router.put("/:orderId/return/complete", protect, adminOnly, completeReturn);

// ACCEPT CANCEL
router.put("/:orderId/items/:itemId/cancel/accept", protect, adminOnly, acceptItemCancel);

// DECLINE CANCEL
router.put("/:orderId/items/:itemId/cancel/decline", protect, adminOnly, declineItemCancel);

module.exports = router;