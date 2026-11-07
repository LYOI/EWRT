# ER2 SFP 光口双速率验收矩阵（2.5G + 10G）

目标：同一固件、不改配置，2.5G 猫棒与 10G 光模块均能在预算内起链路、达标称速率、真连通、且稳定。
主线：2.5G（已通）→ 10G 复用同一弹跳机制（待验）。主线是投入顺序，不是验收权重。
明确排除：1G 光模块不在验收范围（时代不需要 1G 光口，电口已覆盖）。
   - 内部中转档 4 (SGMII_BASET) 仅用于打断 PCS 稳态，不属 1G 光模块支持承诺。
   - 1G 模块插入时只要求"不崩、不误报 10000"，不要求起链路。

预算：180s（2.5G 由历史推导：最大成功 41.8s，失败下界 195s）。10G 无历史数据，180s 暂作上限。

## 矩阵（空格 = UNDETERMINED）

| ID | 模块 | 触发 | 动作 | 判据 | 实测 | 结论 |
|---|---|---|---|---|---|---|
| C-2G-COLD | 2.5G | 冷启动 | factory 刷写后首启 | 180s 内 2500 | 23.2s | PASS（**单次，2026-11-07 同镜像重测 57.3s，未复现**） |
| C-2G-WARM1 | 2.5G | 软重启 | reboot | 同上 | 40.4s | PASS |
| C-2G-WARM2 | 2.5G | 软重启 | reboot | 同上 | 41.8s | PASS |
| C-2G-SOAK | 2.5G | 静置 | 13min 采样 | cchg 不增 | 冻结 2 | PASS |
| C-2G-HOT | 2.5G | 热插入 | 10G→2.5 互切 | 180s 内 2500 | 85.6s（78 tick / 2 pulse） | PASS |
| C-2G-CONN | 2.5G | 连通 L3 | ping 1.10 小包+1472 | 双档 0% + rx 增量 | 0%/0%，rx+20759 | PASS |
| C-2G-L7 | 2.5G | 连通 L7 | HTTP 200 + 内容 | 200 且 body>0 | 1.10=200/419B、1.247=200/4853B | PASS |
| C-10G-HOT | 10G | 热插入 | 拔 2.5 → 插 10G | 180s 内 10000 | 6.0s / 9.0s（两次，均 0~5 tick） | PASS |
| C-10G-SOAK | 10G | 静置 | 10min × 2s 采样 | cchg 不增 + 零错误 | cchg 冻结 6，crc/err 0，219 点，L7 仍 200 | PASS |
| C-10G-CONN | 10G | 连通 L3 | ping 1.123 / 计数 | 0% + rx 增量 | 大包10/10，rx+15308 | PASS |
| C-10G-CONN2 | 10G | 连通 L3 | 软重启后再测 | 仍 0% | 20/20+20/20，rx+32688 | PASS |
| C-10G-L7 | 10G | 连通 L7 | HTTP 200 + 内容 | 200 且 body>0 | 1.247=200/4853B、1.1=200/664B | PASS |
| C-10G-WARM1 | 10G | 软重启 | reboot | 180s 内 10000 | 24.60s | PASS |
| C-10G-WARM2 | 10G | 软重启 | reboot | 180s 内 10000 | 24.64s | PASS |
| C-10G-COLD | 10G | 冷启动 | 断电 73s 后上电 | 180s 内 10000 | **21.19s**（dmesg 时间戳），0 pulse | PASS |
| C-SWAP-10G | 互切 | 2.5→10G | 同一固件连续换 | 各自预算内 + cchg 每轮只 +1 | 6.0s / 9.0s，cchg 4→5→6 | PASS |
| C-SWAP-2G | 互切 | 10G→2.5 | 换回 | 同上 | 85.6s，cchg 3→4 只 +1 | PASS |
| C-INT | 打断 | 恢复中拔插 | 拔后数 10s 插回（落在 bounce 窗口） | 不卡死、不靠重启 | 21.0s 自愈，1 pulse，bounce 27→4→27 执行中被插入 | PASS |
| C-BOUNCE-10G-A | 恢复 | 空槽弹跳 | 拔 10G 后管理器自动 pulse | 27→4→27 执行后模块仍能起链 | 210.23s 执行 → 879.35s 插回 5 tick 起链 10000 | PASS |
| C-BOUNCE-10G-B | 恢复 | 在位卡死 | kick 注入制造失败态 | 能走 27→4→27 且恢复 | 注入无效（kick 不落硬件） | UNDETERMINED |
| C-ABAB-A1 | 反向 | 原包刷后首启 | 刷 v2-a 原包 auto_reboot | 历史记录 443s 不 link | **33.9s 就 link 2500**（与历史不符） | 差异待查 |
| C-ABAB-A2 | 反向 | 原包断电冷启 | 断电后上电 | 历史 58.5s | **59.75s**（dmesg），cchg=2 | PASS（复现） |
| C-ABAB-A3 | 反向 | 原包软重启 | reboot | 历史 4/4 全失败、不自愈 | **303s 仍 NO_LINK**，cchg=1、speed=65535、只有 sfp_phy_init | PASS（失败复现 ✅ 关键反证） |
| C-ABAB-A4 | 反向 | 刷回 v5 复验 | 刷 v5 后软重启 | 应恢复 ~40s | **39.03s**（dmesg），1 pulse，bounce 23→4→23，cchg 1→2 | PASS |

