const express = require("express");

const router = express.Router();

const {

    getDashboardStatistics

} = require("../controllers/dashboardController");

const {

    authenticate

} = require("../middleware/authMiddleware");

router.get(

    "/",

    authenticate,

    getDashboardStatistics

);

module.exports = router;