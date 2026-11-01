"""
LifeSync AI - Intelligent Conversational AI Assistant Service
Hybrid Engine:
- Uses Google Gemini API or OpenAI API if configured.
- Seamlessly falls back to a comprehensive local Knowledge Base & NLP Intent Retrieval Engine.
- Dynamically injects live user context (LWI score, cluster archetype, anomaly flag, BMI, recommendations).
"""
import re
import json
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

# System Knowledge Context for LLMs
LIFESYNC_KNOWLEDGE_BASE = """
You are the official AI Wellness Assistant for LifeSync AI (Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform).
Your purpose is to assist users, students, and evaluators with comprehensive knowledge about the platform's services, architecture, algorithms, and their personal wellness data.

PROJECT ARCHITECTURE & CORE SERVICES:
1. Holistic 6-Pillar Lifestyle Evaluation:
   - Sleep Hygiene & Rest: Assesses daily duration, wake-up freshness, and circadian rhythm consistency (1-5 scale).
   - Physical Activity & Movement: Evaluates exercise minutes, weekly frequency, step count, and sedentary sitting hours.
   - Nutrition & Hydration: Evaluates daily water intake (liters), hydration regularity, meal timing consistency, fruit/vegetable intake, and junk food frequency.
   - Mental Wellbeing & Stress: Evaluates perceived psychological stress (1-10), daily mindfulness/meditation minutes, and work/study-life balance.
   - Digital Hygiene: Evaluates productive work screen hours, recreational screen hours, screen break regularity, and pre-bed blue light exposure.
   - Substance Habits & Recovery: Audits caffeine intake (cups/day), tobacco use, and alcohol consumption.

2. Deterministic Scoring Algorithm:
   - LifeSync Wellness Index (LWI): Continuous composite score from 0.0 to 100.0 computed through weighted multidimensional mathematical formulas.
   - Risk Tiers: Optimal (>=80), Good (65-79), Moderate Risk (50-64), Elevated Risk (<50).
   - Itemized Audit Deductions: Transparently logged penalties (e.g., -18 pts for screen time >6h, -10 pts for sleep <6h, -6 pts for sedentary sitting >5h).

3. Machine Learning Subsystem (Scikit-Learn):
   - K-Means Clustering (k=4): Segmented on N=1,500 population samples into 4 lifestyle archetypes:
     * Cluster 0: Balanced High-Achiever (optimal sleep, regular workouts, low stress, balanced habits)
     * Cluster 1: Sedentary Overextended (high screen hours, prolonged desk sitting, moderate exercise deficit)
     * Cluster 2: Irregular Burnout (high stress, severe sleep deficit, elevated caffeine, irregular hours)
     * Cluster 3: Wellness Optimizer (high physical training, proactive hydration, structured mindfulness)
   - 2D Principal Component Analysis (PCA): Projects 10-dimensional lifestyle features onto 2 primary components (preserving >70% variance) for scatter plot visualization.
   - Isolation Forest Anomaly Detection (100 trees, contamination=0.08): Flags atypical, contradictory lifestyle combinations (e.g. extreme screen immersion with severe sleep deficit).

4. Personalized Habit Recommendation Engine:
   - Generates prioritized, category-specific micro-habits based on scoring gaps, ML cluster context, and longitudinal progress.
   - Prioritizes into High, Medium, Low, and Positive Strengths.
   - Each recommendation includes an Identified Observation, Actionable Step, and Physiological Justification ("Why this works").
   - Users can interactively track daily habits via "Mark Done" toggles.

5. Executive PDF Report Generation:
   - ReportLab-powered PDF engine generating branded executive reports with score tables, cluster findings, and diagnostic disclaimers.

6. Security & Ethics:
   - Passwords hashed with bcrypt; sessions authenticated via signed HS256 JWT tokens.
   - Strict multi-tenant data isolation.
   - Clear ethical disclaimer: LifeSync AI is an educational self-reflection platform, NOT a clinical diagnostic device.
"""

