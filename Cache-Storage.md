# Real Enterprise Architecture
<img src="imgs/Webstorage-cache-Redis.png" width="100%" />

```
┌───────────────────────────────────────────────────────────┐
│                       USER BROWSER                        │
└───────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼

┌───────────────────────────────────────────────────────────┐
│                    BROWSER STORAGE                        │
├───────────────────────────────────────────────────────────┤
│ Cookies                                                   │
│  • Session ID                                             │
│  • Refresh Token (HttpOnly)                               │
│  • CSRF Token                                              │
│                                                           │
│ LocalStorage                                              │
│  • Theme                                                  │
│  • Language                                               │
│  • Wishlist                                               │
│  • Recently Viewed Products                               │
│                                                           │
│ SessionStorage                                            │
│  • Checkout Step                                          │
│  • Search Filters                                         │
│  • Multi-step Form Data                                   │
│                                                           │
│ Memory (Angular Service / State)                          │
│  • Access Token                                           │
│  • User Context                                           │
│  • Current Session Data                                   │
└───────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼

┌───────────────────────────────────────────────────────────┐
│                     BROWSER CACHE                         │
├───────────────────────────────────────────────────────────┤
│ main.js                                                   │
│ styles.css                                                │
│ vendor.js                                                 │
│ fonts                                                     │
│ product images                                            │
│ videos                                                    │
└───────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼

┌───────────────────────────────────────────────────────────┐
│                      CDN / EDGE                           │
├───────────────────────────────────────────────────────────┤
│ CloudFront / Akamai / Cloudflare                          │
│                                                           │
│ Cached Assets                                             │
│  • Product Images                                         │
│  • Videos                                                 │
│  • JS Bundles                                             │
│  • CSS Files                                              │
└───────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼

┌───────────────────────────────────────────────────────────┐
│               API GATEWAY / LOAD BALANCER                │
└───────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │ Order Service│  │Product Service│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼

┌───────────────────────────────────────────────────────────┐
│                         REDIS                             │
├───────────────────────────────────────────────────────────┤
│ Authentication                                            │
│  • Session Store                                          │
│  • Refresh Tokens                                         │
│                                                           │
│ Application Cache                                         │
│  • Product Details                                        │
│  • User Profiles                                          │
│  • API Responses                                          │
│                                                           │
│ Real-Time                                                 │
│  • Pub/Sub                                                │
│  • Socket.IO Events                                       │
│                                                           │
│ Analytics                                                 │
│  • Page View Counters                                     │
│  • Trending Products                                      │
│                                                           │
│ Performance                                               │
│  • Rate Limiting                                          │
│  • Distributed Locks                                      │
│  • Job Queues                                              │
└───────────────────────────────────────────────────────────┘
                         │
                         ▼

┌───────────────────────────────────────────────────────────┐
│                    PRIMARY DATABASE                       │
├───────────────────────────────────────────────────────────┤
│ Users                                                     │
│ Orders                                                    │
│ Products                                                  │
│ Payments                                                  │
│ Inventory                                                 │
└───────────────────────────────────────────────────────────┘

                         │
                         ▼

┌───────────────────────────────────────────────────────────┐
│                  OBJECT STORAGE (S3)                      │
├───────────────────────────────────────────────────────────┤
│ Product Images                                            │
│ User Uploads                                              │
│ Videos                                                    │
│ Documents                                                 │
└───────────────────────────────────────────────────────────┘
```

**Where each data should live**
| Data            | Browser Memory | SessionStorage | LocalStorage | Cookie   | Redis    | DB       | CDN |
| --------------- | -------------- | -------------- | ------------ | -------- | -------- | -------- | --- |
| Access Token    | ✅              | ⚠️             | ❌            | ⚠️       | ❌        | ❌        | ❌   |
| Refresh Token   | ❌              | ❌              | ❌            | ✅        | ✅        | ✅        | ❌   |
| Session ID      | ❌              | ❌              | ❌            | ✅        | ✅        | ❌        | ❌   |
| Theme           | ❌              | ❌              | ✅            | ❌        | ❌        | ❌        | ❌   |
| Language        | ❌              | ❌              | ✅            | Optional | ❌        | ❌        | ❌   |
| Checkout Step   | ❌              | ✅              | ❌            | ❌        | ❌        | ❌        | ❌   |
| Wishlist        | ❌              | ❌              | ✅            | ❌        | Optional | ✅        | ❌   |
| Shopping Cart   | ❌              | ❌              | Optional     | ❌        | ✅        | ✅        | ❌   |
| Product Details | ❌              | ❌              | ❌            | ❌        | ✅        | ✅        | ❌   |
| Page Views      | ❌              | ❌              | ❌            | ❌        | ✅        | Optional | ❌   |
| Static JS/CSS   | ❌              | ❌              | ❌            | ❌        | ❌        | ❌        | ✅   |
| Product Images  | ❌              | ❌              | ❌            | ❌        | ❌        | S3       | ✅   |
| Videos          | ❌              | ❌              | ❌            | ❌        | ❌        | S3       | ✅   |

