# Start with the Node.js slim base image
FROM node:bullseye-slim
# Set the working directory
WORKDIR /usr/src/app
# Copy package.json and package-lock.json for Node.js dependencies
COPY package*.json ./
# Install Node.js dependencies
RUN npm install --legacy-peer-deps
# Install Python and pip
# Update the package lists and install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \ 
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
# Copy the Python requirements file
COPY requirements.txt ./
# Install Python dependencies
RUN pip3 install -r requirements.txt && \
    python3 -m spacy download en_core_web_sm

# Copy the rest of your app's source code
COPY . .
# Build your TypeScript files
RUN npm run build
# The application's port
EXPOSE 3000