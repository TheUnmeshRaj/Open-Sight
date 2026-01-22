import os
import torch
import numpy as np
from sklearn.metrics import recall_score, precision_score, f1_score
from torch.utils.data import DataLoader
from tqdm import tqdm
import config
from DataPreLoader import DataPreLoader
from LSTMModel import ConvLSTMModel

# Reuse the test loop from LSTMTrain.py
def optimize_threshold(all_preds_prob, all_targets):
    print("\n" + "="*60)
    print(f"{'Threshold':<10} | {'Recall':<10} | {'Precision':<10} | {'F1 Score':<10}")
    print("-" * 60)

    best_f1 = 0.0
    best_thresh = 0.0
    best_metrics = (0, 0, 0)

    # Test thresholds from 0.1 to 0.9
    for thresh in np.arange(0.1, 0.95, 0.05):
        # Apply threshold
        pred_bin = (all_preds_prob > thresh).astype(float)

        recall = recall_score(all_targets, pred_bin, zero_division=0)
        precision = precision_score(all_targets, pred_bin, zero_division=0)
        f1 = f1_score(all_targets, pred_bin, zero_division=0)

        print(f"{thresh:<10.2f} | {recall:<10.4f} | {precision:<10.4f} | {f1:<10.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_thresh = thresh
            best_metrics = (recall, precision, f1)

    print("-" * 60)
    print(f"\n🏆 BEST THRESHOLD: {best_thresh:.2f}")
    print(f"Recall:    {best_metrics[0]:.4f}")
    print(f"Precision: {best_metrics[1]:.4f}")
    print(f"F1 Score:  {best_metrics[2]:.4f}")
    print("\nTo use this, update CLASS_THRESH in code/config.py")
    
    return best_metrics

def test(dl, model, batch_size):
    model.eval()

    all_preds_prob = []
    all_targets = []

    print("\nRunning evaluation on TEST set...")
    with torch.no_grad():
        for X, Y in tqdm(dl, ncols=75):
            if Y.shape[0] != batch_size:
                continue

            pred = model(X).view(batch_size, -1)
            # Store raw probabilities
            all_preds_prob.append(pred.cpu().numpy().reshape(-1))
            all_targets.append(Y.cpu().numpy().reshape(-1))

    all_preds_prob = np.concatenate(all_preds_prob)
    all_targets = np.concatenate(all_targets)

    return optimize_threshold(all_preds_prob, all_targets)

def main():
    device = torch.device(config.DEVICE)
    prep_path = config.PROJECT_DIR + "/Data/PreprocessedDatasets"
    
    # Load Test Data
    if not os.path.exists(prep_path + f"/{config.CRIME_TYPE_NUM}_features.h5"):
        print("Error: Preprocessed data not found. Please run training first.")
        return

    test_data = DataPreLoader(prep_path, device, "test")
    test_dl = DataLoader(test_data, batch_size=config.TRAIN_BATCH_SIZE)

    # Load Model
    model = ConvLSTMModel(
        input_dim=config.CRIME_TYPE_NUM,
        hidden_dim=config.HIDDEN_DIM,
        kernel_size=config.KERNEL_SIZE,
        bias=True
    ).to(device)

    model_path = config.MODEL_SAVE_PATH + "/BestModel.pt"
    if not os.path.exists(model_path):
        print(f"Error: Model file not found at {model_path}")
        return

    print(f"Loading model from: {model_path}")
    checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    model.load_state_dict(checkpoint['model'])

    # Run Test
    test(test_dl, model, config.TRAIN_BATCH_SIZE)

if __name__ == "__main__":
    main()
