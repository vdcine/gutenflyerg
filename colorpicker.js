DesignState.currentPaintColor = DesignState.currentPaintColor || '#00ff00';
if (!('elementColors' in DesignState) || !DesignState.elementColors) {
    DesignState.elementColors = {};
}

function saveElementColor(element, color, isBackground) {
    if (!element || !element.id) return;
    const colorData = DesignState.elementColors[element.id] || {};
    if (isBackground) {
        colorData.backgroundColor = color;
    } else {
        colorData.color = color;
    }
    DesignState.elementColors[element.id] = colorData;
    DesignState.elementColors = DesignState.elementColors;
}

function restoreElementColors() {
    if (!DesignState.elementColors) return;
    Object.keys(DesignState.elementColors).forEach(id => {
        if (id === 'comic-tail') {
            if (comicTailBgStyle && DesignState.elementColors[id].comicTailColor) {
                comicTailBgStyle.textContent = `.dialogo-comic::after { border-top-color: ${DesignState.elementColors[id].comicTailColor} !important; }`;
            }
            return;
        }
        const element = document.getElementById(id);
        if (element) {
            const colorData = DesignState.elementColors[id];
            if (colorData.color) element.style.color = colorData.color;
            if (colorData.backgroundColor) element.style.backgroundColor = colorData.backgroundColor;
        }
    });
}

function isBackgroundElement(target) {
    return (
        target.id === 'bandavertical' ||
        target.id === 'bandahorizontal' ||
        target.id === 'tape' ||
        target.id === 'flyer'
    );
}

comicTailBgStyle = document.createElement('style');
comicTailBgStyle.id = 'comic-tail-bg-style';
document.head.appendChild(comicTailBgStyle);

function paintEventHandler(e) {
    const comicBalloon = e.target.closest('.dialogo-comic');
    let targetElement = e.target;
    const currentColor = DesignState.currentPaintColor;

    if (comicBalloon) {
        if (e.target.classList.contains('comic-text')) {
            comicBalloon.style.color = currentColor;
            saveElementColor(comicBalloon, currentColor, false);
        } else {
            comicBalloon.style.backgroundColor = currentColor;
            saveElementColor(comicBalloon, currentColor, true);
            if (!DesignState.elementColors['comic-tail']) {
                DesignState.elementColors['comic-tail'] = {};
            }
            DesignState.elementColors['comic-tail'].comicTailColor = currentColor;
            DesignState.elementColors = DesignState.elementColors;
            if (comicTailBgStyle) {
                comicTailBgStyle.textContent = `.dialogo-comic::after { border-top-color: ${currentColor} !important; }`;
            }
        }
    } else {
        if (isBackgroundElement(e.target)) {
            e.target.style.backgroundColor = currentColor;
            saveElementColor(targetElement, currentColor, true);
        } else {
            e.target.style.color = currentColor;
            saveElementColor(targetElement, currentColor, false);
        }
    }
}
