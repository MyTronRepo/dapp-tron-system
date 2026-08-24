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

    function registerProperty(PropertyInput calldata input) external {
        require(bytes(input.propertyId).length > 0, "Property ID is required");

        require(
            bytes(input.parcelNumber).length > 0,
            "Parcel number is required"
        );

        require(
            !properties[input.propertyId].exists,
            "Property already exists"
        );

        require(
            bytes(propertyByParcelNumber[input.parcelNumber]).length == 0,
            "Parcel number already exists"
        );

        require(input.area > 0, "Area must be greater than zero");

        properties[input.propertyId] = Property({
            propertyId: input.propertyId,
            province: input.province,
            city: input.city,
            district: input.district,
            parcelNumber: input.parcelNumber,
            area: input.area,
            buildYear: input.buildYear,
            usageType: input.usageType,
            constructionStatus: input.constructionStatus,
            latitude: input.latitude,
            longitude: input.longitude,
            status: PropertyStatus.Pending,
            exists: true
        });

        propertyByParcelNumber[input.parcelNumber] = input.propertyId;

        propertyIds.push(input.propertyId);

        propertyCounter++;

        emit PropertyRegistered(input.propertyId);
    }

    function verifyProperty(string calldata propertyId) external onlyAdmin {
        require(properties[propertyId].exists, "Property not found");

        properties[propertyId].status = PropertyStatus.Verified;

        emit PropertyVerified(propertyId);
    }

    function rejectProperty(string calldata propertyId) external onlyAdmin {
        require(properties[propertyId].exists, "Property not found");

        properties[propertyId].status = PropertyStatus.Rejected;

        emit PropertyRejected(propertyId);
    }

    function suspendProperty(string calldata propertyId) external onlyAdmin {
        require(properties[propertyId].exists, "Property not found");

        properties[propertyId].status = PropertyStatus.Suspended;
    }

    function getProperty(
        string calldata propertyId
    ) external view returns (Property memory) {
        require(properties[propertyId].exists, "Property not found");

        return properties[propertyId];
    }

    function getPropertyData(
        string calldata propertyId
    ) external view returns (Property memory) {
        require(properties[propertyId].exists, "Property not found");

        return properties[propertyId];
    }

    // ==========================================
    // Ownership Management
    // ==========================================

    function addOwner(
        string calldata propertyId,
        address walletAddress,
        bytes32 nationalIdHash,
        uint8 share
    ) external onlyAdmin {
        require(properties[propertyId].exists, "Property not found");

        require(walletAddress != address(0), "Invalid wallet address");

        require(share > 0 && share <= 100, "Invalid share");

        uint256 totalShare;

        for (uint256 i = 0; i < propertyOwners[propertyId].length; i++) {
            totalShare += propertyOwners[propertyId][i].share;
        }

        require(totalShare + share <= 100, "Share exceeds ownership");

        propertyOwners[propertyId].push(
            Ownership({
                walletAddress: walletAddress,
                nationalIdHash: nationalIdHash,
                share: share
            })
        );

        emit OwnerAdded(propertyId, walletAddress, share);
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

    // ================= DOCUMENT MANAGEMENT =================

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

    // ================= TRANSFER MANAGEMENT =================

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

    function _completeTransfer(uint256 transferId) internal {
        TransferRequest storage request = transferRequests[transferId];

        require(
            request.buyerApproved && request.adminApproved,
            "Approvals incomplete"
        );

        uint256 sellerIndex = type(uint256).max;
        uint256 buyerIndex = type(uint256).max;

        for (
            uint256 i = 0;
            i < propertyOwners[request.propertyId].length;
            i++
        ) {
            if (
                propertyOwners[request.propertyId][i].walletAddress ==
                request.seller
            ) {
                sellerIndex = i;
            }

            if (
                propertyOwners[request.propertyId][i].walletAddress ==
                request.buyer
            ) {
                buyerIndex = i;
            }
        }

        require(sellerIndex != type(uint256).max, "Seller is not owner");

        require(
            propertyOwners[request.propertyId][sellerIndex].share >=
                request.transferredShare,
            "Insufficient seller share"
        );

        propertyOwners[request.propertyId][sellerIndex].share -= request
            .transferredShare;

        if (buyerIndex != type(uint256).max) {
            require(
                propertyOwners[request.propertyId][buyerIndex].share +
                    request.transferredShare <=
                    100,
                "Buyer share exceeds 100"
            );

            propertyOwners[request.propertyId][buyerIndex].share += request
                .transferredShare;
        } else {
            propertyOwners[request.propertyId].push(
                Ownership({
                    walletAddress: request.buyer,
                    nationalIdHash: bytes32(0),
                    share: request.transferredShare
                })
            );
        }

        request.status = TransferStatus.Approved;

        transferHistories[request.propertyId].push(
            TransferHistory({
                transferId: request.transferId,
                propertyId: request.propertyId,
                seller: request.seller,
                buyer: request.buyer,
                transferredShare: request.transferredShare,
                timestamp: block.timestamp
            })
        );

        emit TransferApproved(transferId);

        emit TransferCompleted(
            transferId,
            request.propertyId,
            request.seller,
            request.buyer,
            request.transferredShare
        );
    }

    function getTransferHistory(
        string calldata propertyId
    ) external view returns (TransferHistory[] memory) {
        require(properties[propertyId].exists, "Property not found");

        return transferHistories[propertyId];
    }

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
