// client/src/components/Navbar.jsx
import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-50 bg-gray-900 text-white py-4 px-8 shadow-md shadow-purple-500 flex justify-between items-center">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate(isLoggedIn ? "/account" : "/")}
      >
        NeonPay
      </h1>
      <div className="space-x-4">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/account")}
              className={`hover:underline ${
                location.pathname === "/account"
                  ? "font-semibold border-b-2 border-purple-400"
                  : ""
              }`}
            >
              Dashboard
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
              onClick={() => navigate("/profile")}
              className={`hover:underline ${
                location.pathname === "/profile"
                  ? "font-semibold border-b-2 border-purple-400"
                  : ""
              }`}
            >
              Profile
            </button>
            <button
              onClick={handleSignOut}
              className="bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-gray-800 text-white px-4 py-1 rounded-full hover:bg-gray-700"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
