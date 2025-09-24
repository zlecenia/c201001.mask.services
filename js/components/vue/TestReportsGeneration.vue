<template>
  <div class="test-reports-generation">
    <div class="generation-header">
      <h2>📝 {{ $t('reports.report_generation') || 'Generowanie raportów' }}</h2>
      <div class="generation-actions">
        <button class="btn btn-success" @click="generateReport" :disabled="!canGenerate">
          ⚡ {{ $t('reports.generate_now') || 'Generuj teraz' }}
        </button>
        <button class="btn btn-info" @click="previewReport" :disabled="!hasValidConfig">
          👁️ {{ $t('reports.preview') || 'Podgląd' }}
        </button>
      </div>
    </div>

    <!-- Report Configuration -->
    <div class="config-section">
      <h3>{{ $t('reports.configuration') || 'Konfiguracja raportu' }}</h3>
      
      <div class="config-grid">
        <!-- Report Type -->
        <div class="config-group">
          <label>{{ $t('reports.report_type') || 'Typ raportu' }}:</label>
          <select v-model="reportConfig.type" @change="updateConfig">
            <option value="SINGLE_TEST">{{ $t('reports.single_test') || 'Pojedynczy test' }}</option>
            <option value="BATCH_TESTS">{{ $t('reports.batch_tests') || 'Seria testów' }}</option>
            <option value="SUMMARY">{{ $t('reports.summary') || 'Podsumowanie' }}</option>
            <option value="COMPARISON">{{ $t('reports.comparison') || 'Porównanie' }}</option>
          </select>
        </div>

        <!-- Test Data Selection -->
        <div class="config-group">
          <label>{{ $t('reports.data_source') || 'Źródło danych' }}:</label>
          <select v-model="reportConfig.dataSource" @change="updateConfig">
            <option value="RECENT">{{ $t('reports.recent_tests') || 'Ostatnie testy' }}</option>
            <option value="DATE_RANGE">{{ $t('reports.date_range') || 'Zakres dat' }}</option>
            <option value="SPECIFIC_TESTS">{{ $t('reports.specific_tests') || 'Wybrane testy' }}</option>
            <option value="DEVICE_BASED">{{ $t('reports.device_based') || 'Według urządzenia' }}</option>
          </select>
        </div>

        <!-- Date Range (if applicable) -->
        <div v-if="reportConfig.dataSource === 'DATE_RANGE'" class="config-group">
          <label>{{ $t('reports.from_date') || 'Data od' }}:</label>
          <input type="date" v-model="reportConfig.fromDate" @change="updateConfig">
        </div>

        <div v-if="reportConfig.dataSource === 'DATE_RANGE'" class="config-group">
          <label>{{ $t('reports.to_date') || 'Data do' }}:</label>
          <input type="date" v-model="reportConfig.toDate" @change="updateConfig">
        </div>

        <!-- Output Format -->
        <div class="config-group">
          <label>{{ $t('reports.output_format') || 'Format wyjściowy' }}:</label>
          <select v-model="reportConfig.format" @change="updateConfig">
            <option value="PDF">PDF</option>
            <option value="EXCEL">Excel (XLSX)</option>
            <option value="CSV">CSV</option>
            <option value="HTML">HTML</option>
          </select>
        </div>

        <!-- Language -->
        <div class="config-group">
          <label>{{ $t('reports.language') || 'Język' }}:</label>
          <select v-model="reportConfig.language" @change="updateConfig">
            <option value="pl">🇵🇱 Polski</option>
            <option value="en">🇺🇸 English</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </div>

        <!-- Include Charts -->
        <div class="config-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              v-model="reportConfig.includeCharts" 
              @change="updateConfig"
            >
            {{ $t('reports.include_charts') || 'Dołącz wykresy' }}
          </label>
        </div>
      </div>
    </div>

    <!-- Test Selection (if specific tests) -->
    <div v-if="reportConfig.dataSource === 'SPECIFIC_TESTS'" class="selection-section">
      <h3>{{ $t('reports.select_tests') || 'Wybór testów' }}</h3>
      
      <div class="tests-selection">
        <div class="selection-filters">
          <input 
            type="text" 
            v-model="testSearchQuery"
            @input="filterAvailableTests"
            :placeholder="$t('reports.search_tests') || 'Szukaj testów...'"
            class="search-input"
          >
        </div>

        <div class="tests-list">
          <div 
            v-for="test in filteredAvailableTests" 
            :key="test.id"
            class="test-item"
            :class="{ selected: selectedTests.includes(test.id) }"
            @click="toggleTestSelection(test.id)"
          >
            <div class="test-checkbox">
              <input 
                type="checkbox" 
                :checked="selectedTests.includes(test.id)"
                @change="toggleTestSelection(test.id)"
              >
            </div>
            <div class="test-info">
              <div class="test-name">{{ test.name }}</div>
              <div class="test-details">{{ test.device }} • {{ formatDate(test.date) }}</div>
            </div>
            <div class="test-result">
              <span :class="['result-badge', test.result.toLowerCase()]">
                {{ test.result }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Sections -->
    <div class="sections-config">
      <h3>{{ $t('reports.report_sections') || 'Sekcje raportu' }}</h3>
      
      <div class="sections-grid">
        <div 
          v-for="section in reportSections" 
          :key="section.id"
          class="section-item"
        >
          <label class="section-label">
            <input 
              type="checkbox" 
              v-model="section.enabled"
              @change="updateConfig"
            >
            <span class="section-name">{{ $t(section.labelKey) || section.defaultLabel }}</span>
          </label>
          <div v-if="section.enabled && section.options" class="section-options">
            <div 
              v-for="option in section.options" 
              :key="option.id"
              class="section-option"
            >
              <label>
                <input 
                  type="checkbox" 
                  v-model="option.enabled"
                  @change="updateConfig"
                >
                {{ $t(option.labelKey) || option.defaultLabel }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generation Progress -->
    <div v-if="isGenerating" class="generation-progress">
      <div class="progress-header">
        <h4>{{ $t('reports.generating') || 'Generowanie raportu...' }}</h4>
        <span class="progress-percentage">{{ generationProgress }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: generationProgress + '%' }"></div>
      </div>
      <div class="progress-status">{{ currentGenerationStep }}</div>
    </div>

    <!-- Generation Results -->
    <div v-if="generationComplete" class="generation-results">
      <div class="results-header">
        <h4>✅ {{ $t('reports.generation_complete') || 'Generowanie zakończone' }}</h4>
      </div>
      <div class="results-info">
        <div class="result-item">
          <span class="result-label">{{ $t('reports.file_name') || 'Nazwa pliku' }}:</span>
          <span class="result-value">{{ generatedReport.fileName }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">{{ $t('reports.file_size') || 'Rozmiar pliku' }}:</span>
          <span class="result-value">{{ formatFileSize(generatedReport.fileSize) }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">{{ $t('reports.generation_time') || 'Czas generowania' }}:</span>
          <span class="result-value">{{ formatDuration(generatedReport.generationTime) }}</span>
        </div>
      </div>
      <div class="results-actions">
        <button class="btn btn-primary" @click="downloadReport">
          📥 {{ $t('reports.download') || 'Pobierz' }}
        </button>
        <button class="btn btn-secondary" @click="viewReport">
          👁️ {{ $t('reports.view') || 'Podgląd' }}
        </button>
        <button class="btn btn-info" @click="shareReport">
          📤 {{ $t('reports.share') || 'Udostępnij' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestReportsGeneration',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      reportConfig: {
        type: 'SINGLE_TEST',
        dataSource: 'RECENT',
        fromDate: '',
        toDate: '',
        format: 'PDF',
        language: 'pl',
        includeCharts: true
      },
      selectedTests: [],
      testSearchQuery: '',
      isGenerating: false,
      generationProgress: 0,
      currentGenerationStep: '',
      generationComplete: false,
      generatedReport: null,
      availableTests: [
        {
          id: 'T001',
          name: 'Test szczelności FFP2',
          device: 'MASKTRONIC C20-001',
          date: new Date().toISOString(),
          result: 'PASSED'
        },
        {
          id: 'T002',
          name: 'Test filtracji P3',
          device: 'MASKTRONIC C20-002',
          date: new Date(Date.now() - 86400000).toISOString(),
          result: 'FAILED'
        },
        {
          id: 'T003',
          name: 'Test dopasowania maski',
          device: 'MASKTRONIC C20-001',
          date: new Date(Date.now() - 172800000).toISOString(),
          result: 'PASSED'
        }
      ],
      reportSections: [
        {
          id: 'summary',
          labelKey: 'reports.section_summary',
          defaultLabel: 'Podsumowanie',
          enabled: true
        },
        {
          id: 'test_details',
          labelKey: 'reports.section_test_details',
          defaultLabel: 'Szczegóły testów',
          enabled: true,
          options: [
            {
              id: 'measurements',
              labelKey: 'reports.include_measurements',
              defaultLabel: 'Pomiary',
              enabled: true
            },
            {
              id: 'parameters',
              labelKey: 'reports.include_parameters',
              defaultLabel: 'Parametry',
              enabled: true
            }
          ]
        },
        {
          id: 'charts',
          labelKey: 'reports.section_charts',
          defaultLabel: 'Wykresy',
          enabled: true,
          options: [
            {
              id: 'trend_charts',
              labelKey: 'reports.trend_charts',
              defaultLabel: 'Wykresy trendów',
              enabled: true
            },
            {
              id: 'comparison_charts',
              labelKey: 'reports.comparison_charts',
              defaultLabel: 'Wykresy porównawcze',
              enabled: false
            }
          ]
        },
        {
          id: 'appendix',
          labelKey: 'reports.section_appendix',
          defaultLabel: 'Załączniki',
          enabled: false
        }
      ]
    }
  },
  computed: {
    filteredAvailableTests() {
      if (!this.testSearchQuery.trim()) return this.availableTests;
      
      const query = this.testSearchQuery.toLowerCase();
      return this.availableTests.filter(test =>
        test.name.toLowerCase().includes(query) ||
        test.device.toLowerCase().includes(query)
      );
    },
    
    hasValidConfig() {
      return this.reportConfig.type && this.reportConfig.dataSource;
    },
    
    canGenerate() {
      return this.hasValidConfig && !this.isGenerating;
    }
  },
  methods: {
    updateConfig() {
      // Configuration updated
      this.generationComplete = false;
    },
    
    toggleTestSelection(testId) {
      const index = this.selectedTests.indexOf(testId);
      if (index > -1) {
        this.selectedTests.splice(index, 1);
      } else {
        this.selectedTests.push(testId);
      }
    },
    
    filterAvailableTests() {
      // Filtering handled by computed property
    },
    
    async generateReport() {
      this.isGenerating = true;
      this.generationProgress = 0;
      this.generationComplete = false;
      
      const steps = [
        'Inicjalizacja generatora...',
        'Pobieranie danych testów...',
        'Przetwarzanie wyników...',
        'Generowanie wykresów...',
        'Tworzenie raportu...',
        'Finalizacja...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        this.currentGenerationStep = steps[i];
        this.generationProgress = Math.round(((i + 1) / steps.length) * 100);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      }
      
      this.isGenerating = false;
      this.generationComplete = true;
      this.generatedReport = {
        fileName: `test_report_${Date.now()}.${this.reportConfig.format.toLowerCase()}`,
        fileSize: 1024 * 1024 * 2.5, // 2.5MB
        generationTime: 4200 // 4.2 seconds
      };
      
      console.log('Report generated:', this.generatedReport);
    },
    
    previewReport() {
      console.log('Previewing report with config:', this.reportConfig);
    },
    
    downloadReport() {
      console.log('Downloading report:', this.generatedReport.fileName);
    },
    
    viewReport() {
      console.log('Viewing report:', this.generatedReport.fileName);
    },
    
    shareReport() {
      console.log('Sharing report:', this.generatedReport.fileName);
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('pl-PL');
    },
    
    formatFileSize(bytes) {
      const sizes = ['B', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 B';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    formatDuration(ms) {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    }
  },
  
  mounted() {
    // Set default date range
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    this.reportConfig.toDate = today.toISOString().split('T')[0];
    this.reportConfig.fromDate = lastWeek.toISOString().split('T')[0];
  }
}
</script>

<style scoped>
.test-reports-generation {
  padding: 1rem;
}

.generation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.generation-header h2 {
  margin: 0;
  color: #2c3e50;
}

.generation-actions {
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

.btn-success { background: #28a745; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }

.btn:hover:not(:disabled) { transform: translateY(-1px); }

.config-section,
.selection-section,
.sections-config {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.config-section h3,
.selection-section h3,
.sections-config h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.config-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.tests-selection {
  max-height: 400px;
  overflow-y: auto;
}

.selection-filters {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.tests-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.test-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.test-item:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.test-item.selected {
  background: #e3f2fd;
  border-color: #2196f3;
}

.test-info {
  flex: 1;
}

.test-name {
  font-weight: 600;
  color: #2c3e50;
}

.test-details {
  font-size: 0.9rem;
  color: #6c757d;
}

.result-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.result-badge.passed {
  background: #d4edda;
  color: #155724;
}

.result-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.sections-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-item {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.section-options {
  margin-top: 0.75rem;
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-option label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
}

.generation-progress {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h4 {
  margin: 0;
  color: #2c3e50;
}

.progress-percentage {
  font-weight: bold;
  color: #007bff;
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

.progress-status {
  color: #6c757d;
  font-size: 0.9rem;
}

.generation-results {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #28a745;
}

.results-header h4 {
  margin: 0 0 1rem 0;
  color: #28a745;
}

.results-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
}

.result-label {
  font-weight: 600;
  color: #495057;
}

.result-value {
  color: #2c3e50;
}

.results-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .generation-header {
    flex-direction: column;
    gap: 1rem;
  }

  .generation-actions {
    width: 100%;
    justify-content: center;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .test-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .results-actions {
    flex-direction: column;
  }

  .progress-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
