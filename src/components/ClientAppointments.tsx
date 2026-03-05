import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, CalendarDays, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ClientAppointmentsProps {
  shopSlug: string;
}

const ClientAppointments = ({ shopSlug }: ClientAppointmentsProps) => {
  const [whatsapp, setWhatsapp] = useState(() => localStorage.getItem(`client_wpp_${shopSlug}`) || '');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async (wpp: string) => {
    if (wpp.replace(/\D/g, '').length < 10) return;
    setLoading(true);
    const clean = wpp.replace(/\D/g, '');
    const { data } = await supabase.rpc('get_client_appointments', {
      _shop_slug: shopSlug,
      _client_whatsapp: clean,
    } as any);
    setAppointments((data as any[]) || []);
    setSearched(true);
    setLoading(false);
    localStorage.setItem(`client_wpp_${shopSlug}`, clean);
  };

  useEffect(() => {
    const saved = localStorage.getItem(`client_wpp_${shopSlug}`);
    if (saved && saved.length >= 10) {
      setWhatsapp(saved);
      fetchAppointments(saved);
    }
  }, [shopSlug]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments(whatsapp);
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    const clean = whatsapp.replace(/\D/g, '');
    const { data } = await supabase.rpc('cancel_appointment_by_client', {
      _appointment_id: cancelId,
      _client_whatsapp: clean,
    } as any);

    const result = data as any;
    setCancelling(false);
    setCancelId(null);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Agendamento cancelado!');
    fetchAppointments(clean);

    // Open WhatsApp with cancellation message
    if (result?.shop_whatsapp) {
      const dateStr = format(new Date(result.start_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      const msg = encodeURIComponent(
        `Olá! Preciso cancelar meu agendamento:\n` +
        `📋 ${result.service_name}\n` +
        `💈 Barbeiro: ${result.barber_name}\n` +
        `📅 ${dateStr}\n` +
        `👤 Cliente: ${result.client_name}\n` +
        `Obrigado!`
      );
      window.open(`https://wa.me/55${result.shop_whatsapp}?text=${msg}`, '_blank');
    }
  };

  const formatPrice = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />Meus Agendamentos
      </h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Seu WhatsApp (ex: 11999999999)"
            className="pl-10"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))}
            maxLength={11}
          />
        </div>
        <Button type="submit" disabled={whatsapp.replace(/\D/g, '').length < 10 || loading}>
          Buscar
        </Button>
      </form>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && searched && appointments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum agendamento futuro encontrado.</p>
      )}

      {!loading && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {format(new Date(a.start_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {a.service_name} · {formatPrice(a.price_cents)}
                    </p>
                    <p className="text-sm text-muted-foreground">💈 {a.barber_name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setCancelId(a.id)}
                  >
                    <XCircle className="mr-1 h-3 w-3" />Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O horário será liberado para outros clientes e uma mensagem será enviada ao barbeiro via WhatsApp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelando...' : 'Sim, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default ClientAppointments;
