import { useEffect, useState } from 'react';
import { Users, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocalDB } from '@/services/LocalDatabase';

type WaitlistEntry = {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
};

const AdminWaitlist = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);

  useEffect(() => {
    const fetch = () => {
      const data = LocalDB.getWaitlist();
      setEntries(data);
    };
    fetch();
  }, []);

  const exportCSV = () => {
    const csv = ['Email,Source,Date', ...entries.map(e =>
      `${e.email},${e.source ?? ''},${new Date(e.created_at).toLocaleDateString()}`
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'waitlist.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Waitlist</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">{entries.length} email{entries.length !== 1 ? 's' : ''} collected</p>
        </div>
        {entries.length > 0 && (
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-body text-sm text-muted-foreground">No waitlist entries yet.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-body text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Email</th>
                <th className="text-left font-body text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Source</th>
                <th className="text-left font-body text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-cream/50">
                  <td className="px-6 py-3 font-body text-sm text-foreground flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    {e.email}
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-muted-foreground">{e.source ?? '-'}</td>
                  <td className="px-6 py-3 font-body text-sm text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString()}
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

export default AdminWaitlist;
