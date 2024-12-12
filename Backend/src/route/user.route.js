const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const auth = require("../middleware/auth");

// Login Sign up
router.post("/login", userController.login);
router.post("/signup", userController.signup);

// Protected routes
router.get("/user-profile", auth.UserMiddleware, userController.getUserProfile);
router.get("/diagram", auth.UserMiddleware, userController.getDiagram);
router.post("/creatediagram", auth.UserMiddleware, userController.createDiagram);
router.post("/diagram", auth.UserMiddleware,userController.updateDiagram);
module.exports = router;


// // Protected routes
// router.get("/user-profile", auth.UserMiddleware, userController.getUserProfile);
// router.get("/diagram", auth.UserMiddleware, userController.getDiagramFromS3);
// router.post("/creatediagram", auth.UserMiddleware, userController.createDiagram);
// router.post("/diagram", auth.UserMiddleware,userController.updateDiagram);
// module.exports = router;