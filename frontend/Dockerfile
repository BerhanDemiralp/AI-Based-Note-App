# Use a base image with Node.js 20 LTS.
FROM node:20-alpine

# Set the working directory inside the container to /app.
WORKDIR /app

# Copy the package.json and package-lock.json files first.
# This allows Docker to cache the npm install step.
COPY package*.json ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application's source code.

# Expose port 3000 to the host machine.
EXPOSE 3000

# Start the development server.
# The 'npm start' command will automatically watch for changes.
CMD ["npm", "start"]