const { body } = require("express-validator");

const documentRegisterValidation = [

    body("propertyId")
        .notEmpty()
        .withMessage("Property ID is required"),

    body("documentName")
        .notEmpty()
        .withMessage("Document name is required"),

    body("documentType")
        .notEmpty()
        .withMessage("Document type is required"),

    body("uploadedBy")
        .notEmpty()
        .withMessage("Uploader is required")

];

module.exports = {

    documentRegisterValidation

};