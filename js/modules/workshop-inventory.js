/**
 * MASKSERVICE C20 - Workshop Inventory Module
 * Inventory management, tracking, and reporting
 * @version 2.0.0
 * @author MASKSERVICE Team
 */

class WorkshopInventory {
    constructor(workshopCore) {
        this.core = workshopCore;
        this.selectedCategory = 'ALL';
        this.inventoryView = 'summary'; // 'summary', 'detailed', 'movements'
    }

    /**
     * Show workshop inventory management view
     */
    showWorkshopInventory() {
        const content = document.getElementById('menu-content');
        if (content) {
            content.innerHTML = this.getWorkshopInventoryHTML();
        }
    }

    /**
     * Generate inventory management HTML
     */
    getWorkshopInventoryHTML() {
        return `
            <div class="workshop-inventory">
                <div class="inventory-header">
                    <h2>📦 Zarządzanie magazynem</h2>
                    <div class="inventory-actions">
                        <button class="btn btn-primary" onclick="workshopEnhanced.inventory.performInventoryCount()">
                            📋 Inwentaryzacja
                        </button>
                        <button class="btn btn-secondary" onclick="workshopEnhanced.inventory.generateInventoryReport()">
                            📊 Raport
                        </button>
                        <button class="btn btn-info" onclick="workshopEnhanced.inventory.exportInventoryData()">
                            📤 Eksport
                        </button>
                    </div>
                </div>

                <div class="inventory-overview">
                    <div class="overview-card">
                        <h4>Łączna wartość</h4>
                        <span class="value">${this.core.getTotalInventoryValue().toFixed(2)} ${this.core.getTotalInventoryCurrency()}</span>
                        <small>całego magazynu</small>
                    </div>
                    <div class="overview-card warning">
                        <h4>Niski stan</h4>
                        <span class="value">${this.getLowStockItemsCount()}</span>
                        <small>pozycji</small>
                    </div>
                    <div class="overview-card info">
                        <h4>Kategorie</h4>
                        <span class="value">${this.getUniqueCategories().length}</span>
                        <small>różnych</small>
                    </div>
                    <div class="overview-card">
                        <h4>Dostawcy</h4>
                        <span class="value">${this.getUniqueSuppliers().length}</span>
                        <small>aktywnych</small>
                    </div>
                </div>

                <div class="inventory-controls">
                    <div class="view-selector">
                        <button class="view-btn ${this.inventoryView === 'summary' ? 'active' : ''}" 
                                onclick="workshopEnhanced.inventory.switchView('summary')">
                            📊 Podsumowanie
                        </button>
                        <button class="view-btn ${this.inventoryView === 'detailed' ? 'active' : ''}" 
                                onclick="workshopEnhanced.inventory.switchView('detailed')">
                            📋 Szczegółowo
                        </button>
                        <button class="view-btn ${this.inventoryView === 'movements' ? 'active' : ''}" 
                                onclick="workshopEnhanced.inventory.switchView('movements')">
                            🔄 Ruchy magazynowe
                        </button>
                    </div>

                    <div class="category-filter">
                        <label>Kategoria:</label>
                        <select id="inventory-category-filter" onchange="workshopEnhanced.inventory.applyFilters()">
                            <option value="ALL">Wszystkie</option>
                            ${this.getCategoryOptions()}
                        </select>
                    </div>
                </div>

                <div class="inventory-content">
                    ${this.getInventoryContentHTML()}
                </div>

                <div class="inventory-charts" id="inventory-charts" style="display: none;">
                    ${this.getInventoryChartsHTML()}
                </div>
            </div>
        `;
    }

    /**
     * Get count of low stock items
     */
    getLowStockItemsCount() {
        return this.core.getSpareParts().filter(part => 
            part.quantity <= part.minLevel
        ).length;
    }

