<template>
  <aside class="pressure-panel">
    <h3 class="pressure-panel-title" :data-i18n="'device.pressure_title'">
      {{ $t('device.pressure_title') || 'PRESSURE' }}
    </h3>
    
    <div 
      v-for="type in pressureTypes" 
      :key="type"
      class="pressure-box"
    >
      <div class="pressure-item">
        <div 
          class="pressure-status" 
          :id="`pressure-${type}-status`"
          :class="getPressureStatusClass(type)"
        ></div>
        
        <div 
          class="pressure-label" 
          :data-i18n="`data.${type}`"
        >
          {{ $t(`data.${type}`) || capitalizeFirst(type) }}
        </div>
        
        <div 
          :id="`pressure-${type}`"
          class="pressure-value"
          :class="getPressureValueClass(type)"
        >
          {{ pressureData[type]?.value || 0 }}
        </div>
        
        <div class="pressure-unit">
          {{ pressureData[type]?.unit || 'bar' }}
        </div>
        
        <div 
          :id="`pressure-${type}-dia`"
          class="pressure-chart"
          @mouseenter="showChartTooltip"
          @mouseleave="hideChartTooltip"
        >
          <div class="pressure-chart-container">
            <div
              v-for="(value, index) in getChartData(type)"
              :key="index"
              class="pressure-chart-line"
              :style="getLineStyle(type, value, index)"
              @mouseenter="(e) => showTooltip(e, type, value, index)"
              @mouseleave="hideTooltip"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'PressurePanel',
  props: {
    pressureData: {
      type: Object,
      required: true,
      default: () => ({
        low: { value: 10, unit: 'mbar', history: Array(60).fill(10) },
        medium: { value: 20, unit: 'bar', history: Array(60).fill(20) },
        high: { value: 30, unit: 'bar', history: Array(60).fill(30) }
      })
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Pressure measurement configuration
      PRESSURE_TYPES: ['low', 'medium', 'high'],
      CHART_DATA_POINTS: 60, // number of historical data points
      CHART_UPDATE_INTERVAL: 1000, // ms
      
      // Pressure range thresholds
      PRESSURE_RANGES: {
        low: { min: 8, max: 12, unit: 'mbar' },
        medium: { min: 18, max: 22, unit: 'bar' },
        high: { min: 28, max: 32, unit: 'bar' }
      },
      
      // Visual configuration
      PANEL_WIDTH: 200, // px
      CHART_HEIGHT: 30, // px
      CHART_LINE_WIDTH: 1.5, // px
      CHART_LINE_HOVER_WIDTH: 3, // px
      
      // Animation timing
      HOVER_TRANSITION_DURATION: 200, // ms
      PULSE_ANIMATION_DURATION: 2000, // ms for warnings
      CRITICAL_PULSE_DURATION: 1000, // ms for critical alerts
      SLIDE_UP_ANIMATION_DURATION: 500, // ms
      
      // Color scheme
      PRESSURE_COLORS: {
        normal: '#22c55e', // Green
        warning: '#f97316', // Orange  
        danger: '#ef4444', // Red
        primary: '#3498db' // Blue
      },
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      MOBILE_BREAKPOINT: 450, // px
      SMALL_MOBILE_BREAKPOINT: 350, // px
      
      // Tooltip configuration
      TOOLTIP_OFFSET_X: 10, // px
      TOOLTIP_OFFSET_Y: -10, // px
      TOOLTIP_Z_INDEX: 1000,
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        // Panel title
        pressureTitle: 'device.pressure_title',
        
        // Pressure type labels
        low: 'data.low',
        medium: 'data.medium', 
        high: 'data.high',
        
        // Status indicators
        normal: 'device.pressure_normal',
        warning: 'device.pressure_warning',
        critical: 'device.pressure_critical',
        
        // Units
        bar: 'units.bar',
        mbar: 'units.mbar',
        psi: 'units.psi',
        kpa: 'units.kpa',
        
        // Tooltip content
        currentValue: 'device.current_value',
        averageValue: 'device.average_value',
        minValue: 'device.min_value',
        maxValue: 'device.max_value',
        timestamp: 'device.timestamp',
        
        // Chart labels
        pressureHistory: 'device.pressure_history',
        dataPoint: 'device.data_point',
        timeAgo: 'device.time_ago',
        
        // Error states
        noData: 'device.no_data',
        sensorError: 'device.sensor_error',
        calibrationNeeded: 'device.calibration_needed'
      },
      
      // Component state variables
      pressureTypes: ['low', 'medium', 'high'],
      pressureRanges: {
        low: { min: 8, max: 12 },
        medium: { min: 18, max: 22 },
        high: { min: 28, max: 32 }
      },
      currentTooltip: null,
      
      // Chart animation delays
      chartLineDelays: Array.from({ length: 60 }, (_, i) => i * 20) // ms delays for each line
    }
  },
  methods: {
    capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    getChartData(type) {
      return this.pressureData[type]?.history || Array(60).fill(0);
    },
    
    getLineStyle(type, value, index) {
      const data = this.getChartData(type);
      const maxValue = Math.max(...data) || 1;
      const minValue = Math.min(...data) || 0;
      const range = maxValue - minValue || 1;
      
      const normalizedValue = ((value - minValue) / range) * 100;
      const height = Math.max(2, normalizedValue);
      
      return {
        height: `${height}%`,
        left: `${(index / 59) * 100}%`,
        backgroundColor: this.getPressureColor(type, value),
        animationDelay: `${index * 20}ms`
      };
    },
    
    getPressureColor(type, value) {
      const range = this.pressureRanges[type];
      if (!range) return '#3498db';
      
      if (value < range.min) {
        return '#ef4444'; // Red for low values
      } else if (value > range.max) {
        return '#f97316'; // Orange for high values
      } else {
        return '#22c55e'; // Green for normal range
      }
    },
    
    getPressureStatusClass(type) {
      const value = parseFloat(this.pressureData[type]?.value || 0);
      const range = this.pressureRanges[type];
      
      if (!range) return '';
      
      if (value < range.min || value > range.max) {
        return 'danger';
      } else if (value < range.min + 1 || value > range.max - 1) {
        return 'warning';
      }
      return '';
    },
    
    getPressureValueClass(type) {
      return this.getPressureStatusClass(type);
    },
    
    showTooltip(event, type, value, index) {
      this.hideTooltip();
      
      const tooltip = document.createElement('div');
      tooltip.className = 'pressure-tooltip';
      tooltip.innerHTML = 
        '<div class="tooltip-header">' + type.toUpperCase() + ' Pressure</div>' +
        '<div class="tooltip-value">' + value.toFixed(1) + ' ' + this.getUnit(type) + '</div>' +
        '<div class="tooltip-time">' + (60 - index) + 's ago</div>';
      
      document.body.appendChild(tooltip);
      this.currentTooltip = tooltip;
      
      const rect = event.target.getBoundingClientRect();
      tooltip.style.position = 'absolute';
      tooltip.style.left = `${rect.left + window.scrollX}px`;
      tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;
      tooltip.style.zIndex = '1000';
    },
    
    hideTooltip() {
      if (this.currentTooltip) {
        this.currentTooltip.remove();
        this.currentTooltip = null;
      }
    },
    
    getUnit(type) {
      return this.pressureData[type]?.unit || (type === 'low' ? 'mbar' : 'bar');
    },
    
    showChartTooltip() {
      // Handler for chart area mouse enter
    },
    
    hideChartTooltip() {
      this.hideTooltip();
    }
  },
  
  beforeUnmount() {
    this.hideTooltip();
  }
}
</script>

