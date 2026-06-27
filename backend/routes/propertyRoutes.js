const express = require("express");

const router = express.Router();

const {
    healthCheck,
    registerProperty,
    searchProperties,
    getPropertyById,
    updatePropertyStatus
} = require("../controllers/propertyController");

// HEALTH
router.get("/health", healthCheck);

// REGISTER
router.post("/register", registerProperty);

// SEARCH
router.get("/search", searchProperties);

// GET BY ID
router.get("/:propertyId", getPropertyById);

// UPDATE STATUS
router.patch("/:propertyId/status", updatePropertyStatus);

module.exports = router;