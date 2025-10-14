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

export function rollDice(num, sides, bonus = 0) {
    let total = 0;
    for (let i = 0; i < num; i++) {
        total += Math.floor(Math.random() * sides) + 1;
    }
    return total + bonus;
}

