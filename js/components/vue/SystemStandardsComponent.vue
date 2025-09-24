<template>
  <div class="system-standards">
    <div class="standards-header">
      <h2>📏 {{ $t('standards.system_standards') || 'Standardy systemowe' }}</h2>
      <div class="standards-actions">
        <button class="btn btn-primary" @click="addStandard">
          ➕ {{ $t('standards.add_standard') || 'Dodaj standard' }}
        </button>
        <button class="btn btn-info" @click="validateAllStandards">
          ✓ {{ $t('standards.validate_all') || 'Waliduj wszystkie' }}
        </button>
      </div>
    </div>

    <!-- Standards Overview -->
    <div class="standards-overview">
      <div class="overview-card">
        <h4>{{ $t('standards.total_standards') || 'Łączne standardy' }}</h4>
        <span class="value">{{ totalStandards }}</span>
        <small>{{ $t('standards.configured') || 'skonfigurowanych' }}</small>
      </div>
      <div class="overview-card success">
        <h4>{{ $t('standards.compliant') || 'Zgodne' }}</h4>
        <span class="value">{{ compliantStandards }}</span>
        <small>{{ $t('standards.passing') || 'spełniających wymagania' }}</small>
      </div>
      <div class="overview-card warning">
        <h4>{{ $t('standards.non_compliant') || 'Niezgodne' }}</h4>
        <span class="value">{{ nonCompliantStandards }}</span>
        <small>{{ $t('standards.failing') || 'niespełniających' }}</small>
      </div>
      <div class="overview-card info">
        <h4>{{ $t('standards.last_audit') || 'Ostatni audyt' }}</h4>
        <span class="value">{{ formatDate(lastAuditDate) }}</span>
        <small>{{ $t('standards.audit_date') || 'data audytu' }}</small>
      </div>
    </div>

    <!-- Standards Categories -->
    <div class="standards-categories">
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['tab-btn', { active: activeCategory === category.id }]"
          @click="setActiveCategory(category.id)"
        >
          {{ category.icon }} {{ $t(category.nameKey) || category.name }}
        </button>
      </div>

      <!-- Safety Standards -->
      <div v-if="activeCategory === 'safety'" class="standards-section">
        <h3>{{ $t('standards.safety_standards') || 'Standardy bezpieczeństwa' }}</h3>
        <div class="standards-grid">
          <div 
            v-for="standard in safetyStandards" 
            :key="standard.id"
            class="standard-card"
            :class="getComplianceClass(standard.compliance)"
          >
            <div class="standard-icon">{{ standard.icon }}</div>
            <div class="standard-info">
              <h4>{{ standard.name }}</h4>
              <p>{{ standard.description }}</p>
              <div class="standard-details">
                <span class="detail">{{ $t('standards.version') || 'Wersja' }}: {{ standard.version }}</span>
                <span class="detail">{{ $t('standards.authority') || 'Organ' }}: {{ standard.authority }}</span>
                <span class="detail">{{ $t('standards.effective_date') || 'Data wejścia' }}: {{ formatDate(standard.effectiveDate) }}</span>
              </div>
            </div>
            <div class="standard-compliance">
              <span :class="['compliance-badge', standard.compliance.toLowerCase()]">
                {{ getComplianceIcon(standard.compliance) }} {{ $t(`standards.${standard.compliance.toLowerCase()}`) || standard.compliance }}
              </span>
            </div>
            <div class="standard-actions">
              <button class="btn-action" @click="viewStandard(standard)" title="Podgląd">👁️</button>
              <button class="btn-action" @click="validateStandard(standard)" title="Waliduj">✓</button>
              <button class="btn-action" @click="configureStandard(standard)" title="Konfiguruj">⚙️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quality Standards -->
      <div v-if="activeCategory === 'quality'" class="standards-section">
        <h3>{{ $t('standards.quality_standards') || 'Standardy jakości' }}</h3>
        <div class="standards-grid">
          <div 
            v-for="standard in qualityStandards" 
            :key="standard.id"
            class="standard-card"
            :class="getComplianceClass(standard.compliance)"
          >
            <div class="standard-icon">{{ standard.icon }}</div>
            <div class="standard-info">
              <h4>{{ standard.name }}</h4>
              <p>{{ standard.description }}</p>
              <div class="standard-details">
                <span class="detail">{{ $t('standards.version') || 'Wersja' }}: {{ standard.version }}</span>
                <span class="detail">{{ $t('standards.authority') || 'Organ' }}: {{ standard.authority }}</span>
              </div>
            </div>
            <div class="standard-compliance">
              <span :class="['compliance-badge', standard.compliance.toLowerCase()]">
                {{ getComplianceIcon(standard.compliance) }} {{ standard.compliance }}
              </span>
            </div>
            <div class="standard-actions">
              <button class="btn-action" @click="viewStandard(standard)" title="Podgląd">👁️</button>
              <button class="btn-action" @click="validateStandard(standard)" title="Waliduj">✓</button>
              <button class="btn-action" @click="configureStandard(standard)" title="Konfiguruj">⚙️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Testing Standards -->
      <div v-if="activeCategory === 'testing'" class="standards-section">
        <h3>{{ $t('standards.testing_standards') || 'Standardy testowania' }}</h3>
        <div class="standards-grid">
          <div 
            v-for="standard in testingStandards" 
            :key="standard.id"
            class="standard-card"
            :class="getComplianceClass(standard.compliance)"
          >
            <div class="standard-icon">{{ standard.icon }}</div>
            <div class="standard-info">
              <h4>{{ standard.name }}</h4>
              <p>{{ standard.description }}</p>
              <div class="standard-details">
                <span class="detail">{{ $t('standards.version') || 'Wersja' }}: {{ standard.version }}</span>
                <span class="detail">{{ $t('standards.authority') || 'Organ' }}: {{ standard.authority }}</span>
              </div>
            </div>
            <div class="standard-compliance">
              <span :class="['compliance-badge', standard.compliance.toLowerCase()]">
                {{ getComplianceIcon(standard.compliance) }} {{ standard.compliance }}
              </span>
            </div>
            <div class="standard-actions">
              <button class="btn-action" @click="viewStandard(standard)" title="Podgląd">👁️</button>
              <button class="btn-action" @click="validateStandard(standard)" title="Waliduj">✓</button>
              <button class="btn-action" @click="configureStandard(standard)" title="Konfiguruj">⚙️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Standard Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content standard-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedStandard?.name || 'Szczegóły standardu' }}</h3>
          <button class="close-btn" @click="closeViewModal">×</button>
        </div>
        <div class="modal-body">
          <div class="standard-details-full" v-if="selectedStandard">
            <div class="detail-section">
              <h4>{{ $t('standards.basic_info') || 'Informacje podstawowe' }}</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">{{ $t('standards.standard_id') || 'ID standardu' }}:</span>
                  <span class="value">{{ selectedStandard.id }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">{{ $t('standards.version') || 'Wersja' }}:</span>
                  <span class="value">{{ selectedStandard.version }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">{{ $t('standards.authority') || 'Organ wydający' }}:</span>
                  <span class="value">{{ selectedStandard.authority }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">{{ $t('standards.compliance') || 'Zgodność' }}:</span>
                  <span class="value">
                    <span :class="['compliance-badge', selectedStandard.compliance.toLowerCase()]">
                      {{ getComplianceIcon(selectedStandard.compliance) }} {{ selectedStandard.compliance }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeViewModal">{{ $t('common.close') || 'Zamknij' }}</button>
          <button class="btn btn-primary" @click="validateStandard(selectedStandard)">{{ $t('standards.validate') || 'Waliduj' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemStandardsComponent',
  data() {
    return {
      activeCategory: 'safety',
      showViewModal: false,
      selectedStandard: null,
      categories: [
        { id: 'safety', nameKey: 'standards.safety', name: 'Bezpieczeństwo', icon: '🛡️' },
        { id: 'quality', nameKey: 'standards.quality', name: 'Jakość', icon: '⭐' },
        { id: 'testing', nameKey: 'standards.testing', name: 'Testowanie', icon: '🧪' }
      ],
      safetyStandards: [
        {
          id: 'EN149',
          name: 'EN 149:2001+A1:2009',
          description: 'Respiratory protective devices - Filtering half masks',
          icon: '🦺',
          version: '2009',
          authority: 'CEN',
          effectiveDate: '2009-08-01',
          compliance: 'COMPLIANT'
        },
        {
          id: 'EN143',
          name: 'EN 143:2021',
          description: 'Respiratory protective devices - Particle filters',
          icon: '🔒',
          version: '2021',
          authority: 'CEN',
          effectiveDate: '2021-03-01',
          compliance: 'PENDING'
        }
      ],
      qualityStandards: [
        {
          id: 'ISO9001',
          name: 'ISO 9001:2015',
          description: 'Quality management systems - Requirements',
          icon: '📋',
          version: '2015',
          authority: 'ISO',
          effectiveDate: '2015-09-15',
          compliance: 'COMPLIANT'
        }
      ],
      testingStandards: [
        {
          id: 'ISO17025',
          name: 'ISO/IEC 17025:2017',
          description: 'General requirements for testing and calibration laboratories',
          icon: '⚗️',
          version: '2017',
          authority: 'ISO/IEC',
          effectiveDate: '2017-11-01',
          compliance: 'COMPLIANT'
        }
      ],
      lastAuditDate: '2025-01-15'
    }
  },
  computed: {
    totalStandards() {
      return this.safetyStandards.length + this.qualityStandards.length + this.testingStandards.length;
    },
    compliantStandards() {
      const allStandards = [...this.safetyStandards, ...this.qualityStandards, ...this.testingStandards];
      return allStandards.filter(s => s.compliance === 'COMPLIANT').length;
    },
    nonCompliantStandards() {
      const allStandards = [...this.safetyStandards, ...this.qualityStandards, ...this.testingStandards];
      return allStandards.filter(s => s.compliance === 'NON_COMPLIANT').length;
    }
  },
  methods: {
    setActiveCategory(categoryId) {
      this.activeCategory = categoryId;
    },
    getComplianceClass(compliance) {
      return {
        'compliant': compliance === 'COMPLIANT',
        'non-compliant': compliance === 'NON_COMPLIANT',
        'pending': compliance === 'PENDING'
      };
    },
    getComplianceIcon(compliance) {
      const icons = {
        'COMPLIANT': '✅',
        'NON_COMPLIANT': '❌',
        'PENDING': '⏳'
      };
      return icons[compliance] || '❓';
    },
    viewStandard(standard) {
      this.selectedStandard = standard;
      this.showViewModal = true;
    },
    validateStandard(standard) {
      console.log('Validating standard:', standard.name);
      standard.compliance = 'PENDING';
      setTimeout(() => {
        standard.compliance = Math.random() > 0.8 ? 'NON_COMPLIANT' : 'COMPLIANT';
      }, 2000);
    },
    configureStandard(standard) {
      console.log('Configuring standard:', standard.name);
    },
    addStandard() {
      console.log('Adding new standard');
    },
    validateAllStandards() {
      console.log('Validating all standards');
      const allStandards = [...this.safetyStandards, ...this.qualityStandards, ...this.testingStandards];
      allStandards.forEach(standard => this.validateStandard(standard));
    },
    closeViewModal() {
      this.showViewModal = false;
      this.selectedStandard = null;
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('pl-PL');
    }
  }
}
</script>

<style scoped>
.system-standards {
  padding: 1rem;
}

.standards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.standards-header h2 {
  margin: 0;
  color: #2c3e50;
}

.standards-actions {
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

.standards-overview {
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
.overview-card.info { border-left-color: #17a2b8; }

.overview-card .value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.category-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6c757d;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  font-weight: 600;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-btn:hover {
  color: #007bff;
}

.standards-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.standard-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #6c757d;
  transition: all 0.3s ease;
}

.standard-card.compliant {
  border-left-color: #28a745;
}

.standard-card.non-compliant {
  border-left-color: #dc3545;
}

.standard-card.pending {
  border-left-color: #ffc107;
}

.standard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.standard-icon {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.standard-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.standard-info p {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.standard-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.detail {
  font-size: 0.8rem;
  color: #6c757d;
}

.standard-compliance {
  margin-bottom: 1rem;
}

.compliance-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.compliance-badge.compliant {
  background: #d4edda;
  color: #155724;
}

.compliance-badge.non_compliant {
  background: #f8d7da;
  color: #721c24;
}

.compliance-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.standard-actions {
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
  max-width: 600px;
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

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.detail-item .label {
  font-weight: 600;
  color: #495057;
}

.detail-item .value {
  color: #2c3e50;
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
  .standards-header {
    flex-direction: column;
    gap: 1rem;
  }

  .standards-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-tabs {
    flex-direction: column;
  }

  .standards-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
