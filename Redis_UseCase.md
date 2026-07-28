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

Step 1: Traditional Login Process

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





