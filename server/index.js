const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const authenticate = require("./middleware/auth");

const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const corsOptions = {
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT"],
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, {
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
    userId: String,
    status: { type: String, default: "Unpaid" },
    createdAt: { type: Date, default: Date.now },
  })
);

// ✅ UPDATED: This endpoint now returns the upiURI directly
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

    const upiURI = `upi://pay?pa=${newPayment.upi}&pn=${encodeURIComponent(
      newPayment.name
    )}&am=${newPayment.amount}&cu=INR`;

    res.status(201).json({ id: newPayment._id.toString(), upiURI });
  } catch (err) {
    res.status(500).json({ error: "Failed to save payment" });
  }
});

app.get("/api/payment/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Not found" });

    const upiURI = `upi://pay?pa=${payment.upi}&pn=${encodeURIComponent(
      payment.name
    )}&am=${payment.amount}&cu=INR`;
    res.json({ upiURI, status: payment.status });
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

    if (payment.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    payment.status = "Paid";
    await payment.save();

    io.to(req.user.id).emit("paymentUpdated", payment);

    res.json({ message: "Payment confirmed", payment });
  } catch (err) {
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

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

io.on("connection", (socket) => {
  console.log("A user connected");
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = require("jsonwebtoken").verify(token, "supersecret");
      socket.join(decoded.id);
      console.log(`User ${decoded.username} joined room ${decoded.id}`);
    } catch (err) {
      console.log("Invalid token, user not joined to a room");
    }
  }
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () =>
  console.log(
    "🚀 Server running with WebSocket support at http://localhost:5000"
  )
);
