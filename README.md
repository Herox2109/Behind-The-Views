# Behind the Views — A Data-Driven Analysis of My TikTok Journey

An independent, reproducible data-science project analyzing 11 months of TikTok video publishing history (69 posts, 293,710 lifetime likes) by 17-year-old creator and student analyst **Behruzbek Shodmonov** ([@herox.cc](https://www.tiktok.com/@herox.cc?_r=1&_t=ZP-99Tn9fZhK9e)).

[![GitHub Profile](https://img.shields.io/badge/GitHub-Herox2109-181717?style=flat&logo=github)](https://github.com/Herox2109)
[![TikTok](https://img.shields.io/badge/TikTok-@herox.cc-000000?style=flat&logo=tiktok)](https://www.tiktok.com/@herox.cc?_r=1&_t=ZP-99Tn9fZhK9e)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Project Goals

1. **Empirical Grounding**: Transform a personal TikTok privacy JSON export (`user_data_tiktok.json`) into an automated, verifiable data science pipeline.
2. **Power-Law Analysis**: Investigate why two viral outlier videos account for 90.8% of lifetime channel engagement (266,728 of 293,710 likes).
3. **Hiatus Dynamics**: Analyze the statistical repercussions of a 73-day break between February 18 and April 30, 2026.
4. **Predictive Modeling**: Train, validate, and evaluate an interpretable machine learning model (L2 Logistic Classifier & Random Forest) to predict above-median engagement from pre-publication temporal features.
5. **Audience Sentiment & NLP**: Parse public comments from viral videos to cluster viewer feedback and technical tutorial inquiries.

---

## Data Pipeline Architecture

```
Raw TikTok JSON (user_data_tiktok.json)
        ↓
Python / Pandas data-processing pipeline (load_and_clean.py)
        ↓
Cleaned dataset & time-series segmentation (segment_phases.py)
        ↓
Statistical analysis & robust metric calculations (robust_stats.py)
        ↓
Predictive machine learning model & validation (train_model.py)
        ↓
Audience sentiment NLP classification (nlp_sentiment.py)
        ↓
Interactive D3.js visualization web application (React + Tailwind CSS)
```

---

## Key Statistical Findings

- **90.8% Power-Law Concentration**: Just two uploads (Aug 26 and Oct 1, 2025) drove 90.8% of total lifetime likes. The remaining 67 posts represent 9.2%.
- **Cadence & Typical Performance**: Median likes fell from 268 in the initial launch phase to 46 likes post-break.
- **The 73-Day Hiatus**: Over 4× longer than any other interval in the entire dataset.
- **Scheduled Habit**: 70% of all uploads occurred in a tight 30-minute window between 9:35 AM and 10:05 AM EST.

---

## Machine Learning Model Evaluation

- **Task**: Binary classification — predicting whether an upload surpasses the channel median (Likes $\ge 149$) based on `gap_days`, upload hour, day of week, and channel momentum.
- **Algorithm**: L2-Regularized Logistic Regression (chosen for small-sample stability on $N=69$ and interpretable odds ratios).
- **Results**:
  - **Accuracy**: 78.6% on stratified test split (vs. 50.0% dummy baseline)
  - **Precision**: 75.0%
  - **Recall**: 85.7%
  - **F1-Score**: 0.80
  - **ROC-AUC**: 0.82

---

## Quickstart & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Herox2109/behind-the-views.git
cd behind-the-views
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run local dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Contact & Links

- **Creator / Analyst**: Behruzbek Shodmonov
- **GitHub**: [https://github.com/Herox2109](https://github.com/Herox2109)
- **TikTok**: [https://www.tiktok.com/@herox.cc](https://www.tiktok.com/@herox.cc?_r=1&_t=ZP-99Tn9fZhK9e)
