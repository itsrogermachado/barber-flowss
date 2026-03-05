import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const AppSettings = () => {
  const { membership, refreshMembership } = useAuth();
  const [form, setForm] = useState({ name: '', slug: '', phone_whatsapp: '', address: '', instagram: '', slot_interval_minutes: 30 });
  const [isPublished, setIsPublished] = useState(false);

  const shopId = membership?.shop_id;

  useEffect(() => {
    const load = async () => {
      if (!shopId) return;
      const { data } = await supabase.from('shops').select('*').eq('id', shopId).single();
      if (data) {
        setForm({
          name: data.name,
          slug: data.slug,
          phone_whatsapp: data.phone_whatsapp || '',
          address: data.address || '',
          instagram: data.instagram || '',
          slot_interval_minutes: data.slot_interval_minutes,
        });
        setIsPublished(data.is_published);
      }
    };
    load();
  }, [shopId]);

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error('Nome e slug são obrigatórios.'); return; }
    const { error } = await supabase.from('shops').update({
      name: form.name,
      slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      phone_whatsapp: form.phone_whatsapp || null,
      address: form.address || null,
      instagram: form.instagram || null,
      slot_interval_minutes: form.slot_interval_minutes,
    }).eq('id', shopId);

    if (error) {
      if (error.code === '23505') toast.error('Esse slug já está em uso.');
      else toast.error('Erro ao salvar.');
      return;
    }
    await refreshMembership();
    toast.success('Configurações salvas!');
  };

  const togglePublish = async () => {
    await supabase.from('shops').update({ is_published: !isPublished }).eq('id', shopId);
    setIsPublished(!isPublished);
    await refreshMembership();
    toast.success(isPublished ? 'Barbearia despublicada.' : 'Barbearia publicada!');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">Configurações</h1>

        <Card>
          <CardHeader><CardTitle>Dados da barbearia</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Slug (link)</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="space-y-2"><Label>WhatsApp</Label><Input value={form.phone_whatsapp} onChange={e => setForm({ ...form, phone_whatsapp: e.target.value.replace(/\D/g, '') })} /></div>
            <div className="space-y-2"><Label>Endereço</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="space-y-2"><Label>Instagram</Label><Input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Intervalo</Label>
              <div className="flex gap-2">
                {[15, 30].map(v => (
                  <Button key={v} variant={form.slot_interval_minutes === v ? 'default' : 'outline'} onClick={() => setForm({ ...form, slot_interval_minutes: v })} className="flex-1">{v} min</Button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={save}><Save className="mr-2 h-4 w-4" />Salvar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Publicação</p>
              <p className="text-sm text-muted-foreground">{isPublished ? 'Sua barbearia está visível para clientes.' : 'Sua barbearia está oculta.'}</p>
            </div>
            <Button variant={isPublished ? 'destructive' : 'default'} onClick={togglePublish}>
              {isPublished ? 'Despublicar' : 'Publicar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AppSettings;
