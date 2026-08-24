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
