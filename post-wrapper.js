// post-wrapper.js
// Hides posts until unlocked. Works with existing post HTML.
//
// HOW TO USE:
// In each of your existing post embeds, wrap your content like this:
//
//   <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/HaanRujia/hh-archive@main/post-wrapper/post-wrapper.css">
//
//   <div class="hh-post hh-locked" data-post-id="p1">
//     <!-- your existing post HTML stays here, untouched -->
//   </div>
//
//   <script src="https://cdn.jsdelivr.net/gh/HaanRujia/hh-archive@main/post-wrapper/post-wrapper.js"></script>
//
// Change data-post-id to match the id in hud.js POSTS array (p1, p2, p3, p4...)

(function () {

  // Find the post cost from the catalog
  function getCost(postId) {
    if (!window.HH_CATALOG) return 50; // default
    var posts = window.HH_CATALOG.POSTS;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === postId) return posts[i].cost;
    }
    return 50;
  }

  // Apply lock / unlock state to a single wrapper element
  function applyState(wrapper) {
    var postId = wrapper.getAttribute('data-post-id');
    if (!postId) return;

    var owned = window.HH && window.HH.unlocked && window.HH.unlocked.indexOf(postId) !== -1;

    if (owned) {
      // Remove lock
      if (wrapper.classList.contains('hh-locked')) {
        wrapper.classList.remove('hh-locked');
        wrapper.classList.add('hh-revealed'); // fade-in animation
        var lock = wrapper.querySelector('.hh-post-lock');
        if (lock) lock.remove();
      }
    } else {
      // Apply lock overlay if not already there
      wrapper.classList.add('hh-locked');
      if (!wrapper.querySelector('.hh-post-lock')) {
        var cost  = getCost(postId);
        var lock  = document.createElement('div');
        lock.className = 'hh-post-lock';
        lock.innerHTML =
          '<div class="hh-lock-icon">✦ LOCKED ✦</div>' +
          '<div class="hh-lock-label">unlock in story vault</div>' +
          '<div class="hh-lock-pts">' + cost + ' pts</div>';
        wrapper.appendChild(lock);
      }
    }
  }

  // Update all post wrappers on this page
  function updateAll() {
    var wrappers = document.querySelectorAll('.hh-post[data-post-id]');
    for (var i = 0; i < wrappers.length; i++) {
      applyState(wrappers[i]);
    }
  }

  // Listen for HH state events
  window.addEventListener('hhReady',  updateAll);
  window.addEventListener('hhUpdate', updateAll);

  // Run immediately in case HH already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAll);
  } else {
    updateAll();
  }

})();