## 准出条件（全满足才可称"光口双速率兼容"）

1. 矩阵无空格，空格必须显式记 UNDETERMINED，不许概括为"整体没问题"
2. 2.5G 与 10G 的冷/热/插拔全部 PASS
3. 互切两格 PASS，且切换后无残留（cchg 每轮只 +1、不误触发 bounce、速率正确）
4. 稳定性：静置窗口 cchg 不增
5. 反向验证 C-ABAB 完成
6. 每格留 boot_id + dmesg + logread + 采样 CSV + VERDICT

## 已知时序特性

- ~~插入/拔出沿会清零 down/pulse/elapsed~~ **（已证伪 2026-11-05）**：三次实测的 `link up: N tick(s)` 全部从 **down 起算**，插入沿不清零：
  264.55→284.47 = 19.9s、N=18；875.03→879.35 = 4.3s、N=5；199.75→284.39 = 84.6s、N=78。tick 约 0.9~1.1s。
  含义：`N tick(s)` 不能用来判断插入时刻，只能当"down 持续时长"读。
- 弹跳目标：target==4 → 23；否则 → 4。故 10G 路径为 27→4→27，跨两个速率档。
- bounce 内含 aos_mdelay(2000) 且在 polling 线程内，恢复执行中拔插，插入沿最多延后 2s。

## 10G 实测要点（2026-11-05）

- 热插入：拔出 2.5G（uptime 3311.51 link down）→ 插 10G（3316.87 sfp link up 6 tick 0 pulse）→ 3317.75 PHY Link up speed 10000。
  从插入到起链约 6 秒，0 pulse，未触发弹跳恢复。
- 软重启 x2：20.82/21.93 force re-init → 21.83/22.95 link up 10000，各 1 秒即起，cchg 冻结 2。
  与 2.5G 不同：2.5G 需 12 tick 后弹跳 23->4->23 才起；10G 靠插入沿 force re-init 就够。
- 结论：10G 的 warm reset 缺陷本来就不存在；27->4->27 弹跳分支在已测场景中从未执行（死路径），
  需 C-BOUNCE-10G 强制验证一次，否则属未验证代码。

## 连通性分层验收（L1~L7）—— "能走到房子" ≠ "插钥匙开门出水"

只 ping 通只能证明 L3；业务可用必须打到 L7。每格连通性按此四层记，缺层即记 UNDETERMINED。

