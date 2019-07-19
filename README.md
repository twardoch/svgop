# svgop

`svgop` (**SVG O**ptimizer **P**ipeable) is a standalone binary executable that combines the excellent [`svgo`](https://github.com/svg/svgo) Nodejs-based tool for optimizing SVG vector graphics files, and [`pdf.js`](https://github.com/mozilla/pdf.js), the PDF renderer written in JS.

## Changelog

#### 2019-07-19

Experimental support for Fabrice Bellard’s [QuickJS](https://bellard.org/quickjs/) ([git mirror](https://github.com/horhof/quickjs)): 

- on macOS run `brew install quickjs`, then `make all`
- after that, `make tests` should run
- running with the interpreter `qjs bin/qjs/svgop.js` works (see `make tests`)
- after compilation with `qjsc -o bin/qjs/svgop bin/qjs/svgop.js` and running `make tests`, I get a `ReferenceError: Date is not defined`:

```
# node: cat test/test.svg | node src/svgop-pkg.js
<svg xmlns="http://www.w3.org/2000/svg" width="595.281" height="841.891"><circle fill="none" stroke="#000" stroke-width="10" cx="297.64" cy="420.946" r="261.923"/><path d="M452.414 462.615c-21.37 86.155-108.537 138.675-194.692 117.306-86.156-21.37-138.675-108.537-117.306-194.692s108.537-138.675 194.691-117.306c57.82 14.342 102.965 59.486 117.307 117.306h-77.387c-21.37-44.444-74.723-63.149-119.167-41.779-44.444 21.369-63.149 74.722-41.78 119.166 21.37 44.443 74.722 63.149 119.167 41.779 18.264-8.781 32.997-23.516 41.779-41.779h77.388z"/></svg>

# macos < pkg: cat test/test.svg | bin/svgop-macos/svgop
<svg xmlns="http://www.w3.org/2000/svg" width="595.281" height="841.891"><circle fill="none" stroke="#000" stroke-width="10" cx="297.64" cy="420.946" r="261.923"/><path d="M452.414 462.615c-21.37 86.155-108.537 138.675-194.692 117.306-86.156-21.37-138.675-108.537-117.306-194.692s108.537-138.675 194.691-117.306c57.82 14.342 102.965 59.486 117.307 117.306h-77.387c-21.37-44.444-74.723-63.149-119.167-41.779-44.444 21.369-63.149 74.722-41.78 119.166 21.37 44.443 74.722 63.149 119.167 41.779 18.264-8.781 32.997-23.516 41.779-41.779h77.388z"/></svg>

# qjs < webpack: cat test/test.svg | qjs bin/qjs/svgop.js
<svg xmlns="http://www.w3.org/2000/svg" width="595.281" height="841.891"><circle fill="none" stroke="#000" stroke-width="10" cx="297.64" cy="420.946" r="261.923"/><path d="M452.414 462.615c-21.37 86.155-108.537 138.675-194.692 117.306-86.156-21.37-138.675-108.537-117.306-194.692s108.537-138.675 194.691-117.306c57.82 14.342 102.965 59.486 117.307 117.306h-77.387c-21.37-44.444-74.723-63.149-119.167-41.779-44.444 21.369-63.149 74.722-41.78 119.166 21.37 44.443 74.722 63.149 119.167 41.779 18.264-8.781 32.997-23.516 41.779-41.779h77.388z"/></svg>

# macos < nqjsc: cat test/test.svg | bin/qjs/svgop
ReferenceError: Date is not defined
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js:17)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at call (native)
    at r (bin/qjs/svgop.js)
    at <anonymous> (bin/qjs/svgop.js)
    at <eval> (bin/qjs/svgop.js:21)

make: *** [tests] Error 1
```

On the other hand, pdfjs stopped working for me, so it’s svgo only. I don’t really understand this code at all :) . 

## Rationale

SVG files, especially exported from various editors, usually contain a lot of redundant and useless information such as editor metadata, comments, hidden elements, default or non-optimal values and other stuff that can be safely removed or converted without affecting SVG rendering result.

## What is `svgop`?

While `svgo` requires a Nodejs environment to run, `svgop` is a standalone binary executable tool for **macOS** (64-bit) and **Windows** (x86 and x64). `svgop` accepts **SVG and PDF** in stdin and outputs an **optimized SVG** to stdout.

It uses the default `svgo` [config](https://github.com/twardoch/svgop/blob/master/src/svgop.js).

This repo contains a process to create `svgop` from `svgo` and `pdf.js` using the Nodejs [`pkg`](https://www.npmjs.com/package/pkg) compiler.

Note: To make `pkg` work, a customized version of [`config.js`](https://github.com/twardoch/svgop/blob/master/src/lib/svgo/config.js) will replace `svgo`’s own [`config.js`](https://github.com/svg/svgo/blob/master/lib/svgo/config.js). The customized version will need to be updated manually from time to time.

## Download

[**DOWNLOAD**](https://github.com/twardoch/svgop/releases/latest) the latest release for macOS (`svgop-macos.zip`), Windows 32-bit (`svgop-win32.zip`) or Windows 64-bit (`svgop-win64.zip`).

## Usage

- from `.pdf` to `.svg`

```bash
svgop < test.pdf > test.min.svg
```

- from `.svg` to `.svg`

```bash
svgop < test.svg > test.min.svg
```

- from `.svgz` to `.svg`:

```bash
gunzip -c test.svgz | svgop > test.min.svg
```

- from `.svg` to `.svgz`:

```bash
svgop < test.svg | gzip -cfq9 > test.min.svgz
```

## Building

Clone the repo on macOS, run `make`. The executables will be found in `./bin`.

## License and Copyright

Portions of this software are licensed under the terms of the Apache 2 license. Portions of this software are licensed under the terms of the MIT license. Please consult [LICENSE](https://github.com/twardoch/svgop/blob/master/LICENSE).

- `svgop`: Copyright © 2017 Adam Twardoch
- `svgo`: Copyright © 2012–2017 Kir Belevich and Contributors
- `pdf.js`: Copyright © 2012-2017 Mozilla Foundation and Contributors
