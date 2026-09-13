import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Bookmark,
  Plus,
  X,
  Camera,
  Heart,
  Trash2,
  Youtube,
  Edit3,
  Sparkles,
  Star,
} from "lucide-react";

// ---------- helpers ----------
const pad = (n) => (n < 10 ? "0" + n : "" + n);
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmtDate(d);
};
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const COLOR_PRESETS = ["#FF5D8F", "#A78BFA", "#4FD1C5", "#FFC857", "#FF8C42", "#5FA8D3", "#F76E9E", "#8BD17C"];

function isLight(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 165;
}

function hexToRgba(hex, alpha) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

let idCounter = 100;
const nextId = (prefix) => `${prefix}${idCounter++}`;

// ---------- seed data ----------
const SEED_OSHI = [
  { id: "o1", name: "ひなた", color: "#FF5D8F", photo: null, memo: "いつも元気をくれる推し。ダンスと歌声が魅力！" },
  { id: "o2", name: "つむぎ", color: "#4FD1C5", photo: null, memo: "まったり雑談配信が癒し。ゲーム実況も上手！" },
];

const SEED_VIDEOS = [
  { id: "v1", oshiId: "o1", date: fmtDate(new Date()), title: "【歌枠】水曜日の癒しタイム", watched: false, watchLater: true, note: "" },
  { id: "v2", oshiId: "o1", date: daysAgo(2), title: "新曲ダンス初披露！", watched: true, watchLater: false, note: "振り付け覚えたい、神回だった〜！" },
  { id: "v3", oshiId: "o2", date: daysAgo(1), title: "まったり雑談＆質問コーナー", watched: true, watchLater: false, note: "" },
  { id: "v4", oshiId: "o2", date: fmtDate(new Date()), title: "新作ゲーム実況 #1", watched: false, watchLater: false, note: "" },
];

