<template>
  <footer class="footer">
    <div class="footer-left">
      <span v-if="currentUser" class="user-info">
        <span class="user-welcome">{{ $t('menu.welcome') || 'Witamy' }}</span>
        <span class="user-role" :data-role="currentUser.role">{{ currentUser.role }}</span>
        <button class="btn-logout" @click="handleLogout" :title="$t('menu.logout') || 'Wyloguj'">
          🚪 {{ $t('menu.logout') || 'Wyloguj' }}
        </button>
      </span>
    </div>

    <div class="footer-center">
      <span class="time-info">
        <span class="footer-date">{{ formattedDate }}</span>
        <span class="footer-time role-badge">{{ currentTime }}</span>
      </span>
    </div>

    <div class="footer-right">
      <span class="version-info">
        <span class="app-version">{{ $t('global.software') || 'v2.0 MOCK' }}</span>
        <span class="build-info">Build {{ buildNumber }}</span>
      </span>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  props: {
    currentUser: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // === MODULE CONFIGURATION - ALL VARIABLES DEFINED HERE ===
      
      // Time update configuration
      TIME_UPDATE_INTERVAL: 1000, // 1 second
      
      // System info
      buildNumber: '20250124.1900',
      
      // Current time state
      currentTime: '',
      timeInterval: null,
      
      // Translation constants from locales/*.json
      TRANSLATION_KEYS: {
        software: 'global.software',
        version: 'global.version', 
        build: 'global.build',
        user: 'global.user',
        logout: 'menu.logout',
        system: 'global.system',
        status: 'global.status'
      }
    }
  },
  computed: {
    formattedDate() {
      return new Date().toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  },
  methods: {
    updateTime() {
      this.currentTime = new Date().toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    },
    
    startTimeUpdates() {
      this.updateTime(); // Initial update
      this.timeInterval = setInterval(() => {
        this.updateTime();
      }, this.TIME_UPDATE_INTERVAL);
    },
    
    stopTimeUpdates() {
      if (this.timeInterval) {
        clearInterval(this.timeInterval);
        this.timeInterval = null;
      }
    },
    
    handleLogout() {
      this.$emit('logout');
    }
  },
  
  mounted() {
    this.startTimeUpdates();
  },
  
  beforeUnmount() {
    this.stopTimeUpdates();
  }
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
  color: white;
  border-top: 1px solid #1a252f;
  min-height: 50px;
  font-size: 0.9rem;
}

.footer-left, .footer-center, .footer-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.footer-center {
  justify-content: center;
}

.footer-right {
  justify-content: flex-end;
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-welcome {
  color: #bdc3c7;
  font-size: 0.85rem;
}

.user-role {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-logout:hover {
  background: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
}

.btn-logout:active {
  transform: translateY(0);
}

/* Time Info */
.time-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.footer-date {
  color: #ecf0f1;
  font-size: 0.85rem;
  font-weight: 500;
}

.footer-time {
  color: #3498db;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

/* Version Info */
.version-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.app-version {
  color: #27ae60;
  font-weight: bold;
  font-size: 0.85rem;
}

.build-info {
  color: #95a5a6;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
}

/* Mobile optimizations for 400x1280 display */
@media (max-width: 450px) {
  .footer {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    min-height: auto;
  }
  
  .footer-left, .footer-center, .footer-right {
    flex: none;
    width: 100%;
    justify-content: center;
  }
  
  .user-info {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .time-info {
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .version-info {
    align-items: center;
  }
  
  .btn-logout {
    padding: 0.3rem 0.6rem;
  }
}

/* Very small screens */
@media (max-width: 350px) {
  .footer {
    font-size: 0.8rem;
  }
  
  .user-info {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .time-info {
    padding: 0.25rem 0.5rem;
  }
  
  .footer-time {
    font-size: 0.9rem;
  }
}

/* Animation for role badge */
.user-role {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover effects */
.time-info:hover {
  background: rgba(255, 255, 255, 0.15);
}

.version-info:hover .app-version {
  color: #2ecc71;
}

.version-info:hover .build-info {
  color: #bdc3c7;
}
</style>