# Angular + Redis + E-commerce Interview Summary
```
Access Token      → Memory
Refresh Token     → HttpOnly Cookie + Redis
Session ID        → Cookie + Redis
Theme             → LocalStorage
Checkout State    → SessionStorage
Shopping Cart     → Redis + DB
Page Views        → Redis Counter
Product Data      → Redis Cache + DB
Images/Videos     → S3 + CDN + Browser Cache
Static Files      → CDN + Browser Cache
```

# Browser Storage, Browser Cache & Redis Cache — Architecture Diagram
```
┌───────────────────────────────────────────────────────────────┐
│                         USER BROWSER                          │
└───────────────────────────────────────────────────────────────┘

 ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
 │  localStorage   │   │ sessionStorage  │   │     Cookies     │
 ├─────────────────┤   ├─────────────────┤   ├─────────────────┤
 │ Theme           │   │ Checkout Step   │   │ Session ID      │
 │ Language        │   │ Form Wizard     │   │ Refresh Token   │
 │ Wishlist        │   │ Search Filters  │   │ CSRF Token      │
 │ Recent Products │   │ Temp UI State   │   │ User Preference │
 └─────────────────┘   └─────────────────┘   └─────────────────┘
          │                      │                     │
          │                      │                     │
          └──────────────┬───────┘                     │
                         │                             │
                         ▼                             ▼
               ┌───────────────────┐       ┌───────────────────┐
               │ Angular / React   │       │ Sent Automatically│
               │ Application       │       │ With Every Request│
               └───────────────────┘       └───────────────────┘
                         │                             │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
┌───────────────────────────────────────────────────────────────┐
│                      Browser Memory                           │
├───────────────────────────────────────────────────────────────┤
│ Access Token (JWT)                                            │
│ User Context                                                  │
│ Runtime Application State                                     │
└───────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════

                 STATIC ASSET CACHING FLOW

┌──────────┐
│ Browser  │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────┐
│         Browser Cache               │
├─────────────────────────────────────┤
│ main.js                             │
│ styles.css                          │
│ logo.png                            │
│ product-image.jpg                   │
│ intro-video.mp4                     │
│ fonts                               │
└─────────────────────────────────────┘
     ▲
     │ Cache-Control:max-age
     │
┌────┴─────┐
│   CDN    │
└────┬─────┘
     │
     ▼
┌──────────┐
│ S3/Blob  │
│ Storage  │
└──────────┘


═══════════════════════════════════════════════════════════════════

                 AUTHENTICATION FLOW

┌──────────┐
│ Browser  │
└────┬─────┘
     │
     │ Cookie(SessionId / RefreshToken)
     ▼
┌──────────┐
│ Backend  │
└────┬─────┘
     │
     ▼
┌──────────────────────┐
│        Redis         │
├──────────────────────┤
│ Session Data         │
│ Refresh Tokens       │
│ User State           │
└──────────────────────┘


═══════════════════════════════════════════════════════════════════

                 PAGE VIEW COUNT FLOW

 User Opens Product Page
            │
            ▼
      ┌──────────┐
      │ Backend  │
      └────┬─────┘
           │
           ▼
      ┌──────────┐
      │  Redis   │
      ├──────────┤
      │ INCR     │
      │ product  │
      │ views    │
      └──────────┘


═══════════════════════════════════════════════════════════════════

                 E-COMMERCE APPLICATION

                        USER
                          │
                          ▼

┌───────────────────────────────────────────────────────────────┐
│                         BROWSER                               │
├───────────────────────────────────────────────────────────────┤
│ localStorage                                                  │
│   ├─ Theme                                                    │
│   ├─ Wishlist                                                 │
│   └─ Language                                                 │
│                                                               │
│ sessionStorage                                                │
│   ├─ Checkout Step                                            │
│   └─ Search Filters                                           │
│                                                               │
│ Cookies                                                       │
│   ├─ Session ID                                               │
│   └─ Refresh Token                                            │
│                                                               │
│ Memory                                                        │
│   └─ Access Token                                             │
│                                                               │
│ Browser Cache                                                 │
│   ├─ JS Bundles                                               │
│   ├─ CSS                                                      │
│   ├─ Product Images                                           │
│   └─ Videos                                                   │
└───────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────┐
│                         BACKEND                               │
└───────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴────────────────┐
          ▼                                ▼

┌──────────────────┐            ┌──────────────────┐
│      Redis       │            │     Database     │
├──────────────────┤            ├──────────────────┤
│ Sessions         │            │ Users            │
│ Refresh Tokens   │            │ Orders           │
│ Shopping Cart    │            │ Products         │
│ API Cache        │            │ Payments         │
│ Page Views       │            │ Inventory        │
│ Rate Limiting    │            │ Analytics        │
└──────────────────┘            └──────────────────┘

                          │
                          ▼

                   ┌─────────────┐
                   │ CDN + S3    │
                   ├─────────────┤
                   │ Images      │
                   │ Videos      │
                   │ Documents   │
                   └─────────────┘
```

