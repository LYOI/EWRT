# ER2 整机日志归档索引

按**固件版本**分组。`boot1/boot2` 是同一固件下的第几次启动，**不是基线编号**（这点务必注意，旧命名 `-b1/-b2` 极易误读）。

| 固件 | 文件 | 抓取时刻 | 行数 | 内核秒 | 说明 |
|---|---|---|---|---|---|
| v2a-stock-16M | `v2a-stock-16M/01_1155_boot1.txt` | 11:55:27 | 292 | 0.0 → 104.2 | 刷回原版后首次冷启动 ｜ 源 er2-v2a-base-flash-capture-1155.txt |
| v2a-stock-16M | `v2a-stock-16M/02_1225_boot1.txt` | 12:25:00 | 291 | 0.0 → 58.5 | 第二次启动 ｜ 源 er2-dmesg-full-1221.txt |
| v2a-stock-16M | `v2a-stock-16M/03_1229_watch-1229.txt` | 12:29:56 | 602 | 0.0 → 801.0 | 在位监测（插拔 2.5G/10G + 重启）｜源 sfp-watch/timeline.log |
| v3b-debug | `v3b-debug/01_0852_boot1.txt` | 08:52:37 | 1880 | 180.2 → 363.5 | 16M 未生效期（128KB 缓冲） ｜ 源 er2-reboot-capture-0852-keep.txt |
| v3b-debug | `v3b-debug/02_0903_boot1.txt` | 09:03:07 | 1488 | 811.2 → 959.5 | 16M 未生效期（128KB 缓冲） ｜ 源 er2-powercycle-capture-0903-keep.txt |
| v3b-debug | `v3b-debug/03_0903_boot2.txt` | 09:03:07 | 2417 | 14.5 → 124.8 | 16M 未生效期（128KB 缓冲） ｜ 源 er2-powercycle-capture-0903-keep.txt |
| v3b-debug | `v3b-debug/04_0903_boot3.txt` | 09:03:07 | 2354 | 14.6 → 117.9 | 16M 未生效期（128KB 缓冲） ｜ 源 er2-powercycle-capture-0903-keep.txt |
| v3b-debug | `v3b-debug/05_0921_boot1.txt` | 09:21:27 | 2304 | 784.2 → 1010.9 | 16M 生效后 ｜ 源 er2-boot-live.txt |
| v3b-debug | `v3b-debug/06_0921_boot2.txt` | 09:21:27 | 7423 | 0.0 → 527.3 | 16M 生效后 ｜ 源 er2-boot-live.txt |
| v2a-debug | `v2a-debug/01_1135_SKIP-er2-v2a-flash-capture-1135.txt` | 11:35:52 | - | - | 第一版带 S01 钩子，启动失败，无内核日志 |
| v2a-debug | `v2a-debug/02_1308_boot1.txt` | 13:08:08 | 4605 | 0.0 → 282.1 | pull-er2-full 抓取（boot1-130808） ｜ 源 er2-dump-v2a-debug-boot1-130808.txt |

## 合并卷

- `merged/v2a-stock-16M.merged.txt`（1194 行）
- `merged/v3b-debug.merged.txt`（17881 行）
- `merged/v2a-debug.merged.txt`（4610 行）

## 其它

- `timelines/boot-milestones.md` 启动/链路里程碑
- `timelines/sfp-events.md` 光口事件（密集段自动转指纹统计）
- `COMPARE-v2-vs-v3.md` 两版对比入口
