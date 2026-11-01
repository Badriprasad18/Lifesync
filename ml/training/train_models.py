"""
LifeSync AI - Standalone Model Training Runner
Wrapper for invoking the ML pipeline from the root or ml/ directory.
"""
import sys
import os

# Add backend to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))

from app.ml.train import train_and_export_models

if __name__ == "__main__":
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    train_and_export_models(base_dir=project_root)
