// ═══════════════════════════════════════════════════
// content/ch1.js — Chapter 1
//
// HOW TO ADD A NEW CHAPTER:
//   1. Copy this file, rename it (e.g. ch3.js)
//   2. Change id, type, label, sub, cost
//   3. Replace the content HTML between the backticks
//   4. Upload to GitHub
//   5. Add a <script src="...ch3.js"> tag in chapter-menu.html
//   6. Add the metadata entry in hud.js CHAPTERS array
// ═══════════════════════════════════════════════════

(function () {
  window.HH_CONTENT = window.HH_CONTENT || [];
  window.HH_CONTENT.push({

    id:    'ch1',        // must match id in hud.js CHAPTERS array
    type:  'chapter',   // 'chapter' or 'fanfic'
    label: 'Chapter 1',
    sub:   'something between us',
    cost:  10,

    // ── Write your chapter content below ──
    // Use <p> for paragraphs, <em> for italic, <strong> for bold
    // Use <div class="sv-divider">· · ✦ · ·</div> for section breaks
    content: `
      <p>It started the way most things between them did — quietly, without announcement.
      <em>She had been nine years old the first time she noticed him.</em></p>

      <p>He was sitting on the steps of his mother's store with a book open in his lap, but not
      reading it. He watched a cat across the street with the patient attention of someone who
      had nowhere else to be.</p>

      <div class="sv-divider">· · ✦ · ·</div>

      <p><strong>She had thought:</strong> <em>That kid is very strange.</em> Then she went
      inside to buy candy and thought nothing of it for three days — at which point she realized
      she was watching for him every morning on her way to school.</p>

      <p>The first time he actually spoke to her, she nearly stepped on him. He was crouched on
      the pavement looking at an old coin, corroded green at the edges.
      <em>"Found it in the drain,"</em> he said, without looking up. She said
      <em>"That's disgusting"</em> and kept walking. He laughed — the kind that sounded like
      he wasn't sure he was allowed to.</p>
    `

  });
})();
