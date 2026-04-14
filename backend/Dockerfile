# syntax=docker/dockerfile:1

ARG GO_VERSION=1.26
ARG ENV=production

# ---- Build stage ----------------------------------------------------------
# Using a minimal Wolfi-based Go image (distroless-friendly base with apk)
FROM cgr.dev/chainguard/go:latest AS builder

ARG ENV
ARG TARGETOS
ARG TARGETARCH

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build static binary; disable VCS info for reproducibility in container builds
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64} \
    go build -buildvcs=false -ldflags="-s -w" -o /bin/projetin ./cmd/api


# ---- Compression stage ----------------------------------------------------
# Keep this stage minimal; install upx to compress the binary
FROM cgr.dev/chainguard/wolfi-base AS compressor
RUN apk --no-cache add upx
COPY --from=builder /bin/projetin /bin/projetin
RUN upx --best --lzma /bin/projetin


# ---- Runtime stage --------------------------------------------------------
# Fully scratch image; only the binary and example env are shipped
FROM scratch

ARG ENV

WORKDIR /app

COPY --from=compressor /bin/projetin /app/projetin
COPY --from=builder /app/.env.example /app/.env.example

ENV APP_ENV=${ENV}

EXPOSE 8080
USER 65532:65532

CMD ["/app/projetin"]
