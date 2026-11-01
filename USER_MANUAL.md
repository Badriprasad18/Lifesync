# LifeSync AI — User Manual, Demonstration Guide & University Viva Voce Preparation

**Project Title:** Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform  
**Target Audience:** University Evaluators, Project Guides, MCA Students & End Users  

---

## PART 1: User Manual & Page-by-Page Walkthrough

LifeSync AI features 12 integrated application views designed with human-centric principles, responsive layouts, and dual theme support.

### 1. Public Landing Page (`/`)
* **Purpose:** Introduces the project vision, lifestyle wellness pillars, and platform value propositions.
* **Key Features:**
  * Interactive hero section with live visual score badge preview.
  * 6-pillar breakdown grid (Sleep, Physical Activity, Nutrition/Hydration, Mental Health, Digital Hygiene, Habits).
  * Direct action links: "Get Started" (redirects to `/register`) and "Sign In" (`/login`).

### 2. User Registration (`/register`)
* **Purpose:** Allows new users to create an account and baseline biometric profile.
* **Form Inputs:** Full Name, Email, Password, Age, Gender, Occupation, Height (cm), and Weight (kg).
* **Validation:** Email format validation, password length checks, and positive height/weight bounds.

### 3. User Login (`/login`)
* **Purpose:** Authenticates returning users and issues signed HS256 JWT access tokens.
* **Key Features:** Standard email/password form + **"Instant Demo Access"** button allowing immediate evaluation with pre-configured student records.

### 4. Holistic Dashboard (`/dashboard`)
* **Purpose:** Central executive overview of personal wellness metrics.
* **Visual Elements:**
  * **Top Metrics Grid:** Composite LifeSync Wellness Index (0–100), Assigned Cluster Archetype, Pending Habit Actions, Total Evaluations.
  * **Radial Score Meter:** 270° SVG gauge displaying real-time composite score and color-coded risk tier (Optimal: Teal/Green, Moderate: Amber, Elevated: Rose).
  * **6-Pillar Lifestyle Balance Radar:** Interactive Recharts radar comparing individual category scores against population averages.
  * **Longitudinal Trajectory Area Chart:** Displays historical progress curve across past assessment checkpoints.
  * **Prioritized Micro-Habit Actions:** Top high-priority habit recommendations with direct "Mark Done" toggle.
  * **Quick Actions:** "New Assessment", "Sync / Refresh", and "PDF Report Download".

### 5. Multi-Step Lifestyle Assessment (`/assessment`)
* **Purpose:** 6-step questionnaire wizard for comprehensive lifestyle self-reflection.
* **Step Progression:**
  1. *Sleep Hygiene:* Duration (hours), schedule consistency (1–5), quality (1–5), wake freshness (1–5).
  2. *Physical Activity:* Exercise duration (min), weekly frequency (days), daily steps, sedentary sitting hours.
  3. *Nutrition & Hydration:* Water volume (liters), hydration habits, meal regularity (1–3), fruit/vegetables, junk food frequency.
  4. *Mental Wellness:* Perceived stress level (1–10), mindfulness minutes, study/work-life balance (1–5).
  5. *Digital Habits:* Recreational screen hours, work screen hours, screen breaks, pre-bed screen exposure.
  6. *Habits & Review:* Caffeine cups, smoking, alcohol, optional notes, and final submission.

### 6. Assessment Results Breakdown (`/assessment/results`)
* **Purpose:** Immediate in-depth scientific breakdown following questionnaire submission.
* **Key Features:**
  * Composite LWI Score and Risk Classification Tier.
  * Itemized Audit Deductions list (e.g. `-18.0 pts: Screen time exceeds 6h threshold`).
  * Direct "Download Official PDF Report" button.
  * Navigation links to AI Cluster Analysis and Habit Action Center.

### 7. AI & Machine Learning Analysis (`/ai-analysis`)
* **Purpose:** Visual transparency into Scikit-Learn unsupervised clustering and anomaly algorithms.
* **Key Features:**
  * **2D PCA Demographic Scatter Plot:** Graphical representation of the 4 population cluster centroids alongside the user's specific latent coordinates.
  * **Population Archetype Cards:** Profiles explaining the behavioral traits of all 4 KMeans clusters.
  * **Isolation Forest Anomaly Card:** Explains whether the user's habit combination was flagged as an outlier, displaying decision score and specific driving factors.

### 8. Personalized Recommendations (`/recommendations`)
* **Purpose:** Action-oriented micro-habit habit center.
* **Key Features:**
  * Filter pills by Category (Sleep, Physical Activity, Hydration, Nutrition, Mental, Digital) and Priority (High, Medium, Low, Positive Strengths).
  * Habit Completion Progress Bar.
  * Interactive "Mark Done" toggle button that updates backend state via `PATCH /toggle`.
  * Physiological justification text ("Why this works") for each habit.

