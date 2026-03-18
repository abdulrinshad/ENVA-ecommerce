const express = require("express");
const path = require("path");
const connectDB = require("./config/db");


const app = express();

// DB
connectDB();

// Middleware
app.use(express.json());

// Static files
// Static files
app.use("/user", express.static(path.join(__dirname, "public", "user")));
app.use("/admin", express.static(path.join(__dirname, "public", "admin")));

// Pages
app.get("/", (req, res) => {
  res.redirect("/user/index.html");
});


app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "adminLogin.html"));
});



app.use("/api",require("./routes/api.routes"))



app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;
