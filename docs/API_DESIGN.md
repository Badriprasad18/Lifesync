# LifeSync AI – Backend REST API Design Document

**Framework:** FastAPI (Python 3.10+)  
**Protocol:** RESTful over HTTP/1.1  
**Authentication:** Stateless HTTP Bearer JWT (`Authorization: Bearer <TOKEN>`)  
**Base URL:** `http://localhost:8000/api`

---

## 1. Authentication & Token Standards

All protected endpoints require the following request header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Unauthorized requests receive standard `401 Unauthorized` responses with `{ "detail": "Invalid or expired authentication credentials." }`.

---

## 2. API Endpoints Catalog

```mermaid
graph LR
    subgraph Auth_API ["Auth (/api/auth)"]
        A1[POST /register]
        A2[POST /login]
        A3[GET /me]
    end

    subgraph Assessment_API ["Assessments (/api/assessments)"]
        B1[POST /]
        B2[GET /]
        B3[GET /{id}]
        B4[DELETE /{id}]
        B5[GET /{id}/pdf]
    end

    subgraph Analytics_API ["Analytics (/api/analytics)"]
        C1[GET /trends]
        C2[GET /cohort-scatter]
    end

    subgraph Rec_API ["Recommendations (/api/recommendations)"]
        D1[PATCH /{id}/toggle]
    end
```

---

## 3. Detailed Endpoint Specifications

### 3.1 Authentication Module

#### `POST /api/auth/register`
Creates a new user profile and returns access token.
- **Request Body (`application/json`):**
  ```json
  {
    "email": "student@college.edu",
    "password": "SecurePassword123!",
    "full_name": "Alex Mercer",
    "age": 22,
    "gender": "male"
  }
  ```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "access_token": "eyJhbGciOi...",
      "token_type": "bearer",
      "user": {
        "id": 1,
        "email": "student@college.edu",
        "full_name": "Alex Mercer",
        "age": 22,
        "gender": "male"
      }
    }
    ```
  - `400 Bad Request`: Email already registered.
  - `422 Unprocessable Entity`: Validation failure (e.g. password too short, age out of bounds).

#### `POST /api/auth/login`
Authenticates existing credentials.
- **Request Body (`application/json` or standard OAuth form):**
  ```json
  {
    "email": "student@college.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Responses:**
  - `200 OK`: Returns token and user object.
  - `401 Unauthorized`: Invalid email or password.

#### `GET /api/auth/me`
Retrieves the active user session profile.
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "email": "student@college.edu",
    "full_name": "Alex Mercer",
    "age": 22,
    "gender": "male",
    "total_assessments": 3,
    "created_at": "2026-11-01T21:00:00Z"
  }
  ```

---

### 3.2 Assessment Intake & Analysis Module

#### `POST /api/assessments`
Submits raw questionnaire inputs, runs scoring, triggers ML models, stores recommendations, and returns full assessment results.
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body (`application/json`):**
  ```json
  {
    "sleep_hours": 6.0,
    "sleep_quality": 3,
    "wake_freshness": 2,
    "exercise_minutes": 15,
    "step_count": 4200,
    "sitting_hours": 9.5,
    "water_intake_liters": 1.4,
    "meals_regularity": 2,
    "junk_food_freq": 3,
    "fruit_veg_servings": 1,
    "stress_level": 7,
    "mindfulness_minutes": 5,
    "work_screen_hours": 8.0,
    "recreational_screen_hours": 4.5,
    "screen_before_bed": true,
    "caffeine_cups": 4,
    "smoking_status": "never",
    "alcohol_freq": "none",
    "notes": "Midterm exams preparation week"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "assessment_id": 14,
    "assessed_at": "2026-11-01T21:15:00Z",
    "scores": {
      "composite_lwi": 48.6,
      "risk_tier": "Elevated Risk",
      "pillars": {
        "sleep": 48.0,
        "physical_activity": 42.5,
        "nutrition_hydration": 40.0,
        "mental_wellbeing": 45.0,
        "digital_hygiene": 38.0,
        "habits": 76.0
      },
      "deductions": [
        "-14 pts: Total screen time exceeds 12.5 hrs/day",
        "-20 pts: Blue light exposure within 60 mins of sleep",
        "-9 pts: Hydration level (1.4L) is below recommended 2.5L",
        "-8 pts: Caffeine intake exceeds 3 cups/day"
      ]
    },
    "ml_insights": {
      "cluster_id": 1,
      "cluster_name": "Sedentary Digital Workaholic",
      "cluster_description": "Characterized by high screen exposure, extended sitting, and irregular hydration.",
      "pca_coordinates": { "x": 1.84, "y": -0.62 },
      "is_anomaly": true,
      "anomaly_score": -0.142,
      "anomaly_contributing_factors": [
        "Screen time is 2.4 std deviations above baseline",
        "Physical activity is 1.8 std deviations below baseline"
      ]
    },
    "recommendations": [
      {
        "id": 82,
        "category": "Screen",
        "priority": "high",
        "title": "Enforce 60-Minute Digital Sunset",
        "description": "Late-night screen use suppresses melatonin production, impairing REM sleep.",
        "action_item": "Switch off laptop and phone screens at least 1 hour before bedtime.",
        "is_completed": false
      },
      {
        "id": 83,
        "category": "Hydration",
        "priority": "high",
        "title": "Baseline Hydration Target",
        "description": "Your current intake of 1.4L is sub-optimal for cellular metabolism and cognitive stamina.",
        "action_item": "Keep a 1L water bottle at your desk; refill twice daily to hit 2.5L.",
        "is_completed": false
      }
    ]
  }
  ```

#### `GET /api/assessments`
Lists all historical assessments for the authenticated user (summary view).
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": 14,
      "assessed_at": "2026-11-01T21:15:00Z",
      "composite_lwi": 48.6,
      "risk_tier": "Elevated Risk",
      "cluster_name": "Sedentary Digital Workaholic",
      "is_anomaly": true
    },
    {
      "id": 13,
      "assessed_at": "2026-10-24T18:30:00Z",
      "composite_lwi": 64.2,
      "risk_tier": "Fair",
      "cluster_name": "Low-Activity Casual",
      "is_anomaly": false
    }
  ]
  ```

