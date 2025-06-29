// pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FaMobileAlt,
  FaLink,
  FaShieldAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaAd,
} from "react-icons/fa";

const features = [
  {
    icon: <FaMobileAlt size={28} />,
    title: "Instant QR Payments",
    desc: "Collect payments and receive instant alerts.",
  },
  {
    icon: <FaLink size={28} />,
    title: "Smart Pay Links",
    desc: "Send dynamic payment links in seconds.",
  },
  {
    icon: <FaChartLine size={28} />,
    title: "Merchant Boost Loans",
    desc: "Apply for business loans effortlessly.",
  },
  {
    icon: <FaAd size={28} />,
    title: "NeonPay Ads",
    desc: "Promote your business directly inside the app.",
  },
  {
    icon: <FaMoneyBillWave size={28} />,
    title: "Partner Rewards",
    desc: "Earn commissions by referring merchants.",
  },
  {
    icon: <FaShieldAlt size={28} />,
    title: "Fraud Shield",
    desc: "Advanced AI-powered fraud monitoring.",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />
      <div className="text-center py-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-4">
          Welcome to NeonPay
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Smarter. Faster. Safer Payments.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 md:px-16">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-gray-900 hover:shadow-2xl hover:-translate-y-1 transition duration-300 rounded-xl p-6 border border-purple-800"
            >
              <div className="text-purple-400 mb-3">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/payment")}
          className="mt-10 bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3 rounded-full text-white text-lg font-semibold hover:scale-105 transition"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;
