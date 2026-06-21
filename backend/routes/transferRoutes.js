const express = require("express");

const router = express.Router();

const {

    createTransferRequest,

    getAllTransfers

} = require(
    "../controllers/transferController"
);

router.post(
    "/",
    createTransferRequest
);

router.get(
    "/",
    getAllTransfers
);

module.exports = router;