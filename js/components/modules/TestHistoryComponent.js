/**
 * MASKTRONIC C20 - Test History Component (Modular)
 * Extracted from TestMenuTemplate.js for better maintainability
 * Handles test history browsing and filtering
 */

const TestHistoryComponent = {
    name: 'TestHistoryComponent',
    props: {
        user: { type: Object, required: true },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['history-item-selected', 'history-export'],
    
    setup(props, { emit }) {
        // Vue.js imports
        const { reactive, computed, onMounted } = Vue;
        
        // Test History State
        const historyState = reactive({
            active: false,
            testHistory: [],
            historyFilter: 'all', // all, passed, failed, cancelled
            dateFilter: 'week', // today, week, month, year, all
            sortBy: 'date', // date, name, type, status
            sortOrder: 'desc', // asc, desc
            searchQuery: '',
            selectedItem: null,
            isLoading: false
        });
        
        // Test History Methods
        const showTestHistory = () => {
            console.log('📅 Opening Test History view');
            historyState.active = true;
            loadTestHistory();
        };
        
        const loadTestHistory = () => {
            console.log('📅 Loading test history data...');
            historyState.isLoading = true;
            
            // Simulate loading delay
            setTimeout(() => {
                // Mock test history data
                const mockHistory = [
                    {
                        id: 'test_001',
                        name: 'FFP2 Mask Filtration Test #1',
                        testType: 'filtration',
                        deviceType: 'ffp2',
                        deviceModel: 'ProMask FFP2-A',
                        status: 'passed',
                        startTime: '2024-01-20 10:30:00',
                        endTime: '2024-01-20 10:35:00',
                        duration: 300, // seconds
                        operator: 'operator1',
                        results: {
                            filtrationEfficiency: 94.2,
                            pressureDrop: 147,
                            breathability: 'good'
                        },
                        notes: 'Test completed successfully within parameters'
                    },
                    {
                        id: 'test_002',
                        name: 'Surgical Mask Breathability Test',
                        testType: 'breathability',
                        deviceType: 'surgical',
                        deviceModel: 'MedSafe Surgical Type II',
                        status: 'failed',
                        startTime: '2024-01-19 14:15:00',
                        endTime: '2024-01-19 14:18:00',
                        duration: 180,
                        operator: 'tech-user',
                        results: {
                            breathability: 'poor',
                            pressureDrop: 220,
                            reason: 'Exceeded maximum pressure drop threshold'
                        },
                        notes: 'Failed due to high resistance. Device rejected.'
                    },
                    {
                        id: 'test_003',
                        name: 'FFP3 Mask Durability Test',
                        testType: 'durability',
                        deviceType: 'ffp3',
                        deviceModel: 'SafeGuard FFP3-Pro',
                        status: 'passed',
                        startTime: '2024-01-18 09:00:00',
                        endTime: '2024-01-18 09:45:00',
                        duration: 2700,
                        operator: 'admin',
                        results: {
                            durabilityScore: 88.5,
                            cyclesPassed: 450,
                            structuralIntegrity: 'excellent'
                        },
                        notes: 'Extended durability test - excellent performance'
                    },
                    {
                        id: 'test_004',
                        name: 'Custom Scenario Test #SC001',
                        testType: 'custom',
                        deviceType: 'ffp2',
                        deviceModel: 'Custom Test Device',
                        status: 'cancelled',
                        startTime: '2024-01-17 16:20:00',
                        endTime: '2024-01-17 16:22:00',
                        duration: 120,
                        operator: 'operator2',
                        results: {
                            reason: 'Equipment malfunction during test execution'
                        },
                        notes: 'Test cancelled due to sensor error. Device needs recalibration.'
                    }
                ];
                
                historyState.testHistory = mockHistory;
                historyState.isLoading = false;
                
                console.log(`📅 Loaded ${mockHistory.length} test history records`);
            }, 1000);
        };
        
        const filterHistory = () => {
            // Filter logic would be applied here
            console.log('📅 Applying history filters:', {
                filter: historyState.historyFilter,
                dateFilter: historyState.dateFilter,
                search: historyState.searchQuery
            });
        };
        
        const sortHistory = (field) => {
            if (historyState.sortBy === field) {
                historyState.sortOrder = historyState.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                historyState.sortBy = field;
                historyState.sortOrder = 'desc';
            }
            
            console.log(`📅 Sorting by ${field} (${historyState.sortOrder})`);
        };
        
        const selectHistoryItem = (item) => {
            historyState.selectedItem = item;
            console.log('📅 Selected test history item:', item.name);
            emit('history-item-selected', item);
        };
        
        const exportHistory = (format = 'csv') => {
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    totalRecords: filteredHistory.value.length,
                    filters: {
                        status: historyState.historyFilter,
                        dateRange: historyState.dateFilter,
                        search: historyState.searchQuery
                    },
                    format: format
                },
                data: filteredHistory.value
            };
            
            console.log(`📤 Exporting ${exportData.data.length} history records as ${format}`);
            emit('history-export', exportData);
        };
        
        const closeHistory = () => {
            historyState.active = false;
            historyState.selectedItem = null;
        };
        
        const getStatusColor = (status) => {
            const colors = {
                'passed': 'success',
                'failed': 'danger', 
                'cancelled': 'warning',
                'running': 'info'
            };
            return colors[status] || 'secondary';
        };
        
        const formatDuration = (seconds) => {
            if (seconds < 60) return `${seconds}s`;
            if (seconds < 3600) return `${Math.floor(seconds/60)}m ${seconds%60}s`;
            const hours = Math.floor(seconds/3600);
            const mins = Math.floor((seconds%3600)/60);
            return `${hours}h ${mins}m`;
        };
        
        // Computed properties
        const filteredHistory = computed(() => {
            let filtered = [...historyState.testHistory];
            
            // Status filter
            if (historyState.historyFilter !== 'all') {
                filtered = filtered.filter(item => item.status === historyState.historyFilter);
            }
            
            // Search filter
            if (historyState.searchQuery.trim()) {
                const query = historyState.searchQuery.toLowerCase();
                filtered = filtered.filter(item => 
                    item.name.toLowerCase().includes(query) ||
                    item.deviceModel.toLowerCase().includes(query) ||
                    item.operator.toLowerCase().includes(query)
                );
            }
            
            // Sort
            filtered.sort((a, b) => {
                let aVal = a[historyState.sortBy];
                let bVal = b[historyState.sortBy];
                
                if (historyState.sortBy === 'date') {
                    aVal = new Date(a.startTime);
                    bVal = new Date(b.startTime);
                }
                
                if (historyState.sortOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
            
            return filtered;
        });
        
        const historyStats = computed(() => {
            const total = historyState.testHistory.length;
            const passed = historyState.testHistory.filter(t => t.status === 'passed').length;
            const failed = historyState.testHistory.filter(t => t.status === 'failed').length;
            const cancelled = historyState.testHistory.filter(t => t.status === 'cancelled').length;
            
            return { total, passed, failed, cancelled };
        });
        
        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: TestHistoryComponent mounted');
        });
        
        return {
            historyState,
            filteredHistory,
            historyStats,
            showTestHistory,
            loadTestHistory,
            filterHistory,
            sortHistory,
            selectHistoryItem,
            exportHistory,
            closeHistory,
            getStatusColor,
            formatDuration
        };
    },
    
    template: `
        <div v-if="historyState.active" class="history-modal">
            <div class="modal-overlay" @click="closeHistory"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>📅 Test History ({{ historyStats.total }} records)</h3>
                    <button @click="closeHistory" class="close-btn">✕</button>
                </div>
                
                <div class="history-stats">
                    <div class="stat-item success">✅ Passed: {{ historyStats.passed }}</div>
                    <div class="stat-item danger">❌ Failed: {{ historyStats.failed }}</div>
                    <div class="stat-item warning">⏹️ Cancelled: {{ historyStats.cancelled }}</div>
                </div>
                
                <div class="history-filters">
                    <div class="filter-group">
                        <label>Status:</label>
                        <select v-model="historyState.historyFilter" @change="filterHistory">
                            <option value="all">All Tests</option>
                            <option value="passed">Passed Only</option>
                            <option value="failed">Failed Only</option>
                            <option value="cancelled">Cancelled Only</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Date Range:</label>
                        <select v-model="historyState.dateFilter" @change="filterHistory">
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Search:</label>
                        <input v-model="historyState.searchQuery" 
                               type="text" 
                               placeholder="Search tests..."
                               @input="filterHistory">
                    </div>
                    
                    <button @click="exportHistory('csv')" class="btn btn-primary">
                        📤 Export CSV
                    </button>
                </div>
                
                <div class="modal-body">
                    <div v-if="historyState.isLoading" class="loading-state">
                        <div class="spinner">⏳</div>
                        <p>Loading test history...</p>
                    </div>
                    
                    <div v-else class="history-table">
                        <div class="table-header">
                            <div class="col-name" @click="sortHistory('name')">
                                Test Name 
                                <span v-if="historyState.sortBy === 'name'">
                                    {{ historyState.sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </div>
                            <div class="col-type" @click="sortHistory('testType')">
                                Type
                                <span v-if="historyState.sortBy === 'testType'">
                                    {{ historyState.sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </div>
                            <div class="col-status" @click="sortHistory('status')">
                                Status
                                <span v-if="historyState.sortBy === 'status'">
                                    {{ historyState.sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </div>
                            <div class="col-date" @click="sortHistory('date')">
                                Date
                                <span v-if="historyState.sortBy === 'date'">
                                    {{ historyState.sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </div>
                            <div class="col-duration">Duration</div>
                        </div>
                        
                        <div v-for="item in filteredHistory" 
                             :key="item.id"
                             class="table-row"
                             :class="{ active: historyState.selectedItem?.id === item.id }"
                             @click="selectHistoryItem(item)">
                            <div class="col-name">
                                <strong>{{ item.name }}</strong>
                                <div class="device-info">{{ item.deviceModel }}</div>
                            </div>
                            <div class="col-type">
                                <span class="type-badge">{{ item.testType }}</span>
                            </div>
                            <div class="col-status">
                                <span class="status-badge" :class="getStatusColor(item.status)">
                                    {{ item.status }}
                                </span>
                            </div>
                            <div class="col-date">
                                {{ new Date(item.startTime).toLocaleDateString() }}
                                <div class="time-info">{{ new Date(item.startTime).toLocaleTimeString() }}</div>
                            </div>
                            <div class="col-duration">
                                {{ formatDuration(item.duration) }}
                            </div>
                        </div>
                        
                        <div v-if="filteredHistory.length === 0" class="no-results">
                            📭 No test records found matching the current filters
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    style: `
        .history-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
        }
        
        .modal-container {
            position: relative;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            width: 95%;
            max-width: 1000px;
            max-height: 85vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            background: #f8f9fa;
        }
        
        .history-stats {
            display: flex;
            gap: 16px;
            padding: 12px 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }
        
        .stat-item {
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .stat-item.success { color: #28a745; }
        .stat-item.danger { color: #dc3545; }
        .stat-item.warning { color: #ffc107; }
        
        .history-filters {
            display: flex;
            gap: 16px;
            align-items: end;
            padding: 16px 20px;
            background: white;
            border-bottom: 1px solid #e9ecef;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .filter-group label {
            font-size: 0.9em;
            font-weight: 600;
            color: #333;
        }
        
        .filter-group select, .filter-group input {
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        .modal-body {
            flex: 1;
            overflow-y: auto;
        }
        
        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            color: #666;
        }
        
        .spinner {
            font-size: 2em;
            margin-bottom: 16px;
            animation: spin 2s linear infinite;
        }
        
        .history-table {
            display: flex;
            flex-direction: column;
        }
        
        .table-header, .table-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
            gap: 12px;
            padding: 12px 20px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .table-header {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
            position: sticky;
            top: 0;
        }
        
        .table-header > div {
            cursor: pointer;
            user-select: none;
        }
        
        .table-header > div:hover {
            color: #007bff;
        }
        
        .table-row {
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .table-row:hover {
            background: #f8f9fa;
        }
        
        .table-row.active {
            background: #e7f3ff;
            border-left: 4px solid #007bff;
        }
        
        .device-info, .time-info {
            font-size: 0.8em;
            color: #666;
            margin-top: 2px;
        }
        
        .type-badge, .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .type-badge {
            background: #e9ecef;
            color: #495057;
        }
        
        .status-badge.success {
            background: #d4edda;
            color: #155724;
        }
        
        .status-badge.danger {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-badge.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .no-results {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
        
        .btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9em;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #007bff;
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: #666;
            padding: 4px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `
};

window.TestHistoryComponent = TestHistoryComponent;
console.log('📅 Vue TestHistoryComponent loaded');
