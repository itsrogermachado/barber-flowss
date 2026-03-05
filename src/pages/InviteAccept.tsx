import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const InviteAccept = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<any>(null);
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'loading' | 'login' | 'accept'>('loading');

  useEffect(() => {
    const load = async () => {
      if (!token) { setLoading(false); return; }
      const { data } = await supabase.from('invitations').select('*, shops(name)').eq('token', token).single();
      if (!data || data.used_at || new Date(data.expires_at) < new Date()) {
        toast.error('Convite inválido ou expirado.');
        setLoading(false);
        return;
      }
      setInvitation(data);
      setShopName(data.shops?.name || '');
      setEmail(data.email);
      setStep(user ? 'accept' : 'login');
      setLoading(false);
    };
    load();
  }, [token, user]);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Try signup
      const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });
      if (signupError) { toast.error('Erro ao entrar/criar conta.'); setLoading(false); return; }
    }
    setStep('accept');
    setLoading(false);
  };

  const accept = async () => {
    if (!user || !invitation) return;
    setLoading(true);

    const { error } = await supabase.from('memberships').insert({
      user_id: user.id,
      shop_id: invitation.shop_id,
      role: invitation.role,
      barber_id: invitation.barber_id || null,
    });

    if (error) {
      if (error.code === '23505') toast.error('Você já é membro dessa barbearia.');
      else toast.error('Erro ao aceitar convite.');
      setLoading(false);
      return;
    }

    await supabase.from('invitations').update({ used_at: new Date().toISOString() }).eq('id', invitation.id);
    toast.success('Convite aceito! Bem-vindo!');
    navigate('/app');
  };

  if (!token) return <div className="flex min-h-screen items-center justify-center"><p>Convite inválido.</p></div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-['Space_Grotesk']">Convite</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" /></div>
          ) : step === 'login' ? (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">Você foi convidado para <strong>{shopName}</strong> como <strong>{invitation?.role}</strong>.</p>
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Senha</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Crie ou entre com sua senha" /></div>
              <Button className="w-full h-12" onClick={handleLogin}>Entrar e aceitar</Button>
            </div>
          ) : step === 'accept' ? (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">Aceitar convite para <strong>{shopName}</strong> como <strong>{invitation?.role}</strong>?</p>
              <Button className="w-full h-12" onClick={accept}>✅ Aceitar convite</Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Convite inválido ou expirado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAccept;
