import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: string;
    githubId: string;
    username: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        fetch('http://localhost:1234/auth/me', {
            credentials: 'include' // Important for cookies
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
                return null;
            })
            .then((data) => {
                setUser(data);
            })
            .catch((err) => console.error('Failed to fetch user', err))
            .finally(() => setIsLoading(false));
    }, []);

    const login = () => {
        window.location.href = 'http://localhost:1234/auth/github';
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:1234/auth/logout', { method: 'POST', credentials: 'include' });
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
