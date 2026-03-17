const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");

const addAddress = require("../controllers/adress/addAddress.controller");
const getAddress = require("../controllers/adress/getAddress.controller");
const updateAddress = require("../controllers/adress/updateAddress.controller");
const deleteAddress = require("../controllers/adress/deleteAddress.controller");

router.post("/", protect, addAddress);
router.get("/", protect, getAddress);

// NEW ROUTES
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);

module.exports = router;