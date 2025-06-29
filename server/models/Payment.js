// server/models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  name: String,
  upi: String,
  amount: String,
  link: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
