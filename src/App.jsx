import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Trash2,
  Play,
  Clock,
  Trophy,
  Medal,
  ArrowLeft,
  Check,
  X,
  ChevronRight,
  Users,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  loadQuizzes,
  saveQuizzes,
  loadLeaderboard,
  saveLeaderboard,
  loadGlobalLeaderboard,
  saveGlobalLeaderboard,
} from "./lib/storage.js";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
`;

const RANK_COLORS = {
  1: { bg: "#F2B705", text: "#3D2E00", glow: "rgba(242,183,5,0.35)" },
  2: { bg: "#C9D2DE", text: "#20242C", glow: "rgba(201,210,222,0.25)" },
  3: { bg: "#CD7F4D", text: "#2E1A0C", glow: "rgba(205,127,77,0.3)" },
};

const uid = () => Math.random().toString(36).slice(2, 10);

function blankQuestion() {
  return {
    id: uid(),
    text: "",
    type: "multiple_choice", // multiple_choice | true_false
    options: ["", "", "", ""],
    correctIndex: 0,
    points: 100,
    timeLimit: 20,
  };
}

function blankQuiz() {
  return {
    id: uid(),
    title: "",
    description: "",
    questions: [blankQuestion()],
    createdAt: Date.now(),
  };
}

// ---------- Small UI atoms ----------
function Button({ children, onClick, variant = "secondary", style, disabled, type = "button" }) {
  const base = {
    fontFamily: "Inter, sans-serif",
    fontWeight: 600,
    fontSize: 14,
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "transform 0.1s ease, background 0.15s ease",
  };
  const variants = {
    primary: { background: "#7C5CFF", color: "#fff" },
    ghost: { background: "transparent", color: "#C7CCE0", border: "1px solid #2A3357" },
    danger: { background: "rgba(226,75,74,0.12)", color: "#F09595" },
    gold: { background: "#F2B705", color: "#3D2E00" },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#1A2138",
        border: "1px solid #262E4E",
        borderRadius: 14,
        padding: "1.25rem 1.5rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        background: "#101526",
        border: "1px solid #2A3357",
        borderRadius: 8,
        padding: "10px 12px",
        color: "#EDEFF7",
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        outline: "none",
        ...props.style,
      }}
    />
  );
}

function ScoreDigits({ value }) {
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value.toLocaleString()}
    </span>
  );
}

function RankBadge({ rank }) {
  const c = RANK_COLORS[rank];
  if (!c) {
    return (
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#232B4A",
          color: "#8B93AE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {rank}
      </div>
    );
  }
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: c.bg,
        color: c.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13,
        fontWeight: 700,
        boxShadow: `0 0 0 4px ${c.glow}`,
        flexShrink: 0,
      }}
    >
      {rank}
    </div>
  );
}

// ---------- Top nav ----------
function NavBar({ view, setView }) {
  const tabs = [
    { id: "home", label: "Play" },
    { id: "create", label: "Create" },
    { id: "leaderboard", label: "Leaderboard" },
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 0 1.5rem",
        borderBottom: "1px solid #232B4A",
        marginBottom: "1.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "#7C5CFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: "#EDEFF7" }}>
          Buzzer
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            style={{
              background: view === t.id ? "#232B4A" : "transparent",
              color: view === t.id ? "#EDEFF7" : "#8B93AE",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Home / quiz library ----------
function HomeView({ quizzes, loading, onPlay, onDelete }) {
  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 34,
            color: "#EDEFF7",
            margin: "0 0 8px",
            letterSpacing: "-0.5px",
          }}
        >
          Step up to the buzzer.
        </h1>
        <p style={{ color: "#8B93AE", fontFamily: "Inter, sans-serif", fontSize: 15, margin: 0 }}>
          Pick a quiz, race the clock, and climb the leaderboard.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#8B93AE", fontFamily: "Inter, sans-serif" }}>
          <Loader2 size={16} className="spin" /> Loading quizzes…
        </div>
      ) : quizzes.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <p style={{ color: "#EDEFF7", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16, margin: "0 0 6px" }}>
            No quizzes yet
          </p>
          <p style={{ color: "#8B93AE", fontFamily: "Inter, sans-serif", fontSize: 14, margin: 0 }}>
            Create the first one from the Create tab.
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {quizzes.map((q) => (
            <Card key={q.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#EDEFF7",
                    margin: "0 0 4px",
                  }}
                >
                  {q.title || "Untitled quiz"}
                </h3>
                <p style={{ color: "#8B93AE", fontFamily: "Inter, sans-serif", fontSize: 13, margin: 0, minHeight: 18 }}>
                  {q.description}
                </p>
              </div>
              <div style={{ display: "flex", gap: 14, color: "#8B93AE", fontSize: 12, fontFamily: "Inter, sans-serif" }}>
                <span>{q.questions.length} questions</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> {q.questions.reduce((a, b) => a + Number(b.timeLimit || 0), 0)}s
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="primary" onClick={() => onPlay(q)} style={{ flex: 1, justifyContent: "center" }}>
                  <Play size={14} /> Play
                </Button>
                <Button variant="danger" onClick={() => onDelete(q.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Quiz creation ----------
function CreateView({ onSave }) {
  const [quiz, setQuiz] = useState(blankQuiz());
  const [saving, setSaving] = useState(false);

  const updateQuestion = (qid, patch) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
    }));
  };
  const updateOption = (qid, idx, value) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qid ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) } : q
      ),
    }));
  };
  const addQuestion = () => setQuiz((prev) => ({ ...prev, questions: [...prev.questions, blankQuestion()] }));
  const removeQuestion = (qid) =>
    setQuiz((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== qid) }));

  const canSave =
    quiz.title.trim().length > 0 &&
    quiz.questions.length > 0 &&
    quiz.questions.every((q) => q.text.trim().length > 0);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave(quiz);
    setQuiz(blankQuiz());
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ color: "#8B93AE", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
            QUIZ TITLE
          </label>
          <Input
            placeholder="e.g. World Capitals Sprint"
            value={quiz.title}
            onChange={(e) => setQuiz((p) => ({ ...p, title: e.target.value }))}
          />
          <label style={{ color: "#8B93AE", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600, marginTop: 6 }}>
            DESCRIPTION (OPTIONAL)
          </label>
          <Input
            placeholder="A short line about what this quiz covers"
            value={quiz.description}
            onChange={(e) => setQuiz((p) => ({ ...p, description: e.target.value }))}
          />
        </div>
      </Card>

      {quiz.questions.map((q, idx) => (
        <Card key={q.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#7C5CFF",
              }}
            >
              Question {idx + 1}
            </span>
            {quiz.questions.length > 1 && (
              <Button variant="danger" onClick={() => removeQuestion(q.id)} style={{ padding: "6px 10px" }}>
                <Trash2 size={13} />
              </Button>
            )}
          </div>

          <Input
            placeholder="Type the question"
            value={q.text}
            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
            style={{ marginBottom: 12 }}
          />

          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <select
              value={q.type}
              onChange={(e) => {
                const type = e.target.value;
                updateQuestion(q.id, {
                  type,
                  options: type === "true_false" ? ["True", "False"] : ["", "", "", ""],
                  correctIndex: 0,
                });
              }}
              style={{
                background: "#101526",
                border: "1px solid #2A3357",
                borderRadius: 8,
                padding: "10px 12px",
                color: "#EDEFF7",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
              }}
            >
              <option value="multiple_choice">Multiple choice</option>
              <option value="true_false">True / False</option>
            </select>
            <Input
              type="number"
              min={10}
              max={500}
              value={q.points}
              onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
              style={{ width: 90 }}
              title="Points"
            />
            <Input
              type="number"
              min={5}
              max={120}
              value={q.timeLimit}
              onChange={(e) => updateQuestion(q.id, { timeLimit: Number(e.target.value) })}
              style={{ width: 90 }}
              title="Seconds"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {q.options.map((opt, i) => (
              <div
                key={i}
                onClick={() => updateQuestion(q.id, { correctIndex: i })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: `1.5px solid ${q.correctIndex === i ? "#7C5CFF" : "#2A3357"}`,
                  borderRadius: 8,
                  padding: "4px 4px 4px 10px",
                  cursor: "pointer",
                  background: q.correctIndex === i ? "rgba(124,92,255,0.08)" : "transparent",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: `2px solid ${q.correctIndex === i ? "#7C5CFF" : "#4A5378"}`,
                    background: q.correctIndex === i ? "#7C5CFF" : "transparent",
                    flexShrink: 0,
                  }}
                />
                {q.type === "true_false" ? (
                  <span style={{ color: "#EDEFF7", fontFamily: "Inter, sans-serif", fontSize: 13, padding: "8px 0" }}>
                    {opt}
                  </span>
                ) : (
                  <input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(q.id, i, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#EDEFF7",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      padding: "8px 0",
                      width: "100%",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <p style={{ color: "#8B93AE", fontSize: 11, fontFamily: "Inter, sans-serif", margin: "8px 0 0" }}>
            Click an option to mark it correct.
          </p>
        </Card>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="ghost" onClick={addQuestion}>
          <Plus size={14} /> Add question
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!canSave || saving}>
          {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
          Publish quiz
        </Button>
      </div>
    </div>
  );
}

// ---------- Play flow ----------
function PlayView({ quiz, onFinish, onExit }) {
  const [stage, setStage] = useState("name"); // name | question | feedback | done
  const [playerName, setPlayerName] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(quiz.questions[0]?.timeLimit || 20);
  const [wasCorrect, setWasCorrect] = useState(false);
  const timerRef = useRef(null);
  const question = quiz.questions[qIndex];

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAnswer = (optionIndex, remaining, idxOverride) => {
    const idx = idxOverride !== undefined ? idxOverride : qIndex;
    const q = quiz.questions[idx];
    clearTimer();
    const correct = optionIndex !== null && optionIndex === q.correctIndex;
    let gained = 0;
    if (correct) {
      const speedFraction = Math.max(0, remaining / q.timeLimit);
      const bonus = Math.round(speedFraction * (q.points * 0.5));
      gained = q.points + bonus;
    }
    setWasCorrect(correct);
    setSelected(optionIndex);
    setScore((s) => s + gained);
    setStage("feedback");
  };

  const startQuestion = useCallback(
    (idx) => {
      const q = quiz.questions[idx];
      setSelected(null);
      setTimeLeft(q.timeLimit);
      setStage("question");
      clearTimer();
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearTimer();
            handleAnswer(null, 0, idx);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quiz]
  );

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const next = () => {
    const nextIdx = qIndex + 1;
    if (nextIdx >= quiz.questions.length) {
      setStage("done");
    } else {
      setQIndex(nextIdx);
      startQuestion(nextIdx);
    }
  };

  if (stage === "name") {
    return (
      <Card style={{ maxWidth: 420, margin: "3rem auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#EDEFF7", fontSize: 22, margin: "0 0 6px" }}>
          {quiz.title}
        </h2>
        <p style={{ color: "#8B93AE", fontFamily: "Inter, sans-serif", fontSize: 14, margin: "0 0 20px" }}>
          {quiz.questions.length} questions · enter a name to start
        </p>
        <Input
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{ marginBottom: 16, textAlign: "center" }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Button variant="ghost" onClick={onExit}>
            <ArrowLeft size={14} /> Back
          </Button>
          <Button
            variant="primary"
            disabled={!playerName.trim()}
            onClick={() => {
              setStage("question");
              startQuestion(0);
            }}
          >
            <Play size={14} /> Start
          </Button>
        </div>
      </Card>
    );
  }

  if (stage === "done") {
    return (
      <ResultsView
        quiz={quiz}
        playerName={playerName}
        score={score}
        onFinish={() => onFinish(playerName, score)}
        onExit={onExit}
      />
    );
  }

  const pct = (timeLeft / question.timeLimit) * 100;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ color: "#8B93AE", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
          Question {qIndex + 1} / {quiz.questions.length}
        </span>
        <span style={{ color: "#EDEFF7", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600 }}>
          Score <ScoreDigits value={score} />
        </span>
      </div>

      <div style={{ height: 5, background: "#232B4A", borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: pct < 25 ? "#E24B4A" : "#7C5CFF",
            transition: "width 1s linear, background 0.3s ease",
          }}
        />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#EDEFF7", fontSize: 20, margin: 0, flex: 1 }}>
            {question.text}
          </h2>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 20,
              color: pct < 25 ? "#E24B4A" : "#EDEFF7",
              marginLeft: 16,
            }}
          >
            {timeLeft}s
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {question.options.map((opt, i) => {
            const isFeedback = stage === "feedback";
            const isCorrectOpt = i === question.correctIndex;
            const isSelected = i === selected;
            let bg = "#101526";
            let border = "#2A3357";
            if (isFeedback && isCorrectOpt) {
              bg = "rgba(99,153,34,0.15)";
              border = "#639922";
            } else if (isFeedback && isSelected && !isCorrectOpt) {
              bg = "rgba(226,75,74,0.12)";
              border = "#E24B4A";
            }
            return (
              <button
                key={i}
                disabled={isFeedback}
                onClick={() => handleAnswer(i, timeLeft)}
                style={{
                  background: bg,
                  border: `1.5px solid ${border}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  color: "#EDEFF7",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  textAlign: "left",
                  cursor: isFeedback ? "default" : "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {opt || `Option ${i + 1}`}
                {isFeedback && isCorrectOpt && <Check size={16} color="#639922" />}
                {isFeedback && isSelected && !isCorrectOpt && <X size={16} color="#E24B4A" />}
              </button>
            );
          })}
        </div>

        {stage === "feedback" && (
          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: wasCorrect ? "#97C459" : "#F09595",
              }}
            >
              {wasCorrect ? "Correct" : selected === null ? "Time's up" : "Not quite"}
            </span>
            <Button variant="primary" onClick={next}>
              {qIndex + 1 >= quiz.questions.length ? "See results" : "Next question"} <ChevronRight size={14} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function ResultsView({ quiz, playerName, score, onFinish, onExit }) {
  const [animated, setAnimated] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let start = null;
    const duration = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min(1, (ts - start) / duration);
      setAnimated(Math.round(progress * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  const maxPossible = quiz.questions.reduce((a, q) => a + q.points * 1.5, 0);
  const submit = async () => {
    setSubmitted(true);
    await onFinish(playerName, score);
  };

  return (
    <Card style={{ maxWidth: 460, margin: "2rem auto", textAlign: "center" }}>
      <Trophy size={32} color="#F2B705" style={{ marginBottom: 10 }} />
      <p style={{ color: "#8B93AE", fontFamily: "Inter, sans-serif", fontSize: 13, margin: "0 0 4px" }}>
        {playerName}, you scored
      </p>
      <div style={{ fontSize: 44, marginBottom: 6 }}>
        <ScoreDigits value={animated} />
      </div>
      <p style={{ color: "#8B93AE", fontFamily: "Inter, sans-serif", fontSize: 12, margin: "0 0 22px" }}>
        out of a possible {Math.round(maxPossible).toLocaleString()} points
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft size={14} /> Back to quizzes
        </Button>
        <Button variant="gold" onClick={submit} disabled={submitted}>
          <Medal size={14} /> {submitted ? "Submitted" : "Submit to leaderboard"}
        </Button>
      </div>
    </Card>
  );
}

// ---------- Leaderboard ----------
function LeaderboardView({ quizzes }) {
  const [mode, setMode] = useState("global"); // global | per-quiz
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || "");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let data = [];
      if (mode === "global") {
        data = await loadGlobalLeaderboard();
        data.sort((a, b) => b.totalScore - a.totalScore);
      } else if (selectedQuizId) {
        data = await loadLeaderboard(selectedQuizId);
        data.sort((a, b) => b.score - a.score);
      }
      if (!cancelled) {
        setEntries(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, selectedQuizId]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setMode("global")}
            style={{
              background: mode === "global" ? "#7C5CFF" : "transparent",
              color: mode === "global" ? "#fff" : "#8B93AE",
              border: mode === "global" ? "none" : "1px solid #2A3357",
              borderRadius: 8,
              padding: "8px 16px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Global
          </button>
          <button
            onClick={() => setMode("per-quiz")}
            style={{
              background: mode === "per-quiz" ? "#7C5CFF" : "transparent",
              color: mode === "per-quiz" ? "#fff" : "#8B93AE",
              border: mode === "per-quiz" ? "none" : "1px solid #2A3357",
              borderRadius: 8,
              padding: "8px 16px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Per quiz
          </button>
        </div>
        {mode === "per-quiz" && (
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            style={{
              background: "#101526",
              border: "1px solid #2A3357",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#EDEFF7",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
            }}
          >
            {quizzes.length === 0 && <option>No quizzes yet</option>}
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title || "Untitled quiz"}
              </option>
            ))}
          </select>
        )}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "2rem", color: "#8B93AE", fontFamily: "Inter, sans-serif", textAlign: "center" }}>
            Loading leaderboard…
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: "2.5rem", color: "#8B93AE", fontFamily: "Inter, sans-serif", textAlign: "center" }}>
            <Users size={22} style={{ marginBottom: 8, opacity: 0.6 }} />
            <p style={{ margin: 0 }}>No scores yet. Play a quiz to take the top spot.</p>
          </div>
        ) : (
          entries.slice(0, 50).map((e, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 20px",
                borderBottom: i < entries.length - 1 ? "1px solid #232B4A" : "none",
              }}
            >
              <RankBadge rank={i + 1} />
              <span style={{ flex: 1, color: "#EDEFF7", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 14 }}>
                {e.name}
              </span>
              {mode === "global" && (
                <span style={{ color: "#8B93AE", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                  {e.quizzesPlayed} quiz{e.quizzesPlayed === 1 ? "" : "zes"}
                </span>
              )}
              <ScoreDigits value={mode === "global" ? e.totalScore : e.score} />
            </div>
          ))
        )}
      </Card>
      <p style={{ color: "#4A5378", fontFamily: "Inter, sans-serif", fontSize: 11, marginTop: 10 }}>
        Leaderboards are stored in this browser only.
      </p>
    </div>
  );
}

