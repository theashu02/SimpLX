# SimpL-Social: System Design for Real-Time Features & Image Handling

Checkout the ``socketonline`` branch for the latest version of the project:
```bash
   https://github.com/theashu02/SimpL-Social
```
```bash
   https://github.com/theashu02/SimpL-Social.git
```
To start the backend server:

```bash
npm install
npm run dev
```

This will typically start the frontend server on:

```bash
cd frontend
npm install
npm run dev
```

This will typically start the backend server on `http://localhost:5000` (or the port specified in your `.env` file).

## Project Structure

```
SimpL/
├── backend/         # Backend Node.js application
│   ├── controllers/   # Request handlers
│   ├── db/            # Database connection logic
│   ├── lib/           # Utility functions
│   ├── middleware/    # Express middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── server.js      # Main backend server file
│   └── socket/        # Socket.io setup
├── frontend/        # Frontend React application
│   ├── public/        # Static assets
│   ├── src/           # Frontend source code
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Main application component
│   │   ├── main.jsx     # Entry point for React app
│   │   └── index.css    # Global styles
│   ├── package.json   # Frontend dependencies and scripts
│   └── ...
├── .gitignore
├── Dockerfile
├── README.md        # This file
└── package.json     # Root package.json (if any, for monorepo tools like Lerna/Nx)
```

Make sure both the frontend and backend servers are running concurrently for the application to function correctly.

This document outlines the system design for real-time features (notifications, live updates) and image handling within the SimpL-Social application.

## 1. Core Technologies

*   **Frontend:** React, React Query (for server state management), Socket.IO Client, Tailwind CSS.
*   **Backend:** Node.js, Express.js, MongoDB (with Mongoose), Socket.IO, Cloudinary (for image hosting).
*   **Communication:** REST APIs for standard CRUD operations, WebSockets (via Socket.IO) for real-time bidirectional communication.

## 2. System Components

### 2.1. Frontend Components

*   **`App.jsx`**: Main application component.
    *   Manages global state related to socket events via `SocketContext`.
    *   Handles updates to React Query cache based on socket events, triggering UI re-renders.
    *   Displays toast notifications.
*   **`SocketContext.jsx`**:
    *   Establishes and maintains the WebSocket connection to the backend.
    *   Listens for various socket events emitted by the backend (`newNotification`, `postCommentUpdate`, `postLikeUpdate`, `postDeleted`, `newPostCreated`, `userProfileUpdate`, `getOnlineUsers`).
    *   Manages and provides real-time state (e.g., `latestNotification`, `updatedPostFromSocket`, `onlineUsers`) to consumer components.
*   **UI Components (e.g., `Post.jsx`, `Posts.jsx`, `NotificationPage.jsx`, `ProfilePage.jsx`, `Sidebar.jsx`, `RightPanel.jsx`):**
    *   Render data fetched via React Query.
    *   Trigger mutations (e.g., like post, create comment, follow user) that make API calls.
    *   Reactively update when React Query cache is modified by `App.jsx` due to socket events or local mutations.
    *   `RightPanel.jsx` specifically consumes `onlineUsers` from `SocketContext` to display the count.

### 2.2. Backend Components

*   **`server.js`**: Main Express server entry point.
    *   Initializes the HTTP server and the primary Socket.IO server instance.
    *   Sets up CORS, middleware, and API routes.
    *   Delegates Socket.IO connection handling to `socket/socket.js`.
*   **`socket/socket.js`**:
    *   Manages detailed Socket.IO connection logic.
    *   Maintains a `userSocketMap` (`{ userId: socketId }`) to track connected users and their socket IDs.
    *   Handles user registration on socket connection (`registerUser` event) to populate `userSocketMap`.
    *   On user connection/registration and disconnection, emits `getOnlineUsers` event to all clients with the list of currently connected user IDs.
    *   Exports the main `io` instance for controllers to use.
