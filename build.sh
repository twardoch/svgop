#!/bin/bash

# Convenience wrapper for the main build script
# Redirects to scripts/build.sh

exec "$(dirname "$0")/scripts/build.sh" "$@"