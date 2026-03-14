GlobalState.currentPaintColor = GlobalState.currentPaintColor || '#00ff00';

// si es un elemento figura(rectangulos) hace el.style.backgroundColor. si es algun texto el.style.color
function isBackgroundElement(target) {
    return ['bandavertical', 'bandahorizontal', 'header', 'flyer', 'ciclo-bg'].includes(target.id);
}

function isSvgElement(target) {
    return ['tape', 'logo-bm'].includes(target.id);
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

async function colorizarSvg(rutaSvg, colorHexadecimal) {
    try {
        const response = await fetch(rutaSvg);
        if (!response.ok) throw new Error("No se pudo cargar el SVG: " + response.statusText);
        const svgText = await response.text();

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.documentElement;

        const style = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
        style.textContent = `
            * {
                fill: ${colorHexadecimal} !important;
            }
        `;
        svgElement.insertBefore(style, svgElement.firstChild);

        const serializer = new XMLSerializer();
        const nuevoSvgText = serializer.serializeToString(svgElement);

        const base64 = btoa(unescape(encodeURIComponent(nuevoSvgText)));
        const dataUrl = `data:image/svg+xml;base64,${base64}`;
        
        console.log("SVG convertido exitosamente para:", rutaSvg);
        return dataUrl;

    } catch (error) {
        console.error("Error al colorizar el SVG:", error);
        return rutaSvg;
    }
}

async function paintEventHandler(e) {
    // if (localStorage.isPaintModeActive && isEditableElement(e.target)) {
    const comicBalloon = e.target.closest('.dialogo-comic');
    const targetId = e.target.id;

    if (comicBalloon) {
        if (e.target.classList.contains('comic-text')) {
            comicBalloon.style.color = GlobalState.currentPaintColor;
        } else {
            comicBalloon.style.backgroundColor = GlobalState.currentPaintColor;
            if (comicTailBgStyle) {
                comicTailBgStyle.textContent = `.dialogo-comic::after { border-top-color: ${GlobalState.currentPaintColor} !important; }`;
            }
        }
    } else if (isSvgElement(e.target)) {
        const rutaSvg = targetId === 'tape' ? './images/tape.svg' : './images/LogoBM.svg';
        const nuevaImg = await colorizarSvg(rutaSvg, GlobalState.currentPaintColor);
        e.target.src = nuevaImg;
    } else {
        if (isBackgroundElement(e.target)) {
            e.target.style.backgroundColor = GlobalState.currentPaintColor;
        } else {
            e.target.style.color = GlobalState.currentPaintColor;
        }
    }
    // e.stopPropagation();
}
