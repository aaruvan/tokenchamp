import React, { useRef } from 'react'

export function CardContainer({ children, className = '', containerClassName = '' }) {
  const ref = useRef(null)

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - py) * 10
    const ry = (px - 0.5) * 12
    el.style.setProperty('--rx', `${rx}deg`)
    el.style.setProperty('--ry', `${ry}deg`)
    el.style.setProperty('--tx', `${(px - 0.5) * 6}px`)
    el.style.setProperty('--ty', `${(py - 0.5) * 6}px`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', `0deg`)
    el.style.setProperty('--ry', `0deg`)
    el.style.setProperty('--tx', `0px`)
    el.style.setProperty('--ty', `0px`)
  }

  return (
    <div className={`threed-outer ${containerClassName}`}>
      <div
        ref={ref}
        className={`threed-container ${className}`}
        onMouseMove={onMouseMove}
        onMouseLeave={onLeave}
      >
        {children}
      </div>
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`threed-body ${className}`}>
      {children}
    </div>
  )
}

export function CardItem({ children, className = '', translateX = 0, translateY = 0, translateZ = 0, rotateX = 0, rotateY = 0, rotateZ = 0, as, href, target, ...rest }) {
  const Comp = as || 'div'
  const tz = typeof translateZ === 'string' ? translateZ : `${translateZ}px`
  const tx = typeof translateX === 'string' ? translateX : `${translateX}px`
  const ty = typeof translateY === 'string' ? translateY : `${translateY}px`
  const rx = typeof rotateX === 'string' ? rotateX : `${rotateX}deg`
  const ry = typeof rotateY === 'string' ? rotateY : `${rotateY}deg`
  const rz = typeof rotateZ === 'string' ? rotateZ : `${rotateZ}deg`
  const style = {
    transform: `translate3d(${tx}, ${ty}, ${tz}) rotateX(${rx}) rotateY(${ry}) rotateZ(${rz})`,
    transformStyle: 'preserve-3d',
    willChange: 'transform'
  }
  return (
    <Comp className={`threed-item ${className}`} style={style} href={href} target={target} {...rest}>
      {children}
    </Comp>
  )
}


