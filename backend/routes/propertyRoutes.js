const express = require("express");

const router = express.Router();

const {
    healthCheck,
    registerProperty,
    searchProperties,
    getPropertyById,
    updatePropertyStatus
} = require("../controllers/propertyController");

const { authenticate } = require("../middleware/authMiddleware");

// HEALTH
router.get("/health", healthCheck);

// REGISTER (protected)
router.post("/register", authenticate, registerProperty);

// SEARCH (protected)
router.get("/search", authenticate, searchProperties);

// GET BY ID (protected)
router.get("/:propertyId", authenticate, getPropertyById);

// UPDATE STATUS (protected)
router.patch("/:propertyId/status", authenticate, updatePropertyStatus);

module.exports = router;