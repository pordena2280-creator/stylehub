

Lo que te ocurre es que Kiro, Cursor, Claude Code, Windsurf o incluso ChatGPT no mantienen automáticamente el contexto técnico completo entre conversaciones nuevas, aunque hayas creado un spec excelente.

Lo que normalmente hacen los equipos senior es crear un archivo de Project Context / Master Memory que se carga al inicio de cada sesión.

La idea no es que la IA "recuerde", sino que lea siempre el mismo contexto maestro.

Te recomiendo crear algo como:

.kiro/
├── specs/
├── memory/
│   ├── project-context.md
│   ├── architecture.md
│   ├── current-status.md
│   ├── known-issues.md
│   └── roadmap.md

Y luego usar un prompt maestro como este:



==============================


# MASTER MEMORY PROMPT

Antes de responder cualquier cosa debes leer completamente:

.kiro/memory/project-context.md
.kiro/memory/architecture.md
.kiro/memory/current-status.md
.kiro/memory/known-issues.md
.kiro/specs/ecommerce-produccion-completo/requirements.md
.kiro/specs/ecommerce-produccion-completo/design.md
.kiro/specs/ecommerce-produccion-completo/tasks.md

Considera estos documentos como la fuente de verdad del proyecto.

No debes asumir arquitectura nueva sin verificar estos archivos.

Debes mantener consistencia con:

* React
* Vite
* TypeScript
* Tailwind
* CSS por componente
* CSS global
* Supabase
* Stripe
* SEO
* CMS
* CRM

Antes de crear código:

1. Revisar estado actual del proyecto.
2. Revisar tareas completadas.
3. Revisar tareas pendientes.
4. Revisar problemas abiertos.
5. Revisar errores conocidos.
6. Revisar arquitectura definida.

Cuando modifiques algo:

* Actualizar current-status.md
* Actualizar known-issues.md
* Marcar tareas completadas en tasks.md
* Mantener compatibilidad con el diseño definido.

Nunca eliminar código sin verificar dependencias.

Siempre generar:

* Archivos modificados
* Razón del cambio
* Riesgos
* Impacto
* Próximos pasos

Trabaja como arquitecto principal del proyecto y conserva continuidad entre sesiones.






========================================



Además, crea un archivo llamado:

.kiro/memory/project-context.md

con algo parecido a:

# Ecommerce Project Memory

## Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- CSS Modules
- CSS Global
- Supabase
- PostgreSQL
- Stripe

## Objetivo

Ecommerce completo listo para producción.

## Estado Actual

- Spec generado
- Auditoría iniciada
- CRUD parcialmente funcional
- Problemas de imágenes pendientes
- Stripe pendiente revisión
- SEO pendiente optimización

## Regla Importante

Cada componente debe conservar su sistema actual de estilos:

- Tailwind
- CSS local
- CSS global

No migrar estilos sin justificación.

## Problemas Conocidos

1. Imágenes no cargan correctamente en frontend.
2. Galería lenta.
3. Algunas categorías cargan lentamente.
4. Login Google pendiente validación.
5. Stripe pendiente auditoría.

De esta forma, aunque abras 20 conversaciones nuevas, solo le dices a la IA:


=============

"Lee primero .kiro/memory y luego continúa el proyecto."

=============


y recuperará mucho mejor el contexto del ecommerce. Lo más cercano a una "memoria permanente" para proyectos grandes es mantener estos archivos de contexto vivos y actualizados dentro del repositorio.



========================================




Si los archivos ya existen pero están vacíos, lo ideal es convertirlos en una fuente de verdad del proyecto. No pongas información genérica; pon información que ayude a cualquier IA a entender exactamente dónde está el proyecto y qué debe hacer.

Puedes empezar con esta estructura:

project-context.md
# Project Context

## Nombre del Proyecto
[Nombre del ecommerce]

## Objetivo
Crear un ecommerce completo listo para producción.

