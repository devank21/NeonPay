import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup"; // ✅ Make sure it's imported
import Account from "./pages/Account";
import Payment from "./pages/Payment";
import QRPage from "./pages/QRPage";
import PaymentHistory from "./pages/PaymentHistory";
import Home from "./pages/Home"; // If used later

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const status = localStorage.getItem("loggedIn") === "true";
    setIsLoggedIn(status);
  }, []);

  if (isLoggedIn === null)
    return <div className="text-white p-4">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />{" "}
        {/* ✅ Now it will render */}
        <Route
          path="/account"
          element={isLoggedIn ? <Account /> : <Navigate to="/login" />}
        />
        <Route
          path="/payment"
          element={isLoggedIn ? <Payment /> : <Navigate to="/login" />}
        />
        <Route
          path="/pay/:id"
          element={isLoggedIn ? <QRPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/history"
          element={isLoggedIn ? <PaymentHistory /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
