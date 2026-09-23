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

function layout({ title, description, body }) {
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
    body: `
      <div class="case-header">
        <div class="case-meta">${statusChip(c.status)}<span class="chip">${esc(c.category)}</span><span class="chip">${esc(c.difficulty)}</span></div>
        <h1>${esc(c.title)}</h1>
        <p class="case-sub">${esc(c.court)} · ${esc(c.caseNumber)} · ${esc(c.date)} · ${esc(c.region)}</p>
        <p class="case-sub"><b>Истец:</b> ${esc(c.parties.plaintiff)}<br><b>Ответчик:</b> ${esc(c.parties.defendant)}</p>
        <p class="case-sub"><b>Требование:</b> ${esc(c.claim)}</p>
      </div>

      <div class="block">
        <h2>Коротко за 60 секунд</h2>
        <div class="sixty">${esc(c.sixtySeconds)}</div>
      </div>

      <div class="block">
        <h2>Хронология</h2>
        <ul class="timeline">
          ${c.timeline.map((t) => `<li><span class="t-date">${esc(t.date)}</span>${esc(t.label)}</li>`).join("")}
        </ul>
      </div>

      <div class="block">
        <h2>Что решили суды по инстанциям</h2>
        <dl class="instances">
          <dt>Первая инстанция</dt><dd>${esc(c.instances.firstInstance)}</dd>
          <dt>Апелляция</dt><dd>${esc(c.instances.appeal)}</dd>
          <dt>Кассация</dt><dd>${esc(c.instances.cassation)}</dd>
          <dt>Верховный Суд РФ</dt><dd>${esc(c.instances.supremeCourt)}</dd>
        </dl>
      </div>

      <div class="block">
        <h2>Доказательства</h2>
        <p><b>Представлены истцом:</b> ${esc(c.evidence.plaintiff)}</p>
        <p><b>Оценка судов:</b> ${esc(c.evidence.acceptedByCourt)}</p>
      </div>

      <div class="block">
        <h2>Чем закончилось</h2>
        <p>${esc(c.outcome)}</p>
      </div>

      <div class="block">
        <h2>Применённые нормы права</h2>
        <div class="norms">
          ${c.appliedNorms.map((n) => `<div class="norm"><b>${esc(n.code)} ${esc(n.article)}</b> — ${esc(n.note)}</div>`).join("")}
        </div>
      </div>

      <div class="block">
        <h2>Разбор адвоката</h2>
        <p><b>Главные вопросы дела:</b></p>
        <ul class="q-list">${c.advocateAnalysis.centralQuestions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
        <p><b>Урок для начинающего юриста:</b> ${esc(c.advocateAnalysis.lesson)}</p>
        <p class="page-note">${esc(c.advocateAnalysis.framing)}</p>
      </div>

      <div class="block">
        <h2>Источники</h2>
        <ul class="source-list">
          ${c.sources.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.label)}</a><br><span class="source-type">проверено: ${esc(s.checkedAt)}</span></li>`).join("")}
        </ul>
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
