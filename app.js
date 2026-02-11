/**
 * Simulador de "Reducir volumen" (Windows 10)
 * - Total antes (MB): el usuario lo escribe
 * - Disponible para reducir (MB): el usuario lo escribe
 * - Desea reducir (MB): controlado por slider/entrada, solo puede DISMINUIR desde el máximo
 * - Total después (MB) = totalAntes - reducir
 *
 * Nota: Windows muestra MB sin separadores de miles, por eso aquí también.
 */

const $ = (id) => document.getElementById(id);

const totalBeforeEl = $("totalBefore");
const availableEl   = $("available");
const shrinkEl      = $("shrink");
const sliderEl      = $("slider");
const maxBtnEl      = $("maxBtn");

const totalAfterEl  = $("totalAfter");
const linuxSpaceEl  = $("linuxSpace");

const beforeTotalEl = $("beforeTotal");
const afterWinMBEl  = $("afterWinMB");
const afterLinuxMBEl= $("afterLinuxMB");

const afterWinSeg   = $("afterWin");
const afterFreeSeg  = $("afterFree");
const handleEl      = $("handle");

function toInt(v){
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return NaN;
  return Math.floor(n);
}

function clamp(n, min, max){
  return Math.min(max, Math.max(min, n));
}

function fmtMB(n){
  // Sin separadores (igual que Windows en esta ventana)
  return String(n);
}

function setReduceToMax(){
  const totalBefore = Math.max(1, toInt(totalBeforeEl.value) || 1);
  let available = toInt(availableEl.value);
  if (!Number.isFinite(available) || available < 0) available = 0;

  // Windows no puede permitir reducir más que el total-1, pero aquí lo limitamos simple:
  available = clamp(available, 0, totalBefore - 1);

  sliderEl.max = String(available);
  shrinkEl.max = String(available);

  // al abrir la ventana, Windows suele poner el máximo por defecto
  sliderEl.value = String(available);
  shrinkEl.value = String(available);

  render();
}

function syncConstraints(){
  const totalBefore = Math.max(1, toInt(totalBeforeEl.value) || 1);

  let available = toInt(availableEl.value);
  if (!Number.isFinite(available) || available < 0) available = 0;

  // No puede ser mayor que totalBefore-1 (para que Windows no quede en 0)
  available = clamp(available, 0, totalBefore - 1);
  availableEl.value = String(available);

  sliderEl.max = String(available);
  shrinkEl.max = String(available);

  // Ajustar reduce actual dentro de rango
  let shrink = toInt(shrinkEl.value);
  if (!Number.isFinite(shrink) || shrink < 0) shrink = available;

  shrink = clamp(shrink, 0, available);
  shrinkEl.value = String(shrink);
  sliderEl.value = String(shrink);
}

function render(){
  syncConstraints();

  const totalBefore = Math.max(1, toInt(totalBeforeEl.value) || 1);
  const available = toInt(availableEl.value) || 0;
  const shrink = toInt(shrinkEl.value) || 0;

  // cálculos
  const totalAfter = totalBefore - shrink;
  const linuxSpace = shrink;

  // textos
  beforeTotalEl.textContent = `${fmtMB(totalBefore)} MB`;
  totalAfterEl.textContent  = fmtMB(totalAfter);
  linuxSpaceEl.textContent  = fmtMB(linuxSpace);

  afterWinMBEl.textContent   = `${fmtMB(totalAfter)} MB`;
  afterLinuxMBEl.textContent = `${fmtMB(linuxSpace)} MB`;

  // proporciones (después)
  const winPct  = (totalAfter / totalBefore) * 100;
  const freePct = (linuxSpace / totalBefore) * 100;

  afterWinSeg.style.width  = `${winPct}%`;
  afterFreeSeg.style.width = `${freePct}%`;

  // handle en la frontera real (porcentaje del Windows)
  handleEl.style.left = `${winPct}%`;

  // Mensaje de “límite” en el input (opcional visual)
  shrinkEl.title = `Máximo permitido: ${fmtMB(available)} MB`;
  sliderEl.title = shrinkEl.title;
}

// Eventos
totalBeforeEl.addEventListener("input", render);
availableEl.addEventListener("input", render);

// Si el usuario escribe manualmente el valor de reducir:
shrinkEl.addEventListener("input", () => {
  // no permitir que escriba más que el máximo
  const max = toInt(sliderEl.max) || 0;
  let v = toInt(shrinkEl.value);
  if (!Number.isFinite(v)) v = max;
  v = clamp(v, 0, max);
  shrinkEl.value = String(v);
  sliderEl.value = String(v);
  render();
});

// Slider: con direction: rtl, mover a la derecha disminuye
sliderEl.addEventListener("input", () => {
  shrinkEl.value = sliderEl.value;
  render();
});

maxBtnEl.addEventListener("click", setReduceToMax);

// Inicial
setReduceToMax();
