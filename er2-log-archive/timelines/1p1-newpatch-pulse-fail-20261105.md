# 1.1 新固件光口日志分析：power_pulse 补丁失效（2026-11-05 04:51 抓取）

**设备**：root@192.168.1.1，OpenWrt 25.12.5 r33051-f5dae5ece4，内核 6.6.88 编译于 `Wed Nov 4 11:46:39 2026`
**抓取时状态**：uptime 5min，eth0 = carrier 0 / down / speed 65535 / carrier_changes 1
**模块**：2.5G 猫棒在位，`ssdk_sh sfp RateEncode get 2` → `[encode]:0x3 [nominal_bit_rate]:0x20`
**原始日志**：`er2-log-archive/by-firmware/1p1-sfp-20261105-0451/`（01_dmesg_full.txt 289 行 / 03_logread_full.txt 425 行 / 05_state.txt）

---

## 一、结论

**新加的 `adpt_hppe_sfp_module_manager` 补丁（sfp-patch/mgr_snippet.c）已上机并触发，但两次"模拟断电"都在第一步失败，兜底完全没生效。**
失败原因：`rv=-19 = SW_NOT_SUPPORTED`，因为这版 DTS 的 SFP port 节点**没有 `sfp_tx_dis_pin` 属性**，SSDK 把该 GPIO 判为 `SSDK_INVALID_GPIO`，`sfp_phy_tx_dis_status_set()` 直接返回，TX_DISABLE 从未拉高、3000ms hold 从未执行、MAC reset 从未调用。

补丁逻辑在 101.9s 用完 `SFP_MGR_PULSE_MAX=2` 后不再重试，光口此后不会再自愈（实测到 5min 仍 down）。

## 二、证据

**1) 日志时间线（01_dmesg_full.txt 第 222/283/284-289 行）**
```
[ 10.160566] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 10.160623] ssdk_dt_parse_interrupt[1056]:INFO:link-intr-gpio is not defined, link polling is enabled
[ 19.610560] adpt_hppe_sfp_module_manager[4122]:INFO:port2 sfp module inserted: force re-init
[ 60.310385] adpt_hppe_sfp_module_manager[4158]:INFO:port2 sfp still down after 40 ticks, pulse 1/2
[ 60.310427] adpt_hppe_sfp_power_pulse[4081]:INFO:port2 sfp power-cycle simulation: TX_DISABLE hold 3000ms
[ 60.318237] adpt_hppe_sfp_power_pulse[4086]:ERROR:port2 sfp TX_DISABLE assert failed rv=-19
[101.910393] ... pulse 2/2
[101.918245] ... ERROR:port2 sfp TX_DISABLE assert failed rv=-19
```
全程无 `PHY Link up`、无 `power-cycle simulation done`、无 `sfp link up`。

**2) `-19` 的定义（NAS 源码实测）**
`.../qca-ssdk-qca-1.0/include/common/sw_error.h:44`
`SW_NOT_SUPPORTED = -19,  /* This request is not support */`

**3) 返回点（D:\Work\Claw\ssdk-src\sfp_phy.c:952-955）**
```c
tx_dis_pin = priv->ports[port_id].sfp_tx_dis_pin;
if(qca_ssdk_gpio_is_invalid(dev_id, tx_dis_pin))
    return SW_NOT_SUPPORTED;
```
日志里没有 `tx_dis_pin request failed` / `configure faied`，说明**不是 gpio_request 失败，是无效 GPIO 分支**。

**4) GPIO 为什么无效（设备树实测）**
`ssdk_dts.c:876-884`：`of_get_named_gpio(port_node, "sfp_tx_dis_pin", 0)`，取不到就赋值 `SSDK_INVALID_GPIO`（`ssdk_plat.h:173` = 0x10000）。
设备上实测：`qcom,port_phyinfo` 下唯一 `media-type=sfp` 的节点 `ess-switch@3a000000/port@1` 属性只有
`media-type name phy_address port_id`；**全设备树无任何 `sfp*` 属性文件**。
现有 `pinctrl@1000000/sfp-state/sfp_tx_disable`（pins=gpio34, output-low）只是引脚复用/初始电平配置，**不是** SSDK 读取的 `sfp_tx_dis_pin` 属性。

**5) 第三方 DTS 给出正确写法（本地实测对照）**
`backup/taiyi/qwrt_1_off0x55b7b8.dts:625-626`
```
sfp_rx_los_pin = <0x0a 0x2d 0x00>;   /* 0x2d=45 → gpio45 RX_LOS */
sfp_tx_dis_pin = <0x0a 0x22 0x00>;   /* 0x22=34 → gpio34 TX_DISABLE */
```
与设备实测 gpio 号一致：`gpio34 : out low func0`、`gpio45 : in high func5`（RX_LOS=1，模块未发光）。

**6) GPIO 现状（05_state.txt）**
`gpio34 out low`（主机未关光）、`gpio45 in high`（LOS=1）→ 与历史 v3-b debug 现象一致，模块在位但没发光。

## 三、影响 / 风险

1. **本版补丁等于没打**：新逻辑成功编译、成功注册、成功计时，但所有恢复动作被一个 DTS 属性卡死。
2. **tick 周期与代码注释不符（实测）**：`mgr_snippet.c:13-14` 注释写 40 ticks ≈ 80s、80 ticks ≈ 160s；实测 19.61→60.31 = 40.7s、60.31→101.91 = 41.6s，**实际约 1s/tick，注释快了一倍**。
3. **`SFP_MGR_RETRY_TICKS=80` 永远不会命中**：`mgr_snippet.c:125` 每次 pulse 后 `sfp_mgr_down = 0`，所以第二次仍在 down==40 触发；日志 "still down after 40 ticks" 是写死 `SFP_MGR_BOOT_TICKS` 宏，掩盖了真实计数值。
4. **额外发现（未改动）**：`no usable overlay filesystem found, using tmpfs overlay` + `mount_root: failed - mount -t jffs2 /dev/loop0 /rom/overlay: Invalid argument` → 配置不落盘，符合基线二特性；`GPT:partition_entry_array_crc32 values don't match` 为警告，非致命。
5. **观测注意**：设备时钟 11:46 与本地 04:51 相差约 7 小时且 `dnsmasq: no servers found`（NTP 未同步），跨设备对齐时间不能直接比墙钟，只能比 uptime / 内核秒。

## 四、下一步（单变量，优先 1）

1. **补 DTS 属性**：在 `ess-switch@3a000000/qcom,port_phyinfo/port@1`（media-type=sfp 那个）加
   `sfp_tx_dis_pin = <&tlmm 34 0>;` 与 `sfp_rx_los_pin = <&tlmm 45 0>;`（按本仓库 phandle 实际写法），重编重刷 → 验证 `TX_DISABLE assert` 是否成功、pulse 后是否 link。
2. 同步修 `mgr_snippet.c`：pulse 后不要清零 `sfp_mgr_down`（或改用独立的 elapsed 计数），并修正 tick 注释为 1s，让 `RETRY_TICKS` 真正生效。
3. 若补属性后仍不 link，再单独查"模块自己不发光"（LOS=1）这一层，与 TX_DISABLE 无关。

**状态**：结论 1-6 均为实测/源码实锤；DTS 修改方案为**待验证**（未编译、未上机）。
