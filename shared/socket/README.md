# Socket Integration Guide: Chat & Rides

This guide details how to integrate with the HelpingHob socket server for real-time features like chat and ride-hailing requests.

## 1. Connection & Authentication

The socket server requires a JWT token for authentication during the handshake.

**Endpoint:** `ws://your-api-domain.com` (or `http://localhost:3000` in dev)

### Handshake Setup
Pass the token in the `auth` object or as a `query` parameter.

```javascript
// Client-side (Socket.io)
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

---

## 2. Chat Module

### How to obtain `roomId`?
Before joining a room, you must retrieve or create it via the API:
- **Endpoint**: `GET /chat/create-room`
- **Response**: Returns a JSON object where `_id` is your `roomId`.

### Join a Room
Required before sending or receiving messages in a specific chat.

**Event:** `join_room`
**Request Payload:**
```json
{
  "roomId": "60f1c8b3e6b3c2001f8e4a55"
}
```

### Send Message
**Event:** `send_message`
**Request Payload:**
```json
{
  "roomId": "60f1c8b3e6b3c2001f8e4a55",
  "senderId": "60f1c8b3e6b3c2001f8e4a51",
  "senderType": "user", 
  "message": "Hello! I have a question about my booking."
}
```

### Receive Message (Listener)
**Event:** `new_message`
**Response Payload:**
```json
{
  "_id": "60f1c8b3e6b3c2001f8e4a59",
  "roomId": "60f1c8b3e6b3c2001f8e4a55",
  "senderId": "60f1c8b3e6b3c2001f8e4a51",
  "senderType": "user",
  "message": "Hello! I have a question about my booking.",
  "createdAt": "2024-04-13T21:15:00Z"
}
```

---

## 3. Ride Requests (Pick-n-Drop)

### How to obtain `rideId`?
- **User**: Receives the `rideId` in the response data after sending the `request_ride` event.
- **Driver**: Receives the `rideId` as part of the `new_ride_request` listener payload.

### User: Request a Ride
**Event:** `request_ride`
**Request Payload:**
```json
{
  "pickupLocation": {
    "lat": 28.6139,
    "lng": 77.2090,
    "address": "Connaught Place, New Delhi"
  },
  "dropoffLocation": {
    "lat": 28.5355,
    "lng": 77.3910,
    "address": "Sector 62, Noida"
  },
  "vehicleType": "bike",
  "estimatedFare": 150
}
```

### Driver: Join Dispatch Pool
Drivers must join the `drivers` room to receive new ride requests.

**Event:** `join_driver_pool`
**Payload:** None (Server uses driver's JWT to authenticate and join)

### Driver: Receive New Request (Listener)
**Event:** `new_ride_request`
**Response Payload:**
```json
{
  "rideId": "RID123456",
  "userId": "60f1c8b3e6b3c2001f8e4a51",
  "user": {
    "name": "John Doe",
    "rating": 4.8
  },
  "pickup": { "lat": 28.6139, "lng": 77.2090, "address": "Connaught Place" },
  "drop": { "lat": 28.5355, "lng": 77.3910, "address": "Sector 62" }
}
```

### Driver: Accept Ride
**Event:** `accept_ride`
**Request Payload:**
```json
{
  "rideId": "RID123456"
}
```

### Driver: Update Real-time Location
**Event:** `update_location`
**Request Payload:**
```json
{
  "lat": 28.6145,
  "lng": 77.2095,
  "rideId": "RID123456" 
}
```
> [!NOTE]
> If `rideId` is provided, the location will automatically be emitted to the assigned user as well.

---

## 4. Status Updates

### Update Ride Status
**Event:** `ride_status_update`
**Request Payload:**
```json
{
  "rideId": "RID123456",
  "status": "arrived" 
}
```
*Statuses: `pending`, `accepted`, `arrived`, `started`, `completed`, `cancelled`*

### Listen for Status Changes
**Event:** `ride_status_changed`
**Response Payload:**
```json
{
  "rideId": "RID123456",
  "status": "arrived"
}
```

---

## 5. Testing with Postman

Postman has a built-in **Socket.io** request type that makes testing these events very easy.

### Step-by-Step Configuration

1. **Create New Request**: Click **New** -> **Socket.io**.
2. **URL**: Enter your server URL (e.g., `http://localhost:3000`).
3. **Authentication (Handshake)**:
   - Go to the **Auth** tab.
   - Select **Bearer Token** (or use the **Handshake Customization** section if your server expects it in `auth` object).
   - In our case, the server checks `client.handshake.auth?.token`. 
   - In Postman, go to **Settings** -> **Handshake Customization** -> **Auth** and add:
     - Key: `token`
     - Value: `YOUR_JWT_TOKEN`
4. **Connect**: Click the **Connect** button. Check the console for "Connected".

### Sending Events

1. **Events Tab**: In the "Message" section, select the **Events** tab.
2. **Event Name**: Enter the event name (e.g., `send_message` or `request_ride`).
3. **Payload**: Paste the JSON payload.
   ```json
   {
     "roomId": "60f1c8b3e6b3c2001f8e4a55",
     "senderId": "60f1c8b3e6b3c2001f8e4a51",
     "senderType": "user",
     "message": "Testing from Postman!"
   }
   ```
4. **Send**: Click **Send**.

### Listening for Events

1. **Listeners Tab**: 
   - Click **Add Listener**.
   - Event Name: `new_message` (for chat) or `ride_status_changed` (for rides).
   - Now, whenever the server emits this event, it will appear in the **Timeline** at the bottom.

### Troubleshooting Postman
- **Token Expiry**: If you get "Unauthorized" or immediate disconnect, ensure your JWT token hasn't expired.
- **CORS**: Ensure the backend allows Postman's origin (usually handled by `cors: { origin: '*' }` in our gateway).
