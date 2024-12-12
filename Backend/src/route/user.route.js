const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const auth = require("../middleware/auth");
const passport = require("../services/passport");
const jwt = require("jsonwebtoken");

// Utility function to generate a JWT token
const generateToken = (userId) => {
    const secretKey = process.env.JWT_SECRET || "default_secret"; // Use your actual secret key
    return jwt.sign({ id: userId }, secretKey, { expiresIn: "1h" });
};

// Login and Sign Up routes
router.post("/login", userController.login || ((req, res) => res.status(500).json({ error: "Login function not defined" })));
router.post("/signup", userController.signup || ((req, res) => res.status(500).json({ error: "Signup function not defined" })));

// Protected routes
router.get("/user-profile", auth.UserMiddleware, userController.getUserProfile || ((req, res) => res.status(500).json({ error: "getUserProfile function not defined" })));
router.get("/diagram", auth.UserMiddleware, userController.getDiagram || ((req, res) => res.status(500).json({ error: "getDiagram function not defined" })));
router.post("/creatediagram", auth.UserMiddleware, userController.createDiagram || ((req, res) => res.status(500).json({ error: "createDiagram function not defined" })));
router.post("/diagram", auth.UserMiddleware, userController.updateDiagram || ((req, res) => res.status(500).json({ error: "updateDiagram function not defined" })));

// Google Authentication Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    const token = generateToken(req.user.id);
    res.json({ token });
});

// Facebook Authentication Routes
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
    const token = generateToken(req.user.id);
    res.json({ token });
});

module.exports = router;
