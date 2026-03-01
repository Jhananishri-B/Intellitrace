"""
Run this script ONCE to copy the 4 dashboard screenshots into the docs/ folder.
Place your 4 screenshot images in the same directory and rename them before running,
OR just manually copy the images with the following names into the docs/ folder:

  docs/overview.png
  docs/analytics.png
  docs/transactions.png
  docs/model_metrics.png

Once images are in docs/, they will automatically appear in README.md.
"""

import os
import shutil

DOCS = os.path.join(os.path.dirname(__file__), "docs")
os.makedirs(DOCS, exist_ok=True)

# Update these paths to wherever your screenshot files are located
SCREENSHOTS = {
    "overview.png":      r"C:\Users\JHANANISHRI\Pictures\overview.png",
    "analytics.png":     r"C:\Users\JHANANISHRI\Pictures\analytics.png",
    "transactions.png":  r"C:\Users\JHANANISHRI\Pictures\transactions.png",
    "model_metrics.png": r"C:\Users\JHANANISHRI\Pictures\model_metrics.png",
}

for name, src in SCREENSHOTS.items():
    dst = os.path.join(DOCS, name)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"✅ Copied: {name}")
    else:
        print(f"⚠️  Not found — please save the screenshot manually to: docs/{name}")
        print(f"   Expected at: {src}")
