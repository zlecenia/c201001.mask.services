export default {
  name: 'AppFooter',
  template: `
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
  `,
  props: {
    currentUser: {
      type: Object,
      default: null
    },
    currentTime: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      buildNumber: '20250124.1900'
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
    handleLogout() {
      this.$emit('logout');
    },
    injectStyles() {
      if (document.getElementById('app-footer-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'app-footer-styles';
      style.textContent = `
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
          animation: fadeIn 0.5s ease-in-out;
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
          transition: background 0.2s ease;
        }

        .time-info:hover {
          background: rgba(255, 255, 255, 0.15);
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
          transition: color 0.2s ease;
        }

        .build-info {
          color: #95a5a6;
          font-size: 0.75rem;
          font-family: 'Courier New', monospace;
          transition: color 0.2s ease;
        }

        .version-info:hover .app-version {
          color: #2ecc71;
        }

        .version-info:hover .build-info {
          color: #bdc3c7;
        }

        /* Animations */
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
      `;
      document.head.appendChild(style);
    }
  },
  mounted() {
    this.injectStyles();
  }
}
