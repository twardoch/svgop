#!/usr/bin/env bash
dir=${0%/*}; if [ "$dir" = "$0" ]; then dir="."; fi; cd "$dir";

# Library functions

function uncomment {
    [ -z "$1" ] && return || local m="$1";
    [[ $m =~ ^(.*)(#.*) ]]; # Remove comment string
    [ ! -z "${BASH_REMATCH[2]}" ] && local m="${BASH_REMATCH[1]}";
    echo "$m";
}


function pp {
    echo;
    echo -e "\e[96m[svgop] $1";
    echo;
}

function pins {
    pp "Installing $1...";
}

function pup {
    info "Updating $1...";
}

function pok {
    echo;
    echo -e "\e[92m[madcow] $1";
    echo;
}

function perr {
    echo;
    echo -e "\e[91m[madcow][ERROR] $1";
    echo;
    exit;
}

function pwarn {
    echo;
    echo -e "\e[91m[madcow][ATTENTION] $1";
    echo;
}

function insbrew {
    if [ ! -x "$(which brew)" ]; then
        pins "brew";
        /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)";
    fi;
}

function pkgbrew {
    # Install package if not installed
    # $ pkgbrew go
    [ -z "$1" ] && return || local pkg="$1";
    insbrew;
    if [ -x "$(touch $(brew --prefix)/var/testX6mg87lk)" ]; then
        pwarn "`brew` needs to fix permissions, enter your administrator password:"
        sudo chown -R $(whoami) $(brew --prefix)/*;
        sudo chown $(whoami) $(brew --prefix)/*;
        brew list -1 | while read pkg; do brew unlink "$pkg"; brew link "$pkg"; done
    else
        rm "$(brew --prefix)/var/testX6mg87lk";
    fi;
    if brew ls --versions "$pkg" >/dev/null; then
        pup "brew:$pkg"; HOMEBREW_NO_AUTO_UPDATE=1 brew upgrade "$pkg";
    else
        pins "brew:$pkg"; HOMEBREW_NO_AUTO_UPDATE=1 brew install "$pkg"
    fi
}

function needbrew {
    # $ needbrew package # if command=package
    # $ needbrew command package # if command!=package
    [ -z "$1" ] && return || local cmd="$1";
    [ -z "$2" ] && local pkg="$cmd" || local pkg="$2";
    if [ ! -x "$(which $cmd)" ]; then
        pkgbrew "$pkg";
    fi;
}

function needbrewpy2 {
    if [ ! -x "$(which python2)" ]; then
        needbrew python2 python@2;
        brew link --overwrite python@2;
    fi;
}

function needbrewpy3 {
    if [ ! -x "$(which python3)" ]; then
        needbrew python3 python;
        brew link --overwrite python;
    fi;
}

function needgo {
    # $ needgo command github.com/author/repo [args...]
    [ -z "$1" ] && return || local cmd="$1";
    [ -z "$2" ] && return || local pkg="$2";
    needbrew go;
    if [ ! -x "$(which $cmd)" ]; then
        pins "go:$pkg"; go get -u "$pkg" "${@:3}";
    fi;
}

function needrust {
    # $ needrust command --git https://github.com/author/repo [args...]
    [ -z "$1" ] && return || local cmd="$1";
    [ -z "$2" ] && return || local pkg="$2";
    needbrew cargo rust;
    if [ ! -x "$(which $cmd)" ]; then
        pins "rust:$pkg"; cargo install "$pkg" "${@:3}";
    fi;
}

function needpy2 {
    # $ needpy2 command package [package...]
    [ -z "$1" ] && return || local cmd="$1";
    [ -z "$2" ] && return || local pkg="$2";
    needbrewpy2;
    if [ ! -x "$(which $cmd)" ]; then
        pins "py2:$pkg"; python2 -m pip install --user --upgrade "$pkg" "${@:3}";
    fi;
}

function needpy3 {
    # $ needpy3 command package [package...]
    [ -z "$1" ] && return || local cmd="$1";
    [ -z "$2" ] && return || local pkg="$2";
    needbrewpy3;
    if [ ! -x "$(which $cmd)" ]; then
        pins "py3:$pkg"; python3 -m pip install --user --upgrade "$pkg" "${@:3}";
    fi;
}

function neednode {
    # $ neednode package # if command=package
    # $ neednode command package [package...] # if command!=package
    [ -z "$1" ] && return || local cmd="$1";
    [ -z "$2" ] && local pkg="$cmd" || local pkg="$2";
    needbrew npm node;
    if [ ! -x "$(which $cmd)" ]; then
        pins "node:$pkg";npm i -g npm "$pkg" "${@:3}";
    fi;
}

function install {
    needbrew node;
    needbrew qjs quickjs;
    neednode pkg;
    neednode webpack;
}

install;
cd src;
npm i;
make all;
