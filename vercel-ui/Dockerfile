FROM node:20-slim

# Install system dependencies (fonts and libs for rendering)
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome stable (adds Google's apt repo and key)
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update \
  && apt-get install -y google-chrome-stable --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  || true

# Ensure a consistent executable path and provide CHROME_PATH for the app
RUN if [ -x "/usr/bin/google-chrome" ]; then echo "google-chrome exists"; \
    elif [ -x "/usr/bin/google-chrome-stable" ]; then ln -s /usr/bin/google-chrome-stable /usr/bin/google-chrome; fi

ENV CHROME_PATH=/usr/bin/google-chrome

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json package-lock.json* ./

# Configure npm for better resilience on slow/flaky networks
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Use BuildKit cache mount to preserve npm cache between builds
RUN --mount=type=cache,target=/root/.npm npm ci

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
