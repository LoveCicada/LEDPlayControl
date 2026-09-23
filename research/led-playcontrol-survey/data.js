window.SURVEY = {
  generated: "2026-09-23",
  note: "仅基于公开官网、手册、专利与 GitHub。营销词与手册可复核事实分开标注。",

  layers: [
    {
      id: "wallClock",
      index: "L1",
      name: "时间对齐",
      en: "Wall clock / playhead",
      question: "现在是哪一秒？",
      typical: "NTP、LTC、厂商时码包",
      precision: "毫秒级，够对齐节目，不够锁相邻箱体扫出相位",
      body: "节点系统钟或播放头对齐。WATCHOUT 默认由 Director 当 NTP 源，偏移通常在 1 ms 内；超过约 100 ms 会自动 resync。7thSense 用 Leader 广播时间线位置；Hippotizer 用 HippoNet 分发时码。LTC 也落在这一层：它只能拉播放头，源自己还要 genlock，否则长节目会漂。接收侧必须校验、飞轮、迟滞锁定，不能把毛刺帧直接当成 playhead。这一层解决「节目进度一致」，不解决「GPU 何时扫出这一帧」。"
    },
    {
      id: "frameId",
      index: "L2",
      name: "帧身份",
      en: "Which frame to present",
      question: "这一拍该播第几帧？",
      typical: "Swap Barrier、同步卡帧计数、主从帧指示校准",
      precision: "必须精确到同一帧号，否则 Genlock 锁住后仍会差一帧",
      body: "WATCHOUT 写得很清楚：Genlock 只锁扫描相位，不锁内容帧号。Hardware Sync Group 把计时源从 NTP 切到同步卡 24-bit 帧计数，节点才按同一帧 present。诺瓦专利 CN202210927168.1 则是在场同步周期内收集从端帧指示再下发校准。缺这一层，相邻屏会整帧错位。"
    },
    {
      id: "scanout",
      index: "L3",
      name: "扫描相位",
      en: "Genlock / Framelock",
      question: "何时开始扫这一帧？",
      typical: "NVIDIA Quadro Sync II / RTX PRO Sync、外置 house-sync、GPU Framelock",
      precision: "亚帧级。菊花链 RJ45 不能走交换机，不是以太网",
      body: "Genlock 把各机刷新锁定到外部基准（BlackBurst / Tri-Level / house-sync）；Framelock 把同机或多机输出锁到内部时序。NVIDIA 同步卡用 CAT5 直连，明确不兼容 TCP/IP。Quadro Sync II 与 RTX PRO Sync 是同一块板的更名，规则不变。7thSense 更推荐 BNC 注入 house-sync 而不是 RJ45 framelock。LED 处理器、摄像机也必须进同一基准，否则服务器锁了、屏端仍撕。"
    },
    {
      id: "transport",
      index: "L4",
      name: "传输时钟",
      en: "PTP / ST 2110",
      question: "IP 视频包按谁的钟对齐？",
      typical: "IEEE 1588 / SMPTE ST 2059-2 PTP",
      precision: "亚微秒，但只服务 ST 2110 发送/接收，不替代节点 NTP",
      body: "disguise IP-VFC 可用 PTP 生成 GPU genlock；WATCHOUT 是 PTP follower，不自当 grandmaster。数码视讯类拼接专利 CN105491433B 用 1588v2 算路径延时后提前发同步显示报文。第一版传统 DP/HDMI 点对点播控通常不需要这一层。"
    }
  ],

  mappingSteps: [
    {
      id: "m1",
      name: "1:1 几何",
      body: "按真实模组、弧度、安装骨架建模型。球形屏按经纬网格拆梯形/矩形/三角模组，直径决定开模量。"
    },
    {
      id: "m2",
      name: "UV 展开",
      body: "把三维灯珠坐标映到二维纹理。UV 单元应对齐物理分辨率，而不是「看起来像」的贴图。"
    },
    {
      id: "m3",
      name: "观察点投影",
      body: "从最佳观看点做离轴投影或预畸变：画面在平面上故意扭曲，贴上曲面后抵消。裸眼 3D 还要按屏面组装投影矩阵。"
    },
    {
      id: "m4",
      name: "按口切片",
      body: "按输出、GPU、机器切开。卡莱特 GrandMapping 可按行列/分辨率细分；PIXERA 把超宽 LED 条 remap 进常规输出。"
    },
    {
      id: "m5",
      name: "同步播出",
      body: "切片没有帧同步会在接缝撕开。几何与同步是两条独立链路，必须同时成立。"
    }
  ],

  syncLineage: [
    { name: "G-Sync / G-Sync II", era: "Kepler 时代", note: "用户给的中文安装 PDF 是这一代（DU-02796），适配 Quadro 6000 / 5000 / FX 5800 / 4800，不是今天的 Sync II。" },
    { name: "Quadro Sync", era: "过渡代", note: "Maxwell 前后的同步卡。Sync II 不兼容更老的 GPU 代际。" },
    { name: "Quadro Sync II", era: "Pascal 及以后", note: "4 GPU / 卡，2 卡 / 机，双 RJ45 Frame Lock，BNC house-sync。现役媒体服务器手册仍大量写这个名字。" },
    { name: "RTX PRO Sync", era: "2025 起更名", note: "同一块板。官方 FAQ：功能等价。新机器按这个名字买和刷固件。" }
  ],

  hardwareGallery: [
    {
      id: "sync-ii-card",
      group: "nvidia",
      product: "Quadro Sync II",
      file: "hw/quadro-sync-ii.svg",
      svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 920 420\" role=\"img\" aria-label=\"NVIDIA Quadro Sync II connectors\">\n  <rect width=\"920\" height=\"420\" fill=\"#0d1218\"/>\n  <text x=\"28\" y=\"36\" fill=\"#3ad7c4\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Quadro Sync II card and I/O</text>\n  <text x=\"28\" y=\"58\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Pascal+. No PCIe data. Needs 6-pin or SATA power.</text>\n  <rect x=\"70\" y=\"90\" width=\"520\" height=\"250\" rx=\"6\" fill=\"#121922\" stroke=\"#3ad7c4\"/>\n  <text x=\"90\" y=\"118\" fill=\"#e7eef5\" font-size=\"14\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">NVIDIA Quadro Sync II</text>\n  <text x=\"90\" y=\"138\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Consolas, monospace\">900-52061-2500-000</text>\n  <rect x=\"100\" y=\"160\" width=\"70\" height=\"28\" fill=\"#18222d\" stroke=\"#e2a73a\"/>\n  <text x=\"112\" y=\"179\" fill=\"#e2a73a\" font-size=\"11\" font-family=\"Consolas, monospace\">GPU 1</text>\n  <rect x=\"180\" y=\"160\" width=\"70\" height=\"28\" fill=\"#18222d\" stroke=\"#e2a73a\"/>\n  <text x=\"192\" y=\"179\" fill=\"#e2a73a\" font-size=\"11\" font-family=\"Consolas, monospace\">GPU 2</text>\n  <rect x=\"260\" y=\"160\" width=\"70\" height=\"28\" fill=\"#18222d\" stroke=\"#e2a73a\"/>\n  <text x=\"272\" y=\"179\" fill=\"#e2a73a\" font-size=\"11\" font-family=\"Consolas, monospace\">GPU 3</text>\n  <rect x=\"340\" y=\"160\" width=\"70\" height=\"28\" fill=\"#18222d\" stroke=\"#e2a73a\"/>\n  <text x=\"352\" y=\"179\" fill=\"#e2a73a\" font-size=\"11\" font-family=\"Consolas, monospace\">GPU 4</text>\n  <rect x=\"420\" y=\"160\" width=\"80\" height=\"28\" fill=\"#18222d\" stroke=\"#314557\"/>\n  <text x=\"428\" y=\"179\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Consolas, monospace\">CON0</text>\n  <text x=\"100\" y=\"210\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Five flex cables: 4x GPU SYNC + second Sync card. Not SLI.</text>\n  <rect x=\"100\" y=\"230\" width=\"110\" height=\"28\" fill=\"#18222d\" stroke=\"#314557\"/>\n  <text x=\"112\" y=\"249\" fill=\"#e7eef5\" font-size=\"11\" font-family=\"Consolas, monospace\">6-pin / SATA</text>\n  <rect x=\"590\" y=\"90\" width=\"70\" height=\"250\" fill=\"#18222d\" stroke=\"#e2a73a\"/>\n  <text x=\"598\" y=\"112\" fill=\"#e2a73a\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">I/O</text>\n  <circle cx=\"625\" cy=\"150\" r=\"16\" fill=\"#0d1218\" stroke=\"#e2a73a\"/>\n  <text x=\"612\" y=\"154\" fill=\"#e2a73a\" font-size=\"9\" font-family=\"Consolas, monospace\">BNC</text>\n  <rect x=\"605\" y=\"190\" width=\"40\" height=\"28\" rx=\"3\" fill=\"#0d1218\" stroke=\"#3ad7c4\"/>\n  <text x=\"612\" y=\"208\" fill=\"#3ad7c4\" font-size=\"9\" font-family=\"Consolas, monospace\">RJ45</text>\n  <rect x=\"605\" y=\"228\" width=\"40\" height=\"28\" rx=\"3\" fill=\"#0d1218\" stroke=\"#3ad7c4\"/>\n  <text x=\"612\" y=\"246\" fill=\"#3ad7c4\" font-size=\"9\" font-family=\"Consolas, monospace\">RJ45</text>\n  <circle cx=\"615\" cy=\"280\" r=\"5\" fill=\"#3ad7c4\"/>\n  <circle cx=\"635\" cy=\"280\" r=\"5\" fill=\"#e2a73a\"/>\n  <text x=\"598\" y=\"310\" fill=\"#8c9aab\" font-size=\"10\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">LED</text>\n  <path d=\"M641 150 L700 128\" stroke=\"#e2a73a\" fill=\"none\"/>\n  <text x=\"706\" y=\"124\" fill=\"#e7eef5\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">BNC house-sync IN</text>\n  <text x=\"706\" y=\"142\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">TTL out: never feed a generator</text>\n  <path d=\"M645 204 L700 198\" stroke=\"#3ad7c4\" fill=\"none\"/>\n  <text x=\"706\" y=\"202\" fill=\"#e7eef5\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Dual RJ45 Frame Lock</text>\n  <text x=\"706\" y=\"220\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">CAT5 daisy-chain, not Ethernet</text>\n  <text x=\"28\" y=\"394\" fill=\"#5c6b7c\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Drawn from NVIDIA Sync II / RTX PRO Sync User Guide. NVIDIA copyright. Survey use only.</text>\n</svg>",
      caption: "挡板：BNC house-sync + 双 RJ45 Frame Lock。顶缘 5 路排线接 GPU SYNC 口。",
      zones: ["BNC", "RJ45", "GPU SYNC", "供电"],
      sourceTitle: "NVIDIA Quadro Sync II User Guide",
      sourceUrl: "https://images.nvidia.com/content/quadro/product-literature/user-guides/Quadro-Sync-II-User-Guide-v07.pdf"
    },
    {
      id: "sync-ii-install",
      group: "nvidia",
      product: "Sync II 安装",
      file: "hw/quadro-sync-ii-install.svg",
      svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 920 400\" role=\"img\" aria-label=\"Quadro Sync II install steps\">\n  <rect width=\"920\" height=\"400\" fill=\"#0d1218\"/>\n  <text x=\"28\" y=\"36\" fill=\"#3ad7c4\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Install: PCIe slot, GPU SYNC, power</text>\n  <text x=\"28\" y=\"56\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Power down first. Card uses the slot only for the bracket.</text>\n  <rect x=\"40\" y=\"80\" width=\"200\" height=\"90\" fill=\"#121922\" stroke=\"#314557\"/>\n  <text x=\"56\" y=\"116\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Free PCIe slot</text>\n  <text x=\"56\" y=\"138\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">1 Seat the Sync card</text>\n  <rect x=\"280\" y=\"80\" width=\"280\" height=\"90\" fill=\"#121922\" stroke=\"#e2a73a\"/>\n  <text x=\"296\" y=\"116\" fill=\"#e2a73a\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">GPU SYNC header</text>\n  <text x=\"296\" y=\"138\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">2 Flex cable to SYNC</text>\n  <text x=\"296\" y=\"156\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Not SLI / NVLink. Any order OK.</text>\n  <rect x=\"600\" y=\"80\" width=\"280\" height=\"90\" fill=\"#121922\" stroke=\"#3ad7c4\"/>\n  <text x=\"616\" y=\"116\" fill=\"#3ad7c4\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">6-pin PCIe or SATA</text>\n  <text x=\"616\" y=\"138\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">3 Power the Sync card</text>\n  <path d=\"M240 125 L280 125\" stroke=\"#314557\"/>\n  <path d=\"M560 125 L600 125\" stroke=\"#314557\"/>\n  <rect x=\"40\" y=\"200\" width=\"840\" height=\"150\" fill=\"#121922\" stroke=\"#314557\"/>\n  <text x=\"56\" y=\"228\" fill=\"#e2a73a\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Two cards = up to 8 GPUs</text>\n  <text x=\"56\" y=\"254\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Second Sync card: same slot, up to 4 GPUs, then power.</text>\n  <text x=\"56\" y=\"278\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Link the two cards on CON0 (closest to the bracket).</text>\n  <text x=\"56\" y=\"308\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">No dedicated Sync driver. GPU driver R440+ for Mosaic + sync.</text>\n  <text x=\"28\" y=\"380\" fill=\"#5c6b7c\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Source: Quadro Sync II QSG / RTX PRO Sync User Guide ch.4</text>\n</svg>",
      caption: "空 PCIe 槽露出挡板，排线接到 GPU 的 SYNC，再接 6-pin 或 SATA。双卡必须走 CON0。",
      zones: ["PCIe 槽", "SYNC 口", "供电", "CON0"],
      sourceTitle: "Quadro Sync II Quick Start Guide",
      sourceUrl: "https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/176-0308-100-quadro-sync-ii-qsg-ww-133x177-8mm-20170720-r7-hr.pdf"
    },
    {
      id: "sync-ii-framelock",
      group: "nvidia",
      product: "Frame Lock 菊花链",
      file: "hw/quadro-sync-ii-framelock.svg",
      svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 920 380\" role=\"img\" aria-label=\"Frame Lock CAT5 daisy chain, no switch\">\n  <rect width=\"920\" height=\"380\" fill=\"#0d1218\"/>\n  <text x=\"28\" y=\"36\" fill=\"#3ad7c4\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Multi-node Frame Lock: CAT5 daisy chain</text>\n  <text x=\"28\" y=\"56\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">NVIDIA: not TCP/IP. A switch or NIC can damage the card.</text>\n  <rect x=\"40\" y=\"90\" width=\"200\" height=\"120\" fill=\"#121922\" stroke=\"#e2a73a\"/>\n  <text x=\"58\" y=\"118\" fill=\"#e2a73a\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Timing Server</text>\n  <text x=\"58\" y=\"142\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Sync RJ45</text>\n  <rect x=\"58\" y=\"158\" width=\"50\" height=\"22\" fill=\"#0d1218\" stroke=\"#3ad7c4\"/>\n  <text x=\"68\" y=\"174\" fill=\"#3ad7c4\" font-size=\"10\" font-family=\"Consolas, monospace\">P1</text>\n  <rect x=\"118\" y=\"158\" width=\"50\" height=\"22\" fill=\"#0d1218\" stroke=\"#3ad7c4\"/>\n  <text x=\"128\" y=\"174\" fill=\"#3ad7c4\" font-size=\"10\" font-family=\"Consolas, monospace\">P2</text>\n  <rect x=\"360\" y=\"90\" width=\"200\" height=\"120\" fill=\"#121922\" stroke=\"#3ad7c4\"/>\n  <text x=\"378\" y=\"118\" fill=\"#3ad7c4\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Client B</text>\n  <text x=\"378\" y=\"142\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Sync RJ45</text>\n  <rect x=\"378\" y=\"158\" width=\"50\" height=\"22\" fill=\"#0d1218\" stroke=\"#3ad7c4\"/>\n  <text x=\"388\" y=\"174\" fill=\"#3ad7c4\" font-size=\"10\" font-family=\"Consolas, monospace\">P1</text>\n  <rect x=\"438\" y=\"158\" width=\"50\" height=\"22\" fill=\"#0d1218\" stroke=\"#3ad7c4\"/>\n  <text x=\"448\" y=\"174\" fill=\"#3ad7c4\" font-size=\"10\" font-family=\"Consolas, monospace\">P2</text>\n  <rect x=\"680\" y=\"90\" width=\"200\" height=\"120\" fill=\"#121922\" stroke=\"#3ad7c4\"/>\n  <text x=\"698\" y=\"118\" fill=\"#3ad7c4\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Client C</text>\n  <text x=\"698\" y=\"142\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Sync RJ45</text>\n  <rect x=\"698\" y=\"158\" width=\"50\" height=\"22\" fill=\"#0d1218\" stroke=\"#3ad7c4\"/>\n  <text x=\"708\" y=\"174\" fill=\"#3ad7c4\" font-size=\"10\" font-family=\"Consolas, monospace\">P1</text>\n  <rect x=\"758\" y=\"158\" width=\"50\" height=\"22\" fill=\"#0d1218\" stroke=\"#3ad7c4\"/>\n  <text x=\"768\" y=\"174\" fill=\"#3ad7c4\" font-size=\"10\" font-family=\"Consolas, monospace\">P2</text>\n  <path d=\"M168 169 L378 169\" stroke=\"#3ad7c4\"/>\n  <text x=\"230\" y=\"160\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">CAT5 A.P1 to B.P2</text>\n  <path d=\"M488 169 L698 169\" stroke=\"#3ad7c4\"/>\n  <text x=\"540\" y=\"160\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">CAT5 B.P1 to C.P2</text>\n  <rect x=\"40\" y=\"240\" width=\"520\" height=\"90\" fill=\"#121922\" stroke=\"#e36b5c\"/>\n  <text x=\"58\" y=\"270\" fill=\"#e36b5c\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Do not</text>\n  <text x=\"58\" y=\"294\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Switch / router / NIC / show LAN. Two empty ports at chain ends are normal.</text>\n  <rect x=\"580\" y=\"240\" width=\"300\" height=\"90\" fill=\"#121922\" stroke=\"#314557\"/>\n  <text x=\"598\" y=\"270\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Large cluster</text>\n  <text x=\"598\" y=\"294\" fill=\"#e7eef5\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Timing Server may fan out two chains. Keep cables short.</text>\n</svg>",
      caption: "CAT5 直连 Timing Server 到 Client。禁止进交换机。不是 TCP/IP。",
      zones: ["CAT5", "P1-P2", "禁交换机"],
      sourceTitle: "RTX PRO Sync User Guide DU-08348-001_v09",
      sourceUrl: "https://images.nvidia.com/aem-dam/Solutions/design-visualization/quadro-product-literature/nvidia-rtx-pro-sync-user-guide.pdf"
    },
    {
      id: "rtx-pro-sync",
      group: "nvidia",
      product: "RTX PRO Sync",
      file: "hw/rtx-pro-sync.svg",
      svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 920 400\" role=\"img\" aria-label=\"Quadro Sync II versus RTX PRO Sync\">\n  <rect width=\"920\" height=\"400\" fill=\"#0d1218\"/>\n  <text x=\"28\" y=\"36\" fill=\"#3ad7c4\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Quadro Sync II vs RTX PRO Sync</text>\n  <text x=\"28\" y=\"56\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Official FAQ: RTX PRO Sync is a rebrand of Sync II. Same board, same function.</text>\n  <rect x=\"40\" y=\"84\" width=\"400\" height=\"270\" fill=\"#121922\" stroke=\"#314557\"/>\n  <text x=\"60\" y=\"114\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Quadro Sync II</text>\n  <text x=\"60\" y=\"148\" fill=\"#e7eef5\" font-size=\"14\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Pascal+ professional GPUs</text>\n  <text x=\"60\" y=\"180\" fill=\"#8c9aab\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">4 GPUs / card, 2 cards / chassis, 8 GPUs</text>\n  <text x=\"60\" y=\"204\" fill=\"#8c9aab\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Dual RJ45 Frame Lock, BNC house-sync / TTL</text>\n  <text x=\"60\" y=\"228\" fill=\"#8c9aab\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">DU-08348 through v07 still uses this name</text>\n  <text x=\"60\" y=\"268\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Keep installed cards. Framelock rules unchanged.</text>\n  <rect x=\"480\" y=\"84\" width=\"400\" height=\"270\" fill=\"#121922\" stroke=\"#3ad7c4\"/>\n  <text x=\"500\" y=\"114\" fill=\"#3ad7c4\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">RTX PRO Sync</text>\n  <text x=\"500\" y=\"148\" fill=\"#e7eef5\" font-size=\"14\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Same PCB, new name and box</text>\n  <text x=\"500\" y=\"180\" fill=\"#8c9aab\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">GPU list adds Blackwell RTX PRO 6000/5000/4500/4000</text>\n  <text x=\"500\" y=\"204\" fill=\"#8c9aab\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">v08 adds VRR and Frame Lock detection notes</text>\n  <text x=\"500\" y=\"228\" fill=\"#8c9aab\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Firmware now RTX PRO Sync Firmware 3.06</text>\n  <text x=\"500\" y=\"268\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Buy and flash new machines under this name.</text>\n  <text x=\"40\" y=\"380\" fill=\"#5c6b7c\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Source: RTX PRO Sync User Guide v09 FAQ; nvidia.com firmware page</text>\n</svg>",
      caption: "官方：RTX PRO Sync 是 Sync II 的更名，板卡架构与功能不变。",
      zones: ["更名", "Blackwell 列表", "固件 3.06"],
      sourceTitle: "NVIDIA RTX PRO Sync Firmware",
      sourceUrl: "https://www.nvidia.com/en-us/drivers/firmware/rtx-pro-sync-firmware-driver/"
    },
    {
      id: "bmd-sync-gen",
      group: "genlock",
      product: "Mini Converter Sync Generator",
      file: "hw/bmd-sync-generator.svg",
      svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 920 380\" role=\"img\" aria-label=\"Blackmagic Mini Converter Sync Generator\">\n  <rect width=\"920\" height=\"380\" fill=\"#0d1218\"/>\n  <text x=\"28\" y=\"36\" fill=\"#3ad7c4\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">House-sync generator: BMD Mini Converter Sync Generator</text>\n  <text x=\"28\" y=\"56\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Six crystal-locked BNC refs: HD Tri-Sync or SD BlackBurst.</text>\n  <rect x=\"80\" y=\"90\" width=\"420\" height=\"200\" rx=\"8\" fill=\"#121922\" stroke=\"#e2a73a\"/>\n  <text x=\"100\" y=\"120\" fill=\"#e2a73a\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">CONVMSYNC</text>\n  <circle cx=\"130\" cy=\"180\" r=\"18\" fill=\"#0d1218\" stroke=\"#e2a73a\"/>\n  <circle cx=\"180\" cy=\"180\" r=\"18\" fill=\"#0d1218\" stroke=\"#e2a73a\"/>\n  <circle cx=\"230\" cy=\"180\" r=\"18\" fill=\"#0d1218\" stroke=\"#e2a73a\"/>\n  <circle cx=\"280\" cy=\"180\" r=\"18\" fill=\"#0d1218\" stroke=\"#e2a73a\"/>\n  <circle cx=\"330\" cy=\"180\" r=\"18\" fill=\"#0d1218\" stroke=\"#e2a73a\"/>\n  <circle cx=\"380\" cy=\"180\" r=\"18\" fill=\"#0d1218\" stroke=\"#e2a73a\"/>\n  <text x=\"118\" y=\"220\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Consolas, monospace\">REF 1-6  75 ohm BNC</text>\n  <text x=\"100\" y=\"258\" fill=\"#e7eef5\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">DIP or USB format select. 12 V power.</text>\n  <text x=\"540\" y=\"120\" fill=\"#3ad7c4\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Feed these</text>\n  <text x=\"540\" y=\"152\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">- Media server Sync card BNC</text>\n  <text x=\"540\" y=\"178\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">- LED processor Genlock IN</text>\n  <text x=\"540\" y=\"204\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">- Cameras / switcher (VP)</text>\n  <text x=\"540\" y=\"240\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Avoid BlackBurst above 1080p (disguise)</text>\n  <text x=\"540\" y=\"262\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">59.94/50 often uses 1080i tri-level</text>\n  <text x=\"28\" y=\"356\" fill=\"#5c6b7c\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Source: Blackmagic Mini Converter Sync Generator specs / Converters manual</text>\n</svg>",
      caption: "6 路晶振锁定 BNC：HD Tri-Sync 或 SD BlackBurst。house-sync 的源头。",
      zones: ["6x BNC", "Tri-Sync", "BlackBurst"],
      sourceTitle: "Blackmagic Mini Converter Sync Generator 规格",
      sourceUrl: "https://www.blackmagicdesign.com/api/print/to-pdf/products/miniconverters/techspecs/W-CONM-15?filename=mini-converter-sync-generator-techspecs.pdf"
    },
    {
      id: "mx40-genlock",
      group: "genlock",
      product: "MX40 Pro GENLOCK",
      file: "hw/mx40-genlock.svg",
      svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 920 360\" role=\"img\" aria-label=\"NovaStar MX40 Pro GENLOCK IN and LOOP\">\n  <rect width=\"920\" height=\"360\" fill=\"#0d1218\"/>\n  <text x=\"28\" y=\"36\" fill=\"#3ad7c4\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">LED processor Genlock: NovaStar MX40 Pro rear</text>\n  <text x=\"28\" y=\"56\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">IN takes ref, LOOP to next unit. Bi/Tri-level / Blackburst, 23.98-60 Hz, ~20 units.</text>\n  <rect x=\"40\" y=\"84\" width=\"840\" height=\"160\" fill=\"#121922\" stroke=\"#314557\"/>\n  <text x=\"60\" y=\"112\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">MX40 Pro rear (sync ports only)</text>\n  <rect x=\"60\" y=\"132\" width=\"90\" height=\"70\" fill=\"#18222d\" stroke=\"#314557\"/>\n  <text x=\"78\" y=\"172\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">HDMI/DP</text>\n  <rect x=\"170\" y=\"132\" width=\"90\" height=\"70\" fill=\"#18222d\" stroke=\"#314557\"/>\n  <text x=\"188\" y=\"172\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">12G-SDI</text>\n  <rect x=\"280\" y=\"132\" width=\"160\" height=\"70\" fill=\"#18222d\" stroke=\"#e2a73a\"/>\n  <text x=\"300\" y=\"158\" fill=\"#e2a73a\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">GENLOCK</text>\n  <circle cx=\"328\" cy=\"180\" r=\"12\" fill=\"#0d1218\" stroke=\"#e2a73a\"/>\n  <text x=\"316\" y=\"184\" fill=\"#e2a73a\" font-size=\"8\" font-family=\"Consolas, monospace\">IN</text>\n  <circle cx=\"392\" cy=\"180\" r=\"12\" fill=\"#0d1218\" stroke=\"#3ad7c4\"/>\n  <text x=\"374\" y=\"184\" fill=\"#3ad7c4\" font-size=\"8\" font-family=\"Consolas, monospace\">LOOP</text>\n  <rect x=\"460\" y=\"132\" width=\"200\" height=\"70\" fill=\"#18222d\" stroke=\"#314557\"/>\n  <text x=\"480\" y=\"172\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">20x RJ45 / 4x 10G</text>\n  <rect x=\"680\" y=\"132\" width=\"170\" height=\"70\" fill=\"#18222d\" stroke=\"#314557\"/>\n  <text x=\"700\" y=\"172\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">ETHERNET ctrl</text>\n  <text x=\"40\" y=\"280\" fill=\"#e7eef5\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Sync source: active input / Genlock / internal. Low latency mutually exclusive with Genlock.</text>\n  <text x=\"40\" y=\"308\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Brompton Tessera locks genlock from video in to LED refresh. Processor hop is not GPU hop.</text>\n  <text x=\"28\" y=\"344\" fill=\"#5c6b7c\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Source: MX40 Pro User Manual V1.5.0 rear panel / Sync Source</text>\n</svg>",
      caption: "IN 收参考，LOOP 到下一台。低延迟与 Genlock 互斥。约 20 台级联。",
      zones: ["IN", "LOOP", "23.98-60 Hz"],
      sourceTitle: "MX40 Pro User Manual V1.5.0",
      sourceUrl: "https://oss.novastar.tech/uploads/2025/10/MX40-Pro-LED-Display-Controller-User-Manual-V1.5.0.pdf"
    },
    {
      id: "house-sync-chain",
      group: "genlock",
      product: "House-sync 全链路",
      file: "hw/house-sync-chain.svg",
      svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 920 340\" role=\"img\" aria-label=\"House-sync into media server and LED processor\">\n  <rect width=\"920\" height=\"340\" fill=\"#0d1218\"/>\n  <text x=\"28\" y=\"36\" fill=\"#3ad7c4\" font-size=\"13\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Where Genlock sits in the chain</text>\n  <text x=\"28\" y=\"56\" fill=\"#8c9aab\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">It locks when scanout starts, not which content frame.</text>\n  <rect x=\"30\" y=\"90\" width=\"160\" height=\"70\" fill=\"#121922\" stroke=\"#e2a73a\"/>\n  <text x=\"48\" y=\"120\" fill=\"#e2a73a\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Sync Generator</text>\n  <text x=\"48\" y=\"142\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">BNC reference</text>\n  <path d=\"M190 125 L230 125\" stroke=\"#e2a73a\"/>\n  <path d=\"M190 125 L190 230 L230 230\" stroke=\"#e2a73a\" fill=\"none\"/>\n  <rect x=\"230\" y=\"90\" width=\"200\" height=\"70\" fill=\"#121922\" stroke=\"#3ad7c4\"/>\n  <text x=\"248\" y=\"120\" fill=\"#3ad7c4\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Sync card BNC IN</text>\n  <text x=\"248\" y=\"142\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">GPU scanout</text>\n  <rect x=\"230\" y=\"196\" width=\"200\" height=\"70\" fill=\"#121922\" stroke=\"#e2a73a\"/>\n  <text x=\"248\" y=\"226\" fill=\"#e2a73a\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Processor Genlock IN</text>\n  <text x=\"248\" y=\"248\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">LOOP to next unit</text>\n  <path d=\"M430 125 L470 125\" stroke=\"#3ad7c4\"/>\n  <rect x=\"470\" y=\"90\" width=\"180\" height=\"70\" fill=\"#121922\" stroke=\"#3ad7c4\"/>\n  <text x=\"488\" y=\"120\" fill=\"#e7eef5\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">GPU DP / HDMI</text>\n  <text x=\"488\" y=\"142\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Picture</text>\n  <path d=\"M650 125 L690 230\" stroke=\"#314557\"/>\n  <path d=\"M430 230 L690 230\" stroke=\"#e2a73a\"/>\n  <rect x=\"690\" y=\"196\" width=\"200\" height=\"70\" fill=\"#121922\" stroke=\"#314557\"/>\n  <text x=\"708\" y=\"226\" fill=\"#e7eef5\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Cabinet refresh</text>\n  <text x=\"708\" y=\"248\" fill=\"#8c9aab\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">Same phase both ends</text>\n  <rect x=\"470\" y=\"196\" width=\"180\" height=\"70\" fill=\"#0d1218\" stroke=\"#5c6b7c\" stroke-dasharray=\"4 3\"/>\n  <text x=\"488\" y=\"226\" fill=\"#5c6b7c\" font-size=\"12\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">RJ45 Frame Lock</text>\n  <text x=\"488\" y=\"248\" fill=\"#5c6b7c\" font-size=\"11\" font-family=\"Microsoft YaHei UI, Segoe UI, sans-serif\">GPU cluster only, not generator</text>\n</svg>",
      caption: "发生器同时进 Sync 卡 BNC 和处理器 Genlock IN。RJ45 只锁 GPU 集群。",
      zones: ["发生器", "Sync BNC", "处理器 IN", "箱体"],
      sourceTitle: "disguise Genlock Configuration",
      sourceUrl: "https://help.disguise.one/designer/configuration/genlock-configuration"
    }
  ],

  wireProtocols: [
    {
      id: "kfs",
      name: "KFS",
      also: "Kystar Frame Synchronization",
      vendor: "Kommander / 凯视达",
      phy: "F30：Quadro Sync II。英文规格 2x RJ45 Framelock + 1x BNC Genlock。Frame Lock 是 NVIDIA 专有时序，CAT5 直连，不是 TCP/IP。",
      app: "KFS 是软件品牌名。帧同步报文、是否还在以太网上传 playhead，公开页未写。",
      layer: "F30 的 L3 可落到 NVIDIA Frame Lock；KFS 本身仍是 L2 宣称",
      evidence: "硬件 A/B · 软件 C",
      note: "不要把 KFS 三个字母当成已公开的线协议。"
    },
    {
      id: "grandshow-sync",
      name: "GrandShow Sync",
      also: "卡莱特 CS 系列多机",
      vendor: "Colorlight / 卡莱特",
      phy: "CS20-8K 规格只列 2.5GbE RJ45，没有独立 Frame Lock 口。推断走机器以太网，可以进交换机。",
      app: "专有，未公开。卡莱特「GrandShow 播控协议」是场景/播放 UDP 中控，不是帧同步协议。",
      layer: "营销写按帧同步（L2 宣称）；L3 扫出未写 NVIDIA Sync",
      evidence: "介质 B · 报文 C",
      note: "中控协议公开，不能用来推断 Sync 的报文。"
    },
    {
      id: "kompass-lora",
      name: "Kompass Lora",
      also: "LoRa 无线模块",
      vendor: "诺瓦 Kompass FX1/FX2/FX3 V3.13",
      phy: "无线 LoRa（Semtech CSS），不是网线。诺瓦 Taurus 手册把 LoRa 写成 NTP 主从校时：同一 Group ID、一主多从、主机可跟 NTP。",
      app: "Kompass 更新说明只写「多机同步方式新增 Lora 模块」。载荷格式未公开。",
      layer: "L1 时间对齐，毫秒级。不能当 L3 扫出锁。",
      evidence: "PHY 名称 A · 载荷 C",
      note: "精度与有线 Frame Lock 不在同一量级。"
    }
  ],

  ltcHandling: {
    lead: "LTC 是 L1 节目进度，不是 L3。7thSense：LTC 源自己也要 genlock，否则长节目会漂。",
    anomalies: [
      { name: "Bi-phase mark 畸形", d: "波形跳变不对。通常是电平、地环或线材。WATCHOUT LTC Bridge 单独计数。" },
      { name: "Missing frames", d: "该到的帧没解出来。短缺失用飞轮外推，不要跳 playhead。" },
      { name: "Duplicate frame", d: "同一帧号出现两次。丢掉重复，继续按 FPS 走。" },
      { name: "Discontinuity", d: "时码不是 +1/-1。片头换段正常；持续计数才是源问题。" },
      { name: "Invalid frame", d: "sync word 之间位数不够。整帧丢弃。" },
      { name: "Bad BCD", d: "时间数字超范围，例如分钟=60。整帧丢弃。" }
    ],
    steps: [
      "先校验再跟：sync word、BCD 范围、偶校验。坏帧丢弃，不驱动 playhead。",
      "飞轮：丢帧后用上一帧有效时码按 FPS 外推，窗口约 2 帧或约 100 ms；超时 unlock，时间线暂停，不要乱跳。",
      "锁定迟滞：连续 N 帧有效才 lock，避免掉线后单帧毛刺把节目拽走。",
      "跳变：实际帧不等于期望 ±1（含 drop-frame、正反向）记 discontinuity。短毛刺继续飞轮，确认换段才 chase。",
      "静音或无效超过约 100 ms：pause，等重新 lock。WATCHOUT LTC Bridge 按这个阈值停时间线。",
      "FPS 与 DF：用帧号回绕检测 24/25/30，DF 与 NDF 分开。源帧率与工程不一致时告警，不要默默缩放。",
      "LTC 不等于扫出：时码只能拉播放头。相邻箱体仍要 Frame Lock / house-sync。"
    ],
    sourceTitle: "WATCHOUT 7 LTC Bridge",
    sourceUrl: "https://docs.dataton.com/guide/watchout/external-control/ltc-bridge.html"
  },

  extraSources: [
    { t: "NVIDIA Quadro G-Sync II 安装指南 v4（旧卡，不是 Sync II）", u: "https://www.nvidia.cn/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/Quadro_GSync_install_guide_v4.pdf" },
    { t: "NVIDIA Quadro Sync II Quick Start Guide", u: "https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/176-0308-100-quadro-sync-ii-qsg-ww-133x177-8mm-20170720-r7-hr.pdf" },
    { t: "NVIDIA RTX PRO Sync User Guide DU-08348-001_v09", u: "https://images.nvidia.com/aem-dam/Solutions/design-visualization/quadro-product-literature/nvidia-rtx-pro-sync-user-guide.pdf" },
    { t: "NVIDIA RTX PRO Sync Firmware（架构未改）", u: "https://www.nvidia.com/en-us/drivers/firmware/rtx-pro-sync-firmware-driver/" },
    { t: "WATCHOUT 7 LTC Bridge", u: "https://docs.dataton.com/guide/watchout/external-control/ltc-bridge.html" },
    { t: "Blackmagic Mini Converter Sync Generator 规格", u: "https://www.blackmagicdesign.com/api/print/to-pdf/products/miniconverters/techspecs/W-CONM-15?filename=mini-converter-sync-generator-techspecs.pdf" },
    { t: "Blackmagic Mini Converters 产品页", u: "https://www.blackmagicdesign.com/products/miniconverters" },
    { t: "Kommander F30 英文规格（Framelock RJ45 + Genlock BNC）", u: "https://en.kystar.net/wp-content/uploads/2025/10/Kommander-F30-Media-Server-Datasheet_2509.pdf" },
    { t: "PIXERA Genlock / Framelock", u: "https://help.pixera.one/graphic-cards/synchronize-outputs-genlock-framelock-setup" },
    { t: "disguise Jumping Track Bars（跳转默认延迟 2 帧）", u: "https://help.disguise.one/designer/timeline-tracks-transports/jumping-track-bars" },
    { t: "7thSense External Control Commands", u: "https://portal.7thsense.one/user-guides/MC255-managing-servers/deltagui_external_control.html" },
    { t: "7thSense Timing Sources", u: "https://portal.7thsense.one/user-guides/M280-synchronising-delta/tc_timing_sources.html" },
    { t: "7thSense Seamless Looping", u: "https://portal.7thsense.one/user-guides/M723-delta2_8-user-guide/seamless_looping.html" },
    { t: "7thSense Delta 2.8 User Guide（Servers Ready / timing packet）", u: "https://portal.7thsense.one/user-guides/pdf-library/Delta%20software%20guides/M723-5%20Delta%202.8%20User%20Guide.pdf" },
    { t: "WATCHOUT 7 Connecting to Display Servers", u: "https://docs.dataton.com/watchout-7-new/watchout/playback/connecting-to-display-servers.html" },
    { t: "WATCHOUT Display Control Protocol（6，命令表无生效帧）", u: "https://knowledge.dataton.com/knowledge/watchout-display-control-protocol" },
    { t: "PIXERA Timecode / TC Jump Preload Delay", u: "https://help.pixera.one/1216391-smpte-timecode" },
    { t: "Pandoras Box 4.7 User Manual（Video Synchronisation）", u: "https://www.christiedigital.com/globalassets/resources/public/pandorasbox/pandoras-box-help-rev-5771.pdf" },
    { t: "Pandoras Box SMPTE（只应一处 Receive）", u: "https://pandorasboxhelpfile.com/home/smpte-time-code_config.htm" },
    { t: "Kompass FX3 Pro 中控协议 V2.6.0", u: "https://en-website001.oss-us-east-1.aliyuncs.com/uploads/2025/11/Multimedia%20Playback%20Software%20%28FX3%20Pro%29%20Control%20Protocol-V2.6.0.pdf" }
  ],

  heatmapKeys: [
    { id: "ntp", label: "NTP/时码" },
    { id: "quadro", label: "Quadro Sync" },
    { id: "genlock", label: "外置 Genlock" },
    { id: "ptp", label: "PTP" },
    { id: "map3d", label: "3D 映射" },
    { id: "slice2d", label: "2D 切片" },
    { id: "backup", label: "主备" },
    { id: "vertical", label: "发送卡垂直整合" }
  ],

  controlKeys: [
    { id: "artnet", label: "Art-Net/DMX" },
    { id: "osc", label: "OSC" },
    { id: "midi", label: "MIDI" },
    { id: "ltc", label: "LTC/时码" },
    { id: "ndi", label: "NDI" },
    { id: "spout", label: "Spout" },
    { id: "udp", label: "中控 UDP" }
  ],

  commandModes: [
    {
      id: "arrival",
      index: "01",
      name: "到达即执行",
      en: "Fire on arrival",
      body: "中控包里只有目标时间、Cue 或场景号，没有「在第 N 帧再生效」。各机若在包到达时切，网络抖动就是接缝错开。诺瓦 Kompass 的公开协议是这种外形。GrandShow 播控协议引言同样是对软件下发播放命令，打开的页面里没有生效帧字段。",
      vendors: ["novastar", "grandshow"]
    },
    {
      id: "chase",
      index: "02",
      name: "播放头跟随",
      en: "Playhead chase",
      body: "跳转只打到 Leader 或 Director。从机不各自解释中控包，而是跟着主控的播放头：现在播这一帧。7thSense 的 timing packet、WATCHOUT 的播放状态、PIXERA 的 Now 指针、Pandoras Box 堆在 Master 上再按 Master 时钟下发，都是这条。没有 genlock 时，7thSense 写明仍可能差约 1 帧。",
      vendors: ["7thsense", "watchout", "pixera", "pandoras"]
    },
    {
      id: "deferred",
      index: "03",
      name: "延迟生效",
      en: "Deferred jump",
      body: "指令现在收下，过若干帧或等预载完成再换画面。这段空档用来让各机对齐，并让解码器先读到跳转点。disguise 从 r30.4 起默认延迟 2 帧。PIXERA 26.3 的 TC Jump Preload Delay 是指针先跳、画面晚切。7thSense 无缝模式下，外部 GOTO 不会立刻切。",
      vendors: ["disguise", "pixera", "7thsense"]
    },
    {
      id: "take",
      index: "04",
      name: "两阶段 Take",
      en: "Preload then cut",
      body: "先异步把节目或目标装进各机，等就绪再发一条短指令一起开播。WATCHOUT 是 load、wait、run；7thSense 是 CUE 然后 PLAY，并用 Servers Ready 统计已经 cue 的台数。Kommander / GrandShow 的预监和 KV 跳场景是同一种交互；Take 有没有量化到同步卡帧号，公开页没写。",
      vendors: ["watchout", "7thsense", "kommander", "grandshow"]
    }
  ],

  commandKeys: [
    { id: "form", label: "外部指令" },
    { id: "who", label: "谁接收" },
    { id: "prefetch", label: "延迟 / 预取" },
    { id: "cut", label: "切画面与 genlock" }
  ],

  commandRows: [
    {
      id: "kommander",
      modes: ["take"],
      form: "预案、时间码、OSC/UDP。未检索到生效帧字段。",
      who: "未检索到是主控转发，还是每台各收一条。",
      prefetch: "未检索到预取帧数。",
      cut: "F30 有 Quadro Sync。未写跳转是否落在同步卡帧号上。",
      evidence: "C"
    },
    {
      id: "novastar",
      modes: ["arrival"],
      form: "389 暂停/播放/停止时间线；390 跳到毫秒；10005 按 Cue 序号跳。参数里没有生效帧。",
      who: "中控打到播控软件。多机何时一起切，协议未写。",
      prefetch: "未检索到。",
      cut: "未写跳转依赖 Sync 卡。",
      evidence: "A"
    },
    {
      id: "hirender",
      modes: [],
      form: "时间线 / 窗口双模式。跳转报文未公开。",
      who: "未检索到。",
      prefetch: "未检索到。",
      cut: "联机帧同步要求 Quadro Sync II。未写指令量化到帧号。",
      evidence: "C"
    },
    {
      id: "grandshow",
      modes: ["arrival", "take"],
      form: "场景/播放中控。引言没有跳转 opcode，也没有生效帧。产品页有时间线触发和 KV 跳场景。",
      who: "中控对软件。GrandShow Sync 的集群报文未公开。",
      prefetch: "未检索到。",
      cut: "规格无独立 Frame Lock 口。Take 是否锁到帧号未写。",
      evidence: "C"
    },
    {
      id: "hecoos",
      modes: [],
      form: "Art-Net / TCP / UDP。未检索到 Seek 或生效帧。",
      who: "Studio 与 Server 分离。跳转如何下到出画机未写。",
      prefetch: "未检索到。",
      cut: "未公开。",
      evidence: "C"
    },
    {
      id: "disguise",
      modes: ["deferred"],
      form: "轨道跳转、Cue List 的 GO。外部可以是 DMX。",
      who: "Director 会话。d3Net 把时间线同步到 Actor。",
      prefetch: "r30.4 起默认延迟 2 帧，用于跨机对齐和 prefetcher。additionalCommandLatency 可加帧。DMX 另加 Redistribution Delay。",
      cut: "多机输出要 genlock。延迟帧解决指令和预取，不替代扫出锁相。",
      evidence: "A"
    },
    {
      id: "watchout",
      modes: ["chase", "take"],
      form: "gotoTime 跳到时间位置；gotoControlCue 跳到命名 Control cue；run / halt。命令名来自 WATCHOUT 6 协议页。",
      who: "WATCHOUT 7：Director 实时广播播放状态，Runner 渲染。",
      prefetch: "load 之后 wait，等到整个集群建立再 run。公开命令表没有「延迟 N 帧再 Seek」。",
      cut: "NTP 管钟。LED 墙要 Hardware Sync Group，否则帧号仍可能错。",
      evidence: "A"
    },
    {
      id: "pixera",
      modes: ["chase", "deferred"],
      form: "SMPTE / LTC / Art-Net / MIDI 驱动 Now 指针。26.3 起用阈值区分小漂移和大跳。",
      who: "USB SMPTE 只能接 Director，Client 不支持。音频 LTC 可以接 Director 或 Client。",
      prefetch: "TC Jump Preload Delay：指针立刻跳，旧画面继续，预载完成再切。Pause Until 先把指针放到偏移位置，等时码走到才开播。",
      cut: "这一条写的是播放头。出画锁相仍要 Quadro Sync。",
      evidence: "A"
    },
    {
      id: "7thsense",
      modes: ["chase", "deferred", "take"],
      form: "GOTOFRAME 帧号、GOTOTIME 时码加帧率、GOTOMARKER 标记名，可选接着播放。",
      who: "这些跳转只对 Leader 有效。Follower 从 Leader 收指令和 timing packet，并应答完成。",
      prefetch: "无缝模式预缓存跳入点。纯视频至少 5 帧，编码或音频建议 100–200 帧。外部 GOTO 会晚切；关掉无缝则立即跳，时间线会停一帧。CUE 之后等 PLAY。Servers Ready 统计已 cue 的台数。无缝时 Goto/Loop 必须在每台的同一时码上。",
      cut: "无 genlock 约 ±1 帧，有 genlock 才帧准确。Leader 挂了，全组停。",
      evidence: "A"
    },
    {
      id: "pandoras",
      modes: ["chase"],
      form: "序列 Now 指针。SMPTE Receive 只应开在一个 Multi-User Place。DMX、GPI 本身不带同步。",
      who: "指令先堆在 Master，经 MediaNet 按 Master 时钟在各 Client 上一起处理。",
      prefetch: "手册写 frame adaptive，没有公开的延迟帧数。视频必须是基本流，嵌音频会把同步拐到音频上。",
      cut: "这条网络同步写的是 Master 时钟。多 GPU Mosaic 另要 Sync 卡。",
      evidence: "A"
    }
  ],

  commandDecode: {
    lead: "切点当帧要能拿出目标画面。帧号约定的是这一拍播哪一帧，屏幕上的像素来自解码器是否已经把那一帧交进显存。7thSense 写纯视频预卷至少 5 帧，编码或音频建议 100–200 帧；disguise 用默认 2 帧延迟让 prefetcher 先读跳转点，避免黑帧。长 GOP 的 H.264/H.265 若没有提前解到切点，各机即使约定了同一帧号，扫出去的仍是黑场或旧画面。",
    duties: [
      { t: "生效帧", d: "各机约定这一拍的内容身份：时间线走到哪、Cue 切到哪。Genlock 只把「何时开始扫」锁在一起。" },
      { t: "可呈现的图", d: "这一拍扫描沿上，显存里已经画好、可以送出去的那张图。解码、上传没完成，帧号对了也看不见新画面。" }
    ],
    misses: [
      { t: "黑场", d: "新纹理还没上传。各机一起闪黑，或只有慢的那几台闪黑。" },
      { t: "旧画面", d: "解码器还停在上一张成功的图。指针可以已经到了新时间，观众看见的仍是切之前的节目。" },
      { t: "接缝错开", d: "有的机已经换成新图，有的机还在扫旧图。同步灯是锁上的，箱体接缝仍然撕。" }
    ],
    gopLead: "H.264/H.265 为了省码率，一组画面里通常只有一张可以独立解开的 IDR（或 I 帧）。后面的 P 帧、B 帧只记录和参考帧的差别。一组的长度常常是半秒到两秒；60 帧刷新时就是几十到上百帧。这组的长度就是 GOP。跳到时间 T，不能从 T 直接读出一张图。",
    gopSteps: [
      "在文件里找到 T 之前最近的那张 IDR。",
      "从那张 IDR 按解码顺序往后解。P 帧依赖前面的帧，不能跳着解。",
      "有 B 帧时，显示顺序和解码顺序不一致。要显示出 T，往往还得先解掉 T 后面的参考帧。开放 GOP 的 B 帧还会引用上一组，安全起点比上一张 I 帧更早。",
      "解出的图上传到 GPU，等下一次扫描把它送出去。输出在这之前仍是旧画面。"
    ],
    gopNote: "这段回退加解码就是预卷。7thSense 的 Preroll Frames：纯视频至少 5 帧，编码或音频建议 100–200 帧。5 帧是读盘、解码、上传、排队呈现的最短流水线；时间线若是 60 帧，大约 80 毫秒。100–200 帧大约 1.7–3.3 秒，用来盖住「退回 IDR 再向前解」，以及比视频更长的音频缓冲。音频要无缝接上，下一段得提前在下一个时钟周期 cue 好。这是解码约束，不是某一家没公开的报文。",
    budgetKeys: [
      { id: "who", label: "谁" },
      { id: "budget", label: "留出的时间" },
      { id: "buys", label: "这段时间在买什么" },
      { id: "grade", label: "证据" }
    ],
    budgets: [
      { who: "disguise", budget: "r30.4 起默认延迟 2 帧。60 帧下约 33 毫秒。可加 additionalCommandLatency。", buys: "各机收到同一条跳转，并在同一未来帧生效；prefetcher 开始读跳转点，避免第一张是黑场。2 帧只够对齐和起动预取，盖不住一个 2 秒的 GOP。内容重就加帧。外部 DMX 还要另加 Redistribution Delay。", grade: "A" },
      { who: "PIXERA 26.3", budget: "TC Jump Preload Delay，长度可配。", buys: "Now 指针立刻跳到新位置，画面继续播旧的，预载完成才换输出。小于阈值的时码抖动走漂移校正，不当成跳转。", grade: "A" },
      { who: "7thSense", budget: "纯视频至少 5 帧；编码或音频 100–200 帧。", buys: "无缝跳转前把跳入点预缓存。外部 GOTO 因此会晚切。关掉无缝则立即跳，时间线会停大约 1 帧。", grade: "A" }
    ],
    divergeLead: "同一条 Seek，每台机器解完的时刻并不相同。Genlock 把这些差异原样扫到屏上。",
    diverge: [
      { t: "离 IDR 的距离", d: "编码或 GOP 结构不同，退回的帧数就不同。同一条成片的两台拷贝，完成时刻仍会受盘和总线忙闲影响。" },
      { t: "盘和 PCIe", d: "7thSense 把掉的影片帧单独计数，原因就是读带宽跟不上请求。" },
      { t: "GPU 队列", d: "一台还在合成上一帧的特效，另一台已经空了。上传深度不同，呈现就差一拍。" },
      { t: "音频缓冲", d: "音频设备的缓冲通常比视频长。视频切了声音还在旧缓冲里，或者反过来。嵌在视频里的音轨还会把 Pandoras Box 的视频同步拐走。" }
    ],
    intraLead: "帧内编码的每一帧自己就能解开。Seek 是读那一帧、解那一帧，不用退回 IDR。切点仍然要走完读、解、上传，所以纯视频仍要至少约 5 帧流水线。它们不需要的是先解完一整组 GOP。",
    intra: [
      { t: "序列帧", d: "DPX、TGA、EXR，或按帧号命名的图片。随机访问就是打开对应文件。" },
      { t: "ProRes", d: "帧内编码，任意帧可以独立解。" },
      { t: "HAP", d: "按块压成 GPU 能直接解的纹理，媒体服务器用它做随机访问。" },
      { t: "NotchLC", d: "面向 GPU 的帧内编码，同样不必退回一组 GOP。" }
    ],
    intraNote: "长 GOP 的 H.264/H.265 可以连续播。它不能在切点当帧拿出任意位置的画面。要硬切，得在生效帧之前把目标帧解完，或者事先转成上面的帧内格式。中控协议改成「跳到某一毫秒」，不改变这件事。",
    cutLead: "下面是 60 帧时间线、目标 01:00:00:00、上一张 IDR 在目标前 90 帧时的一次同帧切。现在是第 10000 帧。200 帧大约 3.3 秒，用来盖住 GOP 回退和音频预卷。数字是这个例子的预算，不是某本手册里的固定常数。",
    cutSteps: [
      "主控现在就发出跳转，生效帧写成 10200，而不是收到立刻切。",
      "每台机器立刻把解码器退到那张 IDR，向前解到 01:00:00:00。纹理留在后台，输出仍是当前画面。",
      "解完的机器回报就绪。没解完的不参与这一拍。",
      "到第 10200 帧的扫描沿，就绪的机器一起换成新纹理。",
      "有一台没就绪，整组继续留在旧画面，生效帧往后推。已经解完的那几台不先切。"
    ]
  },

  rackKeys: [
    { id: "gpu", label: "GPU / 一体机" },
    { id: "sync", label: "Sync 卡" },
    { id: "heads", label: "输出头" },
    { id: "capture", label: "采集" },
    { id: "license", label: "授权" }
  ],

  codecKeys: [
    { id: "h26x", label: "H.264/H.265" },
    { id: "prores", label: "HAP/NotchLC/ProRes" },
    { id: "seq", label: "序列帧" },
    { id: "live", label: "NDI/SDI 直播" }
  ],

  chainHops: [
    {
      id: "media",
      name: "素材与编码",
      en: "Codec / transcode",
      fail: "超 8K 用错编码会在解码端先卡死，看起来像「同步坏了」。",
      body: "H.264/H.265 走硬解；HAP / NotchLC / ProRes / 序列帧走磁盘与 GPU 带宽。转码是播出前的工序，不是现场同步手段。",
      vendors: ["kommander", "grandshow", "vmeet", "watchout", "pixera", "disguise"]
    },
    {
      id: "server",
      name: "播控节点",
      en: "Director / Display",
      fail: "Director 出画却不进同步组，控制面自己先撕。",
      body: "控制面管工程与预监，显示节点解码、映射、present。PIXERA / disguise 都写明：出画的机器必须进硬件同步组。",
      vendors: ["disguise", "watchout", "pixera", "hirender", "kommander", "7thsense"]
    },
    {
      id: "gpu",
      name: "GPU 输出口",
      en: "DP / HDMI / Mosaic",
      fail: "Mosaic 拼成超大桌面后，EDID 或刷新不一致，同步组直接失败。",
      body: "物理口才是切片边界。nDisplay 要求独立翻转全屏；PIXERA 要求各机分辨率/刷新/EDID 一致。RJ45 Sync 口不是以太网。",
      vendors: ["ndisplay", "pixera", "watchout", "hirender", "kommander", "pandoras"]
    },
    {
      id: "proc",
      name: "LED 处理器",
      en: "Sender / Tessera / COEX",
      fail: "处理器没进同一 house-sync，服务器锁了、屏端仍撕。",
      body: "Brompton Tessera 把 genlock 从视频输入一直锁到灯珠刷新。disguise / PIXERA 要求处理器能收 BlackBurst 或 Tri-Level。发送卡「自己对齐」替代不了 GPU 锁。",
      vendors: ["brompton", "novastar-mx", "disguise", "pixera", "novastar", "grandshow"]
    },
    {
      id: "rx",
      name: "接收卡与箱体",
      en: "Receiving card",
      fail: "配屏文件和切片清单对不上，几何对了相位也对不齐。",
      body: "诺瓦 / 卡莱特垂直整合的价值在这里：播控可读连接关系文件，降低配屏成本。这是产品策略，不是 L2/L3 同步策略。",
      vendors: ["novastar", "novastar-mx", "grandshow", "kommander", "brompton"]
    },
    {
      id: "cabinet",
      name: "箱体扫出",
      en: "Panel refresh",
      fail: "摄像机看得到滚动黑条，墙边肉眼却不一定看见。",
      body: "箱体刷新要和输入帧率成整数倍。Tessera 手册写：输入帧率与参考不一致时会加倍或丢帧；关键同步必须让输入帧率等于参考。",
      vendors: ["brompton", "novastar-mx", "disguise", "pixera"]
    }
  ],

  rack: [
    { id: "kommander", gpu: "F30：3×Quadro", sync: "Quadro Sync II；2×RJ45 + BNC（A）", heads: "9×DP + 3×Type-C", capture: "NDI；SDI 选配", license: "加密授权", h26x: "yes", prores: "unknown", seq: "partial", live: "yes", evidence: "B" },
    { id: "novastar", gpu: "工作站多显卡（FX1 起优化）", sync: "未公开强制 Sync 卡", heads: "随控制器带载", capture: "云端素材 / 图片直播", license: "临时/永久授权", h26x: "yes", prores: "unknown", seq: "yes", live: "partial", evidence: "A" },
    { id: "hirender", gpu: "S3 宣传 6 路 4K", sync: "联机帧同步需 Sync II（A）", heads: "多 DP，网格拼接", capture: "采集卡、NDI", license: "加密锁", h26x: "yes", prores: "unknown", seq: "unknown", live: "yes", evidence: "A" },
    { id: "grandshow", gpu: "CS20-8K / CS16K 一体机", sync: "GrandShow Sync，无独立 Frame Lock 口（B）", heads: "点对点多口", capture: "Pad 回显", license: "加密狗", h26x: "yes", prores: "unknown", seq: "yes", live: "partial", evidence: "C" },
    { id: "hecoos", gpu: "OpenGL / Direct3D 工作站", sync: "未公开", heads: "Studio 默认不出画", capture: "设备库采集", license: "会员 / 输出模块分档", h26x: "partial", prores: "unknown", seq: "unknown", live: "unknown", evidence: "B" },
    { id: "disguise", gpu: "gx / vx 专业机", sync: "Sync Card；Solo 只能内部锁", heads: "多头 Framelock", capture: "VFC / IP-VFC", license: "节点许可", h26x: "yes", prores: "yes", seq: "yes", live: "yes", evidence: "A" },
    { id: "watchout", gpu: "WATCHPAX 或自建机", sync: "Hardware Sync Group + NVIDIA Sync", heads: "Runner 多口；SDI 可另开 Genlock", capture: "NDI、ST 2110", license: "软件许可", h26x: "yes", prores: "partial", seq: "yes", live: "yes", evidence: "A" },
    { id: "vmeet", gpu: "SG-C32 等超高分服务器", sync: "未公开卡型", heads: "宣传 32 路 4K 级", capture: "NDI", license: "软硬件一体", h26x: "yes", prores: "yes", seq: "yes", live: "yes", evidence: "C" },
    { id: "pixera", gpu: "four 等官方机预装", sync: "Quadro Sync II，CAT 直连", heads: "LED remap 进常规口", capture: "Spout、Live", license: "Director / Client", h26x: "yes", prores: "yes", seq: "partial", live: "yes", evidence: "A" },
    { id: "7thsense", gpu: "多 GPU + Sync 卡", sync: "Quadro Sync II BNC house-sync", heads: "多口 output locking", capture: "LTC 作时间线", license: "一体机许可", h26x: "partial", prores: "yes", seq: "yes", live: "partial", evidence: "A" },
    { id: "hippotizer", gpu: "Hippotizer 系列机", sync: "主功能页未展开", heads: "VideoMapper 多分辨率", capture: "CITP / 媒体网", license: "加密狗", h26x: "yes", prores: "partial", seq: "unknown", live: "partial", evidence: "B" },
    { id: "resolume", gpu: "单机消费/专业卡", sync: "不是这条路", heads: "Advanced Output 切片", capture: "Spout / Syphon", license: "软件许可", h26x: "yes", prores: "partial", seq: "no", live: "yes", evidence: "A" },
    { id: "ndisplay", gpu: "同规格 NVIDIA 专业卡", sync: "Quadro Sync II + Render Sync Nvidia(2)", heads: "Mosaic 合成主显示", capture: "引擎视口，非播控解码", license: "UE", h26x: "no", prores: "no", seq: "no", live: "partial", evidence: "A" },
    { id: "touchdesigner", gpu: "多 GPU 自建", sync: "外挂，非产品化", heads: "自定义", capture: "NDI、Spout", license: "Commercial 许可", h26x: "partial", prores: "partial", seq: "partial", live: "yes", evidence: "B" },
    { id: "pandoras", gpu: "P4000 / RTX A4000 / RTX 6000", sync: "可选 NVIDIA Sync；多 GPU Mosaic 需要", heads: "Server 多口", capture: "SDI / HDMI 输入卡", license: "软件 + 加密", h26x: "yes", prores: "partial", seq: "partial", live: "yes", evidence: "A" },
    { id: "screenberry", gpu: "自建媒体服务器", sync: "帮助页未写 Quadro 菊花链", heads: "多 Canvas / Display 节点", capture: "NDI 等节点", license: "Server + Panel", h26x: "yes", prores: "partial", seq: "unknown", live: "partial", evidence: "A" },
    { id: "brompton", gpu: "无（处理器）", sync: "Bi/Tri-level 或视频输入 genlock", heads: "10GbE 到灯具", capture: "HDMI / 12G-SDI", license: "处理器固件", h26x: "no", prores: "no", seq: "no", live: "yes", evidence: "A" },
    { id: "novastar-mx", gpu: "无（处理器）", sync: "Genlock IN/LOOP：Bi/Tri-level、Blackburst（A）", heads: "20×网口 + 4×10G 光", capture: "HDMI 2.0 / DP 1.2 / 12G-SDI", license: "控制器固件", h26x: "no", prores: "no", seq: "no", live: "yes", evidence: "A" }
  ],

  tears: [
    {
      id: "ntp-only",
      name: "只 NTP，无帧计数",
      grade: "A",
      symptom: "节目进度齐，相邻箱体整帧错位。",
      body: "WATCHOUT：NTP 把钟拉到约 1 ms，GPU 仍各自扫出。LED 处理器上看就是撕缝。必须把计时源切到同步卡帧计数。",
      vendors: ["watchout", "7thsense", "hirender", "pixera", "ndisplay"],
      layers: ["wallClock", "frameId"]
    },
    {
      id: "genlock-no-id",
      name: "有 Genlock，无 frame identity",
      grade: "A",
      symptom: "相位锁住了，内容仍差一帧。",
      body: "Genlock 只回答「何时开始扫」。WATCHOUT 与 disguise 的 tearing 诊断都把「集群渲染了不同帧」单列。缺 swap barrier / 帧计数就会整帧错位。",
      vendors: ["watchout", "disguise", "ndisplay", "pixera"],
      layers: ["frameId", "scanout"]
    },
    {
      id: "director-out",
      name: "Director 出画却不进 Sync 组",
      grade: "A",
      symptom: "预监或控制机自己先撕，显示端是齐的。",
      body: "PIXERA：Director 若也出画必须进同步组。disguise Dedicated Director 多机时也建议 genlock。控制面默认不应出画。",
      vendors: ["pixera", "disguise", "watchout"],
      layers: ["scanout"]
    },
    {
      id: "proc-free",
      name: "处理器未进同一 house-sync",
      grade: "A",
      symptom: "服务器锁了，摄像机或箱体接缝仍撕。",
      body: "LED 处理器、摄像机必须进同一基准。Brompton：多处理器要 genlock 到同一源或互相锁，并匹配端到端延迟。disguise / PIXERA VP 路径写明处理器要能收 genlock。",
      vendors: ["brompton", "novastar-mx", "disguise", "pixera", "watchout"],
      layers: ["scanout"]
    },
    {
      id: "mosaic-edid",
      name: "Mosaic / EDID / 刷新不一致",
      grade: "A",
      symptom: "同步组加不进去，或加进去后随机撕。",
      body: "PIXERA：分辨率、刷新、EDID 必须一致。nDisplay：Mosaic 拼桌面，PresentMode 需 Independent Flip。Pandoras Box：多 GPU Mosaic 需要 Sync 卡把虚拟桌面锁在一起。",
      vendors: ["pixera", "ndisplay", "pandoras", "watchout"],
      layers: ["scanout"]
    },
    {
      id: "backup-cut",
      name: "主备切错了对象",
      grade: "B",
      symptom: "切备后工程丢了，或只镜像了桌面没锁帧。",
      body: "国内常见主备实时同步输出（Kommander / HiRender）。disguise 是 Director / Understudy。WATCHOUT 是多 Runner，不是镜像桌面。Backup 同步的是操作与工程，不要把 Sync 网接到交换机上。",
      vendors: ["kommander", "hirender", "disguise", "watchout", "grandshow"],
      layers: ["wallClock"]
    },
    {
      id: "leader-down",
      name: "Leader 挂了全组停",
      grade: "A",
      symptom: "不是热备失败，是计时源丢失。",
      body: "7thSense Timing Group：Leader 广播 playhead，Follower 跟帧。Leader 挂了则全组停。这是架构取舍，不要拿国内主备桌面模型去套。",
      vendors: ["7thsense"],
      layers: ["wallClock", "frameId"]
    },
    {
      id: "ltc-glitch",
      name: "LTC 毛刺直接去跟",
      grade: "A",
      symptom: "时间线乱跳、短暂停又猛追，或长节目慢慢漂。",
      body: "LTC 接收会出现 bi-phase 畸形、丢帧、重复帧、跳变、非法 BCD。WATCHOUT LTC Bridge 把这些分开计数；无效超过约 100 ms 就暂停时间线。正确做法是校验、飞轮、迟滞锁定。LTC 只拉播放头，不能替代 Frame Lock。源自己也要 genlock。",
      vendors: ["watchout", "7thsense", "kommander", "pandoras"],
      layers: ["wallClock"]
    },
    {
      id: "seek-prefetch",
      name: "跳转到了，目标帧还没换上",
      grade: "A",
      symptom: "各机一起黑一帧，或有的机先切、有的机仍停在旧画面。Genlock 灯是锁上的。",
      body: "扫出相位对齐，只说明各机同一时刻开始扫，不说明扫的是切换后的那一帧。disguise 把轨道跳转默认推迟 2 帧，就是为了让 prefetcher 先读到跳转点，否则出黑帧。7thSense 无缝模式要预缓存跳入点：纯视频至少 5 帧，编码或音频建议 100–200 帧；外部 GOTO 因此会晚切，关掉无缝则立即跳，时间线会停一帧。长 GOP 的 H.264/H.265 若没有提前解到切点，各机即使约定了同一帧号，屏幕上仍是黑帧或旧帧。序列帧和帧内编码可以在切点直接取那一帧。",
      vendors: ["disguise", "7thsense", "pixera", "watchout"],
      layers: ["wallClock", "frameId"]
    }
  ],

  scenes: [
    {
      id: "expo",
      name: "展厅长卷",
      body: "超宽矩形、点对点、计划任务。垂直整合和预案切点更重要。",
      vendors: ["novastar", "grandshow", "kommander", "hirender", "watchout"]
    },
    {
      id: "tour",
      name: "巡演 LED",
      body: "每天拆装、对象映射、控台联动。3D 舞台 + genlock 处理器是主路径。",
      vendors: ["disguise", "pixera", "pandoras", "hippotizer", "brompton", "novastar-mx"]
    },
    {
      id: "xr",
      name: "XR 虚拟制片",
      body: "摄像机、跟踪、LED 处理器、服务器必须同 genlock。nDisplay 是渲染集群，不是时间线播控。",
      vendors: ["disguise", "pixera", "ndisplay", "brompton", "novastar-mx"]
    },
    {
      id: "dome",
      name: "球幕 / 隧道",
      body: "几何以模型 + UV 为源。国内球幕对照是 VMEET；主题公园长时间循环看 7thSense。",
      vendors: ["vmeet", "7thsense", "grandshow", "hecoos", "screenberry"]
    },
    {
      id: "facade",
      name: "楼宇亮化",
      body: "分辨率极高、刷新可以更低。序列帧与计划任务常见，硬同步文档往往最薄。",
      vendors: ["vmeet", "grandshow", "resolume", "hippotizer"]
    }
  ],

  controlHeat: {
    kommander: { artnet: "yes", osc: "yes", midi: "yes", ltc: "yes", ndi: "yes", spout: "yes", udp: "yes" },
    novastar: { artnet: "unknown", osc: "unknown", midi: "unknown", ltc: "partial", ndi: "unknown", spout: "no", udp: "yes" },
    hirender: { artnet: "yes", osc: "unknown", midi: "unknown", ltc: "partial", ndi: "yes", spout: "unknown", udp: "partial" },
    grandshow: { artnet: "partial", osc: "unknown", midi: "partial", ltc: "partial", ndi: "unknown", spout: "no", udp: "yes" },
    hecoos: { artnet: "yes", osc: "unknown", midi: "unknown", ltc: "partial", ndi: "unknown", spout: "no", udp: "yes" },
    disguise: { artnet: "yes", osc: "yes", midi: "yes", ltc: "yes", ndi: "partial", spout: "no", udp: "partial" },
    watchout: { artnet: "partial", osc: "partial", midi: "partial", ltc: "yes", ndi: "yes", spout: "no", udp: "yes" },
    vmeet: { artnet: "unknown", osc: "unknown", midi: "unknown", ltc: "unknown", ndi: "yes", spout: "no", udp: "yes" },
    pixera: { artnet: "yes", osc: "partial", midi: "unknown", ltc: "partial", ndi: "partial", spout: "yes", udp: "partial" },
    "7thsense": { artnet: "partial", osc: "unknown", midi: "unknown", ltc: "yes", ndi: "unknown", spout: "no", udp: "partial" },
    hippotizer: { artnet: "yes", osc: "yes", midi: "yes", ltc: "yes", ndi: "partial", spout: "no", udp: "yes" },
    resolume: { artnet: "yes", osc: "yes", midi: "yes", ltc: "no", ndi: "partial", spout: "yes", udp: "no" },
    ndisplay: { artnet: "no", osc: "partial", midi: "no", ltc: "no", ndi: "no", spout: "no", udp: "no" },
    touchdesigner: { artnet: "yes", osc: "yes", midi: "yes", ltc: "partial", ndi: "yes", spout: "yes", udp: "partial" },
    pandoras: { artnet: "yes", osc: "partial", midi: "yes", ltc: "yes", ndi: "partial", spout: "no", udp: "partial" },
    screenberry: { artnet: "unknown", osc: "partial", midi: "yes", ltc: "partial", ndi: "partial", spout: "no", udp: "yes" },
    brompton: { artnet: "yes", osc: "no", midi: "no", ltc: "no", ndi: "no", spout: "no", udp: "no" },
    "novastar-mx": { artnet: "unknown", osc: "no", midi: "no", ltc: "no", ndi: "no", spout: "no", udp: "partial" }
  },

  uiArchetypes: [
    {
      id: "window",
      name: "窗口 / 预案型",
      vendors: ["kommander", "novastar", "hirender", "grandshow"]
    },
    {
      id: "timeline",
      name: "时间线型",
      vendors: ["kommander", "hirender", "watchout", "disguise"]
    },
    {
      id: "stage",
      name: "3D 舞台型",
      vendors: ["disguise", "pixera", "hecoos", "watchout"]
    }
  ],

  uiGallery: [
    {
      id: "kommander-window",
      vendorId: "kommander",
      product: "Kommander T3",
      arch: "window",
      file: "ui/kommander-main.webp",
      zones: ["PGM/PVW", "素材库", "预案网格", "属性"],
      sourceTitle: "USER MANUAL 2025 · Main Application Launch Interface",
      sourceUrl: "https://www.kommander.com.cn/filespath/files/USER%20MANUAL%202025-%20Software.pdf"
    },
    {
      id: "kommander-timeline",
      vendorId: "kommander",
      product: "Kommander T3",
      arch: "timeline",
      file: "ui/kommander-timeline.webp",
      zones: ["时间线", "画布", "资源", "属性"],
      sourceTitle: "USER MANUAL 2025 · Timeline mode",
      sourceUrl: "https://www.kommander.com.cn/filespath/files/USER%20MANUAL%202025-%20Software.pdf"
    },
    {
      id: "kompass-window",
      vendorId: "novastar",
      product: "Kompass FX3",
      arch: "window",
      file: "ui/kompass-main.webp",
      zones: ["素材库", "舞台编辑", "节目管理", "Live/Pre-Edit"],
      sourceTitle: "Kompass FX3 User Manual V3.13.0 · Figure 3-1 User interface",
      sourceUrl: "https://oss.novastar.tech/uploads/2025/10/Kompass-FX3-Multimedia-Playback-Software-User-Manual-V3.13.0.pdf"
    },
    {
      id: "grandshow-window",
      vendorId: "grandshow",
      product: "GrandShow",
      arch: "window",
      file: "ui/grandshow-main.webp",
      zones: ["Resource", "Screen/Window", "Program", "Property"],
      sourceTitle: "GrandShow User Manual V2.0 · Figure 4-2 Main interface",
      sourceUrl: "https://buyledcard.com/led-soft-download/colorlight/Grandshow-UsermanualV2.0_1673836129.pdf?id=5052"
    },
    {
      id: "hirender-window",
      vendorId: "hirender",
      product: "HiRender S2",
      arch: "window",
      file: "ui/hirender-main.webp",
      zones: ["素材库", "舞台窗口", "节目管理", "属性"],
      sourceTitle: "Hirender S2 用户使用手册 · 操作界面",
      sourceUrl: "https://www.hirender.com/files/Hirender%20S2%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6.pdf"
    },
    {
      id: "hecoos-missing",
      vendorId: "hecoos",
      product: "hecoos Studio",
      arch: "stage",
      file: null,
      zones: ["菜单", "舞台区", "左右停靠"],
      note: "公开页无独立主界面图，见布局示意。Quick User Guide 原地址已 404。",
      sourceTitle: "hecoos Quick User Guide（原 Interface layout 页）",
      sourceUrl: "https://www.hecoos.com/download/Quick_User_Guide_en.pdf"
    },
    {
      id: "disguise-ui",
      vendorId: "disguise",
      product: "disguise Designer",
      arch: "stage",
      file: "ui/disguise-main.webp",
      zones: ["Dashboard", "Stage Visualiser", "Timeline", "Transport"],
      sourceTitle: "Designer User Interface",
      sourceUrl: "https://help.disguise.one/designer/ui/designer-user-interface"
    },
    {
      id: "disguise-stage",
      vendorId: "disguise",
      product: "disguise Designer",
      arch: "stage",
      file: "ui/disguise-stage.webp",
      zones: ["3D Stage", "Track Player", "Cue List"],
      sourceTitle: "Designer User Interface · GUI",
      sourceUrl: "https://help.disguise.one/designer/ui/designer-user-interface"
    },
    {
      id: "watchout-main",
      vendorId: "watchout",
      product: "WATCHOUT 7 Producer",
      arch: "timeline",
      alsoArch: ["stage"],
      file: "ui/watchout-main.webp",
      zones: ["Stage", "Timeline", "Assets", "Properties", "Nodes"],
      sourceTitle: "Producer User Interface",
      sourceUrl: "https://docs.dataton.com/watchout-7/producer/doc.html"
    },
    {
      id: "pixera-main",
      vendorId: "pixera",
      product: "PIXERA",
      arch: "stage",
      file: "ui/pixera-main.webp",
      zones: ["Tabs", "Selection", "Workspace", "Inspector", "Timeline"],
      sourceTitle: "User Interface Overview",
      sourceUrl: "https://pixera.helpjuice.com/user-interface-/user-interface-overview"
    }
  ],

  vendors: [
    {
      id: "kommander",
      name: "Kommander",
      also: "kCommander / 凯视达媒体服务器",
      company: "湖南泊湾科技，产品进入凯视达媒体服务器与 T 系列生态",
      region: "cn",
      depth: "deep",
      product: "T3 / T1 / T0 / M3（Mac）/ F30 三卡服务器",
      positioning: "中大型舞台、会议、超大屏与异形屏拼接播控",
      topology: "Master / Backup / Control / Slave。控制端集中管理多联机，显示端级联带载。",
      single: "宣称不限通道与图层；8K@60 硬解码；F30 为 3×Quadro、9×DP + 3×Type-C，规格书列同步卡 Quadro Sync II。",
      multi: "KFS 多联机帧同步：多台服务器级联，画面统一控制。应用层报文未公开（C）。F30 英文规格写 2×RJ45 Framelock + 1×BNC Genlock，L3 物理层可落到 NVIDIA Frame Lock CAT5（A/B）。",
      sync: { wallClock: "时间码收发（C）", frameId: "KFS 帧同步，报文未公开（C）", scanout: "F30：Quadro Sync II，2×RJ45 Framelock + BNC Genlock（A）", transport: "未见 ST 2110/PTP" },
      backup: "主备实时同步输出，主端异常切备端。",
      irregular: "虚拟屏拆分重组、1:1 布局映射；投影融合支持穹顶 / U 幕。以 2D 虚拟屏为主，3D 舞台对象弱于 disguise / hecoos。",
      coupling: "可联动凯视达拼接器预案；与发送卡同生态但不等于必须绑定。",
      control: "时间码、MIDI、DMX、OSC、NDI、Spout、UDP、Pad 中控",
      mapping: ["slice2d", "projBlend"],
      heat: { ntp: "partial", quadro: "yes", genlock: "unknown", ptp: "no", map3d: "partial", slice2d: "yes", backup: "yes", vertical: "partial" },
      layers: ["wallClock", "frameId", "scanout"],
      mappingStage: [1, 4, 5],
      uiArch: ["window", "timeline"],
      evidence: "B",
      evidenceNote: "软件能力来自官网与手册（KFS、主备、虚拟屏为官方表述）。F30 中文规格书列 Quadro Sync II；英文 datasheet 写明 2×RJ45 Framelock + 1×BNC Genlock。KFS 软件是否完全等于这块卡的 Frame Lock，公开页未画等号。",
      sources: [
        { t: "T3 产品页（凯视达）", u: "https://www.kystar.com.cn/Products_desc/236/2144.html" },
        { t: "Kommander T3 产品页", u: "https://www.kommander.com.cn/goods/special/pid/1/cid/7/sid/76.html" },
        { t: "F30 规格（含 Sync II）", u: "https://kystar.com.cn/filespath/files/pdf/20250616135957.pdf" },
        { t: "F30 英文规格（Framelock / Genlock 口）", u: "https://en.kystar.net/wp-content/uploads/2025/10/Kommander-F30-Media-Server-Datasheet_2509.pdf" }
      ]
    },
    {
      id: "novastar",
      name: "Kompass",
      also: "诺瓦星云播控软件",
      company: "西安诺瓦星云科技股份有限公司",
      region: "cn",
      depth: "deep",
      product: "Kompass FX0 / FX1 / FX2 / FX3 / FX3 Pro，配套 Unico、NovaLCT、COEX 发送设备",
      positioning: "展厅、广告、会议为主，逐步补演出级多机与 AI 能力",
      topology: "主机 / 从机联机，FX1 V3.13 支持跨网段添加从机。",
      single: "超大分辨率图片直播；多显卡支持在 FX1 V3.12 起优化；与诺瓦控制器点对点带载绑定深。",
      multi: "FX1 V3.13 新增序列帧多机帧同步；同步方式新增 Lora 模块。FX3 Pro 宣称多设备级联、帧级同步。Lora 是无线 LoRa 对时（L1），精度与有线 Frame Lock 不在同一量级。载荷未公开。",
      sync: { wallClock: "联机时钟 + LoRa 无线对时（PHY 名 A / 载荷 C）", frameId: "序列帧多机帧同步；专利描述场同步内校准从端帧指示（A 专利 / C 产品映射）", scanout: "未公开是否强制 Quadro Sync", transport: "未见播控侧 PTP" },
      backup: "产品线强调设备与云端管理，主备热切不是对外主卖点。",
      irregular: "分屏、特效、蒙版；异形深度弱于 GrandMapping / hecoos。几何主要在诺瓦控制系统与 SmartLCT 配屏侧。",
      coupling: "强垂直整合：播控 → 控制器 / 接收卡。这是诺瓦相对纯软件媒体服务器的结构差异。",
      control: "中控协议公开；云端素材；AI 生图与内容审核（需授权）",
      mapping: ["slice2d"],
      heat: { ntp: "partial", quadro: "unknown", genlock: "unknown", ptp: "no", map3d: "no", slice2d: "yes", backup: "partial", vertical: "yes" },
      layers: ["wallClock", "frameId"],
      mappingStage: [4, 5],
      uiArch: ["window"],
      evidence: "A",
      evidenceNote: "版本说明来自诺瓦下载中心。Lora 模块写在 FX1 V3.13 更新说明里；Taurus 系手册把 LoRa 写成 NTP 主从校时，不能把 Kompass Lora 升级成 GPU 扫出锁。多设备同步校准专利可复核；专利是否等于 Kompass 运行时实现不能从公开页直接画等号。",
      sources: [
        { t: "Kompass 下载中心", u: "https://www.novastar-led.cn/index/downloadcenter/downloaddatacontent.html?cateID=47&type=software" },
        { t: "FX3 Pro 产品页", u: "https://www.novastar-led.cn/index.php/index/products/index/id/130.html" },
        { t: "专利 CN202210927168.1 报道", u: "http://stock.stockstar.com/RB2024051100002237.shtml" }
      ]
    },
    {
      id: "hirender",
      name: "HiRender",
      also: "Hirender S3 / S2 / S1",
      company: "Hirender（官网 hirender.com）",
      region: "cn",
      depth: "deep",
      product: "S3 旗舰播控，S2 时间线服务器软件",
      positioning: "展览、会议、演出；LED 拼接与投影融合同一套软件",
      topology: "控制端 + 无限添加显示端；一主一备；局域网级联。",
      single: "单台 S3 宣传可 6 路 4K；网格调整与融合带。",
      multi: "多台无限级联。S3 4.5.0 更新说明写明：联机帧同步需要 NVIDIA Quadro Sync II。",
      sync: { wallClock: "联机渲染帧率自适应（手册）", frameId: "联机帧同步（依赖 Sync 卡，B/A 更新说明）", scanout: "Quadro Sync II（A）", transport: "无" },
      backup: "主备同步性在 4.5.0 中优化，宣称无缝切换。",
      irregular: "投影 3D Mapping 是明确卖点；LED 侧以拼接、网格、融合为主。",
      coupling: "软件向，不绑特定发送卡；NVIDIA 专业卡与 Sync 卡是硬门槛。",
      control: "DMX 灯库、NDI、采集卡、时间线 / 窗口双模式",
      mapping: ["slice2d", "proj3d"],
      heat: { ntp: "partial", quadro: "yes", genlock: "unknown", ptp: "no", map3d: "partial", slice2d: "yes", backup: "yes", vertical: "no" },
      layers: ["wallClock", "frameId", "scanout"],
      mappingStage: [3, 4, 5],
      uiArch: ["window", "timeline"],
      evidence: "A",
      evidenceNote: "联机帧同步依赖 Sync II 来自 S3 4.5.0 版本说明，是国内少数把卡型写进更新日志的厂商。",
      sources: [
        { t: "Hirender 官网", u: "https://www.hirender.com/" },
        { t: "S3 4.5.0 更新（帧同步需 Sync II）", u: "http://www.hirender.com.cn/post/21.html" },
        { t: "S2 手册", u: "https://www.hirender.com/files/Hirender%20S2%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%E4%B9%A6.pdf" }
      ]
    },
    {
      id: "grandshow",
      name: "GrandShow",
      also: "卡莱特 CS 系列 + GrandMapping",
      company: "卡莱特云科技 / Colorlight",
      region: "cn",
      depth: "deep",
      product: "GrandShow 服务器软件；GrandMapping 三维映射；CS20-8K / CS16K 等一体机",
      positioning: "数字展厅、文旅、超 8K 长卷、球形与异形屏固装",
      topology: "多台 CS 服务器 + GrandShow Sync；素材统一分发；Pad 回显。",
      single: "CS16K 宣称单机超 16K 解码；ffmpeg / DXVA；序列帧。",
      multi: "GrandShow Sync：数十台按帧同步点对点输出。CS20-8K 规格只列 2.5GbE，没有独立 Frame Lock 口，推断走以太网（B）。应用层报文未公开（C）。卡莱特「GrandShow 播控协议」是中控，不是帧同步。",
      sync: { wallClock: "时间线 + 触发指令 / 中控 UDP（C）", frameId: "GrandShow Sync 按帧同步，报文未公开（C）", scanout: "规格无独立同步口；未写 NVIDIA Sync（B）", transport: "无" },
      backup: "工程与展厅方案常配拼接器环路备份，软件主备不是对外主文档。",
      irregular: "GrandShow 内 2D 批量切片、变形、旋转；球形/弧形走独立软件 GrandMapping：3D 模型 → 视角 → 自动切片 → 导入发送卡连接关系文件。这是国内最接近「3D 建模做 LED 贴图」的量产组合之一。",
      coupling: "GrandMapping 明确对接 Colorlight 发送端连接关系文件，垂直整合强。",
      control: "Pad、中控、PPT 翻页器、控台、云端、时间线外部设备",
      mapping: ["slice2d", "map3d"],
      heat: { ntp: "partial", quadro: "unknown", genlock: "unknown", ptp: "no", map3d: "yes", slice2d: "yes", backup: "partial", vertical: "yes" },
      layers: ["wallClock", "frameId"],
      mappingStage: [1, 2, 3, 4, 5],
      uiArch: ["window"],
      evidence: "C",
      evidenceNote: "Sync 与 Mapping 工作流来自官网与投影时代报道。CS20-8K 规格可核到网口、核不到 Frame Lock 口。帧同步报文、专利号在本次公开检索中未定位到与 GrandShow Sync 同名的授权文本。",
      sources: [
        { t: "GrandShow 产品页", u: "https://www.colorlightinside.com/product/special/158" },
        { t: "CS20-8K / Sync 描述", u: "https://www.colorlightinside.com/product/special/1141" },
        { t: "GrandShow 播控协议（中控，不是帧同步）", u: "https://developer.colorlightcloud.com/grandshowEE/chan-pin-jie-shao.html" },
        { t: "GrandMapping", u: "https://colorlightinside.com/product/special/6255" },
        { t: "投影时代：球形/弧形切片", u: "http://www.pjtime.com/2025/5/382218652166.shtml" }
      ]
    },
    {
      id: "hecoos",
      name: "hecoos",
      also: "hecos / 澜景科技",
      company: "北京澜景科技有限公司",
      region: "cn",
      depth: "deep",
      product: "hecoos Studio（3D 设计预演）+ hecoos Server（现场输出）",
      positioning: "展演全案：舞台、灯光、LED、投影、机械在同一三维时间线里设计并落地",
      topology: "设计端与播放端分离。Studio 无输出；Studio Pro / Server 才带输出模块。",
      single: "OpenGL / Direct3D；超大分辨率解码；真实品牌设备库（灯具、投影、LED）。",
      multi: "公开资料强调设计-执行闭环与协议联动，多机帧同步实现未达到 disguise 手册级透明度。",
      sync: { wallClock: "时间线 + Art-Net / TCP / UDP / DMX（B）", frameId: "未公开帧屏障细节", scanout: "未公开 Sync 卡要求", transport: "无" },
      backup: "未作为主卖点披露。",
      irregular: "国内少有的「先 3D 再播控」。预演材质、灯光、摄像机机位后交给 Server。适合异形空间，但 LED 像素级 UV 是否达到 disguise 对象映射深度，公开页不够细。",
      coupling: "设备库含多家灯具/投影，LED 不绑单一发送卡。",
      control: "Art-Net、TCP/IP、UDP、DMX、USB、中控与云控",
      mapping: ["map3d"],
      heat: { ntp: "partial", quadro: "unknown", genlock: "unknown", ptp: "no", map3d: "yes", slice2d: "partial", backup: "unknown", vertical: "no" },
      layers: ["wallClock"],
      mappingStage: [1, 2, 3, 5],
      uiArch: ["stage"],
      evidence: "B",
      evidenceNote: "产品结构来自官网 Quick Guide 与澜景介绍。多机硬同步不是其公开文档的核心章节。",
      sources: [
        { t: "hecoos 快速指南 PDF", u: "https://www.hecoos.com/download/Quick_User_Guide_en.pdf" },
        { t: "澜景：Studio/Server 体系", u: "https://www.kk77.cn/com/lanjing/news/itemid-25.html" }
      ]
    },
    {
      id: "disguise",
      name: "disguise",
      also: "d3",
      company: "Disguise",
      region: "int",
      depth: "deep",
      product: "Designer + gx / vx 媒体服务器；IP-VFC（ST 2110）",
      positioning: "全球巡演、XR 虚拟制片、复杂 LED 舞台对象映射的事实标准之一",
      topology: "Director / Understudy / 多机 session。Feed View 一键给集群 Apply Genlock。",
      single: "单机多头用 Framelock；无同步卡的 Solo 只能内部锁。",
      multi: "每台 Sync Card 收中心 Clock Source 的 Genlock，锁所有输出头。摄像机、LED 处理器进同一 house-sync。多机时 Dedicated Director 也建议 genlock。",
      sync: { wallClock: "session 内数据同步 + 时间线", frameId: "集群与摄像机同帧（手册强调 tearing 诊断含 cluster 渲染不同帧）", scanout: "Genlock（BlackBurst/Tri-Level）；>1080p 不建议 BlackBurst（A）", transport: "IP-VFC：PTP 生成 GPU lock；无 PTP 则 DP sync，延迟最高（A）" },
      backup: "Director / Understudy 热备是产品结构的一部分。",
      irregular: "3D 舞台、对象映射、投影仪/LED 作为场景对象。UV 与观察点是工作流中心，不是后期滤镜。",
      coupling: "不绑某一家 LED 发送卡；要求处理器能吃 genlock。",
      control: "时间码、DMX、OSC、跟踪、Unreal 集成",
      mapping: ["map3d"],
      heat: { ntp: "partial", quadro: "yes", genlock: "yes", ptp: "yes", map3d: "yes", slice2d: "partial", backup: "yes", vertical: "no" },
      layers: ["wallClock", "frameId", "scanout", "transport"],
      mappingStage: [1, 2, 3, 4, 5],
      uiArch: ["stage", "timeline"],
      evidence: "A",
      evidenceNote: "帮助文档可逐条复核，是本页同步分层的主要锚点之一。",
      sources: [
        { t: "Genlock Configuration", u: "https://help.disguise.one/designer/configuration/genlock-configuration" },
        { t: "Output Sync Test", u: "https://help.disguise.one/designer/networking/output-sync-test" },
        { t: "IP-VFC and Genlock", u: "https://help.disguise.one/hardware/ip-vfc/ip-vfc-genlock" }
      ]
    },
    {
      id: "watchout",
      name: "WATCHOUT",
      also: "Dataton Watchout 7",
      company: "Dataton",
      region: "int",
      depth: "deep",
      product: "WATCHOUT 7 Director + Runner；WATCHPAX 一体机",
      positioning: "展览、主题公园、多投影/LED 固定装置；文档把 NTP 与硬件同步的边界写得最清楚",
      topology: "Director 时间源 + 多 Runner。NTP 由软件托管或交给机房策略。",
      single: "软件定时输出即可；SDI 可另开 Genlock SDI。",
      multi: "默认 NTP 对齐系统钟。LED 墙与融合阵列必须建 Hardware Sync Group：每节点 NVIDIA Sync 卡菊花链，一组 timing server。",
      sync: { wallClock: "NTP，默认 Director 为源，偏移约 1 ms（A）", frameId: "Sync Group 改用同步卡帧计数；24-bit 约 3 天@60fps 溢出，软件会复位并有约 4 帧毛刺（A）", scanout: "NVIDIA framelock；SDI Genlock 只锁信号相位（A）", transport: "ST 2110 用独立 PTP，WATCHOUT 只做 follower（A）" },
      backup: "多 Runner 结构；不是国内式「主备镜像桌面」叙事。",
      irregular: "3D 空间 Eye Point；Warp 几何。LED 超宽条带用显示对象映射，深度介于 2D 与完整对象映射之间。",
      coupling: "硬件中立。",
      control: "时间线、外部协议、NDI、ST 2110",
      mapping: ["slice2d", "warp"],
      heat: { ntp: "yes", quadro: "yes", genlock: "yes", ptp: "yes", map3d: "partial", slice2d: "yes", backup: "partial", vertical: "no" },
      layers: ["wallClock", "frameId", "scanout", "transport"],
      mappingStage: [3, 4, 5],
      uiArch: ["timeline", "stage"],
      evidence: "A",
      evidenceNote: "本页「Genlock ≠ 内容帧同步」的直接出处。",
      sources: [
        { t: "Time Synchronization", u: "https://docs.dataton.com/guide/watchout/network-setup/time-synchronization.html" },
        { t: "Hardware Sync Groups", u: "https://docs.dataton.com/guide/watchout/working-with-shows/show-properties.html" },
        { t: "SDI Genlock vs content", u: "https://docs.dataton.com/guide/watchout/devices/sdi-output.html" }
      ]
    },
    {
      id: "vmeet",
      name: "VMEET",
      also: "深工 / 瑞众科技",
      company: "深圳市瑞众科技有限公司",
      region: "cn",
      depth: "compare",
      product: "VMEET E0–E3 媒体播控；SG-C32-UHD 等超高分服务器",
      positioning: "楼宇亮化、球幕、隧道、CAVE、16K 序列帧固装",
      topology: "控制端 + 多显示端级联；开放 API 自定义控制端。",
      single: "宣传 16K 无损序列帧、AVS3 / ProRes / NotchLC；32 路 4K 级硬件存在于 SG-C32 产品线。",
      multi: "多机帧同步级联，控制端统一画面。实现细节未达手册级。",
      sync: { wallClock: "级联工程同步（C）", frameId: "多联机帧同步（C）", scanout: "未公开", transport: "无" },
      backup: "部分硬件提供同步备份输出环路。",
      irregular: "自定义模型导入；圆角 / 隧道 / 穹顶 / 内球幕；任意多边形分割重组。国内球幕对照样本。",
      coupling: "软硬件一体销售，发送卡中立程度不明。",
      control: "KVM 小屏控大屏、NDI、计划任务、手势",
      mapping: ["map3d", "slice2d"],
      heat: { ntp: "unknown", quadro: "unknown", genlock: "unknown", ptp: "no", map3d: "yes", slice2d: "yes", backup: "partial", vertical: "unknown" },
      layers: ["wallClock", "frameId"],
      mappingStage: [1, 3, 4, 5],
      evidence: "C",
      evidenceNote: "能力清单来自深工官网产品页，缺同步白皮书。",
      sources: [
        { t: "VMEET E3", u: "https://www.sz-ipc.com/productswap.asp?id=273" },
        { t: "16K 球幕服务器", u: "https://www.sz-ipc.cn/productswap.asp?id=274" }
      ]
    },
    {
      id: "pixera",
      name: "PIXERA",
      also: "AV Stumpfl",
      company: "AV Stumpfl",
      region: "int",
      depth: "compare",
      product: "PIXERA 2 Director / Client；four 等硬件",
      positioning: "演出、虚拟制片、LED remap、与 Unreal 合成",
      topology: "一台 Director 控任意数量 Client（含自建机）。Dry Client 可离线预编程 LED mapping。",
      single: "输出 mapping：把 7680×256 一类 LED 条折进 16:9 输出口。",
      multi: "各机 Quadro Sync II，CAT 直连，一 master 多 client；分辨率/刷新/EDID 必须一致。Director 若也出画则必须进同步组。",
      sync: { wallClock: "Director-Client 工程", frameId: "跨机 Sync 模块（A）", scanout: "Quadro Sync II Genlock/Framelock；可锁 house-sync（A）", transport: "非主路径" },
      backup: "多 Client；文档强调 dry/hot 切换而非国内主备桌面。",
      irregular: "LED 模组阵列导入 + warp/remap；VP 场景要求摄像机、跟踪、LED 处理器与一台 PIXERA 同 genlock，Client 之间 framelock。",
      coupling: "硬件中立，官方服务器预装 Sync 模块。",
      control: "Art-Net、Spout、Unreal 插件、Stage Precision 跟踪",
      mapping: ["slice2d", "map3d"],
      heat: { ntp: "partial", quadro: "yes", genlock: "yes", ptp: "no", map3d: "yes", slice2d: "yes", backup: "partial", vertical: "no" },
      layers: ["wallClock", "frameId", "scanout"],
      mappingStage: [1, 4, 5],
      uiArch: ["stage"],
      evidence: "A",
      sources: [
        { t: "Director-Client", u: "https://help.pixera.one/en_US/project-management/manager-client-setup" },
        { t: "Genlock / Framelock", u: "https://help.pixera.one/graphic-cards/synchronize-outputs-genlock-framelock-setup" },
        { t: "VP 与 genlock", u: "https://pixera.one/en/software/features/virtual-production/" }
      ]
    },
    {
      id: "7thsense",
      name: "7thSense Delta",
      also: "DeltaServer",
      company: "7thSense",
      region: "int",
      depth: "compare",
      product: "Delta 媒体服务器",
      positioning: "主题公园、穹顶、长时间循环播放；把「显示锁」和「时间线锁」拆开写",
      topology: "Timing Group：Leader 广播 playhead，Follower 跟帧。无 genlock 时宣称 ±1 帧，有 genlock 则帧准确。Leader 挂了则全组停。",
      single: "多 GPU 经 Sync 卡做 output locking。",
      multi: "推荐每台 BNC 注入同一 house-sync，而不是 RJ45 framelock。LTC 可作公共时间线，但 LTC 源自己也要 genlock，否则长节目会漂。",
      sync: { wallClock: "Leader 二进制时间包 / LTC（A）", frameId: "时间线 playhead 对齐（A）", scanout: "house-sync → Quadro Sync II BNC（A）", transport: "无作为主路径" },
      backup: "Leader 故障模型明确：跟帧参考丢失。这是架构取舍，不是热备。",
      irregular: "穹顶/异形投影是传统强项，LED 墙是同一套输出锁逻辑。",
      coupling: "硬件中立。",
      control: "LTC、show control、word clock 音频",
      mapping: ["proj3d"],
      heat: { ntp: "no", quadro: "yes", genlock: "yes", ptp: "no", map3d: "partial", slice2d: "partial", backup: "no", vertical: "no" },
      layers: ["wallClock", "frameId", "scanout"],
      mappingStage: [3, 4, 5],
      evidence: "A",
      sources: [
        { t: "Genlock: Synchronizing Devices", u: "https://portal.7thsense.one/user-guides/M280-synchronising-delta/tc_synchronising.html" },
        { t: "Timing Sources", u: "https://portal.7thsense.one/user-guides/M280-synchronising-delta/tc_timing_sources.html" }
      ]
    },
    {
      id: "hippotizer",
      name: "Hippotizer",
      also: "Green Hippo",
      company: "Green Hippo",
      region: "int",
      depth: "compare",
      product: "Hippotizer + ZooKeeper；HippoNet",
      positioning: "演出视频网、像素灯具与 LED 混排、AR 增强转播",
      topology: "ZooKeeper 经 HippoNet 控多台；分发时码、媒体与播放同步。",
      single: "VideoMapper 路由不同分辨率屏；PixelMapper 走 Art-Net / sACN。",
      multi: "HippoNet 同步播放状态。公开页不把 Quadro 菊花链当作主叙事。",
      sync: { wallClock: "HippoNet 时码；可跟 SMPTE / MIDI TC 或内部时码（B）", frameId: "HippoNet 播放同步（B）", scanout: "未在主功能页展开", transport: "无" },
      backup: "现场常见双机，不是文档一级特性。",
      irregular: "VideoMapper 对齐多块不同分辨率 LED；偏 2D 像素路由而非完整 3D UV。",
      coupling: "硬件中立。",
      control: "Art-Net、MA-Net、MIDI、OSC、TCP、CITP",
      mapping: ["slice2d", "pixelmap"],
      heat: { ntp: "partial", quadro: "unknown", genlock: "unknown", ptp: "no", map3d: "no", slice2d: "yes", backup: "partial", vertical: "no" },
      layers: ["wallClock", "frameId"],
      mappingStage: [4, 5],
      evidence: "B",
      sources: [
        { t: "HippoNet", u: "https://www.green-hippo.com/hippotizer-key-features/hipponet/" },
        { t: "PixelMapper", u: "https://www.green-hippo.com/hippotizer-key-features/pixelmapper/" }
      ]
    },
    {
      id: "resolume",
      name: "Resolume Arena",
      also: "VJ / 像素灯",
      company: "Resolume",
      region: "int",
      depth: "compare",
      product: "Arena Advanced Output + DMX Lumiverse",
      positioning: "现场 VJ、灯带与低分辨率像素屏。不是超分辨点对点 LED 墙的主路径。",
      topology: "单机多输出为主。",
      single: "composition → slice/warp 到投影或 LED 切片。",
      multi: "多 Art-Net 节点用 ArtSync 缓冲后一齐显示，防止灯带墙撕裂。精度是灯具帧，不是 GPU present barrier。",
      sync: { wallClock: "软件时钟 / MIDI clock", frameId: "ArtSync（灯具侧）", scanout: "非 Quadro 集群方案", transport: "无" },
      backup: "无集群热备模型。",
      irregular: "2D slice、mesh warp，够舞台异形投影，不够球形 LED UV。",
      coupling: "中立。",
      control: "MIDI、DMX、OSC、Spout/Syphon",
      mapping: ["slice2d"],
      heat: { ntp: "no", quadro: "no", genlock: "no", ptp: "no", map3d: "no", slice2d: "yes", backup: "no", vertical: "no" },
      layers: ["wallClock"],
      mappingStage: [4],
      evidence: "A",
      evidenceNote: "放入矩阵是为了防止把「像素映射软件」误当成超分辨播控。",
      sources: [
        { t: "Resolume DMX / ArtSync", u: "https://www.resolume.com/support/dmx" }
      ]
    },
    {
      id: "ndisplay",
      name: "nDisplay",
      also: "Unreal Engine",
      company: "Epic Games",
      region: "int",
      depth: "compare",
      product: "UE nDisplay + Switchboard；常与 LED 虚拟制片一起部署",
      positioning: "实时渲染集群，不是传统时间线播控。但同步硬件方案是行业教科书。",
      topology: "Switchboard 启停集群节点。",
      single: "Mosaic 把多口合成一块桌面；nDisplay 只出到主显示。",
      multi: "每节点 Quadro Sync II。外同步 BNC 进主卡（genlock），RJ45 菊花链其余节点（framelock）。Render Sync Policy = Nvidia(2)。必须独立翻转全屏，PresentMode 需为 Hardware Composed: Independent Flip。",
      sync: { wallClock: "集群帧循环", frameId: "NVIDIA swap group / prePresentWait（A）", scanout: "Genlock + Framelock + 同规格 GPU/OS（A）", transport: "无（引擎侧）" },
      backup: "节点故障即该视角丢失，需制片流程兜底。",
      irregular: "LED 墙作为 nDisplay 视口；内视锥与跟踪是 VP 工作流，几何来自场景而非播控切片器。",
      coupling: "中立，强依赖 NVIDIA 专业栈。",
      control: "Switchboard、Live Link、跟踪系统",
      mapping: ["map3d"],
      heat: { ntp: "no", quadro: "yes", genlock: "yes", ptp: "no", map3d: "yes", slice2d: "no", backup: "no", vertical: "no" },
      layers: ["frameId", "scanout"],
      mappingStage: [1, 3, 5],
      evidence: "A",
      sources: [
        { t: "nDisplay + NVIDIA GPU 同步", u: "https://dev.epicgames.com/documentation/zh-cn/unreal-engine/ndisplay-synchronization-with-nvidia-gpus-in-unreal-engine" }
      ]
    },
    {
      id: "touchdesigner",
      name: "TouchDesigner",
      also: "Derivative",
      company: "Derivative",
      region: "int",
      depth: "compare",
      product: "TouchDesigner / TouchPlayer",
      positioning: "实时生成、互动装置、作为渲染节点而不是整场时间线播控。常与 disguise、LED 处理器混用。",
      topology: "单机或多机 TOUCH 网络；无开箱 Director-Client 帧屏障产品。",
      single: "多 GPU、NDI、Spout、自定义 GLSL。",
      multi: "需自建时间同步或外挂 LTC/NTP；硬同步同样落在 NVIDIA Sync / genlock 外设。",
      sync: { wallClock: "自建 / LTC / MIDI（B）", frameId: "非产品化集群屏障", scanout: "取决于显卡与驱动配置", transport: "可用 ST 2110 第三方" },
      backup: "工程自行设计。",
      irregular: "3D TOP / Kamera 投影，适合异形互动，工程化程度因团队而异。",
      coupling: "中立。",
      control: "OSC、MIDI、DMX、Python",
      mapping: ["map3d"],
      heat: { ntp: "partial", quadro: "partial", genlock: "partial", ptp: "no", map3d: "yes", slice2d: "partial", backup: "no", vertical: "no" },
      layers: ["wallClock"],
      mappingStage: [1, 2, 3],
      evidence: "B",
      sources: [
        { t: "Derivative 产品定位（公开站点）", u: "https://derivative.ca/" }
      ]
    },
    {
      id: "pandoras",
      name: "Pandoras Box",
      also: "Christie Widget Designer",
      company: "Christie / Coolux",
      region: "int",
      depth: "compare",
      role: "server",
      product: "Pandoras Box Server；可选 NVIDIA Sync 卡",
      positioning: "巡演与固定装置媒体服务器。帮助文件把 Mosaic 与 Sync 卡的关系写清楚：多 GPU 拼虚拟桌面必须靠同步卡。",
      topology: "Server + Widget Designer。多机用 Sync 卡 Frame Lock，可跟外部 house-sync。",
      single: "多 GPU Mosaic 需要 Sync 卡把各卡显示锁在一起。",
      multi: "RJ45 菊花链 Frame Lock；BNC 收外部 genlock。NVIDIA 控制面板选 house sync，频率必须匹配刷新。",
      sync: { wallClock: "软件时间线 / SMPTE 链路（B）", frameId: "Frame Lock 像素行级同步（A 帮助页）", scanout: "NVIDIA Sync；可锁 house-sync（A）", transport: "无作为主路径" },
      backup: "现场双机常见，不是文档一级热备模型。",
      irregular: "3D 对象与投影校准是传统强项；LED 墙走输出映射。",
      coupling: "硬件中立。",
      control: "DMX、SMPTE、MIDI、Net Link",
      mapping: ["slice2d", "map3d"],
      heat: { ntp: "partial", quadro: "yes", genlock: "yes", ptp: "no", map3d: "partial", slice2d: "yes", backup: "partial", vertical: "no" },
      layers: ["wallClock", "frameId", "scanout"],
      mappingStage: [3, 4, 5],
      evidence: "A",
      evidenceNote: "对照样本。帮助页可复核 Sync 卡与 Frame Lock，用来钉「Mosaic 需要同步卡」。",
      sources: [
        { t: "Pandoras Box Sync Card", u: "https://pandorasboxhelpfile.com/home/sync-card.htm" },
        { t: "Setting up Frame Lock", u: "https://pandorasboxhelpfile.com/home/setting-up-frame-lock_nvidia.htm" }
      ]
    },
    {
      id: "screenberry",
      name: "Screenberry",
      also: "Screenberry Server / Panel",
      company: "Screenberry",
      region: "int",
      depth: "compare",
      role: "server",
      product: "节点式多屏播放与投影 mapping",
      positioning: "穹顶、舞台屏、多媒体装置。帮助文档把播放同步政策写成音视频对齐，不是 GPU present barrier。",
      topology: "媒体服务器 + 操作端；可一对多管理。",
      single: "Canvas / Display 节点；LED Stripes Mapper、Dome Transform。",
      multi: "多服务器由一台 Operator 管理。帮助页未把 Quadro 菊花链写成产品步骤。",
      sync: { wallClock: "Playback Sync Policy：片源 / 声卡 / 系统钟（A）", frameId: "未检索到 swap barrier 专章", scanout: "未在帮助首页展开 NVIDIA Sync", transport: "无" },
      backup: "未作为主卖点。",
      irregular: "Bezier / 三角网格 warp、穹顶变换、3D Scene 投影。偏 mapping 工具链。",
      coupling: "中立。",
      control: "JSON API、MIDI、时间线标记",
      mapping: ["slice2d", "proj3d"],
      heat: { ntp: "partial", quadro: "unknown", genlock: "unknown", ptp: "no", map3d: "partial", slice2d: "yes", backup: "unknown", vertical: "no" },
      layers: ["wallClock"],
      mappingStage: [2, 3, 4],
      evidence: "A",
      evidenceNote: "放入矩阵是为了区分「多屏播放软件」和「超分辨 LED 硬同步播控」。音画同步政策 ≠ 箱体帧锁。",
      sources: [
        { t: "Screenberry Overview", u: "https://help.screenberry.com/getting-started/screenberry-overview.en" },
        { t: "Media Player Sync Policy", u: "https://help.screenberry.com/node-reference/primary-nodes/mediaplayer.en" }
      ]
    },
    {
      id: "brompton",
      name: "Brompton Tessera",
      also: "SX40 / S8 / T1 LED Processor",
      company: "Brompton Technology",
      region: "int",
      depth: "compare",
      role: "processor",
      product: "Tessera LED 处理器，不是媒体服务器",
      positioning: "钉「屏端同步」。巡演 LED 和 XR 的处理器侧事实标准之一。不能替代播控机上的 NVIDIA Sync。",
      topology: "处理器收 HDMI/SDI，10GbE 到灯具。多处理器必须 genlock 到同一参考并匹配端到端延迟。",
      single: "从视频输入一直 genlock 到灯珠刷新；支持 23.98–250 Hz。",
      multi: "锁到视频输入、Bi/Tri-level，或互相锁。输入帧率与参考不一致会加倍或丢帧。",
      sync: { wallClock: "跟输入或外参考（A）", frameId: "输入与参考不一致会丢/加倍帧（A）", scanout: "面板刷新为输入帧率整数倍；Phase Offset 可移摄像条纹（A）", transport: "无" },
      backup: "处理器冗余取决于系统集成，不是播控主备。",
      irregular: "接收卡与模组侧校正；几何仍由上游播控或 mapping 完成。",
      coupling: "灯具生态绑定 Brompton 接收卡。",
      control: "eDMX / Tessera Control",
      mapping: ["slice2d"],
      heat: { ntp: "no", quadro: "no", genlock: "yes", ptp: "no", map3d: "no", slice2d: "partial", backup: "no", vertical: "yes" },
      layers: ["frameId", "scanout"],
      mappingStage: [5],
      evidence: "A",
      evidenceNote: "不是播控。用来说明：GPU 锁住之后，处理器仍要进同一 house-sync，否则摄像机和箱体照样撕。",
      sources: [
        { t: "Tessera Genlock Settings", u: "https://www.bromptontech.com/online-help/Content/Tessera%20User%20Manual/03.%20Features/12.3.1%20-%20Genlock.htm" },
        { t: "Genlock 产品说明", u: "https://www.bromptontech.com/features/genlock/" }
      ]
    },
    {
      id: "novastar-mx",
      name: "诺瓦 MX / COEX",
      also: "MX40 Pro",
      company: "西安诺瓦星云",
      region: "cn",
      depth: "compare",
      role: "processor",
      product: "COEX 系列 LED 显示控制器，不是媒体服务器",
      positioning: "国内屏端同步样本。和 Brompton 同一层：收 GPU 的 HDMI/DP/SDI，再锁到箱体。不能替代 Kompass 播控机上的 GPU 锁。创凯等拼接器公开手册核不到 genlock 专章，不编造对照卡。",
      topology: "控制器收视频输入，网口/光口到接收卡。多台可 Genlock 级联，最多约 20 台跟同一参考。",
      single: "同步源可选当前输入、外置 Genlock、或内部钟。低延迟模式不能同时开 Genlock。",
      multi: "Genlock IN/LOOP，Bi-level / Tri-level / Blackburst，23.98–60 Hz。未进同一参考时各控制器按内部钟扫，箱体接缝会撕。",
      sync: { wallClock: "跟输入或外参考（A）", frameId: "同步源决定何时出帧；低延迟与 Genlock 互斥（A）", scanout: "Genlock 从输入锁到网口输出（A）", transport: "无" },
      backup: "控制器冗余是系统集成问题，不是播控主备。",
      irregular: "配屏与接收卡连接关系；几何仍由上游播控完成。",
      coupling: "诺瓦接收卡生态。播控可读连接关系文件，仍不替代 GPU 锁。",
      control: "VMP、以太网、AUX RS232",
      mapping: ["slice2d"],
      heat: { ntp: "no", quadro: "no", genlock: "yes", ptp: "no", map3d: "no", slice2d: "partial", backup: "no", vertical: "yes" },
      layers: ["frameId", "scanout"],
      mappingStage: [5],
      evidence: "A",
      evidenceNote: "不是播控。手册可复核 Genlock IN/LOOP。用来钉：国产发送卡垂直整合解决配屏，不解决播控机扫出相位。",
      sources: [
        { t: "MX40 Pro User Manual V1.5.0", u: "https://oss.novastar.tech/uploads/2025/10/MX40-Pro-LED-Display-Controller-User-Manual-V1.5.0.pdf" }
      ]
    }
  ],

  geomModes: [
    {
      id: "surface",
      group: "几何",
      name: "曲面几何",
      en: "Mesh / UV / viewpoint",
      body: "先回答灯珠在真实空间的坐标，再决定二维画面的哪个像素落到哪颗灯珠。折面可以停在 2D 多边形和网格变形。球、环、自由曲面要从模型走。",
      fail: "把 16:9 成片按矩形铺到球面上，经线和模组接缝对不齐。看起来像内容歪了，实际是没有 UV。",
      vendors: ["grandshow", "disguise", "pixera", "hecoos", "screenberry", "vmeet", "watchout", "pandoras", "ndisplay"],
      steps: [
        { t: "按实物建网格", d: "模组宽高、拼缝、弧度或球半径来自现场测量或屏厂配置文件。三思专利把这一步写成：解析球形屏配置得到空间几何，筛掉无效像素，再用非线性映射把像素坐标转到经纬度。CN113077729A 更细：每颗灯珠是一个像素，沿纬线和经线排列，球面再分成顶、底、侧面。" },
        { t: "UV 必须盖住整张 0–1", d: "disguise 写明：LED 屏和投影表面的网格没有 UV 就输出黑色，不能做映射。软件采样的是整张归一化 UV。分辨率在 Designer 里按灯珠产品另设。UV 没铺满 0–1，会采样到一批永远看不见的虚拟像素；分辨率宽高比和几何不一致，像素会被拉变形。" },
        { t: "Direct 和 Perspective 是两种贴法", d: "disguise 默认给每块屏一张 Direct mapping，内容按 UV 贴死，不跟摄像机走。摄像机另外带 Perspective mapping。PIXERA 的弯屏默认仍是平贴，要打开 Create Perspective Screen Texture Coordinates，像素才从 Eye-Point 铺到曲面上。" },
        { t: "投影标定是同一条几何，对象不同", d: "WATCHOUT 把投影机当成视锥：Eye、Target、Roll、镜头位移和宽距比。模型上放虚拟点，输出画面上放现实点，至少六个点之后求解机位和镜头。Pandoras Box Warper 可以只做自由变形，也可以导入与实物一致的网格，把虚拟摄像机对准投影机，再把网格导出成 X 文件交回图层。" },
        { t: "最后才按口切开", d: "GrandMapping 的宣传路径是模型、视角、自动切片，然后写入卡莱特发送卡连接关系。切片清单和同步组仍是两张表。几何对了、扫出相位没锁，接缝照样撕。" }
      ]
    },
    {
      id: "sky",
      group: "内容",
      name: "天空盒 / 穹顶",
      en: "Latlong / fisheye",
      body: "天空盒回答的是「贴什么」，不是「屏长什么样」。一张 2:1 等距柱状图或六面立方体，要先变成方向，再采样到屏的网格或鱼眼镜头上。",
      fail: "把 360 文件直接当 LED 箱体的像素表，或者把穹顶镜头校正说成帧同步。",
      vendors: ["screenberry", "pixera", "ndisplay", "vmeet"],
      steps: [
        { t: "内容格式和屏的像素表不是一回事", d: "等距柱状图的横轴是 360° 经度，纵轴是 180° 纬度，两极必然挤在一起。立方体贴图是六个面。屏厂给的接收卡走线表是另一张表。中间必须有一次采样。" },
        { t: "PIXERA 用三种方式把图层灌进空间", d: "平行光束：前后物体没有近大远小。透视射线：打到更远物体上的像素更大。Equirectangular：按等距柱状投影公式，从一个可移动的中心把 latlong / 360 画面球状播出去。一旦加上这些 Layer Mapping，图层不再跟屏自己的透视工具走，而是铺满该屏对象的纹理尺寸。" },
        { t: "穹顶镜头有自己的映射函数", d: "Screenberry 的 Dome Transform 接在自动校准之后，补的是校准相机，不是播放头。参数包括旋转、视场角、倾斜、相机相对穹顶天顶的 XYZ。镜头畸变一条滑杆走完三种模型：0 是等距，靠近 0.5 是等立体角，1 是正交。" },
        { t: "离线全景出片不是现场策略", d: "nDisplay 的全景通道把水平 360° 和垂直 360° 切成许多普通 2D 画面，拼完再融成等距柱状图。要立体时，左右眼上下叠在同一张图里。这是渲染农场式出片。现场 LED 穹顶仍要另接网格或鱼眼切片。" },
        { t: "鱼眼专利校正的是光路", d: "CN103035016A 把投影机目标图像素按鱼眼光路变到球面坐标，旋转后再转回源图坐标，让平面矩形素材投到球幕上少变形。它不经过 LED 接收卡。播控若只吐矩形成片，变形就留在镜头里。" }
      ]
    },
    {
      id: "naked",
      group: "视差",
      name: "裸眼离轴",
      en: "One viewpoint, baked",
      body: "裸眼立面只有一个最佳观看点。立体感来自内容按这个点做过离轴预畸变，不是播控机在现场算第二只眼睛。",
      fail: "把展台成片写成某家媒体服务器的实时 3D 引擎。页面没写矩阵，就不能补矩阵。",
      vendors: [],
      steps: [
        { t: "一个甜区，两块以上的屏面", d: "人站在设计好的观察点上，直角或 L 型屏的两个平面会同时对上这只眼睛的透视。走开之后，凸出感塌掉，接缝也露出来。这和穹顶「站在球心看」不是同一几何。" },
        { t: "华院专利把算法停在出片", d: "按异形屏几何和最佳观察点构造离轴投影矩阵，把平面素材反投到各屏面，导出可以直接播放的展开图或视频。现场服务器播的是这张已经扭好的图，分辨率对齐灯珠，不需要第二路视锥。" },
        { t: "展台文案停在屏和内容公司", d: "ISLE 2025 视爵光旭写了 90° 直角、点间距 1.56，内容来自地标马克。创维写了约 18 米的 L 型吊装和「中国龙破屏」。两篇都没有离轴矩阵，也没有播出软件的名字。" },
        { t: "预算应该记在内容，不记在帧同步", d: "这种项目的难处是观察点、屏面夹角和预畸变素材。多机锁相只在屏被切到多台服务器时才重新变成问题。不要用「支持 3D」去对比 disguise 的跟踪视锥。" }
      ]
    },
    {
      id: "glasses",
      group: "视差",
      name: "眼镜双目",
      en: "Two rasters",
      body: "左右眼各要一张图，两张图的摄像机分开一个瞳距。输出可以是两路接口，也可以是一张图里上下或左右并排。",
      fail: "和裸眼立面共用一个「3D」复选框。一个是烘焙后的单路像素，一个是同时存在的两路像素。",
      vendors: ["pixera", "ndisplay"],
      steps: [
        { t: "先让显卡同意画两只眼", d: "PIXERA 要求先在 NVIDIA 控制面板打开 Stereoscopic。面板里没有这一项时，帮助页写明 one、two、four 需要 NVIDIA 立体扩展卡。这一步在操作系统和驱动，不在时间线里。" },
        { t: "两块屏、两个观察点、一个开关", d: "左右各建一块显示并各接一路输出，放进各自的 3D Screen Group，分开移动 eyepoint。最后在 Mapping 里点中某路 Feed，在检查器里设置 Stereoscopic Mode。两套组共用一个观察点时，左右图会重合，立体感消失。" },
        { t: "nDisplay 把瞳距写在摄像机上", d: "摄像机组件有瞳距、立体偏移和左右眼对调。第二只眼可以指定另一块 GPU。视口自己还有 Projection Policy，决定这块视口用平面、网格还是其他投影。" },
        { t: "手册没写的不要补", d: "主动立体眼镜的发射器如何锁到刷新率，这次打开的 PIXERA 和 nDisplay 页面都没有句子。页面停在两路像素如何生成。" }
      ]
    },
    {
      id: "xr",
      group: "视差",
      name: "XR 跟踪视锥",
      en: "Tracked frustum",
      body: "LED 体积是真实空间里的一块网格。虚拟场景在另一套坐标里。摄像机每帧的位置决定从哪一个窗口看进去。内容不是事先烘好的 360 文件。",
      fail: "只锁了服务器，摄像机或 LED 处理器没进同一 house-sync。画面在监视器上是齐的，拍摄画面里仍漂。",
      vendors: ["disguise", "pixera", "ndisplay"],
      steps: [
        { t: "外层是实景，内层是虚拟场景", d: "PIXERA 把摆放屏、显示和 LED 体积的空间叫 Outer compositing，把 Unreal 场景叫 Inner。透过外层体积去看内层。移动外层体积，就是在移动看进虚拟场景的窗口。外层几何改完，nDisplay 配置文件要重新生成，否则引擎仍按旧窗口渲染。" },
        { t: "网格来自扫描，不是来自一张平面图", d: "disguise 的 xR 流程要求把 LED 屏加进舞台，并写明 LIDAR 扫描、做过 UV 展开的 OBJ 最合适。再放虚拟摄像机、把物理机的视频输入补进对应虚拟机、接上跟踪驱动。这些对象放进同一个 MR set。屏外还要画面时，另加一块 set extension 网格。" },
        { t: "标定用结构光，不是用眼睛挪点", d: "LED 上打白点，摄像机认出这些点，同时记下跟踪系统报的机位。两个位置合成一次观测。多面屏时，MR set 列表里的第一块屏保持不动，其余屏和摄像机绕它对齐。UV 方向反了，帮助页写屏会翻转。反射会造成错误白点。" },
        { t: "Genlock 是标定前提", d: "disguise 把「摄像机、LED 处理器、所有服务器收到同一 genlock」写在空间标定的前置条件里。跟踪延迟、镜头数据和 Feed 输出也要先确认。这一条和大屏播放的帧锁是同一根 house-sync，不是另一套软件对时。" },
        { t: "曲面体积默认仍可能被平贴", d: "PIXERA 写：弯 LED 上的内容映射默认是平的。要在该 LED 上打开 Create Perspective Screen Texture Coordinates，像素才按 Eye-Point 落到曲面上。Eye-Point 可以由外部相机跟踪驱动。" }
      ]
    }
  ],

  geomKeys: [
    { id: "slice2d", label: "2D 切片" },
    { id: "mesh", label: "导入网格" },
    { id: "uv", label: "UV / 自动切片" },
    { id: "eye", label: "观察点" },
    { id: "dome", label: "穹顶 / 360" },
    { id: "frustum", label: "实时视锥" }
  ],

  geomMatrix: [
    { id: "kommander", slice2d: "yes", mesh: "unknown", uv: "unknown", eye: "unknown", dome: "unknown", frustum: "no", stereo: "未检索到", evidence: "B", note: "主界面是虚拟屏和预案。球形路径未在公开手册展开。" },
    { id: "novastar", slice2d: "yes", mesh: "unknown", uv: "unknown", eye: "unknown", dome: "unknown", frustum: "no", stereo: "未检索到", evidence: "B", note: "播控主路径是窗口/预案。屏端几何在接收卡配屏，不是 3D 舞台。" },
    { id: "hirender", slice2d: "yes", mesh: "unknown", uv: "unknown", eye: "unknown", dome: "unknown", frustum: "no", stereo: "未检索到", evidence: "B", note: "网格拼接和窗口模式。未检索到 OBJ/UV 专章。" },
    { id: "grandshow", slice2d: "yes", mesh: "partial", uv: "partial", eye: "partial", dome: "partial", frustum: "unknown", stereo: "未检索到", evidence: "C", note: "GrandShow 内是 2D 切片。GrandMapping 宣传：模型 → 视角 → 自动切片 → 发送卡连接关系。AI 建模维持 C。" },
    { id: "hecoos", slice2d: "partial", mesh: "partial", uv: "unknown", eye: "partial", dome: "unknown", frustum: "unknown", stereo: "未检索到", evidence: "B", note: "Studio 先做三维预演和机位，再交给 Server。像素级 UV 公开页不够细。" },
    { id: "disguise", slice2d: "partial", mesh: "yes", uv: "yes", eye: "yes", dome: "unknown", frustum: "yes", stereo: "跟踪视锥，不是双目", evidence: "A", note: "显示网格必须有 UV，否则黑屏。xR 推荐 LIDAR 扫描并展开的 OBJ。Spatial Mapping 跟活动摄像机。" },
    { id: "watchout", slice2d: "yes", mesh: "yes", uv: "unknown", eye: "yes", dome: "unknown", frustum: "partial", stereo: "未检索到", evidence: "A", note: "3D 映射把投影机当成带 Eye/Target 的视锥，用至少六点标定贴到模型上。对象是投影表面，不是 LED 接收卡 UV。" },
    { id: "vmeet", slice2d: "yes", mesh: "partial", uv: "unknown", eye: "unknown", dome: "partial", frustum: "unknown", stereo: "未检索到", evidence: "C", note: "产品页写自定义模型、球幕、隧道、穹顶、CAVE。步骤未到手册级。" },
    { id: "pixera", slice2d: "yes", mesh: "yes", uv: "partial", eye: "yes", dome: "yes", frustum: "yes", stereo: "双目左右屏", evidence: "A", note: "弯屏要打开 Perspective Texture Coordinates。Equirectangular 效果吃 360/latlong。双目要两块屏、两套 3D Screen Group，one/two/four 需要 NVIDIA 立体扩展。" },
    { id: "7thsense", slice2d: "partial", mesh: "unknown", uv: "unknown", eye: "unknown", dome: "unknown", frustum: "unknown", stereo: "未检索到", evidence: "B", note: "产品定位写穹顶。本次打开的手册是同步章，几何步骤未在该页展开，穹顶格保持空。" },
    { id: "hippotizer", slice2d: "yes", mesh: "unknown", uv: "unknown", eye: "unknown", dome: "unknown", frustum: "no", stereo: "未检索到", evidence: "B", note: "VideoMapper 对齐多块不同分辨率屏，偏 2D 像素路由。" },
    { id: "resolume", slice2d: "yes", mesh: "no", uv: "no", eye: "no", dome: "no", frustum: "no", stereo: "无", evidence: "A", note: "Advanced Output 的 2D slice 和 mesh warp。不够球形 LED UV。" },
    { id: "ndisplay", slice2d: "no", mesh: "partial", uv: "unknown", eye: "yes", dome: "partial", frustum: "yes", stereo: "双目瞳距", evidence: "A", note: "视口有 Projection Policy 和摄像机。立体参数是瞳距、换眼。Movie Pipeline 全景通道是离线等距柱状出图，不是 LED 穹顶策略本身。" },
    { id: "touchdesigner", slice2d: "partial", mesh: "partial", uv: "unknown", eye: "partial", dome: "unknown", frustum: "partial", stereo: "未检索到", evidence: "B", note: "3D TOP / 摄像机投影可搭异形互动。不是开箱的 LED UV 产品。" },
    { id: "pandoras", slice2d: "yes", mesh: "yes", uv: "unknown", eye: "yes", dome: "unknown", frustum: "partial", stereo: "未检索到", evidence: "A", note: "Warper 可导入 3D 物体，虚拟摄像机对齐真实投影机，再把物体导出到 Video Layer。主路径是投影校准。" },
    { id: "screenberry", slice2d: "yes", mesh: "unknown", uv: "unknown", eye: "partial", dome: "yes", frustum: "unknown", stereo: "未检索到", evidence: "A", note: "Dome Transform 补偿校准相机的 FOV、倾斜和位移。镜头映射从等距到等立体角再到正交。这是穹顶校正，不是 GPU 帧锁。" },
    { id: "brompton", slice2d: "no", mesh: "no", uv: "no", eye: "no", dome: "no", frustum: "no", stereo: "无", evidence: "A", note: "处理器。几何在上游播控或内容里完成。" },
    { id: "novastar-mx", slice2d: "no", mesh: "no", uv: "no", eye: "no", dome: "no", frustum: "no", stereo: "无", evidence: "A", note: "控制器锁 genlock。不建模型、不出天空盒。" }
  ],

  geomWriteups: [
    {
      id: "disguise",
      kinds: ["surface", "xr"],
      grade: "A",
      title: "disguise：没有 UV 的屏是黑的",
      body: "Designer 把 LED 和投影表面都当成必须带 UV 的网格。UV 负责在二维素材和三维多边形之间来回翻译。采样范围是整张归一化 UV（U、V 都从 0 到 1）。屏的宽高比通常由网格的真实尺寸决定，分辨率在软件里按灯珠或投影机另设。UV 没归一化时，即使用正方形分辨率，也会有一批采样落在看不见的区域。",
      more: "映射分两层。每块屏默认带一张同名的 Direct mapping，内容贴在 UV 上，不跟机位变。每台摄像机默认带 Perspective mapping。xR 用的 Spatial Mapping 认 MR set 里的活动摄像机，还可以做世界坐标偏移；屏的 UV 岛可以向外扩几个像素，用来盖住边缘黑边，但 UV 图里得留出相应空白。标定前，帮助页要求摄像机、处理器和全部服务器已经锁在同一 genlock 上。",
      url: "https://help.disguise.one/workflows/3d-modelling/uv-mapping/uv-maps-in-designer",
      source: "UV maps in Designer"
    },
    {
      id: "pixera",
      kinds: ["surface", "sky", "glasses", "xr"],
      grade: "A",
      title: "PIXERA：平贴、球状投射、双目是三个开关",
      body: "弯 LED 默认按平面贴内容。要在这块 LED 上打开 Create Perspective Screen Texture Coordinates，像素才从 Eye-Point 正确落到曲面上。Screen Group 的 Perspective Mode 设为 3D 之后，Eye-Point 变成工作区里的一个手柄，可以由外部相机跟踪驱动。",
      more: "Layer Mapping 会绕开屏自己的透视。平行光束没有近大远小；透视射线让更远的像素更大；Equirectangular 按等距柱状公式从一个点把 360 图播出去，中心点用效果参数移动。加上这些效果后，不能再用 Perspective 工具挪内容。虚拟制片另分外层和内层：外层摆真实屏，内层放 Unreal。改外层体积后要重新生成 nDisplay 配置。双目则是另一条清单：NVIDIA 立体开关、左右两块显示和输出、两个 3D Screen Group、两个 eyepoint、Feed 上的 Stereoscopic Mode。",
      url: "https://help.pixera.one/pixera-20/layer-mapping-effects",
      source: "Layer Mapping Effects"
    },
    {
      id: "watchout",
      kinds: ["surface"],
      grade: "A",
      title: "WATCHOUT：投影机是一台虚拟摄像机",
      body: "3D 映射解决的是投影表面，不是 LED 接收卡走线。流程是四步：现场摆好投影机和物体，软件里摆出对应的模型和投影机，用点标定把两边对齐，再播素材。",
      more: "投影机的 Eye 是机位，Target 是瞄准点，两者构成光轴，Roll 是滚转。镜头要填水平/垂直位移和宽距比。虚拟点放在模型的角和边上，现实点放在投影输出里这些角实际出现的位置。虚拟点少于六个时，还不能编辑现实点。求解同时改镜头参数和机位。LED 超宽条在 WATCHOUT 里仍是显示对象映射，公开页没有把这条六点标定写成灯珠 UV。",
      url: "https://docs.dataton.com/guide/watchout/devices/display-calibration.html",
      source: "Display Calibration"
    },
    {
      id: "pandoras",
      kinds: ["surface"],
      grade: "A",
      title: "Pandoras Box：Warper 里先对齐，再把网格交回图层",
      body: "Warper 是随安装附带的建模工具，启动要加密狗。一条路是自定义形状加可缩放的自由变形器，适合还没有精确模型的异形幕。另一条路是导入与实物一致的三维物体，把虚拟摄像机的位置、朝向和镜头设成和真实投影机一样。",
      more: "机位可以对着图纸手填，也可以用标记做自动摄像机校准，后者从 5.5 版开始有。对齐之后，摄像机参数交回 Pandoras Box 的 Camera Layer，物体导出为 X 文件贴到单独的 Video Layer。8 版之前，Player 的 2D 版没有 Z 轴，也不能导入物体。这条链路的产物仍是投影校正，不是球形 LED 的经纬表。",
      url: "https://pandorasboxhelpfile.com/home/warper.htm",
      source: "Warper"
    },
    {
      id: "screenberry",
      kinds: ["sky", "surface"],
      grade: "A",
      title: "Screenberry：穹顶校正补偿的是校准相机",
      body: "Dome Transform 接在 Calibrator 后面，中间经过 Render Target。自动校准已经给出一张对齐结果，这个节点再补相机自己带来的误差：画面旋转、视场角缩放、镜头畸变、倾斜，以及相机相对穹顶天顶的前后左右上下偏移。",
      more: "镜头畸变不是一个模糊的「鱼眼强度」。滑杆在三种投影之间过渡：0 为等距，靠近 0.5 为等立体角，1 为正交。帮助页还列出 2D 平面转穹顶。这些参数都不产生多机 present barrier，也不能代替箱体 UV。",
      url: "https://help.screenberry.com/warping-alignment/dometransform.en",
      source: "Dome Transform"
    },
    {
      id: "ndisplay",
      kinds: ["xr", "glasses", "sky"],
      grade: "A",
      title: "nDisplay：视口策略、瞳距、离线全景是三份配置",
      body: "每个视口有自己的 Projection Policy、二维区域和渲染设置。摄像机组件决定从空间哪一点渲染这些视口。立体不靠素材文件名，而靠摄像机上的瞳距、眼睛偏移和左右对调；第二只眼可以指定另一块 GPU。",
      more: "全景出片是 Movie Pipeline 的另一条通道：水平方向和垂直方向各切成多张普通 2D 画面，拼成等距柱状图。步数越高，极点以外的变形越小，时间越长。立体全景把左右眼上下叠在最终图里。这张图之后还要再进穹顶或 LED 的映射，通道本身不认识接收卡。",
      url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/DisplayCluster/UDisplayClusterCameraComponent",
      source: "nDisplay camera stereo"
    },
    {
      id: "grandshow",
      kinds: ["surface"],
      grade: "C",
      title: "GrandMapping：公开页只有路径，没有参数",
      body: "GrandShow 本体是 2D 批量切片、变形和旋转。球形和弧形被指到独立软件 GrandMapping：用预设或推断的屏体模型，调观察视角，自动切片，再把结果送进卡莱特发送卡的连接关系文件。",
      more: "「AI 推断屏体」出现在宣传，不出现在可复核的参数页。这次没有打开到 UV 归一化、经纬公式或观察点矩阵的说明，所以表上这三格是部分，证据保持 C。能确定的是它把几何结果写成发送卡文件，而不是写成 NVIDIA Sync 组。",
      url: "https://colorlightinside.com/product/special/6255",
      source: "GrandMapping"
    },
    {
      id: "hecoos",
      kinds: ["surface"],
      grade: "B",
      title: "hecoos：先在 Studio 里摆三维，再交给 Server",
      body: "设计端 Studio 默认不出画，里面摆灯、屏、机械和摄像机机位。Server 或带输出模块的 Studio Pro 才负责现场输出。这是国内少数把三维预演放在播控前面的结构。",
      more: "公开介绍没有 disguise 那种「无 UV 则黑屏」的句子，也没有经纬展开或离轴矩阵。所以它证明的是工作流分端，不是像素级贴图已经写进手册。快速指南 PDF 此前为 404，这里不拿海报补步骤。",
      url: "https://www.kk77.cn/com/lanjing/news/itemid-25.html",
      source: "澜景：Studio / Server"
    }
  ],

  geomCases: [
    {
      id: "disguise-xr",
      kind: "xr",
      name: "disguise xR 舞台",
      who: "Disguise Designer",
      claim: "帮助页把做法写成步骤：LED 屏用 LIDAR 扫描并 UV 展开的 OBJ，摄像机、处理器和服务器同一 genlock，Spatial Mapping 跟活动摄像机。",
      method: "实时跟踪视锥。没有把天空盒文件当成体积的内容格式。",
      grade: "A",
      vendors: ["disguise"],
      url: "https://help.disguise.one/workflows/xr/xr-stage-setup",
      source: "xR Stage Setup"
    },
    {
      id: "pixera-360",
      kind: "sky",
      name: "PIXERA 等距柱状映射",
      who: "AV Stumpfl PIXERA",
      claim: "Equirectangular Layer Mapping 按等距柱状公式，从空间中一点把 latlong / 360 内容投到屏对象上。弯屏另要 Create Perspective Screen Texture Coordinates。",
      method: "天空盒内容贴到已有网格。和双目输出是两条开关。",
      grade: "A",
      vendors: ["pixera"],
      url: "https://help.pixera.one/pixera-20/layer-mapping-effects",
      source: "Layer Mapping Effects"
    },
    {
      id: "pixera-stereo",
      kind: "glasses",
      name: "PIXERA 双目工作流",
      who: "AV Stumpfl PIXERA",
      claim: "左右各一块显示和输出，各自进入 3D Screen Group，移动 eyepoint，再在 Mapping 里设 Stereoscopic Mode。one/two/four 需要 NVIDIA 立体扩展卡。",
      method: "眼镜双目，两路像素。不是裸眼立面的预烘焙。",
      grade: "A",
      vendors: ["pixera"],
      url: "https://help.pixera.one/mapping-/stereoscopic-workflow",
      source: "Stereoscopic Workflow"
    },
    {
      id: "screenberry-dome",
      kind: "sky",
      name: "Screenberry Dome Transform",
      who: "Screenberry",
      claim: "在自动校准之后再补几何：旋转、FOV、镜头畸变（等距 / 等立体角 / 正交）、校准相机的倾斜和 XYZ 偏移。",
      method: "穹顶校正节点。帮助页未把 Quadro 菊花链写成这一步。",
      grade: "A",
      vendors: ["screenberry"],
      url: "https://help.screenberry.com/warping-alignment/dometransform.en",
      source: "Dome Transform"
    },
    {
      id: "watchout-3d",
      kind: "surface",
      name: "WATCHOUT 3D 投影标定",
      who: "Dataton WATCHOUT",
      claim: "投影机是虚拟摄像机：Eye、Target、Roll 和镜头参数对齐现场，至少六个虚拟点对现实点，求解后把素材贴上模型表面。",
      method: "曲面几何，对象是投影。LED 超宽条仍是显示对象映射，深度弱于这条投影标定。",
      grade: "A",
      vendors: ["watchout"],
      url: "https://docs.dataton.com/guide/watchout/devices/display-calibration.html",
      source: "Display Calibration"
    },
    {
      id: "isle-absen-mark",
      kind: "naked",
      name: "ISLE 2025 直角裸眼屏",
      who: "视爵光旭 × 地标马克",
      claim: "投影时代转述展台：MC+DBmk2 做 90° 直角、点间距 1.56 的无缝屏，与地标马克一起播裸眼 3D 内容。",
      method: "页面只展示屏和内容合作。未写离轴矩阵、也未写播控软件。按「内容预畸变 + 直角像素输出」记，不写成实时引擎。",
      grade: "C",
      vendors: [],
      url: "http://www.pjtime.com/2025/3/182456292497.shtml",
      source: "投影时代 ISLE 2025"
    },
    {
      id: "isle-skyworth",
      kind: "naked",
      name: "ISLE 2025 L 型吊装龙",
      who: "创维商用",
      claim: "展台文案写 L 型吊装屏约 18 米跨度，「动态裸眼 3D 中国龙」，观众感觉巨龙破屏。",
      method: "宣传案例。未写建模软件或播出链路。立体感来自内容，不来自本页已核到的播控功能。",
      grade: "C",
      vendors: [],
      url: "http://www.pjtime.com/2025/3/172931658516.shtml",
      source: "投影时代 ISLE 2025"
    }
  ],

  geomShows: [
    {
      id: "ise",
      name: "ISE",
      year: "2025 · 巴塞罗那",
      quote: "展台 3D800 由 EX 3+ 媒体服务器驱动，并展示客户项目与现场演示；ROE 展位用 VX/RX 做可扩展实时渲染。",
      note: "厂商自己的预告。展台由 EX 3+ 驱动，ROE 展位用 VX 4+、VX 2+ 和 RX 做实时渲染，INFiLED 展位用 EX 播产品、用 VX/RX 播舞台。这篇没有 UV、离轴或标定步骤，只能证明他们在 ISE 上演示的是实时渲染链路，不是一条 360 成片。",
      grade: "C",
      url: "https://www.disguise.one/en/insights/news/disguise-sets-industry-standard-content-flexibility-groundbreaking-solutions-ise-2025",
      source: "disguise · ISE 2025"
    },
    {
      id: "infocomm",
      name: "InfoComm",
      year: "2025 · 奥兰多",
      quote: "PIXERA zero 做北美首秀；AnyShape 屏可以按曲面或圆形出厂，用来做超出矩形的投影表面。",
      note: "AnyShape 是投影幕，不是 LED 箱体建模。不要把它记成球形 LED 的 UV 方案。",
      grade: "C",
      url: "https://www.installation-international.com/infocomm/av-stumpfl-to-give-north-america-debut-to-pixera-zero-platform",
      source: "Installation · InfoComm 2025"
    },
    {
      id: "infocomm-china",
      name: "InfoComm China",
      year: "2025 · 北京",
      quote: "利亚德展台聚焦智能显示、文旅夜游、AI 与空间计算，并发布黑钻、冷屏等显示产品。",
      note: "展台报道未写异形建模或切片。能引用的是产品发布范围：黑钻、冷屏、文旅夜游和空间计算这句口号。空间计算没有落到网格、UV 或视锥。",
      grade: "C",
      url: "https://news.itavcn.com/news/202504/20250416/78309.shtml",
      source: "数字视听网 · InfoComm China 2025"
    },
    {
      id: "prolight",
      name: "Prolight+Sound",
      year: "2025 · 法兰克福",
      quote: "PIXERA zero 在当年稍早的 ISE 和 Prolight + Sound 面向欧洲观众介绍，随后再到 InfoComm。",
      note: "同一篇 InfoComm 预告里点到了展名。没有单独的异形屏演示步骤。",
      grade: "C",
      url: "https://www.installation-international.com/infocomm/av-stumpfl-to-give-north-america-debut-to-pixera-zero-platform",
      source: "Installation · 提及 Prolight+Sound 2025"
    },
    {
      id: "isle",
      name: "ISLE",
      year: "2025 · 深圳",
      quote: "视爵光旭设裸眼 3D 数字营销区，90° 直角屏与地标马克的内容一起展出。",
      note: "展台宣传写了屏的几何（90° 直角、1.56 间距）和内容合作方，没有写离轴矩阵或播出软件。和裸眼一档的判断一致：立体感被算在内容上。",
      grade: "C",
      url: "http://www.pjtime.com/2025/3/182456292497.shtml",
      source: "投影时代 · ISLE 2025"
    }
  ],

  patents: [
    {
      id: "cn-nova-cal",
      no: "CN202210927168.1",
      title: "多设备同步校准的方法、设备、系统和存储介质",
      who: "西安诺瓦星云",
      year: "2024 授权",
      track: "sync",
      grade: "A",
      summary: "场同步触发后的预设窗口内，向 ≥2 个从端收集实时帧指示，判定需校准者，在同一同步周期内下发校准指令。目标是拼接播放时提高帧同步校准可靠性。",
      meaning: "把 L2（帧身份）做成「主端在场同步节拍里读从端帧号再纠」。不依赖各从端自己猜时钟。",
      url: "http://stock.stockstar.com/RB2024051100002237.shtml"
    },
    {
      id: "cn-nova-play",
      no: "CN202411874334.1",
      title: "视频同步播放方法、设备及存储介质",
      who: "西安诺瓦星云",
      year: "2026 公布",
      track: "sync",
      grade: "A",
      summary: "各显示设备在同一时刻预期播放同一目标帧；用下发时刻与预期播放时刻的差，把当前播放帧纠到该时刻应播的帧。摘要称要降低多输出设备靠同步信号通信的耦合。",
      meaning: "偏 L1/L2 软件纠帧：用时间差选帧，而不是一直拉一根同步线。与硬 genlock 是互补，不是替代扫出锁相。",
      url: "https://finance.sina.com.cn/stock/aigc/zl/2026-06-23/doc-iniekeey2057171.shtml.md"
    },
    {
      id: "cn-ptp-wall",
      no: "CN105491433B",
      title: "基于 1588v2 协议的视频同步显示方法及拼接显示系统",
      who: "北京小鸟科技",
      year: "2019 授权",
      track: "sync",
      grade: "A",
      summary: "选祖父时钟节点，用 1588v2 测路径延时得 Tmax，提前 Tmax+裕量发自定义同步显示报文，输出节点按生效时刻送视频。",
      meaning: "L4 思路用在拼接墙上：PTP 对时 + 补偿最大链路延时后同时开闸。适用于包交换拼接，不一定等于媒体服务器 GPU present。",
      url: "https://patents.google.com/patent/CN105491433A/zh"
    },
    {
      id: "cn-vp-tcp",
      no: "CN112040092A",
      title: "一种实时虚拟场景 LED 拍摄系统及方法",
      who: "（公开文本，虚拟制片方向）",
      year: "2020 公开",
      track: "sync",
      grade: "B",
      summary: "多 PC 在千兆网内用 TCP 交换同步信息，用时间码对齐联机渲染，以克服单机无法流畅出 8K 流。",
      meaning: "典型 L1 软件同步。精度受 TCP 抖动限制，LED 拍摄仍通常要叠 NVIDIA Sync。属相邻领域，不是播控产品专利。",
      url: "https://patents.google.com/patent/CN112040092A/zh"
    },
    {
      id: "cn-ntp-cloud",
      no: "CN112351294A",
      title: "一种云导播多机位间帧同步方法及系统",
      who: "云导播方向",
      year: "2020 公开",
      track: "adjacent",
      grade: "B",
      summary: "推流端 NTP 对时，用时钟差值打时间戳，导播按时间戳排序后再渲染。宣称网络波动下误差可压到 1 帧内。",
      meaning: "不是 LED 播控本业。放在这里只为说明：NTP 帧同步在流媒体里是「选同一帧」，在 LED 拼接里通常不够。",
      url: "https://patents.google.com/patent/CN112351294A/zh"
    },
    {
      id: "cn-sansi-sphere",
      no: "申请 202510892636",
      title: "LED 球形屏视频图像坐标生成方法",
      who: "上海三思电子工程",
      year: "2025 公布",
      track: "geom",
      grade: "B",
      summary: "解析球形屏配置得空间几何；筛有效像素；用非线性映射把像素坐标转到经纬度。",
      kind: "surface",
      meaning: "曲面几何：球形屏不是矩形裁切，必须有「配置文件 → 经纬坐标」这一步。",
      url: "https://www.xjishu.com/zhuanli/55/202510892636.html"
    },
    {
      id: "cn-offaxis",
      no: "申请 202611016217",
      title: "一种面向异形屏的裸眼立体视频反向映射生成方法",
      who: "华院计算技术（上海）",
      year: "2026 公布",
      track: "geom",
      grade: "B",
      summary: "按异形屏几何、最佳观察点构造离轴投影矩阵，把平面素材反投到各屏面，导出可直接播放的展开图/视频。",
      kind: "naked",
      meaning: "裸眼视差，不是实时引擎：离线烘焙预畸变，播控仍输出展开后的像素。",
      url: "https://www.xjishu.com/zhuanli/62/202611016217.html"
    },
    {
      id: "cn-led-sphere-beads",
      no: "CN113077729A",
      title: "一种 LED 球形屏的显示方法",
      who: "摘要页未写申请人全称",
      year: "2021 公开",
      track: "geom",
      kind: "surface",
      grade: "B",
      summary: "每颗灯珠是一个像素，沿经纬线铺满球面；球面再分成顶、底、侧面，按各区域视场角生成画面并做几何校正。",
      meaning: "曲面几何的灯珠版：分区视场角就是观察点投影。本次打开的是 Patsnap 摘要，不是审查全文。",
      url: "https://eureka.patsnap.com/patent-CN113077729A"
    },
    {
      id: "cn-fisheye-dome",
      no: "CN103035016A",
      title: "投影机球面显示及旋转输出图像的处理方法",
      who: "摘要页未写申请人全称",
      year: "2013 公开",
      track: "adjacent",
      kind: "sky",
      grade: "B",
      summary: "按鱼眼光路把目标图像素变到球面坐标，再转回源图，使平面矩形素材投到球幕时少变形，并可绕轴旋转。",
      meaning: "天空盒/穹顶的相邻专利，对象是投影鱼眼，不是 LED 接收卡。播控若只出矩形成片，变形留在镜头里。",
      url: "https://eureka.patsnap.com/patent-CN103035016A"
    }
  ],

  oss: [
    {
      id: "sgct",
      name: "SGCT",
      grade: "cluster",
      fit: "可借鉴",
      summary: "Simple Graphics Cluster Toolkit。C++ OpenGL，XML 描述节点/窗口/视口，server→client 同步。面向穹顶、鱼眼、VR，不是现成 LED 播控，但是多机投影矩阵分发的干净模型。",
      url: "https://github.com/sgct/sgct"
    },
    {
      id: "equalizer",
      name: "Equalizer",
      grade: "cluster",
      fit: "可借鉴",
      summary: "可扩展并行 OpenGL。compound tree 做任务分解与合成，自带网络 swap barrier。LGPL。适合理解「集群 present 对齐」，接入业务要自己写解码与 LED 映射。",
      url: "https://github.com/Eyescale/Equalizer"
    },
    {
      id: "cplay",
      name: "C-Play",
      grade: "cluster",
      fit: "可借鉴",
      summary: "开源集群播放器：主控 Qt/QML + 节点 GLFW/SGCT + libmpv。支持 180/360、穹顶、立体。最接近「能播起来的开源媒体集群」，缺 LED 模组级 UV 与 NVIDIA Sync 产品化封装。",
      url: "https://github.com/c-toolbox/C-Play"
    },
    {
      id: "ndisplay-oss",
      name: "Unreal nDisplay",
      grade: "cluster",
      fit: "可借鉴",
      summary: "随引擎提供。NVIDIA Sync 配置文档是目前开源/半开源里最完整的 LED 墙硬同步说明书。定位实时渲染，不是 HAP/H.264 时间线播控。",
      url: "https://dev.epicgames.com/documentation/zh-cn/unreal-engine/ndisplay-synchronization-with-nvidia-gpus-in-unreal-engine"
    },
    {
      id: "mapmap",
      name: "MapMap",
      grade: "mapping",
      fit: "几何参考",
      summary: "开源投影 mapping，正在 Rust 重写。mesh warp、多窗口、edge blend。适合 2D/2.5D 投影，不是超分辨 LED 集群播放器。",
      url: "https://github.com/schuellerf/mapmap"
    },
    {
      id: "uvstudio",
      name: "UV Studio",
      grade: "mapping",
      fit: "几何参考",
      summary: "面向场馆 LED 的 UV 工具，对接 Cinema 4D / Blender。把屏当命名物体，按真实分辨率展开。可当内容侧 UV 管线，不负责播出。",
      url: "https://github.com/hayhamLT/uvstudio"
    },
    {
      id: "polycast",
      name: "Polycast",
      grade: "soft",
      fit: "精度不够",
      summary: "把成片裁成节点切片，mpv 播放，WebSocket 对时码。作者写明典型漂移 50–150 ms，只适合沉浸装置慢镜头。不能当作 LED 帧同步方案。",
      url: "https://github.com/sztlink/polycast"
    },
    {
      id: "ghost",
      name: "Ghost Arcade",
      grade: "mapping",
      fit: "精度不够",
      summary: "AGPL VJ / mapping，Spout 可进 LED 控制器。单机实时特效，无多机 present barrier。",
      url: "https://ghostarcade.live/"
    }
  ],

  principles: [
    {
      t: "同步分四层，不要混用名词",
      d: "NTP 对齐的是钟；Genlock 对齐的是扫出；帧计数对齐的是内容；PTP 对齐的是 ST 2110 包。WATCHOUT 已经用事故级细节证明：只 Genlock 仍可能整帧错位。"
    },
    {
      t: "超分辨 = 切空间 + 锁时间",
      d: "单机解不了 16K@60 时，切片是空间问题，同步是时间问题。只做切片软件、不规划 Sync 卡与 LED 处理器 genlock，接缝必撕。"
    },
    {
      t: "异形屏以 3D 为源，2D 切片是快路径",
      d: "球、环、折面应从模型 + UV 生成切片。矩形拼缝、折角屏可以 2D polygon。GrandMapping / hecoos / disguise 走前一条；多数国产播控默认后一条。"
    },
    {
      t: "立体和天空盒是内容模块",
      d: "内核仍是切片后的像素输出，不替代 L2/L3。裸眼立面多是离线离轴预畸变；眼镜双目是左右两套视锥；XR 里的天空是跟踪摄像机，不是一条 360 成片。"
    },
    {
      t: "Director 与 Display 解耦",
      d: "控制面负责工程、素材、预监；显示节点只解码、映射、present。Director 是否出画决定它要不要进硬件同步组（PIXERA / disguise 均如此）。"
    },
    {
      t: "跳转要预约到某一帧，齐备了再切",
      d: "对外可以是跳到时间或跳到 Cue。集群内部必须带目标、生效帧和预取截止。任一节点没把目标帧解出来，这一拍不切。Genlock 只锁扫出，不保证各机已经换成新画面。"
    },
    {
      t: "垂直整合是产品策略不是同步策略",
      d: "诺瓦、卡莱特、凯视达把播控接到自家发送卡，降低现场配屏成本。帧同步仍然要在 GPU 与处理器之间成立，发送卡协议替代不了 Quadro 菊花链。"
    }
  ],

  // ===== 以下为新增章节数据 =====

  archDetail: {
    lead: "把上面的约束落到可以动手写代码的程度。第一版目标：2–4 台 DP/HDMI 输出的超分辨 LED 墙，NTP + Quadro Sync，不做 ST 2110。",
    modules: [
      { id: "director", name: "Director", role: "工程编辑、时间线播放控制、预监、素材管理、外部协议响应", thread: "主线程 UI + 后台工程同步", deploy: "1 台，可不接 LED 输出" },
      { id: "display", name: "Display Node", role: "解码、几何映射、合成、present", thread: "渲染线程 + 解码线程 + 同步控制线程", deploy: "每台出画 GPU 一个实例" },
      { id: "syncmgr", name: "Sync Manager", role: "管理帧计数、present barrier、跳转协商", thread: "专用高优先级线程，绑定 Sync 卡中断", deploy: "每机一个，与 Display 同进程" },
      { id: "decoder", name: "Decoder", role: "H.264/H.265 硬解、HAP/NotchLC GPU 解、序列帧 IO", thread: "独立线程池，按视频轨分配", deploy: "Display Node 内部" },
      { id: "mapper", name: "Geometry Mapper", role: "加载 glTF/OBJ → UV → 切片坐标 → 输出 viewport", thread: "渲染线程内，初始化时构建", deploy: "Display Node 内部" },
      { id: "playback", name: "Playback Engine", role: "时间线状态机、Cue 跳转、预取调度", thread: "与 Director 通信的后台线程", deploy: "Director + Display 各一份" },
      { id: "ctrlapi", name: "Control API", role: "OSC / UDP / Art-Net / HTTP 外部控制入口", thread: "IOCP / epoll 网络线程", deploy: "Director 进程" },
      { id: "project", name: "Project Store", role: "工程文件读写、版本校验、素材清单", thread: "主线程或后台", deploy: "Director 进程" }
    ],
    threading: {
      lead: "Display Node 是三线程模型。关键约束：渲染线程的 SwapBuffers / QueuePresent 必须在 Sync Manager 给出的 barrier 帧号上才放行。",
      threads: [
        { name: "Render Thread", priority: "TIME_CRITICAL", duty: "VBlank 等待 → 提交合成帧 → SwapBuffers", sync: "在 QueuePresent 前调 syncBarrier.wait(targetFrame)" },
        { name: "Decode Thread(s)", priority: "HIGH", duty: "从磁盘/网络读 → 硬解/GPU 解 → 写入纹理池", sync: "解码完成后通知 Playback 该帧可用" },
        { name: "Sync Control Thread", priority: "REAL_TIME (或 HIGH)", duty: "监听 Sync 卡帧计数中断、维护 barrier 表、协商跳转", sync: "广播当前帧号、收集各节点 ready 状态" }
      ],
      notes: [
        "Windows 下用 QueryThreadCycleTime 做每帧耗时监控，超预算告警。",
        "Linux 下用 SCHED_FIFO + mlockall 锁定同步线程。",
        "解码线程与渲染线程通过无锁环形缓冲（frame queue）交换纹理指针，避免 mutex 抖动。"
      ]
    },
    gpuApi: {
      lead: "第一版选 DX11 flip model。理由：NVIDIA Sync 卡的 Quadro / RTX PRO Sync 驱动对 DX11 的 swap barrier 支持最成熟；disguise / WATCHOUT / PIXERA 当前主力仍是 DX11。",
      options: [
        { api: "DX11 (flip model)", pros: "成熟；IDXGIDevice::WaitIdle 可做 barrier；NVIDIA 驱动覆盖全", cons: "单线程提交瓶颈", verdict: "第一版" },
        { api: "DX12 / Vulkan", pros: "多线程提交；显式内存控制", cons: "swap barrier 在 NVIDIA Sync SDK 里支持不如 DX11 直观；开发周期长", verdict: "第二版评估" },
        { api: "OpenGL", pros: "跨平台", cons: "NVIDIA 已弱化专业 GL 驱动更新；present 控制粒度粗", verdict: "不推荐" }
      ]
    },
    syncImpl: {
      lead: "有 Quadro Sync II / RTX PRO Sync 时走硬件；没有时走软件近似（精度降级但可用）。",
      hwPath: [
        "通过 NVIDIA Sync API（nvsync.h）注册到 swap group。",
        "Sync 卡产生帧计数中断；Sync Control Thread 读取当前帧号。",
        "渲染线程在 QueuePresent 前等待：当前帧号 == targetFrame 才放行。",
        "所有 GPU 在同一帧计数上完成 present → 屏端看到同一帧。"
      ],
      swApprox: [
        "无 Sync 卡时用高精度多媒体定时器（timeBeginPeriod(1)）+ DwmGetCompositionTimingInfo 获取 VBlank 相位。",
        "多机间通过 UDP 广播本机当前 VBlank 帧号 + 时间戳（PTP 软件对时，精度约 100 μs）。",
        "Leader 发出「第 N 帧切」，各节点等到本地 VBlank 计数 == N 才 present。",
        "精度：同机多 GPU 约 ±1 行；跨机约 ±半帧（取决于网络抖动）。适合展厅长卷，不适合巡演级 LED 墙。"
      ]
    },
    jumpImpl: {
      lead: "跳转是一个带截止时间的状态机。核心原则：没就绪不切。",
      states: ["IDLE → RECEIVED → PREFETCHING → READY_WAIT → BARRIER_HOLD → COMMITTED / ABORTED"],
      steps: [
        "Director 发出 JumpTo(targetTime, effectiveFrame, prefetchDeadline)。effectiveFrame 通常 = 当前帧 + 预卷帧数。",
        "各 Display Node 收到后进入 PREFETCHING：解码器退 IDR → 向前解到 targetTime → 纹理上传后台。",
        "解完回报 READY。Sync Manager 收集所有节点状态。",
        "到 effectiveFrame 的 VBlank 沿：全部 READY → 一起 QueuePresent 新画面。",
        "有节点未 READY → 整组保持旧画面，effectiveFrame 往后推，直到全部就绪或超时 ABORTED。"
      ],
      timeout: "超时阈值建议 = 2× GOP 长度 + 200 ms。超时后告警但不黑屏，继续播旧画面。"
    },
    projectFormat: {
      lead: "工程文件是可 diff 的 JSON + 二进制素材分离。不用专有二进制格式。",
      schema: [
        "project.json：时间线、Cue、图层、输出配置、同步组名单",
        "screens/：glTF/OBJ 模型 + UV 贴图",
        "media/：素材目录（按哈希命名，不依赖文件名）",
        "sync.json：同步组配置（哪些 GPU 进哪个 swap group）",
        "layout.json：切片清单（每个输出 viewport 对应屏体的哪个矩形/网格区域）"
      ],
      versioning: "project.json 带 schemaVersion 字段。升级时写 migration 脚本。"
    }
  },

  failover: {
    lead: "主备是选型第一影响因子。公开资料里至少有五种模型，恢复时间和工程一致性完全不同。",
    models: [
      {
        id: "understudy",
        name: "disguise Understudy",
        topology: "Director + 1~N Understudy。Understudy 实时镜像 Director 的时间线状态和渲染参数。",
        switch: "Director 故障时，Understudy 接管输出。手册写：切换期间可能丢 1–2 帧。",
        consistency: "工程级同步——Understudy 持有完整工程副本。",
        risk: "Understudy 不跑渲染时 GPU 温度低，冷启动到满帧有延迟；建议 Understudy 也进同步组。"
      },
      {
        id: "multi-runner",
        name: "WATCHOUT 多 Runner",
        topology: "Director 广播播放状态；多个 Runner 各自渲染自己的切片。没有「镜像桌面」概念。",
        switch: "Director 挂了，Runner 继续播当前节目。新指令无法下发。",
        consistency: "Runner 本地有 show 缓存（load 时拉取），不需要实时连 Director。",
        risk: "不是热备模型——Director 是控制面单点。巡演常配双 Director + 手动切。"
      },
      {
        id: "leader-follower",
        name: "7thSense Timing Group",
        topology: "Leader 广播 playhead；Follower 跟帧。",
        switch: "Leader 挂了全组停——这是架构取舍，不是缺陷。",
        consistency: "Follower 本地有完整素材和时间线，缺的是时间参考。",
        risk: "需要外接 LTC 或 GPS 做独立时间源才能避免 Leader 单点。"
      },
      {
        id: "cn-hot-standby",
        name: "国内主备实时同步（Kommander / HiRender）",
        topology: "一主一备，主端异常时切备端输出。备端实时同步主端操作。",
        switch: "宣称无缝切换。具体丢帧数未公开。",
        consistency: "工程与素材需事先同步到备端。主端修改后同步窗口内可能不一致。",
        risk: "切换机制是软件检测 + 网络心跳。心跳超时阈值、切换时是否等 Sync 卡帧号对齐，公开页未写。"
      },
      {
        id: "ring-backup",
        name: "拼接器环路备份（卡莱特 / 诺瓦）",
        topology: "发送卡网口做环路：正常时 A 路输出，A 断时 B 路接上。",
        switch: "处理器侧冗余，不是播控侧。切换在接收卡层面。",
        consistency: "播控机不需要感知——处理器继续输出同一画面。",
        risk: "只覆盖「一台发送卡或一段网线故障」。播控机本身挂了不在此范围。"
      }
    ],
    comparison: [
      { dimension: "恢复时间", understudy: "1–2 帧", multiRunner: "0（Runner 不停）", leaderFollower: "全停", cnHotStandby: "未公开，宣称无缝", ringBackup: "亚帧（接收卡层）" },
      { dimension: "工程一致性", understudy: "完整镜像", multiRunner: "本地缓存", leaderFollower: "本地有素材缺时间源", cnHotStandby: "同步窗口内可能不一致", ringBackup: "不涉及" },
      { dimension: "控制面单点", understudy: "Director 挂后 Understudy 接管", multiRunner: "Director 挂后无法下发新指令", leaderFollower: "Leader 挂后全停", cnHotStandby: "主端挂后切备端", ringBackup: "无控制面" },
      { dimension: "是否进同步组", understudy: "建议进", multiRunner: "Runner 已在", leaderFollower: "Follower 已在", cnHotStandby: "备端是否进 Sync 组未公开", ringBackup: "不相关" }
    ]
  },

  audioSync: {
    lead: "音频在 LED 播控里通常不是主角，但它和帧锁的交互是现场高频问题。音频设备缓冲比视频长，切换时声画错位比画面撕更容易被观众察觉。",
    issues: [
      { t: "缓冲差异", d: "视频流水线 1–3 帧（16–50 ms @60fps）。USB / ASIO 声卡缓冲通常 5–20 ms 额外延迟。多机各自出声卡型号不同，差值可达 10 ms 以上。" },
      { t: "LTC 与音频", d: "7thSense 手册写：音频要无缝接上，下一段得提前在下一个时钟周期 cue 好。音频预卷帧数通常大于视频（建议 100–200 帧）。" },
      { t: "嵌音频的陷阱", d: "Pandoras Box 帮助页明确：视频文件必须用基本流（elementary stream）。嵌了音频会把视频同步拐到音频时钟上，导致画面跟 genlock 脱节。" },
      { t: "Dante / AVB", d: "专业音频网络走 PTP（IEEE 1588）。如果 LED 播控机同时是 Dante 节点，PTP 域和 ST 2110 的 PTP 域可能冲突。第一版 DP/HDMI 方案不引入 Dante。" },
      { t: "MADI / AES3", d: "巡演场景常用外置音频处理器做延迟补偿。播控只需保证输出帧与音频触发信号（GPI / LTC）对齐。" }
    ],
    recommendations: [
      "播控软件内部维护独立的音频时钟，不要从视频 VBlank 派生。",
      "跳转时音频先 mute 或走交叉淡入，等新画面稳定后再恢复。",
      "多机音频输出走同一张声卡或数字链路（AES / MADI），避免各机模拟输出相位不同。",
      "LTC 驱动时间线时，音频缓冲比视频深，预卷帧数取 max(视频预卷, 音频预卷)。"
    ]
  },

  frameRates: {
    lead: "源素材帧率、工程时间线帧率、GPU 输出帧率、Genlock 参考帧率、LED 处理器输入帧率、箱体刷新率——六层帧率必须对齐或有明确转换策略。",
    commonRates: ["23.98", "24", "25", "29.97", "30", "50", "59.94", "60", "100", "120"],
    constraints: [
      { pair: "工程帧率 ↔ GPU 输出", rule: "必须相等。Quadro Sync 卡的帧计数按输出刷新率走。工程 25 fps 但输出设 60 Hz，每 3 帧里有一帧是重复的。" },
      { pair: "GPU 输出 ↔ Genlock 参考", rule: "BNC 进来的 house-sync 频率必须等于输出刷新率（或整数倍）。MX40 Pro 支持 23.98–60 Hz；Brompton 支持 23.98–250 Hz。" },
      { pair: "处理器输入 ↔ 箱体刷新", rule: "Tessera 手册：输入帧率与参考不一致会加倍或丢帧。箱体刷新率 = 输入帧率 × 扫描深度整数倍。" },
      { pair: "源素材 ↔ 工程", rule: "29.97 源在 25 fps 工程里需要去隔行 + 帧率转换。转换策略（drop/duplicate/blend）必须在工程设置里声明。" }
    ],
    dropFrame: "59.94 / 29.97 是 drop-frame 时间码：每分钟丢掉特定帧号使墙钟对齐。LTC 解码时必须知道 DF/NDF 模式，否则长节目会漂约 3.6 秒/小时。",
    pulldown: "24 → 29.97 用 3:2 pulldown。24 → 60 用 2:2:2:2:2（每帧重复一次）。LED 播控一般不做实时 pulldown——转码阶段处理，播出时帧率一致。"
  },

  networkPlan: {
    lead: "没有带宽数字，BOM 做不出来。下面按典型配置给出量级。",
    bandwidths: [
      { item: "16K@60 无损序列帧（DPX 12bit）", bw: "单帧 ≈ 16384×9216×4.5 bytes ≈ 680 MB；60 fps ≈ 40.8 GB/s", note: "走本地 NVMe RAID 0（PCIe 4.0 x4 单盘约 7 GB/s，需 6 盘以上）。不走网络。" },
      { item: "16K@60 HAP", bw: "码率约 1.5–3 Gb/s", note: "单机本地播放。多机分发走节目网。" },
      { item: "8K@60 ProRes 422 HQ", bw: "码率约 3.3 Gb/s", note: "本地 SSD 即可。" },
      { item: "工程文件同步（Director → Display）", bw: "典型 5–50 MB", note: "load 时一次性拉取，不是持续流。走控制网。" },
      { item: "Art-Net / sACN", bw: "每 universe 约 44 bytes × 44 fps ≈ 8 KB/s", note: "流量极小，但需要低延迟。走控制网 VLAN。" },
      { item: "NDI HX3 4K", bw: "约 125–250 Mb/s", note: "走节目网或专用采集网。" },
      { item: "Quadro Sync CAT5 菊花链", bw: "不走 IP，不占带宽", note: "物理隔离，绝不进交换机。" },
      { item: "ST 2110（第一版不做）", bw: "单路 2160p59.94 10bit 4:4:4 ≈ 12 Gb/s", note: "需要 25GbE 或 100GbE 专用视频网。" }
    ],
    vlanPlan: [
      { vlan: "VLAN 10 – 控制网", use: "Director ↔ Display 心跳、OSC/UDP、Art-Net、Pad 中控", note: "1 GbE 即可" },
      { vlan: "VLAN 20 – 节目网", use: "素材分发、NDI 采集、工程同步", note: "10 GbE 推荐" },
      { vlan: "VLAN 30 – 音频（如用 Dante）", use: "PTP + 音频流", note: "第一版可不做" },
      { physical: "Sync 卡 RJ45", use: "NVIDIA Frame Lock 菊花链", note: "物理隔离，不接任何交换机" },
      { physical: "BNC", use: "House-sync 发生器 → Sync 卡 / 处理器", note: "75Ω 同轴，不进网络" }
    ]
  },

  contentPipeline: {
    lead: "从源素材到播出格式，是转码阶段的工序，不是现场同步手段。自研软件必须定义输入格式和存储架构。",
    steps: [
      { step: "1 源素材入库", detail: "支持格式：ProRes 422/4444、H.264/H.265、DNxHR、EXR/DPX 序列、PNG 序列、TIFF 序列。入库时自动探测帧率、色彩空间、GOP 结构。" },
      { step: "2 转码决策", detail: "需要随机跳转 → 转 HAP / NotchLC / 序列帧。只需连续播 → 保留 H.265 硬解。超 8K → 拆成多路 4K 或走序列帧。" },
      { step: "3 分辨率对齐", detail: "输出分辨率 = 屏体点对点。转码时按切片清单预裁切（每个 Display Node 一份），或运行时 GPU viewport 裁切。前者省 GPU 带宽，后者灵活。" },
      { step: "4 色彩空间", detail: "LED 处理器通常接收 RGB 4:4:4。HDR 内容（BT.2020 PQ/HLG）需要处理器支持 12bit 输入。第一版按 BT.709 8bit 做。" },
      { step: "5 存储部署", detail: "每台 Display Node 本地 NVMe 存素材副本。工程同步走控制网。不用 NAS 做实时播放源（网络抖动 = 掉帧）。" },
      { step: "6 校验与回滚", detail: "转码后逐帧 CRC 校验。保留原始素材 30 天。工程文件每次保存写双份（主 + .bak）。" }
    ],
    storageSizing: [
      { config: "8K@60 HAP 10 分钟", size: "约 150 GB" },
      { config: "16K@60 序列帧（DPX 12bit）10 分钟", size: "约 24 TB" },
      { config: "16K@60 HAP 10 分钟", size: "约 300 GB" },
      { config: "4K@25 ProRes 422 HQ 1 小时", size: "约 110 GB" }
    ]
  },

  ledPanel: {
    lead: "LED 箱体不是显示器终端。它的刷新方式、扫描深度、余辉特性直接影响同步策略和摄像机拍摄效果。",
    characteristics: [
      { t: "刷新率 vs 输入帧率", d: "箱体刷新率（3840 / 7680 Hz）是灯珠 PWM 扫描频率。输入帧率（60 Hz）是每帧完整数据到达率。两者是整数倍关系。Tessera 手册：输入帧率 ≠ 参考时加倍或丢帧。" },
      { t: "扫描方式", d: "1/4、1/8、1/16 扫：一帧数据分多行轮流点亮。摄像机 rolling shutter 会拍到扫描黑条。1/1 扫（高刷箱体）无此问题但成本高。" },
      { t: "余辉（Persistence）", d: "LED 是采样保持型（整帧亮到下一帧替换）。与 CRT 脉冲型不同，运动物体在摄像机里有拖影。缓解：黑帧插入（降低亮度）或提高输入帧率到 120 Hz。" },
      { t: "处理器延迟", d: "Brompton / MX40 从输入到灯珠输出有 1–3 帧处理延迟。多处理器级联时延迟叠加。Brompton 手册要求匹配端到端延迟。" },
      { t: "低延迟模式与 Genlock 互斥", d: "MX40 Pro 手册明确：开低延迟模式不能同时开 Genlock。巡演需要低延迟时，帧同步靠 NVIDIA Sync 卡，处理器按内部钟。" }
    ],
    cameraInteraction: [
      "摄像机快门角度 180° + LED 输入帧率 60 Hz → 无闪烁。",
      "25 fps 电影快门 + 60 Hz LED → 可能出现拍频条纹。Tessera Phase Offset 可调。",
      "XR 虚拟制片：摄像机帧率 = LED 输入帧率 = Genlock 参考帧率 = 三件事锁在一起。"
    ]
  },

  interactiveContent: {
    lead: "实时生成内容和互动触发越来越多。它们接入播控链路的方式影响延迟预算和同步策略。",
    patterns: [
      { name: "Spout / Syphon 注入", detail: "Notch / TouchDesigner / Unreal 把画面通过 GPU 纹理共享灌进播控。零拷贝但同机限。延迟 < 1 帧。", syncImpact: "注入的画面和播控自己的画面在同一 GPU 上合成，present 仍走同一 barrier。" },
      { name: "NDI 采集", detail: "外部摄像机或另一台机器的画面通过 NDI 进入播控。延迟约 1–3 帧（编码 + 网络 + 解码）。", syncImpact: "NDI 流本身不带帧锁信息。播控收到后按当前 VBlank 采样，可能比本机内容晚 1–2 帧。" },
      { name: "ST 2110 输入（第一版不做）", detail: "广播级 IP 视频。PTP 对时后延迟确定（通常 1 帧内）。下方有 ST 2110 标准族深读。", syncImpact: "需要 L4 PTP 域。与 DP 输出的 L3 genlock 是两套。" },
      { name: "传感器触发", detail: "手势（MediaPipe / Kinect）、雷达、DMX 信号触发场景切换。", syncImpact: "从传感器事件到 JumpTo 指令下发，延迟取决于轮询间隔。建议事件驱动（中断 / WebSocket）而非轮询。" },
      { name: "实时渲染引擎", detail: "Unreal / Notch 作为背景层，LED 播控作为前景叠加。", syncImpact: "引擎的渲染帧率必须与播控输出帧率一致，否则合成时出现 judder。nDisplay 方案里引擎和播控是同一个进程。" }
    ],
    latencyBudget: [
      { stage: "摄像机跟踪 → 引擎收到", ms: "5–15 ms" },
      { stage: "引擎渲染 → 纹理就绪", ms: "8–16 ms（一帧）" },
      { stage: "合成 → GPU present", ms: "0–16 ms（等 VBlank）" },
      { stage: "处理器 → 箱体点亮", ms: "16–33 ms（1–2 帧）" },
      { stage: "总计（摄像机到屏幕）", ms: "45–80 ms" }
    ]
  },

  st2110: {
    lead: "ST 2110 是广播设施级的「无压缩专业媒体 over IP」族。它解决的是 SDI 被拆成视频/音频/辅助数据后，在 IP 网上按同一时钟精确重组的问题。对 LED 播控，它是 L4 传输时钟层的候选来源，但第一版不接入。",
    parts: [
      { code: "ST 2110-10", name: "系统定义", note: "把 SDI 按 essence 拆分为独立流；定义 RTP 时间戳基准 = PTP / ST 2059。" },
      { code: "ST 2110-20", name: "无压缩视频", note: "每路视频一条 RTP 流，12-bit 4:4:4 可选。2160p59.94 10bit 4:4:4 ≈ 12 Gb/s。" },
      { code: "ST 2110-21", name: "流量整形", note: "N / NL / W 三类（VSF TR-04），约束 CBR 抖动，决定交换机选型。" },
      { code: "ST 2110-30", name: "PCM 音频", note: "48k / 24bit，单流最多 16 通道。" },
      { code: "ST 2110-40", name: "辅助数据", note: "时间码、字幕等 VANC / HANC。" },
      { code: "ST 2110-22", name: "浅压缩视频", note: "JPEG XS / VC-2 / TICO；带宽降到 1/3–1/10，10GbE 可跑多路。" },
      { code: "ST 2022-7", name: "无缝冗余", note: "A/B 双网，无丢包切换（mission-critical）。" },
      { code: "NMOS", name: "发现与连接", note: "IS-04 设备发现 + IS-05 连接管理（AMWA）。" },
      { code: "ST 2059-2", name: "PTP profile", note: "基于 IEEE 1588-2008 的广播 profile，定义报文率与采样率；全局 grandmaster。" }
    ],
    network: [
      { item: "专用视频网", val: "25 / 100 GbE", note: "与控播网、节目网、Sync 菊花链物理隔离，不进同一交换机。" },
      { item: "网卡", val: "ST 2110 NIC", note: "需支持 PTP 硬件时间戳；普通网卡抓包会偏，不能当接收。" },
      { item: "交换机", val: "PTP 感知", note: "Boundary / Transparent Clock，否则抖动累积。" },
      { item: "冗余", val: "ST 2022-7", note: "双网 A/B，链路故障无感切换。" },
      { item: "抖动", val: "2110-21 N 型", note: "严格 CBR；缓冲区 21 ms 量级，要按类设计。" }
    ],
    vsNdi: [
      { dim: "同步", a: "PTP 硬同步，跨机确定", b: "软同步，帧锁信息弱" },
      { dim: "带宽", a: "无压缩 12 Gb/s 起，需 25/100G", b: "压缩，1 GbE 可跑" },
      { dim: "延迟", a: "对时后 < 1 帧", b: "约 1–3 帧" },
      { dim: "网络", a: "专用 + PTP + 专用 NIC", b: "通用 IP 即插即用" },
      { dim: "运维", a: "NMOS + 专业排障", b: "软件即开即用" },
      { dim: "适用", a: "广播设施 / 固定大型安装", b: "演播室 / 现场快速部署" }
    ],
    bwBars: [
      { name: "NDI HX3 4K", gbps: 0.25, fill: "#e2a73a", note: "压缩，1GbE 可" },
      { name: "ST 2110-22 浅压缩 4K", gbps: 1.5, fill: "#3ad7c4", note: "JPEG XS / VC-2" },
      { name: "ST 2110-20 无压缩 4K", gbps: 12, fill: "#3ad7c4", note: "需 25GbE" },
      { name: "ST 2110-20 无压缩 8K", gbps: 48, fill: "#e36b5c", note: "需 100GbE" }
    ],
    radar: [
      { dim: "同步确定性", a: 5, b: 2, hint: "PTP 硬同步 / 软同步弱帧锁" },
      { dim: "带宽效率", a: 2, b: 5, hint: "无压缩吃网 / 压缩省网" },
      { dim: "低延迟", a: 5, b: 3, hint: "<1 帧 / 1–3 帧" },
      { dim: "网络简易", a: 2, b: 5, hint: "专用+PTP+NIC / 通用即插" },
      { dim: "运维简易", a: 2, b: 5, hint: "NMOS 专业 / 软件即开" },
      { dim: "设施级适用", a: 5, b: 3, hint: "广播固定安装 / 现场快速" }
    ],
    whySkip: "需要独立的 L4 PTP 域 + 专用 25/100G 视频网 + ST 2110 NIC；它和 DP 输出的 L3 genlock 是两套时序域。第一版 DP/HDMI 点对点先把 L1–L3 做对，多机联机帧同步用 NVIDIA Frame Lock 已满足多数 LED 播控，上 ST 2110 复杂度/收益不匹配。",
    latency: "PTP 对时后延迟确定，通常 1 帧内（< 16.7 ms @60 fps，< 20 ms @50 fps）。"
  },

  commissioning: {
    lead: "从开箱到演出就绪的正向检查清单。每一步有可观测信号。",
    steps: [
      { phase: "1 硬件上架", items: ["GPU 型号/数量与工程配置一致", "Sync 卡排线接好（每 GPU 一根到 SYNC 口）", "BNC house-sync 发生器到各机 + 处理器", "CAT5 菊花链不走交换机", "DP/HDMI 口编号与切片清单对应"], verify: "NVIDIA 控制面板 → 查看 Sync 卡状态灯" },
      { phase: "2 系统配置", items: ["各机分辨率/刷新率一致", "EDID 统一（用处理器 EDID 写入或锁 EDID 器）", "Windows GPU 驱动版本一致", "电源计划设为高性能，关闭 USB 选择性暂停"], verify: "dxdiag / nvidia-smi 确认" },
      { phase: "3 同步组建", items: ["打开 Mosaic 或手动多屏", "创建 Hardware Sync Group / Framelock Group", "确认 timing server 角色", "输出测试图（黑白格 + 帧号）"], verify: "相邻箱体接缝无错位" },
      { phase: "4 工程导入", items: ["导入屏体模型/UV", "配置切片清单", "素材路径校验", "时间线/预案配置"], verify: "预监画面与输出一致" },
      { phase: "5 跳转测试", items: ["每个 Cue 手动跳一次", "观察有无黑帧或旧帧残留", "记录跳转延迟（从指令到画面变化）"], verify: "高速摄像机 240fps 拍接缝，确认同帧切" },
      { phase: "6 外部控制", items: ["中控 UDP / OSC 连通性", "LTC 锁定测试（拔线、毛刺）", "Art-Net universe 映射"], verify: "从控台触发全部 Cue" },
      { phase: "7 主备切换", items: ["模拟主端断电", "观察备端接管时间和丢帧数", "恢复后回切"], verify: "观众位看不到黑屏" },
      { phase: "8 长时间烤机", items: ["连续 72 小时循环播放", "监控 GPU 温度、显存、磁盘 IO", "检查 Sync 卡帧计数有无溢出复位"], verify: "无丢帧、无撕缝、无内存泄漏" }
    ]
  },

  scalability: {
    lead: "第一版 2–4 台。写排期时要有意识：哪些设计在 8 台以上会遇到瓶颈。",
    limits: [
      { item: "Quadro Sync II", limit: "4 GPU/卡，2 卡/机 = 8 GPU/机", workaround: "超过 8 GPU 需要多机 + Frame Lock 菊花链。菊花链长度 NVIDIA 未写硬上限，但建议 ≤ 8 节点。" },
      { item: "CAT5 菊花链", limit: "物理走线距离短（< 5 m 推荐）", workaround: "大型场馆用 Timing Server 分两路链。不能用交换机扩展。" },
      { item: "24-bit 帧计数", limit: "@60fps 约 3 天溢出", workaround: "WATCHOUT 文档写：溢出时软件复位，有约 4 帧毛刺。长时间展览需规划复位窗口。" },
      { item: "工程同步", limit: "节点越多，load 时间越长", workaround: "素材预分发 + 增量同步。第一版 4 台内不是问题。" },
      { item: "present barrier", limit: "协商轮次随节点数线性增长", workaround: "用组播代替逐台单播。8 台以上时评估。" }
    ],
    futurePath: "当集群超过 8 台或需要广播级 IP 输出时，L4（ST 2110 + PTP）变成必选项。第一版架构里把 Sync Manager 做成可插拔后端（hw-sync / sw-sync / future-ptp-sync），不写死。"
  }
};
