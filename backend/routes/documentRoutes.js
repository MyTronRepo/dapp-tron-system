const express = require("express");

const router = express.Router();

const upload =
    require("../middleware/uploadMiddleware");

const {
    uploadDocument,
    getAllDocuments,
    getDocumentByPropertyId,
    verifyDocument,
    revokeDocument
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

router.patch(
    "/verify/:propertyId",
    verifyDocument
);

router.patch(
    "/revoke/:propertyId",
    revokeDocument
);

module.exports = router;