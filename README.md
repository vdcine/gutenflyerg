
## gutenflyerg
Generador de volantes

## Dev guidelines

* En los html, sólo dejar los style vinculados a posicionamiento
* Que no haya funciones más largas que una pantalla

## Arquitectura

### Entrypoints
`entrypoints.js` contiene toda la interacción usuario-código: event listeners del DOM (`click`, `input`, `submit`, etc.).
- Los entrypoints (salvo excepciones justificadas) solo modifican el **State global**. No contienen lógica compleja; delegan en funciones importadas (`searchMovies`, `shiftBackdrop`, `handleFlyerDownload`, etc.).

### DOM
- El DOM se actualiza desde un **único punto**: la función `updateDOMFromState()` en `storage.js`.
- Lee las claves `SearchState.DOM` y `DesignState.DOM`, donde cada clave es un `id` de elemento HTML y su valor es un diccionario de propiedades a aplicar (`textContent`, `style`, `src`, etc.).
- Para propiedades de tipo objeto (ej. `style`), usa `Object.assign` para mergear en lugar de pisar.

### Estados globales
Usamos **dos estados globales**:
  * `SearchState`
  * `DesignState`
**Cómo funcionan:**
- Son `Proxy` que interceptan toda asignación (`set`).
- Cada `set` dispara automáticamente dos efectos: persistir en `localStorage` y actualizar el DOM via `updateDOMFromState()`.
- `DesignState` usa un **proxy recursivo** (`createDeepProxy`) para detectar cambios en propiedades anidadas (ej. `DesignState.DOM.title.textContent = "..."`). `SearchState` usa un Proxy top-level.
**Qué hacemos:**
- El proxy centraliza toda la persistencia.
- Toda la mutación de estado es directa: asignamos a propiedades del Proxy, ej. `DesignState.DOM.title = { ... };`, `SearchState.currentBackdrop = 0;`, etc.
- Los defaults viven en `defaultSearchState`/`defaultDesignState` y se mergean con lo que hay en `localStorage` al iniciar.
**Qué evitamos:**
- No hay estado duplicado ni sincronización manual entre variables sueltas y la UI.
- No actualizamos el DOM directamente desde los event handlers — siempre a través del State para mantener el flujo unidireccional.

```
Usuario --> GUI HTML --> entrypoints --> State global |--> se replica en el localStorage
                                                     |--> actualiza el DOM 
```


## Rationale: Unificación de tamaños y variantes de flyer
**El problema:** previo a los cambios introducidos, la generación de flyers para un ciclo de películas constaba de 2 partes:
1.  El flujo de uso de la pagina comenzaba en la pagina generadora del flyer de ciclos. acá elegías las películas a incluir en el ciclo y editabas 2 variantes del flyer para distintos tamaños específicos según la plataforma de destino (Feed e Historias).

2.  Desde el generador de flyer de ciclos podías acceder al generador de flyers individual en el que era posible generar 2 variantes de diseños y 2 tamaños específicos según la plataforma de destino (Feed e Historias), 4 variantes de flyer en total. Esto era problemático por distintas cuestiones:
	- Cada variante de flyer contenía muchísimo código duplicado innecesario. Además cada flyer usaba identificadores específicos lo que complejizaba su manipulación y edición posterior.
	- Tener tantas variantes de flyers obligaba al usuario final a gestionar, editar y descargar cada flyer, prácticamente de a uno a la vez.
	- Tener que descargar tantas imágenes para luego tener que revisar cual publicar dependiendo del formato resultaba engorroso. 

En conclusión, todo el proceso de generación de flyers resultaba muy engorroso, con demasiados pasos.

**La solución:** se decidió que era más importante priorizar el flyer de película individual por sobre el de ciclos, por lo que el generador de ciclos fue descartado.

Respecto a la pagina generadora de flyers para películas individuales, se decidió unificar las 4 variantes en uno solo flyer "multipropósito". Este nuevo diseño tiene una relación de aspecto de 3:4 (a diferencia de los anteriores de 1:1 para feed y de 16:9 para historia), que resulta ser un excelente punto intermedio entre ambos tamaños. Este formato es el más optimo para publicaciones de feed actuales de servicios como Instagram y es lo suficientemente alto como para no verse limitado en una publicación de historia.

El diseño de flyer que se eligió para esta nueva versión es el de flyer-story (flyer sin reseña con tamaño para historia)., el cual luego fue adaptado al nuevo tamaño.

**El impacto:**
-   **Para el usuario final:** al no tener que saltar entre distintas versiones y gestionar múltiples descargas, el flujo de trabajo se vuelve directo, rápido y sin fricciones.
    
-   **Para el desarrollo:** Al consolidar todo en un único flyer, se redujo drásticamente la deuda técnica. Se eliminó la necesidad de mantener sufijos en los identificadores (IDs) y el código CSS duplicado, logrando una herramienta mucho más estable, fácil de mantener y menos propensa a errores al momento de exportar la imagen.
