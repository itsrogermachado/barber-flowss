import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const AppServices = () => {
  const { membership } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', price: '', duration: '30' });

  const shopId = membership?.shop_id;

  const load = async () => {
    if (!shopId) return;
    const { data } = await supabase.from('services').select('*').eq('shop_id', shopId).order('sort_order');
    setServices(data || []);
  };

  useEffect(() => { load(); }, [shopId]);

  const formatPrice = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.duration) { toast.error('Preencha todos os campos.'); return; }
    const priceCents = Math.round(parseFloat(form.price.replace(',', '.')) * 100);
    if (isNaN(priceCents) || priceCents <= 0) { toast.error('Preço inválido.'); return; }

    if (editing) {
      await supabase.from('services').update({ name: form.name, price_cents: priceCents, duration_minutes: parseInt(form.duration) }).eq('id', editing.id);
      toast.success('Serviço atualizado!');
    } else {
      await supabase.from('services').insert({ shop_id: shopId, name: form.name, price_cents: priceCents, duration_minutes: parseInt(form.duration), sort_order: services.length });
      toast.success('Serviço adicionado!');
    }
    setOpen(false);
    setEditing(null);
    setForm({ name: '', price: '', duration: '30' });
    load();
  };

  const handleEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, price: (s.price_cents / 100).toString(), duration: s.duration_minutes.toString() });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    await supabase.from('services').delete().eq('id', id);
    toast.success('Serviço excluído.');
    load();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">Serviços</h1>
          <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setForm({ name: '', price: '', duration: '30' }); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Novo serviço</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Editar serviço' : 'Novo serviço'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nome</Label><Input placeholder="Ex: Corte" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Preço (R$)</Label><Input placeholder="35,00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                <div className="space-y-2"><Label>Duração (min)</Label><Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
                <Button className="w-full h-12" onClick={handleSave}>{editing ? 'Salvar' : 'Adicionar'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {services.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nenhum serviço cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {services.map(s => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.duration_minutes}min · {formatPrice(s.price_cents)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AppServices;
