(function () {
  const S = window.SURVEY;
  if (!S) return;

  const heatLabel = { yes: "确认", partial: "部分", unknown: "未检索到", no: "不是这条路" };

  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "dataset") Object.entries(v).forEach(([dk, dv]) => { n.dataset[dk] = dv; });
      else n.setAttribute(k, v);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }

  function renderLayers() {
    const root = document.getElementById("layer-list");
    S.layers.forEach((layer, i) => {
      const btn = el("button", { class: "layer", type: "button", "data-layer": layer.id, "aria-pressed": "false" });
      btn.innerHTML =
        `<div class="layer-idx">${layer.index}</div>
         <div class="layer-body">
           <div class="en">${layer.en}</div>
           <h3>${layer.name} · ${layer.question}</h3>
           <div class="layer-meta"><div>典型手段 <span>${layer.typical}</span></div><div>精度 <span>${layer.precision}</span></div></div>
           <p>${layer.body}</p>
         </div>`;
      btn.addEventListener("click", () => toggleLayer(layer.id, btn));
      root.appendChild(btn);
    });
  }

  let activeLayer = null;
  function toggleLayer(id, btn) {
    const same = activeLayer === id && btn.classList.contains("active");
    document.querySelectorAll(".layer").forEach((n) => {
      n.classList.remove("active");
      n.setAttribute("aria-pressed", "false");
    });
    if (same) {
      activeLayer = null;
    } else {
      activeLayer = id;
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    }
    if (typeof syncLabSet === "function") syncLabSet(id, activeLayer === id);
    applyFilters();
  }

  function renderSteps() {
    const root = document.getElementById("map-steps");
    S.mappingSteps.forEach((s, i) => {
      root.appendChild(el("article", { class: "step" },
        `<div class="n">STEP ${i + 1}</div><h3>${s.name}</h3><p>${s.body}</p>`));
    });
  }

  const state = { region: "all", depth: "all" };
  let activeHop = null;
  let activeTear = null;
  let activeScene = null;
  let activeGeom = null;
  let activeCmd = null;

  function vendorById(id) {
    return S.vendors.find((v) => v.id === id);
  }

  function vendorLabel(id) {
    const v = vendorById(id);
    return v ? v.name : id;
  }

  function highlightIds() {
    if (activeHop) {
      const hop = S.chainHops.find((h) => h.id === activeHop);
      return hop ? hop.vendors : [];
    }
    if (activeTear) {
      const tear = S.tears.find((t) => t.id === activeTear);
      return tear ? tear.vendors : [];
    }
    if (activeScene) {
      const scene = S.scenes.find((s) => s.id === activeScene);
      return scene ? scene.vendors : [];
    }
    if (activeGeom) {
      const mode = (S.geomModes || []).find((g) => g.id === activeGeom);
      if (!mode || !mode.vendors.length) return null;
      return mode.vendors;
    }
    if (activeCmd) {
      const mode = (S.commandModes || []).find((c) => c.id === activeCmd);
      return mode ? mode.vendors : [];
    }
    return null;
  }

  function clearHighlightSources(keep) {
    if (keep !== "hop") activeHop = null;
    if (keep !== "tear") activeTear = null;
    if (keep !== "scene") activeScene = null;
    if (keep !== "geom") activeGeom = null;
    if (keep !== "cmd") activeCmd = null;
    document.querySelectorAll(".hop").forEach((n) => {
      n.classList.remove("active");
      n.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll(".tear").forEach((n) => {
      n.classList.remove("active");
      n.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll(".scene").forEach((n) => {
      n.classList.remove("active");
      n.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll(".geom-mode").forEach((n) => {
      n.classList.remove("active");
      n.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll(".cmd").forEach((n) => {
      n.classList.remove("active");
      n.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll("[id^='svg-hop-']").forEach((n) => n.classList.remove("on"));
  }

  function scrollToCard(id) {
    const card = document.getElementById("card-" + id);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderHops() {
    const root = document.getElementById("hop-list");
    const detail = document.getElementById("hop-detail");
    if (!root || !S.chainHops) return;
    S.chainHops.forEach((hop, i) => {
      const btn = el("button", { class: "hop", type: "button", "data-hop": hop.id, "aria-pressed": "false" });
      btn.innerHTML =
        `<div class="n">HOP ${i + 1}</div><h3>${hop.name}</h3>` +
        `<div class="en">${hop.en}</div><p>${hop.fail}</p>`;
      btn.addEventListener("click", () => {
        const same = activeHop === hop.id;
        clearHighlightSources("hop");
        if (same) {
          activeHop = null;
          if (detail) detail.innerHTML = "<p>点上面一跳。垂直整合解决配屏文件，不替代 Quadro 菊花链；Mosaic 拼桌面时 EDID/刷新不一致，同步组直接失败。</p>";
        } else {
          activeHop = hop.id;
          btn.classList.add("active");
          btn.setAttribute("aria-pressed", "true");
          const svg = document.getElementById("svg-hop-" + hop.id);
          if (svg) svg.classList.add("on");
          if (detail) {
            detail.innerHTML =
              `<div class="en">${hop.en}</div><h3>${hop.name}</h3>` +
              `<p>${hop.body}</p>` +
              `<p class="fail">${hop.fail}</p>` +
              `<p class="who">这一跳对照：${hop.vendors.map(vendorLabel).join(" · ")}</p>`;
          }
        }
        applyFilters();
      });
      root.appendChild(btn);
    });
    S.chainHops.forEach((hop) => {
      const svg = document.getElementById("svg-hop-" + hop.id);
      if (!svg) return;
      svg.style.cursor = "pointer";
      svg.addEventListener("click", () => {
        root.querySelector(`[data-hop="${hop.id}"]`)?.click();
      });
    });
  }

  function renderTears() {
    const root = document.getElementById("tear-list");
    if (!root || !S.tears) return;
    S.tears.forEach((tear) => {
      const btn = el("button", { class: "tear", type: "button", "data-tear": tear.id, "aria-pressed": "false" });
      btn.innerHTML =
        `<div class="tear-head"><span class="grade">证据 ${tear.grade}</span><h3>${tear.name}</h3></div>` +
        `<p class="symptom">${tear.symptom}</p><p>${tear.body}</p>` +
        `<div class="who">${tear.vendors.map(vendorLabel).join(" · ")}</div>`;
      btn.addEventListener("click", () => {
        const same = activeTear === tear.id;
        clearHighlightSources("tear");
        if (same) {
          activeTear = null;
        } else {
          activeTear = tear.id;
          btn.classList.add("active");
          btn.setAttribute("aria-pressed", "true");
        }
        applyFilters();
      });
      root.appendChild(btn);
    });
  }

  function renderCommands() {
    const root = document.getElementById("cmd-list");
    if (root && S.commandModes) {
      S.commandModes.forEach((mode) => {
        const btn = el("button", { class: "cmd", type: "button", "data-cmd": mode.id, "aria-pressed": "false" });
        btn.innerHTML =
          `<div class="n">${mode.index}</div><h3>${mode.name}</h3>` +
          `<div class="en">${mode.en}</div><p>${mode.body}</p>` +
          `<div class="who">${mode.vendors.map(vendorLabel).join(" · ")}</div>`;
        btn.addEventListener("click", () => {
          const same = activeCmd === mode.id;
          clearHighlightSources("cmd");
          if (same) {
            activeCmd = null;
          } else {
            activeCmd = mode.id;
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
          }
          applyFilters();
        });
        root.appendChild(btn);
      });
    }

    renderDecode();

    const table = document.getElementById("command-table");
    if (!table || !S.commandRows || !S.commandKeys) return;
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";
    const trh = document.createElement("tr");
    trh.appendChild(el("th", null, "产品"));
    S.commandKeys.forEach((k) => trh.appendChild(el("th", null, k.label)));
    trh.appendChild(el("th", null, "证据"));
    thead.appendChild(trh);
    S.commandRows.forEach((row) => {
      const v = vendorById(row.id);
      const tr = document.createElement("tr");
      tr.dataset.id = row.id;
      tr.dataset.modes = (row.modes || []).join(",");
      if (v) {
        tr.dataset.region = v.region;
        tr.dataset.depth = v.depth;
        tr.dataset.layers = (v.layers || []).join(",");
      }
      const name = document.createElement("td");
      name.innerHTML = `<strong>${vendorLabel(row.id)}</strong>`;
      tr.appendChild(name);
      S.commandKeys.forEach((k) => {
        tr.appendChild(el("td", { class: "cell-text" }, row[k.id] || "未检索到"));
      });
      tr.appendChild(el("td", null, row.evidence || "—"));
      bindRowClick(tr, row.id);
      tbody.appendChild(tr);
    });
  }

  function renderDecode() {
    const root = document.getElementById("cmd-decode");
    const D = S.commandDecode;
    if (!root || !D) return;
    const items = (list) => list.map((x) =>
      `<article class="ltc-item"><h4>${x.t}</h4><p>${x.d}</p></article>`).join("");
    const steps = (list) => list.map((s, i) =>
      `<li><span class="n">${i + 1}</span>${s}</li>`).join("");
    const budgetHead = D.budgetKeys.map((k) => `<th>${k.label}</th>`).join("");
    const budgetBody = D.budgets.map((row) =>
      `<tr><td>${row.who}</td><td>${row.budget}</td><td>${row.buys}</td><td>${row.grade}</td></tr>`).join("");
    root.innerHTML =
      `<h3 class="subhead">解码跟不上，帧号对了也看不见</h3>` +
      `<p class="sec-lead">${D.lead}</p>` +
      `<div class="problem-grid">` +
        D.duties.map((x) => `<div class="panel"><h3>${x.t}</h3><p>${x.d}</p></div>`).join("") +
      `</div>` +
      `<h3 class="subhead">帧号对了，扫出去的仍可能是错图</h3>` +
      `<div class="ltc-grid decode-miss">${items(D.misses)}</div>` +
      `<h3 class="subhead">长 GOP 的 Seek 实际在解什么</h3>` +
      `<p class="sec-lead">${D.gopLead}</p>` +
      `<ol class="ltc-steps">${steps(D.gopSteps)}</ol>` +
      `<p class="callout">${D.gopNote}</p>` +
      `<h3 class="subhead">三家留出的时间各买什么</h3>` +
      `<div class="table-wrap"><table class="plain-table"><thead><tr>${budgetHead}</tr></thead><tbody>${budgetBody}</tbody></table></div>` +
      `<p class="caption">2 帧是命令对齐和开始预取的预算。它不是「任意 H.265 都能在两帧内解完」。</p>` +
      `<h3 class="subhead">各机为什么会差一帧</h3>` +
      `<p class="sec-lead">${D.divergeLead}</p>` +
      `<div class="ltc-grid">${items(D.diverge)}</div>` +
      `<h3 class="subhead">什么样的素材可以当帧切</h3>` +
      `<p class="sec-lead">${D.intraLead}</p>` +
      `<div class="ltc-grid">${items(D.intra)}</div>` +
      `<p class="callout">${D.intraNote}</p>` +
      `<h3 class="subhead">一次同帧切画面</h3>` +
      `<p class="sec-lead">${D.cutLead}</p>` +
      `<div class="chain-svg"><svg viewBox="0 0 980 132" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="发令、预卷、生效帧">` +
        `<rect width="980" height="132" fill="#0d1218"/>` +
        `<g font-family="Microsoft YaHei UI, PingFang SC, Noto Sans SC, Segoe UI, sans-serif" font-size="13" fill="#e7eef5">` +
          `<rect x="20" y="28" width="200" height="72" fill="#121922" stroke="#e2a73a"/>` +
          `<text x="40" y="58">现在发令</text>` +
          `<text x="40" y="80" fill="#8c9aab" font-size="12">第 10000 帧</text>` +
          `<rect x="250" y="28" width="460" height="72" fill="#121922" stroke="#3ad7c4"/>` +
          `<text x="270" y="58">预卷：退回 IDR，解到目标</text>` +
          `<text x="270" y="80" fill="#8c9aab" font-size="12">输出仍是旧画面</text>` +
          `<rect x="740" y="28" width="220" height="72" fill="#121922" stroke="#3ad7c4"/>` +
          `<text x="760" y="58">生效帧一起换</text>` +
          `<text x="760" y="80" fill="#8c9aab" font-size="12">第 10200 帧</text>` +
          `<path d="M220 64 H250 M710 64 H740" stroke="#314557"/>` +
        `</g></svg></div>` +
      `<ol class="ltc-steps">${steps(D.cutSteps)}</ol>`;
  }

  function renderScenes() {
    const root = document.getElementById("scene-list");
    if (!root || !S.scenes) return;
    S.scenes.forEach((scene) => {
      const btn = el("button", { class: "scene", type: "button", "data-scene": scene.id, "aria-pressed": "false" });
      btn.innerHTML =
        `<h3>${scene.name}</h3><p>${scene.body}</p>` +
        `<div class="who">${scene.vendors.map(vendorLabel).join(" · ")}</div>`;
      btn.addEventListener("click", () => {
        const same = activeScene === scene.id;
        clearHighlightSources("scene");
        if (same) {
          activeScene = null;
        } else {
          activeScene = scene.id;
          btn.classList.add("active");
          btn.setAttribute("aria-pressed", "true");
        }
        applyFilters();
      });
      root.appendChild(btn);
    });
  }

  const geomFigures = {
    surface: {
      caption: "网格是灯珠的真实位置，UV 把它们摊成 0–1 的贴图，观察点再决定画面怎么扭。",
      url: "https://help.disguise.one/workflows/3d-modelling/uv-mapping/uv-maps-in-designer",
      source: "disguise：UV 如何采样",
      svg: `<svg viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="曲面几何：网格、UV、观察点">
        <rect width="760" height="210" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#e7eef5">
          <text x="24" y="28" fill="#3ad7c4">1 屏体网格</text>
          <path d="M36 150 L70 70 L150 58 L196 138 Z" fill="#121922" stroke="#3ad7c4"/>
          <path d="M70 70 L110 78 L150 58" fill="none" stroke="#314557"/>
          <path d="M78 118 L118 124 L160 108" fill="none" stroke="#314557"/>
          <path d="M90 94 L128 86" fill="none" stroke="#314557"/>
          <text x="48" y="176" fill="#8c9aab">模组按弧度排布</text>
          <path d="M220 108 H268" stroke="#e2a73a" fill="none"/>
          <text x="248" y="96" fill="#e2a73a" font-size="16">→</text>
          <text x="292" y="28" fill="#3ad7c4">2 UV 0–1</text>
          <rect x="292" y="52" width="168" height="100" fill="#121922" stroke="#3ad7c4"/>
          <path d="M308 132 L340 68 L400 60 L444 128 Z" fill="none" stroke="#e2a73a"/>
          <text x="296" y="168" fill="#8c9aab" font-size="11">0</text>
          <text x="440" y="48" fill="#8c9aab" font-size="11">1</text>
          <text x="300" y="190" fill="#8c9aab">没铺满就有像素看不见</text>
          <text x="508" y="96" fill="#e2a73a" font-size="16">→</text>
          <text x="530" y="28" fill="#e2a73a">3 观察点</text>
          <circle cx="548" cy="120" r="6" fill="#e2a73a"/>
          <text x="536" y="148" fill="#8c9aab" font-size="11">眼</text>
          <path d="M556 116 L650 62 M556 120 L670 108 M556 124 L690 156" stroke="#e2a73a" fill="none"/>
          <path d="M640 52 Q720 100 700 168" fill="none" stroke="#3ad7c4" stroke-width="2"/>
          <text x="600" y="190" fill="#8c9aab">射线打到曲面</text>
        </g>
      </svg>`
    },
    sky: {
      caption: "2:1 等距柱状图的两极是挤在一起的。穹顶镜头再用等距、等立体角或正交把方向投出去。",
      url: "https://help.pixera.one/pixera-20/layer-mapping-effects",
      source: "PIXERA：Equirectangular 效果",
      svg: `<svg viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="天空盒：等距柱状图投到穹顶">
        <rect width="760" height="210" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#e7eef5">
          <text x="24" y="28" fill="#3ad7c4">内容 2:1</text>
          <rect x="24" y="48" width="250" height="125" fill="#121922" stroke="#3ad7c4"/>
          <path d="M24 70 H274 M24 150 H274 M70 48 V173 M140 48 V173 M210 48 V173" stroke="#314557"/>
          <text x="28" y="66" fill="#e2a73a" font-size="11">北极挤成一条</text>
          <text x="28" y="166" fill="#e2a73a" font-size="11">南极挤成一条</text>
          <text x="300" y="112" fill="#e2a73a" font-size="16">→</text>
          <text x="360" y="28" fill="#e2a73a">从一个中心播出去</text>
          <path d="M470 168 A90 90 0 0 1 650 168" fill="#121922" stroke="#3ad7c4"/>
          <circle cx="560" cy="168" r="5" fill="#e2a73a"/>
          <path d="M560 168 L500 96 M560 168 L560 78 M560 168 L620 96" stroke="#e2a73a"/>
          <text x="430" y="196" fill="#8c9aab">0 等距 · 0.5 等立体角 · 1 正交</text>
        </g>
      </svg>`
    },
    naked: {
      caption: "只有一个甜区。两个屏面按这只眼睛做离轴，结果烘成一张展开图，播出时不再算第二只眼。",
      url: "https://www.xjishu.com/zhuanli/62/202611016217.html",
      source: "华院：异形屏离轴反向映射",
      svg: `<svg viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="裸眼离轴：单观察点烘成展开图">
        <rect width="760" height="210" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#e7eef5">
          <text x="24" y="28" fill="#e2a73a">唯一观察点</text>
          <circle cx="70" cy="120" r="16" fill="none" stroke="#e2a73a"/>
          <circle cx="70" cy="114" r="3" fill="#e2a73a"/>
          <path d="M70 136 V168 M54 150 H86" stroke="#e2a73a"/>
          <path d="M86 120 L210 58 L210 168 Z" fill="none" stroke="#314557"/>
          <rect x="210" y="48" width="70" height="120" fill="#121922" stroke="#3ad7c4"/>
          <rect x="280" y="78" width="120" height="90" fill="#121922" stroke="#3ad7c4"/>
          <text x="218" y="44" fill="#8c9aab" font-size="11">面 A</text>
          <text x="288" y="74" fill="#8c9aab" font-size="11">面 B</text>
          <text x="450" y="112" fill="#e2a73a" font-size="16">→</text>
          <text x="500" y="28" fill="#3ad7c4">烘好的一张图</text>
          <rect x="500" y="48" width="220" height="110" fill="#121922" stroke="#e2a73a"/>
          <path d="M516 130 C560 70 620 150 700 80" fill="none" stroke="#3ad7c4"/>
          <path d="M280 78 V168" stroke="#e36b5c" stroke-dasharray="4 3"/>
          <circle cx="430" cy="100" r="10" fill="none" stroke="#8c9aab" stroke-dasharray="3 2"/>
          <path d="M430 112 V140 M418 126 H442" stroke="#8c9aab" stroke-dasharray="3 2"/>
          <text x="408" y="64" fill="#8c9aab" font-size="11">走开</text>
          <text x="500" y="180" fill="#8c9aab">站在点上才凸。虚线位置看，两块面就拆开</text>
        </g>
      </svg>`
    },
    glasses: {
      caption: "左右眼各一条视锥、各一路输出。两个观察点重合时，立体感就没了。",
      url: "https://help.pixera.one/mapping-/stereoscopic-workflow",
      source: "PIXERA：双目工作流",
      svg: `<svg viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="眼镜双目：左右两路视锥">
        <rect width="760" height="210" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#e7eef5">
          <text x="36" y="48" fill="#e2a73a">左眼</text>
          <text x="120" y="48" fill="#3ad7c4">右眼</text>
          <circle cx="48" cy="78" r="8" fill="#e2a73a"/>
          <circle cx="132" cy="78" r="8" fill="#3ad7c4"/>
          <path d="M48 86 L250 56 L250 160 Z" fill="none" stroke="#e2a73a"/>
          <path d="M132 86 L250 56 L250 160 Z" fill="none" stroke="#3ad7c4"/>
          <text x="70" y="110" fill="#8c9aab">瞳距</text>
          <rect x="250" y="56" width="150" height="104" fill="#121922" stroke="#e7eef5"/>
          <text x="292" y="114" fill="#8c9aab">同一块屏</text>
          <text x="450" y="80" fill="#e2a73a">左路输出</text>
          <rect x="450" y="92" width="110" height="62" fill="#121922" stroke="#e2a73a"/>
          <text x="600" y="80" fill="#3ad7c4">右路输出</text>
          <rect x="600" y="92" width="110" height="62" fill="#121922" stroke="#3ad7c4"/>
          <circle cx="36" cy="186" r="7" fill="none" stroke="#e2a73a"/>
          <circle cx="44" cy="186" r="7" fill="none" stroke="#3ad7c4"/>
          <text x="64" y="190" fill="#8c9aab">两点挪到一起，左右图重合，立体消失</text>
        </g>
      </svg>`
    },
    xr: {
      caption: "外层是真实 LED 体积，内层是虚拟场景。摄像机每帧决定从哪个窗口看进去，处理器要锁在同一 genlock。",
      url: "https://help.disguise.one/workflows/xr/xr-stage-setup",
      source: "disguise：xR Stage Setup",
      svg: `<svg viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="XR：外层体积、内层场景、跟踪摄像机">
        <rect width="760" height="210" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#e7eef5">
          <text x="250" y="28" fill="#3ad7c4">外层 · 真实 LED</text>
          <path d="M220 56 H520 V168 H300 L220 120 Z" fill="#121922" stroke="#3ad7c4"/>
          <text x="360" y="40" fill="#e2a73a">内层 · 虚拟场景</text>
          <rect x="300" y="78" width="150" height="70" fill="#18222d" stroke="#e2a73a" stroke-dasharray="4 3"/>
          <circle cx="80" cy="120" r="10" fill="none" stroke="#e2a73a"/>
          <path d="M92 120 H210" stroke="#e2a73a"/>
          <text x="36" y="156" fill="#8c9aab">跟踪摄像机</text>
          <rect x="560" y="70" width="160" height="48" fill="#121922" stroke="#8c9aab"/>
          <text x="578" y="98" fill="#8c9aab">LED 处理器</text>
          <path d="M520 90 H560" stroke="#e2a73a"/>
          <text x="548" y="64" fill="#e2a73a" font-size="11">同一 genlock</text>
          <text x="220" y="196" fill="#8c9aab">改了外层网格，看进内层的窗口要重算</text>
        </g>
      </svg>`
    }
  };

  const pairFigures = {
    disguise: `<svg viewBox="0 0 520 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="520" height="110" fill="#0d1218"/><g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#e7eef5"><text x="16" y="24" fill="#3ad7c4">Direct</text><rect x="16" y="36" width="200" height="56" fill="#121922" stroke="#3ad7c4"/><text x="36" y="68" fill="#8c9aab">贴死在 UV 上</text><text x="250" y="24" fill="#e2a73a">Perspective</text><circle cx="270" cy="78" r="5" fill="#e2a73a"/><path d="M276 74 L360 40 L420 80" fill="none" stroke="#e2a73a"/><text x="300" y="96" fill="#8c9aab">跟摄像机走</text></g></svg>`,
    pixera: `<svg viewBox="0 0 520 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="520" height="110" fill="#0d1218"/><g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#e7eef5"><text x="16" y="24" fill="#8c9aab">默认平贴</text><rect x="16" y="36" width="180" height="50" fill="#121922" stroke="#314557"/><path d="M40 70 H170" stroke="#8c9aab"/><text x="230" y="24" fill="#3ad7c4">打开透视纹理</text><path d="M240 86 Q310 36 400 70" fill="none" stroke="#3ad7c4"/><circle cx="250" cy="86" r="4" fill="#e2a73a"/><text x="230" y="104" fill="#8c9aab">Eye-Point 落到曲面</text></g></svg>`,
    sky: `<svg viewBox="0 0 760 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="760" height="120" fill="#0d1218"/><g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#8c9aab"><text x="24" y="22" fill="#e2a73a">等距 · 夹角均匀</text><circle cx="90" cy="88" r="4" fill="#e2a73a"/><path d="M90 84 L50 36 M90 84 L90 28 M90 84 L130 36" stroke="#e2a73a" fill="none"/><text x="270" y="22" fill="#3ad7c4">等立体角 · 中间更密</text><circle cx="340" cy="88" r="4" fill="#3ad7c4"/><path d="M340 84 L310 40 M340 84 L340 26 M340 84 L370 40" stroke="#3ad7c4" fill="none"/><text x="520" y="22" fill="#e7eef5">正交 · 射线平行</text><path d="M540 88 V36 M590 88 V36 M640 88 V36" stroke="#e7eef5" fill="none"/></g></svg>`
  };

  const geomGlossary = [
    ["UV", "灯珠在贴图上的坐标，通常铺满 0–1。没铺满就会采样到看不见的像素。"],
    ["等距柱状", "2:1 的 360 图。横轴是经度，纵轴是纬度，两极挤成一条线。"],
    ["离轴", "眼睛不在屏的正前方。裸眼立面用这个矩阵把素材提前扭好。"],
    ["瞳距", "两眼间距。双目是两个观察点，不是两个素材名。"],
    ["Eye-Point", "PIXERA 里发出透视射线的点，可以交给摄像机跟踪。"],
    ["Direct", "按 UV 贴死，摄像机挪了画面也不变。"],
    ["Perspective", "从观察点投射。机位一变，落到曲面上的像素就变。"],
    ["Outer / Inner", "外层是真实 LED 体积，内层是虚拟场景。窗口开在外层上。"]
  ];

  function renderGeom() {
    const modes = document.getElementById("geom-modes");
    const table = document.getElementById("geom-table");
    const cases = document.getElementById("geom-cases");
    const shows = document.getElementById("geom-shows");
    if (!modes || !S.geomModes) return;

    const jumps = document.getElementById("geom-jumps");
    if (jumps) {
      jumps.innerHTML = "";
      S.geomModes.forEach((mode) => {
        jumps.appendChild(el("a", { href: "#geom-" + mode.id }, mode.name));
      });
    }
    const gloss = document.getElementById("geom-glossary");
    if (gloss) {
      gloss.innerHTML = geomGlossary.map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join("");
    }

    S.geomModes.forEach((mode) => {
      const card = el("article", { class: "geom-card", id: "geom-" + mode.id, dataset: { geom: mode.id } });
      const steps = (mode.steps || []).map((s) => `<li><strong>${s.t}</strong> ${s.d}</li>`).join("");
      const fig = geomFigures[mode.id];
      const extra = mode.id === "sky" ? pairFigures.sky : "";
      const figure = fig
        ? `<figure class="geom-fig">${fig.svg}${extra}<figcaption>${fig.caption} <a href="${fig.url}" target="_blank" rel="noopener">打开手册原图 · ${fig.source}</a></figcaption></figure>`
        : "";
      card.innerHTML =
        `<div class="geom-card-head"><div><div class="en">${mode.group} · ${mode.en}</div><h3>${mode.name}</h3></div>` +
        `<button type="button" class="geom-mode" data-geom="${mode.id}" aria-pressed="false">只看这一档</button></div>` +
        `<div class="geom-split">${figure}<div><p>${mode.body}</p><ol>${steps}</ol><p class="fail">${mode.fail}</p></div></div>`;
      const figureEl = card.querySelector(".geom-fig");
      if (figureEl && fig) {
        figureEl.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          openLightbox({
            svg: fig.svg,
            product: mode.name,
            caption: fig.caption,
            sourceUrl: fig.url,
            sourceTitle: fig.source,
            group: "geom"
          }, "hw");
        });
      }
      card.querySelector(".geom-mode").addEventListener("click", () => {
        const same = activeGeom === mode.id;
        clearHighlightSources("geom");
        if (same) {
          activeGeom = null;
        } else {
          activeGeom = mode.id;
          card.querySelector(".geom-mode").classList.add("active");
          card.querySelector(".geom-mode").setAttribute("aria-pressed", "true");
        }
        applyFilters();
      });
      modes.appendChild(card);
    });

    const writeups = document.getElementById("geom-writeups");
    if (writeups && S.geomWriteups) {
      S.geomWriteups.forEach((item) => {
        const card = el("article", {
          class: "geom-writeup",
          id: "writeup-" + item.id,
          dataset: { kinds: (item.kinds || []).join(","), id: item.id }
        });
        const chips = (item.kinds || []).map((k) => {
          const mode = S.geomModes.find((m) => m.id === k);
          return `<a href="#geom-${k}">${mode ? mode.name : k}</a>`;
        }).join("");
        const pair = pairFigures[item.id] ? `<figure class="geom-fig">${pairFigures[item.id]}</figure>` : "";
        card.innerHTML =
          `<div class="tear-head"><span class="grade">证据 ${item.grade}</span><h3>${item.title}</h3></div>` +
          `<div class="kind-chips">${chips}</div>` +
          pair +
          `<p>${item.body}</p><p>${item.more}</p>` +
          `<div class="who"><a href="${item.url}" target="_blank" rel="noopener">${item.source}</a></div>`;
        writeups.appendChild(card);
      });
    }

    if (table && S.geomMatrix) {
      const thead = table.querySelector("thead");
      const tbody = table.querySelector("tbody");
      thead.innerHTML = "";
      tbody.innerHTML = "";
      const trh = document.createElement("tr");
      trh.appendChild(el("th", null, "产品"));
      S.geomKeys.forEach((k) => trh.appendChild(el("th", null, k.label)));
      trh.appendChild(el("th", null, "立体输出"));
      trh.appendChild(el("th", null, "证据"));
      thead.appendChild(trh);
      S.geomMatrix.forEach((row) => {
        const v = vendorById(row.id);
        const tr = document.createElement("tr");
        tr.dataset.id = row.id;
        tr.dataset.kinds = (S.geomModes || []).filter((m) => m.vendors.includes(row.id)).map((m) => m.id).join(",");
        if (v) {
          tr.dataset.region = v.region;
          tr.dataset.depth = v.depth;
          tr.dataset.layers = (v.layers || []).join(",");
        }
        const name = document.createElement("td");
        name.innerHTML = `<strong>${vendorLabel(row.id)}</strong>`;
        name.title = row.note || "";
        tr.appendChild(name);
        S.geomKeys.forEach((k) => {
          const val = row[k.id] || "unknown";
          const td = document.createElement("td");
          td.innerHTML = `<span class="dot ${val}" title="${heatLabel[val] || val}"></span>`;
          tr.appendChild(td);
        });
        tr.appendChild(el("td", { class: "cell-text" }, row.stereo || "未检索到"));
        tr.appendChild(el("td", null, row.evidence || "—"));
        bindRowClick(tr, row.id);
        tbody.appendChild(tr);
      });
    }

    if (cases && S.geomCases) {
      S.geomCases.forEach((item) => {
        const card = el("article", {
          class: "case-card",
          dataset: { kind: item.kind, vendors: (item.vendors || []).join(",") }
        });
        const link = item.url
          ? `<a href="${item.url}" target="_blank" rel="noopener">${item.source}</a>`
          : "";
        const thumb = geomFigures[item.kind]
          ? `<figure class="geom-fig case-thumb">${geomFigures[item.kind].svg}</figure>`
          : "";
        card.innerHTML =
          thumb +
          `<div class="tear-head"><span class="grade">证据 ${item.grade}</span><h3>${item.name}</h3></div>` +
          `<p class="symptom">${item.who}</p><p>${item.claim}</p><p>${item.method}</p>` +
          `<div class="who">${link}</div>`;
        cases.appendChild(card);
      });
    }

    if (shows && S.geomShows) {
      S.geomShows.forEach((item) => {
        const card = el("article", { class: "show-card" + (item.url ? "" : " is-empty") });
        const quote = item.quote ? `<p>${item.quote}</p>` : `<p>没有可引用的原句。</p>`;
        const link = item.url
          ? `<a href="${item.url}" target="_blank" rel="noopener">${item.source}</a>`
          : "";
        card.innerHTML =
          `<div class="tear-head"><span class="grade">${item.grade === "—" ? "未定位" : "证据 " + item.grade}</span><h3>${item.name}</h3></div>` +
          `<div class="en">${item.year}</div>` +
          `<div class="show-split"><div><h4>原文说了</h4>${quote}</div><div><h4>原文没写</h4><p>${item.note}</p></div></div>` +
          `<div class="who">${link}</div>`;
        shows.appendChild(card);
      });
    }

    const questions = document.getElementById("geom-questions");
    if (questions && S.geomMatrix && S.geomKeys) {
      questions.innerHTML = "";
      S.geomMatrix.forEach((row) => {
        const gaps = S.geomKeys.filter((k) => (row[k.id] || "unknown") === "unknown").map((k) => k.label);
        if (row.stereo && String(row.stereo).indexOf("未检索") >= 0) gaps.push("立体输出");
        if (!gaps.length) return;
        questions.appendChild(el("p", null,
          `<strong>${vendorLabel(row.id)}</strong> 的空项：${gaps.join("、")}。问对方：手册哪一章写了这一步，做完之后像素从哪张表来。`));
      });
    }
  }

  function bindRowClick(tr, id) {
    tr.addEventListener("click", () => scrollToCard(id));
  }

  function renderRack() {
    const table = document.getElementById("rack-table");
    if (!table || !S.rack) return;
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";
    const trh = document.createElement("tr");
    trh.appendChild(el("th", null, "产品"));
    S.rackKeys.forEach((k) => trh.appendChild(el("th", null, k.label)));
    trh.appendChild(el("th", null, "证据"));
    thead.appendChild(trh);
    S.rack.forEach((row) => {
      const v = vendorById(row.id);
      const tr = document.createElement("tr");
      tr.dataset.id = row.id;
      if (v) {
        tr.dataset.region = v.region;
        tr.dataset.depth = v.depth;
        tr.dataset.layers = (v.layers || []).join(",");
      }
      const name = document.createElement("td");
      name.innerHTML = `<strong>${vendorLabel(row.id)}</strong>` +
        `<div class="also" style="display:block;color:var(--faint)">${v && v.role === "processor" ? "处理器" : (v && v.region === "cn" ? "国内" : "国外")}</div>`;
      tr.appendChild(name);
      S.rackKeys.forEach((k) => {
        tr.appendChild(el("td", { class: "cell-text" }, row[k.id] || "—"));
      });
      tr.appendChild(el("td", null, row.evidence || "—"));
      bindRowClick(tr, row.id);
      tbody.appendChild(tr);
    });
  }

  function renderCodec() {
    const table = document.getElementById("codec-table");
    if (!table || !S.rack) return;
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";
    const trh = document.createElement("tr");
    trh.appendChild(el("th", null, "产品"));
    S.codecKeys.forEach((k) => trh.appendChild(el("th", null, k.label)));
    thead.appendChild(trh);
    S.rack.forEach((row) => {
      const v = vendorById(row.id);
      const tr = document.createElement("tr");
      tr.dataset.id = row.id;
      if (v) {
        tr.dataset.region = v.region;
        tr.dataset.depth = v.depth;
        tr.dataset.layers = (v.layers || []).join(",");
      }
      const name = document.createElement("td");
      name.innerHTML = `<strong>${vendorLabel(row.id)}</strong>`;
      tr.appendChild(name);
      S.codecKeys.forEach((k) => {
        const val = row[k.id] || "unknown";
        const td = document.createElement("td");
        td.innerHTML = `<span class="dot ${val}" title="${heatLabel[val] || val}"></span>`;
        tr.appendChild(td);
      });
      bindRowClick(tr, row.id);
      tbody.appendChild(tr);
    });
  }

  function renderControlHeat() {
    const table = document.getElementById("control-table");
    if (!table || !S.controlHeat) return;
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";
    const trh = document.createElement("tr");
    trh.appendChild(el("th", null, "产品"));
    S.controlKeys.forEach((k) => trh.appendChild(el("th", null, k.label)));
    thead.appendChild(trh);
    S.vendors.forEach((v) => {
      const heat = S.controlHeat[v.id] || {};
      const tr = document.createElement("tr");
      tr.dataset.id = v.id;
      tr.dataset.region = v.region;
      tr.dataset.depth = v.depth;
      tr.dataset.layers = (v.layers || []).join(",");
      const name = document.createElement("td");
      name.innerHTML = `<strong>${v.name}</strong>`;
      tr.appendChild(name);
      S.controlKeys.forEach((k) => {
        const val = heat[k.id] || "unknown";
        const td = document.createElement("td");
        td.innerHTML = `<span class="dot ${val}" title="${heatLabel[val] || val}"></span>`;
        tr.appendChild(td);
      });
      bindRowClick(tr, v.id);
      tbody.appendChild(tr);
    });
  }


  function renderFilters() {
    const root = document.getElementById("filters");
    root.innerHTML = "";
    const groups = [
      { key: "region", opts: [["all", "全部地区"], ["cn", "国内"], ["int", "国外"]] },
      { key: "depth", opts: [["all", "深潜+对照"], ["deep", "仅深潜"], ["compare", "仅对照"]] }
    ];
    groups.forEach((g) => {
      g.opts.forEach(([val, label]) => {
        const b = el("button", { class: "filter" + (state[g.key] === val ? " active" : ""), type: "button" }, label);
        b.addEventListener("click", () => {
          state[g.key] = val;
          renderFilters();
          applyFilters();
        });
        root.appendChild(b);
      });
    });
  }

  function renderTable() {
    const table = document.getElementById("heat-table");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";
    const trh = document.createElement("tr");
    trh.appendChild(el("th", null, "产品"));
    S.heatmapKeys.forEach((k) => trh.appendChild(el("th", null, k.label)));
    thead.appendChild(trh);

    S.vendors.forEach((v) => {
      const tr = document.createElement("tr");
      tr.dataset.id = v.id;
      tr.dataset.region = v.region;
      tr.dataset.depth = v.depth;
      tr.dataset.layers = (v.layers || []).join(",");
      const name = document.createElement("td");
      name.innerHTML = `<strong>${v.name}</strong><div class="also" style="display:block;color:var(--faint)">${v.region === "cn" ? "国内" : "国外"} · 证据 ${v.evidence}</div>`;
      tr.appendChild(name);
      S.heatmapKeys.forEach((k) => {
        const val = v.heat[k.id] || "unknown";
        const td = document.createElement("td");
        td.innerHTML = `<span class="dot ${val}" title="${heatLabel[val] || val}"></span>`;
        tr.appendChild(td);
      });
      bindRowClick(tr, v.id);
      tbody.appendChild(tr);
    });
  }

  const archLabel = { window: "窗口 / 预案型", timeline: "时间线型", stage: "3D 舞台型" };
  let activeArch = null;

  function shotArches(shot) {
    return [shot.arch].concat(shot.alsoArch || []);
  }

  function firstShotFor(vendorId) {
    return (S.uiGallery || []).find((s) => s.vendorId === vendorId && s.file);
  }

  function applyUiArch() {
    document.querySelectorAll(".arch-card").forEach((n) => {
      const on = activeArch === n.dataset.arch;
      n.classList.toggle("active", on);
      n.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll(".ui-shot").forEach((n) => {
      const match = !activeArch || (n.dataset.arch || "").split(",").includes(activeArch);
      n.classList.toggle("dim", !match);
    });
    document.querySelectorAll(".card").forEach((card) => {
      const arches = (card.dataset.uiArch || "").split(",").filter(Boolean);
      const hit = !activeArch || arches.includes(activeArch);
      card.classList.toggle("ui-hit", !!activeArch && hit);
      card.classList.toggle("ui-miss", !!activeArch && !hit);
    });
  }

  const lb = { scale: 1, x: 0, y: 0, drag: false, lastX: 0, lastY: 0 };

  function lbNodes() {
    return {
      box: document.getElementById("ui-lightbox"),
      stage: document.getElementById("lb-stage"),
      zoom: document.getElementById("lb-zoom")
    };
  }

  function applyLbZoom() {
    const { stage, zoom } = lbNodes();
    if (!zoom) return;
    zoom.style.transform = `translate(${lb.x}px, ${lb.y}px) scale(${lb.scale})`;
    if (stage) stage.classList.toggle("is-zoomed", lb.scale > 1.01);
  }

  function lbMedia() {
    const { zoom } = lbNodes();
    if (!zoom) return null;
    const svg = zoom.querySelector(".lb-svg:not([hidden])");
    if (svg) return svg;
    const img = zoom.querySelector("img");
    return img && !img.hidden ? img : null;
  }

  function fitLbContent() {
    const { stage } = lbNodes();
    const media = lbMedia();
    if (!stage || !media) return;
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const svg = media.matches(".lb-svg") ? media.querySelector("svg") : null;
    const nw = svg ? (svg.viewBox.baseVal.width || media.offsetWidth) : (media.naturalWidth || media.offsetWidth);
    const nh = svg ? (svg.viewBox.baseVal.height || media.offsetHeight) : (media.naturalHeight || media.offsetHeight);
    if (!nw || !nh || !sw || !sh) return;
    const fit = Math.min(sw / nw, sh / nh);
    const w = Math.max(1, Math.floor(nw * fit));
    const h = Math.max(1, Math.floor(nh * fit));
    media.style.width = w + "px";
    media.style.height = h + "px";
    if (svg) {
      svg.style.width = "100%";
      svg.style.height = "100%";
    }
  }

  function centerLbContent() {
    const { stage, zoom } = lbNodes();
    if (!stage || !zoom) return;
    lb.scale = 1;
    lb.x = Math.round((stage.clientWidth - zoom.offsetWidth) / 2);
    lb.y = Math.round((stage.clientHeight - zoom.offsetHeight) / 2);
    lb.drag = false;
    applyLbZoom();
  }

  function resetLbZoom() {
    lb.drag = false;
    fitLbContent();
    centerLbContent();
  }

  function bindLightboxZoom() {
    const { box, stage } = lbNodes();
    if (!box || !stage || stage.dataset.zoomBound) return;
    stage.dataset.zoomBound = "1";
    box.addEventListener("wheel", (e) => {
      if (box.hidden) return;
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const next = Math.min(8, Math.max(1, lb.scale * (e.deltaY < 0 ? 1.14 : 1 / 1.14)));
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const ox = (cx - lb.x) / lb.scale;
      const oy = (cy - lb.y) / lb.scale;
      lb.scale = next;
      if (lb.scale <= 1.01) {
        centerLbContent();
      } else {
        lb.x = cx - ox * lb.scale;
        lb.y = cy - oy * lb.scale;
        applyLbZoom();
      }
    }, { passive: false });
    stage.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || lb.scale <= 1.01) return;
      lb.drag = true;
      lb.lastX = e.clientX;
      lb.lastY = e.clientY;
      stage.classList.add("is-panning");
      stage.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    stage.addEventListener("pointermove", (e) => {
      if (!lb.drag) return;
      lb.x += e.clientX - lb.lastX;
      lb.y += e.clientY - lb.lastY;
      lb.lastX = e.clientX;
      lb.lastY = e.clientY;
      applyLbZoom();
    });
    function endPan(e) {
      if (!lb.drag) return;
      lb.drag = false;
      stage.classList.remove("is-panning");
      if (e && stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    }
    stage.addEventListener("pointerup", endPan);
    stage.addEventListener("pointercancel", endPan);
    stage.addEventListener("dblclick", (e) => {
      e.preventDefault();
      resetLbZoom();
    });
  }

  function openLightbox(shot, kind) {
    const box = document.getElementById("ui-lightbox");
    if (!box || !shot || !(shot.file || shot.svg)) return;
    const img = box.querySelector("img");
    const cap = box.querySelector("figcaption");
    const zoom = document.getElementById("lb-zoom");
    const isHw = kind === "hw" || shot.group;
    let host = box.querySelector(".lb-svg");
    if (isHw && shot.svg) {
      img.hidden = true;
      img.removeAttribute("src");
      if (!host) {
        host = document.createElement("div");
        host.className = "lb-svg";
        zoom.insertBefore(host, img);
      }
      host.hidden = false;
      host.innerHTML = shot.svg;
    } else {
      if (host) {
        host.hidden = true;
        host.innerHTML = "";
      }
      img.hidden = false;
      img.src = shot.file;
    }
    img.alt = shot.product + (isHw ? " 硬件示意" : " 主界面");
    const zones = (shot.zones || []).join(" / ");
    const body = shot.caption || zones;
    cap.innerHTML =
      `${shot.product}${body ? " · " + body : ""}` +
      `<br>截自或按公开手册绘制，版权归原厂商，仅作对照。` +
      (shot.sourceUrl ? ` <a href="${shot.sourceUrl}" target="_blank" rel="noopener">${shot.sourceTitle || "出处"}</a>` : "");
    box.hidden = false;
    const layout = () => requestAnimationFrame(resetLbZoom);
    if (!isHw && img && !img.complete) img.addEventListener("load", layout, { once: true });
    layout();
  }

  function closeLightbox() {
    const box = document.getElementById("ui-lightbox");
    if (box) box.hidden = true;
    resetLbZoom();
  }

  function renderUiGallery() {
    const root = document.getElementById("ui-gallery");
    if (!root || !S.uiGallery) return;
    S.uiGallery.forEach((shot) => {
      const arches = shotArches(shot);
      const btn = el("button", {
        class: "ui-shot",
        type: "button",
        id: "shot-" + shot.id,
        dataset: { arch: arches.join(","), vendor: shot.vendorId, shot: shot.id }
      });
      const zones = (shot.zones || []).join(" · ");
      if (shot.file) {
        btn.innerHTML =
          `<img class="thumb" src="${shot.file}" alt="${shot.product} 主界面" />` +
          `<div class="meta"><div class="kind">${archLabel[shot.arch] || shot.arch}</div>` +
          `<h3>${shot.product}</h3><div class="zones">${zones}</div></div>`;
        btn.addEventListener("click", () => openLightbox(shot));
      } else {
        btn.innerHTML =
          `<div class="ui-ph">${shot.note || "公开页无独立主界面图，见布局示意"}</div>` +
          `<div class="meta"><div class="kind">${archLabel[shot.arch] || shot.arch}</div>` +
          `<h3>${shot.product}</h3><div class="zones">${zones}</div></div>`;
        btn.addEventListener("click", () => {
          document.querySelector(`.arch-card[data-arch="${shot.arch}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      root.appendChild(btn);
    });

    document.querySelectorAll(".arch-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.arch;
        activeArch = activeArch === id ? null : id;
        applyUiArch();
      });
    });

    const box = document.getElementById("ui-lightbox");
    if (box) {
      box.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
      box.addEventListener("click", (e) => { if (e.target === box) closeLightbox(); });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !box.hidden) closeLightbox();
      });
      bindLightboxZoom();
    }
  }

  function rowVisible(el) {
    const regionOk = state.region === "all" || el.dataset.region === state.region;
    const depthOk = state.depth === "all" || el.dataset.depth === state.depth;
    const layerOk = !activeLayer || (el.dataset.layers || "").split(",").includes(activeLayer);
    return regionOk && depthOk && layerOk;
  }

  function syncMotion() {
    const stack = document.getElementById("stack-figure");
    if (stack) {
      stack.classList.remove("focus-wallClock", "focus-frameId", "focus-scanout", "focus-transport");
      if (activeLayer) stack.classList.add("focus-" + activeLayer);
    }
    const jump = document.getElementById("jump-stage");
    if (jump) {
      jump.classList.remove("mode-arrival", "mode-barrier");
      if (activeCmd === "arrival" || activeCmd === "chase") jump.classList.add("mode-arrival");
      else if (activeCmd === "deferred" || activeCmd === "take") jump.classList.add("mode-barrier");
    }
  }

  function applyFilters() {
    syncMotion();
    const hits = highlightIds();
    document.querySelectorAll("#heat-table tbody tr, #rack-table tbody tr, #codec-table tbody tr, #control-table tbody tr, #geom-table tbody tr, #command-table tbody tr").forEach((tr) => {
      const visible = rowVisible(tr);
      const matched = !hits || hits.includes(tr.dataset.id);
      tr.classList.toggle("dim", !visible || !matched);
      tr.classList.toggle("hit", !!(visible && hits && matched));
    });
    document.querySelectorAll(".card").forEach((card) => {
      const id = card.id.replace(/^card-/, "");
      const visible = rowVisible(card);
      const matched = !hits || hits.includes(id);
      card.style.display = visible ? "" : "none";
      card.classList.toggle("hit", !!(visible && hits && matched));
      card.classList.toggle("miss", !!(visible && hits && !matched));
    });
    document.querySelectorAll(".case-card").forEach((card) => {
      const vendors = (card.dataset.vendors || "").split(",").filter(Boolean);
      const byGeom = !!activeGeom && card.dataset.kind === activeGeom;
      const byVendor = !!hits && vendors.some((id) => hits.includes(id));
      const on = !!activeGeom || !!hits;
      const matched = activeGeom ? byGeom : byVendor;
      card.classList.toggle("hit", on && matched);
      card.classList.toggle("miss", on && !matched);
    });
    document.querySelectorAll(".geom-card").forEach((card) => {
      const on = !!activeGeom;
      const matched = card.dataset.geom === activeGeom;
      card.classList.toggle("hit", on && matched);
      card.classList.toggle("miss", on && !matched);
    });
    document.querySelectorAll(".geom-writeup").forEach((card) => {
      const kinds = (card.dataset.kinds || "").split(",").filter(Boolean);
      const on = !!activeGeom;
      const matched = kinds.includes(activeGeom);
      card.classList.toggle("hit", on && matched);
      card.classList.toggle("miss", on && !matched);
    });
    document.querySelectorAll("#patent-list .patent").forEach((card) => {
      const on = !!activeGeom;
      const matched = !!card.dataset.kind && card.dataset.kind === activeGeom;
      card.classList.toggle("hit", on && matched);
      card.classList.toggle("miss", on && !matched);
    });
  }

  function renderVendors() {
    const root = document.getElementById("vendor-cards");
    S.vendors.forEach((v) => {
      const src = (v.sources || []).map((s) => `<a href="${s.u}" target="_blank" rel="noopener">${s.t}</a>`).join("");
      const shot = firstShotFor(v.id);
      const card = el("article", {
        class: "card " + v.depth + (v.role === "processor" ? " processor" : ""),
        id: "card-" + v.id,
        dataset: {
          region: v.region,
          depth: v.depth,
          layers: (v.layers || []).join(","),
          uiArch: (v.uiArch || []).join(",")
        }
      });
      const thumb = shot
        ? `<button class="card-thumb" type="button" data-shot="${shot.id}" aria-label="查看 ${v.name} 主界面">
             <img src="${shot.file}" alt="${v.name} 主界面缩略图" />
           </button>`
        : "";
      card.innerHTML = `
        ${thumb}
        <header>
          <div>
            <h3>${v.name}</h3>
            <span class="also">${v.also} · ${v.company}</span>
          </div>
          <div class="badges">
            <span class="badge ${v.evidence.toLowerCase()}">证据 ${v.evidence}</span>
            <span class="badge">${v.role === "processor" ? "处理器·非播控" : (v.depth === "deep" ? "深潜" : "对照")}</span>
            <span class="badge">${v.region === "cn" ? "国内" : "国外"}</span>
          </div>
        </header>
        <dl>
          <dt>产品</dt><dd>${v.product}</dd>
          <dt>定位</dt><dd>${v.positioning}</dd>
          <dt>控制拓扑</dt><dd>${v.topology}</dd>
          <dt>单机</dt><dd>${v.single}</dd>
          <dt>多机</dt><dd>${v.multi}</dd>
          <dt>同步栈</dt><dd>L1 ${v.sync.wallClock}<br>L2 ${v.sync.frameId}<br>L3 ${v.sync.scanout}<br>L4 ${v.sync.transport}</dd>
          <dt>主备</dt><dd>${v.backup}</dd>
          <dt>异形 / 切片</dt><dd>${v.irregular}</dd>
          <dt>硬件耦合</dt><dd>${v.coupling}</dd>
          <dt>外部联动</dt><dd>${v.control}</dd>
          <dt>证据说明</dt><dd>${v.evidenceNote || "见出处。"}</dd>
        </dl>
        <div class="sources">${src}</div>`;
      if (shot) {
        card.querySelector(".card-thumb").addEventListener("click", (e) => {
          e.stopPropagation();
          const item = document.getElementById("shot-" + shot.id);
          if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
          openLightbox(shot);
        });
      }
      root.appendChild(card);
    });
  }

  function renderPatents() {
    const root = document.getElementById("patent-list");
    const trackName = { sync: "同步支线", geom: "几何支线", adjacent: "相邻领域" };
    const kindName = { surface: "曲面几何", sky: "天空盒", naked: "裸眼离轴", glasses: "双目", xr: "跟踪视锥" };
    S.patents.forEach((p) => {
      const kind = p.kind ? ` · ${kindName[p.kind] || p.kind}` : "";
      root.appendChild(el("article", { class: "patent", dataset: { kind: p.kind || "" } },
        `<div>
           <div class="track">${trackName[p.track]} · ${p.grade}${kind}</div>
           <div class="no">${p.no}</div>
           <div class="also" style="margin-top:8px;color:var(--faint);font-size:12px">${p.who}<br>${p.year}</div>
         </div>
         <div>
           <h3>${p.title}</h3>
           <p>${p.summary}</p>
           <p><strong style="color:var(--text)">对播控的意义：</strong> ${p.meaning}</p>
           <a href="${p.url}" target="_blank" rel="noopener">打开出处</a>
         </div>`));
    });
  }

  function renderOss() {
    const root = document.getElementById("oss-list");
    S.oss.forEach((o) => {
      const fitClass = o.fit === "精度不够" ? "warn" : o.fit === "几何参考" ? "mid" : "";
      root.appendChild(el("article", { class: "oss-item" },
        `<div class="fit ${fitClass}">${o.fit}</div>
         <h3>${o.name}</h3>
         <p style="color:var(--muted);font-size:14px">${o.summary}</p>
         <a href="${o.url}" target="_blank" rel="noopener">${o.url.replace(/^https?:\/\//, "")}</a>`));
    });
  }

  function renderPrinciples() {
    const root = document.getElementById("principles");
    if (!root || !S.principles) return;
    S.principles.forEach((p) => {
      root.appendChild(el("article", { class: "patent" },
        `<div><div class="track">约束</div><div class="no">${p.t}</div></div>
         <div><p>${p.d}</p></div>`));
    });
  }

  function renderHardware() {
    function paint(rootId, group) {
      const root = document.getElementById(rootId);
      if (!root || !S.hardwareGallery) return;
      S.hardwareGallery.filter((h) => h.group === group).forEach((shot) => {
        const btn = el("button", {
          class: "ui-shot hw-shot",
          type: "button",
          id: "hw-" + shot.id
        });
        const zones = (shot.zones || []).join(" · ");
        const thumb = shot.svg
          ? `<div class="thumb hw-inline">${shot.svg}</div>`
          : `<img class="thumb" src="${shot.file}" alt="${shot.product}" />`;
        btn.innerHTML =
          thumb +
          `<div class="meta"><div class="kind">${shot.group === "nvidia" ? "NVIDIA Sync" : "Genlock"}</div>` +
          `<h3>${shot.product}</h3><div class="zones">${shot.caption || zones}</div></div>`;
        btn.addEventListener("click", () => openLightbox(shot, "hw"));
        root.appendChild(btn);
      });
    }
    paint("hw-nvidia", "nvidia");
    paint("hw-genlock", "genlock");
  }

  function renderLineage() {
    const table = document.getElementById("lineage-table");
    if (!table || !S.syncLineage) return;
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    thead.innerHTML = "<tr><th>代际</th><th>年代</th><th>备注</th></tr>";
    S.syncLineage.forEach((row) => {
      tbody.appendChild(el("tr", null,
        `<td>${row.name}</td><td>${row.era}</td><td>${row.note}</td>`));
    });
  }

  function renderWireProtocols() {
    const root = document.getElementById("wire-protocols");
    if (!root || !S.wireProtocols) return;
    const vendorMap = { kfs: "kommander", "grandshow-sync": "grandshow", "kompass-lora": "novastar" };
    S.wireProtocols.forEach((p) => {
      const article = el("article", { class: "proto", dataset: { vendor: vendorMap[p.id] || "" } });
      article.innerHTML =
        `<header><div class="kind">${p.also}</div><h3>${p.name}</h3><div class="zones">${p.vendor} · 证据 ${p.evidence}</div></header>` +
        `<dl><dt>物理 / 介质</dt><dd>${p.phy}</dd>` +
        `<dt>应用层</dt><dd>${p.app}</dd>` +
        `<dt>落在哪一层</dt><dd>${p.layer}</dd>` +
        `<dt>不要写成</dt><dd>${p.note}</dd></dl>`;
      article.addEventListener("click", () => {
        const id = vendorMap[p.id];
        const card = id && document.getElementById("card-" + id);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      root.appendChild(article);
    });
  }

  function renderLtcHandling() {
    const root = document.getElementById("ltc-handling");
    if (!root || !S.ltcHandling) return;
    const L = S.ltcHandling;
    const anomalies = L.anomalies.map((a) =>
      `<article class="ltc-item"><h4>${a.name}</h4><p>${a.d}</p></article>`).join("");
    const steps = L.steps.map((s, i) => `<li><span class="n">${i + 1}</span>${s}</li>`).join("");
    root.innerHTML =
      `<p class="ltc-lead">${L.lead}</p>` +
      `<div class="ltc-grid">${anomalies}</div>` +
      `<ol class="ltc-steps">${steps}</ol>` +
      `<p class="caption">出处：<a href="${L.sourceUrl}" target="_blank" rel="noopener">${L.sourceTitle}</a>。飞轮窗口对照 ETC SMPTE QuickGuide；连续性检测对照 libltc / Ardour。</p>`;
  }

  function renderSources() {
    const root = document.getElementById("all-sources");
    const seen = new Set();
    const list = [];
    S.vendors.forEach((v) => (v.sources || []).forEach((s) => {
      if (!seen.has(s.u)) { seen.add(s.u); list.push(s); }
    }));
    S.patents.forEach((p) => {
      if (!seen.has(p.url)) { seen.add(p.url); list.push({ t: p.no + " " + p.title, u: p.url }); }
    });
    S.oss.forEach((o) => {
      if (!seen.has(o.url)) { seen.add(o.url); list.push({ t: o.name, u: o.url }); }
    });
    (S.extraSources || []).forEach((s) => { if (!seen.has(s.u)) { seen.add(s.u); list.push(s); } });
    [
      { t: "NVIDIA Quadro Sync II User Guide", u: "https://images.nvidia.com/content/quadro/product-literature/user-guides/Quadro-Sync-II-User-Guide-v07.pdf" },
      { t: "WATCHOUT ST 2110 / PTP", u: "https://docs.dataton.com/guide/watchout/network-setup/st-2110-video-over-ip.html" },
      { t: "Brompton Tessera Genlock", u: "https://www.bromptontech.com/features/genlock/" },
      { t: "NovaStar MX40 Pro User Manual V1.5.0", u: "https://oss.novastar.tech/uploads/2025/10/MX40-Pro-LED-Display-Controller-User-Manual-V1.5.0.pdf" },
      { t: "disguise：UV 如何采样", u: "https://help.disguise.one/workflows/3d-modelling/uv-mapping/uv-maps-in-designer" },
      { t: "disguise Spatial Mapping", u: "https://help.disguise.one/designer/mapping/mapping-types/spatial-mapping" },
      { t: "PIXERA 3D equirectangular", u: "https://help.pixera.one/virtual-production-/3d-virtual-production" },
      { t: "nDisplay 摄像机立体参数", u: "https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/DisplayCluster/UDisplayClusterCameraComponent" },
      { t: "Pandoras Box Warper", u: "https://pandorasboxhelpfile.com/home/warper.htm" }
    ].forEach((s) => { if (!seen.has(s.u)) { seen.add(s.u); list.push(s); } });
    (S.hardwareGallery || []).forEach((g) => {
      if (g.sourceUrl && !seen.has(g.sourceUrl)) {
        seen.add(g.sourceUrl);
        list.push({ t: g.sourceTitle, u: g.sourceUrl });
      }
    });
    (S.geomWriteups || []).forEach((c) => {
      if (c.url && !seen.has(c.url)) { seen.add(c.url); list.push({ t: c.source || c.title, u: c.url }); }
    });
    (S.geomCases || []).forEach((c) => {
      if (c.url && !seen.has(c.url)) { seen.add(c.url); list.push({ t: c.source || c.name, u: c.url }); }
    });
    (S.geomShows || []).forEach((c) => {
      if (c.url && !seen.has(c.url)) { seen.add(c.url); list.push({ t: c.source || c.name, u: c.url }); }
    });
    (S.uiGallery || []).forEach((g) => {
      if (g.sourceUrl && !seen.has(g.sourceUrl)) {
        seen.add(g.sourceUrl);
        list.push({ t: g.sourceTitle, u: g.sourceUrl });
      }
    });
    list.forEach((s) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${s.u}" target="_blank" rel="noopener">${s.t}</a>`;
      root.appendChild(li);
    });
  }

  function spyNav() {
    const links = [...document.querySelectorAll(".nav a[href^='#']")];
    const secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    function tick() {
      let current = secs[0];
      secs.forEach((s) => {
        if (s.getBoundingClientRect().top < 120) current = s;
      });
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current.id));
    }
    document.addEventListener("scroll", tick, { passive: true });
    tick();
  }

  // ===== 新增章节渲染 =====

  function placeExplain(afterEl, id, svg, caption, copy) {
    if (!afterEl || document.getElementById(id)) return;
    const row = el("div", { class: "explain", id },
      `<figure class="explain-fig">${svg}<figcaption>${caption}</figcaption></figure><div class="explain-copy">${copy}</div>`);
    afterEl.insertAdjacentElement("afterend", row);
  }

  function renderAudioSync() {
    const A = S.audioSync;
    if (!A) return;
    const lead = document.getElementById("audio-lead");
    if (lead) lead.textContent = A.lead;
    placeExplain(lead, "audio-explain",
      `<svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="视频缓冲短，音频缓冲更长；素材帧率会漂开再拉回">
        <rect width="640" height="210" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#8c9aab">
          <text x="24" y="32" fill="#3ad7c4">视频缓冲</text>
          <rect x="120" y="18" width="360" height="16" fill="#121922" stroke="#314557"/>
          <rect class="mot buf-video" x="120" y="18" width="150" height="16" fill="#3ad7c4"/>
          <text x="24" y="68" fill="#e2a73a">音频缓冲</text>
          <rect x="120" y="54" width="360" height="16" fill="#121922" stroke="#314557"/>
          <rect class="mot buf-audio" x="120" y="54" width="320" height="16" fill="#e2a73a"/>
          <text x="24" y="112">六层帧率</text>
          <g>
            <text x="120" y="108">工程</text><circle cx="138" cy="128" r="5" fill="#3ad7c4"/>
            <text x="190" y="108">GPU</text><circle cx="206" cy="128" r="5" fill="#3ad7c4"/>
            <text x="250" y="108">Genlock</text><circle cx="278" cy="128" r="5" fill="#3ad7c4"/>
            <text x="330" y="108">处理器</text><circle cx="352" cy="128" r="5" fill="#3ad7c4"/>
            <text x="410" y="108">箱体</text><circle cx="428" cy="128" r="5" fill="#3ad7c4"/>
          </g>
          <g class="mot drift-tick">
            <text x="490" y="108" fill="#e2a73a">素材</text>
            <circle cx="508" cy="128" r="5" fill="#e2a73a"/>
          </g>
          <text x="24" y="176">29.97 drop-frame 大约漂 3.6 秒/小时。播出不做实时 pulldown。</text>
        </g>
      </svg>`,
      "音频缓冲比视频长。素材刻度会相对另外五层慢慢漂开，再被拉回。",
      "<p><strong>声画错位比接缝更先被听出来。</strong>视频大约 1–3 帧，声卡还要再垫 5–20 ms。</p><p>嵌在视频里的音频会把同步拐到音频钟上。第一版不把 Dante 的 PTP 域引进来。</p>");
    const issues = document.getElementById("audio-issues");
    if (issues) {
      issues.innerHTML = A.issues.map(item =>
        `<article class="tear"><div class="tear-head"><h3>${item.t}</h3></div><p>${item.d}</p></article>`
      ).join("");
    }
    const recs = document.getElementById("audio-recs");
    if (recs) recs.innerHTML = A.recommendations.map(r => `<p>${r}</p>`).join("");
  }

  function renderFrameRates() {
    const F = S.frameRates;
    if (!F) return;
    const lead = document.getElementById("fr-lead");
    if (lead) lead.textContent = F.lead;
    const table = document.getElementById("fr-table");
    if (table) {
      const thead = table.querySelector("thead");
      const tbody = table.querySelector("tbody");
      thead.innerHTML = "<tr><th>约束对</th><th>规则</th></tr>";
      tbody.innerHTML = F.constraints.map(c =>
        `<tr><td>${c.pair}</td><td>${c.rule}</td></tr>`
      ).join("");
    }
    const notes = document.getElementById("fr-notes");
    if (notes) notes.innerHTML = `<p class="callout">${F.dropFrame}</p><p class="caption">${F.pulldown}</p>`;
  }

  function renderNetwork() {
    const N = S.networkPlan;
    if (!N) return;
    const lead = document.getElementById("net-lead");
    if (lead) lead.textContent = N.lead;
    placeExplain(lead, "net-explain",
      `<svg viewBox="0 0 680 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="控制网和节目网有数据包，Sync 的网线不进交换机">
        <rect width="680" height="230" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#8c9aab">
          <text x="20" y="36" fill="#3ad7c4">控制网 · 1 GbE</text>
          <line x1="150" y1="32" x2="620" y2="32" stroke="#314557"/>
          <rect class="mot lane-pkt" y="26" width="14" height="8" fill="#3ad7c4"/>
          <rect class="mot lane-pkt d2" y="26" width="14" height="8" fill="#3ad7c4"/>
          <text x="20" y="84" fill="#e2a73a">节目网 · 10 GbE</text>
          <line x1="150" y1="80" x2="620" y2="80" stroke="#314557"/>
          <rect class="mot lane-pkt wide" y="74" width="28" height="10" fill="#e2a73a"/>
          <rect class="mot lane-pkt wide d3" y="74" width="28" height="10" fill="#e2a73a"/>
          <text x="20" y="140" fill="#e7eef5">Sync · CAT5</text>
          <line x1="150" y1="136" x2="430" y2="136" stroke="#3ad7c4" stroke-width="2"/>
          <rect x="470" y="112" width="70" height="48" fill="#121922" stroke="#e36b5c"/>
          <path d="M482 124 L528 148 M528 124 L482 148" stroke="#e36b5c"/>
          <text x="552" y="140">交换机</text>
          <text x="20" y="188">16K 序列帧约 40.8 GB/s，走本机 NVMe，不进这三张网。</text>
          <text x="20" y="210">House-sync 另走 75Ω BNC，也不进交换机。</text>
        </g>
      </svg>`,
      "控制网和节目网在走包。Sync 卡的菊花链是一根直连网线，画成断开的交换机表示它不进交换。",
      "<p><strong>三条网，外加一根不许进交换机的线。</strong>心跳、OSC、Art-Net 走控制网；素材和 NDI 走节目网。</p><p>Frame Lock 的 CAT5 物理隔离。16K 无损序列帧留在本地盘。</p>");
    const bwTable = document.getElementById("bw-table");
    if (bwTable) {
      const thead = bwTable.querySelector("thead");
      const tbody = bwTable.querySelector("tbody");
      thead.innerHTML = "<tr><th>项目</th><th>带宽 / 吞吐</th><th>备注</th></tr>";
      tbody.innerHTML = N.bandwidths.map(b =>
        `<tr><td>${b.item}</td><td>${b.bw}</td><td>${b.note}</td></tr>`
      ).join("");
    }
    const vlanTable = document.getElementById("vlan-table");
    if (vlanTable) {
      const thead = vlanTable.querySelector("thead");
      const tbody = vlanTable.querySelector("tbody");
      thead.innerHTML = "<tr><th>VLAN / 物理</th><th>用途</th><th>备注</th></tr>";
      tbody.innerHTML = N.vlanPlan.map(v => {
        const label = v.vlan || v.physical;
        return `<tr><td>${label}</td><td>${v.use}</td><td>${v.note}</td></tr>`;
      }).join("");
    }
  }

  function renderPanel() {
    const P = S.ledPanel;
    if (!P) return;
    const lead = document.getElementById("panel-lead");
    if (lead) lead.textContent = P.lead;
    placeExplain(lead, "panel-explain",
      `<svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="八扫逐行点亮并带快门黑条，对照是整帧保持">
        <rect width="640" height="210" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#8c9aab">
          <text x="36" y="28" fill="#e2a73a">1/8 扫</text>
          <g>
            <rect class="mot scan-row" x="36" y="40" width="220" height="12" fill="#e2a73a"/>
            <rect class="mot scan-row" x="36" y="56" width="220" height="12" fill="#e2a73a"/>
            <rect class="mot scan-row" x="36" y="72" width="220" height="12" fill="#e2a73a"/>
            <rect class="mot scan-row" x="36" y="88" width="220" height="12" fill="#e2a73a"/>
            <rect class="mot scan-row" x="36" y="104" width="220" height="12" fill="#e2a73a"/>
            <rect class="mot scan-row" x="36" y="120" width="220" height="12" fill="#e2a73a"/>
            <rect class="mot scan-row" x="36" y="136" width="220" height="12" fill="#e2a73a"/>
            <rect class="mot scan-row" x="36" y="152" width="220" height="12" fill="#e2a73a"/>
          </g>
          <rect class="mot shutter" x="36" y="40" width="220" height="14" fill="#080b10"/>
          <text x="300" y="28" fill="#3ad7c4">整帧保持</text>
          <rect x="300" y="40" width="220" height="124" fill="#12312d" stroke="#3ad7c4"/>
          <text x="36" y="196">刷新率是 PWM，输入帧率是整帧到达。两者要成整数倍。</text>
        </g>
      </svg>`,
      "左边一行一行点亮，快门会切出一条黑带。右边整帧亮到下一帧替换。",
      "<p><strong>箱体不是显示器终端。</strong>1/8 扫配合摄像机 rolling shutter，会拍到扫描黑条。</p><p>MX40 的低延迟和 Genlock 不能同时开。要低延迟时，帧同步留在 NVIDIA Sync 卡上。</p>");
    const chars = document.getElementById("panel-chars");
    if (chars) {
      chars.innerHTML = P.characteristics.map(c =>
        `<article class="tear"><div class="tear-head"><h3>${c.t}</h3></div><p>${c.d}</p></article>`
      ).join("");
    }
    const cam = document.getElementById("panel-camera");
    if (cam) cam.innerHTML = P.cameraInteraction.map(c => `<p>${c}</p>`).join("");
  }

  function renderPipeline() {
    const C = S.contentPipeline;
    if (!C) return;
    const lead = document.getElementById("pipe-lead");
    if (lead) lead.textContent = C.lead;
    const steps = document.getElementById("pipe-steps");
    if (steps) {
      steps.innerHTML = C.steps.map((s, i) =>
        `<article class="step"><div class="n">STEP ${i + 1}</div><h3>${s.step}</h3><p>${s.detail}</p></article>`
      ).join("");
    }
    const stTable = document.getElementById("storage-table");
    if (stTable) {
      const thead = stTable.querySelector("thead");
      const tbody = stTable.querySelector("tbody");
      thead.innerHTML = "<tr><th>配置</th><th>估算容量</th></tr>";
      tbody.innerHTML = C.storageSizing.map(s =>
        `<tr><td>${s.config}</td><td>${s.size}</td></tr>`
      ).join("");
    }
  }

  function renderFailover() {
    const F = S.failover;
    if (!F) return;
    const lead = document.getElementById("fail-lead");
    if (lead) lead.textContent = F.lead;
    placeExplain(lead, "fail-explain",
      `<svg viewBox="0 0 980 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="五种主备：谁在出画，谁停，环路断在哪">
        <rect width="980" height="200" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="11" fill="#8c9aab">
          <text x="16" y="24" fill="#e7eef5">Understudy</text>
          <rect class="mot us-main" x="16" y="40" width="72" height="36"/>
          <text x="24" y="62" fill="#e7eef5">主</text>
          <rect class="mot us-backup" x="100" y="40" width="72" height="36"/>
          <text x="108" y="62" fill="#e7eef5">备</text>
          <text x="16" y="100">接管丢 1–2 帧</text>
          <text x="210" y="24" fill="#e7eef5">多 Runner</text>
          <rect class="mot lead-die" x="210" y="36" width="64" height="28"/>
          <text x="216" y="54" fill="#e7eef5">控</text>
          <rect class="run-keep" x="210" y="74" width="36" height="28"/>
          <rect class="run-keep" x="252" y="74" width="36" height="28"/>
          <text x="210" y="124">挂了仍在播</text>
          <text x="400" y="24" fill="#e7eef5">Leader</text>
          <rect class="mot lead-die" x="400" y="40" width="64" height="32"/>
          <rect class="mot follow-die" x="476" y="40" width="40" height="32"/>
          <rect class="mot follow-die" x="524" y="40" width="40" height="32"/>
          <text x="400" y="100">挂了全停</text>
          <text x="600" y="24" fill="#e7eef5">国内主备</text>
          <rect class="mot hot-a" x="600" y="40" width="64" height="36"/>
          <rect class="mot hot-b" x="676" y="40" width="64" height="36"/>
          <text x="600" y="100">丢帧未公开</text>
          <text x="790" y="24" fill="#e7eef5">环路</text>
          <rect x="790" y="40" width="150" height="48" fill="none" stroke="#314557"/>
          <path class="mot ring-a" d="M806 52 H924" fill="none" stroke-width="3"/>
          <path class="mot ring-b" d="M806 76 H924" fill="none" stroke-width="3"/>
          <text x="790" y="112">只保发送卡 / 网线</text>
        </g>
      </svg>`,
      "五种模型并排：谁还在出画，控制面断了之后节目还走不走。Understudy 接管时会空出 1–2 帧。",
      "<p><strong>主备比的是恢复时间和控制面单点。</strong>Runner 在 Director 挂后继续播，但新指令下不去。</p><p>Leader 挂则整组停。环路备份不包含播控机本身。</p>");
    const models = document.getElementById("fail-models");
    if (models) {
      models.innerHTML = F.models.map(m =>
        `<article class="layer" style="cursor:default">
          <div class="layer-idx" style="font-size:12px;width:72px">${m.name.split(' ')[0]}</div>
          <div class="layer-body">
            <h3>${m.name}</h3>
            <p><strong>拓扑：</strong>${m.topology}</p>
            <p><strong>切换：</strong>${m.switch}</p>
            <p><strong>一致性：</strong>${m.consistency}</p>
            <p style="color:var(--amber)"><strong>风险：</strong>${m.risk}</p>
          </div>
        </article>`
      ).join("");
    }
    const table = document.getElementById("fail-table");
    if (table) {
      const thead = table.querySelector("thead");
      const tbody = table.querySelector("tbody");
      const cols = ["维度", "disguise", "WATCHOUT", "7thSense", "国内主备", "环路备份"];
      const keys = ["dimension", "understudy", "multiRunner", "leaderFollower", "cnHotStandby", "ringBackup"];
      thead.innerHTML = "<tr>" + cols.map(c => `<th>${c}</th>`).join("") + "</tr>";
      tbody.innerHTML = F.comparison.map(row =>
        "<tr>" + keys.map(k => `<td>${row[k] || "—"}</td>`).join("") + "</tr>"
      ).join("");
    }
  }

  function renderInteractive() {
    const I = S.interactiveContent;
    if (!I) return;
    const lead = document.getElementById("inter-lead");
    if (lead) lead.textContent = I.lead;
    placeExplain(lead, "lat-explain",
      `<svg viewBox="0 0 680 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="XR 延迟从跟踪到箱体，合计 45 到 80 毫秒">
        <rect width="680" height="150" fill="#0d1218"/>
        <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#8c9aab">
          <text x="24" y="28">0</text>
          <text x="560" y="28">80 ms</text>
          <line x1="24" y1="40" x2="600" y2="40" stroke="#314557"/>
          <g>
            <rect class="mot lat-seg" x="24" y="52" width="70" height="22" fill="#3ad7c4"/>
            <rect class="mot lat-seg" x="94" y="52" width="84" height="22" fill="#3ad7c4"/>
            <rect class="mot lat-seg" x="178" y="52" width="56" height="22" fill="#e2a73a"/>
            <rect class="mot lat-seg" x="234" y="52" width="175" height="22" fill="#e2a73a"/>
          </g>
          <text x="24" y="96">跟踪 5–15</text>
          <text x="94" y="96">渲染 8–16</text>
          <text x="178" y="96">VBlank</text>
          <text x="234" y="96">处理器 16–33</text>
          <text x="430" y="96" fill="#e7eef5">合计 45–80 ms</text>
          <text x="24" y="128">Spout 同机，仍走同一条 present barrier。NDI 往往比本机画面晚 1–2 帧。</text>
        </g>
      </svg>`,
      "四段依次点亮，停在摄像机到屏幕 45–80 ms 这一档。",
      "<p><strong>实时画面进链路之后，延迟要单独算。</strong>同机纹理共享小于 1 帧；NDI 还要加上编码和网络。</p><p>引擎帧率和播控输出帧率不一致时，合成会抖。</p>");
    const patterns = document.getElementById("inter-patterns");
    if (patterns) {
      patterns.innerHTML = I.patterns.map(p =>
        `<article class="layer" style="cursor:default">
          <div class="layer-idx" style="font-size:11px">${p.name.split(' ')[0]}</div>
          <div class="layer-body">
            <h3>${p.name}</h3>
            <p>${p.detail}</p>
            <p style="color:var(--amber)"><strong>同步影响：</strong>${p.syncImpact}</p>
          </div>
        </article>`
      ).join("");
    }
    const latTable = document.getElementById("latency-table");
    if (latTable) {
      const thead = latTable.querySelector("thead");
      const tbody = latTable.querySelector("tbody");
      thead.innerHTML = "<tr><th>阶段</th><th>延迟</th></tr>";
      tbody.innerHTML = I.latencyBudget.map(l =>
        `<tr><td>${l.stage}</td><td>${l.ms}</td></tr>`
      ).join("");
    }
  }

  function renderSt2110() {
    const K = S.st2110;
    const host = document.getElementById("st2110");
    if (!K || !host) return;
    const readoutVals = ["0.2 帧", "0.4 帧", "0.3 帧", "0.5 帧"];
    const svg =
      '<svg viewBox="0 0 680 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PTP 全局钟对时后，两路 ST 2110 视频流按同一采样时刻对齐，偏差小于 1 帧">' +
      '<rect width="680" height="210" fill="#0d1218"/>' +
      '<g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#8c9aab">' +
      '<circle cx="58" cy="46" r="22" fill="#121922" stroke="#3ad7c4"/>' +
      '<text x="58" y="51" fill="#3ad7c4" text-anchor="middle" font-size="14">GM</text>' +
      '<text x="20" y="86">PTP Grandmaster（全局钟）</text>' +
      '<line x1="80" y1="46" x2="80" y2="150" stroke="#7fe6d8" stroke-width="1.5" stroke-dasharray="4 4"/>' +
      '<line x1="80" y1="150" x2="640" y2="150" stroke="#314557"/>' +
      '<text x="200" y="146" fill="#7fe6d8">PTP 时间分发（同一钟，亚微秒）</text>' +
      '<text x="20" y="78" fill="#3ad7c4">流 A</text>' +
      '<g><rect y="72" width="18" height="10" fill="#3ad7c4" x="80"/><rect y="72" width="18" height="10" fill="#3ad7c4" x="150"/><rect y="72" width="18" height="10" fill="#3ad7c4" x="220"/><rect y="72" width="18" height="10" fill="#3ad7c4" x="290"/><rect y="72" width="18" height="10" fill="#3ad7c4" x="360"/><rect y="72" width="18" height="10" fill="#3ad7c4" x="430"/><rect y="72" width="18" height="10" fill="#3ad7c4" x="500"/><rect y="72" width="18" height="10" fill="#3ad7c4" x="570"/><rect y="72" width="18" height="10" fill="#3ad7c4" x="640"/>' +
      '<animateTransform attributeName="transform" type="translate" from="0 0" to="-70 0" dur="1.4s" repeatCount="indefinite"/></g>' +
      '<text x="20" y="118" fill="#e2a73a">流 B</text>' +
      '<g><rect y="112" width="18" height="10" fill="#e2a73a" x="80"/><rect y="112" width="18" height="10" fill="#e2a73a" x="150"/><rect y="112" width="18" height="10" fill="#e2a73a" x="220"/><rect y="112" width="18" height="10" fill="#e2a73a" x="290"/><rect y="112" width="18" height="10" fill="#e2a73a" x="360"/><rect y="112" width="18" height="10" fill="#e2a73a" x="430"/><rect y="112" width="18" height="10" fill="#e2a73a" x="500"/><rect y="112" width="18" height="10" fill="#e2a73a" x="570"/><rect y="112" width="18" height="10" fill="#e2a73a" x="640"/>' +
      '<animateTransform attributeName="transform" type="translate" from="0 0" to="-70 0" dur="1.4s" repeatCount="indefinite"/></g>' +
      '<line x1="150" y1="60" x2="150" y2="132" stroke="#e7eef5" stroke-width="1.5">' +
      '<animate attributeName="x1" from="150" to="620" dur="2.8s" repeatCount="indefinite"/>' +
      '<animate attributeName="x2" from="150" to="620" dur="2.8s" repeatCount="indefinite"/></line>' +
      '<text x="150" y="172" fill="#e7eef5">采样线扫过：两路流在采样时刻都正好有包 → 偏差 &lt; 1 帧</text>' +
      '<g>' +
      '<rect x="452" y="12" width="208" height="54" rx="6" fill="#121922" stroke="#3ad7c4"/>' +
      '<circle cx="468" cy="26" r="3" fill="#3ad7c4"><animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/></circle>' +
      '<text x="478" y="30" fill="#8c9aab" font-size="11">对时偏差（实时）</text>' +
      readoutVals.map((v, i) => { const b = (4 - i) % 4; return '<text x="478" y="54" fill="#3ad7c4" font-size="17" font-family="ui-monospace, Menlo, Consolas, monospace">' + v + '<animate attributeName="opacity" values="1;0;0;0" keyTimes="0;0.25;0.5;1" dur="4s" begin="' + (b === 0 ? "0s" : "-" + b + "s") + '" repeatCount="indefinite"/></text>'; }).join("") +
      '</g>' +
      '</g></svg>';
    const parts = K.parts.map(p =>
      `<div class="st-part"><span class="st-code">${p.code}</span><span class="st-name">${p.name}</span><span class="st-note">${p.note}</span></div>`
    ).join("");
    const net = '<table class="plain-table"><thead><tr><th>项</th><th>要求</th><th>备注</th></tr></thead><tbody>' +
      K.network.map(n => `<tr><td>${n.item}</td><td>${n.val}</td><td>${n.note}</td></tr>`).join("") + '</tbody></table>';
    const maxG = 50, x0 = 190, full = 330;
    const bwChart = '<svg viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="带宽量级对比：NDI 0.25、2110-22 浅压缩 1.5、2110-20 无压缩 4K 12、8K 48 Gb/s">' +
      '<rect width="660" height="200" fill="#0d1218"/>' +
      '<g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#8c9aab">' +
      K.bwBars.map((b, i) => {
        const y = 18 + i * 42, w = (b.gbps / maxG) * full;
        return '<text x="16" y="' + (y + 15) + '" fill="#e7eef5">' + b.name + '</text>' +
          '<rect x="' + x0 + '" y="' + y + '" height="20" width="0" rx="4" fill="' + b.fill + '">' +
          '<animate attributeName="width" values="0;' + w + ';' + w + '" keyTimes="0;0.7;1" dur="2.2s" repeatCount="indefinite"/></rect>' +
          '<text x="' + (x0 + w + 8) + '" y="' + (y + 15) + '" fill="#e7eef5">' + b.gbps + ' Gb/s · ' + b.note + '</text>';
      }).join("") +
      '<text x="16" y="190" fill="#5d6b7a">横轴 Gb/s（线性，满刻度 ' + maxG + '）。无压缩是 ST 2110 的默认形态，浅压缩 2110-22 才把带宽压到可 10GbE 跑多路。</text>' +
      '</g></svg>';
    const RD = K.radar, cx = 320, cy = 122, R = 86, ang = i => (-90 + i * 60) * Math.PI / 180;
    const ring = L => RD.map((_, i) => { const a = ang(i), r = (L / 5) * R; return (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1); }).join(" ");
    const axisLine = i => { const a = ang(i); return '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R * Math.cos(a)).toFixed(1) + '" y2="' + (cy + R * Math.sin(a)).toFixed(1) + '" stroke="#314557"/>'; };
    const poly = arr => RD.map((_, i) => { const a = ang(i), r = (arr[i] / 5) * R; return (r * Math.cos(a)).toFixed(1) + "," + (r * Math.sin(a)).toFixed(1); }).join(" ");
    const axisLabel = d => { const i = RD.indexOf(d), a = ang(i), lx = cx + (R + 22) * Math.cos(a), ly = cy + (R + 22) * Math.sin(a);
      const anchor = Math.abs(Math.cos(a)) < 0.3 ? "middle" : (Math.cos(a) > 0 ? "start" : "end");
      return '<text x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" fill="#e7eef5" font-size="12" text-anchor="' + anchor + '">' + d.dim + '</text>'; };
    const radarSvg =
      '<svg viewBox="0 0 640 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ST 2110 与 NDI 六维雷达对比">' +
      '<rect width="640" height="250" fill="#0d1218"/>' +
      [1, 2, 3, 4, 5].map(L => '<polygon points="' + ring(L) + '" fill="none" stroke="#1d2a36"/>').join("") +
      RD.map((_, i) => axisLine(i)).join("") +
      '<g transform="translate(' + cx + ',' + cy + ')">' +
      '<polygon points="' + poly(RD.map(d => d.b)) + '" fill="rgba(226,167,58,0.16)" stroke="#e2a73a" stroke-width="2">' +
      '<animateTransform attributeName="transform" type="scale" from="0 0" to="1 1" dur="1.1s" fill="freeze"/></polygon>' +
      '<polygon points="' + poly(RD.map(d => d.a)) + '" fill="rgba(58,215,196,0.18)" stroke="#3ad7c4" stroke-width="2">' +
      '<animateTransform attributeName="transform" type="scale" from="0 0" to="1 1" dur="1.1s" fill="freeze"/></polygon>' +
      '</g>' +
      RD.map(axisLabel).join("") +
      '</svg>';
    const radarLegend = '<div class="st-legend">' +
      '<span class="st-lg"><i style="background:#3ad7c4"></i>ST 2110</span>' +
      '<span class="st-lg"><i style="background:#e2a73a"></i>NDI</span>' +
      '<span class="st-lg-note">分值 0–5 相对示意。轴提示：' + K.radar.map(d => d.dim + '（' + d.hint + '）').join('；') + '</span>' +
      '</div>';
    host.innerHTML =
      '<div class="enh-block st2110-block">' +
      '<div class="enh-head"><span class="enh-tag">深读</span><h3 class="enh-title">ST 2110 广播级 IP 视频</h3></div>' +
      `<p class="enh-cap">${K.lead}</p>` +
      `<div class="st2110-svg">${svg}</div>` +
      '<h4 class="st-sub">标准族拆解</h4>' +
      `<div class="st2110-parts">${parts}</div>` +
      '<h4 class="st-sub">带宽量级（典型配置，横轴 Gb/s）</h4>' +
      `<div class="st2110-svg">${bwChart}</div>` +
      '<h4 class="st-sub">网络与设备要求</h4>' +
      '<div class="table-wrap">' + net + '</div>' +
      '<h4 class="st-sub">与 NDI 对比（六维雷达）</h4>' +
      `<div class="st2110-svg">${radarSvg}</div>` +
      radarLegend +
      `<p class="callout">${K.whySkip}</p>` +
      `<p class="caption">${K.latency}</p>` +
      '</div>';
  }

  function renderArchDetail() {
    const A = S.archDetail;
    if (!A) return;
    const lead = document.getElementById("arch-det-lead");
    if (lead) lead.textContent = A.lead;
    const modTable = document.getElementById("arch-modules");
    if (modTable) {
      const thead = modTable.querySelector("thead");
      const tbody = modTable.querySelector("tbody");
      thead.innerHTML = "<tr><th>模块</th><th>职责</th><th>线程</th><th>部署</th></tr>";
      tbody.innerHTML = A.modules.map(m =>
        `<tr><td><strong>${m.name}</strong></td><td>${m.role}</td><td>${m.thread}</td><td>${m.deploy}</td></tr>`
      ).join("");
    }
    const thr = document.getElementById("arch-threading");
    if (thr) {
      const T = A.threading;
      thr.innerHTML = `<h3 class="subhead">线程模型</h3><p class="sec-lead">${T.lead}</p>` +
        `<div class="table-wrap"><table class="plain-table"><thead><tr><th>线程</th><th>优先级</th><th>职责</th><th>同步点</th></tr></thead><tbody>` +
        T.threads.map(t => `<tr><td>${t.name}</td><td>${t.priority}</td><td>${t.duty}</td><td>${t.sync}</td></tr>`).join("") +
        `</tbody></table></div>` +
        `<ol class="ltc-steps">${T.notes.map((n,i) => `<li><span class="n">${i+1}</span>${n}</li>`).join("")}</ol>`;
    }
    const gpu = document.getElementById("arch-gpu");
    if (gpu) {
      const G = A.gpuApi;
      gpu.innerHTML = `<h3 class="subhead">GPU API 选型</h3><p class="sec-lead">${G.lead}</p>` +
        `<div class="table-wrap"><table class="plain-table"><thead><tr><th>API</th><th>优势</th><th>劣势</th><th>结论</th></tr></thead><tbody>` +
        G.options.map(o => `<tr><td>${o.api}</td><td>${o.pros}</td><td>${o.cons}</td><td><strong>${o.verdict}</strong></td></tr>`).join("") +
        `</tbody></table></div>`;
    }
    const sync = document.getElementById("arch-sync");
    if (sync) {
      const SY = A.syncImpl;
      sync.innerHTML = `<h3 class="subhead">帧同步实现（硬件路径 / 软件近似）</h3><p class="sec-lead">${SY.lead}</p>` +
        `<div class="problem-grid"><div class="panel"><h3>硬件：Quadro Sync + Swap Barrier</h3><ol>${SY.hwPath.map(s=>`<li>${s}</li>`).join("")}</ol></div>` +
        `<div class="panel"><h3>软件近似（无 Sync 卡）</h3><ol>${SY.swApprox.map(s=>`<li>${s}</li>`).join("")}</ol></div></div>`;
    }
    const jump = document.getElementById("arch-jump");
    if (jump) {
      const J = A.jumpImpl;
      jump.innerHTML = `<h3 class="subhead">跳转状态机</h3><p class="sec-lead">${J.lead}</p>` +
        `<div class="explain"><figure class="explain-fig"><svg viewBox="0 0 920 168" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="跳转状态从空闲走到提交；未齐备则停在中止并保持旧画面">
          <rect width="920" height="168" fill="#0d1218"/>
          <g font-family="Microsoft YaHei UI, PingFang SC, sans-serif" font-size="12" fill="#e7eef5">
            <rect class="mot sm-node sm-on" x="16" y="28" width="110" height="40" fill="#121922" stroke="#3ad7c4"/>
            <text x="48" y="52">IDLE</text>
            <rect class="mot sm-node sm-on sm-d1" x="150" y="28" width="110" height="40" fill="#121922" stroke="#3ad7c4"/>
            <text x="168" y="52">RECEIVED</text>
            <rect class="mot sm-node sm-on sm-d2" x="284" y="28" width="120" height="40" fill="#121922" stroke="#3ad7c4"/>
            <text x="296" y="52">PREFETCH</text>
            <rect class="mot sm-node sm-on sm-d3" x="428" y="28" width="120" height="40" fill="#121922" stroke="#3ad7c4"/>
            <text x="444" y="52">READY</text>
            <rect class="mot sm-node sm-on sm-d4" x="572" y="28" width="120" height="40" fill="#121922" stroke="#e2a73a"/>
            <text x="586" y="52">BARRIER</text>
            <rect class="mot sm-commit" x="716" y="16" width="120" height="36" fill="#121922" stroke="#3ad7c4"/>
            <text x="732" y="38">COMMITTED</text>
            <rect class="mot sm-abort" x="716" y="64" width="120" height="36" fill="#121922" stroke="#e36b5c"/>
            <text x="740" y="86">ABORTED</text>
            <rect class="mot old-hold" x="716" y="112" width="120" height="28" fill="#18222d" stroke="#e2a73a"/>
            <text x="736" y="130" fill="#e2a73a">旧画面</text>
            <path d="M126 48 H150 M260 48 H284 M404 48 H428 M548 48 H572 M692 48 H716" stroke="#314557"/>
          </g>
        </svg><figcaption>节点依次点亮。这一轮如果有机器没就绪，就停在 ABORTED，继续播旧画面。</figcaption></figure>
        <div class="explain-copy"><p><strong>没就绪不切，也不黑屏。</strong>超时大约是 2×GOP 再加 200 ms，然后告警，画面留在上一帧。</p><p>对外仍是跳到时间或跳到 Cue。集群内部带的是目标、生效帧和预取截止。</p></div></div>` +
        `<p class="callout">${J.states.join(" → ")}</p>` +
        `<ol class="ltc-steps">${J.steps.map((s,i)=>`<li><span class="n">${i+1}</span>${s}</li>`).join("")}</ol>` +
        `<p class="caption">${J.timeout}</p>`;
    }
    const proj = document.getElementById("arch-project");
    if (proj) {
      const P = A.projectFormat;
      proj.innerHTML = `<h3 class="subhead">工程文件格式</h3><p class="sec-lead">${P.lead}</p>` +
        `<ul>${P.schema.map(s=>`<li><code>${s}</code></li>`).join("")}</ul>` +
        `<p class="caption">${P.versioning}</p>`;
    }
  }

  function renderScalability() {
    const SC = S.scalability;
    if (!SC) return;
    const root = document.getElementById("arch-scale");
    if (!root) return;
    root.innerHTML = `<p class="sec-lead">${SC.lead}</p>` +
      `<div class="table-wrap"><table class="plain-table"><thead><tr><th>组件</th><th>上限</th><th>解法</th></tr></thead><tbody>` +
      SC.limits.map(l => `<tr><td>${l.item}</td><td>${l.limit}</td><td>${l.workaround}</td></tr>`).join("") +
      `</tbody></table></div>` +
      `<p class="callout">${SC.futurePath}</p>`;
  }

  function renderCommission() {
    const C = S.commissioning;
    if (!C) return;
    const lead = document.getElementById("comm-lead");
    if (lead) lead.textContent = C.lead;
    const steps = document.getElementById("comm-steps");
    if (steps) {
      steps.style.gridTemplateColumns = "repeat(4, 1fr)";
      steps.innerHTML = C.steps.map((s, i) =>
        `<article class="step" style="min-height:auto">
          <div class="n">PHASE ${i + 1}</div>
          <h3>${s.phase}</h3>
          <ul style="margin:8px 0;padding-left:16px;font-size:12px;color:var(--muted)">${s.items.map(it=>`<li>${it}</li>`).join("")}</ul>
          <p style="font-size:12px;color:var(--cyan);margin:0">验证：${s.verify}</p>
        </article>`
      ).join("");
    }
  }

  renderLayers();
  renderSteps();
  renderLineage();
  renderHardware();
  renderWireProtocols();
  renderLtcHandling();
  renderUiGallery();
  renderHops();
  renderTears();
  renderCommands();
  renderScenes();
  renderGeom();
  renderRack();
  renderCodec();
  renderControlHeat();
  renderFilters();
  renderTable();
  renderVendors();
  renderPatents();
  renderOss();
  renderPrinciples();
  renderSources();
  renderAudioSync();
  renderFrameRates();
  renderNetwork();
  renderPanel();
  renderPipeline();
  renderFailover();
  renderInteractive();
  renderSt2110();
  renderArchDetail();
  renderScalability();
  renderCommission();
  applyFilters();
  applyUiArch();
  spyNav();
  initEnhancements();
})();

  /* ============================================================
     视觉增强与新交互组件（UI / 可视化 / 配图 / 小动画）
     ============================================================ */
  function initEnhancements() {
    initProgressBar();
    initHeroWall();
    initNavMeta();
    initSyncLab();
    initBwCalc();
    initPixelBudget();
    initSphereFigure();
    initSeamGallery();
    initReveal();
  }

  /* 顶部阅读进度条 + 回到顶部 + 滚动提示 */
  function initProgressBar() {
    const bar = document.getElementById("page-progress");
    const top = document.getElementById("to-top");
    const cue = document.getElementById("scroll-cue");
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (bar) bar.querySelector("i").style.setProperty("--p", p.toFixed(4));
      if (top) top.hidden = h.scrollTop < 600;
      if (cue) cue.style.opacity = h.scrollTop > 60 ? "0" : "";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (top) top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* Hero 动态 LED 墙 */
  function initHeroWall() {
    const wall = document.getElementById("hero-wall");
    if (!wall) return;
    const cols = 36, rows = 12, total = cols * rows;
    let html = "";
    for (let i = 0; i < total; i++) {
      const d = (Math.random() * 4).toFixed(2);
      const dur = (2.6 + Math.random() * 3).toFixed(2);
      html += '<i style="--d:' + d + 's;--dur:' + dur + 's"></i>';
    }
    wall.style.setProperty("--cols", cols);
    wall.innerHTML = html;
  }

  /* 导航阅读刻度 */
  function initNavMeta() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const meta = document.createElement("div");
    meta.className = "nav-meta";
    meta.innerHTML = '<span class="nav-meta-bar"><i></i></span>' +
      '<span class="nav-meta-pct">0%</span><span class="nav-meta-sec">问题定义</span>';
    const legend = nav.querySelector(".legend");
    nav.insertBefore(meta, legend);
    const pct = meta.querySelector(".nav-meta-pct");
    const sec = meta.querySelector(".nav-meta-sec");
    const fill = meta.querySelector(".nav-meta-bar i");
    function onScroll() {
      const h = document.documentElement;
      const p = h.scrollHeight - h.clientHeight > 0 ? h.scrollTop / (h.scrollHeight - h.clientHeight) : 0;
      pct.textContent = Math.round(p * 100) + "%";
      fill.style.width = (p * 100) + "%";
      let cur = null;
      nav.querySelectorAll(".watch").forEach((a) => {
        const el = document.getElementById(a.getAttribute("href").slice(1));
        if (el && el.getBoundingClientRect().top <= 120) cur = a;
      });
      sec.textContent = cur ? cur.querySelector("span:last-child").textContent : "问题定义";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* 统计数字滚动 + 滚动入场 */
  function countUp(el) {
    const target = +el.dataset.count;
    const dur = 1200, t0 = performance.now();
    function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function initReveal() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll(".stat .n[data-count]").forEach((el, i) => {
      if (reduce) { el.textContent = el.dataset.count; return; }
      setTimeout(() => countUp(el), 350 + i * 120);
    });
    if (reduce) return;
    document.documentElement.classList.add("js-reveal");
    const targets = document.querySelectorAll([
      "section > .sec-head", "section > .sec-lead", "section > .subhead",
      "section > .caption", "section > p", ".table-wrap",
      ".steps", ".wire-proto", ".filters", ".enh-block"
    ].join(","));
    targets.forEach((t) => t.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach((t) => io.observe(t));
  }

  /* §02 四层自检台 */
  function syncLabSet(layer, on) {
    const lab = document.getElementById("sync-lab");
    if (!lab) return;
    const map = { wallClock: "l1", frameId: "l2", phaseLock: "l3", clockSync: "l4" };
    const k = map[layer];
    if (!k) return;
    lab.classList.toggle("on-" + k, on);
    const btn = lab.querySelector('.sl-sw[data-layer="' + layer + '"]');
    if (btn) btn.classList.toggle("is-on", on);
    renderSyncLab();
  }
  function renderSyncLab() {
    const lab = document.getElementById("sync-lab");
    if (!lab) return;
    const s = {
      l1: lab.classList.contains("on-l1"),
      l2: lab.classList.contains("on-l2"),
      l3: lab.classList.contains("on-l3"),
      l4: lab.classList.contains("on-l4")
    };
    let msg;
    if (!s.l1) msg = "L1 关：两台机器的节目进度已经不同，先错的是内容。上层再整齐也救不回。";
    else if (!s.l2) msg = "L1 在、L2 关：节目进度一致，但接缝两侧帧号差一帧 → 整帧错位。";
    else if (!s.l3) msg = "帧号一致，但两台机器扫描相位差一个亚帧。LED 处理器已 genlock，接缝只剩一条细缝。";
    else msg = "L1 + L2 + L3 齐：帧号与扫出相位都对齐，整面墙同一拍，无撕缝。";
    if (s.l4) msg += " L4 只在 IP 输出（ST 2110 / PTP）时才需要；DP/HDMI 点对点第一版用不到。";
    const out = document.getElementById("sl-status");
    if (out) out.textContent = msg;
  }
  function initSyncLab() {
    const host = document.querySelector("#stack .explain");
    if (!host) return;
    const defs = '<defs><clipPath id="labCap"><rect x="0" y="0" width="154" height="120" rx="4"/></clipPath>' +
      '<pattern id="labPat" width="38" height="120" patternUnits="userSpaceOnUse">' +
      '<rect width="38" height="120" fill="#0c1a22"/><rect x="0" width="14" height="120" fill="#11323c"/>' +
      '<rect x="20" width="9" height="120" fill="#1b4a57"/></pattern></defs>';
    const nodeA = '<g class="sl-node-a" transform="translate(24,64)">' +
      '<rect class="sl-cab" width="154" height="120" rx="6"/>' +
      '<g clip-path="url(#labCap)"><g class="lab-stripes"><rect width="308" height="120" fill="url(#labPat)"/></g></g>' +
      '<line class="sl-scan" x1="0" y1="0" x2="154" y2="0"/>' +
      '<text class="sl-chip" x="8" y="16">#1042</text></g>';
    const nodeB = '<g class="sl-node-b" transform="translate(372,64)">' +
      '<rect class="sl-cab" width="154" height="120" rx="6"/>' +
      '<g clip-path="url(#labCap)"><g class="lab-stripes"><rect width="308" height="120" fill="url(#labPat)"/></g></g>' +
      '<line class="sl-scan" x1="0" y1="0" x2="154" y2="0"/>' +
      '<text class="sl-chip sl-fr-on" x="8" y="16">#1042</text>' +
      '<text class="sl-chip sl-fr-off" x="8" y="16">#1043</text></g>';
    const seams =
      '<g class="sl-seam sl-seam-1"><rect x="332" y="64" width="40" height="120" fill="rgba(227,107,92,0.22)"/>' +
      '<path d="M352 84 L344 96 L360 96 Z" fill="#e36b5c"/><path d="M352 116 L344 104 L360 104 Z" fill="#e36b5c"/>' +
      '<text class="sl-seam-label" x="352" y="202" fill="#e36b5c" text-anchor="middle">节目进度不同</text></g>' +
      '<g class="sl-seam sl-seam-2"><rect x="346" y="64" width="12" height="120" fill="#e36b5c" opacity="0.5"/>' +
      '<text class="sl-seam-label" x="352" y="202" fill="#e36b5c" text-anchor="middle">整帧错位</text></g>' +
      '<g class="sl-seam sl-seam-3"><line x1="352" y1="64" x2="352" y2="184" stroke="#e2a73a" stroke-width="2" stroke-dasharray="3 3"/>' +
      '<text class="sl-seam-label" x="352" y="202" fill="#e2a73a" text-anchor="middle">亚帧相位缝</text></g>' +
      '<g class="sl-seam sl-seam-4"><rect x="346" y="64" width="12" height="120" fill="#3ad7c4" opacity="0.28"/>' +
      '<text class="sl-seam-label" x="352" y="202" fill="#3ad7c4" text-anchor="middle">同一拍 ✓</text></g>';
    const l4 = '<g class="sl-l4"><line x1="190" y1="40" x2="332" y2="40" stroke="#7fe6d8" stroke-width="1.5" stroke-dasharray="4 4"/>' +
      '<circle cx="190" cy="40" r="3" fill="#3ad7c4"><animate attributeName="cx" from="190" to="332" dur="1.4s" repeatCount="indefinite"/></circle>' +
      '<line x1="372" y1="40" x2="560" y2="40" stroke="#7fe6d8" stroke-width="1.5" stroke-dasharray="4 4"/>' +
      '<circle cx="372" cy="40" r="3" fill="#3ad7c4"><animate attributeName="cx" from="372" to="560" dur="1.4s" repeatCount="indefinite"/></circle>' +
      '<text class="sl-seam-label" x="376" y="34" fill="#7fe6d8">PTP / ST 2110</text></g>';
    const fig = document.createElement("figure");
    fig.className = "enh-block synclab on-l1 on-l2 on-l3";
    fig.id = "sync-lab";
    fig.innerHTML =
      '<div class="enh-head"><span class="enh-tag">交互</span><h3 class="enh-title">四层自检台</h3></div>' +
      '<p class="enh-cap">逐层打开 / 关闭下面的开关，看接缝如何变化。点 §02 中的「层卡」也会联动这里的开关。</p>' +
      '<div class="sl-switches" role="group" aria-label="同步层开关">' +
      '<button type="button" class="sl-sw is-on" data-layer="wallClock"><b>L1</b> 时间对齐</button>' +
      '<button type="button" class="sl-sw is-on" data-layer="frameId"><b>L2</b> 帧身份</button>' +
      '<button type="button" class="sl-sw is-on" data-layer="phaseLock"><b>L3</b> 扫出相位</button>' +
      '<button type="button" class="sl-sw" data-layer="clockSync"><b>L4</b> 传输时钟</button>' +
      '</div>' +
      '<div class="sl-stage"><svg viewBox="0 0 720 300" role="img" aria-label="两节点 LED 墙接缝自检示意图">' +
      defs + nodeA + nodeB + seams + l4 +
      '<text class="sl-chip" x="24" y="52" fill="#8c9aab">节点 A</text>' +
      '<text class="sl-chip" x="372" y="52" fill="#8c9aab">节点 B</text>' +
      '</svg></div>' +
      '<p class="sl-status" id="sl-status"></p>';
    host.insertAdjacentElement("afterend", fig);
    fig.querySelectorAll(".sl-sw").forEach((btn) => {
      btn.addEventListener("click", () => {
        const L = btn.dataset.layer;
        const map = { wallClock: "l1", frameId: "l2", phaseLock: "l3", clockSync: "l4" };
        const k = map[L];
        const on = !fig.classList.contains("on-" + k);
        fig.classList.toggle("on-" + k, on);
        btn.classList.toggle("is-on", on);
        renderSyncLab();
      });
    });
    renderSyncLab();
  }

  /* §09 未压缩带宽计算器 */
  function initBwCalc() {
    const host = document.querySelector("#network .explain");
    if (!host) return;
    const reses = [
      { l: "1080p", w: 1920, h: 1080 },
      { l: "4K", w: 3840, h: 2160 },
      { l: "8K", w: 7680, h: 4320 },
      { l: "16K (15360×8640)", w: 15360, h: 8640 },
      { l: "16K (16384×9216)", w: 16384, h: 9216 }
    ];
    const bits = [8, 10, 12];
    const chromas = [{ l: "4:4:4", k: "444" }, { l: "4:2:2", k: "422" }, { l: "4:2:0", k: "420" }];
    const fpss = [24, 25, 30, 50, 60, 120];
    const refs = [
      { n: "10 GbE", g: 10 }, { n: "12G-SDI", g: 11.88 }, { n: "25 GbE", g: 25 },
      { n: "DisplayPort 1.4 (HBR3)", g: 25.92 }, { n: "HDMI 2.1 (FRL)", g: 48 },
      { n: "NVMe Gen4 ×4", g: 56 }, { n: "100 GbE", g: 100 }, { n: "PCIe 4.0 ×16", g: 256 }
    ];
    const bppMap = {
      "444": { 8: 24, 10: 30, 12: 36 },
      "422": { 8: 16, 10: 20, 12: 24 },
      "420": { 8: 12, 10: 15, 12: 18 }
    };
    const state = { res: reses[4], bit: 12, chroma: "444", fps: 60 };
    const colLabel = { res: "分辨率", bit: "色深", chroma: "采样", fps: "帧率" };
    function optCol(k, items) {
      return '<div class="bc-col"><span class="bc-key">' + colLabel[k] + '</span><div class="bc-opts" data-k="' + k + '">' +
        items.map((it) => '<button type="button" class="bc-opt" data-v="' + it.v + '">' + it.t + '</button>').join("") +
        '</div></div>';
    }
    const fig = document.createElement("figure");
    fig.className = "enh-block bwcalc";
    fig.id = "bw-calc";
    fig.innerHTML =
      '<div class="enh-head"><span class="enh-tag">交互</span><h3 class="enh-title">未压缩带宽计算器</h3></div>' +
      '<p class="enh-cap">按像素格式估算「裸流」带宽——不含封装、也不含 HAP / NotchLC 帧内压缩（见表格）。点一遍选项，看单路接口够不够。</p>' +
      '<div class="bc-grid">' +
      optCol("res", reses.map((r) => ({ v: r.l, t: r.l }))) +
      optCol("bit", bits.map((b) => ({ v: b, t: b + " bit" }))) +
      optCol("chroma", chromas.map((c) => ({ v: c.k, t: c.l }))) +
      optCol("fps", fpss.map((f) => ({ v: f, t: f + " fps" }))) +
      '</div>' +
      '<div class="bc-out"><div class="bc-readout"><b id="bc-value">--</b><span>Gbit/s</span><em id="bc-bytes"></em></div>' +
      '<div class="bc-formula" id="bc-formula"></div><div class="bc-bars" id="bc-bars"></div>' +
      '<p class="bc-note" id="bc-note"></p></div>';
    host.insertAdjacentElement("afterend", fig);
    fig.querySelector('[data-k="res"]').lastElementChild.classList.add("is-on");
    fig.querySelectorAll('[data-k="bit"] .bc-opt').forEach((b) => { if (+b.dataset.v === state.bit) b.classList.add("is-on"); });
    fig.querySelector('[data-k="chroma"]').firstElementChild.classList.add("is-on");
    fig.querySelectorAll('[data-k="fps"] .bc-opt').forEach((b) => { if (+b.dataset.v === state.fps) b.classList.add("is-on"); });
    fig.querySelectorAll(".bc-opt").forEach((b) => {
      b.addEventListener("click", () => {
        const k = b.parentElement.dataset.k;
        b.parentElement.querySelectorAll(".bc-opt").forEach((x) => x.classList.remove("is-on"));
        b.classList.add("is-on");
        if (k === "res") state.res = reses.find((r) => r.l === b.dataset.v);
        else if (k === "bit") state.bit = +b.dataset.v;
        else if (k === "chroma") state.chroma = b.dataset.v;
        else if (k === "fps") state.fps = +b.dataset.v;
        compute();
      });
    });
    function compute() {
      const px = state.res.w * state.res.h;
      const bpp = bppMap[state.chroma][state.bit];
      const gbps = px * bpp * state.fps / 1e9;
      const gbs = gbps / 8;
      fig.querySelector("#bc-value").textContent = gbps >= 100 ? gbps.toFixed(0) : gbps.toFixed(1);
      fig.querySelector("#bc-bytes").textContent = "· " + gbs.toFixed(1) + " GB/s";
      fig.querySelector("#bc-formula").textContent =
        state.res.w + "×" + state.res.h + " × " + bpp + "bit × " + state.fps + "fps = " +
        (gbps >= 100 ? gbps.toFixed(0) : gbps.toFixed(1)) + " Gbit/s";
      fig.querySelector("#bc-bars").innerHTML = refs.map((r) => {
        const scale = Math.max(gbps, r.g);
        const fill = Math.min(100, gbps / scale * 100);
        const tick = r.g / scale * 100;
        const ok = gbps <= r.g;
        const need = ok ? "✓ 单路可" : "需 " + Math.ceil(gbps / r.g) + " 路";
        return '<div class="bc-row"><div class="bc-name">' + r.n + '</div>' +
          '<div class="bc-rail"><i class="' + (ok ? "" : "over") + '" style="width:' + fill.toFixed(1) + '%"></i>' +
          '<span class="bc-tick" style="left:' + tick.toFixed(1) + '%"></span></div>' +
          '<div class="bc-verdict ' + (ok ? "ok" : "no") + '">' + need + '</div></div>';
      }).join("");
      let note = "10 分钟连续播放约 " + (gbs * 600 / 1000).toFixed(1) + " TB（未压缩、不含封装）。";
      if (Math.abs(gbs - 40.8) < 1.2) note += " 这一条与第 09 章表格里的 <b>40.8 GB/s</b>（16K DPX 12bit）对上了。";
      fig.querySelector("#bc-note").innerHTML = note;
    }
    compute();
  }

  /* §01 像素预算配图 */
  function initPixelBudget() {
    const host = document.querySelector("#problem .problem-grid");
    if (!host) return;
    const rows = [
      { l: "1080p · 1920×1080", px: 1920 * 1080 },
      { l: "4K · 3840×2160", px: 3840 * 2160 },
      { l: "8K · 7680×4320", px: 7680 * 4320 },
      { l: "16K · 16384×9216", px: 16384 * 9216 }
    ];
    const maxPx = rows[rows.length - 1].px;
    const W = 560, rowH = 40, gap = 14, x0 = 150, top = 8;
    const H = top + rows.length * (rowH + gap);
    let bars = "";
    rows.forEach((r, i) => {
      const w = Math.sqrt(r.px / maxPx) * (W - x0);
      const y = top + i * (rowH + gap);
      bars += '<g class="pb-row">' +
        '<text x="4" y="' + (y + rowH / 2 + 4) + '" font-size="12" font-family="monospace" fill="#8c9aab">' + r.l + '</text>' +
        '<rect x="' + x0 + '" y="' + y + '" width="' + (W - x0) + '" height="' + rowH + '" rx="6" fill="#0e1820" stroke="#243140"/>' +
        '<rect class="pb-bar" x="' + x0 + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + rowH + '" rx="6" fill="url(#pbGrad)"/>' +
        '<text x="' + (x0 + Math.max(w + 8, 6)).toFixed(1) + '" y="' + (y + rowH / 2 + 4) + '" font-size="12" font-family="monospace" fill="#e7eef5">' + (r.px / 1e6).toFixed(1) + 'M px</text></g>';
    });
    const markerX = x0 + Math.sqrt(7680 * 4320 / maxPx) * (W - x0);
    const svg = '<svg class="enh-fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="像素预算对比">' +
      '<defs><linearGradient id="pbGrad" x1="0" x2="1"><stop offset="0" stop-color="#2aa997"/><stop offset="1" stop-color="#3ad7c4"/></linearGradient></defs>' +
      bars +
      '<line class="pb-marker" x1="' + markerX.toFixed(1) + '" y1="' + (top - 4) + '" x2="' + markerX.toFixed(1) + '" y2="' + (H - 4) + '"/>' +
      '<text x="' + (markerX + 6).toFixed(1) + '" y="' + (H - 2) + '" font-size="11" font-family="monospace" fill="#e2a73a">单卡 4×DP1.4 ≈ 一张 8K 屏</text>' +
      '</svg>';
    const fig = document.createElement("figure");
    fig.className = "explain";
    fig.innerHTML = svg +
      '<figcaption>条形为平方根刻度，便于同时看到 1080p 与 16K。一台工作站 4 路 DP 的像素预算约 33M px——刚好一张 8K 屏；16K 屏约 151M px，需要约 18 路 4K 口 ≈ 4–5 张显卡 + Mosaic，这就是「多机切片」的来由。</figcaption>';
    host.insertAdjacentElement("afterend", fig);
  }

  /* §05 球面屏 UV 展开配图 */
  function initSphereFigure() {
    const host = document.querySelector("#mapping .explain");
    if (!host) return;
    const svg = '<svg class="enh-fig" viewBox="0 0 760 200" role="img" aria-label="球面屏 UV 展开与切片示意">' +
      '<g transform="translate(70,100)">' +
      '<circle r="60" fill="none" stroke="#314557"/>' +
      '<ellipse rx="60" ry="22" fill="none" stroke="#243140"/><ellipse rx="60" ry="44" fill="none" stroke="#243140"/>' +
      '<ellipse rx="22" ry="60" fill="none" stroke="#243140"/><ellipse rx="44" ry="60" fill="none" stroke="#243140"/>' +
      '<line x1="-60" y1="0" x2="60" y2="0" stroke="#243140"/><line x1="0" y1="-60" x2="0" y2="60" stroke="#243140"/>' +
      '<text y="84" text-anchor="middle" font-size="11" font-family="monospace" fill="#8c9aab">球形屏 · 经纬模组</text></g>' +
      '<path d="M150 100 h40" stroke="#3ad7c4" stroke-width="2" marker-end="url(#spAr)"/>' +
      '<g transform="translate(210,40)">' +
      '<path d="M0 20 L120 0 L120 120 L0 100 Z" fill="none" stroke="#3ad7c4" stroke-width="1.5"/>' +
      '<path d="M0 40 L120 24 M0 60 L120 48 M0 80 L120 72" stroke="#243140"/>' +
      '<path d="M30 14 L30 104 M60 8 L60 108 M90 4 L90 112" stroke="#243140"/>' +
      '<text y="138" text-anchor="middle" font-size="11" font-family="monospace" fill="#8c9aab">UV 展开 · 越靠两极越挤</text></g>' +
      '<path d="M350 100 h36" stroke="#3ad7c4" stroke-width="2" marker-end="url(#spAr)"/>' +
      '<g transform="translate(400,40)">' +
      '<rect x="0" y="0" width="100" height="118" rx="6" fill="#0e1820" stroke="#314557"/>' +
      '<line x1="33" y1="0" x2="33" y2="118" stroke="#243140"/><line x1="66" y1="0" x2="66" y2="118" stroke="#243140"/>' +
      '<text y="138" text-anchor="middle" font-size="11" font-family="monospace" fill="#8c9aab">切片 1 / 2 / 3 → 发送卡</text></g>' +
      '<defs><marker id="spAr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#3ad7c4"/></marker></defs>' +
      '</svg>';
    const fig = document.createElement("figure");
    fig.className = "explain";
    fig.innerHTML = svg +
      '<figcaption>球形屏不是矩形裁切：每颗灯珠是一个像素，沿纬线 / 经线排布，整球分成顶 / 底 / 侧面，再用非线性映射把像素坐标转到经纬度，才得到「整张 0–1 的 UV」。这一步没有 UV，屏就只剩一张永远采不到的虚拟像素表（见 §06 曲面几何）。</figcaption>' +
      '<p class="sphere-link">相关专利：<a href="https://www.xjishu.com/zhuanli/55/202510892636.html" target="_blank" rel="noopener">三思 LED 球形屏坐标生成（CN 申请 202510892636）</a> · <a href="https://eureka.patsnap.com/patent-CN113077729A" target="_blank" rel="noopener">CN113077729A 每颗灯珠沿经纬铺满球面</a></p>';
    host.insertAdjacentElement("afterend", fig);
  }

  /* §13 四种「缝」形态画廊 */
  function initSeamGallery() {
    const host = document.getElementById("tear-list");
    if (!host) return;
    const cards = [
      { id: "frame", h: "整帧错位", d: "相邻箱体帧号差一帧，内容整体错开一条。", tag: "L2 帧身份", tears: ["ntp-only", "genlock-no-id"] },
      { id: "sub", h: "亚帧相位缝", d: "帧号一致，但扫出相位差一个亚帧，留下一条细缝。", tag: "L3 扫出相位", tears: ["proc-free", "mosaic-edid", "director-out"] },
      { id: "geo", h: "几何错位", d: "UV / 观察点 / 切片对不上，内容在曲面上扭。", tag: "§06 几何", tears: [] },
      { id: "drift", h: "缓存 / 黑帧漂移", d: "seek 没换上、长 GOP 抖、时间码漂，画面旧一帧或黑。", tag: "§13 内容", tears: ["seek-prefetch", "ltc-glitch"] }
    ];
    const svgFor = {
      frame: '<svg viewBox="0 0 200 90"><rect x="4" y="4" width="92" height="82" fill="#0e1820" stroke="#3ad7c4"/><rect x="104" y="4" width="92" height="82" fill="#0e1820" stroke="#e36b5c"/><rect x="104" y="20" width="92" height="20" fill="#e36b5c" opacity="0.25"/><line x1="100" y1="4" x2="100" y2="86" stroke="#e36b5c" stroke-width="2"/></svg>',
      sub: '<svg viewBox="0 0 200 90"><rect x="4" y="4" width="192" height="82" fill="#0e1820" stroke="#3ad7c4"/><line x1="4" y1="30" x2="196" y2="30" stroke="#3ad7c4" stroke-width="2" opacity="0.5"/><line x1="4" y1="60" x2="196" y2="62" stroke="#e2a73a" stroke-width="2" stroke-dasharray="3 3"/></svg>',
      geo: '<svg viewBox="0 0 200 90"><path d="M4 70 Q100 4 196 70" fill="none" stroke="#3ad7c4" stroke-width="2"/><path d="M4 70 Q100 24 196 70" fill="none" stroke="#e2a73a" stroke-width="2" stroke-dasharray="4 3"/></svg>',
      drift: '<svg viewBox="0 0 200 90"><rect x="4" y="4" width="192" height="82" fill="#0e1820" stroke="#3ad7c4"/><rect x="4" y="40" width="192" height="14" fill="#e36b5c" opacity="0.3"/><text x="100" y="50" text-anchor="middle" font-size="10" fill="#e36b5c" font-family="monospace">OLD / BLACK</text></svg>'
    };
    const fig = document.createElement("figure");
    fig.className = "enh-block";
    fig.innerHTML = '<div class="enh-head"><span class="enh-tag">对照</span><h3 class="enh-title">四种「缝」长什么样</h3></div>' +
      '<p class="enh-cap">点一张卡，下方「撕缝」清单里的对应故障会被高亮。几何错位见 §06。</p>' +
      '<div class="seam-gallery">' + cards.map((c) =>
        '<div class="seam-card" data-id="' + c.id + '" data-tears="' + c.tears.join(",") + '" role="button" tabindex="0">' +
        svgFor[c.id] + '<h4>' + c.h + '</h4><p>' + c.d + '</p><span class="seam-tag">' + c.tag + '</span></div>'
      ).join("") + '</div>';
    host.insertAdjacentElement("beforebegin", fig);
    fig.querySelectorAll(".seam-card").forEach((card) => {
      const toggle = () => {
        const active = card.classList.toggle("seam-active");
        const ids = card.dataset.tears ? card.dataset.tears.split(",") : [];
        ids.forEach((tid) => {
          const t = document.querySelector('.tear[data-tear="' + tid + '"]');
          if (t) t.classList.toggle("seam-hit", active);
        });
      };
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    });
  }
