// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract PropertyRegistry {
    address public admin;

    uint256 public propertyCounter;

    uint256 public transferCounter;

    constructor() {
        admin = msg.sender;
    }
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
