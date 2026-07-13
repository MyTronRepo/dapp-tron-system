const { body } = require("express-validator");


const registerValidation = [

    body("walletAddress")
        .notEmpty()
        .withMessage("Wallet address is required")
        .isString()
        .withMessage("Wallet address must be a string"),


    body("nationalIdHash")
        .notEmpty()
        .withMessage("National ID hash is required")
        .isString()
        .withMessage("National ID hash must be a string"),


    body("fullName")
        .notEmpty()
        .withMessage("Full name is required")
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