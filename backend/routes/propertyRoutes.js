const express = require("express");

const router = express.Router();

const {

    healthCheck,
    registerProperty,
    searchProperties,
    getPropertyById,
    updatePropertyStatus

} = require("../controllers/propertyController");

// Health
router.get("/health", healthCheck);

// Create Property
router.post("/register", registerProperty);

// Get All
router.get("/search", searchProperties);

// Get By ID
router.get("/:propertyId", getPropertyById);

// Update Status
router.patch("/:propertyId/status", updatePropertyStatus);

module.exports = router;