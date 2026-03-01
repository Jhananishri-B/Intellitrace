import json
import uuid

def create_markdown_cell(source):
    return {
        "cell_type": "markdown",
        "id": str(uuid.uuid4())[:8],
        "metadata": {},
        "source": source
    }

def create_code_cell(source):
    return {
        "cell_type": "code",
        "execution_count": None,
        "id": str(uuid.uuid4())[:8],
        "metadata": {},
        "outputs": [],
        "source": source
    }

cells = []

# Section 1: Data Splitting
cells.append(create_markdown_cell([
    "### 1️⃣ Data Splitting\n",
    "\n",
    "We perform a **Stratified train/validation/test split (70/15/15)**. \n",
    "* **Why Stratified Split?** Since fraud datasets are heavily imbalanced (very few fraud nodes compared to normal ones), a random split might result in train/val/test sets with no fraud cases at all. Stratification ensures that the ratio of fraud to normal nodes is identical across all splits."
]))

cells.append(create_code_cell([
    "import torch\n",
    "import numpy as np\n",
    "from sklearn.model_selection import StratifiedKFold\n",
    "from sklearn.model_selection import train_test_split\n",
    "\n",
    "labels = graph_data.y.numpy()\n",
    "indices = np.arange(len(labels))\n",
    "\n",
    "# First split: 70% Train, 30% Temp (Val + Test)\n",
    "train_idx, temp_idx, y_train, y_temp = train_test_split(\n",
    "    indices, labels, test_size=0.30, stratify=labels, random_state=42\n",
    ")\n",
    "\n",
    "# Second split: 50% Val, 50% Test of the remaining 30% (yielding 15% / 15% of total)\n",
    "val_idx, test_idx, _, _ = train_test_split(\n",
    "    temp_idx, y_temp, test_size=0.50, stratify=y_temp, random_state=42\n",
    ")\n",
    "\n",
    "# Convert to boolean masks for PyTorch Geometric\n",
    "train_mask = torch.zeros(len(labels), dtype=torch.bool)\n",
    "val_mask = torch.zeros(len(labels), dtype=torch.bool)\n",
    "test_mask = torch.zeros(len(labels), dtype=torch.bool)\n",
    "\n",
    "train_mask[train_idx] = True\n",
    "val_mask[val_idx] = True\n",
    "test_mask[test_idx] = True\n",
    "\n",
    "graph_data.train_mask = train_mask\n",
    "graph_data.val_mask = val_mask\n",
    "graph_data.test_mask = test_mask\n",
    "\n",
    "print(f\"Train nodes: {train_mask.sum().item()}\")\n",
    "print(f\"Val nodes: {val_mask.sum().item()}\")\n",
    "print(f\"Test nodes: {test_mask.sum().item()}\")\n"
]))

# Section 2: Model Architecture
cells.append(create_markdown_cell([
    "### 2️⃣ Model Architecture (GraphSAGE)\n",
    "\n",
    "We implement a 3-layer GraphSAGE model with hidden dimensions of 64 and 32, complete with Dropout and ReLU activations."
]))

cells.append(create_code_cell([
    "import torch.nn.functional as F\n",
    "from torch_geometric.nn import SAGEConv\n",
    "\n",
    "class FraudGraphSAGE(torch.nn.Module):\n",
    "    def __init__(self, in_channels, hidden_channels_1, hidden_channels_2, out_channels, dropout=0.5):\n",
    "        super(FraudGraphSAGE, self).__init__()\n",
    "        self.dropout = dropout\n",
    "        \n",
    "        # 1st GraphSAGE Layer (Input -> 64)\n",
    "        self.conv1 = SAGEConv(in_channels, hidden_channels_1)\n",
    "        # 2nd GraphSAGE Layer (64 -> 32)\n",
    "        self.conv2 = SAGEConv(hidden_channels_1, hidden_channels_2)\n",
    "        # 3rd Output Layer (32 -> 2 classes)\n",
    "        self.conv3 = SAGEConv(hidden_channels_2, out_channels)\n",
    "\n",
    "    def forward(self, x, edge_index):\n",
    "        # Layer 1\n",
    "        x = self.conv1(x, edge_index)\n",
    "        x = F.relu(x)\n",
    "        x = F.dropout(x, p=self.dropout, training=self.training)\n",
    "        \n",
    "        # Layer 2\n",
    "        x = self.conv2(x, edge_index)\n",
    "        x = F.relu(x)\n",
    "        x = F.dropout(x, p=self.dropout, training=self.training)\n",
    "        \n",
    "        # Layer 3 (Output)\n",
    "        x = self.conv3(x, edge_index)\n",
    "        \n",
    "        return x # Return raw logits for CrossEntropyLoss\n"
]))

