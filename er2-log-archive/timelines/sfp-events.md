# 光口事件（按固件版本分组）

筛选规则：sfp_speed / rx_los / uniphy / cal_restart / 模式切换 / Link up|down。


## v2a-stock-16M / 01_1155_boot1.txt（11:55:27，光口相关 5 条 / 全段 292 行）
[  9.573525] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 15.724735] nss-dp 3a504000.dp1 eth0: entered allmulticast mode
[ 15.725562] nss-dp 3a504000.dp1 eth0: entered promiscuous mode
[ 27.192599] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
[104.150413] nss-dp 3a504000.dp1 eth0: PHY Link is down

## v2a-stock-16M / 02_1225_boot1.txt（12:25:00，光口相关 4 条 / 全段 291 行）
[  9.547817] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 15.831441] nss-dp 3a504000.dp1 eth0: entered allmulticast mode
[ 15.831820] nss-dp 3a504000.dp1 eth0: entered promiscuous mode
[ 58.472540] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500

## v2a-stock-16M / 03_1229_watch-1229.txt（12:29:56，光口相关 16 条 / 全段 602 行）
[  9.547817] [12:29:56] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 15.831441] [12:29:56] nss-dp 3a504000.dp1 eth0: entered allmulticast mode
[ 15.831820] [12:29:56] nss-dp 3a504000.dp1 eth0: entered promiscuous mode
[ 58.472540] [12:29:56] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
[640.870377] [12:30:25] nss-dp 3a504000.dp1 eth0: PHY Link is down
[648.152519] [12:30:32] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 10000
[686.630376] [12:31:10] nss-dp 3a504000.dp1 eth0: PHY Link is down
[764.632887] [12:32:29] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500
[796.870343] [12:33:01] nss-dp 3a504000.dp1 eth0: PHY Link is down
[801.033046] [12:33:08] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 10000
[  9.456631] [12:33:58] sfp_phy_init[718]:INFO:SFP port 2 init successfully
[ 15.827473] [12:33:58] nss-dp 3a504000.dp1 eth0: entered allmulticast mode
[ 15.827857] [12:33:58] nss-dp 3a504000.dp1 eth0: entered promiscuous mode
[ 17.912685] [12:34:02] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 10000
[ 47.030480] [12:34:28] nss-dp 3a504000.dp1 eth0: PHY Link is down
[127.112635] [12:35:50] nss-dp 3a504000.dp1 eth0: PHY Link up speed: 2500

## v3b-debug / 01_0852_boot1.txt（08:52:37，光口相关 1060 条 / 全段 1880 行）

事件过密，转指纹统计：

| 次数 | 首次(s) | 末次(s) | 平均间隔(s) | 样例 |
|---|---|---|---|---|
| 160 | 180.16 | 363.44 | 1.15 | adpt_hppe_sfp_interface_mode_switch[3969]:DEBUG:sfp port 2 change interface mode! |
| 160 | 180.17 | 363.45 | 1.15 | hsl_phy_phydev_get[469]:DEBUG:phy[30]: device 90000.mdio-1:1e, driver QCA SFP |
| 160 | 180.18 | 363.46 | 1.15 | sfp_phy_interface_get_mode_status[822]:DEBUG:sfp_speed:32 |
| 307 | 180.19 | 363.47 | 0.60 | sfp_phy_rx_los_status_get[936]:DEBUG:port2 sfp rx_los_pin is 557, the rx_los_status is 1 |
| 26 | 182.43 | 354.27 | 6.87 | adpt_hppe_port_interface_mode_switch[3950]:DEBUG:Port 2 change interface mode to 27 from 23 |
| 26 | 182.48 | 354.33 | 6.87 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x218\x0a and value:0x70 |
| 26 | 182.48 | 354.33 | 6.87 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x46c\x0a and value:0x0 |
| 26 | 182.48 | 354.36 | 6.88 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x46c\x0a and value:0x20 |
| 39 | 182.52 | 354.44 | 4.52 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x1e0\x0a and value:0x0 |
| 13 | 182.53 | 353.09 | 14.21 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:e, rv:0 |
| 13 | 182.59 | 353.15 | 14.21 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xe, mode2 0xff, r |
| 13 | 183.77 | 354.33 | 14.21 | __adpt_hppe_uniphy_sgmiiplus_mode_set[840]:DEBUG:uniphy 1 is sgmiiplus mode |
| 13 | 183.78 | 354.34 | 14.21 | __adpt_hppe_uniphy_sgmiiplus_mode_set[881]:DEBUG:uniphy 1 is a sgmiiplus fiber port! |
| 13 | 183.80 | 354.36 | 14.21 | __qca_mppe_uniphy_cal_restart[814]:DEBUG:uniphy 1 do calibration restart |
| 13 | 183.82 | 354.38 | 14.21 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0xb4\x0a and value:0x0 |
| 26 | 183.82 | 354.41 | 6.82 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0xb4\x0a and value:0x5a |
| 13 | 183.88 | 354.44 | 14.21 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:c, rv:0 |
| 13 | 183.94 | 354.50 | 14.21 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xc, mode2 0xff, r |

