<template>
  <div class="batch-config">
    <!-- Template-specific Configuration -->
    <div class="config-section">
      <h4>{{ $t('reports.configuration') }}</h4>
      
      <!-- Customer Template Config -->
      <div v-if="template.id === 'customer'" class="config-group">
        <label>{{ $t('reports.select_customer') }}:</label>
        <select v-model="config.customer" class="form-control">
          <option value="">{{ $t('reports.choose_customer') }}</option>
          <option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customer.name }}
          </option>
        </select>
      </div>

      <!-- Period Template Config -->
      <div v-if="template.id === 'period'" class="config-group">
        <div class="date-range">
          <div class="date-field">
            <label>{{ $t('reports.start_date') }}:</label>
            <input type="date" v-model="config.startDate" class="form-control">
          </div>
          <div class="date-field">
            <label>{{ $t('reports.end_date') }}:</label>
            <input type="date" v-model="config.endDate" class="form-control">
          </div>
        </div>
      </div>

      <!-- Device Type Template Config -->
      <div v-if="template.id === 'device_type'" class="config-group">
        <label>{{ $t('reports.device_type') }}:</label>
        <select v-model="config.deviceType" class="form-control">
          <option value="">{{ $t('reports.all_devices') }}</option>
          <option v-for="deviceType in deviceTypes" :key="deviceType.id" :value="deviceType.id">
            {{ deviceType.name }}
          </option>
        </select>
      </div>

      <!-- Failure Analysis Config -->
      <div v-if="template.id === 'failure_analysis'" class="config-group">
        <label>{{ $t('reports.failure_criteria') }}:</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="config.includePressureFailures">
            {{ $t('reports.pressure_failures') }}
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="config.includeLeakageFailures">
            {{ $t('reports.leakage_failures') }}
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="config.includeTimeoutFailures">
            {{ $t('reports.timeout_failures') }}
          </label>
        </div>
      </div>
    </div>

    <!-- Output Format Options -->
    <div class="config-section">
      <h4>{{ $t('reports.output_format') }}</h4>
      <div class="format-options">
        <label class="radio-label">
          <input type="radio" v-model="config.format" value="pdf">
          <span class="format-icon">📄</span> PDF
        </label>
        <label class="radio-label">
          <input type="radio" v-model="config.format" value="xml">
          <span class="format-icon">📋</span> XML
        </label>
        <label class="radio-label">
          <input type="radio" v-model="config.format" value="csv">
          <span class="format-icon">📊</span> CSV
        </label>
        <label class="radio-label">
          <input type="radio" v-model="config.format" value="json">
          <span class="format-icon">💾</span> JSON
        </label>
      </div>
    </div>

    <!-- Additional Options -->
    <div class="config-section">
      <h4>{{ $t('reports.additional_options') }}</h4>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="config.includeGraphs">
          {{ $t('reports.include_graphs') }}
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="config.digitalSignature">
          {{ $t('reports.digital_signature') }}
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="config.emailDelivery">
          {{ $t('reports.email_delivery') }}
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="config.compressOutput">
          {{ $t('reports.compress_zip') }}
        </label>
      </div>
    </div>

    <!-- Email Configuration (when email delivery is enabled) -->
    <div v-if="config.emailDelivery" class="config-section">
      <h4>{{ $t('reports.email_settings') }}</h4>
      <div class="config-group">
        <label>{{ $t('reports.email_recipients') }}:</label>
        <textarea 
          v-model="config.emailRecipients" 
          class="form-control"
          :placeholder="$t('reports.email_placeholder')"
          rows="3"
        ></textarea>
      </div>
      <div class="config-group">
        <label>{{ $t('reports.email_subject') }}:</label>
        <input 
          type="text" 
          v-model="config.emailSubject" 
          class="form-control"
          :placeholder="getDefaultEmailSubject()"
        >
      </div>
    </div>

    <!-- Preview Section -->
    <div class="config-section">
      <h4>{{ $t('reports.preview') }}</h4>
      <div class="preview-info">
        <div class="preview-stat">
          <span class="stat-label">{{ $t('reports.estimated_reports') }}:</span>
          <span class="stat-value">{{ estimatedReportCount }}</span>
        </div>
        <div class="preview-stat">
          <span class="stat-label">{{ $t('reports.estimated_size') }}:</span>
          <span class="stat-value">{{ estimatedSize }}</span>
        </div>
        <div class="preview-stat">
          <span class="stat-label">{{ $t('reports.estimated_time') }}:</span>
          <span class="stat-value">{{ estimatedTime }}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="config-actions">
      <button class="btn btn-secondary" @click="onPreview">
        👁️ {{ $t('reports.preview') }}
      </button>
      <button class="btn btn-primary" @click="onGenerate" :disabled="!isValidConfig">
        🚀 {{ $t('reports.generate') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportsBatchConfig',
  props: {
    template: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      config: {
        format: 'pdf',
        includeGraphs: true,
        digitalSignature: false,
        emailDelivery: false,
        compressOutput: false,
        customer: '',
        startDate: '',
        endDate: '',
        deviceType: '',
        includePressureFailures: true,
        includeLeakageFailures: true,
        includeTimeoutFailures: true,
        emailRecipients: '',
        emailSubject: ''
      },
      customers: [
        { id: 'abc', name: 'Firma ABC' },
        { id: 'xyz', name: 'Firma XYZ' },
        { id: 'firefighters', name: 'Straż Pożarna' }
      ],
      deviceTypes: [
        { id: 'pp_mask', name: 'Maska nadciśnieniowa' },
        { id: 'np_mask', name: 'Maska podciśnieniowa' },
        { id: 'scba', name: 'Aparat SCBA' },
        { id: 'cps', name: 'Ubranie gazoszczelne' }
      ]
    }
  },
  computed: {
    isValidConfig() {
      switch (this.template.id) {
        case 'customer':
          return !!this.config.customer;
        case 'period':
          return !!this.config.startDate && !!this.config.endDate;
        case 'device_type':
          return !!this.config.deviceType;
        case 'failure_analysis':
          return this.config.includePressureFailures || 
                 this.config.includeLeakageFailures || 
                 this.config.includeTimeoutFailures;
        default:
          return true;
      }
    },
    
    estimatedReportCount() {
      // Mock calculation based on template type
      switch (this.template.id) {
        case 'customer':
          return this.config.customer ? '15-25' : '0';
        case 'period':
          if (this.config.startDate && this.config.endDate) {
            const days = Math.ceil((new Date(this.config.endDate) - new Date(this.config.startDate)) / (1000 * 60 * 60 * 24));
            return Math.floor(days * 2.5).toString();
          }
          return '0';
        case 'device_type':
          return this.config.deviceType ? '8-15' : '0';
        case 'failure_analysis':
          return '3-8';
        default:
          return '0';
      }
    },
    
    estimatedSize() {
      const count = parseInt(this.estimatedReportCount.split('-')[0]) || 0;
      const baseSize = this.config.format === 'pdf' ? 150 : 50; // KB per report
      const graphsMultiplier = this.config.includeGraphs ? 2 : 1;
      const totalKB = count * baseSize * graphsMultiplier;
      
      if (totalKB > 1024) {
        return `${(totalKB / 1024).toFixed(1)} MB`;
      }
      return `${totalKB} KB`;
    },
    
    estimatedTime() {
      const count = parseInt(this.estimatedReportCount.split('-')[0]) || 0;
      const timePerReport = 2; // seconds
      const totalSeconds = count * timePerReport;
      
      if (totalSeconds > 60) {
        return `${Math.ceil(totalSeconds / 60)} min`;
      }
      return `${totalSeconds} s`;
    }
  },
  methods: {
    onPreview() {
      this.$emit('preview', { ...this.config });
    },
    
    onGenerate() {
      if (this.isValidConfig) {
        this.$emit('generate', { ...this.config });
      }
    },
    
    getDefaultEmailSubject() {
      return `${this.template.name} - ${new Date().toLocaleDateString()}`;
    }
  },
  
  mounted() {
    // Set default dates for period template
    if (this.template.id === 'period') {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      this.config.endDate = today.toISOString().split('T')[0];
      this.config.startDate = lastWeek.toISOString().split('T')[0];
    }
    
    // Set default email subject
    this.config.emailSubject = this.getDefaultEmailSubject();
  }
}
</script>

<style scoped>
.batch-config {
  max-width: 600px;
}

.config-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.config-section:last-of-type {
  border-bottom: none;
}

.config-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.config-group {
  margin-bottom: 1rem;
}

.config-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.15s ease-in-out;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.format-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.radio-label, .checkbox-label {
  display: flex !important;
  align-items: center;
  margin-bottom: 0.5rem !important;
  cursor: pointer;
  font-weight: normal !important;
}

.radio-label input[type="radio"],
.checkbox-label input[type="checkbox"] {
  margin-right: 0.5rem;
}

.format-icon {
  margin-right: 0.3rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.preview-stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.preview-stat:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

.config-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .batch-config {
    max-width: 100%;
  }
  
  .date-range {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .format-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .config-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
