
/**
 * Simulador de "Reducir volumen" (Windows 10)
 * - Total antes (MB): el usuario lo escribe
 * - Disponible para reducir (MB): el usuario lo escribe (Windows lo calcula)
 * - Desea reducir (MB): inicia AUTOMÁTICAMENTE igual a "Disponible"
 *   y el usuario solo puede DISMINUIR (como en Windows).
 * - Total después (MB) = totalAntes - reducir
 *
 * Los números se muestran en MB sin separadores.
 */

const $ = (id) => document.getElementById(id);

const totalBeforeEl = $("totalBefore");
const availableEl   = $("available");
const shrinkEl      = $("shrink");
const maxBtnEl      = $("maxBtn");
const copyBtnEl     = $("copyBtn");
const toastEl       = $("toast");

const totalAfterEl  = $("totalAfter");
const linuxSpaceEl  = $("linuxSpace");

const beforeTotalEl = $("beforeTotal");
const afterWinMBEl  = $("afterWinMB");
const afterLinuxMBEl= $("afterLinuxMB");

const afterBarEl    = $("afterBar");
const afterWinSeg   = $("afterWin");
const afterFreeSeg  = $("afterFree");
const handleEl      = $("handle");

let maxShrink = 0;
let userTouchedShrink = false;

function toInt(v){
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? Math.floor(n) : NaN;
}
function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }
function fmtMB(n){ return String(n); }

function setHandlePositionByWinPct(winPct){
  // Posiciona el handle usando píxeles y lo “clampa” para que nunca se quede medio fuera.
  const rect = afterBarEl.getBoundingClientRect();
  if (!rect.width) {
    setHandlePositionByWinPct(winPct);
  return;
  }

  const handleW = handleEl.getBoundingClientRect().width || 16;
  const half = handleW / 2;

  const x = (rect.width * (winPct / 100));
  const xClamped = clamp(x, half, rect.width - half);

  handleEl.style.left = `${xClamped}px`;
}

function showToast(msg){
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1400);
}

function computeConstraints(){
  const totalBefore = Math.max(1, toInt(totalBeforeEl.value) || 1);

  let available = toInt(availableEl.value);
  if (!Number.isFinite(available) || available < 0) available = 0;

  // Nunca permitir que "Disponible" sea mayor que totalBefore-1
  available = clamp(available, 0, totalBefore - 1);
  availableEl.value = String(available);

  maxShrink = available;

  // input reduce limitado al máximo
  shrinkEl.min = "0";
  shrinkEl.max = String(maxShrink);

  // ARIA del handle
  handleEl.setAttribute("aria-valuemin", "0");
  handleEl.setAttribute("aria-valuemax", String(maxShrink));

  return { totalBefore, available };
}

function setShrink(v, {fromUser=false} = {}){
  computeConstraints();
  let value = toInt(v);
  if (!Number.isFinite(value)) value = maxShrink;

  value = clamp(value, 0, maxShrink);

  if (fromUser) userTouchedShrink = true;

  shrinkEl.value = String(value);
  render();
}

function setShrinkToMax({resetUserTouched=false} = {}){
  if (resetUserTouched) userTouchedShrink = false;
  setShrink(maxShrink, {fromUser:false});
}

function render(){
  const { totalBefore } = computeConstraints();

  let shrink = toInt(shrinkEl.value);
  if (!Number.isFinite(shrink)) shrink = maxShrink;
  shrink = clamp(shrink, 0, maxShrink);
  shrinkEl.value = String(shrink);

  const totalAfter = totalBefore - shrink;

  beforeTotalEl.textContent = `${fmtMB(totalBefore)} MB`;
  totalAfterEl.textContent  = fmtMB(totalAfter);
  linuxSpaceEl.textContent  = fmtMB(shrink);

  afterWinMBEl.textContent   = `${fmtMB(totalAfter)} MB`;
  afterLinuxMBEl.textContent = `${fmtMB(shrink)} MB`;

  const winPct  = (totalAfter / totalBefore) * 100;
  const freePct = (shrink / totalBefore) * 100;

  afterWinSeg.style.width  = `${winPct}%`;
  afterFreeSeg.style.width = `${freePct}%`;

  setHandlePositionByWinPct(winPct);
  handleEl.setAttribute("aria-valuenow", String(shrink));

  shrinkEl.title = `Máximo permitido: ${fmtMB(maxShrink)} MB`;
}

