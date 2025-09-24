/**
 * MASKTRONIC C20 - Vue.js Workshop Inventory Template Component
 * Replaces vanilla workshop-inventory-template.html
 * Advanced inventory management with stock tracking and alerts
 */


const WorkshopInventoryTemplate = {
    name: 'WorkshopInventoryTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'inventory-action'],
    
    setup(props, { emit }) {
        const inventoryState = reactive({
            searchQuery: '',
            filterCategory: 'all',
            sortBy: 'name',
            showAddItem: false,
            editingItem: null
        });

        const inventoryItems = reactive([
            { id: 1, name: 'Filtr HEPA H14', category: 'filters', stock: 15, minStock: 10, price: 45.50, supplier: 'FilterCorp', location: 'A-01' },
            { id: 2, name: 'Maska PP pełna', category: 'masks', stock: 8, minStock: 15, price: 125.00, supplier: 'MaskPro', location: 'B-03' },
            { id: 3, name: 'Zawór wydechowy', category: 'valves', stock: 0, minStock: 5, price: 23.75, supplier: 'ValveTech', location: 'C-02' },
            { id: 4, name: 'Pasek elastyczny', category: 'accessories', stock: 45, minStock: 20, price: 8.90, supplier: 'AcceParts', location: 'D-01' },
            { id: 5, name: 'Sensor przepływu', category: 'sensors', stock: 3, minStock: 8, price: 78.25, supplier: 'SensorMax', location: 'E-04' }
        ]);

        const newItem = reactive({
            name: '', category: 'filters', stock: 0, minStock: 5, price: 0, supplier: '', location: ''
        });

        const pageTitle = computed(() => props.language === 'pl' ? 'Inwentarz Warsztatowy' : 'Workshop Inventory');

        const categories = computed(() => [
            { value: 'all', label: props.language === 'pl' ? 'Wszystkie' : 'All' },
            { value: 'filters', label: props.language === 'pl' ? 'Filtry' : 'Filters' },
            { value: 'masks', label: props.language === 'pl' ? 'Maski' : 'Masks' },
            { value: 'valves', label: props.language === 'pl' ? 'Zawory' : 'Valves' },
            { value: 'sensors', label: props.language === 'pl' ? 'Sensory' : 'Sensors' },
            { value: 'accessories', label: props.language === 'pl' ? 'Akcesoria' : 'Accessories' }
        ]);

        const filteredItems = computed(() => {
            let filtered = [...inventoryItems];
            
            if (inventoryState.searchQuery) {
                const query = inventoryState.searchQuery.toLowerCase();
                filtered = filtered.filter(item => 
                    item.name.toLowerCase().includes(query) ||
                    item.supplier.toLowerCase().includes(query) ||
                    item.location.toLowerCase().includes(query)
                );
            }
            
            if (inventoryState.filterCategory !== 'all') {
                filtered = filtered.filter(item => item.category === inventoryState.filterCategory);
            }
            
            return filtered.sort((a, b) => {
                if (inventoryState.sortBy === 'stock') return a.stock - b.stock;
                if (inventoryState.sortBy === 'price') return a.price - b.price;
                return a.name.localeCompare(b.name);
            });
        });

        const inventoryStats = computed(() => ({
            totalItems: inventoryItems.reduce((sum, item) => sum + item.stock, 0),
            totalProducts: inventoryItems.length,
            lowStock: inventoryItems.filter(item => item.stock <= item.minStock && item.stock > 0).length,
            outOfStock: inventoryItems.filter(item => item.stock === 0).length,
            totalValue: inventoryItems.reduce((sum, item) => sum + (item.stock * item.price), 0)
        }));

        const getStockStatus = (item) => {
            if (item.stock === 0) return 'out-of-stock';
            if (item.stock <= item.minStock) return 'low-stock';
            return 'in-stock';
        };

        const addItem = () => {
            if (!newItem.name.trim()) return;
            
            const item = {
                id: Date.now(),
                ...newItem
            };
            
            inventoryItems.push(item);
            Object.assign(newItem, { name: '', category: 'filters', stock: 0, minStock: 5, price: 0, supplier: '', location: '' });
            inventoryState.showAddItem = false;
            
            emit('inventory-action', { action: 'added', item });
        };

        const editItem = (item) => {
            inventoryState.editingItem = { ...item };
        };

        const saveItem = () => {
            const index = inventoryItems.findIndex(i => i.id === inventoryState.editingItem.id);
            if (index !== -1) {
                Object.assign(inventoryItems[index], inventoryState.editingItem);
                inventoryState.editingItem = null;
                emit('inventory-action', { action: 'updated', item: inventoryItems[index] });
            }
        };

        const deleteItem = (itemId) => {
            if (confirm(props.language === 'pl' ? 'Czy na pewno chcesz usunąć ten przedmiot?' : 'Are you sure?')) {
                const index = inventoryItems.findIndex(i => i.id === itemId);
                if (index !== -1) {
                    const deleted = inventoryItems.splice(index, 1)[0];
                    emit('inventory-action', { action: 'deleted', item: deleted });
                }
            }
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to workshop menu');
            emit('navigate', 'workshop-template', props.language, 'default');
        };

        onMounted(() => {
            console.log('🔶 Vue: WorkshopInventoryTemplate component mounted');
        });

        return {
            inventoryState, inventoryItems, newItem, pageTitle, categories,
            filteredItems, inventoryStats, getStockStatus,
            addItem, editItem, saveItem, deleteItem, goBack
        };
    },

    template: `
        <div class="workshop-inventory-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="add-btn" @click="inventoryState.showAddItem = !inventoryState.showAddItem">
                            ➕ {{ language === 'pl' ? 'Dodaj przedmiot' : 'Add Item' }}
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Inventory Summary -->
                <div class="inventory-summary">
                    <div class="summary-card total">
                        <h3>{{ language === 'pl' ? 'Wszystkie przedmioty' : 'Total Items' }}</h3>
                        <span class="summary-number">{{ inventoryStats.totalItems }}</span>
                        <small>{{ inventoryStats.totalProducts }} {{ language === 'pl' ? 'produktów' : 'products' }}</small>
                    </div>
                    <div class="summary-card warning">
                        <h3>{{ language === 'pl' ? 'Niski stan' : 'Low Stock' }}</h3>
                        <span class="summary-number">{{ inventoryStats.lowStock }}</span>
                        <small>{{ language === 'pl' ? 'wymagają uzupełnienia' : 'need restocking' }}</small>
                    </div>
                    <div class="summary-card critical">
                        <h3>{{ language === 'pl' ? 'Brak na stanie' : 'Out of Stock' }}</h3>
                        <span class="summary-number">{{ inventoryStats.outOfStock }}</span>
                        <small>{{ language === 'pl' ? 'pilnie wymagane' : 'urgent' }}</small>
                    </div>
                    <div class="summary-card value">
                        <h3>{{ language === 'pl' ? 'Wartość całkowita' : 'Total Value' }}</h3>
                        <span class="summary-number">{{ inventoryStats.totalValue.toFixed(2) }} zł</span>
                        <small>{{ language === 'pl' ? 'wartość magazynu' : 'inventory value' }}</small>
                    </div>
                </div>

                <!-- Filters -->
                <div class="inventory-filters">
                    <input 
                        v-model="inventoryState.searchQuery"
                        type="text" 
                        :placeholder="language === 'pl' ? 'Szukaj przedmiotów...' : 'Search items...'"
                        class="search-input"
                    />
                    <select v-model="inventoryState.filterCategory" class="filter-select">
                        <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                            {{ cat.label }}
                        </option>
                    </select>
                    <select v-model="inventoryState.sortBy" class="sort-select">
                        <option value="name">{{ language === 'pl' ? 'Nazwa' : 'Name' }}</option>
                        <option value="stock">{{ language === 'pl' ? 'Stan magazynowy' : 'Stock' }}</option>
                        <option value="price">{{ language === 'pl' ? 'Cena' : 'Price' }}</option>
                    </select>
                </div>

                <!-- Add Item Form -->
                <div v-if="inventoryState.showAddItem" class="add-item-form">
                    <h3>{{ language === 'pl' ? 'Nowy przedmiot' : 'New Item' }}</h3>
                    <div class="form-grid">
                        <input v-model="newItem.name" :placeholder="language === 'pl' ? 'Nazwa przedmiotu' : 'Item name'" />
                        <select v-model="newItem.category">
                            <option v-for="cat in categories.slice(1)" :key="cat.value" :value="cat.value">
                                {{ cat.label }}
                            </option>
                        </select>
                        <input v-model.number="newItem.stock" type="number" :placeholder="language === 'pl' ? 'Stan' : 'Stock'" />
                        <input v-model.number="newItem.minStock" type="number" :placeholder="language === 'pl' ? 'Min. stan' : 'Min stock'" />
                        <input v-model.number="newItem.price" type="number" step="0.01" :placeholder="language === 'pl' ? 'Cena' : 'Price'" />
                        <input v-model="newItem.supplier" :placeholder="language === 'pl' ? 'Dostawca' : 'Supplier'" />
                        <input v-model="newItem.location" :placeholder="language === 'pl' ? 'Lokalizacja' : 'Location'" />
                    </div>
                    <div class="form-actions">
                        <button @click="addItem" class="save-btn">{{ language === 'pl' ? 'Dodaj' : 'Add' }}</button>
                        <button @click="inventoryState.showAddItem = false" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                    </div>
                </div>

                <!-- Inventory List -->
                <div class="inventory-list">
                    <div 
                        v-for="item in filteredItems" 
                        :key="item.id"
                        class="inventory-item"
                        :class="'status-' + getStockStatus(item)"
                    >
                        <div class="item-main">
                            <div class="item-info">
                                <h4 class="item-name">{{ item.name }}</h4>
                                <div class="item-details">
                                    <span class="category">{{ item.category }}</span>
                                    <span class="location">{{ item.location }}</span>
                                    <span class="supplier">{{ item.supplier }}</span>
                                </div>
                            </div>
                            
                            <div class="item-stock">
                                <div class="stock-number" :class="'stock-' + getStockStatus(item)">
                                    {{ item.stock }}
                                </div>
                                <div class="stock-info">
                                    <small>{{ language === 'pl' ? 'min:' : 'min:' }} {{ item.minStock }}</small>
                                    <small>{{ item.price.toFixed(2) }} zł</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="item-actions">
                            <button @click="editItem(item)" class="action-btn edit" :title="language === 'pl' ? 'Edytuj' : 'Edit'">✏️</button>
                            <button @click="deleteItem(item.id)" class="action-btn delete" :title="language === 'pl' ? 'Usuń' : 'Delete'">🗑️</button>
                        </div>
                    </div>
                </div>

                <!-- Edit Item Modal -->
                <div v-if="inventoryState.editingItem" class="modal-overlay" @click="inventoryState.editingItem = null">
                    <div class="modal-content" @click.stop>
                        <h3>{{ language === 'pl' ? 'Edytuj przedmiot' : 'Edit Item' }}</h3>
                        <div class="form-grid">
                            <input v-model="inventoryState.editingItem.name" :placeholder="language === 'pl' ? 'Nazwa' : 'Name'" />
                            <input v-model.number="inventoryState.editingItem.stock" type="number" :placeholder="language === 'pl' ? 'Stan' : 'Stock'" />
                            <input v-model.number="inventoryState.editingItem.minStock" type="number" :placeholder="language === 'pl' ? 'Min. stan' : 'Min stock'" />
                            <input v-model.number="inventoryState.editingItem.price" type="number" step="0.01" :placeholder="language === 'pl' ? 'Cena' : 'Price'" />
                        </div>
                        <div class="modal-actions">
                            <button @click="saveItem" class="save-btn">{{ language === 'pl' ? 'Zapisz' : 'Save' }}</button>
                            <button @click="inventoryState.editingItem = null" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .workshop-inventory-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
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
        
        .inventory-summary {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px; margin-bottom: 24px;
        }
        
        .summary-card {
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;
            border-left: 4px solid #2196f3;
        }
        
        .summary-card.warning { border-left-color: #ff9800; }
        .summary-card.critical { border-left-color: #f44336; }
        .summary-card.value { border-left-color: #4caf50; }
        
        .summary-card h3 { margin: 0 0 12px 0; color: #333; font-size: 0.9em; }
        .summary-number { font-size: 2em; font-weight: 600; color: #333; display: block; }
        .summary-card small { color: #666; font-size: 0.8em; }
        
        .inventory-filters {
            display: flex; gap: 16px; background: white; padding: 20px;
            border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .search-input { flex: 1; }
        .search-input, .filter-select, .sort-select {
            padding: 10px; border: 2px solid #e9ecef; border-radius: 6px;
        }
        
        .add-item-form {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .form-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px; margin-bottom: 16px;
        }
        
        .form-grid input, .form-grid select {
            padding: 8px; border: 2px solid #e9ecef; border-radius: 4px;
        }
        
        .form-actions, .modal-actions {
            display: flex; gap: 12px; justify-content: flex-end;
        }
        
        .save-btn { background: #28a745; color: white; }
        .cancel-btn { background: #6c757d; color: white; }
        .save-btn, .cancel-btn {
            padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
        }
        
        .inventory-list { display: flex; flex-direction: column; gap: 12px; }
        
        .inventory-item {
            background: white; padding: 16px; border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative;
        }
        
        .inventory-item.status-out-of-stock { border-left: 4px solid #f44336; }
        .inventory-item.status-low-stock { border-left: 4px solid #ff9800; }
        .inventory-item.status-in-stock { border-left: 4px solid #4caf50; }
        
        .item-main { display: flex; justify-content: space-between; align-items: center; }
        
        .item-name { margin: 0 0 8px 0; color: #333; }
        .item-details { display: flex; gap: 12px; }
        .item-details span {
            padding: 2px 6px; background: #f8f9fa; border-radius: 4px;
            font-size: 0.8em; color: #495057;
        }
        
        .stock-number {
            font-size: 1.5em; font-weight: 600; text-align: center;
        }
        
        .stock-number.stock-out-of-stock { color: #f44336; }
        .stock-number.stock-low-stock { color: #ff9800; }
        .stock-number.stock-in-stock { color: #4caf50; }
        
        .stock-info { text-align: center; margin-top: 4px; }
        .stock-info small { display: block; color: #666; }
        
        .item-actions {
            position: absolute; top: 16px; right: 16px;
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

window.WorkshopInventoryTemplate = WorkshopInventoryTemplate;
console.log('🔶 Vue WorkshopInventoryTemplate component loaded');
