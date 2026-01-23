# NetFlow v3 Dataset Integration

This document provides information about using the NIDS system with NetFlow v3 datasets.

## About NetFlow v3 Datasets

Version 3 of the NetFlow datasets consists of 53 extended NetFlow features designed for network intrusion detection. These datasets provide comprehensive network flow information for training machine learning models.

### Citation

If you use these datasets, please cite:

```bibtex
@misc{luay2025NetFlowDatasetsV3,
  title = {Temporal Analysis of NetFlow Datasets for Network Intrusion Detection Systems},
  author = {Majed Luay and Siamak Layeghy and Seyedehfaezeh Hosseininoorbin and Mohanad Sarhan and Nour Moustafa and Marius Portmann},
  year = {2025},
  eprint = {2503.04404},
  archivePrefix = {arXiv},
  primaryClass = {cs.LG},
  url = {https://arxiv.org/abs/2503.04404}
}
```

## Supported Datasets

- **NF-UNSW-NB15-v3** - NetFlow version of UNSW-NB15 dataset
- **NF-ToN-IoT-v3** - NetFlow version of ToN-IoT dataset
- **NF-BoT-IoT-v3** - NetFlow version of BoT-IoT dataset
- **NF-CSE-CIC-IDS2018-v3** - NetFlow version of CSE-CIC-IDS2018 dataset

## NF-UNSW-NB15-v3 Dataset

### Overview

The NF-UNSW-NB15-v3 dataset contains **2,365,424 network flows**:
- **Benign**: 2,237,731 flows (94.6%)
- **Attack**: 127,639 flows (5.4%)

### Attack Categories

The dataset includes **9 types of attacks**:

| Class | Count | Percentage | Description |
|-------|-------|------------|-------------|
| **Benign** | 2,237,731 | 94.6% | Normal unmalicious network flows |
| **Fuzzers** | 33,816 | 1.43% | Sends random data to crash systems and discover vulnerabilities |
| **Analysis** | 2,381 | 0.10% | Attacks on web applications through ports, emails, and scripts |
| **Backdoor** | 1,226 | 0.05% | Bypasses security mechanisms via constructed client applications |
| **DoS** | 5,980 | 0.25% | Denial of Service attacks to overload system resources |
| **Exploits** | 42,748 | 1.81% | Command sequences exploiting known vulnerabilities |
| **Generic** | 19,651 | 0.83% | Targets cryptography and causes block-cipher collisions |
| **Reconnaissance** | 17,074 | 0.72% | Information gathering about network hosts (probes) |
| **Shellcode** | 4,659 | 0.20% | Malware penetrating code to control victim hosts |
| **Worms** | 158 | 0.01% | Self-replicating attacks spreading to other computers |

### Features

The dataset contains **53 extended NetFlow features** including:
- Flow statistics (duration, bytes, packets)
- Protocol information
- Port numbers
- TCP flags
- Timing information
- Flow direction indicators
- And more...

## Training with NetFlow v3 Datasets

### Quick Start

```bash
# Train multi-class model (10 classes)
python train_netflow.py NF-UNSW-NB15-v3.csv

# Train binary classification model (Benign vs Attack)
python train_netflow.py NF-UNSW-NB15-v3.csv --binary

# Use gradient boosting
python train_netflow.py NF-UNSW-NB15-v3.csv -m gradient_boost

# Custom output path
python train_netflow.py NF-UNSW-NB15-v3.csv -o models/my_netflow_model.joblib
```

### Command Line Options

```bash
python train_netflow.py <dataset> [options]

Required:
  dataset              Path to NetFlow v3 CSV file

Optional:
  -o, --output         Output model path (default: models/netflow_nids_model.joblib)
  -l, --label-column   Label column name (default: Label)
  -m, --model-type     Model type: random_forest or gradient_boost (default: random_forest)
  --binary             Convert to binary classification (Benign vs Attack)
```

### Python API

```python
from train_netflow import NetFlowNIDSModel, load_netflow_dataset

# Load dataset
X, y, class_dist = load_netflow_dataset('NF-UNSW-NB15-v3.csv')

# Train model
model = NetFlowNIDSModel('models/my_model.joblib')
metrics = model.train(X, y, model_type='random_forest')

# Make predictions
prediction = model.predict(features)  # Returns class name
probabilities = model.predict_proba(features)  # Returns probability for each class

# Save/load model
model.save()
model.load()
```

## Dataset Format Requirements

