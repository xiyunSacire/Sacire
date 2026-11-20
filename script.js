/**
 * 经典亮色个人作品集交互控制系统
 * 包括：全屏滚动分段同步、3D倾斜透视动效、平滑跟随光标、背景微粒画布、弹窗与剪贴板交互
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollSnapSync();
  initSidePagination();
  initKeyboardNav();
  initTiltCards();
  initCustomCursor();
  initAmbientCanvas();
  initModals();
  initEmailCopy();
  initAgentArenaTerminal();
});

/* ==========================================================================
   1. 滚动分段同步与指示器更新 (Scroll Snap Sync & Indicators)
   ========================================================================== */
function initScrollSnapSync() {
  const container = document.getElementById('snapContainer');
  const sections = document.querySelectorAll('.snap-section');
  const navItems = document.querySelectorAll('.nav-links .nav-item');
  const sideDots = document.querySelectorAll('.side-dot');
  const currentNumEl = document.getElementById('currentSectionNum');
  const progressBar = document.getElementById('progressBar');

  if (!container || sections.length === 0) return;

  // 监听容器滚动，计算顶部进度条
  container.addEventListener('scroll', () => {
    const scrollTop = container.scrollTop;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll > 0 && progressBar) {
      const progressPercent = (scrollTop / maxScroll) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }
  }, { passive: true });

  // 采用 IntersectionObserver 监测当前主视口所在的分区
  const observerOptions = {
    root: container,
    threshold: 0.55 // 超过55%进入视口则视为当前激活页
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
        updateActiveStates(index);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  function updateActiveStates(activeIndex) {
    // 1. 同步顶部导航
    navItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === activeIndex);
    });

    // 2. 同步右侧页码小圆点
    sideDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });

    // 3. 更新数字指示器 (01, 02, etc.)
    if (currentNumEl) {
      currentNumEl.textContent = String(activeIndex + 1).padStart(2, '0');
    }
  }
}

/* ==========================================================================
   2. 侧边导航与回到顶部平滑跳转 (Side Pagination & Smooth Jump)
   ========================================================================== */
function initSidePagination() {
  const container = document.getElementById('snapContainer');
  const sections = document.querySelectorAll('.snap-section');
  const sideDots = document.querySelectorAll('.side-dot');
  const navItems = document.querySelectorAll('.nav-links .nav-item');
  const backToTopBtn = document.getElementById('backToTopBtn');

  function scrollToSection(index) {
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  }

  // 侧边圆点点击
  sideDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIndex = parseInt(dot.getAttribute('data-target') || '0', 10);
      scrollToSection(targetIndex);
    });
  });

  // 顶部导航链接点击
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(item.getAttribute('data-index') || '0', 10);
      scrollToSection(targetIndex);
    });
  });

  // 页面内平滑滚动链接
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 回到顶部
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      scrollToSection(0);
    });
  }
}

/* ==========================================================================
   3. 键盘上下方向键切页 (Keyboard Navigation)
   ========================================================================== */
function initKeyboardNav() {
  const container = document.getElementById('snapContainer');
  const sections = document.querySelectorAll('.snap-section');

  window.addEventListener('keydown', (e) => {
    // 若当前在弹窗或正在输入则不响应快捷切页
    if (document.body.classList.contains('modal-open')) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      navigateDelta(1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      navigateDelta(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (sections[0]) sections[0].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      if (sections[sections.length - 1]) sections[sections.length - 1].scrollIntoView({ behavior: 'smooth' });
    }
  });

  function navigateDelta(delta) {
    let currentIdx = 0;
    const currentNumEl = document.getElementById('currentSectionNum');
    if (currentNumEl) {
      currentIdx = parseInt(currentNumEl.textContent, 10) - 1;
    }
    const nextIdx = Math.max(0, Math.min(sections.length - 1, currentIdx + delta));
    if (sections[nextIdx]) {
      sections[nextIdx].scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/* ==========================================================================
   4. 3D 悬浮透视倾斜 (Interactive Card Tilt Effect)
   ========================================================================== */
function initTiltCards() {
  const tiltElements = document.querySelectorAll('.tilt-element');

  tiltElements.forEach(el => {
    const maxTilt = parseFloat(el.getAttribute('data-tilt-max') || '10');

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      el.style.transition = 'transform 0.5s ease-out';
    });

    el.addEventListener('mouseenter', () => {
      el.style.transition = 'none';
    });
  });
}

/* ==========================================================================
   5. 桌面端跟随灵动光标 (Custom Lerp Cursor)
   ========================================================================== */
function initCustomCursor() {
  // 触控设备或低分辨率跳过
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');
  if (!dot || !outline) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      dot.style.opacity = '1';
      outline.style.opacity = '1';
      isVisible = true;
    }

    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // 线性插值使得外部光环具备弹性柔和跟随手感
  function animateCursor() {
    outlineX += (mouseX - outlineX) * 0.16;
    outlineY += (mouseY - outlineY) * 0.16;
    outline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  // 鼠标悬停在按钮、链接或卡片时产生扩大磁性反馈
  const interactiveTargets = 'a, button, .tilt-element, .skill-pill, .pill, .mini-card, input, textarea';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveTargets)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveTargets)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  window.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    outline.style.opacity = '0';
    isVisible = false;
  });
}

