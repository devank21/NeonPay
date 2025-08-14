// server/models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  name: String,
  upi: String,
  amount: String, // This will now be the INR amount
  originalAmount: Number, // The amount in the original currency
  originalCurrency: String, // e.g., 'USD'
  userId: String,
  status: { type: String, default: "Unpaid" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
