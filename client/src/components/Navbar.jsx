// components/Navbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sticky top-0 z-50 bg-gray-900 text-white py-4 px-8 shadow-md shadow-purple-500 flex justify-between items-center">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/account")}
      >
        NeonPay
      </h1>
      <div className="space-x-4">
        <button
          onClick={() => navigate("/account")}
          className={`hover:underline ${
            location.pathname === "/account"
              ? "font-semibold border-b-2 border-purple-400"
              : ""
          }`}
        >
          Account
        </button>
        <button
          onClick={() => navigate("/payment")}
          className={`hover:underline ${
            location.pathname === "/payment"
              ? "font-semibold border-b-2 border-purple-400"
              : ""
          }`}
        >
          Create
        </button>
        <button
          onClick={() => navigate("/history")}
          className={`hover:underline ${
            location.pathname === "/history"
              ? "font-semibold border-b-2 border-purple-400"
              : ""
          }`}
        >
          History
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