## v3b-debug / 02_0903_boot1.txt（09:03:07，光口相关 837 条 / 全段 1488 行）

事件过密，转指纹统计：

| 次数 | 首次(s) | 末次(s) | 平均间隔(s) | 样例 |
|---|---|---|---|---|
| 130 | 811.20 | 959.28 | 1.15 | adpt_hppe_sfp_interface_mode_switch[3969]:DEBUG:sfp port 2 change interface mode! |
| 130 | 811.21 | 959.29 | 1.15 | hsl_phy_phydev_get[469]:DEBUG:phy[30]: device 90000.mdio-1:1e, driver QCA SFP |
| 130 | 811.22 | 959.30 | 1.15 | sfp_phy_interface_get_mode_status[822]:DEBUG:sfp_speed:32 |
| 250 | 811.23 | 959.48 | 0.60 | sfp_phy_rx_los_status_get[936]:DEBUG:port2 sfp rx_los_pin is 557, the rx_los_status is 1 |
| 19 | 816.83 | 959.31 | 7.92 | adpt_hppe_port_interface_mode_switch[3950]:DEBUG:Port 2 change interface mode to 27 from 23 |
| 19 | 816.88 | 959.36 | 7.92 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x218\x0a and value:0x70 |
| 19 | 816.88 | 959.36 | 7.92 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x46c\x0a and value:0x0 |
| 19 | 816.88 | 959.36 | 7.92 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x46c\x0a and value:0x20 |
| 29 | 816.92 | 959.40 | 5.09 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x1e0\x0a and value:0x0 |
| 10 | 816.93 | 959.41 | 15.83 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:e, rv:0 |
| 10 | 816.99 | 959.47 | 15.83 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xe, mode2 0xff, r |
| 9 | 818.17 | 936.73 | 14.82 | __adpt_hppe_uniphy_sgmiiplus_mode_set[840]:DEBUG:uniphy 1 is sgmiiplus mode |
| 9 | 818.18 | 936.74 | 14.82 | __adpt_hppe_uniphy_sgmiiplus_mode_set[881]:DEBUG:uniphy 1 is a sgmiiplus fiber port! |
| 9 | 818.20 | 936.76 | 14.82 | __qca_mppe_uniphy_cal_restart[814]:DEBUG:uniphy 1 do calibration restart |
| 9 | 818.22 | 936.78 | 14.82 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0xb4\x0a and value:0x0 |
| 18 | 818.22 | 936.81 | 6.98 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0xb4\x0a and value:0x5a |
| 9 | 818.28 | 936.84 | 14.82 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:c, rv:0 |
| 9 | 818.34 | 936.90 | 14.82 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xc, mode2 0xff, r |

## v3b-debug / 03_0903_boot2.txt（09:03:07，光口相关 544 条 / 全段 2417 行）

事件过密，转指纹统计：

