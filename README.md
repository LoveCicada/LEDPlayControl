# LEDPlayControl

超分辨 LED 显示播控的调研与后续自研仓库。播控软件本体尚未实现。当前交付是一份可离线打开的行业调研页，共 **23 章**，资料截止 **2026-09-23**。

页面对照国内外媒体服务器怎么把一块超大、异形的 LED 屏播成同一帧：连续播放怎么锁，跳转和 Seek 在哪一帧切，球形和折面的像素从哪张几何来。结论按公开资料分级，未公开的集群报文不补字段。

静态调研站：[research/led-playcontrol-survey/index.html](research/led-playcontrol-survey/index.html)

双击该 HTML 即可本地打开，不依赖外网字体或构建工具。

## 调研做了什么

样本是 18 家产品：深潜 7 家播控，对照 11 家，其中 Brompton Tessera 与诺瓦 MX/COEX 是处理器，用来钉屏端同步，不是时间线播控。国内名称已对齐：kCommander 即 Kommander，hecos 即 hecoos / 澜景。

章节入口（链到调研页锚点）：

1. [问题](research/led-playcontrol-survey/index.html#problem)
2. [四层同步](research/led-playcontrol-survey/index.html#stack)
3. [指令生效](research/led-playcontrol-survey/index.html#command)
4. [音频与帧率](research/led-playcontrol-survey/index.html#audio)
5. [异形切片](research/led-playcontrol-survey/index.html#mapping)
6. [三种 3D](research/led-playcontrol-survey/index.html#geom)
7. [主界面](research/led-playcontrol-survey/index.html#ui)
8. [全链路](research/led-playcontrol-survey/index.html#chain)
9. [网络与带宽](research/led-playcontrol-survey/index.html#network)
10. [LED 面板](research/led-playcontrol-survey/index.html#panel)
11. [内容准备](research/led-playcontrol-survey/index.html#pipeline)
12. [机柜编码](research/led-playcontrol-survey/index.html#rack)
13. [撕缝](research/led-playcontrol-survey/index.html#tears)
14. [主备容灾](research/led-playcontrol-survey/index.html#failover)
15. [场景控制](research/led-playcontrol-survey/index.html#scenes)
16. [实时交互](research/led-playcontrol-survey/index.html#interactive)
17. [对比矩阵](research/led-playcontrol-survey/index.html#matrix)
18. [厂商](research/led-playcontrol-survey/index.html#vendors)
19. [专利](research/led-playcontrol-survey/index.html#patents)
20. [开源](research/led-playcontrol-survey/index.html#oss)
21. [自研架构](research/led-playcontrol-survey/index.html#build)
22. [Commissioning](research/led-playcontrol-survey/index.html#commission)
23. [出处](research/led-playcontrol-survey/index.html#refs)

### 多机怎么锁在同一帧

把各家都叫「帧同步」的说法收成四层，后面的厂商卡和热图都映射到这里：

1. **时间对齐**：NTP、LTC、厂商时码包。管节目进度，不管 GPU 何时扫出。
2. **帧身份**：这一拍 present 哪一帧。WATCHOUT 写明 Genlock 只锁扫描相位，不锁内容帧号。
3. **扫描相位**：NVIDIA Quadro Sync II / RTX PRO Sync、外置 house-sync。同步口是 CAT5 直连，不进交换机。
4. **传输时钟**：PTP / ST 2110。只服务 IP 视频包，第一版 DP/HDMI 播控不做这一层。

硬件图按公开接口绘制：Sync II 与 RTX PRO Sync 是同一块板的更名；旧文档里的 G-Sync II 单独标出，不和现役卡混。国内三家「帧同步」只写到能核到的物理层：KFS / Kommander F30 可落到 NVIDIA Frame Lock，GrandShow Sync 推断走以太网，Kompass Lora 是无线对时。应用层报文仍是 C。

LTC 单独写了接收侧：坏帧要校验、飞轮、迟滞锁定，不能直接驱动播放头。

### 跳转和 Seek 在哪一帧切画面

连续播放锁住之后，跳转、时间线 Seek、场景切换仍会撕。Genlock 只保证各机同一时刻开始扫，不保证扫的是切换后的那一帧。

公开手册收成四种生效方式：

- **到达即执行**：中控包只有目标时间、Cue 或场景号。诺瓦 Kompass FX3 的方法 389 / 390 / 10005 是这种外形。它描述中控对一台软件说什么，不是多机在哪一帧一起切。
- **播放头跟随**：指令只打到 Leader / Director，从机跟「现在播这一帧」。7thSense、WATCHOUT 7、PIXERA、Pandoras Box 走这条。没有 genlock 时，7thSense 仍可能差约 1 帧。
- **延迟生效**：命令现在收下，过若干帧或等预载完成再换画面。disguise 从 r30.4 起默认延迟 2 帧，用来跨机对齐并让 prefetcher 先读跳转点。PIXERA 26.3 的 TC Jump Preload Delay 是指针先跳、画面晚切。
- **两阶段 Take**：先装载、等就绪，再短指令一起开播。WATCHOUT 是 `load` → `wait` → `run`。国内预监 / KV 跳场景是同一种交互；Take 有没有量化到同步卡帧号，公开页没写。

解码约束写在同一章：帧号对齐不等于显存里已经有那一帧。长 GOP 的 H.264/H.265 要先退回 IDR 再向前解；7thSense 纯视频预卷至少 5 帧，编码或音频建议 100–200 帧。disguise 的 2 帧只够对齐命令并开始预取，盖不住一个 2 秒的 GOP。序列帧和帧内编码（ProRes、HAP、NotchLC）可以在切点直接取那一帧。有节点没把目标帧解出来，这一拍不应先切。

HiRender、hecoos、KFS、GrandShow Sync 的集群跳转报文没有公开文本，页面保持空项。

### 音频同步与帧率适配

音频缓冲比视频长。视频流水线大约 1–3 帧（60 fps 下 16–50 ms），USB / ASIO 声卡还要再加 5–20 ms；多机声卡不同时，差值可以到 10 ms 以上，声画错位比接缝撕裂更先被听出来。

- 7thSense：下一段音频要在下一个时钟周期提前 cue 好才能无缝接上。音频预卷通常深于视频，建议 100–200 帧。
- Pandoras Box：视频用基本流。文件里嵌了音频，同步会被拐到音频时钟上，画面脱离 genlock。
- Dante / AVB 走 PTP。播控机同时当 Dante 节点时，这个域和 ST 2110 的 PTP 域会冲突。第一版 DP/HDMI 方案不引入 Dante。巡演上的延迟补偿留给外置 MADI / AES3，播控只保证输出帧与 GPI / LTC 对齐。

收成的做法：播控自己维护音频时钟，不从视频 VBlank 派生。跳转时先 mute 或做交叉淡入，新画面稳定后再出声。多机出声走同一张声卡或同一条数字链路。LTC 驱动时间线时，预卷取视频和音频里更深的那一档。

帧率有六层，要对齐，或把转换写进工程：工程帧率、GPU 输出、Genlock 参考、处理器输入、箱体刷新、源素材。工程帧率与 GPU 输出必须相等。Quadro Sync 的帧计数按输出刷新率走；工程 25 fps、输出 60 Hz 时，每 3 帧里有一帧是重复的。BNC 进来的 house-sync 必须等于输出刷新率或它的整数倍（MX40 Pro 约 23.98–60 Hz，Brompton 约 23.98–250 Hz）。箱体刷新率是输入帧率乘扫描深度的整数倍；输入和参考不一致时，Tessera 会加倍或丢帧。

59.94 / 29.97 是 drop-frame。LTC 必须区分 DF / NDF，否则长节目大约漂 3.6 秒/小时。24→29.97 的 3:2、24→60 的重复帧放在转码阶段做完。播出时帧率已经一致，不做实时 pulldown。

### 异形屏的像素从哪来

切片流水线是：网格 → UV → 观察点 → 切片 → 锁帧。2D 多边形留给矩形和折面；球、环、自由曲面以三维模型为源。

「3D」在公开资料里被拆开，避免混成一个开关：

- 曲面几何：灯珠在空间的位置
- 天空盒 / 穹顶：贴的是 360 图还是鱼眼
- 裸眼立面：离线算好的一张预畸变图
- 眼镜双目：左右两张图
- XR：摄像机每帧重算视锥

三条输出都在切片之后，帧号和扫出相位仍走上面的第 2、3 层。

### 网络拓扑与内容准备

16K@60、DPX 12bit 序列帧单帧约 680 MB，60 fps 约 40.8 GB/s，走本地 NVMe RAID，不进网络。同分辨率 HAP 约 1.5–3 Gb/s，多机分发走节目网。8K@60 ProRes 422 HQ 约 3.3 Gb/s，本地 SSD 够用。工程同步是 load 时一次性拉取，典型 5–50 MB，走控制网。Art-Net 流量很小，但要低延迟。NDI HX3 4K 约 125–250 Mb/s。ST 2110 单路 2160p59.94、10bit 4:4:4 约 12 Gb/s，第一版不做。

网分成三条，Sync 口不进任何一条：

- **控制网**（1 GbE）：Director 与 Display 的心跳、OSC / UDP、Art-Net、Pad。
- **节目网**（10 GbE）：素材分发、NDI、工程同步。
- **音频网**：只有上 Dante 才建。第一版可以不建。
- **Sync 卡 RJ45**：Frame Lock 菊花链，物理隔离，不接交换机。House-sync 走 75Ω BNC。

内容准备是转码工序，不是现场对时手段。入库认 ProRes、H.264/H.265、DNxHR 和 EXR / DPX / PNG / TIFF 序列，并探测帧率、色彩空间、GOP。要随机跳转就转 HAP、NotchLC 或序列帧；只连续播可以留 H.265 硬解；超 8K 拆成多路 4K 或走序列帧。分辨率按屏体点对点，可以按切片清单预裁，也可以运行时用 GPU viewport 裁。第一版色彩按 BT.709 8bit；处理器通常收 RGB 4:4:4，HDR（BT.2020 PQ/HLG）要等 12bit 输入。每台 Display 的实时播放源是本机 NVMe，不用 NAS，网络抖动会直接掉帧。转码后做逐帧校验，工程每次保存写主份和 `.bak`。

存储量级：8K@60 HAP 十分钟约 150 GB；16K@60 HAP 十分钟约 300 GB；16K@60 DPX 12bit 序列帧十分钟约 24 TB；4K@25 ProRes 422 HQ 一小时约 110 GB。

### LED 面板特性

箱体刷新率（3840 / 7680 Hz）是灯珠 PWM，输入帧率（常见 60 Hz）是整帧数据到达率，两者保持整数倍。1/4、1/8、1/16 扫会让摄像机 rolling shutter 拍到黑条。LED 整帧保持到下一帧替换，运动物体在镜头里有拖影；减轻办法是插黑帧，或把输入提到 120 Hz。处理器从输入到灯珠大约 1–3 帧，多台级联会叠加。MX40 Pro 的低延迟模式与 Genlock 互斥：巡演要低延迟时，帧同步靠 NVIDIA Sync 卡，处理器走自己的内部钟。

180° 快门加 60 Hz 输入可以不闪。25 fps 电影快门对 60 Hz LED 可能出现拍频条纹，Tessera 用 Phase Offset 调。XR 里摄像机帧率、LED 输入帧率、Genlock 参考锁成同一件事。

### 实时交互内容接入

- **Spout / Syphon**：Notch、TouchDesigner、Unreal 同机共享纹理，延迟小于 1 帧。注入画面和播控画面在同一 GPU 上合成，present 仍走同一条 barrier。
- **NDI**：编码、网络、解码大约 1–3 帧。流本身不带帧锁，按当前 VBlank 采样，可能比本机内容晚 1–2 帧。
- **ST 2110**：PTP 对齐后延迟通常在 1 帧内。这是传输时钟那一层，第一版不做。
- **传感器**：手势、雷达、DMX 触发 JumpTo。从事件到指令的延迟取决于接收方式，用中断或推送，不用轮询。
- **实时渲染引擎**：引擎做背景、播控叠前景时，两边帧率必须一致，否则合成会抖。nDisplay 里引擎和播控是同一个进程。

XR 从摄像机到屏幕的预算：跟踪到引擎 5–15 ms，渲染一帧 8–16 ms，等 VBlank 0–16 ms，处理器到箱体 16–33 ms，合计 45–80 ms。

### 主备与容灾

公开资料里至少五种模型。对照维度是恢复时间、工程一致性、控制面单点、备端是否进同步组。

- **disguise Understudy**：实时镜像 Director 的时间线和渲染参数，持有完整工程。Director 故障时接管输出，手册写切换可能丢 1–2 帧。不跑渲染时 GPU 是冷的，建议 Understudy 也进同步组。
- **WATCHOUT 多 Runner**：Director 广播播放状态，Runner 各自渲染自己的切片，本地有 load 时拉下的 show。Director 挂了，Runner 继续播当前节目，新指令下不去。这是控制面单点，巡演常配双 Director，手动切。
- **7thSense Leader-Follower**：Follower 跟 Leader 的播放头，本地有素材，缺的是时间参考。Leader 挂了全组停。要避开这个单点，得外接 LTC 或 GPS。
- **国内主备（Kommander / HiRender）**：一主一备，备端同步主端操作，宣称无缝切换。丢帧数、心跳超时、切换时是否等到 Sync 卡帧号，公开页没写。同步窗口里工程可能不一致，备端是否进同步组也未公开。
- **拼接器环路（卡莱特 / 诺瓦）**：发送卡网口做环路，断线在接收卡层切，恢复在亚帧。只覆盖一台发送卡或一段网线。播控机本身挂了，不在这条路径里。

### 现场其余对照

- **播出全链路**：素材 → 播控 → GPU → LED 处理器 → 接收卡 → 箱体。处理器没进同一 house-sync 时，服务器锁了屏端仍撕。
- **主界面**：窗口/预案、时间线、3D 舞台三种骨架，配有可离线看的手册截图或布局示意。
- **机柜与编码**：GPU、Sync 卡、输出口、H.264/H.265、ProRes、序列帧。核不到的格子留空。
- **撕缝清单**：NTP 不等于扫出、Mosaic/EDID、主备切错对象、Leader 丢失、LTC 毛刺、跳转已到但目标帧还没换上。
- **场景与外部控制**：展厅、巡演、XR、球幕、楼宇。热图覆盖 Art-Net、OSC、MIDI、LTC、NDI、Spout、中控 UDP。
- **厂商卡与热图**：点同步层或一条故障，可以滤到对应产品。
- **专利与开源**：同步和几何分开列。开源里可借鉴的是集群 present 屏障和 UV 工具；WebSocket 软同步标明精度不够，不能当 LED 墙的对时方案。

## 证据分级

- **A** 官方手册可复核
- **B** 规格 / BOM 可推断
- **C** 营销宣称，协议未公开

只使用公开页、PDF、专利与 GitHub。未登录厂商后台，未把未公开协议写成可实施步骤。

## 已经收成的第一版约束

调研页文末把对照之后仍然成立的边界写成架构，不是产品愿景。第一版范围是 2–4 台 DP/HDMI 输出，NTP 加 Quadro Sync。

- 播放时钟默认 NTP / 内部时码。超分辨拼接叠加 NVIDIA Sync：Framelock 菊花链、可选外置 genlock、present barrier。
- 跳转对外可以是「跳到时间 / 跳到 Cue」。集群内部是目标、生效帧、预取截止。未齐备则不切。
- 异形/球形走 glTF/FBX + UV；矩形和折面保留 2D 切片。
- Director 默认不出画。出画才进入硬件同步组。Backup 同步的是操作和工程。
- 第一版不做 ST 2110 / PTP。发送卡连接关系可以读，同步栈不绑死一家。

### 架构细化

八个模块和部署位置：

- **Director**：工程编辑、时间线、预监、素材、外部协议。部署 1 台，可以不接 LED 输出。
- **Display Node**：解码、几何映射、合成、present。每台出画 GPU 一个实例。
- **Sync Manager**：帧计数、present barrier、跳转协商。与 Display 同进程。后端可插拔：硬件同步、软件近似、以后的 PTP。第一版不把后端写死。
- **Decoder**：H.264/H.265 硬解、HAP / NotchLC、序列帧 IO。在 Display 内部。
- **Geometry Mapper**：glTF/OBJ → UV → 切片 → 输出口。在 Display 内部，初始化时建好。
- **Playback Engine**：时间线状态机、Cue、预取。Director 和 Display 各一份。
- **Control API**：OSC / UDP / Art-Net / HTTP。在 Director 进程。
- **Project Store**：工程读写、版本、素材清单。在 Director 进程。

Display 是三线程。Render 为 TIME_CRITICAL，在 `QueuePresent` 前等 `syncBarrier.wait(targetFrame)`。Decode 为 HIGH，解完通知该帧可用。Sync Control 为 REAL_TIME（或 HIGH），读 Sync 卡帧计数、维护 barrier、收集各节点 ready。解码和渲染用无锁环形缓冲交换纹理指针。

GPU 第一版用 DX11 flip model：NVIDIA Sync 的 swap barrier 在这条驱动上最成熟，disguise、WATCHOUT、PIXERA 当前主力也是 DX11。DX12 / Vulkan 留到第二版评估。OpenGL 不作为候选，专业 GL 驱动更新已经变弱，present 粒度也粗。

有 Quadro Sync II / RTX PRO Sync 时，经 NVIDIA Sync API 加入 swap group，渲染线程等到当前帧号等于目标帧才 present。没有卡时，用 VBlank 相位加 UDP 广播帧号：同机多 GPU 约 ±1 行，跨机约 ±半帧。这个精度适合展厅长卷，不适合巡演级 LED 墙。

跳转状态机：IDLE → RECEIVED → PREFETCHING → READY_WAIT → BARRIER_HOLD → COMMITTED / ABORTED。Director 发出 `JumpTo(targetTime, effectiveFrame, prefetchDeadline)`。有节点没把目标帧解出来，整组保持旧画面，生效帧往后推。超时大约 `2×GOP + 200 ms`：告警，继续播旧画面，不黑屏。

工程是可 diff 的 JSON，素材分开存放，带 `schemaVersion`，升级写 migration：

- `project.json`：时间线、Cue、图层、输出、同步组名单
- `screens/`：glTF/OBJ 与 UV
- `media/`：按哈希命名，不依赖文件名
- `sync.json`：哪些 GPU 进哪个 swap group
- `layout.json`：每个输出口对应屏体的哪一块

规模上限写在排期里：Quadro Sync II 是 4 GPU/卡、2 卡/机，每机 8 GPU。再往上要多机 Frame Lock 菊花链，建议不超过 8 个节点，CAT5 宜短于 5 m，不能用交换机扩。24-bit 帧计数在 60 fps 下大约 3 天溢出；WATCHOUT 写溢出复位时大约 4 帧毛刺，长时间展览要留复位窗口。节点再多时，present barrier 用组播。超过 8 台、或要做广播级 IP 输出时，传输时钟那一层才变成必选项。

### Commissioning 检查清单

从开箱到演出就绪 8 个阶段，每步看一个信号，完整勾选在调研页里：

1. **硬件上架**：GPU 数量、Sync 排线、BNC、CAT5 不进交换机、输出口编号对上切片。看 NVIDIA 控制面板里的 Sync 卡状态灯。
2. **系统配置**：各机分辨率和刷新率一致，EDID 统一，驱动版本一致。用 dxdiag / nvidia-smi 确认。
3. **同步组建**：建 Framelock Group，输出黑白格加帧号。相邻箱体接缝不错位。
4. **工程导入**：模型、切片、素材路径、时间线。预监和输出一致。
5. **跳转测试**：每个 Cue 跳一次，记下从指令到换面的时间。用 240 fps 高速摄像机拍接缝，确认同帧切。
6. **外部控制**：UDP / OSC 通，LTC 做拔线和毛刺，Art-Net universe 对上。控台能触发全部 Cue。
7. **主备切换**：模拟主端断电，看接管时间和丢帧数，再回切。观众位看不到黑屏。
8. **长时间烤机**：连续 72 小时，看 GPU 温度、显存、磁盘和帧计数有没有溢出复位。无丢帧、无撕缝、无内存泄漏。

## 下一步

按上面的第一版范围实现 LEDPlayControl：2–4 台 DP/HDMI，NTP 加 Quadro Sync。播控软件、集群协议和工程文件格式都还没写。8 台以上的集群和 ST 2110 不在这一版排期里。
