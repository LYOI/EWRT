# EWRT — 京东云 ER2（IPQ5332）OpenWrt 固件

只服务一个目标：京东云太乙 Plus ER2。以
[Telecominfraproject/wlan-ap](https://github.com/Telecominfraproject/wlan-ap)（TIP OpenWiFi AP NOS，
BSD-3-Clause）为上游主线，ER2 板级支持起步于
[zt406600/wlan-ap](https://github.com/zt406600/wlan-ap) 的 `er2` 分支——上游本身没有 ER2 目标。

```
SoC     Qualcomm IPQ5332（4×A53 + NSS/PPE 加速）
网口    eth0 = SFP 光口（dp1）   eth1 = 2.5G 电口（dp2）
无线    无（本板不启用 WiFi）
管理    192.168.1.1（SSH / LuCI，用户 root）
存储    eMMC 64G：rootfs 2G + swap 1G + storage 54G
```

## 这版有什么

- **SFP 光口自动识别**：2.5G 猫棒与 10G 模块插入后自动起链，实测 `eth0 speed 2500`；
  掉链有 pulse 恢复流程，全程有 `adpt_hppe_sfp_*` 日志可查
- **持久 overlay**：rootfs_data 在 p22 尾部，f2fs，1.9G，重启不丢；偏移按 squashfs
  实际大小 + 64MiB 保留区自动计算，刷不超 64MB 增量的新镜像不会覆盖它
- **应用齐全（编进 squashfs，不需要后装）**：adguardhome、qbittorrent（含 qt6、
  rblibtorrent）、lucky、openclash、partexp、samba4、gecoosac、wolultra，
  外加 6 个从 vikinify 提取的小应用（automount / cpufreq / shellsync /
  autoreboot / mini-diskmanager / router-tool）
- **镜像约 100MB**，uboot 网页上传直刷即可

## 构建

```bash
git clone https://github.com/LYOI/EWRT.git && cd EWRT
./build.sh                 # 自动拉 OpenWrt 树、打补丁、生成 .config、编译
```

产物在 `openwrt/bin/targets/ipq53xx/generic/`：

- `*squashfs-factory.bin` —— uboot 网页刷写用（含内核）
- `*squashfs-sysupgrade.bin` —— 只换 rootfs，**不含内核**

> 注意：内核改动的验证必须走 factory.bin。sysupgrade 只写 p22 rootfs，
> HLOS 分区里的内核不会更新。

## 刷机

```bash
# 1. 断电，按住 reset 上电，进 uboot web 恢复模式
# 2. 浏览器打开 http://192.168.1.1/ ，确认在 uboot（能看到 env 页面）
# 3. 上传 factory.bin → 自动写入 → 自动重启
```

串口：`console=ttyMSM0,115200n8`，115200 8N1，GND + 板 TX → 适配器 RX。

## 已知限制

- **NVMe 不识别**。M.2 槽插盘后 `qcom-pcie 18000000.pcie: Phy link never came up`，
  LTSSM 停在 `0x3 POLLING_COMPLIANCE`（发送侧已起，收不到对端训练序列）。
  已排除：硬件与盘（开荒固件能把 UMIS 128G 枚举在 `0001:01:00.0`，协商 Gen3 x2）、
  PERST、四路时钟、PHY 初始化寄存器、lane 数与速率、pcie0 走线。
  剩余差异在 5.4 厂商驱动写而 6.6 未写的寄存器层，详见提交 `04159dff`
- **光口↔电口数据面未打通**：link 层双速率可用，但上游 `qcom_ppe` 对
  「PPE 直连口 host-bound RX」有未完成的 gap，跨口转发仍需软件路径
- `pcie0`（1 lane，GPIO38）未接设备，打开会让 probe 报 `Failed to find NVMEM device`

## 目录

| 路径 | 内容 |
|---|---|
| `feeds/qca-wifi-7/` | QCA NSS / PPE / ECM / SSDK、ipq53xx target、ER2 设备树 |
| `defconfig/jdc-er2.config` | 完整包集（约 430 包） |
| `profiles/jdcloud_er2.yml` | 最小包集 + 第三方 feed 声明 |
| `patches-25.12/` | 对 OpenWrt 树的补丁（含 fstools rootfs_data 相关） |
| `feeds/extras/` | 本地 feed（主题、adguardhome、er2-vk-apps 等） |
| `docs/` | 排查记录与方法论文档 |
| `kernel-debug/` | 带诊断打印的内核文件（排查 NVMe 用，非默认编译路径） |

## 致谢与许可

- 上游主线：[Telecominfraproject/wlan-ap](https://github.com/Telecominfraproject/wlan-ap)
- ER2 板级与 QSDK 组件整理：[zt406600/wlan-ap](https://github.com/zt406600/wlan-ap) `er2` 分支
- 许可证：BSD-3-Clause，Copyright (c) 2024 Telecom Infra Project（见 `LICENSE`）
- 上游通用文档（其他目标 profile、uCentral、Docker 构建）见 `OPENWIFI_README.md`
