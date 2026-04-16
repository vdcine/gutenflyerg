let comicTailBgStyle;

comicTailBgStyle = document.createElement('style');
comicTailBgStyle.id = 'comic-tail-bg-style';
document.head.appendChild(comicTailBgStyle);

function saveElementColor(element, color, isBackground) {
    if (!element || !element.id) return;
    const prop = isBackground ? 'backgroundColor' : 'color';
    const existing = DesignState.DOM[element.id] || {};
    const existingStyle = existing.style || {};
    DesignState.DOM[element.id] = { ...existing, style: { ...existingStyle, [prop]: color } };
}

function migrateElementColors() {
    if (!DesignState.elementColors || Object.keys(DesignState.elementColors).length === 0) return;
    Object.keys(DesignState.elementColors).forEach(id => {
        const colorData = DesignState.elementColors[id];
        if (id === 'comic-tail') {
            if (colorData.comicTailColor) {
                DesignState.DOM['comic-tail-bg-style'] = {
                    textContent: `.dialogo-comic::after { border-top-color: ${colorData.comicTailColor} !important; }`
                };
            }
        } else {
            const existing = DesignState.DOM[id] || {};
            const existingStyle = existing.style || {};
            DesignState.DOM[id] = { ...existing, style: { ...existingStyle, ...colorData } };
        }
    });
    DesignState.elementColors = {};
}

function isBackgroundElement(target) {
    return (
        target.id === 'bandavertical' ||
        target.id === 'bandahorizontal' ||
        target.id === 'tape' ||
        target.id === 'flyer'
    );
}

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
            DesignState.DOM['comic-tail-bg-style'] = {
                textContent: `.dialogo-comic::after { border-top-color: ${currentColor} !important; }`
            };
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
