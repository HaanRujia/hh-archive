// ══════════════════════════════════════
// POSTS DATA
// Add / edit posts here.
// type: 'text' | 'chat'
// ══════════════════════════════════════

var POSTS = [
  {
    id: 'p1',
    cost: 50,
    poster: 'Haan',
    handle: '@haan.rujia',
    avatar: 'https://files.catbox.moe/8xmu41.jpg',
    type: 'text',
    body: 'ooooh why are you so obsessed with me? you want me so badly',
    likes: 18,
    comments: [
      { name: 'Hikari', handle: '@hikari.tomoki', avatar: '', text: 'Delete this.',                         likes: 0 },
      { name: 'Haru',   handle: '@haru',          avatar: '', text: 'Babe please, it\'s not what you think. I can explain', likes: 1 },
      { deleted: true },
      { name: 'Haan',   handle: '@haan.rujia',    avatar: 'https://files.catbox.moe/8xmu41.jpg', text: 'i didn\'t tag you', likes: 0 },
    ]
  },
  {
    id: 'p2',
    cost: 50,
    poster: 'Haan',
    handle: '@haan.rujia',
    avatar: 'https://files.catbox.moe/8xmu41.jpg',
    type: 'chat',
    caption: 'why is she so annoying?',
    likes: 22,
    chat: [
      { sender: 'haan',   av: 'https://files.catbox.moe/8xmu41.jpg',  text: 'Oooo' },
      { sender: 'hikari', av: 'https://files.catbox.moe/wdqth6.jpg',   text: 'Ur face triggers me' },
      { sender: 'haan',   av: 'https://files.catbox.moe/8xmu41.jpg',  text: 'Could this be' },
      { sender: 'haan',   av: null,                                     text: '"Affection"' },
      { sender: 'haan',   av: null,                                     text: '??' },
      { sender: 'hikari', av: 'https://files.catbox.moe/wdqth6.jpg',   text: 'SHUT up' },
    ],
    comments: [
      {
        name: 'Haan', handle: '@haan.rujia', avatar: '', text: 'stop calling me at midnight then', likes: 16,
        reply: { name: 'Hikari', handle: '@hikari.tomoki', avatar: '', text: 'i didn\'t do that on purpose', likes: 9 }
      }
    ]
  },
  {
    id: 'p3',
    cost: 50,
    poster: 'Haan',
    handle: '@haan.rujia',
    avatar: 'https://files.catbox.moe/8xmu41.jpg',
    type: 'text',
    body: 'what\'s your biggest fear?',
    likes: 24,
    comments: [
      { name: 'Hikari', handle: '@hikari.tomoki', avatar: '', text: 'being forgotten',          likes: 7  },
      { name: 'Haan',   handle: '@haan.rujia',    avatar: 'https://files.catbox.moe/8xmu41.jpg', text: 'mine is the kool aid man btw', likes: 31 },
    ]
  },
  {
    id: 'p4',
    cost: 50,
    poster: 'Haan',
    handle: '@haan.rujia',
    avatar: 'https://files.catbox.moe/8xmu41.jpg',
    type: 'text',
    body: 'the party incident',
    likes: 38,
    comments: []
  },
];

// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════

var STATE = {
  points: 0,
  owned: []
};

function isOwned(id) { return STATE.owned.indexOf(id) !== -1; }

// ══════════════════════════════════════
// TOAST
// ══════════════════════════════════════

function toast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window._tt);
  window._tt = setTimeout(function() { el.classList.remove('show'); }, 2200);
}

// ══════════════════════════════════════
// RENDER
// ══════════════════════════════════════

function render() {
  document.getElementById('pts-display').textContent = STATE.points;

  var container = document.getElementById('posts-container');
  container.innerHTML = '';

  POSTS.forEach(function(post) {
    if (isOwned(post.id)) {
      container.appendChild(buildPost(post));
    } else {
      container.appendChild(buildLocked(post));
    }
  });
}

