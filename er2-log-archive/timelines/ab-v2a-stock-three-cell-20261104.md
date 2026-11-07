# A/B 三格实测：v2-a 原包 SFP 冷/热启动行为（2026-11-04 20:20~20:45）

固件：EWRT-ER2-v2-a-factory.bin
md5 = 4ddf836969a3d34310a5ffeda84f355b
size = 20185092
刷入方式：uboot web `/upload` + `/result auto_reboot=true`

## 结果

| 格 | 场景 | 观测 | 结果 |
|---|---|---|---|
| A1 | uboot 刷机后 auto_reboot 首启 | 内核 443s，eth0 carrier=0/down/speed=65535，carrier_changes=1 | ❌ 不 link |
| A3 | 软重启 reboot（此前从未 link 过） | 174s 仍 carrier=0/down/65535 | ❌ 不 link |
| A3b | 软重启 reboot（前一格已 link 2500 成功） | 209s 仍 carrier=0/down/65535 | ❌ 不 link |
| A3c | 软重启 reboot（热插拔恢复 link 2500 之后） | 209s 仍 carrier=0/down/65535 | ❌ 不 link |
| A3d | 软重启 reboot（热插拔恢复 link 后再试，4 分钟窗口） | 280s 仍 carrier=0/down/65535 | ❌ 不 link |

软重启累计：A3 / A3b / A3c / A3d 共 **4 次全部失败**，无一例外，且都不会自愈。
| A2 | 断电冷启动 | dmesg `[58.552646] PHY Link up speed: 2500`，carrier=1/up/2500，carrier_changes=2 | ✅ link |

补充：A2 归档在 `er2-log-archive/by-firmware/v2a-stock-A2-coldboot-20261104-203226/`，
A1/A3/A3b 分别在 `v2a-stock-A1-firstboot-*`、`v2a-stock-A3-softreboot-*`、`v2a-stock-A3b-softreboot-afterlink-*`。

## 结论

1. v2-a 原包**只有断电冷启动能 link**（58.5s）。刷机后首启、软重启一律不 link，且不会自愈。
2. A3b 证明「一旦 link 过一次，后续软重启就稳」的假设**不成立**，warm reset 一律失败。
3. 之前"v2-a 稳定识别"的准确表述是"v2-a 断电冷启动稳定识别"。历史 27.19s / 58.47s 两条记录属于冷启动，不是软重启。
4. 复现包（v2a-repro-20261104-1957）在同一格表现一致（首启不 link、冷启动 58.47s link），**行为等价成立**。
5. 缺陷属于两版共有，不是某一版引入：warm reset 场景下模块与 PHY 未同步复位，link 协商一次失败后不再重试。
6. 失败态与成功态 dmesg 差异仅一行：成功态多出 `[58.55] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500`；
   两边都有 `SFP port 2 init successfully`(9.4~9.5s) 与 `link-intr-gpio is not defined, link polling is enabled`。
   → 识别环节无差别，差别只在端口 link 结果。

## A5：不 link 状态下热拔插猫棒（决定性实验）

场景：软重启后 eth0 down（uptime 422s，carrier_changes=1），整机**不重启**，仅拔插 SFP 模块。

| 观测 | 值 |
|---|---|
| 拔插后 link 时刻 | uptime 555.59s（墙钟 20:45:15），carrier_changes 1→2 |
| 结果 | `PHY Link up speed: 2500`，carrier=1 / up / 2500 |
| 是否整机重启 | 否（uptime 连续 422→556） |
| dmesg 是否出现新的 SFP 重新识别 | **否**，全程只有 `sfp_phy_init SFP port 2 init successfully`（9.43s）这一条，热插拔时只多一行 `PHY Link up speed: 2500` |

**结论：SSDK 的 link polling 一直有效，驱动侧无缺陷。问题唯一落在"模块在 warm reset 后自身不输出信号，只有掉电重启才能恢复"。**
即：整机断电冷启动 ≡ 模块单独拔插（都让模块掉电），二者都能 link；warm reset 三种形态（uboot 刷机首启 / 软重启 / 已 link 后软重启）全部失败。
归档：`er2-log-archive/by-firmware/v2a-stock-A5-hotplug-in-failed-state-20261104-204300/`

## A5 与历史热插拔测试的差异（务必区分，别混为一谈）

| 维度 | 历史记录（旧归档/长期记忆） | 本次 A5（2026-11-04 20:45） |
|---|---|---|
| 模块类型 | 10G 光模块（SFP+） | 2.5G 猫棒（GPON stick） |
| 前置状态 | 端口**已 link 过**再拔插 | 端口**从未 link**的失败态（软重启后 down 422s）下拔插 |
| 触发结果 | 4~7s 内 link | 插回后 carr_changes 1→2，555.59s 直接 2500（秒级） |
| 冷启动对照 | 17.9s link | 58.5s link（整机断电） |
| 是否出现 SFP 重新识别日志 | 历史未逐条核对 | **无**，仅 poll 捕获 `PHY Link up speed: 2500` |
| 整机是否重启 | 否 | 否（uptime 连续） |

结论差异：旧记录证明"10G 模块热插拔能恢复"，本次证明"**2.5G 猫棒在从未 link 的失败态下热插拔也能恢复，且不需要重新走 SFP 识别**"。两者条件不同，不能互相引用为同一结论。
测量局限：本次插入时刻未打点，采样间隔 2~3s，故"插回到 link"的精确延迟只是秒级量级，不是精确值；如需精确值应在拔插开关上加时间戳。

## 待验证（修复方向）

- 软重启失败时热插拔猫棒是否能 link（区分模块侧 vs PHY 侧）。
- 在 sfp_phy_init 之后对 PHY 做一次硬复位 / 强制重新协商，使 warm reset 也能 link。
