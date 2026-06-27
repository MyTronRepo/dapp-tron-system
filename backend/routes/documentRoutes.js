const express = require("express");

const router = express.Router();

const {

    registerDocument,

    getDocumentsByProperty,

    getDocumentById,

    verifyDocument

} = require("../controllers/documentController");

router.post(
    "/register",
    registerDocument
);

router.get(
    "/property/:propertyId",
    getDocumentsByProperty
);

router.get(
    "/:documentId",
    getDocumentById
);

router.put(
    "/verify/:documentId",
    verifyDocument
);

module.exports = router;