<style scoped>
.pressure-panel {
  position: fixed;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 100;
  border: 1px solid #e9ecef;
}

.pressure-panel-title {
  text-align: center;
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.pressure-box {
  margin-bottom: 1rem;
}

.pressure-box:last-child {
  margin-bottom: 0;
}

.pressure-item {
  position: relative;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.pressure-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}

.pressure-status {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.pressure-status.warning { 
  background: #f97316; 
  animation: pulse 2s infinite;
}

.pressure-status.danger { 
  background: #ef4444; 
  animation: pulse 1s infinite;
}

.pressure-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pressure-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.pressure-value.warning {
  color: #f39c12;
  animation: pulse 2s infinite;
}

.pressure-value.danger {
  color: #e74c3c;
  animation: pulse 1s infinite;
}

.pressure-unit {
  font-size: 0.7rem;
  color: #95a5a6;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.pressure-chart {
  position: relative;
  width: 100%;
  height: 30px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  cursor: crosshair;
}

.pressure-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: end;
}

.pressure-chart-line {
  position: absolute;
  bottom: 0;
  width: 1.5px;
  background: #3498db;
  transition: all 0.3s ease;
  border-radius: 1px 1px 0 0;
  opacity: 0;
  animation: slideUp 0.5s ease forwards;
}

.pressure-chart-line:hover {
  width: 3px;
  z-index: 10;
  box-shadow: 0 0 6px rgba(52, 152, 219, 0.8);
}

/* Global tooltip styles (outside scoped) */
:global(.pressure-tooltip) {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1000;
  position: absolute;
}

:global(.tooltip-header) {
  font-weight: bold;
  margin-bottom: 4px;
  color: #3498db;
}

:global(.tooltip-value) {
  font-size: 13px;
  color: white;
  margin-bottom: 2px;
}

:global(.tooltip-time) {
  font-size: 10px;
  color: #bdc3c7;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .pressure-panel {
    position: relative;
    right: auto;
    top: auto;
    transform: none;
    width: 100%;
    margin: 1rem 0;
    border-radius: 8px;
  }
  
  .pressure-panel-title {
    font-size: 0.9rem;
  }
  
  .pressure-item {
    padding: 0.5rem;
  }
  
  .pressure-value {
    font-size: 1.2rem;
  }
  
  .pressure-chart {
    height: 25px;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .pressure-panel {
    padding: 0.75rem;
  }
  
  .pressure-item {
    padding: 0.4rem;
  }
  
  .pressure-value {
    font-size: 1.1rem;
  }
  
  .pressure-chart {
    height: 20px;
  }
  
  .pressure-chart-line {
    width: 1px;
  }
  
  .pressure-chart-line:hover {
    width: 2px;
  }
}

/* Hover effects for better UX */
.pressure-item:hover .pressure-value {
  color: #3498db;
}

.pressure-item:hover .pressure-chart {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}
</style>
