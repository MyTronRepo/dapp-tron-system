const express = require("express");

const router = express.Router();


const {
    authenticate
} = require("../middleware/authMiddleware");


const {

    getOwnershipByWallet,

    getOwnershipByProperty

} = require("../controllers/ownershipController");





router.get(

    "/wallet/:walletAddress",

    authenticate,

    getOwnershipByWallet

);





router.get(

    "/property/:propertyId",

    authenticate,

    getOwnershipByProperty

);




module.exports = router;