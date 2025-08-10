type NProgressSettings = {
  minimum: number;
  easing?: string;
  positionUsing?: string;
  speed?: number;
  trickle?: boolean;
  trickleSpeed?: number;
  barSelector: string;
  spinnerSelector?: string;
  parent: string;
  template: string;
};

/**
 * A TypeScript implementation of NProgress — a lightweight progress bar for web applications.
 *
 * This class provides a singleton-based API to visualize loading states with a slim progress bar
 * and optional spinner at the top of the page. It is inspired by the original NProgress library
 * and a previously written typescript implementation:
 * https://github.com/rstacruz/nprogress/issues/253
 *
 * @remarks
 * - The progress bar is rendered using a customizable HTML template.
 * - Tailored for use in SPAs and client-side navigation.
 * - Designed to be used via `NProgress.getInstance()` or the default export.
 *
 * @example
 * ```ts
 * import NProgress from './NProgress';
 *
 * NProgress.configure({ speed: 300 });
 * NProgress.start();
 * // ...some async operation
 * NProgress.done();
 * ```
 */
export class NProgress {
  private static instance: NProgress;
  private status: number | null = null;

  // Default settings
  private settings: NProgressSettings = {
    minimum: 0.08,
    easing: 'linear',
    positionUsing: '',
    speed: 200,
    trickle: true,
    trickleSpeed: 200,
    barSelector: '[role="bar"]',
    spinnerSelector: '[role="spinner"]',
    parent: 'body',
    template: `
  <div class="fixed top-0 left-0 w-full h-0.5 bg-primary z-[1031] pointer-events-none" role="bar">
    <div class="absolute right-0 w-[100px] h-full opacity-100 shadow-[0_0_10px_#29d,0_0_5px_#29d] shadow-accent transform rotate-3 -translate-y-1" role="peg"></div>
  </div>
`,
  };

  private constructor() {}

  /**
   * Returns the singleton instance of NProgress.
   */
  public static getInstance() {
    if (!NProgress.instance) {
      NProgress.instance = new NProgress();
    }
    return NProgress.instance;
  }

  /**
   * Updates the configuration settings.
   *
   * @param options - Partial settings to override defaults.
   * @returns The NProgress instance for chaining.
   */
  public configure(options: Partial<NProgressSettings>) {
    Object.assign(this.settings, options);
    return this;
  }

  /**
   * Starts the progress bar animation.
   * If trickling is enabled, it will periodically increment.
   */
  public start(): NProgress {
    if (!this.status) this.set(0);

    const work = () => {
      setTimeout(() => {
        if (!this.status) return;
        this.trickle();
        work();
      }, this.settings.trickleSpeed);
    };

    if (this.settings.trickle) work();
    return this;
  }

  /**
   * Sets the progress bar to a specific value.
   *
   * @param n - A number between 0 and 1 representing progress.
   */
  public set(n: number): NProgress {
    n = this.clamp(n, this.settings.minimum || 0.08, 1);
    this.status = n === 1 ? null : n;

    const progress = this.render();
    const bar = progress.querySelector<HTMLElement>(this.settings.barSelector);
    const speed = this.settings.speed || 200;
    const ease = this.settings.easing || 'linear';

    if (bar) {
      this.applyCss(bar, this.barPositionCSS(n, speed, ease));
    }

    if (n === 1) {
      setTimeout(() => {
        this.remove();
      }, speed);
    }

    return this;
  }

  /**
   * Completes the progress bar animation.
   *
   * @param force - If true, forces completion even if not started.
   */
  public done(force = false): NProgress {
    if (!force && !this.status) return this;
    return this.inc(0.3 + 0.5 * Math.random()).set(1);
  }

  /**
   * Increments the progress bar by a calculated or specified amount.
   *
   * @param amount - Optional increment value.
   */
  public inc(amount?: number): NProgress {
    const n = this.status ?? 0;

    if (n >= 1) return this;
    amount =
      amount ?? (n < 0.2 ? 0.1 : n < 0.5 ? 0.04 : n < 0.8 ? 0.02 : 0.005);

    return this.set(this.clamp(n + amount, 0, 0.994));
  }

  /**
   * Performs a single trickle increment.
   */
  public trickle(): NProgress {
    return this.inc();
  }

  /** Checks if the progress bar has started */
  private isStarted(): boolean {
    return typeof this.status === 'number';
  }

  /** Renders the progress bar DOM element */
  private render(): HTMLElement {
    if (this.isRendered()) return document.getElementById('nprogress')!;

    const progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = this.settings.template;

    document.querySelector(this.settings.parent)!.appendChild(progress);
    return progress;
  }

  /** Removes the progress bar from the DOM */
  private remove(): void {
    const progress = document.getElementById('nprogress');
    progress?.parentNode?.removeChild(progress);
  }

  /** Checks if the progress bar is already rendered */
  private isRendered(): boolean {
    return !!document.getElementById('nprogress');
  }

  /** Clamps a number between min and max */
  private clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
  }

  /** Generates CSS styles for bar transition */
  private barPositionCSS(
    n: number,
    speed: number,
    ease: string,
  ): Record<string, string> {
    return {
      transform: `translate3d(${(-1 + n) * 100}%,0,0)`,
      transition: `all ${speed}ms ${ease}`,
    };
  }

  /** Applies inline styles to an element */
  private applyCss(element: HTMLElement, styles: Record<string, string>): void {
    Object.assign(element.style, styles);
  }
}

export default NProgress.getInstance();
