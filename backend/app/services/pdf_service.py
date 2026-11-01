"""
LifeSync AI - PDF Assessment Report Generation Service
Generates a comprehensive, professional lifestyle wellness report using ReportLab.
"""
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


def generate_lifestyle_pdf_report(assessment_detail: dict, user_profile: dict = None) -> bytes:
    """
    Generate an executive PDF report for a lifestyle assessment.
    
    Args:
        assessment_detail: Serialized AssessmentDetail dict containing inputs, scores, ml_insights, and recommendations.
        user_profile: Optional dict containing user full_name, email, age, gender, occupation, height_cm, weight_kg.
        
    Returns:
        bytes: Binary PDF content.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Styles
    brand_dark = colors.HexColor("#0f172a")     # Slate 900
    brand_primary = colors.HexColor("#6366f1")  # Indigo 500
    brand_teal = colors.HexColor("#0d9488")     # Teal 600
    brand_subtext = colors.HexColor("#475569")  # Slate 600
    brand_bg = colors.HexColor("#f8fafc")       # Slate 50
    border_color = colors.HexColor("#e2e8f0")   # Slate 200

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=brand_dark,
        spaceAfter=4,
    )
    
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=brand_subtext,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=brand_dark,
        spaceBefore=12,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=brand_dark,
    )

    badge_style = ParagraphStyle(
        "BadgeText",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.white,
    )

    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#64748b"),
        alignment=1, # Center
    )

    story = []

    # 1. Header with Brand Identity
    header_data = [
        [
            Paragraph("<b>LifeSync AI</b> — Lifestyle Health Assessment", title_style),
            Paragraph(f"<b>Report Date:</b> {datetime.now().strftime('%b %d, %Y')}<br/><b>Session ID:</b> #{assessment_detail.get('id', 'N/A')}", subtitle_style),
        ]
    ]
    header_table = Table(header_data, colWidths=[4.2 * inch, 3.2 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=brand_primary, spaceBefore=4, spaceAfter=12))

    # 2. Patient / User Profile Summary
    profile = user_profile or {}
    full_name = profile.get("full_name") or "LifeSync User"
    age = profile.get("age", "N/A")
    gender = str(profile.get("gender", "N/A")).capitalize()
    occupation = profile.get("occupation", "Student / Professional")
    height = profile.get("height_cm")
    weight = profile.get("weight_kg")
    
    bmi_str = "N/A"
    if height and weight and height > 0:
        bmi = weight / ((height / 100) ** 2)
        bmi_str = f"{bmi:.1f} kg/m²"

    user_info_data = [
        [
            Paragraph(f"<b>Name:</b> {full_name}", body_style),
            Paragraph(f"<b>Age / Gender:</b> {age} yrs / {gender}", body_style),
            Paragraph(f"<b>Occupation:</b> {occupation}", body_style),
            Paragraph(f"<b>BMI:</b> {bmi_str}", body_style),
        ]
    ]
    user_info_table = Table(user_info_data, colWidths=[2.2 * inch, 1.8 * inch, 2.0 * inch, 1.4 * inch])
    user_info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), brand_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(user_info_table)
    story.append(Spacer(1, 14))

    # 3. Overall Score & Risk Classification
    scores = assessment_detail.get("scores", {})
    lwi = scores.get("composite_lwi", 0.0)
    risk_tier = scores.get("risk_tier", "Moderate Risk")
    
    # Determine risk badge color
    risk_color = brand_teal if "low" in risk_tier.lower() or "optimal" in risk_tier.lower() else (
        colors.HexColor("#f59e0b") if "moderate" in risk_tier.lower() else colors.HexColor("#ef4444")
    )

    score_card_data = [
        [
            Paragraph(
                f"<font size='11'><b>Composite Lifestyle Wellness Index (LWI)</b></font><br/>"
                f"<font size='26' color='{brand_primary.hexval()}'><b>{lwi:.1f}</b></font> <font size='14' color='#64748b'>/ 100</font>",
                body_style,
            ),
            Paragraph(
                f"<font size='10'><b>Risk Classification Tier</b></font><br/>"
                f"<font size='15' color='{risk_color.hexval()}'><b>{risk_tier}</b></font><br/>"
                f"<font size='8' color='#64748b'>Multi-attribute lifestyle evaluation</font>",
                body_style,
            ),
        ]
    ]
    score_card_table = Table(score_card_data, colWidths=[4.2 * inch, 3.2 * inch])
    score_card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#eef2ff")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#c7d2fe")),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(score_card_table)
    story.append(Spacer(1, 14))

    # 4. Six Pillars Breakdown Table
    story.append(Paragraph("<b>Six Lifestyle Pillars Performance</b>", section_heading))
    pillars = scores.get("pillars", {})
    
    def pillar_tier(val):
        if val >= 80:
            return "Optimal", colors.HexColor("#10b981")
        elif val >= 65:
            return "Good", colors.HexColor("#06b6d4")
        elif val >= 50:
            return "Moderate", colors.HexColor("#f59e0b")
        return "Needs Focus", colors.HexColor("#ef4444")

    pillar_rows = [
        [
            Paragraph("<b>Pillar Dimension</b>", body_style),
            Paragraph("<b>Score (/100)</b>", body_style),
            Paragraph("<b>Benchmark</b>", body_style),
            Paragraph("<b>Status Tier</b>", body_style),
        ]
    ]

    pillar_map = [
        ("Sleep Hygiene & Rest", pillars.get("sleep", 0.0), "70.0"),
        ("Physical Activity & Movement", pillars.get("physical_activity", 0.0), "62.0"),
        ("Nutrition & Hydration", pillars.get("nutrition_hydration", 0.0), "65.0"),
        ("Mental Wellbeing & Stress Management", pillars.get("mental_wellbeing", 0.0), "60.0"),
        ("Digital Hygiene & Screen Breaks", pillars.get("digital_hygiene", 0.0), "55.0"),
        ("Substance Habits & Recovery", pillars.get("habits", 0.0), "75.0"),
    ]

    for label, val, bench in pillar_map:
        tier_label, tier_col = pillar_tier(val)
        pillar_rows.append([
            Paragraph(label, body_style),
            Paragraph(f"<b>{val:.1f}</b>", body_style),
            Paragraph(bench, body_style),
            Paragraph(f"<font color='{tier_col.hexval()}'><b>{tier_label}</b></font>", body_style),
        ])

    pillar_table = Table(pillar_rows, colWidths=[3.2 * inch, 1.4 * inch, 1.4 * inch, 1.4 * inch])
    pillar_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(pillar_table)
    story.append(Spacer(1, 14))

    # 5. AI Machine Learning Insights (KMeans & Isolation Forest)
    story.append(Paragraph("<b>Machine Learning Cluster & Anomaly Analysis</b>", section_heading))
    ml_insights = assessment_detail.get("ml_insights", {})
    cluster_name = ml_insights.get("cluster_name", "Balanced Professional")
    cluster_desc = ml_insights.get("cluster_description", "Consistent lifestyle patterns with balanced habits.")
    is_anomaly = ml_insights.get("is_anomaly", False)
    anomaly_status = "Detected Irregular Pattern" if is_anomaly else "Normal Population Profile"
    anomaly_color = colors.HexColor("#ef4444") if is_anomaly else colors.HexColor("#10b981")
    pca = ml_insights.get("pca_coordinates", {})
    pca_str = f"PC1: {pca.get('x', 0.0):.2f}, PC2: {pca.get('y', 0.0):.2f}"

    ml_data = [
        [
            Paragraph(f"<b>Assigned Population Archetype:</b> {cluster_name}<br/><font color='#64748b'>{cluster_desc}</font>", body_style),
            Paragraph(f"<b>Isolation Forest Status:</b> <font color='{anomaly_color.hexval()}'><b>{anomaly_status}</b></font><br/><font color='#64748b'>Latent Coordinates: {pca_str}</font>", body_style),
        ]
    ]
    ml_table = Table(ml_data, colWidths=[4.4 * inch, 3.0 * inch])
    ml_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), brand_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(ml_table)
    story.append(Spacer(1, 14))

    # 6. Personalized Actionable Recommendations
    recs = assessment_detail.get("recommendations", [])
    if recs:
        story.append(Paragraph("<b>Personalized Wellness Recommendations & Action Plan</b>", section_heading))
        rec_rows = [
            [
                Paragraph("<b>Priority</b>", body_style),
                Paragraph("<b>Category</b>", body_style),
                Paragraph("<b>Observation & Recommended Action</b>", body_style),
            ]
        ]
        
        for r in recs[:6]: # Limit to top 6 in PDF
            prio = str(r.get("priority", "medium")).capitalize()
            prio_col = "#ef4444" if prio == "High" else ("#f59e0b" if prio == "Medium" else "#10b981")
            obs = r.get("title") or r.get("observation") or "Habit Recommendation"
            act = r.get("action_item") or r.get("suggested_action") or ""
            reason = r.get("description") or r.get("reason") or ""
            
            detail_p = Paragraph(
                f"<b>{obs}</b><br/>"
                f"<font color='{brand_primary.hexval()}'><b>Action:</b></font> {act}<br/>"
                f"<font color='#64748b'><b>Why:</b> {reason}</font>",
                body_style,
            )
            
            rec_rows.append([
                Paragraph(f"<font color='{prio_col}'><b>{prio}</b></font>", body_style),
                Paragraph(f"<b>{r.get('category', 'General')}</b>", body_style),
                detail_p,
            ])
            
        rec_table = Table(rec_rows, colWidths=[1.1 * inch, 1.4 * inch, 4.9 * inch])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(rec_table)
        story.append(Spacer(1, 14))

    # 7. Ethical & Academic Disclaimer
    disclaimer_text = (
        "<b>LEGAL & ETHICAL DISCLAIMER:</b> LifeSync AI is an educational wellness evaluation tool developed for the MCA "
        "Information-Based Software Technology (IBST) project. The scores, cluster classifications, and recommendations "
        "provided are for lifestyle optimization and educational purposes only. They do NOT constitute medical diagnoses, "
        "clinical advice, or healthcare interventions. Always consult a licensed medical professional for personal health decisions."
    )
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceBefore=10, spaceAfter=8))
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    # Build PDF Document
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
