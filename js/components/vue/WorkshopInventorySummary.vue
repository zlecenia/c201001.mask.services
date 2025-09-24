<template>
  <div class="inventory-summary">
    <h3>{{ $t('workshop.category_summary') }}</h3>
    
    <div class="categories-grid">
      <div 
        v-for="category in categories" 
        :key="category.name"
        class="category-card"
        @click="viewCategory(category.name)"
        :class="{ 'has-low-stock': category.lowStockCount > 0 }"
      >
        <div class="category-header">
          <div class="category-name">
            <span class="category-icon">{{ getCategoryIcon(category.name) }}</span>
            {{ category.name }}
          </div>
          <div v-if="category.lowStockCount > 0" class="low-stock-badge">
            ⚠️ {{ category.lowStockCount }}
          </div>
        </div>
        
        <div class="category-stats">
          <div class="stat">
            <span class="stat-label">{{ $t('workshop.parts_count') }}:</span>
            <span class="stat-value">{{ category.partsCount }}</span>
          </div>
          
          <div class="stat">
            <span class="stat-label">{{ $t('workshop.total_quantity') }}:</span>
            <span class="stat-value">{{ category.totalQuantity }}</span>
          </div>
          
          <div class="stat">
            <span class="stat-label">{{ $t('workshop.total_value') }}:</span>
            <span class="stat-value">{{ formatCurrency(category.totalValue) }}</span>
          </div>
        </div>
        
        <div class="category-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: getValuePercentage(category.totalValue) + '%' }"
            ></div>
          </div>
          <span class="progress-text">
            {{ getValuePercentage(category.totalValue).toFixed(1) }}% {{ $t('workshop.of_total') }}
          </span>
        </div>
        
        <div class="category-actions">
          <button 
            class="btn-action"
            @click.stop="quickActions(category.name)"
            :title="$t('workshop.quick_actions')"
          >
            ⚡
          </button>
          <button 
            class="btn-action"
            @click.stop="exportCategory(category.name)"
            :title="$t('workshop.export_category')"
          >
            📤
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Actions Modal -->
    <div v-if="showQuickActionsModal" class="modal-overlay" @click="closeQuickActions">
      <div class="modal-content quick-actions-modal" @click.stop>
        <div class="modal-header">
          <h4>{{ $t('workshop.quick_actions') }}: {{ selectedCategoryName }}</h4>
          <button class="close-btn" @click="closeQuickActions">×</button>
        </div>
        <div class="modal-body">
          <div class="quick-actions-grid">
            <button class="quick-action-btn" @click="addStock">
              ➕ {{ $t('workshop.add_stock') }}
            </button>
            <button class="quick-action-btn" @click="removeStock">
              ➖ {{ $t('workshop.remove_stock') }}
            </button>
            <button class="quick-action-btn" @click="adjustPrices">
              💰 {{ $t('workshop.adjust_prices') }}
            </button>
            <button class="quick-action-btn" @click="checkStock">
              🔍 {{ $t('workshop.check_stock') }}
            </button>
            <button class="quick-action-btn" @click="generateCategoryReport">
              📊 {{ $t('workshop.generate_report') }}
            </button>
            <button class="quick-action-btn" @click="orderParts">
              🛒 {{ $t('workshop.order_parts') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkshopInventorySummary',
  props: {
    categories: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      showQuickActionsModal: false,
      selectedCategoryName: ''
    }
  },
  computed: {
    totalValue() {
      return this.categories.reduce((sum, cat) => sum + cat.totalValue, 0);
    }
  },
  methods: {
    viewCategory(categoryName) {
      this.$emit('view-category', categoryName);
    },
    
    getCategoryIcon(categoryName) {
      const icons = {
        'Uszczelki': '🔧',
        'Filtry': '🌪️',
        'Paski': '🔗',
        'Zawory': '⚙️',
        'Membrany': '📄',
        'Elektronika': '💻',
        'Narzędzia': '🔨',
        'Smarowanie': '🛢️',
        'Default': '📦'
      };
      return icons[categoryName] || icons.Default;
    },
    
    formatCurrency(value) {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
      }).format(value);
    },
    
    getValuePercentage(categoryValue) {
      if (this.totalValue === 0) return 0;
      return (categoryValue / this.totalValue) * 100;
    },
    
    quickActions(categoryName) {
      this.selectedCategoryName = categoryName;
      this.showQuickActionsModal = true;
    },
    
    closeQuickActions() {
      this.showQuickActionsModal = false;
      this.selectedCategoryName = '';
    },
    
    exportCategory(categoryName) {
      this.$emit('export-category', categoryName);
    },
    
    // Quick Action Methods
    addStock() {
      this.$emit('add-stock', this.selectedCategoryName);
      this.closeQuickActions();
    },
    
    removeStock() {
      this.$emit('remove-stock', this.selectedCategoryName);
      this.closeQuickActions();
    },
    
    adjustPrices() {
      this.$emit('adjust-prices', this.selectedCategoryName);
      this.closeQuickActions();
    },
    
    checkStock() {
      this.$emit('check-stock', this.selectedCategoryName);
      this.closeQuickActions();
    },
    
    generateCategoryReport() {
      this.$emit('generate-category-report', this.selectedCategoryName);
      this.closeQuickActions();
    },
    
    orderParts() {
      this.$emit('order-parts', this.selectedCategoryName);
      this.closeQuickActions();
    }
  }
}
</script>

<style scoped>
.inventory-summary {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
}

.inventory-summary h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.category-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #007bff;
}

.category-card.has-low-stock {
  border-left: 4px solid #ffc107;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-icon {
  font-size: 1.2rem;
}

.low-stock-badge {
  background: #fff3cd;
  color: #856404;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.category-stats {
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

.category-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #6c757d;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-action {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-action:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* Quick Actions Modal */
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

.quick-actions-modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
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

.modal-header h4 {
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

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.quick-action-btn {
  padding: 1rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.quick-action-btn:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
  transform: translateY(-1px);
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .category-card {
    padding: 1rem;
  }
  
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-modal {
    width: 95%;
    margin: 1rem;
  }
}

/* Animation */
.modal-overlay {
  animation: fadeIn 0.3s ease;
}

.quick-actions-modal {
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
