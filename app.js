(() => {
  const $ = (id) => document.getElementById(id);

  const beforeMb = $("beforeMb");
  const availableMb = $("availableMb");
  const reduceMb = $("reduceMb");
  const reduceSlider = $("reduceSlider");
  const afterMb = $("afterMb");
  const status = $("status");

  const pasteBefore = $("pasteBefore");
  const pasteAvail = $("pasteAvail");
  const maxReduce = $("maxReduce");
  const copyAfter = $("copyAfter");

  // Quita todo lo que no sea dígito.
  // Además: Windows muestra MB sin separadores (sin puntos/comas), así que lo forzamos.
  function toIntMB(value) {
    const s = String(value ?? "").replace(/[^\d]/g, "");
    if (!s) return NaN;
    // Evita números absurdamente largos por pegados raros
    if (s.length > 12) return NaN;
    return Number.parseInt(s, 10);
  }

  function setMB(input, n) {
    if (!Number.isFinite(n)) {
      input.value = "";
      return;
    }
    // Sin puntos, sin comas.
    input.value = String(Math.max(0, Math.trunc(n)));
  }

  function clamp(n, min, max) {
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function explain(before, available, reduce, after) {
    const okNumbers = Number.isFinite(before) && Number.isFinite(available);
    if (!okNumbers) {
      status.className = "status";
      status.innerHTML =
        `👋 Ingresa los dos valores de Windows arriba (en MB, sin puntos).<br>
         Luego podrás ajustar cuánto <strong>reducir</strong> (hasta el máximo permitido).`;
      return;
    }

    // Validaciones básicas (Windows normalmente no te dará available > before, pero mejor avisar).
    if (available > before) {
      status.className = "status warn";
      status.innerHTML =
        `⚠️ Tus valores parecen raros: el <strong>Disponible</strong> no debería ser mayor que el <strong>Antes</strong>.<br>
         Aun así, el simulador aplicará la regla: <code>Reducir ≤ Disponible</code>.`;
      return;
    }

    // Mensaje principal con cálculo paso a paso
    status.className = "status ok";
    const percent = before > 0 ? Math.round((reduce / before) * 100) : 0;

    status.innerHTML =
      `✅ Simulación lista (como Windows).<br>
       • Regla: <strong>Reducir</strong> no puede superar <strong>${available}</strong> MB.<br>
       • Cálculo: <code>Después = Antes − Reducir</code> → <strong>${before}</strong> − <strong>${reduce}</strong> = <strong>${after}</strong> MB.<br>
       • Estás recortando aprox. <strong>${percent}%</strong> del tamaño “Antes”.`;
  }

  function recalc({ lockIncrease = true } = {}) {
    const before = toIntMB(beforeMb.value);
    const available = toIntMB(availableMb.value);

    // Si no hay datos suficientes, limpiar dependientes
    if (!Number.isFinite(before) || !Number.isFinite(available)) {
      reduceSlider.max = "0";
      reduceSlider.value = "0";
      reduceMb.value = "";
      afterMb.value = "";
      explain(before, available, 0, 0);
      return;
    }

    // Windows: máximo reducible = available (no más)
    const max = Math.max(0, Math.trunc(available));

    // Slider
    reduceSlider.min = "0";
    reduceSlider.max = String(max);

    // Reduce actual: si el usuario no puso nada, por defecto usamos el máximo (como cuando Windows llena ese campo)
    let currentReduce = toIntMB(reduceMb.value);

    if (!Number.isFinite(currentReduce)) {
      currentReduce = max;
    }

    // Si lockIncrease está activo, no permitimos que el usuario lo suba por encima del máximo.
    currentReduce = clamp(currentReduce, 0, max);

    // Set values (sin separadores)
    setMB(reduceMb, currentReduce);
    reduceSlider.value = String(currentReduce);

    // After
    const after = Math.max(0, Math.trunc(before) - currentReduce);
    setMB(afterMb, after);

    explain(before, available, currentReduce, after);
  }

  // “No aumentar”: si el usuario intenta escribir un número mayor al máximo, lo bajamos inmediatamente.
  function onReduceInput() {
    const before = toIntMB(beforeMb.value);
    const available = toIntMB(availableMb.value);
    const max = Number.isFinite(available) ? Math.max(0, Math.trunc(available)) : 0;

    let r = toIntMB(reduceMb.value);
    if (!Number.isFinite(r)) r = 0;

    // Aquí se aplica la regla: no subir del máximo.
    r = clamp(r, 0, max);
    setMB(reduceMb, r);
    reduceSlider.value = String(r);

    // Recalcular después
    if (Number.isFinite(before)) {
      const after = Math.max(0, Math.trunc(before) - r);
      setMB(afterMb, after);
      explain(before, available, r, after);
    } else {
      setMB(afterMb, NaN);
      explain(before, available, r, 0);
    }
  }

  function onAnyInputSanitize(e) {
    // Si el usuario pega con puntos/comas/espacios, lo limpiamos al vuelo.
    const n = toIntMB(e.target.value);
    if (Number.isFinite(n)) setMB(e.target, n);
  }

  // Clipboard helpers
  async function pasteInto(input) {
    try {
      const text = await navigator.clipboard.readText();
      input.value = text;
      onAnyInputSanitize({ target: input });
      recalc();
    } catch {
      // Si el permiso falla, no rompemos nada.
      input.focus();
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      status.className = "status ok";
      status.innerHTML = `✅ Copiado al portapapeles: <strong>${text}</strong>`;
    } catch {
      // fallback: seleccionar
      afterMb.focus();
      afterMb.select();
    }
  }

  // Events
  beforeMb.addEventListener("input", (e) => { onAnyInputSanitize(e); recalc(); });
  availableMb.addEventListener("input", (e) => { onAnyInputSanitize(e); recalc(); });

  reduceMb.addEventListener("input", (e) => {
    onAnyInputSanitize(e);
    onReduceInput();
  });

  reduceSlider.addEventListener("input", () => {
    // slider controla reduce (siempre dentro del rango)
    const r = Number.parseInt(reduceSlider.value, 10) || 0;
    setMB(reduceMb, r);
    recalc();
  });

  maxReduce.addEventListener("click", () => {
    const available = toIntMB(availableMb.value);
    if (Number.isFinite(available)) {
      setMB(reduceMb, available);
      recalc();
    }
  });

  pasteBefore.addEventListener("click", () => pasteInto(beforeMb));
  pasteAvail.addEventListener("click", () => pasteInto(availableMb));

  copyAfter.addEventListener("click", () => {
    if (afterMb.value) copyText(afterMb.value);
  });

  // Init
  recalc();
})();
