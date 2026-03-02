// reader.js — Story/Fanfic Reader

(function () {
  var currentId = null; // currently displayed chapter id

  // ─── Get sorted list of all content from window.HH_CONTENT ──
  function getContent() {
    return (window.HH_CONTENT || []).slice().sort(function (a, b) {
      // chapters before fanfics, then by id
      if (a.type !== b.type) return a.type === 'chapter' ? -1 : 1;
      return a.id < b.id ? -1 : 1;
    });
  }

  function currentIndex() {
    var list = getContent();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === currentId) return i;
    }
    return -1;
  }

  // ─── Render ──────────────────────────────────────
  function render() {
    var g = function (id) { return document.getElementById(id); };

    if (!currentId) {
      // Nothing selected yet
      showEmpty('SELECT A CHAPTER FROM THE MENU ABOVE');
      g('rv-prev').disabled = true;
      g('rv-next').disabled = true;
      g('rv-prog').textContent = '';
      return;
    }

    // Find the chapter data
    var content = getContent();
    var idx     = currentIndex();
    var item    = idx >= 0 ? content[idx] : null;

    if (!item) {
      showEmpty('CHAPTER NOT FOUND');
      return;
    }

    var owned = window.HH && window.HH.unlocked && window.HH.unlocked.indexOf(item.id) !== -1;

    // Header
    if (g('rv-title')) g('rv-title').textContent = item.label.toUpperCase();
    if (g('rv-sub'))   g('rv-sub').textContent   = owned ? item.sub : 'locked';

    if (!owned) {
      showEmpty('✦ LOCKED ✦\n\nUnlock "' + item.label + '" via the Story Vault above.\nCost: ' + item.cost + ' pts');
    } else {
      g('rv-empty').style.display      = 'none';
      g('rv-body-wrap').style.display  = 'block';
      g('rv-body').innerHTML           = item.content;
      g('rv-body').scrollTop           = 0;
    }

    // Prev / next
    g('rv-prev').disabled = idx <= 0;
    g('rv-next').disabled = idx >= content.length - 1;
    g('rv-prog').textContent = (idx + 1) + ' / ' + content.length;
  }

  function showEmpty(msg) {
    var g = function (id) { return document.getElementById(id); };
    if (g('rv-empty')) {
      g('rv-empty').style.display     = 'flex';
      g('rv-empty-txt').textContent   = msg;
    }
    if (g('rv-body-wrap')) g('rv-body-wrap').style.display = 'none';
  }

  // ─── Navigation ───────────────────────────────────
  window.rvNav = function (dir) {
    var content = getContent();
    var idx     = currentIndex();
    var newIdx  = Math.max(0, Math.min(content.length - 1, idx + dir));
    if (content[newIdx]) {
      currentId = content[newIdx].id;
      render();
    }
  };

  // ─── Listen for chapter selection from menu ───────
  window.addEventListener('hhOpenChapter', function (e) {
    currentId = e.detail.id;
    render();
  });

  // Re-render when unlock state changes
  window.addEventListener('hhReady',  render);
  window.addEventListener('hhUpdate', render);

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

})();
