const { body } = require("express-validator");


const propertyRegisterValidation = [

    body("province")
        .notEmpty()
        .withMessage("Province is required"),


    body("city")
        .notEmpty()
        .withMessage("City is required"),


    body("district")
        .notEmpty()
        .withMessage("District is required"),


    body("parcelNumber")
        .notEmpty()
        .withMessage("Parcel number is required"),


    body("area")
        .isNumeric()
        .withMessage("Area must be numeric"),


    body("buildYear")
        .isNumeric()
        .withMessage("Build year must be numeric"),


    body("usageType")
        .notEmpty()
        .withMessage("Usage type is required"),


    body("constructionStatus")
        .notEmpty()
        .withMessage("Construction status is required")

];


module.exports = {

    propertyRegisterValidation

};