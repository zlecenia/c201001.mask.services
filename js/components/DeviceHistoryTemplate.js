/**
 * MASKTRONIC C20 - Vue.js Device History Template Component
 * Replaces vanilla device-history-template.html
 * Advanced device history tracking with search, filters, and analytics
 */


const DeviceHistoryTemplate = {
    name: 'DeviceHistoryTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'device-action'],
    
    setup(props, { emit }) {
        const historyState = reactive({
            searchQuery: '',
            filterType: 'all',
            sortBy: 'lastTest',
            sortDirection: 'desc',
            isLoading: false
        });

        const devices = reactive([
            {
                id: 1,
                name: 'PP-MASK-001',
                type: 'PP_MASK',
                status: 'ACTIVE',
                lastTest: '2025-09-24T14:30:00Z',
                testResult: 'PASSED',
                testCount: 45,
                passRate: 95.6,
                operator: 'Jan Kowalski',
                nextTest: '2025-10-24',
                location: 'Station A-01'
            },
            {
                id: 2,
                name: 'NP-MASK-003',
                type: 'NP_MASK',
                status: 'MAINTENANCE',
                lastTest: '2025-09-22T09:15:00Z',
                testResult: 'FAILED',
                testCount: 32,
                passRate: 87.5,
                operator: 'Anna Nowak',
                nextTest: '2025-09-30',
                location: 'Workshop B-02'
            },
            {
                id: 3,
                name: 'SCBA-007',
                type: 'SCBA',
                status: 'ACTIVE',
                lastTest: '2025-09-23T16:45:00Z',
                testResult: 'PASSED',
                testCount: 67,
                passRate: 98.5,
                operator: 'Piotr Wiśniewski',
                nextTest: '2025-11-23',
                location: 'Station C-03'
            },
            {
                id: 4,
                name: 'CPS-012',
                type: 'CPS',
                status: 'RETIRED',
                lastTest: '2025-08-15T11:20:00Z',
                testResult: 'FAILED',
                testCount: 89,
                passRate: 76.4,
                operator: 'Maria Zielińska',
                nextTest: null,
                location: 'Storage D-04'
            }
        ]);

        const pageTitle = computed(() => props.language === 'pl' ? 'Historia Urządzeń' : 'Device History');

        const deviceTypes = computed(() => [
            { value: 'all', label: props.language === 'pl' ? 'Wszystkie' : 'All Devices' },
            { value: 'PP_MASK', label: props.language === 'pl' ? 'Maska PP' : 'PP Mask' },
            { value: 'NP_MASK', label: props.language === 'pl' ? 'Maska NP' : 'NP Mask' },
            { value: 'SCBA', label: props.language === 'pl' ? 'Aparat SCBA' : 'SCBA' },
            { value: 'CPS', label: props.language === 'pl' ? 'Kombinezon CPS' : 'CPS Protection Suit' }
        ]);

        const filteredDevices = computed(() => {
            let filtered = [...devices];

            // Search filter
            if (historyState.searchQuery) {
                const query = historyState.searchQuery.toLowerCase();
                filtered = filtered.filter(device => 
                    device.name.toLowerCase().includes(query) ||
                    device.operator.toLowerCase().includes(query) ||
                    device.location.toLowerCase().includes(query)
                );
            }

            // Type filter
            if (historyState.filterType !== 'all') {
                filtered = filtered.filter(device => device.type === historyState.filterType);
            }

            // Sorting
            filtered.sort((a, b) => {
                let aVal, bVal;
                switch (historyState.sortBy) {
                    case 'lastTest':
                        aVal = new Date(a.lastTest);
                        bVal = new Date(b.lastTest);
                        break;
                    case 'passRate':
                        aVal = a.passRate;
                        bVal = b.passRate;
                        break;
                    case 'name':
                        aVal = a.name;
                        bVal = b.name;
                        break;
                    default:
                        aVal = a[historyState.sortBy];
                        bVal = b[historyState.sortBy];
                }

                if (historyState.sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            return filtered;
        });

        const deviceStats = computed(() => ({
            total: devices.length,
            active: devices.filter(d => d.status === 'ACTIVE').length,
            maintenance: devices.filter(d => d.status === 'MAINTENANCE').length,
            retired: devices.filter(d => d.status === 'RETIRED').length,
            avgPassRate: Math.round(devices.reduce((sum, d) => sum + d.passRate, 0) / devices.length * 10) / 10,
            recentTests: devices.filter(d => {
                const testDate = new Date(d.lastTest);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return testDate > weekAgo;
            }).length
        }));

        const viewDeviceDetails = (device) => {
            console.log(`🔶 Vue: Viewing device details: ${device.name}`);
            emit('device-action', { action: 'view_details', device });
            
            // Navigate to device data template
            emit('navigate', 'device-data-template', props.language, 'default');
        };

        const scheduleTest = (device) => {
            console.log(`🔶 Vue: Scheduling test for device: ${device.name}`);
            emit('device-action', { action: 'schedule_test', device });
            
            alert(`${props.language === 'pl' ? 'Zaplanowano test dla' : 'Test scheduled for'}: ${device.name}`);
        };

        const exportHistory = () => {
            const exportData = {
                timestamp: new Date().toISOString(),
                user: props.user.username,
                devices: filteredDevices.value,
                stats: deviceStats.value,
                filters: {
                    searchQuery: historyState.searchQuery,
                    filterType: historyState.filterType
                }
            };

            const content = JSON.stringify(exportData, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `device-history-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('✅ Vue: Device history exported successfully');
        };

        const goBack = () => {
            console.log('🔶 Vue: Returning to user menu');
            emit('navigate', 'user-menu-screen', props.language, 'default');
        };

        onMounted(() => {
            console.log('🔶 Vue: DeviceHistoryTemplate component mounted');
        });

        return {
            historyState,
            devices,
            pageTitle,
            deviceTypes,
            filteredDevices,
            deviceStats,
            viewDeviceDetails,
            scheduleTest,
            exportHistory,
            goBack
        };
    },

    template: `
        <div class="device-history-template vue-component">
            <div class="template-container">
                
                <!-- Header -->
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2 class="template-title">{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="export-btn" @click="exportHistory">
                            📤 {{ language === 'pl' ? 'Eksport' : 'Export' }}
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="device-stats">
                    <div class="stat-card total">
                        <div class="stat-number">{{ deviceStats.total }}</div>
                        <div class="stat-label">{{ language === 'pl' ? 'Wszystkie' : 'Total' }}</div>
                    </div>
                    <div class="stat-card active">
                        <div class="stat-number">{{ deviceStats.active }}</div>
                        <div class="stat-label">{{ language === 'pl' ? 'Aktywne' : 'Active' }}</div>
                    </div>
                    <div class="stat-card maintenance">
                        <div class="stat-number">{{ deviceStats.maintenance }}</div>
                        <div class="stat-label">{{ language === 'pl' ? 'Konserwacja' : 'Maintenance' }}</div>
                    </div>
                    <div class="stat-card retired">
                        <div class="stat-number">{{ deviceStats.retired }}</div>
                        <div class="stat-label">{{ language === 'pl' ? 'Wycofane' : 'Retired' }}</div>
                    </div>
                    <div class="stat-card rate">
                        <div class="stat-number">{{ deviceStats.avgPassRate }}%</div>
                        <div class="stat-label">{{ language === 'pl' ? 'Śr. sukces' : 'Avg Pass Rate' }}</div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="filters-section">
                    <div class="search-group">
                        <input 
                            v-model="historyState.searchQuery"
                            type="text" 
                            :placeholder="language === 'pl' ? 'Szukaj urządzeń...' : 'Search devices...'"
                            class="search-input"
                        />
                    </div>
                    <div class="filter-group">
                        <select v-model="historyState.filterType" class="filter-select">
                            <option v-for="type in deviceTypes" :key="type.value" :value="type.value">
                                {{ type.label }}
                            </option>
                        </select>
                    </div>
                    <div class="sort-group">
                        <select v-model="historyState.sortBy" class="sort-select">
                            <option value="lastTest">{{ language === 'pl' ? 'Ostatni test' : 'Last Test' }}</option>
                            <option value="name">{{ language === 'pl' ? 'Nazwa' : 'Name' }}</option>
                            <option value="passRate">{{ language === 'pl' ? 'Sukces %' : 'Pass Rate' }}</option>
                        </select>
                    </div>
                </div>

                <!-- Device List -->
                <div class="device-list">
                    <div 
                        v-for="device in filteredDevices" 
                        :key="device.id"
                        class="device-item"
                        :class="'status-' + device.status.toLowerCase()"
                    >
                        <div class="device-main">
                            <div class="device-info">
                                <div class="device-name">{{ device.name }}</div>
                                <div class="device-type">{{ device.type }}</div>
                                <div class="device-location">{{ device.location }}</div>
                            </div>
                            
                            <div class="device-status">
                                <span class="status-badge" :class="'badge-' + device.status.toLowerCase()">
                                    {{ device.status }}
                                </span>
                            </div>
                        </div>
                        
                        <div class="device-details">
                            <div class="test-info">
                                <div class="last-test">
                                    {{ language === 'pl' ? 'Ostatni test:' : 'Last test:' }} 
                                    {{ new Date(device.lastTest).toLocaleString() }}
                                </div>
                                <div class="test-result" :class="'result-' + device.testResult.toLowerCase()">
                                    {{ device.testResult }}
                                </div>
                                <div class="operator">{{ device.operator }}</div>
                            </div>
                            
                            <div class="pass-rate">
                                <div class="rate-number">{{ device.passRate }}%</div>
                                <div class="rate-bar">
                                    <div 
                                        class="rate-fill"
                                        :style="{ width: device.passRate + '%' }"
                                        :class="{ 
                                            'high': device.passRate >= 95,
                                            'medium': device.passRate >= 80 && device.passRate < 95,
                                            'low': device.passRate < 80
                                        }"
                                    ></div>
                                </div>
                                <div class="test-count">{{ device.testCount }} {{ language === 'pl' ? 'testów' : 'tests' }}</div>
                            </div>
                        </div>
                        
                        <div class="device-actions">
                            <button class="action-btn view" @click="viewDeviceDetails(device)" :title="language === 'pl' ? 'Szczegóły' : 'View Details'">
                                👁️
                            </button>
                            <button 
                                v-if="device.status === 'ACTIVE'"
                                class="action-btn test" 
                                @click="scheduleTest(device)" 
                                :title="language === 'pl' ? 'Zaplanuj test' : 'Schedule Test'"
                            >
                                🧪
                            </button>
                        </div>
                    </div>
                </div>

                <!-- No Results -->
                <div v-if="filteredDevices.length === 0" class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <div class="no-results-text">
                        {{ language === 'pl' ? 'Nie znaleziono urządzeń' : 'No devices found' }}
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .device-history-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
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
        
        .device-stats {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px; margin-bottom: 24px;
        }
        
        .stat-card {
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;
            border-left: 4px solid #9c27b0;
        }
        
        .stat-card.active { border-left-color: #4caf50; }
        .stat-card.maintenance { border-left-color: #ff9800; }
        .stat-card.retired { border-left-color: #f44336; }
        .stat-card.rate { border-left-color: #2196f3; }
        
        .stat-number { font-size: 1.8em; font-weight: 600; color: #333; }
        .stat-label { font-size: 0.9em; color: #666; margin-top: 4px; }
        
        .filters-section {
            display: grid; grid-template-columns: 1fr auto auto; gap: 16px;
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .search-input, .filter-select, .sort-select {
            padding: 10px; border: 2px solid #e9ecef; border-radius: 6px;
            transition: border-color 0.3s;
        }
        
        .search-input { width: 100%; }
        .search-input:focus, .filter-select:focus, .sort-select:focus {
            border-color: #9c27b0; outline: none;
        }
        
        .device-list { display: flex; flex-direction: column; gap: 16px; }
        
        .device-item {
            background: white; border-radius: 12px; padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s;
        }
        
        .device-item:hover { transform: translateY(-2px); }
        
        .device-item.status-active { border-left: 4px solid #4caf50; }
        .device-item.status-maintenance { border-left: 4px solid #ff9800; }
        .device-item.status-retired { border-left: 4px solid #f44336; }
        
        .device-main {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        }
        
        .device-name { font-size: 1.2em; font-weight: 600; color: #333; }
        .device-type { color: #666; font-size: 0.9em; margin-top: 4px; }
        .device-location { color: #999; font-size: 0.8em; margin-top: 2px; }
        
        .status-badge {
            padding: 4px 12px; border-radius: 16px; font-size: 0.8em; font-weight: 600;
        }
        
        .badge-active { background: #d4edda; color: #155724; }
        .badge-maintenance { background: #fff3cd; color: #856404; }
        .badge-retired { background: #f8d7da; color: #721c24; }
        
        .device-details {
            display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center;
        }
        
        .test-info { display: flex; flex-direction: column; gap: 4px; }
        .last-test { color: #666; font-size: 0.9em; }
        .operator { color: #999; font-size: 0.8em; }
        
        .test-result {
            font-weight: 600; font-size: 0.9em;
        }
        
        .result-passed { color: #28a745; }
        .result-failed { color: #dc3545; }
        
        .pass-rate { text-align: center; }
        .rate-number { font-weight: 600; margin-bottom: 8px; }
        .rate-bar { 
            width: 100px; height: 8px; background: #e9ecef; 
            border-radius: 4px; overflow: hidden; margin-bottom: 4px; 
        }
        .rate-fill { height: 100%; transition: width 0.3s; }
        .rate-fill.high { background: #4caf50; }
        .rate-fill.medium { background: #ff9800; }
        .rate-fill.low { background: #f44336; }
        .test-count { font-size: 0.8em; color: #666; }
        
        .device-actions {
            position: absolute; top: 20px; right: 20px;
            display: flex; gap: 8px;
        }
        
        .device-item { position: relative; }
        
        .action-btn {
            padding: 8px; border: none; border-radius: 6px; cursor: pointer;
            transition: all 0.3s; font-size: 1em;
        }
        
        .action-btn.view { background: #e3f2fd; }
        .action-btn.test { background: #fff3e0; }
        
        .action-btn:hover { transform: scale(1.1); }
        
        .no-results {
            text-align: center; padding: 40px; background: white;
            border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .no-results-icon { font-size: 3em; margin-bottom: 16px; }
        .no-results-text { color: #666; font-size: 1.1em; }
    `
};

window.DeviceHistoryTemplate = DeviceHistoryTemplate;
console.log('🔶 Vue DeviceHistoryTemplate component loaded');
