# svgop

`svgop` (**SVG O**ptimizer **P**ipeable) is a standalone binary executable that combines the excellent [`svgo`](https://github.com/svg/svgo) Nodejs-based tool for optimizing SVG vector graphics files.

## Changelog

#### 2020-04-13: Version 0.8.0

QuickJS works! The macOS binary is now **97% smaller**! (`svgop-qjs-macos` has **2 MB**, `svgop-pkg-macos` has 83 MB).

It’s also possible to compile for Windows and Linux, should be equally small, but I don’t offer precompiled versions for these platforms yet.

Older versions also bundled [`pdf.js`](https://mozilla.github.io/pdf.js/) but this was not working well.

## Rationale

SVG files, especially exported from various editors, usually contain a lot of redundant and useless information such as editor metadata, comments, hidden elements, default or non-optimal values and other stuff that can be safely removed or converted without affecting SVG rendering result.

## What is `svgop`?

While `svgo` requires a Nodejs environment to run, `svgop` is a standalone binary executable tool for **macOS** (64-bit) and **Windows** (x64, potentially also x86). `svgop` accepts **SVG** in stdin and outputs an **optimized SVG** to stdout.

It uses the default `svgo` [config](https://github.com/twardoch/svgop/blob/master/src/svgop.js).

This repo contains a process to create `svgop` from `svgo` in two ways:

-   (new) using the [QuickJS](https://bellard.org/quickjs/) compiler by Fabrice Bellard and Charlie Gordon; I can build for macOS only, the executable is 2 MB. QuickJS is a JS interpreter and compiler optimized for size.
-   (old) using the [`pkg`](https://www.npmjs.com/package/pkg) compiler; prebuilt binaries are provided for macOS, Windows x64 and Linux, but they’re large (the macOS one is 83 MB). pkg includes the entire Node.js runtime in the executable.

## Download

[**DOWNLOAD**](https://github.com/twardoch/svgop/releases/latest) the latest release

-   for macOS (`svgop-qjs-macos.zip`), made with `qjsc`, small
-   for Windows 64-bit (`svgop-win64.zip`), made with `pkg`, large

## Usage

-   from `.svg` to `.svg`

```bash
svgop < test.svg > test.min.svg
```

-   from `.svgz` to `.svg`:

```bash
gunzip -c test.svgz | svgop > test.min.svg
```

-   from `.svg` to `.svgz`:

```bash
svgop < test.svg | gzip -cfq9 > test.min.svgz
```

## Building

### Requirements

-   [`QuickJS`](https://bellard.org/quickjs/) ([mirror](https://github.com/horhof/quickjs))
-   [`node`](https://nodejs.org/)
-   [`pkg`](https://www.npmjs.com/package/pkg)
-   [`webpack`](https://www.npmjs.com/package/webpack)
-   gcc, make etc.

### macOS

1. Clone the repo on macOS.
2. Double-click or run `install-mac.command` to install the necessary dev tools.
3. Run `cd src && make all`
4. The executables will be found in `./bin`

### Windows and other systems

I’m not building on Windows or Linux. You can build, but you’ll need to adapt my Makefile, which is macOS-centric.

### Note

To make `pkg` work, a customized version of [`config.js`](https://github.com/twardoch/svgop/blob/master/src/lib/svgo/config.js) will replace `svgo`’s own [`config.js`](https://github.com/svg/svgo/blob/master/lib/svgo/config.js). The customized version will need to be updated manually from time to time.

## License and Copyright

Portions of this software are licensed under the terms of the Apache 2 license. Portions of this software are licensed under the terms of the MIT license. Please consult [LICENSE](https://github.com/twardoch/svgop/blob/master/LICENSE).

-   `svgop`: Copyright © 2017 Adam Twardoch
-   `svgo`: Copyright © 2012–2017 Kir Belevich and Contributors
