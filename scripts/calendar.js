export function getNextWednesday() {
    const d = new Date();
    d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7 || 7));
    return d.toLocaleDateString('sv');
}
