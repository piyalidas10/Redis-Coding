# Redis-Coding

Nowadays database boundaries are getting blurred. Even PostgreSQL can be used somewhat like Redis. So some of the things I’ll say are opinions — standard opinions — but they can be challenged because databases evolve very fast these days.

## Tutorials
1. What is Redis and why it exists : https://www.youtube.com/watch?v=5YqP18Gyop0
2. Complete local setup to learn Redis : https://www.youtube.com/watch?v=UEm0mHeXdxk

## Redis
Let’s understand Redis with an analogy.

Nowadays database boundaries are getting blurred. Even PostgreSQL can be used somewhat like Redis. So some of the things I’ll say are opinions — standard opinions — but they can be challenged because databases evolve very fast these days.

**Let’s understand Redis with an analogy.**

Suppose there’s a grocery shop. A customer asks:
```
“What’s the price of tea?”
```
The shopkeeper doesn’t remember, so he goes to the back store, opens a register, searches for the tea price, comes back, and tells the customer.

Another customer comes later and asks the same question. Again, the shopkeeper forgets, goes back, checks the register, and returns with the answer.

Now multiply that by 10,000 users. The shopkeeper can’t keep checking the register every time.

So what does he do?
```
He puts up a board in front:
“Tea price = ₹20”
```
Now whenever someone asks, he simply points at the board.

That board is basically Redis.

**Redis is not just about making things faster, but this is the simplest summary:**
- Frequently requested data is kept ready in memory
- Access becomes very fast

That’s why Redis is often called an in-memory database/store.

**Technically, “in-memory” means data is stored in RAM, which is much faster than reading from disk. Redis mainly serves data from memory, which makes it lightning fast.**

**Some people argue Redis is not purely in-memory because it also supports persistence — meaning after restart it can reload data from files back into memory. That’s true.**

**Some people call Redis:**
- an in-memory store
- a hash map store
- a database

All are acceptable depending on context.

**Then the speaker explains the typical architecture:**
1. User → Backend Application
2. Backend checks Redis first
3. If data exists in Redis → fast response
4. If not → query database (MongoDB/Postgres/MySQL)
5. Then store hot/frequently accessed data into Redis for future requests

<img src="imgs/redis_cache_architechture.png" width="100%" />

**Important point:** Redis is NOT a replacement for the database.

The database remains the “source of truth.”

**Redis mainly reduces:**
- read pressure
- repeated expensive queries

## Common Redis use cases
<img src="imgs/redis_redis_use_cases.png" width="100%" />
**1. Caching**

Store frequently accessed data like product lists, menus, etc.

Example:  
Swiggy or Zomato menus are probably served from cache rather than querying databases every time.

**2. Session Store**

Store user login/session data in Redis so all backend servers can quickly verify sessions.

**3. OTP Storage**

OTPs expire quickly, so storing them in Redis with TTL (time to live) is ideal.

Example:
```
OTP = 434343
TTL = 3 minutes
```
After expiration, Redis auto-removes it.

**4. Rate Limiting**

Prevent spam login attempts or OTP abuse.

Example:
- Track request counts by IP/user
- Block temporarily after too many attempts

**5. Job Queues / Background Workers**

Use Redis queues for:
- emails
- notifications
- report generation

Workers pull tasks from queues and process them asynchronously.

Then the speaker explains Redis key-value structure:

Examples:
```
product:all
otp:9876543210
session:user123
```

Values may contain:
```
arrays
JSON
objects
user data
```

And then comes the important Redis feature:

**TTL (Time To Live)**

TTL defines how long data remains valid.

Example:
- OTP valid for 90 seconds
- After that it becomes invalid or auto-deleted

## Redis is NOT a solution for every problem

Don’t blindly use Redis everywhere.

Use Redis only if your problem matches scenarios like:
- reducing read pressure
- temporary expiring data
- shared counters
- rate limiting
- background jobs
- caching hot data

Then the speaker briefly mentions Redis alternatives:
- KeyDB
- DragonflyDB
- Valkey
- Upstash

Most advertise themselves as “drop-in replacements” for Redis.

The series goal is:
- remove fear of Redis
- teach Redis deeply
- do practical coding
- help developers become more advanced backend engineers