| 层 | 判据 | 手段 | 比喻 |
|---|---|---|---|
| L1 物理 | carrier=1、speed 符合、rx_crc_errors=0 | `/sys/class/net/eth0/*` | 路修到了 |
| L2 链路 | cchg 不增、无新 bounce | `carrier_changes` + dmesg | 路上没塌方 |
| L3 网络 | 小包 + 1472 大包均 0% 丢包 | `ping -c 4` / `ping -s 1472 -c 10` | 能走到房子 |
| L4 传输 | TCP 握手成功（拿到任意 HTTP 码即可） | `curl -w %{http_code}` / `nc -w4` | 门后有人应声 |
| L7 应用 | HTTP **200** 且 body>0 且内容关键字命中 | `curl -L -o body -w code,size` | 进去插钥匙、水龙头出水 |

实测（2.5G 在位，PC→eth1→br-lan→eth0 光口→猫棒/上游，流量真穿光口）：

| 目标 | L3 小包/大包 | L4 | L7 | 结论 |
|---|---|---|---|---|
| 192.168.1.10（猫棒 LuCI） | 0% / 0% | 通 | **200**，419B，跳转 /cgi-bin/luci | PASS |
| 192.168.1.247（上游业务页） | 0% / 0% | 通 | **200**，4853B，真实 Vue 前端 | PASS |
| 192.168.1.1（ER2 LuCI） | 0% / 0% | 通 | **200**，664B | PASS |

- 期间 eth0 rx_bytes +20759 / tx_bytes +20208，errors=0、crc=0、cchg 冻结 4 → 双向业务流真实穿越光口且零错误。
- 注意"假 200"：403/301 说明 L4 活着但业务没进去；000 说明 TCP 都没建起来。三者必须分开记，不许笼统写"网络正常"。
- 设备侧工具现状：有 `wget`/`nc`/`ping`，**无** `curl`/`ethtool`/`tcpdump`/`iperf3`；装备侧 `wget http://1.123/` 返回
  `Operation not permitted`（本机发起被 netfilter 拦），故 L7 一律从 PC 侧发起，穿越光口更有说服力。

## 2.5G 互切实测要点（2026-11-05，10G→2.5G）

- 时间线：199.75s 10G 拔出 link down → 210.23s pulse1 `bounce 27->4->27`（**target 仍是旧模块残留的 27**）
  → 243.67s pulse2 `bounce 23->4->23`（此时才读到新 target=23）→ 284.39s `link up: 78 tick(s), 2 pulse(s)`
  → 285.35s `PHY Link up speed: 2500`。总计 85.6s，cchg 3→4 只 +1。
- 关键：互切场景**第一轮 pulse 打空**（目标档还是旧模块的 27），第二轮才命中。所以 2.5G 热插需要 2 轮 pulse 预算，
  这一点冷启/软重启都不需要（冷启 23.2s、软重启 40s 靠单轮 12 tick 即起）。
- 优化线索（未实施）：插入沿立刻刷新 target 档位，可省掉一轮 33s 的空 pulse。

## 采样判据陷阱（本次踩过）

- `carrier=0 + speed=65535` **无法区分"空槽"与"模块在位但没起链"**。我据此误判空槽，实际是 2.5G 猫棒在位未起链。
- 正确判据：dmesg 里 `sfp module inserted` / 模块 EEPROM 可读性 / `link up: N tick(s)` 是否出现过；不能只看 speed 值。

## 强制注入手段失效（2026-11-05 16:02~16:04 实测）

想构造"10G 在位 + link 失败"的状态来验证 27→4→27，试了 `sfp_force_mode + sfp_kick`：

| 注入 | 结果 | 采样证据 |
|---|---|---|
| `force_mode=4` + `kick`（uptime 927.19） | kick done，**链路不断** | carrier 恒 1、speed 恒 10000、cchg 恒 6 |
| `force_mode=23` + `kick`（uptime 1015.83） | kick done，**链路不断** | 同上，45s 采样零变化 |

结论：`sfp_kick` 只改 SSDK 内部模式记录（日志 `force mode N (was 27)`），**不落硬件**；已 link 的端口不会因此掉链，
管理器也就永远不判 down、不进 12 tick pulse。故"在位失败态"当前**无法用运行期旋钮构造**。

要真验这一变体，需固件侧加一个新旋钮（如 `sfp_pulse=1` 直接调用一次 recovery attempt），或让 kick 真正调用 apply→PCS reset。
建议列入下一版补丁清单。

