# ER2 整机日志归档

## 目录结构

```
er2-log-archive/
├── INDEX.md                  段清单（固件 / 时间 / 行数 / 内核秒范围）
├── COMPARE-v2-vs-v3.md       两版对比入口 ← 要对比先看这个
├── README.md                 本文件
├── by-firmware/              按固件版本分组，每段一份完整整机日志
│   ├── v2a-stock-16M/        基线二原版 + log_buf_len=16M
│   ├── v3b-debug/            基线三 debug（SSDK DEBUG 全开）
│   └── v2a-debug/            基线二 debug（刷入后补）
├── merged/                   每固件一份合并卷，便于整体 grep
└── timelines/
    ├── boot-milestones.md    每段启动/链路关键节点
    └── sfp-events.md         每段光口事件（>200 条自动转指纹统计表）
```

## 命名规则（重要）

`<序号>_<抓取时刻HHMM>_<段类型>.txt`

- `01_1155_boot1.txt` = 第 1 个文件，11:55 抓取，该源的第 1 次启动
- `boot1/boot2` 是**同一源文件内的第几次启动**，与“基线一/二/三”无关
- 旧归档用 `-b1/-b2` 后缀，极易被误读成基线编号，已废弃

## 每段文件内容

头部 4 行注释（固件、抓取时刻、说明、行数/秒范围），之后是统一格式的整机日志：

```
[   12.345678] 消息原文
```

来自 `/dev/kmsg` 的时间戳已换算成秒；来自 `dmesg` 的直接取原秒数。
**不做任何 grep 过滤**，整机全量。

## 新增一段

```bash
bash D:/Work/Claw/pull-er2-full.sh v2a-debug boot1     # 从设备拉取
python D:/Work/Claw/import-er2-dump.py <raw> v2a-debug boot1
python D:/Work/Claw/rebuild-archive.py                  # 重建（保留本文件与 COMPARE）
```

## 重建脚本

`D:\Work\Claw\rebuild-archive.py` 里有源文件清单 `SRC`，
新增历史源文件时在 `SRC` 里加一行（文件, 抓取时刻, 固件标签, 备注）。
