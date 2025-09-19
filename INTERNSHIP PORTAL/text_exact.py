# text_exact.py
# Clean Flask-ready module for Internship Recommendation

import os
import pandas as pd
import re

# ---------------------
# CSV path (relative or via env var)
# ---------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
file_path = os.environ.get('MERGED_CSV_PATH') or os.path.join(BASE_DIR, 'static', 'merged_data.csv')

try:
    df = pd.read_csv(file_path)
    print(f"✅ DataFrame loaded successfully with {len(df)} rows from {file_path}.")
except FileNotFoundError:
    print(f"❌ Error: The file '{file_path}' was not found.")
    df = pd.DataFrame()
except Exception as e:
    print(f"❌ An error occurred while loading dataset: {e}")
    df = pd.DataFrame()

# =====================
# ROLE_SKILLS dictionary (unchanged)
# =====================
ROLE_SKILLS = {
    "business_analyst": {
        "hard": ["excel", "sql", "tableau", "power bi", "sas", "r",
                 "statistics", "financial modeling", "data visualization", "reporting"],
        "domain": ["finance", "banking", "insurance", "healthcare",
                   "supply chain", "marketing", "operations"],
        "soft": ["communication", "stakeholder management", "problem solving",
                 "analytical thinking", "documentation"]
    },
    "data_analyst": {
        "hard": ["sql", "python", "pandas", "numpy", "excel", "tableau", "power bi",
                 "looker", "r", "statistics", "data cleaning", "etl"],
        "domain": ["retail", "e-commerce", "marketing", "healthcare", "operations"],
        "soft": ["attention to detail", "visualization storytelling",
                 "collaboration", "critical thinking"]
    },
    "data_engineer": {
        "hard": ["python", "sql", "java", "scala", "spark", "hadoop", "kafka",
                 "airflow", "dbt", "snowflake", "redshift", "bigquery",
                 "aws", "azure", "gcp", "docker", "kubernetes", "etl",
                 "data warehouse", "pipelines"],
        "domain": ["cloud", "streaming", "data pipelines", "big data",
                   "healthcare", "finance"],
        "soft": ["problem solving", "teamwork", "ownership", "documentation"]
    },
    "data_scientist": {
        "hard": ["python", "r", "sql", "machine learning", "deep learning",
                 "nlp", "tensorflow", "pytorch", "scikit-learn",
                 "statistics", "probability", "optimization", "time series",
                 "computer vision"],
        "domain": ["ai", "healthcare", "finance", "retail",
                   "predictive analytics", "genai"],
        "soft": ["critical thinking", "research mindset",
                 "communication", "problem solving"]
    }
}

# =====================
# Skill Extraction (unchanged)
# =====================
def extract_skills(job_desc, role):
    job_desc_lower = str(job_desc).lower()
    found_skills = {"hard": [], "domain": [], "soft": []}

    if role not in ROLE_SKILLS:
        return found_skills

    for category, skills in ROLE_SKILLS[role].items():
        for skill in skills:
            if re.search(r"\b" + re.escape(skill.lower()) + r"\b", job_desc_lower):
                found_skills[category].append(skill)

    return found_skills

# Ensure extracted skills present on load (only once)
if not df.empty and "Extracted Skills" not in df.columns:
    # THIS MAY TAKE TIME FOR LARGE CSVs — it's done once at module import.
    df["Extracted Skills"] = df.apply(
        lambda row: extract_skills(row.get("Job Description", ""), str(row.get("source", ""))), axis=1
    )

# =====================
# Candidate building helper:
# builds candidate dict from saved profile dict
# =====================
def build_candidate_from_profile(profile):
    """profile: dict loaded from profiles.json (keys: skills, city, country, role_interest, etc.)"""
    skills = [s.lower().strip() for s in profile.get("skills", []) if isinstance(s, str)]
    # map skills to domain/soft if they match ROLE_SKILLS lists
    domain_set = set()
    soft_set = set()
    # flatten domain/soft across roles
    domain_pool = {s.lower() for r in ROLE_SKILLS.values() for s in r.get("domain", [])}
    soft_pool = {s.lower() for r in ROLE_SKILLS.values() for s in r.get("soft", [])}
    for s in skills:
        if s in domain_pool:
            domain_set.add(s)
        if s in soft_pool:
            soft_set.add(s)

    location = ", ".join(filter(None, [profile.get("city", ""), profile.get("country", "")])).strip(", ")
    return {
        "skills": skills,
        "domain": list(domain_set),
        "soft": list(soft_set),
        "location": location,
        "role_interest": profile.get("role_interest", []) or []
    }

# =====================
# Matching Function (unchanged logic but robust)
# =====================
def calculate_match_score(job_row, candidate, extracted_skills):
    score = 0

    # candidate skills might be lowercase; extracted_skills contains canonical skill names
    cand_skills = set([s.lower() for s in candidate.get("skills", [])])
    hard_overlap = {s.lower() for s in extracted_skills.get("hard", [])} & cand_skills
    domain_overlap = {s.lower() for s in extracted_skills.get("domain", [])} & set([d.lower() for d in candidate.get("domain", [])])
    soft_overlap = {s.lower() for s in extracted_skills.get("soft", [])} & set([d.lower() for d in candidate.get("soft", [])])

    score += 3 * len(hard_overlap)
    score += 2 * len(domain_overlap)
    score += 1 * len(soft_overlap)

    # Location match
    job_location = str(job_row.get("Location", "")).lower()
    cand_location = candidate.get("location", "").lower()
    if cand_location and cand_location in job_location:
        score += 2
    elif "remote" in job_location:
        score += 0.5

    # Role interest match (if candidate is explicitly interested in roles)
    job_title = str(job_row.get("Job Title", "")).lower()
    for role in candidate.get("role_interest", []):
        if isinstance(role, str) and role.lower() in job_title:
            score += 3

    # Company rating bonus
    try:
        if float(job_row.get("Rating", 0)) >= 4.0:
            score += 1
    except:
        pass

    return score

# =====================
# Recommendation API: non-destructive (doesn't mutate global df)
# =====================
def recommend_jobs(candidate, top_k=5):
    """Return top-k job recommendations for a candidate dict"""
    if df.empty:
        return []

    # compute scores as a Series (no mutation of global df)
    scores = df.apply(lambda row: calculate_match_score(row, candidate, row.get("Extracted Skills", {"hard": [], "domain": [], "soft": []})), axis=1)

    df_temp = df.copy()
    df_temp["Match Score"] = scores
    top_matches = df_temp.sort_values("Match Score", ascending=False).head(top_k)

    # return JSON-serializable records
    fields = ["Job Title", "Company Name", "Location", "Match Score"]
    # ensure fields exist
    existing_fields = [f for f in fields if f in df_temp.columns]
    return top_matches[existing_fields].to_dict(orient="records")
