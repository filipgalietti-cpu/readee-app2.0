export type ProgressState = { visible: boolean; width: number; fading: boolean };

/** One navigation owns every timer, including the previous completion fade. */
export function createRouteProgress(publish: (state: ProgressState) => void, reducedMotion = false) {
  let state: ProgressState = { visible: false, width: 0, fading: false };
  let active = false;
  let timers: ReturnType<typeof setTimeout>[] = [];
  let crawl: ReturnType<typeof setInterval> | undefined;
  const emit = (next: ProgressState) => { state = next; publish(next); };
  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
    clearInterval(crawl);
    crawl = undefined;
  };
  const finish = () => {
    if (!active) return;
    active = false;
    clear();
    if (!state.visible) return;
    emit({ visible: true, width: 100, fading: false });
    timers.push(setTimeout(() => {
      emit({ ...state, fading: true });
      timers.push(setTimeout(() => emit({ visible: false, width: 0, fading: false }), reducedMotion ? 0 : 200));
    }, 120));
  };
  return {
    start() {
      clear();
      active = true;
      const show = () => {
        emit({ visible: true, width: reducedMotion ? 90 : Math.min(80, state.width || 8), fading: false });
        if (!reducedMotion) crawl = setInterval(() => emit({ ...state, width: Math.min(80, state.width + (state.width < 40 ? 8 : 2)) }), 240);
      };
      if (state.visible) show();
      else timers.push(setTimeout(show, 180));
      timers.push(setTimeout(finish, 8000));
    },
    finish,
    dispose() { active = false; clear(); },
  };
}
