import { useState } from "react";

export default function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { username, email, password };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      onLogin(data.token);
    } else {
      alert(data.message || "Errore di autenticazione");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-80">
      <h2 className="text-xl font-bold mb-4 text-center">
        {isLogin ? "Login" : "Registrazione"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            className="p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          {isLogin ? "Accedi" : "Registrati"}
        </button>
      </form>

      <p className="text-sm text-center mt-3">
        {isLogin ? "Non hai un account?" : "Hai già un account?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:underline"
        >
          {isLogin ? "Registrati" : "Accedi"}
        </button>
      </p>
    </div>
  );
}
