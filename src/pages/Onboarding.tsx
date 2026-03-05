import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Plus, Trash2, Check } from 'lucide-react';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const Onboarding = () => {
  const { membership, refreshMembership } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Shop info
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [interval, setIntervalMin] = useState(30);

  // Step 2: Barbers
  const [barbers, setBarbers] = useState<{ name: string; id?: string }[]>([]);
  const [newBarberName, setNewBarberName] = useState('');

  // Step 3: Services
  const [services, setServices] = useState<{ name: string; price: string; duration: string; id?: string }[]>([]);
  const [newService, setNewService] = useState({ name: '', price: '', duration: '30' });

  // Step 4: Working hours
  const [workingHours, setWorkingHours] = useState<Record<string, { enabled: boolean; start: string; end: string; breakStart: string; breakEnd: string }[]>>({});

  const shopId = membership?.shop_id;

  useEffect(() => {
    if (membership?.shops) {
      setShopName(membership.shops.name);
      setSlug(membership.shops.slug);
    }
  }, [membership]);

  const saveStep1 = async () => {
    if (!shopName.trim()) { toast.error('Preencha o nome da barbearia.'); return; }
    if (!slug.trim()) { toast.error('Preencha o link da barbearia.'); return; }

    const { error } = await supabase.from('shops').update({
      name: shopName,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      phone_whatsapp: whatsapp || null,
      address: address || null,
      instagram: instagram || null,
      slot_interval_minutes: interval,
    }).eq('id', shopId);

    if (error) {
      if (error.code === '23505') toast.error('Esse link já está em uso. Escolha outro.');
      else toast.error('Erro ao salvar. Tente novamente.');
      return;
    }
    await refreshMembership();
    setStep(2);
  };

  const addBarber = async () => {
    if (!newBarberName.trim()) return;
    const { data, error } = await supabase.from('barbers').insert({ shop_id: shopId, name: newBarberName, sort_order: barbers.length }).select().single();
    if (error) { toast.error('Erro ao adicionar barbeiro.'); return; }
    setBarbers([...barbers, { name: data.name, id: data.id }]);
    setNewBarberName('');
    toast.success('Barbeiro adicionado!');
  };

  const removeBarber = async (index: number) => {
    const b = barbers[index];
    if (b.id) await supabase.from('barbers').delete().eq('id', b.id);
    setBarbers(barbers.filter((_, i) => i !== index));
  };

  const addService = async () => {
    if (!newService.name.trim() || !newService.price || !newService.duration) {
      toast.error('Preencha todos os campos do serviço.');
      return;
    }
    const priceCents = Math.round(parseFloat(newService.price.replace(',', '.')) * 100);
    if (isNaN(priceCents) || priceCents <= 0) { toast.error('Preço inválido.'); return; }

    const { data, error } = await supabase.from('services').insert({
      shop_id: shopId,
      name: newService.name,
      price_cents: priceCents,
      duration_minutes: parseInt(newService.duration),
      sort_order: services.length,
    }).select().single();

    if (error) { toast.error('Erro ao adicionar serviço.'); return; }
    setServices([...services, { name: data.name, price: newService.price, duration: newService.duration, id: data.id }]);
    setNewService({ name: '', price: '', duration: '30' });
    toast.success('Serviço adicionado!');
  };

  const removeService = async (index: number) => {
    const s = services[index];
    if (s.id) await supabase.from('services').delete().eq('id', s.id);
    setServices(services.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (step === 4 && barbers.length > 0) {
      const initial: typeof workingHours = {};
      barbers.forEach(b => {
        if (b.id && !workingHours[b.id]) {
          initial[b.id] = WEEKDAYS.map((_, i) => ({
            enabled: i >= 1 && i <= 5,
            start: '09:00',
            end: '18:00',
            breakStart: '12:00',
            breakEnd: '13:00',
          }));
        }
      });
      if (Object.keys(initial).length > 0) setWorkingHours(prev => ({ ...prev, ...initial }));
    }
  }, [step, barbers]);

  const saveWorkingHours = async () => {
    const rows: any[] = [];
    for (const barberId of Object.keys(workingHours)) {
      workingHours[barberId].forEach((wh, weekday) => {
        if (wh.enabled) {
          rows.push({
            shop_id: shopId,
            barber_id: barberId,
            weekday,
            start_time: wh.start,
            end_time: wh.end,
            break_start_time: wh.breakStart || null,
            break_end_time: wh.breakEnd || null,
            is_enabled: true,
          });
        }
      });
    }
    if (rows.length === 0) { toast.error('Habilite pelo menos 1 dia de trabalho.'); return; }

    const { error } = await supabase.from('working_hours').insert(rows);
    if (error) { toast.error('Erro ao salvar horários.'); return; }
    setStep(5);
  };

  const publish = async () => {
    await supabase.from('shops').update({ onboarding_completed: true, is_published: true }).eq('id', shopId);
    await refreshMembership();
    toast.success('Barbearia publicada! 🎉');
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-2xl font-bold text-center font-['Space_Grotesk']">Configurar Barbearia</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">Passo {step} de {totalSteps}</p>
        <Progress value={(step / totalSteps) * 100} className="mb-8 h-2" />

        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Dados da barbearia</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Barbearia do João" value={shopName} onChange={e => setShopName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Link da agenda (slug)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/s/</span>
                  <Input placeholder="barbearia-do-joao" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input placeholder="11999999999" value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input placeholder="Rua, número - Bairro, Cidade" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input placeholder="@suabarbearia" value={instagram} onChange={e => setInstagram(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Intervalo entre horários</Label>
                <div className="flex gap-2">
                  {[15, 30].map(v => (
                    <Button key={v} variant={interval === v ? 'default' : 'outline'} onClick={() => setIntervalMin(v)} className="flex-1 h-12">{v} min</Button>
                  ))}
                </div>
              </div>
              <Button className="w-full h-12 text-base" onClick={saveStep1}>Próximo →</Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Barbeiros</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Adicione pelo menos 1 barbeiro.</p>
              {barbers.map((b, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span className="font-medium">{b.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeBarber(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Nome do barbeiro" value={newBarberName} onChange={e => setNewBarberName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBarber()} />
                <Button onClick={addBarber} size="icon" className="shrink-0"><Plus className="h-5 w-5" /></Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>← Voltar</Button>
                <Button className="flex-1 h-12" onClick={() => barbers.length > 0 ? setStep(3) : toast.error('Adicione pelo menos 1 barbeiro.')}>Próximo →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>Serviços</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Adicione pelo menos 1 serviço.</p>
              {services.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <span className="font-medium">{s.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">R$ {s.price} · {s.duration}min</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeService(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              <div className="space-y-2">
                <Input placeholder="Nome (ex: Corte)" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} />
                <div className="flex gap-2">
                  <Input placeholder="Preço (ex: 35,00)" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} />
                  <Input placeholder="Duração (min)" type="number" value={newService.duration} onChange={e => setNewService({ ...newService, duration: e.target.value })} className="w-28" />
                </div>
                <Button onClick={addService} variant="outline" className="w-full h-10"><Plus className="h-4 w-4 mr-2" />Adicionar serviço</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>← Voltar</Button>
                <Button className="flex-1 h-12" onClick={() => services.length > 0 ? setStep(4) : toast.error('Adicione pelo menos 1 serviço.')}>Próximo →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader><CardTitle>Horários de trabalho</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">Defina os dias e horários de cada barbeiro.</p>
              {barbers.filter(b => b.id).map(barber => (
                <div key={barber.id} className="space-y-3">
                  <h3 className="font-semibold text-base">{barber.name}</h3>
                  {WEEKDAYS.map((day, weekday) => {
                    const wh = workingHours[barber.id!]?.[weekday];
                    if (!wh) return null;
                    return (
                      <div key={weekday} className="space-y-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const updated = { ...workingHours };
                              updated[barber.id!][weekday].enabled = !wh.enabled;
                              setWorkingHours({ ...updated });
                            }}
                            className={`w-10 h-6 rounded-full transition-colors ${wh.enabled ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${wh.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                          <span className="text-sm w-16">{day.slice(0, 3)}</span>
                          {wh.enabled && (
                            <div className="flex items-center gap-1 text-sm">
                              <Input
                                type="time"
                                value={wh.start}
                                onChange={e => {
                                  const u = { ...workingHours };
                                  u[barber.id!][weekday].start = e.target.value;
                                  setWorkingHours({ ...u });
                                }}
                                className="w-24 h-8 text-xs"
                              />
                              <span>às</span>
                              <Input
                                type="time"
                                value={wh.end}
                                onChange={e => {
                                  const u = { ...workingHours };
                                  u[barber.id!][weekday].end = e.target.value;
                                  setWorkingHours({ ...u });
                                }}
                                className="w-24 h-8 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(3)}>← Voltar</Button>
                <Button className="flex-1 h-12" onClick={saveWorkingHours}>Próximo →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Tudo pronto!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Sua barbearia está configurada. Ao publicar, clientes poderão agendar pelo link:</p>
              <p className="rounded-lg bg-secondary px-4 py-3 font-mono text-sm break-all">{window.location.origin}/s/{slug}</p>
              <Button className="w-full h-12 text-base" onClick={publish}>🚀 Publicar barbearia</Button>
              <Button variant="outline" className="w-full" onClick={() => setStep(4)}>← Voltar</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