// ---------- small UI atoms ----------
function IconBtn({ onClick, children, style, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

function PillToggle({ active, onClick, color, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
      style={
        active
          ? { backgroundColor: color, color: isLight(color) ? "#3A3042" : "#fff", boxShadow: `0 3px 0 ${hexToRgba(color, 0.35)}` }
          : { backgroundColor: "#F2ECF5", color: "#9088A0" }
      }
    >
      {icon}
      {label}
    </button>
  );
}

// ---------- Add/Edit Oshi Modal ----------
function OshiFormModal({ initial, onClose, onSave, onDelete, onAddVideo, onImportDemo }) {
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || COLOR_PRESETS[0]);
  const [memo, setMemo] = useState(initial?.memo || "");
  const [photo, setPhoto] = useState(initial?.photo || null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="app-font-display text-lg font-semibold" style={{ color: "#3A3042" }}>
            {initial ? "推しを編集" : "推しを登録"}
          </h3>
          <IconBtn onClick={onClose} style={{ backgroundColor: "#F2ECF5" }}>
            <X size={18} color="#9088A0" />
          </IconBtn>
        </div>

        <div className="flex justify-center mb-4">
          <label className="relative cursor-pointer group">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4"
              style={{ borderColor: color, backgroundColor: hexToRgba(color, 0.15) }}
            >
              {photo ? (
                <img src={photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera size={28} color={color} />
              )}
            </div>
            <div
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: color }}
            >
              <Edit3 size={14} color="#fff" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        </div>

        <label className="text-xs font-medium" style={{ color: "#9088A0" }}>
          お名前
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：ひなた"
          className="w-full mt-1 mb-4 px-4 py-2.5 rounded-2xl outline-none text-sm"
          style={{ backgroundColor: "#F7F3FB", color: "#3A3042" }}
        />

        <label className="text-xs font-medium" style={{ color: "#9088A0" }}>
          テーマカラー
        </label>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: color === c ? `3px solid ${c}` : "none",
                outlineOffset: "2px",
                border: color === c ? "2px solid white" : "2px solid transparent",
              }}
            />
          ))}
          <label className="w-8 h-8 rounded-full cursor-pointer relative overflow-hidden border-2 border-dashed flex items-center justify-center" style={{ borderColor: "#D8CEE0" }}>
            <span className="text-xs" style={{ color: "#9088A0" }}>+</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
        </div>

        <label className="text-xs font-medium" style={{ color: "#9088A0" }}>
          紹介メモ
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="推しの魅力を書こう！"
          rows={3}
          className="w-full mt-1 mb-5 px-4 py-2.5 rounded-2xl outline-none text-sm resize-none"
          style={{ backgroundColor: "#F7F3FB", color: "#3A3042" }}
        />

        {initial && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => onAddVideo(initial.id)}
              className="flex-1 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ backgroundColor: hexToRgba(color, 0.18), color }}
            >
              <Plus size={13} /> 配信を追加
            </button>
            <button
              onClick={() => onImportDemo(initial.id)}
              className="flex-1 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ backgroundColor: "#F2ECF5", color: "#9088A0" }}
            >
              <Youtube size={13} /> 取り込む(デモ)
            </button>
          </div>
        )}

        <div className="flex gap-2">
          {initial && (
            <button
              onClick={() => onDelete(initial.id)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#FFEAEA" }}
            >
              <Trash2 size={18} color="#E56B6F" />
            </button>
          )}
          <button
            onClick={() => name.trim() && onSave({ id: initial?.id || nextId("o"), name: name.trim(), color, memo, photo })}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm disabled:opacity-40 app-font-display"
            style={{ backgroundColor: color, color: isLight(color) ? "#3A3042" : "#fff" }}
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Add Video Modal ----------
function VideoFormModal({ oshiList, defaultOshiId, defaultDate, lockOshi, onClose, onSave }) {
  const [oshiId, setOshiId] = useState(defaultOshiId || oshiList[0]?.id);
  const [date, setDate] = useState(defaultDate || fmtDate(new Date()));
  const [title, setTitle] = useState("");
  const oshi = oshiList.find((o) => o.id === oshiId);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="app-font-display text-lg font-semibold" style={{ color: "#3A3042" }}>
            配信を追加
          </h3>
          <IconBtn onClick={onClose} style={{ backgroundColor: "#F2ECF5" }}>
            <X size={18} color="#9088A0" />
          </IconBtn>
        </div>

        <label className="text-xs font-medium" style={{ color: "#9088A0" }}>
          推し
        </label>
        {lockOshi && oshi ? (
          <div
            className="inline-flex items-center gap-1.5 mt-1 mb-4 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ backgroundColor: oshi.color, color: isLight(oshi.color) ? "#3A3042" : "#fff" }}
          >
            <Star size={12} fill="currentColor" /> {oshi.name}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-1 mb-4">
            {oshiList.map((o) => (
              <button
                key={o.id}
                onClick={() => setOshiId(o.id)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={
                  oshiId === o.id
                    ? { backgroundColor: o.color, color: isLight(o.color) ? "#3A3042" : "#fff" }
                    : { backgroundColor: "#F2ECF5", color: "#9088A0" }
                }
              >
                {o.name}
              </button>
            ))}
          </div>
        )}

        <label className="text-xs font-medium" style={{ color: "#9088A0" }}>
          日付
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full mt-1 mb-4 px-4 py-2.5 rounded-2xl outline-none text-sm"
          style={{ backgroundColor: "#F7F3FB", color: "#3A3042" }}
        />

        <label className="text-xs font-medium" style={{ color: "#9088A0" }}>
          タイトル
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：【雑談】土曜の夜のおしゃべり"
          className="w-full mt-1 mb-5 px-4 py-2.5 rounded-2xl outline-none text-sm"
          style={{ backgroundColor: "#F7F3FB", color: "#3A3042" }}
        />

        <button
          onClick={() =>
            title.trim() &&
            onSave({ id: nextId("v"), oshiId, date, title: title.trim(), watched: false, watchLater: false, note: "" })
          }
          disabled={!title.trim()}
          className="w-full py-3 rounded-2xl font-semibold text-sm disabled:opacity-40 app-font-display"
          style={{ backgroundColor: oshi?.color || "#FF5D8F", color: isLight(oshi?.color || "#FF5D8F") ? "#3A3042" : "#fff" }}
        >
          追加する
        </button>
      </div>
    </div>
  );
}

// ---------- Day Detail Modal ----------
function DayModal({ dateStr, videos, oshiById, onClose, onUpdateVideo, onDeleteVideo, onAddVideo }) {
  const d = new Date(dateStr + "T00:00:00");
  const label = `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="app-font-display text-lg font-semibold" style={{ color: "#3A3042" }}>
            {label}
          </h3>
          <IconBtn onClick={onClose} style={{ backgroundColor: "#F2ECF5" }}>
            <X size={18} color="#9088A0" />
          </IconBtn>
        </div>

        {videos.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: "#B3A8BE" }}>
            この日の配信はまだ登録されていません
          </p>
        )}

        <div className="space-y-4">
          {videos.map((v) => {
            const oshi = oshiById[v.oshiId];
            return (
              <div key={v.id} className="rounded-2xl p-4" style={{ backgroundColor: hexToRgba(oshi?.color || "#ccc", 0.1) }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: oshi?.color }} />
                    <span className="text-xs font-semibold" style={{ color: oshi?.color }}>
                      {oshi?.name}
                    </span>
                  </div>
                  <button onClick={() => onDeleteVideo(v.id)}>
                    <Trash2 size={15} color="#C9BFD1" />
                  </button>
                </div>
                <p className="text-sm font-medium mb-3" style={{ color: "#3A3042" }}>
                  {v.title}
                </p>
                <div className="flex gap-2 mb-3">
                  <PillToggle
                    active={v.watched}
                    onClick={() => onUpdateVideo(v.id, { watched: !v.watched, watchLater: v.watched ? v.watchLater : false })}
                    color={oshi?.color}
                    icon={<Check size={14} />}
                    label="見た"
                  />
                  <PillToggle
                    active={v.watchLater}
                    onClick={() => onUpdateVideo(v.id, { watchLater: !v.watchLater, watched: v.watchLater ? v.watched : false })}
                    color={oshi?.color}
                    icon={<Clock size={14} />}
                    label="後で見る"
                  />
                </div>
                <textarea
                  value={v.note}
                  onChange={(e) => onUpdateVideo(v.id, { note: e.target.value })}
                  placeholder="感想を書く..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl outline-none text-xs resize-none"
                  style={{ backgroundColor: "#fff", color: "#3A3042" }}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onAddVideo(dateStr)}
          className="w-full mt-4 py-2.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-1.5"
          style={{ backgroundColor: "#F2ECF5", color: "#9088A0" }}
        >
          <Plus size={15} /> この日に配信を追加
        </button>
      </div>
    </div>
  );
}

// ---------- Calendar View ----------
function CalendarView({ videos, oshiById, month, setMonth, onDayClick, accentColor = "#FF5D8F" }) {
  const year = month.getFullYear();
  const mo = month.getMonth();
  const firstDay = new Date(year, mo, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const videosByDate = useMemo(() => {
    const map = {};
    videos.forEach((v) => {
      if (!map[v.date]) map[v.date] = [];
      map[v.date].push(v);
    });
    return map;
  }, [videos]);

  const todayStr = fmtDate(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <IconBtn onClick={() => setMonth(new Date(year, mo - 1, 1))} style={{ backgroundColor: "#F2ECF5" }}>
          <ChevronLeft size={18} color="#9088A0" />
        </IconBtn>
        <h2 className="app-font-display text-xl font-semibold" style={{ color: "#3A3042" }}>
          {year}年 {mo + 1}月
        </h2>
        <IconBtn onClick={() => setMonth(new Date(year, mo + 1, 1))} style={{ backgroundColor: "#F2ECF5" }}>
          <ChevronRight size={18} color="#9088A0" />
        </IconBtn>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className="text-center text-xs font-semibold py-1"
            style={{ color: i === 0 ? "#FF9EB8" : i === 6 ? "#8BB8E8" : "#B3A8BE" }}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const dateStr = `${year}-${pad(mo + 1)}-${pad(day)}`;
          const dayVideos = videosByDate[dateStr] || [];
          const hasWatchLater = dayVideos.some((v) => v.watchLater);
          const isToday = dateStr === todayStr;

          return (
            <button
              key={idx}
              onClick={() => onDayClick(dateStr)}
              className="relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: isToday ? "#FFF1D9" : dayVideos.length ? "#FBF7FD" : "transparent",
                border: isToday ? "2px solid #FFC857" : dayVideos.length ? "1px solid #EFE6F5" : "1px solid transparent",
              }}
            >
              {hasWatchLater && (
                <Bookmark size={12} className="absolute top-1 right-1" color="#FFC857" fill="#FFC857" />
              )}
              <span className="text-sm font-medium" style={{ color: isToday ? "#E8A317" : "#3A3042" }}>
                {day}
              </span>
              <div className="flex gap-0.5">
                {dayVideos.slice(0, 3).map((v) => (
                  <Star
                    key={v.id}
                    size={9}
                    color={oshiById[v.oshiId]?.color}
                    fill={v.watched ? oshiById[v.oshiId]?.color : "none"}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-5 text-xs" style={{ color: "#9088A0" }}>
        <span className="flex items-center gap-1.5">
          <Star size={13} color={accentColor} fill={accentColor} /> 見た
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={13} color={accentColor} fill="none" /> 未視聴
        </span>
        <span className="flex items-center gap-1.5">
          <Bookmark size={12} color="#FFC857" fill="#FFC857" /> 後で見る
        </span>
      </div>
    </div>
  );
}

// ---------- Oshi Banner (shown above the calendar when an oshi is selected) ----------
function OshiBanner({ oshi, onNameClick }) {
  return (
    <div
      className="rounded-3xl p-5 mb-4 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${oshi.color}, ${hexToRgba(oshi.color, 0.6)})` }}
    >
      <div className="absolute -right-6 -top-6 opacity-20">
        <Heart size={100} color="#fff" fill="#fff" />
      </div>
      <div className="relative flex items-center gap-3.5">
        <div
          className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-4 border-white/70 shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
        >
          {oshi.photo ? (
            <img src={oshi.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <Star size={26} color="#fff" fill="#fff" />
          )}
        </div>
        <div className="min-w-0">
          <button onClick={onNameClick} className="flex items-center gap-1.5 group">
            <h2
              className="app-font-display text-xl font-bold truncate"
              style={{ color: isLight(oshi.color) ? "#3A3042" : "#fff" }}
            >
              {oshi.name}
            </h2>
            <Edit3 size={13} className="opacity-70 shrink-0" color={isLight(oshi.color) ? "#3A3042" : "#fff"} />
          </button>
          <p
            className="text-xs mt-1 line-clamp-2"
            style={{ color: isLight(oshi.color) ? "#3A3042" : "rgba(255,255,255,0.9)" }}
          >
            {oshi.memo || "紹介メモが未設定です"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Main App ----------
export default function OshiCalendarApp() {
  const [oshiList, setOshiList] = useState(SEED_OSHI);
  const [videos, setVideos] = useState(SEED_VIDEOS);
  const [selectedOshiId, setSelectedOshiId] = useState(null); // null = すべて表示
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [showOshiForm, setShowOshiForm] = useState(false);
  const [editingOshi, setEditingOshi] = useState(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoFormDefaults, setVideoFormDefaults] = useState({});

  const oshiById = useMemo(() => Object.fromEntries(oshiList.map((o) => [o.id, o])), [oshiList]);
  const selectedOshi = selectedOshiId ? oshiById[selectedOshiId] : null;

  const handleSelectChange = (value) => {
    if (value === "__new__") {
      setEditingOshi(null);
      setShowOshiForm(true);
    } else {
      setSelectedOshiId(value || null);
    }
  };

  const saveOshi = (oshi) => {
    setOshiList((prev) => {
      const exists = prev.some((o) => o.id === oshi.id);
      return exists ? prev.map((o) => (o.id === oshi.id ? oshi : o)) : [...prev, oshi];
    });
    setShowOshiForm(false);
    setSelectedOshiId(oshi.id);
  };

  const deleteOshi = (id) => {
    setOshiList((prev) => prev.filter((o) => o.id !== id));
    setVideos((prev) => prev.filter((v) => v.oshiId !== id));
    setShowOshiForm(false);
    setSelectedOshiId(null);
  };

  const addVideo = (video) => {
    setVideos((prev) => [...prev, video]);
    setShowVideoForm(false);
  };

  const updateVideo = (id, patch) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const deleteVideo = (id) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const importDemo = (oshiId) => {
    const oshi = oshiById[oshiId];
    const sample = [
      { id: nextId("v"), oshiId, date: daysAgo(4), title: `【${oshi.name}】YouTube取込デモ配信A`, watched: false, watchLater: false, note: "" },
      { id: nextId("v"), oshiId, date: daysAgo(6), title: `【${oshi.name}】YouTube取込デモ配信B`, watched: false, watchLater: true, note: "" },
    ];
    setVideos((prev) => [...prev, ...sample]);
    setShowOshiForm(false);
  };

  const openAddVideo = (oshiId) => {
    setVideoFormDefaults({ oshiId, date: fmtDate(new Date()), lock: !!oshiId });
    setShowOshiForm(false);
    setShowVideoForm(true);
  };

  const displayedVideos = selectedOshiId ? videos.filter((v) => v.oshiId === selectedOshiId) : videos;
  const dayVideos = selectedDate ? displayedVideos.filter((v) => v.date === selectedDate) : [];

  const pageBg = selectedOshi
    ? `linear-gradient(180deg, ${hexToRgba(selectedOshi.color, 0.32)} 0%, #FFF9F5 60%)`
    : "linear-gradient(180deg, #FFF6EF 0%, #FDF0F5 100%)";

  return (
    <div className="w-full flex justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hachi+Maru+Pop&family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap');
        .app-font-display { font-family: 'Hachi Maru Pop', 'M PLUS Rounded 1c', sans-serif; }
        .app-font-body { font-family: 'M PLUS Rounded 1c', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className="w-full max-w-md app-font-body rounded-3xl overflow-hidden"
        style={{ height: "700px", background: pageBg, transition: "background 0.4s ease" }}
      >
        <div className="h-full overflow-y-auto no-scrollbar">
          {/* 固定ヘッダー */}
          <div
            className="sticky top-0 z-30 px-4 pt-4 pb-3"
            style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#FF5D8F,#A78BFA)" }}
              >
                <Sparkles size={18} color="#fff" />
              </div>
              <h1 className="app-font-display text-lg font-bold" style={{ color: "#3A3042" }}>
                オシカレ
              </h1>
            </div>

            <div className="relative">
              <select
                value={selectedOshiId || ""}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl text-sm font-semibold outline-none appearance-none cursor-pointer app-font-display"
                style={{
                  backgroundColor: selectedOshi ? selectedOshi.color : "#fff",
                  color: selectedOshi ? (isLight(selectedOshi.color) ? "#3A3042" : "#fff") : "#9088A0",
                  border: selectedOshi ? "none" : "1px solid #EFE6F5",
                }}
              >
                <option value="">すべて(全員)のカレンダー ▾</option>
                {oshiList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
                <option value="__new__">＋ 推しを追加</option>
              </select>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="px-4 pb-6">
            {selectedOshi && (
              <OshiBanner
                oshi={selectedOshi}
                onNameClick={() => {
                  setEditingOshi(selectedOshi);
                  setShowOshiForm(true);
                }}
              />
            )}

            <div className="bg-white/70 rounded-3xl p-4 shadow-sm" style={{ backdropFilter: "blur(2px)" }}>
              <CalendarView
                videos={displayedVideos}
                oshiById={oshiById}
                month={month}
                setMonth={setMonth}
                onDayClick={(d) => setSelectedDate(d)}
                accentColor={selectedOshi?.color || "#FF5D8F"}
              />
            </div>

            {oshiList.length === 0 && (
              <p className="text-center text-xs mt-4" style={{ color: "#B3A8BE" }}>
                上のプルダウンから「＋ 推しを追加」で登録してみよう！
              </p>
            )}
          </div>
        </div>
      </div>

      {selectedDate && (
        <DayModal
          dateStr={selectedDate}
          videos={dayVideos}
          oshiById={oshiById}
          onClose={() => setSelectedDate(null)}
          onUpdateVideo={updateVideo}
          onDeleteVideo={deleteVideo}
          onAddVideo={(d) => {
            setVideoFormDefaults({ oshiId: selectedOshiId || undefined, date: d, lock: !!selectedOshiId });
            setShowVideoForm(true);
          }}
        />
      )}

      {showOshiForm && (
        <OshiFormModal
          initial={editingOshi}
          onClose={() => setShowOshiForm(false)}
          onSave={saveOshi}
          onDelete={deleteOshi}
          onAddVideo={openAddVideo}
          onImportDemo={importDemo}
        />
      )}

      {showVideoForm && (
        <VideoFormModal
          oshiList={oshiList}
          defaultOshiId={videoFormDefaults.oshiId}
          defaultDate={videoFormDefaults.date}
          lockOshi={videoFormDefaults.lock}
          onClose={() => setShowVideoForm(false)}
          onSave={addVideo}
        />
      )}
    </div>
  );
}
