# realtime-messenger
A scalable real-time chat system built to deliver instant messaging using persistent connections, supporting low-latency communication, message delivery, and user presence.

backend
 ├── src
 │   ├── config
 │   │    └── db.ts
 │   ├── models
 │   │    ├── User.ts
 │   │    ├── ChatRoom.ts
 │   │    └── Message.ts
 │   ├── controllers
 │   │    ├── authController.ts
 │   │    ├── roomController.ts
 │   │    └── messageController.ts
 │   ├── routes
 │   │    ├── authRoutes.ts
 │   │    ├── roomRoutes.ts
 │   │    └── messageRoutes.ts
 │   ├── middleware
 │   │    └── authMiddleware.ts
 │   ├── sockets
 │   │    └── chatSocket.ts
 │   ├── utils
 │   │    └── logger.ts
 │   ├── app.ts
 │   └── server.ts
 ├── .env
 └── tsconfig.json