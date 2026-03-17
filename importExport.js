function exportUserData() {
    const userData = {
        searchState: { ...SearchState },
        designState: { ...DesignState },
        exportDate: new Date().toISOString(),
        version: 1,
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    const movieTitle = (DesignState.titulo || 'flyer')
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '_') || 'flyer';
    const filename = `${movieTitle}_datos_${new Date().toISOString().slice(0, 10)}.json`;

    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Datos exportados:', filename);
}

function importUserData(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const userData = JSON.parse(e.target.result);
      console.log('Importando datos, versión:', userData.version || 'desconocida');

      // esto no se puede porque los state son proxys
      // SearchState = userData.SearchState;

      // ¿y esto?:
      SearchState = {...SearchState, ...userData.SearchState}

      // hay que encapsular de alguna manera tipo:
      // updateStateFromFile()
      Object.keys(userData.searchState).forEach(key => {
        SearchState[key] = userData.searchState[key];
      });

      // FIXME: que el proxy resuelva esto:
      Object.keys(userData.designState).forEach(key => {
        if (key === 'fontSizes' && userData.designState.fontSizes) {
          DesignState.fontSizes = { ...DesignState.fontSizes, ...userData.designState.fontSizes };
        } else {
          DesignState[key] = userData.designState[key];
        }
      });

      // FIXME: emprolijar. Crear una función qué SOLO haga "actualizo el dom cuando cambia el state".
      initializeControlValues(); // lee los estados y actualiza inputs. pero para correr esta funcion necesitamos que el dom este listo
      restoreElementColors();
      if (SearchState.backdrops?.length > 0) {
        shiftBackdrop(SearchState.currentBackdrop || 0);
      }
      if (SearchState.posters?.length > 0) {
        shiftPoster(SearchState.currentPoster || 0);
      }
    };

    reader.onerror = function () {
        console.error('Error de lectura del archivo');
        alert('Hubo un problema al leer el archivo.');
    };

    reader.readAsText(file);
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('El archivo no es un JSON válido. Por favor selecciona un archivo con extensión .json');
        event.target.value = '';
        return;
    }

    const fileInfo = `Datos del archivo:
• Nombre: ${file.name}
• Tamaño: ${(file.size / 1024).toFixed(2)} KB`;

    if (confirm(fileInfo)) {
        importUserData(file);
    }

    event.target.value = '';
}
