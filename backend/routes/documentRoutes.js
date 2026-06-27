const express = require("express");

const router = express.Router();

const {

    registerDocument,

    getDocumentsByProperty,

    getDocumentById

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

module.exports = router;