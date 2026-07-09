function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Подключаем CSS стили динамически, если они еще не добавлены
    if (!document.querySelector('link[href*="toast.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = window.location.pathname.includes('/catalog/') || window.location.pathname.includes('/card/') 
            ? '../css/toast.css' 
            : 'css/toast.css';
        document.head.appendChild(link);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let emoji = 'ℹ️';
    if (type === 'success') emoji = '✅';
    if (type === 'error') emoji = '❌';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; line-height: 1.4;">
            <span style="font-size: 20px;">${emoji}</span>
            <span>${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Анимация появления
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Закрытие по клику на крестик
    toast.querySelector('.toast-close').addEventListener('click', () => {
        closeToast(toast);
    });
    
    // Автоудаление через 4 секунды
    setTimeout(() => {
        if (toast.parentNode) {
            closeToast(toast);
        }
    }, 4000);
}

function closeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 400);
}
