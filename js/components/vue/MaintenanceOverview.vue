<template>
  <div class="maintenance-overview">
    <div class="overview-card urgent">
      <h4>{{ $t(TRANSLATION_KEYS.urgentTasks) || 'Pilne zadania' }}</h4>
      <span class="value">{{ urgentTasksCount }}</span>
      <small>{{ $t(TRANSLATION_KEYS.requireAttention) || 'wymagają uwagi' }}</small>
    </div>
    <div class="overview-card warning">
      <h4>{{ $t(TRANSLATION_KEYS.dueToday) || 'Dzisiaj' }}</h4>
      <span class="value">{{ todayTasksCount }}</span>
      <small>{{ $t(TRANSLATION_KEYS.tasks) || 'zadań' }}</small>
    </div>
    <div class="overview-card info">
      <h4>{{ $t(TRANSLATION_KEYS.thisWeek) || 'Ten tydzień' }}</h4>
      <span class="value">{{ weekTasksCount }}</span>
      <small>{{ $t(TRANSLATION_KEYS.scheduled) || 'zaplanowanych' }}</small>
    </div>
    <div class="overview-card">
      <h4>{{ $t(TRANSLATION_KEYS.completed) || 'Ukończone' }}</h4>
      <span class="value">{{ completedTasksCount }}</span>
      <small>{{ $t(TRANSLATION_KEYS.thisMonth) || 'w tym miesiącu' }}</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaintenanceOverview',
  props: {
    tasks: {
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
      
      // Task counting configuration
      URGENT_PRIORITY_LEVELS: ['HIGH'],
      OVERDUE_STATUS_THRESHOLD: 24, // hours
      
      // Animation and UI timing
      COUNT_ANIMATION_DURATION: 1000, // ms
      UPDATE_INTERVAL: 60000, // 1 minute
      
      // Touch configuration (for 400x1280 display)
      CARD_MIN_HEIGHT: 100, // px
      TOUCH_TARGET_MIN_SIZE: 44, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        urgentTasks: 'workshop.urgent_tasks',
        dueToday: 'workshop.due_today',
        thisWeek: 'workshop.this_week',
        completed: 'workshop.completed',
        thisMonth: 'workshop.this_month',
        requireAttention: 'workshop.require_attention',
        tasks: 'workshop.tasks',
        scheduled: 'workshop.scheduled',
        
        // Status indicators
        overdue: 'workshop.overdue',
        pending: 'workshop.pending',
        inProgress: 'workshop.in_progress'
      },
      
      // Update timer
      updateTimer: null
    }
  },
  computed: {
    urgentTasksCount() {
      return this.tasks.filter(task => 
        this.URGENT_PRIORITY_LEVELS.includes(task.priority) && 
        task.status !== 'COMPLETED'
      ).length;
    },
    
    todayTasksCount() {
      const today = this.TODAY.toISOString().split('T')[0];
      return this.tasks.filter(task => 
        task.dueDate === today && 
        task.status !== 'COMPLETED'
      ).length;
    },
    
    weekTasksCount() {
      const weekEnd = new Date(this.WEEK_START);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      return this.tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= this.WEEK_START && 
               taskDate < weekEnd && 
               task.status !== 'COMPLETED';
      }).length;
    },
    
    completedTasksCount() {
      const monthEnd = new Date(this.MONTH_START.getFullYear(), this.MONTH_START.getMonth() + 1, 0);
      
      return this.tasks.filter(task => {
        if (task.status !== 'COMPLETED') return false;
        
        const completedDate = new Date(task.completedDate || task.createdDate);
        return completedDate >= this.MONTH_START && completedDate <= monthEnd;
      }).length;
    },
    
    overdueTasksCount() {
      const now = new Date();
      return this.tasks.filter(task => {
        if (task.status === 'COMPLETED') return false;
        
        const dueDate = new Date(task.dueDate);
        const hoursDiff = (now - dueDate) / (1000 * 60 * 60);
        return hoursDiff > this.OVERDUE_STATUS_THRESHOLD;
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
    }
  },
  
  mounted() {
    this.startAutoUpdate();
    
    // Animate count-up on mount
    this.$nextTick(() => {
      const valueElements = this.$el.querySelectorAll('.value');
      const counts = [
        this.urgentTasksCount,
        this.todayTasksCount,
        this.weekTasksCount,
        this.completedTasksCount
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
.maintenance-overview {
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
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.overview-card.urgent {
  border-left-color: #dc3545;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.overview-card.warning {
  border-left-color: #ffc107;
  background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
}

.overview-card.info {
  border-left-color: #17a2b8;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
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
  color: #2c3e50;
  line-height: 1;
}

.overview-card.urgent .value {
  color: #dc3545;
}

.overview-card.warning .value {
  color: #f57c00;
}

.overview-card.info .value {
  color: #17a2b8;
}

.overview-card small {
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .maintenance-overview {
    grid-template-columns: 1fr;
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
  
  .overview-card.urgent {
    border-color: #dc3545;
  }
  
  .overview-card.warning {
    border-color: #ffc107;
  }
  
  .overview-card.info {
    border-color: #17a2b8;
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

/* Count animation */
.value {
  animation: countFadeIn 0.5s ease-out;
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

/* Pulse animation for urgent tasks */
.overview-card.urgent .value {
  animation: urgentPulse 2s infinite;
}

@keyframes urgentPulse {
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
</style>
