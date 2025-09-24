<template>
  <div class="reports-overview">
    <div class="overview-card">
      <h4>{{ $t(TRANSLATION_KEYS.totalReports) || 'Łączna liczba' }}</h4>
      <span class="value">{{ totalReportsCount }}</span>
      <small>{{ $t(TRANSLATION_KEYS.reports) || 'raportów' }}</small>
    </div>
    <div class="overview-card info">
      <h4>{{ $t(TRANSLATION_KEYS.today) || 'Dzisiaj' }}</h4>
      <span class="value">{{ todayReportsCount }}</span>
      <small>{{ $t(TRANSLATION_KEYS.generated) || 'wygenerowanych' }}</small>
    </div>
    <div class="overview-card success">
      <h4>{{ $t(TRANSLATION_KEYS.passedTests) || 'Testy zaliczone' }}</h4>
      <span class="value">{{ passedTestsPercentage }}%</span>
      <small>{{ $t(TRANSLATION_KEYS.successRate) || 'współczynnik sukcesu' }}</small>
    </div>
    <div class="overview-card warning">
      <h4>{{ $t(TRANSLATION_KEYS.pending) || 'Oczekujące' }}</h4>
      <span class="value">{{ pendingReportsCount }}</span>
      <small>{{ $t(TRANSLATION_KEYS.inQueue) || 'w kolejce' }}</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportsOverview',
  props: {
    reports: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Date calculation configuration
      TODAY: new Date(),
      WEEK_START: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
      MONTH_START: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      
      // Report counting configuration
      PASSED_STATUSES: ['PASSED'],
      PENDING_STATUSES: ['PENDING'],
      COMPLETED_STATUSES: ['COMPLETED'],
      
      // Animation and UI timing
      COUNT_ANIMATION_DURATION: 1200, // ms
      UPDATE_INTERVAL: 30000, // 30 seconds
      
      // Touch configuration (for 400x1280 display)
      CARD_MIN_HEIGHT: 100, // px
      TOUCH_TARGET_MIN_SIZE: 44, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        totalReports: 'reports.total_reports',
        today: 'reports.today',
        passedTests: 'reports.passed_tests',
        pending: 'reports.pending',
        generated: 'reports.generated',
        successRate: 'reports.success_rate',
        inQueue: 'reports.in_queue',
        reports: 'reports.reports',
        
        // Status indicators
        completed: 'reports.completed',
        failed: 'reports.failed',
        processing: 'reports.processing',
        cancelled: 'reports.cancelled'
      },
      
      // Update timer
      updateTimer: null
    }
  },
  computed: {
    totalReportsCount() {
      return this.reports.length;
    },
    
    todayReportsCount() {
      const today = this.TODAY.toISOString().split('T')[0];
      return this.reports.filter(report => {
        const reportDate = new Date(report.createdAt).toISOString().split('T')[0];
        return reportDate === today;
      }).length;
    },
    
    passedTestsPercentage() {
      const completedReports = this.reports.filter(report => 
        this.COMPLETED_STATUSES.includes(report.status)
      );
      
      if (completedReports.length === 0) return 0;
      
      const passedReports = completedReports.filter(report => 
        this.PASSED_STATUSES.includes(report.result)
      );
      
      return Math.round((passedReports.length / completedReports.length) * 100);
    },
    
    pendingReportsCount() {
      return this.reports.filter(report => 
        this.PENDING_STATUSES.includes(report.status) ||
        this.PENDING_STATUSES.includes(report.result)
      ).length;
    },
    
    failedReportsCount() {
      return this.reports.filter(report => 
        report.result === 'FAILED' && report.status === 'COMPLETED'
      ).length;
    },
    
    weekReportsCount() {
      const weekEnd = new Date(this.WEEK_START);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      return this.reports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= this.WEEK_START && reportDate < weekEnd;
      }).length;
    },
    
    monthReportsCount() {
      const monthEnd = new Date(this.MONTH_START.getFullYear(), this.MONTH_START.getMonth() + 1, 0);
      
      return this.reports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= this.MONTH_START && reportDate <= monthEnd;
      }).length;
    }
  },
  methods: {
    startAutoUpdate() {
      this.updateTimer = setInterval(() => {
        // Force reactivity update for time-based calculations
        this.TODAY = new Date();
        this.$forceUpdate();
      }, this.UPDATE_INTERVAL);
    },
    
    stopAutoUpdate() {
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }
    },
    
    animateCountUp(element, finalValue) {
      let startValue = 0;
      const increment = finalValue / (this.COUNT_ANIMATION_DURATION / 16); // 60fps
      
      const animate = () => {
        startValue += increment;
        if (startValue < finalValue) {
          element.textContent = Math.floor(startValue);
          requestAnimationFrame(animate);
        } else {
          element.textContent = finalValue;
        }
      };
      
      requestAnimationFrame(animate);
    },
    
    getStatusColor(status) {
      const statusColors = {
        COMPLETED: '#28a745',
        PENDING: '#ffc107',
        FAILED: '#dc3545',
        CANCELLED: '#6c757d'
      };
      return statusColors[status] || '#6c757d';
    },
    
    getResultColor(result) {
      const resultColors = {
        PASSED: '#28a745',
        FAILED: '#dc3545',
        PENDING: '#ffc107'
      };
      return resultColors[result] || '#6c757d';
    }
  },
  
  mounted() {
    this.startAutoUpdate();
    
    // Animate count-up on mount
    this.$nextTick(() => {
      const valueElements = this.$el.querySelectorAll('.value');
      const counts = [
        this.totalReportsCount,
        this.todayReportsCount,
        this.passedTestsPercentage,
        this.pendingReportsCount
      ];
      
      valueElements.forEach((element, index) => {
        if (counts[index] > 0) {
          this.animateCountUp(element, counts[index]);
        }
      });
    });
  },
  
  beforeUnmount() {
    this.stopAutoUpdate();
  }
}
</script>