#### `GET /api/assessments/{id}`
Returns complete assessment details by ID (including all raw inputs, scores, ML insights, and recommendations).
- **Response (`200 OK`):** Full details payload matching the creation response schema.
- **Error Response (`404 Not Found`):** If ID doesn't exist or belongs to another user.

#### `DELETE /api/assessments/{id}`
Removes an assessment session and its cascading child records.
- **Response (`200 OK`):** `{ "message": "Assessment deleted successfully." }`

---

### 3.3 Historical Analytics & Visuals Module

#### `GET /api/analytics/trends`
Provides time-series arrays for longitudinal tracking in Recharts.
- **Response (`200 OK`):**
  ```json
  {
    "timeline": [
      {
        "date": "2026-10-15",
        "lwi": 55.0,
        "sleep": 60.0,
        "activity": 45.0,
        "stress": 50.0
      },
      {
        "date": "2026-10-24",
        "lwi": 64.2,
        "sleep": 70.0,
        "activity": 65.0,
        "stress": 60.0
      },
      {
        "date": "2026-11-01",
        "lwi": 48.6,
        "sleep": 48.0,
        "activity": 42.5,
        "stress": 45.0
      }
    ],
    "average_lwi": 55.93,
    "best_pillar": "Habits (76.0)",
    "weakest_pillar": "Digital Hygiene (38.0)"
  }
  ```

#### `GET /api/analytics/cohort-scatter`
Delivers 2D PCA coordinates of population cluster centroids and sample reference points, plus the user's latest point.
- **Response (`200 OK`):**
  ```json
  {
    "user_point": { "x": 1.84, "y": -0.62, "cluster_id": 1, "label": "Your Position" },
    "centroids": [
      { "cluster_id": 0, "name": "Balanced High-Achiever", "x": -2.1, "y": 1.4 },
      { "cluster_id": 1, "name": "Sedentary Digital Workaholic", "x": 2.0, "y": -0.8 },
      { "cluster_id": 2, "name": "Stressed Academic", "x": 0.8, "y": 2.2 },
      { "cluster_id": 3, "name": "Low-Activity Casual", "x": -0.7, "y": -1.8 }
    ],
    "cluster_benchmarks": [
      { "x": -1.9, "y": 1.2, "cluster_id": 0 },
      { "x": 2.2, "y": -0.9, "cluster_id": 1 },
      { "x": 0.6, "y": 2.0, "cluster_id": 2 },
      { "x": -0.8, "y": -1.6, "cluster_id": 3 }
    ]
  }
  ```

---

### 3.4 Report & Recommendations Module

#### `GET /api/assessments/{id}/pdf`
Generates and streams the formal PDF summary document.
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:**
  - Status: `200 OK`
  - Content-Type: `application/pdf`
  - Header: `Content-Disposition: attachment; filename="LifeSync_Report_#14.pdf"`

#### `PATCH /api/recommendations/{id}/toggle`
Toggles an action recommendation's `is_completed` status for habit compliance tracking.
- **Response (`200 OK`):**
  ```json
  {
    "id": 82,
    "is_completed": true,
    "message": "Recommendation habit status updated."
  }
  ```