The NetFlow v3 CSV file should have:
- A label column (default name: 'Label') containing class names
- 53 feature columns with NetFlow statistics
- No missing column headers

Example structure:
```
Feature1,Feature2,Feature3,...,Feature53,Label
0.123,45.6,789,...,0.001,Benign
1.234,56.7,890,...,0.002,DoS
...
```

## Model Performance

The trained model will output:
- **Overall accuracy**
- **Per-class precision, recall, F1-score**
- **Confusion matrix**

Example output:
```
TRAINING RESULTS
================================================================================

Accuracy: 0.9845

Classification Report:
              precision    recall  f1-score   support

      Benign       0.99      0.99      0.99    447546
        DoS        0.95      0.92      0.93      1196
    Exploits       0.94      0.96      0.95      8550
     Fuzzers       0.98      0.97      0.97      6763
     Generic       0.89      0.91      0.90      3930
Reconnaissance     0.93      0.95      0.94      3415
   ...

    accuracy                           0.98    473085
   macro avg       0.94      0.94      0.94    473085
weighted avg       0.98      0.98      0.98    473085
```

## Handling Class Imbalance

The NetFlow datasets have significant class imbalance (94.6% benign traffic). The training script uses:

1. **Balanced class weights** - Automatically adjusts for class imbalance
2. **Stratified sampling** - Maintains class proportions in train/test split
3. **Appropriate metrics** - Reports per-class performance

For better performance on minority classes, consider:
- Using more training data
- Applying SMOTE or other oversampling techniques
- Adjusting class weights manually
- Using ensemble methods

## Integration with Main NIDS

To use a NetFlow-trained model with the main NIDS system:

1. Train your model:
```bash
python train_netflow.py NF-UNSW-NB15-v3.csv -o models/netflow_model.joblib
```

2. Update `config.json`:
```json
{
  "detection": {
    "model_path": "models/netflow_model.joblib",
    "threshold": 0.7
  }
}
```

3. Run NIDS:
```bash
sudo python main.py
```

**Note**: The NetFlow model expects 53 features, while the default NIDS extracts 30 features from packets. For production use with NetFlow models:
- Ensure your packet capture extracts NetFlow-compatible features
- Or use the model in a NetFlow collection pipeline

## Troubleshooting

### "Label column not found"
The script automatically tries common label column names (Label, label, Attack, attack, Class, class). If your dataset uses a different name, specify it:
```bash
python train_netflow.py dataset.csv -l YourLabelColumn
```

### "Model expects 53 features"
NetFlow v3 datasets have 53 features. Ensure your CSV has the correct number of feature columns.

### Memory Issues
Large datasets may require significant RAM. For the full NF-UNSW-NB15-v3 (2.3M samples):
- Recommended: 16GB+ RAM
- Can train on subsets using pandas chunking if needed

### Poor Performance on Minority Classes
Try:
- Training longer (increase n_estimators)
- Using gradient boosting instead of random forest
- Applying oversampling techniques
- Collecting more samples of minority classes

## Examples

### Example 1: Multi-class Classification
```bash
# Train on full dataset with all 10 classes
python train_netflow.py NF-UNSW-NB15-v3.csv

# Model can now distinguish between:
# Benign, DoS, Exploits, Fuzzers, Generic, Reconnaissance, etc.
```

### Example 2: Binary Classification
```bash
# Train binary classifier (useful for simple threat detection)
python train_netflow.py NF-UNSW-NB15-v3.csv --binary

# Model outputs: 0 (Benign) or 1 (Attack)
```

### Example 3: Using Different Datasets
```bash
# Train on NF-ToN-IoT-v3
python train_netflow.py NF-ToN-IoT-v3.csv

# Train on NF-BoT-IoT-v3
python train_netflow.py NF-BoT-IoT-v3.csv

# Train on NF-CSE-CIC-IDS2018-v3
python train_netflow.py NF-CSE-CIC-IDS2018-v3.csv
```

## Additional Resources

- **Dataset Download**: Contact dataset authors or check their repository
- **Paper**: [arXiv:2503.04404](https://arxiv.org/abs/2503.04404)
- **Original Datasets**: UNSW-NB15, ToN-IoT, BoT-IoT, CSE-CIC-IDS2018

## Support

For issues specific to NetFlow v3 datasets, refer to the original dataset documentation and citation paper.

For issues with this integration, please check the main NIDS documentation or open an issue on the repository.
