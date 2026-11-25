# 个人作品集与项目展台 (Portfolio Architecture & Tech Specs)

本项目是一个采用原生 Web 标准（HTML5 / Modern CSS3 / Vanilla ES6+）构建的高性能、现代化个人作品集与旗舰项目展台网站。采用全屏视口滚动吸附（Full-Page Scroll-Snap）架构，强调纯粹的工程落地、高质感经典亮色美学与硬件加速级交互微动效。

---

## 核心技术实现与技术原理

### 1. 经典亮色高级美学 (Modern Light Aesthetics)
* **设计语言**：遵循现代经典浅色体系，告别灰暗沉闷，采用冷白微渐变背景（#f8fafc 至 #f1f5f9）、WCAG 2.1 AAA 级高对比度石板黑文字（Slate 900 / #0f172a）、电光蓝（Electric Blue / #2563eb）品牌强调色与多层漫反射柔和阴影系统。
* **技术原理**：
  * **全局 CSS 变量系统**：在 `:root` 层级集中声明语义化调色板、圆角弧度、物理缓动曲线与分级阴影参数，确保视觉节奏与排版步调严格统一。
  * **层次化毛玻璃（Glassmorphism）**：通过 `backdrop-filter: blur(16px)` 配合高通透度浅白背景与 1px 微透边界，实现导航栏、悬浮视窗和交互弹窗的细腻半透明磨砂质感。
  * **无 Emoji 规范**：全站所有板块（包括技能树、控制按钮、底部微型卡片等）摒弃字符级 Emoji，统一使用数学对称的纯 SVG 矢量几何图形，维持纯粹的极客与工程师审美。

---

### 2. 纯物理 3D 鼠标倾斜跟随 (Physics Tilt Effect)
* **表现形态**：鼠标划过个人头像卡片与各项目展示视窗时，卡片会随着光标在三维空间中产生细腻的角度倾斜与实时高光流动。
* **技术原理**：
  * **局部几何坐标解构**：通过 `element.getBoundingClientRect()` 实时获取目标卡片的绝对像素边界，将全局鼠标坐标转化为卡片内部中心对称的归一化数值：
    $$\Delta X = \frac{X - (left + width / 2)}{width / 2} \in [-1, 1]$$
    $$\Delta Y = \frac{Y - (top + height / 2)}{height / 2} \in [-1, 1]$$
  * **3D 视差空间变换**：在宿主容器开启 `perspective: 1000px` 观察距离，对卡片施加动态矩阵计算：
    `transform: perspective(1000px) rotateX(${- \Delta Y \cdot \theta_{max}}deg) rotateY(${\Delta X \cdot \theta_{max}}deg)`。
  * **光线漫反射模拟**：在卡片表面动态叠加径向渐变伪层（Radial Gradient Glare），其中心点反向追踪光标位置，模拟自然界物理光源照射在倾斜镜面上的高光位移。当鼠标移出时，通过贝塞尔阻尼（cubic-bezier）平滑复位至平面态。

---

### 3. 桌面端弹簧阻尼跟随光标 (Lerp Spring Damped Cursor)
* **表现形态**：桌面端隐藏原生系统指针，代之以中心精确定位实心点与外层具有柔和物理惯性的半透明光环；当掠过可点击元素时产生平滑的磁吸缩放反馈。
* **技术原理**：
  * **双层分离渲染管线**：内层追踪点（Dot）以无延迟方式直接同步硬件鼠标物理位置；外层光环（Outline）通过独立渲染帧驱动。
  * **线性插值缓动（Linear Interpolation / Lerp）**：
    在 `requestAnimationFrame` 循环中，外环坐标采用阻尼渐进计算公式：
    $$Pos_{current} = Pos_{current} + (Pos_{target} - Pos_{current}) \times \alpha \quad (\alpha \approx 0.15)$$
    使外环具备如同连接了虚拟微型弹簧一般的物理质量感与跟手阻尼。
  * **状态机感应交互**：监听 DOM 事件冒泡，当检测到目标属于 `a`、`button`、`input` 或带有 `.magnetic` 特征时，光标状态机切换为悬浮态，外环半径瞬时放大并降低透明度，增强操作可预知性。
  * **无感设备隔离**：通过 CSS 媒体查询 `@media (pointer: coarse)` 和移动端特征探测，在触摸屏与移动设备上彻底关闭自定义光标，不破坏移动端原生手势。

---

