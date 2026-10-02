# BookMyEvent - System Documentation & Setup Guide

## System Overview
**BookMyEvent** is a premium, end-to-end mobile application designed for event discovery and ticket booking. It features a modern, high-contrast UI with delightful micro-interactions (like Confetti and sound effects) and a robust, secure Node.js/MongoDB backend that handles real-time ticket availability and email notifications.

---

## 1. Core Requirements & Implementation

### The Entity Relationship (Primary & Related)
The system strictly implements two distinct entities beyond the User model to form a complete relational system:

*   **Primary Entity: Event**
    *   **Full CRUD:** Administrators/Organizers can Create, Read, Update, and Delete events.
    *   **Image Upload:** Event creation utilizes Cloudinary for secure, multipart/form-data image uploads, storing the poster image URL in the database.
*   **Related Entity: Booking**
    *   **Full CRUD:** Users can Create (book tickets), Read (view their bookings), Update (cancel bookings, altering the status), and Delete (soft delete/remove from history).
    *   **Reference Field:** Each Booking inherently references the specific `Event` ID and the `User` ID.
    *   **State Change:** Bookings feature a dynamic state machine, shifting from `CONFIRMED` upon creation to `CANCELLED` when a user revokes their ticket.

### Real Business Logic
The system enforces strict business logic that the database cannot natively handle:
*   **Capacity Enforcement & Race Conditions:** When a `Booking` is created, the system checks if `numberOfTickets <= event.availableSeats`. If valid, it deducts the tickets from the event pool. If the event is sold out or lacks sufficient seats, the transaction is explicitly blocked.
*   **Capacity Restoration:** When a `Booking` status is changed to `CANCELLED`, the previously held tickets are mathematically restored to the `Event`'s `availableSeats` pool, allowing others to purchase them.
*   **Dynamic Price Calculation:** The backend dynamically calculates the total price by multiplying the requested tickets by the `Event`'s current ticket price (preventing frontend price spoofing).

---

## 2. Technical Architecture

### Backend (Node.js + Express + MongoDB)
*   **RESTful API Design:** Clean architectural separation. Endpoints are mapped predictably (e.g., `GET /api/events`, `POST /api/bookings`).
*   **Sensible Folder Structure:** The codebase is cleanly divided into `routes/`, `controllers/`, `models/`, `middleware/`, and `utils/`.
*   **Middleware:**
    *   `auth.js`: Verifies JWT tokens and protects private routes.
    *   `upload.js`: Utilizes `multer` and `multer-storage-cloudinary` to intercept file streams and upload them to the cloud before hitting the controller.
*   **Input Validation:** `express-validator` is used at the route level to ensure payloads are sanitized and complete before any database interaction occurs.
*   **Error Handling:** A global error-handling middleware catches all exceptions, standardizing responses and delivering correct HTTP status codes (400, 401, 403, 404, 500).

### Mobile (React Native + Expo)
*   **Working Navigation:** Implements `@react-navigation/bottom-tabs` for a premium floating tab bar, and `native-stack` for seamless screen transitions. Incorporates an Auth flow vs. Main flow based on login state.
*   **Functional Components & Hooks:** Built entirely with modern React functional components, utilizing `useState`, `useEffect`, `useCallback`, and a custom `useContext` for global authentication state.
*   **Form Validation & UX:** Forms feature real-time error handling. The UI leverages `KeyboardAvoidingView` and displays user-friendly native Alerts for failed validations.
*   **Loading & Empty States:** All asynchronous operations display `ActivityIndicator` spinners. FlatLists implement pull-to-refresh and display beautifully designed Empty States when no data is found.
*   **Dynamic API Data:** Zero hardcoded data. All lists, details, and user profiles are hydrated live via `axios` from the backend API.

---

## 3. Setup & Installation Guide

To run this project locally, you will need two terminal windows: one for the Backend, and one for the Mobile app.

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account (or local MongoDB)
*   Cloudinary Account (for image uploads)
*   Expo Go app on your physical mobile device, or Android Studio / Xcode for emulators.

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend folder: `cd backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and provide your keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL=noreply@bookmyevent.com
   FROM_NAME=BookMyEvent
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   *The server should report "MongoDB Connected" and "Server running on port 5000".*

### Step 2: Mobile Setup
1. Open a new terminal and navigate to the mobile folder: `cd mobile`
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Network Configuration**: 
   * If you are running on an iOS Simulator, the default API URL (`http://localhost:5000/api`) will work perfectly.
   * If running on an Android Emulator, the app is already configured to use `http://10.0.2.2:5000/api`.
   * **Physical Device**: If you test on a physical phone via Expo Go, you MUST update `mobile/src/api/client.js` and replace `localhost` with your computer's local Wi-Fi IP Address (e.g., `http://192.168.1.5:5000/api`).
4. Start the Expo server:
   ```bash
   npx expo start
   ```
5. Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android), or press `a` for Android Emulator / `i` for iOS Simulator.

### Step 3: Enjoy!
Register a new account (select 'Organizer' to create events, or 'Attendee' to just book them). Explore the premium UI, upload an event poster, book a ticket to see the capacity deduct, and experience the Confetti & Sound Effect celebration upon checkout!