*   **API Routes (`routes/*.route.js`):** Define API endpoints for various resources (auth, users, posts, notifications).
*   **Controllers (`controllers/*.controller.js`):**
    *   Handle business logic for API requests.
    *   Interact with Mongoose models for database operations.
    *   After successful database operations that require real-time updates (e.g., new like, new comment, new post, follow, delete post), they use the imported `io` instance from `socket/socket.js` to emit relevant events to connected clients (either to specific users or globally).
    *   **Image Upload:** Controllers (e.g., `post.controller.js`, `user.controller.js`) handle image uploads by:
        *   Receiving base64 encoded image strings from the client.
        *   Using the Cloudinary SDK (`cloudinary.uploader.upload()`) to upload the image to Cloudinary.
        *   Storing the `secure_url` (public URL) returned by Cloudinary in the respective MongoDB document (e.g., `Post.img`, `User.profileImg`, `User.coverImg`).
        *   When updating images, they also handle deleting the old image from Cloudinary using `cloudinary.uploader.destroy()` and the image's public ID (extracted from the URL).
*   **Models (`models/*.model.js`):** Define Mongoose schemas for database collections (User, Post, Notification).
    *   `Notification.model.js` includes an `enum` for `type` (e.g., "follow", "like", "comment") and an optional `postId`.

## 3. Flow of Execution (Real-Time Features)

### 3.1. WebSocket Communication & Online User Meter

1.  **Connection:**
    *   Frontend (`SocketContext.jsx`) establishes a WebSocket connection with the backend Socket.IO server when `SocketContextProvider` mounts.
2.  **User Registration on Socket:**
    *   Once the frontend's `App.jsx` fetches `authUser` data, it emits a `"registerUser"` event via the socket to the backend, sending `authUser._id`.
    *   Backend (`socket/socket.js`) receives `"registerUser"`, maps `userId` to `socket.id` in `userSocketMap`.
    *   Backend emits `"getOnlineUsers"` to all clients with `Object.keys(userSocketMap)`.
3.  **Online User Meter (`RightPanel.jsx`):**
    *   `SocketContext.jsx` receives `"getOnlineUsers"` and updates its `onlineUsers` state (an array of user IDs).
    *   `RightPanel.jsx` consumes `onlineUsers` from `SocketContext` and displays `onlineUsers.length`.
4.  **Disconnection:**
    *   When a user disconnects, the backend `socket/socket.js` `disconnect` handler removes the user from `userSocketMap` and emits an updated `"getOnlineUsers"` list to all remaining clients.

### 3.2. Example Flow: Liking a Post

1.  **User Action (Frontend):** User clicks the "like" button on a post in `Post.jsx`.
2.  **API Call & Mutation:**
    *   `Post.jsx` triggers the `likePost` mutation.
    *   An API request (`POST /api/posts/like/:postId`) is sent to the backend.
3.  **Backend Processing (`post.controller.js` - `likeUnlikePost`):**
    *   Post's `likes` array and User's `likedPosts` array are updated in MongoDB.
    *   If it's a "like" (not an "unlike") and not the user's own post:
        *   A `Notification` document is created (`type: "like"`).
        *   `newNotification` event is emitted via socket to the post owner (if online) with populated notification data.
    *   The post is re-fetched from MongoDB and populated.
    *   `postLikeUpdate` event is emitted via socket to *all connected clients* with the fully updated and populated post data.
    *   HTTP response with the updated post data is sent back to the originating client.
4.  **Frontend Update (Originating Client - via HTTP response):**
    *   The `likePost` mutation's `onSuccess` handler in `Post.jsx` receives the updated post.
    *   It updates the React Query cache for `["posts"]` using `queryClient.setQueryData()`, specifically replacing the old post data with the new data. This triggers a re-render of the `Post` component with the updated like status/count.
