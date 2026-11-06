# kernel-debug — NVMe/PCIe 排查用的带诊断打印的内核文件

这两个文件不是默认编译内容，只在排查 PCIe 链路问题时临时替换进内核源码树，
用完请还原。归档在这里是为了下次不用从零重写。

| 文件 | 对应内核路径 | 加了什么 |
|---|---|---|
| `phy-qca-pcie-uniphy.c` | `drivers/phy/qualcomm/phy-qca-pcie-uniphy.c` | `ER2PHY` 系列：mux 结果、四路时钟 enable 返回值与频率、PHY 寄存器在 pre-init / post-init / post-2ms 三个时点的 dump |
| `pcie-designware.c` | `drivers/pci/controller/dwc/pcie-designware.c` | 链路等待超时时打印 LTSSM 状态：`Phy link never came up (LTSSM=0x? dbg0=… dbg1=…)` |

## 用法

```bash
# 1. 先编译一次，让内核源码树解出来
cd openwrt && make -j$(nproc)

# 2. 覆盖这两个文件
B=build_dir/target-aarch64_cortex-a53_musl/linux-ipq53xx_generic/linux-6.6.88
cp ../kernel-debug/phy-qca-pcie-uniphy.c   $B/drivers/phy/qualcomm/
cp ../kernel-debug/pcie-designware.c       $B/drivers/pci/controller/dwc/

# 3. 重编（改动在内核本体，必须走 factory.bin 刷写才会生效）
make -j$(nproc)
```

打印走 `dev_err` 级别，bootargs 是 `loglevel=3` 时也能直接出现在串口上。

## LTSSM 取值速查

| 值 | 状态 | 含义 |
|---|---|---|
| `0x0` | DETECT_QUIET | 发送端还没启动 |
| `0x1` `0x2` | POLLING_ACTIVE | 已在发送，等对端 TS1/TS2 |
| `0x3` | POLLING_COMPLIANCE | 24ms 内收不到对端训练序列，落进兜底状态（ER2 当前卡在这里） |
| `0x4`~`0x9` | CONFIG_* | 已握手，在谈宽度/速率 |
| `0x11` | L0 | 链路建立成功 |

## 注意

- 内核改动只有 `factory.bin` 能带进去，`sysupgrade.bin` 只写 rootfs
- 未改动的原始文件请从上游 `openwrt-25.12` 树或重新 `make target/linux/prepare` 取回