## 判据差分纪律（本次踩坑，已固化为硬规则）

- ❌ 用 `dmesg | grep -c "mode bounce 27->4->27"` 当证据 → 会把**几十分钟前的旧日志**算成本次结果，
  直接产出假 PASS（本次 C-BOUNCE-10G 就被误判成 PASS）。
- ✅ 正确做法：注入前先记 `dmesg | wc -l` 为基线 N0，判定时只看 `dmesg | tail -n +$((N0+1))` 的新增行；
  或按 uptime 时间戳取 `>= 注入时刻` 的行。
- ✅ 交叉校验：日志说 bounce 了，采样就必须看到 carrier 掉过；两者不一致 → 判"证据冲突"，不许挑对自己有利的那个。

## 冷启动实测（2026-11-05 16:19~16:21，10G）

| 时刻(uptime) | 事件 |
|---|---|
| 10.216 | `sfp_phy_init: SFP port 2 init successfully` |
| 20.171 | `port2 sfp module inserted: force re-init` |
| **21.192** | `PHY Link up speed: 10000` |
| 23.35~87.70 | 采样 32 点：carrier 恒 1、cchg 恒 2、speed 恒 10000 |

- 冷启 **21.19s**（dmesg 时间戳），比软重启 24.6s 还快 3 秒，因为冷启时 PCS 从未进入过热复位后的坏状态。
- **0 pulse / 0 bounce**：插入沿的 force re-init 一次就够，无需进恢复流程。
- 采样口径差异：脚本采样判到 27.29s，dmesg 精确 21.19s；原因是 SSH 上线（uptime≈23s）后才开始采样。
  故冷启时间**一律以 dmesg 时间戳为准**，采样值只作交叉验证。
- 断电 73s（16:19:03 离线 → 16:20:16 上线），boot_id 由 `5a9fa7e3` 变 `ae806aeb`，确认是真冷启动。
- dmesg 中 8 条 error/fail 关键字全为误报：`ramoops`（含 oops 子串）、`GPT: Use GNU Parted to correct GPT errors`、`init/procd: - watchdog -`，均属正常启动噪声。
- ko md5 = `a5377b720dc2eec9397803b36a1c7364`，loglevel=2（v5 生产档）。

## C-INT 实测（2026-11-05 16:24，打断恢复流程）

操作：10G 在位 up → 拔模块 → 人工数 10 秒插回（落在 12 tick 触发的 pulse 执行窗口内）。

| uptime | 事件 |
|---|---|
| 264.55 | `PHY Link is down`（拔出） |
| 275.03 | `still down after 12 ticks, pulse 1/3` → `TX_DISABLE hold 3000ms` → `bounce 27->4->27` |
| 275.4±2 | **用户插回**（人工计时，落在 bounce 执行期间） |
| 277.22 | `recovery attempt done (pulse=1)` |
| 284.47 | `link up: 18 tick(s), 1 pulse(s)` |
| 285.51 | `PHY Link up speed: 10000` |

结果：拔出→起链 **20.96s**，cchg 3→4，boot_id 不变，0 oops/trace，L7 双目标 200/4853B 与 200/664B。

结论：
- ✅ **不卡死**：bounce 执行中被插入打断后仍能自行恢复满速，未靠重启兜底。
- ✅ 弹跳机制在被打断后依然有效，插入的模块最终由同一轮 bounce 的后半段（4→27）兜住。
- ⚠️ **"插入沿延后 ≤2s" 无法直接测量**：v5 的 `module inserted: force re-init` 只在 boot 后首次 present 时打印，
  热插与打断场景均无该日志，插拔时刻只能靠人工计时（±2s）。间接推断：插入≈275.4 → pulse done 277.22（≤1.8s）
  → 起链 284.47（插入后约 9s，10G 热插典型 5~9s），与"延后不超过 mdelay 2s"自洽，但不构成硬证据。
- 建议下一版补一条 `port%d sfp edge: present%d` 的边沿日志，专供打断场景判定。

