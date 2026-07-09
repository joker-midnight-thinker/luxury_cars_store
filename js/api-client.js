const API_BASE = 'http://localhost:8000';

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });
    
    if (response.status === 401 && token) {
        localStorage.removeItem('admin_token');
        if (window.location.pathname.includes('admin-panel-xyz123')) {
            alert('Сессия администратора истекла. Пожалуйста, авторизуйтесь заново.');
            window.location.reload();
        }
    }
    
    return response;
}
