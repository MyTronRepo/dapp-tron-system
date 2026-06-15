pragma solidity ^0.8.0;

contract PropertyRegistry {
    address public admin;

    uint256 public propertyCounter;

    uint256 public transferCounter;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyPropertyOwner(uint256 _propertyId) {
        require(
            properties[_propertyId].currentOwner == msg.sender,
            "Not property owner"
        );
        _;
    }

    struct Property {
        uint256 propertyId;
        string province;
        string city;
        string district;
        string parcelNumber;
        uint256 area;
        uint16 buildYear;
        string usageType;
        string constructionStatus;
        string latitude;
        string longitude;
        address currentOwner;
        string ownerNationalIdHash;
        bool exists;
        bool verified;
    }

    struct Document {
        uint256 propertyId;
        string documentHash;
        string documentURI;
        bool valid;
        uint256 issueDate;
    }

    struct TransferRequest {
        uint256 transferId;
        uint256 propertyId;
        address seller;
        address buyer;
        bool buyerApproved;
        bool adminApproved;
        bool completed;
        uint256 timestamp;
    }

    mapping(uint256 => Property) public properties;

    mapping(uint256 => Document) public documents;

    mapping(uint256 => TransferRequest) public transferRequests;

    event PropertyRegistered(uint256 propertyId, address owner);

    event DocumentRegistered(uint256 propertyId, string documentHash);

    event TransferRequested(
        uint256 transferId,
        uint256 propertyId,
        address buyer
    );

    event TransferApproved(uint256 transferId);

    event DocumentRevoked(uint256 propertyId);

    function registerProperty(
        string memory _province,
        string memory _city,
        string memory _district,
        string memory _parcelNumber,
        uint256 _area,
        uint16 _buildYear,
        string memory _usageType,
        string memory _constructionStatus,
        string memory _latitude,
        string memory _longitude,
        string memory _ownerNationalIdHash
    ) public {
        propertyCounter++;

        properties[propertyCounter] = Property(
            propertyCounter,
            _province,
            _city,
            _district,
            _parcelNumber,
            _area,
            _buildYear,
            _usageType,
            _constructionStatus,
            _latitude,
            _longitude,
            msg.sender,
            _ownerNationalIdHash,
            true,
            false
        );

        emit PropertyRegistered(propertyCounter, msg.sender);
    }

    function registerDocument(
        uint256 _propertyId,
        string memory _documentHash,
        string memory _documentURI
    ) public onlyPropertyOwner(_propertyId) {
        require(properties[_propertyId].exists, "Property does not exist");

        require(
            bytes(documents[_propertyId].documentHash).length == 0,
            "Document already exists"
        );

        documents[_propertyId] = Document(
            _propertyId,
            _documentHash,
            _documentURI,
            true,
            block.timestamp
        );

        emit DocumentRegistered(_propertyId, _documentHash);
    }

    function requestTransfer(
        uint256 _propertyId,
        address _buyer
    ) public onlyPropertyOwner(_propertyId) {
        require(properties[_propertyId].exists, "Property does not exist");

        transferCounter++;

        transferRequests[transferCounter] = TransferRequest(
            transferCounter,
            _propertyId,
            msg.sender,
            _buyer,
            false,
            false,
            false,
            block.timestamp
        );

        emit TransferRequested(transferCounter, _propertyId, _buyer);
    }

    function approveTransfer(uint256 _transferId) public {
        TransferRequest storage transferRequest = transferRequests[_transferId];

        require(
            transferRequest.transferId > 0,
            "Transfer request does not exist"
        );

        require(!transferRequest.completed, "Transfer already completed");

        if (msg.sender == transferRequest.buyer) {
            transferRequest.buyerApproved = true;
        } else if (msg.sender == admin) {
            require(transferRequest.buyerApproved, "Buyer approval required");

            transferRequest.adminApproved = true;

            properties[transferRequest.propertyId]
                .currentOwner = transferRequest.buyer;

            transferRequest.completed = true;

            emit TransferApproved(_transferId);
        } else {
            revert("Unauthorized");
        }
    }

    function verifyDocument(
        uint256 _propertyId,
        string memory _documentHash
    ) public view returns (bool) {
        return
            keccak256(abi.encodePacked(documents[_propertyId].documentHash)) ==
            keccak256(abi.encodePacked(_documentHash));
    }
}
