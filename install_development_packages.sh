#!/bin/bash

set -e
set -x

cd development_packages
for DEVPKG in xylo
do
  cd "${DEVPKG}"
  npm install
  cd ..
done