## Stack Tecnológico

Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS
- CSS Global
- CSS por componente

Backend:
- Supabase
- PostgreSQL
- Edge Functions (si existen)

Pagos:
- Stripe
- Stripe Elements

Autenticación:
- Supabase Auth
- Google OAuth

## Arquitectura

Carpetas principales:

src/
components/
pages/
hooks/
services/
contexts/
stores/
supabase/
styles/
admin/

## Reglas del Proyecto

- No eliminar código sin analizar dependencias.
- Mantener TypeScript estricto.
- Mantener compatibilidad móvil.
- Priorizar SEO.
- Priorizar rendimiento.
- Mantener diseño existente salvo errores.
architecture.md
# Arquitectura

## Frontend

React + Vite

### Componentes

- Header
- Footer
- ProductCard
- ProductGallery
- ProductDetail
- Cart
- Checkout
- Login
- Register
- AdminDashboard

## Estado de Estilos

Algunos componentes usan:

- Tailwind
- CSS propio
- CSS global

La IA debe detectar qué sistema usa cada componente antes de modificarlo.

## Flujo Ecommerce

Cliente

Home
→ Categoría
→ Producto
→ Carrito
→ Checkout
→ Stripe
→ Pedido

Admin

Login
→ Dashboard
→ Productos
→ Categorías
→ Pedidos
→ Clientes
current-status.md

Este es el más importante.

# Estado Actual

Fecha última actualización:
2026-06-03

## Completado

- Spec generado
- Requirements creados
- Design creado
- Tasks creadas

## En progreso

- Auditoría frontend
- Auditoría Supabase

## Pendiente

- Login Google
- Stripe
- SEO
- CMS
- CRM
- Facturación

## Build

Estado:
❌ No compila correctamente

Errores conocidos:

1. [error]
2. [error]
3. [error]

## Prioridad Actual

Resolver errores que impiden build.
known-issues.md

Aquí debes poner todos los problemas reales.

# Problemas Conocidos

## Imágenes

Problema:
Las imágenes no aparecen correctamente en frontend.

Síntomas:

- Algunas aparecen vacías.
- Al hacer clic se visualizan.
- Galería lenta.
- Miniaturas fallan.

Posibles causas:

- URL incorrecta.
- Bucket Supabase.
- Policies.
- Render React.

---

## Categorías

Problema:

Carga lenta.

Estado:

Pendiente revisión.

---

## Login Google

Problema:

Pendiente validación completa.

---

## Stripe

Problema:

Pendiente auditoría.

---

## SEO

Problema:

No auditado completamente.
roadmap.md
# Roadmap

## Fase 1

- Corregir build
- Corregir TypeScript
- Corregir imports

## Fase 2

- Corregir imágenes
- Corregir galerías
- Corregir categorías

## Fase 3

- Login cliente
- Login Google
- Roles admin

## Fase 4

- Stripe
- Checkout
- Facturación

## Fase 5

- CMS
- CRM

## Fase 6

- SEO
- Performance

## Fase 7

- Producción
Un truco muy útil

Cuando una IA te entregue algo importante (por ejemplo: "las 4 cosas que rompen el build"), cópialo inmediatamente a current-status.md o known-issues.md.

Por ejemplo:

## Build Errors

### Error 1

Archivo:
src/pages/Product.tsx

Problema:
Property images does not exist.

Estado:
Pendiente.

---

### Error 2

Archivo:
src/components/Gallery.tsx

Problema:
Import incorrecto.

Estado:
Pendiente.

Así, aunque abras una conversación nueva mañana o la próxima semana, la IA podrá reconstruir el estado del proyecto leyendo esos archivos. Para proyectos grandes de React/Vite/Supabase, esta práctica suele funcionar mejor que depender de la memoria de una conversación individual.




========================================
========================================