# Section 3: Training Setup
cells.append(create_markdown_cell([
    "### 3️⃣ Training Setup\n",
    "\n",
    "* **Class Weights:** We compute inverse class weights because there are vastly more normal transactions than fraudulent ones. The CrossEntropyLoss uses these weights to heavily penalize the model when it misclassifies a rare fraud node, forcing the model to pay attention to minority classes.\n",
    "* **Early Stopping:** If the model's performance on the validation set doesn't improve for a set number of epochs (patience=20), training halts. This prevents overfitting onto the training data and saves computational time."
]))


cells.append(create_code_cell([
    "import torch.optim as optim\n",
    "from sklearn.utils.class_weight import compute_class_weight\n",
    "\n",
    "device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')\n",
    "print(f\"Using device: {device}\")\n",
    "\n",
    "# Push data to device\n",
    "graph_data = graph_data.to(device)\n",
    "\n",
    "# Compute class weights based on the training set\n",
    "train_labels = graph_data.y[graph_data.train_mask].cpu().numpy()\n",
    "class_weights = compute_class_weight(class_weight='balanced', classes=np.unique(train_labels), y=train_labels)\n",
    "class_weights_tensor = torch.tensor(class_weights, dtype=torch.float).to(device)\n",
    "\n",
    "print(f\"Computed Class Weights: {class_weights_tensor}\")\n",
    "\n",
    "# Initialize Model, Optimizer, Loss Function\n",
    "model = FraudGraphSAGE(in_channels=graph_data.num_features, \n",
    "                       hidden_channels_1=64, \n",
    "                       hidden_channels_2=32, \n",
    "                       out_channels=2).to(device)\n",
    "\n",
    "optimizer = optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-4)\n",
    "criterion = torch.nn.CrossEntropyLoss(weight=class_weights_tensor)\n",
    "\n",
    "# Setup Early Stopping parameters\n",
    "max_epochs = 200\n",
    "patience = 20\n",
    "best_val_loss = float('inf')\n",
    "epochs_no_improve = 0\n",
    "best_model_path = 'best_gnn_model.pt'\n"
]))

# Section 4: Training Loop
cells.append(create_markdown_cell([
    "### 4️⃣ Training Loop"
]))

cells.append(create_code_cell([
    "for epoch in range(1, max_epochs + 1):\n",
    "    model.train()\n",
    "    optimizer.zero_grad()\n",
    "    \n",
    "    # Forward pass\n",
    "    out = model(graph_data.x, graph_data.edge_index)\n",
    "    \n",
    "    # Compute loss on training nodes only\n",
    "    loss = criterion(out[graph_data.train_mask], graph_data.y[graph_data.train_mask])\n",
    "    \n",
    "    # Backward pass and optimize\n",
    "    loss.backward()\n",
    "    optimizer.step()\n",
    "    \n",
    "    # Validation phase\n",
    "    model.eval()\n",
    "    with torch.no_grad():\n",
    "        val_out = model(graph_data.x, graph_data.edge_index)\n",
    "        val_loss = criterion(val_out[graph_data.val_mask], graph_data.y[graph_data.val_mask])\n",
    "    \n",
    "    if epoch % 10 == 0:\n",
    "        print(f'Epoch: {epoch:03d}, Train Loss: {loss:.4f}, Val Loss: {val_loss:.4f}')\n",
    "    \n",
    "    # Early Stopping check\n",
    "    if val_loss < best_val_loss:\n",
    "        best_val_loss = val_loss\n",
    "        epochs_no_improve = 0\n",
    "        torch.save(model.state_dict(), best_model_path) # Save best model\n",
    "    else:\n",
    "        epochs_no_improve += 1\n",
    "        if epochs_no_improve >= patience:\n",
    "            print(f\"\\nEarly stopping triggered at epoch {epoch}! Best Val Loss: {best_val_loss:.4f}\")\n",
    "            break\n"
]))

