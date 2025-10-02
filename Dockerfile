# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files to the container's working directory
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the app using an NGINX server
FROM nginx:alpine

# Copy the built React app from the previous stage to NGINX's serving folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
