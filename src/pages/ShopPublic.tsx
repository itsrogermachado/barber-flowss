import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Instagram, Clock, Scissors } from 'lucide-react';

const ShopPublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: shopData } = await supabase.from('shops').select('*').eq('slug', slug).eq('is_published', true).single();
      if (shopData && !shopData.is_suspended) {
        setShop(shopData);
        const { data: svcData } = await supabase.from('services').select('*').eq('shop_id', shopData.id).eq('is_active', true).order('sort_order');
        setServices(svcData || []);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-['Space_Grotesk']">{shop.name}</h1>
          {shop.address && <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{shop.address}</p>}
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

        <Link to={`/s/${slug}/agendar`}>
          <Button className="w-full h-14 text-lg mb-8">✂️ Agendar agora</Button>
        </Link>

        {services.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2"><Scissors className="h-5 w-5" />Serviços</h2>
            <div className="space-y-3">
              {services.map(s => (
                <Card key={s.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{s.duration_minutes}min</p>
                    </div>
                    <span className="text-lg font-bold text-primary">{formatPrice(s.price_cents)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPublic;