<style scoped>
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
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  border-left: 4px solid #e9ecef;
  position: relative;
  overflow: hidden;
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%);
  opacity: 0.3;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.overview-card.info {
  border-left-color: #17a2b8;
  color: #17a2b8;
}

.overview-card.success {
  border-left-color: #28a745;
  color: #28a745;
}

.overview-card.warning {
  border-left-color: #ffc107;
  color: #f57c00;
}

.overview-card.danger {
  border-left-color: #dc3545;
  color: #dc3545;
}

.overview-card h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.overview-card .value {
  font-size: 2.5rem;
  font-weight: 700;
  color: inherit;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.overview-card small {
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .reports-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .overview-card {
    padding: 1rem;
    min-height: 80px;
  }
  
  .overview-card h4 {
    font-size: 0.8rem;
  }
  
  .overview-card .value {
    font-size: 2rem;
  }
  
  .overview-card small {
    font-size: 0.75rem;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .reports-overview {
    grid-template-columns: 1fr;
  }
  
  .overview-card {
    padding: 0.75rem;
    min-height: 70px;
  }
  
  .overview-card .value {
    font-size: 1.8rem;
  }
}

/* Touch-friendly enhancements */
.overview-card {
  min-height: 44px; /* Touch target minimum */
}

.overview-card:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .overview-card {
    border-width: 3px;
    border-style: solid;
  }
  
  .overview-card.info {
    border-color: #17a2b8;
  }
  
  .overview-card.success {
    border-color: #28a745;
  }
  
  .overview-card.warning {
    border-color: #ffc107;
  }
  
  .overview-card.danger {
    border-color: #dc3545;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .overview-card {
    transition: none;
  }
  
  .overview-card:hover {
    transform: none;
  }
}

/* Loading state */
.overview-card.loading {
  opacity: 0.7;
}

.overview-card.loading .value {
  position: relative;
}

.overview-card.loading .value::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Count animation */
.value {
  animation: countFadeIn 0.6s ease-out;
}

@keyframes countFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Success rate specific styling */
.overview-card.success .value::after {
  content: '%';
  font-size: 1.5rem;
  margin-left: 0.2rem;
  opacity: 0.7;
}

/* Pulse animation for critical values */
.overview-card.warning .value,
.overview-card.danger .value {
  animation: criticalPulse 2s infinite;
}

@keyframes criticalPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Focus styles for accessibility */
.overview-card:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Skeleton loading animation */
.overview-card.skeleton {
  pointer-events: none;
}

.overview-card.skeleton .value,
.overview-card.skeleton h4,
.overview-card.skeleton small {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  color: transparent;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Trend indicators */
.overview-card .trend {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.6;
}

.trend.up {
  color: #28a745;
}

.trend.down {
  color: #dc3545;
}

.trend.stable {
  color: #6c757d;
}
</style>