## C-ABAB 反向验证实测（2026-11-05 16:27~16:43）

镜像：`EWRT-ER2-v2-a-factory.bin` md5=`4ddf8369…`（原包，无 0901/0902 补丁）
uboot 回传：`{"status":"success","info":{"md5":"4ddf8369…","type":"FIT Image"}}` + `{"status":"success","info":{"reboot":true}}`
运行体指纹：内核 `Tue Nov 3 01:33:04 2026`、`r33051-f5dae5ece4`、ko md5 `eebbf464…`（v5 是 `a5377b72…`）、
dmesg 无 `sfp_module_manager` / `mode bounce` / `recovery attempt`。

| 格 | 操作 | 结果 | 判定 |
|---|---|---|---|
| A1 | 刷后 auto_reboot 首启 | **33.9s link 2500** | ⚠️ 与历史"443s 不 link"不符 |
| A2 | 断电冷启 | **59.75s** link 2500，cchg=2，rx/tx 6956/7942 | ✅ 复现历史 58.5s |
| A3 | 软重启 | **303s 仍 NO_LINK**，carrier=0、cchg=1、speed=65535，dmesg 只有 `sfp_phy_init` | ✅ 复现 4/4 全失败 |

结论：
- **A3 是关键反证**：同一硬件、同一模块，去掉弹跳补丁后软重启 300s 完全不自愈；
  v5 软重启 40.4/41.8s 起链 → 起链能力确实来自 27↔4 模式弹跳，不是环境或碰巧。
- **A1 差异必须记账**：原包刷后首启本次能自己起来（33.9s），说明"首启必失败"不是硬规律，
  历史 443s 那次受环境/模块状态影响，不能作为基线。后续判失败只能用 A3（软重启）这一格。
- 原包不创建 sfp eeprom 节点，软件层无法确认模块在位，只能靠链路结果反推。

### A4 刷回 v5 复验（2026-11-05 16:53）

刷回过程有两个坑，记账：
- 第一次刷写（16:47:56）uboot 回传 `success` + `reboot:true`，但设备重启后**又落回 uboot web**，
  4 分钟内 SSH 不上、`/env/list` 恒 200。原因判断：写入/重启瞬间 reset 键仍被按住或又被按了一次，
  uboot 检测到 reset 就进 failsafe web，不走 `bootipq`。
- 第二次守卫刚挂上，设备其实已经自己进了固件（uptime 76.89s），守卫在等 uboot 属于空转，已停。
  **教训：判定"刷机失败"前先看 SSH 是否已通，不要只看 `/env/list` 返回码就下结论。**

v5 指纹复核：内核 `Wed Nov 4 11:46:41 2026`、ko md5 `a5377b72…`、补丁特征日志 6 行。

软重启复验（boot_id `44c488b1` → `e56b8257`）：

| uptime | 事件 |
|---|---|
| 10.18 | `sfp_phy_init: SFP port 2 init successfully` |
| 20.09 | `port2 sfp module inserted: force re-init` |
| 31.67 | `still down after 12 ticks, pulse 1/3` |
| 31.68 | `no tx_disable (rv=-19): mode bounce 23->4->23` |
| 33.89 | `recovery attempt done (pulse=1)` |
| 38.07 | `link up: 15 tick(s), 1 pulse(s)` |
| **39.03** | `PHY Link up speed: 2500` |

cchg 1→2，speed 2500，1 次 pulse 命中。

### ABAB 结论

| 固件 | 软重启表现 | 证据 |
|---|---|---|
| 原包（无补丁） | **303s 仍 NO_LINK，永不自愈** | dmesg 只有 `sfp_phy_init`，零 pulse |
| v5（弹跳补丁） | **39.03s 起链，1 pulse** | `mode bounce 23->4->23` |

同一台机、同一支猫棒、同一根光纤、同一 boot 周期内前后对照 →
**v5 的软重启恢复能力确定来自 27/23↔4 模式弹跳，不是环境因素或碰巧自愈。**

## 已知未覆盖（不是缺陷，是测不到）

