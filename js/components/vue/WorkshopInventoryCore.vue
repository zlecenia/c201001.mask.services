<template>
  <div class="workshop-inventory">
    <div class="inventory-header">
      <h2>📦 {{ $t('workshop.inventory_management') }}</h2>
      <div class="inventory-actions">
        <button class="btn btn-primary" @click="performInventoryCount">
          📋 {{ $t('workshop.inventory_count') }}
        </button>
        <button class="btn btn-secondary" @click="generateReport">
          📊 {{ $t('workshop.generate_report') }}
        </button>
        <button class="btn btn-info" @click="exportData">
          📤 {{ $t('workshop.export_data') }}
        </button>
      </div>
    </div>

    <!-- Inventory Overview -->
    <WorkshopInventoryOverview 
      :inventory-stats="inventoryStats"
      :low-stock-count="lowStockCount"
      :categories-count="categoriesCount"
      :suppliers-count="suppliersCount"
    />

    <!-- Controls and Filters -->
    <div class="inventory-controls">
      <div class="view-selector">
        <button 
          v-for="view in views" 
          :key="view.id"
          class="view-btn"
          :class="{ active: currentView === view.id }"
          @click="switchView(view.id)"
        >
          {{ view.icon }} {{ $t(view.label) }}
        </button>
      </div>

      <div class="category-filter">
        <label>{{ $t('workshop.category') }}:</label>
        <select v-model="selectedCategory" @change="applyFilters">
          <option value="ALL">{{ $t('workshop.all_categories') }}</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="search-filter">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="applyFilters"
          :placeholder="$t('workshop.search_parts')"
          class="search-input"
        >
      </div>
    </div>

    <!-- Dynamic Content Based on View -->
    <div class="inventory-content">
      <!-- Summary View -->
      <WorkshopInventorySummary 
        v-if="currentView === 'summary'"
        :categories="categoriesSummary"
        @view-category="viewCategoryDetails"
      />

      <!-- Detailed View -->
      <WorkshopInventoryTable 
        v-if="currentView === 'detailed'"
        :parts="filteredParts"
        :loading="loading"
        @edit-part="editPart"
        @view-part="viewPartDetails"
      />

      <!-- Movements View -->
      <WorkshopInventoryMovements 
        v-if="currentView === 'movements'"
        :movements="inventoryMovements"
        @add-movement="showAddMovementModal"
      />
    </div>

    <!-- Modals -->
    <div v-if="showCountModal" class="modal-overlay" @click="closeCountModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('workshop.inventory_count') }}</h3>
          <button class="close-btn" @click="closeCountModal">×</button>
        </div>
        <div class="modal-body">
          <p>{{ $t('workshop.count_description') }}</p>
          <div class="count-options">
            <label class="radio-label">
              <input type="radio" v-model="countType" value="full">
              {{ $t('workshop.full_count') }}
            </label>
            <label class="radio-label">
              <input type="radio" v-model="countType" value="partial">
              {{ $t('workshop.partial_count') }}
            </label>
            <label class="radio-label">
              <input type="radio" v-model="countType" value="cycle">
              {{ $t('workshop.cycle_count') }}
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCountModal">
            {{ $t('common.cancel') }}
          </button>
          <button class="btn btn-primary" @click="startInventoryCount">
            {{ $t('workshop.start_count') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkshopInventoryCore',
  components: {
    WorkshopInventoryOverview: () => import('./WorkshopInventoryOverview.vue'),
    WorkshopInventorySummary: () => import('./WorkshopInventorySummary.vue'),
    WorkshopInventoryTable: () => import('./WorkshopInventoryTable.vue'),
    WorkshopInventoryMovements: () => import('./WorkshopInventoryMovements.vue')
  },
  props: {
    workshopCore: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentView: 'summary',
      selectedCategory: 'ALL',
      searchQuery: '',
      loading: false,
      showCountModal: false,
      countType: 'full',
      views: [
        { id: 'summary', icon: '📊', label: 'workshop.summary' },
        { id: 'detailed', icon: '📋', label: 'workshop.detailed' },
        { id: 'movements', icon: '🔄', label: 'workshop.movements' }
      ]
    }
  },
  computed: {
    inventoryStats() {
      return {
        totalValue: this.workshopCore.getTotalInventoryValue(),
        currency: this.workshopCore.getTotalInventoryCurrency()
      };
    },
    
    spareParts() {
      return this.workshopCore.getSpareParts() || [];
    },
    
    filteredParts() {
      let parts = this.spareParts;
      
      // Category filter
      if (this.selectedCategory !== 'ALL') {
        parts = parts.filter(part => part.category === this.selectedCategory);
      }
      
      // Search filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        parts = parts.filter(part => 
          part.name.toLowerCase().includes(query) ||
          part.id.toLowerCase().includes(query) ||
          (part.supplier && part.supplier.toLowerCase().includes(query))
        );
      }
      
      return parts;
    },
    
    categories() {
      return [...new Set(this.spareParts.map(part => part.category).filter(Boolean))];
    },
    
    categoriesSummary() {
      return this.categories.map(category => {
        const categoryParts = this.spareParts.filter(part => part.category === category);
        const totalValue = categoryParts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
        const totalQuantity = categoryParts.reduce((sum, part) => sum + part.quantity, 0);
        
        return {
          name: category,
          partsCount: categoryParts.length,
          totalValue,
          totalQuantity,
          lowStockCount: categoryParts.filter(part => part.quantity <= part.minLevel).length
        };
      });
    },
    
    lowStockCount() {
      return this.spareParts.filter(part => part.quantity <= part.minLevel).length;
    },
    
    categoriesCount() {
      return this.categories.length;
    },
    
    suppliersCount() {
      return [...new Set(this.spareParts.map(part => part.supplier).filter(Boolean))].length;
    },
    
    inventoryMovements() {
      // Mock data - replace with real API call
      return [
        {
          id: 1,
          partId: 'SEAL001',
          partName: 'Uszczelka główna',
          type: 'IN',
          quantity: 10,
          reason: 'Dostawa',
          date: new Date().toISOString(),
          user: 'Jan Kowalski'
        },
        {
          id: 2,
          partId: 'FILTER003',
          partName: 'Filtr P3',
          type: 'OUT',
          quantity: 5,
          reason: 'Naprawa',
          date: new Date(Date.now() - 86400000).toISOString(),
          user: 'Anna Nowak'
        }
      ];
    }
  },
  methods: {
    switchView(view) {
      this.currentView = view;
    },
    
    applyFilters() {
      // Filters are applied automatically through computed properties
      this.$emit('filters-changed', {
        category: this.selectedCategory,
        search: this.searchQuery
      });
    },
    
    viewCategoryDetails(category) {
      this.selectedCategory = category;
      this.currentView = 'detailed';
    },
    
    editPart(part) {
      this.$emit('edit-part', part);
    },
    
    viewPartDetails(part) {
      this.$emit('view-part', part);
    },
    
    performInventoryCount() {
      this.showCountModal = true;
    },
    
    closeCountModal() {
      this.showCountModal = false;
      this.countType = 'full';
    },
    
    startInventoryCount() {
      // Implement inventory count logic
      console.log('Starting inventory count:', this.countType);
      this.closeCountModal();
      
      // Mock implementation
      this.$emit('inventory-count-started', {
        type: this.countType,
        timestamp: new Date().toISOString()
      });
      
      this.showSuccessMessage(this.$t('workshop.count_started'));
    },
    
    generateReport() {
      this.$emit('generate-report');
    },
    
    exportData() {
      this.$emit('export-data');
    },
    
    showAddMovementModal() {
      this.$emit('show-add-movement');
    },
    
    showSuccessMessage(message) {
      // Implement success notification
      console.log('Success:', message);
    }
  },
  
  mounted() {
    // Load initial data
    this.applyFilters();
  }
}
</script>

<style scoped>
.workshop-inventory {
  padding: 1rem;
  max-width: 100%;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.inventory-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.inventory-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #117a8b;
}

.inventory-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.view-selector {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #e9ecef;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.category-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-filter label {
  font-weight: 600;
  color: #495057;
}

.category-filter select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  min-width: 150px;
}

.search-filter {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.inventory-content {
  min-height: 400px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.count-options {
  margin-top: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.radio-label input {
  margin-right: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .workshop-inventory {
    padding: 0.5rem;
  }
  
  .inventory-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .inventory-actions {
    flex-direction: column;
  }
  
  .inventory-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-selector {
    justify-content: center;
  }
  
  .category-filter,
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}

/* Animation */
.modal-overlay {
  animation: fadeIn 0.3s ease;
}

.modal-content {
  animation: slideIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(-20px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}
</style>
