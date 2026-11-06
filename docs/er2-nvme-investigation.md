# ER2 M.2 NVMe 不识别 — 排查记录（2026-11-06 / 07）

> 状态：**未解决**。已把范围压缩到 PHY 之外的初始化层，下一步入口明确。
> 本文所有结论都标注了证据来源；没有本机实测支撑的一律写"未复测"。

## 一、现象

M.2 槽插 UMIS RPJTJ128MED1MWX（128G NVMe）后，系统看不到 `/dev/nvme*`，串口只报：

```
qcom-pcie 18000000.pcie: Phy link never came up
```

## 二、环境

| 项 | 值 |
|---|---|
| 我们的固件 | 内核 6.6.88，QSDK 侧标识 `NHSS.QSDK.12.4.5`（wlan-telemetry 包的 PKG_BRANCH） |
| 参照固件 | 开荒 QWRT 21.02、QWRT R26.09.25、39wrt ImmortalWrt —— **三份全是 5.4.213** |
| 控制器 | `qcom-pcie 18000000.pcie`（pcie1，2 lane，PERST 在 GPIO47） |
| 驱动 | `qti,pcie-ipq5332` → `cfg_1_27_0`；PHY 为 `qca-uni-pcie-phy`（`phy_x2@4b1000`） |

## 三、结论摘要

链路训练停在 **LTSSM = 0x3（POLLING_COMPLIANCE）**：

```
Phy link never came up (LTSSM=0x3 L0=0x11 dbg0=00b5bc43 dbg1=08100000)
```

含义：我方发送侧已工作（LTSSM 从 DETECT 走到 POLLING），但 24ms 内没收到对端连续
8 个 TS1/TS2，于是落进 compliance 兜底。**不是速率协商、不是宽度协商**。

## 四、已排除项（全部本机实测）

| 项 | 证据 |
|---|---|
| 硬件与盘 | 开荒固件把盘枚举在 `0001:01:00.0`，`LnkSta: Speed 8GT/s, Width x2` → 硬件通路完好 |
| 槽位控制器 | 开荒枚举在 bus 0001 = pcie1，与我们启用的是同一条 |
| PERST | 运行态 `gpio47 : out high`，复位已释放 |
| 四路时钟 | `ER2PHY` 日志：pipe 250MHz / lane_m 266.67MHz / lane_s 240MHz / ahb 100MHz 全部 enable 成功，与开荒 `clk_summary` 实测值一致 |
| PHY 初始化 | 3 个寄存器（0x220=0x30、0x3e4=0x53ef、0x3e8=0xcf）写入读回正确；反汇编开荒 5.4 证实序列与此**完全一致**（见六） |
| lane 数 | 开荒 `LnkSta Width x2`，故 `num-lanes = <2>` 正确 |
| 速率 | 强制 `max-link-speed = <1>` 结果不变（LTSSM 仍 0x3） |
| pcie0 | 打开后 probe 起不来（反复 `Early Cal not supported`，无 `PCI host bridge to bus 0000:00`）；M.2 不在 pcie0 |
| PHY mux 属性 | 删掉 `qti,phy-mux-regs` 结果不变（`mux=2LANE ret=-2`）；恢复后结果亦不变 |
| pcie1 pinctrl | 去掉 pinctrl 结果不变（`dbg0` 一字不差） |
| 链路宽度/速率预置 | 按厂商写法补 `0x710` / `0x80c` / `0xb20`，写入生效（`plcr=0x00030120 lwsc=0x00130290`）但链路仍不 up |
| `0x8bc` bit0 | 补上后 `r8bc=0x0005bf41`（bit0 已置），链路仍不 up |

> 注：`Failed to find NVMEM device` 这条**不是 PCIe 报错**，是 `fw_printenv` 的输出。

## 五、实测寄存器基线

**PHY 窗口**（`0x4b1000`，uboot 默认值 = Linux pre-init 值，两者完全相同）：

```
004b1000: 00008020 00000020 00000760 0000f00b
004b1010: 0000a802 00000002 00000000 00008000
004b1020: 00004280 00008850 00006855 00006920
004b1030: 00000128 00000000 00000000 00001001
```

