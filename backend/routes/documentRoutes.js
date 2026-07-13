const express = require("express");

const router = express.Router();

const upload =
    require("../config/multer");

const validate =
    require("../middleware/validationMiddleware");


const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");


const {

    documentRegisterValidation

} = require("../../validators/documentValidator");


const {

    registerDocument,

    getDocumentsByProperty,

    getDocumentById,

    verifyDocument,

    uploadDocument

} = require("../controllers/documentController");



// REGISTER DOCUMENT
router.post(

    "/register",

    authenticate,

    authorize(
        "owner"
    ),

    documentRegisterValidation,

    validate,

    registerDocument

);



// GET DOCUMENTS

router.get(

    "/property/:propertyId",

    authenticate,

    getDocumentsByProperty

);



// GET DOCUMENT

router.get(

    "/:documentId",

    authenticate,

    getDocumentById

);



// VERIFY DOCUMENT

router.put(

    "/verify/:documentId",

    authenticate,

    authorize(
        "admin"
    ),

    verifyDocument

);



// UPLOAD DOCUMENT

router.post(

    "/upload/:documentId",

    authenticate,

    authorize(
        "owner"
    ),

    upload.single("document"),

    uploadDocument

);


module.exports = router;