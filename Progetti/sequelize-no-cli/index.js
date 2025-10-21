const express = require("express");
const db = require("./models");
require("dotenv").config();

const app = express();
app.use(express.json());

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Connection success!");
    await db.sequelize.sync();
  } catch (error) {
    console.error("Connection error:", error);
  }
})();

app.use("/products", require("./routes/product"));
app.use("/users", require("./routes/user"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server attivo su http://localhost:${PORT}`)
);
