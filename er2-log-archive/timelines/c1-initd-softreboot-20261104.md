# C1：开机自启采样器 + 软重启（warm reset）实测

- 固件：v2-a 原包 + overlay 上增加的 `/etc/init.d/sfp-detect`（只读观测，不改任何配置）
- 时间：2026-11-04 22:20 左右触发 reboot
- boot_id：47ae8068
- 场景：已 link 2500 状态下软重启（reboot，非断电）

## 一、脚本部署方式

- `/usr/sbin/sfp-detect.sh`：采样器，30 轮，每轮采样 + 重试读 EEPROM，间隔 3s
- `/etc/init.d/sfp-detect`：START=99，已在 `/etc/rc.d/S99sfp-detect` 启用
- 单实例保护：`/var/run/sfp-detect.pid`；临时文件 `/tmp/.sfpre.$$`
- 输出：`/root/sfp-detect/boot-<boot_id>.log`、`/tmp/sfp-type`、syslog（仅状态变化）

部署在 overlay 上（`/dev/mmcblk0p24` ext4），不改固件即可测试；正式定档时再放进 `files/` 编入。

## 二、软重启结果

采样区间 up=17.30 ~ 137.98，共 30 轮：

- `enc=0x3 br=0x20 type=2.5g-stick` **30 轮全部一致，tries 全部=1（一次成功）**
- `carrier=0 oper=down speed=65535 cchg=1` **30 轮全部不变**
- dmesg 只有 `[9.666539] sfp_phy_init[718]:INFO:SFP port 2 init successfully`，无任何 Link up

补充观察：启动后持续采样到 uptime 188s 仍 `carrier=0/down/65535`（外部探测）。

## 三、结论

1. **warm reset 是第 5 次连续失败**（此前 174s、209s、209s、280s 均失败），无自愈。
2. **识别与 link 完全解耦**：软重启后 17 秒就能稳定读到 0x20，30 次连读零失败，但 link 一次都没有。说明"模块在位与类型"这个信息随时可用，不依赖 link 状态，也不依赖这次 warm reset 是否成功。
3. **链接口错误修正**：拉取日志时不能用 `ls -t` 选文件——设备时钟在重启时会跳变（本次日志 mtime 12:16 早于上一份 12:17），必须按 `/proc/sys/kernel/random/boot_id` 精确定位 `boot-<id>.log`。

## 四、下一步（C2，需要断电）

软重启场景下模块未断电，EEPROM 一直可访问，不能回答"冷启动时模块上电后多久才可读"这个关键问题。而它直接决定"开机按模块类型选协议"是否来得及（SFP 初始化发生在 uptime 9.5s）。

因此 C2 必须做一次真正的断电冷启动，看 `boot-<id>.log` 里：
- 首次读到 0x20 的 uptime 是多少（决定判类型的时间窗口）
- 中间 noresp 持续了多少轮（决定重试次数与超时）
- link 建立的 uptime（已知约 58s）
