import { mkdirSync, writeFileSync, rmSync, existsSync, cpSync } from "node:fs";
import { join } from "node:path";
import { CASES, STATUS_LABELS } from "../content/cases.mjs";
import { PAGES } from "../content/pages.mjs";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
mkdirSync(join(DIST, "assets"), { recursive: true });
cpSync(join(ROOT, "assets", "styles.css"), join(DIST, "assets", "styles.css"));
cpSync(join(ROOT, "assets", "case.js"), join(DIST, "assets", "case.js"));
if (existsSync(join(ROOT, "public"))) {
  cpSync(join(ROOT, "public"), DIST, { recursive: true });
}

const NAV = [
  { href: "/dela/", label: "100 дел" },
  { href: "/sudebnaya-sistema/", label: "Судебная система" },
  { href: "/professiya-advokata/", label: "Профессия" },
  { href: "/knigi/", label: "Книги" },
  { href: "/o-proekte/", label: "О проекте" },
];

function layout({ title, description, body, script }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Кодекс права</title>
<meta name="description" content="${esc(description)}">
<link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
<header class="site-head">
  <div class="head-inner">
    <a class="logo" href="/">Кодекс <b>права</b></a>
    <nav class="site-nav">${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}</nav>
  </div>
</header>
<main>${body}</main>
<footer class="site-foot">
  <p>Рабочее название проекта, макет в разработке. Материалы сайта — учебные, не являются юридической консультацией.</p>
  <p><a href="/o-proekte/">О проекте и источниках →</a></p>
</footer>
${script ? `<script src="${script}" defer></script>` : ""}
</body>
</html>`;
}

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function write(path, html) {
  const dir = join(DIST, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

function statusChip(status) {
  return `<span class="chip chip-status-${status}">${STATUS_LABELS[status]}</span>`;
}

function caseCard(c) {
  if (c.status !== "published") {
    return `<div class="case-card is-stub">
      <div class="case-meta">${statusChip(c.status)}<span class="chip">${esc(c.category)}</span></div>
      <h3>${esc(c.title)}</h3>
      <p class="case-cat">Скоро — идёт отбор и проверка источников.</p>
    </div>`;
  }
  return `<a class="case-card" href="/dela/${c.slug}/">
    <div class="case-meta">${statusChip(c.status)}<span class="chip">${esc(c.category)}</span><span class="chip">${esc(c.difficulty)}</span></div>
    <h3>${esc(c.title)}</h3>
    <p class="case-cat">${esc(c.court)} · ${esc(c.date)}</p>
  </a>`;
}

// ---------- главная ----------
const published = CASES.filter((c) => c.status === "published");
const total = CASES.length;

write("", layout({
  title: "Изучай право на реальных делах",
  description: "Реальные российские гражданские дела, разобранные понятным языком: факты, доказательства, закон, решение суда — с проверяемыми источниками.",
  body: `
    <section class="hero">
      <h1>Изучай право на реальных делах</h1>
      <p class="lead">Разбор настоящих гражданских дел: кто с кем судился, чего требовали, что решил суд первой инстанции, апелляция, кассация — и почему. Со ссылкой на первоисточник у каждого дела.</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="/dela/">Смотреть дела →</a>
        <a class="btn btn-ghost" href="/o-proekte/">Как устроен проект</a>
      </div>
    </section>

    <div class="stats">
      <div class="stat"><b>${published.length}</b><span>дело опубликовано</span></div>
      <div class="stat"><b>${total}</b><span>тем отобрано сейчас</span></div>
      <div class="stat"><b>100</b><span>дел — плановый объём курса</span></div>
    </div>

    <div class="section-h"><h2>100 дел — 100 уроков</h2><a href="/dela/">все дела →</a></div>
    <div class="case-grid">${CASES.map(caseCard).join("")}</div>

    <div class="status-note">Это ранний рабочий макет: наполнение реальными проверенными делами идёт постепенно, маленькими партиями, каждая — со сверкой по первоисточнику.</div>
  `,
}));

// ---------- /dela/ ----------
write("dela", layout({
  title: "100 дел",
  description: "Список дел курса «100 дел — 100 уроков».",
  body: `
    <div class="hero"><h1>100 дел — 100 уроков</h1><p class="lead">Учебный курс на реальной судебной практике. Дела появляются постепенно, каждое — с проверенным источником.</p></div>
    <div class="case-grid">${CASES.map(caseCard).join("")}</div>
  `,
}));

// ---------- страницы дел ----------
for (const c of published) {
  write(`dela/${c.slug}`, layout({
    title: c.title,
    description: c.sixtySeconds.slice(0, 160),
    script: "/assets/case.js",
    body: `
      <div class="case-header">
        <div class="case-meta">${statusChip(c.status)}<span class="chip">${esc(c.category)}</span><span class="chip">${esc(c.difficulty)}</span></div>
        <h1>${esc(c.title)}</h1>
        <p class="case-sub">${esc(c.court)} · ${esc(c.caseNumber)} · ${esc(c.date)} · ${esc(c.region)}</p>
      </div>

      <div class="block">
        <h2>⚡ Дело за 60 секунд</h2>
        <div class="sixty">${esc(c.sixtySeconds)}</div>
      </div>

      <div class="block">
        <h2>⚖️ Юридическая проблема</h2>
        <ul class="q-list">${c.legalProblem.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
      </div>

      <div class="block">
        <h2>📋 Факты (известны до решения суда)</h2>
        <ul class="fact-list">${c.factsKnown.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </div>

      <div class="block">
        <h2>👥 Стороны</h2>
        <div class="party-grid">
          <div class="party-card">
            <h3>Истец</h3>
            <p>${esc(c.partiesDetailed.plaintiff.who)}</p>
            <dl>
              <dt>Требование</dt><dd>${esc(c.partiesDetailed.plaintiff.claim)}</dd>
              <dt>Главный аргумент</dt><dd>${esc(c.partiesDetailed.plaintiff.mainArgument)}</dd>
              <dt>Главное доказательство</dt><dd>${esc(c.partiesDetailed.plaintiff.mainEvidence)}</dd>
            </dl>
          </div>
          <div class="party-card">
            <h3>Ответчик</h3>
            <p>${esc(c.partiesDetailed.defendant.who)}</p>
            <dl>
              <dt>Позиция</dt><dd class="unknown">${esc(c.partiesDetailed.defendant.claim)}</dd>
              <dt>Главный аргумент</dt><dd class="unknown">${esc(c.partiesDetailed.defendant.mainArgument)}</dd>
              <dt>Главное доказательство</dt><dd class="unknown">${esc(c.partiesDetailed.defendant.mainEvidence)}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="block">
        <h2>🧑‍⚖️ Ты — адвокат</h2>
        <p>${esc(c.lawyerExercise.intro)}</p>
        <form class="lawyer-exercise" data-case="${esc(c.slug)}">
          ${c.lawyerExercise.questions.map((q, i) => `
            <label class="le-q">
              <span>${i + 1}. ${esc(q)}</span>
              <textarea data-q="${i}" rows="2" placeholder="Твой ответ (сохраняется только в этом браузере)"></textarea>
            </label>
          `).join("")}
        </form>
      </div>

      <div class="reveal-gate">
        <button type="button" class="btn btn-primary" data-reveal-btn>🔓 Показать решение суда</button>
        <p class="page-note">Сначала попробуй ответить на вопросы выше — потом сравни со сложившейся практикой.</p>
      </div>

      <div class="reveal-zone" data-reveal-zone hidden>

        <div class="block">
          <h2>🏛 Что решили суды по инстанциям</h2>
          <dl class="instances">
            <dt>Первая инстанция</dt><dd>${esc(c.instances.firstInstance)}</dd>
            <dt>Апелляция</dt><dd>${esc(c.instances.appeal)}</dd>
            <dt>Кассация</dt><dd>${esc(c.instances.cassation)}</dd>
            <dt>Верховный Суд РФ</dt><dd>${esc(c.instances.supremeCourt)}</dd>
          </dl>
        </div>

        <div class="block">
          <h2>🔬 Доказательства</h2>
          <p><b>Представлены истцом:</b> ${esc(c.evidence.plaintiff)}</p>
          <p><b>Приняты и оценены судом:</b> ${esc(c.evidence.acceptedByCourt)}</p>
          <p><b>Не оценивались:</b> ${esc(c.evidence.notEvaluated)}</p>
        </div>

        <div class="block">
          <h2>💡 Почему</h2>
          <p>${esc(c.rationale)}</p>
        </div>

        <div class="block">
          <h2>Чем закончилось</h2>
          <p>${esc(c.outcome)}</p>
        </div>

        <div class="block">
          <h2>📚 Закон — разбор по каждой норме</h2>
          <div class="norms">
            ${c.appliedNorms.map((n) => `
              <div class="norm-card">
                <h3>${esc(n.code)} ${esc(n.article)}</h3>
                <dl>
                  <dt>Что регулирует</dt><dd>${esc(n.what)}</dd>
                  <dt>Почему появилась в этом деле</dt><dd>${esc(n.whyInCase)}</dd>
                  <dt>Как её поняла апелляция</dt><dd>${esc(n.howAppealRead)}</dd>
                  <dt>Как применил Верховный Суд</dt><dd>${esc(n.howSupremeCourt)}</dd>
                  <dt>Практический урок</dt><dd>${esc(n.lesson)}</dd>
                </dl>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="block">
          <h2>⚔️ А если бы...</h2>
          <p class="page-note">Гипотетические сценарии — учебное рассуждение по тем же нормам права, не установленные факты этого дела.</p>
          <div class="whatif-list">
            ${c.whatIf.map((w) => `<details class="whatif"><summary>${esc(w.q)}</summary><p>${esc(w.a)}</p></details>`).join("")}
          </div>
        </div>

        <div class="block">
          <h2>🎓 Чему учит дело</h2>
          <ol class="lessons">${c.lessons.map((l) => `<li>${esc(l)}</li>`).join("")}</ol>
        </div>

        <div class="block">
          <h2>📖 Что почитать дальше</h2>
          <ul class="reading-list">${c.furtherReading.map((r) => `<li><a href="${r.href}">${esc(r.label)}</a></li>`).join("")}</ul>
        </div>

        <div class="block">
          <h2>🔗 Первоисточники</h2>
          <p class="source-tier-label">Первоисточник</p>
          <p class="page-note">${esc(c.sourcesTiered.primary)}</p>
          <p class="source-tier-label">Вторичные источники</p>
          <ul class="source-list">
            ${c.sourcesTiered.secondary.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.label)}</a><br><span class="source-type">проверено: ${esc(s.checkedAt)}</span></li>`).join("")}
          </ul>
          <p class="source-tier-label">Анализ «Кодекса права»</p>
          <p class="page-note">${esc(c.sourcesTiered.ownAnalysisNote)}</p>
        </div>

      </div>
    `,
  }));
}

// ---------- статические страницы ----------
for (const p of PAGES) {
  write(p.slug, layout({
    title: p.title,
    description: p.lead,
    body: `<div class="hero"><h1>${esc(p.title)}</h1><p class="lead">${esc(p.lead)}</p></div>${p.html}`,
  }));
}

// ---------- 404 ----------
writeFileSync(join(DIST, "404.html"), layout({
  title: "Страница не найдена",
  description: "Страница не найдена",
  body: `<div class="hero"><h1>Страница не найдена</h1><p class="lead"><a href="/">На главную</a></p></div>`,
}));

console.log(`Собрано: ${CASES.length} дел (${published.length} опубликовано), ${PAGES.length} статических страниц.`);
