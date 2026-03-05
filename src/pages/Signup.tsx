import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (authError) {
      setLoading(false);
      if (authError.message?.includes('already registered') || authError.status === 422) {
        toast.error('Esse e-mail já está cadastrado. Faça login.');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }
      return;
    }

    if (authData.user) {
      const slug = generateSlug('barbearia');
      const { error: shopError } = await supabase.rpc('create_shop_for_user', {
        _user_id: authData.user.id,
        _shop_name: 'Minha Barbearia',
        _slug: slug,
      });

      if (shopError) {
        toast.error('Erro ao criar barbearia. Entre em contato com o suporte.');
        setLoading(false);
        return;
      }

      toast.success('Conta criada! Vamos configurar sua barbearia.');
      navigate('/onboarding');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary font-['Space_Grotesk']">BarberFlow</CardTitle>
          <CardDescription>Crie sua conta em segundos — você configura tudo depois</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? 'Criando...' : 'Criar conta grátis'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
