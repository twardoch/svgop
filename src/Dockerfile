## Start from the official Debian image
# FROM debian:bullseye
## Start from the minimal Debian image
# FROM bitnami/minideb:bullseye
## Start from node specific image - compatibility with old version
# FROM node:bullseye
# FROM node:buster
# FROM node:stretch
FROM node:jessie

LABEL maintainer="MDW <MDW@private.fr>"

## Set environment variables
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8

#    && npm install -g webpack-cli \


# Not ok on Jessie:
#    && apt clean && apt autoremove -y \
# --force-yes is needed for jessie

RUN export DEBIAN_FRONTEND="noninteractive" \
    && apt-get update --fix-missing \
    && apt-get install -y --force-yes \
        build-essential \
        wget \
        unzip \
        upx \
        zip \
    && rm -rf /var/lib/apt/lists/*

RUN cd /tmp \
    && wget https://github.com/bellard/quickjs/archive/refs/heads/master.zip \
    && unzip master.zip \
    && rm master.zip \
    && cd quickjs-master \
    && /bin/bash -c 'make -j "$(nproc)" install' \
    && cd .. && rm -rf quickjs-master

RUN export DEBIAN_FRONTEND="noninteractive" \
    && npm install -g pkg \
    && npm install -g webpack@4 webpack-cli@4

#    && npm install -g webpack webpack-cli

ENTRYPOINT ["/bin/bash"]
