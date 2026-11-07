# jiang 固件 10G 模块实测（2026-11-05 03:10~03:20）

## 一、结论

**jiang 固件不兼容 10G 模块，不是"只在开机时能用"，而是开机也认不了。**

之前基于代码逻辑的推断（"开机时插 10G，PCS 探测能对上，走 10G 路径"）被实测推翻。
真正原因是它的多速率探测只覆盖 1000/2500 低速档，10G 的 10gbase-r 路径从未被探测，必然超时回落。

## 二、实验一：热插拔换 10G（不重启）

起点：uptime 319s，猫棒在位，eth0 = carrier 1 / up / 2500 / carrier_changes 1

| 时刻 | 事件 |
|---|---|
| t≈330s | 拔掉猫棒，carrier_changes 1→2，eth0 down |
| t≈340s | 插上 10G 模块 |
| t≈340~432s | eth0 持续 carrier=0 / down / speed=65535 / carrier_changes 2，从未跳变 |
| — | dmesg 无任何新增行（无 sfp_phy_init、无 recovery_evaluate、无 Link up） |

模块本身正常：`ssdk_sh sfp RateEncode get 2` → `[encode]:0x6 [nominal_bit_rate]:0x67`，标准 10G 编码。
说明 I2C 可读、模块在位，但端口协议不再重新选择。

## 三、实验二：插着 10G 软重启

| 时间点 | 日志 | 含义 |
|---|---|---|
| 9.162751 | `sfp_phy_id_get[646]: e2prom speed value:0x6700` | 已正确读出 10G 模块速率编码 |
| 21.196490 | `sfp_startup_recovery_evaluate[1280]: dev0 port2 startup PCS timeout after 1 attempts; multi-rate probe bouncing to sgmii_fiber (EEPROM not required)` | 探测仍超时，强制回落固定档 |

- uptime 197s 时：eth0 = carrier 0 / down / speed 65535 / **carrier_changes 0**（本次启动一次都没 link 过）
- 超过 2 分钟判据（实际观察到近 3 分钟），无 link
- `carrier_changes 0` 是很硬的证据：开机到现在链路状态从未变化过

## 四、关键发现

1. **它知道这是 10G，但还是按低速配。** 9.16s 就读到 0x6700，21.19s 的回落日志却写着
   "EEPROM not required" —— 说明回落策略根本不使用 EEPROM 里的速率信息，直接钉死 sgmii_fiber。
   这不是识别能力不足，是策略把 10G 排除了。
2. `0x2000`（猫棒）/ `0x6700`（10G）两种模块在启动日志里区分得非常干净，可作为选协议的可靠依据。
3. 与 v2-a 对比：v2-a 的 10G 是好的（热插拔 4~7s、冷启动 17.9s link 10000），但猫棒 warm reset 不恢复；
   jiang 的猫棒是好的（每次开机必起），但 10G 完全不行。两者各缺一半，互补。

## 五、对我们方案的意义

- 不能照搬 jiang 的"探测超时回落"策略作为最终方案，它牺牲了 10G。
- 正确做法仍是：启动时读 EEPROM 速率编码（0x20→sgmii_fiber/2500base-x，0x67→10gbase-r），
  按类型直接配，不做盲探测、不做无条件回落。
- jiang 唯一可借的仍然只有"开机时把端口钉死到一个确定档位"这个稳定性思路，
  而不是它的档位选择结果。

## 六、原始数据位置

- 设备侧采样：/tmp/port-sample.log（重启已清除，内容已另存）
- 本次记录：er2-log-archive/timelines/jiang-10g-verdict-20261105.md
