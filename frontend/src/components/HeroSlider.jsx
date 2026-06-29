import React, {useEffect, useState} from 'react'

export default function HeroSlider(){
  const [slides, setSlides] = useState([])
  const [index, setIndex] = useState(0)

  useEffect(()=>{
    // fetch slides from API
    fetch('/api/slides')
      .then(r=>r.json())
      .then(data => {
        const s = data.map((m,i)=>{
          let url = m.src || `https://via.placeholder.com/1200x600?text=${encodeURIComponent(m.caption || 'Slide')}`
          return { src: url, alt: m.caption || `Slide ${i+1}` }
        })
        if (s.length===0){
          s.push({src:'https://via.placeholder.com/1200x600?text=Slide+1', alt:'Slide 1'})
          s.push({src:'https://via.placeholder.com/1200x600?text=Slide+2', alt:'Slide 2'})
        }
        setSlides(s)
      })
      .catch(()=>{
        setSlides([
          {src:'https://via.placeholder.com/1200x600?text=Slide+1', alt:'Slide 1'},
          {src:'https://via.placeholder.com/1200x600?text=Slide+2', alt:'Slide 2'}
        ])
      })
  },[])

  useEffect(()=>{
    if (!slides.length) return
    const t = setInterval(()=> setIndex(i=> (i+1) % slides.length), 5000)
    return ()=> clearInterval(t)
  },[slides])

  const prev = ()=> setIndex(i=> (i-1+slides.length) % slides.length)
  const next = ()=> setIndex(i=> (i+1) % slides.length)

  if (!slides.length) return null

  return (
    <section className="hero-slider" aria-label="Hero slider">
      <div className="slides-inner" style={{ transform:`translateX(-${index*100}%)`}}>
        {slides.map((s, i)=> (
          <div key={i} className="slide" style={{backgroundImage:`url(${s.src})`}} role="img" aria-label={s.alt} />
        ))}
      </div>

      <button className="slide-btn prev" aria-label="Previous slide" onClick={prev}>&lsaquo;</button>
      <button className="slide-btn next" aria-label="Next slide" onClick={next}>&rsaquo;</button>

      <div className="dots bottom-dots">
        {slides.map((_, i)=> (
          <button key={i} className={`dot ${i===index? 'active':''}`} onClick={()=>setIndex(i)} aria-label={`Go to slide ${i+1}`} />
        ))}
      </div>
    </section>
  )
}
