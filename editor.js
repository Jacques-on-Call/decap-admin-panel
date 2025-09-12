document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const AUTH_URL = 'https://auth.strategycontent.agency/auth';
    const OAUTH_CLIENT_ID = 'Ov23li6LEsxbtoV7ITp1';
    const REPO_OWNER = 'Jacques-on-Call';
    const REPO_NAME = 'StrategyContent';
    const GITHUB_API_BASE_URL = 'https://api.github.com';

    // --- DOM ELEMENTS ---
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const metadataEditorDiv = document.getElementById('editor-panel');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const saveBtn = document.getElementById('save-btn');
    const createNewBtn = document.getElementById('create-new-btn');
    const fileListDiv = document.getElementById('file-list');
    const backBtn = document.getElementById('back-btn');
    const currentPathSpan = document.getElementById('current-path');
    const toastContainer = document.getElementById('toast-container');
    const mobileShowFilesBtn = document.getElementById('mobile-show-files-btn');
    const mobileShowEditorBtn = document.getElementById('mobile-show-editor-btn');

    // --- STATE ---
    let accessToken = null;
    let currentPath = '';
    let editorConfig = null;
    let currentFile = { frontmatter: null, body: null, sha: null };

    // --- GITHUB API CLIENT ---
    const github = {
        async fetch(endpoint, options = {}) {
            const url = `${GITHUB_API_BASE_URL}${endpoint}`;
            const headers = { 'Authorization': `token ${accessToken}`, 'Accept': 'application/vnd.github.v3+json', ...options.headers };
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API request failed: ${response.statusText}. Message: ${errorData.message}`);
            }
            if (response.status === 204) return null;
            return response.json();
        },
        getRepoContents(path = '') { return this.fetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`); },
        getFileContent(path) { return this.fetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`); },
        commitFile(path, content, commitMessage, sha) {
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            const body = { message: commitMessage, content: encodedContent };
            if (sha) body.sha = sha;
            return this.fetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
                method: 'PUT',
                body: JSON.stringify(body)
            });
        }
    };

    // --- UTILITIES ---
    function parseFrontmatter(content) {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
        const match = content.match(frontmatterRegex);
        if (match) {
            const yaml = match[1];
            return { frontmatter: jsyaml.load(yaml), body: content.substring(match[0].length) };
        }
        return { frontmatter: {}, body: content };
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    // --- CONFIGURATION LOADER ---
    async function loadEditorConfig() {
        try {
            const response = await fetch('admin/config.yml');
            if (!response.ok) throw new Error('Failed to fetch config.yml');
            editorConfig = jsyaml.load(await response.text());
        } catch (error) { console.error('Error loading editor configuration:', error); }
    }

    // --- AUTHENTICATION ---
    function handleAuthentication() {
        console.log("Authentication check started.");
        let token = null;

        // The decap-auth flow returns the token in a hash like: #access_token=...&token_type=...
        if (window.location.hash) {
            console.log("URL hash found:", window.location.hash);
            const params = new URLSearchParams(window.location.hash.substring(1));
            token = params.get('access_token');
            if (token) {
                console.log("Token successfully parsed from URL hash.");
            } else {
                console.log("URL hash found, but no 'access_token' parameter was present.");
            }
        }

        if (token) {
            console.log("Token acquired. Storing in localStorage.");
            localStorage.setItem('github_token', token);
            // Clean the URL for a better user experience
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        } else {
            console.log("No new token found in URL hash.");
        }

        // After attempting to get a new token, load from storage.
        accessToken = localStorage.getItem('github_token');

        if (accessToken) {
            console.log("Access token is present. Initializing application.");
        } else {
            console.log("No access token. User is not logged in.");
        }

        updateUI();
    }
    function redirectToGitHubAuth() { window.location.href = `${AUTH_URL}?client_id=${OAUTH_CLIENT_ID}&scope=repo&redirect_uri=${window.location.origin}${window.location.pathname}`; }
    function logout() {
        console.log("Logging out.");
        localStorage.removeItem('github_token');
        accessToken = null;
        tinymce.remove();
        updateUI();
    }

    // --- EDITOR FORM RENDERER & DATA COLLECTION (Full logic from previous steps)
    // ... (This logic is assumed to be here and correct)

    // --- WORKFLOW LOGIC ---
    async function handleSave() {
        // ... (Full logic from previous steps)
    }

    function handleCreateNew() {
        // ... (Full logic from previous steps)
    }

    // --- UI & APP LOGIC ---
    async function initializeMainApp() {
        console.log("Initializing main application UI.");
        await loadEditorConfig();
        if (editorConfig) { renderFileBrowser(''); }
        else { document.getElementById('app-container').innerHTML = '<h1 style="color: red;">Could not load editor configuration.</h1>'; }
    }

    function updateUI() {
        if (accessToken) {
            loginContainer.style.display = 'none';
            appContainer.style.display = 'block';
            initializeMainApp();
        } else {
            loginContainer.style.display = 'block';
            appContainer.style.display = 'none';
        }
    }

    // --- EVENT LISTENERS ---
    loginBtn.addEventListener('click', redirectToGitHubAuth);
    logoutBtn.addEventListener('click', logout);
    backBtn.addEventListener('click', handleBackClick);
    saveBtn.addEventListener('click', handleSave);
    createNewBtn.addEventListener('click', handleCreateNew);
    mobileShowFilesBtn.addEventListener('click', () => document.body.classList.remove('mobile-show-editor'));
    mobileShowEditorBtn.addEventListener('click', () => document.body.classList.add('mobile-show-editor'));

    // --- INITIALIZATION ---
    handleAuthentication();
});
// NOTE: I am omitting the full form rendering and reading logic for brevity.
// The key change here is the updated `handleAuthentication` function with extensive logging.
