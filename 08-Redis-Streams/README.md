# Redis Streams
Redis Streams is a powerful data structure in Redis designed for handling real-time data flows—think logs, events, messaging systems, or data pipelines.

**Using Redis Streams instead of Pub/Sub gives you:**
- persistent messages
- replay support
- acknowledgements
- consumer groups
- reliable delivery
- offline recovery

This is much better for production systems.

## 🧠 What is a Redis Stream?

A Redis Stream is like a log file that keeps growing. You can:
- Append messages (events)
- Read them in order
- Process them independently using consumers
Each message has:
- An ID (timestamp-based, e.g., 1680000000000-0)
- A set of field-value pairs

## Redis Streams Solution

Streams store every event:
```
notification-stream
    ├── message-1
    ├── message-2
    ├── message-3
```
Clients can reconnect and continue reading.

## ⚙️ Basic Commands
**1. Add data (produce messages)**
```
XADD mystream * name Alice action login
```
- * → auto-generates ID
- Adds a message to the stream

**2. Read data**
```
XRANGE mystream - +
```
Reads all messages from start (-) to end (+)

**3. Read new messages (like a subscriber)**
```
XREAD BLOCK 0 STREAMS mystream $
```
- Waits for new messages (BLOCK 0)
- $ → only new entries

## Why Streams Instead of Pub/Sub
**Pub/Sub Problem**

If Angular disconnects:
```
message is LOST
```
Redis Pub/Sub does not store messages.

## 🧩 Real-world Use Cases
+ Event-driven systems (microservices communication)
+ Log aggregation pipelines
+ Real-time analytics
+ Task queues (alternative to Kafka-lite setups)

## ⚡ Redis Streams vs Pub/Sub
| Feature                | Redis Pub/Sub | Redis Streams |
| ---------------------- | ------------- | ------------- |
| Persistence            | ❌ No          | ✅ Yes         |
| Replay                 | ❌ No          | ✅ Yes         |
| Consumer Groups        | ❌ No          | ✅ Yes         |
| Message Acknowledgment | ❌ No          | ✅ Yes         |
| Reliability            | Low           | High          |

## ⚖️ Redis Streams vs Other Tools
| Feature     | Redis Streams | Kafka           |
| ----------- | ------------- | --------------- |
| Setup       | Simple        | Complex         |
| Persistence | Yes           | Yes             |
| Scaling     | Moderate      | Massive         |
| Use case    | Lightweight   | Heavy streaming |

## 🚧 Limitations
Not ideal for huge distributed systems like Kafka
Memory usage can grow (needs trimming via XTRIM)

## Example Senior-Level Architecture
```
Angular Frontend
      ↓
Node.js API
      ↓
Redis Stream
      ↓
Consumer Group
 ┌────────┬────────┬────────┐
 Email    Billing   Analytics
```

