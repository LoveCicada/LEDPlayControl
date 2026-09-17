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
      tr.addEventListener("click", () => {
        const card = document.getElementById("card-" + v.id);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
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

  function openLightbox(shot) {
    const box = document.getElementById("ui-lightbox");
    if (!box || !shot || !shot.file) return;
    const img = box.querySelector("img");
    const cap = box.querySelector("figcaption");
    img.src = shot.file;
    img.alt = shot.product + " 主界面";
    cap.innerHTML =
      `${shot.product} · ${archLabel[shot.arch] || shot.arch}` +
      ` · ${(shot.zones || []).join(" / ")}` +
      `<br>截自公开手册/帮助文档，版权归原厂商，仅作对照。` +
      ` <a href="${shot.sourceUrl}" target="_blank" rel="noopener">${shot.sourceTitle}</a>`;
    box.hidden = false;
  }

  function closeLightbox() {
    const box = document.getElementById("ui-lightbox");
    if (box) box.hidden = true;
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
    }
  }

  function applyFilters() {
    document.querySelectorAll("#heat-table tbody tr").forEach((tr) => {
      const regionOk = state.region === "all" || tr.dataset.region === state.region;
      const depthOk = state.depth === "all" || tr.dataset.depth === state.depth;
      const layerOk = !activeLayer || (tr.dataset.layers || "").split(",").includes(activeLayer);
      tr.classList.toggle("dim", !(regionOk && depthOk && layerOk));
    });
    document.querySelectorAll(".card").forEach((card) => {
      const regionOk = state.region === "all" || card.dataset.region === state.region;
      const depthOk = state.depth === "all" || card.dataset.depth === state.depth;
      const layerOk = !activeLayer || (card.dataset.layers || "").split(",").includes(activeLayer);
      card.style.display = regionOk && depthOk && layerOk ? "" : "none";
    });
  }

  function renderVendors() {
    const root = document.getElementById("vendor-cards");
    S.vendors.forEach((v) => {
      const src = (v.sources || []).map((s) => `<a href="${s.u}" target="_blank" rel="noopener">${s.t}</a>`).join("");
      const shot = firstShotFor(v.id);
      const card = el("article", {
        class: "card " + v.depth,
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
            <span class="badge">${v.depth === "deep" ? "深潜" : "对照"}</span>
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
    S.patents.forEach((p) => {
      root.appendChild(el("article", { class: "patent" },
        `<div>
           <div class="track">${trackName[p.track]} · ${p.grade}</div>
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
    [
      { t: "NVIDIA Quadro Sync II User Guide", u: "https://images.nvidia.com/content/quadro/product-literature/user-guides/Quadro-Sync-II-User-Guide-v07.pdf" },
      { t: "WATCHOUT ST 2110 / PTP", u: "https://docs.dataton.com/guide/watchout/network-setup/st-2110-video-over-ip.html" }
    ].forEach((s) => { if (!seen.has(s.u)) list.push(s); });
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
  renderUiGallery();
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
