# Redis Use Case

Almost everyone uses WhatsApp.   
Whenever you open someone's profile, you can usually see whether that user is online or offline (unless they have hidden their online status).  
Now imagine you have to build a system that simply answers one question:
```
"Is this user online or not?"
```
How would you build it?  
This is where Redis becomes extremely useful.

---------------------------------------

## Step 1: Traditional Login Process

Suppose we have:
```
Client
Server
Database
```
When a user logs in:
1. User sends username and password.
2. Server checks them against the database.
3. If correct, login is successful.

Now imagine the user wants to read a chat.

Should the user send the username and password every single time?

No.

That would be inefficient.

---------------------------------------

## Step 2: Session ID

Instead, after the first successful login:

The server creates a unique Session ID.

Example:
```
SessionID12345
        ↓
   Rohit Negi
```
The database stores:
```
SessionID12345 → Rohit Negi
```
Now, every future request only contains:
- Session ID
- Username

The password is no longer required.

---------------------------------------

## Problem with Database Lookup

Every request still needs to:
1. Go to the database.
2. Search the Session ID.
3. Verify it.

This increases database load.

Searching in a traditional database is slower compared to memory access.

---------------------------------------

## Step 3: Store Session in Server Memory

Instead of storing sessions only in the database:
```
Server RAM

SessionID123
      ↓
 Rohit Negi
```
The server can immediately verify the session without querying the database.

Much faster.

---------------------------------------

## Problem in Distributed Systems

Real-world applications don't have just one server.

They may have:
```
         Load Balancer
         /    |     \
      S1     S2     S3
```
Suppose:
- User logs in through Server 1.
- Session is stored in Server 1's RAM.

Next request:

Load Balancer sends the request to Server 2.

Server 2 has no idea about that session.

Authentication fails.

---------------------------------------

## Redis Solves This Problem

Instead of storing sessions inside each server:
```
          Redis
      SessionID → User

      ↑      ↑      ↑
    S1      S2      S3
```
Every server connects to the same Redis instance.

Whenever a request comes:
1. Check Redis.
2. Session exists?
3. Authenticate instantly.

No matter which server handles the request.

---------------------------------------

## Why Redis Is Fast

Redis is an in-memory database.

Instead of storing data on disk:
```
Disk
↓

RAM
```
Everything stays in RAM.

RAM access is thousands of times faster than disk access.

Redis internally behaves like a huge HashMap.

Operations such as:
- Insert
- Delete
- Search

are approximately O(1).

---------------------------------------

## Redis Stores Key–Value Pairs

Example:
```
Key              Value

Session123  →  Rohit

Online:Rohit → Yes

TokenXYZ     → Blocked
```
Keys must be unique.

Values can be:
- Strings
- Objects
- Sets
- Lists
- Hashes
- Many other Redis data types

---------------------------------------

## Redis Use Case 1: Session Storage

Store:
```
SessionID → User
```
Every server can validate the session instantly.

---------------------------------------

## Redis Use Case 2: JWT Blacklist

Suppose:

JWT expires after 30 minutes.

User logs out after only 10 minutes.

The JWT is still technically valid for another 20 minutes.

To invalidate it immediately:

Store it in Redis.

Example:
```
BlockedTokens

JWT123 → Blocked
TTL = 20 minutes
```
Whenever a request comes:
1. Check Redis.
2. Token exists?
3. Reject it.

Redis automatically deletes it after 20 minutes using TTL.

---------------------------------------

## Redis Use Case 3: Online Users

Suppose WhatsApp wants to know:
```
Is Rohit online?
```
Redis stores:
```
Rohit → Yes
Anjali → Yes
Mohan → Yes
```
Each entry gets a TTL of one minute.

Every 30 seconds, the client sends a heartbeat:
```
"I'm still online."
```
Redis refreshes the TTL.

If no heartbeat arrives:

TTL expires.

Redis automatically removes the entry.

Result:
```
User no longer exists

↓

Offline
```
No manual cleanup is needed.

---------------------------------------

## Redis Use Case 4: Caching

Imagine:

Virat Kohli uploads a new photo.

One lakh (100,000) users open it simultaneously.

Without Redis:

Every request hits the main database.

Database load becomes huge.

Instead:
```
Main Database
      ↓
   Redis Cache
```
Requests first check Redis.

If found:

Serve directly from cache.

The database is protected from heavy traffic.

---------------------------------------

## Redis Use Case 5: Like Counter

Suppose:

100,000 users like a photo in 10 seconds.

Instead of updating the database 100,000 times:

Redis stores:
```
Likes = 100000
```
The counter increases in memory.

Every few minutes:
```
Database += Redis Counter
```
This dramatically reduces database writes.

---------------------------------------

## Redis Persistence

Although Redis is primarily an in-memory database, it also supports persistence.

Two common approaches are:
- Periodic snapshots (RDB) – Save the entire dataset to disk at regular intervals.
- Append Only File (AOF) – Log every write operation so data can be reconstructed after a restart.

Each approach has its own trade-offs between performance and durability.

---------------------------------------

## When Should You Use Redis?

Use Redis for temporary and frequently accessed data, such as:
- Session management
- Login state
- JWT blacklist
- Online/offline status
- Caching
- Rate limiting
- Leaderboards
- Counters
- Frequently accessed user profiles

Do not use Redis as the primary storage for permanent business data.

Permanent data should remain in your main database (such as MySQL, PostgreSQL, or MongoDB).

---------------------------------------

## Key Takeaways
- Redis is an in-memory key-value database.
- It stores data in RAM, making it extremely fast.
- Most operations are approximately O(1).
- It reduces load on the primary database.
- It is ideal for caching and temporary data.
- Common use cases include:
  - Session storage
  - JWT token blacklist
  - Online user tracking
  - Cache
  - Like/view counters
  - Rate limiting
  - Real-time applications (e.g., WhatsApp, Instagram, gaming)

In short, Redis acts as a high-speed memory layer between your application servers and the main database, enabling real-time performance and reducing database load.