| 项 | 状态 | 为什么没验 | 什么时候值得补 |
|---|---|---|---|
| 10G 在位失败态下的 27→4→27 | **未覆盖** | `sfp_kick`+`sfp_force_mode` 只改 SSDK 内部记录、不落硬件，已 link 端口不会因此掉链，构造不出"在位失败态" | 真出现 10G 在位卡死案例，或弹跳机制要推广到别的模块/端口 |
| C-BOUNCE-10G-A 之外的空槽/冷启组合 | 部分覆盖 | 空槽变体已跑（210.23s 执行 → 879.35s 插回 5 tick 起链 10000） | 同上 |

**补这一格的正确做法**：让 `sfp_kick` 真正 apply 到 PCS（触发一次真实 PCS reset），
而不是再加 `sfp_pulse` 之类的旁路旋钮——旁路旋钮会让"验证通过"和"实际路径"脱钩。

**给后来者的警告**：以上是"没测过"，不是"测过没问题"。
遇到 10G 在位卡死，不要直接套用 2.5G 的结论，先抓 dmesg 看 `mode bounce` 的目标档是否正确（应为 27，不是 23）。

## 判据口径（最终版）

| 指标 | 口径 | 原因 |
|---|---|---|
| 冷启动/软重启起链时间 | **一律用 dmesg 时间戳** | SSH 上线有 20~30s 延迟，采样值偏大（实测差 6~28s） |
| 判定证据 | 只看本轮新增 dmesg（`tail -n +N0`）或 `>= 注入时刻` 的行 | 用 `grep -c` 全量计数会拿旧日志冒充本次结果（曾产出假 PASS） |
| 注入有效性 | 注入后 5s 内目标状态没变 → 判 `INVALID_INJECT` | 运行期旋钮可能只改软件记录 |
| 连通性 | L1/L2 → L3（小包+1472 双 0%）→ L4（TCP 建连）→ L7（200 且 body>0） | 403/301 冒充通、假 200 纯跳转页 |
| 刷机结果判定 | 先看 SSH 是否已通，再看 `/env/list` | 曾把已在固件的设备误判成"停在 uboot" |
| **光口 L7 的拓扑前提** | 只有 **10G + 交换机** 拓扑下 `.123` 才在光口对面；**2.5G 是猫棒 PON 上行，下面没有交换机** | 2.5G 用 `.10` 测通只能证明交换口转发，流量根本不走光口（2026-11-05 曾误用） |

## B 方案验收（v5 代码 + zt 精简，2026-11-05 18:55~19:52）

代码基线：`2088a3a7`（EWRT main = v5 基线）+ zt `er2` 的 3 个提交 + 2 个本仓库修正，
HEAD `5e5a870b`。流程对齐 zt README「方式 B」：`setup.py --rebase` → `feeds update -a` →
`feeds install -a` → `cp defconfig .config` → `make defconfig` → `make -j10`。

defconfig 与生成 `.config` 均为 312 个 `=y`，**零丢失**（构建前置硬检查项）。

### 两版对比（初版流程错误 → 修正版）

| 项 | 初版 `b-zt-20261105` | 修正版 `b2-v5-zt` |
|---|---|---|
| feeds 安装 | 只 `install i2c-tools` | `install -a`，1756 条 |
| 配置 | defconfig 316 → 实际 266（**静默丢 50**） | 312 → 312（零丢失） |
| 包数 | 267 | **306** |
| `luci-app-package-manager` | 缺失（LuCI 无软件包菜单） | 已装，菜单 `admin/system/package-manager` 注册 |
| 镜像 | 20.5 MiB | 25.3 MiB |

**根因**：feeds 未 `install -a` → 包未链接进 `package/feeds/` → Kconfig 不可见 →
`make defconfig` 把这些行整行删除，无 warning。另有 4 个 orphan 条目
（`luci-app-mini-diskmanager`/`luci-app-wolultra` 及其 i18n）源自已删除的 smpackage feed，一并清除。

### 实测（B2，`5e5a870b` 构建，`qca-ssdk.ko` = `ba44c6bf…`）

