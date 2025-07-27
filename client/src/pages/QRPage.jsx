// pages/QRPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import axios from "axios";

const QRPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [upiURI, setUpiURI] = useState("");
  const [status, setStatus] = useState("Unpaid");

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/payment/${id}`);
        setUpiURI(res.data.upiURI);
        setStatus(res.data.status);
      } catch (err) {
        console.error("Failed to fetch UPI URI:", err);
        alert("Failed to load QR. Try again.");
      }
    };

    fetchPayment();
  }, [id]);

  // ✅ NEW: Function to simulate payment confirmation
  const handleConfirmPayment = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/payment/${id}/confirm`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus("Paid"); // Immediately update status on success
    } catch (err) {
      console.error("Failed to confirm payment:", err);
      alert("Could not confirm payment.");
    }
  };

  return (
    <div className="p-10 text-white min-h-screen bg-gray-950 text-center">
      <div className="flex justify-between items-center mb-6">
        <button
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white hover:scale-105 transition"
          onClick={() => navigate("/history")}
        >
          ← Back to History
        </button>
        <span
          className={`px-4 py-1 text-sm font-bold rounded-full ${
            status === "Paid" ? "bg-green-500" : "bg-yellow-500"
          }`}
        >
          Status: {status}
        </span>
      </div>

      <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
        Scan to Pay
      </h2>

      {upiURI ? (
        <div className="bg-white p-4 inline-block rounded-lg">
          <QRCode value={upiURI} className="mx-auto" />
        </div>
      ) : (
        <p className="text-gray-400">Loading QR...</p>
      )}

      {status === "Unpaid" && (
        <button
          onClick={handleConfirmPayment}
          className="mt-8 px-6 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition"
        >
          Simulate Payment Received
        </button>
      )}
    </div>
  );
};

export default QRPage;
