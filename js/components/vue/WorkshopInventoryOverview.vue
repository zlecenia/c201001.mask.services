<template>
  <div class="inventory-overview">
    <div class="overview-card">
      <h4>{{ $t('workshop.total_value') }}</h4>
      <span class="value">{{ inventoryStats.totalValue.toFixed(2) }} {{ inventoryStats.currency }}</span>
      <small>{{ $t('workshop.entire_warehouse') }}</small>
    </div>
    
    <div class="overview-card warning" :class="{ critical: lowStockCount > 10 }">
      <h4>{{ $t('workshop.low_stock') }}</h4>
      <span class="value">{{ lowStockCount }}</span>
      <small>{{ $t('workshop.items') }}</small>
      <div v-if="lowStockCount > 0" class="alert-indicator">⚠️</div>
    </div>
    
    <div class="overview-card info">
      <h4>{{ $t('workshop.categories') }}</h4>
      <span class="value">{{ categoriesCount }}</span>
      <small>{{ $t('workshop.different') }}</small>
    </div>
    
    <div class="overview-card">
      <h4>{{ $t('workshop.suppliers') }}</h4>
      <span class="value">{{ suppliersCount }}</span>
      <small>{{ $t('workshop.active') }}</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkshopInventoryOverview',
  props: {
    inventoryStats: {
      type: Object,
      required: true,
      default: () => ({ totalValue: 0, currency: 'PLN' })
    },
    lowStockCount: {
      type: Number,
      default: 0
    },
    categoriesCount: {
      type: Number,
      default: 0
    },
    suppliersCount: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.inventory-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.overview-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.overview-card.warning {
  border-left-color: #ffc107;
}

.overview-card.warning.critical {
  border-left-color: #dc3545;
  background: #ffeaea;
}

.overview-card.info {
  border-left-color: #17a2b8;
}

.overview-card h4 {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.overview-card .value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.overview-card.warning .value {
  color: #856404;
}

.overview-card.warning.critical .value {
  color: #721c24;
}

.overview-card.info .value {
  color: #0c5460;
}

.overview-card small {
  color: #6c757d;
  font-size: 0.8rem;
}

.alert-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .inventory-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .overview-card {
    padding: 1rem;
  }
  
  .overview-card .value {
    font-size: 1.5rem;
  }
  
  .overview-card h4 {
    font-size: 0.8rem;
  }
}

/* Very small screens - single column */
@media (max-width: 350px) {
  .inventory-overview {
    grid-template-columns: 1fr;
  }
}
</style>
