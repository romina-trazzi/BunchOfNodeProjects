import { useState } from "react";
import AuthForm from "./components/AuthForm";
import TaskBoard from "./components/TaskBoard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-blue-600 my-6">🗂️ Simple Kanban</h1>
      {token ? (
        <TaskBoard token={token} onLogout={handleLogout} />
      ) : (
        <AuthForm onLogin={handleLogin} />
      )}
    </div>
  );
}