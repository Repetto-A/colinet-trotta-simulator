"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type TransitionEvent,
} from "react"

const SNAP_MS = 380
const SNAP_EASING = "cubic-bezier(0.25, 0.46, 0.45, 0.94)"

interface DragState {
  active: boolean
  startX: number
  startTranslate: number
  dragged: boolean
}

interface Bounds {
  min: number
  max: number
  stride: number
}

export function useHorizontalDragScroll(deps: unknown[] = []) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState>({ active: false, startX: 0, startTranslate: 0, dragged: false })
  const bounds = useRef<Bounds>({ min: 0, max: 0, stride: 272 })
  const translateRef = useRef(0)

  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const clamp = useCallback((value: number) => {
    const { min, max } = bounds.current
    return Math.max(min, Math.min(max, value))
  }, [])

  const snapTo = useCallback(
    (value: number) => {
      const { min, stride } = bounds.current
      if (stride <= 0) return clamp(value)

      const maxIndex = Math.max(0, Math.round(-min / stride))
      const index = Math.round(-value / stride)
      const clampedIndex = Math.max(0, Math.min(maxIndex, index))
      return clamp(-clampedIndex * stride)
    },
    [clamp],
  )

  const measure = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const children = track.children
    let stride = 272
    if (children.length >= 2) {
      const first = children[0] as HTMLElement
      const second = children[1] as HTMLElement
      stride = second.offsetLeft - first.offsetLeft
    } else if (children.length === 1) {
      stride = (children[0] as HTMLElement).offsetWidth
    }

    const trackWidth = track.scrollWidth
    const viewportWidth = viewport.clientWidth
    const min = Math.min(0, viewportWidth - trackWidth)

    bounds.current = { min, max: 0, stride }

    const clamped = clamp(translateRef.current)
    translateRef.current = clamped
    setTranslateX(clamped)
  }, [clamp])

  useEffect(() => {
    measure()
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport) return

    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    if (track) observer.observe(track)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps])

  useEffect(() => {
    translateRef.current = translateX
  }, [translateX])

  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("button, a, input, textarea")) return

    const track = trackRef.current
    if (!track) return

    drag.current = {
      active: true,
      startX: event.clientX,
      startTranslate: translateRef.current,
      dragged: false,
    }
    setIsDragging(true)
    setIsAnimating(false)
    track.setPointerCapture(event.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!drag.current.active) return

      const delta = event.clientX - drag.current.startX
      if (Math.abs(delta) > 4) drag.current.dragged = true

      const next = clamp(drag.current.startTranslate + delta)
      translateRef.current = next
      setTranslateX(next)
    },
    [clamp],
  )

  const finishDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!drag.current.active || !trackRef.current) return

      const didDrag = drag.current.dragged
      drag.current.active = false
      setIsDragging(false)
      trackRef.current.releasePointerCapture(event.pointerId)

      if (!didDrag) return

      const snapped = snapTo(translateRef.current)
      translateRef.current = snapped
      setIsAnimating(true)
      setTranslateX(snapped)
    },
    [snapTo],
  )

  const onTransitionEnd = useCallback((event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform") return
    setIsAnimating(false)
  }, [])

  const scrollBy = useCallback(
    (delta: number) => {
      const { stride } = bounds.current
      if (stride <= 0) return

      const direction = delta > 0 ? -1 : 1
      const next = snapTo(translateRef.current + direction * stride)
      translateRef.current = next
      setIsAnimating(true)
      setTranslateX(next)
    },
    [snapTo],
  )

  const wasDragged = useCallback(() => {
    const value = drag.current.dragged
    drag.current.dragged = false
    return value
  }, [])

  const trackStyle: CSSProperties = {
    transform: `translate3d(${translateX}px, 0, 0)`,
    transition: isAnimating ? `transform ${SNAP_MS}ms ${SNAP_EASING}` : undefined,
    willChange: isDragging || isAnimating ? "transform" : undefined,
    touchAction: isDragging ? "none" : "pan-y",
  }

  return {
    viewportRef,
    trackRef,
    trackStyle,
    isDragging,
    scrollBy,
    wasDragged,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      onTransitionEnd,
    },
  }
}
