all: 
	@echo "\n\nqjs<webpack"
	@cat ./test.svg | qjs ../bin/qjs/svgop.js
	@echo "\n\macos<nqjsc"
	@cat ./test.svg | ../bin/qjs/svgop
	@echo "\n\nnode"
	@cat ./test.svg | node ../src/svgop-pkg.js
	@echo "\n\nmacos<pkg"
	@cat ./test.svg | ../bin/svgop-macos/svgop
