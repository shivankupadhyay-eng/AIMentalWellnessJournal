import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Calendar, Trash2 } from "lucide-react";
import EmotionBadge from "@/components/EmotionBadge";
import { calculateSentimentPercentage } from "@/lib/utils";
import RiskBadge from "@/components/RiskBadge";
import SkeletonCard from "@/components/SkeletonCard";
import { toast } from "sonner";

type Analysis = {
  sentiment_score: number;
  primary_emotion: string;
  risk_level: string;
  reflection: string;
  coping_suggestion: string;
  created_at: string;
  emoji?: string;
  color?: string;
};

type Entry = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: string;
  analysis: Analysis | null;
};

const JournalList = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api<Entry[]>("/blogs/list/")
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching entries:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api(`/blogs/delete/${id}/`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error("Failed to delete entry", {
        description: err.message || "Please try again.",
      });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const normalizeRisk = (risk: string | undefined): "LOW" | "MEDIUM" | "HIGH" => {
    const upper = (risk || "LOW").toUpperCase();
    if (upper === "HIGH") return "HIGH";
    if (upper === "MEDIUM") return "MEDIUM";
    return "LOW";
  };

  const capitalizeEmotion = (emotion: string | undefined): string => {
    if (!emotion) return "Neutral";
    return emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.content?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/dashboard"
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Journal History</h1>
          <p className="text-muted-foreground mt-1">All your past reflections and analyses</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30 group sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Clickable area for navigation */}
              <Link
                to={`/journal/${entry.id}`}
                className="flex flex-1 flex-col gap-1 overflow-hidden"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(entry.created_at).toLocaleDateString()}
                  </div>
                  {entry.analysis && (
                    <EmotionBadge
                      emotion={capitalizeEmotion(entry.analysis.primary_emotion)}
                      emoji={entry.analysis.emoji}
                      color={entry.analysis.color}
                    />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {entry.title || "Untitled Entry"}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {entry.content}
                </p>
              </Link>

              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                {entry.analysis ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {calculateSentimentPercentage(entry.analysis.sentiment_score)}%
                    </span>
                    <RiskBadge level={normalizeRisk(entry.analysis.risk_level)} />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Analyzing...</span>
                )}

                {/* Delete button / confirm */}
                {confirmDeleteId === entry.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Sure?</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {deletingId === entry.id ? "Deleting..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(entry.id)}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-200 transition-all"
                    title="Delete entry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No entries found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalList;
