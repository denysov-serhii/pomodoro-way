# Stage 1: Build native image
FROM ghcr.io/graalvm/native-image:ol9-java17-22.3.3 AS builder

WORKDIR /app

# Copy gradle wrapper and build files
COPY gradle gradle
COPY gradlew .
COPY gradle.properties* ./
COPY settings.gradle build.gradle ./

# Copy source code
COPY src src

# Build native image
RUN ./gradlew nativeCompile --no-daemon

# Stage 2: Runtime
FROM oraclelinux:9-slim

WORKDIR /app

# Copy the native executable from builder
COPY --from=builder /app/build/native/nativeCompile/pomodoro-way-backend /app/application

# Expose port
EXPOSE 8080

# Run the native image
ENTRYPOINT ["/app/application"]
