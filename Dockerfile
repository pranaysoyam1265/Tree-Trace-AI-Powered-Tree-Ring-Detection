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
    libgl1 \
    libglib2.0-0 \
    build-essential \
    libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY 08_Deployment/Backend/requirements.txt /app/backend_requirements.txt
COPY cstrd_ipol/requirements.txt /app/cstrd_requirements.txt

# Install dependencies (CS-TRD first, then backend to ensure headless OpenCV takes precedence if possible)
RUN pip install --no-cache-dir -r /app/cstrd_requirements.txt \
    && pip install --no-cache-dir -r /app/backend_requirements.txt \
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
