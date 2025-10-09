function buildRunSummary(gameState) {
    const lines = [];
    lines.push(`Joueur: ${gameState.name}`);
    lines.push(`Mante: ${gameState.manteType}`);
    lines.push('--- Statistiques de Base du Pilote ---');
    lines.push(Object.entries(gameState.pilotStats).map(([k, v]) => `${k}: ${v}`).join(', '));
    lines.push('--- Statistiques Effectives ---');
    lines.push(Object.entries(gameState.effectiveStats).map(([k, v]) => `${k}: ${v}`).join(', '));
    lines.push(`PV Pilote: ${Math.max(0, gameState.pilotHP)} / PV Mante: ${Math.max(0, gameState.manteHP)}`);
    lines.push(`Réputation: CEL ${gameState.reputation.CEL}, FEU ${gameState.reputation.FEU}, Aetheria ${gameState.reputation.Aetheria}`);
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

export async function exportRunAsPDF(gameState) {
    try {
        // Dynamically import jspdf
        const { default: jsPDF } = await import('https://cdn.skypack.dev/jspdf');
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
        w.document.write(`<pre>${buildRunsummary(gameState).replace(/</g, '&lt;')}</pre>`);
        w.document.close();
        w.focus();
        w.print();
    }
}


export function markdownTableToHtml(markdownTable) {
    if (!markdownTable) return '';

    const lines = markdownTable.trim().split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('|') && !line.match(/^\|:?-+:?\|/));

    if (lines.length < 1) return '';

    const header = lines[0].split('|').slice(1, -1).map(h => h.trim());
    const data = lines.slice(1).map(line => line.split('|').slice(1, -1).map(d => d.trim()));

    let html = '<table class="w-full text-sm mt-4 border border-gray-700 rounded-lg overflow-hidden">';
    html += '<thead class="bg-gray-700"><tr>';
    header.forEach(h => {
        html += `<th class="p-3 text-left font-bold text-green-400">${h}</th>`;
    });
    html += '</tr></thead>';
    html += '<tbody class="divide-y divide-gray-700">';
    data.forEach(row => {
        html += '<tr class="hover:bg-gray-700/50">';
        row.forEach((cell, index) => {
            let classAttr = 'p-3 whitespace-pre-line';
            if (index === 0) classAttr += ' font-bold text-white';
            const cellContent = cell.replace(/\$/g, '').replace(/\\times/g, 'x');
            html += `<td class="${classAttr}">${cellContent}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    return html;
}
