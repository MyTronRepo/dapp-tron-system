const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

// REGISTER USER
const registerUser = async (req, res) => {

    try {

        const {
            walletAddress,
            nationalIdHash,
            fullName,
            role
        } = req.body;

        if (
            !walletAddress ||
            !nationalIdHash ||
            !fullName
        ) {
            return errorResponse(
                res,
                "Required fields are missing",
                400
            );
        }

        const exists = await User.findOne({ walletAddress });

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
            role: role?.toUpperCase() || "OWNER"
        });

        return successResponse(
            res,
            user,
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

// LOGIN USER
const loginUser = async (req, res) => {

    try {

        const { walletAddress } = req.body;

        if (!walletAddress) {
            return errorResponse(
                res,
                "Wallet address is required",
                400
            );
        }

        const user = await User.findOne({ walletAddress });

        if (!user) {
            return errorResponse(
                res,
                "User not found",
                404
            );
        }

        const token = jwt.sign(
            {
                id: user._id,
                walletAddress: user.walletAddress,
                role: user.role
            },
            process.env.JWT_SECRET || "dapptronsecret",
            { expiresIn: "7d" }
        );

        return successResponse(
            res,
            { token, user },
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