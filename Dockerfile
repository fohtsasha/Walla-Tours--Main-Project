# Use official Node.js image
FROM node:20

RUN apt-get update && apt-get install -y --no-install-recommends \
chromium \
chromium-driver \
&& rm -rf /var/lib/apt/lists/*
# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Default command to run tests (adjust if needed)
CMD ["npm", "run", "wdio"]
