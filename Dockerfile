FROM node:alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install

COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]