function saveElementColor(element, color, isBackground) {
    if (!element || !element.id) return;
    const prop = isBackground ? 'backgroundColor' : 'color';
    const existing = DesignState.DOM[element.id] || {};
    const existingStyle = existing.style || {};
    DesignState.DOM[element.id] = { ...existing, style: { ...existingStyle, [prop]: color } };
}

function saveSvgColor(elementId, color) {
    const existing = DesignState.DOM[elementId] || {};
    const existingDataset = existing.dataset || {};
    DesignState.DOM[elementId] = { ...existing, dataset: { ...existingDataset, svgColor: color } };
}

function migrateElementColors() {
    if (!DesignState.elementColors || Object.keys(DesignState.elementColors).length === 0) return;
    Object.keys(DesignState.elementColors).forEach(id => {
        const colorData = DesignState.elementColors[id];
        const existing = DesignState.DOM[id] || {};
        const existingStyle = existing.style || {};
        DesignState.DOM[id] = { ...existing, style: { ...existingStyle, ...colorData } };
    });
    DesignState.elementColors = {};
}

function migrateStroke() {
    if (!DesignState.strokeTargets || DesignState.strokeTargets.length === 0) return;
    const color = DesignState.strokeColor || '#000000';
    const shadow = `-1px -1px 0 ${color}, 1px -1px 0 ${color}, -1px 1px 0 ${color}, 1px 1px 0 ${color}`;
    DesignState.strokeTargets.forEach(id => {
        const existing = DesignState.DOM[id] || {};
        const existingStyle = existing.style || {};
        DesignState.DOM[id] = { ...existing, style: { ...existingStyle, textShadow: shadow } };
    });
    delete DesignState.strokeTargets;
    delete DesignState.strokeColor;
}

let svgCache = {};

// si es un elemento figura(rectangulos) hace el.style.backgroundColor. si es algun texto el.style.color
function isBackgroundElement(target) {
    return ['bandavertical', 'bandahorizontal', 'header', 'flyer', 'ciclo-bg'].includes(target.id);
}

function isSvgElement(target) {
    return ['tape', 'logo-bm'].includes(target.id);
}

async function initSvgCache() {
    try {
        const [resTape, resLogo, resBubble] = await Promise.all([
            fetch('./images/tape.svg'),
            fetch('./images/LogoBM.svg'),
            fetch('./images/bubble.svg')
        ]);

        if (resTape.ok) svgCache['tape'] = await resTape.text();
        if (resLogo.ok) svgCache['logo-bm'] = await resLogo.text();
        if (resBubble.ok) svgCache['bubble-bg'] = await resBubble.text();

        console.log("SVGs cacheados correctamente en variable global");
    } catch (error) {
        console.error("Error al precargar SVGs:", error);
    }

    // Restaurar colores de SVG guardados en el estado
    ['tape', 'logo-bm', 'bubble-bg'].forEach(id => {
        const domState = DesignState.DOM[id];
        if (domState && domState.dataset && domState.dataset.svgColor) {
            applySvgColor(id, domState.dataset.svgColor);
        }
    });
}
initSvgCache();

// TODO: ver si se puede meter en el default
const coloresOriginalesSVG = {
    'tape': /#101010/gi,
    'logo-bm': /#ca550b/gi,
    'bubble-bg': /#ffffff/gi
};

function applySvgColor(targetId, hexColor) {
    const originalSvgText = svgCache[targetId];
    if (!originalSvgText) return;

    const regexColor = coloresOriginalesSVG[targetId];
    if (!regexColor) return;

    const coloredSvg = originalSvgText.replace(regexColor, hexColor);

    const blob = new Blob([coloredSvg], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);

    const imgElement = document.getElementById(targetId);

    if (imgElement.dataset.blobUrl) {URL.revokeObjectURL(imgElement.dataset.blobUrl);}

    imgElement.src = blobUrl;
    imgElement.dataset.blobUrl = blobUrl;
}

function paintEventHandler(e) {
    const comicBalloon = e.target.closest('.dialogo-comic');
    let targetElement = e.target;
    const currentColor = DesignState.currentPaintColor;

    if (comicBalloon) {
        if (e.target.classList.contains('comic-text')) {
            e.target.style.color = currentColor;
            saveElementColor(comicBalloon, currentColor, false);
        } else {
            applySvgColor('bubble-bg', currentColor); //TODO: que funcione con updateDOMFromState()
            saveSvgColor('bubble-bg', currentColor);
        }
    } else if (isSvgElement(e.target)) {
        applySvgColor(e.target.id, currentColor);
        saveSvgColor(e.target.id, currentColor);
    } else if (isBackgroundElement(e.target)) {
        e.target.style.backgroundColor = currentColor;
        saveElementColor(targetElement, currentColor, true);
        if (e.target.id === 'header') {
            e.target.classList.add('with-background-color');
        }
    } else {
        e.target.style.color = currentColor;
        saveElementColor(targetElement, currentColor, false);
    }
}
