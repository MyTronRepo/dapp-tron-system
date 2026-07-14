const express = require("express");

const router = express.Router();

const {

    authenticate,

    authorize

} = require("../middleware/authMiddleware");

const {

    getAuditLogs

} = require("../controllers/auditController");

router.get(

    "/",

    authenticate,

    authorize("admin"),

    getAuditLogs

);


module.exports = router;