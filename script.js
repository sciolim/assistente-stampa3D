document.addEventListener('DOMContentLoaded', function() {
    loadSavedData(); // Carica i dati salvati all'avvio
});

document.getElementById('printForm').addEventListener('submit', function(event) {
    event.preventDefault();
    saveParameters();
});

document.getElementById('exportButton').addEventListener('click', exportData);
document.getElementById('importButton').addEventListener('click', () => {
    document.getElementById('importFile').click(); // Simula il click sull'input file
});
document.getElementById('importFile').addEventListener('change', importData);

function saveParameters() {
    const material = document.getElementById('material').value;
    const layerHeight = document.getElementById('layerHeight').value;
    const printSpeed = document.getElementById('printSpeed').value;
    const infill = document.getElementById('infill').value;
    const retraction = document.getElementById('retraction').value;
    const retractionSpeed = document.getElementById('retractionSpeed').value;

    const parameters = {
        material: material,
        layerHeight: layerHeight,
        printSpeed: printSpeed,
        infill: infill,
        temperature: getTemperature(material), // Parametri ottimali
        bedTemperature: getBedTemperature(material), // Parametri ottimali
        cooling: getCooling(material), // Parametri ottimali
        retraction: retraction,
        retractionSpeed: retractionSpeed
    };

    const existingRow = findRowByMaterial(material);
    if (existingRow) {
        updateRow(existingRow, parameters); // Sovrascrive i dati esistenti
    } else {
        addRowToTable(parameters); // Aggiunge una nuova riga
    }

    saveDataToLocalStorage(); // Salva i dati nel localStorage
}

function addRowToTable(data) {
    const table = document.getElementById('savedParameters').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const cells = [
        data.material,
        data.layerHeight,
        data.printSpeed,
        data.infill,
        data.temperature,
        data.bedTemperature,
        data.cooling,
        data.retraction,
        data.retractionSpeed
    ];

    cells.forEach((cellData, index) => {
        const cell = newRow.insertCell(index);
        cell.textContent = cellData;
    });

    const actionCell = newRow.insertCell(cells.length);
    const editButton = document.createElement('button');
    editButton.textContent = 'Modifica';
    editButton.addEventListener('click', () => editRow(newRow));
    actionCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Elimina';
    deleteButton.addEventListener('click', () => deleteRow(newRow));
    actionCell.appendChild(deleteButton);
}

function findRowByMaterial(material) {
    const table = document.getElementById('savedParameters').getElementsByTagName('tbody')[0];
    for (let row of table.rows) {
        if (row.cells[0].textContent === material) {
            return row;
        }
    }
    return null;
}

function updateRow(row, data) {
    const cells = row.cells;
    cells[1].textContent = data.layerHeight;
    cells[2].textContent = data.printSpeed;
    cells[3].textContent = data.infill;
    cells[4].textContent = data.temperature;
    cells[5].textContent = data.bedTemperature;
    cells[6].textContent = data.cooling;
    cells[7].textContent = data.retraction;
    cells[8].textContent = data.retractionSpeed;
}

function editRow(row) {
    const cells = row.cells;
    for (let i = 0; i < cells.length - 1; i++) {
        const cell = cells[i];
        const currentValue = cell.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        cell.textContent = '';
        cell.appendChild(input);
    }

    const actionCell = cells[cells.length - 1];
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salva';
    saveButton.addEventListener('click', () => saveRow(row));
    actionCell.innerHTML = '';
    actionCell.appendChild(saveButton);
}

function saveRow(row) {
    const cells = row.cells;
    for (let i = 0; i < cells.length - 1; i++) {
        const cell = cells[i];
        const input = cell.querySelector('input');
        cell.textContent = input.value;
    }

    const actionCell = cells[cells.length - 1];
    const editButton = document.createElement('button');
    editButton.textContent = 'Modifica';
    editButton.addEventListener('click', () => editRow(row));
    actionCell.innerHTML = '';
    actionCell.appendChild(editButton);

    saveDataToLocalStorage(); // Salva i dati modificati nel localStorage
}

function deleteRow(row) {
    row.remove();
    saveDataToLocalStorage(); // Salva i dati aggiornati nel localStorage
}

