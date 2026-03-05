import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AppAgenda = () => {
  const { membership } = useAuth();
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const isBarber = membership?.role === 'BARBER';
  const shopId = membership?.shop_id;

  const load = async () => {
    if (!shopId) return;
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);

    let query = supabase
      .from('appointments')
      .select('*, barbers(name), services(name, price_cents)')
      .eq('shop_id', shopId)
      .gte('start_at', start.toISOString())
      .lt('start_at', end.toISOString())
      .order('start_at');

    if (isBarber && membership?.barber_id) query = query.eq('barber_id', membership.barber_id);

    const { data } = await query;
    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [date, shopId]);

  // Realtime: listen for appointment changes
  useEffect(() => {
    if (!shopId) return;
    const channel = supabase
      .channel('agenda-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `shop_id=eq.${shopId}` },
        () => { load(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [shopId, date]);

  const filtered = appointments.filter(a =>
    !search || a.client_name.toLowerCase().includes(search.toLowerCase()) || a.client_whatsapp.includes(search)
  );

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    toast.success('Status atualizado!');
    load();
  };

  const statusLabel = (s: string) => ({ confirmed: 'Confirmado', completed: 'Concluído', no_show: 'Faltou', cancelled: 'Cancelado' }[s] || s);
  const statusColor = (s: string) => ({ confirmed: 'text-primary', completed: 'text-green-600', no_show: 'text-yellow-600', cancelled: 'text-destructive' }[s] || '');

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">Agenda</h1>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, -1))}><ChevronLeft className="h-5 w-5" /></Button>
          <div className="text-center">
            <p className="text-lg font-semibold">{format(date, "EEEE", { locale: ptBR })}</p>
            <p className="text-sm text-muted-foreground">{format(date, "dd/MM/yyyy")}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 1))}><ChevronRight className="h-5 w-5" /></Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou WhatsApp..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nenhum agendamento nesse dia.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => (
              <Card key={a.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{format(new Date(a.start_at), 'HH:mm')} – {format(new Date(a.end_at), 'HH:mm')} · {a.client_name}</p>
                      <p className="text-sm text-muted-foreground">{a.services?.name} · {a.services?.price_cents ? (a.services.price_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</p>
                      <p className="text-sm text-muted-foreground">Barbeiro: {a.barbers?.name}</p>
                      <p className="text-xs text-muted-foreground">📱 {a.client_whatsapp}</p>
                      {a.notes && <p className="text-xs text-muted-foreground italic">📝 {a.notes}</p>}
                      <p className="text-xs text-muted-foreground">Código: {a.id.slice(0, 8)}</p>
                    </div>
                    <span className={`text-xs font-medium ${statusColor(a.status)}`}>{statusLabel(a.status)}</span>
                  </div>
                  {a.status === 'confirmed' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => updateStatus(a.id, 'completed')}><CheckCircle className="mr-1 h-3 w-3" />Concluir</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'no_show')}><AlertCircle className="mr-1 h-3 w-3" />Faltou</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'cancelled')}><XCircle className="mr-1 h-3 w-3" />Cancelar</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AppAgenda;
