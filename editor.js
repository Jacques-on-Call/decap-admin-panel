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
    async function handleAuthentication() {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const code = params.get('code');
        const error = params.get('error');

        if (error) {
            showToast(`Authentication failed: ${params.get('error_description') || error}`, 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
            updateUI();
            return;
        }

        if (code) {
            try {
                const response = await fetch(AUTH_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: code })
                });
                const data = await response.json();
                if (data.token) {
                    accessToken = data.token;
                    localStorage.setItem('github_token', accessToken);
                    showToast('Logged in successfully!', 'success');
                } else {
                    throw new Error('No token received from auth service.');
                }
            } catch (e) {
                console.error('Token exchange failed:', e);
                showToast('Authentication failed during token exchange.', 'error');
            } finally {
                // Clean the URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } else {
            // No code in URL, check for existing token in localStorage
            accessToken = localStorage.getItem('github_token');
        }

        if (accessToken) {
            loadTinyMCE();
        }

        updateUI();
    }

    function startAuthentication() {
        const redirectUri = `${window.location.origin}/callback.html`;
        // We go directly to GitHub because the proxy is only for the token exchange
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;

        window.open(authUrl, '_blank', 'noopener,noreferrer');
    }

    function logout() {
        localStorage.removeItem('github_token');
        accessToken = null;
        if (window.tinymce) tinymce.remove();
        window.location.href = '/';
    }

    // --- TINYMCE DYNAMIC LOADER ---
    let tinymceLoaded = false;
    function loadTinyMCE() {
        if (tinymceLoaded) {
            initializeWysiwygEditors();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.tiny.cloud/1/w01ntc48o7kxzwys5kxk0gibj7s4lysx998e1rdgb1tjhm6y/tinymce/7/tinymce.min.js';
        script.referrerPolicy = 'origin';
        script.onload = () => {
            tinymceLoaded = true;
            initializeWysiwygEditors();
        };
        script.onerror = () => {
            showToast('Failed to load text editor.', 'error');
        };
        document.head.appendChild(script);
    }

    // --- EDITOR FORM RENDERER & DATA COLLECTION ---
    function initializeWysiwygEditors() {
        if (!tinymceLoaded) return;
        tinymce.remove('.wysiwyg-editor');
        tinymce.init({
            selector: '.wysiwyg-editor',
            plugins: 'autoresize link lists wordcount',
            toolbar: 'undo redo | blocks | bold italic | bullist numlist | link removeformat',
            menubar: false, statusbar: false, autoresize_bottom_margin: 20,
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; }',
            skin: 'oxide',
            init_instance_callback: (editor) => editor.setMode('design')
        }).catch(error => {
            console.error('TinyMCE initialization error:', error);
            showToast('Editor initialization failed.', 'error');
        });
    }

    function createFormFields(container, fields, data) {
        fields.forEach(field => {
            if (field.widget === 'hidden') return;
            const fieldWrapper = document.createElement('div');
            fieldWrapper.className = 'form-field';
            fieldWrapper.dataset.field = field.name;
            const label = document.createElement('label');
            label.textContent = field.label;
            fieldWrapper.appendChild(label);
            if (['string', 'text', 'code', 'markdown'].includes(field.widget)) {
                let input;
                if (['text', 'code', 'markdown'].includes(field.widget)) {
                    input = document.createElement('textarea');
                    input.rows = field.widget === 'code' ? 10 : (field.widget === 'markdown' ? 15 : 3);
                    if (field.widget === 'markdown') {
                        input.classList.add('wysiwyg-editor');
                        input.id = `wysiwyg-${field.name}-${Math.random().toString(36).substring(2, 9)}`;
                    }
                } else {
                    input = document.createElement('input');
                    input.type = 'text';
                }
                input.value = (data && data[field.name]) || '';
                fieldWrapper.appendChild(input);
            } else if (field.widget === 'object') {
                const fieldset = document.createElement('fieldset');
                const legend = document.createElement('legend');
                legend.textContent = field.label;
                fieldset.appendChild(legend);
                createFormFields(fieldset, field.fields, (data && data[field.name]) || {});
                fieldWrapper.appendChild(fieldset);
            } else if (field.widget === 'list') {
                const listData = (data && data[field.name]) || [];
                const listContainer = document.createElement('div');
                listContainer.className = 'list-widget-container';
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'list-items-container';
                listContainer.appendChild(itemsContainer);
                listData.forEach((itemData, index) => {
                    const itemTypeConfig = field.types.find(type => type.name === itemData.type);
                    if (itemTypeConfig) {
                        const itemFieldset = document.createElement('fieldset');
                        itemFieldset.className = 'list-item-fieldset';
                        itemFieldset.dataset.type = itemData.type;
                        const header = document.createElement('div');
                        header.className = 'list-item-header';
                        const legend = document.createElement('legend');
                        legend.textContent = `${itemTypeConfig.label} #${index + 1}`;
                        header.appendChild(legend);
                        const controls = document.createElement('div');
                        controls.className = 'list-item-controls';
                        const removeBtn = document.createElement('button'); removeBtn.textContent = 'Remove'; removeBtn.className = 'remove-btn';
                        removeBtn.onclick = () => { listData.splice(index, 1); renderEditorForm(); };
                        const moveUpBtn = document.createElement('button'); moveUpBtn.textContent = 'Up'; moveUpBtn.className = 'move-btn';
                        moveUpBtn.onclick = () => { if (index > 0) { [listData[index], listData[index - 1]] = [listData[index - 1], listData[index]]; renderEditorForm(); } };
                        const moveDownBtn = document.createElement('button'); moveDownBtn.textContent = 'Down'; moveDownBtn.className = 'move-btn';
                        moveDownBtn.onclick = () => { if (index < listData.length - 1) { [listData[index], listData[index + 1]] = [listData[index + 1], listData[index]]; renderEditorForm(); } };
                        controls.append(moveUpBtn, moveDownBtn, removeBtn);
                        header.appendChild(controls);
                        itemFieldset.appendChild(header);
                        createFormFields(itemFieldset, itemTypeConfig.fields, itemData);
                        itemsContainer.appendChild(itemFieldset);
                    }
                });
                const addControls = document.createElement('div');
                addControls.className = 'list-add-controls';
                const typeSelect = document.createElement('select');
                field.types.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.name;
                    option.textContent = type.label;
                    typeSelect.appendChild(option);
                });
                const addBtn = document.createElement('button'); addBtn.textContent = 'Add Section';
                addBtn.onclick = () => {
                    const selectedType = typeSelect.value;
                    const typeConfig = field.types.find(t => t.name === selectedType);
                    const newItem = { type: selectedType };
                    typeConfig.fields.forEach(f => { newItem[f.name] = f.default || ''; });
                    listData.push(newItem);
                    renderEditorForm();
                };
                addControls.append(typeSelect, addBtn);
                listContainer.appendChild(addControls);
                fieldWrapper.appendChild(listContainer);
            }
            container.appendChild(fieldWrapper);
        });
    }

    function readFormFields(container, fields) {
        const data = {};
        fields.forEach(field => {
            if (field.widget === 'hidden') { data[field.name] = field.default; return; }
            const fieldWrapper = container.querySelector(`[data-field="${field.name}"]`);
            if (!fieldWrapper) return;
            if (['string', 'text', 'code', 'markdown'].includes(field.widget)) {
                const input = fieldWrapper.querySelector('input, textarea');
                if (field.widget === 'markdown') {
                    const editor = tinymce.get(input.id);
                    data[field.name] = editor ? editor.getContent({ format: 'raw' }) : input.value;
                } else { data[field.name] = input.value; }
            } else if (field.widget === 'object') {
                const fieldset = fieldWrapper.querySelector('fieldset');
                data[field.name] = readFormFields(fieldset, field.fields);
            } else if (field.widget === 'list') {
                const listData = [];
                const itemFieldsets = fieldWrapper.querySelectorAll('.list-item-fieldset');
                itemFieldsets.forEach(fieldset => {
                    const itemType = fieldset.dataset.type;
                    const typeConfig = field.types.find(t => t.name === itemType);
                    if (typeConfig) {
                        let itemData = readFormFields(fieldset, typeConfig.fields);
                        itemData.type = itemType;
                        listData.push(itemData);
                    }
                });
                data[field.name] = listData;
            }
        });
        return data;
    }

    function getFormData() {
        const collectionName = currentPath.split('/')[0];
        const collection = editorConfig.collections.find(c => c.name === collectionName);
        if (!collection) return null;
        return readFormFields(metadataEditorDiv, collection.fields);
    }

    function renderEditorForm() {
        metadataEditorDiv.innerHTML = '';
        const collectionName = currentPath.split('/')[0];
        const collection = editorConfig.collections.find(c => c.name === collectionName);
        if (!collection) { metadataEditorDiv.innerHTML = '<p style="color: red;">Could not find collection configuration.</p>'; return; }
        createFormFields(metadataEditorDiv, collection.fields, currentFile.frontmatter);
        initializeWysiwygEditors();
    }

    async function renderFileBrowser(path) {
        currentPath = path;
        metadataEditorDiv.innerHTML = '';
        currentFile = { frontmatter: null, body: null, sha: null };
        currentPathSpan.textContent = `/${path}`;
        fileListDiv.innerHTML = '<p>Loading...</p>';
        backBtn.style.display = path ? 'inline-block' : 'none';
        try {
            let items = await github.getRepoContents(path);
            fileListDiv.innerHTML = '';
            const allowedDirs = editorConfig.collections.map(c => c.name);
            if (path === '') items = items.filter(item => item.type === 'dir' && allowedDirs.includes(item.name));
            items.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1);
            if (items.length === 0) fileListDiv.innerHTML = '<p>No files in this directory.</p>';
            items.forEach(item => {
                const el = document.createElement('div');
                el.textContent = `${item.type === 'dir' ? '📁' : '📄'} ${item.name}`;
                el.className = 'file-item';
                el.onclick = () => handleItemClick(item);
                fileListDiv.appendChild(el);
            });
        } catch (error) { console.error('Failed to render file browser:', error); fileListDiv.innerHTML = '<p style="color: red;">Error loading content.</p>'; }
    }

    async function handleItemClick(item) {
        if (item.type === 'dir') { renderFileBrowser(item.path); }
        else {
            try {
                const fileData = await github.getFileContent(item.path);
                const { frontmatter, body } = parseFrontmatter(atob(fileData.content));
                currentFile = { frontmatter, body, sha: fileData.sha };
                renderEditorForm();
                if (window.innerWidth <= 768) document.body.classList.add('mobile-show-editor');
            } catch (error) { console.error('Error loading file content:', error); showToast('Could not load file content.', 'error'); }
        }
    }

    function handleBackClick() { const pathParts = currentPath.split('/'); pathParts.pop(); renderFileBrowser(pathParts.join('/')); }

    async function handleSave() {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        try {
            const verb = currentFile.sha ? 'update' : 'create';
            const commitMessage = prompt(`Enter a commit message to ${verb} this file:`, `feat: ${verb} ${currentPath}`);
            if (!commitMessage) { saveBtn.textContent = 'Save Content'; saveBtn.disabled = false; return; }

            const frontmatter = getFormData();
            const yamlFrontmatter = jsyaml.dump(frontmatter, { noRefs: true, skipInvalid: true });
            const fullContent = `---\n${yamlFrontmatter}---\n${currentFile.body || ''}`;

            const response = await github.commitFile(currentPath, fullContent, commitMessage, currentFile.sha);

            currentFile.sha = response.content.sha;
            showToast(`File ${verb}d successfully!`, 'success');
            const pathParts = currentPath.split('/');
            pathParts.pop();
            renderFileBrowser(pathParts.join('/'));

        } catch (error) {
            console.error("Failed to save file:", error);
            showToast(`Error saving file: ${error.message}`, 'error');
        } finally {
            saveBtn.textContent = 'Save Content';
            saveBtn.disabled = false;
        }
    }

    function handleCreateNew() {
        const collections = editorConfig.collections.map(c => c.name);
        const collectionName = prompt(`Which collection? (${collections.join(', ')})`);
        if (!collectionName || !collections.includes(collectionName)) {
            return showToast('Invalid collection name.', 'error');
        }

        let fileName = prompt("Enter a file name (e.g., my-new-page.astro):");
        if (!fileName) return;
        if (!fileName.endsWith('.astro')) fileName += '.astro';

        currentPath = `${collectionName}/${fileName}`;
        const collection = editorConfig.collections.find(c => c.name === collectionName);
        const defaultFrontmatter = {};
        collection.fields.forEach(field => {
            if (field.default) defaultFrontmatter[field.name] = field.default;
        });

        currentFile = { frontmatter: defaultFrontmatter, body: '\n<!-- Add your page content here if not using sections -->', sha: null };
        renderEditorForm();
        if (window.innerWidth <= 768) document.body.classList.add('mobile-show-editor');
    }

    async function initializeMainApp() {
        await loadEditorConfig();
        if (editorConfig) {
            updateUI();
        } else {
            document.getElementById('app-container').innerHTML = '<h1 style="color: red;">Could not load editor configuration.</h1>';
        }
    }

    function updateUI() {
        if (accessToken) {
            loginContainer.style.display = 'none';
            appContainer.style.display = 'block';
            if(editorConfig) renderFileBrowser('');
        } else {
            loginContainer.style.display = 'block';
            appContainer.style.display = 'none';
        }
    }

    // --- MAIN INITIALIZATION ---
    try {
        handleAuthentication();
        initializeMainApp();
    } catch (error) {
        console.error('Fatal error during initialization:', error);
        document.body.innerHTML = '<h1 style="color: red;">A fatal error occurred. Please check the console.</h1>';
    }

    // --- EVENT LISTENERS ---
    loginBtn.addEventListener('click', startAuthentication);
    logoutBtn.addEventListener('click', logout);
    backBtn.addEventListener('click', handleBackClick);
    saveBtn.addEventListener('click', handleSave);
    createNewBtn.addEventListener('click', handleCreateNew);
    mobileShowFilesBtn.addEventListener('click', () => document.body.classList.remove('mobile-show-editor'));
    mobileShowEditorBtn.addEventListener('click', () => document.body.classList.add('mobile-show-editor'));
});
