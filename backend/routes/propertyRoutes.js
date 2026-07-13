const express = require("express");

const router = express.Router();

const {

    registerProperty,

    searchProperties,

    getPropertyById,

    updatePropertyStatus

} = require("../controllers/propertyController");


const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");


const validate =
    require("../middleware/validationMiddleware");


const {
    propertyRegisterValidation
} = require("../../validators/propertyValidator");



// REGISTER PROPERTY
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



// SEARCH PROPERTY

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



// VERIFY / REJECT PROPERTY

router.patch(

    "/:propertyId/status",

    authenticate,

    authorize(
        "admin"
    ),

    updatePropertyStatus

);


module.exports = router;