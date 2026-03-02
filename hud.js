// ═══════════════════════════════════════════════════
// hud.js — Story Vault HUD
// Supabase: illuhxmzyovbekduxmau
// ═══════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── Supabase Config ──────────────────────────────
  var SUPABASE_URL = 'https://illuhxmzyovbekduxmau.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_4v7wnlP_ih4Bc-wZcg0vKg_fBZJl2DN';

  // ─── Content Catalog ─────────────────────────────
  // Edit labels/costs here. Chapter text lives in /content/chX.js files.
  var CHAPTERS = [
    { id: 'ch1', type: 'chapter', label: 'Chapter 1', sub: 'something between us', cost: 10  },
    { id: 'ch2', type: 'chapter', label: 'Chapter 2', sub: 'the fence between us', cost: 20  },
    { id: 'ch3', type: 'chapter', label: 'Chapter 3', sub: '???',                  cost: 20  },
    { id: 'ch4', type: 'chapter', label: 'Chapter 4', sub: '???',                  cost: 25  },
    { id: 'ch5', type: 'chapter', label: 'Chapter 5', sub: '???',                  cost: 30  },
    { id: 'f1',  type: 'fanfic',  label: 'Fanfic 1',  sub: 'what if — the rain',   cost: 40  },
    { id: 'f2',  type: 'fanfic',  label: 'Fanfic 2',  sub: 'an alternate ending',  cost: 40  },
  ];
  var POSTS = [
    { id: 'p1', label: 'the rooftop, 2am',    cost: 50 },
    { id: 'p2', label: 'you must be his wife', cost: 50 },
    { id: 'p3', label: 'wtf',                  cost: 50 },
    { id: 'p4', label: 'the party incident',   cost: 50 },
  ];

  // Expose catalog to other components (reader, chapter-menu, post-wrapper)
  window.HH_CATALOG = { CHAPTERS: CHAPTERS, POSTS: POSTS };

  // ─── Global State ────────────────────────────────
  window.HH = {
    uid:          null,
    points:       0,
    streak:       0,
    lastCheckin:  null,
    unlocked:     [],   // array of ids: 'ch1', 'ch2', 'p1', etc.
    loaded:       false,
  };

  var sb = null;

  // ─── Helpers ─────────────────────────────────────
  function isOwned(id)   { return window.HH.unlocked.indexOf(id) !== -1; }
  function allOwned(arr) { return arr.every(function (x) { return isOwned(x.id); }); }

  function getTodayGMT7() {
    return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  }
  function getYesterdayGMT7() {
    return new Date(Date.now() + 7 * 3600000 - 86400000).toISOString().slice(0, 10);
  }

  function toast(msg) {
    var el = document.getElementById('hh-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(window._hhToast);
    window._hhToast = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  function fireEvent(name) {
    window.dispatchEvent(new CustomEvent(name, { detail: window.HH }));
  }

  function flashPts() {
    var el = document.getElementById('hh-pts');
    if (!el) return;
    el.classList.remove('pts-flash');
    void el.offsetWidth;
    el.classList.add('pts-flash');
  }

  // ─── Next unlock logic ────────────────────────────
  function nextChapter() {
    var chapsDone = allOwned(CHAPTERS.filter(function (x) { return x.type === 'chapter'; }));
    for (var i = 0; i < CHAPTERS.length; i++) {
      var ch = CHAPTERS[i];
      if (isOwned(ch.id)) continue;
      if (ch.type === 'chapter') {
        // Must own previous chapter first
        if (i === 0 || isOwned(CHAPTERS[i - 1].id)) return ch;
        return null; // gap in sequence
      }
      if (ch.type === 'fanfic') {
        // Fanfics only after all chapters done
        return chapsDone ? ch : null;
      }
    }
    return null; // all done
  }

  function nextPost() {
    for (var i = 0; i < POSTS.length; i++) {
      if (!isOwned(POSTS[i].id)) return POSTS[i];
    }
    return null;
  }

  // ─── Supabase ────────────────────────────────────
  async function loadUser() {
    var uid = localStorage.getItem('hh_uid');
    if (!uid) {
      uid = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      localStorage.setItem('hh_uid', uid);
    }
    window.HH.uid = uid;

    try {
      var res = await sb.from('user_progress')
        .select('points, streak, last_checkin, unlocked_posts')
        .eq('username', uid)
        .maybeSingle();

      if (res.data) {
        window.HH.points      = res.data.points          || 0;
        window.HH.streak      = res.data.streak          || 0;
        window.HH.lastCheckin = res.data.last_checkin     || null;
        window.HH.unlocked    = res.data.unlocked_posts   || [];
      } else {
        // First visit — create row
        await sb.from('user_progress').insert({
          username:       uid,
          points:         0,
          streak:         0,
          last_checkin:   null,
          unlocked_posts: [],
        });
      }
    } catch (e) {
      console.warn('HH: load error', e);
    }

    window.HH.loaded = true;
    render();
    fireEvent('hhReady');
  }

  async function saveUser() {
    if (!window.HH.uid) return;
    try {
      await sb.from('user_progress').update({
        points:         window.HH.points,
        streak:         window.HH.streak,
        last_checkin:   window.HH.lastCheckin,
        unlocked_posts: window.HH.unlocked,
      }).eq('username', window.HH.uid);
    } catch (e) {
      console.warn('HH: save error', e);
    }
  }

  // ─── Button Actions ───────────────────────────────
  async function doUnlockChapter() {
    var next = nextChapter();
    if (!next)                           { toast('ALL CHAPTERS UNLOCKED ✦'); return; }
    if (window.HH.points < next.cost)    { toast('NEED ' + next.cost + ' PTS'); return; }

    window.HH.points -= next.cost;
    window.HH.unlocked = window.HH.unlocked.concat([next.id]);
    flashPts();
    toast('✦ ' + next.label.toUpperCase() + ' UNLOCKED');
    await saveUser();
    render();
    fireEvent('hhUpdate');
  }

  async function doUnlockPost() {
    var next = nextPost();
    if (!next)                           { toast('ALL POSTS UNLOCKED ✦'); return; }
    if (window.HH.points < next.cost)    { toast('NEED ' + next.cost + ' PTS'); return; }

    window.HH.points -= next.cost;
    window.HH.unlocked = window.HH.unlocked.concat([next.id]);
    flashPts();
    toast('✦ POST UNLOCKED · ' + next.label);
    await saveUser();
    render();
    fireEvent('hhUpdate');
  }

  async function doCheckin() {
    var today = getTodayGMT7();
    if (window.HH.lastCheckin === today) { toast('ALREADY CLAIMED TODAY'); return; }

    // Streak logic
    if (window.HH.lastCheckin === getYesterdayGMT7()) {
      window.HH.streak += 1;
    } else {
      window.HH.streak = 1; // streak broken or first time
    }

    var pts = 10 + (window.HH.streak >= 3 ? 5 : 0);
    window.HH.points      += pts;
    window.HH.lastCheckin  = today;
    flashPts();
    toast('+' + pts + ' PTS · STREAK ' + window.HH.streak + (window.HH.streak >= 3 ? ' 🔥' : ''));
    await saveUser();
    render();
    fireEvent('hhUpdate');
  }

  // ─── Render ───────────────────────────────────────
  function render() {
    var g = function (id) { return document.getElementById(id); };

    // Stats
    if (g('hh-pts'))    g('hh-pts').textContent    = window.HH.points;
    if (g('hh-streak')) g('hh-streak').textContent = window.HH.streak + (window.HH.streak >= 3 ? ' 🔥' : '');

    // ── Chapter button ──
    var next = nextChapter();
    var btnCh = g('hh-btn-chapter');
    if (btnCh) {
      if (!next) {
        btnCh.disabled = true;
        if (g('hh-ch-sub'))  g('hh-ch-sub').textContent  = 'all unlocked ✦';
        if (g('hh-ch-cost')) g('hh-ch-cost').textContent = '';
      } else {
        var ok = window.HH.points >= next.cost;
        btnCh.disabled      = false;
        btnCh.style.opacity = ok ? '1' : '0.55';
        if (g('hh-ch-sub'))  g('hh-ch-sub').textContent  = next.label + (next.sub ? ' · ' + next.sub : '');
        if (g('hh-ch-cost')) g('hh-ch-cost').textContent = (ok ? '' : 'need ') + next.cost + ' pts';
      }
    }

    // ── Post button ──
    var nextP = nextPost();
    var btnPost = g('hh-btn-post');
    if (btnPost) {
      if (!nextP) {
        btnPost.disabled = true;
        if (g('hh-post-sub'))  g('hh-post-sub').textContent  = 'all posts unlocked ✦';
        if (g('hh-post-cost')) g('hh-post-cost').textContent = '';
      } else {
        var okP = window.HH.points >= nextP.cost;
        btnPost.disabled      = false;
        btnPost.style.opacity = okP ? '1' : '0.55';
        if (g('hh-post-sub'))  g('hh-post-sub').textContent  = nextP.label;
        if (g('hh-post-cost')) g('hh-post-cost').textContent = (okP ? '' : 'need ') + nextP.cost + ' pts';
      }
    }

    // ── Login button ──
    var claimed = window.HH.lastCheckin === getTodayGMT7();
    var btnLogin = g('hh-btn-login');
    if (btnLogin) {
      btnLogin.classList.toggle('claimed', claimed);
      btnLogin.disabled = claimed;
      if (g('hh-login-sub')) {
        g('hh-login-sub').textContent = claimed
          ? 'come back tomorrow ✦'
          : '+10 pts' + (window.HH.streak >= 2 ? ' · +5 streak bonus' : '') + ' · resets gmt+7';
      }
    }
  }

  // ─── Expose for test controls & other files ──────
  window.HHSave    = saveUser;
  window.HHRender  = render;
  window.HHActions = {
    unlockChapter: doUnlockChapter,
    unlockPost:    doUnlockPost,
    checkin:       doCheckin,
  };

  // ─── Init ─────────────────────────────────────────
  function init() {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    loadUser();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
