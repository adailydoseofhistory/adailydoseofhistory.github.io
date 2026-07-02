/* A Daily Dose of Quiz — main logic
   Loads questions from the published Google Sheet CSV (see config.js)
   and renders whichever page is currently open. No build step needed. */

const CATEGORY_COLORS = ["#FF6B35","#1B998B","#E63946","#6C5CE7","#0EA5A5","#D88C2B","#5E60CE","#2A9D8F"];
const TIMER_SECONDS = 30; // change this number to adjust timer duration

function colorForCategory(name){
  let hash = 0;
  for (let i=0;i<name.length;i++){ hash = (hash*31 + name.charCodeAt(i)) % 1000; }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

function slugify(str){
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

async function loadQuizData(){
  if (!SHEET_CSV_URL || SHEET_CSV_URL.includes("PASTE_YOUR")){
    return { error: "no-config" };
  }
  try{
    const res = await fetch(SHEET_CSV_URL + (SHEET_CSV_URL.includes('?') ? '&' : '?') + 'cb=' + Date.now());
    const text = await res.text();
    const parsed = Papa.parse(text, { header:true, skipEmptyLines:true });
    const rows = parsed.data.filter(r => r.Question && r.Category);
    return { rows };
  } catch(e){
    console.error(e);
    return { error: "fetch-failed" };
  }
}

function groupByCategory(rows){
  const map = {};
  rows.forEach(r=>{
    const cat = r.Category.trim();
    if (!map[cat]) map[cat] = [];
    map[cat].push(r);
  });
  return map;
}

function renderEmptyState(target, msg){
  target.innerHTML = `<div class="empty-state"><h3>${msg.title}</h3><p>${msg.body}</p></div>`;
}

/* ---------------- HOME PAGE ---------------- */
async function initHome(){
  const grid = document.getElementById('blister-grid');
  const totalStat = document.getElementById('stat-total');
  const catStat = document.getElementById('stat-categories');
  const dateStat = document.getElementById('stat-date');

  const { rows, error } = await loadQuizData();
  if (error === "no-config"){
    renderEmptyState(grid, {
      title:"Connect your quiz sheet",
      body:"Open config.js and paste your published Google Sheet CSV link into SHEET_CSV_URL."
    });
    return;
  }
  if (error || !rows.length){
    renderEmptyState(grid, { title:"No quizzes yet", body:"Add rows to your Google Sheet — they'll appear here automatically." });
    return;
  }

  const grouped = groupByCategory(rows);
  const cats = Object.keys(grouped).sort();
  totalStat.textContent = rows.length;
  catStat.textContent = cats.length;
  const latestDate = rows.map(r=>r.Date).filter(Boolean).sort().reverse()[0];
  dateStat.textContent = latestDate || "—";

  grid.innerHTML = cats.map(cat=>{
    const color = colorForCategory(cat);
    const count = grouped[cat].length;
    return `
      <a class="pill-card" style="--cat-color:${color}" href="category.html?cat=${encodeURIComponent(cat)}">
        <div class="cat-name">${cat}</div>
        <div class="cat-meta">Daily dose quizzes</div>
        <span class="cat-count">${count} question${count===1?'':'s'}</span>
      </a>`;
  }).join('');
}

/* ---------------- CATEGORY PAGE ---------------- */
async function initCategory(){
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat');
  const heading = document.getElementById('cat-heading');
  const list = document.getElementById('quiz-list');
  if (!cat){ location.href = 'index.html'; return; }
  heading.textContent = cat;

  const { rows, error } = await loadQuizData();
  if (error || !rows.length){
    renderEmptyState(list, { title:"No quizzes found", body:"Check back soon — new questions are added daily." });
    return;
  }
  const items = rows.filter(r => r.Category.trim() === cat);
  if (!items.length){
    renderEmptyState(list, { title:"Nothing here yet", body:"This category has no quizzes yet." });
    return;
  }

  list.innerHTML = items.map((r,i)=>{
    return `
      <a class="quiz-row" href="quiz.html?cat=${encodeURIComponent(cat)}&id=${encodeURIComponent(r.ID || i)}">
        <div>
          <div class="qtitle">${r.Question.slice(0,80)}${r.Question.length>80?'…':''}</div>
          <div class="qmeta">${r.Date || ''}</div>
        </div>
        <span class="go">Attempt →</span>
      </a>`;
  }).join('');
}

/* ---------------- QUIZ PAGE with 30-second timer ---------------- */
async function initQuiz(){
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat');
  const id = params.get('id');
  const shell = document.getElementById('quiz-shell');

  const { rows, error } = await loadQuizData();
  if (error || !rows.length){
    renderEmptyState(shell, { title:"Couldn't load this quiz", body:"Please go back and try another one." });
    return;
  }
  const items = rows.filter(r => r.Category.trim() === cat);
  const idx = items.findIndex(r => String(r.ID) === String(id));
  const current = idx >= 0 ? items[idx] : items[0];
  if (!current){
    renderEmptyState(shell, { title:"Quiz not found", body:"This quiz may have been removed." });
    return;
  }

  const options = [
    {key:'A', text:current.OptionA},
    {key:'B', text:current.OptionB},
    {key:'C', text:current.OptionC},
    {key:'D', text:current.OptionD},
  ].filter(o => o.text);

  const progressPct = items.length ? Math.round(((idx+1)/items.length)*100) : 100;
  const nextItem = items[idx+1];

  shell.innerHTML = `
    <div class="quiz-progress"><div id="progress-bar" style="width:${progressPct}%"></div></div>

    <!-- TIMER -->
    <div class="timer-wrap">
      <div class="timer-ring">
        <svg viewBox="0 0 44 44" width="64" height="64">
          <circle class="timer-bg" cx="22" cy="22" r="18" fill="none" stroke-width="3"/>
          <circle class="timer-arc" id="timer-arc" cx="22" cy="22" r="18" fill="none" stroke-width="3"
            stroke-dasharray="113.1" stroke-dashoffset="0"
            stroke-linecap="round" transform="rotate(-90 22 22)"/>
        </svg>
        <span class="timer-num" id="timer-num">${TIMER_SECONDS}</span>
      </div>
      <span class="timer-label">seconds left</span>
    </div>

    <div class="question-card">
      <div class="qnum mono">Question ${idx+1} of ${items.length} · ${cat}</div>
      <h3>${current.Question}</h3>
      <div id="options"></div>
      <div class="explanation" id="explanation">${current.Explanation || ''}</div>
    </div>
    <div class="quiz-actions">
      <a class="btn ghost" href="category.html?cat=${encodeURIComponent(cat)}">All ${cat} quizzes</a>
      ${nextItem ? `<button class="btn" id="next-btn" disabled>Next question →</button>` : `<a class="btn" href="index.html">Back to home</a>`}
    </div>
  `;

  const optWrap = document.getElementById('options');
  const explanationBox = document.getElementById('explanation');
  const timerNum = document.getElementById('timer-num');
  const timerArc = document.getElementById('timer-arc');
  const timerWrap = document.querySelector('.timer-wrap');
  let answered = false;
  let timeLeft = TIMER_SECONDS;
  const arcLen = 113.1; // 2 * PI * 18

  /* ---- render options ---- */
  optWrap.innerHTML = options.map(o=>`
    <div class="option" data-key="${o.key}" tabindex="0" role="button">
      <span class="key">${o.key}</span><span>${o.text}</span>
    </div>`).join('');

  /* ---- reveal answer logic ---- */
  function revealAnswer(chosenKey){
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);

    const correct = current.Answer.trim().toUpperCase();
    optWrap.querySelectorAll('.option').forEach(o=>{
      if (o.dataset.key === correct) o.classList.add('correct');
      else if (o.dataset.key === chosenKey) o.classList.add('incorrect');
    });
    if (current.Explanation) explanationBox.classList.add('show');
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.disabled = false;

    // timer turns green if correct, red if wrong or time ran out
    timerWrap.classList.add(chosenKey === correct ? 'timer-ok' : 'timer-fail');
  }

  /* ---- option click / keyboard ---- */
  optWrap.querySelectorAll('.option').forEach(el=>{
    el.addEventListener('click', ()=> revealAnswer(el.dataset.key));
    el.addEventListener('keydown', e=>{
      if(e.key==='Enter' || e.key===' ') revealAnswer(el.dataset.key);
    });
  });

  /* ---- next button ---- */
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.addEventListener('click', ()=>{
    location.href = `quiz.html?cat=${encodeURIComponent(cat)}&id=${encodeURIComponent(nextItem.ID)}`;
  });

  /* ---- countdown timer ---- */
  function updateTimerVisuals(){
    timerNum.textContent = timeLeft;
    // shrink arc proportionally
    const offset = arcLen * (1 - timeLeft / TIMER_SECONDS);
    timerArc.style.strokeDashoffset = offset;

    // color shift: green → yellow → red
    const pct = timeLeft / TIMER_SECONDS;
    if (pct > 0.5){
      timerArc.style.stroke = '#1B998B'; // green
    } else if (pct > 0.25){
      timerArc.style.stroke = '#D88C2B'; // amber
      timerWrap.classList.add('timer-pulse');
    } else {
      timerArc.style.stroke = '#E63946'; // red
    }
  }

  updateTimerVisuals();

  const timerInterval = setInterval(()=>{
    timeLeft--;
    updateTimerVisuals();
    if (timeLeft <= 0){
      clearInterval(timerInterval);
      if (!answered){
        // time's up — reveal correct answer, mark as timed out
        revealAnswer('__TIMEOUT__');
        timerNum.textContent = '0';
        timerWrap.classList.add('timer-fail');
        // show a "Time's up!" message above options
        const msg = document.createElement('div');
        msg.className = 'timeout-msg';
        msg.textContent = "⏰ Time's up!";
        optWrap.insertAdjacentElement('beforebegin', msg);
      }
    }
  }, 1000);
}

/* ---------------- VISIT COUNTER ---------------- */
function initVisitCounter(){
  const el = document.getElementById('visit-counter');
  if (!el) return;
  el.src = `https://hits.sh/${location.hostname || 'example.com'}.svg?label=visits&color=ff6b35&style=flat-square&logo=fire`;
  el.alt = "Visit counter";
}

document.addEventListener('DOMContentLoaded', ()=>{
  initVisitCounter();
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'category') initCategory();
  if (page === 'quiz') initQuiz();
});
