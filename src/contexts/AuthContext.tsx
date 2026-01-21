// contexts/AuthContext_fixed.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserType = 'customer' | 'store' | 'delivery';

export interface Profile {
  id: string;
  user_type: UserType;
  full_name: string | null;
  phone: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { full_name: string; phone: string; user_type: UserType }) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  setupProfile: (userType: UserType, full_name?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Função para carregar perfil
  const loadProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('📥 Carregando perfil para usuário:', userId.substring(0, 8) + '...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.warn('❌ Erro ao buscar perfil:', error.message);
        } else {
          console.log('📭 Usuário ainda não tem perfil na tabela profiles');
        }
        setProfile(null);
        return null;
      }

      if (!data) {
        console.log('📭 Perfil não encontrado na tabela profiles');
        setProfile(null);
        return null;
      }

      console.log('✅ Perfil encontrado:', data.user_type);
      
      const profileData: Profile = {
        id: data.id,
        user_type: data.user_type,
        full_name: data.full_name,
        phone: data.phone,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setProfile(profileData);
      return profileData;
    } catch (err) {
      console.error('❌ Erro ao carregar perfil:', err);
      setProfile(null);
      return null;
    }
  };

  // Função para atualizar perfil manualmente
  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  // Efeito inicial
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const bootstrapAuth = async () => {
      try {
        console.log('🔍 Iniciando verificação de sessão...');
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          if (isMounted) {
            setLoading(false);
            setInitialCheckDone(true);
          }
          return;
        }

        if (!isMounted) return;

        console.log('📊 Sessão encontrada?', !!session);
        
        if (session?.user) {
          console.log('👤 Usuário encontrado:', session.user.email);
          setUser(session.user);
          
          // Carrega perfil
          await loadProfile(session.user.id);
        } else {
          console.log('🚫 Nenhum usuário logado');
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('❌ Erro crítico ao inicializar auth:', err);
      } finally {
        if (isMounted) {
          console.log('✅ Auth inicializado - loading definido como false');
          setLoading(false);
          setInitialCheckDone(true);
        }
      }
    };

    // Timeout de segurança
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('⚠️ Timeout de autenticação após 10 segundos');
        setLoading(false);
        setInitialCheckDone(true);
      }
    }, 10000);

    bootstrapAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          console.log('🚪 Usuário deslogou');
          setUser(null);
          setProfile(null);
        }
        
        // Só para loading se ainda não tiver terminado o check inicial
        if (!initialCheckDone) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [initialCheckDone]);

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; phone: string; user_type: UserType }
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      console.log('📝 Criando conta para:', email);
      
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
          },
        },
      });

      if (result.error) {
        console.error('❌ Erro no signUp:', result.error.message);
        return { success: false, error: result.error.message };
      }

      if (result.data.user) {
        console.log('✅ Conta criada, criando perfil...');
        
        // Cria perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: result.data.user.id,
            user_type: userData.user_type,
            full_name: userData.full_name,
            phone: userData.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.warn('⚠️ Aviso ao criar perfil:', profileError.message);
          // Não retorna erro aqui - o usuário pode completar o perfil depois
        }

        // Atualiza estados localmente
        setUser(result.data.user);
        await loadProfile(result.data.user.id);
        
        console.log('🎉 Usuário criado e perfil configurado');
        return { success: true };
      }

      console.warn('⚠️ Usuário não criado no signUp');
      return { success: false, error: 'Usuário não criado' };
    } catch (err) {
      console.error('❌ Erro no signUp:', err);
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      console.log('🔑 Tentando login para:', email);
      
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        console.error('❌ Erro no login:', result.error.message);
        return { success: false, error: result.error.message };
      }

      if (result.data.user) {
        console.log('✅ Login bem-sucedido, carregando perfil...');
        
        // Atualiza estados imediatamente
        setUser(result.data.user);
        await loadProfile(result.data.user.id);
        
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido no login' };
    } catch (err) {
      console.error('❌ Erro no login:', err);
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log('🚪 Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout:', error.message);
        throw new Error(error.message);
      }
      
      // Limpa estados localmente
      setUser(null);
      setProfile(null);
      console.log('✅ Logout bem-sucedido');
    } catch (err) {
      console.error('❌ Erro no logout:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setupProfile = async (
    userType: UserType, 
    full_name?: string, 
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    setLoading(true);
    try {
      console.log('⚙️ Configurando perfil para:', user.email);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_type: userType,
          full_name: full_name || '',
          phone: phone || '',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('❌ Erro ao configurar perfil:', error.message);
        return { success: false, error: `Erro ao configurar perfil: ${error.message}` };
      }

      await loadProfile(user.id);
      console.log('✅ Perfil configurado com sucesso');
      return { success: true };
    } catch (err) {
      console.error('❌ Erro ao configurar perfil:', err);
      const message = err instanceof Error ? err.message : 'Erro ao configurar perfil';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    data: Partial<Profile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: `Erro ao atualizar perfil: ${error.message}` };
      }

      await loadProfile(user.id);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    setupProfile,
    updateProfile,
    refreshProfile, // Adicionado
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}