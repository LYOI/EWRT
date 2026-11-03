#!/bin/bash

set -ex
ROOT_PATH=${PWD}
BUILD_DIR=${ROOT_PATH}/openwrt
TARGET=${1}

if [ -z "$1" ]; then
	echo "Error: please specify TARGET"
	exit 1
fi

if [ ! "$(ls -A $BUILD_DIR)" ]; then
	python3 setup.py --setup || exit 1
    
else
	python3 setup.py --rebase
	echo "### OpenWrt repo already setup"
fi

cd ${BUILD_DIR}
./scripts/gen_config.py ${TARGET} || exit 1
cd -

echo "### Applying the feed patches ..."
python3 setup.py --feed-patches || exit 1

# host 工具里有并行不安全的成员（如 tools/quilt 的 po/quilt.pot 依赖竞态，
# 已由 patches-25.12/0214 修补）。这里再串行编一遍，作为对所有 host 工具的
# 通用兜底：它们数量少、体积小，串行只占几分钟，而真正耗时的内核和包仍全速。
echo "### Building host tools (serial) ..."
cd $BUILD_DIR
make -j1 tools/compile || exit 1

echo "### Building image ..."
make -j$(nproc) V=s
