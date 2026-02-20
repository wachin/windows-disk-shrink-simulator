# Guía para trabajar con ramas (Git Branch Workflow)
Proyecto: Simulador “Reducir volumen” (Windows)

Este documento explica cómo hacer modificaciones al proyecto sin afectar la versión estable publicada en GitHub Pages.

---

## ¿Por qué usar ramas?

La rama `main` es la versión estable del proyecto.
Desde ella se publica la página en GitHub Pages.

Si hacemos cambios directamente en `main`:

- ⚠️ Podemos romper la página pública
- ⚠️ Podemos subir errores sin darnos cuenta

Por eso usamos una rama de desarrollo.

---

# Flujo recomendado

```
main (estable y publicada)
↓
crear nueva rama
↓
hacer cambios
↓
probar
↓
merge a main
↓
GitHub Pages se actualiza automáticamente
```

---

# Paso 1 — Asegurarse de estar en main

```bash
git checkout main
git pull origin main
```

Esto garantiza que trabajamos con la versión más reciente.

---

# Paso 2 — Crear una nueva rama

Ejemplo:

```bash
git checkout -b mejoras-ui
```

Esto:

* Crea la rama
* Cambia automáticamente a ella

Verifica:

```bash
git branch
```

La rama activa tendrá un `*`.

---

# Paso 3 — Hacer modificaciones

Puedes modificar:

* `index.html`
* `style.css`
* `app.js`

Ejemplos de cambios comunes:

* Ajustes visuales en `style.css`
* Mejoras en validaciones dentro de `app.js`
* Cambios de texto en `index.html`

Cuando termines:

```bash
git add .
git commit -m "Mejoras en interfaz y validaciones"
```

---

# Paso 4 — Subir la rama a GitHub

```bash
git push origin mejoras-ui
```

Ahora la rama existe en GitHub.

Puedes verla desde el selector de ramas en el repositorio.

---

# Paso 5 — Probar antes de unir

Opciones:

1. Clonar en otra carpeta y probar localmente
2. Abrir el archivo `index.html` directamente en el navegador
3. Crear un Pull Request para revisión

---

# Paso 6 — Unir con main (Merge)

Cuando todo esté funcionando correctamente:

```bash
git checkout main
git pull origin main
git merge mejoras-ui
git push origin main
```

GitHub Pages se actualizará automáticamente.

---

# ¿Qué hacer si hay conflictos?

Git mostrará algo como:

```
<<<<<<< HEAD
=======
>>>>>>> mejoras-ui
```

Debes:

1. Editar manualmente el archivo
2. Eliminar las marcas
3. Guardar
4. Ejecutar:

```bash
git add .
git commit -m "Conflicto resuelto"
git push origin main
```

---

# Paso opcional — Eliminar la rama

Si ya no se necesita:

```bash
git branch -d mejoras-ui
git push origin --delete mejoras-ui
```

---

# Reglas importantes del proyecto

1. ❌ No modificar directamente `main`
2. ✔️ Siempre usar ramas
3. ✔️ Probar antes de hacer merge
4. ✔️ Mantener commits descriptivos
5. ✔️ No cambiar nombres de archivos críticos:

   * index.html
   * style.css
   * app.js
   * logo.svg

GitHub Pages depende de esos nombres exactos.

---

# Consejo Profesional

Para cambios grandes:

* Crear ramas con nombres descriptivos:

  * `feature/divisor-teclado`
  * `fix/validacion-mb`
  * `refactor/barra-disco`

Esto mantiene el proyecto organizado.

---


---

Si quieres, puedo ahora:

- 🔹 Mejorar el README principal para que enlace a esta guía
- 🔹 Crear una versión más profesional estilo "Contributing.md"
- 🔹 Hacer un flujo con Pull Requests (estilo proyecto open source real)
- 🔹 Enseñarte cómo activar GitHub Actions para probar automáticamente el HTML

