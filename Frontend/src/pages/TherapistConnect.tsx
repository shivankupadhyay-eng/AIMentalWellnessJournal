import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft, UserCheck, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Therapist = {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
};

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

const TherapistConnect = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api<Therapist[]>("/users/therapists/")
      .then((data) => setTherapists(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching therapists:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleConnect = async (therapist: Therapist) => {
    setConnecting(therapist.id);
    try {
      await api(`/users/therapists/${therapist.id}/assign/`, { method: "POST" });
      setConnected(therapist.id);
      toast.success(`Connected with ${therapist.full_name}!`, {
        description: "Your therapist can now view your journal analytics.",
      });
    } catch (err: any) {
      toast.error("Could not connect", { description: err.message });
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10">
        <Link
          to="/dashboard"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-8">
          <p className="text-sm font-medium text-amber-800">
            🧠 Our AI detected that your recent sentiment scores are quite low. Talking to a professional can make a big difference.
          </p>
        </div>

        <h1 className="text-3xl font-bold text-foreground">Connect with a Therapist</h1>
        <p className="mt-2 text-muted-foreground">
          Select a therapist below. Once connected, they will be able to view your wellness analytics and guide you.
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading therapists...
        </div>
      ) : therapists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground">No therapists are available at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {therapists.map((t, i) => {
            const isConnected = connected === t.id;
            const isConnecting = connecting === t.id;
            const initials = `${t.first_name[0] ?? ""}${t.last_name[0] ?? ""}`.toUpperCase();
            const gradient = AVATAR_COLORS[i % AVATAR_COLORS.length];

            return (
              <div
                key={t.id}
                className={`flex flex-col gap-4 rounded-2xl border p-6 shadow-sm transition-all ${
                  isConnected ? "border-emerald-300 bg-emerald-50" : "border-border bg-card hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-lg font-bold text-white shadow`}>
                    {initials}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-base font-semibold text-foreground truncate">{t.full_name}</h3>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      {t.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleConnect(t)}
                  disabled={isConnecting || isConnected}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    isConnected
                      ? "bg-emerald-100 text-emerald-700 cursor-default"
                      : "gradient-calm text-primary-foreground hover:opacity-90 hover:shadow-md disabled:opacity-60"
                  }`}
                >
                  {isConnecting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</>
                  ) : isConnected ? (
                    <><CheckCircle2 className="h-4 w-4" /> Connected</>
                  ) : (
                    <><UserCheck className="h-4 w-4" /> Connect</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TherapistConnect;
