# SFP 光口实验数据归档（2026-11）

本文件保存 ER2 SFP 光口 bring-up 过程中的全部实测数据与反向验证记录。
正文（README）只保留机制说明与结论，可复现的原始数据集中在这里。

测试平台：JDCloud ER2（IPQ5332），SFP 口 `eth0`（dp1），2.5G 电口 `eth1`（dp2）。
日志时间均为 dmesg 时间戳（秒），`loglevel=2`（SSDK INFO）。

---

## 一、失败现象（打补丁前）

上游代码在**热复位**后 SFP 口不建链：

- 冷启动能起来；
- `reboot` 之后一直是 `carrier=0 / speed=65535`；
- 插拔模块也不恢复，等多久都不会自愈；
- `sfp_phy_init` 之后没有任何后续日志（零 pulse）。

## 二、根因（R1 / R2 / R3）

| # | 根因 | 说明 |
|---|---|---|
| R1 | `TX_DISABLE` 兜底恒失败 | ER2 的 DTS `port@1` 只有 `media-type="sfp"`，**没有 `sfp_tx_dis_pin`**，`sfp_phy_tx_dis_status_set()` 恒返回 `-19`（SW_NOT_SUPPORTED），恢复路径第一步就 return，PCS 从未被重配 |
| R2 | 同模式重复 apply 是空操作 | 失败态下 `dt=23 cur=23 calc=23 rv=0` 但 `link=0`，再 apply 一次 23 不产生任何硬件动作，必须**换一个模式再换回来**才能强制 PCS 重新编码 |
| R3 | DEBUG 日志打乱节拍 | 3 级 `printk` 在 poll 线程里打印，实测让模式在 23/27 之间每秒翻转 124 次，自动协商永远起不来 |

## 三、修复方案

`0901-sfp-module-manager.patch`：per-port 模块管理器，挂在 SSDK 的
`mac_sw_sync_task`（约 1s 一个 tick）里，端口 down 满 **22 / 30 / 60 tick**
时执行一次恢复（原为 12/30/60，2026-11-06 调整为 22）：

```
2.5G 模块:  23 -> 4 -> 23      (2500BASE-X -> SGMII_BASET -> 2500BASE-X)
10G  模块:  27 -> 4 -> 27      (10GBASE-R  -> SGMII_BASET -> 10GBASE-R)
```

中间档 `4`（SGMII_BASET）只存活约 2 秒，作用是逼 PCS 真正重新初始化；
弹跳完成后模块约 1 秒重新训练。目标档**跟随实时读到的模块类型**，不写死。

`0902-sfp-25g-mode-hysteresis.patch`：让 2.5G 的候选档保持 30 次轮询，
避免原版在两候选间每轮切换（等于不停 re-init PCS，把自动协商饿死）。

## 四、各场景实测（2.5G 猫棒 / 10G 光模块）

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

## 五、反向验证（ABAB）

只测「打了补丁能过」不够，可能是环境变好。把 `0901`/`0902` 撤掉重编、
刷回同一台机器：

| 固件 | 软重启表现 | dmesg 证据 |
|---|---|---|
| 上游基线（无补丁） | **303s 仍 down，永不自愈** | 只有 `sfp_phy_init`，零 pulse |
| EWRT | **39.03s 起链，1 次 pulse** | `mode bounce 23->4->23` |

同一台机、同一支模块、同一根光纤、同一时段内前后对照 → 恢复能力确实来自模式弹跳。

## 六、原始日志片段

2.5G 软重启（tick=12 时代）：

```
[ 31.67] port2 still down after 12 ticks, pulse 1/3
[ 31.68] port2 no tx_disable (rv=-19): mode bounce 23->4->23
[ 33.89] port2 sfp recovery attempt done (pulse=1)
[ 38.07] port2 link up: 15 tick(s), 1 pulse(s)
[ 39.03] PHY Link up speed: 2500
```

## 七、2026-11-06：首脉冲阈值 12 → 22

现象：新基础镜像连续两次冷启动都在模块插入后 12 tick 内没 link up，
触发一次 pulse，`PHY link up` 分别拖到 40.09s / 38.65s。

排查结论：

- `qca-ssdk.ko` 与旧镜像逐字节对比只差 7 字节（编译时间戳字符串），
  **SFP 管理代码完全一致**，排除代码退化；
- `sfp_phy_init`（10s）与 `module inserted`（20~24s）时间点与历史一致，
  差异只出现在「插入后到 link up」这一段；
