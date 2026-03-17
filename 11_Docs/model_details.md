# Model Details

## Masked Autoencoder (MAE)

Self-supervised pre-training model for learning features from unlabeled images.

**Architecture**: Vision Transformer with masked patch reconstruction
**Input**: 256×256 RGB images
**Output**: Learned embeddings (768-dim)

## Ring Segmenter

Segments individual tree rings from cross-section images.

**Architecture**: U-Net with encoder-decoder structure
**Input**: 256×256 images (RGB or MAE embeddings)
**Output**: Binary segmentation masks
**Loss**: Dice Loss + Cross-Entropy

## Ring Graph Network (GraphNet)

Analyzes ring topology using graph neural networks.

**Input**: Ring masks + extracted ring properties
**Output**: Ring-to-ring relationships and anomaly scores
**Architecture**: Graph Convolutional Networks

## Anomaly Detector

Identifies false rings and missing rings.

**Input**: Segmentation results + embeddings
**Output**: Anomaly labels and confidence scores
**Architecture**: Gradient Boosting ensemble

## Training Details

- **Optimizer**: AdamW
- **Scheduler**: CosineAnnealingLR
- **Augmentations**: Random crops, flips, rotations, color jitter
- **Hardware**: GPU with mixed precision training
- **Validation**: 10% holdout with early stopping
