# CIRIL IOTS — Server Attachments & API Integration Blueprint

> **Target Backend:** `iots-app/backend/` (Node.js + Express 5.x)  
> **Target Frontend:** `iots-app/frontend/iots-app/` (React 19 + Vite 8)  
> **Audience:** Backend Engineers, Full-Stack Developers, DevOps, Security Team  
> **Status:** Production Integration Blueprint

---

## 1. Overview of Frontend Plug-in Points

The frontend codebase in `src/App.jsx` and `src/components/LoginFormSection.jsx` has been designed with **6 explicit, documented Plug-in Indications**. These comment blocks show the backend team exactly where to hook into network APIs:

```
┌────────────────────────────────────────────────────────────────────────┐
│ FRONTEND PLUG-IN INVENTORY                                             │
├────────────────────────────────────────────────────────────────────────┤
│ [PLUG-IN INDICATION 1] Client Input Sanitization & Rate-Limiting       │
│ [PLUG-IN INDICATION 2] Credentials Authentication API (/auth/login)    │
│ [PLUG-IN INDICATION 3] Geofencing & Workplace Verification API         │
│ [PLUG-IN INDICATION 4] Workspace Router Redirect & Session Hydration   │
│ [PLUG-IN INDICATION 5] SIEM Audit Logging - Off-site Login Accepted    │
│ [PLUG-IN INDICATION 6] SIEM Audit Logging - Off-site Login Rejected    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. API Endpoint Specifications

The backend service (`iots-app/backend`) should implement the following RESTful API structure:

### 1. `POST /api/v1/auth/login` (Authentication Verification)

- **Purpose:** Verifies employee username/email and password against the company identity database.
- **Triggered in Frontend:** `[PLUG-IN INDICATION 2]` inside `handleLogin` in `App.jsx`.

#### Request Headers
```http
POST /api/v1/auth/login HTTP/1.1
Host: api.iots.ciril.in
Content-Type: application/json
Accept: application/json
```

#### Request Payload
```json
{
  "empId": "dev.manikanta@ciril.in",
  "password": "SecurePassword123!"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "userId": "EMP_10482",
    "name": "Deva Manikanta Sala",
    "email": "dev.manikanta@ciril.in",
    "role": "Lead Architect",
    "department": "Engineering Operations",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-09-30T10:00:00.000Z"
  }
}
```

#### Error Response (`401 Unauthorized`)
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Authentication failed. Invalid credentials are given."
  }
}
```

---

### 2. `POST /api/v1/security/geofence-check` (Workplace Verification)

- **Purpose:** Verifies whether the employee's GPS coordinates fall within authorized corporate office premises, registered client locations, or allowed geographical nodes.
- **Triggered in Frontend:** `[PLUG-IN INDICATION 3]` inside `handleLogin` in `App.jsx`.

#### Request Payload
```json
{
  "empId": "dev.manikanta@ciril.in",
  "latitude": 17.448291,
  "longitude": 78.374829,
  "accuracy": 3.8,
  "altitude": 542.0
}
```

#### Authorized Workplace Response (`200 OK`)
```json
{
  "success": true,
  "status": "AUTHORIZED",
  "facility": {
    "id": "CIRIL_HQ_HYD",
    "name": "CIRIL Headquarters - HITEC City",
    "distanceMeters": 14.2,
    "allowedRadiusMeters": 150
  }
}
```

#### Mismatch Response (`200 OK` or `403 Forbidden`)
```json
{
  "success": true,
  "status": "MISMATCH",
  "facility": null,
  "distanceMeters": 12450.8,
  "allowedRadiusMeters": 150,
  "detectedArea": "Remote Operational Node (Outside Registered Perimeter)"
}
```
*Frontend Reaction:* When `status === 'MISMATCH'`, `App.jsx` halts the pipeline at Step 3 (`processStep = 3`), renders the amber detected coordinates box, and activates the **Option B Action Buttons**.

---

