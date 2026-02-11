"use strict";

/**
 * Reglas clave:
 * - Campos inician vacíos (sin valores demo).
 * - Al escribir shrinkAvailableMb, se copia a shrinkDesiredMb (como Windows).
 * - shrinkDesiredMb no puede ser > shrinkAvailableMb.
 * - totalAfterMb = totalBeforeMb - shrinkDesiredMb
 * - Barra proporcional + handle arrastrable real, sin salirse visualmente.
 * - Valores mostrados sin puntos ni comas (solo dígitos).
 */

const elTotalBefore = document.getElementById("totalBeforeMb");
const elShrinkAvail = document.getElementById("shrinkAvailableMb");
const elShrinkDesired = document.getElementById("shrinkDesiredMb");
const elTotalAfter = document.getElementById("totalAfterMb");

const elLabelWinAfter = document.getElementById("labelWindowsAfter");
const elLabelLinux = document.getElementById("labelLinuxSpace");

const elDiskBar = document.getElementById("diskBar");
const elDivider = document.getElementById("dividerHandle");

const elSegWin = document.getElementById("segWin");
const elSegLinux = document.getElementById("segLinux");

const elMsg = document.getElementById("statusMsg");
const btnCopy = document.getElementById("copyShrinkBtn");

const state = {
  totalBefore: null,
  shrinkAvailable: null,
  shrinkDesired: null,
  dragging: false,
};

function digitsOnly(str) {
  // Solo dígitos. Eliminamos espacios, comas, puntos, signos, etc.
  return String(str || "").replace(/[^\d]/g, "");
}