/* --- Drag sin saltos bruscos --- */
function percentFromClientX(clientX){
  const rect = afterBarEl.getBoundingClientRect();
  const w = rect.width || 0;
  if (!w) return 1;

  const handleW = handleEl.getBoundingClientRect().width || 16;
  const half = handleW / 2;

  // Convertimos clientX a posición del centro del handle, y la clampamos al rango visible
  const xCenter = clamp(clientX - rect.left, half, w - half);

  // Volvemos a porcentaje 0..1 dentro del ancho total (referencia absoluta de barra)
  return xCenter / w;
}

function clampPercentToAllowed(p){
  const { totalBefore } = computeConstraints();
  const pMin = 1 - (maxShrink / totalBefore); // reduce = maxShrink
  const pMax = 1;                             // reduce = 0
  return clamp(p, pMin, pMax);
}

function shrinkFromPercent(p){
  const { totalBefore } = computeConstraints();
  // p = totalAfter/totalBefore = 1 - shrink/totalBefore  => shrink = totalBefore*(1-p)
  let shrink = Math.round(totalBefore * (1 - p));
  return clamp(shrink, 0, maxShrink);
}

let dragging = false;

function startDrag(e){
  dragging = true;
  userTouchedShrink = true;
  afterBarEl.setPointerCapture?.(e.pointerId);
  moveDrag(e);
}
function moveDrag(e){
  if (!dragging) return;
  const p = clampPercentToAllowed(percentFromClientX(e.clientX));
  const shrink = shrinkFromPercent(p);
  shrinkEl.value = String(shrink);
  render();
}
function endDrag(e){
  dragging = false;
  afterBarEl.releasePointerCapture?.(e.pointerId);
}

afterBarEl.addEventListener("pointerdown", startDrag);
afterBarEl.addEventListener("pointermove", moveDrag);
afterBarEl.addEventListener("pointerup", endDrag);
afterBarEl.addEventListener("pointercancel", endDrag);

// Teclado (para accesibilidad): ← aumenta (hasta máx), → disminuye
handleEl.addEventListener("keydown", (e) => {
  const cur = toInt(shrinkEl.value) || 0;
  if (e.key === "ArrowRight") { e.preventDefault(); setShrink(cur - 1, {fromUser:true}); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); setShrink(cur + 1, {fromUser:true}); }
  if (e.key === "Home")       { e.preventDefault(); setShrinkToMax(); }
  if (e.key === "End")        { e.preventDefault(); setShrink(0, {fromUser:true}); }
});

// Input manual
shrinkEl.addEventListener("input", () => setShrink(shrinkEl.value, {fromUser:true}));

// Si cambia "Total antes": si el usuario no tocó la reducción, reset a máximo (como Windows al abrir)
totalBeforeEl.addEventListener("input", () => {
  computeConstraints();
  if (!userTouchedShrink) setShrinkToMax();
  else render();
});

// Si cambia "Disponible": Windows rellena automáticamente el campo de reducción con ese valor
availableEl.addEventListener("input", () => {
  computeConstraints();
  setShrinkToMax();
});

maxBtnEl.addEventListener("click", () => setShrinkToMax());

// Copiar al portapapeles
copyBtnEl.addEventListener("click", async () => {
  const v = fmtMB(toInt(shrinkEl.value) || 0);
  try{
    await navigator.clipboard.writeText(v);
    showToast("✅ Copiado al portapapeles");
  }catch{
    // fallback
    shrinkEl.focus();
    shrinkEl.select?.();
    document.execCommand?.("copy");
    showToast("✅ Copiado");
  }
});

// Inicio: simula Windows (Reducir inicia en el máximo permitido)
computeConstraints();
setShrinkToMax({resetUserTouched:true});
render();
