import { Task } from "../models/Task.js";

// GET: tutti i task dell'utente
export const getTasks = async (req, res) => {
  const tasks = await Task.findAll({ where: { userId: req.user.id } });
  res.json(tasks);
};

// POST: crea un nuovo task
export const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const task = await Task.create({ title, description, status, userId: req.user.id });
  res.status(201).json(task);
};

// PUT: aggiorna un task esistente
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOne({ where: { id, userId: req.user.id } });
  if (!task) return res.status(404).json({ message: "Task non trovato" });

  await task.update(req.body);
  res.json(task);
};

// DELETE: elimina un task
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOne({ where: { id, userId: req.user.id } });
  if (!task) return res.status(404).json({ message: "Task non trovato" });

  await task.destroy();
  res.json({ message: "Task eliminato" });
};

// PATCH: sposta un task in un'altra colonna (Kanban move)
export const moveTask = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["todo", "inprogress", "done"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Status non valido" });
  }

  const task = await Task.findOne({ where: { id, userId: req.user.id } });
  if (!task) return res.status(404).json({ message: "Task non trovato" });

  await task.update({ status });
  res.json({ message: `Task spostato in ${status}`, task });
};