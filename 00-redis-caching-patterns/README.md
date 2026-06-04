# Redis Common Caching Patterns
Redis caching patterns are common strategies used to improve application performance, reduce database load, and handle high traffic efficiently.

<img src="Redis_caching_patterns.png" />

## Tutorials
1. Redis Cache : https://www.geeksforgeeks.org/system-design/redis-cache/
2. Caching Strategies | System Design Interview | Write-Through, Write-Back, Cache Aside, Read-Through : https://www.youtube.com/watch?v=Cm7gem9mBeg
3. REST API Caching Strategies Every Developer Must Know : https://www.youtube.com/watch?v=TV-xsNjbx_g
4. Caching in System Design Interviews w/ Meta Staff Engineer : https://www.youtube.com/watch?v=1NngTUYPdpI

## Here are the most important Redis caching patterns used in real-world systems and interviews.

- **Cache-Aside (Lazy Loading):** The most common pattern. The application checks the cache first. If the data isn't there, it pulls it from the database, writes it to the cache, and returns it.
- **Write-Through:** The application writes to both the cache and the primary database simultaneously, ensuring the cache always has the latest data.
- **Write-Behind:** The application writes immediately to the cache, returning success to the user. An asynchronous process updates the primary database later.
- **Read-Through:** Configures the cache itself to handle reading from the underlying database automatically when a cache miss occurs.

| Pattern       | Read Speed           | Write Speed | Consistency         | Complexity |
| ------------- | -------------------- | ----------- | ------------------- | ---------- |
| Cache Aside   | Fast after first hit | Normal      | Medium              | Low        |
| Read Through  | Fast                 | Normal      | Medium              | Medium     |
| Write Through | Fast                 | Slower      | High                | Medium     |
| Write Behind  | Fast                 | Very Fast   | Lower               | High       |
| Prefetching   | Fastest              | N/A         | High (if refreshed) | Medium     |

## Real E-Commerce Architecture

A large e-commerce platform often combines multiple patterns:
```
                     Product Catalog
                           |
                           v
                      Prefetching
                           |
                           v
                         Redis

User Profile  ---> Cache Aside ---> Redis

Order Service ---> Write Through ---> Redis + DB

Analytics ---> Write Behind ---> Redis ---> DB

Microservices ---> Read Through Layer ---> Redis
```

### 1. Cache Aside (Lazy Loading)

Most commonly used pattern.

Application checks cache first.
```
If data is missing → fetch from DB → store in Redis → return response.
```

**Flow**
```
         Read Request (Client)
               |
               v
           Redis?
          /      \
      HIT         MISS
       |            |
       v            v
    Return      Database
                  |
                  v
             Store in Redis
                  |
                  v
               Return
```

**Steps**
1. Check Redis
2. If hit → return data
3. If miss:
    - Query DB
    - Save to Redis
    - Return data

**Example**
```
async function getUser(id: string) {
  const cached = await redis.get(`user:${id}`);

  if (cached) {
    return JSON.parse(cached);
  }

  const user = await db.users.findById(id);

  await redis.set(
    `user:${id}`,
    JSON.stringify(user),
    "EX",
    3600
  );

  return user;
}
```

**Advantages**
- ✅ Simple
- ✅ Cost efficient
- ✅ Only cache frequently accessed data

**Problems**
- ❌ Cache miss latency
- ❌ Stale data possible
- ❌ First request is slow

**Real-world use**
- User profiles
- E-commerce products pages
- Catalog data
- Angular dashboard APIs

### 2. Write Through Cache

Every write goes to both Redis and Database.

**Flow**
```
          Update User
                |
                v
           Application
                |
      -------------------
      |                 |
      v                 v
    Redis          Database
      |                 |
      -------------------
                |
                v
             Success
```

**Steps**
- App updates cache
- Cache immediately updates DB

**Example**
```
await redis.set(`user:${id}`, JSON.stringify(user));
await db.users.update(user);

PUT /users/100
SET user:100 {...}
UPDATE users SET ...
```

**Advantages**
- ✅ Cache always fresh
- ✅ Faster reads
- ✅ Strong consistency

**Problems**
- ❌ Higher write latency
- ❌ Unused data also cached

**Use cases**
- Banking systems
- Session data
- Frequently read data
- Financial applications
- Order management systems

### 3. Write Behind (Write Back)

Writes go to Redis first. Database update happens later asynchronously.

**Flow**
```
                Write
                  |
                  v
               Redis
                  |
         Immediate Response
                  |
                  v
          Background Worker
                  |
                  v
              Database
```

Example
```
Checkout Order

Write: SET order:123

Response: 200 OK

Later: INSERT INTO Orders ...
```

**Advantages**
- ✅ Extremely fast writes
- ✅ Reduced DB load
- ✅ Excellent throughput

