import React, { useRef, useEffect } from 'react';

export interface RefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  multiColor?: boolean;
}

const CHROMIUM_SPEC = {
  CIRCLE_DIAMETER: 40,
  CENTER_RADIUS: 7.5,
  STROKE_WIDTH: 2.5,
  ARROW_WIDTH: 10,
  ARROW_HEIGHT: 5,
  DEFAULT_CIRCLE_TARGET: 64,
  ORIGINAL_OFFSET_TOP: -40,
  DRAG_RATE: 0.5,
  MAX_PROGRESS_ARC: 0.8,
  MIN_PROGRESS_ARC: 0.01,
  STARTING_PROGRESS_ALPHA: 0.3,
  MAX_ALPHA: 1.0,
  SCALE_DOWN_DURATION: 150,
  ANIMATE_TO_TRIGGER_DURATION: 200,
  ANIMATE_TO_START_DURATION: 200,
  SPINNER_CYCLE_DURATION: 1332,
  DECELERATE_FACTOR: 2.0,
  COLORS_CHROME_DARK: ['#8AB4F8'],
  COLORS_GOOGLE_MULTI: ['#4285F4', '#EA4335', '#FBBC05', '#34A853']
};

function fastOutSlowIn(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const x1 = 0.4, y1 = 0.0, x2 = 0.2, y2 = 1.0;
  let u = t;
  for (let i = 0; i < 6; i++) {
    const currentX = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
    const derivativeX = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(derivativeX) < 1e-6) break;
    u -= currentX / derivativeX;
  }
  return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
}

function decelerateInterpolator(input: number, factor: number = CHROMIUM_SPEC.DECELERATE_FACTOR): number {
  return 1.0 - Math.pow(1.0 - input, 2 * factor);
}

function evaluateColor(fraction: number, startHex: string, endHex: string): string {
  const s = parseInt(startHex.slice(1), 16);
  const e = parseInt(endHex.slice(1), 16);
  const sr = (s >> 16) & 255, sg = (s >> 8) & 255, sb = s & 255;
  const er = (e >> 16) & 255, eg = (e >> 8) & 255, eb = e & 255;
  const r = Math.round(sr + fraction * (er - sr));
  const g = Math.round(sg + fraction * (eg - sg));
  const b = Math.round(sb + fraction * (eb - sb));
  return `rgb(${r}, ${g}, ${b})`;
}