function saveDataToLocalStorage() {
    const table = document.getElementById('savedParameters').getElementsByTagName('tbody')[0];
    const data = [];
    for (let row of table.rows) {
        const rowData = {
            material: row.cells[0].textContent,
            layerHeight: row.cells[1].textContent,
            printSpeed: row.cells[2].textContent,
            infill: row.cells[3].textContent,
            temperature: row.cells[4].textContent,
            bedTemperature: row.cells[5].textContent,
            cooling: row.cells[6].textContent,
            retraction: row.cells[7].textContent,
            retractionSpeed: row.cells[8].textContent
        };
        data.push(rowData);
    }
    localStorage.setItem('savedParameters', JSON.stringify(data));
}

function loadSavedData() {
    const savedData = localStorage.getItem('savedParameters');
    if (savedData) {
        const data = JSON.parse(savedData);
        data.forEach(rowData => addRowToTable(rowData));
    }
}

function exportData() {
    const savedData = localStorage.getItem('savedParameters');
    if (savedData) {
        if (/Android/i.test(navigator.userAgent)) {
            // Modalità Android: mostra il JSON in un'area di testo
            document.getElementById('jsonText').value = savedData;
            document.getElementById('jsonOutput').style.display = 'block';
        } else {
            // Modalità PC: scarica il file JSON
            const blob = new Blob([savedData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stampa3d_parametri.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    } else {
        alert('Nessun dato da esportare.');
    }
}

function copyJson() {
    const jsonText = document.getElementById('jsonText');
    jsonText.select();
    document.execCommand('copy');
    alert('JSON copiato negli appunti!');
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('savedParameters', JSON.stringify(data));
            location.reload(); // Ricarica la pagina per visualizzare i nuovi dati
        };
        reader.readAsText(file);
    }
}

// Funzioni per i parametri ottimali di stampa
function getTemperature(material) {
    switch (material) {
        case 'PLA': return '190-220°C';
        case 'ABS': return '230-250°C';
        case 'PETG': return '220-250°C';
        case 'TPU': return '210-230°C';
        case 'Nylon': return '240-260°C';
        case 'ASA': return '240-260°C';
        case 'PC': return '270-310°C';
        case 'HIPS': return '220-250°C';
        case 'PVA': return '190-210°C';
        case 'PP': return '210-230°C';
        case 'PEEK': return '370-430°C';
        case 'TPE': return '210-230°C';
        case 'Wood': return '195-220°C';
        case 'Metal': return '210-230°C';
        case 'Carbon Fiber': return '230-250°C';
        case 'Glow-in-the-Dark': return '210-230°C';
        case 'Flex': return '210-230°C';
        case 'Conductive': return '210-230°C';
        case 'Ceramic': return '200-220°C';
        default: return 'N/A';
    }
}

function getBedTemperature(material) {
    switch (material) {
        case 'PLA': return '50-60°C';
        case 'ABS': return '90-110°C';
        case 'PETG': return '70-80°C';
        case 'TPU': return '40-60°C';
        case 'Nylon': return '70-90°C';
        case 'ASA': return '90-110°C';
        case 'PC': return '100-120°C';
        case 'HIPS': return '90-110°C';
        case 'PVA': return '45-60°C';
        case 'PP': return '80-100°C';
        case 'PEEK': return '120-140°C';
        case 'TPE': return '40-60°C';
        case 'Wood': return '50-60°C';
        case 'Metal': return '50-60°C';
        case 'Carbon Fiber': return '80-100°C';
        case 'Glow-in-the-Dark': return '50-60°C';
        case 'Flex': return '40-60°C';
        case 'Conductive': return '50-60°C';
        case 'Ceramic': return '50-60°C';
        default: return 'N/A';
    }
}

function getCooling(material) {
    switch (material) {
        case 'PLA': return '100%';
        case 'ABS': return '0%';
        case 'PETG': return '50%';
        case 'TPU': return '0%';
        case 'Nylon': return '0%';
        case 'ASA': return '0%';
        case 'PC': return '0%';
        case 'HIPS': return '0%';
        case 'PVA': return '100%';
        case 'PP': return '0%';
        case 'PEEK': return '0%';
        case 'TPE': return '0%';
        case 'Wood': return '50%';
        case 'Metal': return '0%';
        case 'Carbon Fiber': return '0%';
        case 'Glow-in-the-Dark': return '50%';
        case 'Flex': return '0%';
        case 'Conductive': return '0%';
        case 'Ceramic': return '50%';
        default: return 'N/A';
    }
}