// client/src/pages/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/account");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
      <form
        onSubmit={handleSignup}
        className="bg-gray-900 p-8 rounded-lg shadow-lg space-y-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full font-semibold hover:scale-105 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
