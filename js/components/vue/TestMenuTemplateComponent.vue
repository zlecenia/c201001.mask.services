<template>
  <div class="test-menu-template">
    <div class="template-header">
      <h2>🧪 {{ $t('templates.test_templates') || 'Szablony testów' }}</h2>
      <div class="template-actions">
        <button class="btn btn-success" @click="createTemplate">
          ➕ {{ $t('templates.create_template') || 'Utwórz szablon' }}
        </button>
        <button class="btn btn-info" @click="importTemplate">
          📥 {{ $t('templates.import_template') || 'Importuj szablon' }}
        </button>
      </div>
    </div>

    <!-- Templates Grid -->
    <div class="templates-grid">
      <div 
        v-for="template in templates" 
        :key="template.id"
        class="template-card"
        :class="{ featured: template.featured, default: template.isDefault }"
      >
        <div class="template-badge" v-if="template.featured">⭐ {{ $t('templates.featured') || 'Polecany' }}</div>
        <div class="template-badge default" v-if="template.isDefault">🏠 {{ $t('templates.default') || 'Domyślny' }}</div>
        
        <div class="template-icon">{{ template.icon }}</div>
        <div class="template-info">
          <h3>{{ template.name }}</h3>
          <p>{{ template.description }}</p>
          
          <div class="template-stats">
            <div class="stat">
              <span class="stat-icon">⏱️</span>
              <span class="stat-value">{{ template.duration }}</span>
            </div>
            <div class="stat">
              <span class="stat-icon">📊</span>
              <span class="stat-value">{{ template.parametersCount }} {{ $t('templates.parameters') || 'parametrów' }}</span>
            </div>
            <div class="stat">
              <span class="stat-icon">🔄</span>
              <span class="stat-value">{{ template.usageCount }} {{ $t('templates.uses') || 'użyć' }}</span>
            </div>
          </div>

          <div class="template-tags">
            <span 
              v-for="tag in template.tags" 
              :key="tag"
              class="template-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="template-actions">
          <button class="btn btn-primary btn-sm" @click="useTemplate(template)">
            ▶️ {{ $t('templates.use_template') || 'Użyj szablonu' }}
          </button>
          <div class="action-buttons">
            <button class="btn-action" @click="editTemplate(template)" title="Edytuj">✏️</button>
            <button class="btn-action" @click="cloneTemplate(template)" title="Klonuj">📋</button>
            <button class="btn-action" @click="exportTemplate(template)" title="Eksportuj">📤</button>
            <button 
              v-if="!template.isDefault"
              class="btn-action delete" 
              @click="deleteTemplate(template)" 
              title="Usuń"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Template Modal -->
    <div v-if="showTemplateModal" class="modal-overlay" @click="closeTemplateModal">
      <div class="modal-content template-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? ($t('templates.edit_template') || 'Edytuj szablon') : ($t('templates.create_template') || 'Utwórz szablon') }}</h3>
          <button class="close-btn" @click="closeTemplateModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-sections">
            <!-- Basic Info -->
            <div class="form-section">
              <h4>{{ $t('templates.basic_info') || 'Informacje podstawowe' }}</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>{{ $t('templates.name') || 'Nazwa szablonu' }}:</label>
                  <input type="text" v-model="templateForm.name" :placeholder="$t('templates.enter_name') || 'Wprowadź nazwę'">
                </div>
                <div class="form-group">
                  <label>{{ $t('templates.description') || 'Opis' }}:</label>
                  <textarea v-model="templateForm.description" :placeholder="$t('templates.enter_description') || 'Wprowadź opis'"></textarea>
                </div>
                <div class="form-group">
                  <label>{{ $t('templates.test_type') || 'Typ testu' }}:</label>
                  <select v-model="templateForm.testType">
                    <option value="LEAK_TEST">{{ $t('tests.leak_test') || 'Test szczelności' }}</option>
                    <option value="FILTRATION_TEST">{{ $t('tests.filtration_test') || 'Test filtracji' }}</option>
                    <option value="FIT_TEST">{{ $t('tests.fit_test') || 'Test dopasowania' }}</option>
                    <option value="PRESSURE_TEST">{{ $t('tests.pressure_test') || 'Test ciśnieniowy' }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ $t('templates.duration') || 'Szacowany czas trwania' }}:</label>
                  <input type="text" v-model="templateForm.duration" placeholder="np. 3-5 min">
                </div>
              </div>
            </div>

            <!-- Test Parameters -->
            <div class="form-section">
              <h4>{{ $t('templates.test_parameters') || 'Parametry testu' }}</h4>
              <div class="parameters-list">
                <div 
                  v-for="(param, index) in templateForm.parameters" 
                  :key="index"
                  class="parameter-item"
                >
                  <div class="parameter-fields">
                    <input 
                      type="text" 
                      v-model="param.name" 
                      :placeholder="$t('templates.parameter_name') || 'Nazwa parametru'"
                    >
                    <input 
                      type="text" 
                      v-model="param.value" 
                      :placeholder="$t('templates.default_value') || 'Wartość domyślna'"
                    >
                    <input 
                      type="text" 
                      v-model="param.unit" 
                      :placeholder="$t('templates.unit') || 'Jednostka'"
                    >
                    <button class="btn-remove" @click="removeParameter(index)">🗑️</button>
                  </div>
                </div>
                <button class="btn btn-outline btn-sm" @click="addParameter">
                  ➕ {{ $t('templates.add_parameter') || 'Dodaj parametr' }}
                </button>
              </div>
            </div>

            <!-- Tags -->
            <div class="form-section">
              <h4>{{ $t('templates.tags') || 'Tagi' }}</h4>
              <div class="tags-input">
                <div class="current-tags">
                  <span 
                    v-for="(tag, index) in templateForm.tags" 
                    :key="index"
                    class="tag-item"
                  >
                    {{ tag }}
                    <button class="tag-remove" @click="removeTag(index)">×</button>
                  </span>
                </div>
                <div class="add-tag">
                  <input 
                    type="text" 
                    v-model="newTag" 
                    @keypress.enter="addTag"
                    :placeholder="$t('templates.add_tag') || 'Dodaj tag'"
                  >
                  <button class="btn btn-sm" @click="addTag">{{ $t('common.add') || 'Dodaj' }}</button>
                </div>
              </div>
            </div>

            <!-- Settings -->
            <div class="form-section">
              <h4>{{ $t('templates.settings') || 'Ustawienia' }}</h4>
              <div class="settings-checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="templateForm.featured">
                  {{ $t('templates.mark_as_featured') || 'Oznacz jako polecany' }}
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="templateForm.isDefault">
                  {{ $t('templates.set_as_default') || 'Ustaw jako domyślny' }}
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="templateForm.shared">
                  {{ $t('templates.share_with_team') || 'Udostępnij zespołowi' }}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeTemplateModal">
            {{ $t('common.cancel') || 'Anuluj' }}
          </button>
          <button class="btn btn-primary" @click="saveTemplate">
            {{ $t('common.save') || 'Zapisz' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestMenuTemplateComponent',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showTemplateModal: false,
      isEditMode: false,
      newTag: '',
      templateForm: {
        name: '',
        description: '',
        testType: 'LEAK_TEST',
        duration: '',
        parameters: [],
        tags: [],
        featured: false,
        isDefault: false,
        shared: false
      },
      templates: [
        {
          id: 1,
          name: 'Szybki test FFP2',
          description: 'Podstawowy test szczelności dla masek FFP2 z najważniejszymi parametrami',
          icon: '⚡',
          testType: 'LEAK_TEST',
          duration: '2-3 min',
          parametersCount: 3,
          usageCount: 127,
          tags: ['FFP2', 'Szybki', 'Podstawowy'],
          featured: true,
          isDefault: true,
          parameters: [
            { name: 'Ciśnienie testowe', value: '250', unit: 'Pa' },
            { name: 'Czas testu', value: '120', unit: 's' },
            { name: 'Próg szczelności', value: '2', unit: '%' }
          ]
        },
        {
          id: 2,
          name: 'Pełny test P3',
          description: 'Kompleksowy test dla masek przemysłowych klasy P3 zgodny z normami',
          icon: '🔬',
          testType: 'FILTRATION_TEST',
          duration: '8-10 min',
          parametersCount: 7,
          usageCount: 43,
          tags: ['P3', 'Przemysłowy', 'Norma'],
          featured: true,
          isDefault: false,
          parameters: [
            { name: 'Skuteczność filtracji', value: '99.95', unit: '%' },
            { name: 'Opór przepływu', value: '70', unit: 'Pa' },
            { name: 'Przepływ testowy', value: '95', unit: 'L/min' }
          ]
        },
        {
          id: 3,
          name: 'Test dopasowania',
          description: 'Sprawdzenie jakości dopasowania maski do konturu twarzy',
          icon: '👤',
          testType: 'FIT_TEST',
          duration: '5-7 min',
          parametersCount: 4,
          usageCount: 89,
          tags: ['Dopasowanie', 'Ergonomia'],
          featured: false,
          isDefault: false,
          parameters: [
            { name: 'Współczynnik dopasowania', value: '100', unit: '' },
            { name: 'Liczba punktów pomiarowych', value: '8', unit: '' }
          ]
        }
      ]
    }
  },
  methods: {
    createTemplate() {
      this.isEditMode = false;
      this.templateForm = {
        name: '',
        description: '',
        testType: 'LEAK_TEST',
        duration: '',
        parameters: [
          { name: '', value: '', unit: '' }
        ],
        tags: [],
        featured: false,
        isDefault: false,
        shared: false
      };
      this.showTemplateModal = true;
    },

    editTemplate(template) {
      this.isEditMode = true;
      this.templateForm = { 
        ...template,
        parameters: [...template.parameters]
      };
      this.showTemplateModal = true;
    },

    saveTemplate() {
      if (this.isEditMode) {
        const index = this.templates.findIndex(t => t.id === this.templateForm.id);
        if (index > -1) {
          this.templates[index] = { 
            ...this.templateForm,
            parametersCount: this.templateForm.parameters.length
          };
        }
      } else {
        const newTemplate = {
          ...this.templateForm,
          id: Date.now(),
          icon: this.getIconForTestType(this.templateForm.testType),
          parametersCount: this.templateForm.parameters.length,
          usageCount: 0
        };
        this.templates.push(newTemplate);
      }
      
      console.log('Template saved:', this.templateForm);
      this.closeTemplateModal();
    },

    useTemplate(template) {
      console.log('Using template:', template.name);
      template.usageCount++;
      this.$emit('template-selected', template);
    },

    cloneTemplate(template) {
      const cloned = {
        ...template,
        id: Date.now(),
        name: template.name + ' (Kopia)',
        usageCount: 0,
        isDefault: false,
        featured: false
      };
      this.templates.push(cloned);
      console.log('Template cloned:', cloned.name);
    },

    deleteTemplate(template) {
      if (confirm(this.$t('templates.confirm_delete') || 'Czy na pewno chcesz usunąć ten szablon?')) {
        this.templates = this.templates.filter(t => t.id !== template.id);
        console.log('Template deleted:', template.name);
      }
    },

    exportTemplate(template) {
      console.log('Exporting template:', template.name);
      // Implementation for export functionality
    },

    importTemplate() {
      console.log('Importing template');
      // Implementation for import functionality
    },

    addParameter() {
      this.templateForm.parameters.push({ name: '', value: '', unit: '' });
    },

    removeParameter(index) {
      this.templateForm.parameters.splice(index, 1);
    },

    addTag() {
      if (this.newTag.trim() && !this.templateForm.tags.includes(this.newTag.trim())) {
        this.templateForm.tags.push(this.newTag.trim());
        this.newTag = '';
      }
    },

    removeTag(index) {
      this.templateForm.tags.splice(index, 1);
    },

    closeTemplateModal() {
      this.showTemplateModal = false;
      this.newTag = '';
    },

    getIconForTestType(testType) {
      const icons = {
        'LEAK_TEST': '💨',
        'FILTRATION_TEST': '🔬', 
        'FIT_TEST': '👤',
        'PRESSURE_TEST': '⚡'
      };
      return icons[testType] || '🧪';
    }
  }
}
</script>

