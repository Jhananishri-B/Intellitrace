import json

with open("phase2-6.ipynb", "r") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] == "code":
        source = "".join(cell["source"])
        if 'f"A{acc}"' in source or 'f"A{receiver}"' in source or 'f"A{i}"' in source:
            source = source.replace('f"A{acc}"', 'f"ACC{acc+1:05d}"')
            source = source.replace('f"A{receiver}"', 'f"ACC{receiver+1:05d}"')
            source = source.replace('f"A{i}"', 'f"ACC{i+1:05d}"')
            
            # Write back as list of lines
            lines = source.splitlines(True)
            cell["source"] = lines

with open("phase2-6.ipynb", "w") as f:
    json.dump(nb, f, indent=1)

print("SUCCESS: Patched fake transaction account IDs")
