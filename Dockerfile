# ---- Build stage ----
FROM rust:1.82 AS builder

WORKDIR /app

# Install dependencies needed by some of your crates (sqlx, reqwest, etc.)
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy manifests first for better layer caching
COPY Cargo.toml Cargo.lock ./

# Copy the actual source
COPY src ./src

# Build in release mode
RUN cargo build --release

# ---- Runtime stage ----
FROM debian:bookworm-slim

WORKDIR /app

# Runtime dependencies (TLS certs needed for reqwest/sqlx over HTTPS)
RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

# Copy the compiled binary from the builder stage
COPY --from=builder /app/target/release/pro_grad /app/pro_grad

# Render sets PORT automatically; the app already reads it via std::env::var("PORT")
EXPOSE 8000

CMD ["./pro_grad"]