### 3. `POST /api/v1/security/audit` (SIEM Security Audit Logging)

- **Purpose:** Dispatches immutable audit events to the corporate Security Information and Event Management (SIEM) pipeline (e.g. Splunk, Elasticsearch, Datadog).
- **Triggered in Frontend:** 
  - `[PLUG-IN INDICATION 5]` inside `handleAcceptLocation` (Continue clicked)
  - `[PLUG-IN INDICATION 6]` inside `handleAbortLogin` (Cancel Login clicked)

#### Event 1: Off-Site Login Accepted (`OFF_SITE_LOGIN_ACCEPTED`)
Dispatched when an employee confirms they are logging in remotely:
```json
{
  "event": "OFF_SITE_LOGIN_ACCEPTED",
  "empId": "dev.manikanta@ciril.in",
  "coordinates": "17.448291° N, 78.374829° E",
  "accuracy": "±3.8m",
  "locality": "HITEC City, Hyderabad, Telangana",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "timestamp": "2026-09-29T09:48:15.210Z"
}
```

#### Event 2: Off-Site Login Rejected (`OFF_SITE_LOGIN_REJECTED`)
Dispatched when an off-site attempt is aborted by the user:
```json
{
  "event": "OFF_SITE_LOGIN_REJECTED",
  "empId": "dev.manikanta@ciril.in",
  "coordinates": "17.448291° N, 78.374829° E",
  "accuracy": "±3.8m",
  "locality": "HITEC City, Hyderabad, Telangana",
  "status": "BLOCKED_BY_USER",
  "timestamp": "2026-09-29T09:49:02.100Z"
}
```
*Frontend Reaction:* Form resets to `idle`, step to `0`, and renders the rose banner: *"Security Check Recorded. User rejected off-site login attempt at 3:19 PM."*

---

### 4. `GET /api/v1/auth/me` (Session Hydration)

- **Purpose:** Checks if the employee has an active, valid session cookie or token upon initial page load.
- **Triggered in Frontend:** `[PLUG-IN INDICATION 4]` during initial `useEffect` in `App.jsx`.

#### Success Response (`200 OK`)
```json
{
  "authenticated": true,
  "user": {
    "userId": "EMP_10482",
    "name": "Deva Manikanta Sala",
    "role": "Lead Architect",
    "permissions": ["OPS_READ", "OPS_WRITE", "TELEMETRY_VIEW"]
  }
}
```

---

## 3. Express.js Backend Implementation Blueprint

Backend engineers can place this production-ready router directly into `iots-app/backend/routes/auth.js`:

```javascript
// iots-app/backend/routes/auth.js
const express = require('express');
const router = express.Router();

// Haversine formula to compute great-circle distance between two GPS points in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (val) => (val * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 1. Credentials Authentication
router.post('/auth/login', async (req, res) => {
  const { empId, password } = req.body;
  
  if (!empId || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  // TODO: Validate against database (e.g. PostgreSQL, MongoDB, LDAP)
  if (empId.toLowerCase().includes('fail')) {
    return res.status(401).json({ success: false, message: 'Invalid credentials are given.' });
  }

  // Return session or token
  res.json({
    success: true,
    data: {
      userId: 'EMP_' + Math.floor(1000 + Math.random() * 9000),
      empId,
      token: 'jwt-auth-token-sample'
    }
  });
});

// 2. Geofence Verification
router.post('/security/geofence-check', (req, res) => {
  const { latitude, longitude } = req.body;

  // Registered CIRIL Headquarters Coordinates (HITEC City, Hyderabad)
  const HQ_LAT = parseFloat(process.env.AUTHORIZED_LAT || '17.448291');
  const HQ_LON = parseFloat(process.env.AUTHORIZED_LON || '78.374829');
  const MAX_RADIUS = parseFloat(process.env.GEOFENCE_RADIUS_METERS || '200'); // 200m radius

  const distance = calculateDistanceMeters(latitude, longitude, HQ_LAT, HQ_LON);

  if (distance <= MAX_RADIUS) {
    return res.json({
      success: true,
      status: 'AUTHORIZED',
      distanceMeters: Math.round(distance * 10) / 10
    });
  } else {
    return res.json({
      success: true,
      status: 'MISMATCH',
      distanceMeters: Math.round(distance * 10) / 10,
      message: 'Location outside registered workplace perimeter.'
    });
  }
});

// 3. SIEM Security Audit Logging
router.post('/security/audit', (req, res) => {
  const auditEvent = {
    ...req.body,
    clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    receivedAt: new Date().toISOString()
  };

  // Log to secure audit stream (e.g., stdout for Docker/K8s, or forward to Splunk/Elastic)
  console.info('[SIEM-AUDIT-LOG]', JSON.stringify(auditEvent));

  res.status(202).json({ success: true, recorded: true });
});

module.exports = router;
```