### 9. Analytics & Longitudinal Trends (`/analytics`)
* **Purpose:** Longitudinal behavioral tracking across time-series evaluation checkpoints.
* **Key Features:**
  * Area chart mapping score development over sessions.
  * Metric KPIs: Average Index, Peak Milestone, Total Net Delta (+/- points), Checkpoint Count.
  * 6-Pillar Population Benchmark Comparison Table.

### 10. Assessment Session History (`/history`)
* **Purpose:** Audit trail of all previous evaluation sessions.
* **Key Features:**
  * Interactive data table listing Session ID, Date/Time, Score, Risk Tier, Archetype, and Anomaly Status.
  * Row Actions: "Download PDF Report" icon, "View Detail" icon, and "Delete Session" icon with confirmation modal.

### 11. User Profile (`/profile`)
* **Purpose:** Personal demographics and biometric monitoring.
* **Key Features:** Dynamic Body Mass Index (BMI) calculator with health category badges (Normal, Overweight, High BMI), and editable form persisting changes to SQLite via `PUT /api/auth/profile`.

### 12. Settings & Appearance (`/settings`)
* **Purpose:** User preferences and data management.
* **Key Features:**
  * Visual Theme Toggle (Deep Navy Dark Mode vs. Clean Light Mode).
  * Notification toggles for habit reminders.
  * "Export Data Backup" button generating complete user JSON data export.
  * Ethical compliance and academic disclaimer.

---

## PART 2: Project Demonstration Guide (For Viva Voce)

Follow this 5-minute live demonstration flow during project presentation:

1. **Start the Platform:** Run `run_all.bat`. Show the two operational command prompts (Backend on port 8000, Frontend on port 5173).
2. **Open Landing Page:** Navigate to `http://localhost:5173`. Highlight the clean typography, glassmorphism cards, and modern UI aesthetic.
3. **Showcase Authentication:** Click "Sign In", then click "Instant Demo Access" to demonstrate frictionless evaluator login with pre-configured student data.
4. **Demonstrate Dashboard:**
   - Explain the 270° SVG Radial Gauge and LifeSync Wellness Index.
   - Point out the 6-Pillar Radar Chart comparing the student's scores against population averages.
   - Show the Historical Trajectory area chart.
5. **Conduct Live Lifestyle Assessment:**
   - Click "New Assessment" (`/assessment`).
   - Walk through the 6 wizard steps, noting the clean step indicators and input validations.
   - Submit the assessment and showcase the instant results breakdown.
6. **Download Official PDF Report:**
   - Click "Download PDF Report" on the Results page.
   - Open the generated `LifeSync_Report_#{id}.pdf` in a browser or PDF viewer, demonstrating ReportLab styling, table formatting, and disclaimers.
7. **Explain Machine Learning Insights:**
   - Navigate to `/ai-analysis`.
   - Explain the 2D PCA Scatter plot showing where the student's habits sit relative to the 4 population centroids.
   - Discuss the Isolation Forest anomaly detection score.
8. **Demonstrate Habit Action Center:**
   - Navigate to `/recommendations`.
   - Filter by "Sleep" or "Digital Habits".
   - Click "Mark Done" on a recommendation; show how the progress bar reactively updates to 100%.
9. **Highlight Theme & Responsiveness:**
   - Toggle into Light Mode via the Sun icon; demonstrate crisp high contrast.
   - Toggle back to Dark Mode.
   - Resize browser to mobile width; demonstrate the responsive collapsible navigation drawer.

---

## PART 3: University Viva Voce Questions & Answers

### 1. Artificial Intelligence & Machine Learning

**Q1: What is the difference between supervised and unsupervised learning, and why did you use unsupervised learning in LifeSync AI?**  
*Answer:* Supervised learning requires labeled ground-truth targets (e.g., classifying an X-ray as "pneumonia: yes/no"). In preventative lifestyle wellness, there are no fixed clinical diagnosis labels for daily habits. Therefore, we used **unsupervised learning** (K-Means and Isolation Forest) to discover inherent population groupings (lifestyle archetypes) and detect statistical anomalies without relying on artificial or biased labels.

**Q2: What is the role of K-Means clustering in your project?**  
*Answer:* K-Means ($k=4$) clusters users based on a 10-dimensional standardized lifestyle feature vector. It partitions users into 4 distinct behavioral archetypes: *Balanced High-Achiever, Sedentary Overextended, Irregular Burnout,* and *Wellness Optimizer*. This contextualizes the user's habits against realistic population peer cohorts.

**Q3: How did you select $k=4$ for K-Means?**  
*Answer:* We evaluated cluster quality using the **Elbow Method** (plotting within-cluster sum of squares / inertia against values of $k \in [2, 8]$) and **Silhouette Analysis**. At $k=4$, the inertia curve exhibits a distinct inflection point, and the silhouette score reaches approximately 0.38 with balanced cluster membership and clear semantic interpretability.

