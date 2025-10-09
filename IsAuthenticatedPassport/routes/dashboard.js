const express = require("express");
const passport = require("passport");

const router = express.Router();

// GET /dashboard protetto con JWT
router.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ message: "Benvenuto nella dashboard!", user: req.user });
});

module.exports = router;