// client/src/pages/QRPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import axios from "axios";
import { io } from "socket.io-client";

// ✅ Centralized API URL for easy updates
const API_URL = "https://neonpay-server.onrender.com";

const QRPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [upiURI, setUpiURI] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [isConfirming, setIsConfirming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const intervalRef = useRef(null);

  const formatTime = (ms) => {
    if (ms === null || ms < 0) return "00:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const fetchPayment = useCallback(async () => {
    try {
      // ✅ UPDATED: Using the live API URL
      const res = await axios.get(`${API_URL}/api/payment/${id}`);
      setUpiURI(res.data.upiURI);
      if (res.data.status !== status) {
        setStatus(res.data.status);
      }
      if (res.data.expiresAt && res.data.status === "Unpaid") {
        const expirationTime = new Date(res.data.expiresAt).getTime();
        const now = new Date().getTime();
        const distance = expirationTime - now;
        setTimeLeft(distance > 0 ? distance : 0);
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

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) setStatus("Expired");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // ✅ UPDATED: Using the live server URL for WebSocket
    const socket = io(API_URL, {
      auth: { token },
    });

    socket.on("paymentUpdated", (updatedPayment) => {
      if (updatedPayment._id === id) {
        setStatus(updatedPayment.status);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, navigate]);

  useEffect(() => {
    if (status === "Paid" || status === "Expired") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [status]);

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      const token = localStorage.getItem("token");
      // ✅ UPDATED: Using the live API URL
      await axios.post(
        `${API_URL}/api/payment/${id}/confirm`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus("Paid");
    } catch (err) {
      console.error("Failed to confirm payment:", err);
      alert(err.response?.data?.error || "Could not confirm payment.");
    } finally {
      setIsConfirming(false);
    }
  };

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
              status === "Paid"
                ? "bg-green-500"
                : status === "Expired"
                ? "bg-red-500"
                : "bg-yellow-500 text-black"
            }`}
          >
            Status: {status}
          </span>
        </div>

        <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
          Scan to Pay
        </h2>

        <div
          className="bg-white p-4 inline-block rounded-lg"
          style={{ height: 288, width: 288 }}
        >
          {upiURI && status === "Unpaid" ? (
            <QRCode
              value={upiURI}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-600 text-2xl font-bold">
                {status === "Expired" ? "QR Code Expired" : "Loading..."}
              </p>
            </div>
          )}
        </div>

        {status === "Unpaid" && timeLeft !== null && (
          <div className="mt-6 text-lg text-yellow-400 font-mono">
            <p>QR Code expires in: {formatTime(timeLeft)}</p>
          </div>
        )}

        {status === "Paid" && (
          <div className="mt-8 text-green-400 text-xl font-bold">
            <p>✅ Payment Received!</p>
          </div>
        )}

        {status === "Expired" && (
          <div className="mt-8 text-red-500 text-xl font-bold">
            <p>Payment request has expired.</p>
          </div>
        )}

        {status === "Unpaid" && (
          <div className="mt-8">
            <button
              onClick={handleConfirmPayment}
              disabled={isConfirming}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isConfirming ? "Confirming..." : "Simulate Payment Received"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPage;
