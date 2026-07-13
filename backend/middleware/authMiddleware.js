const jwt = require("jsonwebtoken");

const User = require("../models/User");


// =========================
// Authenticate User
// =========================

const authenticate = async (req, res, next) => {

    try {


        const authHeader =
            req.headers.authorization;



        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "No token provided"

            });

        }



        const token =
            authHeader.split(" ")[1];



        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );



        const user =
            await User.findById(decoded.id);



        if (!user) {

            return res.status(401).json({

                success:false,

                message:
                    "User not found"

            });

        }



        if (user.status !== "active") {


            return res.status(403).json({

                success:false,

                message:
                    "User account is blocked"

            });

        }



        req.user = {

            id:user._id,

            walletAddress:
                user.walletAddress,

            role:
                user.role

        };



        next();



    } catch(error) {


        return res.status(401).json({

            success:false,

            message:
                "Invalid or expired token"

        });


    }

};




// =========================
// Authorization
// =========================

const authorize = (...roles) => {


    return (req,res,next)=>{


        if(!req.user){


            return res.status(401).json({

                success:false,

                message:
                    "Unauthorized"

            });


        }



        if(
            roles.length &&
            !roles.includes(req.user.role)
        ){


            return res.status(403).json({

                success:false,

                message:
                    "Forbidden"

            });


        }



        next();


    };


};



module.exports = {

    authenticate,

    authorize

};