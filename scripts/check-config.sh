#!/bin/bash
# 构建前置检查：profiles/*.yml 声明的板级包必须全部出现在 defconfig/*.config 里。
#
# 为什么要这个检查：
#   defconfig 是按 B 方式裁剪出来的。裁剪时漏掉一个板级包，make defconfig 不会报错，
#   只会把那一行悄悄删掉，产物能刷机、能上网，只是某个功能没了。
#   2026-11-05 就漏过 luci-app-aurora-config：aurora 主题在、设置页没有。
#
# 用法:
#   ./scripts/check-config.sh                     # 默认 jdcloud_er2
#   ./scripts/check-config.sh profiles/x.yml defconfig/y.config
#
# 退出码: 0 一致 / 1 有缺失 / 2 参数或文件问题

set -u
cd "$(dirname "$0")/.." || exit 2

PROFILE=${1:-profiles/jdcloud_er2.yml}
DEFCONFIG=${2:-defconfig/jdc-er2.config}

for f in "$PROFILE" "$DEFCONFIG"; do
	[ -f "$f" ] || { echo "ERROR 找不到 $f"; exit 2; }
done

# profile 的 target/subtarget 是 OpenWrt 的 TARGET 符号，不是包，要排除
TARGET_NAME=$(awk '/^target:/{print $2; exit}' "$PROFILE")
SUBTARGET_NAME=$(awk '/^subtarget:/{print $2; exit}' "$PROFILE")

PROFILE_PKGS=$(awk '
	/^packages:/ { in_pkg = 1; next }
	/^[a-z_]+:/  { in_pkg = 0 }
	in_pkg && /^[[:space:]]*-[[:space:]]/ { sub(/^[[:space:]]*-[[:space:]]*/, ""); print }
' "$PROFILE" | sed 's/[[:space:]]*$//' | sort -u)

DEFCONFIG_PKGS=$(grep -oE '^CONFIG_PACKAGE_[A-Za-z0-9_.+-]+=y' "$DEFCONFIG" |
	sed 's/^CONFIG_PACKAGE_//; s/=y$//' | sort -u)

TOTAL=$(echo "$PROFILE_PKGS" | grep -c . || true)
MISSING=$(echo "$PROFILE_PKGS" | grep . | grep -vxF -e "$TARGET_NAME" -e "$SUBTARGET_NAME" |
	comm -23 - <(echo "$DEFCONFIG_PKGS") )

MISS_COUNT=$(echo "$MISSING" | grep -c . || true)

echo "profile   : $PROFILE  ($TOTAL 条)"
echo "defconfig : $DEFCONFIG  ($(echo "$DEFCONFIG_PKGS" | grep -c .) 个 =y 包)"

if [ "$MISS_COUNT" -eq 0 ]; then
	echo "RESULT OK profile 声明的包全部在 defconfig 里"
	exit 0
fi

echo "RESULT FAIL 有 $MISS_COUNT 个包只在 profile 里，defconfig 没配："
echo "$MISSING" | sed 's/^/  - /'
echo
echo "处理方式："
echo "  1. 确认该包在 defconfig 里是需要的 -> 加上 CONFIG_PACKAGE_<name>=y"
echo "  2. 确认是有意精简掉的            -> 从 profile 里删掉，别让两处说法不一致"
exit 1
