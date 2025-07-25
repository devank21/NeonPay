import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // <-- Added Link

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn");
    if (isLoggedIn === "true") {
      navigate("/account");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", JSON.stringify({ username }));
      navigate("/account");
    } else {
      setError("Invalid credentials. Use admin/admin.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-950 p-10 rounded-2xl shadow-2xl w-full max-w-sm text-white">
        <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
          NeonPay Login
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-2 rounded-full hover:scale-105 transition"
          >
            Login
          </button>
        </form>

        {/* ✅ Signup link */}
        <p className="mt-4 text-center text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
