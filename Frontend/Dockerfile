# Build the frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm if pnpm-lock.yaml exists, otherwise use npm
RUN if [ -f pnpm-lock.yaml ]; then \
        npm install -g pnpm && \
        pnpm install --frozen-lockfile; \
    else \
        npm ci; \
    fi

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_BACKEND_URL=/api
ARG VITE_AGENT_URL=/agent

# Set environment variables for build
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_AGENT_URL=${VITE_AGENT_URL}

# Build the application
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm run build; \
    else \
        npm run build; \
    fi

# Final stage: Serve the built files and copy to volume
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY copy-dist.sh /copy-dist.sh
RUN chmod +x /copy-dist.sh
# Copy files to volume and keep container running
CMD ["/copy-dist.sh"]