| 次数 | 首次(s) | 末次(s) | 平均间隔(s) | 样例 |
|---|---|---|---|---|
| 1 | 31.26 | 31.26 | 0.00 | nss-dp 3a504000.dp1 eth0: entered allmulticast mode |
| 1 | 31.31 | 31.31 | 0.00 | nss-dp 3a504000.dp1 eth0: entered promiscuous mode |
| 1 | 32.36 | 32.36 | 0.00 | adpt_hppe_uniphy_port_adapter_reset[3554]:DEBUG:port 1, uniphy_index 0, port_mode 0x17 |
| 1 | 32.37 | 32.37 | 0.00 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x480\x0a and value:0x0 |
| 15 | 32.37 | 118.97 | 6.19 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x480\x0a and value:0x44 |
| 81 | 32.42 | 124.72 | 1.15 | adpt_hppe_sfp_interface_mode_switch[3969]:DEBUG:sfp port 2 change interface mode! |
| 81 | 32.43 | 124.73 | 1.15 | hsl_phy_phydev_get[469]:DEBUG:phy[30]: device 90000.mdio-1:1e, driver QCA SFP |
| 81 | 32.43 | 124.74 | 1.15 | sfp_phy_interface_get_mode_status[822]:DEBUG:sfp_speed:32 |
| 156 | 32.45 | 124.75 | 0.60 | sfp_phy_rx_los_status_get[936]:DEBUG:port2 sfp rx_los_pin is 557, the rx_los_status is 1 |
| 13 | 32.45 | 118.91 | 7.20 | adpt_hppe_port_interface_mode_switch[3950]:DEBUG:Port 2 change interface mode to 23 from 27 |
| 7 | 32.51 | 118.96 | 14.41 | __adpt_hppe_uniphy_sgmiiplus_mode_set[840]:DEBUG:uniphy 1 is sgmiiplus mode |
| 13 | 32.52 | 118.97 | 7.20 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x46c\x0a and value:0x0 |
| 7 | 32.52 | 118.98 | 14.41 | __adpt_hppe_uniphy_sgmiiplus_mode_set[881]:DEBUG:uniphy 1 is a sgmiiplus fiber port! |
| 13 | 32.54 | 119.00 | 7.20 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x46c\x0a and value:0x20 |
| 7 | 32.54 | 119.00 | 14.41 | __qca_mppe_uniphy_cal_restart[814]:DEBUG:uniphy 1 do calibration restart |
| 7 | 32.56 | 119.02 | 14.41 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0xb4\x0a and value:0x0 |
| 14 | 32.56 | 119.05 | 6.65 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0xb4\x0a and value:0x5a |
| 19 | 32.66 | 119.08 | 4.80 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x1e0\x0a and value:0x0 |
| 7 | 32.66 | 119.08 | 14.40 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:c, rv:0 |
| 7 | 32.75 | 119.14 | 14.40 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xc, mode2 0xff, r |
| 6 | 70.93 | 117.73 | 9.36 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:e, rv:0 |
| 6 | 70.99 | 117.79 | 9.36 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xe, mode2 0xff, r |

## v3b-debug / 04_0903_boot3.txt（09:03:07，光口相关 501 条 / 全段 2354 行）

事件过密，转指纹统计：

