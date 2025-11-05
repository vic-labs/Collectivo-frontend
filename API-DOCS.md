# Collectivo API Documentation

## Base URL
```
http://localhost:3000
```
*Note: Replace with your deployed API URL in production*

## Overview
This API provides endpoints for managing crowdfunding campaigns, proposals, and contributions on the Sui blockchain. Built with Bun and Drizzle ORM.

---

## Campaigns Endpoints

### Get All Campaigns
**Endpoint:** `GET /campaigns`

**Query Parameters:**
- `creator` (string, optional) - Filter by creator address
- `isActive` (boolean, optional) - Filter by campaign status (true=Active, false=Completed)
- `sortBy` ('createdAt' | 'suiRaised', optional, default: 'createdAt') - Sort field
- `sortOrder` ('asc' | 'desc', optional, default: 'desc') - Sort direction
- `limit` (number, optional, default: 20) - Results per page
- `page` (number, optional, default: 1) - Page number
- `search` (string, optional) - Search in NFT name, ID, or type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "creator": "string",
      "nft": {
        "id": "string",
        "name": "string",
        "imageUrl": "string",
        "rank": "number",
        "isPurchased": "boolean",
        "isListed": "boolean",
        "nftType": "string"
      },
      "description": "string",
      "target": "number",
      "suiRaised": "number",
      "minContribution": "number",
      "status": "Active" | "Completed",
      "createdAt": "string",
      "completedAt": "string | null",
      "deletedAt": "string | null",
      "walletAddress": "string | null"
    }
  ]
}
```

### Get Campaign by ID
**Endpoint:** `GET /campaigns/:id`

**Path Parameters:**
- `id` (string) - Campaign ID

**Response:**
```json
{
  "success": true,
  "data": {
    // Campaign object (same structure as above)
  }
}
```

### Get Campaign Details (with relations)
**Endpoint:** `GET /campaigns/:id/details`

**Path Parameters:**
- `id` (string) - Campaign ID

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      // Campaign object
    },
    "contributions": [
      {
        "id": "number",
        "campaignId": "string",
        "contributor": "string",
        "amount": "number",
        "contributedAt": "string",
        "txDigest": "string | null"
      }
    ],
    "withdrawals": [
      {
        "id": "number",
        "campaignId": "string",
        "contributor": "string",
        "amount": "number",
        "isFullWithdrawal": "boolean",
        "withdrawnAt": "string",
        "txDigest": "string | null"
      }
    ],
    "proposals": [
      {
        "id": "string",
        "campaignId": "string",
        "proposer": "string",
        "proposalType": "List" | "Delist",
        "listPrice": "number | null",
        "status": "Active" | "Passed" | "Rejected",
        "createdAt": "string",
        "endedAt": "string | null",
        "deletedAt": "string | null",
        "votes": [
          {
            "id": "number",
            "proposalId": "string",
            "voter": "string",
            "voteType": "Approval" | "Rejection",
            "votingWeight": "number",
            "votedAt": "string",
            "txDigest": "string | null"
          }
        ]
      }
    ]
  }
}
```

### Get Campaign by NFT ID
**Endpoint:** `GET /campaigns/nft/:nftId`

**Path Parameters:**
- `nftId` (string) - NFT ID

**Response:** Same as `GET /campaigns/:id`

---

## Proposals Endpoints

### Get All Proposals
**Endpoint:** `GET /proposals`

**Query Parameters:**
- `campaignId` (string, optional) - Filter by campaign ID
- `status` ('Active' | 'Passed' | 'Rejected', optional) - Filter by proposal status
- `sortBy` ('createdAt' | 'endedAt', optional, default: 'createdAt') - Sort field
- `sortOrder` ('asc' | 'desc', optional, default: 'desc') - Sort direction
- `proposer` (string, optional) - Filter by proposer address
- `proposalType` ('List' | 'Delist', optional) - Filter by proposal type
- `limit` (number, optional, default: 20) - Results per page
- `page` (number, optional, default: 1) - Page number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "campaignId": "string",
      "proposer": "string",
      "proposalType": "List" | "Delist",
      "listPrice": "number | null",
      "status": "Active" | "Passed" | "Rejected",
      "createdAt": "string",
      "endedAt": "string | null",
      "deletedAt": "string | null"
    }
  ]
}
```

### Get Proposal by ID
**Endpoint:** `GET /proposals/:id`

**Path Parameters:**
- `id` (string) - Proposal ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "campaignId": "string",
    "proposer": "string",
    "proposalType": "List" | "Delist",
    "listPrice": "number | null",
    "status": "Active" | "Passed" | "Rejected",
    "createdAt": "string",
    "endedAt": "string | null",
    "deletedAt": "string | null",
    "votes": [
      {
        "id": "number",
        "proposalId": "string",
        "voter": "string",
        "voteType": "Approval" | "Rejection",
        "votingWeight": "number",
        "votedAt": "string",
        "txDigest": "string | null"
      }
    ],
    "campaign": {
      // Full campaign object
    }
  }
}
```

