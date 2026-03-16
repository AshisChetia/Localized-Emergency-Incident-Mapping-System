import express from "express";
import dotenv from "dotenv";

dotenv.config()

import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import authorityRoutes from "./src/routes/authorityRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

connectDB();

const app = express();

app.use(express.json())

const PORT = 3000;


app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/authority", authorityRoutes);
app.use("/api/admin",     adminRoutes);

app.get('/', (req, res) => {
    res.send("Hello world!")
})

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`)
})