| 次数 | 首次(s) | 末次(s) | 平均间隔(s) | 样例 |
|---|---|---|---|---|
| 1 | 31.35 | 31.35 | 0.00 | nss-dp 3a504000.dp1 eth0: entered allmulticast mode |
| 1 | 31.39 | 31.39 | 0.00 | nss-dp 3a504000.dp1 eth0: entered promiscuous mode |
| 1 | 32.44 | 32.44 | 0.00 | adpt_hppe_uniphy_port_adapter_reset[3554]:DEBUG:port 1, uniphy_index 0, port_mode 0x17 |
| 1 | 32.45 | 32.45 | 0.00 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x480\x0a and value:0x0 |
| 14 | 32.45 | 117.75 | 6.56 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x480\x0a and value:0x44 |
| 75 | 32.49 | 117.68 | 1.15 | adpt_hppe_sfp_interface_mode_switch[3969]:DEBUG:sfp port 2 change interface mode! |
| 75 | 32.50 | 117.69 | 1.15 | hsl_phy_phydev_get[469]:DEBUG:phy[30]: device 90000.mdio-1:1e, driver QCA SFP |
| 75 | 32.52 | 117.70 | 1.15 | sfp_phy_interface_get_mode_status[822]:DEBUG:sfp_speed:32 |
| 144 | 32.52 | 117.88 | 0.60 | sfp_phy_rx_los_status_get[936]:DEBUG:port2 sfp rx_los_pin is 557, the rx_los_status is 1 |
| 12 | 32.53 | 117.71 | 7.74 | adpt_hppe_port_interface_mode_switch[3950]:DEBUG:Port 2 change interface mode to 23 from 27 |
| 6 | 32.62 | 109.68 | 15.41 | __adpt_hppe_uniphy_sgmiiplus_mode_set[840]:DEBUG:uniphy 1 is sgmiiplus mode |
| 12 | 32.66 | 117.75 | 7.74 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x46c\x0a and value:0x0 |
| 6 | 32.68 | 109.70 | 15.40 | __adpt_hppe_uniphy_sgmiiplus_mode_set[881]:DEBUG:uniphy 1 is a sgmiiplus fiber port! |
| 12 | 32.68 | 117.76 | 7.74 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x46c\x0a and value:0x20 |
| 6 | 32.68 | 109.72 | 15.41 | __qca_mppe_uniphy_cal_restart[814]:DEBUG:uniphy 1 do calibration restart |
| 6 | 32.68 | 109.74 | 15.41 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0xb4\x0a and value:0x0 |
| 12 | 32.68 | 109.77 | 7.01 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0xb4\x0a and value:0x5a |
| 18 | 32.75 | 117.80 | 5.00 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x1e0\x0a and value:0x0 |
| 6 | 32.77 | 109.80 | 15.41 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:c, rv:0 |
| 6 | 32.84 | 109.86 | 15.40 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xc, mode2 0xff, r |
| 6 | 71.01 | 117.81 | 9.36 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:e, rv:0 |
| 6 | 71.07 | 117.87 | 9.36 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xe, mode2 0xff, r |

## v3b-debug / 05_0921_boot1.txt（09:21:27，光口相关 1290 条 / 全段 2304 行）

事件过密，转指纹统计：

| 次数 | 首次(s) | 末次(s) | 平均间隔(s) | 样例 |
|---|---|---|---|---|
| 198 | 784.16 | 1010.80 | 1.15 | adpt_hppe_sfp_interface_mode_switch[3969]:DEBUG:sfp port 2 change interface mode! |
| 198 | 784.17 | 1010.81 | 1.15 | hsl_phy_phydev_get[469]:DEBUG:phy[30]: device 90000.mdio-1:1e, driver QCA SFP |
| 198 | 784.18 | 1010.82 | 1.15 | sfp_phy_interface_get_mode_status[822]:DEBUG:sfp_speed:32 |
| 381 | 784.19 | 1010.83 | 0.60 | sfp_phy_rx_los_status_get[936]:DEBUG:port2 sfp rx_los_pin is 557, the rx_los_status is 1 |
| 30 | 787.55 | 978.11 | 6.57 | adpt_hppe_port_interface_mode_switch[3950]:DEBUG:Port 2 change interface mode to 27 from 23 |
| 30 | 787.59 | 978.17 | 6.57 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x218\x0a and value:0x70 |
| 30 | 787.59 | 978.17 | 6.57 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x46c\x0a and value:0x0 |
| 30 | 787.60 | 978.20 | 6.57 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x46c\x0a and value:0x20 |
| 45 | 787.64 | 978.28 | 4.33 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x1e0\x0a and value:0x0 |
| 15 | 787.65 | 976.93 | 13.52 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:e, rv:0 |
| 15 | 787.71 | 976.99 | 13.52 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xe, mode2 0xff, r |
| 15 | 788.88 | 978.16 | 13.52 | __adpt_hppe_uniphy_sgmiiplus_mode_set[840]:DEBUG:uniphy 1 is sgmiiplus mode |
| 15 | 788.90 | 978.18 | 13.52 | __adpt_hppe_uniphy_sgmiiplus_mode_set[881]:DEBUG:uniphy 1 is a sgmiiplus fiber port! |
| 15 | 788.92 | 978.20 | 13.52 | __qca_mppe_uniphy_cal_restart[814]:DEBUG:uniphy 1 do calibration restart |
| 15 | 788.94 | 978.22 | 13.52 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0xb4\x0a and value:0x0 |
| 30 | 788.94 | 978.25 | 6.53 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0xb4\x0a and value:0x5a |
| 15 | 789.00 | 978.28 | 13.52 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:c, rv:0 |
| 15 | 789.06 | 978.34 | 13.52 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xc, mode2 0xff, r |

