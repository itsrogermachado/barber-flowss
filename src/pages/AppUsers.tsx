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
import { UserPlus, Mail, Copy } from 'lucide-react';

const AppUsers = () => {
  const { membership } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('BARBER');
  const [barberId, setBarberId] = useState('');
  const [barbers, setBarbers] = useState<any[]>([]);

  const shopId = membership?.shop_id;

  const load = async () => {
    if (!shopId) return;
    const { data: mData } = await supabase.from('memberships').select('*, barbers(name)').eq('shop_id', shopId);
    setMembers(mData || []);
    const { data: iData } = await supabase.from('invitations').select('*').eq('shop_id', shopId).order('created_at', { ascending: false });
    setInvitations(iData || []);
    const { data: bData } = await supabase.from('barbers').select('*').eq('shop_id', shopId);
    setBarbers(bData || []);
  };

  useEffect(() => { load(); }, [shopId]);

  const invite = async () => {
    if (!email.trim()) { toast.error('Preencha o e-mail.'); return; }
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { error } = await supabase.from('invitations').insert({
      shop_id: shopId,
      role,
      barber_id: role === 'BARBER' && barberId ? barberId : null,
      email: email.trim(),
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (error) { toast.error('Erro ao criar convite.'); return; }
    toast.success('Convite criado!');
    setOpen(false);
    setEmail('');
    load();
  };

  const copyInviteLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite?token=${token}`);
    toast.success('Link copiado!');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">Usuários</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" />Convidar</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Convidar usuário</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" /></div>
                <div className="space-y-2">
                  <Label>Papel</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BARBER">Barbeiro</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {role === 'BARBER' && (
                  <div className="space-y-2">
                    <Label>Vincular ao barbeiro</Label>
                    <Select value={barberId} onValueChange={setBarberId}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <Button className="w-full h-12" onClick={invite}>Enviar convite</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Membros</h2>
          <div className="space-y-2">
            {members.map(m => (
              <Card key={m.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{m.role}</p>
                    {m.barbers && <p className="text-sm text-muted-foreground">{m.barbers.name}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {invitations.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Convites pendentes</h2>
            <div className="space-y-2">
              {invitations.filter(i => !i.used_at).map(i => (
                <Card key={i.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1"><Mail className="h-3 w-3" />{i.email}</p>
                      <p className="text-xs text-muted-foreground">{i.role}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyInviteLink(i.token)}><Copy className="h-4 w-4" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AppUsers;
