const express = require("express");
const db = require("../models");
const userController = require("../controllers/user");

const router = express.Router();

router.get("/:id/orders", userController.getUserOrders);

module.exports = router;