---

## Users Endpoints

### Get User Campaigns
**Endpoint:** `GET /users/:address/campaigns`

**Path Parameters:**
- `address` (string) - User wallet address

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "creator": "string",
      "nft": {
        // NFT object
      },
      "description": "string",
      "target": "number",
      "suiRaised": "number",
      "minContribution": "number",
      "status": "Active" | "Completed",
      "createdAt": "string",
      "completedAt": "string | null",
      "deletedAt": "string | null",
      "walletAddress": "string | null",
      "contributions": [
        // User's contributions to this campaign
      ],
      "withdrawals": [
        // User's withdrawals from this campaign
      ]
    }
  ]
}
```

---

## Status Endpoint

### Health Check
**Endpoint:** `GET /status`

**Response:**
```json
{
  "success": true,
  "message": "API is running"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `404` - Resource not found
- `400` - Bad request (invalid parameters)
- `500` - Internal server error

---

## Data Types Reference

### Campaign
```typescript
interface Campaign {
  id: string;
  creator: string;
  nft: DbNft;
  description: string;
  target: number;
  suiRaised: number;
  minContribution: number;
  status: 'Active' | 'Completed';
  createdAt: string;        // ISO 8601 timestamp
  completedAt: string | null;
  deletedAt: string | null;
  walletAddress: string | null;
}
```

### DbNft
```typescript
interface DbNft {
  id: string;
  name: string;
  imageUrl: string;
  rank: number;
  isPurchased: boolean;
  isListed: boolean;
  nftType: string;
}
```

### Proposal
```typescript
interface Proposal {
  id: string;
  campaignId: string;
  proposer: string;
  proposalType: 'List' | 'Delist';
  listPrice: number | null;
  status: 'Active' | 'Passed' | 'Rejected';
  createdAt: string;
  endedAt: string | null;
  deletedAt: string | null;
}
```

### Vote
```typescript
interface Vote {
  id: number;
  proposalId: string;
  voter: string;
  voteType: 'Approval' | 'Rejection';
  votingWeight: number;
  votedAt: string;
  txDigest: string | null;
}
```

### Contribution
```typescript
interface Contribution {
  id: number;
  campaignId: string;
  contributor: string;
  amount: number;
  contributedAt: string;
  txDigest: string | null;
}
```

### Withdrawal
```typescript
interface Withdrawal {
  id: number;
  campaignId: string;
  contributor: string;
  amount: number;
  isFullWithdrawal: boolean;
  withdrawnAt: string;
  txDigest: string | null;
}
```

---

## Usage Examples

### Get active campaigns sorted by amount raised
```bash
GET /campaigns?isActive=true&sortBy=suiRaised&sortOrder=desc&limit=10
```

### Get campaign details with all relations
```bash
GET /campaigns/0x35b44f98d9632af5fb43ab4a2da109f7ce314a7da141973c860bcc7c25ed2aa0/details
```

### Get proposals for a specific campaign
```bash
GET /proposals?campaignId=0x35b44f98d9632af5fb43ab4a2da109f7ce314a7da141973c860bcc7c25ed2aa0
```

### Get user's campaigns
```bash
GET /users/0xf49992e27d1f1fcd417389ed0931d85472869ce2219dbb6e163b614039a22f4d/campaigns
```

---

## Notes

- All timestamps are in ISO 8601 format
- Pagination starts from page 1
- Default limit is 20 items per page
- Deleted campaigns are filtered out from responses
- The API is built with Bun and uses SQLite with Drizzle ORM
- All monetary values are in SUI (not MIST)