<template>
  <div class="reports-batch-core">
    <div class="compact-header">
      <h2>{{ $t('menu.reports') }} - {{ $t('reports.batch_title') }}</h2>
      <button class="btn-back" @click="$emit('back')">◀</button>
    </div>

    <!-- Status Panel -->
    <div class="batch-status-panel" v-if="activeBatchJobs.size > 0">
      <h3>{{ $t('reports.active_jobs') }}</h3>
      <div class="active-jobs">
        <div 
          v-for="[jobId, job] in activeBatchJobs" 
          :key="jobId" 
          class="job-status"
          @click="viewBatchProgress(jobId)"
        >
          <div class="job-info">
            <span class="job-name">{{ job.name }}</span>
            <span class="job-progress">{{ job.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: job.progress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch Templates Grid -->
    <ReportsBatchTemplates 
      :templates="batchTemplates"
      @template-selected="onTemplateSelected"
    />

    <!-- Quick Filters -->
    <div class="quick-filters">
      <h3>{{ $t('reports.quick_filters') }}</h3>
      <div class="filter-buttons">
        <button 
          v-for="filter in quickFilters" 
          :key="filter.id"
          class="filter-btn"
          @click="applyQuickFilter(filter.id)"
        >
          {{ filter.icon }} {{ $t(filter.label) }}
        </button>
      </div>
    </div>

    <!-- Recent Batch Reports -->
    <div class="recent-reports" v-if="recentBatchReports.length > 0">
      <h3>{{ $t('reports.recent_batch') }}</h3>
      <div class="reports-list">
        <div 
          v-for="report in recentBatchReports" 
          :key="report.id"
          class="report-item"
          @click="viewBatchReport(report.id)"
        >
          <div class="report-info">
            <span class="report-name">{{ report.name }}</span>
            <span class="report-date">{{ formatDate(report.date) }}</span>
          </div>
          <div class="report-stats">
            <span class="report-count">{{ report.reportCount }} reports</span>
            <span class="report-status" :class="report.status">{{ report.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportsBatchCore',
  components: {
    ReportsBatchTemplates: () => import('./ReportsBatchTemplates.vue')
  },
  props: {
    core: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Batch processing configuration
      MAX_CONCURRENT_JOBS: 5,
      JOB_PROGRESS_UPDATE_INTERVAL: 1000, // ms
      BATCH_SIZE_LIMIT: 1000, // reports per batch
      
      // UI configuration
      GRID_MIN_COLUMN_WIDTH: 120, // px
      CARD_HOVER_TRANSFORM: 1, // px
      
      // Date formatting
      DATE_FORMAT_OPTIONS: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      BUTTON_MIN_HEIGHT: 40, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Batch reports translations
        batchTitle: 'reports.batch_title',
        activeJobs: 'reports.active_jobs',
        quickFilters: 'reports.quick_filters',
        recentBatch: 'reports.recent_batch',
        
        // Template translations
        templateCustomer: 'reports.template_customer',
        templateCustomerDesc: 'reports.template_customer_desc',
        templatePeriod: 'reports.template_period',
        templatePeriodDesc: 'reports.template_period_desc',
        templateDevice: 'reports.template_device',
        templateDeviceDesc: 'reports.template_device_desc',
        templateFailure: 'reports.template_failure',
        templateFailureDesc: 'reports.template_failure_desc',
        
        // Filter translations
        filterToday: 'reports.filter_today',
        filterWeek: 'reports.filter_week',
        filterMonth: 'reports.filter_month',
        filterFailures: 'reports.filter_failures',
        
        // Menu translations
        reports: 'menu.reports',
        
        // Common translations
        back: 'common.back',
        loading: 'global.loading'
      },
      
      // Component state variables
      batchJobs: new Map(),
      activeBatchJobs: new Map(),
      recentBatchReports: [],
      
      // Quick filters configuration
      quickFilters: [
        { id: 'today', icon: '📅', label: 'reports.filter_today' },
        { id: 'week', icon: '📊', label: 'reports.filter_week' },
        { id: 'month', icon: '📈', label: 'reports.filter_month' },
        { id: 'failures', icon: '⚠️', label: 'reports.filter_failures' }
      ]
    }
  },
  computed: {
    batchTemplates() {
      return new Map([
        ['customer', {
          id: 'customer',
          name: this.$t('reports.template_customer'),
          description: this.$t('reports.template_customer_desc'),
          icon: '👤',
          groupBy: 'customer',
          includeStats: true
        }],
        ['period', {
          id: 'period', 
          name: this.$t('reports.template_period'),
          description: this.$t('reports.template_period_desc'),
          icon: '📅',
          groupBy: 'date',
          includeStats: true
        }],
        ['device_type', {
          id: 'device_type',
          name: this.$t('reports.template_device'),
          description: this.$t('reports.template_device_desc'),
          icon: '🔧',
          groupBy: 'deviceType',
          includeStats: true
        }],
        ['failure_analysis', {
          id: 'failure_analysis',
          name: this.$t('reports.template_failure'),
          description: this.$t('reports.template_failure_desc'),
          icon: '⚠️',
          filter: 'FAIL',
          includeAnalysis: true
        }]
      ]);
    }
  },
  methods: {
    onTemplateSelected(templateId) {
      this.$emit('template-selected', templateId);
    },
    
    applyQuickFilter(filterId) {
      this.$emit('quick-filter', filterId);
    },
    
    viewBatchProgress(batchId) {
      this.$emit('view-progress', batchId);
    },
    
    viewBatchReport(reportId) {
      this.$emit('view-report', reportId);
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    
    loadRecentReports() {
      // Mock data - replace with real API call
      this.recentBatchReports = [
        {
          id: 'batch_001',
          name: 'Customer XYZ - Q4 2024',
          date: new Date().toISOString(),
          reportCount: 25,
          status: 'completed'
        },
        {
          id: 'batch_002', 
          name: 'Weekly Analysis',
          date: new Date(Date.now() - 86400000).toISOString(),
          reportCount: 12,
          status: 'completed'
        }
      ];
    }
  },
  
  mounted() {
    this.loadRecentReports();
    
    // Listen for batch job updates
    document.addEventListener('reportsCore:dataUpdated', (e) => {
      this.handleDataUpdate(e.detail);
    });
  },
  
  beforeUnmount() {
    document.removeEventListener('reportsCore:dataUpdated', this.handleDataUpdate);
  }
}
</script>

<style scoped>
.reports-batch-core {
  padding: 1rem;
  max-width: 100%;
  overflow-x: hidden;
}

.compact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.compact-header h2 {
  font-size: 1.2rem;
  margin: 0;
  color: #2c3e50;
}

.btn-back {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.batch-status-panel {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.active-jobs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.job-status {
  background: white;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.job-status:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.job-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.job-name {
  font-weight: bold;
  color: #2c3e50;
}

.job-progress {
  color: #6c757d;
  font-size: 0.9rem;
}

.progress-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.quick-filters {
  margin-bottom: 1rem;
}

.filter-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.filter-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: center;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.recent-reports {
  margin-top: 1rem;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.report-item {
  background: white;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.report-item:hover {
  border-color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.report-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.report-name {
  font-weight: bold;
  color: #2c3e50;
}

.report-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.report-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.report-count {
  color: #6c757d;
}

.report-status {
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.report-status.completed {
  background: #d4edda;
  color: #155724;
}

.report-status.processing {
  background: #fff3cd;
  color: #856404;
}

.report-status.failed {
  background: #f8d7da;
  color: #721c24;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .reports-batch-core {
    padding: 0.5rem;
  }
  
  .filter-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-btn {
    font-size: 0.8rem;
    padding: 0.4rem;
  }
}
</style>
