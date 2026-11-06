# 自报 1G 的 SFP 猫棒（如华为 MA5671A 类）兼容方案 — 设计思路

状态：**方案已设计，未实现**。等实际模块上手实测后再决定是否落地。

## 问题

部分 SFP ONU 猫棒（华为 MA5671A 一类）在 EEPROM 里把自己标成 **1000BASE-X**，
但实际链路有时需要 2500BASE-X 的线路编码才能训练起来。

当前 `0901-sfp-module-manager.patch` 的选模式逻辑是「信模块自己的 EEPROM」：

- `sfp_phy_interface_get_mode_status()` 读模块能力 → 算出 `calc`
- `calc` 通常就是从 EEPROM 解出来的速率档

所以模块报 1G，`calc` 就是 1000BASE-X，管理器照着切过去。两种结果：

| 情况 | 表现 | 判定 |
|---|---|---|
| A. 模块真的只有 1G 能力 | 链路以 1000 建立，`PHY Link up speed: 1000` | 正常，非缺陷；光口跑 1G，数据面照常转发 |
| B. 模块自报 1G 但需要 2.5G 编码（刷过第三方固件） | 永远 `link=0`，三轮 pulse 后放弃 | 需要人工/配置覆盖 |

注意：管理器现有的恢复逻辑**救不了 B**。它会 bounce `4 ↔ 23`
（SGMII_BASET ↔ 2500BASE-X）再回到目标档，如果目标是 1000BASE-X，
回到的仍是错误档位——它不会主动「猜」更高的速率。

## 方案：持久化的模式覆盖（prefer_mode）

目标是让「自报 1G、实际 2.5G」的模块也能开箱即用，且**重启后仍然生效**。
现状问题：`sfp_force_mode` + `sfp_kick` 是**一次性**的，重启即丢，只能 bring-up 用。

### 设计

1. **配置入口**：`/etc/config/sfp`（uci），字段 `port2_mode`（可选值 `auto` / `2500base-x` / `10gbase-r` / `1000base-x`）。
2. **开机生效**：uci-defaults 脚本生成 `/etc/modprobe.d/qca-ssdk.conf`：
   ```
   options qca_ssdk sfp_prefer_mode=23
   ```
   挂载模块时即带参数，不依赖任何服务先起来（当前 rootfs 是 squashfs + tmpfs overlay，
   这条路径本身也不依赖持久化 overlay，写在 uci-defaults 里每次首启重建）。
3. **管理器行为**：新增模块参数 `sfp_prefer_mode`（默认 -1 = 关闭）。
   `sfp_prefer_mode >= 0` 时，**用它覆盖 `calc`** 参与目标档决策：
   - 仍保留「实时读模块类型」的能力作为 fallback（覆盖档连续 N tick 不 link，
     可回落 auto，避免覆盖值本身错了导致彻底起不来）；
   - 状态变化仍按 INFO 打印，日志里能看出「用的是覆盖档还是 auto 档」。

### 为什么不直接写进 DT

- DT 的 `port@1` 模式是板级固定值，改它要重编 DTB，且对「换模块」场景不灵活；
- 覆盖应该跟着**模块**而不是跟着**板子**，所以放在运行期配置里更合适。

## 验证步骤（拿到华为棒后）

1. 插上棒子，开 `sfp_dbg=1`，抓一行诊断：
   ```
   port2 diag t=..: dt=? cur=? calc=? rv=? link=0 spd=?
   ```
   - `calc` 若是 1000BASE-X 档位 → 属情况 B 的可能性大；
2. 手动覆盖试一次：
   ```sh
   echo 23 > /sys/module/qca_ssdk/parameters/sfp_force_mode
   echo 1  > /sys/module/qca_ssdk/parameters/sfp_kick
   dmesg | grep -E "sfp|Link up"
   ```
   - 几秒内 `PHY Link up speed: 2500` → 确认是 B，值得做持久化覆盖；
   - 仍然 down 或只能 1000 → 是 A，模块能力就这样，覆盖没有意义；
3. 若确认 B，再实现上面的 `sfp_prefer_mode` + uci 配置，重编验证冷启动/软重启/热插拔三种场景。

## 边界

- 只影响**主机侧接口模式选择**，不改变模块自身能力；模块硬件只支持 1G 时，
  覆盖到 2500BASE-X 只会让它更上不了链。
- 覆盖值错误的代价：需要人工介入或等 fallback 回落，所以 fallback 机制必须一起做。
