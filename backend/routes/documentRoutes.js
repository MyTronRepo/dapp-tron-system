const express = require("express");

const router = express.Router();

const upload =
    require("../middleware/uploadMiddleware");

const {
    uploadDocument,
    getAllDocuments,
    getDocumentByPropertyId
} = require("../controllers/documentController");

router.post(
    "/upload",
    upload.single("document"),
    uploadDocument
);

router.get(
    "/",
    getAllDocuments
);

router.get(
    "/:propertyId",
    getDocumentByPropertyId
);

module.exports = router;

