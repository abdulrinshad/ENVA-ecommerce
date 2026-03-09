const express = require("express");
const router = express.Router();

/* ✅ FIX IS HERE */
const { adminProtect } = require("../middleware/admin.middleware");

const { getAllCustomers, toggleBlockCustomer, deleteCustomer } = require("../controllers/admin-customer");
router.get("/customers", adminProtect, getAllCustomers);
router.patch("/customers/:id/block", adminProtect, toggleBlockCustomer);
router.delete("/customers/:id", adminProtect, deleteCustomer);

module.exports = router;
