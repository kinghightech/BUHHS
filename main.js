import './style.css';
import { supabase } from './supabase.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authCard = document.getElementById('auth-card');
const successCard = document.getElementById('success-card');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authMessage = document.getElementById('auth-message');

const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');

// Toggle between Login and Signup
showSignup?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Join the BUHHS 2026 community';
    clearMessage();
});

showLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    authTitle.textContent = 'Welcome Back';
    authSubtitle.textContent = 'Enter your details to access your account';
    clearMessage();
});

// Helper Functions
function showMessage(text, type = 'error') {
    if (!authMessage) return;
    authMessage.textContent = text;
    authMessage.className = `message ${type}`;
}

function clearMessage() {
    if (!authMessage) return;
    authMessage.textContent = '';
    authMessage.className = 'message';
}

function showSuccessScreen() {
    authCard?.classList.add('hidden');
    successCard?.classList.remove('hidden');
}

function showAuthScreen() {
    successCard?.classList.add('hidden');
    authCard?.classList.remove('hidden');
}

// Auth Logic
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    if (error) {
        showMessage(error.message);
    } else {
        showSuccessScreen();
    }
});

signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match');
        return;
    }
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    
    if (error) {
        showMessage(error.message);
    } else {
        // Since confirm email is OFF, this will sign them in immediately
        showSuccessScreen();
    }
});

logoutBtn?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showAuthScreen();
});

// Check current session
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showSuccessScreen();
    }
}

checkSession();