5.  **Frontend Update (Post Owner - via `newNotification` socket event):**
    *   `SocketContext.jsx` receives `"newNotification"`, updates `latestNotification` and `unreadNotificationCount`.
    *   `App.jsx` `useEffect` for `latestNotification`:
        *   Shows a toast: "`Someone liked your post`".
        *   Invalidates `["notifications"]` query (for `NotificationPage.jsx`).
        *   Sidebar notification badge updates due to `unreadNotificationCount`.
6.  **Frontend Update (All Other Clients - via `postLikeUpdate` socket event):**
    *   `SocketContext.jsx` receives `"postLikeUpdate"`, updates `updatedPostFromSocket`.
    *   `App.jsx` `useEffect` for `updatedPostFromSocket`:
        *   Updates the React Query cache for `["posts"]` by replacing the specific post.
        *   Any component displaying this post (e.g., in a feed) re-renders with the updated like count/status.

### 3.3. Other Real-Time Flows (Similar Pattern)

*   **Commenting:** `commentOnPost` controller -> emits `newNotification` (to post owner) and `postCommentUpdate` (to all). Frontend updates via `SocketContext` and `App.jsx` cache updates.
*   **Following:** `followUnfollowUser` controller -> emits `newNotification` (to followed user) and `userProfileUpdate` (to all). Frontend updates user profiles and authUser in cache.
*   **Post Deletion:** `deletePost` controller -> emits `postDeleted` (to all) with `postId`. Frontend filters post from `["posts"]` cache.
*   **New Post Creation:** `createPost` controller -> emits `newPostCreated` (to all) with the new populated post. Frontend prepends new post to `["posts"]` cache.

## 4. Image Handling (Cloudinary)

1.  **Upload Trigger (Frontend):**
    *   User selects an image file (e.g., for profile picture, cover image, or post image) using an `<input type="file">`.
    *   `onChange` handler (`handleImgChange` in `ProfilePage.jsx` or similar logic in post creation):
        *   Uses `FileReader.readAsDataURL()` to get a base64 representation of the image for preview.
        *   The base64 string is sent to the backend as part of the update/create request (e.g., in `updateProfile` or `createPost`).
2.  **Backend Processing (Controller):**
    *   The controller receives the base64 image string.
    *   It calls `cloudinary.uploader.upload(base64ImageString, options)`.
    *   Cloudinary uploads the image, optimizes it, and returns a response including a `secure_url`.
3.  **Database Storage:**
    *   The `secure_url` (and `public_id` if needed for deletion without URL transformation) is stored in the relevant MongoDB document (e.g., `User.profileImg`, `Post.img`).
4.  **Image Deletion (Backend):**
    *   When a post with an image is deleted, or a user updates their profile/cover image:
        *   The `public_id` of the image is extracted from the stored Cloudinary URL (usually the last part of the path before the version and extension, e.g., `folder/image_id`).
        *   `cloudinary.uploader.destroy(public_id)` is called to remove the image from Cloudinary storage.

## 5. Scalability Considerations

*   **Socket.IO:**
    *   **Vertical Scaling:** A single Node.js/Socket.IO server can handle a significant number of concurrent connections (thousands to tens of thousands) depending on server resources and message frequency/size.
    *   **Horizontal Scaling:** For very large numbers of concurrent users, multiple Socket.IO server instances are needed. This requires:
        *   **Sticky Sessions:** A load balancer configured to ensure a client always connects to the same server instance they initiated the WebSocket handshake with.
        *   **Adapter:** A Socket.IO adapter (e.g., `socket.io-redis`, `socket.io-mongo`) to broadcast events across all instances. When one server emits an event, the adapter ensures it reaches clients connected to other server instances. The current design does **not** include this and would need it for horizontal scaling. `userSocketMap` would also need to be managed by this shared adapter store (e.g., Redis).
*   **Database (MongoDB):**
    *   Proper indexing is crucial for query performance (e.g., on `_id`, `username`, `user` in posts, `from`/`to` in notifications).
    *   Replica sets for high availability and read scaling.
    *   Sharding for write scaling and distributing large datasets (more complex, for very large scale).
