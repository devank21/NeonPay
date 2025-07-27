// client/src/pages/Account.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const Account = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = {
    labels: ["Paid", "Unpaid"],
    datasets: [
      {
        label: "# of Payments",
        data: [stats?.paidPayments || 0, stats?.unpaidPayments || 0],
        backgroundColor: ["#10B981", "#F59E0B"],
        borderColor: ["#059669", "#D97706"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="p-6 md:p-10">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-bold">Welcome, {username} 👋</h3>
          <p className="text-gray-400 mt-2">
            Here's a summary of your account.
          </p>
        </div>

        {loading ? (
          <p className="text-center">Loading stats...</p>
        ) : (
          stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-gray-900 p-6 rounded-xl border border-purple-800">
                <h4 className="text-gray-400 text-sm">Total Revenue</h4>
                <p className="text-3xl font-bold text-green-400">
                  ₹{stats.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-900 p-6 rounded-xl border border-purple-800">
                <h4 className="text-gray-400 text-sm">Total Payments</h4>
                <p className="text-3xl font-bold">{stats.totalPayments}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-xl border border-purple-800">
                <h4 className="text-gray-400 text-sm">Payments Paid</h4>
                <p className="text-3xl font-bold">{stats.paidPayments}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-xl border border-purple-800">
                <h4 className="text-gray-400 text-sm">Payments Unpaid</h4>
                <p className="text-3xl font-bold">{stats.unpaidPayments}</p>
              </div>
            </div>
          )
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-gray-900 p-6 rounded-xl border border-purple-800 h-full flex flex-col justify-center items-center">
            <h3 className="text-xl font-semibold mb-4">
              Payment Status Overview
            </h3>
            <div style={{ maxWidth: "300px", margin: "auto" }}>
              <Doughnut data={chartData} />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <Link
              to="/payment"
              className="bg-gradient-to-r from-purple-600 to-pink-500 p-8 rounded-xl text-white font-bold text-center shadow-lg hover:scale-105 transition text-2xl"
            >
              💸 Create a New Payment
            </Link>
            <Link
              to="/history"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-xl text-white font-bold text-center shadow-lg hover:scale-105 transition text-2xl"
            >
              📜 View Payment History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
