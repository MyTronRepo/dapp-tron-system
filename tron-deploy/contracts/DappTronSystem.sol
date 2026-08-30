// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract DappTronSystem {
    enum PropertyStatus {
        Pending,
        Verified,
        Rejected,
        Suspended
    }

    enum DocumentStatus {
        Pending,
        Valid,
        Revoked
    }

    enum TransferStatus {
        PendingBuyer,
        PendingAdmin,
        Approved,
        Rejected,
        Expired
    }

    struct Property {
        string propertyId;
        string province;
        string city;
        string district;
        string parcelNumber;
        uint256 area;
        uint16 buildYear;
        string usageType;
        string constructionStatus;
        int256 latitude;
        int256 longitude;
        PropertyStatus status;
        bool exists;
    }

    struct Ownership {
        address walletAddress;
        bytes32 nationalIdHash;
        uint8 share;
    }

    struct Document {
        string propertyId;
        bytes32 documentHash;
        string documentURI;
        uint256 issueDate;
        DocumentStatus status;
    }

    struct TransferRequest {
        uint256 transferId;
        string propertyId;
        address seller;
        address buyer;
        uint8 transferredShare;
        bool buyerApproved;
        bool adminApproved;
        uint256 timestamp;
        uint256 expireAt;
        TransferStatus status;
    }

    struct TransferHistory {
        uint256 transferId;
        string propertyId;
        address seller;
        address buyer;
        uint8 transferredShare;
        uint256 timestamp;
    }

    address public admin;

    uint256 public propertyCounter;

    uint256 public transferCounter;

    mapping(string => Property) private properties;

    mapping(string => string) private propertyByParcelNumber;

    mapping(string => Ownership[]) private propertyOwners;

    mapping(string => Document[]) private propertyDocuments;

    mapping(uint256 => TransferRequest) private transferRequests;

    mapping(string => TransferHistory[]) private transferHistories;

    string[] private propertyIds;

    event PropertyRegistered(string propertyId);

    event PropertyUpdated(string propertyId);

    event PropertyVerified(string propertyId);

    event PropertyRejected(string propertyId);

    event DocumentRegistered(string propertyId, bytes32 documentHash);

    event DocumentRevoked(string propertyId, bytes32 documentHash);

    event TransferRequested(uint256 transferId);

    event TransferApproved(uint256 transferId);

    event TransferRejected(uint256 transferId);

    event TransferExpired(uint256 transferId);

    event TransferCompleted(
        uint256 transferId,
        string propertyId,
        address seller,
        address buyer,
        uint8 transferredShare
    );

    event AdminChanged(address oldAdmin, address newAdmin);

    event OwnerAdded(string propertyId, address walletAddress, uint8 share);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    struct PropertyInput {
        string propertyId;
        string province;
        string city;
        string district;
        string parcelNumber;
        uint256 area;
        uint16 buildYear;
        string usageType;
        string constructionStatus;
        int256 latitude;
        int256 longitude;
    }

    // =========================================================
    // PROPERTY MANAGEMENT
    // =========================================================

    function registerProperty(
        string calldata propertyId,
        string calldata province,
        string calldata city,
        string calldata district,
        string calldata parcelNumber,
        uint256 area,
        uint16 buildYear,
        string calldata usageType,
        string calldata constructionStatus,
        int256 latitude,
        int256 longitude
    ) external {
        require(bytes(propertyId).length > 0, "Property ID is required");

        require(bytes(parcelNumber).length > 0, "Parcel number is required");

        require(!properties[propertyId].exists, "Property already exists");

        require(
            bytes(propertyByParcelNumber[parcelNumber]).length == 0,
            "Parcel number already exists"
        );

        require(area > 0, "Area must be greater than zero");

        properties[propertyId] = Property({
            propertyId: propertyId,
            province: province,
            city: city,
            district: district,
            parcelNumber: parcelNumber,
            area: area,
            buildYear: buildYear,
            usageType: usageType,
            constructionStatus: constructionStatus,
            latitude: latitude,
            longitude: longitude,
            status: PropertyStatus.Pending,
            exists: true
        });

        propertyByParcelNumber[parcelNumber] = propertyId;

        propertyIds.push(propertyId);

        propertyCounter++;

        emit PropertyRegistered(propertyId);
    }

    function updateProperty(PropertyInput calldata input) external {
        require(properties[input.propertyId].exists, "Property not found");

        require(
            bytes(input.parcelNumber).length > 0,
            "Parcel number is required"
        );

        require(input.area > 0, "Area must be greater than zero");

        Property storage p = properties[input.propertyId];

        // اگر شماره پلاک تغییر کرده باشد
        if (
            keccak256(bytes(p.parcelNumber)) !=
            keccak256(bytes(input.parcelNumber))
        ) {
            require(
                bytes(propertyByParcelNumber[input.parcelNumber]).length == 0,
                "Parcel number already exists"
            );

            delete propertyByParcelNumber[p.parcelNumber];

            propertyByParcelNumber[input.parcelNumber] = input.propertyId;
        }

        p.province = input.province;

        p.city = input.city;

        p.district = input.district;

        p.parcelNumber = input.parcelNumber;

        p.area = input.area;

        p.buildYear = input.buildYear;

        p.usageType = input.usageType;

        p.constructionStatus = input.constructionStatus;

        p.latitude = input.latitude;

        p.longitude = input.longitude;

        emit PropertyUpdated(input.propertyId);
    }

    function getProperty(
        string calldata propertyId
    )
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            uint16,
            string memory,
            string memory,
            int256,
            int256,
            PropertyStatus,
            bool
        )
    {
        require(properties[propertyId].exists, "Property not found");

        Property storage p = properties[propertyId];

        return (
            p.propertyId,
            p.province,
            p.city,
            p.district,
            p.parcelNumber,
            p.area,
            p.buildYear,
            p.usageType,
            p.constructionStatus,
            p.latitude,
            p.longitude,
            p.status,
            p.exists
        );
    }

    function getOwners(
        string calldata propertyId
    ) external view returns (Ownership[] memory) {
        require(properties[propertyId].exists, "Property not found");

        return propertyOwners[propertyId];
    }

    function getPropertyIdByParcel(
        string calldata parcelNumber
    ) external view returns (string memory) {
        require(
            bytes(propertyByParcelNumber[parcelNumber]).length > 0,
            "Property not found"
        );

        return propertyByParcelNumber[parcelNumber];
    }

    function getPropertyIds() external view returns (string[] memory) {
        return propertyIds;
    }

    // =========================================================
    // DOCUMENT MANAGEMENT
    // =========================================================

    function registerDocument(
        string calldata propertyId,
        bytes32 documentHash,
        string calldata documentURI
    ) external onlyAdmin {
        require(properties[propertyId].exists, "Property not found");

        require(documentHash != bytes32(0), "Invalid hash");

        propertyDocuments[propertyId].push(
            Document({
                propertyId: propertyId,
                documentHash: documentHash,
                documentURI: documentURI,
                issueDate: block.timestamp,
                status: DocumentStatus.Valid
            })
        );

        emit DocumentRegistered(propertyId, documentHash);
    }

    function getDocuments(
        string calldata propertyId
    ) external view returns (Document[] memory) {
        require(properties[propertyId].exists, "Property not found");

        return propertyDocuments[propertyId];
    }

    function revokeDocument(
        string calldata propertyId,
        uint256 index
    ) external onlyAdmin {
        require(
            index < propertyDocuments[propertyId].length,
            "Document not found"
        );

        propertyDocuments[propertyId][index].status = DocumentStatus.Revoked;

        emit DocumentRevoked(
            propertyId,
            propertyDocuments[propertyId][index].documentHash
        );
    }

    // =========================================================
    // TRANSFER MANAGEMENT
    // =========================================================

    function createTransferRequest(
        string calldata propertyId,
        address buyer,
        uint8 transferredShare
    ) external {
        require(properties[propertyId].exists, "Property not found");

        require(buyer != address(0), "Invalid buyer");

        require(buyer != msg.sender, "Buyer cannot be seller");

        require(transferredShare > 0, "Invalid share");

        uint256 sellerIndex = type(uint256).max;

        for (uint256 i = 0; i < propertyOwners[propertyId].length; i++) {
            if (propertyOwners[propertyId][i].walletAddress == msg.sender) {
                sellerIndex = i;
                break;
            }
        }

        require(sellerIndex != type(uint256).max, "Seller is not owner");

        require(
            propertyOwners[propertyId][sellerIndex].share >= transferredShare,
            "Insufficient ownership share"
        );

        transferCounter++;

        uint256 expireAt = block.timestamp + 1 days;

        transferRequests[transferCounter] = TransferRequest({
            transferId: transferCounter,
            propertyId: propertyId,
            seller: msg.sender,
            buyer: buyer,
            transferredShare: transferredShare,
            buyerApproved: false,
            adminApproved: false,
            timestamp: block.timestamp,
            expireAt: expireAt,
            status: TransferStatus.PendingBuyer
        });

        emit TransferRequested(transferCounter);
    }

    function getTransferRequest(
        uint256 transferId
    ) external view returns (TransferRequest memory) {
        require(
            transferId > 0 && transferId <= transferCounter,
            "Transfer not found"
        );

        return transferRequests[transferId];
    }

    function approveTransferByBuyer(uint256 transferId) external {
        TransferRequest storage request = transferRequests[transferId];

        require(request.transferId != 0, "Transfer not found");

        require(
            request.status == TransferStatus.PendingBuyer,
            "Invalid transfer status"
        );

        require(msg.sender == request.buyer, "Only buyer can approve");

        require(block.timestamp <= request.expireAt, "Transfer expired");

        request.buyerApproved = true;

        request.status = TransferStatus.PendingAdmin;
    }

    function approveTransferByAdmin(uint256 transferId) external onlyAdmin {
        TransferRequest storage request = transferRequests[transferId];

        require(request.transferId != 0, "Transfer not found");

        require(
            request.status == TransferStatus.PendingAdmin,
            "Invalid transfer status"
        );

        require(block.timestamp <= request.expireAt, "Transfer expired");

        request.adminApproved = true;

        _completeTransfer(transferId);
    }

    function rejectTransfer(uint256 transferId) external {
        TransferRequest storage request = transferRequests[transferId];

        require(request.transferId != 0, "Transfer not found");

        require(
            request.status == TransferStatus.PendingBuyer ||
                request.status == TransferStatus.PendingAdmin,
            "Cannot reject transfer"
        );

        require(
            msg.sender == request.buyer || msg.sender == admin,
            "Not authorized"
        );

        request.status = TransferStatus.Rejected;

        emit TransferRejected(transferId);
    }

    function expireTransfer(uint256 transferId) external {
        TransferRequest storage request = transferRequests[transferId];

        require(request.transferId != 0, "Transfer not found");

        require(
            request.status == TransferStatus.PendingBuyer ||
                request.status == TransferStatus.PendingAdmin,
            "Cannot expire transfer"
        );

        require(block.timestamp > request.expireAt, "Transfer not expired");

        request.status = TransferStatus.Expired;

        emit TransferExpired(transferId);
    }

    // =========================================================
    // COMPLETE TRANSFER
    // =========================================================

    function _completeTransfer(uint256 transferId) internal {
        TransferRequest storage request = transferRequests[transferId];

        require(
            request.buyerApproved && request.adminApproved,
            "Approvals incomplete"
        );

        /*
         * IMPORTANT FIX:
         *
         * request.propertyId is a string storage reference.
         * We copy it into memory before using it in contexts
         * that require a memory/calldata-compatible string.
         */
        string memory propertyId = request.propertyId;

        address seller = request.seller;

        address buyer = request.buyer;

        uint8 transferredShare = request.transferredShare;

        uint256 requestTransferId = request.transferId;

        uint256 sellerIndex = type(uint256).max;

        uint256 buyerIndex = type(uint256).max;

        for (uint256 i = 0; i < propertyOwners[propertyId].length; i++) {
            if (propertyOwners[propertyId][i].walletAddress == seller) {
                sellerIndex = i;
            }

            if (propertyOwners[propertyId][i].walletAddress == buyer) {
                buyerIndex = i;
            }
        }

        require(sellerIndex != type(uint256).max, "Seller is not owner");

        require(
            propertyOwners[propertyId][sellerIndex].share >= transferredShare,
            "Insufficient seller share"
        );

        propertyOwners[propertyId][sellerIndex].share -= transferredShare;

        if (buyerIndex != type(uint256).max) {
            require(
                propertyOwners[propertyId][buyerIndex].share +
                    transferredShare <=
                    100,
                "Buyer share exceeds 100"
            );

            propertyOwners[propertyId][buyerIndex].share += transferredShare;
        } else {
            propertyOwners[propertyId].push(
                Ownership({
                    walletAddress: buyer,
                    nationalIdHash: bytes32(0),
                    share: transferredShare
                })
            );
        }

        request.status = TransferStatus.Approved;

        transferHistories[propertyId].push(
            TransferHistory({
                transferId: requestTransferId,
                propertyId: propertyId,
                seller: seller,
                buyer: buyer,
                transferredShare: transferredShare,
                timestamp: block.timestamp
            })
        );

        emit TransferApproved(transferId);

        emit TransferCompleted(
            transferId,
            propertyId,
            seller,
            buyer,
            transferredShare
        );
    }

    function getTransferHistory(
        string calldata propertyId
    ) external view returns (TransferHistory[] memory) {
        require(properties[propertyId].exists, "Property not found");

        return transferHistories[propertyId];
    }

    // =========================================================
    // ADMIN
    // =========================================================

    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");

        address oldAdmin = admin;

        admin = newAdmin;

        emit AdminChanged(oldAdmin, newAdmin);
    }

    function getAdmin() external view returns (address) {
        return admin;
    }
}
