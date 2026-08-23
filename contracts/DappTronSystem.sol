// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract DappTronSystem {
    // ==========================================
    // Enums
    // ==========================================

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

    // ==========================================
    // Structs
    // ==========================================

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

    // ==========================================
    // State Variables
    // ==========================================

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

    // ==========================================
    // Events
    // ==========================================

    event PropertyRegistered(string propertyId);

    event PropertyVerified(string propertyId);

    event PropertyRejected(string propertyId);

    event DocumentRegistered(string propertyId, bytes32 documentHash);

    event DocumentRevoked(string propertyId, bytes32 documentHash);

    event TransferRequested(uint256 transferId);

    event TransferApproved(uint256 transferId);

    event AdminChanged(address oldAdmin, address newAdmin);

    // ==========================================
    // Constructor
    // ==========================================

    constructor() {
        admin = msg.sender;
    }

    // ==========================================
    // Modifiers
    // ==========================================

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // ==========================================
    // Property Functions
    // ==========================================

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
}
