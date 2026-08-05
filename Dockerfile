# Gunakan Node.js LTS (slim Debian base)
FROM node:20-bullseye-slim

# Instal Python 3, pip, ffmpeg, dan curl
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Salin package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Instal dependensi npm
RUN npm ci

# Salin seluruh kode proyek
COPY . .

# Build aplikasi Next.js
RUN npm run build

# Expose port yang digunakan Next.js
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Jalankan server Next.js production
CMD ["npm", "start"]
