"use strict";

// Si esto se ejecuta, ocultamos el aviso de “JS no cargó”
const jsNotRunning = document.getElementById("jsNotRunning");
if (jsNotRunning) jsNotRunning.style.display = "none";

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

const state = { totalBefore: null, shrinkAvailable: null, shrinkDesired: null, dragging: false };

function digitsOnly(str){ return String(str || "").replace(/[^\d]/g, ""); }
function toIntOrNull(value){
  const s = digitsOnly(value);
  if (!s) return null;
  if (s.length > 12) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.floor(n);
}
function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }
function fmtMbGb(mb){
  if (mb === null || mb === undefined) return "—";

  // Windows está en MB; para GB usamos 1024 MB = 1 GB (estilo binario)
  const gb = mb / 1024;

  // Mostrar GB con 2 decimales (sin comas; usamos punto)
  const gbText = gb.toFixed(2);

  return `${String(mb)} MB (${gbText} GB)`;
}

function setMsg(type, text){
  if (!elMsg) return;
  elMsg.classList.remove("msg--ok", "msg--bad");
  if (type === "ok") elMsg.classList.add("msg--ok");
  if (type === "bad") elMsg.classList.add("msg--bad");
  elMsg.textContent = text;
}

function resetVisualization(){
  if (!elSegWin || !elSegLinux || !elDivider) return;
  elSegWin.style.width = "50%";
  elSegLinux.style.width = "50%";
  elDivider.style.left = "50%";
  if (elLabelWinAfter) elLabelWinAfter.textContent = "—";
  if (elLabelLinux) elLabelLinux.textContent = "—";
  elDivider.setAttribute("aria-valuemin", "0");
  elDivider.setAttribute("aria-valuemax", "0");
  elDivider.setAttribute("aria-valuenow", "0");
}

function renderLabels(winAfterMb, linuxSpaceMb){
  if (elLabelWinAfter) elLabelWinAfter.textContent = fmtMbGb(winAfterMb);
  if (elLabelLinux) elLabelLinux.textContent = fmtMbGb(linuxSpaceMb);
}

function renderBar(winAfterMb, linuxSpaceMb, totalBeforeMb){
  if (!elSegWin || !elSegLinux || !elDivider) return;
  const total = totalBeforeMb;
  if (!total || total <= 0) return;

  const winPct = clamp((winAfterMb / total) * 100, 0, 100);
  const linuxPct = clamp((linuxSpaceMb / total) * 100, 0, 100);

  elSegWin.style.width = `${winPct}%`;
  elSegLinux.style.width = `${linuxPct}%`;
  elDivider.style.left = `${winPct}%`;
}

function recompute(){
  state.totalBefore = toIntOrNull(elTotalBefore?.value);
  state.shrinkAvailable = toIntOrNull(elShrinkAvail?.value);
  const desiredNow = toIntOrNull(elShrinkDesired?.value);

  if (state.totalBefore === null || state.shrinkAvailable === null){
    resetVisualization();
    setMsg("bad", "Ingresa “Tamaño total antes…” y “Espacio disponible…”.");
    return;
  }

  if (state.totalBefore <= 0){
    resetVisualization();
    setMsg("bad", "El “Tamaño total antes…” debe ser mayor que 0.");
    return;
  }

  if (state.shrinkAvailable > state.totalBefore){
    resetVisualization();
    setMsg("bad", "El “Espacio disponible…” no puede ser mayor que el “Tamaño total antes…”.");
    return;
  }

  let desired = desiredNow;

  // Windows-like: al iniciar, desired = available (si está vacío)
  if (desired === null){
    desired = state.shrinkAvailable;
    if (elShrinkDesired) elShrinkDesired.value = String(desired);
  }

  // No permitir exceder available
  desired = clamp(desired, 0, state.shrinkAvailable);
  if (elShrinkDesired) elShrinkDesired.value = String(desired);
  state.shrinkDesired = desired;

  const after = state.totalBefore - desired;
  if (after < 0){
    resetVisualization();
    setMsg("bad", "Los números no cuadran: el tamaño a reducir no puede dejar un total negativo.");
    return;
  }

  if (elTotalAfter) elTotalAfter.value = String(after);

  if (elDivider){
    elDivider.setAttribute("aria-valuemin", "0");
    elDivider.setAttribute("aria-valuemax", String(state.shrinkAvailable));
    elDivider.setAttribute("aria-valuenow", String(state.shrinkDesired));
  }

  setMsg("ok", `Windows quedaría con ${after} MB y el espacio vacío para Linux sería ${desired} MB.`);
  renderLabels(after, desired);
  renderBar(after, desired, state.totalBefore);
}