**Problems**
- ❌ Risk of data loss if Redis crashes before DB sync
- ❌ Complex recovery logic

**Use cases**
- Analytics
- Logging systems
- IoT telemetry
- High-volume checkout systems
- Gaming leaderboards

### 4. Read Through Cache

Cache itself fetches data from DB automatically. Application talks only to cache.

**Flow**
```
Application
      |
      v
    Redis
      |
      | Cache Miss
      v
 Database
      |
      v
  Redis stores data
      |
      v
 Application gets data
```
Usually implemented using custom middleware.

**Comparison**
```
Cache-Aside
App -> Redis
       |
       v
       DB

Read-Through
App -> Redis Layer
           |
           v
           DB
```
Application manages cache.

**Advantages**
- Cleaner app code
- Centralized caching logic

**Problems**
- More infrastructure complexity

### 5. Cache Prefetching (Proactive Caching)
Load data into Redis before users ask for it.

**Flow**
```
Nightly Job
     |
     v
 Database
     |
     v
 Redis
     |
     v
Application Reads
```

**Example**  
Every night:
```
SELECT * FROM Countries
SELECT * FROM States
SELECT * FROM Product Categories
```
Store in Redis:
```
countries
states
categories
```
When user requests:
```
Redis HIT
```
No DB call needed.

**Advantages**
- ✅ Near 100% cache hit ratio
- ✅ Extremely fast reads
- ✅ Minimal DB load

**Disadvantages**
- ❌ Uses memory for unused data
- ❌ Needs refresh strategy

**Best For**
- Master data
- Product catalogs
- Lookup tables
- Configuration data

### 6. Refresh Ahead Cache

Refresh cache before expiry.

**If data is frequently accessed:**
- refresh TTL automatically
- avoid cache miss

**Example**
```
TTL remaining < 2 mins
→ background refresh
```

**Use cases**
- Trending products
- Live dashboards
- Stock prices

### 7. Write Around Cache

Writes go directly to DB.  
Cache updated only during reads.  

**Flow**
```
Write → DB only
Read → Cache Aside
```

**Advantages**
- Avoids caching unused data

**Problems**
- First read slower
- Use cases
- Large datasets
- Rarely read records

### 8. Cache Stampede Protection

Prevents multiple requests from hitting DB simultaneously when cache expires.

**Problem**
```
1000 requests
Cache expired
All hit DB together
DB crashes
```

**Solutions**
Mutex Lock
```
Only one request rebuilds cache
Others wait
```
Probabilistic Expiry
```
Randomize TTL.
```
Background Refresh
```
Refresh before expiry.
```

### 9. Distributed Cache Pattern

Multiple application servers share same Redis cache.

**Architecture**
```
Angular App
      ↓
Load Balancer
   ↓      ↓
Node1   Node2
    \    /
     Redis
```

**Benefits**
- Shared state
- Horizontal scaling
- Centralized sessions

### 10. Session Cache Pattern

Store user sessions in Redis.

**Example**
```
session:12345 → user data
```

**Benefits**
- Fast authentication
- Shared sessions across servers
- Works well with JWT refresh flows

**Used heavily with:**
- Node.js
- Angular
- OAuth2/OIDC systems

### 11. CQRS + Redis Cache

Redis used as optimized read model.

**Architecture**
```
Write DB → Event → Redis Read Cache
```
Reads become extremely fast.

**Use cases**
- E-commerce
- Analytics
- Real-time dashboards

### 12. Redis Pub/Sub Cache Invalidation

**When data changes:**
- publish invalidation event
- all services clear cache

**Example**
```
user-updated event
→ clear user cache everywhere
```

Useful in:
- Microservices
- Distributed systems

### 12. Redis Streams + Cache

Use Redis Streams for reliable event processing.

**Example**
```
Order Created
   ↓
Redis Stream
   ↓
Consumers update cache
```

**Good for:**
- Event-driven systems
- Real-time pipelines

## Production Problems & Solutions
| Problem           | Solution             |
| ----------------- | -------------------- |
| Cache penetration | Bloom filters        |
| Cache avalanche   | Random TTL           |
| Hot keys          | Sharding             |
| Stale cache       | Pub/Sub invalidation |
| Large objects     | Compression          |
| Memory overflow   | LRU eviction         |

## Which Pattern Should You Use?
| Scenario                  | Best Pattern         |
| ------------------------- | -------------------- |
| General APIs              | Cache Aside          |
| Heavy reads               | Write Through        |
| Massive writes            | Write Behind         |
| Real-time systems         | Refresh Ahead        |
| Distributed microservices | Pub/Sub invalidation |
| Event systems             | Streams + Cache      |

## Interview Tips

Most companies expect knowledge of:
- Cache Aside
- TTL strategy
- Cache invalidation
- Stampede prevention
- Redis clustering
- LRU eviction
- Distributed caching
- Pub/Sub invalidation





