# v2a-lzma 刷机首启 + 热插拔循环（2026-11-05 04:02–04:16）

固件：`EWRT-ER2-v2a-lzma-factory.bin` size=20,185,092 md5=5c3fcbc76a370566222ef7b82396588f
FIT：totalsize=4,853,712（4.63MB），kernel lzma 数据 4,800,689；原 gzip 版 FIT 6,529,652
刷写：uboot `/upload` → `/result` **必须带 upload_id**（否则 `upload_id_mismatch`）
模块：2.5G 猫棒，RateEncode encode=0x3 nominal_bit_rate=0x20
归档目录：`er2-log-archive/by-firmware/v2a-lzma-B0-firstboot-20261105-040206`、`plug1s-20261105-041318`

## 一、刷机后首启（warm reset）
| uptime | 事件 |
|---|---|
| 10.148s | `sfp_phy_init[718]: SFP port 2 init successfully` |
| 19.63s | rootfs 挂载完，无 SFP 后续打印 |
| 19.6s → 404.7s | **内核完全静默 385 秒**，无 SFP/PHY 任何打印 |
| 404.712s | `nss-dp dp1 eth0: PHY Link up speed: 2500`（无外部触发，自发恢复） |

- 全程无 reboot，carrier_changes 从 1 → 2
- cmdline：`root=PARTUUID=ec400a2a-... gpt rootwait clk_ignore_unused`（**已无 log_buf_len=16M**）
- Memory: 2031696K/2097152K available（2GB 全可用）
- 镜像未包含 `files/etc/init.d/sfp-detect`（设备无 /root/sfp-detect、ps 无 sfp），本次 link 与用户态无关

## 二、热插拔循环（1s 采样，carrier/operstate/changes/speed/LED/uptime/dmesg行数）
| 时刻 | uptime | carrier | state | changes | speed | led_sfp | dmesg |
|---|---|---|---|---|---|---|---|
| 04:13:19 | 687.43 | 1 | up | 2 | 2500 | 1 | 285 |
| 04:13:22 | 690.43 | 0 | down | 3 | 65535 | 0 | 287 |
| 04:14:45 | 773.42 | 1 | up | 4 | 2500 | 1 | 290 |
| 04:14:54 | 782.18 | 1 | up | 4 | 2500 | 0 | 290 |
| 04:14:55 | 783.77 | 1 | up | 4 | 2500 | 1 | 290 |

dmesg 原文：
```
[ 689.670236] nss-dp 3a504000.dp1 eth0: PHY Link is down
[ 689.670502] br-lan: port 1(eth0) entered disabled state
[ 772.872404] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
[ 772.872492] br-lan: port 1(eth0) entered blocking state
[ 772.877134] br-lan: port 1(eth0) entered forwarding state
```

## 三、结论
1. **拔出可感知**：≤1s 内 carrier=0、LED 灭、`PHY Link is down`。cage 的检测信号进得了 SOC。
2. **插入后恢复 83.2s**（689.67→772.87），期间 dmesg 无 `sfp_phy_init`，即**模块类型未重扫**，纯 PHY/PCS 状态机自爬。
3. `led_sfp` 是软件灯：`trigger=netdev, dev=eth0, mode="link tx rx"`，随 carrier 灭、随收发闪（04:14:54/55 的 1↔0 就是收发活动），**不能当硬件在位检测**，但可作为 link 状态的旁证。
4. 对比：v2-a gzip 首启 443s 仍不 link；本版 405s link。差异不来自压缩算法（只影响 FIT 体积/加载耗时，不改 SSDK SFP 时序），更可能是模块/PCS 自恢复随机性，样本各 1 次不足以下结论。
5. 可行方向：利用"插入沿"（carrier 上升 + LED）主动做模块重识别 + PCS 强制重初始化，把 83s 压到秒级，与"开机识别类型 + 模拟断电兜底"同一路径。
