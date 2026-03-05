import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BookingConfirmation = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('id');
  const [shop, setShop] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: s } = await supabase.from('shops').select('*').eq('slug', slug).single();
      if (s) setShop(s);
      if (appointmentId) {
        const { data: apt } = await supabase.from('appointments').select('*, barbers(name), services(name, price_cents, duration_minutes)').eq('id', appointmentId).single();
        if (apt) setAppointment(apt);
      }
    };
    load();
  }, [slug, appointmentId]);

  const formatPrice = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const message = shop && appointment
    ? `Olá! Agendei um horário na *${shop.name}*.\n\n📋 *Serviço:* ${appointment.services?.name}\n💰 *Valor:* ${formatPrice(appointment.services?.price_cents)}\n✂️ *Barbeiro:* ${appointment.barbers?.name}\n📅 *Data:* ${format(new Date(appointment.start_at), "dd/MM/yyyy", { locale: ptBR })}\n🕐 *Horário:* ${format(new Date(appointment.start_at), "HH:mm")} às ${format(new Date(appointment.end_at), "HH:mm")}\n🔖 *Código:* ${appointmentId?.slice(0, 8)}${appointment.notes ? `\n📝 *Obs:* ${appointment.notes}` : ''}`
    : '';

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Mensagem copiada!');
  };

  const openWhatsapp = () => {
    if (shop?.phone_whatsapp) {
      window.location.href = `https://wa.me/55${shop.phone_whatsapp}?text=${encodeURIComponent(message)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold font-['Space_Grotesk']">Agendamento confirmado!</h1>
        <p className="mb-6 text-muted-foreground">Você receberá os detalhes no seu WhatsApp.</p>

        <Card className="mb-6 text-left">
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Barbearia</p>
              <p className="font-medium">{shop?.name}</p>
            </div>
            {appointment && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium">{appointment.services?.name} · {formatPrice(appointment.services?.price_cents)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Barbeiro</p>
                  <p className="font-medium">{appointment.barbers?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data e horário</p>
                  <p className="font-medium">{format(new Date(appointment.start_at), "dd/MM/yyyy", { locale: ptBR })} · {format(new Date(appointment.start_at), "HH:mm")} às {format(new Date(appointment.end_at), "HH:mm")}</p>
                </div>
                {appointment.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observação</p>
                    <p className="font-medium">{appointment.notes}</p>
                  </div>
                )}
              </>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Código</p>
              <p className="font-mono text-sm">{appointmentId?.slice(0, 8)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {shop?.phone_whatsapp && (
            <Button className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white" onClick={openWhatsapp}>
              <MessageCircle className="mr-2 h-5 w-5" />Enviar no WhatsApp
            </Button>
          )}
          <Button variant="outline" className="w-full h-12" onClick={copyMessage}>
            <Copy className="mr-2 h-4 w-4" />Copiar mensagem
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