/* ==========================================================================
   6. 经典亮色背景动态柔光微粒画布 (Ambient Canvas Particle System)
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // 生成少量轻量微粒，以确保极其流畅省电
  const particleCount = Math.min(30, Math.floor(window.innerWidth / 45));
  const particles = [];

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 2 + 1.2;
      this.color = Math.random() > 0.5 ? 'rgba(59, 130, 246, 0.25)' : 'rgba(139, 92, 246, 0.22)';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let animationFrameId;
  function render() {
    ctx.clearRect(0, 0, width, height);

    // 绘制微粒与微弱连线
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();
      p1.draw();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.15 * (1 - dist / 110)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  render();

  // 页面离开时暂停动画节省性能
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      render();
    }
  });
}

/* ==========================================================================
   7. 项目复盘/详情弹窗管理 (Project Detail Modals)
   ========================================================================== */
function initModals() {
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalContent = document.getElementById('modalContent');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const openButtons = document.querySelectorAll('.open-modal-btn');

  // 项目详情预设数据 (您也可以随时补充修改)
  const modalData = {
    'modal-p1': {
      badge: 'Architecture & Design',
      title: 'Agent-Arena · 分布式大模型评测平台技术复盘',
      tagline: 'C/S 架构 · WebSocket 实时通信 · LLM-as-a-Judge 自动评分',
      html: `
        <div style="font-size: 0.92rem; color: #475569; line-height: 1.7;">
          <h4 style="color: #0f172a; margin-bottom: 8px; font-size: 1.05rem; font-weight: 700;">系统核心架构设计</h4>
          <p style="margin-bottom: 14px;">针对大模型离线评测流程冗长、自定义业务任务难以实时横向对比的痛点，Agent-Arena 采用轻量化分布式架构实现端到端对战评测：</p>
          <ul style="padding-left: 20px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px;">
            <li><strong>双端解耦 C/S 架构：</strong>Arena Server 负责并发任务下发、状态持久化与裁判调度；Student Client 专注承接任务并执行自定义本地推理。</li>
            <li><strong>高可用 WebSocket 通信：</strong>支持心跳保活、断线智能重试与高并发任务广播，确保分布式环境下长连接稳定。</li>
            <li><strong>LLM-as-a-Judge 智能裁决：</strong>集成大模型评判引擎（如 DeepSeek 等），支持多维度评分指标，自动化为多模型答案生成结构化打分与反馈。</li>
            <li><strong>极简无侵入式接入：</strong>客户端基于装饰器模式 <code>@client.on_task</code>，两行代码即可将本地 Ollama、vLLM 或微调模型接入竞技场。</li>
          </ul>
          <div style="background: rgba(248, 250, 252, 0.85); padding: 14px 18px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 0.86rem;">
            <strong>工程总结：</strong>通过分布式设计规避了在单台机器上同时加载多个大模型导致的显存争抢问题，各客户端可独立运行于不同 GPU 算力节点，极大降低了本地化对比评测门槛。
          </div>
        </div>
      `
    },
    'modal-p2': {
      title: 'dsh-skill-manager · DeepSeek Harness 技能记忆管理器',
      tagline: 'Host/Client 双端隔离架构 · 真实物理技能存储映射 · Agent 自给自足闭环',
      html: `
        <div style="font-size: 0.95rem; color: #475569; line-height: 1.7;">
          <h4 style="color: #0f172a; margin-bottom: 8px; font-size: 1.15rem; font-weight: 700;">核心架构设计与工程亮点</h4>
          <p style="margin-bottom: 14px;">针对大模型智能体技能持久化与生命周期管理的端到端技术实现：</p>
          <ul style="padding-left: 20px; margin-bottom: 18px; display: flex; flex-direction: column; gap: 8px;">
            <li><strong>Host/Client 双端隔离通信：</strong>Host 端基于 Node ESM / esbuild 运行于宿主进程，注册 <code>SkillManagerService</code> 负责安全文件 I/O 与 Markdown Frontmatter 解析；Client 端基于 React 18 与 TypeScript，通过 Typert Remote RPC 协议跨进程安全交互。</li>
            <li><strong>原生深度扩展点挂载：</strong>无缝挂载于 DeepSeek Harness 原生插槽 <code>sidebar.footer.action</code>，深度复用官方设计系统令牌（<code>--dsw-alias-*</code>），实现零割裂感的原生 Web / Desktop 视觉一致性。</li>
            <li><strong>真实物理目录映射与安全防护：</strong>直接映射宿主机 <code>~/.dsh/skills</code> 物理存储，拒绝黑盒化存储；内置受保护技能（bundled skills）拦截防线，防止核心依赖被意外篡改或删除。</li>
            <li><strong>Agent 自给自足自生长闭环：</strong>配套集成 <code>dsh-skill-management</code> 伴生技能，让 LLM 具备自主探索、封装、验证并写入新能力的能力闭环。</li>
          </ul>
          <div style="background: rgba(248, 250, 252, 0.9); padding: 14px 18px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 0.86rem; color: #334155;">
            <strong>工程总结：</strong>打破了传统智能体生态中技能记忆“黑盒运行、不可审计、难迁移”的痛点，通过将抽象技能显式具象化为物理 Markdown 文件，让开发者完全掌控大模型的能力库。
          </div>
        </div>
      `
    },
    'modal-p3': {
      title: '鸿蒙原生与移动端开发实践 · HarmonyOS & Android Native',
      tagline: 'ArkTS / ArkUI Stage 模型 · 系统级能力接入 · 本地优先通信架构',
      html: `
        <div style="font-size: 0.95rem; color: #475569; line-height: 1.7;">
          <h4 style="color: #0f172a; margin-bottom: 8px; font-size: 1.15rem; font-weight: 700;">移动端原生开发技术路径与工程实践</h4>
          <p style="margin-bottom: 14px;">立足华为鸿蒙 NEXT 原生生态与 Android 系统体系的移动端工程落地总结：</p>
          <ul style="padding-left: 20px; margin-bottom: 18px; display: flex; flex-direction: column; gap: 8px;">
            <li><strong>ArkTS 与声明式 ArkUI (Stage 模型)：</strong>遵循 HarmonyOS NEXT 官方标准 Stage 模型，严密管理 UIAbility 生命周期；使用 Navigation 声明式路由导航架构解耦页面栈，封装统一的标题栏、页面转场与跨组件数据流转。</li>
            <li><strong>原生系统能力与硬件图形调度：</strong>熟练集成系统级原生 Kit，包括使用 <code>@ohos.net.http</code> 构建异步并发网络请求管道、使用 <code>@ohos.data.preferences</code> 管理用户配置与轻量持久化、使用 <code>@ohos.file.picker</code> 处理安全媒体选取，并运用 Canvas 组件实现端侧高帧率数据图表渲染。</li>
            <li><strong>Android 与类安卓系统工程沉淀：</strong>掌握 Android 核心四大组件生命周期、Kotlin / Java 现代并发编程，以及针对平板与各类移动终端的响应式断点栅格布局。</li>
            <li><strong>弱网与离线局域网自治架构：</strong>针对工业巡检、边缘监测等无互联网连接的特定封闭网络场景，设计 Local-First 的端侧通信与数据容灾策略，确保在网络抖动或断网状态下依然保持本地极速响应与可靠交互。</li>
          </ul>
          <div style="background: rgba(248, 250, 252, 0.9); padding: 14px 18px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 0.86rem; color: #334155;">
            <strong>工程总结：</strong>移动端开发不仅在于画面的精致度，更在于对系统生命周期、资源占用以及网络波动的精准把控。通过深入掌握鸿蒙 ArkTS 与 Android 底层机制，能够独立完成从原型设计到原生客户端工程落地的全流程交付。
          </div>
        </div>
      `
    },
    // ==========================================================================
    // 【请在此修改：完整技能树弹窗内容】(可自由修改算法、系统、编程技能文字与标签)
    // ==========================================================================
    'modal-skills': {
      badge: 'Skills & Competencies',
      title: 'Sacire · 核心专业技能全景',
      tagline: '计算机与全栈工程 · 算法研究 · 国产异构算力生态',
      html: `
        <div style="display: flex; flex-direction: column; gap: 16px; font-size: 0.91rem; color: #475569; line-height: 1.65;">
          <!-- 算法技能 -->
          <div style="background: rgba(248, 250, 252, 0.85); border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
              <strong style="color: #0f172a; font-size: 1rem;">算法技能 (AI & Algorithms)</strong>
            </div>
            <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.88rem;">
              <li><strong>深度学习模型构建与训练：</strong>熟练使用 PyTorch 进行神经网络架构设计、训练调优与加速。</li>
              <li><strong>大模型本地部署与微调：</strong>熟练应用 vLLM 推理引擎、Ollama 本地量化部署、Transformers 框架及 LoRA 参数高效微调。</li>
              <li><strong>Agent 智能体工作流设计：</strong>熟练掌握智能体规划、工具调用路由（Tool-use）与多步骤任务编排。</li>
              <li><strong>AI 图像生成技术：</strong>深入理解 GAN 到 Stable Diffusion 扩散模型范式与微调控制。</li>
              <li><strong>计算机视觉与图像处理：</strong>熟练运用 OpenCV 特征提取与滤波，熟练部署 YOLO 目标检测模型。</li>
            </ul>
          </div>

          <!-- 系统技能 -->
          <div style="background: rgba(248, 250, 252, 0.85); border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; display: inline-block;"></span>
              <strong style="color: #0f172a; font-size: 1rem;">系统与异构计算技能 (Systems & Heterogeneous)</strong>
            </div>
            <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.88rem;">
              <li><strong>国产化算力生态：</strong>熟悉海光 DCU 硬件架构与 DTK 异构计算生态适配、算子编译与调优。</li>
              <li><strong>容器化与运维发布：</strong>熟练掌握 Docker 容器化打包、多阶段镜像构建与资源隔离管理。</li>
              <li><strong>Linux 与工程化规范：</strong>深入掌握 Linux 开发与运维，严谨遵循 Git 协作与版本治理。</li>
              <li><strong>网络安全与攻防体系：</strong>了解网络安全攻防与 Web/主机渗透测试全流程及安全加固规范。</li>
            </ul>
          </div>

          <!-- 编程技能 -->
          <div style="background: rgba(248, 250, 252, 0.85); border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6; display: inline-block;"></span>
              <strong style="color: #0f172a; font-size: 1rem;">编程技能与工程工具 (Languages & Tech Stack)</strong>
            </div>
            <div style="margin-bottom: 10px;">
              <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; margin-bottom: 6px;">熟练应用：</div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <span class="pill pill-primary">Python</span>
                <span class="pill pill-primary">C / C++</span>
                <span class="pill pill-primary">CUDA</span>
                <span class="pill pill-primary">SQL</span>
                <span class="pill pill-primary">HTML5 前端</span>
                <span class="pill pill-primary">LaTeX</span>
              </div>
            </div>
            <div>
              <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; margin-bottom: 6px;">基础了解：</div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <span class="pill">C#</span>
                <span class="pill">Java</span>
              </div>
            </div>
          </div>
        </div>
      `
    }
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalKey = btn.getAttribute('data-modal');
      const data = modalData[modalKey];
      if (data && modalContent) {
        modalContent.innerHTML = `
          <div style="margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
            <span style="font-family: 'Space Grotesk', monospace; font-size: 0.75rem; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.08em;">${data.badge || 'Case Study'}</span>
            <h3 style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 4px 0 2px 0;">${data.title}</h3>
            <p style="font-size: 0.86rem; color: #94a3b8; margin: 0;">${data.tagline}</p>
          </div>
          ${data.html}
        `;
        modalBackdrop.classList.add('open');
        document.body.classList.add('modal-open');
      }
    });
  });

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   8. 邮箱一键复制与轻提示 (Email Copy with Toast)
   ========================================================================== */
