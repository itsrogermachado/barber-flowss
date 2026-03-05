import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar, CheckCircle, XCircle, AlertCircle, Link as LinkIcon,
  DollarSign, TrendingUp, Scissors, Users
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = [
  'hsl(25, 95%, 50%)', 'hsl(25, 80%, 65%)', 'hsl(30, 60%, 45%)',
  'hsl(30, 40%, 55%)', 'hsl(25, 50%, 70%)'
];

const AppHome = () => {
  const { membership } = useAuth();
  const [todayAppts, setTodayAppts] = useState<any[]>([]);
  const [monthAppts, setMonthAppts] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnerAdmin = membership?.role === 'OWNER' || membership?.role === 'ADMIN';
  const isBarber = membership?.role === 'BARBER';
  const shopId = membership?.shop_id;

  const loadData = async () => {
    if (!shopId) return;
    const now = new Date();
    const dayStart = startOfDay(now).toISOString();
    const dayEnd = endOfDay(now).toISOString();
    const monthStart = startOfMonth(now).toISOString();
    const monthEnd = endOfMonth(now).toISOString();

    let todayQuery = supabase
      .from('appointments')
      .select('*, barbers(name), services(name, price_cents, duration_minutes)')
      .eq('shop_id', shopId)
      .gte('start_at', dayStart)
      .lt('start_at', dayEnd)
      .order('start_at');

    if (isBarber && membership?.barber_id) {
      todayQuery = todayQuery.eq('barber_id', membership.barber_id);
    }

    const [todayRes, monthRes, barbersRes, servicesRes] = await Promise.all([
      todayQuery,
      supabase.from('appointments')
        .select('*, barbers(name), services(name, price_cents)')
        .eq('shop_id', shopId)
        .gte('start_at', monthStart)
        .lte('start_at', monthEnd),
      supabase.from('barbers').select('*').eq('shop_id', shopId).eq('is_active', true),
      supabase.from('services').select('*').eq('shop_id', shopId).eq('is_active', true),
    ]);

    setTodayAppts(todayRes.data || []);
    setMonthAppts(monthRes.data || []);
    setBarbers(barbersRes.data || []);
    setServices(servicesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [shopId]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    toast.success(status === 'completed' ? 'Concluído!' : status === 'no_show' ? 'Marcado como falta.' : 'Cancelado.');
    loadData();
  };

  const statusColor = (s: string) => {
    if (s === 'confirmed') return 'text-primary';
    if (s === 'completed') return 'text-green-600';
    if (s === 'no_show') return 'text-yellow-600';
    return 'text-destructive';
  };

  const statusLabel = (s: string) => {
    if (s === 'confirmed') return 'Confirmado';
    if (s === 'completed') return 'Concluído';
    if (s === 'no_show') return 'Faltou';
    return 'Cancelado';
  };

  // Dashboard metrics (owner/admin only)
  const metrics = useMemo(() => {
    const completed = monthAppts.filter(a => a.status === 'completed' || a.status === 'confirmed');
    const revenue = completed.reduce((sum, a) => sum + (a.services?.price_cents || 0), 0);

    // Top barber
    const barberCount: Record<string, { name: string; count: number }> = {};
    completed.forEach(a => {
      const name = a.barbers?.name || 'Desconhecido';
      if (!barberCount[name]) barberCount[name] = { name, count: 0 };
      barberCount[name].count++;
    });
    const topBarber = Object.values(barberCount).sort((a, b) => b.count - a.count)[0];

    // Top service
    const serviceCount: Record<string, { name: string; count: number }> = {};
    completed.forEach(a => {
      const name = a.services?.name || 'Desconhecido';
      if (!serviceCount[name]) serviceCount[name] = { name, count: 0 };
      serviceCount[name].count++;
    });
    const topService = Object.values(serviceCount).sort((a, b) => b.count - a.count)[0];

    // Chart: appointments by day of week
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const byDay = dayNames.map((name, i) => ({
      name,
      agendamentos: completed.filter(a => new Date(a.start_at).getDay() === i).length
    }));

    // Pie: services distribution
    const servicesPie = Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(s => ({ name: s.name, value: s.count }));

    return {
      revenue,
      totalMonth: completed.length,
      todayCount: todayAppts.length,
      topBarber,
      topService,
      byDay,
      servicesPie,
    };
  }, [monthAppts, todayAppts]);

  const publicLink = membership?.shops?.slug ? `${window.location.origin}/s/${membership.shops.slug}` : '';

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">Olá! 👋</h1>
          <p className="text-muted-foreground">{membership?.shops?.name}</p>
        </div>

        {publicLink && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-sm">
                <LinkIcon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Link público:</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(publicLink); toast.success('Link copiado!'); }}>
                Copiar link
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dashboard metrics - Owner/Admin only */}
        {isOwnerAdmin && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Faturamento do mês</p>
                      <p className="text-xl font-bold font-['Space_Grotesk']">
                        R$ {(metrics.revenue / 100).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Agendamentos (mês)</p>
                      <p className="text-xl font-bold font-['Space_Grotesk']">{metrics.totalMonth}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Scissors className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Barbeiro top</p>
                      <p className="text-sm font-bold font-['Space_Grotesk'] truncate">{metrics.topBarber?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{metrics.topBarber ? `${metrics.topBarber.count} atend.` : ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Serviço top</p>
                      <p className="text-sm font-bold font-['Space_Grotesk'] truncate">{metrics.topService?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{metrics.topService ? `${metrics.topService.count} vezes` : ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Agendamentos por dia da semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={metrics.byDay}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="agendamentos" fill="hsl(25, 95%, 50%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Serviços mais populares</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.servicesPie.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={metrics.servicesPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {metrics.servicesPie.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">Nenhum dado ainda.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Today's appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Hoje · {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {todayAppts.length} agendamento(s)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppts.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">Nenhum agendamento para hoje.</p>
            ) : (
              <div className="space-y-3">
                {todayAppts.map(a => (
                  <div key={a.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{format(new Date(a.start_at), 'HH:mm')} - {a.client_name}</p>
                        <p className="text-sm text-muted-foreground">{a.services?.name} · {a.barbers?.name}</p>
                      </div>
                      <span className={`text-xs font-medium ${statusColor(a.status)}`}>{statusLabel(a.status)}</span>
                    </div>
                    {a.status === 'confirmed' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => updateStatus(a.id, 'completed')}>
                          <CheckCircle className="mr-1 h-4 w-4" />Concluir
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'no_show')}>
                          <AlertCircle className="mr-1 h-4 w-4" />Faltou
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'cancelled')}>
                          <XCircle className="mr-1 h-4 w-4" />Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AppHome;
