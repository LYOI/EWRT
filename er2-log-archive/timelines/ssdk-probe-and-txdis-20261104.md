# SSDK 用户态探测与 TX_DISABLE 复位实验（2026-11-04 21:34~21:52）

固件：EWRT-ER2-v2-a-factory.bin（md5 4ddf83…55b），设备处于软重启后的失败态。

## 一、TX_DISABLE（gpio34）在失败态下的复位实验 —— A7

前置：软重启后 uptime 151s 确认 eth0 仍 carrier=0 / down / 65535 / cc=1（失败态）。
然后 export gpio546（512+34），direction=out，初值 0。

| 脉冲高度 | 观察窗口 | 结果 |
|---|---|---|
| 3s | 40s | 无效，cc 始终 1 |
| 10s | 40s | 无效 |
| 30s | 60s | 无效 |

**结论：TX_DISABLE 对这只猫棒没有任何复位作用，失败态下也救不回来。**
此前在 link 状态下测过一次（拉高 6s，link 纹丝不动），当时位置不对，本次已在失败态下按 3/10/30s 三档重测，结论一致。

→ **jiang 那条"驱动层无光→拉高 TX_DISABLE→延时→拉低"的复位思路，在本板上不成立**，因为该信号对模块无效（可能引脚未真正连到模块，或模块忽略该引脚）。

## 二、ssdk_sh 用户态能力探测

系统内自带 `/usr/sbin/ssdk_sh`（SSDK Shell 3.1.0，2026-11-03 构建）。

顶层命令含：port / sfp / debug / mib / interface / device 等。

### 2.1 port 子命令实测（port id = 2，即 dp1/SFP）

| 命令 | 返回 |
|---|---|
| `ssdk_sh port linkStatus get 2` | `[Status]:DISABLE`（可用） |
| `ssdk_sh port speed get 2` | `[speed]:UNKNOWN VALUE`（未 link 时） |
| `ssdk_sh port reset set 2` | `This request is not support` |
| `ssdk_sh port poweroff set 2` | `This request is not support` |
| `ssdk_sh port poweron set 2` | `This request is not support` |
| `ssdk_sh port mediumType get 2` | `This request is not support` |
| `ssdk_sh port fiberMode get 2` | `This request is not support` |
| `ssdk_sh port linkforcemode get 2` | `This request is not support` |

**结论：SFP 口在 SSDK 里是虚拟 PHY（phy id 0xaaaabbbb），端口级 PHY 复位/上下电/模式设置全部不支持，无法用 ssdk_sh 做"软件拔插"。**

### 2.2 sfp 子命令（关键收获）

`ssdk_sh sfp RateEncode get 2` 在**失败态**下成功返回：

```
[encode]:0x3 [nominal_bit_rate]:0x20
[rate_id]:0x0
```

- nominal_bit_rate = 0x20，与历史档案记录的"2.5G 猫棒 EEPROM byte12 = 0x20"完全一致
- 说明 SSDK 有到模块 EEPROM 的通路，且**不依赖 link 状态**（此刻端口是 down 的）

其他 sfp 子命令：Data 需要显式 addr（提示 `parameter (addr) or default (0x50) absent`）；VendorInfo / TransceiverCode 直接 get 返回 Operation failed（参数格式待摸）。

**结论："
在位检测 + 模块类型识别"在用户态即可实现**——读 RateEncode 得到 encode / nominal_bit_rate，即可区分 2.5G 猫棒与 10G 模块。这是"按模块类型选协议"的可行前置。

## 三、当前判断

| 恢复手段 | 可行性 |
|---|---|
| 整机断电冷启动 | ✅ 58.5s link（唯一稳定有效） |
| 拔插模块 | ✅ 秒级 link |
| TX_DISABLE 脉冲 | ❌ 失败态 3/10/30s 全无效 |
| ssdk_sh 端口 reset/poweroff/poweron | ❌ not support（虚拟 PHY） |
| SFP VCC 控制 | ❌ 设备树无供电控制脚，未知硬件是否有 |

下一步候选：
1. 用户态读 EEPROM 判类型 → 驱动层按类型选 2500base-x / 10gbase-r（解决"两者互斥"，但未必解决 warm reset 不 link）
2. `ssdk_sh debug` 直接写 PCS/SERDES 寄存器强制重初始化（风险高，需摸清寄存器）
3. 确认硬件有无 SFP 供电控制点（需原理图）
