#!/bin/bash

# Convenience wrapper for the release script
# Redirects to scripts/release.sh

exec "$(dirname "$0")/scripts/release.sh" "$@"