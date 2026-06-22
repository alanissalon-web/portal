import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Search, Trash2, CheckCircle, Clock4, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await LocalDB.getBookings();
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      await LocalDB.saveBooking({ ...booking, status });
      toast({ title: 'Estado actualizado', description: `La reserva ahora está ${status}.` });
      await fetchBookings();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta reserva definitivamente?')) {
      await LocalDB.deleteBooking(id);
      toast({ title: 'Reserva eliminada' });
      await fetchBookings();
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Gestión de Reservas</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Controla las citas y horarios de tus clientes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-xl bg-white shadow-sm border-black/5">
            <Calendar className="w-4 h-4" /> Ver Calendario
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o servicio..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm outline-none focus:ring-1 focus:ring-accent shadow-sm"
          />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl border-black/5 bg-white shadow-sm">
          <Filter className="w-4 h-4" /> Hoy
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
          <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="font-body text-sm text-muted-foreground">No hay reservas registradas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-black/5">
                <th className="px-6 py-4 font-body text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 font-body text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Servicio</th>
                <th className="px-6 py-4 font-body text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fecha & Hora</th>
                <th className="px-6 py-4 font-body text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 font-body text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#FDFCFB] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-bold text-xs">
                        {booking.clientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{booking.clientName}</p>
                        <p className="text-[10px] text-muted-foreground">{booking.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body text-xs text-foreground/80">{booking.service}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-body text-xs text-foreground flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" /> {booking.date}
                      </span>
                      <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" /> {booking.time}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> : <Clock4 className="w-3 h-3" />}
                      {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {booking.status === 'pending' && (
                        <Button 
                          onClick={() => handleStatusChange(booking.id, 'confirmed')}
                          variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleDelete(booking.id)}
                        variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