// ---------- Root app ----------
export default function App() {
  const [view, setView] = useState("home");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingQuiz, setPlayingQuiz] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await loadQuizzes();
      setQuizzes(data);
      setLoading(false);
    })();
  }, []);

  const handleSaveQuiz = async (quiz) => {
    const updated = [quiz, ...quizzes];
    setQuizzes(updated);
    await saveQuizzes(updated);
    setView("home");
  };

  const handleDeleteQuiz = async (id) => {
    const updated = quizzes.filter((q) => q.id !== id);
    setQuizzes(updated);
    await saveQuizzes(updated);
  };

  const handlePlay = (quiz) => {
    setPlayingQuiz(quiz);
    setView("play");
  };

  const handleFinishQuiz = async (playerName, score) => {
    const quizEntries = await loadLeaderboard(playingQuiz.id);
    const updatedQuizEntries = [...quizEntries, { name: playerName, score, date: Date.now() }];
    await saveLeaderboard(playingQuiz.id, updatedQuizEntries);

    const globalEntries = await loadGlobalLeaderboard();
    const idx = globalEntries.findIndex((e) => e.name === playerName);
    if (idx >= 0) {
      globalEntries[idx] = {
        ...globalEntries[idx],
        totalScore: globalEntries[idx].totalScore + score,
        quizzesPlayed: globalEntries[idx].quizzesPlayed + 1,
      };
    } else {
      globalEntries.push({ name: playerName, totalScore: score, quizzesPlayed: 1 });
    }
    await saveGlobalLeaderboard(globalEntries);
  };

  return (
    <div style={{ background: "#101526", minHeight: 560, padding: "1.75rem 2rem 3rem", borderRadius: 16 }}>
      <style>{`
        ${FONT_IMPORT}
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #101526; }
        ::placeholder { color: #4A5378; }
      `}</style>

      <NavBar view={view === "play" ? "home" : view} setView={setView} />

      {view === "home" && (
        <HomeView quizzes={quizzes} loading={loading} onPlay={handlePlay} onDelete={handleDeleteQuiz} />
      )}
      {view === "create" && <CreateView onSave={handleSaveQuiz} />}
      {view === "leaderboard" && <LeaderboardView quizzes={quizzes} />}
      {view === "play" && playingQuiz && (
        <PlayView
          quiz={playingQuiz}
          onFinish={handleFinishQuiz}
          onExit={() => {
            setPlayingQuiz(null);
            setView("home");
          }}
        />
      )}
    </div>
  );
}
