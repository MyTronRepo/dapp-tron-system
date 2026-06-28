const User = require("../models/User");

const Property = require("../models/Property");

const Document = require("../models/Document");

const Transfer = require("../models/Transfer");

const {

    successResponse,

    errorResponse

} = require("../utils/responseHandler");

const getDashboardStatistics = async (

    req,

    res

) => {

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

                status: "PendingBuyer"

            });

        const approvedTransfers =
            await Transfer.countDocuments({

                status: "Approved"

            });

        const verifiedDocuments =
            await Document.countDocuments({

                verified: true

            });

        const pendingDocuments =
            await Document.countDocuments({

                verified: false

            });

        return successResponse(

            res,

            {

                users,

                properties,

                documents,

                transfers,

                pendingTransfers,

                approvedTransfers,

                verifiedDocuments,

                pendingDocuments

            },

            "Dashboard statistics fetched successfully"

        );

    }

    catch (error) {

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