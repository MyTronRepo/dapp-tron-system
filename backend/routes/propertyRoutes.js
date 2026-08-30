const express = require("express");

const router = express.Router();

const {
    registerProperty,
    searchProperties,
    getPropertyById,
    updateProperty,
    updatePropertyStatus
} = require("../controllers/propertyController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");


const validate =
    require("../middleware/validationMiddleware");


const {
    propertyRegisterValidation,
    propertyUpdateValidation
} = require("../../validators/propertyValidator");

router.post(
    "/register",

    authenticate,

    authorize(
        "owner"
    ),

    propertyRegisterValidation,

    validate,

    registerProperty
);


router.get(

    "/search",

    authenticate,

    searchProperties

);


router.get(

    "/:propertyId",

    authenticate,

    getPropertyById

);

router.patch(

    "/:propertyId",

    authenticate,

    authorize(
        "owner"
    ),

    propertyUpdateValidation,

    validate,

    updateProperty

);

router.patch(

    "/:propertyId/status",

    authenticate,

    authorize(
        "admin"
    ),

    updatePropertyStatus

);

router.use((req, res, next) => {
    console.log("PROPERTY ROUTER HIT:", req.method, req.originalUrl);
    next();
});

module.exports = router;