## v3b-debug / 06_0921_boot2.txt（09:21:27，光口相关 2930 条 / 全段 7423 行）

事件过密，转指纹统计：

| 次数 | 首次(s) | 末次(s) | 平均间隔(s) | 样例 |
|---|---|---|---|---|
| 1 | 10.70 | 10.70 | 0.00 | sfp_phy_init[718]:INFO:SFP port 2 init successfully |
| 39 | 10.78 | 526.01 | 13.56 | __adpt_hppe_uniphy_sgmiiplus_mode_set[840]:DEBUG:uniphy 0 is sgmiiplus mode |
| 79 | 10.78 | 526.01 | 6.61 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x218\x0a and value:0x50 |
| 77 | 10.78 | 526.01 | 6.78 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x46c\x0a and value:0x0 |
| 77 | 10.78 | 526.04 | 6.78 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x46c\x0a and value:0x20 |
| 39 | 10.79 | 526.04 | 13.56 | __qca_mppe_uniphy_cal_restart[814]:DEBUG:uniphy 0 do calibration restart |
| 39 | 10.81 | 526.06 | 13.56 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0xb4\x0a and value:0x0 |
| 2 | 10.81 | 10.85 | 0.04 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0xb4\x0a and value:0xda |
| 115 | 10.88 | 526.12 | 4.52 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x1e0\x0a and value:0x0 |
| 1 | 10.88 | 10.88 | 0.00 | _adpt_mppe_uniphy_clk_output_set[1224]:DEBUG:uniphy 0 will output clock as 50000000Hz |
| 2 | 10.90 | 32.77 | 21.87 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x610\x0a and value:0x0 |
| 1 | 10.90 | 10.90 | 0.00 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x610\x0a and value:0x1d |
| 437 | 11.06 | 527.29 | 1.18 | hsl_phy_phydev_get[469]:DEBUG:phy[30]: device 90000.mdio-1:1e, driver QCA SFP |
| 1 | 31.65 | 31.65 | 0.00 | nss-dp 3a504000.dp1 eth0: entered allmulticast mode |
| 1 | 31.69 | 31.69 | 0.00 | nss-dp 3a504000.dp1 eth0: entered promiscuous mode |
| 1 | 32.77 | 32.77 | 0.00 | adpt_hppe_uniphy_port_adapter_reset[3554]:DEBUG:port 1, uniphy_index 0, port_mode 0x17 |
| 429 | 32.81 | 527.28 | 1.16 | adpt_hppe_sfp_interface_mode_switch[3969]:DEBUG:sfp port 2 change interface mode! |
| 429 | 32.84 | 527.30 | 1.16 | sfp_phy_interface_get_mode_status[822]:DEBUG:sfp_speed:32 |
| 821 | 32.85 | 527.31 | 0.60 | sfp_phy_rx_los_status_get[936]:DEBUG:port2 sfp rx_los_pin is 557, the rx_los_status is 1 |
| 75 | 32.85 | 525.95 | 6.66 | adpt_hppe_port_interface_mode_switch[3950]:DEBUG:Port 2 change interface mode to 23 from 27 |
| 38 | 32.98 | 526.02 | 13.33 | __adpt_hppe_uniphy_sgmiiplus_mode_set[881]:DEBUG:uniphy 1 is a sgmiiplus fiber port! |
| 76 | 32.98 | 526.09 | 6.57 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0xb4\x0a and value:0x5a |
| 38 | 33.09 | 526.12 | 13.33 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:c, rv:0 |
| 38 | 33.16 | 526.18 | 13.32 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xc, mode2 0xff, r |
| 37 | 56.77 | 524.77 | 13.00 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:e, rv:0 |
| 37 | 56.83 | 524.83 | 13.00 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xe, mode2 0xff, r |

