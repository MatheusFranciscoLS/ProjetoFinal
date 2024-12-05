import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const login = async (email, password) => {
    try {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user) {
            throw new Error('Erro ao obter dados do usuário');
        }
        
        // Verifica se é admin
        if (user.email === 'adm@adm.com') {
            localStorage.setItem('userRole', 'admin');
        } else {
            localStorage.setItem('userRole', 'user');
        }
        
        return user;
    } catch (error) {
        console.error('Erro no login:', error);
        switch (error.code) {
            case 'auth/invalid-email':
                throw new Error('Email inválido');
            case 'auth/user-disabled':
                throw new Error('Usuário desativado');
            case 'auth/user-not-found':
                throw new Error('Usuário não encontrado');
            case 'auth/wrong-password':
                throw new Error('Senha incorreta');
            case 'auth/too-many-requests':
                throw new Error('Muitas tentativas de login. Tente novamente mais tarde');
            default:
                throw new Error(error.message || 'Erro ao fazer login');
        }
    }
};

export const register = async (name, email, password) => {
    try {
        if (!name || !email || !password) {
            throw new Error('Nome, email e senha são obrigatórios');
        }

        if (password.length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres');
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user) {
            throw new Error('Erro ao criar usuário');
        }
        
        localStorage.setItem('userRole', 'user');
        return user;
    } catch (error) {
        console.error('Erro no registro:', error);
        switch (error.code) {
            case 'auth/email-already-in-use':
                throw new Error('Este email já está em uso');
            case 'auth/invalid-email':
                throw new Error('Email inválido');
            case 'auth/operation-not-allowed':
                throw new Error('Operação não permitida');
            case 'auth/weak-password':
                throw new Error('A senha é muito fraca');
            default:
                throw new Error(error.message || 'Erro ao registrar usuário');
        }
    }
};

export const logout = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error('Nenhum usuário logado');
        }
        
        await signOut(auth);
        localStorage.removeItem('userRole');
    } catch (error) {
        console.error('Erro no logout:', error);
        throw new Error(error.message || 'Erro ao fazer logout');
    }
};

export const getCurrentUser = () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Nenhum usuário logado');
        }
        return user;
    } catch (error) {
        console.error('Erro ao obter usuário atual:', error);
        return null;
    }
};

export const isAuthenticated = () => {
    try {
        return !!auth.currentUser;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
};

export const isAdmin = () => {
    try {
        const user = auth.currentUser;
        return user && user.email === 'adm@adm.com';
    } catch (error) {
        console.error('Erro ao verificar permissão de admin:', error);
        return false;
    }
};
