# all: build-macos build-win32 build-win64 build-linux
all: qjs macos win64 linux

prebuild: prebuild-clean prebuild-prep

prebuild-prep:
	@echo "Installing 'svgo' and its dependencies"
	@npm i
	@echo "Gathering 'svgo' sources"
	@mkdir -p svgo
	@cp -r ./node_modules/svgo/lib ./svgo
	@cp -r ./node_modules/svgo/plugins ./svgo
	@rm -rf ./node_modules/svgo
	@echo "Patching 'svgo' sources"
	@cp ./patch/config.js ./svgo/lib/svgo/
	@mkdir -p ../bin/svgop-pkg-macos
	@mkdir -p ../bin/svgop-qjs-macos
	@mkdir -p ../bin/svgop-pkg-linux
	@mkdir -p ../bin/svgop-pkg-win32
	@mkdir -p ../bin/svgop-pkg-win64
	@mkdir -p ../bin/svgop-node
	# @cp ./src/lib/svgo/plugin/convertPathData.js ./plugins/

build-node: prebuild
	@echo "Building 'svgop' with webpack"
	@mkdir -p ../build/svgop-node
	@webpack --config=./webpack.config-node.js
	@echo "#!/usr/bin/env node" > ../bin/svgop-node/svgopjs
	@cat ../build/svgop-node/svgop.js >> ../bin/svgop-node/svgopjs
	@chmod gou+x ../bin/svgop-node/svgopjs

build-qjs: prebuild
	@echo "Building 'svgop' for qjs"
	@mkdir -p ../build/svgop-qjs
	@webpack --config=./webpack.config-qjs.js
	# @prettier ../build/svgop-qjs/svgop-pack.js > ../build/svgop-qjs/svgop-mod.js
	@echo 'import * as std from "std";' > ../build/svgop-qjs/svgop.js
	@cat ../build/svgop-qjs/svgop-mod.js >> ../build/svgop-qjs/svgop.js
	@qjsc -e -o ../build/svgop-qjs/svgop.c ../build/svgop-qjs/svgop.js

build-macos: build-qjs-macos build-pkg-macos

build-qjs-macos: build-qjs
	@echo "Building 'svgop' with qjs for macOS ./bin/svgop-qjs-macos"
	@mkdir -p ../build/svgop-qjs-macos
	@qjsc -o ../build/svgop-qjs-macos/svgop ../build/svgop-qjs/svgop.js
	@cp ../build/svgop-qjs-macos/svgop ../bin/svgop-qjs-macos/

build-pkg-macos: prebuild
	@echo "Building 'svgop' with pkg for macOS ./bin/svgop-pkg-macos"
	@mkdir -p ../build/svgop-pkg-macos
	@pkg -t macos-x64 --output=../build/svgop-pkg-macos/svgop -c ./package.json ./app/svgop-pkg.js
	@cp ../build/svgop-pkg-macos/svgop ../bin/svgop-pkg-macos/

build-linux: build-pkg-linux

build-pkg-linux: prebuild
	@echo "Building 'svgop' with pkg for Linux ./bin/svgop-pkg-linux"
	@mkdir -p ../build/svgop-pkg-linux
	@pkg -t linux-x64 --output=../build/svgop-pkg-linux/svgop -c ./package.json ./app/svgop-pkg.js
	@cp ../build/svgop-pkg-linux/svgop ../bin/svgop-pkg-linux/

build-win: build-pkg-win64 build-pkg-win32

build-pkg-win32: prebuild
	@echo "Building 'svgop' with pkg for Windows x86 in ./bin/svgop-pkg-win32"
	@mkdir -p ../build/svgop-pkg-win32
	@pkg -t win-x86 --output=../build/svgop-pkg-win32/svgop.exe -c ./package.json ./app/svgop-pkg.js
	@cp ../build/svgop-pkg-win32/svgop.exe ../bin/svgop-pkg-win32/

build-pkg-win64: prebuild
	@echo "Building 'svgop' with pkg for Windows x64 in ./bin/svgop-pkg-win64"
	@mkdir -p ../build/svgop-pkg-win64
	@pkg -t win-x64 --output=../build/svgop-pkg-win64/svgop.exe -c ./package.json ./app/svgop-pkg.js
	@cp ../build/svgop-pkg-win64/svgop.exe ../bin/svgop-pkg-win64/

install: build-macos
	@echo "Installing /usr/local/bin/svgop"
	@cp ../bin/svgop-qjs-macos/svgop /usr/local/bin

package: package-qjs package-pkg

package-pkg: package-pkg-macos package-pkg-win32 package-pkg-win64 package-pkg-linux

package-qjs: package-qjs package-qjs-macos


package-prep:
	@mkdir -p ../dist

package-linux: package-prep
	@cd ../bin; zip -r ../dist/svgop-pkg-linux.zip svgop-pkg-linux/; cd ../src;

package-macos: package-prep
	@cd ../bin; zip -r ../dist/svgop-qjs-macos.zip svgop-qjs-macos/; cd ../src;
	@cd ../bin; zip -r ../dist/svgop-pkg-macos.zip svgop-pkg-macos/; cd ../src;

package-win32: package-prep
	@cd ../bin; zip -r ../dist/svgop-pkg-win32.zip svgop-pkg-win32/; cd ../src;

package-win64: package-prep
	@cd ../bin; zip -r ../dist/svgop-pkg-win64.zip svgop-pkg-win64/; cd ../src;

linux: build-pkg-linux package-linux
macos: build-qjs-macos test-qjs-macos build-pkg-macos test-pkg-macos package-macos
node: build-node test-node
qjs: build-qjs test-qjs
win32: build-pkg-win32 package-win32
win64: build-pkg-win64 package-win64
win: win64 win32

prebuild-clean:
	@rm -rf ./svgo/

clean: prebuild-clean
	@echo "Cleaning"
	@rm -rf ../build/
	@rm -rf ./src/package-lock.json
	@rm -rf ./src/node_modules/
	#@rm -rf ./bin/

test-node:
	@echo "\n\n# node: cat ../test/test.svg | node ./app/svgop-node.js"
	@cat ../test/test.svg | ../bin/svgop-node/svgopjs

test-pkg-macos:
	@echo "\n\n# macos < pkg: cat ../test/test.svg | ../build/svgop-pkg-macos/svgop"
	@cat ../test/test.svg | ../build/svgop-pkg-macos/svgop

test-qjs:
	@echo "\n\n# qjs < webpack: cat ../test/test.svg | qjs ../build/svgo-qjs/svgop.js"
	@cat ../test/test.svg | qjs ../build/svgop-qjs/svgop.js

test-qjs-macos:
	@echo "\n\n# macos < qjsc: ./test/test.svg | ../build/svgo-qjs-macos/svgop"
	@cat ../test/test.svg | ../build/svgop-qjs-macos/svgop

test: test-node test-qjs test-macos-qjsc test-pkg-macos
