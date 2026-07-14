const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");


// =========================
// REGISTER
// =========================

const registerUser = async (req, res) => {

    try {

        const {
            walletAddress,
            nationalIdHash,
            fullName
        } = req.body;


        const exists = await User.findOne({
            walletAddress
        });


        if (exists) {

            return errorResponse(
                res,
                "User already exists",
                400
            );

        }


        const user = await User.create({

walletAddress,

nationalIdHash,

fullName,

role:"observer"

});


        return successResponse(
            res,
            {
                id: user._id,
                walletAddress: user.walletAddress,
                role: user.role
            },
            "User registered successfully"
        );


    } catch (error) {


        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



// =========================
// LOGIN
// =========================

const loginUser = async (req, res) => {

    try {


        const {
            walletAddress
        } = req.body;



        const user = await User.findOne({
            walletAddress
        });



        if (!user) {

            return errorResponse(
                res,
                "User not found",
                404
            );

        }



        if (user.status !== "active") {


            return errorResponse(
                res,
                "User account is blocked",
                403
            );

        }



        if (!process.env.JWT_SECRET) {

            throw new Error(
                "JWT_SECRET is not configured"
            );

        }



        const token = jwt.sign(

            {

                id: user._id,

                walletAddress:
                    user.walletAddress,

                role:
                    user.role

            },

            process.env.JWT_SECRET,

            {
                expiresIn:
                    process.env.JWT_EXPIRES_IN || "7d"
            }

        );



        return successResponse(

            res,

            {

                token,

                user: {

                    walletAddress:
                        user.walletAddress,

                    role:
                        user.role,

                    status:
                        user.status

                }

            },

            "Login successful"

        );


    } catch (error) {


        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



module.exports = {

    register: registerUser,

    login: loginUser

};