window.SURVEY = {
  generated: "2026-09-18",
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
    { t: "PIXERA Genlock / Framelock", u: "https://help.pixera.one/graphic-cards/synchronize-outputs-genlock-framelock-setup" }
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
      meaning: "几何映射支线：球形屏不是矩形裁切，必须有「配置文件 → 经纬坐标」这一步。",
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
      meaning: "映射步骤 3 的算法化：离线烘焙预畸变，降低现场实时 3D 的算力。",
      url: "https://www.xjishu.com/zhuanli/62/202611016217.html"
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
      t: "Director 与 Display 解耦",
      d: "控制面负责工程、素材、预监；显示节点只解码、映射、present。Director 是否出画决定它要不要进硬件同步组（PIXERA / disguise 均如此）。"
    },
    {
      t: "垂直整合是产品策略不是同步策略",
      d: "诺瓦、卡莱特、凯视达把播控接到自家发送卡，降低现场配屏成本。帧同步仍然要在 GPU 与处理器之间成立，发送卡协议替代不了 Quadro 菊花链。"
    }
  ]
};
