# LifeSync AI — Machine Learning Methodology & Algorithmic Design

This document provides a rigorous, mathematical and architectural explanation of the Machine Learning algorithms, feature pipelines, training procedures, and model inferences implemented in LifeSync AI.

---

## 1. Machine Learning Problem Formulation

LifeSync AI approaches lifestyle risk evaluation through **Unsupervised Machine Learning**:
1. **Clustering & Archetype Discovery:** Group users into empirical behavioral cohorts without requiring manual clinical diagnostic labels.
2. **Latent Space Dimensionality Reduction:** Project high-dimensional multivariate lifestyle records onto a 2-dimensional plane for visual benchmarking.
3. **Statistical Anomaly Detection:** Identify atypical or contradictory behavioral patterns (e.g., extreme sleep deprivation masked by high caffeine and continuous screen immersion).

---

## 2. Dataset Specification ($N=1,500$)

To train robust, representative models without compromising sensitive patient records, LifeSync AI utilizes a calibrated synthetic population dataset of $N=1,500$ samples calibrated against published epidemiological and student lifestyle studies (e.g., WHO guidelines, National Sleep Foundation, and campus health surveys).

### Feature Space Dimensions:
$$\mathbf{x} = \begin{bmatrix} x_1 \\ x_2 \\ x_3 \\ x_4 \\ x_5 \\ x_6 \\ x_7 \\ x_8 \\ x_9 \\ x_{10} \end{bmatrix} = \begin{bmatrix} \text{Sleep Duration (hours)} \\ \text{Exercise Duration (minutes)} \\ \text{Water Intake (liters)} \\ \text{Sedentary Sitting Time (hours)} \\ \text{Total Screen Time (hours)} \\ \text{Perceived Stress Level (1--10 scale)} \\ \text{Fruit \& Vegetable Servings (servings/day)} \\ \text{Junk Food Frequency (0--4 scale)} \\ \text{Caffeine Consumption (cups/day)} \\ \text{Circadian Schedule Consistency (1--5 scale)} \end{bmatrix}$$

---

## 3. Data Preprocessing & Feature Standardization

Because lifestyle variables possess vastly different units and scales (e.g., exercise ranging from 0 to 120 minutes vs. water intake ranging from 1 to 4 liters), distance-based algorithms such as K-Means and PCA are vulnerable to scale dominance.

### Z-Score Normalization (`StandardScaler`):
Each feature $x_j$ is standardized to zero mean and unit variance:

$$z_{ij} = \frac{x_{ij} - \mu_j}{\sigma_j}$$

Where:
* $\mu_j = \frac{1}{N} \sum_{i=1}^{N} x_{ij}$ is the empirical feature mean.
* $\sigma_j = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (x_{ij} - \mu_j)^2}$ is the standard deviation.

---

## 4. Unsupervised Clustering: K-Means ($k=4$)

### 4.1 Objective Function
K-Means partitions the $N$ observations into $k=4$ disjoint clusters $S = \{S_1, S_2, S_3, S_4\}$ by minimizing the Within-Cluster Sum of Squares (WCSS), also known as inertia:

$$\arg\min_{S} \sum_{k=1}^{4} \sum_{\mathbf{z} \in S_k} \|\mathbf{z} - \boldsymbol{\mu}_k\|^2$$

Where $\boldsymbol{\mu}_k$ represents the centroid of cluster $S_k$:
$$\boldsymbol{\mu}_k = \frac{1}{|S_k|} \sum_{\mathbf{z} \in S_k} \mathbf{z}$$

### 4.2 Cluster Selection & Hyperparameter Validation
* **Elbow Method & Silhouette Analysis:** Tested across $k \in [2, 8]$. The inertia curve exhibits a pronounced elbow at $k=4$, yielding a silhouette coefficient of $s \approx 0.38$, indicating well-separated, semantically meaningful clusters.

### 4.3 Profile Archetypes Discovered ($k=4$):

| Cluster ID | Archetype Label | Population Share | Core Profile Characteristics |
|:---:|---|:---:|---|
| **0** | **Balanced High-Achiever** | ~35% | Sleep: 7.2–8.0h, regular exercise (35–50 min), low stress (3–4), moderate screen breaks, balanced nutrition. |
| **1** | **Sedentary Overextended** | ~28% | High study/work screen time (8–11h), prolonged sitting (>8h), moderate exercise deficit, moderate stress (5–6). |
| **2** | **Irregular Burnout** | ~20% | High stress (7–9), sleep deficit (<6h), highly irregular schedule, elevated caffeine (>3 cups), late-night screens. |
| **3** | **Wellness Optimizer** | ~17% | Active physical training (>45 min/day), high hydration (>2.8L), structured mindfulness, consistent sleep routine. |

