<template>
  <div class="test-reports-batch">
    <div class="batch-header">
      <h2>📊 {{ $t('reports.batch_processing') || 'Przetwarzanie wsadowe raportów' }}</h2>
      <div class="batch-actions">
        <button class="btn btn-primary" @click="startBatchProcess" :disabled="selectedReports.length === 0">
          ⚡ {{ $t('reports.start_batch') || 'Rozpocznij przetwarzanie' }}
        </button>
        <button class="btn btn-info" @click="exportBatch">
          📤 {{ $t('reports.export_batch') || 'Eksport wsadowy' }}
        </button>
      </div>
    </div>

    <!-- Batch Overview -->
    <div class="batch-overview">
      <div class="overview-card">
        <h4>{{ $t('reports.selected_reports') || 'Wybrane raporty' }}</h4>
        <span class="value">{{ selectedReports.length }}</span>
        <small>{{ $t('reports.reports') || 'raportów' }}</small>
      </div>
      <div class="overview-card info">
        <h4>{{ $t('reports.processing_queue') || 'Kolejka przetwarzania' }}</h4>
        <span class="value">{{ queuedReports.length }}</span>
        <small>{{ $t('reports.in_queue') || 'w kolejce' }}</small>
      </div>
      <div class="overview-card success">
        <h4>{{ $t('reports.completed_today') || 'Ukończone dzisiaj' }}</h4>
        <span class="value">{{ completedToday }}</span>
        <small>{{ $t('reports.processed') || 'przetworzonych' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('reports.failed_processing') || 'Błędy przetwarzania' }}</h4>
        <span class="value">{{ failedProcessing }}</span>
        <small>{{ $t('reports.errors') || 'błędów' }}</small>
      </div>
    </div>

    <!-- Report Selection -->
    <div class="selection-section">
      <h3>{{ $t('reports.select_reports_for_batch') || 'Wybierz raporty do przetwarzania wsadowego' }}</h3>
      
      <div class="selection-filters">
        <input 
          type="text" 
          v-model="searchQuery"
          :placeholder="$t('reports.search_reports') || 'Szukaj raportów...'"
          class="search-input"
        >
        <select v-model="filterStatus">
          <option value="ALL">{{ $t('reports.all_statuses') || 'Wszystkie statusy' }}</option>
          <option value="COMPLETED">{{ $t('reports.completed') || 'Ukończone' }}</option>
          <option value="PENDING">{{ $t('reports.pending') || 'Oczekujące' }}</option>
        </select>
      </div>

      <div class="reports-grid">
        <div 
          v-for="report in filteredReports" 
          :key="report.id"
          class="report-card"
          :class="{ selected: selectedReports.includes(report.id) }"
          @click="toggleReportSelection(report.id)"
        >
          <div class="report-checkbox">
            <input 
              type="checkbox" 
              :checked="selectedReports.includes(report.id)"
              @change="toggleReportSelection(report.id)"
            >
          </div>
          <div class="report-info">
            <h4>{{ report.testName }}</h4>
            <p>{{ report.deviceName }} • {{ formatDate(report.createdAt) }}</p>
            <span :class="['status-badge', report.status.toLowerCase()]">
              {{ report.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch Processing Configuration -->
    <div v-if="selectedReports.length > 0" class="config-section">
      <h3>{{ $t('reports.batch_configuration') || 'Konfiguracja przetwarzania wsadowego' }}</h3>
      
      <div class="config-grid">
        <div class="config-group">
          <label>{{ $t('reports.output_format') || 'Format wyjściowy' }}:</label>
          <select v-model="batchConfig.format">
            <option value="PDF">PDF</option>
            <option value="EXCEL">Excel</option>
            <option value="CSV">CSV</option>
          </select>
        </div>
        <div class="config-group">
          <label>{{ $t('reports.merge_reports') || 'Połącz raporty' }}:</label>
          <input type="checkbox" v-model="batchConfig.merge">
        </div>
        <div class="config-group">
          <label>{{ $t('reports.include_charts') || 'Dołącz wykresy' }}:</label>
          <input type="checkbox" v-model="batchConfig.includeCharts">
        </div>
      </div>
    </div>

    <!-- Processing Status -->
    <div v-if="isProcessing" class="processing-status">
      <h3>{{ $t('reports.processing_in_progress') || 'Przetwarzanie w toku...' }}</h3>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
      </div>
      <p>{{ currentProcessingStep }} ({{ processingProgress }}%)</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestReportsBatch',
  data() {
    return {
      selectedReports: [],
      searchQuery: '',
      filterStatus: 'ALL',
      isProcessing: false,
      processingProgress: 0,
      currentProcessingStep: '',
      batchConfig: {
        format: 'PDF',
        merge: true,
        includeCharts: true
      },
      availableReports: [
        {
          id: 'RPT001',
          testName: 'Test szczelności FFP2',
          deviceName: 'MASKTRONIC C20-001',
          createdAt: new Date().toISOString(),
          status: 'COMPLETED'
        },
        {
          id: 'RPT002',
          testName: 'Test filtracji P3',
          deviceName: 'MASKTRONIC C20-002',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'COMPLETED'
        },
        {
          id: 'RPT003',
          testName: 'Test dopasowania',
          deviceName: 'MASKTRONIC C20-001',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'PENDING'
        }
      ]
    }
  },
  computed: {
    filteredReports() {
      let reports = [...this.availableReports];
      
      if (this.filterStatus !== 'ALL') {
        reports = reports.filter(r => r.status === this.filterStatus);
      }
      
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        reports = reports.filter(r => 
          r.testName.toLowerCase().includes(query) ||
          r.deviceName.toLowerCase().includes(query)
        );
      }
      
      return reports;
    },
    
    queuedReports() {
      return this.availableReports.filter(r => r.status === 'PENDING');
    },
    
    completedToday() {
      return 5; // Mock data
    },
    
    failedProcessing() {
      return 1; // Mock data
    }
  },
  methods: {
    toggleReportSelection(reportId) {
      const index = this.selectedReports.indexOf(reportId);
      if (index > -1) {
        this.selectedReports.splice(index, 1);
      } else {
        this.selectedReports.push(reportId);
      }
    },
    
    async startBatchProcess() {
      this.isProcessing = true;
      this.processingProgress = 0;
      
      const steps = [
        'Inicjalizacja przetwarzania...',
        'Pobieranie danych raportów...',
        'Przetwarzanie raportów...',
        'Generowanie wyników...',
        'Finalizacja...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        this.currentProcessingStep = steps[i];
        this.processingProgress = Math.round(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      this.isProcessing = false;
      console.log('Batch processing completed');
    },
    
    exportBatch() {
      console.log('Exporting batch reports');
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('pl-PL');
    }
  }
}
</script>

<style scoped>
.test-reports-batch {
  padding: 1rem;
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.batch-header h2 {
  margin: 0;
  color: #2c3e50;
}

.batch-actions {
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary { background: #007bff; color: white; }
.btn-info { background: #17a2b8; color: white; }

.batch-overview {
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

.selection-section,
.config-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.selection-section h3,
.config-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.selection-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input,
.selection-filters select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.search-input {
  flex: 1;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.report-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.report-card:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.report-card.selected {
  background: #e3f2fd;
  border-color: #2196f3;
}

.report-info {
  flex: 1;
}

.report-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.report-info p {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-group label {
  font-weight: 600;
  color: #495057;
}

.config-group select,
.config-group input {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.processing-status {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.processing-status h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
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
  background: linear-gradient(90deg, #007bff, #28a745);
  transition: width 0.5s ease;
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .batch-header {
    flex-direction: column;
    gap: 1rem;
  }

  .batch-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .selection-filters {
    flex-direction: column;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
