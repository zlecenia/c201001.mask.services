<template>
  <div class="maintenance-filters">
    <div class="filter-group">
      <label :for="statusSelectId">{{ $t(TRANSLATION_KEYS.status) || 'Status' }}:</label>
      <select 
        :id="statusSelectId"
        :value="selectedStatus" 
        @change="updateStatus($event.target.value)"
        class="filter-select"
      >
        <option value="ALL">{{ $t(TRANSLATION_KEYS.allStatuses) || 'Wszystkie' }}</option>
        <option value="PENDING">{{ $t(TRANSLATION_KEYS.pending) || 'Oczekujące' }}</option>
        <option value="IN_PROGRESS">{{ $t(TRANSLATION_KEYS.inProgress) || 'W trakcie' }}</option>
        <option value="COMPLETED">{{ $t(TRANSLATION_KEYS.completed) || 'Ukończone' }}</option>
        <option value="OVERDUE">{{ $t(TRANSLATION_KEYS.overdue) || 'Przeterminowane' }}</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label :for="prioritySelectId">{{ $t(TRANSLATION_KEYS.priority) || 'Priorytet' }}:</label>
      <select 
        :id="prioritySelectId"
        :value="selectedPriority" 
        @change="updatePriority($event.target.value)"
        class="filter-select"
      >
        <option value="ALL">{{ $t(TRANSLATION_KEYS.allPriorities) || 'Wszystkie' }}</option>
        <option value="HIGH">{{ $t(TRANSLATION_KEYS.high) || 'Wysoki' }}</option>
        <option value="MEDIUM">{{ $t(TRANSLATION_KEYS.medium) || 'Średni' }}</option>
        <option value="LOW">{{ $t(TRANSLATION_KEYS.low) || 'Niski' }}</option>
      </select>
    </div>

    <div class="filter-group search-group">
      <label :for="searchInputId" class="sr-only">{{ $t(TRANSLATION_KEYS.searchTasks) || 'Szukaj zadań' }}</label>
      <input 
        :id="searchInputId"
        type="text" 
        :value="searchQuery"
        @input="updateSearch($event.target.value)"
        :placeholder="$t(TRANSLATION_KEYS.searchTasks) || 'Szukaj zadań...'"
        class="search-input"
      />
      <button 
        v-if="searchQuery" 
        @click="clearSearch"
        class="clear-search-btn"
        :title="$t(TRANSLATION_KEYS.clearSearch) || 'Wyczyść wyszukiwanie'"
      >
        ✕
      </button>
    </div>

    <!-- Quick Filter Buttons -->
    <div class="quick-filters">
      <button 
        :class="['quick-filter-btn', { active: quickFilter === 'urgent' }]"
        @click="toggleQuickFilter('urgent')"
      >
        🔥 {{ $t(TRANSLATION_KEYS.urgent) || 'Pilne' }}
      </button>
      <button 
        :class="['quick-filter-btn', { active: quickFilter === 'today' }]"
        @click="toggleQuickFilter('today')"
      >
        📅 {{ $t(TRANSLATION_KEYS.today) || 'Dzisiaj' }}
      </button>
      <button 
        :class="['quick-filter-btn', { active: quickFilter === 'overdue' }]"
        @click="toggleQuickFilter('overdue')"
      >
        ⚠️ {{ $t(TRANSLATION_KEYS.overdue) || 'Przeterminowane' }}
      </button>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="hasActiveFilters" class="active-filters">
      <span class="active-filters-label">{{ $t(TRANSLATION_KEYS.activeFilters) || 'Aktywne filtry' }}:</span>
      <div class="filter-tags">
        <span v-if="selectedStatus !== 'ALL'" class="filter-tag">
          Status: {{ getStatusLabel(selectedStatus) }}
          <button @click="clearStatusFilter" class="remove-filter">✕</button>
        </span>
        <span v-if="selectedPriority !== 'ALL'" class="filter-tag">
          Priorytet: {{ getPriorityLabel(selectedPriority) }}
          <button @click="clearPriorityFilter" class="remove-filter">✕</button>
        </span>
        <span v-if="searchQuery" class="filter-tag">
          Szukaj: "{{ searchQuery }}"
          <button @click="clearSearch" class="remove-filter">✕</button>
        </span>
        <span v-if="quickFilter" class="filter-tag">
          {{ getQuickFilterLabel(quickFilter) }}
          <button @click="clearQuickFilter" class="remove-filter">✕</button>
        </span>
      </div>
      <button @click="clearAllFilters" class="clear-all-btn">
        {{ $t(TRANSLATION_KEYS.clearAll) || 'Wyczyść wszystko' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaintenanceFilters',
  props: {
    selectedStatus: {
      type: String,
      default: 'ALL'
    },
    selectedPriority: {
      type: String,
      default: 'ALL'
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Filter configuration
      DEFAULT_STATUS: 'ALL',
      DEFAULT_PRIORITY: 'ALL',
      SEARCH_DEBOUNCE_DELAY: 300, // ms
      
      // Quick filter types
      QUICK_FILTER_TYPES: {
        urgent: { priority: 'HIGH', status: ['PENDING', 'IN_PROGRESS'] },
        today: { dueToday: true },
        overdue: { status: 'OVERDUE' }
      },
      
      // Input debouncing
      searchDebounceTimer: null,
      
      // Component state
      quickFilter: null,
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      INPUT_MIN_HEIGHT: 40, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Filter labels
        status: 'workshop.status',
        priority: 'workshop.priority',
        searchTasks: 'workshop.search_tasks',
        clearSearch: 'workshop.clear_search',
        
        // Status options
        allStatuses: 'workshop.all_statuses',
        pending: 'workshop.pending',
        inProgress: 'workshop.in_progress',
        completed: 'workshop.completed',
        overdue: 'workshop.overdue',
        
        // Priority options
        allPriorities: 'workshop.all_priorities',
        high: 'workshop.high',
        medium: 'workshop.medium',
        low: 'workshop.low',
        
        // Quick filters
        urgent: 'workshop.urgent',
        today: 'workshop.today',
        
        // Filter management
        activeFilters: 'workshop.active_filters',
        clearAll: 'workshop.clear_all',
        
        // Accessibility
        filterBy: 'workshop.filter_by'
      },
      
      // Status and priority label mappings
      STATUS_LABELS: {
        ALL: 'Wszystkie',
        PENDING: 'Oczekujące',
        IN_PROGRESS: 'W trakcie',
        COMPLETED: 'Ukończone',
        OVERDUE: 'Przeterminowane'
      },
      
      PRIORITY_LABELS: {
        ALL: 'Wszystkie',
        HIGH: 'Wysoki',
        MEDIUM: 'Średni',
        LOW: 'Niski'
      },
      
      QUICK_FILTER_LABELS: {
        urgent: 'Pilne',
        today: 'Dzisiaj',
        overdue: 'Przeterminowane'
      }
    }
  },
  computed: {
    statusSelectId() {
      return `status-select-${this.$attrs.id || 'default'}`;
    },
    
    prioritySelectId() {
      return `priority-select-${this.$attrs.id || 'default'}`;
    },
    
    searchInputId() {
      return `search-input-${this.$attrs.id || 'default'}`;
    },
    
    hasActiveFilters() {
      return this.selectedStatus !== 'ALL' || 
             this.selectedPriority !== 'ALL' || 
             this.searchQuery || 
             this.quickFilter;
    }
  },
  methods: {
    updateStatus(status) {
      this.clearQuickFilter();
      this.$emit('status-changed', status);
    },
    
    updatePriority(priority) {
      this.clearQuickFilter();
      this.$emit('priority-changed', priority);
    },
    
    updateSearch(query) {
      // Debounce search input
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }
      
      this.searchDebounceTimer = setTimeout(() => {
        this.clearQuickFilter();
        this.$emit('search-changed', query);
      }, this.SEARCH_DEBOUNCE_DELAY);
    },
    
    clearSearch() {
      this.$emit('search-changed', '');
    },
    
    toggleQuickFilter(filterType) {
      if (this.quickFilter === filterType) {
        this.clearQuickFilter();
      } else {
        this.quickFilter = filterType;
        this.applyQuickFilter(filterType);
      }
    },
    
    applyQuickFilter(filterType) {
      const filterConfig = this.QUICK_FILTER_TYPES[filterType];
      if (!filterConfig) return;
      
      // Reset other filters first
      this.$emit('status-changed', 'ALL');
      this.$emit('priority-changed', 'ALL');
      this.$emit('search-changed', '');
      
      // Apply quick filter
      this.$emit('quick-filter-applied', { type: filterType, config: filterConfig });
    },
    
    clearQuickFilter() {
      if (this.quickFilter) {
        this.quickFilter = null;
        this.$emit('quick-filter-cleared');
      }
    },
    
    clearStatusFilter() {
      this.$emit('status-changed', 'ALL');
    },
    
    clearPriorityFilter() {
      this.$emit('priority-changed', 'ALL');
    },
    
    clearAllFilters() {
      this.clearQuickFilter();
      this.$emit('status-changed', 'ALL');
      this.$emit('priority-changed', 'ALL');
      this.$emit('search-changed', '');
    },
    
    getStatusLabel(status) {
      return this.$t(`workshop.${status.toLowerCase()}`) || this.STATUS_LABELS[status] || status;
    },
    
    getPriorityLabel(priority) {
      return this.$t(`workshop.${priority.toLowerCase()}`) || this.PRIORITY_LABELS[priority] || priority;
    },
    
    getQuickFilterLabel(filterType) {
      return this.$t(this.TRANSLATION_KEYS[filterType]) || this.QUICK_FILTER_LABELS[filterType] || filterType;
    }
  },
  
  beforeUnmount() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }
}
</script>

