import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Instagram, Clock, Scissors, Star, MessageCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const ShopPublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: shopData } = await supabase.from('shops').select('*').eq('slug', slug).eq('is_published', true).single();
      if (shopData && !shopData.is_suspended) {
        setShop(shopData);
        const [svcRes, barbersRes, whRes, reviewsRes] = await Promise.all([
          supabase.from('services').select('*').eq('shop_id', shopData.id).eq('is_active', true).order('sort_order'),
          supabase.from('barbers').select('*').eq('shop_id', shopData.id).eq('is_active', true).order('sort_order'),
          supabase.from('working_hours').select('*').eq('shop_id', shopData.id).eq('is_enabled', true).order('weekday'),
          supabase.from('reviews' as any).select('*').eq('shop_id', shopData.id).order('created_at', { ascending: false }).limit(10),
        ]);
        setServices(svcRes.data || []);
        setBarbers(barbersRes.data || []);
        setWorkingHours(whRes.data || []);
        setReviews(reviewsRes.data || []);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  if (!shop) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Scissors className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Agenda indisponível</h1>
      <p className="text-muted-foreground">Essa barbearia não está publicada ou não existe.</p>
    </div>
  );

  const formatPrice = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Group working hours by barber for display — just show unique time ranges
  const uniqueSchedules = new Map<string, { start: string; end: string }>();
  workingHours.forEach((wh: any) => {
    const key = `${wh.weekday}`;
    if (!uniqueSchedules.has(key)) {
      uniqueSchedules.set(key, { start: wh.start_time, end: wh.end_time });
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary/10 to-background pt-10 pb-8">
        <div className="mx-auto max-w-lg px-4 text-center">
          <h1 className="text-3xl font-bold font-['Space_Grotesk']">{shop.name}</h1>
          
          {avgRating && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-sm">{avgRating}</span>
              <span className="text-xs text-muted-foreground">({reviews.length} avaliações)</span>
            </div>
          )}

          {shop.address && (
            <p className="mt-3 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />{shop.address}
            </p>
          )}
          
          <div className="mt-3 flex items-center justify-center gap-4">
            {shop.phone_whatsapp && (
              <a href={`https://wa.me/55${shop.phone_whatsapp}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-primary hover:underline">
                <Phone className="h-4 w-4" />WhatsApp
              </a>
            )}
            {shop.instagram && (
              <a href={`https://instagram.com/${shop.instagram.replace('@', '')}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-primary hover:underline">
                <Instagram className="h-4 w-4" />{shop.instagram}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6 space-y-8">
        {/* CTA */}
        <Link to={`/s/${slug}/agendar`}>
          <Button className="w-full h-14 text-lg">✂️ Agendar agora</Button>
        </Link>

        {/* Barbers */}
        {barbers.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />Nossa Equipe
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {barbers.map((b: any) => (
                <div key={b.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary font-['Space_Grotesk']">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-medium text-center">{b.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />Serviços
            </h2>
            <div className="space-y-3">
              {services.map(s => (
                <Card key={s.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />{s.duration_minutes}min
                      </p>
                    </div>
                    <span className="text-lg font-bold text-primary">{formatPrice(s.price_cents)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Working Hours */}
        {uniqueSchedules.size > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />Horário de Funcionamento
            </h2>
            <Card>
              <CardContent className="p-4 space-y-2">
                {Array.from(uniqueSchedules.entries()).map(([weekday, times]) => (
                  <div key={weekday} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{dayNames[parseInt(weekday)]}</span>
                    <span className="font-medium">{times.start} - {times.end}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />Avaliações
            </h2>
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <Card key={r.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{r.client_name}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground py-4">
          Powered by <span className="text-primary font-semibold">BarberFlow</span>
        </p>
      </div>
    </div>
  );
};



export default ShopPublic;