**Q4: How does Isolation Forest work, and what is its purpose in LifeSync AI?**  
*Answer:* Isolation Forest is an ensemble tree algorithm that isolates anomalies rather than modeling normal points. It constructs random decision trees; because anomalies have extreme or contradictory attribute values, they require significantly fewer partitions to isolate, resulting in shorter average path lengths in the trees. In LifeSync AI, it identifies unusual or dangerous lifestyle combinations—such as extreme screen time coupled with severe sleep deprivation and high caffeine.

**Q5: Why did you use Principal Component Analysis (PCA)?**  
*Answer:* Our lifestyle feature space has 10 dimensions, which cannot be directly visualized on a 2D screen. PCA performs orthogonal linear transformation to project these 10 dimensions onto 2 principal components that capture the maximum variance (>70%). This allows us to plot the user's position relative to population cluster centroids on an intuitive 2D scatter chart.

---

### 2. Python, Data Science & Backend Architecture

**Q6: What role do Pandas and NumPy play in your backend?**  
*Answer:* **NumPy** handles vectorized numerical operations, Euclidean distance computations to cluster centroids, and matrix operations. **Pandas** manages DataFrame structures for feature vector extraction, missing value imputation, and synthetic population dataset generation.

**Q7: Why did you choose FastAPI over Flask or Django?**  
*Answer:* FastAPI is built on Starlette and Pydantic, offering asynchronous (`async/await`) execution with performance comparable to NodeJS and Go. It provides automatic data validation using Python type hints, automatic interactive OpenAPI/Swagger documentation (`/docs`), and lightweight, modular router architecture.

**Q8: How does your deterministic Wellness Scoring algorithm work?**  
*Answer:* Unlike opaque "black-box" systems, our LifeSync Wellness Index (LWI) is calculated deterministically: each of the 6 pillars (Sleep, Activity, Hydration, Nutrition, Mental Health, Digital Habits) is scored on a normalized 0–100 scale using continuous mathematical formulas. The composite score is a weighted average with explicit deductions logged for audited risk factors (e.g. excessive sitting or late-night screen exposure).

**Q9: How are personalized recommendations generated?**  
*Answer:* The recommendation engine analyzes the gap between the user's score and optimal thresholds across all 6 pillars, incorporates the K-Means cluster context and Isolation Forest anomaly tags, and checks prior assessment trends. It matches deficiencies against an evidence-based rule catalog, generates prioritized actionable micro-habits with physiological justifications ("why this works"), and avoids repetitive advice.

**Q10: How did you generate the PDF reports?**  
*Answer:* We used **ReportLab** in Python to programmatically assemble a styled two-page document flow using `SimpleDocTemplate`, custom `ParagraphStyle` typography, and structured `Table` grids. The generated PDF is streamed directly to the browser as a binary `StreamingResponse` with `application/pdf` headers.

---

### 3. Frontend, Database & Security

**Q11: Why did you choose React with Vite instead of Create React App?**  
*Answer:* Create React App uses Webpack and is deprecated; **Vite** leverages native ES modules in the browser and esbuild in Go, resulting in near-instant development server start times (<300ms) and lightning-fast Hot Module Replacement (HMR).

**Q12: How is authentication and security implemented?**  
*Answer:* We use **bcrypt** with salt rounds to hash user passwords so raw passwords are never saved in the database. Upon login, the backend issues an **HS256 signed JWT (JSON Web Token)** containing the user ID and expiration time. The frontend stores this token and injects it via an Axios interceptor as a `Bearer` token in the `Authorization` header. Protected routes verify the token and enforce multi-tenant isolation so users can only access their own records.

**Q13: Why did you choose SQLite, and how do you prevent database locking?**  
*Answer:* SQLite is a serverless, zero-configuration relational database stored as a single file, making it ideal for academic projects and local evaluation without requiring external database servers (like MySQL or PostgreSQL). We configured SQLite with **Write-Ahead Logging (WAL mode)** via `PRAGMA journal_mode=WAL;`, which allows concurrent readers without blocking writers.

**Q14: How does LifeSync AI handle light and dark mode?**  
*Answer:* We use a `ThemeContext` managing a `dark` class on the HTML root element combined with Tailwind CSS `darkMode: 'class'` utilities and CSS custom variables. Dark mode uses Deep Navy (`#070b16` / `#0c1222`) surfaces with violet/teal accents, while Light mode uses clean neutral white and soft slate backgrounds.

**Q15: What is the academic and ethical disclaimer of your project?**  
*Answer:* LifeSync AI is strictly an educational self-reflection and lifestyle optimization tool. It explicitly states across UI banners and generated PDF reports that it does **NOT** provide clinical diagnoses, medical advice, or healthcare interventions. Users experiencing acute physical or mental distress are advised to consult licensed medical professionals.
