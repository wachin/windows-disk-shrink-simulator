# reducir-disco

# Simulador “Reducir volumen” (Windows)

Herramienta educativa que simula el comportamiento de la ventana **“Reducir volumen”** del Administrador de discos de Windows.

Este proyecto fue creado para ayudar a entender cómo Windows calcula el espacio reducible antes de instalar Linux o crear nuevas particiones.

⚠️ **Importante:**
Esta página **NO modifica discos reales**. Es solo una simulación visual y educativa.

---

## Objetivo

Cuando Windows muestra la ventana **“Reducir volumen (C:)”**, muchas personas no entienden:

* Por qué no pueden reducir todo el espacio libre.
* Por qué existe un límite que no se puede superar.
* Qué significa el espacio “no reducible”.

Este simulador reproduce ese comportamiento para comprenderlo mejor antes de hacer cambios reales en el disco.

---

## 🖥️ Cómo usar el simulador

### Paso 1 — Abrir Windows

En tu computadora:

1. Presiona `Win + X`
2. Selecciona **Administración de discos**
3. Clic derecho en la partición **Windows (C:)**
4. Selecciona **Reducir volumen…**

Windows mostrará una ventana con 3 valores importantes.

---

### Paso 2 — Copiar los primeros dos valores

Debes copiar **exactamente** (en MB y sin puntos ni comas):

* ✅ **Tamaño total antes de la reducción**
* ✅ **Espacio disponible para la reducción**

Esos dos valores los ingresas en el simulador web.

---

### Paso 3 — Entender la barra del disco

Una vez ingresados los dos primeros valores:

A la derecha aparece la barra de disco simulada.

En esa barra verás:

* 🔵 Zona azul → Windows (después)
* ⚪ Zona gris rayada → Espacio vacío para Linux
* 🎚️ Un pequeño control deslizante (divisor)

Ese pequeño control se llama:

> **Divisor de partición** (o simplemente *divisor* / *handle* en términos técnicos).

---

## 🎚️ Cómo mover correctamente el divisor

Debes:

1. Hacer clic sobre el divisor.
2. Mantener presionado el clic.
3. Arrastrarlo hacia la derecha.

❗ No podrás moverlo hacia la izquierda más allá del límite.

---

## ❓ ¿Por qué no se puede mover hacia la izquierda?

Porque Windows ya hizo su cálculo interno.

Windows analiza el disco y detecta archivos que **no pueden moverse**, por ejemplo:

* Archivo de paginación (pagefile.sys)
* Hibernación
* Metadatos del sistema
* Fragmentos no desplazables
* Estructuras internas del sistema NTFS

Por eso aparece un límite máximo.

Ese límite es exactamente el valor que Windows muestra como:

> **“Espacio disponible para la reducción”**

Ese número es el máximo que Windows permite reducir en ese momento.

**Excepto que.-** uses un software de partición de terceros que puede fácilmente reducir (pero se toma su tiempo) un volumen o reducir la partición de archivos inamovibles (los mueve automáticamente) a través de la función Redimensionar partición, como lo hace [AOMEI Partition Assistant](https://www.diskpart.com/es/articles/reducir-volumen-con-archivos-inamovibles-7400-tc.html)  

---

## 📋 Botón “Copiar”

El campo:

> “Tamaño del espacio que desea reducir”

incluye un botón **Copiar**.

Este botón:

* Copia el valor automáticamente al portapapeles.
* Permite pegarlo directamente en la ventana real de Windows.
* Funciona en HTTPS (GitHub Pages) y tiene método alternativo de compatibilidad.

---

## 📱 Uso en móvil

El diseño es adaptable (responsive):

* En computadoras → se muestra en dos columnas.
* En celular → todo se muestra en una sola columna.

Primero aparece el simulador y debajo el resultado.

---

## 🛠️ Cómo está construido

* HTML
* CSS (estilo visual tipo Windows 10)
* JavaScript (lógica del divisor y cálculos)
* Clipboard API para copiar valores

No requiere backend ni instalación.

---

## 📘 Concepto importante

Muchas personas creen que si tienen, por ejemplo:

Espacio libre: 250 GB

Podrán reducir 250 GB completos.

Pero Windows no calcula el espacio libre visible.
Calcula el **espacio reducible real**, considerando la ubicación física de los archivos en el disco.

Eso es lo que este simulador ayuda a entender visualmente.

---

## ⚠️ Advertencia

Este simulador es solo educativo.

Antes de modificar tus particiones reales:

* Haz respaldo de tus datos.
* No fuerces reducciones fuera del límite permitido.
* No uses herramientas no confiables.

---

## 📄 Licencia

Proyecto educativo de libre uso, con licencia GPL 3

---