FAQ_LIST = [
    {
        "category": "General",
        "question": "What is LifeSync AI?",
        "answer": "LifeSync AI is an intelligent full-stack lifestyle wellness intelligence and risk assessment platform that audits 6 lifestyle dimensions (Sleep, Activity, Hydration, Nutrition, Mental Health, and Digital Habits) using explainable scoring and genuine Machine Learning."
    },
    {
        "category": "Scoring",
        "question": "How is the LifeSync Wellness Index (LWI) calculated?",
        "answer": "The LWI is a deterministic 0-100 composite score computed from weighted multi-pillar formulas with transparent audit deductions logged for specific lifestyle risk factors like prolonged sitting or sleep deficits."
    },
    {
        "category": "Machine Learning",
        "question": "Which Machine Learning models are used?",
        "answer": "We use Scikit-Learn: K-Means (k=4) for demographic clustering into 4 archetypes, 2D Principal Component Analysis (PCA) for latent space projection (>70% variance), and Isolation Forest for multivariate anomaly detection."
    },
    {
        "category": "Recommendations",
        "question": "How do personalized recommendations work?",
        "answer": "Our recommendation engine identifies your specific scoring gaps, cluster archetype, and longitudinal trends, matching them against an evidence-based catalog to generate actionable micro-habits with physiological justifications."
    },
    {
        "category": "Reports",
        "question": "Can I download an official report?",
        "answer": "Yes! You can download a professionally formatted PDF wellness report powered by ReportLab directly from the Assessment Results, Dashboard, or History pages."
    }
]


def extract_user_context(current_user: Any, db_session: Any) -> Dict[str, Any]:
    """Helper to extract user profile and latest wellness data for chat personalization."""
    if not current_user:
        return {}

    from app.models.assessment import LifestyleAssessment, WellnessScore, MLAnalysisResult, WellnessRecommendation

    context = {
        "user_name": current_user.profile.full_name if current_user.profile else "Valued User",
        "email": current_user.email,
        "age": current_user.profile.age if current_user.profile else None,
        "gender": current_user.profile.gender if current_user.profile else None,
        "occupation": current_user.profile.occupation if current_user.profile else None,
        "height_cm": current_user.profile.height_cm if current_user.profile else None,
        "weight_kg": current_user.profile.weight_kg if current_user.profile else None,
    }

    if context["height_cm"] and context["weight_kg"] and context["height_cm"] > 0:
        h_m = context["height_cm"] / 100.0
        context["bmi"] = round(context["weight_kg"] / (h_m * h_m), 1)

    # Fetch user's latest assessment
    latest = (
        db_session.query(LifestyleAssessment)
        .filter(LifestyleAssessment.user_id == current_user.id)
        .order_by(LifestyleAssessment.created_at.desc())
        .first()
    )

    if latest:
        context["has_assessment"] = True
        context["assessment_id"] = latest.id
        context["assessed_at"] = latest.created_at.strftime("%b %d, %Y")
        
        if latest.wellness_score:
            context["lwi"] = latest.wellness_score.composite_lwi
            context["risk_tier"] = latest.wellness_score.risk_tier
            context["pillars"] = {
                "sleep": latest.wellness_score.sleep_score,
                "activity": latest.wellness_score.activity_score,
                "nutrition": latest.wellness_score.nutrition_score,
                "stress": latest.wellness_score.stress_score,
                "screen": latest.wellness_score.screen_score,
                "habits": latest.wellness_score.habits_score,
            }
        
        if latest.ml_result:
            context["cluster_name"] = latest.ml_result.cluster_name
            context["is_anomaly"] = latest.ml_result.is_anomaly
            context["anomaly_score"] = latest.ml_result.anomaly_score

        # Pending recommendations
        recs = (
            db_session.query(WellnessRecommendation)
            .filter(WellnessRecommendation.assessment_id == latest.id)
            .all()
        )
        context["pending_recs"] = [r.title for r in recs if not r.is_completed][:3]
        context["completed_recs_count"] = sum(1 for r in recs if r.is_completed)
        context["total_recs_count"] = len(recs)
    else:
        context["has_assessment"] = False

    return context


