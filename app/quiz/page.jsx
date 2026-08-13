"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { papers, questionsForMode } from "../../data/papers";
import { choiceReason, getOfficialMarking } from "../../data/markingData";

const STORAGE_KEY = "ict-day-papers-quiz-v2-marking";

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

function officialAnswerFor(question) {
  return getOfficialMarking(question.paperNumber, question.number).answer ?? question.answer;
}

function preferredCrop(question) {
  if (question.paperNumber < 20) return question.imageUrl;
  const paper = String(question.paperNumber).padStart(2, "0");
  const q = String(question.number).padStart(2, "0");
  const base = process.env.NEXT_PUBLIC_LEGACY_ASSET_BASE || "https://ict-day-papers-quiz-fkwfcoa1p-nimesha.vercel.app";
  return `${base}/questions/phy-${paper}/q-${q}.webp`;
}

export default function QuizPage() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("all");
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [savedState, setSavedState] = useState({ sessions: {} });
  const [hydrated, setHydrated] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomSrc, setZoomSrc] = useState("");

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
  const currentOfficial = current ? getOfficialMarking(current.paperNumber, current.number) : null;
  const correctAnswer = current ? (currentOfficial?.answer ?? current.answer) : undefined;

  const saveSession = useCallback((nextAnswers, nextIndex, nextBookmarks, finished = false) => {
    if (!hydrated) return;
    setSavedState((previous) => {
      const next = {
        sessions: {
          ...previous.sessions,
          [mode]: { answers: nextAnswers, current: nextIndex, bookmarks: nextBookmarks, finished },
        },
        lastMode: mode,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [hydrated, mode]);

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

  const chooseAnswer = useCallback((choice) => {
    if (!current || answers[current.id] !== undefined) return;
    const next = { ...answers, [current.id]: choice };
    setAnswers(next);
    saveSession(next, index, bookmarks);
  }, [answers, bookmarks, current, index, saveSession]);

  const goTo = useCallback((nextIndex) => {
    const safe = Math.max(0, Math.min(nextIndex, questions.length - 1));
    setIndex(safe);
    saveSession(answers, safe, bookmarks);
    setNavigatorOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [answers, bookmarks, questions.length, saveSession]);

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
      if (value === officialAnswerFor(question)) correct += 1;
    }
    return { answered, correct, wrong: answered - correct, unanswered: questions.length - answered };
  }, [answers, questions]);

  if (screen === "home") {
    const lastMode = savedState.lastMode;
    const lastSession = lastMode ? savedState.sessions[lastMode] : undefined;
    const lastQuestions = lastMode ? questionsForMode(lastMode) : [];
    const lastAnswered = lastSession ? lastQuestions.filter((q) => lastSession.answers?.[q.id] !== undefined).length : 0;
    const totalQuestions = papers.reduce((sum, paper) => sum + paper.questions.length, 0);
    const maxPaper = String(Math.max(...papers.map((paper) => paper.number))).padStart(2, "0");

    return (
      <main className="app-shell">
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />
        <header className="site-header">
          <a className="brand" href="#top" aria-label="ICT Quiz home"><span className="brand-mark">IT</span><span><strong>ICT Day Papers</strong><small>2028 Quiz Studio</small></span></a>
          <div className="source-pill">PHY 01–{maxPaper} · Original order</div>
        </header>
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Information &amp; Communication Technology</p>
            <h1>Turn every day paper<span> into exam-ready practice.</span></h1>
            <p className="hero-lead">ප්‍රශ්න පත්‍ර {papers.length}ක ප්‍රශ්න {totalQuestions}ම මුල් අනුපිළිවෙළට. PDF ප්‍රශ්නය බලන්න, පිළිතුර තෝරන්න, marking scheme එකත් එක්ක options 5ම review කරන්න.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => startMode("all")}>Start all {totalQuestions} questions <span aria-hidden="true">→</span></button>
              {lastMode && lastSession && lastAnswered > 0 && <button className="secondary-button" onClick={() => startMode(lastMode)}>Continue {modeLabel(lastMode)} <span>{lastAnswered}/{lastQuestions.length}</span></button>}
            </div>
            <div className="hero-stats"><div><strong>{totalQuestions}</strong><span>Questions</span></div><div><strong>{papers.length}</strong><span>Day papers</span></div><div><strong>5</strong><span>Choices each</span></div></div>
          </div>
          <div className="hero-visual" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-card"><div className="hero-card-top"><span>LIVE PRACTICE</span><span>PHY 01</span></div><div className="mini-progress"><span style={{ width: "68%" }} /></div><p>Question 5 of 7</p><h2>Choose your answer</h2><div className="answer-preview">{[1,2,3,4,5].map((choice)=><span className={choice===2?"active":""} key={choice}>{choice}</span>)}</div><div className="hero-card-result"><span>✓</span><div><strong>Official marking</strong><small>Five-option review after answering</small></div></div></div></div>
        </section>
        <section className="paper-section">
          <div className="section-heading"><div><p className="eyebrow">Choose a paper</p><h2>Practice one paper at a time</h2></div><p>Each paper keeps its own score and progress on this device.</p></div>
          <div className="paper-grid">{papers.map((paper)=>{const session=savedState.sessions[`paper-${paper.number}`];const answered=session?paper.questions.filter((q)=>session.answers?.[q.id]!==undefined).length:0;const percent=Math.round((answered/paper.questions.length)*100);return <button className="paper-card" key={paper.id} onClick={()=>startMode(`paper-${paper.number}`)}><div className="paper-card-top"><span className="paper-number">{String(paper.number).padStart(2,"0")}</span><span className="question-count">{paper.questions.length} questions</span></div><h3>{paper.title}</h3><div className="paper-progress"><span style={{width:`${percent}%`}} /></div><div className="paper-card-footer"><span>{answered>0?`${answered}/${paper.questions.length} answered`:"Not started"}</span><span>↗</span></div></button>;})}</div>
        </section>
        <footer className="site-footer"><p>Source papers &amp; markings: Ravindu Bandaranayake · #ictfromabc · All rights remain with the original author.</p><p>Progress is stored only on your device.</p></footer>
      </main>
    );
  }

  if (screen === "results") {
    const accuracy = questions.length ? Math.round((stats.correct / questions.length) * 100) : 0;
    const firstMistake = questions.findIndex((question) => answers[question.id] !== officialAnswerFor(question));
    return <main className="results-shell"><div className="results-card"><button className="back-link" onClick={backHome}>← Back to papers</button><p className="eyebrow">Session complete</p><div className="score-ring" style={{"--score":`${accuracy*3.6}deg`}}><div><strong>{accuracy}%</strong><span>Accuracy</span></div></div><h1>{accuracy>=80?"Excellent work.":accuracy>=60?"Good progress.":"Keep building momentum."}</h1><p className="results-subtitle">{modeLabel(mode)} · {stats.correct} of {questions.length} correct</p><div className="results-grid"><div className="result-stat correct"><span>Correct</span><strong>{stats.correct}</strong></div><div className="result-stat wrong"><span>Incorrect</span><strong>{stats.wrong}</strong></div><div className="result-stat unanswered"><span>Unanswered</span><strong>{stats.unanswered}</strong></div></div><div className="results-actions">{firstMistake>=0&&<button className="primary-button" onClick={()=>{setIndex(firstMistake);setScreen("quiz");}}>Review mistakes <span>→</span></button>}<button className="secondary-button" onClick={()=>startMode(mode,true)}>Restart this quiz</button></div></div></main>;
  }

  if (!current) return null;
  const progress = ((index + 1) / questions.length) * 100;
  const correct = currentAnswer === correctAnswer;
  const bookmarked = bookmarks.includes(current.id);
  const currentPaperQuestions = questions.filter((q) => q.paperNumber === current.paperNumber);
  const cropSrc = preferredCrop(current);

  return (
    <main className="quiz-shell">
      <header className="quiz-header"><button className="icon-button" onClick={backHome} aria-label="Back to paper selection">←</button><div className="quiz-title"><span>{mode==="all"?"ALL PAPERS":"PAPER MODE"}</span><strong>{current.paperTitle}</strong></div><div className="header-actions"><a className="source-link" href={current.sourceUrl} target="_blank" rel="noreferrer">Original PDF ↗</a><button className="icon-button" onClick={()=>setNavigatorOpen(true)}>{index+1}/{questions.length}</button></div></header>
      <div className="top-progress"><span style={{width:`${progress}%`}} /></div>
      <div className="quiz-layout">
        <aside className="quiz-sidebar"><div className="sidebar-brand"><span className="brand-mark">IT</span><div><strong>ICT Quiz</strong><small>2028 Day Papers</small></div></div><div className="sidebar-summary"><p>Current session</p><strong>{stats.answered}<span> / {questions.length}</span></strong><small>questions answered</small></div><button className="navigator-button" onClick={()=>setNavigatorOpen(true)}>Question navigator <span>⌘</span></button><div className="sidebar-legend"><span><i className="answered-dot" /> Answered</span><span><i className="bookmark-dot" /> Bookmarked</span></div><p className="keyboard-hint">Keyboard: 1–5 answer · ← → move · B bookmark</p></aside>
        <section className="question-stage">
          <div className="question-meta"><div><span className="question-kicker">{current.paperTitle} · Question {current.number}</span><h1>Choose the correct answer</h1></div><button className={`bookmark-button ${bookmarked?"bookmarked":""}`} onClick={toggleBookmark}>{bookmarked?"★ Saved":"☆ Save"}</button></div>
          <button className="question-image-card" onClick={()=>{setZoomSrc(cropSrc);setZoomOpen(true);}}><img src={cropSrc} alt={current.alt} onError={(event)=>{if(event.currentTarget.src!==current.imageUrl)event.currentTarget.src=current.imageUrl;}} /><span className="zoom-hint">Click to enlarge</span></button>
          <div className="answer-panel"><div className="answer-heading"><span>Your answer</span><small>Select 1–5</small></div><div className="answer-grid">{[1,2,3,4,5].map((choice)=>{let stateClass="";if(currentAnswer!==undefined){stateClass=choice===correctAnswer?"correct":choice===currentAnswer?"incorrect":"dimmed";}return <button className={`answer-button ${stateClass}`} onClick={()=>chooseAnswer(choice)} disabled={currentAnswer!==undefined} key={choice}><span>{choice}</span>{stateClass==="correct"&&<i>✓</i>}{stateClass==="incorrect"&&<i>×</i>}</button>;})}</div>
            {currentAnswer!==undefined && <>
              <div className={`feedback ${correct?"feedback-correct":"feedback-wrong"}`} role="status"><span>{correct?"✓":"!"}</span><div><strong>{correct?"Correct!":"Not quite — review the marking."}</strong><p>The official marking answer is <b>{correctAnswer}</b>.</p></div></div>
              <section className="marking-review" aria-label="Official marking review"><div className="marking-review-head"><div><span>OFFICIAL MARKING REVIEW</span><h2>Why each option is right or wrong</h2></div><a href={currentOfficial?.openUrl} target="_blank" rel="noreferrer">Open marking PDF ↗</a></div><div className="marking-option-list">{[1,2,3,4,5].map((choice)=><article className={`marking-option ${choice===correctAnswer?"is-right":"is-wrong"}`} key={choice}><div className="marking-option-number">{choice}</div><div><strong>{choice===correctAnswer?"Correct option":"Incorrect option"}</strong><p>{choiceReason(choice,correctAnswer)}</p></div></article>)}</div><div className="marking-source"><div><strong>Exact source explanation</strong><p>මේ question එකට අදාළ official marking PDF එක මෙතනම දාලා තියෙනවා. Marking එකේ තිබෙන explanation එක source එකෙන්ම බලන්න.</p></div><a href={currentOfficial?.openUrl} target="_blank" rel="noreferrer">Open full size ↗</a></div><iframe className="marking-frame" src={currentOfficial?.previewUrl} title={`${current.paperTitle} question ${current.number} marking scheme`} loading="lazy" /></section>
            </>}
          </div>
          <div className="question-footer"><button className="previous-button" onClick={()=>goTo(index-1)} disabled={index===0}>← Previous</button><span>{index+1} of {questions.length}</span><button className="next-button" onClick={nextQuestion}>{index===questions.length-1?"View results":currentAnswer===undefined?"Skip":"Next"} →</button></div>
        </section>
      </div>
      {navigatorOpen&&<div className="modal-backdrop" onClick={()=>setNavigatorOpen(false)}><section className="navigator-modal" onClick={(event)=>event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Jump to a question</p><h2>{mode==="all"?`All ${papers.length} papers`:current.paperTitle}</h2></div><button className="close-button" onClick={()=>setNavigatorOpen(false)}>×</button></div>{mode==="all"?papers.map((paper)=>{const start=questions.findIndex((q)=>q.paperNumber===paper.number);return <div className="navigator-paper" key={paper.id}><h3>{paper.title}</h3><div className="number-grid">{paper.questions.map((_,offset)=>{const navIndex=start+offset;return <NavigatorButton key={questions[navIndex].id} question={questions[navIndex]} index={navIndex} current={index} answers={answers} bookmarks={bookmarks} onSelect={goTo}/>;})}</div></div>;}) : <div className="number-grid">{currentPaperQuestions.map((question,navIndex)=><NavigatorButton key={question.id} question={question} index={navIndex} current={index} answers={answers} bookmarks={bookmarks} onSelect={goTo}/>)}</div>}</section></div>}
      {zoomOpen&&<div className="zoom-backdrop" onClick={()=>setZoomOpen(false)}><button className="zoom-close" onClick={()=>setZoomOpen(false)}>×</button><img src={zoomSrc||cropSrc} alt={current.alt} onError={(event)=>{event.currentTarget.src=current.imageUrl;}} onClick={(event)=>event.stopPropagation()} /></div>}
      <style jsx>{`
        .marking-review{margin-top:18px;border:1px solid rgba(54,93,255,.2);border-radius:22px;padding:20px;background:rgba(247,249,255,.96)}
        .marking-review-head,.marking-source{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .marking-review-head span{font-size:11px;font-weight:800;letter-spacing:.12em;color:#5870d8}.marking-review-head h2{margin:5px 0 0;font-size:20px;color:#142342}.marking-review-head a,.marking-source a{font-size:13px;font-weight:700;color:#3156d9;text-decoration:none;white-space:nowrap}
        .marking-option-list{display:grid;gap:10px;margin-top:16px}.marking-option{display:grid;grid-template-columns:38px 1fr;gap:12px;padding:13px 14px;border-radius:15px;background:#fff;border:1px solid #e5eafb}.marking-option-number{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-weight:800;background:#eef2ff;color:#2f4fbc}.marking-option strong{font-size:14px;color:#17233e}.marking-option p{margin:4px 0 0;font-size:13px;line-height:1.55;color:#66708a}.marking-option.is-right{border-color:rgba(29,174,112,.36);background:rgba(237,253,246,.95)}.marking-option.is-right .marking-option-number{background:#dff8ec;color:#0d8254}.marking-option.is-wrong .marking-option-number{background:#fff0f1;color:#bd3d4b}
        .marking-source{margin-top:16px;padding-top:16px;border-top:1px solid #e1e7f6}.marking-source strong{color:#142342;font-size:14px}.marking-source p{margin:4px 0 0;color:#68738d;font-size:13px;line-height:1.5}.marking-frame{width:100%;min-height:560px;margin-top:14px;border:1px solid #dde4f4;border-radius:16px;background:#fff}
        @media(max-width:680px){.marking-review{padding:14px;border-radius:17px}.marking-review-head,.marking-source{flex-direction:column}.marking-frame{min-height:500px}.marking-option{grid-template-columns:34px 1fr;padding:11px}}
      `}</style>
    </main>
  );
}

function NavigatorButton({ question, index, current, answers, bookmarks, onSelect }) {
  const answered = answers[question.id] !== undefined;
  const isCorrect = answers[question.id] === officialAnswerFor(question);
  const bookmarked = bookmarks.includes(question.id);
  const className = ["navigator-number",current===index?"current":"",answered?(isCorrect?"answered-correct":"answered-wrong"):"",bookmarked?"has-bookmark":""].filter(Boolean).join(" ");
  return <button className={className} onClick={()=>onSelect(index)}>{question.number}{bookmarked&&<i>★</i>}</button>;
}
