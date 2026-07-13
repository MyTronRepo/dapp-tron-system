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

const validate =
    require("../middleware/validationMiddleware");

const {

    transferCreateValidation

} = require("../../validators/transferValidator");

router.post(

    "/create",

    authenticate,

    authorize("owner"),

    transferCreateValidation,

    validate,

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

    authorize("buyer"),

    approveTransferByBuyer

);

router.patch(

    "/admin-approve/:transferId",

    authenticate,

    authorize("admin"),

    approveTransferByAdmin

);

module.exports = router;