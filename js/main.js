(function() {
    const breadcrumbEl = document.getElementById('breadcrumb');
    const contentTitleEl = document.getElementById('contentTitle');
    const directoryListEl = document.getElementById('directoryList');
    const markdownBodyEl = document.getElementById('markdownBody');
    const contentHeaderEl = document.getElementById('contentHeader');
    const typingTextEl = document.getElementById('typingText');
    
    const DEFAULT_PATH = 'home.md';
    const ROOT_LIST_PATH = '_list';
    const TEXT_TO_TYPE = 'docs.yui.kim';
    const TYPE_SPEED = 150;
    const PAUSE_DURATION = 3000;
    
    let charIndex = 0;
    
    function typeText() {
        if (charIndex < TEXT_TO_TYPE.length) {
            typingTextEl.textContent += TEXT_TO_TYPE.charAt(charIndex);
            charIndex++;
            setTimeout(typeText, TYPE_SPEED);
        } else {
            setTimeout(resetText, PAUSE_DURATION);
        }
    }
    
    function resetText() {
        typingTextEl.textContent = '';
        charIndex = 0;
        setTimeout(typeText, TYPE_SPEED);
    }
    
    function init() {
        handleHashChange();
        
        window.addEventListener('hashchange', handleHashChange);
        
        document.querySelector('.navbar-brand').addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = ROOT_LIST_PATH;
        });
        
        setTimeout(typeText, 500);
    }
    
    let lastDocPath = '';
    
    function handleHashChange() {
        const hash = window.location.hash.slice(1);
        
        if (!hash) {
            lastDocPath = DEFAULT_PATH;
            navigateTo(DEFAULT_PATH);
            return;
        }
        
        if (hash === ROOT_LIST_PATH) {
            lastDocPath = '';
            navigateTo('');
            return;
        }
        
        if (hash.includes('.md') || hash.includes('/')) {
            lastDocPath = hash;
            navigateTo(hash);
            return;
        }
        
        const node = findNode(hash, DOC_STRUCTURE);
        if (node) {
            lastDocPath = hash;
            navigateTo(hash);
        }
    }
    
    function navigateTo(path) {
        const node = findNode(path, DOC_STRUCTURE);
        
        if (!node) {
            showError('文档不存在', path);
            return;
        }
        
        renderBreadcrumb(path);
        
        if (node.type === 'folder') {
            renderDirectory(node, path);
            hideMarkdown();
        } else {
            renderFile(node, path);
            hideDirectory();
        }
        
        updateTitle(node, path);
    }
    
    function renderBreadcrumb(path) {
        const breadcrumbs = getBreadcrumbs(path);
        let html = '<span class="breadcrumb-item"><span class="breadcrumb-separator">/</span></span>';
        
        breadcrumbs.forEach((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            if (isLast) {
                html += `<span class="breadcrumb-item">
                    <span class="breadcrumb-current">${escapeHtml(item.name)}</span>
                </span>`;
            } else {
                html += `<span class="breadcrumb-item">
                    <a href="#${item.path}" class="breadcrumb-link">${escapeHtml(item.name)}</a>
                    <span class="breadcrumb-separator">/</span>
                </span>`;
            }
        });
        
        breadcrumbEl.innerHTML = html;
    }
    
    function renderDirectory(node, path) {
        if (!node.children || node.children.length === 0) {
            directoryListEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">[ ]</div>
                    <div class="empty-state-text">// 当前目录为空</div>
                </div>
            `;
            return;
        }
        
        const folders = node.children.filter(c => c.type === 'folder');
        const files = node.children.filter(c => c.type === 'file');
        const sorted = [...folders, ...files];
        
        let html = '';
        sorted.forEach(child => {
            const childPath = path ? `${path}/${child.name}` : child.name;
            const defaultIcon = child.type === 'folder' ? 'assets/folder-transfer-line.svg' : 'assets/flashlight-line.svg';
            const iconSrc = child.icon || defaultIcon;
            const iconAlt = child.type === 'folder' ? '文件夹' : '文件';
            const displayName = child.title || child.name;
            
            html += `<a href="#${childPath}" class="directory-item">
                <span class="directory-icon">
                    <img src="${iconSrc}" alt="${iconAlt}" width="20" height="20">
                </span>
                <span class="directory-name">${escapeHtml(displayName)}</span>
                <span class="directory-arrow">&rarr;</span>
            </a>`;
        });
        
        directoryListEl.innerHTML = html;
        contentTitleEl.textContent = node.title || node.name || 'docs';
        contentHeaderEl.style.display = 'block';
    }
    
    function renderFile(node, path) {
        const filePath = `docs/${path}`;
        
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('文件不存在');
                }
                return response.text();
            })
            .then(content => {
                const renderer = new marked.Renderer();
                renderer.heading = function(data) {
                    const text = data.text;
                    const depth = data.depth;
                    const slug = text
                        .toLowerCase()
                        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    return `<h${depth} id="${slug}">${text}</h${depth}>`;
                };
                
                marked.setOptions({
                    renderer: renderer,
                    headerIds: true,
                    mangle: false
                });
                
                const html = marked.parse(content);
                markdownBodyEl.innerHTML = html;
                processLinks();
            })
            .catch(error => {
                showError('无法加载文档', path);
            });
        
        const fileName = node.title || node.name;
        contentTitleEl.textContent = fileName;
        contentHeaderEl.style.display = 'block';
    }
    
    function processLinks() {
        const links = markdownBodyEl.querySelectorAll('a');
        const currentPath = window.location.hash.slice(1) || DEFAULT_PATH;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/')) || '';
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            if (!href) return;
            
            if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
                return;
            }
            
            if (href.startsWith('#')) {
                return;
            }
            
            let newPath;
            if (href.startsWith('./')) {
                newPath = currentDir ? `${currentDir}/${href.slice(2)}` : href.slice(2);
            } else if (href.startsWith('../')) {
                const dirParts = currentDir.split('/').filter(p => p);
                let upCount = 0;
                let remaining = href;
                while (remaining.startsWith('../')) {
                    upCount++;
                    remaining = remaining.slice(3);
                }
                dirParts.splice(-upCount);
                newPath = dirParts.length > 0 ? `${dirParts.join('/')}/${remaining}` : remaining;
            } else {
                newPath = currentDir ? `${currentDir}/${href}` : href;
            }
            
            link.setAttribute('href', `#${newPath}`);
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.hash = newPath;
            });
        });
    }
    
    function hideDirectory() {
        directoryListEl.innerHTML = '';
    }
    
    function hideMarkdown() {
        markdownBodyEl.innerHTML = '';
    }
    
    function showError(message, path) {
        contentHeaderEl.style.display = 'none';
        hideDirectory();
        markdownBodyEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">[!]</div>
                <div class="empty-state-text">// ${escapeHtml(message)}: ${escapeHtml(path)}</div>
            </div>
        `;
    }
    
    function updateTitle(node, path) {
        const name = node.title || node.name;
        document.title = `${name} - docs.yui.kim`;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
