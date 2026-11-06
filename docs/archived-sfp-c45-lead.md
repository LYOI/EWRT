# 归档线索：SSDK 的 MDIO C45 适配补丁（10G 光口，暂不动）

> 状态：**仅归档，不实施**。来源是社区补丁集，未在本仓库验证。
> 记录时间：2026-11-07。触发条件：插 10G 光模块复现 `uniphy autoneg time out`
> 或 `phytype doesn't match` 时再回来读。

## 来源

- gist：`https://gist.github.com/qosmio/6b14cff0509e198ece11df4e42faaa43`
  （标题 `SSDK 12.4 to 12.5.r2`，2024-05-03）
- 其中关键的一条：`103-mdio-adapt-to-C22-and-C45-read-write-split.patch`

## 它解决什么问题

补丁说明里的因果链（引原文意译）：

1. 内核 6.3 把 MDIO 的 C45 读写从 C22 操作里拆成独立接口
2. 老写法（靠寄存器值里的 magic bit 标记 C45）失效
3. SSDK 读不到 C45-only PHY 的 ID，报 `phytype doesn't match`
4. 于是 USXGMII MAC 的 autoneg 位没有被设置
5. UNIPHY autoneg 超时 `uniphy autoneg time out!`，10G 口起不来

补丁做法：检测寄存器参数里的 `BIT(30)`（`MII_ADDR_C45`），走 `__mdiobus_c45_read/write`。

## 与本仓库的关系

| 项 | 值 |
|---|---|
| 我们的内核 | 6.6.88（远晚于 6.3 这个分界） |
| 我们的 qca-ssdk | `4a51edc0`（SSDK 3.1.0 那一代），6 个本地补丁 |
| 补丁集里是否有 C45 适配 | **没有**（`patches/` 下搜 mdio/c45 为空） |
| 当前 2.5G 光口 | 正常（`sfp module inserted` → `link up 2500`），说明 2.5G 路径不经过 C45 |

## 为什么现在还不动

- **没有 10G 模块可复现**：没有在本机跑出过 `phytype doesn't match` 或
  `uniphy autoneg time out`，所以不能断言"缺这个补丁导致 10G 不通"
- 打这个补丁要连带升级 SSDK 版本（gist 是 12.4 → 12.5.r2 整包升级），
  会波及现网已跑通的 2.5G 光口与交换路径，风险不对称

## 真要动的时候的步骤

1. 先插 10G 模块，抓 dmesg / 串口，确认失败现象与补丁描述一致
2. 确认我们的 SSDK 源码里对应函数（`qca_ar8327_phy_read/write`）当前写法
3. 只移植 C45 检测那一小段，**不要**顺带升级整包 SSDK
4. 验证：10G 起链 + 2.5G 不回归

## 补丁集里的其他内容（参考，非本线索重点）

- `qca-ssdk` 版本从 `23a5aa4a`（2023-10-04）升到 `3d060f7a`（2024-04-17）
- 删掉已经被上游吸收的 `0001-config-identify-kernel-6.6.patch`（新版自带 6.6 识别）
- 新增 `port3_pcs_channel` 属性支持（POR3 的 PCS 通道选择）
