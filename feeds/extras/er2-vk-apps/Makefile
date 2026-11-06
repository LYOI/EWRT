#
# 从 vikinify 固件 rootfs 提取的六个应用，原地打包进 EWRT。
#
# 为什么是 vendored 而不是 feed：
#   这六个包在 main 上能拿到的 feed 里都没有源码（VIKINGYFY/packages 只有
#   gecoosac / wolultra / axonhub / homeproxy 等；sirpdboy 下同名仓库也不存在）。
#   它们在设备上是以 "vikinify-extracted" 这个临时 apk 源装进去的，源没有签名，
#   所以运行时 apk verify 一定失败（这就是"手动验证不过"的来源）。
#   把文件直接编进 squashfs 就没有验证这一步了。
#
# 文件清单来自被提取 rootfs 的 /lib/apk/packages/<pkg>.list，逐条拷出，
# 没有手工增删；以后若找到上游源码仓库，删掉这里换 feed 即可。
#
include $(TOPDIR)/rules.mk

PKG_NAME:=er2-vk-apps
PKG_VERSION:=20261106
PKG_RELEASE:=1
PKG_LICENSE:=GPL-2.0

include $(INCLUDE_DIR)/package.mk

# 纯文件安装包，没有编译步骤；缺这一段 make 会去找 .built 而失败。
define Build/Compile
	true
endef

define Package/er2-vk-apps/Default
  SECTION:=utils
  CATEGORY:=Utilities
  URL:=https://github.com/LYOI/EWRT
  PKGARCH:=all
endef

define Package/automount
$(call Package/er2-vk-apps/Default)
  TITLE:=Hotplug automount hook for removable block devices
  DEPENDS:=+block-mount
endef

define Package/automount/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/automount/* $(1)/
endef

define Package/cpufreq
$(call Package/er2-vk-apps/Default)
  TITLE:=CPU frequency / governor service
  DEPENDS:=+jshn +jsonfilter
endef

define Package/cpufreq/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/cpufreq/* $(1)/
endef

define Package/luci-app-autoreboot
$(call Package/er2-vk-apps/Default)
  TITLE:=LuCI scheduled reboot
  DEPENDS:=+luci-base
endef

define Package/luci-app-autoreboot/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/luci-app-autoreboot/* $(1)/
endef

define Package/luci-app-mini-diskmanager
$(call Package/er2-vk-apps/Default)
  TITLE:=LuCI mini disk manager
  DEPENDS:=+luci-base +rpcd +ucode +ucode-mod-fs +ucode-mod-uci
endef

define Package/luci-app-mini-diskmanager/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/luci-app-mini-diskmanager/* $(1)/
endef

define Package/luci-app-router-tool
$(call Package/er2-vk-apps/Default)
  TITLE:=LuCI router toolbox (snapshot / transaction / diagnostics)
  DEPENDS:=+luci-base +rpcd +ucode +ucode-mod-fs +ucode-mod-uci +ucode-mod-uloop
endef

define Package/luci-app-router-tool/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/luci-app-router-tool/* $(1)/
endef

define Package/shellsync
$(call Package/er2-vk-apps/Default)
  TITLE:=shellsync helper binary
  DEPENDS:=+bash
endef

define Package/shellsync/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/shellsync/* $(1)/
endef


define Package/luci-i18n-autoreboot-zh-cn
$(call Package/er2-vk-apps/Default)
  TITLE:=LuCI Chinese translation for autoreboot
  DEPENDS:=+luci-app-autoreboot
endef

define Package/luci-i18n-autoreboot-zh-cn/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/luci-i18n-autoreboot-zh-cn/* $(1)/
endef

define Package/luci-i18n-mini-diskmanager-zh-cn
$(call Package/er2-vk-apps/Default)
  TITLE:=LuCI Chinese translation for mini disk manager
  DEPENDS:=+luci-app-mini-diskmanager
endef

define Package/luci-i18n-mini-diskmanager-zh-cn/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/luci-i18n-mini-diskmanager-zh-cn/* $(1)/
endef

define Package/luci-i18n-router-tool-zh-cn
$(call Package/er2-vk-apps/Default)
  TITLE:=LuCI Chinese translation for router toolbox
  DEPENDS:=+luci-app-router-tool
endef

define Package/luci-i18n-router-tool-zh-cn/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/luci-i18n-router-tool-zh-cn/* $(1)/
endef

$(eval $(call BuildPackage,automount))
$(eval $(call BuildPackage,cpufreq))
$(eval $(call BuildPackage,luci-app-autoreboot))
$(eval $(call BuildPackage,luci-app-mini-diskmanager))
$(eval $(call BuildPackage,luci-app-router-tool))
$(eval $(call BuildPackage,shellsync))
$(eval $(call BuildPackage,luci-i18n-autoreboot-zh-cn))
$(eval $(call BuildPackage,luci-i18n-mini-diskmanager-zh-cn))
$(eval $(call BuildPackage,luci-i18n-router-tool-zh-cn))
