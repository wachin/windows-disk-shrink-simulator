(() => {
  // Robust init: if any element is missing, show a clear console error.
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
    console.error("[Reducir Disco] Faltan elementos en el DOM. Revisa que los IDs de index.html coincidan con app.js.");
    return;
  }

  // ---------------------------
  // Reglas (Windows-like)
  // - Al escribir "Espacio disponible", el campo "Desea reducir" se copia igual.
  // - Luego SOLO puede DISMINUIR (nunca aumentar) el valor a reducir.
  // ---------------------------

  let maxShrink = null;      // Espacio disponible (máximo permitido)
  let desired = null;        // Valor actual a reducir
  let ceiling = null;        // Techo permitido para el valor (solo baja). Se resetea cuando cambia "available".
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
    barHint.textContent = "Arrastra el divisor azul para DISMINUIR el espacio a reducir.";
    copyBtn.disabled = !digitsOnly(desiredEl.value);
  }

  function renderProportional(totalBefore, winAfter, linuxSpace) {
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
      // Sin "disponible" no hay simulación real
      maxShrink = null;
      desired = null;
      ceiling = null;
      desiredEl.value = "";
      totalAfterEl.value = "";
      updateBarEmpty();

      if (totalBefore == null) {
        setStatus("Escribe los dos primeros valores (en MB) para iniciar.");
      } else {
        setStatus("Ahora escribe el “Espacio disponible para la reducción (MB)” para que Windows pueda calcular el máximo.");
      }
      return;
    }

    // Detectar cambio de available (como cuando Windows recalcula)
    const availDigits = digitsOnly(availableEl.value);
    const availableChanged = availDigits !== lastAvailableDigits;
    if (availableChanged) lastAvailableDigits = availDigits;

    maxShrink = available;

    // Windows-like: al cambiar available, desired se resetea al máximo (y el techo también)
    if (availableChanged || desired == null || ceiling == null) {
      desired = maxShrink;
      ceiling = maxShrink;
      desiredEl.value = fmt(desired);
    }

    // Edit manual del desired
    if (fromDesiredEdit) {
      const typed = toIntOrNull(desiredEl.value);

      if (typed == null) {
        // no permitir vacío: volver a último
        desiredEl.value = fmt(desired);
      } else {
        // Nunca mayor que el máximo disponible
        let candidate = clamp(typed, 0, maxShrink);

        // Regla clave: nunca aumentar (candidate <= ceiling)
        if (candidate > ceiling) {
          desiredEl.value = fmt(desired);
          setStatus("⛔ No puedes aumentar el valor a reducir. Solo disminuirlo, como en Windows.");
        } else {
          desired = candidate;
          ceiling = candidate; // una vez baja, ese es el nuevo techo
          desiredEl.value = fmt(desired);
        }
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
        ceiling = Math.min(ceiling, desired);
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
      renderProportional(totalBefore, winAfter, desired);
      enableBar();
      setHandleAria(`Reducir ${fmt(desired)} MB (máximo ${fmt(maxShrink)} MB)`);

      if (desired === maxShrink) {
        setStatus("🟦 Windows inicia al máximo posible. Ahora arrastra el divisor o reduce el número si quieres dejar más espacio a Windows.");
      } else if (desired === 0) {
        setStatus("ℹ️ En 0 MB no estás reduciendo nada: no quedará espacio libre para Linux.");
      } else {
        setStatus("✅ Estás reduciendo el volumen. La derecha quedará vacía y podrás crear una partición para Linux después.");
      }
    } else {
      // Si no hay totalBefore todavía, activamos el simulador numérico pero no proporcional exacto
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

  // ---------- Drag handle (solo disminuir) ----------
  let dragging = false;

  const barClientXToDesired = (clientX) => {
    const totalBefore = toIntOrNull(totalBeforeEl.value);
    const rect = bar.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const pct = rect.width === 0 ? 0 : (x / rect.width);

    if (totalBefore == null || totalBefore <= 0) {
      // aprox: más a la derecha = menos reducir
      const candidate = Math.round((1 - pct) * (maxShrink ?? 0));
      return clamp(candidate, 0, maxShrink ?? 0);
    }

    // winPct = winAfter/totalBefore = (totalBefore - desired)/totalBefore = 1 - desired/totalBefore
    // pct aquí representa winPct, entonces desired = (1 - pct)*totalBefore
    const candidate = Math.round((1 - pct) * totalBefore);
    return clamp(candidate, 0, maxShrink ?? 0);
  };

  const beginDrag = (clientX) => {
    if (handle.disabled) return;
    dragging = true;
    document.body.classList.add("dragging");
    // aplica inmediatamente para que se sienta “real”
    moveDrag(clientX);
  };

  const endDrag = () => {
    dragging = false;
    document.body.classList.remove("dragging");
  };

  const moveDrag = (clientX) => {
    if (!dragging) return;
    const candidate = barClientXToDesired(clientX);

    // SOLO DISMINUIR: candidate <= ceiling
    if (candidate > (ceiling ?? 0)) return;

    desired = candidate;
    ceiling = candidate;
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

  // Click en la barra: mueve el divisor, respetando “solo disminuir”
  barWrap.addEventListener("mousedown", (e) => {
    if (handle.disabled) return;
    if (e.target === handle || handle.contains(e.target)) return;

    const candidate = barClientXToDesired(e.clientX);
    if (candidate > (ceiling ?? 0)) {
      setStatus("⛔ Ese movimiento aumentaría el valor. Solo se permite disminuir.");
      return;
    }
    desired = candidate;
    ceiling = candidate;
    desiredEl.value = fmt(desired);
    recompute();
  });

  // Teclado accesible en el handle: ArrowLeft disminuye; ArrowRight bloqueado
  handle.addEventListener("keydown", (e) => {
    if (handle.disabled) return;

    const step = e.shiftKey ? 128 : 16;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setStatus("⛔ Flecha derecha aumentaría el valor. No está permitido.");
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const candidate = clamp((desired ?? 0) - step, 0, maxShrink ?? 0);
      if (candidate > (ceiling ?? 0)) return;
      desired = candidate;
      ceiling = candidate;
      desiredEl.value = fmt(desired);
      recompute();
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      desired = 0;
      ceiling = 0;
      desiredEl.value = "0";
      recompute();
    }
  });

  // Init
  updateBarEmpty();
  setStatus("Escribe los dos primeros valores (en MB) para iniciar.");
})();
