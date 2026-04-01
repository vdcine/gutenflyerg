# gutenflyerg

Generador de volantes

# Instrucciones

Para cambiar tanto fecha como horario es necesario darle doble click al texto y se te abre un cuadro de texto editable.

# Dev guidelines

* en los html, sólo dejar los style vinculados a posicionamiento

## Arquitectura

* `entrypoints.js` contiene todas las maneras en las que desde el HTML, el usuario provoca ejecución de código JS.
  * los entrypoint, salvo excepciones justificadas, sólo modifican el **State** global.
    * `SearchState`
    * `DesignState`
  * los **State** son un proxy, que sobrecargan al `set` para
    * autoreplicarse en el `localStorage` 
    * actualizar el DOM con el nuevo estado
      * FIXME: atomizar updates, porque hoy se trigerea por completo
    * CUIDADO con provocar loops infinitos.

```
Usario --> GUI HTML --> entrypoints --> State global |--> se replica en el localStorage
                                                     |--> actualiza el DOM 
```

# TODO

* [ ] reducir tamaño imagen de ruido
