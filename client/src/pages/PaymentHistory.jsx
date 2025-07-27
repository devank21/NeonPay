// client/src/pages/PaymentHistory.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const navigate = useNavigate();

  // Use useCallback to prevent re-creating the function on every render
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {
        search,
        status: status === "all" ? "" : status,
      };

      const response = await axios.get("http://localhost:5000/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const socket = io("http://localhost:5000", { auth: { token } });
    socket.on("paymentUpdated", (updatedPayment) => {
      setPayments((prev) =>
        prev.map((p) => (p._id === updatedPayment._id ? updatedPayment : p))
      );
    });
    return () => socket.disconnect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="p-10">
        <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
          Payment History
        </h2>

        {/* ✅ NEW: Filter and Search UI */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow px-4 py-2 rounded bg-gray-800 border border-gray-700"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left bg-gray-800 border border-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">UPI</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-t border-gray-600">
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">{p.upi}</td>
                    <td className="px-4 py-2">₹{p.amount}</td>
                    <td className="px-4 py-2">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          p.status === "Paid"
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-black"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => navigate(`/pay/${p._id}`)}
                        className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white hover:scale-105 transition text-sm"
                      >
                        View QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-400">
            No payment history found for the current filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
