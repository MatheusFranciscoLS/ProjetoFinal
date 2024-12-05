import { getAuth } from 'firebase/auth';

export const getUserClaims = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return null;

    try {
        // Força uma atualização do token para obter as claims mais recentes
        await user.getIdToken(true);
        const idTokenResult = await user.getIdTokenResult();
        
        return idTokenResult.claims;
    } catch (error) {
        console.error('Erro ao obter claims:', error);
        return null;
    }
};
