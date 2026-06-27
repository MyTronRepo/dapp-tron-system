const jwt = require("jsonwebtoken");

const {
    errorResponse
} = require("../utils/responseHandler");

const authenticate = (

    req,

    res,

    next

) => {

    const authHeader =
        req.headers.authorization;

    if (

        !authHeader ||

        !authHeader.startsWith("Bearer ")

    ) {

        return errorResponse(

            res,

            "Access denied",

            401

        );

    }

    const token =
        authHeader.split(" ")[1];

    try {

        const decoded =
            jwt.verify(

                token,

                process.env.JWT_SECRET ||

                "dapptronsecret"

            );

        req.user =
            decoded;

        next();

    }

    catch (error) {

        return errorResponse(

            res,

            "Invalid token",

            401

        );

    }

};

const authorize = (

    ...roles

) => {

    return (

        req,

        res,

        next

    ) => {

        if (

            !roles.includes(

                req.user.role

            )

        ) {

            return errorResponse(

                res,

                "Permission denied",

                403

            );

        }

        next();

    };

};

module.exports = {

    authenticate,

    authorize

};