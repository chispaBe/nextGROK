let data = [];
let filteredData = [];
let chart = null;

// Cargar datos al iniciar
fetch('https://drive.google.com/uc?export=download&id=1EDjIyBiTA3uOqUAQjsELw76f1x-2nCV6')
    .then(response => response.json())
    .then(json => {
        data = json;
        filteredData = json;
        renderTable();
    });

// Renderizar tabla
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    filteredData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="rowSelect" value="${JSON.stringify(row)}"></td>
            <td>${row.timestamp}</td>
            <td>${row.hash}</td>
            <td>${row.domain}</td>
            <td>${row.availability}</td>
            <td>${row.entries}</td>
            <td>${row.ip}</td>
            <td>${row.description}</td>
        `;
        tbody.appendChild(tr);
    });
    updateSelectAll();
}

// Filtros en tiempo real
document.getElementById('filterDomain').addEventListener('input', applyFilters);
document.getElementById('filterIP').addEventListener('input', applyFilters);
document.getElementById('filterDate').addEventListener('change', applyFilters);
document.getElementById('filterDesc').addEventListener('change', applyFilters);

function applyFilters() {
    const domain = document.getElementById('filterDomain').value.toLowerCase();
    const ip = document.getElementById('filterIP').value.toLowerCase();
    const date = document.getElementById('filterDate').value;
    const desc = document.getElementById('filterDesc').value.toLowerCase();
    
    filteredData = data.filter(row => {
        return (!domain || row.domain.toLowerCase().includes(domain)) &&
               (!ip || row.ip.toLowerCase().includes(ip)) &&
               (!date || row.timestamp.startsWith(date)) &&
               (!desc || row.description.toLowerCase().includes(desc));
    });
    renderTable();
}

// Selección múltiple
function updateSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const rowSelects = document.querySelectorAll('.rowSelect');
    selectAll.addEventListener('change', (e) => {
        rowSelects.forEach(cb => cb.checked = e.target.checked);
    });
}

// Descargar seleccionados
function downloadSelected(format = 'csv') {
    const selected = Array.from(document.querySelectorAll('.rowSelect:checked'))
        .map(cb => JSON.parse(cb.value));
    if (selected.length === 0) {
        alert('Selecciona al menos un registro');
        return;
    }
    
    let content;
    if (format === 'csv') {
        const headers = 'Timestamp,Hash,Dominio,Disponibilidad,Entradas,IP,Descripción\n';
        content = headers + selected.map(row => 
            `${row.timestamp},${row.hash},"${row.domain}",${row.availability},${row.entries},${row.ip},"${row.description}"`
        ).join('\n');
    } else {
        content = JSON.stringify(selected, null, 2);
    }
    
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nextdns-logs.${format}`;
    a.click();
}

// Generar gráfico simple (ej. dominios por frecuencia)
function generateChart() {
    const domainCounts = {};
    filteredData.forEach(row => {
        domainCounts[row.domain] = (domainCounts[row.domain] || 0) + 1;
    });
    
    const ctx = document.getElementById('myChart').getContext('2d');
    document.getElementById('myChart').style.display = 'block';
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(domainCounts),
            datasets: [{ label: 'Frecuencia', data: Object.values(domainCounts), backgroundColor: 'rgba(75, 192, 192, 0.2)' }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });
}

// Chat con Grok
function sendToGrok() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    addChatMessage('user', message);
    input.value = '';
    
    // Simular o llamar a API real de Grok
    // Para API real: fetch('https://api.x.ai/v1/chat/completions', { method: 'POST', headers: { 'Authorization': 'Bearer TU_API_KEY_AQUI', 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'grok-beta', messages: [{ role: 'user', content: message }] }) })
    // .then(res => res.json()).then(data => addChatMessage('grok', data.choices[0].message.content));
    
    // Simulación local (reemplaza con API arriba)
    setTimeout(() => {
        let response = 'Respuesta simulada: ';
        if (message.toLowerCase().includes('filtra')) {
            // Ejemplo: aplicar filtro dinámico
            if (message.includes('apple')) document.getElementById('filterDomain').value = 'apple.com'; applyFilters();
            response += 'Filtro aplicado. Tabla actualizada.';
        } else if (message.toLowerCase().includes('descarga')) {
            downloadSelected('csv');
            response += 'Descarga iniciada.';
        } else if (message.toLowerCase().includes('analiza')) {
            generateChart();
            response += 'Gráfico generado. IPs frecuentes: apple.com (5), icloud.com (3).';
        } else {
            response += 'Comando no reconocido. Prueba: "filtra apple.com", "descarga seleccionados", "analiza patrones".';
        }
        addChatMessage('grok', response);
    }, 1000);
}

function addChatMessage(sender, text) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-message ${sender}-message`;
    div.textContent = `${sender.toUpperCase()}: ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
