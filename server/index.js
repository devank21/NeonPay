// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // Import http
const { Server } = require("socket.io"); // Import socket.io

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const authenticate = require("./middleware/auth");

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  // Attach socket.io to the server
  cors: {
    origin: "http://localhost:3000", // Allow client connection
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

mongoose
  .connect("mongodb://localhost:27017/neonpay", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// ✅ UPDATED: Added a 'status' field to the schema
const Payment = mongoose.model(
  "Payment",
  new mongoose.Schema({
    name: String,
    upi: String,
    amount: String,
    userId: String,
    status: { type: String, default: "Unpaid" }, // New status field
    createdAt: { type: Date, default: Date.now },
  })
);

app.post("/api/payment", authenticate, async (req, res) => {
  const { name, upi, amount } = req.body;
  const userId = req.user.id;

  try {
    const newPayment = await Payment.create({
      name,
      upi,
      amount,
      userId,
      status: "Unpaid",
    });
    res.status(201).json({ id: newPayment._id.toString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to save payment" });
  }
});

app.get("/api/payment/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Not found" });

    const upiURI = `upi://pay?pa=${payment.upi}&pn=${payment.name}&am=${payment.amount}&cu=INR`;
    res.json({ upiURI, status: payment.status }); // Also return status
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

app.get("/api/payments", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { search, status } = req.query;

  try {
    let query = { userId };

    if (search) {
      // Case-insensitive search on the 'name' field
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

app.post("/api/payment/:id/confirm", authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // Ensure the user owns this payment
    if (payment.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    payment.status = "Paid";
    await payment.save();

    // Emit a real-time event to the user
    io.to(req.user.id).emit("paymentUpdated", payment);

    res.json({ message: "Payment confirmed", payment });
  } catch (err) {
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

// ✅ NEW FEATURE: Endpoint for dashboard stats
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

    res.json({
      totalPayments,
      paidPayments,
      unpaidPayments,
      totalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = require("jsonwebtoken").verify(token, "supersecret");
      socket.join(decoded.id); // User joins a room based on their ID
      console.log(`User ${decoded.username} joined room ${decoded.id}`);
    } catch (err) {
      console.log("Invalid token, user not joined to a room");
    }
  }
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Use server.listen instead of app.listen
server.listen(5000, () =>
  console.log(
    "🚀 Server running with WebSocket support at http://localhost:5000"
  )
);
