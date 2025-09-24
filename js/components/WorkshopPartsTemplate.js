/**
 * MASKTRONIC C20 - Vue.js Workshop Parts Template Component
 * Replaces vanilla workshop-parts-template.html
 * Advanced parts management with search, filters, and stock tracking
 */


const WorkshopPartsTemplate = {
    name: 'WorkshopPartsTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'parts-action'],
    
    setup(props, { emit }) {
        const partsState = reactive({
            searchQuery: '',
            filterCategory: 'all',
            sortBy: 'name',
            showAddPart: false,
            editingPart: null
        });

        const parts = reactive([
            {
                id: 1,
                name: 'HEPA Filter H13',
                code: 'HF-H13-001',
                category: 'filters',
                stock: 25,
                minStock: 10,
                status: 'available',
                price: 45.99,
                supplier: 'FilterCorp',
                description: 'High-efficiency particulate air filter'
            },
            {
                id: 2,
                name: 'Face Mask Seal',
                code: 'FMS-002',
                category: 'seals',
                stock: 5,
                minStock: 15,
                status: 'low_stock',
                price: 12.50,
                supplier: 'SealTech',
                description: 'Replacement seal for face masks'
            },
            {
                id: 3,
                name: 'Exhale Valve',
                code: 'EV-003',
                category: 'valves',
                stock: 0,
                minStock: 8,
                status: 'out_of_stock',
                price: 23.75,
                supplier: 'ValvePro',
                description: 'One-way exhale valve'
            },
            {
                id: 4,
                name: 'PP Full Face Mask',
                code: 'PPFFM-004',
                category: 'masks',
                stock: 12,
                minStock: 5,
                status: 'available',
                price: 89.99,
                supplier: 'MaskCorp',
                description: 'Polypropylene full face mask'
            }
        ]);

        const newPart = reactive({
            name: '', code: '', category: 'filters', stock: 0, minStock: 5,
            price: 0, supplier: '', description: ''
        });

        const pageTitle = computed(() => props.language === 'pl' ? 'Części Warsztatowe' : 'Workshop Parts');

        const categories = computed(() => [
            { value: 'all', label: props.language === 'pl' ? 'Wszystkie kategorie' : 'All Categories' },
            { value: 'masks', label: props.language === 'pl' ? 'Maski' : 'Masks' },
            { value: 'filters', label: props.language === 'pl' ? 'Filtry' : 'Filters' },
            { value: 'valves', label: props.language === 'pl' ? 'Zawory' : 'Valves' },
            { value: 'seals', label: props.language === 'pl' ? 'Uszczelki' : 'Seals' }
        ]);

        const filteredParts = computed(() => {
            let filtered = [...parts];
            
            if (partsState.searchQuery) {
                const query = partsState.searchQuery.toLowerCase();
                filtered = filtered.filter(part => 
                    part.name.toLowerCase().includes(query) ||
                    part.code.toLowerCase().includes(query) ||
                    part.supplier.toLowerCase().includes(query)
                );
            }
            
            if (partsState.filterCategory !== 'all') {
                filtered = filtered.filter(part => part.category === partsState.filterCategory);
            }
            
            return filtered.sort((a, b) => {
                if (partsState.sortBy === 'stock') return a.stock - b.stock;
                if (partsState.sortBy === 'price') return a.price - b.price;
                return a.name.localeCompare(b.name);
            });
        });

        const partsStats = computed(() => ({
            total: parts.length,
            available: parts.filter(p => p.status === 'available').length,
            lowStock: parts.filter(p => p.status === 'low_stock').length,
            outOfStock: parts.filter(p => p.status === 'out_of_stock').length,
            totalValue: parts.reduce((sum, p) => sum + (p.stock * p.price), 0)
        }));

        const getStatusColor = (status) => {
            const colors = {
                available: '#4caf50',
                low_stock: '#ff9800',
                out_of_stock: '#f44336'
            };
            return colors[status] || '#666';
        };

        const updatePartStatus = (part) => {
            if (part.stock === 0) {
                part.status = 'out_of_stock';
            } else if (part.stock <= part.minStock) {
                part.status = 'low_stock';
            } else {
                part.status = 'available';
            }
        };

        const addPart = () => {
            if (!newPart.name || !newPart.code) return;
            
            const part = {
                id: Date.now(),
                ...newPart
            };
            
            updatePartStatus(part);
            parts.push(part);
            
            Object.assign(newPart, {
                name: '', code: '', category: 'filters', stock: 0, minStock: 5,
                price: 0, supplier: '', description: ''
            });
            partsState.showAddPart = false;
            
            emit('parts-action', { action: 'added', part });
        };

        const editPart = (part) => {
            partsState.editingPart = { ...part };
        };

        const savePart = () => {
            const index = parts.findIndex(p => p.id === partsState.editingPart.id);
            if (index !== -1) {
                updatePartStatus(partsState.editingPart);
                Object.assign(parts[index], partsState.editingPart);
                partsState.editingPart = null;
                emit('parts-action', { action: 'updated', part: parts[index] });
            }
        };

        const deletePart = (partId) => {
            if (confirm(props.language === 'pl' ? 'Czy na pewno chcesz usunąć tę część?' : 'Are you sure?')) {
                const index = parts.findIndex(p => p.id === partId);
                if (index !== -1) {
                    const deleted = parts.splice(index, 1)[0];
                    emit('parts-action', { action: 'deleted', part: deleted });
                }
            }
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to workshop menu');
            emit('navigate', 'workshop-template', props.language, 'default');
        };

        onMounted(() => {
            console.log('🔶 Vue: WorkshopPartsTemplate component mounted');
        });

        return {
            partsState, parts, newPart, pageTitle, categories, filteredParts, partsStats,
            getStatusColor, addPart, editPart, savePart, deletePart, goBack
        };
    },

    template: `
        <div class="workshop-parts-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="add-btn" @click="partsState.showAddPart = !partsState.showAddPart">
                            ➕ {{ language === 'pl' ? 'Dodaj część' : 'Add Part' }}
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Parts Stats -->
                <div class="parts-stats">
                    <div class="stat-card total">
                        <h3>{{ language === 'pl' ? 'Wszystkie' : 'Total' }}</h3>
                        <span class="stat-number">{{ partsStats.total }}</span>
                    </div>
                    <div class="stat-card available">
                        <h3>{{ language === 'pl' ? 'Dostępne' : 'Available' }}</h3>
                        <span class="stat-number">{{ partsStats.available }}</span>
                    </div>
                    <div class="stat-card low-stock">
                        <h3>{{ language === 'pl' ? 'Niski stan' : 'Low Stock' }}</h3>
                        <span class="stat-number">{{ partsStats.lowStock }}</span>
                    </div>
                    <div class="stat-card out-of-stock">
                        <h3>{{ language === 'pl' ? 'Brak' : 'Out of Stock' }}</h3>
                        <span class="stat-number">{{ partsStats.outOfStock }}</span>
                    </div>
                    <div class="stat-card value">
                        <h3>{{ language === 'pl' ? 'Wartość' : 'Value' }}</h3>
                        <span class="stat-number">{{ partsStats.totalValue.toFixed(2) }} zł</span>
                    </div>
                </div>

                <!-- Search & Filter -->
                <div class="search-filter">
                    <input 
                        v-model="partsState.searchQuery"
                        type="text" 
                        :placeholder="language === 'pl' ? 'Szukaj części...' : 'Search parts...'"
                        class="search-input"
                    />
                    <select v-model="partsState.filterCategory" class="filter-select">
                        <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                            {{ cat.label }}
                        </option>
                    </select>
                    <select v-model="partsState.sortBy" class="sort-select">
                        <option value="name">{{ language === 'pl' ? 'Nazwa' : 'Name' }}</option>
                        <option value="stock">{{ language === 'pl' ? 'Stan' : 'Stock' }}</option>
                        <option value="price">{{ language === 'pl' ? 'Cena' : 'Price' }}</option>
                    </select>
                </div>

                <!-- Add Part Form -->
                <div v-if="partsState.showAddPart" class="add-part-form">
                    <h3>{{ language === 'pl' ? 'Nowa część' : 'New Part' }}</h3>
                    <div class="form-grid">
                        <input v-model="newPart.name" :placeholder="language === 'pl' ? 'Nazwa części' : 'Part name'" />
                        <input v-model="newPart.code" :placeholder="language === 'pl' ? 'Kod części' : 'Part code'" />
                        <select v-model="newPart.category">
                            <option v-for="cat in categories.slice(1)" :key="cat.value" :value="cat.value">
                                {{ cat.label }}
                            </option>
                        </select>
                        <input v-model.number="newPart.stock" type="number" :placeholder="language === 'pl' ? 'Stan' : 'Stock'" />
                        <input v-model.number="newPart.price" type="number" step="0.01" :placeholder="language === 'pl' ? 'Cena' : 'Price'" />
                        <input v-model="newPart.supplier" :placeholder="language === 'pl' ? 'Dostawca' : 'Supplier'" />
                    </div>
                    <textarea v-model="newPart.description" :placeholder="language === 'pl' ? 'Opis' : 'Description'"></textarea>
                    <div class="form-actions">
                        <button @click="addPart" class="save-btn">{{ language === 'pl' ? 'Dodaj' : 'Add' }}</button>
                        <button @click="partsState.showAddPart = false" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                    </div>
                </div>

                <!-- Parts List -->
                <div class="parts-list">
                    <div 
                        v-for="part in filteredParts" 
                        :key="part.id"
                        class="part-item"
                        :class="'status-' + part.status"
                    >
                        <div class="part-main">
                            <div class="part-info">
                                <h4 class="part-name">{{ part.name }}</h4>
                                <div class="part-code">{{ part.code }}</div>
                                <div class="part-description">{{ part.description }}</div>
                            </div>
                            
                            <div class="part-details">
                                <div class="part-stock">
                                    <span class="stock-label">{{ language === 'pl' ? 'Stan:' : 'Stock:' }}</span>
                                    <span class="stock-number" :class="'stock-' + part.status">{{ part.stock }}</span>
                                </div>
                                <div class="part-price">{{ part.price.toFixed(2) }} zł</div>
                                <div class="part-supplier">{{ part.supplier }}</div>
                            </div>
                        </div>
                        
                        <div class="part-status">
                            <span 
                                class="status-badge" 
                                :style="{ color: getStatusColor(part.status) }"
                            >
                                {{ part.status === 'available' ? (language === 'pl' ? 'Dostępne' : 'Available') :
                                   part.status === 'low_stock' ? (language === 'pl' ? 'Niski stan' : 'Low Stock') :
                                   (language === 'pl' ? 'Brak' : 'Out of Stock') }}
                            </span>
                        </div>
                        
                        <div class="part-actions">
                            <button @click="editPart(part)" class="action-btn edit" :title="language === 'pl' ? 'Edytuj' : 'Edit'">✏️</button>
                            <button @click="deletePart(part.id)" class="action-btn delete" :title="language === 'pl' ? 'Usuń' : 'Delete'">🗑️</button>
                        </div>
                    </div>
                </div>

                <!-- Edit Part Modal -->
                <div v-if="partsState.editingPart" class="modal-overlay" @click="partsState.editingPart = null">
                    <div class="modal-content" @click.stop>
                        <h3>{{ language === 'pl' ? 'Edytuj część' : 'Edit Part' }}</h3>
                        <div class="form-grid">
                            <input v-model="partsState.editingPart.name" :placeholder="language === 'pl' ? 'Nazwa' : 'Name'" />
                            <input v-model="partsState.editingPart.code" :placeholder="language === 'pl' ? 'Kod' : 'Code'" />
                            <input v-model.number="partsState.editingPart.stock" type="number" :placeholder="language === 'pl' ? 'Stan' : 'Stock'" />
                            <input v-model.number="partsState.editingPart.price" type="number" step="0.01" :placeholder="language === 'pl' ? 'Cena' : 'Price'" />
                        </div>
                        <div class="modal-actions">
                            <button @click="savePart" class="save-btn">{{ language === 'pl' ? 'Zapisz' : 'Save' }}</button>
                            <button @click="partsState.editingPart = null" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .workshop-parts-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container { max-width: 1400px; margin: 0 auto; }
        
        .template-header {
            display: flex; align-items: center; justify-content: space-between;
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .back-btn, .add-btn { 
            padding: 8px 16px; border: none; border-radius: 6px; 
            cursor: pointer; font-weight: 500; transition: all 0.3s; 
        }
        .back-btn { background: #6c757d; color: white; }
        .add-btn { background: #28a745; color: white; }
        
        .vue-badge { 
            background: #42b883; color: white; padding: 6px 12px; 
            border-radius: 16px; font-size: 0.9em; font-weight: 600; 
        }
        
        .parts-stats {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px; margin-bottom: 24px;
        }
        
        .stat-card {
            background: white; padding: 16px; border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;
            border-left: 4px solid #9c27b0;
        }
        
        .stat-card.available { border-left-color: #4caf50; }
        .stat-card.low-stock { border-left-color: #ff9800; }
        .stat-card.out-of-stock { border-left-color: #f44336; }
        .stat-card.value { border-left-color: #2196f3; }
        
        .stat-card h3 { margin: 0 0 8px 0; font-size: 0.9em; color: #666; }
        .stat-number { font-size: 1.6em; font-weight: 600; color: #333; }
        
        .search-filter {
            display: flex; gap: 16px; background: white; padding: 20px;
            border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .search-input { flex: 1; }
        .search-input, .filter-select, .sort-select {
            padding: 10px; border: 2px solid #e9ecef; border-radius: 6px;
        }
        
        .add-part-form {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .form-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px; margin-bottom: 16px;
        }
        
        .form-grid input, .form-grid select, textarea {
            padding: 8px; border: 2px solid #e9ecef; border-radius: 4px;
        }
        
        textarea { grid-column: 1 / -1; margin-bottom: 16px; }
        
        .form-actions, .modal-actions {
            display: flex; gap: 12px; justify-content: flex-end;
        }
        
        .save-btn { background: #28a745; color: white; }
        .cancel-btn { background: #6c757d; color: white; }
        .save-btn, .cancel-btn {
            padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
        }
        
        .parts-list { display: flex; flex-direction: column; gap: 12px; }
        
        .part-item {
            display: flex; align-items: center; gap: 16px; padding: 16px;
            background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
        }
        
        .part-item.status-available { border-left: 4px solid #4caf50; }
        .part-item.status-low_stock { border-left: 4px solid #ff9800; }
        .part-item.status-out_of_stock { border-left: 4px solid #f44336; }
        
        .part-main { flex: 1; display: flex; justify-content: space-between; }
        
        .part-name { margin: 0 0 4px 0; color: #333; }
        .part-code { font-family: monospace; color: #666; font-size: 0.9em; }
        .part-description { color: #999; font-size: 0.8em; margin-top: 4px; }
        
        .part-details { text-align: right; }
        .part-stock { margin-bottom: 4px; }
        .stock-number { font-weight: 600; }
        .stock-number.stock-available { color: #4caf50; }
        .stock-number.stock-low_stock { color: #ff9800; }
        .stock-number.stock-out_of_stock { color: #f44336; }
        
        .part-price { font-weight: 600; color: #333; margin-bottom: 4px; }
        .part-supplier { font-size: 0.8em; color: #666; }
        
        .status-badge { font-weight: 600; padding: 4px 8px; border-radius: 4px; }
        
        .part-actions {
            display: flex; gap: 8px;
        }
        
        .action-btn {
            padding: 4px 6px; border: none; border-radius: 4px;
            cursor: pointer; transition: all 0.3s;
        }
        
        .action-btn.edit { background: #fff3cd; }
        .action-btn.delete { background: #f8d7da; }
        
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2); min-width: 400px;
        }
    `
};

window.WorkshopPartsTemplate = WorkshopPartsTemplate;
console.log('🔶 Vue WorkshopPartsTemplate component loaded');
