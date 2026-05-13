function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        delete img.dataset.src;
                    }
                    
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    });
                    
                    img.addEventListener('error', () => {
                        img.classList.add('error');
                        console.warn('Image failed to load:', img.src);
                    });
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                img.classList.add('loaded');
            } else {
                imageObserver.observe(img);
            }
        });
    } else {
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
            }
            img.classList.add('loaded');
        });
    }
}

function initPreloadImages() {
    const criticalImages = document.querySelectorAll('img[data-priority="high"]');
    
    criticalImages.forEach(img => {
        if (img.dataset.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.dataset.src;
            document.head.appendChild(link);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPreloadImages();
        initLazyLoading();
    });
} else {
    initPreloadImages();
    initLazyLoading();
}
