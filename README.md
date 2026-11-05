# EWRT — JDCloud ER2 (IPQ5332) OpenWrt 固件

EWRT 是一个独立维护的 OpenWrt 固件项目，目前只服务一个目标：京东云 ER2。
核心是 **SFP 光口的 2.5G / 10G 双速率兼容**——同一份固件、不改任何配置，
插 2.5G 猫棒或 10G 光模块都能起链，冷启动、软重启、热插拔、模块互换全部可用。

> 本项目独立维护，不是上游某个分支的镜像：以
> **[Telecominfraproject/wlan-ap](https://github.com/Telecominfraproject/wlan-ap)**
> （TIP OpenWiFi AP NOS，BSD-3-Clause）为上游主线，ER2 的板级支持起步于
> **[zt406600/wlan-ap](https://github.com/zt406600/wlan-ap)** 的 `er2` 分支。
> 这条线没有 ER2 目标，两份上游的工作是前提，详见[致谢](#九致谢与许可)。
> 上游的通用文档（其他目标 profile、uCentral、Docker 构建）原样保存在 `OPENWIFI_README.md`。

```
硬件   IPQ5332  ·  SFP 口 eth0 (dp1)  ·  2.5G 电口 eth1 (dp2)
管理   192.168.1.1  ·  root 空密码  ·  LuCI 已装
固件   squashfs + tmpfs overlay（/etc 改动不持久）
```

---

## 一、上游与来源

| 项 | 内容 |
|---|---|
| 上游主线 | [Telecominfraproject/wlan-ap](https://github.com/Telecominfraproject/wlan-ap) — TIP OpenWiFi 的 AP NOS |
| 上游基线 | `a85083bc`（2026-10-28，上游 `main`） |
| ER2 板级来源 | [zt406600/wlan-ap](https://github.com/zt406600/wlan-ap) `er2` 分支（上游本身没有 ER2 目标） |
| OpenWrt 树 | `openwrt-25.12` @ `f0a60eee`（v25.12.5），叠加 `patches-25.12/` 共 157 个补丁 |
| 板级代码 | `feeds/qca-wifi-7/`（QCA NSS / PPE / ECM / SSDK、ipq53xx target、ER2 DTS） |
| 许可 | BSD-3-Clause，Copyright (c) 2024 Telecom Infra Project（见 `LICENSE`） |

### 与上游的差异

对照基准是 `Telecominfraproject/wlan-ap` 的 `main`（`a85083bc`）：

| 维度 | 上游 `wlan-ap` | EWRT |
|---|---|---|
| 目标 | 通用 AP NOS，约 70 个 board profile | 只维护 ER2 |
| ER2 target | **无** | 有（起步自 zt `er2` 分支，包集合另调 aurora 主题、zh_Hans） |
| SSDK 补丁 | `0001` / `0005` / `0006` | 追加 `0007`（10G SerDes MISC2）、`0901`（模式弹跳恢复）、`0902`（2.5G 候选档保持） |
| 内核载荷 | `kernel-bin \| gzip \| fit gzip` | `kernel-bin \| lzma \| fit lzma`（给 vendor blobs 腾空间） |
| 热复位后 SFP | 不建链，无法自行恢复 | 12/30/60 tick 重试 + `23↔4` / `27↔4` 模式弹跳 |
| 默认主题 | argon（vendored v3.1.2） | 增加 aurora 主题并设为默认，含简体中文 LuCI |
| 刷机 | `sysupgrade` | uboot web（ER2 的 `platform.sh` 没有该分支，见[已知限制](#六已知限制)） |
| 文档 | 通用 README | 本 README，上游原文见 `OPENWIFI_README.md` |

### 跟上游同步

```bash
./setup.py --rebase     # 把 OpenWrt 树重置到 config.yml 里的 revision，再按序重打补丁
```

`patches-25.12/` 的 `01xx` 段**留给上游**（每次同步都会在末尾追加打包升级补丁），
本仓库自有补丁一律从 `0200` 起，这样同步上游时不会产生编号冲突。

---

## 二、快速开始

```bash
# 1. 取源码
git clone https://github.com/LYOI/EWRT.git
cd EWRT

# 2. 构建（自动拉 OpenWrt 树、打补丁、生成 .config）
./build.sh jdcloud_er2

# 3. 产物
ls openwrt/bin/targets/ipq53xx/generic/openwrt-ipq53xx-jdcloud_er2-squashfs-factory.bin
```

刷机走 **uboot web**，不要用 `sysupgrade`（原因见[已知限制](#六已知限制)）：

```bash
# 断电 → 按住 reset 上电 → 进 uboot web（http://192.168.1.1/）
curl -F firmware=@openwrt-ipq53xx-jdcloud_er2-squashfs-factory.bin http://192.168.1.1/upload
curl -X POST -F auto_reboot=true http://192.168.1.1/result
```

---

## 三、SFP 双速率兼容

### 现象

上游代码在**热复位**后 SFP 口不建链：冷启动能起来，
但 `reboot` 之后就一直是 `carrier=0 / speed=65535`，插拔模块也不恢复，
等多久都不会自己好。

### 根因

| # | 根因 | 说明 |
|---|---|---|
| R1 | `TX_DISABLE` 兜底恒失败 | ER2 的 DTS `port@1` 只有 `media-type="sfp"`，**没有 `sfp_tx_dis_pin`**，`sfp_phy_tx_dis_status_set()` 恒返回 `-19`（SW_NOT_SUPPORTED），恢复路径在第一步就 `return`，PCS 从未被重配 |
| R2 | 同模式重复 apply 是空操作 | 失败态下 `dt=23 cur=23 calc=23 rv=0` 但 `link=0`，再 apply 一次 23 不会产生任何硬件动作，必须**换一个模式再换回来**才能强制 PCS 重新编码 |
| R3 | DEBUG 日志打乱节拍 | 3 级 `printk` 在 poll 线程里打印，实测让模式在 23/27 之间每秒翻转 124 次，自动协商永远起不来 |

### 修复

`0901-sfp-module-manager.patch` 增加一个 per-port 管理线程：端口 down 满
**12 / 30 / 60 tick** 时执行一次恢复，内容是 `TX_DISABLE` 保持（ER2 上走 rv=-19 分支）
加**接口模式弹跳**：

```
2.5G 模块:  23 -> 4 -> 23      (2500BASE-X -> SGMII_BASET -> 2500BASE-X)
10G  模块:  27 -> 4 -> 27      (10GBASE-R  -> SGMII_BASET -> 10GBASE-R)
```

中间那一档 `4`（SGMII_BASET）在链路里只存活约 2 秒，作用是逼 PCS 真正重新初始化；
弹跳完成后模块约 1 秒重新训练。目标档**跟随实时读到的模块类型**，不是写死的。

`0902-sfp-25g-mode-hysteresis.patch` 让 2.5G 的候选档保持 30 次轮询：
原版在两个候选之间每轮切换，等于不停 re-init PCS，把自动协商饿死。

原始日志示例（2.5G 软重启）：

```
[ 31.67] port2 still down after 12 ticks, pulse 1/3
[ 31.68] port2 no tx_disable (rv=-19): mode bounce 23->4->23
[ 33.89] port2 sfp recovery attempt done (pulse=1)
[ 38.07] port2 link up: 15 tick(s), 1 pulse(s)
[ 39.03] PHY Link up speed: 2500
```

### 实测（`loglevel=2`，值为 dmesg 时间戳）

| 场景 | 2.5G 猫棒 | 10G 光模块 |
|---|---|---|
| 断电冷启动 | 23.2s | 21.19s |
| 软重启 | 39.03 / 40.4 / 41.8s | 24.60 / 24.64s |
| 热插拔 | 85.6s（78 tick，2 pulse） | 6.0 / 9.0s（0 pulse） |
| 静置 | 13 分钟，`carrier_changes` 冻结 | 10 分钟 219 采样点，`crc_err=0` |
| 模块互切 | 10G→2.5 = 85.6s | 2.5→10G = 6~9s，cchg 每轮只 +1 |
| 恢复中被拔插 | — | 20.96s 自行恢复，不靠重启 |

10G 冷启动比软重启快，是因为冷启动时 PCS 没有热复位残留态，插入沿的
`force re-init` 一次就够，完全不需要进恢复流程。

### 反向验证（ABAB）

只测「打了补丁能过」不够，可能是环境变好。把 `0901`/`0902` 撤掉重编、刷回同一台机器：

| 固件 | 软重启表现 | dmesg 证据 |
|---|---|---|
| 上游基线（无补丁） | **303s 仍 down，永不自愈** | 只有 `sfp_phy_init`，零 pulse |
| EWRT | **39.03s 起链，1 次 pulse** | `mode bounce 23->4->23` |

同一台机、同一支模块、同一根光纤，同一时段内前后对照 → 恢复能力确实来自模式弹跳。

### 运行期调试旋钮

只用于 bring-up，默认值即生产配置：

| 旋钮 | 作用 | 备注 |
|---|---|---|
| `sfp_dbg` | 打开一行诊断打印 | 默认 0 |
| `sfp_force_mode` | 把接口模式记录改成指定值 | `23`=2.5G、`27`=10G、`4`=SGMII_BASET |
| `sfp_kick` | 立即应用一次 `sfp_force_mode` | **只改 SSDK 内部记录，不改已 link 端口的硬件状态**，不要拿它当"制造失败态"的手段 |

---

## 四、构建

本仓库有两套构建入口，分属两条分支，**不要混用**：

| 分支 | 入口 | 配置来源 | 用途 |
|---|---|---|---|
| `main` | 方式 B | `defconfig/jdc-er2.config` | 出镜像的唯一路径，验收数据都来自这条 |
| `Base-test` | 方式 A | `profiles/jdcloud_er2.yml` | 板级最小集验证，跟随 `main` rebase |

改完配置先跑一次校验，确认两处说法一致：

```bash
./scripts/check-config.sh
# RESULT OK profile 声明的包全部在 defconfig 里
```

### 方式 B：手动构建（`main` 的默认路径）

```bash
sudo apt install build-essential libncurses5-dev gawk git libssl-dev gettext \
  zlib1g-dev swig unzip time rsync python3 python3-setuptools python3-yaml

./setup.py --setup                    # 首次；已存在 openwrt/ 时用 --rebase

cd openwrt
./scripts/gen_config.py jdcloud_er2   # 生成 feeds.conf
./scripts/feeds update -a
./scripts/feeds install -a
cd .. && ./setup.py --feed-patches    # 套用 feeds-patches/<feed>/ 下的补丁

cd openwrt
cp ../defconfig/jdc-er2.config .config
make defconfig
make -j$(nproc) download V=s
make -j$(nproc) V=s
```

### 方式 A：脚本构建（`Base-test` 分支）

```bash
git checkout Base-test
./build.sh jdcloud_er2
```

按 `profiles/jdcloud_er2.yml` 生成 `.config`。profile 只声明板子本身需要什么（74 个包：
target、NSS/PPE/ECM/SSDK 驱动栈、aurora 主题、简体中文），userspace 应用由该分支的
defconfig 补齐。这条线用来验证「最小板级集能否独立起来」，产物不等同 `main`。

> 两个方案不要混用：`./build.sh` 会用 `gen_config.py` 重新生成 `.config`，覆盖手工改动。

国内网络下 `feeds update` / 部分包 Makefile 会访问 `github.com`、`codeload.github.com`，
建议先设代理，或按需给 git 配镜像。

### 不要做的三件事

| 禁止 | 原因 |
|---|---|
| 启用 `patches-disabled/0008-...debug-log....disabled` | 它把 `ssdk_log_level` 从 2 抬到 3，冷启动从 19.99s 变成 282 秒一次 link 都没有；留在 `patches-disabled/` 只为复现该对照实验 |
| 给 `ipq5332-jdcloud-er2.dts` 加 `sfp_rx_los_pin` / `sfp_tx_dis_pin` | 加上后 SSDK 从硬件 LOS 切到软件读 GPIO45，冷启动不建链；`bootargs-append` 保持只有 `clk_ignore_unused` |
| 用 `sysupgrade` 刷机 | 见[已知限制](#六已知限制) |

### 产物

`openwrt/bin/targets/ipq53xx/generic/`：

| 文件 | 用途 |
|---|---|
| `…-squashfs-factory.bin` | **刷机用**（uboot web 上传） |
| `…-initramfs-kernel.bin` | 救援/救砖 |
| `config.buildinfo`、`feeds.buildinfo`、`…manifest`、`sha256sums` | 构建记录 |

---

## 五、刷机

`/lib/upgrade/platform.sh` 的 `platform_do_upgrade` **没有 `jdcloud,er2` 分支**，
`sysupgrade` 只会重启、不写盘（rootfs 是 squashfs + tmpfs overlay，`/etc` 改动不持久）。
所以只能用 uboot web：

```bash
# 1. 断电，按住 reset 上电，进 uboot web 恢复模式
# 2. 确认在位
curl -s http://192.168.1.1/env/list | head
# 3. 上传 + 写入 + 自动重启
curl -F firmware=@openwrt-ipq53xx-jdcloud_er2-squashfs-factory.bin http://192.168.1.1/upload
curl -X POST -F auto_reboot=true http://192.168.1.1/result
```

写入成功时 `/upload` 会回传镜像 md5，可与本地 `md5sum` 对照。

两个坑：

- **写盘/重启瞬间不要按 reset**。uboot 检测到 reset 会重进 failsafe web，不走 `bootipq`，表现为"刷成功了但没进系统"。
- 判断"是否刷完"先看 SSH 通不通，再看 `/env/list` 返回码；设备已进固件时 `/env/list` 未必返回 404。

---

## 六、已知限制

| 项 | 状态 |
|---|---|
| 1G SFP 模块 | **不支持，也不打算支持**（电口已覆盖 1G，光口做 2.5G/10G 才有意义） |
| `sysupgrade` | 不支持，见上一节 |
| 10G 在位失败态下的 `27->4->27` | **未覆盖**。运行期旋钮不落硬件，构造不出"模块在位且链路卡死"的状态；这条分支只在"10G 拔出后的空槽"变体里真实执行过一次（执行后模块插回 5 tick 起链 10000） |
| `PKG_MIRROR_HASH:=skip` | 见下 |

关于 `PKG_MIRROR_HASH`：`sources.openwrt.org` 上没有 `qca-ssdk-qca-1.0.tar.zst`（404），
本地生成的 tarball 又与记录的 hash 不符，保留旧值会让每次构建在
`Hash mismatch` 处失败，所以设成 `skip`。源码版本仍由
`PKG_SOURCE_VERSION:=4a51edc0…` 固定，可复现性不受影响；等上游镜像真正有这个包后再还原。

**给后来者的提醒**：未覆盖 ≠ 没问题。真遇到 10G 在位卡死，先抓 `dmesg` 确认
`mode bounce` 的目标档是 `27` 而不是 `23`，不要直接套用 2.5G 的结论。

---

## 七、补丁清单

| 文件 | 作用 |
|---|---|
| `feeds/qca-wifi-7/qca-ssdk-qca/patches/0901-sfp-module-manager.patch` | SFP 管理线程：12/30/60 tick 重试 + 模式弹跳恢复 + 调试旋钮 |
| `feeds/qca-wifi-7/qca-ssdk-qca/patches/0902-sfp-25g-mode-hysteresis.patch` | 2.5G 候选档保持 30 次轮询 |
| `feeds/qca-wifi-7/qca-ssdk-qca/patches/0007-qca-ssdk-10g-r-program-misc2.patch` | 10GBASE-R 的 SerDes `MISC2 = 0x70`（2.5G 仍走原生 SGMII+ `0x50`） |
| `feeds/qca-wifi-7/qca-ssdk-qca/patches-disabled/0008-…debug-log….disabled` | 故意不启用，用于复现日志干扰对照 |
| `feeds/qca-wifi-7/ipq53xx/image/Makefile` | FIT 内核 gzip → lzma，给 vendor blobs 腾空间 |
| `feeds/qca-wifi-7/qca-ssdk-qca/Makefile` | `PKG_MIRROR_HASH:=skip`，见上节 |

上游已有的 `0001`（RTL 支持）、`0005`（QCA8385 VLAN）、`0006`（SFP GPIO `cansleep`）原样保留未改。

补丁、构建源码、实机运行的 `qca-ssdk.ko` 三者已逐层核对一致
（`patch -R --dry-run` 无 fuzz、`ko` md5 `a5377b72…` 与设备一致、`strings` 能捞到
`mode bounce %d->%d->%d` 等日志格式串）。

---

## 八、仓库结构

```
build.sh             构建入口（setup + gen_config + feed patches + 编译）
setup.py             拉取/重置 OpenWrt 树，应用 patches-25.12 与 feeds-patches
config.yml           OpenWrt 版本与补丁清单
profiles/            方式 A 的包集合（jdcloud_er2.yml）
defconfig/           完整 .config（方式 B）
patches-25.12/       打进 OpenWrt 树的补丁（0200 段起为本仓库自有）
feeds-patches/       针对 feed 包的补丁（luci 等）
feeds/qca-wifi-7/    qca feed：ipq53xx target、NSS/SSDK、DTS、内核补丁
feeds/extras/        vendored 第三方包（argon / aurora 主题）
OPENWIFI_README.md   上游 README 原文
```

---

## 九、致谢与许可

EWRT 的绝大部分代码不是本项目写的。没有下面这些项目和工作，这个仓库不会存在：

| 项目 | 作用 |
|---|---|
| [Telecominfraproject/wlan-ap](https://github.com/Telecominfraproject/wlan-ap) | **上游主线**：OpenWiFi AP NOS、构建框架（`setup.py` / `build.sh` / `gen_config.py`）、`patches-25.12` 系列、qca-wifi-7 feed |
| [zt406600/wlan-ap](https://github.com/zt406600/wlan-ap) | **ER2 板级支持的起点**：`er2` 分支的 ipq53xx target、ER2 DTS、`profiles/jdcloud_er2.yml`、`defconfig/jdc-er2.config`；本仓库的 SFP 修复即建立在这套板级代码之上 |
| [OpenWrt](https://openwrt.org/) | 固件框架与 25.12 树 |
| QCA / qca-wifi-7 feed | NSS / PPE / ECM / SSDK 驱动（本仓库的 SFP 补丁即打在 `qca-ssdk-qca` 上） |
| [jerrykuku/luci-theme-argon](https://github.com/jerrykuku/luci-theme-argon) | argon 主题 v3.1.2（vendored） |
| [eamonxg/luci-theme-aurora](https://github.com/eamonxg/luci-theme-aurora) | aurora 主题（本仓库默认主题） |

两份 `wlan-ap` 上游都是 BSD-3-Clause，本仓库的许可与版权声明随上游一并保留
（`LICENSE`，Copyright (c) 2024, Telecom Infra Project）。
内置第三方组件的许可随各自目录（例如 `feeds/extras/*/LICENSE`）。

本仓库自己写的部分只有三块：SSDK 的 SFP 补丁（`0901` / `0902` / `0007`）、
ER2 的包集合与默认主题调整、以及把上面这些跑通的构建与验收脚本。