# Interview Summary
```
localStorage   → Persistent client data (Theme, Language, Wishlist, Recently Viewed Products)
sessionStorage → Temporary tab data (Wizard Forms, Checkout Steps, Search Filters)
Cookies        → Store server-related information (Session ID, Refresh Token, Authentication Cookies, CSRF Token)
Memory         → Access token (JWT)
Browser Cache  → JS Files, CSS Files, Images, Videos, Fonts
Redis          → Sessions, Page Views, Shopping Cart, API Responses, Rate Limiting
CDN            → Product images & videos
```

# localStorage, sessionStorage, and cookies
| Feature                      | localStorage     | sessionStorage     | Cookies                       |
| ---------------------------- | ---------------- | ------------------ | ----------------------------- |
| Storage Size                 | ~5-10 MB         | ~5-10 MB           | ~4 KB                         |
| Sent to Server Automatically | ❌ No             | ❌ No               | ✅ Yes                         |
| Survives Browser Restart     | ✅ Yes            | ❌ No               | Depends on expiry             |
| Shared Across Tabs           | ✅ Yes            | ❌ No               |                               |
| Accessible via JS            | ✅ Yes            | ✅ Yes              | Usually Yes (unless HttpOnly) |
| Best For                     | User preferences | Temporary tab data | Authentication                |

## 1. localStorage

**Persistent storage that remains even after the browser is closed.**
```
localStorage.setItem('theme', 'dark');
```

**Typical Use Cases**    
**User Preferences**
```
Theme = Dark
Language = English
Sidebar = Collapsed
```
**Recently Viewed Products**
```
Product 1001
Product 1002
Product 1003
```
**Offline Data**
```
Draft Form
Unsaved Notes
```
**E-commerce Example**
```
{
  "wishlist": [101,102,103]
}
```
**Not Recommended For**
- Access Token
- Refresh Token
- Session Token
- Password

Because JavaScript can read it:
```
localStorage.getItem('token');
```
making it vulnerable to XSS attacks.

## 2. sessionStorage

**Data survives only for the current browser tab.**
```
sessionStorage.setItem('step', '2');
```
**When the tab closes:**
```
Data Deleted
```
**Typical Use Cases**  
**Multi-Step Forms**
```
Step 1 Completed
Step 2 Completed
```
**Temporary Search Filters**
```
Category = Electronics
Price = 1000
```
**Checkout Progress**
```
Cart
↓
Shipping
↓
Payment
```
**Example**
```
{
  "checkoutStep": 3
}
```
**Why Not localStorage?** If the user closes the tab and returns next week, the checkout state may no longer be valid.

## 3. Cookies
**Small pieces of data automatically sent with every HTTP request.**
```
Cookie:
sessionId=abc123
```
**Typical Use Cases**  
**Authentication**
```
Session ID
Refresh Token
CSRF Token
```
**User Tracking**
```
Google Analytics
Facebook Pixel
```
**User Preferences (Server Needs Them)**
```
Language=en
Currency=INR
```

# Why Cookies for Authentication?

When a user logs in:
```
Browser
   |
   v
Cookie(sessionId)
   |
   v
Backend
```
Every request automatically includes:
```
Cookie: sessionId=abc123
```
The backend can identify the user without frontend code attaching tokens manually.


