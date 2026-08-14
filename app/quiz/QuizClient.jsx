"use client";

import { useEffect, useMemo, useState } from "react";
import { papers, questionsForMode } from "../../data/papers";
import { getOfficialMarking } from "../../data/markingData";

const KEY = "ict-day-papers-quiz-v5";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const pad = (n) => String(n).padStart(2, "0");
const modeLabel = (mode) => mode === "all" ? "සියලුම පේපර්" : `PHY ${pad(Number(mode.replace("paper-", "")))}`;
const officialAnswer = (q) => getOfficialMarking(q.paperNumber, q.number).answer ?? q.answer;

function readSaved() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{"sessions":{}}'); }
  catch { return { sessions: {} }; }
}

function packUrl(paperNumber) {
  return `${BASE_PATH}/assets/phy-${pad(paperNumber)}.json`;
}

export default function QuizClient() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("all");
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [saved, setSaved] = useState({ sessions: {} });
  const [ready, setReady] = useState(false);
  const [packs, setPacks] = useState({});
  const [assetError, setAssetError] = useState("");
  const [zoomSrc, setZoomSrc] = useState("");

  useEffect(() => {
    setSaved(readSaved());
    setReady(true);
  }, []);

  const questions = useMemo(() => questionsForMode(mode), [mode]);
  const q = questions[index];
  const picked = q ? answers[q.id] : undefined;
  const marking = q ? getOfficialMarking(q.paperNumber, q.number) : null;
  const correct = q ? (marking?.answer ?? q.answer) : undefined;
  const pack = q ? packs[q.paperNumber] : null;
  const questionImage = q && pack ? pack.questions?.[q.number - 1] : "";
  const markingImage = q && pack ? pack.markings?.[q.number - 1] : "";

  useEffect(() => {
    if (!q || packs[q.paperNumber]) return;
    let active = true;
    setAssetError("");
    fetch(packUrl(q.paperNumber), { cache: "force-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (active) setPacks((old) => ({ ...old, [q.paperNumber]: data }));
      })
      .catch(() => {
        if (active) setAssetError(`PHY ${pad(q.paperNumber)} crop files load වුණේ නැහැ.`);
      });
    return () => { active = false; };
  }, [q?.paperNumber, packs]);

  const persist = (nextAnswers = answers, nextIndex = index, nextBookmarks = bookmarks, finished = false) => {
    if (!ready) return;
    setSaved((prev) => {
      const next = {
        sessions: {
          ...(prev.sessions || {}),
          [mode]: { answers: nextAnswers, current: nextIndex, bookmarks: nextBookmarks, finished },
        },
        lastMode: mode,
      };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const start = (nextMode, restart = false) => {
    const list = questionsForMode(nextMode);
    const session = restart ? null : saved.sessions?.[nextMode];
    setMode(nextMode);
    setAnswers(session?.answers || {});
    setBookmarks(session?.bookmarks || []);
    setIndex(Math.min(session?.current || 0, Math.max(list.length - 1, 0)));
    setScreen("quiz");
    setZoomSrc("");
    scrollTo(0, 0);
  };

  const choose = (choice) => {
    if (!q || picked !== undefined) return;
    const next = { ...answers, [q.id]: choice };
    setAnswers(next);
    persist(next, index, bookmarks);
  };

  const go = (nextIndex) => {
    const bounded = Math.max(0, Math.min(nextIndex, questions.length - 1));
    setIndex(bounded);
    persist(answers, bounded, bookmarks);
    setZoomSrc("");
    scrollTo(0, 0);
  };

  const toggleBookmark = () => {
    if (!q) return;
    const next = bookmarks.includes(q.id) ? bookmarks.filter((x) => x !== q.id) : [...bookmarks, q.id];
    setBookmarks(next);
    persist(answers, index, next);
  };

  const home = () => {
    persist();
    setScreen("home");
    setZoomSrc("");
    scrollTo(0, 0);
  };

  const finish = () => {
    persist(answers, index, bookmarks, true);
    setScreen("results");
    setZoomSrc("");
    scrollTo(0, 0);
  };

  const stats = useMemo(() => {
    let answered = 0, correctCount = 0;
    for (const item of questions) {
      if (answers[item.id] !== undefined) answered += 1;
      if (answers[item.id] === officialAnswer(item)) correctCount += 1;
    }
    return { answered, correct: correctCount, wrong: answered - correctCount, unanswered: questions.length - answered };
  }, [answers, questions]);

  if (screen === "home") {
    const total = papers.reduce((sum, paper) => sum + paper.questions.length, 0);
    const lastMode = saved.lastMode;
    const lastSession = lastMode ? saved.sessions?.[lastMode] : null;
    const lastQuestions = lastMode ? questionsForMode(lastMode) : [];
    const lastAnswered = lastSession ? lastQuestions.filter((item) => lastSession.answers?.[item.id] !== undefined).length : 0;

    return (
      <main className="app-shell">
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />
        <header className="site-header">
          <a className="brand" href="#top"><span className="brand-mark">IT</span><span><strong>ICT Day Papers</strong><small>2028 QUIZ STUDIO</small></span></a>
          <div className="source-pill">PHY 01-21 · Sinhala original crops</div>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Information &amp; Communication Technology</p>
            <h1>Turn every day paper<span> into exam-ready practice.</span></h1>
            <p className="hero-lead">ප්‍රශ්න පත්‍ර 21ක ප්‍රශ්න {total}ම මුල් අනුපිළිවෙළට. සෑම ප්‍රශ්නයක්ම original Sinhala-containing paper crop එකෙන්ම සහ පිළිතුරෙන් පසු ඒ ප්‍රශ්නයටම අදාළ original marking explanation crop එකෙන්ම බලන්න.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => start("all")}>ප්‍රශ්න {total}ම පටන් ගන්න →</button>
              {lastMode && lastSession && lastAnswered > 0 && <button className="secondary-button" onClick={() => start(lastMode)}>දිගටම {modeLabel(lastMode)} <span>{lastAnswered}/{lastQuestions.length}</span></button>}
            </div>
            <div className="hero-stats"><div><strong>{total}</strong><span>QUESTIONS</span></div><div><strong>21</strong><span>DAY PAPERS</span></div><div><strong>5</strong><span>CHOICES EACH</span></div></div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="hero-card"><div className="hero-card-top"><span>LIVE PRACTICE</span><span>PHY 01</span></div><div className="mini-progress"><span style={{ width: "68%" }} /></div><p>QUESTION 5 OF 7</p><h2>Choose your answer</h2><div className="answer-preview">{[1,2,3,4,5].map((n) => <span className={n === 2 ? "active" : ""} key={n}>{n}</span>)}</div><div className="hero-card-result"><span>✓</span><div><strong>Official marking crop</strong><small>Sinhala explanation from source</small></div></div></div>
          </div>
        </section>

        <section className="paper-section">
          <div className="section-heading"><div><p className="eyebrow">PAPER MODE</p><h2>PHY 01 සිට PHY 21 දක්වා</h2></div><p>එක paper එක බැගින් practice කරන්න. Progress, score සහ saved questions මේ device එකේම තබා ගනී.</p></div>
          <div className="paper-grid">
            {papers.map((paper) => {
              const session = saved.sessions?.[`paper-${paper.number}`];
              const answered = session ? paper.questions.filter((item) => session.answers?.[item.id] !== undefined).length : 0;
              const percent = Math.round((answered / paper.questions.length) * 100);
              return <button className="paper-card" key={paper.id} onClick={() => start(`paper-${paper.number}`)}><div className="paper-card-top"><span className="paper-number">{pad(paper.number)}</span><span className="question-count">{paper.questions.length} ප්‍රශ්න</span></div><h3>{paper.title}</h3><div className="paper-progress"><span style={{ width: `${percent}%` }} /></div><div className="paper-card-footer"><span>{answered ? `${answered}/${paper.questions.length} කරලා` : "Not started"}</span><span>↗</span></div></button>;
            })}
          </div>
        </section>
        <footer className="site-footer"><p>Source papers &amp; markings: Ravindu Bandaranayake · #ictfromabc.</p><p>Question + marking images are hosted with this app; Vercel dependency නැහැ.</p></footer>
      </main>
    );
  }

  if (screen === "results") {
    const percent = questions.length ? Math.round((stats.correct / questions.length) * 100) : 0;
    const firstWrong = questions.findIndex((item) => answers[item.id] !== officialAnswer(item));
    return <main className="results-shell"><div className="results-card"><button className="back-link" onClick={home}>← පේපර් ලැයිස්තුවට</button><p className="eyebrow">SESSION COMPLETE</p><div className="score-ring" style={{ "--score": `${percent * 3.6}deg` }}><div><strong>{percent}%</strong><span>නිවැරදි ප්‍රතිශතය</span></div></div><h1>{percent >= 80 ? "ඉතා හොඳයි!" : percent >= 60 ? "හොඳ ප්‍රගතියක්." : "තව practice කරමු."}</h1><p className="results-subtitle">{modeLabel(mode)} · {stats.correct}/{questions.length} නිවැරදි</p><div className="results-grid"><div className="result-stat correct"><span>නිවැරදි</span><strong>{stats.correct}</strong></div><div className="result-stat wrong"><span>වැරදි</span><strong>{stats.wrong}</strong></div><div className="result-stat unanswered"><span>නොකළ</span><strong>{stats.unanswered}</strong></div></div><div className="results-actions">{firstWrong >= 0 && <button className="primary-button" onClick={() => { setIndex(firstWrong); setScreen("quiz"); }}>වැරදි නැවත බලන්න →</button>}<button className="secondary-button" onClick={() => start(mode, true)}>නැවත පටන් ගන්න</button></div></div></main>;
  }

  if (!q) return null;
  const progress = ((index + 1) / questions.length) * 100;
  const isCorrect = picked === correct;
  const bookmarked = bookmarks.includes(q.id);

  return (
    <main className="quiz-shell">
      <header className="quiz-header">
        <button className="icon-button" onClick={home}>←</button>
        <div className="quiz-title"><span>{mode === "all" ? "ALL PAPERS" : "PAPER MODE"}</span><strong>{q.paperTitle}</strong></div>
        <div className="header-actions"><a className="source-link" href={q.sourceUrl} target="_blank" rel="noreferrer">මුල් PDF ↗</a><button className="icon-button">{index + 1}/{questions.length}</button></div>
      </header>
      <div className="top-progress"><span style={{ width: `${progress}%` }} /></div>

      <div className="quiz-layout">
        <aside className="quiz-sidebar">
          <div className="sidebar-brand"><span className="brand-mark">IT</span><div><strong>ICT Quiz</strong><small>2028 Day Papers</small></div></div>
          <div className="sidebar-summary"><p>දැනට</p><strong>{stats.answered}<span> / {questions.length}</span></strong><small>ප්‍රශ්න කරලා</small></div>
          <div className="sidebar-legend"><span><i className="answered-dot" /> පිළිතුරු දුන්</span><span><i className="bookmark-dot" /> Save කළ</span></div>
        </aside>

        <section className="question-stage">
          <div className="question-meta"><div><span className="question-kicker">{q.paperTitle} · QUESTION {q.number}</span><h1>නිවැරදි පිළිතුර තෝරන්න</h1></div><button className={`bookmark-button ${bookmarked ? "bookmarked" : ""}`} onClick={toggleBookmark}>{bookmarked ? "★ Saved" : "☆ Save"}</button></div>

          <div className="question-image-card" style={{ minHeight: 150 }}>
            {questionImage ? <button onClick={() => setZoomSrc(questionImage)} style={{ border: 0, padding: 0, margin: 0, width: "100%", background: "transparent", cursor: "zoom-in" }}><img src={questionImage} alt={`${q.paperTitle} - Question ${q.number}`} /></button> : <div style={{ minHeight: 150, display: "grid", placeItems: "center", color: "#71809a", fontSize: 13 }}>{assetError || "Original question crop loading..."}</div>}
          </div>

          <div className="answer-panel">
            <div className="answer-heading"><span>ඔබේ පිළිතුර</span><small>1-5 තෝරන්න</small></div>
            <div className="answer-grid">
              {[1,2,3,4,5].map((choice) => {
                let cls = "";
                if (picked !== undefined) cls = choice === correct ? "correct" : choice === picked ? "incorrect" : "dimmed";
                return <button className={`answer-button ${cls}`} disabled={picked !== undefined} onClick={() => choose(choice)} key={choice}><span>{choice}</span>{cls === "correct" && <i>✓</i>}{cls === "incorrect" && <i>×</i>}</button>;
              })}
            </div>

            {picked !== undefined && <>
              <div className={`feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`}><span>{isCorrect ? "✓" : "!"}</span><div><strong>{isCorrect ? "නිවැරදියි!" : "වැරදියි - marking එක බලන්න."}</strong><p>Official marking පිළිතුර <b>{correct}</b>.</p></div></div>
              <section className="marking-review">
                <div className="marking-review-head"><div><span>OFFICIAL MARKING REVIEW</span><h2>මේ ප්‍රශ්නයට අදාළ විවරණය</h2></div><a href={marking?.openUrl} target="_blank" rel="noreferrer">මුල් marking PDF ↗</a></div>
                {markingImage ? <button onClick={() => setZoomSrc(markingImage)} style={{ display: "block", width: "100%", marginTop: 18, border: "1px solid #dce4ef", borderRadius: 16, padding: 10, background: "#fff", cursor: "zoom-in", overflow: "hidden" }}><img src={markingImage} alt={`${q.paperTitle} Question ${q.number} marking explanation`} style={{ width: "100%", height: "auto", display: "block" }} /></button> : <div style={{ minHeight: 120, display: "grid", placeItems: "center", color: "#71809a" }}>Marking crop loading...</div>}
              </section>
            </>}
          </div>

          <div className="question-footer"><button className="previous-button" disabled={index === 0} onClick={() => go(index - 1)}>← පෙර</button><span>{index + 1} / {questions.length}</span><button className="next-button" onClick={() => index === questions.length - 1 ? finish() : go(index + 1)}>{index === questions.length - 1 ? "ප්‍රතිඵල බලන්න" : picked === undefined ? "Skip" : "ඊළඟ"} →</button></div>
        </section>
      </div>

      {zoomSrc && <div role="dialog" aria-modal="true" onClick={() => setZoomSrc("")} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(3,10,25,.86)", padding: 18, overflow: "auto", cursor: "zoom-out" }}><button onClick={() => setZoomSrc("")} style={{ position: "fixed", top: 18, right: 18, zIndex: 101, border: "1px solid rgba(255,255,255,.3)", borderRadius: 12, width: 44, height: 44, color: "#fff", background: "rgba(5,13,29,.9)", fontSize: 22 }}>×</button><img src={zoomSrc} alt="Expanded crop" style={{ display: "block", width: "min(1200px,100%)", height: "auto", margin: "48px auto 20px", borderRadius: 14, background: "white" }} /></div>}
    </main>
  );
}
