# Arquitectura

## Entrypoints

`entrypoints.js` contiene toda la interacción usuario-código: event listeners
del DOM (`click`, `input`, `submit`, etc.).
Los entrypoints (salvo excepciones justificadas) solo modifican el **State
global**. No contienen lógica compleja; delegan en funciones importadas
(`searchMovies`, `shiftBackdrop`, `handleFlyerDownload`, etc.).

## DOM

- El DOM se actualiza desde un **único punto**: la función
  `updateDOMFromState()` en `storage.js`.
- Lee las claves `SearchState.DOM` y `DesignState.DOM`, donde cada clave es un
  `id` de elemento HTML y su valor es un diccionario de propiedades a aplicar
  (`textContent`, `style`, `src`, etc.).
- Para propiedades de tipo objeto (ej. `style`), usa `Object.assign` para
  mergear en lugar de pisar.

## Estados globales

Usamos **dos estados globales**:
  * `SearchState`
  * `DesignState` **Cómo funcionan:**
- Son `Proxy` que interceptan toda asignación (`set`).
- Cada `set` dispara automáticamente dos efectos: persistir en `localStorage` y
  actualizar el DOM via `updateDOMFromState()`.
- `DesignState` usa un **proxy recursivo** (`createDeepProxy`) para detectar
  cambios en propiedades anidadas (ej. `DesignState.DOM.title.textContent =
  "..."`). `SearchState` usa un Proxy top-level. **Qué hacemos:**
- El proxy centraliza toda la persistencia.
- Toda la mutación de estado es directa: asignamos a propiedades del Proxy, ej.
  `DesignState.DOM.title = { ... };`, `SearchState.currentBackdrop = 0;`, etc.
- Los defaults viven en `defaultSearchState`/`defaultDesignState` y se mergean
  con lo que hay en `localStorage` al iniciar. **Qué evitamos:**
- No hay estado duplicado ni sincronización manual entre variables sueltas y la
  UI.
- No actualizamos el DOM directamente desde los event handlers — siempre a
  través del State para mantener el flujo unidireccional.

```
Usuario --> GUI HTML --> entrypoints --> State global |--> se replica en el localStorage
                                                     |--> actualiza el DOM 
```
