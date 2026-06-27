const express = require("express");

const router = express.Router();

const {

    healthCheck,

    registerProperty,

    searchProperties

} = require("../controllers/propertyController");

router.get("/health", healthCheck);

router.post(
    "/register",
    registerProperty
);

router.get(
    "/search",
    searchProperties
);

module.exports = router;