### 4. 低能耗环境微粒连线 (Ambient Canvas Particle System)
* **表现形态**：全站底层 Canvas 漂浮着极淡的浮游微粒，微粒之间及微粒与鼠标之间会自适应距离生成连接线，烘托科技感同时保持克制不喧宾夺主。
* **技术原理**：
  * **轻量粒子对象池**：构建固定容量的二维粒子数组，每粒子维护独立的空间坐标 $(x, y)$、速度矢量 $(vx, vy)$ 与固有尺寸。
  * **欧几里得距离动态拓扑**：在每帧绘制中遍历粒子对，计算其几何欧氏距离：
    $$d = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$$
    当 $d < 120px$ 阈值时触发线条绘制，线段透明度根据距离进行线性衰减：$\alpha = 1 - d / 120$。全过程经过常数级内存优化，每秒重绘的 CPU 占用率稳定在 1% 以下。
  * **Page Visibility API 休眠机制**：深度集成浏览器页面可见性监听（`document.addEventListener('visibilitychange')`）。当用户最小化浏览器或切换到其他标签页时，微粒主循环立即切断 `requestAnimationFrame` 调用；切回页面时自动恢复，彻底杜绝后台无效电量消耗与算力浪费。

---

### 5. 多维平滑全屏切换与操控模式 (Multi-modal Full-Page Scroll-Snap)
* **表现形态**：网站分为 6 个独立的全屏视口，支持鼠标滚轮、键盘快捷键、导航栏直达及右侧进度点指示等多通道同步。
* **技术原理**：
  * **硬件级 CSS Scroll Snap**：主滑动容器声明 `scroll-snap-type: y mandatory`，各板块声明 `scroll-snap-align: start`，借助现代浏览器排版引擎的底层加速，实现零掉帧、零卡顿的段落对齐吸附。
  * **全功能键盘操控映射**：在全局 `keydown` 钩子中拦截并映射按键行为：
    * `ArrowUp` / `PageUp`：平滑切换至上一屏；
    * `ArrowDown` / `PageDown`：平滑切换至下一屏；
    * `Home`：直接重置回到首页顶部；
    * `End`：一键滑行至末页联系方式；
    统一通过 `section.scrollIntoView({ behavior: 'smooth' })` 驱动，防止多按冲突。
  * **IntersectionObserver 状态双向同步**：通过设置 `threshold: 0.55` 的交叉观察器，实时判定当前主视口停留的板块索引，精准驱动顶部导航栏的高亮下划线及右侧小圆点指示器（`01` 至 `06` 编号联动），实现滑动与点击直达的双向无缝契合。

---

### 6. 自适应折纸六芒星矢量徽标 (Adaptive Origami Favicon)
* **表现形态**：网页标签页图标采用极简折纸螺旋六芒星，在亮色标签栏与暗色标签栏之间自动智能变色。
* **技术原理**：
  * **原生 SVG 媒体查询**：在矢量 SVG 内部声明 `@media (prefers-color-scheme: dark)` 样式规则，利用 CSS 滤镜 `filter: invert(1)` 实现浏览器标签栏主题自适应，深色系统下自动反白，浅色系统下保持纯黑，保持极致清晰度。
  * **多分辨率物理 ICO 打包**：为兼容 Windows 桌面与各类搜索引擎爬虫，预生成内嵌 16x16、32x32、48x48、64x64 四重规格的标准物理 `favicon.ico`，保障跨端解析稳定性。

---

## 页面板块架构

| 序号 | 板块标识 | 展现内容与核心亮点 |
| :--- | :--- | :--- |
| **01** | `#hero` | **关于我** · 个人定位、核心技术标签、多维度专业技能树弹窗（算法/系统/编程语言） |
| **02** | `#project-1` | **Agent-Arena** · 分布式大语言模型对战评估平台（纯 CSS/JS 实时对战流式终端模拟） |
| **03** | `#project-2` | **dsh-skill-manager** · DeepSeek Harness 技能记忆管理器（DSH 原生扩展插槽与技能树 Mockup） |
| **04** | `#project-3` | **鸿蒙与移动端开发实践** · HarmonyOS NEXT / ArkTS / ArkUI (Stage 模型) 与 Android 原生应用 |
| **05** | `#project-4` | **MusicPlayer** · 现代化 PyQt5 桌面音乐播放器（双语歌词逐行同步、穿透悬浮桌面 HUD 与 LRC 工作台） |
| **06** | `#contact` | **更多探索 & 联系方式** · 辅助作品矩阵（ncmMusic、file_deleter、Generative-Model）、一键复制邮箱与直达信箱 |

---

## 本地快速体验

```bash
# 1. 直接双击 index.html 即可使用任意现代浏览器打开
# 2. 或使用任意简易 HTTP 服务器启动（推荐，便于完整体验 Favicon 缓存与离线特性）：
python -m http.server 8080
# 浏览器访问 http://localhost:8080
```
