const express = require("express");

const router = express.Router();

const {

    createTransferRequest,

    getAllTransfers,

    getTransferHistory,

    approveTransferByBuyer,

    approveTransferByAdmin

} = require("../controllers/transferController");

const {

    authenticate,

    authorize

} = require("../middleware/authMiddleware");

router.post(

    "/create",

    authenticate,

    authorize(

        "Owner"

    ),

    createTransferRequest

);

router.get(

    "/",

    authenticate,

    getAllTransfers

);

router.get(

    "/history",

    authenticate,

    getTransferHistory

);

router.patch(

    "/buyer-approve/:transferId",

    authenticate,

    authorize(

        "Buyer"

    ),

    approveTransferByBuyer

);

router.patch(

    "/admin-approve/:transferId",

    authenticate,

    authorize(

        "Admin"

    ),

    approveTransferByAdmin

);

module.exports = router;