## v2a-debug / 02_1308_boot1.txt（13:08:08，光口相关 1328 条 / 全段 4605 行）

事件过密，转指纹统计：

| 次数 | 首次(s) | 末次(s) | 平均间隔(s) | 样例 |
|---|---|---|---|---|
| 1 | 9.41 | 9.41 | 0.00 | sfp_phy_init[718]:INFO:SFP port 2 init successfully |
| 2 | 9.44 | 16.81 | 7.37 | __adpt_hppe_uniphy_sgmiiplus_mode_set[839]:DEBUG:uniphy 0 is sgmiiplus mode |
| 6 | 9.44 | 16.81 | 1.47 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x218 |
| 3 | 9.44 | 16.81 | 3.68 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x46c |
| 3 | 9.44 | 16.81 | 3.68 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0x46c |
| 2 | 9.44 | 16.81 | 7.37 | __qca_mppe_uniphy_cal_restart[813]:DEBUG:uniphy 0 do calibration restart |
| 2 | 9.44 | 16.81 | 7.37 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0xb4 |
| 4 | 9.44 | 16.84 | 2.47 | qca_uniphy_reg_write[643]:DEBUG:qca_uniphy_reg_write function reg:0xb4 |
| 7 | 9.50 | 16.87 | 1.23 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x1e0 |
| 1 | 9.50 | 9.50 | 0.00 | _adpt_mppe_uniphy_clk_output_set[1223]:DEBUG:uniphy 0 will output clock as 50000000Hz |
| 2 | 9.50 | 16.81 | 7.31 | qca_uniphy_reg_read[597]:DEBUG:qca_uniphy_reg_read function reg:0x610 |
| 264 | 9.59 | 282.07 | 1.04 | hsl_phy_phydev_get[469]:DEBUG:phy[30]: device 90000.mdio-1:1e, driver QCA SFP |
| 1 | 15.73 | 15.73 | 0.00 | nss-dp 3a504000.dp1 eth0: entered allmulticast mode |
| 1 | 15.73 | 15.73 | 0.00 | nss-dp 3a504000.dp1 eth0: entered promiscuous mode |
| 1 | 16.81 | 16.81 | 0.00 | adpt_hppe_uniphy_port_adapter_reset[3554]:DEBUG:port 1, uniphy_index 0, port_mode 0x17 |
| 256 | 16.81 | 282.07 | 1.04 | adpt_hppe_sfp_interface_mode_switch[3969]:DEBUG:sfp port 2 change interface mode! |
| 256 | 16.81 | 282.07 | 1.04 | sfp_phy_interface_get_mode_status[822]:DEBUG:sfp_speed:32 |
| 512 | 16.81 | 282.07 | 0.52 | sfp_phy_rx_los_status_get[936]:DEBUG:port2 sfp rx_los_pin is 557, the rx_los_status is 1 |
| 1 | 16.81 | 16.81 | 0.00 | adpt_hppe_port_interface_mode_switch[3950]:DEBUG:Port 2 change interface mode to 23 from 27 |
| 1 | 16.81 | 16.81 | 0.00 | __adpt_hppe_uniphy_sgmiiplus_mode_set[880]:DEBUG:uniphy 1 is a sgmiiplus fiber port! |
| 1 | 16.87 | 16.87 | 0.00 | adpt_hppe_port_mac_uniphy_phy_config[2320]:DEBUG:configure uniphy mode_index:1, mode:c, rv:0 |
| 1 | 16.90 | 16.90 | 0.00 | adpt_hppe_port_mac_uniphy_phy_config[2333]:DEBUG:configure mac, port_id 2, mode0 0xc, mode1 0xc, mode2 0xff, r |
