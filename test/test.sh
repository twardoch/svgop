#!/usr/bin/env bash
echo "ORIGINAL:"
cat ./test/test.svg
echo "OPTIMIZED:"
cat ./test/test.svg | ./bin/macos/svgop
