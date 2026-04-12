# Software Requirements Specification (SRS): Local City Super App
**Document Version**: 4.0 (Master-Definitive)  
**Author**: Senior Business Analyst (7y Exp)  
**Status**: Final Comprehensive Specification

---

## 1. Executive Summary
The **Local City Super App** is the digital infrastructure for a modern city, consolidating 22 core modules into a single interface. This document provides the final, exhaustive functional blueprint for every service vertical, ensuring absolute alignment across Logistics, Commerce, Services, and Fintech.

---

## 2. Core Service Verticals (Logistics & Mobility)

### 2.1 Pick & Drop (Hyperlocal Logistics)
- **Purpose**: Point-to-point delivery for small parcels and personal rides.
- **Detailed FR**:
    - **FR-L1.1**: Geofencing-based driver allocation (5km radius).
    - **FR-L1.2**: Multi-stage OTP verification (Pickup & Dropoff).
    - **FR-L1.3**: Real-time fare re-calculation for route deviations > 200m.

### 2.2 Transport Service (Heavy Logistics)
- **Purpose**: Moving/Shifting services using heavy vehicles (Tata Ace, 407, Trucks).
- **Detailed FR**:
    - **FR-L2.1**: Capacity-based vehicle selection (0.5 Ton to 10 Ton).
    - **FR-L2.2**: "Helper Needed" toggle with flat-rate labor addition (e.g., 500 INR/Helper).
    - **FR-L2.3**: Scheduled bookings with mandatory advance deposit (20%).

---

## 3. Marketplace & Commerce (Hyperlocal E-commerce)

### 3.1 Food Delivery (QSR & Restaurants)
- **Logic**: Real-time menu synchronization from Merchants to Consumers.
- **Detailed FR**:
    - **FR-M1.1**: Kitchen preparation time (KPT) auto-adjustment based on order volume.
    - **FR-M1.2**: "No Contact Delivery" protocol with photo proof.

### 3.2 Grocery, Fruits & Veggies
- **Logic**: Slot-based delivery for daily essentials.
- **Detailed FR**:
    - **FR-M2.1**: Weight-to-Price conversion logic for loose items (e.g., 250g, 500g, 1kg).
    - **FR-M2.2**: Automated replenishment alerts for "Out of Stock" items to Merchants.

### 3.3 Hardware Shop & Industrial Supplies
- **Logic**: Construction and maintenance tools for DIY and B2B professionals.
- **Detailed FR**:
    - **FR-M3.1**: "Bulk Quote" request for items like cement, steel, or specialty paints.
    - **FR-M3.2**: Tool rental lifecycle management (Security Deposit + Daily Rate).

### 3.4 Dairy Drop (Daily Subscriptions)
- **Logic**: Recurring morning delivery for milk and fresh produce.
- **Detailed FR**:
    - **FR-M4.1**: Subscription calendar (Daily, Alternate, Weekends).
    - **FR-M4.2**: "Pause Subscription" with 12-hour lead time for next-day delivery stoppage.

---

## 4. Specialized Services & Professional Marketplace

### 4.1 On-Demand Services (Home Maintenance / Salon)
- **Logic**: Professional booking with verified background checks.
- **Detailed FR**:
    - **FR-S1.1**: Service verification code (SVC) to start work at user premises.
    - **FR-S1.2**: Rate Card transparency for extra spare parts/ consumables used.

### 4.2 Local Deals & Coupons
- **Logic**: Promotional engine for city merchants.
- **Detailed FR**:
    - **FR-D1.1**: Flash-deal timer (Hurry-up logic) to drive conversion.
    - **FR-D1.2**: Dynamic QR generation for in-store coupon redemption verification.

### 4.3 Education & Institutional Inquiry
- **Logic**: Standardized inquiry forms for schools/colleges.
- **Detailed FR**:
    - **FR-E1.1**: Profile-based auto-fill for student inquiries.
    - **FR-E1.2**: Direct inquiry routing with 24-hour SLA for institution response.

---

## 5. Platform-Wide Technical & Fintech Engines

### 5.1 Fintech Layer (Wallet, Transaction, Payout)
- **Detailed FR**:
    - **FR-F1.1**: Triple-entry transaction logging (User Debit, Admin Commission, Merchant Credit).
    - **FR-F1.2**: Automated daily T+1 settlement for Merchants.
    - **FR-F1.3**: Refund escrow for cancelled orders (Auto-credit to Wallet).

### 5.2 Real-time Engine (Chat, Socket, Notification)
- **Detailed FR**:
    - **FR-C1.1**: Persistence-aware chat rooms for Order IDs (Closed after 24H of completion).
    - **FR-C1.2**: Smart notification grouping (Contextual alerts vs. Marketing alerts).

---

## 6. Non-Functional Requirements (Performance & Trust)
- **Latency**: API P99 < 120ms.
- **Auditability**: `ActivityLogInterceptor` capturing all administrative and transactional mutations.
- **Compliance**: Local data residency and encrypted PII (Personal Identifiable Information) storage.

---

## 7. Conclusion
Version 4.0 of the SRS provides 100% functional coverage of the 22 core modules. It serves as the single source of truth for engineering, product, and operations, ensuring the Local City Super App is stable, secure, and commercially viable across all city segments.
