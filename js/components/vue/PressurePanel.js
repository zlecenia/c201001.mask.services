export default {
  name: 'PressurePanel',
  template: `
    <aside class="pressure-panel">
      <h3 class="pressure-panel-title">
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
            :id="'pressure-' + type + '-status'"
            :class="getPressureStatusClass(type)"
          ></div>
          
          <div 
            class="pressure-label" 
            :data-i18n="'data.' + type"
          >
            {{ $t('data.' + type) || capitalizeFirst(type) }}
          </div>
          
          <div 
            :id="'pressure-' + type"
            class="pressure-value"
            :class="getPressureValueClass(type)"
          >
            {{ pressureData[type]?.value || 0 }}
          </div>
          
          <div class="pressure-unit">
            {{ pressureData[type]?.unit || 'bar' }}
          </div>
          
          <div 
            :id="'pressure-' + type + '-dia'"
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
  `,
  props: {
    pressureData: {
      type: Object,
      default: () => ({
        low: { value: 10, unit: 'mbar', history: Array(60).fill(10) },
        medium: { value: 20, unit: 'bar', history: Array(60).fill(20) },
        high: { value: 30, unit: 'bar', history: Array(60).fill(30) }
      })
    }
  },
  data() {
    return {
      pressureTypes: ['low', 'medium', 'high'],
      tooltip: null
    }
  },
  methods: {
    capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    getPressureStatusClass(type) {
      const value = this.pressureData[type]?.value || 0;
      const thresholds = {
        low: { warning: 8, critical: 5 },
        medium: { warning: 15, critical: 10 },
        high: { warning: 25, critical: 20 }
      };
      
      const threshold = thresholds[type];
      if (value < threshold.critical) return 'status-critical';
      if (value < threshold.warning) return 'status-warning';
      return 'status-normal';
    },
    
    getPressureValueClass(type) {
      return \`pressure-\${type}\`;
    },
    
    getChartData(type) {
      return this.pressureData[type]?.history || Array(60).fill(0);
    },
    
    getLineStyle(type, value, index) {
      const maxValue = Math.max(...this.getChartData(type));
      const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
      
      const colors = {
        low: '#3498db',
        medium: '#f39c12', 
        high: '#e74c3c'
      };
      
      return {
        height: \`\${height}%\`,
        backgroundColor: colors[type] || '#95a5a6',
        opacity: 0.7 + (index / 60) * 0.3
      };
    },
    
    showChartTooltip() {
      // Chart hover effect
    },
    
    hideChartTooltip() {
      // Hide chart hover effect
    },
    
    showTooltip(event, type, value, index) {
      this.hideTooltip();
      
      const tooltip = document.createElement('div');
      tooltip.className = 'pressure-tooltip';
      tooltip.innerHTML = \`
        <div class="tooltip-header">\${this.capitalizeFirst(type)} Pressure</div>
        <div class="tooltip-value">\${value} \${this.pressureData[type]?.unit || 'bar'}</div>
        <div class="tooltip-time">Sample #\${index + 1}</div>
      \`;
      
      document.body.appendChild(tooltip);
      this.tooltip = tooltip;
      
      const rect = event.target.getBoundingClientRect();
      tooltip.style.left = \`\${rect.left + 10}px\`;
      tooltip.style.top = \`\${rect.top - 10}px\`;
    },
    
    hideTooltip() {
      if (this.tooltip) {
        document.body.removeChild(this.tooltip);
        this.tooltip = null;
      }
    },
    
    injectStyles() {
      if (document.getElementById('pressure-panel-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'pressure-panel-styles';
      style.textContent = \`
        .pressure-panel {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(44, 62, 80, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px 0 0 12px;
          padding: 1rem;
          color: white;
          min-width: 180px;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
          z-index: 100;
        }

        .pressure-panel-title {
          text-align: center;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          font-weight: bold;
          color: #3498db;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .pressure-box {
          margin-bottom: 1rem;
        }

        .pressure-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .pressure-item:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(-5px);
        }

        .pressure-status {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-bottom: 0.25rem;
        }

        .status-normal {
          background: #27ae60;
          box-shadow: 0 0 8px rgba(39, 174, 96, 0.5);
        }

        .status-warning {
          background: #f39c12;
          box-shadow: 0 0 8px rgba(243, 156, 18, 0.5);
          animation: pulse-warning 2s infinite;
        }

        .status-critical {
          background: #e74c3c;
          box-shadow: 0 0 8px rgba(231, 76, 60, 0.5);
          animation: pulse-critical 1s infinite;
        }

        .pressure-label {
          font-size: 0.7rem;
          color: #bdc3c7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .pressure-value {
          font-size: 1.4rem;
          font-weight: bold;
          text-align: center;
          font-family: 'Courier New', monospace;
        }

        .pressure-low {
          color: #3498db;
        }

        .pressure-medium {
          color: #f39c12;
        }

        .pressure-high {
          color: #e74c3c;
        }

        .pressure-unit {
          font-size: 0.7rem;
          color: #95a5a6;
          text-align: center;
        }

        .pressure-chart {
          width: 100%;
          height: 40px;
          margin-top: 0.5rem;
          cursor: pointer;
        }

        .pressure-chart-container {
          display: flex;
          align-items: end;
          height: 100%;
          gap: 1px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          padding: 2px;
        }

        .pressure-chart-line {
          flex: 1;
          min-height: 2px;
          border-radius: 1px;
          transition: all 0.1s ease;
        }

        .pressure-chart-line:hover {
          opacity: 1 !important;
          transform: scaleY(1.1);
        }

        /* Tooltip styles are already defined globally in index-vue.html */

        /* Animations */
        @keyframes pulse-warning {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes pulse-critical {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .pressure-panel {
            position: relative;
            right: auto;
            top: auto;
            transform: none;
            border-radius: 8px;
            margin: 1rem;
            min-width: auto;
            width: calc(100% - 2rem);
          }
          
          .pressure-box {
            margin-bottom: 0.75rem;
          }
          
          .pressure-item {
            padding: 0.5rem;
          }
          
          .pressure-value {
            font-size: 1.2rem;
          }
        }

        /* Very small screens */
        @media (max-width: 450px) {
          .pressure-panel {
            padding: 0.75rem;
            margin: 0.5rem;
            width: calc(100% - 1rem);
          }
          
          .pressure-panel-title {
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
          }
          
          .pressure-chart {
            height: 30px;
          }
        }
      \`;
      document.head.appendChild(style);
    }
  },
  mounted() {
    this.injectStyles();
  },
  beforeUnmount() {
    this.hideTooltip();
  }
}
