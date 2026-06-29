import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApiRequest } from '../../hooks/useApiRequest';
import './Curriculum.css';

/* ─── tiny markdown-lite renderer for text slides ───
   Supports paragraphs (blank-line separated) and inline `code` spans.
   Kept intentionally small: lesson copy is short kid-friendly markdown. */
const renderInline = (line, keyPrefix) => {
  const parts = line.split('`');
  return parts.map((part, i) =>
    i % 2 === 1
      ? <code key={`${keyPrefix}-c${i}`}>{part}</code>
      : <React.Fragment key={`${keyPrefix}-t${i}`}>{part}</React.Fragment>
  );
};

const TextMarkdown = ({ text = '' }) => {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i}>{renderInline(para, `p${i}`)}</p>
      ))}
    </>
  );
};

/* ─── Minimal print() simulator for the code sandbox ───
   No execution backend exists yet, so we evaluate string/number literals
   inside print(...) calls only. Clearly labelled as practice output. */
const simulatePython = (code = '') => {
  const out = [];
  const lines = code.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(/^print\((.*)\)\s*$/);
    if (!m) continue;
    let arg = m[1].trim();
    if (
      (arg.startsWith('"') && arg.endsWith('"')) ||
      (arg.startsWith("'") && arg.endsWith("'"))
    ) {
      out.push(arg.slice(1, -1));
    } else if (/^-?\d+(\.\d+)?$/.test(arg)) {
      out.push(arg);
    } else {
      out.push(`<${arg}>`);
    }
  }
  if (out.length === 0) {
    return { text: 'No print() output detected. Try print("Hello!")', isError: false };
  }
  return { text: out.join('\n'), isError: false };
};

/* ─── Slide: Text ─── */
const TextSlide = ({ page }) => (
  <div className="text-slide-layout">
    {page.title && <h2>{page.title}</h2>}
    <TextMarkdown text={page.text} />
  </div>
);

/* ─── Slide: Code Sandbox ─── */
const CodeSandboxSlide = ({ page }) => {
  const starter = page.codeSnippet ?? page.code ?? '';
  const [code, setCode] = useState(starter);
  const [output, setOutput] = useState(null);

  const run = () => setOutput(simulatePython(code));

  return (
    <div className="sandbox-slide-layout">
      <div className="editor-pane">
        {page.title && <h2 style={{ fontSize: '1.4rem' }}>{page.title}</h2>}
        <textarea
          className="sandbox-textarea"
          value={code}
          spellCheck={false}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Python code editor"
        />
        <button className="nav-btn nav-btn-success" onClick={run} style={{ alignSelf: 'flex-start' }}>
          ▶ Run
        </button>
      </div>
      <div className="terminal-pane">
        <div className="terminal-header">
          <span>Practice Output</span>
          <span>python · simulated</span>
        </div>
        <div className={`terminal-body${output?.isError ? ' error-text' : ''}`}>
          {output ? output.text : 'Press ▶ Run to see your code output here.'}
        </div>
      </div>
    </div>
  );
};

/* ─── Animation: variable assignment ─── */
const VariableAssignmentAnim = ({ config }) => {
  const steps = config.steps || [];
  const [step, setStep] = useState(0);
  const current = steps[step] || {};
  const hasValue = current.value !== null && current.value !== undefined;

  return (
    <div className="animation-slide-layout">
      <div className="animation-stage">
        <div className="var-box-container">
          <span className="var-label">{config.variableName || 'box'}</span>
          <div className={`var-box-physical${hasValue ? ' active' : ''}`}>
            {hasValue ? (
              <span className="var-value-bubble">{String(current.value)}</span>
            ) : (
              <span className="var-empty-text">empty</span>
            )}
          </div>
        </div>
      </div>
      <p className="animation-description">{current.explanation || ''}</p>
      <div className="animation-controls">
        <button
          className="nav-btn"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          ◀ Prev Step
        </button>
        <span style={{ alignSelf: 'center', fontWeight: 800 }}>
          {step + 1} / {steps.length}
        </span>
        <button
          className="nav-btn nav-btn-primary"
          disabled={step >= steps.length - 1}
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
        >
          Next Step ▶
        </button>
      </div>
    </div>
  );
};

