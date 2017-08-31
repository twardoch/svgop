all: build-macos build-win32 build-win64

prep: clean prep-git

prep-git: 
	@echo "Installing 'pkg' for node"
	@npm install -g pkg
	@echo "Installing 'svgo' and its dependencies"
	@npm install
	@echo "Gathering 'svgo' sources"
	@git clone https://github.com/svg/svgo
	@cp -r ./svgo/lib .
	@cp -r ./svgo/plugins .
	@rm -rf ./node_modules/svgo
	@echo "Patching 'svgo' sources"
	@cp ./src/lib/svgo/config.js ./lib/svgo/

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

build-macos: prep
	@echo "Building 'svgop' for macOS ./bin/macos"
	@mkdir -p ./bin/macos
	@pkg -t macos-x64 --output=./bin/macos/svgop -c pkg.json ./src/svgop.js

build-win32: prep
	@echo "Building 'svgop' for Windows x86 in ./bin/win32"
	@mkdir -p ./bin/win32
	@pkg -t win-x86 --output=./bin/win32/svgop.exe -c pkg.json ./src/svgop.js

build-win64: prep
	@echo "Building 'svgop' for Windows x64 in ./bin/win64"
	@mkdir -p ./bin/win64
	@pkg -t win-x64 --output=./bin/win64/svgop.exe -c pkg.json ./src/svgop.js

install: build-macos
	@cp ./bin/macos/svgop /usr/local/bin

clean: 
	@rm -rf ./package-lock.json
	@rm -rf ./node_modules/
	@rm -rf ./svgo/
	@rm -rf ./lib/
	@rm -rf ./plugins/
	@rm -rf ./bin/macos/
	@rm -rf ./bin/win32/
	@rm -rf ./bin/win64/
	@rm -rf ./bin/
