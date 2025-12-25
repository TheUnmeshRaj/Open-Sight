# Adapted DataPreprocessing for Bengaluru crime hotspot prediction

import os
import h5py
import pandas as pd
import numpy as np
import config


class DataPreprocessing:
    def __init__(self, projectDir):
        self.projectDir = projectDir
        self.datasetDir = (
            self.projectDir
            + "/Data/Datasets/20230320020226crime_data_extended_entries.csv"
        )

        self.data = self.readDataset()

        self.dataPivotDir = (
            self.projectDir
            + f"/Data/PreprocessedDatasets/{config.CRIME_TYPE_NUM}_data_pivot.csv"
        )

        if not os.path.isfile(self.dataPivotDir):
            self.features, self.labels, self.dataPivot = self.getFeatureLabel()
        else:
            print("Loading pivot data, features and labels")
            self.dataPivot = pd.read_csv(self.dataPivotDir, index_col=[0, 1])

            with h5py.File(
                self.projectDir
                + f"/Data/PreprocessedDatasets/{config.CRIME_TYPE_NUM}_features.h5",
                "r",
            ) as hf:
                self.features = np.array(hf["features"][:])

            with h5py.File(
                self.projectDir
                + f"/Data/PreprocessedDatasets/{config.CRIME_TYPE_NUM}_labels.h5",
                "r",
            ) as hf:
                self.labels = np.array(hf["labels"][:])

        self.trainFeaturePath = (
            self.projectDir
            + f"/Data/PreprocessedDatasets/{config.CRIME_TYPE_NUM}_trainvaltest_features.h5"
        )
        self.trainLabelPath = (
            self.projectDir
            + f"/Data/PreprocessedDatasets/{config.CRIME_TYPE_NUM}_trainvaltest_labels.h5"
        )

        if not os.path.isfile(self.trainFeaturePath) or not os.path.isfile(
            self.trainLabelPath
        ):
            self.getTrainValTest()

    # ------------------------------------------------------------

    def preprocessDataset(self, save=True):
        print("Preprocessing Bengaluru crime dataset...")

        data = pd.read_csv(self.datasetDir)

        # Standardize column names
        data.rename(
            columns={
                "latitude": "Latitude",
                "longitude": "Longitude",
                "crime_type": "TYPE",
            },
            inplace=True,
        )

        # Parse date
        data["date"] = pd.to_datetime(data["date"], errors="coerce")
        data.dropna(subset=["date", "Latitude", "Longitude"], inplace=True)

        # Single crime channel (hotspot intensity)
        data["type"] = "crime"

        # Convert lat/lon → grid
        data["X"], data["Y"] = config.coord2grid(
            data["Latitude"].values, data["Longitude"].values
        )

        # Keep only points inside Bengaluru grid
        data = data[(data["X"] != -1) & (data["Y"] != -1)]

        data = data[["TYPE", "type", "date", "Latitude", "Longitude", "X", "Y"]]
        data.sort_values("date", inplace=True)

        if save:
            outdir = self.projectDir + "/Data/PreprocessedDatasets"
            os.makedirs(outdir, exist_ok=True)
            data.to_csv(
                outdir + f"/{config.CRIME_TYPE_NUM}_crimes.csv", index=False
            )

        return data

    # ------------------------------------------------------------

    def readDataset(self):
        print("Loading crime dataset...")

        savePath = (
            self.projectDir
            + f"/Data/PreprocessedDatasets/{config.CRIME_TYPE_NUM}_crimes.csv"
        )

        if not os.path.isfile(savePath):
            self.preprocessDataset()

        data = pd.read_csv(savePath)
        data["date"] = pd.to_datetime(data["date"], errors="coerce")
        data.dropna(inplace=True)
        data.sort_values("date", inplace=True)

        return data

    # ------------------------------------------------------------

    def getPivotData(self):
        print("Creating crime timetable...")

        data = self.data[["TYPE", "date", "type", "X", "Y"]]

        pivot = data.pivot_table(
            values="TYPE",
            index=["date", "type"],
            columns=["X", "Y"],
            aggfunc="count",
        )

        pivot.columns = pivot.columns.to_flat_index()

        xAll = np.arange(1, config.LAT_GRIDS + 1)
        yAll = np.arange(1, config.LON_GRIDS + 1)
        xyAll = [(x, y) for x in xAll for y in yAll]

        dates = data["date"].unique()
        indexAll = [(d, "crime") for d in dates]

        pivot = pivot.reindex(indexAll).reindex(columns=xyAll).fillna(0)
        pivot = pivot.astype("int8")

        return pivot

    # ------------------------------------------------------------

    def getFeatureLabel(self):
        print("Generating features and labels...")

        pivot = self.getPivotData()
        arr = pivot.values

        data = arr.reshape(
            (-1, 1, config.LAT_GRIDS, config.LON_GRIDS)
        )

        seq_len = config.SEQ_LEN
        X, Y = [], []

        for i in range(len(data) - (seq_len + 1)):
            X.append(data[i : i + seq_len])
            Y.append(data[i + seq_len + 1])

        X = (np.array(X) > 0).astype(int)
        Y = (np.array(Y) > 0).astype(int)

        with h5py.File(
            self.projectDir
            + f"/Data/PreprocessedDatasets/{config.CRIME_TYPE_NUM}_features.h5",
            "w",
        ) as hf:
            hf.create_dataset("features", data=X)

        with h5py.File(
            self.projectDir
            + f"/Data/PreprocessedDatasets/{config.CRIME_TYPE_NUM}_labels.h5",
            "w",
        ) as hf:
            hf.create_dataset("labels", data=Y)

        pivot.to_csv(self.dataPivotDir)

        return X, Y, pivot

    # ------------------------------------------------------------

    def getTrainValTest(self):
        print("Splitting Train / Val / Test dataset...")

        X, Y = self.features, self.labels

        n = len(X)
        t1 = int(0.7 * n)
        t2 = int(0.85 * n)

        with h5py.File(self.trainFeaturePath, "w") as hf:
            hf.create_dataset("train", data=X[:t1])
            hf.create_dataset("val", data=X[t1:t2])
            hf.create_dataset("test", data=X[t2:])

        with h5py.File(self.trainLabelPath, "w") as hf:
            hf.create_dataset("train", data=Y[:t1])
            hf.create_dataset("val", data=Y[t1:t2])
            hf.create_dataset("test", data=Y[t2:])