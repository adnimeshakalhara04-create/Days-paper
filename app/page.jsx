"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { papers, questionsForMode } from "../data/papers";

const STORAGE_KEY = "ict-day-papers-quiz-v1";

function readProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: {} };
    const parsed = JSON.parse(raw);
    return { sessions: parsed.sessions ?? {}, lastMode: parsed.lastMode };
  } catch {
    return { sessions: {} };
  }
}

function modeLabel(mode) {
  if (mode === "all") return "All Papers";
  const number = Number(mode.replace("paper-", ""));
  return `PHY ${String(number).padStart(2, "0")}`;
}

export default function Page() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("all");
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [savedState, setSavedState] = useState({ sessions: {} });
  const [hydrated, setHydrated] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSavedState(readProgress());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const questions = useMemo(() => questionsForMode(mode), [mode]);
  const current = questions[index];
  const currentAnswer = current ? answers[current.id] : undefined;

  const saveSession = useCallback(
    (nextAnswers, nextIndex, nextBookmarks, finished = false) => {
      if (!hydrated) return;
      setSavedState((previous) => {
        const next = {
          sessions: {
            ...previous.sessions,
            [mode]: {
              answers: nextAnswers,
              current: nextIndex,
              bookmarks: nextBookmarks,
              finished,
            },
          },
          lastMode: mode,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [hydrated, mode]
  );

  const startMode = (nextMode, restart = false) => {
    const nextQuestions = questionsForMode(nextMode);
    const session = restart ? undefined : savedState.sessions[nextMode];
    setMode(nextMode);
    setAnswers(session?.answers ?? {});
    setBookmarks(session?.bookmarks ?? []);
    setIndex(Math.min(session?.current ?? 0, Math.max(nextQuestions.length - 1, 0)));
    setNavigatorOpen(false);
    setScreen("quiz");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const chooseAnswer = useCallback(
    (choice) => {
      if (!current || answers[current.id] !== undefined) return;
      const next = { ...answers, [current.id]: choice };
      setAnswers(next);
      saveSession(next, index, bookmarks);
    },
    [answers, bookmarks, current, index, saveSession]
  );

  const goTo = useCallback(
    (nextIndex) => {
      const safe = Math.max(0, Math.min(nextIndex, questions.length - 1));
      setIndex(safe);
      saveSession(answers, safe, bookmarks);
      setNavigatorOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [answers, bookmarks, questions.length, saveSession]
  );

  const finish = useCallback(() => {
    saveSession(answers, index, bookmarks, true);
    setScreen("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [answers, bookmarks, index, saveSession]);

  const nextQuestion = useCallback(() => {
    if (index >= questions.length - 1) finish();
    else goTo(index + 1);
  }, [finish, goTo, index, questions.length]);

  const toggleBookmark = useCallback(() => {
    if (!current) return;
    const next = bookmarks.includes(current.id)
      ? bookmarks.filter((item) => item !== current.id)
      : [...bookmarks, current.id];
    setBookmarks(next);
    saveSession(answers, index, next);
  }, [answers, bookmarks, current, index, saveSession]);

  const backHome = () => {
    saveSession(answers, index, bookmarks);
    setScreen("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (screen !== "quiz") return;
    const onKeyDown = (event) => {
      if (event.key >= "1" && event.key <= "5") chooseAnswer(Number(event.key));
      else if (event.key === "ArrowRight") nextQuestion();
      else if (event.key === "ArrowLeft") goTo(index - 1);
      else if (event.key.toLowerCase() === "b") toggleBookmark();
      else if (event.key === "Escape") {
        setZoomOpen(false);
        setNavigatorOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chooseAnswer, goTo, index, nextQuestion, screen, toggleBookmark]);

  const stats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    for (const question of questions) {
      const value = answers[question.id];
      if (value !== undefined) answered += 1;
      if (value === question.answer) correct += 1;
    }
    return {
      answered,
      correct,
      wrong: answered - correct,
      unanswered: questions.length - answered,
    };
  }, [answers, questions]);

  if (screen === "home") {
    const lastMode = savedState.lastMode;
    const lastSession = lastMode ? savedState.sessions[lastMode] : undefined;
    const lastQuestions = lastMode ? questionsForMode(lastMode) : [];
    const lastAnswered = lastSession
      ? lastQuestions.filter((q) => lastSession.answers?.[q.id] !== undefined).length
      : 0;
    const totalQuestions = papers.reduce((sum, paper) => sum + paper.questions.length, 0);
    const maxPaper = String(Math.max(...papers.map((paper) => paper.number))).padStart(2, "0");

    return (
      <main className="app-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <header className="site-header">
          <a className="brand" href="#top" aria-label="ICT Quiz home">
            <span className="brand-mark">IT</span>
            <span><strong>ICT Day Papers</strong><small>2028 Quiz Studio</small></span>
          </a>
          <div className="source-pill">PHY 01–{maxPaper} · Original order</div>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Information &amp; Communication Technology</p>
            <h1>Turn every day paper<span> into exam-ready practice.</span></h1>
            <p className="hero-lead">
              ප්‍රශ්න පත්‍ර {papers.length}ක ප්‍රශ්න {totalQuestions}ම මුල් අනුපිළිවෙළට.
              පිළිතුරු තෝරන්න, වහාම නිවැරදි පිළිතුර බලන්න, ඔබේ ප්‍රගතිය සුරකින්න.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => startMode("all")}>
                Start all {totalQuestions} questions <span aria-hidden="true">→</span>
              </button>
              {lastMode && lastSession && lastAnswered > 0 && (
                <button className="secondary-button" onClick={() => startMode(lastMode)}>
                  Continue {modeLabel(lastMode)} <span>{lastAnswered}/{lastQuestions.length}</span>
                </button>
              )}
            </div>
            <div className="hero-stats" aria-label="Quiz statistics">
              <div><strong>{totalQuestions}</strong><span>Questions</span></div>
              <div><strong>{papers.length}</strong><span>Day papers</span></div>
              <div><strong>5</strong><span>Choices each</span></div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="hero-card">
              <div className="hero-card-top"><span>LIVE PRACTICE</span><span>PHY 01</span></div>
              <div className="mini-progress"><span style={{ width: "68%" }} /></div>
              <p>Question 5 of 7</p><h2>Choose your answer</h2>
              <div className="answer-preview">
                {[1, 2, 3, 4, 5].map((choice) => <span className={choice === 2 ? "active" : ""} key={choice}>{choice}</span>)}
              </div>
              <div className="hero-card-result"><span>✓</span><div><strong>Correct answer</strong><small>Your progress saves automatically</small></div></div>
            </div>
          </div>
        </section>

        <section className="paper-section">
          <div className="section-heading"><div><p className="eyebrow">Choose a paper</p><h2>Practice one paper at a time</h2></div><p>Each paper keeps its own score and progress on this device.</p></div>
          <div className="paper-grid">
            {papers.map((paper) => {
              const session = savedState.sessions[`paper-${paper.number}`];
              const answered = session ? paper.questions.filter((q) => session.answers?.[q.id] !== undefined).length : 0;
              const percent = Math.round((answered / paper.questions.length) * 100);
              return (
                <button className="paper-card" key={paper.id} onClick={() => startMode(`paper-${paper.number}`)}>
                  <div className="paper-card-top"><span className="paper-number">{String(paper.number).padStart(2, "0")}</span><span className="question-count">{paper.questions.length} questions</span></div>
                  <h3>{paper.title}</h3><div className="paper-progress"><span style={{ width: `${percent}%` }} /></div>
                  <div className="paper-card-footer"><span>{answered > 0 ? `${answered}/${paper.questions.length} answered` : "Not started"}</span><span aria-hidden="true">↗</span></div>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="site-footer"><p>Source papers: Ravindu Bandaranayake · #ictfromabc · All rights remain with the original author.</p><p>Progress is stored only on your device.</p></footer>
      </main>
    );
  }

  if (screen === "results") {
    const accuracy = questions.length ? Math.round((stats.correct / questions.length) * 100) : 0;
    const firstMistake = questions.findIndex((question) => answers[question.id] !== question.answer);
    return (
      <main className="results-shell"><div className="results-card">
        <button className="back-link" onClick={backHome}>← Back to papers</button><p className="eyebrow">Session complete</p>
        <div className="score-ring" style={{ "--score": `${accuracy * 3.6}deg` }}><div><strong>{accuracy}%</strong><span>Accuracy</span></div></div>
        <h1>{accuracy >= 80 ? "Excellent work." : accuracy >= 60 ? "Good progress." : "Keep building momentum."}</h1>
        <p className="results-subtitle">{modeLabel(mode)} · {stats.correct} of {questions.length} correct</p>
        <div className="results-grid"><div className="result-stat correct"><span>Correct</span><strong>{stats.correct}</strong></div><div className="result-stat wrong"><span>Incorrect</span><strong>{stats.wrong}</strong></div><div className="result-stat unanswered"><span>Unanswered</span><strong>{stats.unanswered}</strong></div></div>
        <div className="results-actions">{firstMistake >= 0 && <button className="primary-button" onClick={() => { setIndex(firstMistake); setScreen("quiz"); }}>Review mistakes <span>→</span></button>}<button className="secondary-button" onClick={() => startMode(mode, true)}>Restart this quiz</button></div>
      </div></main>
    );
  }

  if (!current) return null;
  const progress = ((index + 1) / questions.length) * 100;
  const correct = currentAnswer === current.answer;
  const bookmarked = bookmarks.includes(current.id);
  const currentPaperQuestions = questions.filter((q) => q.paperNumber === current.paperNumber);

  return (
    <main className="quiz-shell">
      <header className="quiz-header"><button className="icon-button" onClick={backHome} aria-label="Back to paper selection">←</button><div className="quiz-title"><span>{mode === "all" ? "ALL PAPERS" : "PAPER MODE"}</span><strong>{current.paperTitle}</strong></div><div className="header-actions"><a className="source-link" href={current.sourceUrl} target="_blank" rel="noreferrer">Original PDF ↗</a><button className="icon-button" onClick={() => setNavigatorOpen(true)} aria-label="Open question navigator">{index + 1}/{questions.length}</button></div></header>
      <div className="top-progress" aria-label={`${Math.round(progress)}% complete`}><span style={{ width: `${progress}%` }} /></div>
      <div className="quiz-layout">
        <aside className="quiz-sidebar"><div className="sidebar-brand"><span className="brand-mark">IT</span><div><strong>ICT Quiz</strong><small>2028 Day Papers</small></div></div><div className="sidebar-summary"><p>Current session</p><strong>{stats.answered}<span> / {questions.length}</span></strong><small>questions answered</small></div><button className="navigator-button" onClick={() => setNavigatorOpen(true)}>Question navigator <span>⌘</span></button><div className="sidebar-legend"><span><i className="answered-dot" /> Answered</span><span><i className="bookmark-dot" /> Bookmarked</span></div><p className="keyboard-hint">Keyboard: 1–5 answer · ← → move · B bookmark</p></aside>
        <section className="question-stage">
          <div className="question-meta"><div><span className="question-kicker">{current.paperTitle} · Question {current.number}</span><h1>Choose the correct answer</h1></div><button className={`bookmark-button ${bookmarked ? "bookmarked" : ""}`} onClick={toggleBookmark} aria-pressed={bookmarked}>{bookmarked ? "★ Saved" : "☆ Save"}</button></div>
          <button className="question-image-card" onClick={() => setZoomOpen(true)}><img src={current.imageUrl} alt={current.alt} /><span className="zoom-hint">Click to enlarge</span></button>
          <div className="answer-panel"><div className="answer-heading"><span>Your answer</span><small>Select 1–5</small></div><div className="answer-grid" role="group" aria-label="Answer choices">
            {[1,2,3,4,5].map((choice) => { let stateClass=""; if(currentAnswer!==undefined){stateClass=choice===current.answer?"correct":choice===currentAnswer?"incorrect":"dimmed";} return <button className={`answer-button ${stateClass}`} onClick={() => chooseAnswer(choice)} disabled={currentAnswer !== undefined} aria-label={`Answer ${choice}`} key={choice}><span>{choice}</span>{stateClass === "correct" && <i>✓</i>}{stateClass === "incorrect" && <i>×</i>}</button>; })}
          </div>{currentAnswer !== undefined && <div className={`feedback ${correct ? "feedback-correct" : "feedback-wrong"}`} role="status"><span>{correct ? "✓" : "!"}</span><div><strong>{correct ? "Correct!" : "Not quite — keep going."}</strong><p>The correct answer is <b>{current.answer}</b>.</p></div></div>}</div>
          <div className="question-footer"><button className="previous-button" onClick={() => goTo(index - 1)} disabled={index === 0}>← Previous</button><span>{index + 1} of {questions.length}</span><button className="next-button" onClick={nextQuestion}>{index === questions.length - 1 ? "View results" : currentAnswer === undefined ? "Skip" : "Next"} →</button></div>
        </section>
      </div>
      {navigatorOpen && <div className="modal-backdrop" onClick={() => setNavigatorOpen(false)}><section className="navigator-modal" role="dialog" aria-modal="true" aria-label="Question navigator" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Jump to a question</p><h2>{mode === "all" ? `All ${papers.length} papers` : current.paperTitle}</h2></div><button className="close-button" onClick={() => setNavigatorOpen(false)} aria-label="Close navigator">×</button></div>{mode === "all" ? papers.map((paper) => { const start=questions.findIndex((q)=>q.paperNumber===paper.number); return <div className="navigator-paper" key={paper.id}><h3>{paper.title}</h3><div className="number-grid">{paper.questions.map((_,offset)=>{const navIndex=start+offset; return <NavigatorButton key={questions[navIndex].id} question={questions[navIndex]} index={navIndex} current={index} answers={answers} bookmarks={bookmarks} onSelect={goTo}/>;})}</div></div>;}) : <div className="number-grid">{currentPaperQuestions.map((question,navIndex)=><NavigatorButton key={question.id} question={question} index={navIndex} current={index} answers={answers} bookmarks={bookmarks} onSelect={goTo}/>)}</div>}</section></div>}
      {zoomOpen && <div className="zoom-backdrop" onClick={() => setZoomOpen(false)}><button className="zoom-close" onClick={() => setZoomOpen(false)} aria-label="Close enlarged question">×</button><img src={current.imageUrl} alt={current.alt} onClick={(event) => event.stopPropagation()} /></div>}
    </main>
  );
}

function NavigatorButton({ question, index, current, answers, bookmarks, onSelect }) {
  const answered = answers[question.id] !== undefined;
  const isCorrect = answers[question.id] === question.answer;
  const bookmarked = bookmarks.includes(question.id);
  const className = ["navigator-number",current === index ? "current" : "",answered ? (isCorrect ? "answered-correct" : "answered-wrong") : "",bookmarked ? "has-bookmark" : ""].filter(Boolean).join(" ");
  return <button className={className} onClick={() => onSelect(index)} aria-label={`${question.paperTitle} question ${question.number}${answered ? ", answered" : ""}`}>{question.number}{bookmarked && <i>★</i>}</button>;
}
