function exportUserData() {
    const userData = {
        searchState: { ...SearchState },
        designState: { ...DesignState },
        exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    console.log("Peso del JSON:", (dataStr.length / 1024).toFixed(2), "KB");

    const link = document.createElement('a');
    const movieTitle = (DesignState.movie.title || 'flyer')
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

        if (userData.searchState) {
            Object.keys(userData.searchState).forEach(key => {
                SearchState[key] = userData.searchState[key];
            });
        }

        if (userData.designState) {
            Object.keys(userData.designState).forEach(key => {
                if (key === 'fontSizes' && userData.designState.fontSizes) {
                    DesignState.fontSizes = { ...DesignState.fontSizes, ...userData.designState.fontSizes };
                } else {
                    DesignState[key] = userData.designState[key];
                }
            });
        }

        updateDOMFromState();
    };
    reader.onerror = function () {
      console.error("Error de lectura del archivo");
      alert("Hubo un problema al leer el archivo.");
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
