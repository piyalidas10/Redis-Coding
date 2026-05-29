# Redis Common Caching Patterns
Redis caching patterns are common strategies used to improve application performance, reduce database load, and handle high traffic efficiently.

## Tutorials
1. Redis Cache : https://www.geeksforgeeks.org/system-design/redis-cache/
2. Caching Strategies | System Design Interview | Write-Through, Write-Back, Cache Aside, Read-Through : https://www.youtube.com/watch?v=Cm7gem9mBeg
3. REST API Caching Strategies Every Developer Must Know : https://www.youtube.com/watch?v=TV-xsNjbx_g

## Here are the most important Redis caching patterns used in real-world systems and interviews.

- **Cache-Aside (Lazy Loading):** The most common pattern. The application checks the cache first. If the data isn't there, it pulls it from the database, writes it to the cache, and returns it.
- **Write-Through:** The application writes to both the cache and the primary database simultaneously, ensuring the cache always has the latest data.
- **Write-Behind:** The application writes immediately to the cache, returning success to the user. An asynchronous process updates the primary database later.
- **Read-Through:** Configures the cache itself to handle reading from the underlying database automatically when a cache miss occurs.

### 1. Cache Aside (Lazy Loading)

Most commonly used pattern.

Application checks cache first.
```
If data is missing → fetch from DB → store in Redis → return response.
```

**Flow**
```
Client
  ↓
Application
  ↓
Redis Cache
   ↙ miss
Database
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
- Simple
- Cost efficient
- Only cache frequently accessed data

**Problems**
- Cache miss latency
- Stale data possible

**Real-world use**
- User profiles
- Product pages
- Angular dashboard APIs

### 2. Write Through Cache

Write to cache and DB together.

**Flow**
```
Application
   ↓
Redis Cache
   ↓
Database
```

**Steps**
- App updates cache
- Cache immediately updates DB

**Example**
```
await redis.set(`user:${id}`, JSON.stringify(user));
await db.users.update(user);
```

**Advantages**
- Cache always fresh
- Faster reads

**Problems**
- Higher write latency
- Unused data also cached

**Use cases**
- Banking systems
- Session data
- Frequently read data

### 3. Write Behind (Write Back)

Writes go to Redis first.   
DB updated asynchronously later.

**Flow**
```
Application
   ↓
Redis
   ↓ async
Database
```

**Advantages**
- Very fast writes
- High throughput

**Problems**
- Risk of data loss
- Complex consistency

**Use cases**
- Analytics
- Logging systems
- IoT telemetry

### 4. Read Through Cache

Cache itself fetches data from DB automatically.

Application talks only to cache.

**Flow**
```
Application
    ↓
Redis Layer
    ↓
Database
```
Usually implemented using custom middleware.

**Advantages**
- Cleaner app code
- Centralized caching logic

**Problems**
- More infrastructure complexity