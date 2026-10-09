(function () {
  var FALLBACK = 7000;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = document.getElementById("stage");
  var scenes = Array.prototype.slice.call(document.querySelectorAll(".scene"));
  var nav = document.getElementById("scene-nav");
  var playBtn = document.getElementById("play");
  var meter = document.getElementById("meter");
  var clock = document.getElementById("clock");
  var live = document.getElementById("live");
  var audio = new Audio();
  var index = 0;
  var playing = !reduce;
  var ended = false;
  var fallback = false;
  var remain = FALLBACK;
  var started = 0;
  var timer = 0;
  var rafOn = false;
  var gen = 0;
  var ignoreEnded = false;

  audio.preload = "auto";

  scenes.forEach(function (scene, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = (i < 9 ? "0" : "") + (i + 1) + "  " + scene.getAttribute("data-title");
    btn.addEventListener("click", function () { go(i); });
    nav.appendChild(btn);
  });

  function srcFor(i) {
    return "audio/" + (i < 9 ? "0" : "") + (i + 1) + ".wav";
  }

  function paint() {
    scenes.forEach(function (scene, i) {
      var on = i === index;
      scene.classList.toggle("is-on", on);
      if (!on) scene.classList.remove("is-playing");
    });
    Array.prototype.forEach.call(nav.children, function (btn, i) {
      var on = i === index;
      btn.classList.toggle("on", on);
      if (on) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
    stage.classList.toggle("is-paused", !playing);
    playBtn.textContent = playing ? "暂停" : "播放";
    playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    clock.textContent = (index + 1) + " / " + scenes.length;
    var cap = scenes[index].querySelector(".caption");
    live.textContent = scenes[index].getAttribute("data-title") + "。" + (cap ? cap.textContent : "");
  }

  function kick() {
    var scene = scenes[index];
    scene.classList.remove("is-playing");
    void scene.offsetWidth;
    if (!reduce && playing) scene.classList.add("is-playing");
  }

  function clipFraction() {
    if (!fallback) {
      var dur = audio.duration;
      if (dur && isFinite(dur) && dur > 0) return Math.min(1, audio.currentTime / dur);
      return 0;
    }
    if (!playing) return 1 - remain / FALLBACK;
    return Math.min(1, (FALLBACK - remain + (performance.now() - started)) / FALLBACK);
  }

  function drawMeter() {
    var f = ended ? 1 : (index + clipFraction()) / scenes.length;
    meter.style.width = (Math.max(0, Math.min(1, f)) * 100).toFixed(2) + "%";
  }

  function tick() {
    if (rafOn) return;
    rafOn = true;
    var step = function () {
      drawMeter();
      if (playing) requestAnimationFrame(step);
      else rafOn = false;
    };
    requestAnimationFrame(step);
  }

  function arm() {
    clearTimeout(timer);
    if (!playing || !fallback) return;
    started = performance.now();
    timer = setTimeout(advance, remain);
  }

  function holdForGesture() {
    playing = false;
    ignoreEnded = true;
    audio.pause();
    clearTimeout(timer);
    paint();
    drawMeter();
  }

  function useFallback() {
    if (fallback) return;
    fallback = true;
    ignoreEnded = true;
    audio.pause();
    remain = FALLBACK;
    if (playing) {
      kick();
      arm();
      tick();
    } else {
      drawMeter();
    }
  }

  function loadClip(restart) {
    var mine = ++gen;
    clearTimeout(timer);
    var same = audio.getAttribute("data-scene") === String(index) && !!audio.src;
    if (restart || !same) {
      ignoreEnded = true;
      fallback = false;
      audio.pause();
      if (!same) {
        audio.src = srcFor(index);
        audio.setAttribute("data-scene", String(index));
      }
      var reset = function () {
        if (mine !== gen || audio.currentTime > 0.3) return;
        try { audio.currentTime = 0; } catch (err) { /* metadata not ready yet */ }
      };
      if (audio.readyState >= 1) reset();
      else audio.addEventListener("loadedmetadata", reset, { once: true });
    }
    if (!playing) {
      drawMeter();
      return;
    }
    var promise = audio.play();
    if (promise && promise.then) {
      promise.then(function () {
        if (mine !== gen || !playing) return;
        ignoreEnded = false;
        if (!scenes[index].classList.contains("is-playing")) kick();
        tick();
      }).catch(function (err) {
        if (mine !== gen) return;
        if (err && err.name === "NotAllowedError") holdForGesture();
        else useFallback();
      });
    } else {
      ignoreEnded = false;
      tick();
    }
  }

  audio.addEventListener("ended", function () {
    if (ignoreEnded || !playing || fallback || ended) return;
    advance();
  });

  audio.addEventListener("error", function () {
    if (!audio.error) return;
    useFallback();
  });

  function advance() {
    clearTimeout(timer);
    if (index >= scenes.length - 1) {
      playing = false;
      ended = true;
      ignoreEnded = true;
      audio.pause();
      paint();
      drawMeter();
      return;
    }
    index += 1;
    ended = false;
    paint();
    kick();
    loadClip(true);
  }

  function go(i) {
    ended = false;
    index = Math.max(0, Math.min(scenes.length - 1, i));
    paint();
    kick();
    loadClip(true);
    if (playing) tick();
  }

  function toggle() {
    if (playing) {
      if (fallback) remain = Math.max(0, remain - (performance.now() - started));
      playing = false;
      clearTimeout(timer);
      audio.pause();
      paint();
      drawMeter();
      return;
    }
    if (ended) {
      ended = false;
      index = 0;
      playing = true;
      paint();
      kick();
      loadClip(true);
      tick();
      return;
    }
    playing = true;
    paint();
    if (!reduce) scenes[index].classList.add("is-playing");
    if (fallback) arm();
    else loadClip(false);
    tick();
  }

  document.getElementById("prev").addEventListener("click", function () {
    go(index - 1);
  });
  document.getElementById("next").addEventListener("click", function () {
    go(index >= scenes.length - 1 ? 0 : index + 1);
  });
  playBtn.addEventListener("click", toggle);
  window.addEventListener("keydown", function (e) {
    if (e.target && e.target.closest && e.target.closest("button")) return;
    if (e.code === "Space") {
      e.preventDefault();
      toggle();
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      go(index >= scenes.length - 1 ? 0 : index + 1);
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  });

  paint();
  if (playing) loadClip(true);
  else {
    loadClip(true);
    drawMeter();
  }
})();