function initEmailCopy() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('toastMessage');

  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const emailEl = document.querySelector('.email-address');
    const textToCopy = emailEl ? emailEl.textContent.trim() : 'your.email@example.com';

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('已成功复制邮箱到剪贴板！');
    }).catch(() => {
      // 兼容非安全上下文备选复制
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('已复制邮箱到剪贴板！');
    });
  });

  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }
}

/* ==========================================================================
   9. Agent-Arena 极客对战终端日志流模拟器 (Live Arena Terminal Stream)
   ========================================================================== */
function initAgentArenaTerminal() {
  const logsContainer = document.getElementById('terminalLogs');
  if (!logsContainer) return;

  // 模拟对战评测任务轮播序列
  const battleRounds = [
    [
      { tag: 'SERVER', tagClass: 'tag-system', text: 'FastAPI Arena Server initialized on 0.0.0.0:8000' },
      { tag: 'WS-HUB', tagClass: 'tag-cyan', text: 'Node-A [vLLM / Qwen-2.5-7B] handshake connected' },
      { tag: 'WS-HUB', tagClass: 'tag-cyan', text: 'Node-B [Ollama / Llama-3.1-8B] handshake connected' },
      { tag: 'DISPATCH', tagClass: 'tag-amber', text: 'Broadcast Task #1042: "实现带边界保护的高性能并行算子"' },
      { tag: 'RECEIVE', tagClass: 'tag-blue', text: 'Node-A submitted answer (Time: 280ms, 482 tokens)' },
      { tag: 'RECEIVE', tagClass: 'tag-blue', text: 'Node-B submitted answer (Time: 395ms, 415 tokens)' },
      { tag: 'JUDGE', tagClass: 'tag-violet', text: 'LLMEvaluator (DeepSeek) analyzing logic & complexity...' },
      { tag: 'RESULT', tagClass: 'tag-emerald', text: 'Score: Node-A 9.5/10 | Node-B 8.9/10 -> Winner: Node-A' }
    ],
    [
      { tag: 'SERVER', tagClass: 'tag-system', text: 'Task Queue active: Preparing Pairwise Benchmark round...' },
      { tag: 'WS-HUB', tagClass: 'tag-cyan', text: 'Heartbeat ping: 2 active WebSocket connections healthy' },
      { tag: 'DISPATCH', tagClass: 'tag-amber', text: 'Broadcast Task #1043: "分布式系统网络分区下的 CRDT 冲突消解"' },
      { tag: 'RECEIVE', tagClass: 'tag-blue', text: 'Node-B submitted answer (Time: 310ms, 512 tokens)' },
      { tag: 'RECEIVE', tagClass: 'tag-blue', text: 'Node-A submitted answer (Time: 345ms, 490 tokens)' },
      { tag: 'JUDGE', tagClass: 'tag-violet', text: 'LLMEvaluator (DeepSeek) computing semantic evaluation...' },
      { tag: 'RESULT', tagClass: 'tag-emerald', text: 'Score: Node-A 9.3/10 | Node-B 9.4/10 -> Winner: Node-B' }
    ]
  ];

  let roundIndex = 0;
  let stepIndex = 0;
  const maxDisplayLines = 7;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function getCurrentTimeString() {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function printNextLog() {
    const currentRound = battleRounds[roundIndex];

    if (stepIndex >= currentRound.length) {
      // 这一轮对战结束，准备开始下一轮
      const divider = document.createElement('div');
      divider.className = 'terminal-divider';
      logsContainer.appendChild(divider);

      stepIndex = 0;
      roundIndex = (roundIndex + 1) % battleRounds.length;

      // 3秒后开启新一轮对战，并清理旧日志
      setTimeout(() => {
        while (logsContainer.children.length > 2) {
          logsContainer.removeChild(logsContainer.firstChild);
        }
        printNextLog();
      }, 3000);
      return;
    }

    const logItem = currentRound[stepIndex];
    const lineEl = document.createElement('div');
    lineEl.className = 'terminal-line';
    lineEl.innerHTML = `
      <span class="term-time">${getCurrentTimeString()}</span>
      <span class="term-tag ${logItem.tagClass}">${logItem.tag}</span>
      <span class="term-text">${logItem.text}</span>
    `;

    // 移除之前的光标并追加到最新一行
    const oldCursor = logsContainer.querySelector('.term-cursor');
    if (oldCursor) oldCursor.remove();

    const cursor = document.createElement('span');
    cursor.className = 'term-cursor';
    lineEl.appendChild(cursor);

    logsContainer.appendChild(lineEl);

    // 限制最大显示行数，平滑顶出旧行
    if (logsContainer.children.length > maxDisplayLines + 2) {
      logsContainer.removeChild(logsContainer.firstChild);
    }

    stepIndex++;

    // 随机微延迟模拟真实网络下发与推理过程
    const delay = stepIndex === currentRound.length ? 2200 : Math.floor(Math.random() * 500 + 1100);
    setTimeout(printNextLog, delay);
  }

  // 页面加载 800ms 后自动开启首个实时对战日志流
  setTimeout(printNextLog, 800);
}
