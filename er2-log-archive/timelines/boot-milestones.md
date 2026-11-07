# 各启动段关键里程碑

只抽取启动、光口初始化、链路变化；完整内容见 by-firmware/ 下各段文件。


## v2a-stock-16M / 01_1155_boot1.txt（11:55:27，292 行，0.0→104.2s）
[  0.000000] Booting Linux on physical CPU 0x0000000000 [0x51af8014]
[  0.000000] Linux version 6.6.88 (ubuntu@b497ca3b43b6) (aarch64-openwrt-linux-musl-gcc (OpenWrt GCC 14.3.0 r33051-f5dae5ece4) 14.3.0, GNU ld (GNU Binutils) 2.44) #0 SMP PREEMPT Tue Nov  3 01:33:04 2026
[  0.000000] Machine model: JDCloud ER2 (RE-CS-08)
[  9.573525] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 15.742222] br-lan: port 2(eth1.2) entered forwarding state
[ 27.192599] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
[ 27.192675] br-lan: port 1(eth0) entered forwarding state
[104.150413] nss-dp 3a504000.dp1 eth0: PHY Link is down

## v2a-stock-16M / 02_1225_boot1.txt（12:25:00，291 行，0.0→58.5s）
[  0.000000] Booting Linux on physical CPU 0x0000000000 [0x51af8014]
[  0.000000] Linux version 6.6.88 (ubuntu@b497ca3b43b6) (aarch64-openwrt-linux-musl-gcc (OpenWrt GCC 14.3.0 r33051-f5dae5ece4) 14.3.0, GNU ld (GNU Binutils) 2.44) #0 SMP PREEMPT Tue Nov  3 01:33:04 2026
[  0.000000] Machine model: JDCloud ER2 (RE-CS-08)
[  9.547817] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 15.841882] br-lan: port 2(eth1.2) entered forwarding state
[ 58.472540] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
[ 58.472619] br-lan: port 1(eth0) entered forwarding state

## v2a-stock-16M / 03_1229_watch-1229.txt（12:29:56，602 行，0.0→801.0s）
[  0.000000] [12:29:56] Booting Linux on physical CPU 0x0000000000 [0x51af8014]
[  0.000000] [12:29:56] Linux version 6.6.88 (ubuntu@b497ca3b43b6) (aarch64-openwrt-linux-musl-gcc (OpenWrt GCC 14.3.0 r33051-f5dae5ece4) 14.3.0, GNU ld (GNU Binutils) 2.44) #0 SMP PREEMPT Tue Nov  3 01:33:04 2026
[  0.000000] [12:29:56] Machine model: JDCloud ER2 (RE-CS-08)
[  9.547817] [12:29:56] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 15.841882] [12:29:56] br-lan: port 2(eth1.2) entered forwarding state
[ 58.472540] [12:29:56] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
[ 58.472619] [12:29:56] br-lan: port 1(eth0) entered forwarding state
[640.870377] [12:30:25] nss-dp 3a504000.dp1 eth0: PHY Link is down
[648.152519] [12:30:32] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 10000
[648.152597] [12:30:32] br-lan: port 1(eth0) entered forwarding state
[686.630376] [12:31:10] nss-dp 3a504000.dp1 eth0: PHY Link is down
[764.632887] [12:32:29] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
[764.632964] [12:32:29] br-lan: port 1(eth0) entered forwarding state
[796.870343] [12:33:01] nss-dp 3a504000.dp1 eth0: PHY Link is down
[801.033046] [12:33:08] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 10000
[801.033137] [12:33:08] br-lan: port 1(eth0) entered forwarding state
[  0.000000] [12:33:58] Booting Linux on physical CPU 0x0000000000 [0x51af8014]
[  0.000000] [12:33:58] Linux version 6.6.88 (ubuntu@b497ca3b43b6) (aarch64-openwrt-linux-musl-gcc (OpenWrt GCC 14.3.0 r33051-f5dae5ece4) 14.3.0, GNU ld (GNU Binutils) 2.44) #0 SMP PREEMPT Tue Nov  3 01:33:04 2026
[  0.000000] [12:33:58] Machine model: JDCloud ER2 (RE-CS-08)
[  9.456631] [12:33:58] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 15.839605] [12:33:58] br-lan: port 2(eth1.2) entered forwarding state
[ 17.912685] [12:34:02] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 10000
[ 17.912775] [12:34:02] br-lan: port 1(eth0) entered forwarding state
[ 47.030480] [12:34:28] nss-dp 3a504000.dp1 eth0: PHY Link is down
[127.112635] [12:35:50] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
[127.112716] [12:35:50] br-lan: port 1(eth0) entered forwarding state

