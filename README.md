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

串口调试：`console=ttyMSM0,115200n8`，115200 8N1。

板上调试头是 **G / R / T 三针，1.8V 电平，没有 1.8V 供电针**，而常见的
CH340 适配器是 3.3V，接线要小心：

- **只抓日志**：接 GND + 板 T → 适配器 RX 两针即可，R 针空着
- **R 针不要常接**：适配器 TX 常接到板子 R 会一直拉低，板子上电都不亮
- **需要发命令打断 autoboot** 时，在上电瞬间把适配器 TX 搭到 R 针（或用镊子
  在倒计时窗口内点一下），命令发完立刻断开

## 已知限制

- **NVMe 不识别**。M.2 槽插盘后 `qcom-pcie 18000000.pcie: Phy link never came up`，
  LTSSM 停在 `0x3 POLLING_COMPLIANCE`（发送侧已起，收不到对端训练序列）。
  已排除：硬件与盘（开荒固件能把 UMIS 128G 枚举在 `0001:01:00.0`，协商 Gen3 x2）、
  PERST、四路时钟、PHY 初始化寄存器、lane 数与速率、pcie0 走线。
  剩余差异在 5.4 厂商驱动写而 6.6 未写的寄存器层，详见提交 `04159dff`
- **光口↔电口跨口转发：未复测（结论不属于本固件）**。
  常被引用的那个现象——「广播/ARP/DHCP 能过、ping 通但 TCP/SSH 全断」——是在
  第三方 ImmortalWrt 固件（VIKINGYFY 那版）上测出来的，不是本仓库这版。
  对应的代码层证据也只是上游邮件列表的讨论（PPE 直连口的 host-bound RX
  交付未实现），属于「有理由怀疑」，不是「本固件实测不通」。
  本版现状：SFP 口 up 2500，`eth0` 收/发 710/784 包、零错误，帧层面通畅。
  要下结论，得光口对端接一台真实设备做 ping / iperf 对比
- `pcie0`（1 lane，GPIO38）未接设备。实测打开后 probe 起不来：dmesg 反复刷
  `Early Cal not supported`，始终没有打出 `PCI host bridge to bus 0000:00`。
  M.2 槽在 pcie1 上（开荒固件枚举到 `0001:01:00.0`），此条保持 disabled
  > 顺带更正：串口里那条 `Failed to find NVMEM device` 不是 PCIe 的报错，
  > 是 `fw_printenv` 找不到 u-boot env 设备时打的，与本节无关

## 目录

| 路径 | 内容 |
|---|---|
| `feeds/qca-wifi-7/` | QCA NSS / PPE / ECM / SSDK、ipq53xx target、ER2 设备树 |
| `defconfig/jdc-er2.config` | 完整包集（约 430 包） |
| `profiles/jdcloud_er2.yml` | 最小包集 + 第三方 feed 声明 |
| `patches-25.12/` | 对 OpenWrt 树的补丁（含 fstools rootfs_data 相关） |
| `feeds/extras/` | 本地 feed（主题、adguardhome、er2-vk-apps 等） |
| `docs/` | 排查记录与方法论文档；`WRITING-RULES.md` 是结论/文档的写法规范 |
| `kernel-debug/` | 带诊断打印的内核文件（排查 NVMe 用，非默认编译路径） |

## 致谢与许可

- 上游主线：[Telecominfraproject/wlan-ap](https://github.com/Telecominfraproject/wlan-ap)
- ER2 板级与 QSDK 组件整理：[zt406600/wlan-ap](https://github.com/zt406600/wlan-ap) `er2` 分支
- 许可证：BSD-3-Clause，Copyright (c) 2024 Telecom Infra Project（见 `LICENSE`）
- 上游通用文档（其他目标 profile、uCentral、Docker 构建）见 `OPENWIFI_README.md`
