/**
 * MASKSERVICE C20 - Workshop Parts Module
 * Spare parts management, ordering, and inventory tracking
 * @version 2.0.0
 * @author MASKSERVICE Team
 */

class WorkshopParts {
    constructor(workshopCore) {
        this.core = workshopCore;
        this.filters = {
            category: 'ALL',
            status: 'ALL',
            supplier: 'ALL'
        };
    }

    /**
     * Show workshop parts management view
     */
    showWorkshopParts() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getWorkshopPartsHTML();
        }
    }

    /**
     * Generate parts management HTML
     */
    getWorkshopPartsHTML() {
        return `
            <div class="workshop-parts">
                <div class="parts-header">
                    <h2>🔧 Zarządzanie częściami zamiennymi</h2>
                    <div class="parts-actions">
                        <button class="btn btn-primary" onclick="workshopEnhanced.parts.addNewPart()">
                            ➕ Dodaj część
                        </button>
                        <button class="btn btn-secondary" onclick="workshopEnhanced.parts.orderParts()">
                            📦 Zamów części
                        </button>
                        <button class="btn btn-info" onclick="workshopEnhanced.parts.exportPartsReport()">
                            📊 Raport
                        </button>
                    </div>
                </div>

                <div class="parts-filters">
                    <div class="filter-group">
                        <label>Kategoria:</label>
                        <select id="parts-category-filter" onchange="workshopEnhanced.parts.applyFilters()">
                            <option value="ALL">Wszystkie</option>
                            <option value="FILTER">Filtry</option>
                            <option value="SEAL">Uszczelki</option>
                            <option value="VALVE">Zawory</option>
                            <option value="STRAP">Paski</option>
                            <option value="VISOR">Szyby</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Status:</label>
                        <select id="parts-status-filter" onchange="workshopEnhanced.parts.applyFilters()">
                            <option value="ALL">Wszystkie</option>
                            <option value="IN_STOCK">Na stanie</option>
                            <option value="LOW_STOCK">Niski stan</option>
                            <option value="OUT_OF_STOCK">Brak</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Dostawca:</label>
                        <select id="parts-supplier-filter" onchange="workshopEnhanced.parts.applyFilters()">
                            <option value="ALL">Wszyscy</option>
                            ${this.getSupplierOptions()}
                        </select>
                    </div>
                </div>

                <div class="parts-summary">
                    <div class="summary-card">
                        <h4>Łączna wartość</h4>
                        <span class="value">${this.core.getTotalInventoryValue().toFixed(2)} ${this.core.getTotalInventoryCurrency()}</span>
                    </div>
                    <div class="summary-card warning">
                        <h4>Niski stan</h4>
                        <span class="value">${this.getLowStockCount()}</span>
                    </div>
                    <div class="summary-card">
                        <h4>Dostawcy</h4>
                        <span class="value">${this.getUniqueSuppliers().length}</span>
                    </div>
                </div>

                <div class="parts-table-container">
                    <table class="parts-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nazwa części</th>
                                <th>Kategoria</th>
                                <th>Ilość</th>
                                <th>Min. poziom</th>
                                <th>Cena jedn.</th>
                                <th>Dostawca</th>
                                <th>Status</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getPartsTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Generate supplier options for filter
     */
    getSupplierOptions() {
        const suppliers = this.getUniqueSuppliers();
        return suppliers.map(supplier => 
            `<option value="${supplier}">${supplier}</option>`
        ).join('');
    }

    /**
     * Get unique suppliers from parts
     */
    getUniqueSuppliers() {
        const suppliers = new Set();
        this.core.getSpareParts().forEach(part => {
            suppliers.add(part.supplier);
        });
        return Array.from(suppliers);
    }

    /**
     * Get count of parts with low stock
     */
    getLowStockCount() {
        return this.core.getSpareParts().filter(part => 
            part.quantity <= part.minLevel
        ).length;
    }

    /**
     * Generate parts table rows
     */
    getPartsTableRows() {
        const parts = this.getFilteredParts();
        
        return parts.map(part => {
            const status = this.getPartStatus(part);
            const statusClass = status.toLowerCase().replace('_', '-');
            
            return `
                <tr class="part-row ${statusClass}">
                    <td>${part.id}</td>
                    <td>${part.name}</td>
                    <td>${part.category || 'N/A'}</td>
                    <td>
                        <span class="quantity ${part.quantity <= part.minLevel ? 'low' : ''}">${part.quantity}</span>
                    </td>
                    <td>${part.minLevel}</td>
                    <td>${part.price.toFixed(2)} ${this.core.getTotalInventoryCurrency()}</td>
                    <td>${part.supplier}</td>
                    <td><span class="status-badge ${statusClass}">${this.translateStatus(status)}</span></td>
                    <td class="actions">
                        <button class="btn-small btn-edit" onclick="workshopEnhanced.parts.editPart('${part.id}')">✏️</button>
                        <button class="btn-small btn-order" onclick="workshopEnhanced.parts.orderPart('${part.id}')">📦</button>
                        <button class="btn-small btn-delete" onclick="workshopEnhanced.parts.deletePart('${part.id}')">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Get filtered parts based on current filters
     */
    getFilteredParts() {
        let parts = this.core.getSpareParts();

        if (this.filters.category !== 'ALL') {
            parts = parts.filter(part => part.category === this.filters.category);
        }

        if (this.filters.status !== 'ALL') {
            parts = parts.filter(part => {
                const status = this.getPartStatus(part);
                return status === this.filters.status;
            });
        }

        if (this.filters.supplier !== 'ALL') {
            parts = parts.filter(part => part.supplier === this.filters.supplier);
        }

        return parts;
    }

    /**
     * Get part status based on quantity
     */
    getPartStatus(part) {
        if (part.quantity === 0) {
            return 'OUT_OF_STOCK';
        } else if (part.quantity <= part.minLevel) {
            return 'LOW_STOCK';
        } else {
            return 'IN_STOCK';
        }
    }

    /**
     * Translate status to Polish
     */
    translateStatus(status) {
        const translations = {
            'IN_STOCK': 'Na stanie',
            'LOW_STOCK': 'Niski stan',
            'OUT_OF_STOCK': 'Brak'
        };
        return translations[status] || status;
    }

    /**
     * Apply filters to parts list
     */
    applyFilters() {
        this.filters.category = document.getElementById('parts-category-filter').value;
        this.filters.status = document.getElementById('parts-status-filter').value;
        this.filters.supplier = document.getElementById('parts-supplier-filter').value;

        // Refresh parts table
        const tbody = document.querySelector('.parts-table tbody');
        if (tbody) {
            tbody.innerHTML = this.getPartsTableRows();
        }
    }

    /**
     * Add new part dialog
     */
    addNewPart() {
        const partData = {
            id: `P${String(Date.now()).slice(-3)}`,
            name: prompt('Nazwa części:'),
            category: prompt('Kategoria (FILTER/SEAL/VALVE/STRAP/VISOR):') || 'OTHER',
            quantity: parseInt(prompt('Ilość:')) || 0,
            minLevel: parseInt(prompt('Minimalny poziom:')) || 1,
            price: parseFloat(prompt('Cena jednostkowa:')) || 0,
            supplier: prompt('Dostawca:') || 'Unknown'
        };

        if (partData.name) {
            this.core.spareParts.set(partData.id, partData);
            this.showWorkshopParts(); // Refresh view
            alert(`Część ${partData.name} została dodana.`);
        }
    }

    /**
     * Edit existing part
     */
    editPart(partId) {
        const part = this.core.getSparePart(partId);
        if (!part) {
            alert('Nie znaleziono części!');
            return;
        }

        const newName = prompt('Nazwa części:', part.name);
        const newQuantity = prompt('Ilość:', part.quantity);
        const newMinLevel = prompt('Minimalny poziom:', part.minLevel);
        const newPrice = prompt('Cena jednostkowa:', part.price);

        if (newName !== null) {
            part.name = newName;
            part.quantity = parseInt(newQuantity) || part.quantity;
            part.minLevel = parseInt(newMinLevel) || part.minLevel;
            part.price = parseFloat(newPrice) || part.price;

            this.core.spareParts.set(partId, part);
            this.showWorkshopParts(); // Refresh view
            alert('Część została zaktualizowana.');
        }
    }

    /**
     * Order specific part
     */
    orderPart(partId) {
        const part = this.core.getSparePart(partId);
        if (!part) {
            alert('Nie znaleziono części!');
            return;
        }

        const quantity = parseInt(prompt(`Ile sztuk zamówić dla: ${part.name}?`, '10'));
        if (quantity && quantity > 0) {
            // Simulate order processing
            document.dispatchEvent(new CustomEvent('partOrderRequest', {
                detail: {
                    partId: partId,
                    quantity: quantity,
                    supplier: part.supplier,
                    totalCost: quantity * part.price
                }
            }));

            alert(`Zamówiono ${quantity} szt. części ${part.name} od ${part.supplier}.`);
            this.showWorkshopParts(); // Refresh view
        }
    }

    /**
     * Delete part with confirmation
     */
    deletePart(partId) {
        const part = this.core.getSparePart(partId);
        if (!part) {
            alert('Nie znaleziono części!');
            return;
        }

        if (confirm(`Czy na pewno usunąć część: ${part.name}?`)) {
            this.core.spareParts.delete(partId);
            this.showWorkshopParts(); // Refresh view
            alert('Część została usunięta.');
        }
    }

    /**
     * Order multiple parts based on low stock
     */
    orderParts() {
        const lowStockParts = this.core.getSpareParts().filter(part => 
            part.quantity <= part.minLevel
        );

        if (lowStockParts.length === 0) {
            alert('Wszystkie części są na odpowiednim poziomie zapasów.');
            return;
        }

        let orderSummary = 'Zamówienie części o niskim stanie:\n\n';
        let totalCost = 0;

        lowStockParts.forEach(part => {
            const orderQuantity = part.minLevel * 2; // Order double the minimum level
            const cost = orderQuantity * part.price;
            totalCost += cost;

            orderSummary += `${part.name}: ${orderQuantity} szt. (${cost.toFixed(2)} ${this.core.getTotalInventoryCurrency()})\n`;
            
            // Update quantity
            part.quantity += orderQuantity;
            this.core.spareParts.set(part.id, part);
        });

        orderSummary += `\nŁączny koszt: ${totalCost.toFixed(2)} ${this.core.getTotalInventoryCurrency()}`;

        if (confirm(orderSummary + '\n\nPotwierdź zamówienie?')) {
            alert('Zamówienie zostało złożone!');
            this.showWorkshopParts(); // Refresh view
        }
    }

    /**
     * Export parts report
     */
    exportPartsReport() {
        const parts = this.core.getSpareParts();
        let report = 'RAPORT CZĘŚCI ZAMIENNYCH\n';
        report += '=' .repeat(50) + '\n\n';

        report += `Data raportu: ${new Date().toLocaleDateString()}\n`;
        report += `Łączna wartość zapasów: ${this.core.getTotalInventoryValue().toFixed(2)} ${this.core.getTotalInventoryCurrency()}\n`;
        report += `Liczba pozycji: ${parts.length}\n`;
        report += `Części o niskim stanie: ${this.getLowStockCount()}\n\n`;

        report += 'SZCZEGÓŁY:\n';
        report += '-'.repeat(50) + '\n';

        parts.forEach(part => {
            const status = this.translateStatus(this.getPartStatus(part));
            report += `${part.id} | ${part.name} | ${part.quantity} szt. | ${status}\n`;
        });

        // Create downloadable file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raport_czesci_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Raport został wygenerowany i pobierany.');
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkshopParts;
}

console.log('✅ WorkshopParts module loaded');
