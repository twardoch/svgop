# svgop 

`svgop` (**SVG O**ptimizer **P**ipeable) is a standalone binary executable version of the excellent [`svgo`](https://github.com/svg/svgo) Nodejs-based tool for optimizing SVG vector graphics files. 

## Rationale

SVG files, especially exported from various editors, usually contain a lot of redundant and useless information such as editor metadata, comments, hidden elements, default or non-optimal values and other stuff that can be safely removed or converted without affecting SVG rendering result.

This repo creates `svgop` from `svgo`. While `svgo` requires a Nodejs environment to run, `svgop` is a standalone binary executable tool for **macOS** (64-bit) and **Windows** (x86 and x64). `svgop` accepts SVG in stdin and outputs the optimized version to stdout. The binary executables of `svgop` are created using [`pkg`](https://www.npmjs.com/package/pkg). 

## Download

[**DOWNLOAD**](https://github.com/twardoch/svgop/releases/latest) the latest release for macOS or Windows

## Usage 

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

This software is released under the terms of the [MIT license](https://github.com/twardoch/svgop/blob/master/LICENSE).

`svgop`: Copyright © 2017 Adam Twardoch
`svgo`: Copyright © 2012–2016 Kir Belevich and Contributors
