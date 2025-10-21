const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.json({ message: "Logout ok (invalida il token lato client)" });
});

module.exports = router;