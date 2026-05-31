# Cache Issues
The 4 major cache problems commonly discussed in distributed systems, Redis, and high-traffic applications are:
```
                    CACHE PROBLEMS
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
     ▼                     ▼                     ▼
1. Cache             2. Cache            3. Cache
   Penetration          Breakdown           Avalanche
                                                │
                                                ▼
                                        4. Thundering Herd
```

## 1. Cache Penetration
**Problem**

Requests are made for data that does not exist in either Cache or DB.
```
Request
   │
   ▼
Cache (MISS)
   │
   ▼
Database (No Record)
```

**Impact**
- Unnecessary DB queries
- Increased DB load
- Possible malicious attacks

**Solutions**   
✅ Bloom Filter 
✅ Cache Null Values    
✅ Request Validation   

## 2. Cache Breakdown (Hot Key Expiry)
**Problem**

A single hot key expires.
```
Millions of Requests
         │
         ▼
   Hot Key Expired
         │
         ▼
        DB
```

**Impact**
- Sudden DB spike
- Increased latency
- Possible DB overload

**Solutions**   
✅ Mutex Lock (Single Flight)   
✅ Logical Expiration   
✅ Background Refresh   
✅ Never Expire Hot Keys    

## 3. Cache Avalanche
**Problem**

Thousands of cache keys expire simultaneously.
```
Key1 Expired
Key2 Expired
Key3 Expired
Key4 Expired
      │
      ▼
 Massive Requests
      │
      ▼
       DB
```

**Impact**
- Massive DB storm
- Service slowdown
- System outage

**Solutions**   
✅ Random TTL (Jitter)  
✅ Cache Prewarming     
✅ Multi-Level Cache    
✅ Rate Limiting    

## 4. Thundering Herd
**Problem**

Many clients try to rebuild the same cache entry simultaneously.
```
1000 Requests
      │
      ▼
Cache Miss
      │
      ▼
1000 DB Queries
      │
      ▼
1000 Cache Writes
```

**Impact**
- Duplicate DB work
- Resource waste
- Higher latency

**Solutions**   
✅ Mutex Lock / SingleFlight    
✅ Request Coalescing   
✅ Stale-While-Revalidate (SWR) 
✅ Background Refresh   

## Quick Comparison
| Issue             | Cause                    | DB Impact          | Solution                 |
| ----------------- | ------------------------ | ------------------ | ------------------------ |
| Cache Penetration | Invalid/Non-existent key | Continuous DB hits | Bloom Filter, Null Cache |
| Cache Breakdown   | One hot key expired      | Sudden spike       | Mutex Lock, Logical TTL  |
| Cache Avalanche   | Many keys expired        | Massive DB storm   | Random TTL, Prewarm      |
| Thundering Herd   | Concurrent cache rebuild | Duplicate DB work  | SingleFlight, SWR        |

## Easy Memory Trick
```
Penetration  → Bad Key
Breakdown    → One Hot Key
Avalanche    → Many Keys
Thundering   → Many Requests
```