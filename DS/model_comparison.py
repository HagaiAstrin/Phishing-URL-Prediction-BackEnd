import pandas as pd
import numpy as np
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import f1_score
from openpyxl import Workbook
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.dummy import DummyClassifier
import warnings
warnings.filterwarnings("ignore")

# Load and preprocess data
train_df = pd.read_csv("phishing_url_train.csv")
test_df = pd.read_csv("phishing_url_test.csv")
if 'url' in train_df.columns:
    train_df.drop(columns=['url'], inplace=True)
if 'url' in test_df.columns:
    test_df.drop(columns=['url'], inplace=True)
status_map = {'legitimate': 0, 'phishing': 1}
train_df["status"] = train_df["status"].map(status_map)
test_df["status"] = test_df["status"].map(status_map)

url_based_features = [
    "length_url", "length_hostname", "nb_dots", "nb_hyphens", "nb_at", "nb_qm",
    "nb_eq", "nb_underscore", "nb_percent", "nb_slash", "nb_www", "nb_com",
    "https_token", "ratio_digits_url", "ratio_digits_host", "tld_in_subdomain",
    "prefix_suffix", "random_domain", "shortening_service", "nb_redirection",
    "length_words_raw", "char_repeat", "shortest_words_raw", "shortest_word_host",
    "shortest_word_path", "longest_words_raw", "longest_word_host", "longest_word_path",
    "avg_words_raw", "avg_word_host", "avg_word_path", "phish_hints",
    "domain_in_brand", "suspecious_tld"
]

X_train = train_df[url_based_features]
y_train = train_df["status"]

# Define models
models = {
    "XGBClassifier": XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42),
    "LGBMClassifier": LGBMClassifier(random_state=42),
    "RandomForestClassifier": RandomForestClassifier(random_state=42),
    "ExtraTreesClassifier": ExtraTreesClassifier(random_state=42),
    "LogisticRegression": LogisticRegression(max_iter=1000),
    "KNeighborsClassifier": KNeighborsClassifier(),
    "DecisionTreeClassifier": DecisionTreeClassifier(random_state=42),
    "DummyClassifier": DummyClassifier(strategy='most_frequent')
}

# Define parameter grids
param_grids = {
    "XGBClassifier": {
        'classifier__max_depth': [3, 4, 5],
        'classifier__min_child_weight': [3, 5, 7],
        'classifier__gamma': [0.0, 0.2, 0.4],
        'classifier__subsample': [0.8],
        'classifier__colsample_bytree': [0.8],
        'classifier__reg_alpha': [0.0, 0.5, 1.0],
        'classifier__reg_lambda': [1.0, 2.0],
        'classifier__n_estimators': [100, 200],
        'classifier__learning_rate': [0.01, 0.05, 0.1]
    },
    "LGBMClassifier": {
        'classifier__max_depth': [3, 4],
        'classifier__num_leaves': [8, 16],
        'classifier__reg_alpha': [0.0, 0.4],
        'classifier__reg_lambda': [0.8, 1.0],
        'classifier__learning_rate': [0.05, 0.1],
        'classifier__n_estimators': [100, 200]
    },
    "RandomForestClassifier": {
        'classifier__n_estimators': [100, 200],
        'classifier__max_depth': [4, 6],
        'classifier__min_samples_leaf': [2, 4],
        'classifier__max_features': ['sqrt', 'log2']
    },
    "ExtraTreesClassifier": {
        'classifier__n_estimators': [100, 200],
        'classifier__max_depth': [4, 6],
        'classifier__min_samples_leaf': [2, 4],
        'classifier__max_features': ['sqrt', 'log2']
    },
    "LogisticRegression": {
        'classifier__C': [0.01, 0.1, 1, 10],
        'classifier__penalty': ['l2'],
        'classifier__solver': ['lbfgs']
    },
    "KNeighborsClassifier": {
        'classifier__n_neighbors': [3, 5],
        'classifier__weights': ['uniform', 'distance'],
        'classifier__p': [1, 2]
    },
    "DecisionTreeClassifier": {
        'classifier__max_depth': [3, 4, 5],
        'classifier__min_samples_leaf': [2, 5],
        'classifier__ccp_alpha': [0.0, 0.01]
    }
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
best_models = []
excel_writer = pd.ExcelWriter("grid_search_results.xlsx", engine='openpyxl')

for model_name, model in models.items():
    if model_name not in param_grids:
        print(f"⚠️ Skipping {model_name} (no param grid)")
        continue

    print(f"\n🔍 Grid search for: {model_name}")
    try:
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', model)
        ])

        grid_search = GridSearchCV(
            pipeline,
            param_grid=param_grids[model_name],
            scoring='f1',
            cv=cv,
            n_jobs=-1,
            verbose=0,
            return_train_score=True
        )
        grid_search.fit(X_train, y_train)

        # Save best result
        best_models.append({
            'Model': model_name,
            'Best F1 Score': grid_search.best_score_,
            'Best Params': grid_search.best_params_
        })

        # Save full CV results to sheet
        results_df = pd.DataFrame(grid_search.cv_results_)
        results_df.to_excel(excel_writer, sheet_name=model_name[:31], index=False)

        print(f"✅ Best F1: {grid_search.best_score_:.4f}")
    except Exception as e:
        print(f"❌ Failed on {model_name}: {e}")

# Save summary sheet
summary_df = pd.DataFrame(best_models).sort_values(by="Best F1 Score", ascending=False)
summary_df.to_excel(excel_writer, sheet_name="Summary", index=False)

# Print summary to console
print("\n🏆 Top Grid Search Results:")
print(summary_df.to_string(index=False))

