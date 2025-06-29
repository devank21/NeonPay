// pages/PaymentHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const filtered = response.data.filter((p) => p.userId === user?.id);
        setPayments(filtered);
      } catch (error) {
        console.error("Error fetching payment history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?.id]);

  const Navbar = () => (
    <div className="bg-gray-900 text-white py-4 px-8 shadow-md shadow-purple-500 flex justify-between items-center">
      <h1 className="text-2xl font-bold">NeonPay</h1>
      <div className="space-x-4">
        <button
          onClick={() => navigate("/account")}
          className="hover:underline"
        >
          Account
        </button>
        <button
          onClick={() => navigate("/payment")}
          className="hover:underline"
        >
          Create
        </button>
        <button
          onClick={() => navigate("/history")}
          className="hover:underline font-semibold border-b-2 border-purple-400"
        >
          History
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("user");
            navigate("/login");
          }}
          className="bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="p-10">
        <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
          Payment History
        </h2>

        <button
          className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full text-white hover:scale-105 transition"
          onClick={() => navigate("/account")}
        >
          ← Back to Home
        </button>

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
                    <td className="px-4 py-2">{p.status || "Unpaid"}</td>
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
            No payment history found.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
