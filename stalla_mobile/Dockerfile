# Dockerfile pour Flutter Mobile App
FROM ubuntu:22.04

# Variables d'environnement
ENV FLUTTER_VERSION=3.24.5
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH="${PATH}:/opt/flutter/bin:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools"

# Mise à jour et installation des dépendances
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Installation de Flutter
RUN git clone https://github.com/flutter/flutter.git -b stable /opt/flutter
RUN /opt/flutter/bin/flutter doctor

# Configuration du répertoire de travail
WORKDIR /app

# Copie des fichiers du projet
COPY . .

# Téléchargement des dépendances
RUN flutter pub get

# Commande par défaut
CMD ["flutter", "run", "--release"]