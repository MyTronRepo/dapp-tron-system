const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDatabase =
    require("./config/database");

dotenv.config();

connectDatabase();

const app = express();

app.use(cors());
app.use(express.json());

// Routes

const authRoutes =
    require("./routes/authRoutes");

const propertyRoutes =
    require("./routes/propertyRoutes");

const documentRoutes =
    require("./routes/documentRoutes");

const transferRoutes =
    require("./routes/transferRoutes");

// Route Registration

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/properties",
    propertyRoutes
);

app.use(
    "/api/documents",
    documentRoutes
);

app.use(
    "/api/transfers",
    transferRoutes
);

// Root Route

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "DApp TRON Backend Running"

    });

});

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});