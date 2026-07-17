# SparkUp Backend

Backend server for SparkUp, a real-time social networking platform. Built with Node.js, Express, MongoDB, and Socket.io.

## Tech Stack

- Node.js + Express
- MongoDB with Mongoose
- Socket.io for real-time communication
- Razorpay for payments
- Brevo (Sendinblue) for transactional emails
- Cloudinary for image uploads
- JWT for authentication
- bcrypt for password hashing
- express-rate-limit for API protection

## Features

- User authentication (signup, login, logout) with JWT cookies
- Profile management with image upload via Cloudinary
- Connection request system (send, accept, reject, ignore)
- Real-time chat with Socket.io
  - Text and image messages
  - Typing indicators
  - Read receipts (seen/delivered)
  - Message reactions
  - Reply to messages
  - Message deletion
  - Online/offline status tracking
- Paginated feed with exclusion of connected and blocked users
- Premium membership via Razorpay integration
- Block/report system
- Rate limiting (general, auth, connection requests)
- Email notifications (welcome, friend request, match, premium)

## Project Structure

```
src/
  app.js              - Entry point, middleware setup, route mounting
  config/
    database.js       - MongoDB connection
  middlewares/
    auth.js           - JWT authentication middleware
  models/
    user.js           - User schema
    connectionRequest.js - Connection request schema
    chat.js           - Chat and message schema (with reactions, replies, seen)
    payment.js        - Payment/order schema
    block.js          - Block/report schema
  routes/
    auth.js           - Signup, login, logout
    profile.js        - View and edit profile
    request.js        - Send and review connection requests
    user.js           - Connections, requests, feed
    chat.js           - Chat history with pagination, unread counts
    payment.js        - Razorpay orders, webhooks, premium activation
    block.js          - Block, unblock, list blocked users
  utils/
    socket.js         - Socket.io event handlers
    sendEmail.js      - Email templates and sending via Brevo
    validation.js     - Input validation helpers
    razorpay.js       - Razorpay instance
    constants.js      - Membership pricing constants
```

## Setup

1. Clone the repo
```bash
git clone https://github.com/Er-Mithleshsharma/SparkUp-Backend.git
cd SparkUp-Backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
BREVO_API_KEY=your_brevo_api_key
```

4. Start the server
```bash
npm run dev
```

Server runs on port 7777 by default.

## API Documentation

See [apiList.md](./apiList.md) for the full API reference including REST endpoints and Socket.io events.

## Architecture Decisions

- Socket.io over WebSocket API: Needed persistent connections for real-time chat, typing indicators, and online status. This ruled out serverless (Lambda) as the deployment target.
- Rate limiting at three levels (general, auth, connection requests) to prevent abuse.
- Messages stored as subdocuments within a Chat document for fast retrieval of conversation history.
- Pagination on both feed and chat to handle scale.
- Block system filters at the feed level (blocked users never appear) and removes existing connections on block.
- Emails sent asynchronously (non-blocking) so API responses are not delayed.

## Frontend

The frontend repo is at [SparkUp-Web](https://github.com/Er-Mithleshsharma/SparkUp-Web).