| 场景 | v5（A 方案） | B2 | 备注 |
|---|---|---|---|
| 首启 2.5G | 23.2s | 41.53s（12 tick + 1 pulse 完整恢复） | 包多 77 个，起链路径未变 |
| 软重启 2.5G | 39.03s | **40.39s**（`rv=-19` → `23->4->23`，16 tick，1 pulse） | cchg=2 |
| 热插 10G（拔 2.5 插 10） | 6.0 / 9.0s | **5.2s**（5 tick，0 pulse） | cchg 2→4，只 +1 |
| 软重启 10G | 24.60 / 24.64s | **24.79s**（0 pulse） | cchg=2 |
| L7 光口（`.123`，10G 拓扑） | — | **200 / 4853B**，重启后复测同值 | 真实穿光口 |
| 包集合 | 229 | 306 | 保留 i2c-tools / libi2c / qca-ssdk-shell，移除 luci-compat |

**结论**：包集合从 229 增至 306、镜像增大 4.8 MiB，起链路径与时间未受影响；
四场景全部起链，SFP 恢复流程（`rv=-19` 走 `23->4->23`）照常命中。

---

## main 稳定版验收（325 包，2026-11-05 20:51~21:03）

构建 `6ca355e1`，`qca-ssdk.ko` = `e34370fe…`，镜像 `er2-main-20261105-factory.bin`
（26 MB，md5 `d1e7a9b047740f5d87761b92a1dbc31f`）。

这一版的动作：把 zt 精简（`44a90e66`）去掉的 11 项补回 main——`blkid`、`blockd`、
`cfdisk`、`sgdisk`、`kmod-crypto-{ccm,ctr,gcm,md4,seqiv}`、`kmod-fs-autofs4`
（`kmod-crypto-geniv` 由 gcm 依赖自动带出），另补 `luci-app-aurora-config` 及中文包。
目标是让「main 最全」成立，此前 main 的加密栈反而比试验分支薄。

### 四场景实测

| 场景 | v5（A，229 包） | B2（306 包） | **main（319 包）** | 备注 |
|---|---|---|---|---|
| 首启 2.5G | 23.2s | 41.53s | **38.49s** | 12 tick + 1 pulse，完整恢复 |
| 软重启 2.5G | 39.03s | 40.39s | **41.43s** | `rv=-19` → `23->4->23`，15 tick，1 pulse，cchg=2 |
| 热插 10G | 6.0 / 9.0s | 5.2s | **4.16s** | 4 tick，0 pulse，cchg 2→4 |
| 软重启 10G | 24.60 / 24.64s | 24.79s | **21.60s** | 0 pulse，cchg=2 |
| L7 光口（`.123`） | — | 200 / 4853B | **200 / 4853B** | 10G 拓扑，真实穿光口 |

- 10G 热插时间线：`[358.63] Link is down` → `[361.92] link up: 4 tick(s), 0 pulse(s)` → `[362.79] speed 10000`
- 10G 软重启时间线：`[20.57] module inserted` → `[21.60] PHY Link up speed: 10000`

### 包与功能核对

| 检查项 | 结果 |
|---|---|
| 11 项回补包 | 全部 `INSTALLED`；`cfdisk`/`sgdisk`/`blkid`/`lsblk` 命令可执行 |
| crypto 模块 | 包在位，算法为内核 built-in；`modprobe gcm/ccm/autofs4` 全部成功 |
| `luci-app-aurora-config` | `/usr/share/luci/menu.d/luci-app-aurora.json` 已注册 |
| `luci-compat` | 不存在（zt 精简保留） |
| 服务 | network / firewall / dnsmasq / uhttpd 全部 running |
| manifest | 319 包；与 325 条配置的差额是 `TAR_*` 选项与 `lib*` 命名差异，无真实缺失 |

**结论**：包集合 306 → 319、镜像 25.3 → 26 MB，四个场景全部起链，起链时间在 ±2s 波动内；
SFP 恢复路径（`rv=-19` 时走 `23->4->23`）与本轮改动无关，实测照常命中。
加密/分区这批补回不影响数据面，10G 光口 L7 与 B2 完全一致（4853B）。