# Section 5: Evaluation
cells.append(create_markdown_cell([
    "### 5️⃣ & 6️⃣ Evaluation & Model Loading\n",
    "\n",
    "* **Why ROC-AUC?** In imbalanced datasets, a model could achieve 99% accuracy simply by predicting \"normal\" every time. ROC-AUC (Area Under the Receiver Operating Characteristic Curve) measures the model's ability to distinguish between classes across all possible classification thresholds, making it a much more reliable metric for fraud detection."
]))

cells.append(create_code_cell([
    "from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix\n",
    "\n",
    "# Load the best model back for inference\n",
    "model.load_state_dict(torch.load(best_model_path))\n",
    "model.eval()\n",
    "\n",
    "with torch.no_grad():\n",
    "    out = model(graph_data.x, graph_data.edge_index)\n",
    "    probs = F.softmax(out, dim=1)\n",
    "    preds = out.argmax(dim=1)\n",
    "    \n",
    "    # Check if there is a predicted mask output\n",
    "    print(\"\\n--- Evaluation Start ---\")\n",
    "\n",
    "def evaluate_mask(mask, split_name):\n",
    "    y_true = graph_data.y[mask].cpu().numpy()\n",
    "    y_pred = preds[mask].cpu().numpy()\n",
    "    y_prob = probs[mask][:, 1].cpu().numpy() # Probability of class 1 (fraud)\n",
    "    \n",
    "    acc = accuracy_score(y_true, y_pred)\n",
    "    print(f\"\\n--- {split_name} Results ---\")\n",
    "    print(f\"Accuracy:  {acc:.4f}\")\n",
    "\n",
    "    if split_name == 'Test':\n",
    "        precision = precision_score(y_true, y_pred, zero_division=0)\n",
    "        recall = recall_score(y_true, y_pred, zero_division=0)\n",
    "        f1 = f1_score(y_true, y_pred, zero_division=0)\n",
    "        \n",
    "        # ROC AUC Requires probabilities of the positive class\n",
    "        try:\n",
    "            roc_auc = roc_auc_score(y_true, y_prob)\n",
    "        except ValueError:\n",
    "            roc_auc = float('nan') # Handles edge case where test set has no positive instances\n",
    "            \n",
    "        cm = confusion_matrix(y_true, y_pred)\n",
    "        \n",
    "        print(f\"Precision: {precision:.4f}\")\n",
    "        print(f\"Recall:    {recall:.4f}\")\n",
    "        print(f\"F1-Score:  {f1:.4f}\")\n",
    "        print(f\"ROC-AUC:   {roc_auc:.4f}\")\n",
    "        print(f\"Confusion Matrix:\\n{cm}\")\n",
    "\n",
    "evaluate_mask(graph_data.train_mask, 'Train')\n",
    "evaluate_mask(graph_data.val_mask, 'Validation')\n",
    "evaluate_mask(graph_data.test_mask, 'Test')\n"
]))

# Section 8: Explanations
cells.append(create_markdown_cell([
    "### 8️⃣ Real-World Adaptation for Fraud Detection\n",
    "\n",
    "Once this GraphSAGE model is trained and saved to `best_gnn_model.pt`, it can be deployed into a real-time production pipeline:\n",
    "1. **Graph Construction:** When a new transaction occurs, it is processed into a node with its associated features $X_{new}$ based on transaction amount, IPs, devices, etc.\n",
    "2. **Dynamic Edges:** Edges are instantly drawn between this new transaction node and existing nodes (e.g., shared IP, shared device, or shared accounts).\n",
    "3. **Inference Flow:** The localized sub-graph representing the new node and its neighbors is passed through the loaded Pytorch Geometric model. GraphSAGE excels here because it is inductive; it generates embeddings by sampling and aggregating features from a node's local neighborhood, without needing to see that specific node during training.\n",
    "4. **Actionable Alerts:** The model outputs a probability score for fraud. If the probability exceeds a predefined business threshold, the system flags the transaction for manual review, implements a 2FA challenge, or freezes the transaction."
]))

with open("phase2-6.ipynb", "r") as f:
    nb = json.load(f)

nb["cells"].extend(cells)

with open("phase2-6.ipynb", "w") as f:
    json.dump(nb, f, indent=1)

print("SUCCESS: Notebook modified")
