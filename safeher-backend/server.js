import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

// Debug: Log the MONGO_URI to verify it's loaded correctly
console.log("🔍 Debug - MONGO_URI:", process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

// Simple request logger for visibility of incoming traffic
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// Mount auth routes
import authRoutes from "./src/routes/auth.js";
app.use("/auth", authRoutes);
// Support legacy prefix used by some clients
app.use("/api/auth", authRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.send("SafeHer backend is running 🚀");
});

// Health endpoint for external checks (reports DB connection state)
app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = mongoose.connection?.readyState ?? 0;
  res.json({ ok: true, db: states[state] });
});

const PORT = process.env.PORT || 5000;

// Connect MongoDB and start server only after successful connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, "0.0.0.0", () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });