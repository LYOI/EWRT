# v5 (a187820f) SFP 2500BASE-X 模式弹跳恢复验证

镜像: EWRT-ER2-v2a log0 系列后续，v5 factory md5 a187820f8c5a82493d7ef3ffb0de0ac4
归档目录: /d/Work/Claw/er2-log-archive/by-firmware/v5-bounce-20261105-143921

> **更正（2026-11-07 11:52）**：下文"冷启动 22.97s"**未被复现**。同一镜像
> （md5 一致，已校验）重刷后冷启动实测 **57.29s link up**，串口完整序列为
> `[10.13] SFP init → [19.65] module inserted → [31.13] 12 tick tick 触发 pulse
> → [33.35] pulse done → [57.29] link up`，与当日其他 4 个版本（56.9~57.3s）一致。
> 因此 22.97s 应视为**单次观测/偶发**（推测当时模块处于温热或已初始化状态，
> 模式一次应用成功），不作为该版本的性能属性。归档：`v5-20261107-114955`。
> 另：软件侧三条路径（pulse 时机 3/12/22 tick、HOLD_MS、模式滞回窗口）均已试，
> 均不改变 ~57s 的结果。

## 结论
- 冷启动（factory 刷写后）：uptime 22.97s PHY Link up 2500，未触发恢复动作
- 软重启 #1：12 tick 触发 mode bounce 23->4->23，39.43s link up 2500
- 软重启 #2：12 tick 触发 mode bounce 23->4->23，40.79s link up 2500
- 三轮 carrier_changes 均冻结在 2，180s 窗口内无抖动

## 根因（实测）
软重启后接口模式本来就是 23 (2500BASE-X)，sfp_phy_interface_get_mode_status 返回 rv=0，
但模块 phy 侧 link=0 / an=0：同模式重复 apply 是空操作，PCS 不会重新做线路编码。
强制换到 4 (SGMII) 再回 23 可在 1s 内起链路，且长期稳定。
原 0901 的 TX_DISABLE 兜底因 ER2 DTS 无 sfp_tx_dis_pin 恒返回 -19，实际从未执行。

## 关键日志（warm1）
    [   20.41] port2 sfp module inserted: force re-init
    [   31.99] port2 sfp still down after 12 ticks, pulse 1/3
    [   31.99] port2 sfp no tx_disable (rv=-19): mode bounce 23->4->23
    [   34.21] port2 sfp recovery attempt done (pulse=1)
    [   39.43] port2 sfp link up: 16 tick(s), 1 pulse(s)
    [   40.39] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
