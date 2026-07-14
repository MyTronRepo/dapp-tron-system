const { body } = require("express-validator");


const registerValidation = [

    body("walletAddress")
        .notEmpty()
        .withMessage("Wallet address is required")
        .isString()
        .withMessage("Wallet address must be a string"),


    body("nationalIdHash")
        .optional()
        .isString()
        .withMessage("National ID hash must be a string"),


    body("fullName")
        .optional()
        .isString()
        .withMessage("Full name must be a string")

];


const loginValidation = [

    body("walletAddress")
        .notEmpty()
        .withMessage("Wallet address is required")
        .isString()
        .withMessage("Wallet address must be a string")

];


module.exports = {

    registerValidation,

    loginValidation

};