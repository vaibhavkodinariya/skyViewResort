# Use the official Node.js v21.5.0 image
FROM node:21.5.0

# Set the working directory in the container
WORKDIR /backend

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
