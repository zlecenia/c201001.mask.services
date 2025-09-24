<template>
  <div class="reports-filters">
    <div class="filter-group">
      <label :for="statusSelectId">{{ $t(TRANSLATION_KEYS.status) || 'Status' }}:</label>
      <select 
        :id="statusSelectId"
        :value="selectedStatus" 
        @change="updateStatus($event.target.value)"
        class="filter-select"
      >
        <option value="ALL">{{ $t(TRANSLATION_KEYS.allStatuses) || 'Wszystkie' }}</option>
        <option value="COMPLETED">{{ $t(TRANSLATION_KEYS.completed) || 'Ukończone' }}</option>
        <option value="PENDING">{{ $t(TRANSLATION_KEYS.pending) || 'Oczekujące' }}</option>
        <option value="FAILED">{{ $t(TRANSLATION_KEYS.failed) || 'Nieudane' }}</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label :for="dateRangeSelectId">{{ $t(TRANSLATION_KEYS.dateRange) || 'Zakres dat' }}:</label>
      <select 
        :id="dateRangeSelectId"
        :value="selectedDateRange" 
        @change="updateDateRange($event.target.value)"
        class="filter-select"
      >
        <option value="TODAY">{{ $t(TRANSLATION_KEYS.today) || 'Dzisiaj' }}</option>
        <option value="WEEK">{{ $t(TRANSLATION_KEYS.thisWeek) || 'Ten tydzień' }}</option>
        <option value="MONTH">{{ $t(TRANSLATION_KEYS.thisMonth) || 'Ten miesiąc' }}</option>
        <option value="ALL">{{ $t(TRANSLATION_KEYS.allDates) || 'Wszystkie daty' }}</option>
      </select>
    </div>

    <div class="filter-group search-group">
      <label :for="searchInputId" class="sr-only">{{ $t(TRANSLATION_KEYS.searchReports) || 'Szukaj raportów' }}</label>
      <input 
        :id="searchInputId"
        type="text" 
        :value="searchQuery"
        @input="updateSearch($event.target.value)"
        :placeholder="$t(TRANSLATION_KEYS.searchReports) || 'Szukaj raportów...'"
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
        :class="['quick-filter-btn', { active: quickFilter === 'failed' }]"
        @click="toggleQuickFilter('failed')"
      >
        ❌ {{ $t(TRANSLATION_KEYS.failedTests) || 'Nieudane' }}
      </button>
      <button 
        :class="['quick-filter-btn', { active: quickFilter === 'today' }]"
        @click="toggleQuickFilter('today')"
      >
        📅 {{ $t(TRANSLATION_KEYS.today) || 'Dzisiaj' }}
      </button>
      <button 
        :class="['quick-filter-btn', { active: quickFilter === 'pending' }]"
        @click="toggleQuickFilter('pending')"
      >
        ⏳ {{ $t(TRANSLATION_KEYS.pending) || 'Oczekujące' }}
      </button>
    </div>

    <!-- Advanced Filters -->
    <div v-if="showAdvancedFilters" class="advanced-filters">
      <div class="filter-group">
        <label :for="testTypeSelectId">{{ $t(TRANSLATION_KEYS.testType) || 'Typ testu' }}:</label>
        <select 
          :id="testTypeSelectId"
          :value="selectedTestType"
          @change="updateTestType($event.target.value)"
          class="filter-select"
        >
          <option value="ALL">{{ $t(TRANSLATION_KEYS.allTestTypes) || 'Wszystkie typy' }}</option>
          <option value="Leak Test">{{ $t(TRANSLATION_KEYS.leakTest) || 'Test szczelności' }}</option>
          <option value="Filtration Test">{{ $t(TRANSLATION_KEYS.filtrationTest) || 'Test filtracji' }}</option>
          <option value="Fit Test">{{ $t(TRANSLATION_KEYS.fitTest) || 'Test dopasowania' }}</option>
          <option value="Pressure Test">{{ $t(TRANSLATION_KEYS.pressureTest) || 'Test ciśnieniowy' }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label :for="operatorSelectId">{{ $t(TRANSLATION_KEYS.operator) || 'Operator' }}:</label>
        <select 
          :id="operatorSelectId"
          :value="selectedOperator"
          @change="updateOperator($event.target.value)"
          class="filter-select"
        >
          <option value="ALL">{{ $t(TRANSLATION_KEYS.allOperators) || 'Wszyscy operatorzy' }}</option>
          <option v-for="operator in uniqueOperators" :key="operator" :value="operator">
            {{ operator }}
          </option>
        </select>
      </div>
    </div>

    <!-- Advanced Filters Toggle -->
    <div class="advanced-toggle">
      <button 
        @click="toggleAdvancedFilters"
        class="advanced-toggle-btn"
      >
        {{ showAdvancedFilters ? '📉' : '📊' }}
        {{ showAdvancedFilters 
          ? ($t(TRANSLATION_KEYS.hideAdvanced) || 'Ukryj zaawansowane') 
          : ($t(TRANSLATION_KEYS.showAdvanced) || 'Pokaż zaawansowane') 
        }}
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
        <span v-if="selectedDateRange !== 'ALL'" class="filter-tag">
          Data: {{ getDateRangeLabel(selectedDateRange) }}
          <button @click="clearDateRangeFilter" class="remove-filter">✕</button>
        </span>
        <span v-if="selectedTestType !== 'ALL'" class="filter-tag">
          Typ: {{ selectedTestType }}
          <button @click="clearTestTypeFilter" class="remove-filter">✕</button>
        </span>
        <span v-if="selectedOperator !== 'ALL'" class="filter-tag">
          Operator: {{ selectedOperator }}
          <button @click="clearOperatorFilter" class="remove-filter">✕</button>
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
  name: 'ReportsFilters',
  props: {
    selectedStatus: {
      type: String,
      default: 'ALL'
    },
    selectedDateRange: {
      type: String,
      default: 'ALL'
    },
    searchQuery: {
      type: String,
      default: ''
    },
    reports: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Filter configuration
      DEFAULT_STATUS: 'ALL',
      DEFAULT_DATE_RANGE: 'ALL',
      DEFAULT_TEST_TYPE: 'ALL',
      DEFAULT_OPERATOR: 'ALL',
      SEARCH_DEBOUNCE_DELAY: 300, // ms
      
      // Quick filter types
      QUICK_FILTER_TYPES: {
        failed: { status: 'COMPLETED', result: 'FAILED' },
        today: { dateRange: 'TODAY' },
        pending: { status: 'PENDING' }
      },
      
      // Advanced filters state
      showAdvancedFilters: false,
      selectedTestType: 'ALL',
      selectedOperator: 'ALL',
      
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
        status: 'reports.status',
        dateRange: 'reports.date_range',
        searchReports: 'reports.search_reports',
        clearSearch: 'reports.clear_search',
        testType: 'reports.test_type',
        operator: 'reports.operator',
        
        // Status options
        allStatuses: 'reports.all_statuses',
        completed: 'reports.completed',
        pending: 'reports.pending',
        failed: 'reports.failed',
        
        // Date range options
        today: 'reports.today',
        thisWeek: 'reports.this_week',
        thisMonth: 'reports.this_month',
        allDates: 'reports.all_dates',
        
        // Test type options
        allTestTypes: 'reports.all_test_types',
        leakTest: 'tests.leak_test',
        filtrationTest: 'tests.filtration_test',
        fitTest: 'tests.fit_test',
        pressureTest: 'tests.pressure_test',
        
        // Operator options
        allOperators: 'reports.all_operators',
        
        // Quick filters
        failedTests: 'reports.failed_tests',
        
        // Advanced filters
        showAdvanced: 'reports.show_advanced',
        hideAdvanced: 'reports.hide_advanced',
        
        // Filter management
        activeFilters: 'reports.active_filters',
        clearAll: 'reports.clear_all',
        
        // Accessibility
        filterBy: 'reports.filter_by'
      },
      
      // Label mappings
      STATUS_LABELS: {
        ALL: 'Wszystkie',
        COMPLETED: 'Ukończone',
        PENDING: 'Oczekujące',
        FAILED: 'Nieudane'
      },
      
      DATE_RANGE_LABELS: {
        ALL: 'Wszystkie daty',
        TODAY: 'Dzisiaj',
        WEEK: 'Ten tydzień',
        MONTH: 'Ten miesiąc'
      },
      
      QUICK_FILTER_LABELS: {
        failed: 'Nieudane testy',
        today: 'Dzisiejsze',
        pending: 'Oczekujące'
      }
    }
  },
  computed: {
    statusSelectId() {
      return `status-select-${this.$attrs.id || 'default'}`;
    },
    
    dateRangeSelectId() {
      return `date-range-select-${this.$attrs.id || 'default'}`;
    },
    
    searchInputId() {
      return `search-input-${this.$attrs.id || 'default'}`;
    },
    
    testTypeSelectId() {
      return `test-type-select-${this.$attrs.id || 'default'}`;
    },
    
    operatorSelectId() {
      return `operator-select-${this.$attrs.id || 'default'}`;
    },
    
    hasActiveFilters() {
      return this.selectedStatus !== 'ALL' || 
             this.selectedDateRange !== 'ALL' || 
             this.selectedTestType !== 'ALL' ||
             this.selectedOperator !== 'ALL' ||
             this.searchQuery || 
             this.quickFilter;
    },
    
    uniqueOperators() {
      return [...new Set(this.reports.map(report => report.operator).filter(Boolean))].sort();
    }
  },
  methods: {
    updateStatus(status) {
      this.clearQuickFilter();
      this.$emit('status-changed', status);
    },
    
    updateDateRange(dateRange) {
      this.clearQuickFilter();
      this.$emit('date-range-changed', dateRange);
    },
    
    updateTestType(testType) {
      this.selectedTestType = testType;
      this.clearQuickFilter();
      this.$emit('test-type-changed', testType);
    },
    
    updateOperator(operator) {
      this.selectedOperator = operator;
      this.clearQuickFilter();
      this.$emit('operator-changed', operator);
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
      this.$emit('date-range-changed', 'ALL');
      this.$emit('test-type-changed', 'ALL');
      this.$emit('operator-changed', 'ALL');
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
    
    toggleAdvancedFilters() {
      this.showAdvancedFilters = !this.showAdvancedFilters;
    },
    
    clearStatusFilter() {
      this.$emit('status-changed', 'ALL');
    },
    
    clearDateRangeFilter() {
      this.$emit('date-range-changed', 'ALL');
    },
    
    clearTestTypeFilter() {
      this.selectedTestType = 'ALL';
      this.$emit('test-type-changed', 'ALL');
    },
    
    clearOperatorFilter() {
      this.selectedOperator = 'ALL';
      this.$emit('operator-changed', 'ALL');
    },
    
    clearAllFilters() {
      this.clearQuickFilter();
      this.selectedTestType = 'ALL';
      this.selectedOperator = 'ALL';
      this.$emit('status-changed', 'ALL');
      this.$emit('date-range-changed', 'ALL');
      this.$emit('test-type-changed', 'ALL');
      this.$emit('operator-changed', 'ALL');
      this.$emit('search-changed', '');
    },
    
    getStatusLabel(status) {
      return this.$t(`reports.${status.toLowerCase()}`) || this.STATUS_LABELS[status] || status;
    },
    
    getDateRangeLabel(dateRange) {
      return this.$t(`reports.${dateRange.toLowerCase()}`) || this.DATE_RANGE_LABELS[dateRange] || dateRange;
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
.reports-filters {
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

.advanced-filters {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  margin-top: 1rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.advanced-toggle {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.advanced-toggle-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #495057;
  transition: all 0.2s;
}

.advanced-toggle-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
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
  .reports-filters {
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
  
  .advanced-filters {
    flex-direction: column;
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
  .reports-filters {
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
.clear-search-btn,
.advanced-toggle-btn {
  min-height: 44px; /* Touch target minimum */
}

.filter-select:active,
.search-input:active,
.quick-filter-btn:active,
.advanced-toggle-btn:active {
  transform: scale(0.98);
  transition-duration: 0.1s;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .filter-select,
  .search-input {
    border-width: 2px;
  }
  
  .quick-filter-btn,
  .advanced-toggle-btn {
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
  .clear-search-btn,
  .advanced-toggle-btn,
  .advanced-filters {
    transition: none;
    animation: none;
  }
}

/* Focus styles for accessibility */
.filter-select:focus,
.search-input:focus,
.quick-filter-btn:focus,
.clear-search-btn:focus,
.advanced-toggle-btn:focus,
.remove-filter:focus,
.clear-all-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Loading state */
.reports-filters.loading {
  opacity: 0.7;
  pointer-events: none;
}

.reports-filters.loading::after {
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
