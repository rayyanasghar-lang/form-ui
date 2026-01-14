FROM node:20-slim

# Install system dependencies (fonts and libs for rendering)
RUN apt-get update && apt-get install -y \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

# Expose the port Next.js runs on
EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV development

# Run in development mode as requested (no build step)
CMD ["npm", "run", "dev"]
