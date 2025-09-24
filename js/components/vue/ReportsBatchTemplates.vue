<template>
  <div class="batch-templates">
    <h3>{{ $t('reports.template_types') }}</h3>
    <div class="templates-grid">
      <div 
        v-for="[templateId, template] in templates" 
        :key="templateId"
        class="template-card"
        @click="selectTemplate(templateId)"
        :class="{ active: selectedTemplate === templateId }"
      >
        <div class="template-icon">{{ template.icon }}</div>
        <div class="template-info">
          <h4>{{ template.name }}</h4>
          <p>{{ template.description }}</p>
        </div>
        <div class="template-stats" v-if="template.includeStats">
          <span class="stat-badge">{{ $t('reports.with_stats') }}</span>
        </div>
      </div>
    </div>

    <!-- Template Configuration Modal -->
    <div v-if="showConfig" class="config-modal-overlay" @click="closeConfig">
      <div class="config-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('reports.configure_template') }}: {{ selectedTemplateData?.name }}</h3>
          <button class="close-btn" @click="closeConfig">×</button>
        </div>
        
        <div class="modal-body">
          <ReportsBatchConfig 
            :template="selectedTemplateData"
            @generate="onGenerate"
            @preview="onPreview"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportsBatchTemplates',
  components: {
    ReportsBatchConfig: () => import('./ReportsBatchConfig.vue')
  },
  props: {
    templates: {
      type: Map,
      required: true
    }
  },
  data() {
    return {
      selectedTemplate: null,
      showConfig: false
    }
  },
  computed: {
    selectedTemplateData() {
      return this.selectedTemplate ? this.templates.get(this.selectedTemplate) : null;
    }
  },
  methods: {
    selectTemplate(templateId) {
      this.selectedTemplate = templateId;
      this.showConfig = true;
      this.$emit('template-selected', templateId);
    },
    
    closeConfig() {
      this.showConfig = false;
      this.selectedTemplate = null;
    },
    
    onGenerate(config) {
      this.$emit('generate-batch', {
        templateId: this.selectedTemplate,
        config: config
      });
      this.closeConfig();
    },
    
    onPreview(config) {
      this.$emit('preview-batch', {
        templateId: this.selectedTemplate,
        config: config
      });
    }
  }
}
</script>

<style scoped>
.batch-templates {
  margin-bottom: 1.5rem;
}

.batch-templates h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.template-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.template-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}

.template-card.active {
  border-color: #007bff;
  background: #f8f9ff;
}

.template-icon {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.template-info h4 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.template-info p {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.template-stats {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.stat-badge {
  background: #28a745;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-weight: bold;
}

/* Modal Styles */
.config-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.config-modal {
  background: white;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .templates-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .template-card {
    padding: 0.75rem;
  }
  
  .template-icon {
    font-size: 1.5rem;
  }
  
  .template-info h4 {
    font-size: 0.9rem;
  }
  
  .template-info p {
    font-size: 0.8rem;
  }
  
  .config-modal {
    max-width: 95vw;
    margin: 1rem;
  }
  
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
}

/* Animation for modal */
.config-modal-overlay {
  animation: fadeIn 0.3s ease;
}

.config-modal {
  animation: slideIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(-20px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}
</style>
