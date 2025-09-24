<template>
  <div class="system-scenarios">
    <div class="scenarios-header">
      <h2>🎬 {{ $t('scenarios.system_scenarios') || 'Scenariusze systemowe' }}</h2>
      <div class="scenarios-actions">
        <button class="btn btn-primary" @click="createScenario">
          ➕ {{ $t('scenarios.create') || 'Utwórz' }}
        </button>
        <button class="btn btn-info" @click="importScenarios">
          📥 {{ $t('scenarios.import') || 'Importuj' }}
        </button>
      </div>
    </div>

    <!-- Scenarios Overview -->
    <div class="scenarios-overview">
      <div class="overview-card">
        <h4>{{ $t('scenarios.total') || 'Łącznie' }}</h4>
        <span class="value">{{ totalScenarios }}</span>
        <small>{{ $t('scenarios.scenarios') || 'scenariuszy' }}</small>
      </div>
      <div class="overview-card success">
        <h4>{{ $t('scenarios.active') || 'Aktywne' }}</h4>
        <span class="value">{{ activeScenarios }}</span>
        <small>{{ $t('scenarios.running') || 'działających' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('scenarios.scheduled') || 'Zaplanowane' }}</h4>
        <span class="value">{{ scheduledScenarios }}</span>
        <small>{{ $t('scenarios.pending') || 'oczekujących' }}</small>
      </div>
    </div>

    <!-- Scenarios List -->
    <div class="scenarios-list">
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
            <span class="label">{{ $t('scenarios.trigger') || 'Wyzwalacz' }}:</span>
            <span class="value">{{ scenario.trigger }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ $t('scenarios.actions') || 'Akcje' }}:</span>
            <span class="value">{{ scenario.actions.length }} {{ $t('scenarios.actions') || 'akcji' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ $t('scenarios.last_run') || 'Ostatnie uruchomienie' }}:</span>
            <span class="value">{{ scenario.lastRun ? formatDateTime(scenario.lastRun) : 'Nigdy' }}</span>
          </div>
        </div>

        <div class="scenario-actions">
          <button class="btn-action" @click="runScenario(scenario)" :disabled="!scenario.active" title="Uruchom">▶️</button>
          <button class="btn-action" @click="editScenario(scenario)" title="Edytuj">✏️</button>
          <button class="btn-action toggle" @click="toggleScenario(scenario)" :title="scenario.active ? 'Wyłącz' : 'Włącz'">
            {{ scenario.active ? '⏸️' : '▶️' }}
          </button>
          <button class="btn-action delete" @click="deleteScenario(scenario)" title="Usuń">🗑️</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edytuj scenariusz' : 'Nowy scenariusz' }}</h3>
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
              <label>{{ $t('scenarios.trigger') || 'Wyzwalacz' }}:</label>
              <select v-model="scenarioForm.trigger">
                <option value="MANUAL">Ręczne uruchomienie</option>
                <option value="SCHEDULE">Harmonogram</option>
                <option value="EVENT">Zdarzenie systemowe</option>
                <option value="ERROR">Błąd systemu</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Anuluj</button>
          <button class="btn btn-primary" @click="saveScenario">Zapisz</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemScenariosComponent',
  data() {
    return {
      showModal: false,
      isEditMode: false,
      scenarioForm: {
        name: '',
        description: '',
        trigger: 'MANUAL',
        actions: []
      },
      scenarios: [
        {
          id: 1,
          name: 'Automatyczna kopia zapasowa',
          description: 'Codzienne tworzenie kopii zapasowej danych testowych',
          trigger: 'SCHEDULE',
          status: 'ACTIVE',
          active: true,
          actions: [
            { type: 'BACKUP', target: 'test_data' },
            { type: 'NOTIFY', message: 'Backup completed' }
          ],
          lastRun: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          name: 'Reakcja na błąd krytyczny',
          description: 'Automatyczne działania po wystąpieniu błędu krytycznego',
          trigger: 'ERROR',
          status: 'ACTIVE',
          active: true,
          actions: [
            { type: 'ALERT', level: 'CRITICAL' },
            { type: 'SHUTDOWN', component: 'test_system' }
          ],
          lastRun: null
        }
      ]
    }
  },
  computed: {
    totalScenarios() {
      return this.scenarios.length;
    },
    activeScenarios() {
      return this.scenarios.filter(s => s.active).length;
    },
    scheduledScenarios() {
      return this.scenarios.filter(s => s.trigger === 'SCHEDULE').length;
    }
  },
  methods: {
    createScenario() {
      this.isEditMode = false;
      this.scenarioForm = { name: '', description: '', trigger: 'MANUAL', actions: [] };
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
      scenario.lastRun = new Date().toISOString();
    },
    toggleScenario(scenario) {
      scenario.active = !scenario.active;
      scenario.status = scenario.active ? 'ACTIVE' : 'INACTIVE';
    },
    deleteScenario(scenario) {
      if (confirm('Czy na pewno chcesz usunąć ten scenariusz?')) {
        this.scenarios = this.scenarios.filter(s => s.id !== scenario.id);
      }
    },
    importScenarios() {
      console.log('Importing scenarios');
    },
    closeModal() {
      this.showModal = false;
    },
    formatDateTime(dateStr) {
      return new Date(dateStr).toLocaleString('pl-PL');
    }
  }
}
</script>

<style scoped>
.system-scenarios {
  padding: 1rem;
}

.scenarios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

.scenarios-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.overview-card.success { border-left-color: #28a745; }
.overview-card.warning { border-left-color: #ffc107; }

.overview-card .value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.scenarios-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.scenario-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #6c757d;
}

.scenario-card.active {
  border-left-color: #28a745;
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

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.scenario-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action:hover:not(:disabled) { background: #e9ecef; }
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

  .scenarios-overview {
    grid-template-columns: 1fr;
  }

  .scenario-header {
    flex-direction: column;
    gap: 1rem;
  }

  .scenario-details {
    gap: 0.25rem;
  }

  .detail-item {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
