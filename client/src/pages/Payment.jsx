// client/src/pages/Payment.jsx
import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const Payment = () => {
  const [name, setName] = useState("");
  const [upi, setUpi] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState(""); // ✅ NEW: State for the payment note
  const [showQR, setShowQR] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [upiURI, setUpiURI] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn) navigate("/login");
  }, [navigate]);

  // ✅ NEW: Handler for the note input with character limit
  const handleNoteChange = (e) => {
    if (e.target.value.length <= 18) {
      setNote(e.target.value);
    }
  };

  const createPayment = async () => {
    if (name && upi && amount) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You are not logged in. Redirecting to login page.");
          navigate("/login");
          return null;
        }

        const res = await axios.post(
          "https://neonpay-server.onrender.com/api/payment",
          { name, upi, amount, note }, // ✅ Send the note to the server
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { id, upiURI } = res.data;
        const link = `${window.location.origin}/pay/${id}`;

        setShareLink(link);
        setUpiURI(upiURI);

        return { link, upiURI };
      } catch (error) {
        console.error(
          "Payment creation failed:",
          error.response?.data || error.message
        );
        alert(
          `❌ Failed to create payment: ${
            error.response?.data?.error || "Check server connection"
          }`
        );
        return null;
      }
    } else {
      alert("Please fill in all fields");
      return null;
    }
  };

  const generateQR = async () => {
    const paymentData = await createPayment();
    if (paymentData) {
      setShowQR(true);
      setShowLink(false);
    }
  };

  const generateLink = async () => {
    const paymentData = await createPayment();
    if (paymentData) {
      setShowLink(true);
      setShowQR(false);
    }
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <Navbar />
      <div className="flex justify-center items-center p-4">
        <div className="bg-gray-950 p-8 rounded-2xl shadow-2xl w-full max-w-lg mt-10">
          <button
            className="mb-6 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white hover:scale-105 transition"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            Create Payment
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="UPI ID"
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {/* ✅ NEW: Input field for the payment note */}
            <div>
              <input
                type="text"
                placeholder="Note (Optional, max 18 chars)"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                value={note}
                onChange={handleNoteChange}
                maxLength="18"
              />
              <p className="text-right text-xs text-gray-400 mt-1">
                {note.length}/18
              </p>
            </div>
            <div className="flex justify-between">
              <button
                onClick={generateQR}
                className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2 rounded-full text-white font-bold hover:scale-105 transition"
              >
                Generate QR
              </button>
              <button
                onClick={generateLink}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 rounded-full text-white font-bold hover:scale-105 transition"
              >
                Generate Link
              </button>
            </div>
          </div>
          <div className="mt-8 bg-white p-6 rounded-lg text-center">
            {showQR && upiURI && (
              <>
                <QRCode value={upiURI} className="mx-auto" />
                <p className="text-black mt-2 font-semibold">Scan to Pay</p>
              </>
            )}
            {showLink && shareLink && (
              <div className="mt-4">
                <p className="text-black break-words font-medium">
                  {shareLink}
                </p>
                <button
                  onClick={copyLink}
                  className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white px-4 py-1 rounded-full hover:scale-105 transition"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
