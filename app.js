(() => {
  const $ = (id) => document.getElementById(id);

  const totalBeforeEl = $("totalBefore");
  const availableEl   = $("available");
  const desiredEl     = $("desired");
  const totalAfterEl  = $("totalAfter");

  const winMbEl = $("winMb");
  const linMbEl = $("linMb");

  const barWrap = $("barWrap");
  const bar = $("bar");
  const segWin = $("segWin");
  const segLin = $("segLin");
  const handle = $("handle");
  const barHint = $("barHint");

  const copyBtn = $("copyBtn");

  const statusText = $("statusText");
  const warnBox = $("warnBox");
  const warnText = $("warnText");

  const required = [totalBeforeEl, availableEl, desiredEl, totalAfterEl, winMbEl, linMbEl, barWrap, bar, segWin, segLin, handle, barHint, copyBtn, statusText, warnBox, warnText];
  if (required.some((x) => !x)) {
    console.error("[Reducir Disco] Faltan elementos en el DOM. Revisa IDs.");
    return;
  }

  // ---------------------------
  // Reglas (Windows-like, corregido)
  // - "Espacio disponible" define el MÁXIMO permitido.
  // - Al escribir/cambiar "Espacio disponible", Windows pone por defecto "Desea reducir" = máximo.
  // - Luego el usuario puede mover/editar libremente dentro de [0 .. máximo].
  //   (Windows sí permite subir/bajar, solo NO permite pasar del máximo)
  // ---------------------------

  let maxShrink = null;      // Espacio disponible (máximo permitido)
  let desired = null;        // Valor actual a reducir
  let lastAvailableDigits = ""; // detecta cambio real

  // ---------- Utils ----------
  const digitsOnly = (s) => (s ?? "").toString().replace(/[^\d]/g, "");
  const toIntOrNull = (s) => {
    const d = digitsOnly(s);
    if (!d) return null;
    const n = Number(d);
    if (!Number.isFinite(n)) return null;
    return Math.floor(n);
  };
  const fmt = (n) => (n == null || !Number.isFinite(n)) ? "" : String(Math.floor(n)); // sin comas/puntos
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  function setWarning(msg) {
    if (!msg) {
      warnBox.hidden = true;
      warnText.textContent = "";
      return;
    }
    warnBox.hidden = false;
    warnText.textContent = msg;
  }

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  function setHandleAria(text) {
    handle.setAttribute("aria-valuemin", "0");
    handle.setAttribute("aria-valuemax", String(maxShrink ?? 0));
    handle.setAttribute("aria-valuenow", String(desired ?? 0));
    handle.setAttribute("aria-valuetext", text);
  }

  function updateLegend(winAfter, linuxSpace) {
    winMbEl.textContent = winAfter == null ? "— MB" : `${fmt(winAfter)} MB`;
    linMbEl.textContent = linuxSpace == null ? "— MB" : `${fmt(linuxSpace)} MB`;
  }

  function updateBarEmpty() {
    segWin.style.width = "50%";
    segLin.style.width = "50%";
    handle.style.left = "50%";
    handle.disabled = true;
    barHint.textContent = "Ingresa valores para activar el divisor.";
    updateLegend(null, null);
    setHandleAria("Sin datos");
    copyBtn.disabled = true;
  }

  function enableBar() {
    handle.disabled = false;
    barHint.textContent = "Arrastra el divisor azul para ajustar el espacio a reducir (0..máximo).";
    copyBtn.disabled = !digitsOnly(desiredEl.value);
  }

  function renderProportional(totalBefore, winAfter) {
    const tb = totalBefore;
    const winPct = tb <= 0 ? 0 : (winAfter / tb) * 100;
    const linPct = 100 - winPct;

    segWin.style.width = `${winPct}%`;
    segLin.style.width = `${linPct}%`;
    handle.style.left = `${winPct}%`;
  }

  // ---------- Core recompute ----------
  function recompute({ fromDesiredEdit = false } = {}) {
    setWarning("");

    // sanitize live (important for paste too)
    totalBeforeEl.value = digitsOnly(totalBeforeEl.value);
    availableEl.value = digitsOnly(availableEl.value);
    desiredEl.value = digitsOnly(desiredEl.value);

    const totalBefore = toIntOrNull(totalBeforeEl.value);
    const available = toIntOrNull(availableEl.value);

    if (available == null || available <= 0) {
      maxShrink = null;
      desired = null;
      desiredEl.value = "";
      totalAfterEl.value = "";
      updateBarEmpty();

      if (totalBefore == null) setStatus("Escribe los dos primeros valores (en MB) para iniciar.");
      else setStatus("Ahora escribe el “Espacio disponible para la reducción (MB)” para que Windows calcule el máximo.");
      return;
    }

    // Detectar cambio de available
    const availDigits = digitsOnly(availableEl.value);
    const availableChanged = availDigits !== lastAvailableDigits;
    if (availableChanged) lastAvailableDigits = availDigits;

    maxShrink = available;

    // Windows-like: al cambiar available, desired se resetea al máximo
    if (availableChanged || desired == null) {
      desired = maxShrink;
      desiredEl.value = fmt(desired);
    }

    // Edit manual del desired: permitir subir/bajar dentro de [0..maxShrink]
    if (fromDesiredEdit) {
      const typed = toIntOrNull(desiredEl.value);
      if (typed == null) {
        desiredEl.value = fmt(desired);
      } else {
        desired = clamp(typed, 0, maxShrink);
        desiredEl.value = fmt(desired);
      }
    }

    // Validación con totalBefore (si existe)
    if (totalBefore != null && totalBefore > 0) {
      if (maxShrink > totalBefore) {
        setWarning("El “Espacio disponible” no puede ser mayor que el “Tamaño total antes”. Revisa los valores en Windows.");
      }

      // Evitar desired > totalBefore por consistencia
      if (desired > totalBefore) {
        desired = totalBefore;
        desiredEl.value = fmt(desired);
        setWarning("El valor a reducir no puede ser mayor que el tamaño total antes.");
      }

      const winAfter = totalBefore - desired;
      if (winAfter < 0) {
        totalAfterEl.value = "";
        updateBarEmpty();
        setWarning("Los valores producen un resultado imposible (después < 0). Revisa lo ingresado.");
        setStatus("Revisa los valores: después de reducir no puede quedar negativo.");
        return;
      }

      totalAfterEl.value = fmt(winAfter);
      updateLegend(winAfter, desired);
      renderProportional(totalBefore, winAfter);
      enableBar();
      setHandleAria(`Reducir ${fmt(desired)} MB (máximo ${fmt(maxShrink)} MB)`);

      // Mensajes UX
      if (desired === maxShrink) {
        setStatus("🟦 Valor al máximo permitido. Puedes reducirlo (hacia la derecha) o aumentarlo hasta este máximo (hacia la izquierda) como en Windows.");
      } else if (desired === 0) {
        setStatus("ℹ️ En 0 MB no estás reduciendo nada: no quedará espacio libre para Linux");
      } else {
        setStatus("✅ Ajusta el valor dentro del rango permitido. A la derecha verás cuánto espacio quedará libre para Linux.");
      }
    } else {
      // Sin totalBefore: no podemos proporción exacta
      totalAfterEl.value = "";
      updateLegend(null, desired);
      segWin.style.width = "60%";
      segLin.style.width = "40%";
      handle.style.left = "60%";
      enableBar();
      barHint.textContent = "Para proporción exacta, completa “Tamaño total antes”.";
      setHandleAria(`Reducir ${fmt(desired)} MB (sin tamaño total)`);
      setStatus("✅ Ya hay un máximo para reducir. Ahora escribe “Tamaño total antes” para ver la barra proporcional.");
    }
  }

  // ---------- Copy ----------
  copyBtn.addEventListener("click", async () => {
    const val = digitsOnly(desiredEl.value);
    if (!val) return;

    try {
      await navigator.clipboard.writeText(val);
      copyBtn.textContent = "¡Copiado!";
      setStatus("📋 Copiado al portapapeles.");
      setTimeout(() => (copyBtn.textContent = "Copiar"), 900);
    } catch {
      desiredEl.focus();
      desiredEl.select();
      document.execCommand("copy");
      copyBtn.textContent = "Copiado";
      setTimeout(() => (copyBtn.textContent = "Copiar"), 900);
    }
  });

  // ---------- Inputs (input + change para pegar/auto completar) ----------
  const bindInput = (inputEl, handler) => {
    inputEl.addEventListener("input", handler);
    inputEl.addEventListener("change", handler);
    inputEl.addEventListener("keyup", handler);
    inputEl.addEventListener("paste", () => setTimeout(handler, 0));
  };

  bindInput(totalBeforeEl, () => recompute());
  bindInput(availableEl, () => recompute());
  bindInput(desiredEl, () => recompute({ fromDesiredEdit: true }));

  // ---------- Drag handle ----------
  let dragging = false;

  const barClientXToDesired = (clientX) => {
    const totalBefore = toIntOrNull(totalBeforeEl.value);
    const rect = bar.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const pct = rect.width === 0 ? 0 : (x / rect.width);

    if (totalBefore == null || totalBefore <= 0) {
      // aprox
      const candidate = Math.round((1 - pct) * (maxShrink ?? 0));
      return clamp(candidate, 0, maxShrink ?? 0);
    }

    // desired = (1 - winPct) * totalBefore; donde winPct ~ pct
    const candidate = Math.round((1 - pct) * totalBefore);
    return clamp(candidate, 0, maxShrink ?? 0);
  };

  const beginDrag = (clientX) => {
    if (handle.disabled) return;
    dragging = true;
    document.body.classList.add("dragging");
    moveDrag(clientX);
  };

  const endDrag = () => {
    dragging = false;
    document.body.classList.remove("dragging");
  };

  const moveDrag = (clientX) => {
    if (!dragging) return;
    desired = barClientXToDesired(clientX);
    desiredEl.value = fmt(desired);
    recompute(); // render
  };

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    beginDrag(e.clientX);
  });

  window.addEventListener("mousemove", (e) => moveDrag(e.clientX));
  window.addEventListener("mouseup", endDrag);

  handle.addEventListener("touchstart", (e) => {
    if (!e.touches?.length) return;
    beginDrag(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!e.touches?.length) return;
    moveDrag(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("touchend", endDrag);

  // Click en la barra: ajusta directamente (dentro del rango)
  barWrap.addEventListener("mousedown", (e) => {
    if (handle.disabled) return;
    if (e.target === handle || handle.contains(e.target)) return;

    desired = barClientXToDesired(e.clientX);
    desiredEl.value = fmt(desired);
    recompute();
  });

  // Teclado accesible en el handle: ArrowLeft/Right ajustan dentro del rango
  handle.addEventListener("keydown", (e) => {
    if (handle.disabled) return;
    const step = e.shiftKey ? 128 : 16;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      desired = clamp((desired ?? 0) + step, 0, maxShrink ?? 0); // izquierda = más reducir
      desiredEl.value = fmt(desired);
      recompute();
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      desired = clamp((desired ?? 0) - step, 0, maxShrink ?? 0); // derecha = menos reducir
      desiredEl.value = fmt(desired);
      recompute();
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      desired = 0;
      desiredEl.value = "0";
      recompute();
    }
    if (e.key === "End") {
      e.preventDefault();
      desired = maxShrink ?? 0;
      desiredEl.value = fmt(desired);
      recompute();
    }
  });

  // Init
  updateBarEmpty();
  setStatus("Escribe los dos primeros valores (en MB) para iniciar.");
})();