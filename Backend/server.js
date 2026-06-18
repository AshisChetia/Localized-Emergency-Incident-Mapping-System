import "dotenv/config";
import express from "express";

import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import authorityRoutes from "./src/routes/authorityRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import cors from "cors";

// Connect to TiDB
await connectDB();

const app = express();

// ── CORS FIX: Allow your separate frontend project to talk to this backend ──
app.use(cors({
    origin: "*", 
    credentials: true,
}));

app.use(express.json());

import messageRoutes from "./src/routes/messageRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/authority", authorityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send("LEIMS Backend API is live on Vercel!");
});

// ── VERCEL FIX: Export the app instead of just listening ──
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running locally on port ${PORT}`);
    });
}

export default app;
