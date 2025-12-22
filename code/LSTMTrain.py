# Luohao Xu edsml-lx122 (Edited for stability & low disk usage)

import os
import torch
import numpy as np
from sklearn.metrics import recall_score, precision_score, f1_score
from torch.utils.data import DataLoader
from tqdm import tqdm
from tensorboardX import SummaryWriter
import warnings
warnings.filterwarnings("ignore")

import config
from DataPreLoader import DataPreLoader
from LSTMModel import ConvLSTMModel
from DataPreprocessing import DataPreprocessing


# --------------------------------------------------
# Weighted BCE Loss
# --------------------------------------------------
def bceLoss(pred, target, weights=config.BCE_WEIGHTS):
    pred = torch.clamp(pred, min=1e-7, max=1 - 1e-7)
    loss = - weights[1] * target * torch.log(pred) \
           - (1 - target) * weights[0] * torch.log(1 - pred)
    return torch.mean(loss)


# --------------------------------------------------
# Training Loop
# --------------------------------------------------
def train(train_dl, val_dl, model, optim, scheduler, epochs, batch_size):

    writer = SummaryWriter(comment="-CrimeHotspot")

    best_model = model
    best_loss = float("inf")
    best_epoch = 0

    for epoch in range(epochs):
        print(f"\nEpoch {epoch + 1}/{epochs}\n")

        model.train()
        epoch_loss = 0.0
        total = 0

        for X, Y in tqdm(train_dl, ncols=75):
            if Y.shape[0] != batch_size:
                continue

            pred = model(X).view(batch_size, -1)
            loss = bceLoss(pred, Y)

            optim.zero_grad()
            loss.backward()
            optim.step()

            epoch_loss += loss.item()
            total += 1

        scheduler.step()
        train_loss = epoch_loss / max(total, 1)

        # ---- Validation ----
        val_loss, val_f1, val_recall, val_precision = validate(
            val_dl, model, batch_size
        )

        print(f"Train Loss: {train_loss:.5f}")
        print(f"Val   Loss: {val_loss:.5f}")

        writer.add_scalar("Loss/Train", train_loss, epoch)
        writer.add_scalar("Loss/Val", val_loss, epoch)
        writer.add_scalar("F1/Val", val_f1, epoch)
        writer.add_scalar("Recall/Val", val_recall, epoch)
        writer.add_scalar("Precision/Val", val_precision, epoch)

        # ---- Save only BEST model (CRITICAL FIX) ----
        if val_loss < best_loss:
            best_loss = val_loss
            best_epoch = epoch
            best_model = model

    writer.close()
    return best_model, best_epoch


# --------------------------------------------------
# Validation Loop
# --------------------------------------------------
def validate(dl, model, batch_size):
    model.eval()

    epoch_loss = 0.0
    total = 0
    all_preds = []
    all_targets = []

    with torch.no_grad():
        for X, Y in dl:
            if Y.shape[0] != batch_size:
                continue

            pred = model(X).view(batch_size, -1)
            loss = bceLoss(pred, Y)

            pred_bin = (pred > config.CLASS_THRESH).float()

            all_preds.append(pred_bin.cpu().numpy().reshape(-1))
            all_targets.append(Y.cpu().numpy().reshape(-1))

            epoch_loss += loss.item()
            total += 1

    all_preds = np.concatenate(all_preds)
    all_targets = np.concatenate(all_targets)

    recall = recall_score(all_targets, all_preds, zero_division=0)
    precision = precision_score(all_targets, all_preds, zero_division=0)
    f1 = f1_score(all_targets, all_preds, zero_division=0)

    return epoch_loss / max(total, 1), f1, recall, precision


# --------------------------------------------------
# Test Loop
# --------------------------------------------------
def test(dl, model, batch_size):
    model.eval()

    all_preds = []
    all_targets = []

    with torch.no_grad():
        for X, Y in dl:
            if Y.shape[0] != batch_size:
                continue

            pred = model(X).view(batch_size, -1)
            pred_bin = (pred > config.CLASS_THRESH).float()

            all_preds.append(pred_bin.cpu().numpy().reshape(-1))
            all_targets.append(Y.cpu().numpy().reshape(-1))

    all_preds = np.concatenate(all_preds)
    all_targets = np.concatenate(all_targets)

    recall = recall_score(all_targets, all_preds, zero_division=0)
    precision = precision_score(all_targets, all_preds, zero_division=0)
    f1 = f1_score(all_targets, all_preds, zero_division=0)

    print("\nTest Results")
    print(f"Recall:    {recall}")
    print(f"Precision: {precision}")
    print(f"F1 Score:  {f1}")

    return recall, precision, f1


# --------------------------------------------------
# Main
# --------------------------------------------------
if __name__ == "__main__":

    torch.manual_seed(config.RANDOM_SEED)
    device = torch.device(config.DEVICE)

    prep_path = config.PROJECT_DIR + "/Data/PreprocessedDatasets"

    if not os.path.exists(prep_path + f"/{config.CRIME_TYPE_NUM}_features.h5"):
        DataPreprocessing(config.PROJECT_DIR)

    train_data = DataPreLoader(prep_path, device, "train")
    val_data = DataPreLoader(prep_path, device, "val")
    test_data = DataPreLoader(prep_path, device, "test")

    train_dl = DataLoader(train_data, batch_size=config.TRAIN_BATCH_SIZE)
    val_dl = DataLoader(val_data, batch_size=config.TRAIN_BATCH_SIZE)
    test_dl = DataLoader(test_data, batch_size=config.TRAIN_BATCH_SIZE)

    model = ConvLSTMModel(
        input_dim=config.CRIME_TYPE_NUM,
        hidden_dim=config.HIDDEN_DIM,
        kernel_size=config.KERNEL_SIZE,
        bias=True
    ).to(device)

    optim = torch.optim.Adam(model.parameters(), lr=config.LEARNING_RATE)
    scheduler = torch.optim.lr_scheduler.StepLR(optim, step_size=3, gamma=0.5)

    print("\nTraining started\n")
    best_model, best_epoch = train(
        train_dl, val_dl, model, optim, scheduler,
        config.N_EPOCHS, config.TRAIN_BATCH_SIZE
    )

    print("\nTesting best model\n")
    test(test_dl, best_model, config.TRAIN_BATCH_SIZE)

    # ---- Save ONE final model only ----
    save_path = config.MODEL_SAVE_PATH + "/BestModel.pt"
    torch.save(
        {"model": best_model.state_dict(), "epoch": best_epoch},
        save_path
    )

    print(f"\nBest model saved to {save_path}\n")