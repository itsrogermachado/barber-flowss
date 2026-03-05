import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Star, CheckCircle, ArrowLeft } from 'lucide-react';

const ReviewSubmit = () => {
  const { slug, appointmentId } = useParams<{ slug: string; appointmentId: string }>();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Selecione uma nota.'); return; }
    if (!clientName.trim()) { toast.error('Digite seu nome.'); return; }

    setLoading(true);
    // Get shop_id from slug
    const { data: shop } = await supabase.from('shops').select('id').eq('slug', slug).single();
    if (!shop) { toast.error('Barbearia não encontrada.'); setLoading(false); return; }

    const { error } = await supabase.from('reviews' as any).insert({
      shop_id: shop.id,
      appointment_id: appointmentId,
      client_name: clientName.trim(),
      rating,
      comment: comment.trim() || null,
    });

    setLoading(false);
    if (error) {
      if (error.code === '23505') {
        toast.error('Você já avaliou este atendimento.');
      } else {
        toast.error('Erro ao enviar avaliação.');
      }
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold font-['Space_Grotesk']">Obrigado pela avaliação!</h2>
            <p className="text-sm text-muted-foreground">Sua opinião é muito importante para nós.</p>
            <Link to={`/s/${slug}`}>
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />Ver barbearia
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-['Space_Grotesk']">Avalie seu atendimento</CardTitle>
          <p className="text-sm text-muted-foreground">Como foi sua experiência?</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      i <= (hoverRating || rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome</Label>
              <Input id="name" placeholder="Digite seu nome" value={clientName} onChange={e => setClientName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comentário (opcional)</Label>
              <Textarea id="comment" placeholder="Conte como foi sua experiência..." value={comment} onChange={e => setComment(e.target.value)} rows={3} />
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar avaliação'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewSubmit;
