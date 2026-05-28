# Redis realtime example with Angular
Here’s a complete real-time example using:
- Redis
- ioredis
- Socket.IO
- Angular
- Node.js

Architecture:
```
Angular UI
    ↕ WebSocket
Socket.IO Server
    ↕
Redis Pub/Sub
    ↕
Publisher Service
```

This is the common production pattern for:
- live notifications
- chat apps
- dashboards
- stock updates
- order tracking
- multiplayer apps

## Project Structure
```
redis-angular-realtime/
│
├── backend/
│   ├── server.js
│   ├── publisher.js
│   └── package.json
│
└── frontend/
    └── Angular app
```

## Real-Time Flow
```
publisher.js
     ↓ publish
Redis Channel
     ↓ subscribe
Socket.IO Server
     ↓ emit
Angular Browser
```

**What Happens**

Every 5 seconds:
```
publisher.js
```
1. publishes message to Redis.
2. Redis subscriber receives it.
3. Socket.IO broadcasts it.
4. Angular UI updates instantly without refresh.

## Why Use Redis Here?

Redis decouples services.

Many backend services can publish:
- Order Service
- Payment Service
- Email Service
- Notification Service

Frontend only connects to Socket.IO.

## Common Enterprise Use Cases
- Live notifications
- Trading dashboards
- Chat systems
- IoT telemetry
- Real-time analytics
- Multiplayer games
- Admin monitoring
- Delivery tracking

## Use Redis Streams for Reliability

Pub/Sub loses messages if Angular disconnects.

Streams provide:
- persistence
- replay
- acknowledgements

## Why Streams Instead of Pub/Sub
**Pub/Sub Problem**

If Angular disconnects:
```
message is LOST
```
Redis Pub/Sub does not store messages.

**Redis Streams Solution**

Streams store every event:
```
notification-stream
    ├── message-1
    ├── message-2
    ├── message-3
```
Clients can reconnect and continue reading.