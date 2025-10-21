import { useState } from "react";

export default function TaskCard({ task, moveTask, updateTask, deleteTask }) {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const nextStatus = {
    todo: "inprogress",
    inprogress: "done",
    done: "todo",
  };

  const handleSave = () => {
    updateTask(task.id, { title, description });
    setEditMode(false);
  };

  return (
    <div className="border rounded p-3 mb-2 shadow-sm bg-gray-50">
      {editMode ? (
        <div className="flex flex-col gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Descrizione..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              💾 Salva
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h4 className="font-semibold">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => moveTask(task.id, nextStatus[task.status])}
              className="text-blue-500 hover:text-blue-700 text-sm"
              title="Sposta"
            >
              ⏩
            </button>
            <button
              onClick={() => setEditMode(true)}
              className="text-yellow-500 hover:text-yellow-700 text-sm"
              title="Modifica"
            >
              ✏️
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700 text-sm"
              title="Elimina"
            >
              ❌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