<style scoped>
.test-menu-template {
  padding: 1rem;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.template-header h2 {
  margin: 0;
  color: #2c3e50;
}

.template-actions {
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

.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.85rem; }
.btn-success { background: #28a745; color: white; }
.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-outline { background: white; border: 1px solid #007bff; color: #007bff; }

.btn:hover { transform: translateY(-1px); }

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.template-card.featured {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
}

.template-card.default {
  border-color: #28a745;
  background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
}

.template-badge {
  position: absolute;
  top: -8px;
  right: 1rem;
  background: #ffc107;
  color: #212529;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.template-badge.default {
  background: #28a745;
  color: white;
}

.template-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.template-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  text-align: center;
}

.template-info p {
  color: #6c757d;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.template-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 600;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.template-tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.template-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.btn-action {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-action:hover { background: #e9ecef; }
.btn-action.delete:hover { background: #f8d7da; }

/* Modal Styles */
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 700px;
  width: 90%;
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

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 1.5rem;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.parameters-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.parameter-item {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
}

.parameter-fields {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 0.5rem;
  align-items: center;
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.tags-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.add-tag {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.add-tag input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.settings-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  color: #495057;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* Mobile optimizations */
@media (max-width: 450px) {
  .template-header {
    flex-direction: column;
    gap: 1rem;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .template-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat {
    flex-direction: row;
    justify-content: space-between;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .parameter-fields {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .add-tag {
    flex-direction: column;
  }
}
</style>
