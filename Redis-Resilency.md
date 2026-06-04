# Redis Resilency

When discussing Redis resilience in production systems, it's common to think about it in three layers:

## 1. Client-Side Resiliency

This handles failures between your application and Redis.

**Problems**
- Redis temporarily unavailable
- Network interruption
- Connection timeout
- Redis restart
- Connection pool exhaustion

**Techniques**

**Auto Reconnection**  
Most Redis clients automatically reconnect.  

Example using ioredis:
```
const Redis = require("ioredis");

const redis = new Redis({
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  }
});
```

**Retry Logic**
```
async function getData(key) {
  try {
    return await redis.get(key);
  } catch(err) {
    console.error("Retrying...");
  }
}
```

**Circuit Breaker Pattern**  
Prevents continuous calls to a failing Redis server.  
```
Application
      |
      v
Circuit Breaker
      |
      v
Redis
```
When Redis fails repeatedly:
```
Circuit = OPEN
```
Requests fail fast instead of waiting.

Popular library:
- opossum

**Fallback Cache**
```
Redis Down
    |
    v
Database
```
Application serves data from DB if cache is unavailable.

**Architecture**
```
Angular
   |
NodeJS
   |
Connection Pool
   |
Retry + Reconnect
   |
Redis
```

## 2. Server-Side Resiliency

This protects Redis itself from outages.

Problems
- Redis node crash
- VM failure
- Container failure
- Hardware failure

**Redis Replication**
```
          Master
             |
      ----------------
      |              |
   Replica1      Replica2
```
If Master dies:
```
Replica promoted as Master
```

**Redis Sentinel**  
Provides automatic failover.  
```
        Sentinel
           |
    -----------------
    |               |
 Master         Replica
```
Sentinel continuously monitors nodes.

If Master fails:
```
Sentinel
   |
Promote Replica
   |
New Master
```

**Redis Cluster**

Provides:
- High Availability
- Horizontal Scaling
- Automatic Failover
```
 ┌─────────────┐
 │   Cluster   │
 └─────────────┘

 Slot 0-5000   -> Node A
 Slot 5001-10000 -> Node B
 Slot 10001-16383 -> Node C
```
Each node has replicas.
```
Master A -> Replica A
Master B -> Replica B
Master C -> Replica C
```

**Architecture**
```
                 Sentinel
                     |
                     v
          +------------------+
          |    Master        |
          +------------------+
               /      \
              /        \
             v          v
       Replica1     Replica2
```


