const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const propertyRoutes = require("./routes/propertyRoutes");
const documentRoutes = require("./routes/documentRoutes");

// Route Registration
app.use("/api/properties", propertyRoutes);
app.use("/api/documents", documentRoutes);

// Root Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "DApp TRON Backend Running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});