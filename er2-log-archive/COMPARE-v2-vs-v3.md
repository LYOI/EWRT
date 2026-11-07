# v2-a 与 v3-b 光口行为对比

数据来源：`by-firmware/` 下各段整机日志。逐行原文可查 `merged/` 合并卷。

## 一、结果层（已有实测，可定论）

| 场景 | v2-a 基线二（原版 + 16M） | v3-b 基线三（debug） |
|---|---|---|
| 10G 模块热插拔 | 7.28s / 4.16s 收敛 link 10000 | 本次日志未覆盖 |
| 10G 冷启动（模块在位） | 17.91s 收敛 link 10000 | 未测 |
| 2.5G 猫棒热插拔 | 78.00s / 80.08s 成功 link 2500 | 三次热插拔全部不收敛 |
| 2.5G 猫棒冷启动（在位） | 成功（实测，时间点待补精确值） | 32.4s 首探 → 527.3s 仍 0 次 link up |
| 失败后自愈 | 0 次（每次 down 均为人为拔出） | 0 次（从不 link up） |

结论一句话：**原版 v2 慢但会成，v3 永远不成；但 v2 打开 debug 后同样不成（见第三节）。**

注意：表中 v2 的"成功"记录都发生在**模块持续供电**或**热插拔**条件下；
"模块完全断电后的冷启动"这一组合，v2 原版没有留下带 debug 日志的证据。

## 二、机制层（v3 有，v2 缺）

v3-b 冷启动 32.4s 首次探测即为：

```
sfp_speed:32 → rx_los_pin 557, rx_los_status 1 → Port 2 change interface mode to 23 from 27
```

之后 `cal restart` + 重配，约 1.16s 一轮，到 527.3s 仍是 0 次 link up。
指纹统计见 `timelines/sfp-events.md` 的 `v3b-debug / 06_*` 段。

v2 原版 SSDK 是默认日志级别（编译期常量，运行时无法改：`ssdk_sh` 无 debug/reg 入口，
无 `/proc/ssdk*`），所以这一段**打不出来**，必须刷 v2-a debug。

## 三、v2-a debug 冷启动实测（2026-11-04 13:08 段）

数据：`by-firmware/v2a-debug/02_1308_boot1.txt`，4605 行，0 → 282.1s。

固件差异（相对基线二原版）：SSDK DEBUG 打开、**含 0007 补丁（10G-R 路径写 MISC2=0x70）**、
0005 ppe tun 修复；bootargs 无 dyndbg、loglevel=3、16M。

时间线：

```
 9.41s  sfp_phy_init: SFP port 2 init successfully
 9.44s  __adpt_hppe_uniphy_sgmiiplus_mode_set: uniphy 0 is sgmiiplus mode
 9.44s  __qca_mppe_uniphy_cal_restart: uniphy 0 do calibration restart
16.81s  adpt_hppe_uniphy_port_adapter_reset: port 1, uniphy_index 0, port_mode 0x17
16.81s  Port 2 change interface mode to 23 from 27          ← 27=10G-R, 23=SGMII+
16.81s  __adpt_hppe_uniphy_sgmiiplus_mode_set: uniphy 1 is a sgmiiplus fiber port!
16.89s  sfp_speed:255 → 17.92s sfp_speed:32
16.81~282.07s  change interface mode 共 256 次，平均 1.04s 一轮
               rx_los_status 恒 1（512 次，每轮 2 次）
               polling task PPE port 2 link status 0 and speed 65535
               cal restart 仅前段 2 次（9.44s / 16.81s），之后不再重启
282.07s  0 次 PHY Link up
```

## 四、两版逐字段对比

| 字段 | v2-a debug（13:08） | v3-b debug（09:21 段） |
|---|---|---|
| 首次探测内核秒 | 16.81s | 32.4s |
| 首次 `sfp_speed` | 255 → 32 | 32 |
| `rx_los_status` | **恒 1** | **恒 1** |
| `change interface mode to 23 from 27` | 是（16.81s） | 是（32.4s） |
| 等待期切换次数 / 间隔 | 256 次 / 1.04s | 429 次 / 1.16s |
| cal restart 次数 | 2（仅前段） | 39（贯穿全程） |
| 观测时长 | 282s | 527s |
| link up 次数 | **0** | **0** |

结论：**v2-a 打开 debug 后，冷启动同样是 0 次 link up**，行为与 v3-b 同构，
差别只在 cal restart 频率。也就是说「v2 能成、v3 不成」这个说法在 debug 构建下不成立。

## 五、未解的关键点：rx_los 恒 1

两版 `rx_los_status` 都是 1，即模块自报「收不到光」。这有两种解释，必须先分掉：

1. **光路确实没有信号**（光纤没插好、对端交换机断电、猫棒 PON 侧未同步）——
   那 link 起不来是正常结果，驱动的重试只是表象；
2. 光路有信号但模块报 LOS —— 才是驱动/兼容问题。

判别办法（不用重编）：插回 10G 模块看 `rx_los`。

- 10G 读到 0 → 光路正常，是猫棒收不到光 → 查猫棒/对端 PON
- 10G 也读到 1 → 光路断了 → 先修线，再谈驱动

参照：基线二原版 12:35:47 曾成功 link 2500，说明当时光路是通的；
那次没有 debug 日志，无从知道当时 `rx_los` 值。

## 六、下一步（待光路确认后决定）

- 若光路正常：编一版 **v2-a debug 去掉 0007**（其余不动），单变量验证 0x70 是否元凶
- 若光路不通：先恢复光路，再重测冷启动，之前的"卡死"结论需整体复核

## 七、对比方法

```bash
cd /d/Work/Claw/er2-log-archive
# 1. 看里程碑并排
grep -nE "Booting Linux|sfp_phy_init|PHY Link" timelines/boot-milestones.md
# 2. 只看光口（密集段已折叠成指纹表）
less timelines/sfp-events.md
# 3. 全量对齐（同一秒区间）
grep -E "^\[ *(1[6-9]|2[0-9])\." by-firmware/v2a-debug/02_1308_boot1.txt
grep -E "^\[ *(3[0-9]|4[0-9])\." by-firmware/v3b-debug/06_*.txt
```