/* ─── Animation: if / else branching ─── */
const IfBranchingAnim = ({ config }) => {
  const [condition, setCondition] = useState(null); // null | true | false
  const trueLabel = config.trueLabel || config.trueBranch || 'Do this';
  const falseLabel = config.falseLabel || config.falseBranch || 'Do that';
  const prompt = config.condition || config.question || 'Is the condition true?';

  return (
    <div className="animation-slide-layout">
      <p className="animation-description"><strong>if</strong> ({prompt})</p>
      <div className="branch-fork-container">
        <div className="branch-input-toggle">
          <button
            className={`toggle-btn${condition === true ? ' active' : ''}`}
            onClick={() => setCondition(true)}
          >
            True
          </button>
          <button
            className={`toggle-btn${condition === false ? ' active' : ''}`}
            onClick={() => setCondition(false)}
          >
            False
          </button>
        </div>
        <div className="branch-roads-stage">
          <div className="road-path-line" />
          <div className={`road-path-left${condition === true ? ' highlighted' : ''}`}>
            <span>✅ if</span>
            <span>{trueLabel}</span>
          </div>
          <div className={`road-path-right${condition === false ? ' highlighted' : ''}`}>
            <span>↪️ else</span>
            <span>{falseLabel}</span>
          </div>
          {condition !== null && (
            <span className={`character-sprite ${condition ? 'left-path' : 'right-path'}`}>🚶</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Slide: Concept Animation ─── */
const ConceptAnimationSlide = ({ page }) => {
  const config = page.animationConfig || {};
  return (
    <div className="animation-slide-layout">
      {page.title && <h2 style={{ fontSize: '1.4rem', textAlign: 'center' }}>{page.title}</h2>}
      {page.text && <p className="animation-description">{page.text}</p>}
      {config.animationType === 'if_branching'
        ? <IfBranchingAnim config={config} />
        : <VariableAssignmentAnim config={config} />}
    </div>
  );
};

/* ─── Slide: Mini Quiz ─── */
const MiniQuizSlide = ({ page, selected, onSelect }) => {
  const quiz = page.quizData || {};
  const options = quiz.options || [];
  // correctAnswer only present after the lesson is completed (backend strips it otherwise)
  const correct = quiz.correctAnswer;
  const reveal = correct !== undefined && selected !== null && selected !== undefined;

  return (
    <div className="quiz-slide-layout">
      {page.title && <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{page.title}</h2>}
      <div className="quiz-question-box">
        <p className="quiz-question-text">{quiz.question}</p>
        <div className="quiz-options-list">
          {options.map((opt, i) => {
            const isSelected = selected === i;
            let stateClass = '';
            if (reveal) {
              if (opt === correct) stateClass = ' correct';
              else if (isSelected) stateClass = ' incorrect';
            } else if (isSelected) {
              stateClass = ' selected';
            }
            return (
              <button
                key={i}
                type="button"
                className={`quiz-option-card${stateClass}`}
                onClick={() => onSelect(i)}
              >
                <span className="quiz-option-dot">
                  {isSelected && <span className="quiz-option-dot-inner" />}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
      {reveal && (
        <p style={{ fontWeight: 800, color: options[selected] === correct ? 'var(--success)' : 'var(--error)' }}>
          {options[selected] === correct ? '🎉 Correct!' : `Not quite. Answer: ${correct}`}
        </p>
      )}
    </div>
  );
};

/* ─── Completion slide ─── */
const CompletionSlide = ({ result, lesson }) => (
  <div className="completion-slide-layout">
    <div className="completion-badge">🏆</div>
    <h2 className="completion-title">Lesson Complete!</h2>
    <p style={{ color: 'var(--text-secondary)' }}>Awesome work on “{lesson.title}”.</p>
    <div className="completion-stats-row">
      <div className="completion-stat-box">
        <div className="completion-stat-num">{result?.progress?.quizScore ?? 0}%</div>
        <div className="completion-stat-lbl">Quiz Score</div>
      </div>
      <div className="completion-stat-box">
        <div className="completion-stat-num">+{result?.xpAwarded ?? 0}</div>
        <div className="completion-stat-lbl">XP Earned</div>
      </div>
      <div className="completion-stat-box">
        <div className="completion-stat-num">{result?.progress?.attempts ?? 1}</div>
        <div className="completion-stat-lbl">Attempts</div>
      </div>
    </div>
    <Link to="/dashboard/curriculum" className="nav-btn nav-btn-primary" style={{ display: 'inline-flex' }}>
      Back to Curriculum
    </Link>
  </div>
);

/* ═══════════════════════════ Main Page ═══════════════════════════ */
const LessonViewPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { request } = useApiRequest();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [slide, setSlide] = useState(0);
  const [answers, setAnswers] = useState({}); // pageIndex -> selected option index
  const [submitting, setSubmitting] = useState(false);
  const [completion, setCompletion] = useState(null); // result from complete endpoint
  const [levelUp, setLevelUp] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await request(`/api/v1/curriculum/lessons/${lessonId}`);
        if (mounted && res.status === 'success') {
          setLesson(res.data);
        } else if (mounted) {
          setError('Could not load this lesson.');
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load lesson.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [lessonId, request]);

  const pages = lesson?.pages || [];
  const totalSlides = pages.length;
  const isCompletionSlide = slide >= totalSlides;
  const currentPage = pages[slide];
  const alreadyCompleted = lesson?.progress?.completed;

  const quizPages = pages
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => p.type === 'mini_quiz');

  const allQuizzesAnswered = quizPages.every(
    ({ idx }) => answers[idx] !== undefined && answers[idx] !== null
  );

  /* Compute the quiz score to submit.
     - When correctAnswer is available (revisiting a completed lesson) we grade for real.
     - On a first attempt the backend hides correctAnswer, so we can't verify locally;
       answered questions count as correct (backend stays the source of truth for XP). */
  const computeQuizScore = useCallback(() => {
    if (quizPages.length === 0) return 100;
    let correct = 0;
    for (const { p, idx } of quizPages) {
      const sel = answers[idx];
      if (sel === undefined || sel === null) continue;
      const answer = p.quizData?.correctAnswer;
      if (answer === undefined) correct += 1; // hidden -> optimistic
      else if (p.quizData.options?.[sel] === answer) correct += 1;
    }
    return Math.round((correct / quizPages.length) * 100);
  }, [quizPages, answers]);

  const handleSelect = (pageIdx, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [pageIdx]: optionIdx }));
  };

  const submitCompletion = async () => {
    try {
      setSubmitting(true);
      const quizScore = computeQuizScore();
      const res = await request(
        `/api/v1/curriculum/lessons/${lessonId}/complete`,
        'POST',
        { quizScore }
      );
      if (res.status === 'success') {
        setCompletion(res.data);
        if (res.data.newLevel) setLevelUp(res.data.newLevel);
        setSlide(totalSlides); // move to completion slide
      } else {
        setError('Could not submit your progress.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit lesson.');
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    const isLastContentSlide = slide === totalSlides - 1;
    if (!isLastContentSlide) {
      setSlide((s) => s + 1);
      return;
    }
    // last content slide -> finish
    if (alreadyCompleted) {
      setCompletion({
        progress: lesson.progress,
        xpAwarded: 0,
      });
      setSlide(totalSlides);
    } else {
      submitCompletion();
    }
  };

  if (loading) {
    return (
      <div className="curriculum-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📖</div>
        <h2>Opening your lesson...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="curriculum-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
        <h2>Oops!</h2>
        <p style={{ color: 'var(--error)', fontWeight: 'bold' }}>{error}</p>
        <button className="nav-btn nav-btn-primary" onClick={() => navigate('/dashboard/curriculum')} style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          Back to Curriculum
        </button>
      </div>
    );
  }

  if (!lesson) return null;

  const progressPct = isCompletionSlide
    ? 100
    : Math.round((slide / Math.max(1, totalSlides)) * 100);

  // Gate the "Next" button on quiz slides until an option is chosen
  const onQuizSlide = currentPage?.type === 'mini_quiz';
  const quizSlideAnswered = !onQuizSlide || answers[slide] !== undefined;
  const isLastContentSlide = slide === totalSlides - 1;
  const nextDisabled =
    submitting ||
    !quizSlideAnswered ||
    (isLastContentSlide && !allQuizzesAnswered);

  return (
    <div className="lesson-view-container">
      {/* Navbar */}
      <div className="lesson-navbar">
        <Link to="/dashboard/curriculum" className="lesson-nav-title" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>←</span>
          <span>{lesson.moduleTitle || 'Lesson'}</span>
        </Link>
        <div className="lesson-progress-tracker">
          <div className="lesson-progress-bg">
            <div className="lesson-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            {isCompletionSlide ? 'Done' : `${slide + 1} / ${totalSlides}`}
          </span>
        </div>
        <span className="xp-badge">+{lesson.xpReward || 15} XP</span>
      </div>

      {/* Carousel */}
      <div className="carousel-card">
        <div className="slide-content-area">
          {isCompletionSlide ? (
            <CompletionSlide result={completion} lesson={lesson} />
          ) : currentPage?.type === 'text' ? (
            <TextSlide page={currentPage} />
          ) : currentPage?.type === 'code_sandbox' ? (
            <CodeSandboxSlide page={currentPage} />
          ) : currentPage?.type === 'concept_animation' ? (
            <ConceptAnimationSlide page={currentPage} />
          ) : currentPage?.type === 'mini_quiz' ? (
            <MiniQuizSlide
              page={currentPage}
              selected={answers[slide]}
              onSelect={(optIdx) => handleSelect(slide, optIdx)}
            />
          ) : (
            <p>Unsupported slide type.</p>
          )}
        </div>

        {!isCompletionSlide && (
          <div className="slide-footer">
            <button
              className="nav-btn"
              disabled={slide === 0}
              onClick={() => setSlide((s) => Math.max(0, s - 1))}
            >
              ◀ Back
            </button>

            <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {currentPage?.title || ''}
            </span>

            {isLastContentSlide ? (
              <button
                className="nav-btn nav-btn-success"
                disabled={nextDisabled}
                onClick={goNext}
              >
                {submitting ? 'Saving...' : alreadyCompleted ? 'Finish ▶' : 'Finish & Submit ▶'}
              </button>
            ) : (
              <button
                className="nav-btn nav-btn-primary"
                disabled={nextDisabled}
                onClick={goNext}
              >
                Next ▶
              </button>
            )}
          </div>
        )}
      </div>

      {/* Level Up Overlay */}
      {levelUp && (
        <div className="level-up-overlay" onClick={() => setLevelUp(null)}>
          <div className="level-up-modal" onClick={(e) => e.stopPropagation()}>
            <div className="level-up-stars">🌟</div>
            <h2 className="level-up-title">Level Up!</h2>
            <div className="level-up-number">{levelUp}</div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              You reached Level {levelUp}. Keep coding, superstar!
            </p>
            <button className="nav-btn nav-btn-primary" onClick={() => setLevelUp(null)} style={{ display: 'inline-flex' }}>
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonViewPage;
