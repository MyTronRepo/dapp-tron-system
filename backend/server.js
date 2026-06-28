const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDatabase = require("./config/database");

dotenv.config();

connectDatabase();

const app = express();

// =========================
// Middlewares
// =========================
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// =========================
// Routes
// =========================
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const documentRoutes = require("./routes/documentRoutes");
const transferRoutes = require("./routes/transferRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// =========================
// Route Registration
// =========================
app.use("/api/auth", authRoutes);

app.use("/api/properties", propertyRoutes);

app.use("/api/documents", documentRoutes);

app.use("/api/transfers", transferRoutes);

app.use("/api/dashboard", dashboardRoutes);

// =========================
// Root Route
// =========================
app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message: "DApp TRON Backend Running"

    });

});

// =========================
// Health Check
// =========================
app.get("/health", (req, res) => {

    res.status(200).json({

        success: true,

        message: "Server is healthy"

    });

});

// =========================
// 404 Handler
// =========================
app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Route not found"

    });

});

// =========================
// Global Error Handler
// =========================
app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(500).json({

        success: false,

        message: "Internal Server Error"

    });

});

// =========================
// Server
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});