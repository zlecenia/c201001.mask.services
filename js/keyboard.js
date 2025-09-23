/**
 * Virtual Keyboard for MASKTRONIC C20
 * Handles all keyboard input and interactions
 */

class VirtualKeyboard {
    constructor() {
        this.shiftActive = false;
        this.capsActive = false;
        this.activeInput = null;
        this.keyboardElement = document.getElementById('virtual-keyboard');
        this.init();
    }

    init() {
        // Set up input focus tracking
        const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.activeInput = input;
                // Show keyboard when input is focused
                this.showKeyboard();
                input.setAttribute('data-focused', 'true');
            });

            input.addEventListener('blur', () => {
                input.removeAttribute('data-focused');
            });
        });

        // Set up keyboard event listeners
        if (this.keyboardElement) {
            this.keyboardElement.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent focus loss on button click
            });

            this.keyboardElement.addEventListener('click', (e) => {
                const key = e.target.closest('.keyboard-key');
                if (!key) {
                    console.log('🎹 Click detected but no keyboard-key found:', e.target);
                    return;
                }

                const char = key.getAttribute('data-char');
                const action = key.getAttribute('data-action');
                
                console.log('🎹 VirtualKeyboard key clicked:', { char, action, element: key, keyId: key.id });
                
                // Add visual feedback
                key.classList.add('key-press');
                setTimeout(() => key.classList.remove('key-press'), 150);

                if (action === 'backspace') {
                    this.backspace();
                } else if (action === 'enter') {
                    this.handleEnter();
                } else if (action === 'space') {
                    this.insertCharacter(' ');
                } else if (action === 'shift') {
                    this.toggleShift();
                } else if (action === 'caps') {
                    this.toggleCaps();
                } else if (action === 'tab') {
                    this.focusNextInput();
                } else if (action === 'clear') {
                    this.clearInput();
                } else if (char) {
                    // Use shift character if shift is active
                    const shiftChar = key.getAttribute('data-shift-char');
                    const charToInsert = this.shiftActive && shiftChar ? shiftChar : char;
                    console.log('Inserting character:', charToInsert);
                    this.insertCharacter(charToInsert);
                    
                    // Auto-disable shift after one character
                    if (this.shiftActive) {
                        this.shiftActive = false;
                        this.updateKeyboardState();
                    }
                }
            });
        }

        // Handle physical keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                this.shiftActive = true;
                this.updateKeyboardState();
            } else if (e.key === 'CapsLock') {
                this.toggleCaps();
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                this.shiftActive = false;
                this.updateKeyboardState();
            }
        });
    }

    handleAction(action) {
        switch (action) {
            case 'backspace':
                this.backspace();
                break;
            case 'enter':
                this.insertCharacter('\n');
                break;
            case 'space':
                this.insertCharacter(' ');
                break;
            case 'tab':
                this.insertCharacter('\t');
                this.focusNextInput();
                break;
            case 'shift':
                this.toggleShift();
                break;
            case 'caps':
                this.toggleCaps();
                break;
            case 'clear':
                if (this.activeInput) {
                    this.activeInput.value = '';
                }
                break;
            case 'toggle':
                this.toggleNumeric();
                break;
        }
    }

    insertCharacter(char) {
        if (!this.activeInput) {
            // Default to password input if no active input
            this.activeInput = document.getElementById('password-input');
        }
        
        if (!this.activeInput) {
            console.error('No active input found for character insertion');
            return;
        }
        
        console.log('Inserting character into input:', this.activeInput.id, char);
        
        const start = this.activeInput.selectionStart || 0;
        const end = this.activeInput.selectionEnd || 0;
        const value = this.activeInput.value;
        
        // Replace selected text or insert at cursor
        this.activeInput.value = value.substring(0, start) + char + value.substring(end);
        
        // Move cursor to after the inserted character
        const newPos = start + char.length;
        this.activeInput.setSelectionRange(newPos, newPos);
        
        // Keep focus on the input
        this.activeInput.focus();
        
        // Trigger input event for any listeners
        const event = new Event('input', { bubbles: true });
        this.activeInput.dispatchEvent(event);
        
        console.log('Character inserted, new value:', this.activeInput.value);
    }

    backspace() {
        if (!this.activeInput) {
            this.activeInput = document.getElementById('password-input');
        }
        
        if (!this.activeInput) return;
        
        const start = this.activeInput.selectionStart || 0;
        const end = this.activeInput.selectionEnd || 0;
        const value = this.activeInput.value;
        
        if (start === end && start > 0) {
            // Delete character before cursor
            this.activeInput.value = value.substring(0, start - 1) + value.substring(end);
            this.activeInput.setSelectionRange(start - 1, start - 1);
        } else if (start !== end) {
            // Delete selected text
            this.activeInput.value = value.substring(0, start) + value.substring(end);
            this.activeInput.setSelectionRange(start, start);
        }
        
        // Keep focus on the input
        this.activeInput.focus();
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        this.activeInput.dispatchEvent(event);
    }

    handleEnter() {
        // For login form, could trigger login if password is entered
        if (this.activeInput && this.activeInput.id === 'password-input') {
            const password = this.activeInput.value.trim();
            if (password) {
                console.log('Enter pressed on password field with value:', password);
            }
        }
    }

    clearInput() {
        if (!this.activeInput) {
            this.activeInput = document.getElementById('password-input');
        }
        
        if (this.activeInput) {
            this.activeInput.value = '';
            this.activeInput.focus();
            
            // Trigger input event
            const event = new Event('input', { bubbles: true });
            this.activeInput.dispatchEvent(event);
        }
    }

    focusNextInput() {
        const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="password"]'));
        const currentIndex = inputs.indexOf(this.activeInput);
        
        if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        } else if (inputs.length > 0) {
            inputs[0].focus(); // Loop back to first input
        }
    }

    toggleShift() {
        this.shiftActive = !this.shiftActive;
        this.updateKeyboardState();
    }

    toggleCaps() {
        this.capsActive = !this.capsActive;
        this.updateKeyboardState();
    }

    toggleNumeric() {
        const numericKeys = this.keyboardElement.querySelectorAll('.keyboard-key:not([data-action])');
        const isNumeric = numericKeys[0].textContent.trim().match(/^[0-9]$/);
        
        numericKeys.forEach(key => {
            if (isNumeric) {
                // Switch to QWERTY
                const char = key.getAttribute('data-char');
                if (char) {
                    key.textContent = char;
                    const subChar = key.querySelector('.sub-char');
                    if (subChar) subChar.remove();
                }
            } else {
                // Switch to numbers
                const char = key.getAttribute('data-shift-char');
                if (char && char.match(/[^a-zA-Z]/)) {
                    key.textContent = char;
                    const subChar = document.createElement('span');
                    subChar.className = 'sub-char';
                    subChar.textContent = key.getAttribute('data-char');
                    key.appendChild(subChar);
                }
            }
        });
    }

    updateKeyboardState() {
        // Update shift key state
        const shiftKeys = this.keyboardElement.querySelectorAll('.keyboard-key[data-action="shift"]');
        shiftKeys.forEach(key => {
            if (this.shiftActive) {
                key.classList.add('shift-active');
            } else {
                key.classList.remove('shift-active');
            }
        });

        // Update caps key state
        const capsKey = this.keyboardElement.querySelector('.keyboard-key[data-action="caps"]');
        if (capsKey) {
            if (this.capsActive) {
                capsKey.classList.add('caps-active');
            } else {
                capsKey.classList.remove('caps-active');
            }
        }

        // Update character cases
        const charKeys = this.keyboardElement.querySelectorAll('.keyboard-key[data-char]');
        charKeys.forEach(key => {
            const char = key.getAttribute('data-char');
            if (char && char.match(/[a-z]/)) {
                if (this.shiftActive || this.capsActive) {
                    key.textContent = char.toUpperCase();
                } else {
                    key.textContent = char.toLowerCase();
                }
            }
        });
    }
}

