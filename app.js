(() => {
  const el = (id) => document.getElementById(id);

  const totalBeforeEl = el("totalBefore");
  const availableEl   = el("available");
  const desiredEl     = el("desired");
  const totalAfterEl  = el("totalAfter");

  const winMbEl = el("winMb");
  const linMbEl = el("linMb");

  const bar = el("bar");
  const barWrap = el("barWrap");
  const segWin = el("segWin");
  const segLin = el("segLin");
  const handle = el("handle");
  const barHint = el("barHint");

  const copyBtn = el("copyBtn");

  const statusText = el("statusText");
  const warnBox = el("warnBox");
  const warnText = el("warnText");

  // Estado “Windows-like”
  let maxShrink = null;         // Espacio disponible (máximo)
  let currentDesired = null;    // Valor actual a reducir (solo puede bajar)
  let lastAvailableRaw = "";    // Para detectar cuando el usuario cambia el disponible

  // ---------- Utilidades ----------
  function digitsOnly(str) {
    return (str || "").replace(/[^\d]/g, "");
  }

  function toIntOrNull(str) {
    const s = digitsOnly(str);
    if (!s) return null;
    // Evitar números absurdamente grandes por accidente (aunque Windows puede tener discos grandes)
    // Aun así, no ponemos separadores.
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    return Math.floor(n);
  }

  function formatMB(n) {
    // Regla: sin puntos ni comas
    return (n == null || !Number.isFinite(n)) ? "" : String(Math.floor(n));
  }

  function setWarning(message) {
    if (!message) {
      warnBox.hidden = true;
      warnText.textContent = "";
      return;
    }
    warnBox.hidden = false;
    warnText.textContent = message;
  }

  function setStatus(message) {
    statusText.textContent = message;
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  // ---------- Lógica principal ----------
  function recomputeAndRender({ fromUserDesiredEdit = false } = {}) {
    const totalBefore = toIntOrNull(totalBeforeEl.value);
    const available = toIntOrNull(availableEl.value);

    // Validación base
    setWarning("");

    if (totalBefore == null && available == null) {
      disableInteractive();
      clearOutputs();
      setStatus("Escribe los dos primeros valores (en MB) para iniciar.");
      return;
    }

    // Validar totalBefore
    if (totalBefore != null && totalBefore <= 0) {
      disableInteractive();
      clearOutputs();
      setWarning("El “Tamaño total antes” debe ser mayor que 0.");
      setStatus("Corrige el tamaño total antes de la reducción.");
      return;
    }

    // Si el usuario cambió el “disponible”, Windows “resetea” el campo a reducir al máximo.
    const availableRaw = digitsOnly(availableEl.value);
    const availableChanged = availableRaw !== lastAvailableRaw;
    if (availableChanged) lastAvailableRaw = availableRaw;

    if (available == null || available <= 0) {
      // Sin disponible no hay “máximo”, por tanto no hay simulación completa
      maxShrink = null;
      currentDesired = null;
      desiredEl.value = "";
      totalAfterEl.value = "";
      updateBarEmpty();
      disableInteractive();
      setStatus("Ahora escribe el “Espacio disponible para la reducción (MB)”.");
      return;
    }

    maxShrink = available;

    // Regla: si se escribe “disponible”, el “desea reducir” se copia igual (Windows-like)
    // También si el usuario cambió disponible, re-sincronizamos al máximo.
    if (availableChanged || currentDesired == null) {
      currentDesired = maxShrink;
      desiredEl.value = formatMB(currentDesired);
    }

    // Si el usuario editó el campo “desired” por teclado:
    if (fromUserDesiredEdit) {
      const typed = toIntOrNull(desiredEl.value);
      if (typed == null) {
        // Vacío: no permitimos “vaciar” porque rompe la simulación; lo volvemos al valor actual
        desiredEl.value = formatMB(currentDesired);
      } else {
        // Regla: solo puede DISMINUIR, nunca aumentar
        if (typed > currentDesired) {
          desiredEl.value = formatMB(currentDesired);
          setStatus("⛔ No puedes aumentar el valor a reducir. Solo disminuirlo, como en Windows.");
        } else {
          // Además no puede ser mayor que el máximo disponible
          currentDesired = clamp(typed, 0, maxShrink);
          desiredEl.value = formatMB(currentDesired);
        }
      }
    }

    // Validación cruzada con totalBefore (si está)
    if (totalBefore != null) {
      if (maxShrink > totalBefore) {
        // En la práctica, Windows no daría un disponible mayor al total del volumen.
        setWarning("El “Espacio disponible” no puede ser mayor que el “Tamaño total antes”. Revisa los valores en Windows.");
      }

      if (currentDesired > totalBefore) {
        // Por consistencia: no permitir
        currentDesired = totalBefore;
        desiredEl.value = formatMB(currentDesired);
        setWarning("El valor a reducir no puede ser mayor que el tamaño total antes.");
      }
    }

    // Calcular total después
    if (totalBefore == null) {
      totalAfterEl.value = "";
      setStatus("✅ Ya hay un máximo para reducir. Ahora escribe “Tamaño total antes” para ver la barra proporcional.");
      // Sin totalBefore, la barra no puede ser proporcional real; pero aún podemos activar el control con un modo “solo número”.
      updateBarNoTotal();
      enableInteractive();
      updateLegendNoTotal();
      return;
    }

    const totalAfter = totalBefore - currentDesired;
    if (totalAfter < 0) {
      setWarning("Los valores producen un resultado imposible (después < 0). Revisa lo ingresado.");
      totalAfterEl.value = "";
      disableInteractive();
      updateBarEmpty();
      setStatus("Revisa los valores: después de reducir no puede quedar negativo.");
      return;
    }

    totalAfterEl.value = formatMB(totalAfter);

    // Render barra proporcional
    renderBar(totalBefore, totalAfter, currentDesired);

    // Mensaje educativo
    if (currentDesired === maxShrink) {
      setStatus("🟦 Windows inicia al máximo posible. Ahora arrastra el divisor o reduce el número si quieres dejar más espacio a Windows.");
    } else if (currentDesired === 0) {
      setStatus("ℹ️ En 0 MB no estás reduciendo nada: no quedará espacio libre para Linux.");
    } else {
      setStatus("✅ Estás reduciendo el volumen. La derecha quedará vacía y podrás crear una partición para Linux después.");
    }

    enableInteractive();
  }

  function clearOutputs() {
    totalAfterEl.value = "";
    winMbEl.textContent = "— MB";
    linMbEl.textContent = "— MB";
    barHint.textContent = "Ingresa valores para activar el divisor.";
  }

  function disableInteractive() {
    handle.disabled = true;
    desiredEl.disabled = false; // el usuario puede escribir, pero aplicamos reglas; aun así si faltan datos, se verá sin efecto
    copyBtn.disabled = true;
  }

  function enableInteractive() {
    handle.disabled = false;
    copyBtn.disabled = !digitsOnly(desiredEl.value);
    barHint.textContent = "Arrastra el divisor azul para DISMINUIR el espacio a reducir.";
  }

  function updateLegend(totalAfter, linuxSpace) {
    winMbEl.textContent = `${formatMB(totalAfter)} MB`;
    linMbEl.textContent = `${formatMB(linuxSpace)} MB`;
  }

  function updateLegendNoTotal() {
    // Cuando no hay totalBefore, mostramos solo el “deseado” como Linux, y Windows como “—”
    winMbEl.textContent = "— MB";
    linMbEl.textContent = `${formatMB(currentDesired ?? 0)} MB`;
  }

  function updateBarEmpty() {
    segWin.style.width = "50%";
    segLin.style.width = "50%";
    handle.style.left = "50%";
    handle.setAttribute("aria-valuetext", "Sin datos");
    handle.setAttribute("aria-valuemin", "0");
    handle.setAttribute("aria-valuemax", "0");
    handle.setAttribute("aria-valuenow", "0");
  }

  function updateBarNoTotal() {
    // Sin totalBefore no podemos hacer proporción real, así que usamos una representación simple:
    // Windows 65% fijo y Linux 35% proporcional al % del máximo (solo para intuición).
    const p = (maxShrink ? (currentDesired / maxShrink) : 0);
    const linux = 10 + Math.round(p * 40); // 10%..50%
    const win = 100 - linux;
    segWin.style.width = `${win}%`;
    segLin.style.width = `${linux}%`;
    handle.style.left = `${win}%`;

    handle.setAttribute("aria-valuemin", "0");
    handle.setAttribute("aria-valuemax", String(maxShrink ?? 0));
    handle.setAttribute("aria-valuenow", String(currentDesired ?? 0));
    handle.setAttribute("aria-valuetext", `Reducir ${formatMB(currentDesired ?? 0)} MB (sin tamaño total)`);

    barHint.textContent = "Para proporción exacta, completa “Tamaño total antes”.";
  }

  function renderBar(totalBefore, totalAfter, linuxSpace) {
    const tb = totalBefore;
    const win = totalAfter;
    const lin = linuxSpace;

    const winPct = tb === 0 ? 0 : (win / tb) * 100;
    const linPct = 100 - winPct;

    segWin.style.width = `${winPct}%`;
    segLin.style.width = `${linPct}%`;
    handle.style.left = `${winPct}%`;

    updateLegend(win, lin);

    // ARIA
    handle.setAttribute("aria-valuemin", "0");
    handle.setAttribute("aria-valuemax", String(maxShrink ?? 0));
    handle.setAttribute("aria-valuenow", String(currentDesired ?? 0));
    handle.setAttribute("aria-valuetext", `Reducir ${formatMB(currentDesired)} MB de un máximo ${formatMB(maxShrink)} MB`);
  }

  // ---------- Eventos: inputs ----------
  function onNumericInput(e) {
    // Limpieza en vivo (sin comas/puntos/letras)
    const cleaned = digitsOnly(e.target.value);
    if (e.target.value !== cleaned) e.target.value = cleaned;
  }

  totalBeforeEl.addEventListener("input", (e) => {
    onNumericInput(e);
    recomputeAndRender();
  });

  availableEl.addEventListener("input", (e) => {
    onNumericInput(e);
    recomputeAndRender();
  });

  desiredEl.addEventListener("input", (e) => {
    onNumericInput(e);
    recomputeAndRender({ fromUserDesiredEdit: true });
  });

  // ---------- Copiar ----------
  copyBtn.addEventListener("click", async () => {
    const val = digitsOnly(desiredEl.value);
    if (!val) return;

    try {
      await navigator.clipboard.writeText(val);
      copyBtn.textContent = "¡Copiado!";
      setStatus("📋 Copiado al portapapeles. Pega ese número en Windows o donde lo necesites.");
      setTimeout(() => (copyBtn.textContent = "Copiar"), 900);
    } catch {
      // Fallback
      desiredEl.focus();
      desiredEl.select();
      document.execCommand("copy");
      copyBtn.textContent = "Copiado";
      setTimeout(() => (copyBtn.textContent = "Copiar"), 900);
    }
  });

  // ---------- Handle arrastrable (solo permite DISMINUIR) ----------
  let dragging = false;
  let dragStartX = 0;
  let dragStartDesired = 0;

  function barClientXToDesired(clientX) {
    const totalBefore = toIntOrNull(totalBeforeEl.value);
    const rect = bar.getBoundingClientRect();

    // Si no hay totalBefore, usamos el % del bar vs maxShrink
    const x = clamp(clientX - rect.left, 0, rect.width);
    const pct = rect.width === 0 ? 0 : (x / rect.width);

    if (totalBefore == null || totalBefore <= 0) {
      // modo aproximado: desired proporcional a pct (pero invertido: más a la derecha = más reducir)
      const desired = Math.round((1 - pct) * (maxShrink ?? 0));
      return clamp(desired, 0, maxShrink ?? 0);
    }

    // En la barra: winPct = totalAfter/totalBefore = (totalBefore - desired)/totalBefore = 1 - desired/totalBefore
    // Así que desired = (1 - winPct) * totalBefore
    const desired = Math.round((1 - pct) * totalBefore);
    return clamp(desired, 0, maxShrink ?? 0);
  }

  function beginDrag(clientX) {
    if (handle.disabled) return;
    dragging = true;
    dragStartX = clientX;
    dragStartDesired = currentDesired ?? 0;
    document.body.classList.add("dragging");
  }

  function endDrag() {
    dragging = false;
    document.body.classList.remove("dragging");
  }

  function moveDrag(clientX) {
    if (!dragging) return;

    const proposed = barClientXToDesired(clientX);

    // Regla crítica: SOLO DISMINUIR (nunca aumentar) respecto al valor actual
    // Si el usuario intenta mover para aumentar, lo bloqueamos.
    if (proposed > (currentDesired ?? 0)) {
      return;
    }

    currentDesired = proposed;
    desiredEl.value = formatMB(currentDesired);
    recomputeAndRender();
  }

  // Mouse
  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    beginDrag(e.clientX);
  });
  window.addEventListener("mousemove", (e) => moveDrag(e.clientX));
  window.addEventListener("mouseup", () => endDrag());

  // Touch / Pointer (mejor en móvil)
  handle.addEventListener("touchstart", (e) => {
    if (!e.touches?.length) return;
    beginDrag(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!e.touches?.length) return;
    moveDrag(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("touchend", () => endDrag());

  // También permitir click directo en la barra para “mover” (pero respetando solo disminuir)
  barWrap.addEventListener("mousedown", (e) => {
    // si el click fue en el handle, ya lo maneja
    if (e.target === handle || handle.contains(e.target)) return;
    if (handle.disabled) return;

    const proposed = barClientXToDesired(e.clientX);
    if (proposed > (currentDesired ?? 0)) {
      setStatus("⛔ No puedes aumentar el valor a reducir. Hazlo solo hacia menor.");
      return;
    }
    currentDesired = proposed;
    desiredEl.value = formatMB(currentDesired);
    recomputeAndRender();
  });

  // Teclado en el handle (accesible): flechas reducen; Shift reduce más.
  handle.addEventListener("keydown", (e) => {
    if (handle.disabled) return;
    const step = e.shiftKey ? 128 : 16; // MB (pasos suaves)
    let next = currentDesired ?? 0;

    if (e.key === "ArrowRight") {
      // mover a la derecha = aumentar Linux = aumentar desired (NO permitido)
      e.preventDefault();
      setStatus("⛔ Flecha derecha aumentaría el valor. No está permitido.");
      return;
    }
    if (e.key === "ArrowLeft") {
      // mover a la izquierda = disminuir desired (permitido)
      e.preventDefault();
      next = clamp(next - step, 0, maxShrink ?? 0);
      if (next > (currentDesired ?? 0)) return;
      currentDesired = next;
      desiredEl.value = formatMB(currentDesired);
      recomputeAndRender();
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      currentDesired = 0;
      desiredEl.value = formatMB(currentDesired);
      recomputeAndRender();
      return;
    }
  });

  // Inicial
  updateBarEmpty();
  disableInteractive();
  clearOutputs();
})();
