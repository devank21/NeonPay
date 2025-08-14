// client/src/pages/QRPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import axios from "axios";
import { io } from "socket.io-client";

const QRPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [upiURI, setUpiURI] = useState("");
  const [status, setStatus] = useState("Unpaid");

  const intervalRef = useRef(null);

  const fetchPayment = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/payment/${id}`);
      setUpiURI(res.data.upiURI);
      if (res.data.status !== status) {
        setStatus(res.data.status);
      }
    } catch (err) {
      console.error("Failed to fetch UPI URI:", err);
      if (err.response && err.response.status === 404) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }
  }, [id, status]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  // Effect for real-time updates via WebSocket and polling
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const socket = io("http://localhost:5000", { auth: { token } });

    socket.on("paymentUpdated", (updatedPayment) => {
      if (updatedPayment._id === id) {
        setStatus(updatedPayment.status);
      }
    });

    // Fallback polling in case WebSocket fails
    intervalRef.current = setInterval(() => {
      setStatus((currentStatus) => {
        if (currentStatus === "Unpaid") {
          fetchPayment();
        }
        return currentStatus;
      });
    }, 5000); // Check every 5 seconds

    return () => {
      socket.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id, navigate, fetchPayment]);

  // Effect to stop polling once payment is paid
  useEffect(() => {
    if (status === "Paid" && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [status]);

  return (
    <div className="p-10 text-white min-h-screen bg-gray-950 text-center flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <button
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white hover:scale-105 transition"
            onClick={() => navigate("/history")}
          >
            ← Back to History
          </button>
          <span
            className={`px-4 py-1 text-sm font-bold rounded-full transition-colors ${
              status === "Paid" ? "bg-green-500" : "bg-yellow-500 text-black"
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
          <div className="mt-8 text-gray-400">
            <p>Waiting for payment confirmation...</p>
            <p className="text-sm">(This page will update automatically)</p>
          </div>
        )}

        {status === "Paid" && (
          <div className="mt-8 text-green-400 text-xl font-bold">
            <p>✅ Payment Received!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPage;
