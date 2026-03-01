import json

with open("phase2-6.ipynb", "r") as f:
    nb = f.read()

if "torch-2.2.0+cpu.html" in nb:
    nb = nb.replace('"!pip install pyg_lib torch_scatter torch_sparse torch_cluster torch_spline_conv -f https://data.pyg.org/whl/torch-2.2.0+cpu.html"',
                    '"!pip install torch_geometric\\n",\n    "!pip install pyg_lib torch_scatter torch_sparse torch_cluster torch_spline_conv -f https://data.pyg.org/whl/torch-2.6.0+cu124.html"')
    with open("phase2-6.ipynb", "w") as f:
        f.write(nb)
    print("Notebook updated successfully.")
else:
    print("Target string not found, notebook may already be updated.")