*   **API & Application Servers (Node.js/Express):**
    *   Can be scaled horizontally behind a load balancer.
    *   Stateless design of API requests (apart from session/cookie management) facilitates this.
*   **Cloudinary:** Handles image scaling, optimization, and delivery (CDN) automatically.

## 6. Performance Optimizations

*   **Frontend:**
    *   **React Query:** Efficiently manages server state, caching, and background updates, reducing redundant API calls.
    *   **Socket.IO Cache Updates:** Instead of invalidating entire lists (like `["posts"]`) and forcing a full refetch on every minor update, `queryClient.setQueryData` is used to make targeted, optimistic updates to the cache. This significantly improves UI responsiveness.
    *   **Memoization:** Use `React.memo`, `useMemo`, `useCallback` where appropriate to prevent unnecessary re-renders of components.
    *   **Code Splitting:** For larger applications, split code by routes/features to reduce initial bundle size.
    *   **Virtualization:** For very long lists (e.g., infinite scroll feeds), use virtualization libraries (like `react-virtualized` or `react-window`) to render only visible items.
*   **Backend:**
    *   **Database Indexing:** As mentioned in scalability.
    *   **Efficient Queries:** Use Mongoose's `populate` selectively and only fetch necessary fields (`select: "-password"`).
    *   **Payload Size:** Keep socket event payloads and API responses as lean as possible, containing only necessary data.
    *   **Asynchronous Operations:** Node.js is inherently non-blocking, but ensure all I/O operations (DB, Cloudinary) are properly `async/await` to avoid blocking the event loop.
*   **Image Handling:**
    *   Cloudinary automatically performs image optimization (compression, format selection).
    *   Frontend can request appropriately sized images from Cloudinary using transformation URLs if very specific dimensions are needed for different views, reducing downloaded bytes.

## 7. Limitations of the Current Design

*   **Socket.IO Scalability:** The current single-server Socket.IO setup will not scale horizontally without implementing an adapter (e.g., Redis) and sticky sessions. The `userSocketMap` is local to the single server instance.
*   **Generic `["userProfile"]` Query Key:** As discussed, `ProfilePage.jsx` uses `queryKey: ["userProfile"]`. For robust real-time updates and correct caching when viewing multiple user profiles, this should be changed to a dynamic key like `["userProfile", username]`. The current `App.jsx` logic for `userProfileUpdate` has a fallback for this generic key but it's not ideal.
*   **No "typing..." indicator:** For chat-like features (if added later), a "typing..." indicator would require more specific socket events.
*   **Global Socket Emits for Post Updates:** Events like `postCommentUpdate`, `postLikeUpdate`, `newPostCreated` are currently emitted globally (`io.emit(...)`). For very high-traffic sites, this could be inefficient. A more advanced solution might involve "rooms" where clients subscribe only to updates for posts they are currently viewing or interested in. This adds complexity.
*   **Error Handling & Resilience:** While basic error handling is present, a production system would need more comprehensive error tracking, retries for transient network issues, and potentially dead-letter queues for critical socket events if an adapter is used.
*   **Security for Socket Events:** Currently, user registration on socket relies on `authUser._id` sent from client. While the initial HTTP authentication protects API routes, further validation or token-based authentication for socket connections might be considered for enhanced security, especially if sensitive data were to be exchanged over sockets directly.
*   **No Message Acknowledgements:** Socket.IO `emit` by default is "fire-and-forget." For critical updates, acknowledgements could be used to ensure message delivery, though this adds overhead.
*   **Online User Definition:** The "online user" count is based on active WebSocket connections where a user has "registered" with their ID. If a user's browser loses connection temporarily and reconnects, their socket ID changes. The backend `userSocketMap` correctly updates with the new socket ID upon re-registration. A user is considered "offline" immediately upon socket disconnection. More sophisticated presence systems might use heartbeats or longer timeouts.

This document provides a snapshot of the current system. As the application grows, these considerations and limitations will need to be revisited.