// ── Build Unlocked Post ──
function buildPost(post) {
  var card = document.createElement('div');
  card.className = 'post-card';
  card.id = 'post-' + post.id;

  var headHTML =
    '<div class="pc-head">' +
      '<div class="pc-av"><img src="' + post.avatar + '" onerror="this.style.display=\'none\'"></div>' +
      '<div class="pc-meta">' +
        '<span class="pc-name">'   + post.poster + '</span>' +
        '<span class="pc-handle">' + post.handle + '</span>' +
      '</div>' +
    '</div>';

  var bodyHTML = '';
  if (post.type === 'text') {
    bodyHTML = '<div class="pc-body">' + formatText(post.body) + '</div>';
  } else if (post.type === 'chat') {
    if (post.caption) bodyHTML += '<div class="pc-body">' + formatText(post.caption) + '</div>';
    bodyHTML += buildChat(post.chat);
  }

  var likesHTML =
    '<div class="pc-likes">' +
      '<button class="pc-like-btn" onclick="toggleLike(this)">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2">' +
          '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
        '</svg>' +
        '<span class="like-count">' + post.likes + '</span>' +
      '</button>' +
    '</div>';

  var commentsHTML = '';
  if (post.comments && post.comments.length) {
    commentsHTML = '<div class="pc-comments">';
    post.comments.forEach(function(c) {
      if (c.deleted) {
        commentsHTML += '<div class="pc-comment"><div class="pc-c-deleted">[deleted comment]</div></div>';
      } else {
        commentsHTML +=
          '<div class="pc-comment">' +
            '<div class="pc-c-av"><img src="' + (c.avatar || '') + '" onerror="this.style.display=\'none\'"></div>' +
            '<div class="pc-c-body">' +
              '<span class="pc-c-name">'   + c.name   + '</span>' +
              '<span class="pc-c-handle">' + c.handle + '</span>' +
              '<div class="pc-c-text">'    + formatText(c.text) + '</div>' +
              (c.reply
                ? '<div class="pc-c-reply">' +
                    '<span class="pc-c-name">'   + c.reply.name   + '</span>' +
                    '<span class="pc-c-handle">' + c.reply.handle + '</span>' +
                    '<div class="pc-c-text">'    + formatText(c.reply.text) + '</div>' +
                  '</div>'
                : '') +
            '</div>' +
          '</div>';
      }
    });
    commentsHTML += '</div>';
  }

  card.innerHTML = headHTML + bodyHTML + likesHTML + commentsHTML;
  return card;
}

// ── Build Chat Screenshot ──
function buildChat(messages) {
  var html = '<div class="chat-wrap">';
  messages.forEach(function(msg, i) {
    var isRight = msg.sender === 'hikari';
    var showAv  = msg.av && (i === 0 || messages[i - 1].sender !== msg.sender);
    html +=
      '<div class="chat-bubble-row ' + (isRight ? 'right' : 'left') + '">' +
        (msg.av
          ? '<div class="chat-av ' + (showAv ? '' : 'hidden') + '">' +
              '<img src="' + msg.av + '" onerror="this.style.display=\'none\'">' +
            '</div>'
          : '') +
        '<div class="chat-bubble ' + (isRight ? 'right' : 'left') + '">' + msg.text + '</div>' +
      '</div>';
  });
  html += '</div>';
  return html;
}

// ── Build Locked Placeholder ──
function buildLocked(post) {
  var div = document.createElement('div');
  div.className = 'post-locked';
  div.id = 'locked-' + post.id;

  var canAfford = STATE.points >= post.cost;

  div.innerHTML =
    '<div class="pl-preview">' +
      '<div class="pl-head">' +
        '<div class="pl-av-ph"></div>' +
        '<div class="pl-name-ph"></div>' +
      '</div>' +
      '<div class="pl-lines">' +
        '<div class="pl-line l"></div>' +
        '<div class="pl-line m"></div>' +
        '<div class="pl-line s"></div>' +
      '</div>' +
    '</div>' +
    '<div class="pl-bar">' +
      '<div class="pl-info">' +
        '<span class="pl-lock-lbl">✦ locked post</span>' +
        '<span class="pl-lock-pts">' + post.cost + ' pts to unlock</span>' +
      '</div>' +
      '<button class="pl-btn" id="pl-btn-' + post.id + '"' + (canAfford ? '' : ' disabled') +
        ' onclick="unlock(\'' + post.id + '\',' + post.cost + ')">' +
        (canAfford ? 'UNLOCK' : 'NEED PTS') +
      '</button>' +
    '</div>';

  return div;
}

// ── Format text (highlight @mentions) ──
function formatText(t) {
  if (!t) return '';
  return t.replace(/@\w+/g, function(m) {
    return '<span class="mention">' + m + '</span>';
  });
}

// ── Like button toggle ──
function toggleLike(btn) {
  btn.classList.toggle('liked');
  var countEl = btn.querySelector('.like-count');
  var n = parseInt(countEl.textContent);
  countEl.textContent = btn.classList.contains('liked') ? n + 1 : n - 1;
}

// ══════════════════════════════════════
// ACTIONS
// ══════════════════════════════════════

function unlock(id, cost) {
  if (STATE.points < cost) { toast('NOT ENOUGH POINTS'); return; }
  STATE.points -= cost;
  STATE.owned.push(id);
  toast('✦ UNLOCKED · -' + cost + ' PTS');
  render();
}

function addPts(n) {
  STATE.points += n;
  render();
  toast('+' + n + ' PTS ADDED');
}

function resetState() {
  STATE = { points: 0, owned: [] };
  render();
  toast('RESET');
}

// ── Init ──
render();