function normalizeInputToDigits(inputEl){
  if (!inputEl) return;
  const clean = digitsOnly(inputEl.value);
  if (inputEl.value !== clean) inputEl.value = clean;
}

elTotalBefore?.addEventListener("input", () => { normalizeInputToDigits(elTotalBefore); recompute(); });

elShrinkAvail?.addEventListener("input", () => {
  normalizeInputToDigits(elShrinkAvail);

  const avail = toIntOrNull(elShrinkAvail.value);
  const desired = toIntOrNull(elShrinkDesired?.value);

  // Copia automática estilo Windows si está vacío o fuera de rango
  if (avail !== null && (desired === null || desired > avail)){
    if (elShrinkDesired) elShrinkDesired.value = String(avail);
  }

  recompute();
});

elShrinkDesired?.addEventListener("input", () => {
  normalizeInputToDigits(elShrinkDesired);
  const avail = toIntOrNull(elShrinkAvail?.value);
  const desired = toIntOrNull(elShrinkDesired.value);
  if (avail !== null && desired !== null && desired > avail){
    elShrinkDesired.value = String(avail);
  }
  recompute();
});

btnCopy?.addEventListener("click", async () => {
  const val = digitsOnly(elShrinkDesired?.value);
  if (!val) return setMsg("bad", "No hay un número para copiar todavía.");

  try{
    await navigator.clipboard.writeText(val);
    setMsg("ok", `Copiado: ${val} (MB).`);
  }catch{
    setMsg("bad", "No se pudo copiar automáticamente. Copia el número manualmente.");
  }
});

// Drag handle
function barClientXToDesiredMb(clientX){
  if (!elDiskBar) return null;
  if (state.totalBefore === null || state.shrinkAvailable === null) return null;

  const rect = elDiskBar.getBoundingClientRect();
  const x = clamp(clientX - rect.left, 0, rect.width);
  const ratio = rect.width === 0 ? 0 : (x / rect.width);
  const winAfter = Math.round(ratio * state.totalBefore);
  const desired = clamp(state.totalBefore - winAfter, 0, state.shrinkAvailable);
  return desired;
}

function applyDesired(desired){
  if (desired === null) return;
  desired = clamp(desired, 0, state.shrinkAvailable);
  state.shrinkDesired = desired;
  if (elShrinkDesired) elShrinkDesired.value = String(desired);
  const after = state.totalBefore - desired;
  if (elTotalAfter) elTotalAfter.value = String(after);
  renderLabels(after, desired);
  renderBar(after, desired, state.totalBefore);
}

elDivider?.addEventListener("pointerdown", (e) => {
  if (toIntOrNull(elTotalBefore?.value) === null || toIntOrNull(elShrinkAvail?.value) === null){
    setMsg("bad", "Primero ingresa “Tamaño total antes…” y “Espacio disponible…”.");
    return;
  }
  state.dragging = true;
  elDivider.setPointerCapture?.(e.pointerId);
  e.preventDefault();
});

window.addEventListener("pointermove", (e) => {
  if (!state.dragging) return;
  applyDesired(barClientXToDesiredMb(e.clientX));
});

window.addEventListener("pointerup", () => {
  if (!state.dragging) return;
  state.dragging = false;
  recompute();
});

// Init
resetVisualization();
recompute();
