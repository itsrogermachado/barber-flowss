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
  Copy, ExternalLink, Store, Users, Scissors, Calendar,
  Search, ShieldCheck, Link2, LogOut
} from 'lucide-react';

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [signupLink, setSignupLink] = useState('');

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data } = await supabase.from('super_admins' as any).select('*').eq('email', user.email).maybeSingle();
      if (!data) { navigate('/app'); return; }

      setIsSuperAdmin(true);
      setSignupLink(`${window.location.origin}/signup`);
      await loadData();
    };
    check();
  }, []);

  const loadData = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const copyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!isSuperAdmin) {
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

  const totalAppointments = appointments.length;
  const publishedShops = shops.filter(s => s.is_published).length;

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
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{shops.length}</p>
                <p className="text-xs text-muted-foreground">Barbearias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Store className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{publishedShops}</p>
                <p className="text-xs text-muted-foreground">Publicadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{memberships.length}</p>
                <p className="text-xs text-muted-foreground">Usuários</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{totalAppointments}</p>
                <p className="text-xs text-muted-foreground">Agendamentos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signup link card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" />Link de Cadastro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Envie este link para novos barbeiros criarem suas barbearias:</p>
            <div className="flex items-center gap-2">
              <Input readOnly value={signupLink} className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyLink(signupLink)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar barbearia por nome ou slug..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Shops list */}
        {loading ? (
          <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" /></div>
        ) : (
          <div className="space-y-4">
            {filtered.map(shop => {
              const shopBarbers = getShopBarbers(shop.id);
              const shopServices = getShopServices(shop.id);
              const shopMembers = getShopMembers(shop.id);
              const shopAppts = getShopAppointments(shop.id);
              const publicUrl = `${window.location.origin}/s/${shop.slug}`;

              return (
                <Card key={shop.id}>
                  <CardContent className="p-4 space-y-3">
                    {/* Shop header */}
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

                    {/* Shop details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">WhatsApp</p>
                        <p className="font-medium">{shop.phone_whatsapp || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Endereço</p>
                        <p className="font-medium">{shop.address || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Instagram</p>
                        <p className="font-medium">{shop.instagram || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Criada em</p>
                        <p className="font-medium">{shop.created_at ? format(new Date(shop.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</p>
                      </div>
                    </div>

                    {/* Counters */}
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline" className="gap-1">
                        <Scissors className="h-3 w-3" />{shopBarbers.length} barbeiro(s)
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Store className="h-3 w-3" />{shopServices.length} serviço(s)
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />{shopMembers.length} membro(s)
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />{shopAppts.length} agendamento(s)
                      </Badge>
                    </div>

                    {/* Trial info */}
                    {shop.trial_ends_at && (
                      <p className="text-xs text-muted-foreground">
                        Trial até: {format(new Date(shop.trial_ends_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyLink(publicUrl)}>
                        <Copy className="mr-1 h-3 w-3" />Copiar link público
                      </Button>
                      {shop.is_published && (
                        <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, '_blank')}>
                          <ExternalLink className="mr-1 h-3 w-3" />Abrir página
                        </Button>
                      )}
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
