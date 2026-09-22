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
    return null;
  }

  function clearHighlightSources(keep) {
    if (keep !== "hop") activeHop = null;
    if (keep !== "tear") activeTear = null;
    if (keep !== "scene") activeScene = null;
    if (keep !== "geom") activeGeom = null;
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

  function applyFilters() {
    const hits = highlightIds();
    document.querySelectorAll("#heat-table tbody tr, #rack-table tbody tr, #codec-table tbody tr, #control-table tbody tr, #geom-table tbody tr").forEach((tr) => {
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

  renderLayers();
  renderSteps();
  renderLineage();
  renderHardware();
  renderWireProtocols();
  renderLtcHandling();
  renderUiGallery();
  renderHops();
  renderTears();
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
  applyFilters();
  applyUiArch();
  spyNav();
})();
