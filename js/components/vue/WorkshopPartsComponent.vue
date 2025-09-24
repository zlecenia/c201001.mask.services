<template>
  <div class="workshop-parts">
    <div class="parts-header">
      <h2>🛠️ {{ $t('workshop.spare_parts') || 'Części zamienne' }}</h2>
      <div class="parts-actions">
        <button class="btn btn-primary" @click="addNewPart">
          ➕ {{ $t('workshop.add_part') || 'Dodaj część' }}
        </button>
        <button class="btn btn-info" @click="exportCatalog">
          📤 {{ $t('workshop.export') || 'Eksport' }}
        </button>
      </div>
    </div>

    <!-- Parts Overview -->
    <div class="parts-overview">
      <div class="overview-card">
        <h4>{{ $t('workshop.total_parts') || 'Łączna liczba' }}</h4>
        <span class="value">{{ totalPartsCount }}</span>
        <small>{{ $t('workshop.parts') || 'części' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('workshop.low_stock') || 'Niski stan' }}</h4>
        <span class="value">{{ lowStockCount }}</span>
        <small>{{ $t('workshop.need_reorder') || 'do zamówienia' }}</small>
      </div>
      <div class="overview-card info">
        <h4>{{ $t('workshop.categories') || 'Kategorie' }}</h4>
        <span class="value">{{ categoriesCount }}</span>
        <small>{{ $t('workshop.different') || 'różnych' }}</small>
      </div>
      <div class="overview-card">
        <h4>{{ $t('workshop.suppliers') || 'Dostawcy' }}</h4>
        <span class="value">{{ suppliersCount }}</span>
        <small>{{ $t('workshop.active') || 'aktywnych' }}</small>
      </div>
    </div>

    <!-- Parts Filters -->
    <div class="parts-filters">
      <div class="filter-group">
        <label>{{ $t('workshop.category') || 'Kategoria' }}:</label>
        <select v-model="selectedCategory" @change="filterParts">
          <option value="ALL">{{ $t('workshop.all_categories') || 'Wszystkie' }}</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>{{ $t('workshop.supplier') || 'Dostawca' }}:</label>
        <select v-model="selectedSupplier" @change="filterParts">
          <option value="ALL">{{ $t('workshop.all_suppliers') || 'Wszyscy' }}</option>
          <option v-for="supplier in suppliers" :key="supplier" :value="supplier">
            {{ supplier }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="filterParts"
          :placeholder="$t('workshop.search_parts') || 'Szukaj części...'"
          class="search-input"
        >
      </div>
    </div>

    <!-- Parts Grid -->
    <div class="parts-grid">
      <div 
        v-for="part in filteredParts" 
        :key="part.id"
        class="part-card"
        :class="{ 'low-stock': part.quantity <= part.minLevel }"
        @click="viewPart(part)"
      >
        <div class="part-header">
          <div class="part-id">{{ part.id }}</div>
          <div class="stock-status" :class="getStockStatusClass(part)">
            {{ getStockStatus(part) }}
          </div>
        </div>
        
        <div class="part-image">
          <img v-if="part.image" :src="part.image" :alt="part.name" />
          <div v-else class="no-image">📦</div>
        </div>
        
        <div class="part-info">
          <h3 class="part-name">{{ part.name }}</h3>
          <p class="part-description">{{ part.description }}</p>
          
          <div class="part-details">
            <div class="detail-item">
              <span class="label">{{ $t('workshop.category') || 'Kategoria' }}:</span>
              <span class="value">{{ part.category }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('workshop.supplier') || 'Dostawca' }}:</span>
              <span class="value">{{ part.supplier }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('workshop.quantity') || 'Ilość' }}:</span>
              <span class="value stock-quantity" :class="{ 'low': part.quantity <= part.minLevel }">
                {{ part.quantity }} / {{ part.minLevel }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('workshop.price') || 'Cena' }}:</span>
              <span class="value price">{{ part.price.toFixed(2) }} {{ part.currency }}</span>
            </div>
          </div>
        </div>
        
        <div class="part-actions">
          <button class="btn-action" @click.stop="editPart(part)" title="Edytuj">✏️</button>
          <button class="btn-action" @click.stop="orderPart(part)" title="Zamów">🛒</button>
          <button class="btn-action" @click.stop="viewHistory(part)" title="Historia">📊</button>
        </div>
      </div>
    </div>

    <!-- Part Details Modal -->
    <div v-if="showPartModal" class="modal-overlay" @click="closePartModal">
      <div class="modal-content part-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ modalPart?.name || 'Szczegóły części' }}</h3>
          <button class="close-btn" @click="closePartModal">×</button>
        </div>
        <div class="modal-body">
          <div class="part-details-full">
            <div class="detail-section">
              <h4>{{ $t('workshop.basic_info') || 'Informacje podstawowe' }}</h4>
              <div class="detail-grid">
                <div class="detail-row">
                  <label>{{ $t('workshop.part_id') || 'ID części' }}:</label>
                  <span>{{ modalPart?.id }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.name') || 'Nazwa' }}:</label>
                  <span>{{ modalPart?.name }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.category') || 'Kategoria' }}:</label>
                  <span>{{ modalPart?.category }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.supplier') || 'Dostawca' }}:</label>
                  <span>{{ modalPart?.supplier }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>{{ $t('workshop.stock_info') || 'Informacje o stanie' }}</h4>
              <div class="detail-grid">
                <div class="detail-row">
                  <label>{{ $t('workshop.current_stock') || 'Aktualny stan' }}:</label>
                  <span :class="{ 'low-stock-text': modalPart?.quantity <= modalPart?.minLevel }">
                    {{ modalPart?.quantity }}
                  </span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.min_level') || 'Minimalny poziom' }}:</label>
                  <span>{{ modalPart?.minLevel }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.unit_price') || 'Cena jednostkowa' }}:</label>
                  <span>{{ modalPart?.price?.toFixed(2) }} {{ modalPart?.currency }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.total_value') || 'Wartość łączna' }}:</label>
                  <span>{{ (modalPart?.quantity * modalPart?.price)?.toFixed(2) }} {{ modalPart?.currency }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closePartModal">
            {{ $t('common.close') || 'Zamknij' }}
          </button>
          <button class="btn btn-primary" @click="editPart(modalPart)">
            {{ $t('workshop.edit') || 'Edytuj' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkshopPartsComponent',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedCategory: 'ALL',
      selectedSupplier: 'ALL',
      searchQuery: '',
      showPartModal: false,
      modalPart: null,
      spareParts: [
        {
          id: 'SP001',
          name: 'Filtr HEPA H14',
          description: 'Filtr wysokiej skuteczności do systemów wentylacji',
          category: 'Filtry',
          supplier: 'FilterTech Sp. z o.o.',
          quantity: 12,
          minLevel: 5,
          price: 450.00,
          currency: 'PLN',
          image: null
        },
        {
          id: 'SP002',
          name: 'Uszczelka główna',
          description: 'Uszczelka do komory testowej',
          category: 'Uszczelki',
          supplier: 'SealPro Ltd.',
          quantity: 3,
          minLevel: 8,
          price: 125.50,
          currency: 'PLN',
          image: null
        },
        {
          id: 'SP003',
          name: 'Czujnik ciśnienia',
          description: 'Czujnik ciśnienia różnicowego 0-1000 Pa',
          category: 'Elektronika',
          supplier: 'TechSens GmbH',
          quantity: 15,
          minLevel: 3,
          price: 890.00,
          currency: 'PLN',
          image: null
        }
      ]
    }
  },
  computed: {
    filteredParts() {
      let parts = [...this.spareParts];
      
      if (this.selectedCategory !== 'ALL') {
        parts = parts.filter(part => part.category === this.selectedCategory);
      }
      
      if (this.selectedSupplier !== 'ALL') {
        parts = parts.filter(part => part.supplier === this.selectedSupplier);
      }
      
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        parts = parts.filter(part => 
          part.name.toLowerCase().includes(query) ||
          part.id.toLowerCase().includes(query) ||
          part.description.toLowerCase().includes(query)
        );
      }
      
      return parts;
    },
    
    categories() {
      return [...new Set(this.spareParts.map(part => part.category))];
    },
    
    suppliers() {
      return [...new Set(this.spareParts.map(part => part.supplier))];
    },
    
    totalPartsCount() {
      return this.spareParts.reduce((sum, part) => sum + part.quantity, 0);
    },
    
    lowStockCount() {
      return this.spareParts.filter(part => part.quantity <= part.minLevel).length;
    },
    
    categoriesCount() {
      return this.categories.length;
    },
    
    suppliersCount() {
      return this.suppliers.length;
    }
  },
  methods: {
    filterParts() {
      // Filtering handled by computed property
    },
    
    getStockStatusClass(part) {
      if (part.quantity <= part.minLevel) return 'critical';
      if (part.quantity <= part.minLevel * 1.5) return 'warning';
      return 'good';
    },
    
    getStockStatus(part) {
      if (part.quantity <= part.minLevel) return 'Krytyczny';
      if (part.quantity <= part.minLevel * 1.5) return 'Niski';
      return 'Dobry';
    },
    
    viewPart(part) {
      this.modalPart = part;
      this.showPartModal = true;
    },
    
    editPart(part) {
      console.log('Editing part:', part.id);
      this.closePartModal();
    },
    
    orderPart(part) {
      console.log('Ordering part:', part.id);
    },
    
    viewHistory(part) {
      console.log('Viewing history for part:', part.id);
    },
    
    addNewPart() {
      console.log('Adding new part');
    },
    
    exportCatalog() {
      console.log('Exporting parts catalog');
    },
    
    closePartModal() {
      this.showPartModal = false;
      this.modalPart = null;
    }
  }
}
</script>

<style scoped>
.workshop-parts {
  padding: 1rem;
}

.parts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.parts-header h2 {
  margin: 0;
  color: #2c3e50;
}

.parts-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary { background: #007bff; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-secondary { background: #6c757d; color: white; }

.btn:hover { transform: translateY(-1px); }

.parts-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.overview-card.warning { border-left-color: #ffc107; }
.overview-card.info { border-left-color: #17a2b8; }

.overview-card .value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.parts-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group select,
.search-input {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.parts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.part-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
  cursor: pointer;
}

.part-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.part-card.low-stock {
  border-left: 4px solid #dc3545;
}

.part-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.part-id {
  font-weight: bold;
  color: #6c757d;
}

.stock-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stock-status.good { background: #d4edda; color: #155724; }
.stock-status.warning { background: #fff3cd; color: #856404; }
.stock-status.critical { background: #f8d7da; color: #721c24; }

.part-image {
  text-align: center;
  margin-bottom: 1rem;
}

.no-image {
  font-size: 3rem;
  color: #dee2e6;
}

.part-name {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.part-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.part-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.detail-item .label {
  color: #6c757d;
}

.detail-item .value {
  font-weight: 600;
}

.stock-quantity.low {
  color: #dc3545;
}

.price {
  color: #28a745;
}

.part-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.btn-action {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #e9ecef;
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
  max-width: 600px;
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

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-row label {
  font-weight: 600;
  color: #495057;
}

.low-stock-text {
  color: #dc3545;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .parts-header {
    flex-direction: column;
    gap: 1rem;
  }

  .parts-actions {
    width: 100%;
    justify-content: center;
  }

  .parts-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .parts-filters {
    flex-direction: column;
  }

  .parts-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
