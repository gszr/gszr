FROM debian:bookworm-slim

ARG TYPST_VERSION=0.15.0
ARG TARGETARCH

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    fonts-noto-core \
    nodejs \
    npm \
    pandoc \
    xz-utils \
  && rm -rf /var/lib/apt/lists/*

RUN case "${TARGETARCH}" in \
      arm64) typst_arch="aarch64" ;; \
      amd64) typst_arch="x86_64" ;; \
      *) echo "Unsupported architecture: ${TARGETARCH}" >&2; exit 1 ;; \
    esac \
  && curl -fsSL "https://github.com/typst/typst/releases/download/v${TYPST_VERSION}/typst-${typst_arch}-unknown-linux-musl.tar.xz" \
    | tar -xJ --strip-components=1 -C /usr/local/bin "typst-${typst_arch}-unknown-linux-musl/typst"

# Install render dependencies at the filesystem root so Node resolves them from
# /data (the bind-mounted project) without the mount shadowing node_modules.
COPY package.json package-lock.json /
RUN cd / && npm ci --omit=dev && npm cache clean --force

WORKDIR /data
