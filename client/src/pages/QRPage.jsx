// pages/QRPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import axios from "axios";

const QRPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [upiURI, setUpiURI] = useState("");

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/payment/${id}`);
        setUpiURI(res.data.upiURI);
      } catch (err) {
        console.error("Failed to fetch UPI URI:", err);
        alert("Failed to load QR. Try again.");
      }
    };

    fetchPayment();
  }, [id]);

  return (
    <div className="p-10 text-white min-h-screen bg-gray-950 text-center">
      <button
        className="mb-6 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white hover:scale-105 transition"
        onClick={() => navigate("/payment")}
      >
        ← Back
      </button>
      <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
        Scan to Pay
      </h2>
      {upiURI ? (
        <QRCode value={upiURI} className="mx-auto" />
      ) : (
        <p className="text-gray-400">Loading QR...</p>
      )}
    </div>
  );
};

export default QRPage;
