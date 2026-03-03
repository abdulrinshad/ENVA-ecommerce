const express = require("express");
const router = express.Router();

// Import controller as a single object (bulletproof)
const orderController = require("../controllers/order.controller");

// Import middleware (both exist ✅)
const { protect, adminOnly } = require("../middleware/auth.middleware");

/* =====================================================
   IMPORTANT RULE
   Static routes MUST come before dynamic (:id) routes
===================================================== */


/* =========================
   ADMIN ORDER ROUTES
   (Transactions Page)
========================= */

// Transaction summary cards
router.get(
  "/admin/stats",
  protect,
  adminOnly,
  orderController.adminGetOrderStats
);

// Transaction table (orders list)
router.get(
  "/admin",
  protect,
  adminOnly,
  orderController.adminGetOrders
);


/* =========================
   USER ORDER ROUTES
========================= */

// Place order
router.post("/", protect, orderController.placeOrder);

// User returns list
router.get("/returns", protect, orderController.getMyReturns);

// User cancellations list
router.get("/cancellations", protect, orderController.getMyCancellations);

// Cancel full order
router.put("/cancel/:id", protect, orderController.cancelOrder);

// Cancel single item
router.put(
  "/:orderId/items/:itemId/cancel",
  protect,
  orderController.requestItemCancel
);

// Return single item
router.put(
  "/:orderId/return-item/:itemId",
  protect,
  orderController.requestReturnItem
);

// Get all my orders
router.get("/", protect, orderController.getMyOrders);

// Get single order (⚠️ MUST BE LAST)
router.get("/:id", protect, orderController.getOrderById);

module.exports = router;
