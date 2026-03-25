# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Set the working directory
WORKDIR /app

# Install system dependencies (needed for OpenCV, Shapely, and git clone)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    libgeos-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Clone the CS-TRD library from its public GitHub repo
RUN git clone --depth 1 https://github.com/hmarichal93/cstrd.git /app/cstrd_ipol

# Set CSTRD_ROOT so the backend can find it
ENV CSTRD_ROOT=/app/cstrd_ipol

# Copy requirements and install dependencies
COPY 08_Deployment/Backend/requirements.txt /app/backend_requirements.txt
RUN pip install --no-cache-dir -r /app/cstrd_ipol/requirements.txt \
    && pip install --no-cache-dir -r /app/backend_requirements.txt \
    && pip install --no-cache-dir scipy scikit-image

# Copy the entire project context into the container
COPY . /app/

# Expose the API port
EXPOSE 8000

# Set the working directory to the Backend folder and run
WORKDIR /app/08_Deployment/Backend
CMD ["python", "main.py"]