<style scoped>
.maintenance-filters {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-group label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.filter-select,
.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-height: 40px;
  background: white;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-group {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding-right: 2.5rem;
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  transition: color 0.2s;
}

.clear-search-btn:hover {
  color: #495057;
}

.quick-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  width: 100%;
}

.quick-filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  background: white;
  color: #6c757d;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  min-height: 36px;
}

.quick-filter-btn:hover {
  border-color: #007bff;
  color: #007bff;
  background: #f8f9ff;
}

.quick-filter-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.active-filters {
  width: 100%;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.active-filters-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.filter-tag {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-filter {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-filter:hover {
  background: #dc3545;
  color: white;
}

.clear-all-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #dc3545;
  border-radius: 4px;
  background: white;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: #dc3545;
  color: white;
}

/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .maintenance-filters {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .search-group {
    min-width: auto;
  }
  
  .quick-filters {
    justify-content: center;
  }
  
  .quick-filter-btn {
    flex: 1;
    min-width: 80px;
  }
  
  .active-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .filter-tags {
    justify-content: center;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .maintenance-filters {
    padding: 0.75rem;
  }
  
  .filter-select,
  .search-input {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
  
  .quick-filter-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

/* Touch-friendly enhancements */
.filter-select,
.search-input,
.quick-filter-btn,
.clear-search-btn {
  min-height: 44px; /* Touch target minimum */
}

.filter-select:active,
.search-input:active,
.quick-filter-btn:active {
  transform: scale(0.98);
  transition-duration: 0.1s;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .filter-select,
  .search-input {
    border-width: 2px;
  }
  
  .quick-filter-btn {
    border-width: 2px;
  }
  
  .quick-filter-btn.active {
    border-width: 3px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .filter-select,
  .search-input,
  .quick-filter-btn,
  .clear-search-btn {
    transition: none;
  }
}

/* Focus styles for accessibility */
.filter-select:focus,
.search-input:focus,
.quick-filter-btn:focus,
.clear-search-btn:focus,
.remove-filter:focus,
.clear-all-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Loading state */
.maintenance-filters.loading {
  opacity: 0.7;
  pointer-events: none;
}

.maintenance-filters.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #007bff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
