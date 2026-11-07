# 版本记录

## 2026.11.07（含 dae，当前定版）

在下面那份基础上编入 **dae 2.1.1**（eBPF 透明代理），内核补齐 eBPF/BTF 支持。

| 镜像 | 大小 | md5 |
|---|---|---|
| `EWRT-ER2-20261107-dae-factory.bin` | 112,984,068 | `35c96777d73ef715c249ee8a97351e8e` |
| `EWRT-ER2-20261107-dae-sysupgrade.bin` | 110,111,015 | `b8b963d892752a154a94cb97a3d18fbf` |

发布：<https://github.com/LYOI/EWRT/releases/tag/v2026.11.07>

### 内容

- 内核：`BPF_JIT` / `BPF_EVENTS` / `NET_ACT_BPF` / `XDP_SOCKETS` 打开，`DEBUG_INFO_BTF=y`
  且关掉 `DEBUG_INFO_REDUCED`（否则 BTF 生成不出来）；`/sys/kernel/btf/vmlinux` 3.48MB
- 包：`dae` + `luci-app-dae` + `luci-lib-daeuniverse` + `vmlinux-btf-builtin`（用内核自带 BTF，
  不装 blob 包）+ `v2ray-geodata`
- 实机验证：`Loaded eBPF programs and maps`，`Bind to LAN: br-lan` / `Bind to WAN: eth0`，
  进程持有 12 × bpf_link / 20 × bpf_prog / 21 × bpf_map；唯一降级是
  `bpf_get_current_task` 不支持，退回 `get_current_comm`
- 离线环境需在 `/etc/dae/config.dae` 设 `disable_waiting_network: true`

> honk 要求 Linux 6.12+，本板 6.6.88 不满足，故选同源的 dae。

## 2026.11.07（不含 dae，历史产物）

首个可日常使用的定版。**不含任何调试打印**，只保留功能修复。

| 镜像 | 大小 | md5 |
|---|---|---|
| `EWRT-ER2-20261107-release-factory.bin` | 100,663,300 | `8da8b1162f44faab453ba512109506d7` |
| `EWRT-ER2-20261107-release-sysupgrade.bin` | 96,993,575 | `c83765099ff603e00805c46c55a756bf` |

> 内核改动只走 factory.bin（sysupgrade 只写 rootfs，不更新 HLOS 里的内核）。

### 内容

- **f2fs overlay 修复**：镜像中含 `f2fs-tools` 时，fstools 的 `use_f2fs()` 会走 f2fs，
  必须同时编入 `kmod-fs-f2fs`，否则 `mount -t f2fs` 报 `No such device`、刷机后不进系统。
  这是此前 "64MB 以上镜像起不来" 的真实原因，与镜像体积无关
- **rootfs_data 在 p22 尾部**：f2fs，1.9G，偏移按 squashfs 实际大小 + 64MiB 保留区计算
- **应用全部编入 squashfs**：adguardhome、qbittorrent（含 qt6/rblibtorrent）、lucky、
  luci-app-openclash，加上 partexp / samba4 / gecoosac / wolultra 与 6 个 vendored 小应用
- **pciutils** 与 **`CONFIG_KERNEL_DEVMEM`** 打开（排查用）
- **hostname 固定为 EWRT**：`feeds/qca-wifi-7/ipq53xx/base-files/etc/uci-defaults/98-er2-hostname`，
  首次启动写入 `system.@system[0].hostname`
- **分区布局**（本轮调整）：`p24` = swap 1GiB，`p25` = storage 54.1GiB（ext4，`LABEL=storage`）

### 实测状态（2026-11-06/07）

| 项 | 状态 | 证据 |
|---|---|---|
| 启动 | 通过 | factory 刷写后 `LINK_UP speed=2500 uptime=55s`，427 包，SSH 上线 |
| overlay | 通过 | `/dev/loop0 ... type f2fs`；重启后 `/etc` 写入的标记文件仍在 |
| hostname | 通过（运行态） | 重启后 `cat /proc/sys/kernel/hostname` = `EWRT` |
| storage / swap | 通过 | `/mnt/storage` 52.9G 自动挂载；swap 1048572 KB 自动启用 |
| SFP 光口 | 通过 | `port2 sfp link up`、`eth0 speed 2500` |
| NVMe | **不识别** | LTSSM 停 0x3，见 `docs/er2-nvme-investigation.md` |
| 刷机后 hostname 自动设置 | 通过 | factory 刷写后首启即 `hostname=EWRT`（2026-11-07 01:49 实机验证） |

### 已知问题

- M.2 NVMe 不识别，排查记录见 `docs/er2-nvme-investigation.md`
- 光口↔电口跨口转发未复测（详见 README 对应条目）
- 10G 光模块未验证；社区有一条 SSDK MDIO C45 适配的线索，已归档在
  `docs/archived-sfp-c45-lead.md`，等有 10G 模块再动

### 刷机后需手动补的一步

`fstab` 在 factory/sysupgrade 后会被重置，需要恢复 storage 与 swap（`anon_mount` 要关，
否则 blockd 会挂到 `/mnt/mmcblk0p25` 而不是 `/mnt/storage`）：

```sh
uci set fstab.@global[0].anon_mount='0'
uci add fstab swap
uci set fstab.@swap[-1].device='/dev/mmcblk0p24'
uci set fstab.@swap[-1].enabled='1'
uci add fstab mount
uci set fstab.@mount[-1].target='/mnt/storage'
uci set fstab.@mount[-1].uuid='4894d600-73a2-4ded-a892-e3ef5c7912b5'
uci set fstab.@mount[-1].enabled='1'
uci commit fstab && block umount && block mount
```
