const express = require("express");
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const path = require("path");

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const app = express();

// Parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static (se usi /public per index.html, css, ecc.)
app.use(express.static(path.join(__dirname, "public")));

// Log base + header Authorization (utile per capire se arriva il token)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.headers.authorization) {
    console.log("Authorization:", req.headers.authorization);
  }
  next();
});

// Passport JWT
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOpts, (jwtPayload, done) => {
    console.log(">>> JWT payload ricevuto:", jwtPayload);
    if (jwtPayload && jwtPayload.username === "romy") {
      return done(null, jwtPayload);
    }
    return done(null, false);
  })
);

app.use(passport.initialize());
const requireAuth = passport.authenticate("jwt", { session: false });

// Routes
const loginRouter = require("./routes/login");
const dashboardRouter = require("./routes/dashboard");
const logoutRouter = require("./routes/logout");

app.use("/login", loginRouter);
app.use("/dashboard", dashboardRouter);
app.use("/logout", logoutRouter);

// Root protetta
app.get("/", requireAuth, (req, res) => {
  res.send("Benvenuto nella root protetta!");
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start
app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});