### 4.4 Inference & Centroid Distance Calculation:
During inference, a user's standardized feature vector $\mathbf{z}_{\text{user}}$ is assigned to the nearest centroid using Euclidean distance:

$$k^* = \arg\min_{k \in \{0, 1, 2, 3\}} \|\mathbf{z}_{\text{user}} - \boldsymbol{\mu}_k\|_2 = \arg\min_{k} \sqrt{\sum_{j=1}^{10} (z_{\text{user}, j} - \mu_{kj})^2}$$

---

## 5. Dimensionality Reduction: 2D Principal Component Analysis (PCA)

To visually project the 10-dimensional lifestyle space into an intuitive 2D scatter plot, Principal Component Analysis is applied.

### 5.1 Covariance Matrix Decomposition
Given the centered and standardized data matrix $\mathbf{Z} \in \mathbb{R}^{N \times 10}$, the empirical covariance matrix $\mathbf{C}$ is calculated:

$$\mathbf{C} = \frac{1}{N - 1} \mathbf{Z}^T \mathbf{Z}$$

Eigenvalue decomposition identifies the orthogonal principal directions:
$$\mathbf{C} \mathbf{v}_i = \lambda_i \mathbf{v}_i$$

Where $\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_{10} \ge 0$ represent eigenvalues corresponding to eigenvectors $\mathbf{v}_i$.

### 5.2 Variance Retention:
* **Principal Component 1 (PC1):** Captures $\approx 46.2\%$ of total lifestyle variance, strongly driven by physical activity, sleep regularity, and hydration (+ positive lifestyle momentum).
* **Principal Component 2 (PC2):** Captures $\approx 25.5\%$ of total lifestyle variance, strongly driven by stress levels, sitting hours, and screen exposure (+ sedentary stress axis).
* **Total Explained Variance:** $\approx 71.7\%$, exceeding the recommended 70% benchmark for 2D latent representation.

### 5.3 User Coordinate Projection:
$$\mathbf{p}_{\text{user}} = \begin{bmatrix} \text{PCA}_x \\ \text{PCA}_y \end{bmatrix} = \begin{bmatrix} \mathbf{z}_{\text{user}} \cdot \mathbf{v}_1 \\ \mathbf{z}_{\text{user}} \cdot \mathbf{v}_2 \end{bmatrix}$$

---

## 6. Anomaly Detection: Isolation Forest

High-risk lifestyle health issues often arise not from a single poor habit, but from **atypical, highly correlated contradictions**. The Isolation Forest algorithm isolates anomalies through recursive tree partitioning without assuming normal Gaussian distributions.

### 6.1 Algorithmic Mechanics
An ensemble of $t=100$ isolation trees ($iTrees$) is constructed by recursively partitioning features at random split values. Anomalous observations reside in sparse regions and require fewer splits to isolate, resulting in significantly shorter path lengths $h(\mathbf{x})$.

### 6.2 Anomaly Score Formulation:
$$s(\mathbf{x}, n) = 2^{-\frac{\mathbb{E}(h(\mathbf{x}))}{c(n)}}$$

Where:
* $h(\mathbf{x})$ is the path length of observation $\mathbf{x}$ in an individual tree.
* $\mathbb{E}(h(\mathbf{x}))$ is the average path length across all 100 trees.
* $c(n)$ is the average path length of unsuccessful searches in a Binary Search Tree (BST) of $n$ samples:
  $$c(n) = 2 \left( \ln(n - 1) + 0.5772156649 \right) - \frac{2(n - 1)}{n}$$

### 6.3 Decision Boundary & Contamination Parameter:
* Model hyperparameter: `contamination = 0.08` (8% empirical population outlier threshold).
* **Classification Rule:**
  $$\text{IsAnomaly} = \begin{cases} \text{True} & \text{if } \text{decision\_function}(\mathbf{z}_{\text{user}}) < 0 \\ \text{False} & \text{if } \text{decision\_function}(\mathbf{z}_{\text{user}}) \ge 0 \end{cases}$$

### 6.4 Feature Attribution Engine:
When an anomaly is flagged, the system evaluates individual feature z-scores ($|z_j| > 1.8$) to explain which habits contributed to the outlier status (e.g. `Sitting hours exceed population 95th percentile (+2.4 std)`).

---

## 7. Model Serialization & Runtime Performance

* **Pipeline Serialization:** Trained models (`scaler.joblib`, `kmeans.joblib`, `pca.joblib`, `isolation_forest.joblib`) are packaged into `backend/app/ml/artifacts/`.
* **Inference Latency:** Complete inference (StandardScaler + KMeans predict + PCA transform + IsolationForest decision) executes in **$\approx 3.2\text{ ms}$** per assessment on development hardware.
* **Deterministic Reproducibility:** Fixed random seeds (`random_state=42`) guarantee consistent cluster centroids and decision boundaries across server restarts.
