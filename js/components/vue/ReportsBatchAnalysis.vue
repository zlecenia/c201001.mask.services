<template>
  <div class="batch-analysis">
    <div class="analysis-header">
      <h3>{{ $t('reports.batch_analysis') }}</h3>
      <div class="analysis-controls">
        <select v-model="selectedAnalysis" @change="runAnalysis" class="analysis-selector">
          <option value="">{{ $t('reports.select_analysis') }}</option>
          <option v-for="(engine, key) in analysisEngines" :key="key" :value="key">
            {{ engine.name }}
          </option>
        </select>
        <button class="btn btn-primary" @click="exportAnalysis" :disabled="!analysisResults">
          📊 {{ $t('reports.export_analysis') }}
        </button>
      </div>
    </div>

    <!-- Analysis Results -->
    <div v-if="analysisResults" class="analysis-results">
      <!-- Statistical Analysis -->
      <div v-if="selectedAnalysis === 'statistical'" class="statistics-view">
        <div class="stats-grid">
          <div class="stat-card">
            <h4>{{ $t('reports.total_reports') }}</h4>
            <div class="stat-value">{{ analysisResults.totalReports }}</div>
          </div>
          <div class="stat-card">
            <h4>{{ $t('reports.success_rate') }}</h4>
            <div class="stat-value success">{{ analysisResults.successRate }}%</div>
          </div>
          <div class="stat-card">
            <h4>{{ $t('reports.failure_rate') }}</h4>
            <div class="stat-value danger">{{ analysisResults.failureRate }}%</div>
          </div>
          <div class="stat-card">
            <h4>{{ $t('reports.avg_test_time') }}</h4>
            <div class="stat-value">{{ analysisResults.avgTestTime }}min</div>
          </div>
        </div>

        <!-- Statistical Details -->
        <div class="stats-details">
          <div class="detail-section">
            <h5>{{ $t('reports.pressure_statistics') }}</h5>
            <div class="pressure-stats">
              <div class="pressure-stat">
                <span class="label">{{ $t('reports.avg_low_pressure') }}:</span>
                <span class="value">{{ analysisResults.avgLowPressure }} mbar</span>
              </div>
              <div class="pressure-stat">
                <span class="label">{{ $t('reports.avg_medium_pressure') }}:</span>
                <span class="value">{{ analysisResults.avgMediumPressure }} bar</span>
              </div>
              <div class="pressure-stat">
                <span class="label">{{ $t('reports.avg_high_pressure') }}:</span>
                <span class="value">{{ analysisResults.avgHighPressure }} bar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trending Analysis -->
      <div v-if="selectedAnalysis === 'trending'" class="trending-view">
        <div class="trend-charts">
          <div class="trend-chart">
            <h5>{{ $t('reports.monthly_trends') }}</h5>
            <canvas ref="monthlyChart" class="chart-canvas"></canvas>
          </div>
          <div class="trend-summary">
            <h5>{{ $t('reports.trend_insights') }}</h5>
            <ul class="trend-insights">
              <li v-for="insight in analysisResults.insights" :key="insight.id" 
                  :class="insight.type">
                <span class="insight-icon">{{ getInsightIcon(insight.type) }}</span>
                <span class="insight-text">{{ insight.message }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Quality Analysis -->
      <div v-if="selectedAnalysis === 'quality'" class="quality-view">
        <div class="quality-metrics">
          <div class="metric-card">
            <h5>{{ $t('reports.compliance_score') }}</h5>
            <div class="score-display">
              <div class="score-circle" :class="getScoreClass(analysisResults.complianceScore)">
                <span class="score-value">{{ analysisResults.complianceScore }}</span>
                <span class="score-unit">/100</span>
              </div>
            </div>
          </div>
          
          <div class="metric-card">
            <h5>{{ $t('reports.reliability_index') }}</h5>
            <div class="reliability-bar">
              <div class="bar-fill" :style="{ width: analysisResults.reliabilityIndex + '%' }"></div>
              <span class="bar-text">{{ analysisResults.reliabilityIndex }}%</span>
            </div>
          </div>

          <div class="metric-card">
            <h5>{{ $t('reports.performance_grade') }}</h5>
            <div class="grade-display" :class="analysisResults.performanceGrade.toLowerCase()">
              {{ analysisResults.performanceGrade }}
            </div>
          </div>
        </div>

        <!-- Quality Issues -->
        <div v-if="analysisResults.qualityIssues.length > 0" class="quality-issues">
          <h5>{{ $t('reports.identified_issues') }}</h5>
          <div class="issues-list">
            <div v-for="issue in analysisResults.qualityIssues" :key="issue.id" 
                 class="issue-item" :class="issue.severity">
              <div class="issue-header">
                <span class="issue-severity">{{ issue.severity.toUpperCase() }}</span>
                <span class="issue-count">{{ issue.occurrences }} {{ $t('reports.occurrences') }}</span>
              </div>
              <div class="issue-description">{{ issue.description }}</div>
              <div class="issue-recommendation">
                <strong>{{ $t('reports.recommendation') }}:</strong> {{ issue.recommendation }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isAnalyzing" class="analysis-loading">
      <div class="loading-spinner"></div>
      <p>{{ $t('reports.analyzing_data') }}...</p>
    </div>

    <!-- No Analysis Selected -->
    <div v-if="!selectedAnalysis && !isAnalyzing" class="no-analysis">
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h4>{{ $t('reports.select_analysis_type') }}</h4>
        <p>{{ $t('reports.analysis_description') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportsBatchAnalysis',
  props: {
    reports: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedAnalysis: '',
      analysisResults: null,
      isAnalyzing: false,
      analysisEngines: {
        statistical: {
          name: this.$t ? this.$t('reports.statistical_analysis') : 'Statistical Analysis'
        },
        trending: {
          name: this.$t ? this.$t('reports.trend_analysis') : 'Trend Analysis'
        },
        quality: {
          name: this.$t ? this.$t('reports.quality_analysis') : 'Quality Analysis'
        }
      }
    }
  },
  methods: {
    async runAnalysis() {
      if (!this.selectedAnalysis) return;
      
      this.isAnalyzing = true;
      this.analysisResults = null;
      
      try {
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        switch (this.selectedAnalysis) {
          case 'statistical':
            this.analysisResults = this.calculateStatistics();
            break;
          case 'trending':
            this.analysisResults = this.calculateTrends();
            break;
          case 'quality':
            this.analysisResults = this.calculateQualityMetrics();
            break;
        }
      } finally {
        this.isAnalyzing = false;
      }
    },
    
    calculateStatistics() {
      // Mock statistical analysis
      return {
        totalReports: this.reports.length || 127,
        successRate: 87.4,
        failureRate: 12.6,
        avgTestTime: 8.3,
        avgLowPressure: 10.2,
        avgMediumPressure: 20.5,
        avgHighPressure: 30.1
      };
    },
    
    calculateTrends() {
      // Mock trend analysis
      return {
        monthlyData: [
          { month: 'Jan', success: 85, failure: 15 },
          { month: 'Feb', success: 88, failure: 12 },
          { month: 'Mar', success: 91, failure: 9 },
          { month: 'Apr', success: 87, failure: 13 }
        ],
        insights: [
          {
            id: 1,
            type: 'positive',
            message: 'Success rate improved by 6% over last quarter'
          },
          {
            id: 2,
            type: 'warning',
            message: 'Pressure failures increased by 2% in April'
          },
          {
            id: 3,
            type: 'info',
            message: 'Peak testing hours: 9-11 AM and 2-4 PM'
          }
        ]
      };
    },
    
    calculateQualityMetrics() {
      // Mock quality analysis
      return {
        complianceScore: 92,
        reliabilityIndex: 87,
        performanceGrade: 'A',
        qualityIssues: [
          {
            id: 1,
            severity: 'medium',
            occurrences: 8,
            description: 'Inconsistent pressure readings in PP masks',
            recommendation: 'Calibrate pressure sensors more frequently'
          },
          {
            id: 2,
            severity: 'low',
            occurrences: 3,
            description: 'Extended test duration for SCBA devices',
            recommendation: 'Review test procedure for SCBA category'
          }
        ]
      };
    },
    
    exportAnalysis() {
      if (!this.analysisResults) return;
      
      const data = {
        analysisType: this.selectedAnalysis,
        timestamp: new Date().toISOString(),
        results: this.analysisResults
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch_analysis_${this.selectedAnalysis}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    
    getInsightIcon(type) {
      const icons = {
        positive: '✅',
        warning: '⚠️',
        negative: '❌',
        info: 'ℹ️'
      };
      return icons[type] || 'ℹ️';
    },
    
    getScoreClass(score) {
      if (score >= 90) return 'excellent';
      if (score >= 80) return 'good';
      if (score >= 70) return 'fair';
      return 'poor';
    }
  },
  
  watch: {
    reports: {
      handler() {
        if (this.selectedAnalysis) {
          this.runAnalysis();
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.batch-analysis {
  padding: 1rem;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.analysis-header h3 {
  margin: 0;
  color: #2c3e50;
}

.analysis-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.analysis-selector {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  min-width: 200px;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Statistical Analysis Styles */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  text-align: center;
}

.stat-card h4 {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: normal;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.success {
  color: #28a745;
}

.stat-value.danger {
  color: #dc3545;
}

.stats-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.pressure-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pressure-stat {
  display: flex;
  justify-content: space-between;
}

.pressure-stat .label {
  color: #6c757d;
}

.pressure-stat .value {
  font-weight: bold;
  color: #2c3e50;
}

/* Quality Analysis Styles */
.quality-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.score-display {
  text-align: center;
  margin-top: 1rem;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto;
}

.score-circle.excellent {
  background: #d4edda;
  color: #155724;
}

.score-circle.good {
  background: #cce7ff;
  color: #004085;
}

.score-circle.fair {
  background: #fff3cd;
  color: #856404;
}

.score-circle.poor {
  background: #f8d7da;
  color: #721c24;
}

.score-value {
  font-size: 1.5rem;
}

.score-unit {
  font-size: 0.8rem;
}

.reliability-bar {
  position: relative;
  height: 30px;
  background: #e9ecef;
  border-radius: 15px;
  overflow: hidden;
  margin-top: 1rem;
}

.bar-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.5s ease;
}

.bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.grade-display {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.grade-display.a {
  background: #d4edda;
  color: #155724;
}

.grade-display.b {
  background: #cce7ff;
  color: #004085;
}

.grade-display.c {
  background: #fff3cd;
  color: #856404;
}

/* Loading and Empty States */
.analysis-loading {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-analysis {
  text-align: center;
  padding: 3rem;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #6c757d;
  line-height: 1.5;
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .analysis-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .analysis-controls {
    flex-direction: column;
  }
  
  .analysis-selector {
    min-width: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quality-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
