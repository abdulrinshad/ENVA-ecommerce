const express = require("express");
const router = express.Router();

const {
  getAllCustomers,
  toggleBlockCustomer,
  deleteCustomer
} = require("../../controllers/admin-customer");

const { adminProtect } = require("../../middleware/admin.middleware");


router.get("/", adminProtect, getAllCustomers);
router.put("/:id/block", adminProtect, toggleBlockCustomer);
router.delete("/:id", adminProtect, deleteCustomer);

module.exports = router;