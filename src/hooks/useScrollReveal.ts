'use client'

import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal')

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          // 可选：一旦可见，就停止观察，以提高性能
          // observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.1 // 元素进入视口10%时触发
    })

    scrollRevealElements.forEach(el => {
      observer.observe(el)
    })

    return () => {
      scrollRevealElements.forEach(el => {
        observer.unobserve(el)
      })
    }
  }, [])
}