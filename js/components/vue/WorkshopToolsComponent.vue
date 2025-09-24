<template>
  <div class="workshop-tools">
    <div class="tools-header">
      <h2>🔨 {{ $t('workshop.calibration_tools') || 'Narzędzia kalibracyjne' }}</h2>
      <div class="tools-actions">
        <button class="btn btn-primary" @click="addNewTool">
          ➕ {{ $t('workshop.add_tool') || 'Dodaj narzędzie' }}
        </button>
        <button class="btn btn-warning" @click="scheduleCalibration">
          📅 {{ $t('workshop.schedule_calibration') || 'Zaplanuj kalibrację' }}
        </button>
        <button class="btn btn-info" @click="generateCalibrationReport">
          📊 {{ $t('workshop.calibration_report') || 'Raport kalibracji' }}
        </button>
      </div>
    </div>

    <!-- Tools Overview -->
    <div class="tools-overview">
      <div class="overview-card">
        <h4>{{ $t('workshop.total_tools') || 'Łączna liczba' }}</h4>
        <span class="value">{{ totalToolsCount }}</span>
        <small>{{ $t('workshop.tools') || 'narzędzi' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('workshop.due_calibration') || 'Wymagają kalibracji' }}</h4>
        <span class="value">{{ dueCalibrationCount }}</span>
        <small>{{ $t('workshop.tools') || 'narzędzi' }}</small>
      </div>
      <div class="overview-card danger">
        <h4>{{ $t('workshop.overdue') || 'Przeterminowane' }}</h4>
        <span class="value">{{ overdueCount }}</span>
        <small>{{ $t('workshop.critical') || 'krytyczne' }}</small>
      </div>
      <div class="overview-card info">
        <h4>{{ $t('workshop.calibrated_this_month') || 'Skalibrowane w tym miesiącu' }}</h4>
        <span class="value">{{ calibratedThisMonthCount }}</span>
        <small>{{ $t('workshop.tools') || 'narzędzi' }}</small>
      </div>
    </div>

    <!-- Tools Filters -->
    <div class="tools-filters">
      <div class="filter-group">
        <label>{{ $t('workshop.category') || 'Kategoria' }}:</label>
        <select v-model="selectedCategory" @change="filterTools">
          <option value="ALL">{{ $t('workshop.all_categories') || 'Wszystkie' }}</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>{{ $t('workshop.status') || 'Status' }}:</label>
        <select v-model="selectedStatus" @change="filterTools">
          <option value="ALL">{{ $t('workshop.all_statuses') || 'Wszystkie' }}</option>
          <option value="CALIBRATED">{{ $t('workshop.calibrated') || 'Skalibrowane' }}</option>
          <option value="DUE">{{ $t('workshop.due') || 'Do kalibracji' }}</option>
          <option value="OVERDUE">{{ $t('workshop.overdue') || 'Przeterminowane' }}</option>
          <option value="OUT_OF_SERVICE">{{ $t('workshop.out_of_service') || 'Poza serwisem' }}</option>
        </select>
      </div>

      <div class="filter-group">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="filterTools"
          :placeholder="$t('workshop.search_tools') || 'Szukaj narzędzi...'"
          class="search-input"
        >
      </div>
    </div>

    <!-- Tools Grid -->
    <div class="tools-grid">
      <div 
        v-for="tool in filteredTools" 
        :key="tool.id"
        class="tool-card"
        :class="getToolCardClass(tool)"
        @click="viewTool(tool)"
      >
        <div class="tool-header">
          <div class="tool-id">{{ tool.id }}</div>
          <div class="calibration-status" :class="getCalibrationStatusClass(tool)">
            {{ getCalibrationStatus(tool) }}
          </div>
        </div>
        
        <div class="tool-image">
          <img v-if="tool.image" :src="tool.image" :alt="tool.name" />
          <div v-else class="no-image">{{ getToolIcon(tool.category) }}</div>
        </div>
        
        <div class="tool-info">
          <h3 class="tool-name">{{ tool.name }}</h3>
          <p class="tool-description">{{ tool.description }}</p>
          
          <div class="tool-details">
            <div class="detail-item">
              <span class="label">{{ $t('workshop.category') || 'Kategoria' }}:</span>
              <span class="value">{{ tool.category }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('workshop.serial_number') || 'Numer seryjny' }}:</span>
              <span class="value">{{ tool.serialNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('workshop.last_calibration') || 'Ostatnia kalibracja' }}:</span>
              <span class="value">{{ formatDate(tool.lastCalibration) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('workshop.next_calibration') || 'Następna kalibracja' }}:</span>
              <span class="value" :class="{ 'overdue': isOverdue(tool.nextCalibration), 'due-soon': isDueSoon(tool.nextCalibration) }">
                {{ formatDate(tool.nextCalibration) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('workshop.accuracy') || 'Dokładność' }}:</span>
              <span class="value">{{ tool.accuracy }}</span>
            </div>
          </div>
        </div>
        
        <div class="tool-actions">
          <button class="btn-action" @click.stop="editTool(tool)" title="Edytuj">✏️</button>
          <button class="btn-action calibrate" @click.stop="calibrateTool(tool)" title="Kalibruj">🔧</button>
          <button class="btn-action" @click.stop="viewCalibrationHistory(tool)" title="Historia">📈</button>
        </div>
      </div>
    </div>

    <!-- Tool Details Modal -->
    <div v-if="showToolModal" class="modal-overlay" @click="closeToolModal">
      <div class="modal-content tool-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTool?.name || 'Szczegóły narzędzia' }}</h3>
          <button class="close-btn" @click="closeToolModal">×</button>
        </div>
        <div class="modal-body">
          <div class="tool-details-full">
            <div class="detail-section">
              <h4>{{ $t('workshop.basic_info') || 'Informacje podstawowe' }}</h4>
              <div class="detail-grid">
                <div class="detail-row">
                  <label>{{ $t('workshop.tool_id') || 'ID narzędzia' }}:</label>
                  <span>{{ modalTool?.id }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.name') || 'Nazwa' }}:</label>
                  <span>{{ modalTool?.name }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.manufacturer') || 'Producent' }}:</label>
                  <span>{{ modalTool?.manufacturer }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.model') || 'Model' }}:</label>
                  <span>{{ modalTool?.model }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.serial_number') || 'Numer seryjny' }}:</label>
                  <span>{{ modalTool?.serialNumber }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>{{ $t('workshop.calibration_info') || 'Informacje o kalibracji' }}</h4>
              <div class="detail-grid">
                <div class="detail-row">
                  <label>{{ $t('workshop.calibration_interval') || 'Interwał kalibracji' }}:</label>
                  <span>{{ modalTool?.calibrationInterval }} {{ $t('workshop.months') || 'miesięcy' }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.last_calibration') || 'Ostatnia kalibracja' }}:</label>
                  <span>{{ formatDate(modalTool?.lastCalibration) }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.next_calibration') || 'Następna kalibracja' }}:</label>
                  <span :class="{ 'overdue': isOverdue(modalTool?.nextCalibration) }">
                    {{ formatDate(modalTool?.nextCalibration) }}
                  </span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.calibration_laboratory') || 'Laboratorium' }}:</label>
                  <span>{{ modalTool?.calibrationLab }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.certificate_number') || 'Numer certyfikatu' }}:</label>
                  <span>{{ modalTool?.certificateNumber }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>{{ $t('workshop.technical_specs') || 'Specyfikacja techniczna' }}</h4>
              <div class="detail-grid">
                <div class="detail-row">
                  <label>{{ $t('workshop.measurement_range') || 'Zakres pomiarowy' }}:</label>
                  <span>{{ modalTool?.measurementRange }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.accuracy') || 'Dokładność' }}:</label>
                  <span>{{ modalTool?.accuracy }}</span>
                </div>
                <div class="detail-row">
                  <label>{{ $t('workshop.resolution') || 'Rozdzielczość' }}:</label>
                  <span>{{ modalTool?.resolution }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeToolModal">
            {{ $t('common.close') || 'Zamknij' }}
          </button>
          <button class="btn btn-warning" @click="calibrateTool(modalTool)">
            {{ $t('workshop.calibrate') || 'Kalibruj' }}
          </button>
          <button class="btn btn-primary" @click="editTool(modalTool)">
            {{ $t('workshop.edit') || 'Edytuj' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkshopToolsComponent',
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedCategory: 'ALL',
      selectedStatus: 'ALL',
      searchQuery: '',
      showToolModal: false,
      modalTool: null,
      calibrationTools: [
        {
          id: 'CT001',
          name: 'Miernik ciśnienia różnicowego',
          description: 'Precyzyjny miernik do kalibracji czujników ciśnienia',
          category: 'Mierniki ciśnienia',
          manufacturer: 'Fluke Corporation',
          model: 'PPC4E',
          serialNumber: 'PPC4E-2023-001',
          lastCalibration: '2024-11-15',
          nextCalibration: '2025-11-15',
          calibrationInterval: 12,
          calibrationLab: 'MetroLab Sp. z o.o.',
          certificateNumber: 'CAL-2024-11-001',
          measurementRange: '0-10000 Pa',
          accuracy: '±0.025% FS',
          resolution: '0.1 Pa',
          image: null
        },
        {
          id: 'CT002',
          name: 'Generator przepływu powietrza',
          description: 'Wzorcowy generator przepływu do kalibracji przepływomierzy',
          category: 'Generatory przepływu',
          manufacturer: 'TSI Instruments',
          model: 'FlowGen 5000',
          serialNumber: 'FG5000-2022-045',
          lastCalibration: '2024-08-20',
          nextCalibration: '2025-02-20',
          calibrationInterval: 6,
          calibrationLab: 'COBRABID Sp. z o.o.',
          certificateNumber: 'CAL-2024-08-155',
          measurementRange: '0.1-1000 L/min',
          accuracy: '±0.5% rdg',
          resolution: '0.01 L/min',
          image: null
        },
        {
          id: 'CT003',
          name: 'Multimetr cyfrowy',
          description: 'Wielofunkcyjny miernik elektryczny',
          category: 'Mierniki elektryczne',
          manufacturer: 'Keysight Technologies',
          model: '34461A',
          serialNumber: 'KS34461A-2023-789',
          lastCalibration: '2024-06-10',
          nextCalibration: '2025-01-20',
          calibrationInterval: 12,
          calibrationLab: 'ElektroKal Warszawa',
          certificateNumber: 'CAL-2024-06-089',
          measurementRange: '0-1000V DC/AC',
          accuracy: '±0.003% rdg',
          resolution: '0.1 mV',
          image: null
        }
      ]
    }
  },
  computed: {
    filteredTools() {
      let tools = [...this.calibrationTools];
      
      if (this.selectedCategory !== 'ALL') {
        tools = tools.filter(tool => tool.category === this.selectedCategory);
      }
      
      if (this.selectedStatus !== 'ALL') {
        tools = tools.filter(tool => {
          const status = this.getToolStatus(tool);
          return status === this.selectedStatus;
        });
      }
      
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        tools = tools.filter(tool => 
          tool.name.toLowerCase().includes(query) ||
          tool.id.toLowerCase().includes(query) ||
          tool.manufacturer.toLowerCase().includes(query) ||
          tool.model.toLowerCase().includes(query)
        );
      }
      
      return tools;
    },
    
    categories() {
      return [...new Set(this.calibrationTools.map(tool => tool.category))];
    },
    
    totalToolsCount() {
      return this.calibrationTools.length;
    },
    
    dueCalibrationCount() {
      return this.calibrationTools.filter(tool => this.isDueSoon(tool.nextCalibration)).length;
    },
    
    overdueCount() {
      return this.calibrationTools.filter(tool => this.isOverdue(tool.nextCalibration)).length;
    },
    
    calibratedThisMonthCount() {
      const thisMonth = new Date().toISOString().slice(0, 7);
      return this.calibrationTools.filter(tool => 
        tool.lastCalibration && tool.lastCalibration.startsWith(thisMonth)
      ).length;
    }
  },
  methods: {
    filterTools() {
      // Filtering handled by computed property
    },
    
    getToolCardClass(tool) {
      if (this.isOverdue(tool.nextCalibration)) return 'overdue';
      if (this.isDueSoon(tool.nextCalibration)) return 'due-soon';
      return '';
    },
    
    getCalibrationStatusClass(tool) {
      if (this.isOverdue(tool.nextCalibration)) return 'overdue';
      if (this.isDueSoon(tool.nextCalibration)) return 'due-soon';
      return 'calibrated';
    },
    
    getCalibrationStatus(tool) {
      if (this.isOverdue(tool.nextCalibration)) return 'Przeterminowane';
      if (this.isDueSoon(tool.nextCalibration)) return 'Do kalibracji';
      return 'Skalibrowane';
    },
    
    getToolStatus(tool) {
      if (this.isOverdue(tool.nextCalibration)) return 'OVERDUE';
      if (this.isDueSoon(tool.nextCalibration)) return 'DUE';
      return 'CALIBRATED';
    },
    
    getToolIcon(category) {
      const icons = {
        'Mierniki ciśnienia': '📊',
        'Generatory przepływu': '🌪️',
        'Mierniki elektryczne': '⚡',
        'Wagi wzorcowe': '⚖️',
        'Termometry': '🌡️',
        'Default': '🔧'
      };
      return icons[category] || icons.Default;
    },
    
    isOverdue(dateStr) {
      return new Date(dateStr) < new Date();
    },
    
    isDueSoon(dateStr) {
      const nextDate = new Date(dateStr);
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      return nextDate >= today && nextDate <= thirtyDaysFromNow;
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('pl-PL');
    },
    
    viewTool(tool) {
      this.modalTool = tool;
      this.showToolModal = true;
    },
    
    editTool(tool) {
      console.log('Editing tool:', tool.id);
      this.closeToolModal();
    },
    
    calibrateTool(tool) {
      console.log('Starting calibration for tool:', tool.id);
      this.closeToolModal();
    },
    
    viewCalibrationHistory(tool) {
      console.log('Viewing calibration history for tool:', tool.id);
    },
    
    addNewTool() {
      console.log('Adding new calibration tool');
    },
    
    scheduleCalibration() {
      console.log('Scheduling calibration');
    },
    
    generateCalibrationReport() {
      console.log('Generating calibration report');
    },
    
    closeToolModal() {
      this.showToolModal = false;
      this.modalTool = null;
    }
  }
}
</script>

<style scoped>
.workshop-tools {
  padding: 1rem;
}

.tools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tools-header h2 {
  margin: 0;
  color: #2c3e50;
}

.tools-actions {
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
.btn-warning { background: #ffc107; color: #212529; }
.btn-info { background: #17a2b8; color: white; }
.btn-secondary { background: #6c757d; color: white; }

.btn:hover { transform: translateY(-1px); }

.tools-overview {
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

.overview-card.warning { border-left-color: #ffc107; }
.overview-card.danger { border-left-color: #dc3545; }
.overview-card.info { border-left-color: #17a2b8; }

.overview-card .value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.tools-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group select,
.search-input {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.tool-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
  cursor: pointer;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.tool-card.overdue {
  border-left: 4px solid #dc3545;
}

.tool-card.due-soon {
  border-left: 4px solid #ffc107;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.tool-id {
  font-weight: bold;
  color: #6c757d;
}

.calibration-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.calibration-status.calibrated { background: #d4edda; color: #155724; }
.calibration-status.due-soon { background: #fff3cd; color: #856404; }
.calibration-status.overdue { background: #f8d7da; color: #721c24; }

.tool-image {
  text-align: center;
  margin-bottom: 1rem;
}

.no-image {
  font-size: 3rem;
  color: #dee2e6;
}

.tool-name {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.tool-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.tool-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.detail-item .label {
  color: #6c757d;
}

.detail-item .value {
  font-weight: 600;
}

.overdue {
  color: #dc3545;
  font-weight: bold;
}

.due-soon {
  color: #ffc107;
  font-weight: bold;
}

.tool-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.btn-action {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #e9ecef;
}

.btn-action.calibrate:hover {
  background: #fff3cd;
  border-color: #ffc107;
}

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

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-row label {
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
  .tools-header {
    flex-direction: column;
    gap: 1rem;
  }

  .tools-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .tools-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .tools-filters {
    flex-direction: column;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
