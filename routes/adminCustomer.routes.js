const express = require("express");
const router = express.Router();

/* ✅ FIX IS HERE */
const { adminProtect } = require("../middleware/admin.middleware");

const getAllCustomers = require("../controllers/admin-customer/getAllCustomers.controller");
const toggleBlockCustomer = require("../controllers/admin-customer/toggleBlockCustomer.controller");
const deleteCustomer = require("../controllers/admin-customer/deleteCustomer.controller");

router.get("/customers", adminProtect, getAllCustomers);
router.patch("/customers/:id/block", adminProtect, toggleBlockCustomer);
router.delete("/customers/:id", adminProtect, deleteCustomer);

module.exports = router;
