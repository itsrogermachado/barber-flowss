import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BookingWizard = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shop, setShop] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const dates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    const load = async () => {
      const { data: s } = await supabase.from('shops').select('*').eq('slug', slug).eq('is_published', true).single();
      if (!s) return;
      setShop(s);
      const { data: svc } = await supabase.from('services').select('*').eq('shop_id', s.id).eq('is_active', true).order('sort_order');
      setServices(svc || []);
      const { data: brb } = await supabase.from('barbers').select('*').eq('shop_id', s.id).eq('is_active', true).order('sort_order');
      setBarbers(brb || []);
    };
    load();
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !selectedService || !shop) return;
    const loadSlots = async () => {
      setSlotsLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data } = await supabase.rpc('get_available_slots', {
        _shop_slug: slug!,
        _service_id: selectedService.id,
        _barber_id: selectedBarber === 'any' ? null : selectedBarber,
        _date: dateStr,
      } as any);
      setSlots((data as any[]) || []);
      setSelectedSlot(null);
      setSlotsLoading(false);
    };
    loadSlots();
  }, [selectedDate, selectedService, selectedBarber, shop]);

  const formatPrice = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleConfirm = async () => {
    if (!clientName.trim()) { toast.error('Preencha seu nome.'); return; }
    if (clientWhatsapp.replace(/\D/g, '').length < 10) { toast.error('WhatsApp inválido.'); return; }

    setLoading(true);
    const { data, error } = await supabase.rpc('create_appointment', {
      _shop_slug: slug!,
      _service_id: selectedService.id,
      _barber_choice: selectedSlot.barber_id,
      _start_at: selectedSlot.start_at,
      _client_name: clientName.trim(),
      _client_whatsapp: clientWhatsapp.replace(/\D/g, ''),
      _notes: notes || null,
    } as any);
    setLoading(false);

    const result = data as any;
    if (error || result?.error) {
      toast.error(result?.error || 'Erro ao agendar. Tente novamente.');
      return;
    }

    navigate(`/s/${slug}/confirmacao?id=${result.appointment_id}&barber=${result.barber_id}`);
  };

  if (!shop) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate(`/s/${slug}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold font-['Space_Grotesk']">{shop.name}</h1>
            <p className="text-sm text-muted-foreground">Passo {step} de 4</p>
          </div>
        </div>
        <Progress value={(step / 4) * 100} className="mb-6 h-2" />

        {/* Step 1: Service */}
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Escolha o serviço</h2>
            {services.map(s => (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all ${selectedService?.id === s.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                onClick={() => { setSelectedService(s); setStep(2); }}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-base">{s.name}</p>
                    <p className="text-sm text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{s.duration_minutes}min</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{formatPrice(s.price_cents)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Barber */}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Escolha o barbeiro</h2>
            <Card
              className={`cursor-pointer transition-all ${selectedBarber === 'any' ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
              onClick={() => { setSelectedBarber('any'); setStep(3); }}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Sem preferência</p>
                  <p className="text-sm text-muted-foreground">Qualquer barbeiro disponível</p>
                </div>
              </CardContent>
            </Card>
            {barbers.map(b => (
              <Card
                key={b.id}
                className={`cursor-pointer transition-all ${selectedBarber === b.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                onClick={() => { setSelectedBarber(b.id); setStep(3); }}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">{b.name[0]}</span>
                  </div>
                  <p className="font-medium">{b.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Data e horário</h2>

            {/* Date picker */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {dates.map(d => (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  className={`flex min-w-[4.5rem] flex-col items-center rounded-xl border px-3 py-2 text-sm transition-colors ${
                    selectedDate && isSameDay(d, selectedDate) ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary/50'
                  }`}
                >
                  <span className="text-xs uppercase">{format(d, 'EEE', { locale: ptBR })}</span>
                  <span className="text-lg font-bold">{format(d, 'dd')}</span>
                  <span className="text-xs">{format(d, 'MMM', { locale: ptBR })}</span>
                </button>
              ))}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" /></div>
                ) : slots.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">Sem horários nesse dia. Tente outro. 📅</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((s: any, i: number) => (
                      <Button
                        key={i}
                        variant={selectedSlot === s ? 'default' : 'outline'}
                        className="h-12 text-base"
                        onClick={() => { setSelectedSlot(s); setStep(4); }}
                      >
                        {s.time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Client info */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seus dados</h2>
            <Card>
              <CardContent className="space-y-4 p-4">
                <div className="rounded-lg bg-secondary p-3 text-sm">
                  <p><strong>{selectedService?.name}</strong> · {formatPrice(selectedService?.price_cents)}</p>
                  <p>{selectedSlot?.barber_name} · {selectedDate && format(selectedDate, "dd/MM/yyyy")} às {selectedSlot?.time}</p>
                </div>
                <div className="space-y-2">
                  <Label>Seu nome *</Label>
                  <Input placeholder="Como quer ser chamado?" value={clientName} onChange={e => setClientName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp *</Label>
                  <Input placeholder="11999999999" value={clientWhatsapp} onChange={e => setClientWhatsapp(e.target.value.replace(/\D/g, ''))} maxLength={11} />
                </div>
                <div className="space-y-2">
                  <Label>Observação (opcional)</Label>
                  <Input placeholder="Ex: barba com navalha" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <Button className="w-full h-12 text-base" onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Agendando...' : '✅ Confirmar agendamento'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWizard;
