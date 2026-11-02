#!/usr/bin/env bash
rm -rf _site
jekyll liveserve --config _config.yml,_config.dev.yml --incremental