const express = require("express");
const path = require("path");
const connectDB = require("./config/db");


const app = express();

// DB
connectDB();

// Middleware
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Pages
app.get("/", (req, res) => {
  res.redirect("/user/index.html");
});


app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "adminLogin.html"));
});

// API routes
app.use("/api/auth", require("./routes/auth.routes"));

app.use("/api/admin", require("./routes/admin.product.routes"));
app.use("/api/admin", require("./routes/adminOrder.routes"));


app.use("/api/admin", require("./routes/adminCustomer.routes"));


app.use("/api/products", require("./routes/product.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/categories", require("./routes/category.routes")); // ✅ ADD THIS

app.use("/api/coupons", require("./routes/coupon.routes"));

app.use("/api/offers", require("./routes/offer.routes"));

app.use("/api/wishlist", require("./routes/wishlist.routes"));


/* ✅ FIXED HERE */
app.use("/api/address", require("./routes/address.routes"));


app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/payment", require("./routes/payment.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;
