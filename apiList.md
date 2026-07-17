# SparkUp API Reference

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /signup | Register a new user |
| POST | /login | Login with email and password |
| POST | /logout | Logout and clear session |

## Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /profile/view | Get logged-in user's profile |
| PATCH | /profile/edit | Update profile fields (firstName, lastName, photoUrl, age, gender, about) |

## Connection Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /request/send/interested/:userId | Send interest to a user |
| POST | /request/send/ignored/:userId | Pass on a user |
| POST | /request/review/accepted/:requestId | Accept a connection request |
| POST | /request/review/rejected/:requestId | Reject a connection request |

## Users and Feed

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /user/connections | Get all accepted connections |
| GET | /user/requests/received | Get pending incoming requests |
| GET | /feed?page=1&limit=10 | Get user profiles for the feed (paginated, excludes connections and blocked users) |

## Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /chat/:targetUserId?page=1&limit=50 | Get messages with pagination (marks unread as seen) |
| GET | /chat/unread/counts | Get unread message counts for all conversations |

## Payments and Premium

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /payment/create | Create a Razorpay order for membership |
| POST | /payment/webhook | Razorpay webhook handler |
| GET | /premium/verify | Check if user is premium |
| POST | /premium/activate | Activate premium after successful payment |
| POST | /premium/cancel | Cancel premium membership |

## Block and Report

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /user/block/:userId | Block a user (accepts reason in body) |
| POST | /user/unblock/:userId | Unblock a user |
| GET | /user/blocked | Get list of blocked users |
| GET | /user/blocked/:userId | Check if a specific user is blocked |

## Socket.io Events

### Client to Server

| Event | Payload | Description |
|-------|---------|-------------|
| userOnline | userId | Mark user as online |
| joinChat | { firstName, userId, targetUserId } | Join a chat room |
| sendMessage | { firstName, lastName, userId, targetUserId, text, replyTo? } | Send a message |
| typing | { userId, targetUserId, isTyping } | Typing indicator |
| deleteMessage | { userId, targetUserId, messageId } | Delete own message |
| reactToMessage | { userId, targetUserId, messageId, emoji } | React to a message |
| markSeen | { userId, targetUserId } | Mark messages as read |

### Server to Client

| Event | Payload | Description |
|-------|---------|-------------|
| onlineStatus | { userId, isOnline } | User online/offline status change |
| currentOnlineUsers | [userIds] | Full list of online users on connect |
| messageReceived | { _id, firstName, lastName, text, replyTo, createdAt } | New message |
| userTyping | { userId, isTyping } | Someone is typing |
| messageDeleted | { messageId } | Message was deleted |
| messageReaction | { messageId, reactions } | Reaction added/removed |
| messagesSeen | { seenBy } | Messages marked as read |

## Rate Limits

- General: 100 requests per 15 minutes
- Auth (login/signup): 10 attempts per 15 minutes
- Connection requests: 50 per hour

## Connection Request Status Flow

```
interested -> accepted / rejected
ignored (no further action)
```

## Notes

- All authenticated routes require a valid JWT token in cookies
- Feed excludes users you have existing connections with, and blocked users
- Chat messages support text, images (wrapped in [image]url[/image]), and replies
- Reactions are toggled (same emoji again removes it, new emoji replaces old)
- Block removes existing connection requests between both users
