const router = require("express").Router();
const {
  getAllCustomers,
  toggleBlockCustomer,
  deleteCustomer
} = require("../controllers/admin.customer.controller");

const { protectAdmin } = require("../middleware/adminAuth.middleware");

router.get("/customers", protectAdmin, getAllCustomers);
router.put("/customers/:id/block", protectAdmin, toggleBlockCustomer);
router.delete("/customers/:id", protectAdmin, deleteCustomer);

module.exports = router;
