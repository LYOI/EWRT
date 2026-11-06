# 归档线索（暂不采用，留档备查）

这里记的是查过但**决定不用**的资料，写清为什么放这儿、什么条件下才值得翻出来。

## qosmio / SSDK-12.5.r2.patch（光口 / 交换芯片）

- 来源：<https://gist.github.com/qosmio/6b14cff0509e198ece11df4e42faaa43>
- 内容：qca-ssdk 从 12.4 升到 12.5.r2 的补丁集，核心是让 SSDK 能在 6.6 内核编译
  - `PKG_SOURCE_VERSION` 从 `23a5aa4a` 升到 `3d060f7a`（2024-04-17）
  - 删掉两条已被上游吸收的补丁（内核 6.6 识别、编译告警）
  - `103-mdio-adapt-to-C22-and-C45-read-write-split.patch`：适配内核 6.3 起把 C45
    读写从 C22 拆出去的改动，否则 SSDK 读不到 C45-only PHY 的 ID，报
    `phytype doesn't match`，进而 USXGMII MAC 的 autoneg 位不置位、UNIPHY
    autoneg 超时，**10G 口起不来**
  - 新增 `port3_pcs_channel` 设备树属性

**为什么不采用**：我们的 SFP 2.5G 链路是好的（`sfp module inserted` → `link up 2500`），
当前 SSDK（`4a51edc0`，6 个补丁）没被这条路径卡住。改 SSDK 版本会牵动整个交换芯片
初始化，风险大于收益。

**什么情况下再翻出来**：插 10G 模块时出现 `uniphy autoneg time out` 或
`phytype doesn't match`。那时优先看 103 那条 C45 适配，其余属于版本升级配套，
可以最后再考虑。

> 注意：这是"有理由怀疑"，不是本机实测结论。我们没有 10G 模块，也没在本机复现过
> 上述报错，所以不能写进 README 当已知问题。
