const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const authenticate = require("./middleware/auth"); // ✅ IMPORT MIDDLEWARE

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

mongoose
  .connect("mongodb://localhost:27017/neonpay", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("MongoDB Error:", err));

const Payment = mongoose.model(
  "Payment",
  new mongoose.Schema({
    name: String,
    upi: String,
    amount: String,
    userId: String, // ✅ Store the user ID for filtering later
    createdAt: { type: Date, default: Date.now },
  })
);

// ✅ Create payment (PROTECTED)
app.post("/api/payment", authenticate, async (req, res) => {
  const { name, upi, amount } = req.body;
  const userId = req.user.id;

  try {
    const newPayment = await Payment.create({ name, upi, amount, userId });
    res.status(201).json({ id: newPayment._id.toString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to save payment" });
  }
});

// ✅ Get payment by ID (Unprotected - only for QR)
app.get("/api/payment/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Not found" });

    const upiURI = `upi://pay?pa=${payment.upi}&pn=${payment.name}&am=${payment.amount}&cu=INR`;
    res.json({ upiURI });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

// ✅ Get all payments (filtered by user)
app.get("/api/payments", authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

app.listen(5000, () =>
  console.log("🚀 Server running at http://localhost:5000")
);
