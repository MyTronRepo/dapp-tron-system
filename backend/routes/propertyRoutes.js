const express = require("express");

const router = express.Router();

const {

    healthCheck,

    registerProperty,

    searchProperties,

    getPropertyById,

    updatePropertyStatus

} = require("../controllers/propertyController");

const {

    authenticate

} = require("../middleware/authMiddleware");

const validate =
    require("../middleware/validationMiddleware");

const {

    propertyRegisterValidation

} = require("../validators/propertyValidator");

// HEALTH
router.get(
    "/health",
    healthCheck
);

// REGISTER
router.post(

    "/register",

    authenticate,

    propertyRegisterValidation,

    validate,

    registerProperty

);

// SEARCH
router.get(

    "/search",

    authenticate,

    searchProperties

);

// GET PROPERTY
router.get(

    "/:propertyId",

    authenticate,

    getPropertyById

);

// UPDATE STATUS
router.patch(

    "/:propertyId/status",

    authenticate,

    updatePropertyStatus

);

module.exports = router;