Si los archivos ya existen pero están vacíos, lo ideal es convertirlos en una **fuente de verdad del proyecto**. No pongas información genérica; pon información que ayude a cualquier IA a entender exactamente dónde está el proyecto y qué debe hacer.

Puedes empezar con esta estructura:

### `project-context.md`

```md
# Project Context

## Nombre del Proyecto
[Nombre del ecommerce]

## Objetivo
Crear un ecommerce completo listo para producción.

## Stack Tecnológico

Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS
- CSS Global
- CSS por componente

Backend:
- Supabase
- PostgreSQL
- Edge Functions (si existen)

Pagos:
- Stripe
- Stripe Elements

Autenticación:
- Supabase Auth
- Google OAuth

## Arquitectura

Carpetas principales:

src/
components/
pages/
hooks/
services/
contexts/
stores/
supabase/
styles/
admin/

## Reglas del Proyecto

- No eliminar código sin analizar dependencias.
- Mantener TypeScript estricto.
- Mantener compatibilidad móvil.
- Priorizar SEO.
- Priorizar rendimiento.
- Mantener diseño existente salvo errores.
```

---

### `architecture.md`

```md
# Arquitectura

## Frontend

React + Vite

### Componentes

- Header
- Footer
- ProductCard
- ProductGallery
- ProductDetail
- Cart
- Checkout
- Login
- Register
- AdminDashboard

## Estado de Estilos

Algunos componentes usan:

- Tailwind
- CSS propio
- CSS global

La IA debe detectar qué sistema usa cada componente antes de modificarlo.

## Flujo Ecommerce

Cliente

Home
→ Categoría
→ Producto
→ Carrito
→ Checkout
→ Stripe
→ Pedido

Admin

Login
→ Dashboard
→ Productos
→ Categorías
→ Pedidos
→ Clientes
```

---

### `current-status.md`

Este es el más importante.

```md
# Estado Actual

Fecha última actualización:
2026-06-03

## Completado

- Spec generado
- Requirements creados
- Design creado
- Tasks creadas

## En progreso

- Auditoría frontend
- Auditoría Supabase

## Pendiente

- Login Google
- Stripe
- SEO
- CMS
- CRM
- Facturación

## Build

Estado:
❌ No compila correctamente

Errores conocidos:

1. [error]
2. [error]
3. [error]

## Prioridad Actual

Resolver errores que impiden build.
```

---

### `known-issues.md`

Aquí debes poner todos los problemas reales.

```md
# Problemas Conocidos

## Imágenes

Problema:
Las imágenes no aparecen correctamente en frontend.

Síntomas:

- Algunas aparecen vacías.
- Al hacer clic se visualizan.
- Galería lenta.
- Miniaturas fallan.

Posibles causas:

- URL incorrecta.
- Bucket Supabase.
- Policies.
- Render React.

---

## Categorías

Problema:

Carga lenta.

Estado:

Pendiente revisión.

---

## Login Google

Problema:

Pendiente validación completa.

---

## Stripe

Problema:

Pendiente auditoría.

---

## SEO

Problema:

No auditado completamente.
```

---

### `roadmap.md`

```md
# Roadmap

## Fase 1

- Corregir build
- Corregir TypeScript
- Corregir imports

## Fase 2

- Corregir imágenes
- Corregir galerías
- Corregir categorías

## Fase 3

- Login cliente
- Login Google
- Roles admin

## Fase 4

- Stripe
- Checkout
- Facturación

## Fase 5

- CMS
- CRM

## Fase 6

- SEO
- Performance

## Fase 7

- Producción
```

### Un truco muy útil

Cuando una IA te entregue algo importante (por ejemplo: "las 4 cosas que rompen el build"), cópialo inmediatamente a `current-status.md` o `known-issues.md`.

Por ejemplo:

```md
## Build Errors

### Error 1

Archivo:
src/pages/Product.tsx

Problema:
Property images does not exist.

Estado:
Pendiente.

---

### Error 2

Archivo:
src/components/Gallery.tsx

Problema:
Import incorrecto.

Estado:
Pendiente.
```

