// client/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(res.data.username);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/user/profile",
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      localStorage.setItem("username", res.data.user.username); // Update username in storage
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    } catch (error) {
      setMessage("Failed to update profile.");
      setTimeout(() => setMessage(""), 3000);
      console.error("Update failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="container mx-auto p-10 max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
          Your Profile
        </h2>
        <form
          onSubmit={handleUpdateProfile}
          className="bg-gray-900 p-8 rounded-lg shadow-lg space-y-4"
        >
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-400"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full font-semibold hover:scale-105 transition"
          >
            Update Profile
          </button>
          {message && (
            <p className="text-center text-green-400 mt-4">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
