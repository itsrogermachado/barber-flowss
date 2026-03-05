import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Copy, ExternalLink, Store, Users, Scissors, Calendar,
  Search, ShieldCheck, Link2, LogOut, Trash2, EyeOff, Eye
} from 'lucide-react';

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [signupLink, setSignupLink] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }

        const { data, error } = await supabase.from('super_admins' as any).select('id').eq('email', user.email).maybeSingle();
        if (error || !data) { navigate('/app'); return; }

        setIsSuperAdmin(true);
        setAuthReady(true);
        setSignupLink(`${window.location.origin}/signup`);
        await loadData();
      } catch (e) {
        console.error('SuperAdmin check error:', e);
        navigate('/login');
      }
    };
    check();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shopsRes, membersRes, barbersRes, servicesRes, apptsRes] = await Promise.all([
        supabase.from('shops').select('*').order('created_at', { ascending: false }),
        supabase.from('memberships').select('*'),
        supabase.from('barbers').select('*'),
        supabase.from('services').select('*'),
        supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(100),
      ]);
      setShops(shopsRes.data || []);
      setMemberships(membersRes.data || []);
      setBarbers(barbersRes.data || []);
      setServices(servicesRes.data || []);
      setAppointments(apptsRes.data || []);
    } catch (e) {
      console.error('Load data error:', e);
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const togglePublish = async (shopId: string, currentlyPublished: boolean) => {
    setActionLoading(shopId);
    try {
      const { error } = await supabase.from('shops').update({ is_published: !currentlyPublished }).eq('id', shopId);
      if (error) { toast.error('Erro: ' + error.message); return; }
      toast.success(currentlyPublished ? 'Barbearia despublicada!' : 'Barbearia publicada!');
      await loadData();
    } catch (e) {
      toast.error('Erro inesperado.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteShop = async (shopId: string) => {
    setActionLoading(shopId);
    try {
      // Delete related data first (order matters for FK constraints)
      await supabase.from('appointments').delete().eq('shop_id', shopId);
      await supabase.from('blocked_slots').delete().eq('shop_id', shopId);
      await supabase.from('working_hours').delete().eq('shop_id', shopId);
      await supabase.from('invitations').delete().eq('shop_id', shopId);
      await supabase.from('subscriptions').delete().eq('shop_id', shopId);
      await supabase.from('memberships').delete().eq('shop_id', shopId);
      await supabase.from('services').delete().eq('shop_id', shopId);
      await supabase.from('barbers').delete().eq('shop_id', shopId);
      
      const { error } = await supabase.from('shops').delete().eq('id', shopId);
      if (error) { toast.error('Erro ao deletar: ' + error.message); return; }
      toast.success('Barbearia deletada!');
      await loadData();
    } catch (e) {
      console.error('Delete error:', e);
      toast.error('Erro inesperado ao deletar.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const filtered = shops.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getShopBarbers = (shopId: string) => barbers.filter(b => b.shop_id === shopId);
  const getShopServices = (shopId: string) => services.filter(s => s.shop_id === shopId);
  const getShopMembers = (shopId: string) => memberships.filter(m => m.shop_id === shopId);
  const getShopAppointments = (shopId: string) => appointments.filter(a => a.shop_id === shopId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-['Space_Grotesk']">Super Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />Sair
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{shops.length}</p><p className="text-xs text-muted-foreground">Barbearias</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Store className="h-8 w-8 text-primary/60" />
            <div><p className="text-2xl font-bold">{shops.filter(s => s.is_published).length}</p><p className="text-xs text-muted-foreground">Publicadas</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{memberships.length}</p><p className="text-xs text-muted-foreground">Usuários</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{appointments.length}</p><p className="text-xs text-muted-foreground">Agendamentos</p></div>
          </CardContent></Card>
        </div>

        {/* Signup link */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Link2 className="h-4 w-4" />Link de Cadastro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Envie este link para novos barbeiros criarem suas barbearias:</p>
            <div className="flex items-center gap-2">
              <Input readOnly value={signupLink} className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyLink(signupLink)}><Copy className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar barbearia..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Shops */}
        {loading ? (
          <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" /></div>
        ) : (
          <div className="space-y-4">
            {filtered.map(shop => {
              const publicUrl = `${window.location.origin}/s/${shop.slug}`;
              const isActioning = actionLoading === shop.id;

              return (
                <Card key={shop.id} className={isActioning ? 'opacity-50 pointer-events-none' : ''}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{shop.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">/{shop.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={shop.is_published ? 'default' : 'secondary'}>
                          {shop.is_published ? 'Publicada' : 'Rascunho'}
                        </Badge>
                        <Badge variant="outline">{shop.plan || 'trial'}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><p className="text-muted-foreground">WhatsApp</p><p className="font-medium">{shop.phone_whatsapp || '—'}</p></div>
                      <div><p className="text-muted-foreground">Endereço</p><p className="font-medium">{shop.address || '—'}</p></div>
                      <div><p className="text-muted-foreground">Instagram</p><p className="font-medium">{shop.instagram || '—'}</p></div>
                      <div><p className="text-muted-foreground">Criada em</p><p className="font-medium">{shop.created_at ? format(new Date(shop.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</p></div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline" className="gap-1"><Scissors className="h-3 w-3" />{getShopBarbers(shop.id).length} barbeiro(s)</Badge>
                      <Badge variant="outline" className="gap-1"><Store className="h-3 w-3" />{getShopServices(shop.id).length} serviço(s)</Badge>
                      <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{getShopMembers(shop.id).length} membro(s)</Badge>
                      <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" />{getShopAppointments(shop.id).length} agendamento(s)</Badge>
                    </div>

                    {shop.trial_ends_at && (
                      <p className="text-xs text-muted-foreground">
                        Trial até: {format(new Date(shop.trial_ends_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyLink(publicUrl)}>
                        <Copy className="mr-1 h-3 w-3" />Copiar link
                      </Button>
                      {shop.is_published && (
                        <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, '_blank')}>
                          <ExternalLink className="mr-1 h-3 w-3" />Abrir
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublish(shop.id, shop.is_published)}
                      >
                        {shop.is_published ? <><EyeOff className="mr-1 h-3 w-3" />Despublicar</> : <><Eye className="mr-1 h-3 w-3" />Publicar</>}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-1 h-3 w-3" />Deletar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar "{shop.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Todos os dados desta barbearia serão apagados permanentemente: barbeiros, serviços, horários, agendamentos e membros. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteShop(shop.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Deletar permanentemente
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma barbearia encontrada.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;
