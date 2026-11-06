# 去掉第三方 feed 在 distfeeds.list 里生成的无效 apk 源
include $(TOPDIR)/rules.mk

PKG_NAME:=er2-apk-feed-cleanup
PKG_VERSION:=1
PKG_RELEASE:=1
PKG_MAINTAINER:=ER2 local
PKG_LICENSE:=GPL-2.0

include $(INCLUDE_DIR)/package.mk

define Package/er2-apk-feed-cleanup
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Remove bogus third-party apk feed URLs
  PKGARCH:=all
endef

define Package/er2-apk-feed-cleanup/description
  OpenWrt 构建时会把 feeds.conf 里所有 feed 名拼成 distfeeds.list 条目，
  第三方 feed（bandix/extras/lucky/openclash/viking 等）在官方站并不存在，
  每次 apk update 都会 wget error 8。此包在首启用 sed 删掉这些行。
endef

define Build/Compile
	true
endef

define Package/er2-apk-feed-cleanup/install
	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(INSTALL_BIN) ./files/etc/uci-defaults/99-clean-apk-feeds $(1)/etc/uci-defaults/
endef

$(eval $(call BuildPackage,er2-apk-feed-cleanup))
