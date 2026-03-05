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

  useEffect(() => {
    const load = async () => {
      const { data: s } = await supabase.from('shops').select('*').eq('slug', slug).single();
      if (s) setShop(s);
    };
    load();
  }, [slug, appointmentId]);

  const message = shop ? `Olá! Agendei um horário na ${shop.name}. Meu código: ${appointmentId?.slice(0, 8)}` : '';

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Mensagem copiada!');
  };

  const openWhatsapp = () => {
    if (shop?.phone_whatsapp) {
      window.open(`https://wa.me/55${shop.phone_whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
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
          <CardContent className="p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Barbearia</p>
            <p className="font-medium">{shop?.name}</p>
            <p className="text-sm text-muted-foreground mt-2">Código</p>
            <p className="font-mono text-sm">{appointmentId?.slice(0, 8)}</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button variant="outline" className="w-full h-12" onClick={copyMessage}>
            <Copy className="mr-2 h-4 w-4" />Copiar mensagem
          </Button>
          {shop?.phone_whatsapp && (
            <Button className="w-full h-12" onClick={openWhatsapp}>
              <MessageCircle className="mr-2 h-4 w-4" />Abrir WhatsApp
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
