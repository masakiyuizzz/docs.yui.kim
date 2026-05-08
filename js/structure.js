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