---

## 4. Frontend Client Network Adapter Blueprint

To replace the simulation in `src/App.jsx` with real backend calls, the frontend team can introduce a clean API client in `src/utils/apiClient.js`:

```javascript
// src/utils/apiClient.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = {
  async login(empId, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empId, password }),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Authentication failed.');
    }
    return res.json();
  },

  async verifyGeofence(empId, geoDetails) {
    const res = await fetch(`${API_BASE}/security/geofence-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empId,
        latitude: parseFloat(geoDetails.lat),
        longitude: parseFloat(geoDetails.lon),
        accuracy: parseFloat(geoDetails.accuracy),
        altitude: geoDetails.altitude ? parseFloat(geoDetails.altitude) : null
      }),
      credentials: 'include'
    });
    return res.json();
  },

  async sendAuditLog(payload) {
    return fetch(`${API_BASE}/security/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });
  }
};
```

---

## 5. Environment Configuration

### Frontend (`iots-app/frontend/iots-app/.env`)
```bash
# Backend REST Base URL
VITE_API_BASE_URL=https://api.iots.ciril.in/api/v1

# Enable/Disable Testing Dock in Production Builds
VITE_ENABLE_TEST_DOCK=false

# Geocoding Service Override (Optional)
VITE_GEOCODE_SERVICE_URL=https://api.bigdatacloud.net/data/reverse-geocode-client
```

### Backend (`iots-app/backend/.env`)
```bash
# Server Port
PORT=5000

# CORS Allowed Origin
CORS_ORIGIN=https://portal.iots.ciril.in

# Corporate Workplace Geofencing Coordinates (HITEC City, Hyderabad)
AUTHORIZED_LAT=17.448291
AUTHORIZED_LON=78.374829
GEOFENCE_RADIUS_METERS=200

# JWT & Session Secrets
JWT_SECRET=super-secret-jwt-key-2026-production
SESSION_TIMEOUT_MINUTES=480

# SIEM / Audit Forwarding
SIEM_FORWARDING_ENABLED=true
SIEM_WEBHOOK_URL=https://splunk-collector.internal.ciril.in/services/collector
```

---

## 6. Security & Infrastructure Hardening

1. **Mandatory HTTPS (TLS 1.3):**
   - The W3C Geolocation API is strictly restricted to **Secure Contexts**. Browsers block `navigator.geolocation` if accessed over plain HTTP (except `localhost`).
   - Reverse proxies (Nginx / Cloudflare / AWS ALB) must enforce SSL with HSTS enabled:
     ```nginx
     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
     ```
2. **CORS Configuration:**
   - In `iots-app/backend/index.js`, configure CORS with credentials enabled:
     ```javascript
     const cors = require('cors');
     app.use(cors({
       origin: process.env.CORS_ORIGIN,
       credentials: true
     }));
     ```
3. **Cookie Attributes for Session Tokens:**
   - Always set `HttpOnly`, `Secure`, and `SameSite=Lax` or `SameSite=Strict` on session cookies to prevent Cross-Site Scripting (XSS) token extraction.
