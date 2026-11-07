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
4. **刷同代第三方固件做 A/B**（比继续猜寄存器更省事）：
   - `VIKINGYFY` 那份是 **6.18.55**（主线系，`compatible = "qcom,pcie-ipq5332",
     "qcom,pcie-ipq9574"`，`num-lanes = <2>`，**不给 `perst-gpios`**）——最干净的
     同代参照，优先试
   - `jiang` 那份是 **6.6.47**（同代，DT 写法与我们一致，带 `perst-gpios`）
   - 两份都是 6.x，能区分"主线路径能不能跑"和"厂商私有初始化是否有害"
5. **找 QSDK 12.x（6.6 内核）的 ipq53xx 内核源码**。已确认公开渠道拿不到：
   - `github.com/zhoufuli/qsdk12.5`：构建树镜像，`qca/src`、`target/linux` 均为空
   - CodeLinaro `NHSS.QSDK.12.0.*`：4.4.60 老线，非 AP 内核

## 八点六、QSDK 内核源码仓库与驱动逐项对比（2026-11-07）

**仓库**：<https://git.codelinaro.org/clo/qsdk/oss/kernel> 下有完整的 IPQ 内核源码树，
匿名可读（GitLab API 可用，无需账号）：

| 子项目 | 项目 ID | 用途 |
|---|---|---|
| `linux-ipq-6.6` | 60352 | **我们在用的 6.6 内核来源**，分支 `win.linux.6.6.r23`~`r39` |
| `linux-ipq-5.4` | 29162 | 5.4 树，分支 `NHSS.QSDK.12.4.r1`~`r5`（能认盘的那一代） |

> 注意：这个仓库只有内核本体，**QCA 的 PCIe PHY 驱动与板级 DTS 不在其中**
> （在 OpenWrt target 的补丁里，我们已有）。

### 对比结果（6.6 的 `cfg_1_27_0` vs 5.4 的 `ops_2_9_0_ipq5332`）

| 项 | 结论 |
|---|---|
| `phy-qca-pcie-uniphy.c` | **功能完全一致**，仅大括号风格差异（380 vs 381 行） |
| 控制器 `post_init` | **等价**：`PARF_PHY_CTRL` / `DBI_BASE_ADDR` / `DEVICE_TYPE` / `MHI_CLOCK_RESET_CTRL` / `PARF_SYS_CTRL` / `Q2A_FLUSH` / `GEN3_RELATED_OFF` 全都有 |
| 控制器 `init`（复位+时钟） | 等价；DT 里 `assigned-clock-rates` 已固定 aux=2MHz、axi_m=266.67MHz、axi_s/bridge=240MHz、rchng=100MHz，与 5.4 固件实测值一致 |
| 设备树节点 | 等价：`reg-names` 含 `system_noc`、`axi-halt-val=0x1e`、`slv-addr-space-sz`、`cal-status-offset` 均在 |

### 一次失败的实验（含方法教训）

对比时按厂商宏名（`PCIE30_GEN3_RELATED_OFF` / `RXEQ_RGRDLESS_RXTS`）grep 本树，
得到"6.6 缺少 Gen3 电气层设置"的错误结论，据此补写 `0x890 = 0x2001` 并刷机验证，
**结果不变**。事后核对：我们用的宏名是 `GEN3_RELATED_OFF`（定义在
`drivers/pci/controller/dwc/pcie-designware.h:117`，值同样是 0x890，位定义相同），
驱动本来就在写这个值。

> 教训：跨代码库对比不能只按符号名 grep，厂商与主线对同一寄存器常有两套命名。
> 应先确认宏的**实际数值**再判断是否存在。

### 新发现：iATU 入站窗口为 0

本次刷机日志出现与历史不同的行：

```
qcom-pcie 18000000.pcie: iATU: unroll T, 8 ob, 0 ib, align 4K, limit 1024G
```

历史镜像均为 `8 ob, 8 ib`。入站窗口为 0 说明 `dma-ranges` 在 6.6 下未被正确解析，
影响 EP→主机 DMA（不直接影响链路训练），是一个**独立待查缺陷**。

### 当前判断

厂商 PCIe 驱动在 6.6 与 5.4 上实质是同一份代码，差异不在驱动层。剩余可能：

1. **DWC 核心版本差异**（5.4 与 6.6 的 `pcie-designware-host.c` 训练流程）
2. 上面那个 `0 ib` 异常

## 八点五、其他归档线索

SSDK 的 C45 / 10G 光口线索见 `docs/archived-leads.md`（已决定暂不采用，留档）。

## 九、复现与工具

- 诊断内核文件归档在仓库 `kernel-debug/`（`phy-qca-pcie-uniphy.c`、`pcie-designware.c`）
- 链路配置实验代码：`drivers/pci/controller/dwc/pcie-qcom.c` 的
  `er2_program_link_cfg()`（调用点在 `qcom_pcie_start_link()`）
- 取内核：`python3 fit_extract_kernel.py <factory.bin> out.img`
- 读 PHY 寄存器：uboot 里 `md 0x4b1000 10`（**不要读 0x4b1200，会复位**）
- 当前板子状态：刷的是 QWRT R26.09.25（NVMe 能认、猫棒不认），**需要时刷回
  `EWRT-ER2-8bc-20261107-0030-factory.bin`**
