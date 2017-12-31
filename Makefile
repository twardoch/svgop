all: build-macos build-win32 build-win64 build-linux

prep: clean prep-git

prep-git: 
	@echo "Installing 'pkg' for node"
	@npm install -g pkg
	@echo "Installing 'svgo' and its dependencies"
	@npm install
	#@echo "Gathering 'svgo' sources"
	#@git clone https://github.com/svg/svgo
	@mv ./node_modules/svgo .
	@cp -r ./svgo/lib .
	@cp -r ./svgo/plugins .
	#@rm -rf ./node_modules/svgo
	@echo "Patching 'svgo' sources"
	@cp ./src/lib/svgo/config.js ./lib/svgo/
	@cp ./src/plugins/convertPathData.js ./plugins/
	@echo "Assing pdf.js"
	#@cp ./node_modules/pdfjs-dist/build/pdf.combined.js ./lib/
	#@rm -rf ./node_modules/pdfjs-dist

prep-ship: 
	@echo "Installing 'pkg' for node"
	@npm install -g pkg
	@echo "Installing 'svgo' and its dependencies"
	@npm install
	@echo "Gathering 'svgo' sources"
	@cp -r ./node_modules/svgo/lib .
	@cp -r ./node_modules/svgo/plugins .
	@rm -rf ./node_modules/svgo
	@echo "Patching 'svgo' sources"
	@cp ./src/lib/svgo/config.js ./lib/svgo/
	@cp ./src/lib/svgo/plugin/convertPathData.js ./plugins/

build-macos: prep
	@echo "Building 'svgop' for macOS ./bin/macos"
	@mkdir -p ./bin/svgop-macos
	@pkg -t macos-x64 --output=./bin/svgop-macos/svgop -c pkg.json ./src/svgop.js

build-linux: prep
	@echo "Building 'svgop' for Linux ./bin/linux"
	@mkdir -p ./bin/svgop-linux
	@pkg -t linux-x64 --output=./bin/svgop-linux/svgop -c pkg.json ./src/svgop.js

build-win32: prep
	@echo "Building 'svgop' for Windows x86 in ./bin/win32"
	@mkdir -p ./bin/svgop-win32
	@pkg -t win-x86 --output=./bin/svgop-win32/svgop.exe -c pkg.json ./src/svgop.js

build-win64: prep
	@echo "Building 'svgop' for Windows x64 in ./bin/win64"
	@mkdir -p ./bin/svgop-win64
	@pkg -t win-x64 --output=./bin/svgop-win64/svgop.exe -c pkg.json ./src/svgop.js

install: build-macos
	@echo "Installing /usr/loca/bin/svgop"
	@cp ./bin/svgop-macos/svgop /usr/local/bin

package: package-macos package-win32 package-win64 package-linux

package-macos: 
	@mkdir -p dist
	@cd ./bin; zip -r ../dist/svgop-macos.zip svgop-macos/; cd ..

package-linux: 
	@mkdir -p dist
	@cd ./bin; zip -r ../dist/svgop-linux.zip svgop-linux/; cd ..

package-win32: 
	@mkdir -p dist
	@cd ./bin; zip -r ../dist/svgop-win32.zip svgop-win32/; cd ..

package-win64: 
	@mkdir -p dist
	@cd ./bin; zip -r ../dist/svgop-win64.zip svgop-win64/; cd ..

clean: 
	@echo "Cleaning"
	@rm -rf ./package-lock.json
	@rm -rf ./node_modules/
	@rm -rf ./svgo/
	@rm -rf ./lib/
	@rm -rf ./plugins/
	@rm -rf ./bin/
