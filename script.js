document.addEventListener('DOMContentLoaded', function () {
    const materialTable = document.getElementById('materialTable').getElementsByTagName('tbody')[0];
    const addBtn = document.getElementById('addBtn');
    const searchBtn = document.getElementById('searchBtn');
    const printBtn = document.getElementById('printBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const saveMaterialBtn = document.getElementById('saveMaterialBtn');
    const materialModal = new bootstrap.Modal(document.getElementById('materialModal'));
    const materialForm = document.getElementById('materialForm');

    // Materiali predefiniti
    let materials = JSON.parse(localStorage.getItem('materials')) || [
        { name: "PLA", nozzleTemp: 200, bedTemp: 60, cooling: "Si", shrinkage: 0.2, retractionSpeed: 40, quantity: "5x" },
        { name: "ABS", nozzleTemp: 240, bedTemp: 100, cooling: "No", shrinkage: 0.8, retractionSpeed: 50, quantity: "3y" },
        { name: "PETG", nozzleTemp: 230, bedTemp: 80, cooling: "Si", shrinkage: 0.3, retractionSpeed: 45, quantity: "7z" },
        { name: "TPU", nozzleTemp: 220, bedTemp: 60, cooling: "Si", shrinkage: 0.5, retractionSpeed: 30, quantity: "2a" },
        { name: "Nylon", nozzleTemp: 260, bedTemp: 80, cooling: "No", shrinkage: 1.5, retractionSpeed: 60, quantity: "4b" },
        { name: "ASA", nozzleTemp: 250, bedTemp: 100, cooling: "No", shrinkage: 0.6, retractionSpeed: 55, quantity: "6c" },
        { name: "PC (Policarbonato)", nozzleTemp: 270, bedTemp: 110, cooling: "No", shrinkage: 0.7, retractionSpeed: 70, quantity: "1d" },
        { name: "HIPS", nozzleTemp: 240, bedTemp: 100, cooling: "No", shrinkage: 0.6, retractionSpeed: 50, quantity: "3e" },
        { name: "PP (Polipropilene)", nozzleTemp: 220, bedTemp: 80, cooling: "Si", shrinkage: 1.2, retractionSpeed: 40, quantity: "8f" },
        { name: "PVA", nozzleTemp: 190, bedTemp: 60, cooling: "Si", shrinkage: 0.3, retractionSpeed: 35, quantity: "2g" },
        { name: "Wood PLA", nozzleTemp: 200, bedTemp: 60, cooling: "Si", shrinkage: 0.2, retractionSpeed: 40, quantity: "5h" },
        { name: "Metal PLA", nozzleTemp: 210, bedTemp: 60, cooling: "Si", shrinkage: 0.2, retractionSpeed: 45, quantity: "3i" },
        { name: "Carbon Fiber PLA", nozzleTemp: 220, bedTemp: 70, cooling: "Si", shrinkage: 0.3, retractionSpeed: 50, quantity: "4j" },
    ];

    let editIndex = null;
    let filteredMaterials = [];

    // Funzione per aggiornare la tabella
    function updateTables(materialsToShow = materials) {
        materialTable.innerHTML = '';

        if (materialsToShow.length === 0) {
            const row = materialTable.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 8;
            cell.textContent = 'Nessun materiale trovato';
            cell.className = 'text-center text-muted';
        } else {
            materialsToShow.forEach((material, index) => {
                const row = materialTable.insertRow();
                row.insertCell(0).textContent = material.name;
                row.insertCell(1).textContent = material.nozzleTemp;
                row.insertCell(2).textContent = material.bedTemp;
                row.insertCell(3).textContent = material.cooling;
                row.insertCell(4).textContent = material.shrinkage;
                row.insertCell(5).textContent = material.retractionSpeed;
                row.insertCell(6).textContent = material.quantity;
                const actionsCell = row.insertCell(7);
                actionsCell.className = 'actions';

                const editBtn = document.createElement('button');
                editBtn.textContent = 'Modifica';
                editBtn.className = 'btn btn-warning btn-sm';
                editBtn.addEventListener('click', () => openEditModal(material));
                actionsCell.appendChild(editBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Elimina';
                deleteBtn.className = 'btn btn-danger btn-sm';
                deleteBtn.addEventListener('click', () => deleteMaterial(material));
                actionsCell.appendChild(deleteBtn);
            });
        }
    }

    // Apri il modal per aggiungere/modificare un materiale
    function openEditModal(material = null) {
        if (material) {
            editIndex = materials.findIndex(m => m.name === material.name);
            document.getElementById('materialName').value = material.name;
            document.getElementById('nozzleTemp').value = material.nozzleTemp;
            document.getElementById('bedTemp').value = material.bedTemp;
            document.getElementById('cooling').value = material.cooling;
            document.getElementById('shrinkage').value = material.shrinkage;
            document.getElementById('retractionSpeed').value = material.retractionSpeed;
            document.getElementById('quantity').value = material.quantity;
        } else {
            editIndex = null;
            materialForm.reset();
        }
        materialModal.show();
    }

    // Salva il materiale
    saveMaterialBtn.addEventListener('click', function () {
        const name = document.getElementById('materialName').value;
        const nozzleTemp = Number(document.getElementById('nozzleTemp').value);
        const bedTemp = Number(document.getElementById('bedTemp').value);
        const cooling = document.getElementById('cooling').value;
        const shrinkage = Number(document.getElementById('shrinkage').value);
        const retractionSpeed = Number(document.getElementById('retractionSpeed').value);
        const quantity = document.getElementById('quantity').value;

        if (name && !isNaN(nozzleTemp) && !isNaN(bedTemp) && cooling && !isNaN(shrinkage) && !isNaN(retractionSpeed) && quantity) {
            const material = { name, nozzleTemp, bedTemp, cooling, shrinkage, retractionSpeed, quantity };
            if (editIndex !== null) {
                materials[editIndex] = material;
            } else {
                materials.push(material);
            }
            localStorage.setItem('materials', JSON.stringify(materials));
            updateTables(filteredMaterials.length > 0 ? filteredMaterials : materials);
            materialModal.hide();
        } else {
            alert("Compila tutti i campi correttamente!");
        }
    });

    // Elimina un materiale
    function deleteMaterial(material) {
        if (confirm("Sei sicuro di voler eliminare questo materiale?")) {
            const index = materials.findIndex(m => m.name === material.name);
            if (index !== -1) {
                materials.splice(index, 1);
                localStorage.setItem('materials', JSON.stringify(materials));
                updateTables(filteredMaterials.length > 0 ? filteredMaterials : materials);
            }
        }
    }

    // Cerca un materiale
    searchBtn.addEventListener('click', function () {
        const searchTerm = prompt("Cerca materiale per nome:").toLowerCase();
        if (searchTerm) {
            filteredMaterials = materials.filter(material => material.name.toLowerCase().includes(searchTerm));
            updateTables(filteredMaterials);
        } else {
            filteredMaterials = [];
            updateTables(materials);
        }
    });

    // Stampa la lista
    printBtn.addEventListener('click', function () {
        window.print();
    });

    // Esporta i materiali in formato JSON
    exportBtn.addEventListener('click', function () {
        const dataStr = JSON.stringify(materials, null, 2);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Copia il JSON negli appunti su dispositivi mobili
            navigator.clipboard.writeText(dataStr).then(() => {
                alert("JSON copiato negli appunti! Incolla il contenuto in un file .json.");
            }).catch(() => {
                alert("Errore durante la copia negli appunti. Copia manualmente il testo qui sotto:");
                const textarea = document.createElement('textarea');
                textarea.value = dataStr;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            });
        } else {
            // Scarica il file JSON su PC
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'materials.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("File esportato con successo! Controlla la cartella dei download.");
        }
    });

    // Gestisci l'importazione dei materiali
    importBtn.addEventListener('click', function () {
        importFile.click();
    });

    importFile.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const importedMaterials = JSON.parse(e.target.result);
                    materials = importedMaterials;
                    localStorage.setItem('materials', JSON.stringify(materials));
                    updateTables();
                    alert("Materiali importati con successo!");
                } catch (error) {
                    alert("Errore durante l'importazione. Assicurati che il file sia un JSON valido.");
                }
            };
            reader.readAsText(file);
        }
    });

    // Apri il modal per aggiungere un nuovo materiale
    addBtn.addEventListener('click', function () {
        openEditModal();
    });

    // Inizializza la tabella
    updateTables();
});