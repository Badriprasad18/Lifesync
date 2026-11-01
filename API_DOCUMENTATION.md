# LifeSync AI — REST API Documentation & Integration Specification

**Base URL:** `http://localhost:8000/api`  
**API Documentation (Swagger UI):** `http://localhost:8000/docs`  
**API Documentation (ReDoc):** `http://localhost:8000/redoc`  
**Authentication Scheme:** HTTP Bearer JSON Web Token (`Authorization: Bearer <token>`)  

---

## 1. Authentication & Profile Endpoints

### 1.1 Register New User
* **Method & Path:** `POST /api/auth/register`
* **Access:** Public
* **Description:** Registers user account and creates baseline profile atomically.
* **Request Body:**
```json
{
  "email": "student@college.edu",
  "password": "SecurePassword123!",
  "full_name": "Aditya Sharma",
  "age": 22,
  "gender": "male",
  "occupation": "MCA Student",
  "height_cm": 176.0,
  "weight_kg": 70.0
}
```
* **Success Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "student@college.edu",
    "is_active": true,
    "created_at": "2026-11-01T18:00:00Z",
    "profile": {
      "id": 1,
      "user_id": 1,
      "full_name": "Aditya Sharma",
      "age": 22,
      "gender": "male",
      "occupation": "MCA Student",
      "height_cm": 176.0,
      "weight_kg": 70.0
    }
  }
}
```

### 1.2 User Login
* **Method & Path:** `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "student@college.edu",
  "password": "SecurePassword123!"
}
```
* **Success Response (200 OK):** Returns `TokenResponse` with signed JWT token.

### 1.3 Get Current User Profile
* **Method & Path:** `GET /api/auth/me`
* **Access:** Protected (Bearer JWT)
* **Response (200 OK):** Returns current user object and profile.

### 1.4 Update User Profile
* **Method & Path:** `PUT /api/auth/profile`
* **Access:** Protected (Bearer JWT)
* **Request Body:**
```json
{
  "full_name": "Aditya Sharma",
  "age": 23,
  "gender": "male",
  "occupation": "Senior MCA Scholar",
  "height_cm": 178.0,
  "weight_kg": 72.0
}
```
* **Response (200 OK):** Returns updated user profile object.

---

## 2. Lifestyle Assessment Endpoints

### 2.1 Submit Questionnaire
* **Method & Path:** `POST /api/assessment/`
* **Access:** Protected (Bearer JWT)
* **Description:** Persists raw inputs, calculates wellness scores, runs KMeans clustering, Isolation Forest anomaly analysis, and generates personalized recommendations.
* **Request Body:**
```json
{
  "sleep_hours": 7.5,
  "sleep_consistency": 4,
  "sleep_quality": 4,
  "wake_freshness": 4,
  "exercise_minutes": 45,
  "activity_frequency_days": 4,
  "step_count": 8500,
  "sitting_hours": 6.0,
  "water_intake_liters": 2.5,
  "hydration_habit": "regular",
  "meals_regularity": 3,
  "fruit_veg_servings": 3,
  "junk_food_freq": 1,
  "stress_level": 3,
  "mindfulness_minutes": 15,
  "work_life_balance": 4,
  "recreational_screen_hours": 2.0,
  "work_screen_hours": 5.0,
  "screen_break_frequency": "hourly",
  "screen_before_bed": false,
  "caffeine_cups": 1,
  "smoking_status": "never",
  "alcohol_freq": "none",
  "notes": "Midterm week assessment"
}
```
* **Success Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 1,
  "assessed_at": "2026-11-01T18:15:00Z",
  "scores": {
    "composite_lwi": 81.5,
    "risk_tier": "Optimal",
    "pillars": {
      "sleep": 84.0,
      "physical_activity": 76.0,
      "nutrition_hydration": 85.0,
      "mental_wellbeing": 82.0,
      "digital_hygiene": 74.0,
      "habits": 90.0
    },
    "deductions": [
      "-6.0 pts: Sedentary sitting exceeds 5h threshold"
    ]
  },
  "ml_insights": {
    "cluster_id": 0,
    "cluster_name": "Balanced High-Achiever",
    "cluster_description": "Consistent sleep and regular physical movement with balanced routine.",
    "distance_to_center": 0.42,
    "pca_coordinates": { "x": 2.15, "y": 0.38 },
    "is_anomaly": false,
    "anomaly_score": 0.18,
    "anomaly_contributing_factors": []
  },
  "recommendations": [
    {
      "id": 1,
      "category": "Digital Habits",
      "priority": "medium",
      "title": "Hourly Posture & Screen Break",
      "action_item": "Stand up and walk for 2 minutes every 60 minutes of desk work",
      "description": "Counteracts prolonged sedentary strain and reduces spinal fatigue",
      "is_completed": false
    }
  ]
}
```

