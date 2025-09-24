<template>
  <div class="test-reports-core">
    <div class="reports-header">
      <h2>📊 {{ $t('reports.test_reports') || 'Raporty testów' }}</h2>
      <div class="reports-actions">
        <button class="btn btn-primary" @click="generateNewReport">
          ➕ {{ $t('reports.new_report') || 'Nowy raport' }}
        </button>
        <button class="btn btn-info" @click="exportReports">
          📤 {{ $t('reports.export') || 'Eksport' }}
        </button>
      </div>
    </div>

    <!-- Reports Overview -->
    <div class="reports-overview">
      <div class="overview-card">
        <h4>{{ $t('reports.total_reports') || 'Łączna liczba' }}</h4>
        <span class="value">{{ totalReportsCount }}</span>
        <small>{{ $t('reports.reports') || 'raportów' }}</small>
      </div>
      <div class="overview-card info">
        <h4>{{ $t('reports.today') || 'Dzisiaj' }}</h4>
        <span class="value">{{ todayReportsCount }}</span>
        <small>{{ $t('reports.generated') || 'wygenerowanych' }}</small>
      </div>
      <div class="overview-card success">
        <h4>{{ $t('reports.passed_tests') || 'Testy zaliczone' }}</h4>
        <span class="value">{{ passedTestsPercentage }}%</span>
        <small>{{ $t('reports.success_rate') || 'współczynnik sukcesu' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('reports.pending') || 'Oczekujące' }}</h4>
        <span class="value">{{ pendingReportsCount }}</span>
        <small>{{ $t('reports.in_queue') || 'w kolejce' }}</small>
      </div>
    </div>

    <!-- Filters -->
    <div class="reports-filters">
      <div class="filter-group">
        <label>{{ $t('reports.status') || 'Status' }}:</label>
        <select v-model="selectedStatus" @change="filterReports">
          <option value="ALL">{{ $t('reports.all_statuses') || 'Wszystkie' }}</option>
          <option value="COMPLETED">{{ $t('reports.completed') || 'Ukończone' }}</option>
          <option value="PENDING">{{ $t('reports.pending') || 'Oczekujące' }}</option>
          <option value="FAILED">{{ $t('reports.failed') || 'Nieudane' }}</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>{{ $t('reports.date_range') || 'Zakres dat' }}:</label>
        <select v-model="selectedDateRange" @change="filterReports">
          <option value="TODAY">{{ $t('reports.today') || 'Dzisiaj' }}</option>
          <option value="WEEK">{{ $t('reports.this_week') || 'Ten tydzień' }}</option>
          <option value="MONTH">{{ $t('reports.this_month') || 'Ten miesiąc' }}</option>
          <option value="ALL">{{ $t('reports.all_dates') || 'Wszystkie daty' }}</option>
        </select>
      </div>

      <div class="filter-group">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="filterReports"
          :placeholder="$t('reports.search_reports') || 'Szukaj raportów...'"
          class="search-input"
        >
      </div>
    </div>

    <!-- Reports Table -->
    <div class="reports-table-container">
      <table class="reports-table">
        <thead>
          <tr>
            <th>{{ $t('reports.id') || 'ID' }}</th>
            <th>{{ $t('reports.test_name') || 'Nazwa testu' }}</th>
            <th>{{ $t('reports.device') || 'Urządzenie' }}</th>
            <th>{{ $t('reports.date') || 'Data' }}</th>
            <th>{{ $t('reports.duration') || 'Czas trwania' }}</th>
            <th>{{ $t('reports.result') || 'Wynik' }}</th>
            <th>{{ $t('reports.status') || 'Status' }}</th>
            <th>{{ $t('reports.actions') || 'Akcje' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in filteredReports" :key="report.id" :class="getReportRowClass(report)">
            <td>{{ report.id }}</td>
            <td>
              <div class="report-title">
                <span>{{ report.testName }}</span>
                <small v-if="report.testType">{{ report.testType }}</small>
              </div>
            </td>
            <td>{{ report.deviceName }}</td>
            <td>{{ formatDateTime(report.createdAt) }}</td>
            <td>{{ formatDuration(report.duration) }}</td>
            <td>
              <span :class="['result-badge', report.result.toLowerCase()]">
                {{ getResultIcon(report.result) }} {{ $t(`reports.${report.result.toLowerCase()}`) || report.result }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', report.status.toLowerCase()]">
                {{ $t(`reports.${report.status.toLowerCase()}`) || report.status }}
              </span>
            </td>
            <td>
              <div class="report-actions">
                <button class="btn-action" @click="viewReport(report)" title="Podgląd">👁️</button>
                <button class="btn-action" @click="downloadReport(report)" title="Pobierz">📥</button>
                <button class="btn-action" @click="shareReport(report)" title="Udostępnij">📤</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Report Details Modal -->
    <div v-if="showReportModal" class="modal-overlay" @click="closeReportModal">
      <div class="modal-content report-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ modalReport?.testName || 'Szczegóły raportu' }}</h3>
          <button class="close-btn" @click="closeReportModal">×</button>
        </div>
        <div class="modal-body">
          <div class="report-details-full">
            <div class="detail-section">
              <h4>{{ $t('reports.basic_info') || 'Informacje podstawowe' }}</h4>
              <div class="detail-grid">
                <div class="detail-row">
                  <label>{{ $t('reports.report_id') || 'ID raportu' }}:</label>
                  <span>{{ modalReport?.id }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('reports.test_name') || 'Nazwa testu' }}:</label>
                  <span>{{ modalReport?.testName }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('reports.device') || 'Urządzenie' }}:</label>
                  <span>{{ modalReport?.deviceName }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('reports.operator') || 'Operator' }}:</label>
                  <span>{{ modalReport?.operator }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('reports.date') || 'Data' }}:</label>
                  <span>{{ formatDateTime(modalReport?.createdAt) }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('reports.duration') || 'Czas trwania' }}:</label>
                  <span>{{ formatDuration(modalReport?.duration) }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>{{ $t('reports.test_results') || 'Wyniki testów' }}</h4>
              <div class="test-results">
                <div class="result-summary">
                  <span :class="['result-badge', 'large', modalReport?.result.toLowerCase()]">
                    {{ getResultIcon(modalReport?.result) }} {{ modalReport?.result }}
                  </span>
                </div>
                <div v-if="modalReport?.measurements" class="measurements-list">
                  <div v-for="measurement in modalReport.measurements" :key="measurement.parameter" class="measurement-item">
                    <span class="measurement-parameter">{{ measurement.parameter }}</span>
                    <span class="measurement-value">{{ measurement.value }} {{ measurement.unit }}</span>
                    <span :class="['measurement-status', measurement.status.toLowerCase()]">
                      {{ measurement.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeReportModal">
            {{ $t('common.close') || 'Zamknij' }}
          </button>
          <button class="btn btn-primary" @click="downloadReport(modalReport)">
            {{ $t('reports.download') || 'Pobierz' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestReportsCore',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedStatus: 'ALL',
      selectedDateRange: 'ALL',
      searchQuery: '',
      showReportModal: false,
      modalReport: null,
      testReports: [
        {
          id: 'RPT001',
          testName: 'Test szczelności maski FFP2',
          testType: 'Leak Test',
          deviceName: 'MASKTRONIC C20-001',
          createdAt: new Date().toISOString(),
          duration: 125,
          result: 'PASSED',
          status: 'COMPLETED',
          operator: 'Jan Kowalski',
          measurements: [
            { parameter: 'Ciśnienie wewnętrzne', value: '250', unit: 'Pa', status: 'PASSED' },
            { parameter: 'Przepływ powietrza', value: '15.2', unit: 'L/min', status: 'PASSED' },
            { parameter: 'Szczelność', value: '0.8', unit: '%', status: 'PASSED' }
          ]
        },
        {
          id: 'RPT002',
          testName: 'Test filtracji P3',
          testType: 'Filtration Test',
          deviceName: 'MASKTRONIC C20-002',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          duration: 85,
          result: 'FAILED',
          status: 'COMPLETED',
          operator: 'Anna Nowak',
          measurements: [
            { parameter: 'Skuteczność filtracji', value: '94.2', unit: '%', status: 'FAILED' },
            { parameter: 'Opór przepływu', value: '120', unit: 'Pa', status: 'PASSED' }
          ]
        },
        {
          id: 'RPT003',
          testName: 'Test maskowania respiratora',
          testType: 'Fit Test',
          deviceName: 'MASKTRONIC C20-001',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          duration: 0,
          result: 'PENDING',
          status: 'PENDING',
          operator: 'Piotr Wiśniewski',
          measurements: []
        }
      ]
    }
  },
  computed: {
    filteredReports() {
      let reports = [...this.testReports];
      
      if (this.selectedStatus !== 'ALL') {
        reports = reports.filter(report => report.status === this.selectedStatus);
      }
      
      if (this.selectedDateRange !== 'ALL') {
        const now = new Date();
        reports = reports.filter(report => {
          const reportDate = new Date(report.createdAt);
          switch (this.selectedDateRange) {
            case 'TODAY':
              return reportDate.toDateString() === now.toDateString();
            case 'WEEK':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return reportDate >= weekAgo;
            case 'MONTH':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return reportDate >= monthAgo;
            default:
              return true;
          }
        });
      }
      
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        reports = reports.filter(report => 
          report.testName.toLowerCase().includes(query) ||
          report.id.toLowerCase().includes(query) ||
          report.deviceName.toLowerCase().includes(query)
        );
      }
      
      return reports;
    },
    
    totalReportsCount() {
      return this.testReports.length;
    },
    
    todayReportsCount() {
      const today = new Date();
      return this.testReports.filter(report => 
        new Date(report.createdAt).toDateString() === today.toDateString()
      ).length;
    },
    
    passedTestsPercentage() {
      const completed = this.testReports.filter(r => r.status === 'COMPLETED');
      if (completed.length === 0) return 0;
      const passed = completed.filter(r => r.result === 'PASSED').length;
      return Math.round((passed / completed.length) * 100);
    },
    
    pendingReportsCount() {
      return this.testReports.filter(report => report.status === 'PENDING').length;
    }
  },
  methods: {
    filterReports() {
      // Filtering handled by computed property
    },
    
    getReportRowClass(report) {
      if (report.result === 'FAILED') return 'failed-row';
      if (report.status === 'PENDING') return 'pending-row';
      return '';
    },
    
    getResultIcon(result) {
      const icons = {
        'PASSED': '✅',
        'FAILED': '❌',
        'PENDING': '⏳',
        'WARNING': '⚠️'
      };
      return icons[result] || '📋';
    },
    
    formatDateTime(dateStr) {
      return new Date(dateStr).toLocaleString('pl-PL');
    },
    
    formatDuration(seconds) {
      if (seconds === 0) return '-';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    viewReport(report) {
      this.modalReport = report;
      this.showReportModal = true;
    },
    
    downloadReport(report) {
      console.log('Downloading report:', report.id);
      // Implement download logic
    },
    
    shareReport(report) {
      console.log('Sharing report:', report.id);
      // Implement share logic
    },
    
    generateNewReport() {
      console.log('Generating new report');
      // Implement new report generation
    },
    
    exportReports() {
      console.log('Exporting reports');
      // Implement bulk export
    },
    
    closeReportModal() {
      this.showReportModal = false;
      this.modalReport = null;
    }
  }
}
</script>

<style scoped>
.test-reports-core {
  padding: 1rem;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.reports-header h2 {
  margin: 0;
  color: #2c3e50;
}

.reports-actions {
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

.reports-overview {
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

.overview-card.info { border-left-color: #17a2b8; }
.overview-card.success { border-left-color: #28a745; }
.overview-card.warning { border-left-color: #ffc107; }

.overview-card .value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.reports-filters {
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

.reports-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th,
.reports-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.reports-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.reports-table tr:hover {
  background: #f8f9fa;
}

.failed-row {
  background: #ffeaea !important;
}

.pending-row {
  background: #fff3cd !important;
}

.report-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.report-title small {
  color: #6c757d;
  font-size: 0.8rem;
}

.result-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-badge.passed {
  background: #d4edda;
  color: #155724;
}

.result-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.result-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.result-badge.large {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.report-actions {
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
  font-size: 0.9rem;
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
  max-width: 700px;
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

.result-summary {
  text-align: center;
  margin-bottom: 1rem;
}

.measurements-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.measurement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.measurement-parameter {
  font-weight: 600;
}

.measurement-value {
  color: #495057;
}

.measurement-status {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.measurement-status.passed {
  color: #28a745;
}

.measurement-status.failed {
  color: #dc3545;
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
  .reports-header {
    flex-direction: column;
    gap: 1rem;
  }

  .reports-actions {
    width: 100%;
    justify-content: center;
  }

  .reports-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .reports-filters {
    flex-direction: column;
  }

  .reports-table-container {
    overflow-x: auto;
  }

  .reports-table {
    min-width: 800px;
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

  .measurement-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
