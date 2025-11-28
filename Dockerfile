# Build Stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 1234

# Start server
CMD ["npm", "run", "server"]
