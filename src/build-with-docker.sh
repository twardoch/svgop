#!/bin/bash
# Script/commands to build using Docker
# Note: build fails currently even in old setup,
#       probably need to upgrade svgo

# Build/update images
docker compose build debian-base
docker compose build build
# Try to build all (fails to build for macos):
docker compose run --rm build
# Windows only:
# docker compose run --rm build-win
# Interactive:
# docker compose run --rm bash
