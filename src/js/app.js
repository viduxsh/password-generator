import { generatePassword, calculateEntropy } from './crypto.js';

tailwind.config = { darkMode: 'class' };

const DOM = {
    html: document.getElementById('html-tag'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    passwordDisplay: document.getElementById('password-display'),
    entropyDisplay: document.getElementById('entropy-val'),
    lengthInput: document.getElementById('length'),
    lengthVal: document.getElementById('length-val'),
    refreshBtn: document.getElementById('refresh-btn'),
    copyBtn: document.getElementById('copy-btn'),
    copyIcon: document.getElementById('copy-icon'),
    uppercase: document.getElementById('uppercase'),
    numbers: document.getElementById('numbers'),
    symbols: document.getElementById('symbols')
};

const CHARACTER_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

let clipboardTimeout = null;

function init() {
    setupTheme();
    setupEventListeners();
    updateUI();
}

function setupTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        DOM.html.classList.add('dark');
        DOM.themeIcon.textContent = 'light_mode';
    } else {
        DOM.html.classList.remove('dark');
        DOM.themeIcon.textContent = 'dark_mode';
    }
}

function toggleTheme() {
    if (DOM.html.classList.contains('dark')) {
        DOM.html.classList.remove('dark');
        DOM.themeIcon.textContent = 'dark_mode';
        localStorage.theme = 'light';
    } else {
        DOM.html.classList.add('dark');
        DOM.themeIcon.textContent = 'light_mode';
        localStorage.theme = 'dark';
    }
}

function setupEventListeners() {
    DOM.themeToggle.addEventListener('click', toggleTheme);
    DOM.refreshBtn.addEventListener('click', triggerRefreshAnimation);
    DOM.copyBtn.addEventListener('click', copyToClipboard);

    DOM.lengthInput.addEventListener('input', (e) => {
        DOM.lengthVal.textContent = e.target.value;
        DOM.lengthInput.setAttribute('aria-valuenow', e.target.value);
        updateUI();
    });

    [DOM.uppercase, DOM.numbers, DOM.symbols].forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            e.target.setAttribute('aria-checked', e.target.checked);
            updateUI();
        });
    });
}

function updateUI() {
    let pool = CHARACTER_SETS.lowercase;
    let poolSize = CHARACTER_SETS.lowercase.length;

    if (DOM.uppercase.checked) { pool += CHARACTER_SETS.uppercase; poolSize += CHARACTER_SETS.uppercase.length; }
    if (DOM.numbers.checked) { pool += CHARACTER_SETS.numbers; poolSize += CHARACTER_SETS.numbers.length; }
    if (DOM.symbols.checked) { pool += CHARACTER_SETS.symbols; poolSize += CHARACTER_SETS.symbols.length; }

    const length = +DOM.lengthInput.value;
    const password = generatePassword(length, pool);
    
    DOM.passwordDisplay.value = password;
    renderEntropy(length, poolSize);
}

function renderEntropy(length, poolSize) {
    const entropy = calculateEntropy(length, poolSize);
    DOM.entropyDisplay.textContent = `${entropy} bit`;

    DOM.entropyDisplay.className = "font-mono font-bold text-sm transition-colors duration-300 ";

    if (entropy < 60) {
        DOM.entropyDisplay.classList.add('text-red-500'); // Weak
    } else if (entropy < 80) {
        DOM.entropyDisplay.classList.add('text-amber-500'); // Moderate
    } else {
        DOM.entropyDisplay.classList.add('text-emerald-500'); // Excellent
    }
}

function triggerRefreshAnimation() {
    const icon = DOM.refreshBtn.querySelector('span');
    icon.classList.add('spin-anim');
    updateUI();
    setTimeout(() => icon.classList.remove('spin-anim'), 500);
}

async function copyToClipboard() {
    const targetValue = DOM.passwordDisplay.value;
    if (!targetValue) return;

    try {
        await navigator.clipboard.writeText(targetValue);
        DOM.copyIcon.textContent = 'check';
        
        setTimeout(() => DOM.copyIcon.textContent = 'content_copy', 1500);

        // Security Hardening
        if (clipboardTimeout) clearTimeout(clipboardTimeout);
        
        clipboardTimeout = setTimeout(async () => {
            try {
                const currentClipboard = await navigator.clipboard.readText();
                if (currentClipboard === targetValue) {
                    await navigator.clipboard.writeText('');
                    console.log('Clipboard ripulita automaticamente per sicurezza.');
                }
            } catch (err) {
                await navigator.clipboard.writeText('');
            }
        }, 20000);

    } catch (err) {
        console.error('Impossibile accedere agli appunti del sistema: ', err);
    }
}

document.addEventListener('DOMContentLoaded', init);