## v3b-debug / 01_0852_boot1.txt（08:52:37，1880 行，180.2→363.5s）

## v3b-debug / 02_0903_boot1.txt（09:03:07，1488 行，811.2→959.5s）

## v3b-debug / 03_0903_boot2.txt（09:03:07，2417 行，14.5→124.8s）
[ 31.502763] br-lan: port 2(eth1.2) entered forwarding state

## v3b-debug / 04_0903_boot3.txt（09:03:07，2354 行，14.6→117.9s）
[ 31.585026] br-lan: port 2(eth1.2) entered forwarding state

## v3b-debug / 05_0921_boot1.txt（09:21:27，2304 行，784.2→1010.9s）

## v3b-debug / 06_0921_boot2.txt（09:21:27，7423 行，0.0→527.3s）
[  0.000000] Booting Linux on physical CPU 0x0000000000 [0x51af8014]
[  0.000000] Linux version 6.6.88 (ubuntu@b497ca3b43b6) (aarch64-openwrt-linux-musl-gcc (OpenWrt GCC 14.3.0 r33051-f5dae5ece4) 14.3.0, GNU ld (GNU Binutils) 2.44) #0 SMP PREEMPT Tue Nov  3 01:33:04 2026
[  0.000000] Machine model: JDCloud ER2 (RE-CS-08)
[ 10.695698] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 31.888069] br-lan: port 2(eth1.2) entered forwarding state

## v2a-debug / 02_1308_boot1.txt（13:08:08，4605 行，0.0→282.1s）
[  0.000000] Booting Linux on physical CPU 0x0000000000 [0x51af8014]
[  0.000000] Linux version 6.6.88 (ubuntu@b497ca3b43b6) (aarch64-openwrt-linux-musl-gcc (OpenWrt GCC 14.3.0 r33051-f5dae5ece4) 14.3.0, GNU ld (GNU Binutils) 2.44) #0 SMP PREEMPT Tue Nov  3 01:33:04 2026
[  0.000000] Machine model: JDCloud ER2 (RE-CS-08)
[  9.413316] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 15.750181] br-lan: port 2(eth1.2) entered forwarding state

## 抓日志规范（长期，2026-11-05 定）
- 设备无持久日志：SSDK=printk→dmesg(RAM)，logd -S 128→/var/log(tmpfs)，128MB 的 /dev/mmcblk0p25 未挂载。
- 因此**每次测试必须全量抓取**：`dmesg`（全文，不 grep 过滤）+ `logread`（全文）+ `/proc/cmdline` + 接口状态 + `ssdk_sh sfp RateEncode get 2`。
- 落盘位置：PC `D:/Work/Claw/*.log`（时间线）与 `er2-log-archive/by-firmware/<标签>-<时间戳>/01_dmesg_full.txt`、`03_logread_full.txt`。
- 不再依赖设备本地留存，也不为了留日志去挂 eMMC。

## 内核压缩算法改动位置（gzip→lzma，2026-11-05）
- **不是补丁文件**，是直接改 feed 源码，git 里是未提交的工作区改动：
  - 真实路径 `/vol1/1000/Work/wlan-ap-a/feeds/qca-wifi-7/ipq53xx/image/Makefile` 第 19-20 行
  - 从 openwrt 里看到的是软链 `openwrt/target/linux/feeds/ipq53xx/image/Makefile`（readlink -f 才落到上面那个）
  - 仓库根 `/vol1/1000/Work/wlan-ap-a`，`git status` 显示 ` M feeds/qca-wifi-7/ipq53xx/image/Makefile`
- 改动：`kernel-bin | gzip | fit gzip` → `kernel-bin | lzma | fit lzma`（第 20 行是注释掉的 initramfs 同款，一并改了；第 21 行 `fit none` 未动，initramfs 仍不压缩）
- 原始写法仍在 `wlan-ap-b` / `wlan-ap-er2` 两棵树的同名文件里，可做对照
- `KERNEL_SIZE := 8192k` 与 `pad-to` 在同目录 `ipq53xx.mk` 第 267/273 行，属打包填充，与压缩无关
- 存证：`/vol1/1000/Work/configs/change.lzma-kernel-compression-20261105.diff` 与本地 `configs/` 同名
- 风险：`patches-25.12/` 里没有它，feeds 被重置/重同步就会静默丢改动，且编出来的包会回到 gzip

