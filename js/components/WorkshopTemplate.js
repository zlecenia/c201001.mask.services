/**
 * MASKSERVICE C20 - Vue.js Workshop Template Component
 * Replaces vanilla workshop-template.html
 * Advanced workshop management with equipment, parts, and maintenance
 */


const WorkshopTemplate = {
    name: 'WorkshopTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'workshop-action'],
    
    setup(props, { emit }) {
        const workshopState = reactive({
            activeSection: null,
            isLoading: false,
            lastAction: null
        });

        const workshopStats = reactive({
            totalEquipment: 45,
            activeEquipment: 42,
            spareParts: 156,
            lowStockParts: 12,
            scheduledMaintenance: 8,
            overdueMaintenance: 2
        });

        const pageTitle = computed(() => props.language === 'pl' ? 'Warsztat' : 'Workshop');
        
        const workshopSections = computed(() => [
            {
                id: 'equipment',
                title: props.language === 'pl' ? 'Lista Sprzętu' : 'Equipment List',
                description: props.language === 'pl' ? 'Zarządzaj wyposażeniem warsztatowym' : 'Manage workshop equipment',
                icon: '🔧',
                color: 'blue',
                stats: `${workshopStats.activeEquipment}/${workshopStats.totalEquipment}`,
                status: workshopStats.activeEquipment === workshopStats.totalEquipment ? 'good' : 'warning'
            },
            {
                id: 'parts',
                title: props.language === 'pl' ? 'Części Zamienne' : 'Spare Parts',
                description: props.language === 'pl' ? 'Inwentarz części zamiennych' : 'Spare parts inventory',
                icon: '⚙️',
                color: 'orange',
                stats: `${workshopStats.spareParts} szt.`,
                status: workshopStats.lowStockParts > 0 ? 'warning' : 'good',
                badge: workshopStats.lowStockParts > 0 ? `${workshopStats.lowStockParts} niski stan` : null
            },
            {
                id: 'maintenance',
                title: props.language === 'pl' ? 'Konserwacja' : 'Maintenance',
                description: props.language === 'pl' ? 'Harmonogram przeglądów i napraw' : 'Maintenance and repair schedule',
                icon: '🛠️',
                color: 'green',
                stats: `${workshopStats.scheduledMaintenance} zaplanowane`,
                status: workshopStats.overdueMaintenance > 0 ? 'critical' : 'good',
                badge: workshopStats.overdueMaintenance > 0 ? `${workshopStats.overdueMaintenance} przeterminowane` : null
            }
        ]);

        const recentActivities = reactive([
            {
                id: 1,
                type: 'equipment',
                action: 'Kalibracja przepływomierza F-001',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                user: 'Jan Kowalski',
                status: 'completed'
            },
            {
                id: 2,
                type: 'parts',
                action: 'Zamówienie filtrów HEPA x10',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                user: 'Anna Nowak',
                status: 'pending'
            },
            {
                id: 3,
                type: 'maintenance',
                action: 'Przegląd główny stacji testowej ST-03',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                user: 'Piotr Wiśniewski',
                status: 'overdue'
            }
        ]);

        const openSection = async (sectionId) => {
            console.log(`🔶 Vue: Opening workshop section: ${sectionId}`);
            workshopState.isLoading = true;
            workshopState.activeSection = sectionId;

            try {
                // Simulate loading
                await new Promise(resolve => setTimeout(resolve, 800));

                // Integrate with existing workshop system if available
                if (window.WorkshopManager && window.WorkshopManager[sectionId]) {
                    await window.WorkshopManager[sectionId]();
                }

                // Navigate to specific template based on section
                const routeMap = {
                    equipment: 'workshop-inventory-template',
                    parts: 'workshop-parts-template', 
                    maintenance: 'workshop-maintenance-template'
                };

                const targetRoute = routeMap[sectionId];
                if (targetRoute) {
                    emit('navigate', targetRoute, props.language, 'default');
                }

                workshopState.lastAction = {
                    section: sectionId,
                    timestamp: new Date(),
                    result: 'success'
                };

                emit('workshop-action', { section: sectionId, status: 'opened' });
                console.log(`✅ Vue: Workshop section ${sectionId} opened successfully`);

            } catch (error) {
                console.error(`❌ Vue: Failed to open workshop section ${sectionId}:`, error);
                alert(`Błąd otwierania sekcji: ${error.message}`);
            } finally {
                workshopState.isLoading = false;
                workshopState.activeSection = null;
            }
        };

        const quickAction = (action) => {
            console.log(`🔶 Vue: Quick workshop action: ${action}`);
            
            const actions = {
                add_equipment: () => openSection('equipment'),
                order_parts: () => openSection('parts'),
                schedule_maintenance: () => openSection('maintenance'),
                view_reports: () => emit('navigate', 'reports-view-template', props.language, 'default')
            };

            if (actions[action]) {
                actions[action]();
            }
        };

        const exportWorkshopReport = () => {
            const reportData = {
                timestamp: new Date().toISOString(),
                user: props.user.username,
                stats: workshopStats,
                recentActivities: recentActivities,
                sections: workshopSections.value
            };

            const content = JSON.stringify(reportData, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `workshop-report-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('✅ Vue: Workshop report exported successfully');
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to user menu');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        onMounted(() => {
            console.log('🔶 Vue: WorkshopTemplate component mounted');
        });

        return {
            workshopState,
            workshopStats,
            pageTitle,
            workshopSections,
            recentActivities,
            openSection,
            quickAction,
            exportWorkshopReport,
            goBack
        };
    },

    template: `
        <div class="workshop-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="export-btn" @click="exportWorkshopReport">
                            📤 Raport
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Workshop Stats -->
                <div class="workshop-stats">
                    <div class="stat-card">
                        <div class="stat-icon">🔧</div>
                        <div class="stat-content">
                            <div class="stat-number">{{ workshopStats.activeEquipment }}/{{ workshopStats.totalEquipment }}</div>
                            <div class="stat-label">{{ language === 'pl' ? 'Sprzęt aktywny' : 'Active Equipment' }}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⚙️</div>
                        <div class="stat-content">
                            <div class="stat-number">{{ workshopStats.spareParts }}</div>
                            <div class="stat-label">{{ language === 'pl' ? 'Części zamienne' : 'Spare Parts' }}</div>
                        </div>
                        <div v-if="workshopStats.lowStockParts > 0" class="stat-alert">
                            ⚠️ {{ workshopStats.lowStockParts }} {{ language === 'pl' ? 'niski stan' : 'low stock' }}
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🛠️</div>
                        <div class="stat-content">
                            <div class="stat-number">{{ workshopStats.scheduledMaintenance }}</div>
                            <div class="stat-label">{{ language === 'pl' ? 'Zaplanowane' : 'Scheduled' }}</div>
                        </div>
                        <div v-if="workshopStats.overdueMaintenance > 0" class="stat-alert critical">
                            🚨 {{ workshopStats.overdueMaintenance }} {{ language === 'pl' ? 'przeterminowane' : 'overdue' }}
                        </div>
                    </div>
                </div>

                <!-- Workshop Sections -->
                <div class="workshop-sections">
                    <div 
                        v-for="section in workshopSections" 
                        :key="section.id"
                        class="section-card"
                        :class="[
                            'section-' + section.color,
                            'status-' + section.status,
                            { 
                                'loading': workshopState.isLoading && workshopState.activeSection === section.id
                            }
                        ]"
                        @click="openSection(section.id)"
                        :disabled="workshopState.isLoading"
                    >
                        <div class="section-header">
                            <div class="section-icon">{{ section.icon }}</div>
                            <div v-if="section.badge" class="section-badge" :class="'badge-' + section.status">
                                {{ section.badge }}
                            </div>
                        </div>
                        
                        <div class="section-content">
                            <h3 class="section-title">{{ section.title }}</h3>
                            <p class="section-description">{{ section.description }}</p>
                            <div class="section-stats">{{ section.stats }}</div>
                        </div>
                        
                        <div class="section-status">
                            <div v-if="workshopState.isLoading && workshopState.activeSection === section.id" class="loading-spinner">
                                <div class="spinner"></div>
                                <span>{{ language === 'pl' ? 'Ładowanie...' : 'Loading...' }}</span>
                            </div>
                            <div v-else class="status-indicator" :class="'indicator-' + section.status">
                                {{ section.status === 'good' ? '✅' : 
                                   section.status === 'warning' ? '⚠️' : '🚨' }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h3>{{ language === 'pl' ? 'Szybkie akcje' : 'Quick Actions' }}</h3>
                    <div class="actions-grid">
                        <button class="action-btn" @click="quickAction('add_equipment')">
                            ➕ {{ language === 'pl' ? 'Dodaj sprzęt' : 'Add Equipment' }}
                        </button>
                        <button class="action-btn" @click="quickAction('order_parts')">
                            📦 {{ language === 'pl' ? 'Zamów części' : 'Order Parts' }}
                        </button>
                        <button class="action-btn" @click="quickAction('schedule_maintenance')">
                            📅 {{ language === 'pl' ? 'Zaplanuj przegląd' : 'Schedule Maintenance' }}
                        </button>
                        <button class="action-btn" @click="quickAction('view_reports')">
                            📊 {{ language === 'pl' ? 'Pokaż raporty' : 'View Reports' }}
                        </button>
                    </div>
                </div>

                <!-- Recent Activities -->
                <div class="recent-activities">
                    <h3>{{ language === 'pl' ? 'Ostatnie aktywności' : 'Recent Activities' }}</h3>
                    <div class="activities-list">
                        <div 
                            v-for="activity in recentActivities" 
                            :key="activity.id"
                            class="activity-item"
                            :class="'activity-' + activity.status"
                        >
                            <div class="activity-icon">
                                {{ activity.type === 'equipment' ? '🔧' : 
                                   activity.type === 'parts' ? '⚙️' : '🛠️' }}
                            </div>
                            <div class="activity-content">
                                <div class="activity-action">{{ activity.action }}</div>
                                <div class="activity-meta">
                                    <span class="activity-user">{{ activity.user }}</span>
                                    <span class="activity-time">{{ activity.timestamp.toLocaleString() }}</span>
                                </div>
                            </div>
                            <div class="activity-status" :class="'status-' + activity.status">
                                {{ activity.status === 'completed' ? '✅' : 
                                   activity.status === 'pending' ? '⏳' : '🚨' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .workshop-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container { max-width: 1400px; margin: 0 auto; }
        
        .template-header {
            display: flex; align-items: center; justify-content: space-between;
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .back-btn, .export-btn { 
            padding: 8px 16px; border: none; border-radius: 6px; 
            cursor: pointer; font-weight: 500; transition: all 0.3s; 
        }
        .back-btn { background: #6c757d; color: white; }
        .export-btn { background: #28a745; color: white; }
        
        .vue-badge { 
            background: #42b883; color: white; padding: 6px 12px; 
            border-radius: 16px; font-size: 0.9em; font-weight: 600; 
        }
        
        .workshop-stats {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px; margin-bottom: 32px;
        }
        
        .stat-card {
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 16px;
            position: relative;
        }
        
        .stat-icon { font-size: 2.5em; }
        .stat-number { font-size: 1.8em; font-weight: 600; color: #333; }
        .stat-label { color: #666; font-size: 0.9em; }
        
        .stat-alert {
            position: absolute; top: 8px; right: 8px;
            padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600;
            background: #fff3cd; color: #856404;
        }
        
        .stat-alert.critical { background: #f8d7da; color: #721c24; }
        
        .workshop-sections {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px; margin-bottom: 32px;
        }
        
        .section-card {
            background: white; padding: 24px; border-radius: 16px; cursor: pointer;
            transition: all 0.3s; border: 3px solid transparent; position: relative;
        }
        
        .section-card:hover:not(:disabled) {
            transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        
        .section-card.section-blue { border-left: 6px solid #007bff; }
        .section-card.section-orange { border-left: 6px solid #fd7e14; }
        .section-card.section-green { border-left: 6px solid #28a745; }
        
        .section-card.status-warning { background: #fff8e1; }
        .section-card.status-critical { background: #ffeaea; animation: alertBlink 2s infinite; }
        
        .section-header {
            display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
        }
        
        .section-icon { font-size: 2.5em; }
        
        .section-badge {
            padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600;
        }
        
        .badge-warning { background: #fff3cd; color: #856404; }
        .badge-critical { background: #f8d7da; color: #721c24; }
        
        .section-title { margin: 0 0 8px 0; color: #333; font-size: 1.3em; }
        .section-description { margin: 0 0 12px 0; color: #666; line-height: 1.4; }
        .section-stats { font-weight: 600; color: #007bff; }
        
        .loading-spinner {
            display: flex; align-items: center; gap: 8px; color: #007bff; font-weight: 600;
        }
        
        .spinner {
            width: 16px; height: 16px; border: 2px solid #e9ecef;
            border-top: 2px solid #007bff; border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        .quick-actions {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .actions-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;
        }
        
        .action-btn {
            padding: 12px 16px; background: #f8f9fa; border: 2px solid #e9ecef;
            border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s;
        }
        
        .action-btn:hover { background: #e9ecef; }
        
        .recent-activities {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .activities-list { display: flex; flex-direction: column; gap: 12px; }
        
        .activity-item {
            display: flex; align-items: center; gap: 16px; padding: 16px;
            background: #f8f9fa; border-radius: 8px; transition: all 0.3s;
        }
        
        .activity-item.activity-overdue { background: #ffeaea; }
        .activity-item.activity-pending { background: #fff8e1; }
        
        .activity-icon { font-size: 1.5em; }
        .activity-content { flex: 1; }
        .activity-action { font-weight: 600; color: #333; }
        .activity-meta { display: flex; gap: 12px; font-size: 0.9em; color: #666; margin-top: 4px; }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes alertBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
    `
};

window.WorkshopTemplate = WorkshopTemplate;
console.log('🔶 Vue WorkshopTemplate component loaded');