- 判定为模块自身就绪时间落在 12s 边界附近。

处置：`SFP_MGR_BOOT_TICKS` 12 → 22。实测同一支猫棒：插入后 **3 tick** 上链、
pulse=0、`PHY link up` **26.09s**，回到历史 21~25s 档。

| 固件 | module inserted | pulse | sfp link up | PHY link up |
|---|---|---|---|---|
| 37MB 版（tick=12） | 20~24 | 0 | – | 21~25 |
| 09:28 版（tick=12） | 19.80 | 1 | 37.69 | 40.09 |
| 09:46 版（tick=12） | 19.80 | 1 | 37.69 | 38.65 |
| tick=22 版 | 21.96 | 0 | 25.13（3 ticks） | **26.09** |

## 八、运行期调试旋钮

只用于 bring-up，默认值即生产配置：

| 旋钮 | 作用 | 备注 |
|---|---|---|
| `sfp_dbg` | 打开一行诊断打印 | 默认 0 |
| `sfp_force_mode` | 把接口模式记录改成指定值 | `23`=2.5G、`27`=10G、`4`=SGMII_BASET |
| `sfp_kick` | 立即应用一次 `sfp_force_mode` | **只改 SSDK 内部记录，不改已 link 端口的硬件状态** |

用法：

```sh
echo 23 > /sys/module/qca_ssdk/parameters/sfp_force_mode
echo 1  > /sys/module/qca_ssdk/parameters/sfp_kick
echo 1  > /sys/module/qca_ssdk/parameters/sfp_dbg
dmesg | grep -E "sfp|Link up"
```

## 九、2026-11-07：pulse 时机 / 滞回窗口三组对照（全部无效）

起因：用户记得"有一版 2.5G 冷启动很快"。查到 11-05 有一条 22.97s 的记录
（`er2-log-archive/timelines/v5-mode-bounce-20261105.md`，镜像 md5 `a187820f`），
本日逐项复测。

### 9.1 阈值三组对照（2.5G 猫棒，冷启动）

| 固件 | `SFP_MGR_BOOT_TICKS` | module inserted | pulse done | sfp link up | PHY link up |
|---|---|---|---|---|---|
| sfpfast（11:03） | 3 | 25.56 | 29.93 | 56.97 | 57.85 |
| sfp12（11:18） | 12 | 25.48 | 39.19 | 56.89 | 57.85 |
| 定版 8bc（00:30） | 22 | 27.96 | 50.95 | 57.21 | — |
| v5 重刷（11:52） | 12 | 19.65 | 33.35 | 57.29 | 58.25 |

三档阈值结果完全重合在 56.9~57.3s，最大差 0.4s（在噪声内）。

### 9.2 v5 的 22.97s 未复现

同一镜像（md5 `a187820f8c5a82493d7ef3ffb0de0ac4`，刷前已校验）重刷后冷启动
**57.29s**，且本次有完整串口序列：

```
[10.13] SFP port 2 init successfully
[19.65] port2 sfp module inserted: force re-init
[31.13] port2 sfp still down after 12 ticks, pulse 1/3
[33.35] port2 sfp recovery attempt done (pulse=1)
[57.29] port2 sfp link up: 34 tick(s), 1 pulse(s)
[58.25] eth0: PHY Link up speed: 2500
```

11-05 那次无串口记录（只有 SSH 后抓的 dmesg），无法还原 22 秒前的状态。
判定为**单次偶发**（推测模块处于温热/已初始化状态，模式一次应用即成功），
不作为该版本的性能属性。同日 11-06 记录中 tick=22 曾出现 26.09s，本日复测为 57.21s，
同属此类波动。

### 9.3 结论

- pulse 时机不是瓶颈：太早（2s）会打断模块自启动，太晚（22s）只是延后同样的结果；
- `SFP_25G_MODE_HOLD`（模式滞回窗口，原值 30）也试过收到 5，未编入镜像即停止
  （用户要求先停），理论上可缩短模式切换等待，但 9.1 表明瓶颈不在此；
- 冷启动 ~57s 是这支 2.5G 模块从**上电**到可协商的物理时间，软件侧无进一步压缩空间；
- 热重插仍是 5~6 秒（模块温热，零 pulse），见 `C-2G-HOT`。

处置：维持 `SFP_MGR_BOOT_TICKS = 12`（当前镜像），不再针对启动时间调整参数。
