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

    body("owners")
        .isArray({ min: 1 })
        .withMessage("Owners are required")

];

module.exports = {

    propertyRegisterValidation

};