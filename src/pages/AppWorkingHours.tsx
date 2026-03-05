import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const AppWorkingHours = () => {
  const { membership } = useAuth();
  const [barbers, setBarbers] = useState<any[]>([]);
  const [hours, setHours] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  const shopId = membership?.shop_id;
  const isOwnerAdmin = membership?.role === 'OWNER' || membership?.role === 'ADMIN';

  const load = async () => {
    if (!shopId) return;
    let bQuery = supabase.from('barbers').select('*').eq('shop_id', shopId).order('sort_order');
    if (!isOwnerAdmin && membership?.barber_id) bQuery = bQuery.eq('id', membership.barber_id);
    const { data: bData } = await bQuery;
    setBarbers(bData || []);

    const { data: whData } = await supabase.from('working_hours').select('*').eq('shop_id', shopId);
    const grouped: Record<string, any[]> = {};
    (bData || []).forEach((b: any) => {
      grouped[b.id] = WEEKDAYS.map((_, weekday) => {
        const existing = (whData || []).find((w: any) => w.barber_id === b.id && w.weekday === weekday);
        return existing || { weekday, start_time: '09:00', end_time: '18:00', break_start_time: null, break_end_time: null, is_enabled: false };
      });
    });
    setHours(grouped);
    setLoading(false);
  };

  useEffect(() => { load(); }, [shopId]);

  const save = async (barberId: string) => {
    // Delete old and insert new
    await supabase.from('working_hours').delete().eq('shop_id', shopId).eq('barber_id', barberId);
    const rows = hours[barberId].filter(h => h.is_enabled).map(h => ({
      shop_id: shopId,
      barber_id: barberId,
      weekday: h.weekday,
      start_time: h.start_time,
      end_time: h.end_time,
      break_start_time: h.break_start_time || null,
      break_end_time: h.break_end_time || null,
      is_enabled: true,
    }));
    if (rows.length > 0) await supabase.from('working_hours').insert(rows);
    toast.success('Horários salvos!');
  };

  if (loading) return <AppLayout><div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">Horários de trabalho</h1>
        {barbers.map(barber => (
          <Card key={barber.id}>
            <CardHeader><CardTitle className="text-lg">{barber.name}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {WEEKDAYS.map((day, weekday) => {
                const wh = hours[barber.id]?.[weekday];
                if (!wh) return null;
                return (
                  <div key={weekday} className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        const u = { ...hours };
                        u[barber.id][weekday] = { ...wh, is_enabled: !wh.is_enabled };
                        setHours({ ...u });
                      }}
                      className={`w-10 h-6 rounded-full transition-colors ${wh.is_enabled ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${wh.is_enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="w-12 text-sm">{day.slice(0, 3)}</span>
                    {wh.is_enabled && (
                      <>
                        <Input type="time" value={wh.start_time} onChange={e => { const u = { ...hours }; u[barber.id][weekday].start_time = e.target.value; setHours({ ...u }); }} className="w-24 h-8 text-xs" />
                        <span className="text-xs">às</span>
                        <Input type="time" value={wh.end_time} onChange={e => { const u = { ...hours }; u[barber.id][weekday].end_time = e.target.value; setHours({ ...u }); }} className="w-24 h-8 text-xs" />
                      </>
                    )}
                  </div>
                );
              })}
              <Button onClick={() => save(barber.id)} className="w-full mt-4"><Save className="mr-2 h-4 w-4" />Salvar horários</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
};

export default AppWorkingHours;
