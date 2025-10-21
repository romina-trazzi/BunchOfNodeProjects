import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { sequelize } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await sequelize.sync({ alter: true }); // crea/aggiorna le tabelle
  app.listen(PORT, () => console.log(`🚀 Server in ascolto sulla porta ${PORT}`));
})();