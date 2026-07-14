const express = require("express");

const router = express.Router();

const User = require("../models/User");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");


// GET ALL USERS (ADMIN ONLY)

router.get(
    "/",
    authenticate,
    authorize("admin"),
    async (req, res) => {

        try {

            const users = await User.find();

            res.status(200).json({

                success: true,

                data: users

            });


        } catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }

    }
);


module.exports = router;