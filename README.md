# Bitespeed Identity Reconciliation Service

A Node.js/TypeScript web service that implements identity reconciliation for customer contact information. This service helps identify and link different contact records that belong to the same person, even when they use different email addresses or phone numbers.

## 🚀 Features

- **Identity Reconciliation**: Automatically links contact records that share common email or phone information
- **Primary/Secondary Contact Management**: Maintains a hierarchical structure with one primary contact and multiple secondary contacts
- **Contact Merging**: Intelligently merges separate contact groups when common information is discovered
- **RESTful API**: Clean HTTP API with proper error handling and validation
- **TypeScript**: Full type safety and modern JavaScript features
- **SQLite Database**: Lightweight, in-memory database for fast operations

## 📋 Requirements

- Node.js 14+ 
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bitespeed-identity-reconciliation
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Bitespeed Identity Reconciliation Service is running"
}
```

#### Identify Contact
```http
POST /identify
```

**Request Body:**
```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

**Note:** At least one of `email` or `phoneNumber` must be provided.

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["primary@example.com", "secondary@example.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

## 🧪 Testing

Run the comprehensive test suite:
```bash
npx ts-node src/test.ts
```

The test suite covers all the scenarios mentioned in the requirements:
- Creating new primary contacts
- Creating secondary contacts
- Merging separate contact groups
- Querying by email only
- Querying by phone only
- Querying by both email and phone

## 📊 Database Schema

The service uses a SQLite database with the following schema:

```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phoneNumber TEXT,
  email TEXT,
  linkedId INTEGER,
  linkPrecedence TEXT CHECK(linkPrecedence IN ('primary', 'secondary')) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME
);
```

## 🔄 How It Works

### Contact Linking Logic

1. **New Contact**: If no existing contacts match the provided email or phone, a new primary contact is created.

2. **Secondary Contact**: If a contact with matching email or phone exists, but the new contact has additional information, a secondary contact is created and linked to the primary.

3. **Contact Merging**: If multiple primary contacts are found that share common information, they are merged with the oldest contact becoming the primary and others becoming secondary.

### Example Scenarios

#### Scenario 1: Creating Linked Contacts
```bash
# First request
POST /identify
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}

# Response: Creates primary contact (ID: 1)

# Second request  
POST /identify
{
  "email": "mcfly@hillvalley.edu", 
  "phoneNumber": "123456"
}

# Response: Creates secondary contact (ID: 2) linked to primary (ID: 1)
```

#### Scenario 2: Merging Contact Groups
```bash
# First group
POST /identify
{
  "email": "george@hillvalley.edu",
  "phoneNumber": "919191"
}

# Second group
POST /identify  
{
  "email": "biffsucks@hillvalley.edu",
  "phoneNumber": "717171"
}

# Merge request
POST /identify
{
  "email": "george@hillvalley.edu",
  "phoneNumber": "717171"
}

# Response: Merges both groups, george becomes primary, biffsucks becomes secondary
```

## 🏗️ Project Structure

```
src/
├── index.ts           # Express server and API endpoints
├── database.ts        # Database operations and schema
├── identityService.ts # Core identity reconciliation logic
└── test.ts           # Comprehensive test suite
```

## 🚀 Deployment

### Using Render.com

1. Connect your GitHub repository to Render
2. Set the build command: `npm run build`
3. Set the start command: `npm start`
4. Deploy!

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## 🧪 Example Usage

### Using curl

```bash
# Create a new contact
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'

# Query by email only
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Query by phone only  
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "1234567890"}'
```

### Using JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:3000/identify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    phoneNumber: '1234567890'
  })
});

const result = await response.json();
console.log(result);
```

## 🐛 Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid request body or missing required fields
- `500 Internal Server Error`: Server-side errors

Example error response:
```json
{
  "error": "Either email or phoneNumber must be provided"
}
```

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.
