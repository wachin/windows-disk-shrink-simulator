# Simulador de reducción de disco de Windows

![License](https://img.shields.io/badge/license-GPLv3-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![Built With](https://img.shields.io/badge/built%20with-HTML%2FCSS%2FJS-orange)
![Status](https://img.shields.io/badge/status-Stable-brightgreen)
![Educational](https://img.shields.io/badge/purpose-Educational-blueviolet)

Este simulador fue creado para ayudarte a entender antes de tocar algo importante en tu computadora.
Cambiar particiones sin entender lo que sucede puede ser riesgoso. Aquí podrás aprender sin peligro.

Esta es una herramienta educativa que simula el comportamiento de la ventana **“Reducir volumen”** del Administrador de discos de Windows.

Este proyecto fue creado para ayudar a entender cómo Windows calcula el espacio reducible antes de instalar Linux o crear nuevas particiones:

[https://wachin.github.io/windows-disk-shrink-simulator/](https://wachin.github.io/windows-disk-shrink-simulator/)

⚠️ **Importante:**
Esta página **NO modifica discos reales**. Es solo una simulación visual y educativa.

---

## 🧩 ¿Qué es una partición?

Una partición es una división del disco duro.

Es como si tu disco fuera una torta grande y la cortaras en partes.
Cada parte puede usarse para algo distinto:

- Una parte para Windows
- Otra parte para Linux
- Otra parte para guardar archivos

Cuando reduces un volumen, estás haciendo más pequeña una de esas partes para crear espacio nuevo.

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

❗ No podrás moverlo hacia la izquierda más allá del límite (No se puede reducir el espacio asignado más allá del punto en el que se encuentran los archivos no movibles.)

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

**Excepto que.-** uses un software de partición de terceros que puede reducir un volumen o partición de archivos inamovibles (los mueve automáticamente) a través de la función Redimensionar partición, como lo hace [AOMEI Partition Assistant](https://www.diskpart.com/es/articles/reducir-volumen-con-archivos-inamovibles-7400-tc.html). Pero sin embago, esto para personas sin experiencia podría ser peligroso, y no quiero llevarlos a hacer cosas sin entender los riezgos, ese es un programa que lo pongo aquí porque yo lo he usado, solo que para usarlo hay que entender bien lo que se hace, hay que tener una capacitación, y es imprescindible sacar un respaldo. En Youtube hay videos donde explican cómo usarlo. Lo que no me gusta es que se demora mucho en todo el proceso de reducción y más rápido es usar el programa de Windows mismo.

---

## 📋 Botón “Copiar”

El campo:

> “Tamaño del espacio que desea reducir, en MB”

incluye un botón **Copiar**.

Este botón:

* Copia el valor automáticamente al portapapeles.
* Permite pegarlo directamente en la ventana real de Windows.

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

Windows no solo mira cuánto espacio libre hay.
También revisa dónde están ubicados los archivos dentro del disco.
Si hay archivos importantes al final del disco, no podrá reducir más allá de ellos.

Eso es lo que este simulador ayuda a entender visualmente.

---

## ⚠️ Explicación de la advertencia oficial de Microsoft

La [documentación de Microsoft](https://learn.microsoft.com/es-es/windows-server/storage/disk-management/shrink-a-basic-volume) incluye la siguiente advertencia:

> "Si la partición es una partición sin formato que contiene datos, como un archivo de base de datos, reducirla podría destruir los datos".

**¿Qué significa esto?**  

Esta advertencia se refiere específicamente a las **particiones sin formato reconocible por Windows**, es decir, no se refiere al "Disco C:" que un usuario normal usa, sino a otra partición que no está formateada como NTFS

Ejemplo típico en servidores:  

- El administrador crea un disco adicional.  
- Ese disco NO se formatea con NTFS.  
- Se entrega directamente al motor de base de datos.  
- SQL Server escribe datos directamente a nivel de bloque.  

En ese caso:

- Windows no ve archivos.  
- No hay MFT (Tabla Maestra de Archivos)  
- No hay estructura NTFS.  
- El volumen aparece como RAW.  
- 

Pero SQL Server sí sabe qué bloques contienen datos.

Una partición sin formato es una partición que:

- No utiliza un sistema de archivos reconocido (NTFS, FAT32, exFAT).  
- Es utilizada directamente por software especializado a nivel de bloque.  
- Usa un formato no reconocible para Windows (como también puede ser las particiones de Linux, ej: ext4, y otras)  

**¿Por qué la reducción podría destruir datos?**  

Al reducir una partición NTFS normal, Windows:

1. Lee los metadatos del sistema de archivos (MFT).  
2. Sabe dónde se encuentran los archivos.  
3. Mueve los archivos movibles si es necesario.  
4. Reduce el tamaño de la partición de forma segura.  

Sin embargo, en una partición RAW:

- No existe una estructura de sistema de archivos.  
- Windows no puede identificar qué bloques contienen datos críticos.  
- La operación de reducción puede atravesar bloques de datos activos.  
- Esto puede provocar una pérdida irreversible de datos.  

**¿Aplica esto a usuarios domésticos típicos?**  

Si está reduciendo:

- La partición del sistema de Windows (C:)  
- Una partición de datos NTFS estándar  

Esta advertencia no se aplica.

Se refiere principalmente a:

- Servidores de bases de datos que utilizan almacenamiento sin procesar  
- Sistemas industriales  
- Sistemas integrados  
- Configuraciones de almacenamiento especializadas  

**Práctica recomendada**  

Incluso al reducir particiones NTFS estándar, se recomienda encarecidamente:

- Realizar una copia de seguridad de los datos importantes (Ej: Tesis, tareas, deberes, trabajos, diarios, ediciones de audio, video, etc).  
- Garantizar la estabilidad del sistema.  
- Evitar interrupciones de energía durante la operación.  

Los cambios en la partición del disco modifican la estructura del dispositivo de almacenamiento, y fallos inesperados (como un corte de energía) pueden causar daños.

Si se corta la energía eléctrica mientras Windows está reduciendo el volumen:

- El sistema podría dejar de arrancar.  
- La partición podría dañarse.  
- Se podrían perder archivos.  

Por eso es recomendable:

- Usar una laptop con batería cargada.  
- O tener un UPS si es computadora de escritorio.  

---

## 📄 Licencia

Proyecto educativo de libre uso, con licencia GPL 3

---