### 2.2 List User Assessments
* **Method & Path:** `GET /api/assessment/`
* **Access:** Protected (Bearer JWT)
* **Response (200 OK):** Returns array of assessment session summaries belonging to current user.

### 2.3 Get Assessment Detail
* **Method & Path:** `GET /api/assessment/{id}`
* **Access:** Protected (Bearer JWT)
* **Response (200 OK):** Returns full assessment object if owned by authenticated user; otherwise `403 Forbidden` / `404 Not Found`.

### 2.4 Delete Assessment Session
* **Method & Path:** `DELETE /api/assessment/{id}`
* **Access:** Protected (Bearer JWT)
* **Response (200 OK):** `{"message": "Assessment #1 cancelled and deleted successfully."}`

### 2.5 Download Assessment PDF Report
* **Method & Path:** `GET /api/assessment/{id}/pdf`
* **Access:** Protected (Bearer JWT)
* **Response (200 OK):** Streams binary `%PDF-1.4` file (`application/pdf`) with `Content-Disposition: attachment; filename=LifeSync_Report_{id}.pdf`.

---

## 3. Dashboard & Trends Endpoints

### 3.1 Dashboard KPI Summary
* **Method & Path:** `GET /api/dashboard/summary`
* **Access:** Protected (Bearer JWT)
* **Response (200 OK):**
```json
{
  "total_assessments": 5,
  "latest_assessment_id": 1,
  "latest_lwi": 81.5,
  "latest_risk_tier": "Optimal",
  "latest_cluster": "Balanced High-Achiever",
  "is_latest_anomaly": false,
  "best_pillar": "Habits (90.0)",
  "lowest_pillar": "Digital (74.0)",
  "pending_actions_count": 3,
  "user_name": "Aditya Sharma"
}
```

### 3.2 Historical Trends
* **Method & Path:** `GET /api/dashboard/trends`
* **Access:** Protected (Bearer JWT)
* **Response (200 OK):**
```json
{
  "timeline": [
    {
      "assessment_id": 1,
      "date": "2026-10-15 10:30",
      "lwi": 68.0,
      "sleep": 60.0,
      "activity": 65.0,
      "nutrition": 70.0,
      "stress": 55.0,
      "screen": 50.0,
      "habits": 80.0
    },
    {
      "assessment_id": 2,
      "date": "2026-11-01 18:15",
      "lwi": 81.5,
      "sleep": 84.0,
      "activity": 76.0,
      "nutrition": 85.0,
      "stress": 82.0,
      "screen": 74.0,
      "habits": 90.0
    }
  ],
  "average_lwi": 74.8,
  "highest_lwi": 81.5,
  "lowest_lwi": 68.0,
  "total_points": 2
}
```

### 3.3 Population Cluster Archetypes
* **Method & Path:** `GET /api/dashboard/clusters`
* **Access:** Public
* **Response (200 OK):** Returns list of 4 cluster centroids, population percentages, and 2D PCA reference points.

---

## 4. Personalized Recommendations Endpoints

### 4.1 Get Recommendations
* **Method & Path:** `GET /api/recommendations/`
* **Access:** Protected (Bearer JWT)
* **Query Parameters:** `category` (string), `priority` (string), `is_completed` (boolean), `latest_only` (boolean, default true).
* **Response (200 OK):** Returns filtered list of recommendation cards.

### 4.2 Toggle Recommendation Status
* **Method & Path:** `PATCH /api/recommendations/{id}/toggle`
* **Access:** Protected (Bearer JWT)
* **Response (200 OK):**
```json
{
  "id": 1,
  "is_completed": true,
  "message": "Recommendation 'Hourly Posture & Screen Break' completed."
}
```

---

## 5. Health Check Endpoint

### 5.1 System Health
* **Method & Path:** `GET /api/health`
* **Access:** Public
* **Response (200 OK):**
```json
{
  "status": "healthy",
  "project": "LifeSync AI",
  "version": "1.0.0",
  "database": "connected",
  "ml_models": "loaded"
}
```
