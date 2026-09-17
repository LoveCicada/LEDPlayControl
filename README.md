# LEDPlayControl

超分辨 LED 显示播控的调研与后续自研仓库。当前交付的是一份可离线打开的行业调研页，用来对照国内外媒体服务器在**多机帧同步**和**异形屏 3D 切片**上的设计，并给出 LEDPlayControl 可落地的分层建议。播控软件本体尚未实现。

## 现在有什么

静态调研站：[research/led-playcontrol-survey/index.html](research/led-playcontrol-survey/index.html)

- 四层同步模型：NTP/时码、帧身份、Genlock/Quadro Sync、PTP（ST 2110）
- 球形 / 异形屏：模型 → UV → 观察点投影 → 切片 → 锁帧
- 14 家产品对照（Kommander、Kompass、HiRender、GrandShow、hecoos、disguise、WATCHOUT 等）
- 公开专利与开源项目分级
- 文末自研参考架构（Director / Display / Backup + 硬件同步）

双击该 HTML 即可本地打开，不依赖外网字体或构建工具。

## 证据分级

页面里的结论按公开资料可信度标注：

- **A** 官方手册可复核
- **B** 规格 / BOM 可推断
- **C** 营销宣称，协议未公开

## 下一步

按调研页「自研建议」实现 LEDPlayControl：默认 NTP/内部时码，超分辨拼接叠加 NVIDIA Sync；异形/球形走 3D + UV，矩形/折面走 2D 切片。
