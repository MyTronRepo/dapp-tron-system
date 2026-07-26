const User = require("../models/User");
const Property = require("../models/Property");
const Document = require("../models/Document");
const Transfer = require("../models/Transfer");
const AuditLog = require("../models/AuditLog");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");


const getDashboardStatistics = async (req, res) => {

    try {


        const users =
            await User.countDocuments();


        const properties =
            await Property.countDocuments();


        const documents =
            await Document.countDocuments();


        const transfers =
            await Transfer.countDocuments();



        const pendingTransfers =
            await Transfer.countDocuments({
                status: {
                    $in: [
                        "PendingSeller",
                        "PendingBuyer",
                        "PendingAdmin"
                    ]
                }
            });



        const completedTransfers =
            await Transfer.countDocuments({
                status: "Completed"
            });



        const verifiedDocuments =
            await Document.countDocuments({
                status: "Verified"
            });



        const pendingDocuments =
            await Document.countDocuments({
                status: "Pending"
            });



        const recentDocuments =
            await Document.find()
                .sort({
                    createdAt: -1
                })
                .limit(5);



        const recentTransfers =
            await Transfer.find()
                .sort({
                    createdAt: -1
                })
                .limit(5);



        const recentActivities =
            await AuditLog.find()
                .sort({
                    createdAt: -1
                })
                .limit(5);



        return successResponse(

            res,

            {

                stats: {

                    users,

                    properties,

                    documents,

                    transfers,

                    pendingTransfers,

                    completedTransfers,

                    verifiedDocuments,

                    pendingDocuments

                },


                recentDocuments,


                recentTransfers,


                recentActivities

            },


            "Dashboard statistics fetched successfully"

        );


    }

    catch(error){


        return errorResponse(

            res,

            error.message,

            500

        );


    }

};



module.exports = {

    getDashboardStatistics

};