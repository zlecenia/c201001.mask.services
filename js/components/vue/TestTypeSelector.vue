<template>
  <div class="test-type-selector">
    <h3>{{ $t(TRANSLATION_KEYS.selectTestType) || 'Wybierz typ testu' }}</h3>
    <div class="test-types-grid">
      <div 
        v-for="testType in availableTestTypes" 
        :key="testType.id"
        :class="['test-type-card', { selected: selectedType === testType.id }]"
        @click="selectType(testType.id)"
      >
        <div class="test-type-icon">{{ testType.icon }}</div>
        <div class="test-type-name">{{ $t(testType.nameKey) || testType.name }}</div>
        <div class="test-type-description">{{ $t(testType.descKey) || testType.description }}</div>
        <div class="test-type-duration">⏱️ {{ testType.estimatedDuration }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestTypeSelector',
  props: {
    selectedType: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Grid configuration
      GRID_MIN_COLUMN_WIDTH: 280, // px
      CARD_HOVER_TRANSFORM: 2, // px
      
      // Animation timing
      SELECTION_ANIMATION_DURATION: 200, // ms
      HOVER_ANIMATION_DURATION: 150, // ms
      
      // Touch configuration (for 400x1280 display)
      TOUCH_TARGET_MIN_SIZE: 44, // px
      CARD_MIN_HEIGHT: 180, // px
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        selectTestType: 'wizard.select_test_type',
        
        // Test types
        leakTest: 'tests.leak_test',
        leakTestDesc: 'tests.leak_test_desc',
        filtrationTest: 'tests.filtration_test', 
        filtrationTestDesc: 'tests.filtration_test_desc',
        pressureTest: 'tests.pressure_test',
        pressureTestDesc: 'tests.pressure_test_desc',
        flowTest: 'tests.flow_test',
        flowTestDesc: 'tests.flow_test_desc',
        
        // Common
        estimatedTime: 'wizard.estimated_time'
      },
      
      // Available test types configuration
      availableTestTypes: [
        {
          id: 'leak_test',
          nameKey: 'tests.leak_test',
          name: 'Test szczelności',
          descKey: 'tests.leak_test_desc',
          description: 'Sprawdzenie szczelności maski przeciwgazowej',
          icon: '💨',
          estimatedDuration: '3-5 min'
        },
        {
          id: 'filtration_test',
          nameKey: 'tests.filtration_test',
          name: 'Test filtracji',
          descKey: 'tests.filtration_test_desc',
          description: 'Ocena skuteczności filtracji powietrza',
          icon: '🌪️',
          estimatedDuration: '5-8 min'
        },
        {
          id: 'pressure_test',
          nameKey: 'tests.pressure_test',
          name: 'Test ciśnieniowy',
          descKey: 'tests.pressure_test_desc',
          description: 'Pomiar odporności na ciśnienie',
          icon: '⚡',
          estimatedDuration: '2-4 min'
        },
        {
          id: 'flow_test',
          nameKey: 'tests.flow_test',
          name: 'Test przepływu',
          descKey: 'tests.flow_test_desc',
          description: 'Analiza przepływu powietrza przez filtr',
          icon: '🌊',
          estimatedDuration: '4-6 min'
        }
      ]
    }
  },
  methods: {
    selectType(typeId) {
      this.$emit('type-selected', typeId);
    },
    
    getTestTypeById(id) {
      return this.availableTestTypes.find(type => type.id === id);
    }
  }
}
</script>

<style scoped>
.test-type-selector h3 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  text-align: center;
  font-size: 1.5rem;
}

.test-types-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  justify-items: center;
}

.test-type-card {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  background: white;
  width: 100%;
  max-width: 320px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.test-type-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,123,255,0.2);
}

.test-type-card.selected {
  border-color: #007bff;
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  box-shadow: 0 4px 16px rgba(0,123,255,0.3);
}

.test-type-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.test-type-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.test-type-description {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.test-type-duration {
  color: #28a745;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  background: rgba(40, 167, 69, 0.1);
  border-radius: 4px;
  align-self: center;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .test-types-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .test-type-card {
    padding: 1.5rem 1rem;
    max-width: none;
    min-height: 160px;
  }
  
  .test-type-selector h3 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  
  .test-type-icon {
    font-size: 2.5rem;
  }
  
  .test-type-name {
    font-size: 1rem;
  }
  
  .test-type-description {
    font-size: 0.85rem;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .test-type-card {
    padding: 1rem;
    min-height: 140px;
  }
  
  .test-type-icon {
    font-size: 2rem;
  }
  
  .test-type-name {
    font-size: 0.95rem;
  }
  
  .test-type-description {
    font-size: 0.8rem;
  }
}

/* Touch-friendly enhancements */
.test-type-card {
  min-height: 44px; /* Touch target minimum */
}

.test-type-card:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .test-type-card {
    border-width: 3px;
  }
  
  .test-type-card.selected {
    border-width: 4px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .test-type-card {
    transition: none;
  }
  
  .test-type-card:hover {
    transform: none;
  }
}

/* Animation for card selection */
.test-type-card.selected {
  animation: selectPulse 0.3s ease-out;
}

@keyframes selectPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Focus styles for accessibility */
.test-type-card:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Loading state */
.test-type-card.loading {
  opacity: 0.7;
  pointer-events: none;
}

.test-type-card.loading::after {
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
</style>
