#!/bin/sh
set -e

node docker-seed-if-empty.js

exec node src/server.js