Así, aunque abras una conversación nueva mañana o la próxima semana, la IA podrá reconstruir el estado del proyecto leyendo esos archivos. Para proyectos grandes de React/Vite/Supabase, esta práctica suele funcionar mejor que depender de la memoria de una conversación individual.



========================================
========================================






Si quieres gastar pocos tokens y avanzar rápido, el error más común es pedir:

"Revisa todo el proyecto y corrige todo."

Eso consume muchísimos tokens porque la IA intenta analizar cientos de archivos a la vez.

Lo más eficiente es trabajar por fases pequeñas y obligar a la IA a generar solo resúmenes técnicos.

1. Crea una regla permanente

Pon esto en project-context.md:

# Reglas de Trabajo

IMPORTANTE:

Para ahorrar contexto y tokens:

- Nunca analizar todo el proyecto simultáneamente.
- Analizar únicamente los archivos necesarios para la tarea actual.
- Entregar resúmenes técnicos breves.
- No repetir información ya documentada.
- Actualizar current-status.md al finalizar cada tarea.
- Actualizar known-issues.md cuando aparezca un nuevo error.
- Mantener respuestas cortas.
- Mostrar únicamente archivos modificados.
- Mostrar únicamente código afectado.
2. Usa prompts de tarea específica

En lugar de:

Revisa todo el ecommerce.

Usa:

Lee project-context.md y current-status.md.

Objetivo:
Corregir únicamente el sistema de imágenes.

No analices Stripe.
No analices SEO.
No analices login.

Entrega:

- causa raíz
- archivos afectados
- cambios necesarios
- nivel de riesgo

máximo 500 palabras.
3. Haz que trabaje como arquitecto

Usa este prompt corto en cada sesión:

Lee primero:

memory/project-context.md
memory/current-status.md
memory/known-issues.md

No reanalices el proyecto completo.

Trabaja únicamente sobre el problema solicitado.

Si necesitas revisar archivos adicionales, indícalos antes de analizarlos.

Responde de forma concisa.
4. Mantén una lista de prioridades

En current-status.md:

# Prioridad Actual

1. Build
2. Imágenes
3. Login Google
4. Stripe
5. SEO

No trabajar en tareas fuera de esta lista.

Así la IA no pierde tiempo proponiendo CMS, CRM, blogs, facturación, etc. cuando todavía hay errores básicos.

5. Pide siempre este formato
Responde únicamente:

1. Problema encontrado
2. Causa raíz
3. Archivos afectados
4. Solución
5. Próximo paso

Máximo 300 palabras.

Esto reduce mucho el consumo.

6. Para Kiro/Cursor/Windsurf

El prompt que suele dar mejor rendimiento es:

Lee:

memory/project-context.md
memory/current-status.md
memory/known-issues.md

Objetivo actual:
[DESCRIBIR SOLO UNA TAREA]

Reglas:

- No analizar todo el proyecto.
- No modificar archivos no relacionados.
- No refactorizar sin necesidad.
- Mostrar únicamente cambios necesarios.
- Actualizar current-status.md.
- Actualizar known-issues.md.
- Priorizar solución mínima funcional.

Si encuentras más problemas, registrarlos pero no corregirlos todavía.

Con esta metodología, en lugar de gastar contexto en 300 archivos, la IA se concentra en 5-10 archivos por tarea, lo que suele reducir mucho el consumo de tokens y permite avanzar más rápido y con menos errores.






==========================================
================***********===============


Si quieres **gastar pocos tokens y avanzar rápido**, el error más común es pedir:

> "Revisa todo el proyecto y corrige todo."

Eso consume muchísimos tokens porque la IA intenta analizar cientos de archivos a la vez.

Lo más eficiente es trabajar por **fases pequeñas** y obligar a la IA a generar solo resúmenes técnicos.