def get_offline_response(user_query: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Intelligent local Natural Language & Knowledge Retrieval Engine.
    Executes intent matching, personal context injection, and structured suggestions.
    Works 100% offline without requiring external API keys.
    """
    q = user_query.lower().strip()
    name = user_context.get("user_name", "Friend")
    suggestions = []

    # 1. Greetings & Identity
    if re.search(r"\b(hi|hello|hey|greetings|good morning|good evening|who are you)\b", q):
        reply = (
            f"Hello {name}! 👋 I am **LifeSync AI Assistant**, your dedicated lifestyle health intelligence and platform guide.\n\n"
            f"I can help you understand your wellness score, explain the 6 lifestyle pillars, clarify how our K-Means clustering and Isolation Forest models work, "
            f"or guide you through habit recommendations and PDF report downloads.\n\n"
            f"How can I assist you with your wellness journey today?"
        )
        suggestions = ["What is my current score?", "How does K-Means work?", "Explain the 6 pillars", "How do I download my PDF report?"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 2. User Personal Score & Wellness Metrics Query
    if re.search(r"\b(my score|my lwi|my status|how am i doing|my assessment|current score|my metrics)\b", q):
        if user_context.get("has_assessment"):
            lwi = user_context.get("lwi", 78.5)
            tier = user_context.get("risk_tier", "Optimal")
            date = user_context.get("assessed_at", "recently")
            cluster = user_context.get("cluster_name", "Balanced High-Achiever")
            is_anomaly = user_context.get("is_anomaly", False)
            pillars = user_context.get("pillars", {})

            anomaly_str = "⚠️ **Note:** Isolation Forest detected an irregular pattern." if is_anomaly else "✅ Your habit profile aligns within normal population variance."

            reply = (
                f"📊 **Here is your latest wellness summary, {name}:**\n\n"
                f"- **LifeSync Wellness Index (LWI):** **{lwi:.1f} / 100** ({tier} Tier)\n"
                f"- **Assigned Population Archetype:** **{cluster}**\n"
                f"- **Evaluation Date:** {date}\n"
                f"- **Anomaly Status:** {anomaly_str}\n\n"
                f"**Six Pillars Breakdown:**\n"
                f"• Sleep: **{pillars.get('sleep', 0):.0f}/100**\n"
                f"• Physical Activity: **{pillars.get('activity', 0):.0f}/100**\n"
                f"• Nutrition & Hydration: **{pillars.get('nutrition', 0):.0f}/100**\n"
                f"• Mental Wellbeing: **{pillars.get('stress', 0):.0f}/100**\n"
                f"• Digital Hygiene: **{pillars.get('screen', 0):.0f}/100**\n"
                f"• General Habits: **{pillars.get('habits', 0):.0f}/100**\n\n"
                f"Would you like to explore targeted habit recommendations to boost your lowest scoring dimensions?"
            )
            suggestions = ["Show my habit recommendations", "What is my assigned cluster?", "How do I download my PDF report?"]
        else:
            reply = (
                f"Hi {name}! You haven't submitted a lifestyle questionnaire yet. "
                f"Please take our **6-step lifestyle assessment** to generate your personal LifeSync Wellness Index, AI cluster assignment, and habit plan!"
            )
            suggestions = ["How to take an assessment?", "What are the 6 pillars?", "Tell me about LifeSync AI"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 3. User BMI & Biometric Profile Query
    if re.search(r"\b(my bmi|body mass index|my height|my weight|my profile)\b", q):
        h = user_context.get("height_cm")
        w = user_context.get("weight_kg")
        bmi = user_context.get("bmi")
        occ = user_context.get("occupation", "Student")
        if h and w and bmi:
            bmi_cat = "Normal Weight" if 18.5 <= bmi < 25 else ("Underweight" if bmi < 18.5 else "Overweight")
            reply = (
                f"👤 **Your Recorded Biometric Profile ({name}):**\n\n"
                f"- **Height:** {h:.0f} cm\n"
                f"- **Weight:** {w:.1f} kg\n"
                f"- **Calculated BMI:** **{bmi} kg/m²** ({bmi_cat})\n"
                f"- **Role / Occupation:** {occ}\n\n"
                f"You can update these parameters anytime on the **User Profile** page (`/profile`)."
            )
        else:
            reply = f"Hi {name}! Your height and weight have not been set completely. Visit the **User Profile** page (`/profile`) to update your biometric baselines."
        suggestions = ["What is my score?", "Explain the 6 pillars", "How does K-Means work?"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 4. K-Means Clustering & Archetypes Explanation
    if re.search(r"\b(kmeans|k-means|cluster|archetype|archetypes|clusters)\b", q):
        reply = (
            "🤖 **Unsupervised K-Means Clustering ($k=4$) in LifeSync AI:**\n\n"
            "We use Scikit-Learn's K-Means algorithm to partition 10-dimensional standardized lifestyle features into **4 empirical population archetypes**:\n\n"
            "1. **Balanced High-Achiever (Cluster 0):** Optimal sleep (7-8h), regular workouts (35-50 min), balanced hydration, and low stress.\n"
            "2. **Sedentary Overextended (Cluster 1):** Heavy screen exposure (>8h), prolonged desk sitting, and moderate exercise deficit.\n"
            "3. **Irregular Burnout (Cluster 2):** High stress, severe sleep inconsistency, late-night screen immersion, and elevated caffeine.\n"
            "4. **Wellness Optimizer (Cluster 3):** Active training (>45 min/day), disciplined hydration, and structured mindfulness.\n\n"
            "The model minimizes within-cluster sum of squares (WCSS) and was validated via Elbow and Silhouette methods ($s \\approx 0.38$)."
        )
        suggestions = ["What cluster am I in?", "What is PCA?", "What is Isolation Forest?"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 5. Isolation Forest Anomaly Detection Query
    if re.search(r"\b(isolation forest|anomaly|outlier|irregular pattern)\b", q):
        reply = (
            "🌲 **Isolation Forest Anomaly Detection in LifeSync AI:**\n\n"
            "Isolation Forest is an unsupervised tree ensemble algorithm ($t=100$ trees, `contamination=0.08`) designed to detect atypical lifestyle risks:\n\n"
            "- **How it works:** Instead of profiling normal points, it isolates anomalies. Outliers with extreme or contradictory habits (e.g., screen time $>14\\text{h}$ + sleep $<4\\text{h}$) require significantly fewer random splits to isolate, resulting in shorter tree path lengths.\n"
            "- **Decision Score:** A negative decision score flags an anomaly, triggering an explanation of specific contributing factors.\n"
            "- **Clinical Value:** Alerts students to emerging burnout risks before physiological consequences manifest."
        )
        suggestions = ["Did I trigger an anomaly?", "How does K-Means work?", "What is my current score?"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 6. Principal Component Analysis (PCA) Query
    if re.search(r"\b(pca|principal component|2d plot|scatter plot|latent)\b", q):
        reply = (
            "📈 **2D Principal Component Analysis (PCA) in LifeSync AI:**\n\n"
            "Our lifestyle questionnaire collects 10 continuous numerical features, which cannot be directly viewed on a 2D screen. "
            "PCA performs orthogonal linear transformation to project these 10 dimensions onto 2 principal components:\n\n"
            "- **PC1 (~46.2% variance):** Represents positive lifestyle momentum (physical activity, sleep regularity, hydration).\n"
            "- **PC2 (~25.5% variance):** Represents sedentary stress load (sitting hours, perceived stress, screen hours).\n"
            "- **Total Explained Variance:** **>70%**, enabling a faithful 2D demographic projection on `/ai-analysis`."
        )
        suggestions = ["How does K-Means work?", "What is my score?", "View AI Analysis"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 7. Six Pillars Explanation
    if re.search(r"\b(pillars|6 pillars|dimensions|categories|what do you track)\b", q):
        reply = (
            "🌿 **The Six Core Lifestyle Pillars in LifeSync AI:**\n\n"
            "1. **Sleep Hygiene & Rest:** Daily sleep hours, sleep quality, wake freshness, circadian schedule consistency.\n"
            "2. **Physical Activity & Movement:** Active minutes, weekly workout frequency, step counts, sedentary sitting hours.\n"
            "3. **Nutrition & Hydration:** Daily water volume, hydration regularity, meal consistency, fruit & vegetable servings.\n"
            "4. **Mental Wellbeing:** Perceived psychological stress scale (1-10), mindfulness minutes, study/work-life balance.\n"
            "5. **Digital Hygiene:** Recreational vs work screen hours, screen break regularity, pre-bed blue light exposure.\n"
            "6. **General Habits & Recovery:** Caffeine consumption, tobacco, alcohol, and restorative recovery routines."
        )
        suggestions = ["How is the score calculated?", "What is my current score?", "Show recommendations"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 8. Scoring & Deduction Rules Query
    if re.search(r"\b(how is score calculated|scoring algorithm|lwi|deductions|risk tier)\b", q):
        reply = (
            "⚖️ **Explainable Lifestyle Wellness Scoring Methodology:**\n\n"
            "1. **Normalized Evaluation:** Each of the 6 pillars is computed on a 0-100 scale using continuous mathematical formulas based on validated health guidelines.\n"
            "2. **Weighted Composition:** The overall LifeSync Wellness Index (LWI) is a weighted combination across the 6 pillars.\n"
            "3. **Audit Deductions:** Explicit penalties are logged transparently:\n"
            "   • Prolonged screen time (>6h): up to -18 pts\n"
            "   • Severe sleep deficit (<6h): up to -14 pts\n"
            "   • Sedentary sitting (>5h): up to -10 pts\n"
            "   • Heavy caffeine (>3 cups): -4 pts\n"
            "   • Screen before bed: -3 pts\n"
            "4. **Risk Tiers:** Optimal (80-100), Good (65-79), Moderate Risk (50-64), Elevated Risk (<50)."
        )
        suggestions = ["What is my score?", "Explain the 6 pillars", "Show recommendations"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 9. Recommendations & Habit Tracking Query
    if re.search(r"\b(recommendations|habits|action plan|mark done|habit actions)\b", q):
        pending = user_context.get("pending_recs", [])
        pending_str = ""
        if pending:
            pending_str = "\n\n**Your Top Pending Habits:**\n" + "\n".join([f"• {p}" for p in pending])

        reply = (
            f"🎯 **Personalized Habit Action Center:**\n\n"
            f"LifeSync AI generates prioritized micro-habits tailored to your identified scoring deficits and cluster context.\n\n"
            f"- **Scientific Justification:** Every recommendation includes an Identified Observation, Action Item, and Physiological Reason ('Why this works').\n"
            f"- **Interactive Tracking:** Click the **'Mark Done'** button on `/recommendations` to toggle daily completion, which persists directly to the database!{pending_str}"
        )
        suggestions = ["What is my score?", "How do I download my PDF report?", "Explain K-Means"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 10. PDF Report Download Query
    if re.search(r"\b(pdf|report|download report|export pdf|print)\b", q):
        reply = (
            "📄 **Official PDF Wellness Report Generation:**\n\n"
            "LifeSync AI includes a built-in ReportLab PDF compiler that generates executive evaluation reports.\n\n"
            "**How to Download:**\n"
            "1. Visit **Assessment Results** (`/assessment/results`), **Dashboard** (`/dashboard`), or **History** (`/history`).\n"
            "2. Click the **'Download PDF Report'** button.\n"
            "3. The system generates and streams `LifeSync_Report_#{id}.pdf` with complete score tables, pillar radars, cluster findings, and ethical disclaimers."
        )
        suggestions = ["What is my score?", "What are the 6 pillars?", "Tell me about LifeSync AI"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 11. Medical / Diagnostic Queries (Safety Filter)
    if re.search(r"\b(diagnose|cure|medicine|doctor|disease|treatment|illness|am i sick)\b", q):
        reply = (
            "⚕️ **Important Educational & Safety Disclaimer:**\n\n"
            "LifeSync AI is an **educational self-reflection and lifestyle optimization platform**, developed as an MCA academic project. "
            "Our models and scores do **NOT** constitute medical diagnoses, clinical advice, or treatment prescriptions.\n\n"
            "If you are experiencing acute physical symptoms, psychological distress, or medical conditions, please consult a licensed healthcare professional or medical clinic immediately."
        )
        suggestions = ["What is my wellness score?", "Explain the 6 pillars", "What is LifeSync AI?"]
        return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}

    # 12. Default Comprehensive Overview
    reply = (
        f"LifeSync AI is your intelligent lifestyle companion, {name}! "
        f"I can assist you with:\n\n"
        f"• **Scoring:** Explaining your LifeSync Wellness Index (0-100) and deduction rules.\n"
        f"• **AI / ML Models:** Clarifying K-Means clustering (k=4), 2D PCA scatter plots, and Isolation Forest anomaly detection.\n"
        f"• **Habits:** Reviewing prioritized recommendations and tracking completion ('Mark Done').\n"
        f"• **Reporting:** Guiding you on generating and downloading your official ReportLab PDF report.\n\n"
        f"What would you like to explore next?"
    )
    suggestions = ["What is my current score?", "How does K-Means work?", "Explain the 6 pillars", "How do I download my PDF report?"]
    return {"reply": reply, "suggestions": suggestions, "context_used": True, "engine": "offline_knowledge_engine"}


async def process_chat_message(
    user_message: str,
    history: Optional[List[Dict[str, str]]] = None,
    current_user: Any = None,
    db_session: Any = None,
) -> Dict[str, Any]:
    """
    Main entrypoint: Hybrid AI Engine.
    Tries Google Gemini API / OpenAI API first if keys are present; falls back seamlessly to local engine.
    """
    user_context = extract_user_context(current_user, db_session) if (current_user and db_session) else {}

    # Check for Google Gemini API key
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 10:
        try:
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            
            prompt_context = f"{LIFESYNC_KNOWLEDGE_BASE}\n\nCURRENT USER DATA:\n{json.dumps(user_context, indent=2)}\n\nUSER QUESTION: {user_message}"
            
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(
                    gemini_url,
                    json={
                        "contents": [{"parts": [{"text": prompt_context}]}],
                        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 600},
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "reply": reply_text,
                        "suggestions": ["What is my current score?", "How does K-Means work?", "Explain my recommendations"],
                        "context_used": True,
                        "engine": "gemini",
                    }
        except Exception:
            pass  # Fall through to local engine

    # Check for OpenAI API key
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 10:
        try:
            openai_url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"}
            messages = [
                {"role": "system", "content": f"{LIFESYNC_KNOWLEDGE_BASE}\n\nUser Context:\n{json.dumps(user_context)}"},
                {"role": "user", "content": user_message},
            ]
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(
                    openai_url,
                    headers=headers,
                    json={"model": "gpt-3.5-turbo", "messages": messages, "temperature": 0.3},
                )
                if res.status_code == 200:
                    data = res.json()
                    reply_text = data["choices"][0]["message"]["content"]
                    return {
                        "reply": reply_text,
                        "suggestions": ["What is my current score?", "How does K-Means work?", "Explain my recommendations"],
                        "context_used": True,
                        "engine": "openai",
                    }
        except Exception:
            pass  # Fall through to local engine

    # Offline Intelligent Engine (Default & Reliable)
    return get_offline_response(user_message, user_context)
