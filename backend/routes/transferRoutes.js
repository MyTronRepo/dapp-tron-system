const express = require("express");

const router = express.Router();

const {

    createTransferRequest,

    getAllTransfers,

    approveTransferByBuyer,

    approveTransferByAdmin,

    getTransferHistory

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

router.get(
    "/history",
    getTransferHistory
);

router.patch(
    "/buyer-approve/:transferId",
    approveTransferByBuyer
);

router.patch(
    "/admin-approve/:transferId",
    approveTransferByAdmin
);

module.exports = router;