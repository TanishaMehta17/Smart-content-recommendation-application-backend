# 1. Use official Node.js image as base
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the entire application
COPY . .

# 6. Install Prisma CLI globally
RUN npm install -g prisma

# 7. Generate Prisma Client
RUN npx prisma generate

# 8. Expose the application port
EXPOSE 5000

# 9. Define the command to start the app
CMD ["node", "index.js"]
