import jsPDF from 'jspdf';

function buildRunSummary(gameState) {
    const lines = [];
    lines.push(`Joueur: ${gameState.name}`);
    lines.push(`Mante: ${gameState.manteType}`);
    lines.push('--- Statistiques de Base du Pilote ---');
    lines.push(Object.entries(gameState.pilotStats).map(([k, v]) => `${k}: ${v}`).join(', '));
    lines.push('--- Statistiques Effectives ---');
    lines.push(Object.entries(gameState.effectiveStats).map(([k, v]) => `${k}: ${v}`).join(', '));
    lines.push(`PV Pilote: ${Math.max(0, gameState.pilotHP)} / PV Mante: ${Math.max(0, gameState.manteHP)}`);
    lines.push(`Niveau: ${gameState.level} | XP: ${gameState.xp}/${gameState.xpToNextLevel}`);
    lines.push(`Progression: ${gameState.progress}%`);
    lines.push('--- Journal (10 derniers) ---');
    lines.push(...[...gameState.log].slice(-10).reverse());
    return lines.join('\n');
}

export function exportRunAsJSON(gameState) {
    const data = { timestamp: new Date().toISOString(), gameState };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mantle_run_${gameState.name || 'inconnu'}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportRunAsPDF(gameState) {
    try {
        const doc = new jsPDF();
        const text = buildRunSummary(gameState);
        const margin = 10;
        const maxWidth = 190;
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, margin);
        doc.save(`mantle_run_${gameState.name || 'inconnu'}.pdf`);
    } catch (error) {
        console.error('Erreur export PDF:', error);
        // Fallback to plain text print
        const w = window.open('', '_blank');
        w.document.write(`<pre>${buildRunSummary(gameState).replace(/</g, '&lt;')}</pre>`);
        w.document.close();
        w.focus();
        w.print();
    }
}