// Initialize the keyboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎹 Initializing VirtualKeyboard class...');
    const keyboard = new VirtualKeyboard();
    window.virtualKeyboard = keyboard; // Expose for debugging
    console.log('✅ VirtualKeyboard initialized:', keyboard);
});

// Add to global scope for HTML onclick handlers
function addToPassword(char) {
    const input = document.getElementById('password-input');
    if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const value = input.value;
        input.value = value.substring(0, start) + char + value.substring(end);
        input.selectionStart = input.selectionEnd = start + char.length;
        input.focus();
    }
}

// Toggle password visibility function
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password-input');
    const toggleButton = document.querySelector('.toggle-password');
    
    if (passwordInput && toggleButton) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.textContent = '🙈'; // Hide icon
            toggleButton.title = 'Hide password';
        } else {
            passwordInput.type = 'password';
            toggleButton.textContent = '👁️'; // Show icon
            toggleButton.title = 'Show password';
        }
        
        // Keep focus on the input
        passwordInput.focus();
        
        // Move cursor to end of input
        setTimeout(() => {
            passwordInput.setSelectionRange(passwordInput.value.length, passwordInput.value.length);
        }, 10);
    }
}

// Export functions to global scope
window.addToPassword = addToPassword;
window.togglePasswordVisibility = togglePasswordVisibility;
