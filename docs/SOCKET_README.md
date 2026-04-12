# Socket Integration Guide (Legacy to NestJS)
This document outlines the socket event mapping and connection logic for the City Express Super App.

## 1. Connection Endpoint
- **URL**: `http://localhost:4000` (or production socket URL)
- **Namespace**: `/` (Default)
- **Auth**: Pass `token` in query or headers.

## 2. Core Events (Logistics)
| Event | Type | Payload | Description |
| :--- | :--- | :--- | :--- |
| `ride_request` | Emit | `{ pickup, drop, vehicleId }` | User requests a new ride. |
| `accept_ride` | On | `{ rideId, driverId }` | Driver accepts the request. |
| `location_update`| On | `{ lat, lng, rideId }` | Real-time driver positioning. |
| `ride_status` | On | `{ status, rideId }` | Sync status: Arrived, Started, Reached, Completed. |

## 3. Implementation Notes
- **Persistence**: Driver state is handled via the `RideGateway` on disconnection.
- **Verification**: `pickupOtp` and `dropOffOtp` are required for transition to `Started` and `Completed` respectively.
