const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");


const addAddress = require("../controllers/adress/addAddress.controller");
const getAddress = require("../controllers/adress/getAddress.controller");

router.post("/", protect, addAddress);
router.get("/", protect, getAddress);

module.exports = router;
