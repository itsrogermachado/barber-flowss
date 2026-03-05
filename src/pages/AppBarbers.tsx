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

const AppBarbers = () => {
  const { membership } = useAuth();
  const [barbers, setBarbers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');

  const shopId = membership?.shop_id;
  const isOwnerAdmin = membership?.role === 'OWNER' || membership?.role === 'ADMIN';

  const load = async () => {
    if (!shopId) return;
    const { data } = await supabase.from('barbers').select('*').eq('shop_id', shopId).order('sort_order');
    setBarbers(data || []);
  };

  useEffect(() => { load(); }, [shopId]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Preencha o nome.'); return; }
    if (editing) {
      await supabase.from('barbers').update({ name }).eq('id', editing.id);
      toast.success('Barbeiro atualizado!');
    } else {
      await supabase.from('barbers').insert({ shop_id: shopId, name, sort_order: barbers.length });
      toast.success('Barbeiro adicionado!');
    }
    setOpen(false); setEditing(null); setName(''); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;
    await supabase.from('barbers').delete().eq('id', id);
    toast.success('Barbeiro excluído.'); load();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">Barbeiros</h1>
          {isOwnerAdmin && (
            <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setName(''); } }}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Novo</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editing ? 'Editar barbeiro' : 'Novo barbeiro'}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do barbeiro" /></div>
                  <Button className="w-full h-12" onClick={handleSave}>{editing ? 'Salvar' : 'Adicionar'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {barbers.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nenhum barbeiro cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {barbers.map(b => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-bold text-primary">{b.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.is_active ? 'Ativo' : 'Inativo'}</p>
                    </div>
                  </div>
                  {isOwnerAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(b); setName(b.name); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AppBarbers;
