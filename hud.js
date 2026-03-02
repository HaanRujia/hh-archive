// ══════════════════════════════════════
// DATA
// ══════════════════════════════════════

var ALL_ITEMS = [
  // ── Chapters ──
  {
    id: 'ch1', type: 'chapter', label: 'Chapter 1', sub: 'something between us', cost: 10,
    content: `
      <p>It started the way most things between them did — quietly, without announcement.
      <em>She had been nine years old the first time she noticed him.</em></p>
      <p>He was sitting on the steps of his mother's store with a book open in his lap, but not reading it.
      He watched a cat across the street with the patient attention of someone who had nowhere else to be.</p>
      <div class="sv-divider">· · ✦ · ·</div>
      <p><strong>She had thought:</strong> <em>That kid is very strange.</em> Then she went inside to buy candy
      and thought nothing of it for three days — at which point she realized she was watching for him every
      morning on her way to school.</p>
      <p>The first time he actually spoke to her, she nearly stepped on him. He was crouched on the pavement
      looking at an old coin, corroded green at the edges. <em>"Found it in the drain,"</em> he said, without
      looking up. She said <em>"That's disgusting"</em> and kept walking. He laughed — the kind that sounded
      like he wasn't sure he was allowed to.</p>
    `
  },
  {
    id: 'ch2', type: 'chapter', label: 'Chapter 2', sub: 'the fence between us', cost: 20,
    content: `
      <p>By the time they were eleven it was simply understood that Hikari existed in Haan's orbit —
      present, inevitable, maintaining a precise and careful distance.</p>
      <p>There was a low concrete fence between their homes, a crack running through it patched badly with
      different-colored cement. <em>Hikari had memorized every inch of it.</em></p>
      <div class="sv-divider">· · ✦ · ·</div>
      <p>She couldn't say when she started sitting on her side of it in the evenings. Or when he started
      appearing on his. Or when the habit of it settled over them like weather.
      <strong>Sometimes they just sat.</strong> And it was the most restful thing she knew.</p>
    `
  },
  { id: 'ch3', type: 'chapter', label: 'Chapter 3', sub: 'placeholder', cost: 20, content: '<p>Chapter 3 — add your content here.</p>' },
  { id: 'ch4', type: 'chapter', label: 'Chapter 4', sub: '???',         cost: 25, content: '<p>Chapter 4 — add your content here.</p>' },
  { id: 'ch5', type: 'chapter', label: 'Chapter 5', sub: '???',         cost: 30, content: '<p>Chapter 5 — add your content here.</p>' },

  // ── Fanfics (unlock after all chapters) ──
  { id: 'f1', type: 'fanfic', label: 'Fanfic 1', sub: 'what if — the rain',  cost: 40, content: '<p>Fanfic 1 — add your content here.</p>' },
  { id: 'f2', type: 'fanfic', label: 'Fanfic 2', sub: 'an alternate ending', cost: 40, content: '<p>Fanfic 2 — add your content here.</p>' },

  // ── Posts (listed in menu only) ──
  { id: 'p1', type: 'post', label: 'the rooftop, 2am',     cost: 50 },
  { id: 'p2', type: 'post', label: 'you must be his wife', cost: 50 },
  { id: 'p3', type: 'post', label: 'wtf',                  cost: 50 },
  { id: 'p4', type: 'post', label: 'the party incident',   cost: 50 },
];

var CHAPTERS = ALL_ITEMS.filter(function(x) { return x.type === 'chapter'; });
var FANFICS  = ALL_ITEMS.filter(function(x) { return x.type === 'fanfic';  });
var SV_ITEMS = CHAPTERS.concat(FANFICS);
var POSTS    = ALL_ITEMS.filter(function(x) { return x.type === 'post';    });

// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════

var STATE = {
  points: 0,
  streak: 0,
  checkedInToday: false,
  owned: [],
  name: 'Anonymous',
  username: 'visitor'
};

var svIndex = 0;

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════

function isOwned(id) { return STATE.owned.indexOf(id) !== -1; }
function allOwned(arr) { return arr.every(function(x) { return isOwned(x.id); }); }
function chapsDone() { return allOwned(CHAPTERS); }

function toast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window._tt);
  window._tt = setTimeout(function() { el.classList.remove('show'); }, 2200);
}

function flashPts() {
  var el = document.getElementById('stat-pts');
  el.classList.remove('pts-flash');
  void el.offsetWidth;
  el.classList.add('pts-flash');
}

function nextIn(arr, requirePrev) {
  for (var i = 0; i < arr.length; i++) {
    if (isOwned(arr[i].id)) continue;
    if (!requirePrev || i === 0 || isOwned(arr[i - 1].id)) return arr[i];
    return null;
  }
  return null;
}

// ══════════════════════════════════════
// RENDER
// ══════════════════════════════════════