## 1. Crea una regla permanente

Pon esto en `project-context.md`:

```md
# Reglas de Trabajo

IMPORTANTE:

Para ahorrar contexto y tokens:

- Nunca analizar todo el proyecto simultáneamente.
- Analizar únicamente los archivos necesarios para la tarea actual.
- Entregar resúmenes técnicos breves.
- No repetir información ya documentada.
- Actualizar current-status.md al finalizar cada tarea.
- Actualizar known-issues.md cuando aparezca un nuevo error.
- Mantener respuestas cortas.
- Mostrar únicamente archivos modificados.
- Mostrar únicamente código afectado.
```

---

## 2. Usa prompts de tarea específica

En lugar de:

```text
Revisa todo el ecommerce.
```

Usa:

```text
Lee project-context.md y current-status.md.

Objetivo:
Corregir únicamente el sistema de imágenes.

No analices Stripe.
No analices SEO.
No analices login.

Entrega:

- causa raíz
- archivos afectados
- cambios necesarios
- nivel de riesgo

máximo 500 palabras.
```

---

## 3. Haz que trabaje como arquitecto

Usa este prompt corto en cada sesión:

```text
Lee primero:

memory/project-context.md
memory/current-status.md
memory/known-issues.md

No reanalices el proyecto completo.

Trabaja únicamente sobre el problema solicitado.

Si necesitas revisar archivos adicionales, indícalos antes de analizarlos.

Responde de forma concisa.
```

---

## 4. Mantén una lista de prioridades

En `current-status.md`:

```md
# Prioridad Actual

1. Build
2. Imágenes
3. Login Google
4. Stripe
5. SEO

No trabajar en tareas fuera de esta lista.
```

Así la IA no pierde tiempo proponiendo CMS, CRM, blogs, facturación, etc. cuando todavía hay errores básicos.

---

## 5. Pide siempre este formato

```text
Responde únicamente:

1. Problema encontrado
2. Causa raíz
3. Archivos afectados
4. Solución
5. Próximo paso

Máximo 300 palabras.
```

Esto reduce mucho el consumo.

---

## 6. Para Kiro/Cursor/Windsurf

El prompt que suele dar mejor rendimiento es:

```text
Lee:

memory/project-context.md
memory/current-status.md
memory/known-issues.md

Objetivo actual:
[DESCRIBIR SOLO UNA TAREA]

Reglas:

- No analizar todo el proyecto.
- No modificar archivos no relacionados.
- No refactorizar sin necesidad.
- Mostrar únicamente cambios necesarios.
- Actualizar current-status.md.
- Actualizar known-issues.md.
- Priorizar solución mínima funcional.

Si encuentras más problemas, registrarlos pero no corregirlos todavía.
```

Con esta metodología, en lugar de gastar contexto en **300 archivos**, la IA se concentra en **5-10 archivos por tarea**, lo que suele reducir mucho el consumo de tokens y permite avanzar más rápido y con menos errores.



===============***********================
==========================================


6. Para Kiro/Cursor/Windsurf

El prompt que suele dar mejor rendimiento es:


=================


Lee:

memory/project-context.md
memory/current-status.md
memory/known-issues.md

Objetivo actual:
[DESCRIBIR SOLO UNA TAREA]

Reglas:

- No analizar todo el proyecto.
- No modificar archivos no relacionados.
- No refactorizar sin necesidad.
- Mostrar únicamente cambios necesarios.
- Actualizar current-status.md.
- Actualizar known-issues.md.
- Priorizar solución mínima funcional.

Si encuentras más problemas, registrarlos pero no corregirlos todavía.



=============


Con esta metodología, en lugar de gastar contexto en 300 archivos, la IA se concentra en 5-10 archivos por tarea, lo que suele reducir mucho el consumo de tokens y permite avanzar más rápido y con menos errores


==========================================