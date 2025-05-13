# 🛡️ Phishing URL Detection Using Machine Learning

## Overview
In today's digital era, phishing attacks pose a significant threat to individuals, organizations, and internet users worldwide. This project aims to build and evaluate multiple machine learning models to detect **phishing URLs** based on a rich set of URL and domain-based features.

By leveraging advanced data analysis and predictive modeling, our system classifies URLs as **"Phishing"** or **"Legitimate"**, helping mitigate the risk of cyber-attacks and protect online users.

---

## 📊 Dataset
The dataset consists of multiple URL-related features including:
- URL length, special character counts, subdomain structures, and domain metadata.
- WHOIS information, page rank, web traffic, and SSL-related features.
- Statistical reports and other behavior-based indicators.

The target label is binary:
- **Phishing**: Malicious URL designed to trick users.
- **Legitimate**: Safe and verified URL.

---

## 🧠 Machine Learning Models Evaluated
- **Logistic Regression**
- **Decision Tree Classifier**
- **Random Forest Classifier**
- **Support Vector Machine (SVM)**
- **Neural Network (MLPClassifier)**

Each model is evaluated using the following metrics:
- **Accuracy**
- **Precision**
- **Recall**
- **F1-Score**
- **AUC-ROC Curve**

---

## ⚙️ How to Run
1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install required packages:
    ```bash
    pip install -r requirements.txt
    ```

3. Run the training and evaluation script:
    ```bash
    python phishing_url_model.py
    ```

---

## 📈 Results
The results include detailed evaluation reports, confusion matrices, and visualizations of model performance, helping identify the most effective detection approach.

---

## 🧑‍💻 Team Members
- **Hagai Astrin**
- **Assaf Zaneu**
- **Yehonatan Segal**
- **Barak Tubul**
- **Nofar Avraham**

---

## 🚀 Goal
Our goal is to contribute to the fight against phishing by providing a machine learning-based detection framework that can be further enhanced or integrated into cybersecurity solutions.

---

## 📄 License
This project is released under the [MIT License](LICENSE).

---

## 🤝 Contributing
We welcome contributions, suggestions, and collaborations. Feel free to open issues or submit pull requests.

---

## 📬 Contact
For more information, please contact any of the project members.
