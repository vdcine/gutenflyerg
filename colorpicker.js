GlobalState.currentPaintColor = GlobalState.currentPaintColor || '#00ff00';
GlobalState.svgCache = GlobalState.svgCache || {};

// si es un elemento figura(rectangulos) hace el.style.backgroundColor. si es algun texto el.style.color
function isBackgroundElement(target) {
    return ['bandavertical', 'bandahorizontal', 'header', 'flyer', 'ciclo-bg'].includes(target.id);
}

function isSvgElement(target) {
    return ['tape', 'logo-bm'].includes(target.id);
}

async function initSvgCache() {
    try {
        const [resTape, resLogo] = await Promise.all([
            fetch('./images/tape.svg'),
            fetch('./images/LogoBM.svg')
        ]);
        
        if (resTape.ok) GlobalState.svgCache['tape'] = await resTape.text();
        if (resLogo.ok) GlobalState.svgCache['logo-bm'] = await resLogo.text();
        
        console.log("SVGs cacheados correctamente en GlobalState");
    } catch (error) {
        console.error("Error al precargar SVGs:", error);
    }
}
initSvgCache();

function applySvgColor(targetId, hexColor) {
    const originalSvgText = GlobalState.svgCache[targetId];
    if (!originalSvgText) return;
    
    let coloredSvg;
    
    if (targetId === 'tape') {
        coloredSvg = originalSvgText.replace(/#101010/gi, hexColor);
    } else if (targetId === 'logo-bm') {
        coloredSvg = originalSvgText.replace(/#ca550b/gi, hexColor);
    }

    const base64 = btoa(unescape(encodeURIComponent(coloredSvg)));
    document.getElementById(targetId).src = `data:image/svg+xml;base64,${base64}`;
}

// const editableIdsAndClasses = [
//     "header",
//     "header-feed",
//     "header-review",
//     "header-feed-review",
//     "title",
//     "year",
//     "director",
//     "duracion",
//     "edad-sugerida",
//     "title-review",
//     "origen-review",
//     "year-review",
//     "director-review",
//     "duracion-review",
//     "edad-sugerida-review",
//     "sinapsis-review",
//     "title-review-feed",
//     "origen-review-feed",
//     "year-review-feed",
//     "director-review-feed",
//     "duracion-review-feed",
//     "edad-sugerida-review-feed",
//     "sinapsis-review-feed",
//     "title-feed",
//     "year-feed",
//     "director-feed",
//     "duracion-feed",
//     "edad-sugerida-feed",
//     "flyer-date",
//     "flyer-date-feed",
//     "flyer-hour",
//     "flyer-hour-feed",
//     "flyer-biblioteca",
//     "flyer-biblioteca-feed",
//     "org",
//     "org-feed",
//     "org-review",
//     "org-review-feed",
//     "ciclo",
//     "ciclo-feed",
//     "flyer-feed",
//     "flyer-story",
//     "flyer-story-review",
//     "flyer-feed-review",
// ];

// const editableClasses = [
//     "rect",
//     "rect2",
//     "rect-feed",
//     "rect2-feed",
//     "rect2-review",
//     "rect2-review-feed",
//     "tape",
//     "header",
//     "header-feed",
//     "header-review",
//     "header-feed-review",
//     "dialogo-comic",
//     "comic-text",
// ];

// function isEditableElement(target) {
//     if (target.id && editableIdsAndClasses.includes(target.id)) return true;
//     for (const cls of editableClasses) {
//         if (target.classList.contains(cls) || (target.closest && target.closest("." + cls)))
//             return true;
//     }
//     return false;
// }

// estilos dinámicos para el globo porque tiene pseudo-elementos
// let comicTailBgStyle = document.getElementById("comic-tail-bg-style");
// if (!comicTailBgStyle) {
comicTailBgStyle = document.createElement('style');
comicTailBgStyle.id = 'comic-tail-bg-style';
document.head.appendChild(comicTailBgStyle);
// }
//

function paintEventHandler(e) {
    // if (localStorage.isPaintModeActive && isEditableElement(e.target)) {
    const colorElegido = GlobalState.currentPaintColor;
    const comicBalloon = e.target.closest('.dialogo-comic');

    if (comicBalloon) {
        if (e.target.classList.contains('comic-text')) {
            comicBalloon.style.color = colorElegido;
        } else {
            comicBalloon.style.backgroundColor = colorElegido;
            if (comicTailBgStyle) {
                comicTailBgStyle.textContent = `.dialogo-comic::after { border-top-color: ${colorElegido} !important; }`;
            }
        }
    } 

    else if (isSvgElement(e.target)) {
        applySvgColor(e.target.id, colorElegido);
    } 

    else if (isBackgroundElement(e.target)) {
        e.target.style.backgroundColor = colorElegido;

        if (e.target.id === 'header') {
            e.target.classList.add('with-background-color');
        }
    }

    else {
        e.target.style.color = colorElegido;
    }
    // e.stopPropagation();
}
