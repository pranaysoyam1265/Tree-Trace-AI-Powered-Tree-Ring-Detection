# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Set the working directory
WORKDIR /app

# Install system dependencies (needed for OpenCV and ML processing)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY 08_Deployment/Backend/requirements.txt /app/requirements.txt

# Install Backend dependencies and additional common ML/Image processing libraries
# CS-TRD and internal scripts typically depend on scientific packages
RUN pip install --no-cache-dir -r /app/requirements.txt \
    && pip install --no-cache-dir scipy pandas scikit-image matplotlib scikit-learn

# Copy the entire project context into the container
# This includes 01_Raw_Data, 08_Deployment, 09_Scripts, 06_ML_Core, and cstrd_ipol
COPY . /app/

# Expose the API port
EXPOSE 8000

# Set the default command to run the FastAPI app
# It runs directly from the Backend folder, and resolves paths relative to the root (/app)
WORKDIR /app/08_Deployment/Backend
CMD ["python", "main.py"]
