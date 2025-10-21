import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask
} from "../controller/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getTasks)
  .post(createTask);

router.route("/:id")
  .put(updateTask)
  .delete(deleteTask);

router.patch("/:id/move", moveTask);

export default router;