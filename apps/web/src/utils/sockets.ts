export const formatSocketMessage = (message: string) => {
    try {
        const parsed = JSON.parse(message); 
        return {
            type: parsed.type || '',
            content: parsed?.data ? JSON.parse(parsed?.data)?.msg || '' : parsed.type,
            date: new Date().toISOString()
        };
    } catch (e) {
        return {
            type: 'error',
            content: message,
            date: new Date().toISOString()
        };
    }
};