// pages/Account.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";

const Account = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center mb-8 p-4 bg-gradient-to-r from-pink-600 to-purple-700 rounded-lg shadow">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-100 to-pink-200">
          NeonPay Dashboard
        </h2>
        <button
          onClick={handleLogout}
          className="bg-black border border-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition"
        >
          Sign Out
        </button>
      </nav>

      {/* Welcome Message */}
      <div className="text-center mb-10">
        <h3 className="text-xl font-semibold">Welcome, {username} 👋</h3>
        <p className="text-gray-400 mt-2">What would you like to do today?</p>
      </div>

      {/* Action Cards */}
      <div className="flex justify-center gap-6 flex-wrap">
        <Link
          to="/payment"
          className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-xl text-white font-bold text-center shadow-lg hover:scale-105 transition w-64"
        >
          💸 Create a Payment
        </Link>
        <Link
          to="/history"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white font-bold text-center shadow-lg hover:scale-105 transition w-64"
        >
          📜 Payment History
        </Link>
      </div>
    </div>
  );
};

export default Account;
