// server/index.js
require("dotenv").config(); // Make sure to load environment variables at the very top
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");

// Import routes and middleware
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const authenticate = require("./middleware/auth");
const Payment = require("./models/Payment"); // Import the Payment model

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/neonpay", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// --- Payment Routes ---

// Create a new payment
app.post("/api/payment", authenticate, async (req, res) => {
  const { name, upi, amount, originalAmount, originalCurrency } = req.body;
  const userId = req.user.id;

  try {
    const newPayment = await Payment.create({
      name,
      upi,
      amount,
      originalAmount,
      originalCurrency,
      userId,
      status: "Unpaid",
    });
    res.status(201).json({ id: newPayment._id.toString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to save payment" });
  }
});

// Get a specific payment's details (for QR page)
app.get("/api/payment/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Not found" });

    const upiURI = `upi://pay?pa=${payment.upi}&pn=${payment.name}&am=${payment.amount}&cu=INR`;
    res.json({ upiURI, status: payment.status });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

// Get all payments for the logged-in user (with search and filter)
app.get("/api/payments", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { search, status } = req.query;

  try {
    let query = { userId };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (status && (status === "Paid" || status === "Unpaid")) {
      query.status = status;
    }
    const payments = await Payment.find(query).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Confirm a payment (simulate payment)
app.post("/api/payment/:id/confirm", authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment || payment.userId !== req.user.id) {
      return res
        .status(404)
        .json({ error: "Payment not found or unauthorized" });
    }
    payment.status = "Paid";
    await payment.save();
    io.to(req.user.id).emit("paymentUpdated", payment);
    res.json({ message: "Payment confirmed", payment });
  } catch (err) {
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

// --- New Feature Routes ---

// Get dashboard statistics
app.get("/api/stats", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const totalPayments = await Payment.countDocuments({ userId });
    const paidPayments = await Payment.countDocuments({
      userId,
      status: "Paid",
    });
    const unpaidPayments = totalPayments - paidPayments;
    const result = await Payment.aggregate([
      { $match: { userId: userId, status: "Paid" } },
      {
        $group: { _id: null, totalAmount: { $sum: { $toDouble: "$amount" } } },
      },
    ]);
    const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
    res.json({ totalPayments, paidPayments, unpaidPayments, totalAmount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Export payment history
const { Parser } = require("json2csv");
const { jsPDF } = require("jspdf");
require("jspdf-autotable");

app.get("/api/payments/export", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { format } = req.query;
  try {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    if (format === "csv") {
      const fields = ["name", "upi", "amount", "status", "createdAt"];
      const parser = new Parser({ fields });
      const csv = parser.parse(payments);
      res.header("Content-Type", "text/csv");
      res.attachment("payment-history.csv");
      res.send(csv);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.text("NeonPay - Payment History", 14, 15);
      doc.autoTable({
        startY: 20,
        head: [["Name", "UPI", "Amount", "Status", "Date"]],
        body: payments.map((p) => [
          p.name,
          p.upi,
          `Rs. ${p.amount}`,
          p.status,
          new Date(p.createdAt).toLocaleDateString(),
        ]),
      });
      const pdfBuffer = doc.output("arraybuffer");
      res.header("Content-Type", "application/pdf");
      res.attachment("payment-history.pdf");
      res.send(Buffer.from(pdfBuffer));
    } else {
      res.status(400).json({ error: "Invalid format specified" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to export payments" });
  }
});

// Get real-time exchange rate
app.get("/api/exchange-rate", authenticate, async (req, res) => {
  const { from, to, amount } = req.query;
  if (!from || !to || !amount) {
    return res
      .status(400)
      .json({ error: "Missing required query parameters." });
  }
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/${from}/${to}/${amount}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Exchange rate API error:", error.message);
    res.status(500).json({ error: "Failed to fetch exchange rate." });
  }
});

// --- Socket.IO Connection ---

io.on("connection", (socket) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = require("jsonwebtoken").verify(token, "supersecret");
      socket.join(decoded.id); // User joins a room based on their ID
      console.log(
        `User ${decoded.username} connected and joined room ${decoded.id}`
      );
    } catch (err) {
      console.log("Invalid token, user not joined to a room");
    }
  }
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(5000, () =>
  console.log(
    "🚀 Server running with WebSocket support at http://localhost:5000"
  )
);