function render() {
  document.getElementById('pts-val').textContent    = STATE.points;
  document.getElementById('streak-val').textContent = STATE.streak + (STATE.streak >= 3 ? ' 🔥' : '');
  document.getElementById('m-name').textContent     = STATE.name;
  document.getElementById('m-handle').textContent   = '@' + STATE.username;
  document.getElementById('m-av').textContent       = STATE.name.charAt(0).toUpperCase();

  // Chapter/fanfic button
  var nextCh   = nextIn(CHAPTERS, true);
  var nextFn   = chapsDone() ? nextIn(FANFICS, false) : null;
  var nextItem = nextCh || nextFn;

  var btnCh     = document.getElementById('btn-chapter');
  var btnChCost = document.getElementById('btn-chapter-cost');
  var btnChSub  = document.getElementById('btn-chapter-sub');

  if (nextItem) {
    btnCh.disabled        = false;
    btnChCost.textContent = nextItem.cost + ' pts';
    btnChSub.textContent  = nextCh
      ? 'stories · fanfics unlock after all chapters'
      : 'fanfics · all chapters complete ✦';
  } else if (allOwned(CHAPTERS) && allOwned(FANFICS)) {
    btnCh.disabled        = true;
    btnChCost.textContent = '';
    btnChSub.textContent  = 'all unlocked ✦';
  } else {
    btnCh.disabled        = true;
    btnChCost.textContent = '';
    btnChSub.textContent  = 'complete all chapters first';
  }

  // Post button
  var nextP = nextIn(POSTS, false);
  document.getElementById('btn-post-cost').textContent = nextP ? nextP.cost + ' pts' : '';
  document.getElementById('btn-post').disabled = !nextP;

  // Login button
  var ciDone = STATE.checkedInToday;
  document.getElementById('btn-login-txt').textContent = ciDone ? 'LOGIN CLAIMED ✦' : 'DAILY LOGIN';
  document.getElementById('btn-login').classList.toggle('checked-in', ciDone);

  renderStoryViewer();
}

// ── Story Viewer ──
function renderStoryViewer() {
  var tabs = document.getElementById('sv-tabs');
  tabs.innerHTML = '';

  SV_ITEMS.forEach(function(item, i) {
    var owned    = isOwned(item.id);
    var isActive = i === svIndex;
    var btn      = document.createElement('button');

    btn.className   = 'sv-tab ' + (isActive ? 'active-tab' : owned ? 'unlocked-tab' : 'locked-tab');
    btn.textContent = item.label;

    if (owned) {
      btn.onclick = (function(idx) { return function() { svIndex = idx; renderStoryViewer(); }; })(i);
    }

    tabs.appendChild(btn);
  });

  var item  = SV_ITEMS[svIndex];
  var owned = isOwned(item.id);

  document.getElementById('sv-title').textContent = item.label.toUpperCase();
  document.getElementById('sv-sub').textContent   = owned ? item.sub : 'locked';

  document.getElementById('sv-locked-area').style.display = owned ? 'none'  : 'block';
  document.getElementById('sv-open-area').style.display   = owned ? 'block' : 'none';

  if (owned) { document.getElementById('sv-body').innerHTML = item.content; }

  document.getElementById('sv-locked-txt').textContent = 'unlock "' + item.label + '" via the menu above';
  document.getElementById('sv-locked-pts').textContent = 'cost: ' + item.cost + ' pts';
  document.getElementById('sv-prog').textContent       = (svIndex + 1) + ' / ' + SV_ITEMS.length;
  document.getElementById('sv-prev').disabled = svIndex === 0;
  document.getElementById('sv-next').disabled = svIndex === SV_ITEMS.length - 1;
}

function svNav(dir) {
  svIndex = Math.max(0, Math.min(SV_ITEMS.length - 1, svIndex + dir));
  var b = document.getElementById('sv-body');
  if (b) b.scrollTop = 0;
  renderStoryViewer();
}

// ══════════════════════════════════════
// MODALS
// ══════════════════════════════════════

function openModal(type) {
  if (type === 'chapter') renderChModal();
  if (type === 'post')    renderPostModal();
  if (type === 'login')   renderLoginModal();
  document.getElementById('modal-' + type).classList.add('open');
}

function closeModal(type) {
  document.getElementById('modal-' + type).classList.remove('open');
}

function renderChModal() {
  document.getElementById('modal-ch-pts').textContent = STATE.points;
  var list     = document.getElementById('modal-ch-list');
  list.innerHTML = '';
  var allItems = CHAPTERS.concat(FANFICS);

  allItems.forEach(function(item, i) {
    var owned      = isOwned(item.id);
    var isFanfic   = item.type === 'fanfic';
    var prevOwned  = i === 0 || isOwned(allItems[i - 1].id);
    var fanficGate = isFanfic && !chapsDone();
    var isNext     = !owned && prevOwned && !fanficGate;
    var canAfford  = STATE.points >= item.cost;

    var div = document.createElement('div');
    div.className = 'ul-item ' + (owned ? 'owned' : isNext ? 'available' : 'locked-item');

    var rightHTML = owned
      ? '<span class="ul-check">✦</span>'
      : isNext
        ? '<div class="ul-right">' +
            '<span class="ul-price">' + item.cost + ' pts</span>' +
            '<button class="ul-unlock-btn"' + (canAfford ? '' : ' disabled') +
            ' onclick="purchase(\'' + item.id + '\',' + item.cost + ',\'chapter\')">' +
            (canAfford ? 'UNLOCK' : 'NEED PTS') + '</button>' +
          '</div>'
        : '<span class="ul-price">' + item.cost + '</span>';

    div.innerHTML =
      '<span class="ul-icon">' + (owned ? '◆' : isNext ? '▸' : '·') + '</span>' +
      '<div class="ul-info">' +
        '<div class="ul-name">' + (isFanfic ? '[FANFIC] ' : '') + item.label + '</div>' +
        '<div class="ul-sub">' + (owned || isNext ? item.sub : fanficGate ? 'unlock all chapters first' : 'locked') + '</div>' +
      '</div>' +
      rightHTML;

    list.appendChild(div);
  });
}

