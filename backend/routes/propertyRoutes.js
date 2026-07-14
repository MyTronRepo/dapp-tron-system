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

    "/:propertyId/status",

    authenticate,

    authorize(
        "admin"
    ),

    updatePropertyStatus

);



module.exports = router;