    /**
     * Get unique categories from parts
     */
    getUniqueCategories() {
        const categories = new Set();
        this.core.getSpareParts().forEach(part => {
            if (part.category) {
                categories.add(part.category);
            }
        });
        return Array.from(categories);
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
     * Generate category options for filter
     */
    getCategoryOptions() {
        const categories = this.getUniqueCategories();
        return categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');
    }

    /**
     * Get inventory content HTML based on current view
     */
    getInventoryContentHTML() {
        switch (this.inventoryView) {
            case 'summary':
                return this.getInventorySummaryHTML();
            case 'detailed':
                return this.getInventoryDetailedHTML();
            case 'movements':
                return this.getInventoryMovementsHTML();
            default:
                return this.getInventorySummaryHTML();
        }
    }

    /**
     * Generate inventory summary view
     */
    getInventorySummaryHTML() {
        const categories = this.getUniqueCategories();
        
        return `
            <div class="inventory-summary">
                <h3>Podsumowanie magazynu</h3>
                <div class="summary-grid">
                    ${categories.map(category => {
                        const categoryParts = this.getPartsByCategory(category);
                        const categoryValue = this.getCategoryValue(categoryParts);
                        const lowStockCount = categoryParts.filter(part => part.quantity <= part.minLevel).length;
                        
                        return `
                            <div class="category-summary-card">
                                <div class="category-header">
                                    <h4>${category}</h4>
                                    <span class="item-count">${categoryParts.length} pozycji</span>
                                </div>
                                <div class="category-stats">
                                    <div class="stat">
                                        <span class="label">Wartość:</span>
                                        <span class="value">${categoryValue.toFixed(2)} ${this.core.getTotalInventoryCurrency()}</span>
                                    </div>
                                    <div class="stat">
                                        <span class="label">Ilość:</span>
                                        <span class="value">${this.getCategoryQuantity(categoryParts)} szt.</span>
                                    </div>
                                    ${lowStockCount > 0 ? `
                                        <div class="stat warning">
                                            <span class="label">Niski stan:</span>
                                            <span class="value">${lowStockCount} pozycji</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="category-actions">
                                    <button class="btn-small" onclick="workshopEnhanced.inventory.viewCategoryDetails('${category}')">
                                        Szczegóły
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Generate detailed inventory view
     */
    getInventoryDetailedHTML() {
        const parts = this.getFilteredParts();
        
        return `
            <div class="inventory-detailed">
                <h3>Szczegółowy spis magazynu</h3>
                <div class="inventory-table-container">
                    <table class="inventory-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nazwa</th>
                                <th>Kategoria</th>
                                <th>Ilość</th>
                                <th>Min. poziom</th>
                                <th>Wartość jedn.</th>
                                <th>Wartość łączna</th>
                                <th>Status</th>
                                <th>Lokalizacja</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${parts.map(part => {
                                const totalValue = part.quantity * part.price;
                                const status = this.getPartStatus(part);
                                const statusClass = status.toLowerCase().replace('_', '-');
                                
                                return `
                                    <tr class="inventory-row ${statusClass}">
                                        <td>${part.id}</td>
                                        <td>${part.name}</td>
                                        <td>${part.category || 'N/A'}</td>
                                        <td class="quantity ${part.quantity <= part.minLevel ? 'low' : ''}">${part.quantity}</td>
                                        <td>${part.minLevel}</td>
                                        <td>${part.price.toFixed(2)} ${this.core.getTotalInventoryCurrency()}</td>
                                        <td class="total-value">${totalValue.toFixed(2)} ${this.core.getTotalInventoryCurrency()}</td>
                                        <td><span class="status-badge ${statusClass}">${this.translateStatus(status)}</span></td>
                                        <td>${this.getPartLocation(part.id)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Generate inventory movements view
     */
    getInventoryMovementsHTML() {
        const movements = this.getInventoryMovements();
        
        return `
            <div class="inventory-movements">
                <h3>Ruchy magazynowe</h3>
                <div class="movements-controls">
                    <button class="btn btn-primary" onclick="workshopEnhanced.inventory.addMovement('IN')">
                        ➕ Przyjęcie
                    </button>
                    <button class="btn btn-secondary" onclick="workshopEnhanced.inventory.addMovement('OUT')">
                        ➖ Wydanie
                    </button>
                    <button class="btn btn-info" onclick="workshopEnhanced.inventory.addMovement('TRANSFER')">
                        🔄 Przesunięcie
                    </button>
                </div>
                
                <div class="movements-list">
                    ${movements.length === 0 ? 
                        '<div class="no-movements">Brak ruchów magazynowych.</div>' :
                        movements.map(movement => `
                            <div class="movement-item ${movement.type.toLowerCase()}">
                                <div class="movement-date">${this.formatDateTime(movement.date)}</div>
                                <div class="movement-details">
                                    <span class="movement-type">${this.translateMovementType(movement.type)}</span>
                                    <span class="movement-part">${movement.partName} (${movement.partId})</span>
                                    <span class="movement-quantity">${movement.type === 'OUT' ? '-' : '+'}${movement.quantity} szt.</span>
                                </div>
                                <div class="movement-description">${movement.description || 'Brak opisu'}</div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    /**
     * Get parts by category
     */
    getPartsByCategory(category) {
        return this.core.getSpareParts().filter(part => part.category === category);
    }

    /**
     * Get category total value
     */
    getCategoryValue(categoryParts) {
        return categoryParts.reduce((total, part) => {
            return total + (part.quantity * part.price);
        }, 0);
    }

    /**
     * Get category total quantity
     */
    getCategoryQuantity(categoryParts) {
        return categoryParts.reduce((total, part) => total + part.quantity, 0);
    }

    /**
     * Get filtered parts
     */
    getFilteredParts() {
        let parts = this.core.getSpareParts();
        
        if (this.selectedCategory !== 'ALL') {
            parts = parts.filter(part => part.category === this.selectedCategory);
        }
        
        return parts;
    }

    /**
     * Get part status
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
     * Translate status
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
     * Get part location (mock data)
     */
    getPartLocation(partId) {
        const locations = ['A1-001', 'A1-002', 'B2-001', 'B2-002', 'C3-001'];
        return locations[partId.charCodeAt(partId.length - 1) % locations.length];
    }

    /**
     * Get inventory movements (mock data)
     */
    getInventoryMovements() {
        // In a real application, this would come from a database
        return [
            {
                id: 'MOV001',
                date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                type: 'IN',
                partId: 'P001',
                partName: 'Filtr HEPA P3',
                quantity: 10,
                description: 'Dostawa od FilterTech'
            },
            {
                id: 'MOV002',
                date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                type: 'OUT',
                partId: 'P002',
                partName: 'Uszczelka główna',
                quantity: 3,
                description: 'Użyte do naprawy PP001'
            },
            {
                id: 'MOV003',
                date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                type: 'TRANSFER',
                partId: 'P003',
                partName: 'Zawór wydechowy',
                quantity: 2,
                description: 'Przeniesienie do LAB-002'
            }
        ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
    }

    /**
     * Translate movement type
     */
    translateMovementType(type) {
        const translations = {
            'IN': 'Przyjęcie',
            'OUT': 'Wydanie',
            'TRANSFER': 'Przesunięcie'
        };
        return translations[type] || type;
    }

    /**
     * Format date and time
     */
    formatDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('pl-PL');
    }

    /**
     * Switch inventory view
     */
    switchView(view) {
        this.inventoryView = view;
        this.showWorkshopInventory(); // Refresh view
    }

    /**
     * Apply filters
     */
    applyFilters() {
        this.selectedCategory = document.getElementById('inventory-category-filter').value;
        
        // Refresh current view content
        const inventoryContent = document.querySelector('.inventory-content');
        if (inventoryContent) {
            inventoryContent.innerHTML = this.getInventoryContentHTML();
        }
    }

    /**
     * View category details
     */
    viewCategoryDetails(category) {
        this.selectedCategory = category;
        this.switchView('detailed');
    }

    /**
     * Perform inventory count
     */
    performInventoryCount() {
        const parts = this.core.getSpareParts();
        let countSummary = 'INWENTARYZACJA MAGAZYNU\n';
        countSummary += '=' .repeat(40) + '\n\n';
        countSummary += `Data inwentaryzacji: ${new Date().toLocaleString('pl-PL')}\n\n`;

        let discrepancies = 0;
        
        parts.forEach(part => {
            // Simulate random counting discrepancies (for demo)
            const countedQuantity = Math.random() > 0.9 ? 
                part.quantity + Math.floor(Math.random() * 3) - 1 : 
                part.quantity;
            
            if (countedQuantity !== part.quantity) {
                discrepancies++;
                countSummary += `${part.id} | ${part.name} | Różnica: ${countedQuantity - part.quantity}\n`;
            }
        });

        if (discrepancies === 0) {
            countSummary += 'Brak rozbieżności - inwentaryzacja zgodna z systemem.\n';
        } else {
            countSummary += `\nZnaleziono ${discrepancies} rozbieżności.\n`;
        }

        if (confirm(countSummary + '\nCzy zapisać wyniki inwentaryzacji?')) {
            alert('Inwentaryzacja została zakończona i zapisana.');
        }
    }

    /**
     * Add inventory movement
     */
    addMovement(type) {
        const partId = prompt('ID części:');
        if (!partId) return;

        const part = this.core.getSparePart(partId);
        if (!part) {
            alert('Nie znaleziono części o podanym ID!');
            return;
        }

        const quantity = parseInt(prompt(`Ilość (${this.translateMovementType(type)}):`));
        if (!quantity || quantity <= 0) return;

        const description = prompt('Opis ruchu (opcjonalnie):') || '';

        // Update part quantity
        if (type === 'OUT') {
            if (part.quantity < quantity) {
                alert('Niewystarczająca ilość na stanie!');
                return;
            }
            part.quantity -= quantity;
        } else if (type === 'IN') {
            part.quantity += quantity;
        }
        // For TRANSFER, we don't change quantity in this simple implementation

        this.core.spareParts.set(partId, part);

        // In a real application, we would save the movement to database
        alert(`Ruch magazynowy ${this.translateMovementType(type)} został zarejestrowany.`);
        
        this.showWorkshopInventory(); // Refresh view
    }

    /**
     * Generate inventory report
     */
    generateInventoryReport() {
        const parts = this.core.getSpareParts();
        const categories = this.getUniqueCategories();
        
        let report = 'RAPORT MAGAZYNOWY\n';
        report += '=' .repeat(50) + '\n\n';

        report += `Data raportu: ${new Date().toLocaleString('pl-PL')}\n`;
        report += `Łączna wartość magazynu: ${this.core.getTotalInventoryValue().toFixed(2)} ${this.core.getTotalInventoryCurrency()}\n`;
        report += `Liczba pozycji: ${parts.length}\n`;
        report += `Liczba kategorii: ${categories.length}\n`;
        report += `Pozycje o niskim stanie: ${this.getLowStockItemsCount()}\n\n`;

        report += 'PODSUMOWANIE KATEGORII:\n';
        report += '-'.repeat(50) + '\n';

        categories.forEach(category => {
            const categoryParts = this.getPartsByCategory(category);
            const categoryValue = this.getCategoryValue(categoryParts);
            report += `${category}: ${categoryParts.length} pozycji, wartość: ${categoryValue.toFixed(2)} ${this.core.getTotalInventoryCurrency()}\n`;
        });

        report += '\nSZCZEGÓŁY POZYCJI:\n';
        report += '-'.repeat(50) + '\n';

        parts.forEach(part => {
            const totalValue = part.quantity * part.price;
            const status = this.translateStatus(this.getPartStatus(part));
            report += `${part.id} | ${part.name} | ${part.quantity} szt. | ${totalValue.toFixed(2)} ${this.core.getTotalInventoryCurrency()} | ${status}\n`;
        });

        // Create downloadable file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raport_magazynowy_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Raport magazynowy został wygenerowany i pobrany.');
    }

    /**
     * Export inventory data
     */
    exportInventoryData() {
        const parts = this.core.getSpareParts();
        
        // Create CSV format
        let csv = 'ID,Nazwa,Kategoria,Ilość,Min. poziom,Cena,Wartość łączna,Status,Dostawca\n';
        
        parts.forEach(part => {
            const totalValue = part.quantity * part.price;
            const status = this.translateStatus(this.getPartStatus(part));
            
            csv += `"${part.id}","${part.name}","${part.category || ''}",${part.quantity},${part.minLevel},${part.price},${totalValue},"${status}","${part.supplier}"\n`;
        });

        // Create downloadable file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eksport_magazynu_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Dane magazynowe zostały wyeksportowane do pliku CSV.');
    }

    /**
     * Get inventory charts HTML (placeholder for future charts implementation)
     */
    getInventoryChartsHTML() {
        return `
            <div class="charts-container">
                <div class="chart-placeholder">
                    <h4>Wartość magazynu wg kategorii</h4>
                    <p>Wykres zostanie zaimplementowany w przyszłej wersji.</p>
                </div>
                <div class="chart-placeholder">
                    <h4>Trendy zużycia części</h4>
                    <p>Wykres zostanie zaimplementowany w przyszłej wersji.</p>
                </div>
            </div>
        `;
    }

    /**
     * Toggle charts visibility
     */
    toggleCharts() {
        const charts = document.getElementById('inventory-charts');
        if (charts) {
            charts.style.display = charts.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkshopInventory;
}

console.log('✅ WorkshopInventory module loaded');
