const DOC_STRUCTURE = {
    name: 'docs',
    type: 'folder',
    icon: 'assets/folder.svg',
    children: [
        {
            name: 'archive',
            type: 'folder',
            title: '/ archive (归档)',
            icon: 'assets/flask-line.svg',
            children: [
            ]
        },
        {
            name: 'Languages',
            type: 'folder',
            title: '/ Languages (编程语言)',
            icon: 'assets/code-line.svg',
            children: [
                {
                    name: 'JavaScript',
                    type: 'folder',
                    title: '/ JavaScript (JS)',
                    icon: 'assets/javascript-fill.svg',
                    children: [
                    ]
                },
                {
                    name: 'HTML',
                    type: 'folder',
                    title: '/ HTML (HTML)',
                    icon: 'assets/html5-fill.svg',
                    children: [
                    ]
                },
                {
                    name: 'CSS',
                    type: 'folder',
                    title: '/ CSS (CSS)',
                    icon: 'assets/css3-fill.svg',
                    children: [
                    ]
                },
                {
                    name: 'Markdown',
                    type: 'folder',
                    title: '/ Markdown (MD)',
                    icon: 'assets/markdown-line.svg',
                    children: [
                    ]
                },
                {
                    name: 'Golang',
                    type: 'folder',
                    title: '/ Golang (Go)',
                    icon: 'assets/golang.svg',
                    children: [
                    ]
                }
            ]
        },
        {
            name: 'QuickRef',
            type: 'folder',
            title: '/ QuickRef (快速启动)',
            icon: 'assets/flashlight-line.svg',
            children: [
            ]
        },
        {
            name: 'Tools',
            type: 'folder',
            title: '/ Tools (工具)',
            icon: 'assets/tools-fill.svg',
            children: [
                {
                    name: 'HomeBrew',
                    type: 'folder',
                    title: '/ HomeBrew (brew)',
                    icon: 'assets/beer-fill.svg',
                    children: [
                    ]                    
                },
                {
                    name: 'Git',
                    type: 'folder',
                    title: '/ Git (git)',
                    icon: 'assets/git.svg',
                    children: [
                    ]
                },
                {
                    name: 'Terminal',
                    type: 'folder',
                    title: '/ Terminal (终端)',
                    icon: 'assets/terminal-box-line.svg',
                    children: [
                        {
                            name: 'macOS-Terminal.md',
                            type: 'file',
                            title: 'macOS-Terminal.md (命令收录)',
                            icon: 'assets/markdown-line.svg'
                        },
                        {
                            name: 'Terminal-Others.md',
                            type: 'file',
                            title: 'Terminal-Others.md (命令收录-补充说明)',
                            icon: 'assets/markdown-line.svg'
                        }
                    ]
                },
                {
                    name: 'Github',
                    type: 'folder',
                    title: '/ Github (github)',
                    icon: 'assets/github-fill.svg',
                    children: [
                    ]
                },
                {
                    name: 'Command',
                    type: 'folder',
                    title: '/ Command (快捷键)',
                    icon: 'assets/command-line.svg',
                    children: [
                    ]
                }
            ]
        },
        {
            name: 'CHANGELOG.md',
            type: 'file',
            title: 'CHANGELOG.md (构建日志)',
            icon: 'assets/history-line.svg'
        },
        {
            name: 'home.md',
            type: 'file',
            title: 'home.md (首页)',
            icon: 'assets/home-heart-line.svg'
        }
    ]
};

function findNode(path, structure) {
    if (!path || path === '') {
        return structure;
    }
    
    const parts = path.split('/').filter(p => p);
    let current = structure;
    
    for (const part of parts) {
        if (!current.children) return null;
        current = current.children.find(child => child.name === part);
        if (!current) return null;
    }
    
    return current;
}

function getParentPath(path) {
    if (!path || path === '') return '';
    const parts = path.split('/').filter(p => p);
    parts.pop();
    return parts.join('/');
}

function getBreadcrumbs(path) {
    const parts = path.split('/').filter(p => p);
    const breadcrumbs = [{ name: 'docs', path: '_list' }];
    
    let currentPath = '';
    for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        breadcrumbs.push({ name: part, path: currentPath });
    }
    
    return breadcrumbs;
}
