import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, CheckCircle, XCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';

const AppHome = () => {
  const { membership } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isBarber = membership?.role === 'BARBER';
  const shopId = membership?.shop_id;

  const loadToday = async () => {
    if (!shopId) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query = supabase
      .from('appointments')
      .select('*, barbers(name), services(name, price_cents, duration_minutes)')
      .eq('shop_id', shopId)
      .gte('start_at', today.toISOString())
      .lt('start_at', tomorrow.toISOString())
      .order('start_at');

    if (isBarber && membership?.barber_id) {
      query = query.eq('barber_id', membership.barber_id);
    }

    const { data } = await query;
    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => { loadToday(); }, [shopId]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    toast.success(status === 'completed' ? 'Concluído!' : status === 'no_show' ? 'Marcado como falta.' : 'Cancelado.');
    loadToday();
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

  const publicLink = membership?.shops?.slug ? `${window.location.origin}/s/${membership.shops.slug}` : '';

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Hoje · {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4"><div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" /></div>
            ) : appointments.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">Nenhum agendamento para hoje.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => (
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
