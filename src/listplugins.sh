#!/usr/bin/env bash
echo '' >./pluginsForConfig.js;
ls -1 | while read p; do echo "    ${p%%.*}: require('../../plugins/$p')," >>./pluginsForConfig.js; done;
