import { useRef, useLayoutEffect } from 'react'
import twemoji from 'twemoji'

const TWEMOJI_OPTIONS = {
  folder: 'svg',
  ext: '.svg',
  base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
  className: 'emoji-img',
}

export default function TwemojiWrapper({ children }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    // Parse everything already in the DOM
    twemoji.parse(el, TWEMOJI_OPTIONS)

    // Watch for any nodes added later (Leaflet markers, popups, lazy-loaded pages, etc.)
    const observer = new MutationObserver(mutations => {
      for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            twemoji.parse(node, TWEMOJI_OPTIONS)
          }
        }
      }
    })

    observer.observe(el, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} style={{ display: 'contents' }}>{children}</div>
}
