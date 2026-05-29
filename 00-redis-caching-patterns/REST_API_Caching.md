# Redis Caching for REST APIs
1. REST API Caching Strategies Every Developer Must Know : https://www.youtube.com/watch?v=TV-xsNjbx_g
2. Caching Strategies | System Design Interview | Write-Through, Write-Back, Cache Aside, Read-Through : https://www.youtube.com/watch?v=Cm7gem9mBeg

## Chapter 1: Why Caching is Essential for REST APIs

**Caching reduces:**
- Database load
- API response time
- Server CPU usage
- Network traffic

**Basic REST API Flow**
```
Client
   ↓
REST API
   ↓
Database
```
**With Redis Cache**
```
Client
   ↓
REST API
   ↓
Redis Cache
   ↓ (miss)
Database
```

Benefits:
- Faster responses
- Better scalability
- Reduced infrastructure cost

## Chapter 2: Application Layer Caching with Redis
Redis Cache-Aside Pattern
```
                ┌─────────────┐
                │   Client    │
                └──────┬──────┘
                       │
                       ▼
              ┌────────────────┐
              │  REST API App  │
              └──────┬─────────┘
                     │
         Check Cache │
                     ▼
              ┌────────────┐
              │   Redis    │
              └────┬───────┘
                   │
        Cache Hit  │  Cache Miss
           ┌───────┘
           ▼
      Return Data
                   ▼
             ┌───────────┐
             │ Database  │
             └────┬──────┘
                  │
          Save to Redis
                  │
                  ▼
            Return Data
```

**Redis TTL Example**
```
SETEX user:123 300 {...}
```
Meaning:
- Store key: user:123
- Expire after 300 seconds

## Chapter 3: Request-Level Caching

Caches FULL API responses.

**Flow**
```
GET /users?page=2&limit=10
            │
            ▼
Generate Cache Key
            │
            ▼
"user:list:page:2:limit:10"
            │
            ▼
Redis Lookup
```

**Request-Level Architecture**
```
Client Request
       │
       ▼
┌──────────────┐
│ REST API     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Redis Cache  │
└──────┬───────┘
       │ hit
       ▼
 Return Response

       │ miss
       ▼

┌──────────────┐
│ Database     │
└──────┬───────┘
       │
       ▼
 Save Response
       │
       ▼
 Return Response
```

**Cache Key Examples**
```
User API                     user:123
Pagination API               users:page:2:limit:10
Search API                   products:q:laptop:sort:price
```

## Chapter 4: Conditional Caching — ETag & Last-Modified

**ETag Workflow**
```
Client
   │
GET /user/123
   │
   ▼
Server
   │
Generate ETag
   │
   ▼
ETag: "abc123"
```

**Subsequent Request**
```
Client
   │
If-None-Match: "abc123"
   │
   ▼
Server compares ETag
   │
   ├── Same
   │     ▼
   │   304 Not Modified
   │
   └── Different
         ▼
      200 OK + New Data
```

**Conditional Caching Sequence**
```
┌──────────┐       ┌──────────┐
│ Client   │       │ Server   │
└────┬─────┘       └────┬─────┘
     │ GET /users       │
     ├─────────────────▶│
     │                  │
     │ 200 OK + ETag    │
     │◀─────────────────┤
     │                  │
     │ If-None-Match    │
     ├─────────────────▶│
     │                  │
     │ 304 Not Modified │
     │◀─────────────────┤
```

## Chapter 5: Cache Invalidation Strategies
### 1. Write Through
```
Application
    │
    ├── Write Redis
    │
    └── Write Database
```
Characteristics
- Consistent cache
- Slower writes
- Good for read-heavy systems

#### 2. Write Behind
```
Application
      │
      ▼
   Redis
      │
 Async Queue
      │
      ▼
 Database
```

Characteristics
- Fast writes
- Eventual consistency
- Risk of temporary stale data

#### 3. TTL-Based Eviction
```
Redis Key
   │
TTL = 300 sec
   │
   ▼
Auto Expire
```
#### Invalidation Comparison
| Strategy      | Speed  | Consistency | Complexity |
| ------------- | ------ | ----------- | ---------- |
| Write Through | Medium | High        | Low        |
| Write Behind  | Fast   | Medium      | High       |
| TTL           | Fast   | Medium      | Low        |

## Chapter 6: Layered Caching Architecture
**Multi-Layer Cache System**
```
                ┌────────────────┐
                │ Browser Cache  │
                └───────┬────────┘
                        │ miss
                        ▼
                ┌────────────────┐
                │ CDN Cache      │
                └───────┬────────┘
                        │ miss
                        ▼
                ┌────────────────┐
                │ Redis Cache    │
                └───────┬────────┘
                        │ miss
                        ▼
                ┌────────────────┐
                │ Database       │
                └────────────────┘
```

**Browser Cache**

Fastest layer.
```
User revisits page
       │
       ▼
Image loaded directly
from browser memory
```

**CDN Cache**

Global edge servers.
```
User in London
      │
      ▼
Nearest CDN Server
      │
      ▼
Serve Static Asset
```

**Redis Metadata Cache**
```
Redis Stores:
- image URL
- dimensions
- compression type
- metadata
```

## Chapter 7: Production-Ready REST API Blueprint
Enterprise Scalable API Architecture
```
                    ┌──────────────┐
                    │ Angular App  │
                    └──────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ API Gateway    │
                  └──────┬─────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
 ┌────────────────┐            ┌────────────────┐
 │ Node API 1     │            │ Node API 2     │
 └──────┬─────────┘            └──────┬─────────┘
        │                              │
        └──────────────┬───────────────┘
                       ▼
               ┌──────────────┐
               │ Redis Cluster│
               └──────┬───────┘
                      │
          ┌───────────┴────────────┐
          ▼                        ▼
   ┌─────────────┐          ┌─────────────┐
   │ PostgreSQL  │          │ Workers     │
   └─────────────┘          └─────────────┘
```

| Technique     | Purpose                    |
| ------------- | -------------------------- |
| Redis Cache   | Fast API responses         |
| Request Cache | Avoid duplicate processing |
| ETag          | Reduce bandwidth           |
| TTL           | Auto cleanup               |
| CDN           | Global low latency         |
| Browser Cache | Instant reloads            |
| Layered Cache | Maximum scalability        |

## Cache Hit vs Cache Miss
CACHE HIT
```
Request → Redis → Response (FAST)
```
CACHE MISS
```
Request → DB → Redis → Response (SLOW)
```

## Redis + Angular + REST API Real Flow
```
Angular Frontend
       │
HTTP GET /users
       │
       ▼
Node.js REST API
       │
       ▼
Redis Cache
       │ miss
       ▼
PostgreSQL
       │
       ▼
Store in Redis
       │
       ▼
Return JSON Response
```


