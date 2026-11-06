# This is free software, licensed under the Apache License, Version 2.0 .

include $(TOPDIR)/rules.mk

# 上游是放在他们自己的 feeds/luci/applications/ 下编的，既没写 PKG_NAME /
# PKG_VERSION，include 也用的是 ../../luci.mk。放进本仓库的 feeds/extras 之后
# 这两个都要显式写清楚，否则 feeds 建索引时会直接报 "please fix ... Makefile"。
PKG_NAME:=luci-app-nfs
PKG_VERSION:=1.1
PKG_RELEASE:=1

LUCI_TITLE:=Network Shares - NFS kernel server
LUCI_DEPENDS:=+luci-base +nfs-kernel-server

PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=Gemini CLI

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