## 8MB 内核区与压缩算法（已实测验证，2026-11-05 定档）
- `KERNEL_SIZE := 8192k`（= 8,388,608B）在 `feeds/qca-wifi-7/ipq53xx/image/ipq53xx.mk` 第 267 行；
  第 273 行 `IMAGE/factory.bin := append-kernel | pad-to $$(KERNEL_SIZE) | append-rootfs | pad-rootfs | check-size`。
  结论：**8MB 是 factory 里的固定补零填充，不是内核真实体积**；rootfs 从 8MB 偏移起接。
- 压缩前后实测（同一套 Makefile，只改 `KERNEL` 那行的算法）：
  | 项目 | gzip | lzma |
  |---|---|---|
  | FIT totalsize | 6,529,652 (6.23MB) | 4,853,712 (4.63MB) |
  | 8MB 区余量 | 1,858,956 (1.77MB) | 3,534,896 (3.37MB) |
  | sysupgrade.bin | 18,227,495 | 16,548,135 |
  | factory.bin | 20,185,092 | 20,185,092（不变，尾部补零是常数） |
- 验证证据：mkimage -l 读出 `Compression: lzma compressed`；刷机后正常解压启动，
  归档 `er2-log-archive/by-firmware/v2a-lzma-B0-firstboot-20261105-040206`（刷后 7s SSH 通，uptime 20s，
  `Memory: 2031696K/2097152K available`，cmdline 已无 `log_buf_len=16M`）。
- `IMAGE_SIZE := 262144k` 是整体 256MB 上限，与内核区无关。
- **决定：KERNEL_SIZE 保持 8192k 不动**。lzma 的价值只是把余量从 1.7MB 抬到 3.4MB，
  防后续内核/补丁增长撞上限；不改填充值，rootfs 偏移与刷机流程全不变，无砖化风险。

## 编译环境迁移到本机 WSL（2026-11-05 定）
- 本机：Ryzen 5 5600X / 32G RAM，WSL2 Ubuntu-24.04（vhdx 在 `D:/WSL`，251G 盘，可用 225G+）；NAS 那块盘 175G 已用 76%，只剩 44G。
- 迁移方式：`rsync -a` 从 NAS 拉 `wlan-ap-a`，**排除** `openwrt/build_dir`、`staging_dir`、`tmp`、`logs`、`.ccache`，
  共 4.1GB / 82,381 文件 / 49 秒（84.5MB/s）。`.config` md5 `c3d7f4ef…` 与 NAS 一致。
- **必须做的配置**：`/etc/wsl.conf` 加 `[interop] appendWindowsPath=false`，然后 `wsl --shutdown`。
  不加则 PATH 混入 16 条 `/mnt/...`，其中 `…/Program Files/nodejs/` 被空格切成相对路径 `Files/nodejs/`，
  导致 `package/install` 阶段 `find -execdir` 直接拒绝执行：
  `find: The relative path 'Files/nodejs/' is included in the PATH environment variable, which is insecure...`
  → `package/Makefile:103: package/install Error 1`。**症状是全量编 35 分钟都正常，偏偏死在最后打包**。
- 另外 `%USERPROFILE%\.wslconfig` 的 `swapFile` 要写正斜杠（`D:/WSL/swap.vhdx`），否则每次调 wsl 都警告转义字符无效。
- 迁移后首轮增量编译 2 分 15 秒出包（工具链与 target 全部复用），产物：
  factory 20,185,092 `md5 5061e369d3195a42bcef306bfda26ae1`；sysupgrade 16,548,135 `md5 5863573a6bf7cc4d08360e06dba81568`
  FIT：lzma，kernel data 4,801,505（4.58MiB）
- 镜像内容核对：`etc/init.d/sfp-detect`(S95)、`etc/init.d/ssdk-loglevel`(S21/K10)、`usr/sbin/sfp-detect.sh` 均在 rootfs；
  qca-ssdk.ko 内含 `sfp module inserted: force re-init` / `sfp still down after %d ticks` → 0901 补丁确实编入。
