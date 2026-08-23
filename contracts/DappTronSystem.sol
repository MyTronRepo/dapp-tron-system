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

    function getPropertyData(
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

        Property memory p = properties[propertyId];

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
}
