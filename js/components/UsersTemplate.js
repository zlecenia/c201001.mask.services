/**
 * MASKTRONIC C20 - Vue.js Users Template Component
 * Replaces vanilla users-template.html
 * Advanced user management with roles and permissions
 */


const UsersTemplate = {
    name: 'UsersTemplate',
    props: {
        user: { type: Object, default: () => ({}) },
        language: { type: String, default: 'pl' }
    },
    
    emits: ['navigate', 'user-changed'],
    
    setup(props, { emit }) {
        // Vue.js imports - CRITICAL FIX for regression
        const { reactive, computed, onMounted } = Vue;
        
        const userState = reactive({
            isLoading: false,
            showAddUser: false,
            editingUser: null,
            selectedUsers: []
        });

        const users = reactive([
            { id: 1, username: 'operator1', role: 'OPERATOR', email: 'op1@test.com', active: true, lastLogin: '2025-09-23' },
            { id: 2, username: 'admin1', role: 'ADMIN', email: 'admin@test.com', active: true, lastLogin: '2025-09-24' },
            { id: 3, username: 'service1', role: 'SERVICE', email: 'service@test.com', active: true, lastLogin: '2025-09-22' },
            { id: 4, username: 'operator2', role: 'OPERATOR', email: 'op2@test.com', active: false, lastLogin: '2025-09-20' }
        ]);

        const newUser = reactive({
            username: '', email: '', role: 'OPERATOR', password: '', active: true
        });

        const pageTitle = computed(() => props.language === 'pl' ? 'Zarządzanie Użytkownikami' : 'Users Management');
        
        const roles = computed(() => [
            { value: 'OPERATOR', label: props.language === 'pl' ? 'Operator' : 'Operator', color: 'blue' },
            { value: 'ADMIN', label: props.language === 'pl' ? 'Administrator' : 'Admin', color: 'red' },
            { value: 'SERVICE', label: props.language === 'pl' ? 'Serwis' : 'Service', color: 'green' }
        ]);

        const addUser = () => {
            if (!newUser.username || !newUser.email) return;
            
            const user = {
                id: Date.now(),
                ...newUser,
                lastLogin: null
            };
            
            // PRODUCTION FIX: Use nextTick for safe DOM updates
            Vue.nextTick(() => {
                users.push(user);
                Object.assign(newUser, { username: '', email: '', role: 'OPERATOR', password: '', active: true });
                userState.showAddUser = false;
                
                emit('user-changed', { action: 'added', user });
            });
        };

        const editUser = (user) => {
            userState.editingUser = { ...user };
        };

        const saveUser = () => {
            const index = users.findIndex(u => u.id === userState.editingUser.id);
            if (index !== -1) {
                Object.assign(users[index], userState.editingUser);
                userState.editingUser = null;
                emit('user-changed', { action: 'updated', user: users[index] });
            }
        };

        const deleteUser = (userId) => {
            if (confirm(props.language === 'pl' ? 'Czy na pewno chcesz usunąć tego użytkownika?' : 'Are you sure?')) {
                const index = users.findIndex(u => u.id === userId);
                if (index !== -1) {
                    const deletedUser = users.splice(index, 1)[0];
                    emit('user-changed', { action: 'deleted', user: deletedUser });
                }
            }
        };

        const toggleUserStatus = (userId) => {
            const user = users.find(u => u.id === userId);
            if (user) {
                user.active = !user.active;
                emit('user-changed', { action: 'status_changed', user });
            }
        };

        const goBack = () => emit('navigate', 'user-menu-screen', props.language, 'default');

        onMounted(() => console.log('🔶 Vue: UsersTemplate component mounted'));

        return {
            userState, users, newUser, pageTitle, roles,
            addUser, editUser, saveUser, deleteUser, toggleUserStatus, goBack
        };
    },

    template: `
        <div class="users-template vue-component">
            <div class="template-container">
                <div class="template-header">
                    <button class="back-btn" @click="goBack">← Powrót</button>
                    <h2>{{ pageTitle }}</h2>
                    <div class="header-actions">
                        <button class="add-btn" @click="userState.showAddUser = !userState.showAddUser">
                            ➕ {{ language === 'pl' ? 'Dodaj użytkownika' : 'Add User' }}
                        </button>
                        <div class="vue-badge">Vue</div>
                    </div>
                </div>

                <!-- Add User Form -->
                <div v-if="userState.showAddUser" class="add-user-form">
                    <h3>{{ language === 'pl' ? 'Nowy użytkownik' : 'New User' }}</h3>
                    <div class="form-grid">
                        <input v-model="newUser.username" :placeholder="language === 'pl' ? 'Nazwa użytkownika' : 'Username'" />
                        <input v-model="newUser.email" type="email" :placeholder="language === 'pl' ? 'Email' : 'Email'" />
                        <select v-model="newUser.role">
                            <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
                        </select>
                        <input v-model="newUser.password" type="password" :placeholder="language === 'pl' ? 'Hasło' : 'Password'" />
                    </div>
                    <div class="form-actions">
                        <button @click="addUser" class="save-btn">{{ language === 'pl' ? 'Dodaj' : 'Add' }}</button>
                        <button @click="userState.showAddUser = false" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                    </div>
                </div>

                <!-- Users List -->
                <div class="users-list">
                    <div v-for="user in users" :key="user.id" class="user-item" :class="{ inactive: !user.active }">
                        <div class="user-info">
                            <div class="user-main">
                                <span class="username">{{ user.username }}</span>
                                <span class="user-email">{{ user.email }}</span>
                            </div>
                            <div class="user-meta">
                                <span class="role-badge" :class="'role-' + user.role.toLowerCase()">{{ user.role }}</span>
                                <span class="last-login">{{ user.lastLogin || 'Never' }}</span>
                            </div>
                        </div>
                        
                        <div class="user-actions">
                            <button @click="toggleUserStatus(user.id)" class="status-btn" :class="{ active: user.active }">
                                {{ user.active ? '✅' : '❌' }}
                            </button>
                            <button @click="editUser(user)" class="edit-btn">✏️</button>
                            <button @click="deleteUser(user.id)" class="delete-btn">🗑️</button>
                        </div>
                    </div>
                </div>

                <!-- Edit User Modal -->
                <div v-if="userState.editingUser" class="modal-overlay" @click="userState.editingUser = null">
                    <div class="modal-content" @click.stop>
                        <h3>{{ language === 'pl' ? 'Edytuj użytkownika' : 'Edit User' }}</h3>
                        <div class="form-grid">
                            <input v-model="userState.editingUser.username" :placeholder="language === 'pl' ? 'Nazwa' : 'Username'" />
                            <input v-model="userState.editingUser.email" type="email" :placeholder="language === 'pl' ? 'Email' : 'Email'" />
                            <select v-model="userState.editingUser.role">
                                <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button @click="saveUser" class="save-btn">{{ language === 'pl' ? 'Zapisz' : 'Save' }}</button>
                            <button @click="userState.editingUser = null" class="cancel-btn">{{ language === 'pl' ? 'Anuluj' : 'Cancel' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    style: `
        .users-template {
            min-height: 100vh;
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .template-container { max-width: 1200px; margin: 0 auto; }
        
        .template-header {
            display: flex; align-items: center; justify-content: space-between;
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .back-btn, .add-btn { 
            padding: 8px 16px; border: none; border-radius: 6px; 
            cursor: pointer; font-weight: 500; transition: all 0.3s; 
        }
        .back-btn { background: #6c757d; color: white; }
        .add-btn { background: #28a745; color: white; }
        
        .vue-badge { 
            background: #42b883; color: white; padding: 6px 12px; 
            border-radius: 16px; font-size: 0.9em; font-weight: 600; 
        }
        
        .add-user-form {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;
        }
        
        .form-grid { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 16px; margin-bottom: 16px; 
        }
        
        .form-grid input, .form-grid select {
            padding: 10px; border: 2px solid #e9ecef; border-radius: 6px;
            transition: border-color 0.3s;
        }
        
        .users-list { display: flex; flex-direction: column; gap: 16px; }
        
        .user-item {
            display: flex; justify-content: space-between; align-items: center;
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s;
        }
        
        .user-item.inactive { opacity: 0.6; }
        
        .user-info { display: flex; align-items: center; gap: 20px; }
        
        .username { font-weight: 600; font-size: 1.1em; }
        .user-email { color: #666; font-size: 0.9em; }
        
        .role-badge {
            padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600;
        }
        
        .role-operator { background: #d1ecf1; color: #0c5460; }
        .role-admin { background: #f8d7da; color: #721c24; }
        .role-service { background: #d4edda; color: #155724; }
        
        .user-actions { display: flex; gap: 8px; }
        
        .user-actions button {
            padding: 8px; border: none; border-radius: 6px; 
            cursor: pointer; transition: all 0.3s;
        }
        
        .status-btn { background: #f8f9fa; }
        .status-btn.active { background: #d4edda; }
        .edit-btn { background: #fff3cd; }
        .delete-btn { background: #f8d7da; }
        
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white; padding: 24px; border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2); min-width: 400px;
        }
        
        .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
        
        .save-btn { background: #28a745; color: white; }
        .cancel-btn { background: #6c757d; color: white; }
    `
};

window.UsersTemplate = UsersTemplate;
console.log('🔶 Vue UsersTemplate component loaded');