function renderPostModal() {
  document.getElementById('modal-post-pts').textContent = STATE.points;
  var list = document.getElementById('modal-post-list');
  list.innerHTML = '';

  POSTS.forEach(function(item) {
    var owned     = isOwned(item.id);
    var canAfford = STATE.points >= item.cost;
    var div       = document.createElement('div');
    div.className = 'ul-item ' + (owned ? 'owned' : 'available');

    div.innerHTML =
      '<span class="ul-icon">' + (owned ? '◆' : '▸') + '</span>' +
      '<div class="ul-info">' +
        '<div class="ul-name">' + item.label + '</div>' +
        '<div class="ul-sub">' + (owned ? 'unlocked' : 'character post') + '</div>' +
      '</div>' +
      (owned
        ? '<span class="ul-check">✦</span>'
        : '<div class="ul-right">' +
            '<span class="ul-price">' + item.cost + ' pts</span>' +
            '<button class="ul-unlock-btn"' + (canAfford ? '' : ' disabled') +
            ' onclick="purchase(\'' + item.id + '\',' + item.cost + ',\'post\')">' +
            (canAfford ? 'UNLOCK' : 'NEED PTS') + '</button>' +
          '</div>');

    list.appendChild(div);
  });
}

function renderLoginModal() {
  var ptsEarned = STATE.checkedInToday
    ? 10 + (STATE.streak >= 3 ? 5 : 0)
    : 10 + (STATE.streak >= 2 ? 5 : 0);

  document.getElementById('login-pts-big').textContent = '+' + ptsEarned;
  document.getElementById('login-bonus').textContent   = STATE.streak >= 2
    ? '🔥 streak bonus active +5 pts'
    : STATE.streak === 1 ? 'reach 3-day streak for bonus!' : '';

  var pips = document.getElementById('login-streak');
  pips.innerHTML = '';
  for (var i = 0; i < 7; i++) {
    var pip = document.createElement('div');
    pip.className = 'streak-pip' + (i < STATE.streak ? ' active' : '');
    pips.appendChild(pip);
  }

  document.getElementById('login-claim-btn').disabled = STATE.checkedInToday;
  document.getElementById('login-done').textContent   = STATE.checkedInToday ? 'come back tomorrow ✦' : '';
}

// ══════════════════════════════════════
// ACTIONS
// ══════════════════════════════════════

function purchase(id, cost, modalType) {
  if (STATE.points < cost) { toast('NOT ENOUGH POINTS'); return; }
  STATE.points -= cost;
  STATE.owned.push(id);
  flashPts();
  toast('✦ UNLOCKED · -' + cost + ' PTS');
  render();
  if (modalType === 'chapter') renderChModal();
  if (modalType === 'post')    renderPostModal();
}

function doCheckin() {
  if (STATE.checkedInToday) return;
  STATE.streak += 1;
  var earned = 50 + (STATE.streak >= 3 ? 5 : 0); // TEST MODE: 50 pts. Change to 10 for production.
  STATE.points += earned;
  STATE.checkedInToday = true;
  flashPts();
  toast('+' + earned + ' PTS · STREAK ' + STATE.streak + (STATE.streak >= 3 ? ' 🔥' : ''));
  render();
  renderLoginModal();
}

function togglePP() {
  var p    = document.getElementById('pp');
  var open = p.classList.toggle('open');
  if (open) {
    document.getElementById('pp-dn').value = STATE.name !== 'Anonymous' ? STATE.name : '';
    document.getElementById('pp-un').value = STATE.username !== 'visitor' ? STATE.username : '';
  }
}

function savePP() {
  var n = document.getElementById('pp-dn').value.trim() || 'Anonymous';
  var u = document.getElementById('pp-un').value.trim().replace(/^@/, '') || 'visitor';
  STATE.name     = n;
  STATE.username = u;
  var h = document.getElementById('pp-hint');
  h.textContent = '✓ saved!';
  setTimeout(function() { h.textContent = 'saved across all posts ✦'; }, 2000);
  render();
}

function resetState() {
  STATE    = { points: 0, streak: 0, checkedInToday: false, owned: [], name: 'Anonymous', username: 'visitor' };
  svIndex  = 0;
  toast('STATE RESET');
  render();
}

// ── Init ──
render();
