FROM node:alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of your app's source code
COPY . .

# Build your TypeScript files
RUN npm run build

# The application's port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]