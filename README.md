# LineLess India (Queue Elimination System)


## What you get

### User side
- Search hospitals
- View doctor/counter queues under a hospital
- Mock payment (₹1) -> generate token
- Live tracking: current token, people ahead, estimated wait time
- Token saved in `localStorage`

### Admin side
- Simple admin login (username/password)
- Create hospitals
- Create multiple queues per hospital
- Real-time controls: **Next Token** and **Skip Token**

## Folder structure

```text
LineLess India/
  backend/
    .env.example
    package.json
    src/
      app.js
      db.js
      server.js
      controllers/
        adminController.js
        hospitalsController.js
        queuesController.js
        tokensController.js
      middleware/
        adminAuth.js
      models/
        Hospital.js
        Queue.js
        Token.js
      routes/
        admin.js
        hospitals.js
        index.js
        queues.js
        tokens.js
      services/
        queueService.js
      socket/
        setupSocket.js
      utils/
        queueMath.js
  frontend/
    .env.example
    package.json
    index.html
    postcss.config.js
    tailwind.config.js
    vite.config.js
    src/
      App.jsx
      main.jsx
      api/client.js
      components/
        PaymentModal.jsx
        QRCodeCard.jsx
      lib/storage.js
      pages/
        HospitalSearchPage.jsx
        QueuePage.jsx
        admin/
          AdminDashboardPage.jsx
          AdminLoginPage.jsx
      styles/
        index.css
```

## Setup (step-by-step)

### 1) Install prerequisites
- Node.js (LTS)
- MongoDB running locally (default below)
- Ports:
  - Backend: `5000`
  - Frontend: `5173`

### 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend environment defaults:
- `MONGO_URI=mongodb://127.0.0.1:27017/lineLessIndia`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=admin`
- `JWT_SECRET=lineLessIndia-secret`

### 3) Frontend
In another terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`

## How to demo

### Admin flow
1. Go to `http://localhost:5173/admin/login`
2. Login with `admin / admin`
3. Create a hospital
4. Add one or more queues (doctor/counter)
5. Use **Next Token** / **Skip Token** to advance the queue

### User flow
1. On `/`, search and select a hospital
2. Click **Join Queue**
3. Click **Confirm Payment** (mock)
4. You’ll get a token and see live updates

## REST APIs (backend)

Base URL: `http://localhost:5000`

### Hospitals
- `POST /hospitals` (admin auth)
- `GET /hospitals?q=...`

### Queues
- `POST /queues` (admin auth) body: `{ hospitalId, name, avgTimePerUser }`
- `GET /queues/:hospitalId`

### Tokens / Queue status
- `POST /token/:queueId` body: `{ mockPayment: true }`
- `GET /queue-status/:queueId?tokenNumber=...`

### Admin actions
- `POST /next/:queueId` (admin auth)
- `POST /skip/:queueId` (admin auth)

## Socket.io (real-time)
- Client emits: `joinQueue` with `{ queueId }`
- Server emits to that room: `queue:update` with:
  - `queueId`, `hospitalId`, `queueName`
  - `currentToken`
  - `avgTimePerUser`
  - `waitingTokens` and `waitingCount`
  - `nextTokenNumber`

Rooms are `queue:${queueId}`.

## Token logic (as specified)
- `tokenNumber = queue.currentToken + waitingTokens.length + 1`
- `estimatedWaitTime = peopleAhead * avgTimePerUser`

Prototype note: for simplicity this version doesn’t implement a distributed lock for simultaneous token creation.

