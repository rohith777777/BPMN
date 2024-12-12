const express = require("express");
const router = express.Router();
const userRoutes = require("./src/route/user.route");

// Login Sign up
router.use("/user", userRoutes);

module.exports = router;
