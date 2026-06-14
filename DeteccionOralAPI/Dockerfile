FROM python:3.10-slim

LABEL org.opencontainers.image.authors="Angel Pastaz"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependencias del sistema necesarias para PyTorch, OpenCV (headless) y YOLO
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Instalar PyTorch CPU primero para aprovechar la caché de Docker
RUN pip install --no-cache-dir \
    torch==2.1.2 \
    torchvision==0.16.2 \
    --index-url https://download.pytorch.org/whl/cpu

# Copiar requirements e instalar el resto de librerías
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Asegurar que el modelo final best.pt esté presente (fallará si no existe)
COPY best.pt .

# Copiar código de la aplicación
COPY . .

EXPOSE 8000

# Healthcheck para Docker
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]