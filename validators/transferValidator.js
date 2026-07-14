const { body } = require("express-validator");

const transferCreateValidation = [

    body("propertyId")
        .notEmpty()
        .withMessage("Property ID is required"),

    body("buyer")
        .notEmpty()
        .withMessage("Buyer wallet is required"),

    body("transferredShare")
        .isNumeric()
        .withMessage("Transferred share must be numeric")
        .isFloat({ min: 1, max: 100 })
        .withMessage("Transferred share must be between 1 and 100")

];

module.exports = {
    transferCreateValidation
};