export const Refresh: React.FC<RefreshProps> = ({
  onRefresh,
  children,
  className = '',
  disabled = false,
  multiColor = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const ringGroupRef = useRef<SVGGElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPolygonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onRefreshRef = useRef(onRefresh);
  const disabledRef = useRef(disabled);
  const multiColorRef = useRef(multiColor);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    multiColorRef.current = multiColor;
  }, [multiColor]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const circleEl = circleRef.current;
    const arcEl = arcRef.current;
    const arrowEl = arrowRef.current;
    const glowEl = glowRef.current;

    if (!scrollContainer || !circleEl || !arcEl || !arrowEl) return;

    let mIsBeingDragged = false;
    let mRefreshing = false;
    let mCurrentTargetOffsetTop = CHROMIUM_SPEC.ORIGINAL_OFFSET_TOP;
    let mInitialDownY = 0;
    let mInitialDownX = 0;
    let mInitialMotionY = 0;

    const ring = {
      startTrim: 0,
      endTrim: 0,
      rotation: 0,
      arrowScale: 1,
      showArrow: false,
      alpha: CHROMIUM_SPEC.STARTING_PROGRESS_ALPHA,
      color: CHROMIUM_SPEC.COLORS_CHROME_DARK[0]
    };

    let colorIndex = 0;
    let rotationCount = 0;
    let spinnerAnimFrame = 0;
    let transitionAnimFrame = 0;

    const getPalette = () =>
      multiColorRef.current ? CHROMIUM_SPEC.COLORS_GOOGLE_MULTI : CHROMIUM_SPEC.COLORS_CHROME_DARK;

    const renderRing = () => {
      const cx = 20;
      const cy = 20;
      const r = CHROMIUM_SPEC.CENTER_RADIUS;

      const startAngleDeg = (ring.startTrim + ring.rotation) * 360;
      const endAngleDeg = (ring.endTrim + ring.rotation) * 360;
      let sweepAngleDeg = endAngleDeg - startAngleDeg;

      if (sweepAngleDeg < 0.5 && (mIsBeingDragged || mRefreshing)) {
        sweepAngleDeg = 1.5;
      }

      if (sweepAngleDeg <= 0.1) {
        arcEl.setAttribute('d', '');
        arrowEl.style.display = 'none';
        return;
      }

      const startRad = (startAngleDeg * Math.PI) / 180;
      const endRad = ((startAngleDeg + sweepAngleDeg) * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArcFlag = sweepAngleDeg > 180 ? 1 : 0;
      const pathData = `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;

      arcEl.setAttribute('d', pathData);
      arcEl.setAttribute('stroke', ring.color);
      arcEl.setAttribute('stroke-opacity', ring.alpha.toFixed(3));
      arcEl.setAttribute('stroke-linecap', 'square');

      if (ring.showArrow && ring.arrowScale > 0.01) {
        arrowEl.style.display = 'block';
        const scale = ring.arrowScale;
        const aw = CHROMIUM_SPEC.ARROW_WIDTH * scale;
        const ah = CHROMIUM_SPEC.ARROW_HEIGHT * scale;

        const tipAngleDeg = startAngleDeg + sweepAngleDeg;
        const adjustedTipRad = ((tipAngleDeg - 2 * scale) * Math.PI) / 180;
        const ax = cx + r * Math.cos(adjustedTipRad);
        const ay = cy + r * Math.sin(adjustedTipRad);

        const halfW = aw / 2;
        const p1 = { x: -halfW, y: 0 };
        const p2 = { x: halfW, y: 0 };
        const p3 = { x: 0, y: ah };

        const cosA = Math.cos(adjustedTipRad);
        const sinA = Math.sin(adjustedTipRad);

        const transformPt = (pt: { x: number; y: number }) => ({
          x: ax + (pt.x * cosA - pt.y * sinA),
          y: ay + (pt.x * sinA + pt.y * cosA)
        });

        const tp1 = transformPt(p1);
        const tp2 = transformPt(p2);
        const tp3 = transformPt(p3);

        arrowEl.setAttribute(
          'points',
          `${tp1.x.toFixed(2)},${tp1.y.toFixed(2)} ${tp2.x.toFixed(2)},${tp2.y.toFixed(2)} ${tp3.x.toFixed(2)},${tp3.y.toFixed(2)}`
        );
        arrowEl.setAttribute('fill', ring.color);
        arrowEl.setAttribute('fill-opacity', ring.alpha.toFixed(3));
      } else {
        arrowEl.style.display = 'none';
      }
    };

    const setCirclePositionAndScale = (targetTopPx: number, scale = 1) => {
      mCurrentTargetOffsetTop = targetTopPx;
      const translateY = targetTopPx - CHROMIUM_SPEC.ORIGINAL_OFFSET_TOP;
      circleEl.style.transform = `translate(-50%, ${translateY.toFixed(2)}px) scale(${scale.toFixed(3)})`;
    };

    const resetToIdle = () => {
      cancelAnimationFrame(spinnerAnimFrame);
      cancelAnimationFrame(transitionAnimFrame);
      mIsBeingDragged = false;
      mRefreshing = false;
      ring.startTrim = 0;
      ring.endTrim = 0;
      ring.rotation = 0;
      ring.arrowScale = 0;
      ring.showArrow = false;
      ring.alpha = CHROMIUM_SPEC.STARTING_PROGRESS_ALPHA;
      setCirclePositionAndScale(CHROMIUM_SPEC.ORIGINAL_OFFSET_TOP, 1);
      renderRing();
    };

    const startScaleDownAnimation = () => {
      cancelAnimationFrame(spinnerAnimFrame);
      cancelAnimationFrame(transitionAnimFrame);

      const startTime = performance.now();
      const currentY = mCurrentTargetOffsetTop;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / CHROMIUM_SPEC.SCALE_DOWN_DURATION);
        const scale = 1 - t;

        setCirclePositionAndScale(currentY, scale);

        if (t < 1) {
          transitionAnimFrame = requestAnimationFrame(step);
        } else {
          resetToIdle();
        }
      };

      transitionAnimFrame = requestAnimationFrame(step);
    };

    const startIndeterminateSpinner = () => {
      cancelAnimationFrame(spinnerAnimFrame);

      ring.showArrow = false;
      ring.alpha = 1.0;

      const palette = getPalette();
      let cycleStartTime = performance.now();
      let storedStartTrim = 0;
      let storedEndTrim = 0.01;
      let storedRotation = ring.rotation;
      rotationCount = 0;
      colorIndex = 0;
      ring.color = palette[0];

      const maxArc = CHROMIUM_SPEC.MAX_PROGRESS_ARC - CHROMIUM_SPEC.MIN_PROGRESS_ARC;

      const animateCycle = (now: number) => {
        if (!mRefreshing) return;

        const currentPalette = getPalette();
        let elapsed = now - cycleStartTime;

        if (elapsed >= CHROMIUM_SPEC.SPINNER_CYCLE_DURATION) {
          const cyclesPassed = Math.floor(elapsed / CHROMIUM_SPEC.SPINNER_CYCLE_DURATION);
          cycleStartTime += cyclesPassed * CHROMIUM_SPEC.SPINNER_CYCLE_DURATION;
          elapsed = now - cycleStartTime;

          storedStartTrim = ring.endTrim;
          storedEndTrim = ring.endTrim;
          storedRotation = (storedRotation + 0.20999999) % 1;
          rotationCount = (rotationCount + 1) % 5;
          colorIndex = (colorIndex + 1) % currentPalette.length;
          ring.color = currentPalette[colorIndex];
        }

        const renderTime = elapsed / CHROMIUM_SPEC.SPINNER_CYCLE_DURATION;

        let startTrim = storedStartTrim;
        let endTrim = storedEndTrim;

        if (renderTime <= 0.5) {
          const scaledTime = renderTime / 0.5;
          endTrim = storedEndTrim + maxArc * fastOutSlowIn(scaledTime);
        }

        if (renderTime > 0.5) {
          const scaledTime = (renderTime - 0.5) / 0.5;
          endTrim = storedEndTrim + maxArc;
          startTrim = storedStartTrim + maxArc * fastOutSlowIn(scaledTime);
        }

        if (currentPalette.length > 1 && renderTime > 0.75) {
          const colorFraction = (renderTime - 0.75) / 0.25;
          const currentColor = currentPalette[colorIndex];
          const nextColor = currentPalette[(colorIndex + 1) % currentPalette.length];
          ring.color = evaluateColor(colorFraction, currentColor, nextColor);
        }

        const ringRotation = storedRotation + 0.20999999 * renderTime;
        const groupRotationTurns = 0.6 * (renderTime + rotationCount);

        ring.startTrim = startTrim;
        ring.endTrim = endTrim;
        ring.rotation = ringRotation + groupRotationTurns;

        renderRing();

        spinnerAnimFrame = requestAnimationFrame(animateCycle);
      };

      spinnerAnimFrame = requestAnimationFrame(animateCycle);
    };

    const setRefreshing = (refreshing: boolean, notify: boolean) => {
      if (mRefreshing !== refreshing) {
        mRefreshing = refreshing;
        if (mRefreshing) {
          animateOffsetToCorrectPosition(notify);
        } else {
          startScaleDownAnimation();
        }
      }
    };

    const animateOffsetToCorrectPosition = (notify: boolean) => {
      cancelAnimationFrame(transitionAnimFrame);
      const fromY = mCurrentTargetOffsetTop;
      const targetEnd = CHROMIUM_SPEC.DEFAULT_CIRCLE_TARGET + CHROMIUM_SPEC.ORIGINAL_OFFSET_TOP;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / CHROMIUM_SPEC.ANIMATE_TO_TRIGGER_DURATION);
        const interpolated = decelerateInterpolator(t);
        const currentY = fromY + (targetEnd - fromY) * interpolated;

        setCirclePositionAndScale(currentY, 1);

        if (t < 1) {
          transitionAnimFrame = requestAnimationFrame(step);
        } else {
          startIndeterminateSpinner();
          if (notify) {
            Promise.resolve(onRefreshRef.current()).finally(() => {
              setRefreshing(false, false);
            });
          }
        }
      };

      transitionAnimFrame = requestAnimationFrame(step);
    };

    const animateOffsetToStartPosition = () => {
      cancelAnimationFrame(transitionAnimFrame);
      const fromY = mCurrentTargetOffsetTop;
      const targetStart = CHROMIUM_SPEC.ORIGINAL_OFFSET_TOP;
      const startTrimFrom = ring.startTrim;
      const endTrimFrom = ring.endTrim;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / CHROMIUM_SPEC.ANIMATE_TO_START_DURATION);
        const interpolated = decelerateInterpolator(t);
        const currentY = fromY + (targetStart - fromY) * interpolated;

        ring.endTrim = endTrimFrom * (1 - interpolated);
        ring.startTrim = startTrimFrom * (1 - interpolated);
        ring.arrowScale = 1 - interpolated;

        setCirclePositionAndScale(currentY, 1);
        renderRing();

        if (t < 1) {
          transitionAnimFrame = requestAnimationFrame(step);
        } else {
          resetToIdle();
        }
      };

      transitionAnimFrame = requestAnimationFrame(step);
    };

    const moveSpinner = (overscrollTop: number) => {
      const mTotalDragDistance = CHROMIUM_SPEC.DEFAULT_CIRCLE_TARGET;
      const slingshotDist = CHROMIUM_SPEC.DEFAULT_CIRCLE_TARGET;

      ring.showArrow = true;

      const originalDragPercent = overscrollTop / mTotalDragDistance;
      const dragPercent = Math.min(1.0, Math.abs(originalDragPercent));
      const adjustedPercent = (Math.max(dragPercent - 0.4, 0) * 5) / 3;

      const extraOS = Math.abs(overscrollTop) - mTotalDragDistance;
      const tensionSlingshotPercent = Math.max(0, Math.min(extraOS, slingshotDist * 2) / slingshotDist);
      const tensionPercent = (tensionSlingshotPercent / 4 - Math.pow(tensionSlingshotPercent / 4, 2)) * 2;
      const extraMove = slingshotDist * tensionPercent * 2;

      const targetY = CHROMIUM_SPEC.ORIGINAL_OFFSET_TOP + Math.floor(slingshotDist * dragPercent + extraMove);

      if (dragPercent >= 1.0) {
        ring.alpha = CHROMIUM_SPEC.MAX_ALPHA;
      } else {
        ring.alpha =
          CHROMIUM_SPEC.STARTING_PROGRESS_ALPHA +
          (CHROMIUM_SPEC.MAX_ALPHA - CHROMIUM_SPEC.STARTING_PROGRESS_ALPHA) * Math.min(1, adjustedPercent);
      }

      const strokeProgress = adjustedPercent * CHROMIUM_SPEC.MAX_PROGRESS_ARC;
      ring.startTrim = 0;
      ring.endTrim = Math.min(CHROMIUM_SPEC.MAX_PROGRESS_ARC, strokeProgress);
      ring.arrowScale = Math.min(1.0, adjustedPercent);
      ring.rotation = (-0.25 + 0.4 * adjustedPercent + tensionPercent * 2) * 0.5;
      ring.color = getPalette()[0];

      setCirclePositionAndScale(targetY, 1);
      renderRing();

      if (glowEl) {
        const glowOpacity = Math.min(1, Math.max(0, (overscrollTop - 30) / 90));
        glowEl.style.opacity = glowOpacity.toFixed(2);
      }
    };

    const finishSpinner = (overscrollTop: number) => {
      if (glowEl) {
        glowEl.style.opacity = '0';
      }

      if (overscrollTop > CHROMIUM_SPEC.DEFAULT_CIRCLE_TARGET) {
        setRefreshing(true, true);
      } else {
        mRefreshing = false;
        animateOffsetToStartPosition();
      }
    };

    const touchSlop = 6;
    const canChildScrollUp = () => scrollContainer.scrollTop > 0;

    const onStart = (clientY: number, clientX: number) => {
      if (disabledRef.current || mRefreshing || canChildScrollUp()) return;
      mIsBeingDragged = false;
      mInitialDownY = clientY;
      mInitialDownX = clientX;
    };

    const onMove = (clientY: number, clientX: number, event?: Event) => {
      if (disabledRef.current || mRefreshing || canChildScrollUp()) return;
      const yDiff = clientY - mInitialDownY;
      const xDiff = Math.abs(clientX - mInitialDownX);

      if (!mIsBeingDragged) {
        if (yDiff > touchSlop && yDiff > xDiff) {
          mInitialMotionY = mInitialDownY + touchSlop;
          mIsBeingDragged = true;
        } else {
          return;
        }
      }

      if (mIsBeingDragged) {
        if (event && event.cancelable) event.preventDefault();
        const overscrollTop = Math.max(0, (clientY - mInitialMotionY) * CHROMIUM_SPEC.DRAG_RATE);
        moveSpinner(overscrollTop);
      }
    };

    const onEnd = (clientY: number) => {
      if (!mIsBeingDragged) return;
      mIsBeingDragged = false;
      const overscrollTop = Math.max(0, (clientY - mInitialMotionY) * CHROMIUM_SPEC.DRAG_RATE);
      finishSpinner(overscrollTop);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      onStart(e.touches[0].clientY, e.touches[0].clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      onMove(e.touches[0].clientY, e.touches[0].clientX, e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touch) onEnd(touch.clientY);
    };

    const handleTouchCancel = () => {
      if (mIsBeingDragged) {
        mIsBeingDragged = false;
        finishSpinner(0);
      }
    };

    let isMouseDown = false;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isMouseDown = true;
      onStart(e.clientY, e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      onMove(e.clientY, e.clientX, e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      onEnd(e.clientY);
    };

    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    scrollContainer.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    scrollContainer.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    renderRing();

    return () => {
      cancelAnimationFrame(spinnerAnimFrame);
      cancelAnimationFrame(transitionAnimFrame);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
      scrollContainer.removeEventListener('touchcancel', handleTouchCancel);
      scrollContainer.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className={`relative flex-1 overflow-hidden flex flex-col w-full h-full ${className}`}>
      <div
        ref={circleRef}
        aria-hidden="true"
        className="absolute left-1/2 z-30 w-[40px] h-[40px] rounded-full bg-[#303134] flex items-center justify-center pointer-events-none will-change-transform"
        style={{
          top: '-40px',
          transform: 'translate(-50%, 0px) scale(1)',
          boxShadow: '0 3px 6px 0 rgba(0, 0, 0, 0.48), 0 1px 12px 0 rgba(0, 0, 0, 0.38), inset 0 0 0 1px rgba(255, 255, 255, 0.07)'
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="overflow-visible"
        >
          <g ref={ringGroupRef} transform="rotate(0 20 20)">
            <path
              ref={arcRef}
              fill="none"
              stroke="#8AB4F8"
              strokeWidth="2.5"
              strokeLinecap="square"
              d=""
            />
            <polygon
              ref={arrowRef}
              fill="#8AB4F8"
              points="0,0 0,0 0,0"
            />
          </g>
        </svg>
      </div>

      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-16 z-20 opacity-0 transition-opacity duration-150"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(138, 180, 248, 0.16) 0%, transparent 70%)'
        }}
      />

      <div
        ref={scrollContainerRef}
        className="flex-1 w-full h-full overflow-y-auto overscroll-y-contain"
        style={{ touchAction: 'pan-y' }}
      >
        {children}
      </div>
    </div>
  );
};
