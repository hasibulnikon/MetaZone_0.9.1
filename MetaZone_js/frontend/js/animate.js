// Reusable animation helpers -- call these instead of writing ad-hoc
// class toggling in every feature file, so the whole app has one
// consistent animation vocabulary (per the "reusable animation
// system" requirement). Every helper here is opacity/transform only,
// runs in the 120-250ms range, and never delays the actual state
// change it's layered on top of -- callers still flip real state
// (hidden, textContent, etc.) immediately; these just make that
// change look smooth instead of jump-cutting.
const Animate = {
  // Restart a CSS animation class from scratch (works even if the
  // element already has the class from a previous run).
  _restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // force reflow so the browser notices the removal
    el.classList.add(cls);
  },

  fadeIn(el) { el.classList.remove('fade-out-target'); this._restart(el, 'fade-target'); },
  popIn(el) { this._restart(el, 'pop-in'); },
  fadeInUp(el) { this._restart(el, 'fade-in-up'); },

  // Fades an element out, then runs `onDone` (typically hiding it /
  // removing it from the DOM) once the animation actually finishes --
  // not on a hardcoded timer, so it never drifts out of sync with the
  // CSS duration if that's tuned later.
  fadeOut(el, onDone) {
    const handler = () => { el.removeEventListener('animationend', handler); if (onDone) onDone(); };
    el.addEventListener('animationend', handler);
    this._restart(el, 'fade-out');
  },

  // Page-level crossfade helpers used by nav.js: pure opacity fade,
  // no transform -- a whole page shifting position while fading read
  // as the old page "sliding down" as the new one appeared, so these
  // are deliberately plain fade in / fade out only.
  pageFadeIn(el) { el.classList.remove('page-fade-out'); this._restart(el, 'page-fade-in'); },
  pageFadeOut(el, onDone) {
    const handler = () => { el.removeEventListener('animationend', handler); if (onDone) onDone(); };
    el.addEventListener('animationend', handler);
    this._restart(el, 'page-fade-out');
  },

  // Opens a collapsible panel (e.g. Advanced Options) by adding the
  // "open" class the panel's own CSS transition (max-height/opacity)
  // is keyed off -- purely a class toggle, so it composes with
  // whatever transition duration that panel's CSS defines.
  panelOpen(el, openClass = 'open') { el.classList.add(openClass); },
  panelClose(el, openClass = 'open') { el.classList.remove(openClass); },

  // Assigns short, capped stagger delays to a batch of freshly-
  // inserted items so they animate in as a gentle wave instead of all
  // at once (which reads as a flash) or one-by-one (which reads as
  // sluggish for large batches). Caps at 8 steps -- anything beyond
  // that shares the last, still-short delay rather than continuing to
  // grow, so a 200-item batch doesn't take a full second to finish
  // appearing.
  staggerIn(items, animClass = 'fade-in-up', maxSteps = 8) {
    items.forEach((el, i) => {
      el.classList.add(`stagger-${Math.min(i, maxSteps - 1)}`);
      this._restart(el, animClass);
    });
  },

  // Brief "this value just changed" pulse -- used for status text,
  // counters, and match-count previews so updates read as a smooth
  // transition rather than a jump cut, without needing a full
  // fade-out/fade-in round trip for a one-line text swap.
  pulse(el) { this._restart(el, 'pulse-update'); },

  // Momentary confirmation flash on a drop target after a successful
  // drag-and-drop (or equivalent Browse-triggered) import.
  dropSuccess(el) { this._restart(el, 'drop-success'); },
};
