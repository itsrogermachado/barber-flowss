import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AppBlockedSlots = () => {
  const { membership } = useAuth();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ barber_id: '', date: '', start: '09:00', end: '18:00', reason: '' });

  const shopId = membership?.shop_id;
  const isOwnerAdmin = membership?.role === 'OWNER' || membership?.role === 'ADMIN';

  const load = async () => {
    if (!shopId) return;
    let bQuery = supabase.from('barbers').select('*').eq('shop_id', shopId);
    if (!isOwnerAdmin && membership?.barber_id) bQuery = bQuery.eq('id', membership.barber_id);
    const { data: bData } = await bQuery;
    setBarbers(bData || []);

    let query = supabase.from('blocked_slots').select('*, barbers(name)').eq('shop_id', shopId).order('start_at', { ascending: false });
    if (!isOwnerAdmin && membership?.barber_id) query = query.eq('barber_id', membership.barber_id);
    const { data } = await query;
    setBlocks(data || []);
  };

  useEffect(() => { load(); }, [shopId]);

  const handleSave = async () => {
    if (!form.barber_id || !form.date || !form.start || !form.end) { toast.error('Preencha todos os campos.'); return; }
    const startAt = new Date(`${form.date}T${form.start}:00-03:00`);
    const endAt = new Date(`${form.date}T${form.end}:00-03:00`);

    if (endAt <= startAt) { toast.error('Horário final deve ser após o inicial.'); return; }

    await supabase.from('blocked_slots').insert({
      shop_id: shopId,
      barber_id: form.barber_id,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      reason: form.reason || null,
    });
    toast.success('Bloqueio criado!');
    setOpen(false);
    setForm({ barber_id: '', date: '', start: '09:00', end: '18:00', reason: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este bloqueio?')) return;
    await supabase.from('blocked_slots').delete().eq('id', id);
    toast.success('Bloqueio removido.'); load();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">Bloqueios</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Novo bloqueio</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo bloqueio</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Barbeiro</Label>
                  <Select value={form.barber_id} onValueChange={v => setForm({ ...form, barber_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Data</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2"><Label>Início</Label><Input type="time" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} /></div>
                  <div className="flex-1 space-y-2"><Label>Fim</Label><Input type="time" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Motivo (opcional)</Label><Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Ex: Consulta médica" /></div>
                <Button className="w-full h-12" onClick={handleSave}>Criar bloqueio</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {blocks.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nenhum bloqueio cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {blocks.map(b => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{b.barbers?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(b.start_at), 'dd/MM/yyyy HH:mm')} — {format(new Date(b.end_at), 'HH:mm')}
                    </p>
                    {b.reason && <p className="text-xs text-muted-foreground">{b.reason}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AppBlockedSlots;