**我们写入后的控制器侧**：

```
ER2LINK lanes=2 plcr=0x00030120 lwsc=0x00130290 r8bc=0x0005bf41
```

## 六、5.4 反汇编结果（开荒内核）

开荒 factory.bin → FIT `kernel@1`（gzip）→ 12,175,368 字节 raw aarch64 → objdump 125MB。

| 地址 | 内容 |
|---|---|
| `0x803e5330` | PHY `power_on`：assert 三个 reset → usleep(100,150) → deassert 三个 → `clk_set_rate(pipe,250MHz)` → usleep(5000,5100) → 依次 enable 四路时钟 → usleep(30,50) → init |
| `0x803e5404`~`803e5478` | PHY `init`：gen3 分支只写 `0x220/0x3e4/0x3e8`，`x1 += 0x800` 循环到 `0x1000`（两 lane）——**与我们完全一致，故不是漏写寄存器** |
| `0x8041c0a8` | 链路配置：`0x710` 宽度位图（x1=0x10000/x2=0x30000/x4=0x70000/x8=0xf0000）、`0x80c` 宽度 one-hot（x2=0x200）、`0xb20 \|= 3`，末尾调用 `0x8041cdd0` |
| `0x8041e548` | 调用者：先 `0x8bc \|= 1`，再 `bl 0x8041c0a8` |
| `0x8041cdd0` | 宽度配置之后被调用，**内部尚未读**（下次入口） |
| `0x8041bf68` | link_up 检查；`0x8041c000` 起为 10 次 × 90~100ms 的重试循环 |

## 七、参考板对照（MI01.2，IPQ5332，5.4.213）

文档：`openwrt-doc.readthedocs.io` → IPQ5322 → IPQ5322 参考板信息

```
qcom-pcie 18000000.pcie: Link up
pci 0001:01:00.0: [17cb:1109] class 0x028000      ← QCN9224 无线，板载
qcom-pcie 20000000.pcie: Phy link never came up. PARF_LTSSM: 0x100
```

两个要点：

1. 厂商驱动失败时**打印 `PARF_LTSSM`**（值 `0x100`），我们打印的是 `PCIE_PORT_DEBUG0/1`
2. 18000000 在参考板上能 link，但挂的是**板载 WiFi**（自带时钟、无 PERST 问题）。
   公开资料里没有"18000000 上跑外插 M.2 NVMe"的成功案例

## 八、下一步（按性价比）

1. **读 `PARF_LTSSM`**：把厂商那个寄存器加进诊断输出，与 `0x100` 对比；我们现在只有
   `PCIE_PORT_DEBUG0/1`
2. **继续反汇编 `0x8041cdd0`** 和 PARF 初始化段（厂商 init 里对 PARF 有专门配置，
   我们这套只用了 `PARF_LTSSM` 与中断）——这是当前最可疑的缺口
3. **硬件验证**（软件已到头）：示波器看 M.2 槽 100MHz 差分参考时钟是否真的存在、
   PERST 波形时序；换一张已知良好的盘试
4. **找 QSDK 12.x（6.6 内核）的 ipq53xx 内核源码**。已确认公开渠道拿不到：
   - `github.com/zhoufuli/qsdk12.5`：构建树镜像，`qca/src`、`target/linux` 均为空
   - CodeLinaro `NHSS.QSDK.12.0.*`：4.4.60 老线，非 AP 内核

## 九、复现与工具

- 诊断内核文件归档在仓库 `kernel-debug/`（`phy-qca-pcie-uniphy.c`、`pcie-designware.c`）
- 链路配置实验代码：`drivers/pci/controller/dwc/pcie-qcom.c` 的
  `er2_program_link_cfg()`（调用点在 `qcom_pcie_start_link()`）
- 取内核：`python3 fit_extract_kernel.py <factory.bin> out.img`
- 读 PHY 寄存器：uboot 里 `md 0x4b1000 10`（**不要读 0x4b1200，会复位**）
- 当前板子状态：刷的是 QWRT R26.09.25（NVMe 能认、猫棒不认），**需要时刷回
  `EWRT-ER2-8bc-20261107-0030-factory.bin`**
