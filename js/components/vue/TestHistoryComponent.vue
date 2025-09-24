<template>
  <div class="test-history">
    <div class="history-header">
      <h2>📚 {{ $t('history.test_history') || 'Historia testów' }}</h2>
      <div class="history-actions">
        <button class="btn btn-info" @click="exportHistory">
          📤 {{ $t('history.export') || 'Eksport' }}
        </button>
        <button class="btn btn-primary" @click="refreshHistory">
          🔄 {{ $t('history.refresh') || 'Odśwież' }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="history-filters">
      <div class="filter-group">
        <label>{{ $t('history.date_range') || 'Zakres dat' }}:</label>
        <select v-model="filterDateRange" @change="applyFilters">
          <option value="TODAY">{{ $t('history.today') || 'Dzisiaj' }}</option>
          <option value="WEEK">{{ $t('history.this_week') || 'Ten tydzień' }}</option>
          <option value="MONTH">{{ $t('history.this_month') || 'Ten miesiąc' }}</option>
          <option value="ALL">{{ $t('history.all') || 'Wszystkie' }}</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>{{ $t('history.test_type') || 'Typ testu' }}:</label>
        <select v-model="filterTestType" @change="applyFilters">
          <option value="ALL">{{ $t('history.all_types') || 'Wszystkie typy' }}</option>
          <option value="LEAK_TEST">Test szczelności</option>
          <option value="FILTRATION_TEST">Test filtracji</option>
          <option value="FIT_TEST">Test dopasowania</option>
        </select>
      </div>

      <div class="filter-group">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="applyFilters"
          :placeholder="$t('history.search') || 'Szukaj...'"
          class="search-input"
        >
      </div>
    </div>

    <!-- Statistics -->
    <div class="history-stats">
      <div class="stat-card">
        <div class="stat-value">{{ totalTests }}</div>
        <div class="stat-label">{{ $t('history.total_tests') || 'Łączna liczba testów' }}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">{{ passedTests }}</div>
        <div class="stat-label">{{ $t('history.passed_tests') || 'Testy zaliczone' }}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ failedTests }}</div>
        <div class="stat-label">{{ $t('history.failed_tests') || 'Testy niezaliczone' }}</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">{{ averageDuration }}</div>
        <div class="stat-label">{{ $t('history.avg_duration') || 'Średni czas' }}</div>
      </div>
    </div>

    <!-- History Table -->
    <div class="history-table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th @click="sortBy('date')">{{ $t('history.date') || 'Data' }} <span v-if="sortField === 'date'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
            <th @click="sortBy('testName')">{{ $t('history.test_name') || 'Nazwa testu' }} <span v-if="sortField === 'testName'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
            <th @click="sortBy('device')">{{ $t('history.device') || 'Urządzenie' }} <span v-if="sortField === 'device'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
            <th @click="sortBy('operator')">{{ $t('history.operator') || 'Operator' }} <span v-if="sortField === 'operator'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
            <th @click="sortBy('duration')">{{ $t('history.duration') || 'Czas' }} <span v-if="sortField === 'duration'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
            <th @click="sortBy('result')">{{ $t('history.result') || 'Wynik' }} <span v-if="sortField === 'result'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
            <th>{{ $t('history.actions') || 'Akcje' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="test in paginatedTests" :key="test.id" :class="getRowClass(test.result)">
            <td>{{ formatDateTime(test.date) }}</td>
            <td>{{ test.testName }}</td>
            <td>{{ test.device }}</td>
            <td>{{ test.operator }}</td>
            <td>{{ formatDuration(test.duration) }}</td>
            <td>
              <span :class="['result-badge', test.result.toLowerCase()]">
                {{ getResultIcon(test.result) }} {{ test.result }}
              </span>
            </td>
            <td>
              <div class="test-actions">
                <button class="btn-action" @click="viewTest(test)" title="Podgląd">👁️</button>
                <button class="btn-action" @click="rerunTest(test)" title="Powtórz">🔄</button>
                <button class="btn-action" @click="downloadReport(test)" title="Pobierz raport">📥</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        class="pagination-btn" 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 1"
      >
        ⬅️
      </button>
      
      <span class="pagination-info">
        {{ $t('history.page') || 'Strona' }} {{ currentPage }} {{ $t('history.of') || 'z' }} {{ totalPages }}
      </span>
      
      <button 
        class="pagination-btn" 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
      >
        ➡️
      </button>
    </div>

    <!-- Test Details Modal -->
    <div v-if="showTestModal" class="modal-overlay" @click="closeTestModal">
      <div class="modal-content test-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedTest?.testName || 'Szczegóły testu' }}</h3>
          <button class="close-btn" @click="closeTestModal">×</button>
        </div>
        <div class="modal-body">
          <div class="test-details" v-if="selectedTest">
            <div class="detail-section">
              <h4>{{ $t('history.basic_info') || 'Informacje podstawowe' }}</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">{{ $t('history.test_id') || 'ID testu' }}:</span>
                  <span class="value">{{ selectedTest.id }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">{{ $t('history.date') || 'Data' }}:</span>
                  <span class="value">{{ formatDateTime(selectedTest.date) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">{{ $t('history.operator') || 'Operator' }}:</span>
                  <span class="value">{{ selectedTest.operator }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">{{ $t('history.result') || 'Wynik' }}:</span>
                  <span class="value">
                    <span :class="['result-badge', selectedTest.result.toLowerCase()]">
                      {{ getResultIcon(selectedTest.result) }} {{ selectedTest.result }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeTestModal">{{ $t('common.close') || 'Zamknij' }}</button>
          <button class="btn btn-primary" @click="downloadReport(selectedTest)">{{ $t('history.download_report') || 'Pobierz raport' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestHistoryComponent',
  data() {
    return {
      filterDateRange: 'ALL',
      filterTestType: 'ALL',
      searchQuery: '',
      sortField: 'date',
      sortOrder: 'desc',
      currentPage: 1,
      testsPerPage: 10,
      showTestModal: false,
      selectedTest: null,
      tests: [
        {
          id: 'T001',
          date: new Date().toISOString(),
          testName: 'Test szczelności FFP2',
          testType: 'LEAK_TEST',
          device: 'MASKTRONIC C20-001',
          operator: 'Jan Kowalski',
          duration: 125,
          result: 'PASSED'
        },
        {
          id: 'T002',
          date: new Date(Date.now() - 86400000).toISOString(),
          testName: 'Test filtracji P3',
          testType: 'FILTRATION_TEST',
          device: 'MASKTRONIC C20-002',
          operator: 'Anna Nowak',
          duration: 185,
          result: 'FAILED'
        },
        {
          id: 'T003',
          date: new Date(Date.now() - 172800000).toISOString(),
          testName: 'Test dopasowania',
          testType: 'FIT_TEST',
          device: 'MASKTRONIC C20-001',
          operator: 'Piotr Wiśniewski',
          duration: 95,
          result: 'PASSED'
        }
      ]
    }
  },
  computed: {
    filteredTests() {
      let filtered = [...this.tests];
      
      // Date range filter
      if (this.filterDateRange !== 'ALL') {
        const now = new Date();
        filtered = filtered.filter(test => {
          const testDate = new Date(test.date);
          switch (this.filterDateRange) {
            case 'TODAY':
              return testDate.toDateString() === now.toDateString();
            case 'WEEK':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return testDate >= weekAgo;
            case 'MONTH':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return testDate >= monthAgo;
            default:
              return true;
          }
        });
      }
      
      // Test type filter
      if (this.filterTestType !== 'ALL') {
        filtered = filtered.filter(test => test.testType === this.filterTestType);
      }
      
      // Search filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(test =>
          test.testName.toLowerCase().includes(query) ||
          test.operator.toLowerCase().includes(query) ||
          test.device.toLowerCase().includes(query)
        );
      }
      
      // Sort
      filtered.sort((a, b) => {
        let aVal = a[this.sortField];
        let bVal = b[this.sortField];
        
        if (this.sortField === 'date') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        
        if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      
      return filtered;
    },
    
    paginatedTests() {
      const start = (this.currentPage - 1) * this.testsPerPage;
      const end = start + this.testsPerPage;
      return this.filteredTests.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.filteredTests.length / this.testsPerPage);
    },
    
    totalTests() {
      return this.tests.length;
    },
    
    passedTests() {
      return this.tests.filter(t => t.result === 'PASSED').length;
    },
    
    failedTests() {
      return this.tests.filter(t => t.result === 'FAILED').length;
    },
    
    averageDuration() {
      const avg = this.tests.reduce((sum, test) => sum + test.duration, 0) / this.tests.length;
      return this.formatDuration(Math.round(avg));
    }
  },
  methods: {
    applyFilters() {
      this.currentPage = 1;
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortOrder = 'desc';
      }
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    viewTest(test) {
      this.selectedTest = test;
      this.showTestModal = true;
    },
    
    rerunTest(test) {
      console.log('Rerunning test:', test.id);
      this.$emit('test-rerun', test);
    },
    
    downloadReport(test) {
      console.log('Downloading report for test:', test.id);
    },
    
    exportHistory() {
      console.log('Exporting test history');
    },
    
    refreshHistory() {
      console.log('Refreshing test history');
    },
    
    closeTestModal() {
      this.showTestModal = false;
      this.selectedTest = null;
    },
    
    getRowClass(result) {
      return {
        'test-passed': result === 'PASSED',
        'test-failed': result === 'FAILED'
      };
    },
    
    getResultIcon(result) {
      return result === 'PASSED' ? '✅' : '❌';
    },
    
    formatDateTime(dateStr) {
      return new Date(dateStr).toLocaleString('pl-PL');
    },
    
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
}
</script>

<style scoped>
.test-history {
  padding: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.history-header h2 {
  margin: 0;
  color: #2c3e50;
}

.history-actions {
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
.btn-secondary { background: #6c757d; color: white; }
.btn-info { background: #17a2b8; color: white; }

.btn:hover { transform: translateY(-1px); }

.history-filters {
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

.search-input {
  min-width: 200px;
}

.history-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card.success { border-left-color: #28a745; }
.stat-card.warning { border-left-color: #ffc107; }
.stat-card.info { border-left-color: #17a2b8; }

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.history-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  background: #f8f9fa;
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  cursor: pointer;
  transition: background 0.2s;
}

.history-table th:hover {
  background: #e9ecef;
}

.history-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.history-table tr:hover {
  background: #f8f9fa;
}

.test-passed {
  background: rgba(40, 167, 69, 0.05) !important;
}

.test-failed {
  background: rgba(220, 53, 69, 0.05) !important;
}

.result-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.result-badge.passed {
  background: #d4edda;
  color: #155724;
}

.result-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.test-actions {
  display: flex;
  gap: 0.25rem;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background: #0056b3;
}

.pagination-info {
  color: #6c757d;
  font-weight: 600;
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

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.detail-item .label {
  font-weight: 600;
  color: #495057;
}

.detail-item .value {
  color: #2c3e50;
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
  .history-header {
    flex-direction: column;
    gap: 1rem;
  }

  .history-filters {
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-group {
    width: 100%;
    justify-content: space-between;
  }

  .history-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-table-container {
    overflow-x: auto;
  }

  .history-table {
    min-width: 800px;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
