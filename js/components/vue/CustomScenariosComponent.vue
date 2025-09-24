<template>
  <div class="custom-scenarios">
    <div class="scenarios-header">
      <h2>🎯 {{ $t('scenarios.custom_scenarios') || 'Scenariusze niestandardowe' }}</h2>
      <div class="scenarios-actions">
        <button class="btn btn-primary" @click="createScenario">
          ➕ {{ $t('scenarios.create_new') || 'Utwórz nowy' }}
        </button>
        <button class="btn btn-info" @click="importScenario">
          📥 {{ $t('scenarios.import') || 'Importuj' }}
        </button>
      </div>
    </div>

    <!-- Scenarios Grid -->
    <div class="scenarios-grid">
      <div 
        v-for="scenario in scenarios" 
        :key="scenario.id"
        class="scenario-card"
        :class="{ active: scenario.active }"
      >
        <div class="scenario-header">
          <div class="scenario-info">
            <h3>{{ scenario.name }}</h3>
            <p>{{ scenario.description }}</p>
          </div>
          <div class="scenario-status">
            <span :class="['status-badge', scenario.status.toLowerCase()]">
              {{ scenario.status }}
            </span>
          </div>
        </div>

        <div class="scenario-details">
          <div class="detail-item">
            <span class="label">{{ $t('scenarios.test_type') || 'Typ testu' }}:</span>
            <span class="value">{{ scenario.testType }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ $t('scenarios.duration') || 'Czas trwania' }}:</span>
            <span class="value">{{ scenario.duration }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ $t('scenarios.created') || 'Utworzono' }}:</span>
            <span class="value">{{ formatDate(scenario.created) }}</span>
          </div>
        </div>

        <div class="scenario-actions">
          <button class="btn-action" @click="runScenario(scenario)" title="Uruchom">▶️</button>
          <button class="btn-action" @click="editScenario(scenario)" title="Edytuj">✏️</button>
          <button class="btn-action" @click="cloneScenario(scenario)" title="Klonuj">📋</button>
          <button class="btn-action delete" @click="deleteScenario(scenario)" title="Usuń">🗑️</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? ($t('scenarios.edit_scenario') || 'Edytuj scenariusz') : ($t('scenarios.create_scenario') || 'Utwórz scenariusz') }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>{{ $t('scenarios.name') || 'Nazwa' }}:</label>
              <input type="text" v-model="scenarioForm.name">
            </div>
            <div class="form-group">
              <label>{{ $t('scenarios.description') || 'Opis' }}:</label>
              <textarea v-model="scenarioForm.description"></textarea>
            </div>
            <div class="form-group">
              <label>{{ $t('scenarios.test_type') || 'Typ testu' }}:</label>
              <select v-model="scenarioForm.testType">
                <option value="LEAK_TEST">Test szczelności</option>
                <option value="FILTRATION_TEST">Test filtracji</option>
                <option value="FIT_TEST">Test dopasowania</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">{{ $t('common.cancel') || 'Anuluj' }}</button>
          <button class="btn btn-primary" @click="saveScenario">{{ $t('common.save') || 'Zapisz' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomScenariosComponent',
  data() {
    return {
      showModal: false,
      isEditMode: false,
      scenarioForm: {
        name: '',
        description: '',
        testType: 'LEAK_TEST'
      },
      scenarios: [
        {
          id: 1,
          name: 'Szybki test FFP2',
          description: 'Szybka weryfikacja masek FFP2 z podstawowymi parametrami',
          testType: 'LEAK_TEST',
          duration: '2 min',
          status: 'ACTIVE',
          active: true,
          created: '2025-01-20'
        },
        {
          id: 2,
          name: 'Test przemysłowy P3',
          description: 'Pełny test dla masek przemysłowych klasy P3',
          testType: 'FILTRATION_TEST',
          duration: '8 min',
          status: 'ACTIVE',
          active: true,
          created: '2025-01-19'
        }
      ]
    }
  },
  methods: {
    createScenario() {
      this.isEditMode = false;
      this.scenarioForm = { name: '', description: '', testType: 'LEAK_TEST' };
      this.showModal = true;
    },
    
    editScenario(scenario) {
      this.isEditMode = true;
      this.scenarioForm = { ...scenario };
      this.showModal = true;
    },
    
    saveScenario() {
      console.log('Saving scenario:', this.scenarioForm);
      this.closeModal();
    },
    
    runScenario(scenario) {
      console.log('Running scenario:', scenario.name);
      this.$emit('scenario-started', scenario);
    },
    
    cloneScenario(scenario) {
      const cloned = { ...scenario, id: Date.now(), name: scenario.name + ' (Kopia)' };
      this.scenarios.push(cloned);
    },
    
    deleteScenario(scenario) {
      if (confirm('Czy na pewno chcesz usunąć ten scenariusz?')) {
        this.scenarios = this.scenarios.filter(s => s.id !== scenario.id);
      }
    },
    
    importScenario() {
      console.log('Importing scenario');
    },
    
    closeModal() {
      this.showModal = false;
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('pl-PL');
    }
  }
}
</script>

<style scoped>
.custom-scenarios {
  padding: 1rem;
}

.scenarios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.scenarios-header h2 {
  margin: 0;
  color: #2c3e50;
}

.scenarios-actions {
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

.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-info { background: #17a2b8; color: white; }

.btn:hover { transform: translateY(-1px); }

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.scenario-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #e9ecef;
  transition: all 0.3s ease;
}

.scenario-card.active {
  border-left-color: #28a745;
}

.scenario-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.scenario-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.scenario-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.scenario-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.detail-item .label {
  color: #6c757d;
  font-weight: 600;
}

.detail-item .value {
  color: #2c3e50;
}

.scenario-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-action {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
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
  max-width: 500px;
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

.form-grid {
  display: grid;
  gap: 1rem;
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
  .scenarios-header {
    flex-direction: column;
    gap: 1rem;
  }

  .scenarios-grid {
    grid-template-columns: 1fr;
  }

  .scenario-header {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