function toIntOrNull(value) {
  const s = digitsOnly(value);
  if (!s) return null;
  // Evitar números absurdos: límite razonable (MB) para UX
  if (s.length > 12) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.floor(n);
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function setMsg(type, text) {
  elMsg.classList.remove("msg--ok", "msg--bad");
  if (type === "ok") elMsg.classList.add("msg--ok");
  if (type === "bad") elMsg.classList.add("msg--bad");
  elMsg.textContent = text;
}

function fmtMb(n) {
  // Windows muestra MB sin separadores, así que devolvemos "12345 MB"
  if (n === null || n === undefined) return "—";
  return `${String(n)} MB`;
}

function recompute() {
  state.totalBefore = toIntOrNull(elTotalBefore.value);
  state.shrinkAvailable = toIntOrNull(elShrinkAvail.value);

  // Si shrinkAvailable se escribió (y es válido), Windows copia ese valor en shrinkDesired.
  // Para no “pelear” con el usuario mientras escribe, solo autopoblamos si:
  // - shrinkDesired está vacío, o
  // - shrinkDesired coincide con el valor anterior de available, o
  // - shrinkDesired > available (lo corregimos)
  const desiredNow = toIntOrNull(elShrinkDesired.value);

  // Validaciones básicas
  if (state.totalBefore === null || state.shrinkAvailable === null) {
    // Aún no hay suficientes datos para simular.
    resetVisualization();
    if (!elTotalBefore.value && !elShrinkAvail.value) {
      setMsg("info", "Ingresa los dos primeros valores para iniciar la simulación.");
    } else {
      setMsg("bad", "Faltan datos: completa “Tamaño total antes…” y “Espacio disponible…”.");
    }
    return;
  }

  if (state.totalBefore <= 0) {
    resetVisualization();
    setMsg("bad", "El “Tamaño total antes…” debe ser mayor que 0.");
    return;
  }

  if (state.shrinkAvailable < 0) {
    resetVisualization();
    setMsg("bad", "El “Espacio disponible…” no puede ser negativo.");
    return;
  }

  if (state.shrinkAvailable > state.totalBefore) {
    resetVisualization();
    setMsg("bad", "El “Espacio disponible…” no puede ser mayor que el “Tamaño total antes…”.");
    return;
  }

  // Determinar shrinkDesired con reglas Windows-like
  let desired = desiredNow;

  // Si está vacío, lo ponemos automáticamente (igual que Windows).
  if (desired === null) {
    desired = state.shrinkAvailable;
    elShrinkDesired.value = String(desired);
  }

  // Nunca permitir que exceda el máximo (available)
  if (desired > state.shrinkAvailable) {
    desired = state.shrinkAvailable;
    elShrinkDesired.value = String(desired);
  }

  // Permitir 0..available (puede “reducir” menos, incluso 0)
  desired = clamp(desired, 0, state.shrinkAvailable);
  state.shrinkDesired = desired;

  // Calcular totalAfter
  const after = state.totalBefore - state.shrinkDesired;
  if (after < 0) {
    resetVisualization();
    setMsg("bad", "Los números no cuadran: el tamaño a reducir no puede dejar un total negativo.");
    return;
  }

  elTotalAfter.value = String(after);

  // Actualizar aria del slider
  elDivider.setAttribute("aria-valuemin", "0");
  elDivider.setAttribute("aria-valuemax", String(state.shrinkAvailable));
  elDivider.setAttribute("aria-valuenow", String(state.shrinkDesired));

  // Mensaje educativo
  setMsg(
    "ok",
    `Windows quedaría con ${after} MB y el espacio vacío para Linux sería ${state.shrinkDesired} MB. ` +
    `Puedes arrastrar el divisor o ajustar el “Tamaño a reducir” (máximo: ${state.shrinkAvailable} MB).`
  );

  renderBar(after, state.shrinkDesired, state.totalBefore);
  renderLabels(after, state.shrinkDesired);
}

function resetVisualization() {
  elSegWin.style.width = "50%";
  elSegLinux.style.width = "50%";
  elSegWin.style.left = "0";
  elSegLinux.style.right = "0";
  elDivider.style.left = "50%";
  elLabelWinAfter.textContent = "—";
  elLabelLinux.textContent = "—";
  elDivider.setAttribute("aria-valuemin", "0");
  elDivider.setAttribute("aria-valuemax", "0");
  elDivider.setAttribute("aria-valuenow", "0");
}

function renderLabels(winAfterMb, linuxSpaceMb) {
  elLabelWinAfter.textContent = fmtMb(winAfterMb);
  elLabelLinux.textContent = fmtMb(linuxSpaceMb);
}

function renderBar(winAfterMb, linuxSpaceMb, totalBeforeMb) {
  const total = totalBeforeMb;
  if (total <= 0) return;

  const winRatio = winAfterMb / total;          // 0..1
  const linuxRatio = linuxSpaceMb / total;      // 0..1

  // Convertimos a %
  const winPct = clamp(winRatio * 100, 0, 100);
  const linuxPct = clamp(linuxRatio * 100, 0, 100);

  elSegWin.style.width = `${winPct}%`;
  elSegLinux.style.width = `${linuxPct}%`;

  // El divider está en el borde entre win y linux:
  elDivider.style.left = `${winPct}%`;
}

function barClientXToDesiredMb(clientX) {
  // Convertir posición del mouse/touch a un desired MB (0..available),
  // usando proporción totalBefore (porque la barra representa el total).
  if (state.totalBefore === null || state.shrinkAvailable === null) return null;

  const rect = elDiskBar.getBoundingClientRect();
  const x = clamp(clientX - rect.left, 0, rect.width);
  const ratio = rect.width === 0 ? 0 : (x / rect.width);

  // x indica el tamaño de Windows después (winAfter) sobre total.
  const winAfter = Math.round(ratio * state.totalBefore);

  // desired = totalBefore - winAfter
  let desired = state.totalBefore - winAfter;

  // Clamp a 0..available (regla Windows)
  desired = clamp(desired, 0, state.shrinkAvailable);
  return desired;
}

function applyDesired(desired) {
  if (desired === null) return;

  // Asegurar límites (0..available)
  desired = clamp(desired, 0, state.shrinkAvailable);

  state.shrinkDesired = desired;
  elShrinkDesired.value = String(desired);

  const after = state.totalBefore - desired;
  elTotalAfter.value = String(after);

  elDivider.setAttribute("aria-valuenow", String(desired));

  renderBar(after, desired, state.totalBefore);
  renderLabels(after, desired);
}

/* --- Inputs: limpiar a dígitos y recalcular --- */

function normalizeInputToDigits(inputEl) {
  const clean = digitsOnly(inputEl.value);
  if (inputEl.value !== clean) inputEl.value = clean;
}

elTotalBefore.addEventListener("input", () => {
  normalizeInputToDigits(elTotalBefore);
  recompute();
});

elShrinkAvail.addEventListener("input", () => {
  normalizeInputToDigits(elShrinkAvail);

  // Copia automática (como Windows) al escribir available.
  // Si el usuario ya había puesto un valor mayor, también se corrige.
  const avail = toIntOrNull(elShrinkAvail.value);
  const desired = toIntOrNull(elShrinkDesired.value);

  if (avail !== null) {
    if (desired === null) {
      elShrinkDesired.value = String(avail);
    } else if (desired > avail) {
      elShrinkDesired.value = String(avail);
    } else {
      // Si el desired estaba vacío o igual al previous available, aquí no
      // podemos conocer el previous con certeza sin más estado.
      // Aun así, Windows “setea” el campo a ese valor al abrir la ventana.
      // Para mantener UX clara, solo auto-seteamos cuando el usuario no lo está editando.
      // (Si el usuario lo editó a menos, lo respetamos.)
      // No hacemos nada.
    }
  }

  recompute();
});

elShrinkDesired.addEventListener("input", () => {
  normalizeInputToDigits(elShrinkDesired);

  // Enforce desired <= available
  const avail = toIntOrNull(elShrinkAvail.value);
  const desired = toIntOrNull(elShrinkDesired.value);

  if (avail !== null && desired !== null && desired > avail) {
    elShrinkDesired.value = String(avail);
  }

  recompute();
});

/* --- Copiar al portapapeles --- */

btnCopy.addEventListener("click", async () => {
  const val = digitsOnly(elShrinkDesired.value);
  if (!val) {
    setMsg("bad", "No hay un número para copiar todavía.");
    return;
  }

  try {
    await navigator.clipboard.writeText(val);
    setMsg("ok", `Copiado: ${val} (MB). Pégalo donde lo necesites.`);
  } catch {
    // Fallback clásico
    try {
      elShrinkDesired.focus();
      elShrinkDesired.select();
      document.execCommand("copy");
      setMsg("ok", `Copiado: ${val} (MB).`);
    } catch {
      setMsg("bad", "No se pudo copiar automáticamente. Copia el número manualmente.");
    }
  }
});

/* --- Drag del divisor (handle) --- */

function onPointerDown(e) {
  // Solo iniciar si ya tenemos números válidos
  if (toIntOrNull(elTotalBefore.value) === null || toIntOrNull(elShrinkAvail.value) === null) {
    setMsg("bad", "Primero ingresa “Tamaño total antes…” y “Espacio disponible…”.");
    return;
  }

  state.dragging = true;
  elDivider.setPointerCapture?.(e.pointerId);
  e.preventDefault();
}

function onPointerMove(e) {
  if (!state.dragging) return;
  const desired = barClientXToDesiredMb(e.clientX);
  applyDesired(desired);
}

function onPointerUp(e) {
  if (!state.dragging) return;
  state.dragging = false;
  elDivider.releasePointerCapture?.(e.pointerId);
  recompute();
}

elDivider.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);

/* --- Teclado en el handle (accesibilidad) --- */
elDivider.addEventListener("keydown", (e) => {
  if (state.totalBefore === null || state.shrinkAvailable === null) return;

  const step = Math.max(1, Math.round(state.shrinkAvailable / 200)); // step suave
  let desired = toIntOrNull(elShrinkDesired.value);
  if (desired === null) desired = state.shrinkAvailable;

  if (e.key === "ArrowLeft") {
    // ArrowLeft: más Linux (aumenta desired) pero limitado al available
    desired = clamp(desired + step, 0, state.shrinkAvailable);
    applyDesired(desired);
    e.preventDefault();
  } else if (e.key === "ArrowRight") {
    // ArrowRight: menos Linux (disminuye desired)
    desired = clamp(desired - step, 0, state.shrinkAvailable);
    applyDesired(desired);
    e.preventDefault();
  } else if (e.key === "Home") {
    // mínimo (0)
    applyDesired(0);
    e.preventDefault();
  } else if (e.key === "End") {
    // máximo (available)
    applyDesired(state.shrinkAvailable);
    e.preventDefault();
  }
});

/* --- Inicial --- */
resetVisualization();
