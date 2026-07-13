const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const dotenv = require("dotenv");

const swaggerSpec = require("./config/swagger");
const connectDatabase = require("./config/database");


// =========================
// Environment Configuration
// =========================

dotenv.config();


// =========================
// Database Connection
// =========================

connectDatabase();


// =========================
// Express App
// =========================

const app = express();


// =========================
// Security Middlewares
// =========================

app.use(cors());

app.use(helmet());


// =========================
// Body Parsers
// =========================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =========================
// Rate Limiter
// =========================

const limiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100,

    message: {
        success: false,
        message: "Too many requests, please try again later"
    }

});


app.use(limiter);


// =========================
// Routes
// =========================

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const documentRoutes = require("./routes/documentRoutes");
const transferRoutes = require("./routes/transferRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const logRoutes = require("./routes/logRoutes");
const auditRoutes = require("./routes/auditRoutes");


// =========================
// Route Registration
// =========================

app.use("/api/auth", authRoutes);

app.use("/api/properties", propertyRoutes);

app.use("/api/documents", documentRoutes);

app.use("/api/transfers", transferRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/logs", logRoutes);

app.use("/api/audit", auditRoutes);


// =========================
// Swagger
// =========================

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);


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

    res.status(err.status || 500).json({

        success: false,

        message:
            err.message || "Internal Server Error"

    });

});


// =========================
// Server
// =========================

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});