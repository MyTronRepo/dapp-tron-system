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
    rejectDocument,
    uploadDocument,
    replaceDocument
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


router.get(
"/",
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



// REJECT DOCUMENT
router.put(

    "/reject/:documentId",

    authenticate,

    authorize(
        "admin"
    ),

    rejectDocument

);



// UPLOAD DOCUMENT
// REPLACE DOCUMENT
router.post(
    "/replace/:documentId",
    authenticate,
    authorize(
        "admin"
    ),
    upload.single("document"),
    replaceDocument
);


module.exports = router;