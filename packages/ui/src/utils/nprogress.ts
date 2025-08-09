/**
 * Typescript implementation of NProgress.
 * https://github.com/rstacruz/nprogress/issues/253
 *
 * NProgress is a lightweight progress bar for JS applications.
 * It provides a simple way to visualize loading states with a slim progress bar at the top of the page.
 *
 * This is implemented as a singleton, so you should access it via NProgress.getInstance() or use the default export.
 *
 * @example
 * // Start the progress bar
 * NProgress.start();
 *
 * // Set progress to 50%
 * NProgress.set(0.5);
 *
 * // Increment the progress bar
 * NProgress.inc();
 *
 * // Complete the progress
 * NProgress.done();
 *
 * // Configure options
 * NProgress.configure({ speed: 200 });
 * 
 * 
 * To add a spinner, use the template
 *  template: `
  <div class="fixed top-0 left-0 w-full h-0.5 bg-primary z-[1031] pointer-events-none" role="bar">
    <div class="absolute right-0 w-[100px] h-full opacity-100 shadow-[0_0_10px_#29d,0_0_5px_#29d] shadow-accent transform rotate-3 -translate-y-1" role="peg"></div>
  </div>
  <div class="fixed top-4 right-4 w-5 h-5 border-2 border-transparent border-t-primary border-l-primary rounded-full animate-spin z-[1031]" role="spinner">
    <div class="spinner-icon"></div>
  </div>
`,
 */

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

  public static getInstance() {
    if (!NProgress.instance) {
      NProgress.instance = new NProgress();
    }
    return NProgress.instance;
  }

  public configure(options: Partial<NProgressSettings>) {
    Object.assign(this.settings, options);
    return this;
  }

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

  public set(n: number): NProgress {
    const started = this.isStarted();
    n = this.clamp(n, this.settings.minimum || 0.08, 1);
    this.status = n === 1 ? null : n;

    const progress = this.render(!started);
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

  public done(force = false): NProgress {
    if (!force && !this.status) return this;
    return this.inc(0.3 + 0.5 * Math.random()).set(1);
  }

  public inc(amount?: number): NProgress {
    const n = this.status ?? 0;

    if (n >= 1) return this;
    amount =
      amount ?? (n < 0.2 ? 0.1 : n < 0.5 ? 0.04 : n < 0.8 ? 0.02 : 0.005);

    return this.set(this.clamp(n + amount, 0, 0.994));
  }

  public trickle(): NProgress {
    return this.inc();
  }

  private isStarted(): boolean {
    return typeof this.status === 'number';
  }

  private render(fromStart = false): HTMLElement {
    if (this.isRendered()) return document.getElementById('nprogress')!;

    const progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = this.settings.template;

    document.querySelector(this.settings.parent)!.appendChild(progress);
    return progress;
  }

  private remove(): void {
    const progress = document.getElementById('nprogress');
    progress?.parentNode?.removeChild(progress);
  }

  private isRendered(): boolean {
    return !!document.getElementById('nprogress');
  }

  private clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
  }

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

  private applyCss(element: HTMLElement, styles: Record<string, string>): void {
    Object.assign(element.style, styles);
  }
}

export default NProgress.getInstance();
