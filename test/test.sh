#!/usr/bin/env bash
dir=${0%/*}; if [ "$dir" = "$0" ]; then dir="."; fi; cd "$dir"; 
echo "ORIGINAL:"
cat test.svg
echo "OPTIMIZED:"
../bin/macos/svgop < test.svg
