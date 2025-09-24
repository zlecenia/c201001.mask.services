<template>
  <div class="test-reports-display">
    <div class="display-header">
      <h2>📄 {{ $t('reports.report_display') || 'Wyświetlanie raportu' }}</h2>
      <div class="display-actions">
        <button class="btn btn-secondary" @click="goBack">
          ⬅️ {{ $t('common.back') || 'Powrót' }}
        </button>
        <button class="btn btn-primary" @click="downloadReport">
          📥 {{ $t('reports.download') || 'Pobierz' }}
        </button>
        <button class="btn btn-info" @click="printReport">
          🖨️ {{ $t('reports.print') || 'Drukuj' }}
        </button>
      </div>
    </div>

    <!-- Report Info Bar -->
    <div class="report-info-bar">
      <div class="report-meta">
        <span class="report-id">ID: {{ reportData.id }}</span>
        <span class="report-date">{{ formatDateTime(reportData.createdAt) }}</span>
        <span :class="['report-status', reportData.result.toLowerCase()]">
          {{ getResultIcon(reportData.result) }} {{ reportData.result }}
        </span>
      </div>
      <div class="view-options">
        <button 
          v-for="view in viewModes" 
          :key="view.id"
          :class="['view-btn', { active: currentView === view.id }]"
          @click="setView(view.id)"
        >
          {{ view.icon }} {{ view.label }}
        </button>
      </div>
    </div>

    <!-- Report Content -->
    <div class="report-content">
      <!-- Summary View -->
      <div v-if="currentView === 'summary'" class="report-summary">
        <div class="summary-grid">
          <div class="summary-card">
            <h3>{{ $t('reports.test_information') || 'Informacje o teście' }}</h3>
            <div class="info-list">
              <div class="info-item">
                <span class="label">{{ $t('reports.test_name') || 'Nazwa testu' }}:</span>
                <span class="value">{{ reportData.testName }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ $t('reports.device') || 'Urządzenie' }}:</span>
                <span class="value">{{ reportData.deviceName }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ $t('reports.operator') || 'Operator' }}:</span>
                <span class="value">{{ reportData.operator }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ $t('reports.duration') || 'Czas trwania' }}:</span>
                <span class="value">{{ formatDuration(reportData.duration) }}</span>
              </div>
            </div>
          </div>

          <div class="summary-card">
            <h3>{{ $t('reports.test_results') || 'Wyniki testów' }}</h3>
            <div class="result-display">
              <div class="result-badge-large" :class="reportData.result.toLowerCase()">
                {{ getResultIcon(reportData.result) }}
                <span>{{ reportData.result }}</span>
              </div>
              <div class="measurements-summary">
                <div 
                  v-for="measurement in reportData.measurements" 
                  :key="measurement.parameter"
                  class="measurement-summary"
                >
                  <span class="param-name">{{ measurement.parameter }}</span>
                  <span class="param-value">{{ measurement.value }} {{ measurement.unit }}</span>
                  <span :class="['param-status', measurement.status.toLowerCase()]">
                    {{ measurement.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed View -->
      <div v-if="currentView === 'detailed'" class="report-detailed">
        <div class="detailed-sections">
          <div class="detail-section">
            <h3>{{ $t('reports.measurement_details') || 'Szczegóły pomiarów' }}</h3>
            <div class="measurements-table">
              <table>
                <thead>
                  <tr>
                    <th>{{ $t('reports.parameter') || 'Parametr' }}</th>
                    <th>{{ $t('reports.measured_value') || 'Wartość zmierzona' }}</th>
                    <th>{{ $t('reports.limit_min') || 'Min' }}</th>
                    <th>{{ $t('reports.limit_max') || 'Max' }}</th>
                    <th>{{ $t('reports.status') || 'Status' }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="measurement in reportData.measurements" :key="measurement.parameter">
                    <td>{{ measurement.parameter }}</td>
                    <td>{{ measurement.value }} {{ measurement.unit }}</td>
                    <td>{{ measurement.minLimit || '-' }}</td>
                    <td>{{ measurement.maxLimit || '-' }}</td>
                    <td>
                      <span :class="['status-badge', measurement.status.toLowerCase()]">
                        {{ measurement.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="detail-section">
            <h3>{{ $t('reports.test_conditions') || 'Warunki testowe' }}</h3>
            <div class="conditions-grid">
              <div class="condition-item">
                <span class="condition-label">{{ $t('reports.temperature') || 'Temperatura' }}:</span>
                <span class="condition-value">{{ reportData.conditions?.temperature || 'N/A' }}°C</span>
              </div>
              <div class="condition-item">
                <span class="condition-label">{{ $t('reports.humidity') || 'Wilgotność' }}:</span>
                <span class="condition-value">{{ reportData.conditions?.humidity || 'N/A' }}%</span>
              </div>
              <div class="condition-item">
                <span class="condition-label">{{ $t('reports.pressure') || 'Ciśnienie' }}:</span>
                <span class="condition-value">{{ reportData.conditions?.pressure || 'N/A' }} hPa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts View -->
      <div v-if="currentView === 'charts'" class="report-charts">
        <div class="charts-grid">
          <div class="chart-container">
            <h3>{{ $t('reports.measurement_trends') || 'Trendy pomiarów' }}</h3>
            <div class="chart-placeholder">
              <canvas ref="trendChart" width="400" height="200"></canvas>
            </div>
          </div>
          <div class="chart-container">
            <h3>{{ $t('reports.parameter_distribution') || 'Rozkład parametrów' }}</h3>
            <div class="chart-placeholder">
              <canvas ref="distributionChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Raw Data View -->
      <div v-if="currentView === 'raw'" class="report-raw">
        <div class="raw-data-section">
          <h3>{{ $t('reports.raw_data') || 'Dane surowe' }}</h3>
          <div class="data-display">
            <pre>{{ JSON.stringify(reportData, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestReportsDisplay',
  props: {
    reportId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentView: 'summary',
      viewModes: [
        { id: 'summary', label: 'Podsumowanie', icon: '📋' },
        { id: 'detailed', label: 'Szczegóły', icon: '🔍' },
        { id: 'charts', label: 'Wykresy', icon: '📊' },
        { id: 'raw', label: 'Dane surowe', icon: '📄' }
      ],
      reportData: {
        id: 'RPT001',
        testName: 'Test szczelności maski FFP2',
        deviceName: 'MASKTRONIC C20-001',
        operator: 'Jan Kowalski',
        createdAt: new Date().toISOString(),
        duration: 125,
        result: 'PASSED',
        measurements: [
          { 
            parameter: 'Ciśnienie wewnętrzne', 
            value: 250, 
            unit: 'Pa', 
            status: 'PASSED',
            minLimit: 200,
            maxLimit: 300
          },
          { 
            parameter: 'Przepływ powietrza', 
            value: 15.2, 
            unit: 'L/min', 
            status: 'PASSED',
            minLimit: 10,
            maxLimit: 20
          },
          { 
            parameter: 'Szczelność', 
            value: 0.8, 
            unit: '%', 
            status: 'PASSED',
            minLimit: null,
            maxLimit: 2
          }
        ],
        conditions: {
          temperature: 23.5,
          humidity: 45,
          pressure: 1013
        }
      }
    }
  },
  methods: {
    setView(viewId) {
      this.currentView = viewId;
      if (viewId === 'charts') {
        this.$nextTick(() => {
          this.renderCharts();
        });
      }
    },
    
    renderCharts() {
      // Simple chart rendering (placeholder)
      const trendCanvas = this.$refs.trendChart;
      const distributionCanvas = this.$refs.distributionChart;
      
      if (trendCanvas) {
        const ctx = trendCanvas.getContext('2d');
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(0, 0, 400, 200);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Wykres trendów', 200, 100);
      }
      
      if (distributionCanvas) {
        const ctx = distributionCanvas.getContext('2d');
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(0, 0, 400, 200);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Wykres rozkładu', 200, 100);
      }
    },
    
    getResultIcon(result) {
      const icons = {
        'PASSED': '✅',
        'FAILED': '❌',
        'WARNING': '⚠️'
      };
      return icons[result] || '📋';
    },
    
    formatDateTime(dateStr) {
      return new Date(dateStr).toLocaleString('pl-PL');
    },
    
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    goBack() {
      this.$emit('close');
    },
    
    downloadReport() {
      console.log('Downloading report:', this.reportData.id);
    },
    
    printReport() {
      window.print();
    }
  },
  
  mounted() {
    // Load report data based on reportId
    console.log('Loading report:', this.reportId);
  }
}
</script>

<style scoped>
.test-reports-display {
  padding: 1rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.display-header h2 {
  margin: 0;
  color: #2c3e50;
}

.display-actions {
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

.report-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.report-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.report-id {
  font-weight: bold;
  color: #495057;
}

.report-date {
  color: #6c757d;
}

.report-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.report-status.passed {
  background: #d4edda;
  color: #155724;
}

.report-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.view-options {
  display: flex;
  gap: 0.25rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.view-btn:hover {
  background: #e9ecef;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.report-content {
  flex: 1;
  overflow-y: auto;
}

/* Summary View */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-item .label {
  font-weight: 600;
  color: #495057;
}

.info-item .value {
  color: #2c3e50;
}

.result-badge-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.result-badge-large.passed {
  background: #d4edda;
  color: #155724;
}

.result-badge-large.failed {
  background: #f8d7da;
  color: #721c24;
}

.measurements-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.measurement-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.param-status.passed { color: #28a745; }
.param-status.failed { color: #dc3545; }

/* Detailed View */
.detailed-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.detail-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.measurements-table {
  overflow-x: auto;
}

.measurements-table table {
  width: 100%;
  border-collapse: collapse;
}

.measurements-table th,
.measurements-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.measurements-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.passed {
  background: #d4edda;
  color: #155724;
}

.status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.conditions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.condition-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.condition-label {
  font-weight: 600;
  color: #495057;
}

/* Charts View */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-container h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.chart-placeholder {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

/* Raw Data View */
.raw-data-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.raw-data-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.data-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.data-display pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #495057;
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .display-header {
    flex-direction: column;
    gap: 1rem;
  }

  .display-actions {
    width: 100%;
    justify-content: center;
  }

  .report-info-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .view-options {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .conditions-grid {
    grid-template-columns: 1fr;
  }

  .measurements-table {
    font-size: 0.85rem;
  }

  .info-item,
  .measurement-summary,
  .condition-item {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* Print styles */
@media print {
  .display-header,
  .report-info-bar .view-options {
    display: none;
  }
  
  .report-content {
    overflow: visible;
  }
  
  .summary-card,
  .detail-section,
  .chart-container {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #dee2e6;
  }
}
</style>
