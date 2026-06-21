# DApp TRON System

## Overview

DApp TRON System is a decentralized real estate document management platform developed on the TRON blockchain. The system aims to improve security, transparency, traceability, and document authenticity verification for real estate records through smart contracts and decentralized storage technologies.

This project is developed as a master's thesis and demonstrates how blockchain technology can be utilized to manage property ownership, digital documents, ownership transfers, and document verification processes in a secure and transparent environment.

---

## Objectives

- Secure registration of real estate properties
- Digital document registration and management
- Prevention of document forgery through cryptographic hashing
- Ownership share management
- Ownership transfer tracking
- Transparent transfer history recording
- Decentralized document verification
- Role-based access control
- Integration with TRON blockchain and IPFS

---

## System Architecture

```text
Owner / Buyer / Admin / Observer
                │
                ▼
        Frontend DApp
                │
                ▼
        TronLink Wallet
                │
                ▼
        Smart Contract
                │
                ▼
       TRON Blockchain
         (Nile Testnet)
                │
                ▼
          IPFS Storage
```

---

## User Roles

### Owner

- Register property
- Update property before admin approval
- Register property documents
- Replace documents before approval
- Request ownership transfer
- View private property information

### Buyer

- Approve ownership transfer requests
- View transfer request status

### Admin

- Verify property registration
- Reject property registration
- Verify documents
- Revoke documents
- Approve ownership transfers
- Change administrator address

### Observer

- View public property information
- Verify document authenticity
- View ownership transfer history

---

## Core Features

### Property Registration

Property owners can register real estate information, upload supporting documents, and submit the property for administrative verification.

### Document Management

Property documents are uploaded, hashed, stored through IPFS, and registered on the blockchain.

### Ownership Transfer

Ownership shares can be transferred through a multi-step approval workflow involving seller, buyer, and administrator.

### Document Verification

Users can verify document authenticity using Property ID or Document Hash.

### Transfer History Tracking

All approved ownership transfers are permanently recorded on the blockchain.

---

## Main Entities

### Property

- Property ID
- Province
- City
- District
- Parcel Number
- Area
- Build Year
- Usage Type
- Construction Status
- Latitude
- Longitude
- Status

### Ownership

- Wallet Address
- National ID Hash
- Ownership Share

### Document

- Property ID
- Document Hash
- Document URI
- Issue Date
- Status

### Transfer Request

- Transfer ID
- Property ID
- Seller
- Buyer
- Transferred Share
- Buyer Approval
- Admin Approval
- Timestamp
- Expiration Time
- Status

---

## Ownership Transfer Workflow

```text
Owner Creates Transfer Request
            │
            ▼
Buyer Approves Request
            │
            ▼
Admin Approves Request
            │
            ▼
Automatic Ownership Update
            │
            ▼
Transfer History Registration
```

---

## Business Rules

- Each property can have multiple owners.
- Ownership shares must always equal 100%.
- Minimum transferable share is 1%.
- A property can have only one active transfer request at a time.
- Transfer request validity period is 7 days.
- Partial ownership transfers are allowed.
- Transfers to existing owners are allowed.
- Owners cannot transfer more than their available share.
- Owners with zero share are automatically removed.
- Each property can have multiple documents.
- Public information is accessible to all users.
- PDF documents are accessible only to owners and administrators.

---

## Stored Blockchain Data

### Property Data

- Property information
- Property status
- Ownership information

### Document Data

- Document Hash
- Document URI
- Issue Date
- Document Status

### Transfer Data

- Transfer requests
- Transfer history
- Ownership updates

---

## Public Information

- Property existence
- Property ID
- Property location information
- Property status
- Document status
- Document validity
- Number of owners
- Ownership shares
- Transfer history
- Transfer count

---

## Private Information

- National ID hashes
- PDF documents

---

## Technologies

### Blockchain

- TRON Blockchain
- Nile Testnet
- Solidity
- TronBox

### Backend

- Node.js
- Express.js
- Multer
- Axios

### Storage

- IPFS

### Authentication

- TronLink Wallet

---

## Project Structure

```text
DAPP-TRON-SYSTEM
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── uploads
│   ├── utils
│   └── server.js
│
├── contracts
│   └── DappTronSystem.sol
│
├── migrations
├── tests
│
├── .env
├── package.json
├── tronbox-config.js
└── README.md
```

---

## Project Scope

### Included

- Property registration
- Digital document registration
- Ownership management
- Ownership transfer workflow
- Transfer history management
- Document authenticity verification
- Role-based access control
- Decentralized document storage

### Excluded

- Official government integration
- Real legal property registration
- Real identity verification
- Financial transactions
- Property valuation
- Payment processing

---

## License

MIT License

---

## Author

Hadi Rezaei

Master's Thesis Project

TRON Blockchain Based Real Estate Document Management System
