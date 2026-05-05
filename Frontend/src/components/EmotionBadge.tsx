const emotionEmojis: Record<string, string> = {
  Happy: "😊",
  Joy: "🥳",
  Sad: "😢",
  Anxiety: "😰",
  Fear: "😨",
  Anger: "😠",
  Neutral: "😐",
  Grateful: "🙏",
  Frustrated: "😤",
  Hopeful: "🤗",
  Clarity: "✨",
  Despair: "🌑",
  Surprise: "😮",
  Excited: "🤩",
  Peaceful: "🧘",
  Accomplishment: "🏆",
  Fatigue: "😫",
  Relief: "😌",
  Elation: "🎆",
};

const emotionColorMap: Record<string, string> = {
  green: "bg-green-100 text-green-700 border-green-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  red: "bg-red-100 text-red-700 border-red-200",
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  slate: "bg-slate-200 text-slate-800 border-slate-300",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  gold: "bg-yellow-200 text-yellow-800 border-yellow-300",
  brown: "bg-amber-900/10 text-amber-900 border-amber-900/20",
  sky: "bg-sky-100 text-sky-700 border-sky-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
};

// Fallback colors when backend doesn't provide them
const emotionFallbackColor: Record<string, string> = {
  Happy: emotionColorMap.green,
  Joy: emotionColorMap.yellow,
  Sad: emotionColorMap.blue,
  Anxiety: emotionColorMap.orange,
  Fear: emotionColorMap.purple,
  Anger: emotionColorMap.red,
  Neutral: emotionColorMap.gray,
  Grateful: emotionColorMap.teal,
  Frustrated: emotionColorMap.rose,
  Hopeful: emotionColorMap.indigo,
  Clarity: emotionColorMap.cyan,
  Despair: emotionColorMap.slate,
  Surprise: emotionColorMap.pink,
  Excited: emotionColorMap.amber,
  Peaceful: emotionColorMap.emerald,
};

type EmotionBadgeProps = {
  emotion: string;
  emoji?: string;
  color?: string; // color key from backend e.g. "green", "blue"
};

const EmotionBadge = ({ emotion, emoji, color }: EmotionBadgeProps) => {
  const resolvedEmoji = emoji || emotionEmojis[emotion] || "✨";
  const resolvedClass = (color ? emotionColorMap[color] : null)
    || emotionFallbackColor[emotion]
    || "bg-muted text-muted-foreground border-border";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all hover:shadow-sm ${resolvedClass}`}>
      <span className="text-sm">{resolvedEmoji}</span>
      {emotion}
    </span>
  );
};

export default EmotionBadge;
