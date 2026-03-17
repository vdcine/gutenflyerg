
## gutenflyerg
Generador de volantes

## Dev guidelines

* En los html, sólo dejar los style vinculados a posicionamiento
* Que no haya funciones más largas que una pantalla

### Rationale: Unificación de tamaños y variantes de flyer
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
