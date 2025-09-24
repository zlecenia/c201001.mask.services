/**
 * MASKTRONIC C20 - Test Templates Component (Modular)
 * Extracted from TestMenuTemplate.js for better maintainability
 * Handles test templates management and selection
 */

const TestTemplatesComponent = {
    name: 'TestTemplatesComponent',
    props: {
        user: { type: Object, required: true },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['template-selected', 'template-created'],
    
    setup(props, { emit }) {
        // Vue.js imports
        const { reactive, computed, onMounted } = Vue;
        
        // Test Templates State
        const templatesState = reactive({
            active: false,
            templates: [],
            selectedTemplate: null,
            isCreating: false,
            newTemplate: {
                name: '',
                description: '',
                category: 'general',
                configuration: {}
            },
            categoryFilter: 'all',
            sortBy: 'name'
        });
        
        // Test Templates Methods
        const showTestTemplates = () => {
            console.log('📋 Opening Test Templates management');
            templatesState.active = true;
            loadTestTemplates();
        };
        
        const loadTestTemplates = () => {
            console.log('📋 Loading test templates...');
            
            // Mock templates data
            templatesState.templates = [
                {
                    id: 'template_001',
                    name: 'FFP2 Standard Filtration',
                    description: 'Standard filtration test for FFP2 masks according to EN 149',
                    category: 'filtration',
                    deviceType: 'ffp2',
                    testType: 'filtration',
                    createdBy: 'admin',
                    createdAt: '2024-01-15',
                    isPublic: true,
                    usageCount: 25,
                    configuration: {
                        duration: 300,
                        pressure: 150,
                        cycles: 3,
                        tolerance: 5,
                        standard: 'EN 149'
                    }
                },
                {
                    id: 'template_002',
                    name: 'Surgical Mask Breathability Quick Test',
                    description: 'Quick breathability assessment for surgical masks',
                    category: 'breathability',
                    deviceType: 'surgical',
                    testType: 'breathability',
                    createdBy: 'tech-user',
                    createdAt: '2024-01-12',
                    isPublic: true,
                    usageCount: 18,
                    configuration: {
                        duration: 180,
                        pressure: 100,
                        cycles: 1,
                        tolerance: 8,
                        standard: 'EN 14683'
                    }
                },
                {
                    id: 'template_003',
                    name: 'FFP3 High-Performance Test',
                    description: 'Comprehensive high-performance test for FFP3 respirators',
                    category: 'comprehensive',
                    deviceType: 'ffp3',
                    testType: 'comprehensive',
                    createdBy: 'specialist',
                    createdAt: '2024-01-10',
                    isPublic: true,
                    usageCount: 12,
                    configuration: {
                        duration: 600,
                        pressure: 200,
                        cycles: 5,
                        tolerance: 3,
                        standard: 'EN 149',
                        additionalTests: ['durability', 'fit']
                    }
                },
                {
                    id: 'template_004',
                    name: 'Custom Fit Test Protocol',
                    description: 'User-specific fit testing protocol',
                    category: 'fit',
                    deviceType: 'various',
                    testType: 'fit',
                    createdBy: props.user.username || 'current-user',
                    createdAt: '2024-01-08',
                    isPublic: false,
                    usageCount: 5,
                    configuration: {
                        duration: 420,
                        pressure: 'variable',
                        cycles: 7,
                        tolerance: 10,
                        personalFit: true,
                        exercises: ['normal', 'deep', 'turn', 'up-down', 'talk']
                    }
                }
            ];
            
            console.log(`📋 Loaded ${templatesState.templates.length} test templates`);
        };
        
        const createNewTemplate = () => {
            templatesState.isCreating = true;
            templatesState.newTemplate = {
                name: '',
                description: '',
                category: 'general',
                configuration: {
                    duration: 300,
                    pressure: 150,
                    cycles: 1,
                    tolerance: 5
                }
            };
        };
        
        const saveNewTemplate = () => {
            const template = {
                id: `template_${Date.now()}`,
                ...templatesState.newTemplate,
                createdBy: props.user.username || 'Unknown',
                createdAt: new Date().toISOString().split('T')[0],
                isPublic: false,
                usageCount: 0
            };
            
            templatesState.templates.push(template);
            templatesState.isCreating = false;
            
            console.log('✅ New template created:', template);
            emit('template-created', template);
        };
        
        const useTemplate = (template) => {
            console.log('📋 Using template:', template.name);
            templatesState.selectedTemplate = template;
            
            // Increment usage count
            template.usageCount++;
            
            console.log('📋 Template configuration:', template.configuration);
            emit('template-selected', template);
        };
        
        const duplicateTemplate = (template) => {
            const duplicated = {
                ...template,
                id: `template_${Date.now()}`,
                name: `${template.name} (Copy)`,
                createdBy: props.user.username || 'Unknown',
                createdAt: new Date().toISOString().split('T')[0],
                isPublic: false,
                usageCount: 0
            };
            
            templatesState.templates.push(duplicated);
            console.log('📋 Template duplicated:', duplicated.name);
        };
        
        const deleteTemplate = (template) => {
            if (template.createdBy === props.user.username || props.user.role === 'ADMIN') {
                const index = templatesState.templates.findIndex(t => t.id === template.id);
                if (index !== -1) {
                    templatesState.templates.splice(index, 1);
                    console.log('🗑️ Template deleted:', template.name);
                }
            } else {
                console.log('❌ Cannot delete template: insufficient permissions');
            }
        };
        
        const closeTemplates = () => {
            templatesState.active = false;
            templatesState.isCreating = false;
            templatesState.selectedTemplate = null;
        };
        
        const getCategoryIcon = (category) => {
            const icons = {
                'filtration': '🧪',
                'breathability': '💨',
                'fit': '👤',
                'durability': '🛡️',
                'comprehensive': '📊',
                'general': '📋'
            };
            return icons[category] || '📋';
        };
        
        const getCategoryColor = (category) => {
            const colors = {
                'filtration': 'blue',
                'breathability': 'green',
                'fit': 'purple',
                'durability': 'orange',
                'comprehensive': 'red',
                'general': 'gray'
            };
            return colors[category] || 'gray';
        };
        
        // Computed properties
        const filteredTemplates = computed(() => {
            let filtered = [...templatesState.templates];
            
            // Category filter
            if (templatesState.categoryFilter !== 'all') {
                filtered = filtered.filter(t => t.category === templatesState.categoryFilter);
            }
            
            // Sort
            filtered.sort((a, b) => {
                if (templatesState.sortBy === 'name') {
                    return a.name.localeCompare(b.name);
                } else if (templatesState.sortBy === 'usage') {
                    return b.usageCount - a.usageCount;
                } else if (templatesState.sortBy === 'date') {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return 0;
            });
            
            return filtered;
        });
        
        const templateCategories = computed(() => {
            const categories = [...new Set(templatesState.templates.map(t => t.category))];
            return categories.sort();
        });
        
        const templateStats = computed(() => {
            const total = templatesState.templates.length;
            const public = templatesState.templates.filter(t => t.isPublic).length;
            const private = total - public;
            const myTemplates = templatesState.templates.filter(t => t.createdBy === props.user.username).length;
            
            return { total, public, private, myTemplates };
        });
        
        // Lifecycle
        onMounted(() => {
            console.log('🔶 Vue: TestTemplatesComponent mounted');
        });
        
        return {
            templatesState,
            filteredTemplates,
            templateCategories,
            templateStats,
            showTestTemplates,
            loadTestTemplates,
            createNewTemplate,
            saveNewTemplate,
            useTemplate,
            duplicateTemplate,
            deleteTemplate,
            closeTemplates,
            getCategoryIcon,
            getCategoryColor
        };
    },
    
    template: `
        <div v-if="templatesState.active" class="templates-modal">
            <div class="modal-overlay" @click="closeTemplates"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>📋 Test Templates ({{ templateStats.total }})</h3>
                    <button @click="closeTemplates" class="close-btn">✕</button>
                </div>
                
                <div class="templates-stats">
                    <div class="stat-item">📊 Total: {{ templateStats.total }}</div>
                    <div class="stat-item">🌐 Public: {{ templateStats.public }}</div>
                    <div class="stat-item">🔒 Private: {{ templateStats.private }}</div>
                    <div class="stat-item">👤 My Templates: {{ templateStats.myTemplates }}</div>
                </div>
                
                <div class="templates-filters">
                    <div class="filter-group">
                        <label>Category:</label>
                        <select v-model="templatesState.categoryFilter">
                            <option value="all">All Categories</option>
                            <option v-for="category in templateCategories" :key="category" :value="category">
                                {{ getCategoryIcon(category) }} {{ category }}
                            </option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Sort by:</label>
                        <select v-model="templatesState.sortBy">
                            <option value="name">Name</option>
                            <option value="usage">Usage Count</option>
                            <option value="date">Date Created</option>
                        </select>
                    </div>
                    
                    <button @click="createNewTemplate" class="btn btn-primary">
                        ➕ Create New Template
                    </button>
                </div>
                
                <div class="modal-body">
                    <div v-if="templatesState.isCreating" class="template-form">
                        <h4>Create New Template</h4>
                        
                        <div class="form-group">
                            <label>Template Name:</label>
                            <input v-model="templatesState.newTemplate.name" 
                                   type="text" 
                                   placeholder="Enter template name">
                        </div>
                        
                        <div class="form-group">
                            <label>Description:</label>
                            <textarea v-model="templatesState.newTemplate.description" 
                                      placeholder="Template description"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Category:</label>
                            <select v-model="templatesState.newTemplate.category">
                                <option value="general">General</option>
                                <option value="filtration">Filtration</option>
                                <option value="breathability">Breathability</option>
                                <option value="fit">Fit Testing</option>
                                <option value="durability">Durability</option>
                                <option value="comprehensive">Comprehensive</option>
                            </select>
                        </div>
                        
                        <div class="config-group">
                            <h5>Test Configuration:</h5>
                            <div class="config-grid">
                                <div class="config-item">
                                    <label>Duration (seconds):</label>
                                    <input v-model.number="templatesState.newTemplate.configuration.duration" type="number">
                                </div>
                                <div class="config-item">
                                    <label>Pressure (Pa):</label>
                                    <input v-model.number="templatesState.newTemplate.configuration.pressure" type="number">
                                </div>
                                <div class="config-item">
                                    <label>Cycles:</label>
                                    <input v-model.number="templatesState.newTemplate.configuration.cycles" type="number">
                                </div>
                                <div class="config-item">
                                    <label>Tolerance (%):</label>
                                    <input v-model.number="templatesState.newTemplate.configuration.tolerance" type="number">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button @click="saveNewTemplate" class="btn btn-success">💾 Save Template</button>
                            <button @click="templatesState.isCreating = false" class="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                    
                    <div class="templates-grid">
                        <div v-for="template in filteredTemplates" 
                             :key="template.id" 
                             class="template-card"
                             :class="getCategoryColor(template.category)">
                            <div class="template-header">
                                <div class="template-icon">
                                    {{ getCategoryIcon(template.category) }}
                                </div>
                                <div class="template-info">
                                    <h4>{{ template.name }}</h4>
                                    <p>{{ template.description }}</p>
                                </div>
                                <div class="template-actions">
                                    <button @click="useTemplate(template)" class="btn btn-primary btn-sm">
                                        🚀 Use
                                    </button>
                                    <button @click="duplicateTemplate(template)" class="btn btn-secondary btn-sm">
                                        📋 Copy
                                    </button>
                                    <button v-if="template.createdBy === user.username || user.role === 'ADMIN'" 
                                            @click="deleteTemplate(template)" 
                                            class="btn btn-danger btn-sm">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            
                            <div class="template-meta">
                                <div class="meta-item">
                                    <strong>Type:</strong> {{ template.deviceType }} - {{ template.testType }}
                                </div>
                                <div class="meta-item">
                                    <strong>Created:</strong> {{ template.createdAt }} by {{ template.createdBy }}
                                </div>
                                <div class="meta-item">
                                    <strong>Usage:</strong> {{ template.usageCount }} times
                                    <span v-if="template.isPublic" class="public-badge">🌐 Public</span>
                                    <span v-else class="private-badge">🔒 Private</span>
                                </div>
                            </div>
                            
                            <div class="template-config">
                                <div class="config-summary">
                                    <span>⏱️ {{ template.configuration.duration }}s</span>
                                    <span>🔧 {{ template.configuration.pressure }}Pa</span>
                                    <span>🔄 {{ template.configuration.cycles }} cycles</span>
                                    <span>📊 ±{{ template.configuration.tolerance }}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="filteredTemplates.length === 0" class="no-templates">
                            📭 No templates found matching the current filters
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    style: `
        .templates-modal {
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
        
        .templates-stats {
            display: flex;
            gap: 16px;
            padding: 12px 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }
        
        .stat-item {
            font-size: 0.9em;
            font-weight: 600;
            color: #666;
        }
        
        .templates-filters {
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
        
        .filter-group select {
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        .modal-body {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }
        
        .template-form {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 16px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: #333;
        }
        
        .form-group input, .form-group textarea, .form-group select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1em;
        }
        
        .config-group h5 {
            margin: 16px 0 12px 0;
            color: #333;
        }
        
        .config-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        
        .config-item label {
            font-size: 0.9em;
        }
        
        .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
        }
        
        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 16px;
        }
        
        .template-card {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 16px;
            background: white;
            transition: all 0.3s;
        }
        
        .template-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        
        .template-card.blue:hover { border-color: #007bff; }
        .template-card.green:hover { border-color: #28a745; }
        .template-card.purple:hover { border-color: #6f42c1; }
        .template-card.orange:hover { border-color: #fd7e14; }
        .template-card.red:hover { border-color: #dc3545; }
        .template-card.gray:hover { border-color: #6c757d; }
        
        .template-header {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .template-icon {
            font-size: 1.8em;
            width: 40px;
            text-align: center;
        }
        
        .template-info {
            flex: 1;
        }
        
        .template-info h4 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 1.1em;
        }
        
        .template-info p {
            margin: 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .template-actions {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .template-meta {
            margin-bottom: 12px;
        }
        
        .meta-item {
            font-size: 0.8em;
            color: #666;
            margin-bottom: 4px;
        }
        
        .public-badge, .private-badge {
            margin-left: 8px;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 0.7em;
            font-weight: 600;
        }
        
        .public-badge {
            background: #d4edda;
            color: #155724;
        }
        
        .private-badge {
            background: #f8d7da;
            color: #721c24;
        }
        
        .template-config {
            border-top: 1px solid #e9ecef;
            padding-top: 8px;
        }
        
        .config-summary {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .config-summary span {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 0.75em;
            color: #495057;
        }
        
        .no-templates {
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
        
        .btn-sm {
            padding: 4px 8px;
            font-size: 0.8em;
        }
        
        .btn-primary { background: #007bff; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        
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
    `
};

window.TestTemplatesComponent = TestTemplatesComponent;
console.log('📋 Vue TestTemplatesComponent loaded');
