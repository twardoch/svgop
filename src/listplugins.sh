#!/usr/bin/env bash
cd ../plugins/;

echo 'var pluginMap = {' >../src/pluginsMap.js;
echo '            plugins: [' >../src/pluginsList.js;

ls -1 | while read p; do 
	echo "    ${p%%.*}: require('../../plugins/$p')," >>../src/pluginsMap.js; 
	echo "                    '${p%%.*}'," >>../src/pluginsList.js; 
done;

echo '};' >>../src/pluginsMap.js;
echo '                ]' >>../src/pluginsList.js;
