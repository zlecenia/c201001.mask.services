export default {
  name: 'AppHeader',
  template: `
    <header class="header">
      <div class="header-left">
        <a href="/">
          <span class="logo" data-i18n="global.logo">{{ $t('global.logo') || 'MASKTRONIC' }}</span>
          <span class="hardware" data-i18n="global.hardware">{{ $t('global.hardware') || 'C20' }}</span>
          <span class="product" data-i18n="global.product">{{ $t('global.product') || '1001' }}</span>
          <span class="software" data-i18n="global.software">{{ $t('global.software') || 'v2.0 MOCK' }}</span>
        </a>
      </div>
      
      <div class="header-center">
        <span class="status-indicator">
          <span class="footer-host">
            <a :href="\`https://\${deviceInfo.url}\`" data-i18n="global.device_url_label">
              {{ deviceInfo.url }}
            </a>
          </span>
          <span class="status-dot" :class="deviceStatus.toLowerCase()"></span>
          <span 
            class="role-badge" 
            :class="deviceStatus.toLowerCase()"
            data-i18n="global.offline"
          >
            {{ $t(\`global.\${deviceStatus.toLowerCase()}\`) || deviceStatus }}
          </span>
        </span>
      </div>

      <div class="header-right">
        <span class="device-info">
          <span data-i18n="global.device_name">{{ $t('global.device_name') || deviceInfo.name }}</span>
          <span data-i18n="global.device_type">{{ $t('global.device_type') || deviceInfo.type }}</span>
        </span>
        
        <!-- Language Selector -->
        <div class="language-selector">
          <button 
            v-for="lang in languages" 
            :key="lang.code"
            :class="['lang-btn', { active: currentLanguage === lang.code }]"
            @click="changeLanguage(lang.code)"
            :title="lang.name"
          >
            {{ lang.flag }}
          </button>
        </div>
      </div>
    </header>
  `,
  props: {
    deviceStatus: {
      type: String,
      default: 'OFFLINE'
    },
    deviceInfo: {
      type: Object,
      default: () => ({
        name: 'CONNECT',
        type: '500',
        url: 'c201001.mask.services'
      })
    },
    currentLanguage: {
      type: String,
      default: 'pl'
    }
  },
  data() {
    return {
      languages: [
        { code: 'pl', name: 'Polski', flag: '🇵🇱' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
      ]
    }
  },
  methods: {
    changeLanguage(languageCode) {
      this.$emit('language-changed', languageCode);
    }
  },
  mounted() {
    // Inject component styles
    this.injectStyles();
  },
  methods: {
    changeLanguage(languageCode) {
      this.$emit('language-changed', languageCode);
    },
    injectStyles() {
      if (document.getElementById('app-header-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'app-header-styles';
      style.textContent = `
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          border-bottom: 2px solid #1a252f;
          min-height: 60px;
        }

        .header-left a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: inherit;
        }

        .logo {
          font-weight: bold;
          font-size: 1.2rem;
          color: #3498db;
        }

        .hardware {
          background: #e74c3c;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .product {
          background: #f39c12;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .software {
          background: #27ae60;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          backdrop-filter: blur(5px);
        }

        .footer-host a {
          color: #3498db;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .footer-host a:hover {
          text-decoration: underline;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e74c3c;
          animation: pulse-dot 2s infinite;
        }

        .status-dot.online {
          background: #27ae60;
        }

        .role-badge {
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .role-badge.online {
          color: #27ae60;
        }

        .role-badge.offline {
          color: #e74c3c;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .device-info {
          display: flex;
          flex-direction: column;
          text-align: right;
          font-size: 0.9rem;
        }

        .device-info span:first-child {
          font-weight: bold;
        }

        .device-info span:last-child {
          color: #bdc3c7;
          font-size: 0.8rem;
        }

        /* Language Selector */
        .language-selector {
          display: flex;
          gap: 0.25rem;
        }

        .lang-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lang-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .lang-btn.active {
          background: #3498db;
          border-color: #2980b9;
          box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
        }

        /* Animations */
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Mobile optimizations for 400x1280 display */
        @media (max-width: 450px) {
          .header {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.5rem;
            min-height: auto;
          }
          
          .header-left, .header-center, .header-right {
            flex: none;
          }
          
          .header-left a {
            gap: 0.25rem;
          }
          
          .logo {
            font-size: 1rem;
          }
          
          .hardware, .product, .software {
            font-size: 0.7rem;
            padding: 0.1rem 0.3rem;
          }
          
          .status-indicator {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
          }
          
          .device-info {
            font-size: 0.8rem;
            text-align: center;
          }
          
          .language-selector {
            justify-content: center;
          }
          
          .lang-btn {
            min-width: 35px;
            padding: 0.2rem 0.4rem;
            font-size: 0.9rem;
          }
        }

        /* Very small screens */
        @media (max-width: 350px) {
          .header-left a {
            flex-wrap: wrap;
          }
          
          .status-indicator {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}
