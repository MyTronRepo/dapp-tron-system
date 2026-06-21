const express = require("express");

const router = express.Router();

const {
    healthCheck,
    registerProperty
} = require("../controllers/propertyController");

router.get("/health", healthCheck);

router.post(
    "/register",
    registerProperty
);

module.exports = router;