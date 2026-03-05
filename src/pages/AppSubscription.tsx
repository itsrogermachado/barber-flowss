import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AppSubscription = () => {
  const { membership } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!membership?.shop_id) return;
      const { data: s } = await supabase.from('shops').select('*').eq('id', membership.shop_id).single();
      setShop(s);
      if (s) {
        const { data: l } = await supabase.from('plan_limits').select('*').eq('plan', s.plan).single();
        setLimits(l);
      }
    };
    load();
  }, [membership]);

  const planLabel = (p: string) => ({ trial: 'Trial', starter: 'Starter', pro: 'Pro', scale: 'Scale' }[p] || p);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">Assinatura</h1>

        {shop && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Plano atual
                <Badge variant="secondary" className="text-sm">{planLabel(shop.plan)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {shop.trial_ends_at && (
                <p className="text-sm text-muted-foreground">
                  Trial até: {new Date(shop.trial_ends_at).toLocaleDateString('pt-BR')}
                </p>
              )}
              {limits && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Barbeiros máx.</span>
                    <span className="font-medium">{limits.max_barbers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Agendamentos/mês</span>
                    <span className="font-medium">{limits.max_appointments_month}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lembretes WhatsApp</span>
                    <span className="font-medium">{limits.whatsapp_reminders_enabled ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Integração com pagamentos em breve.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AppSubscription;
