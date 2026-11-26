/* Entrada del sitio: las capturas de los proyectos giran en torbellino, colapsan en un punto de luz
   y aparece "¿Listo para comenzar?". Todo en CSS (app/globals.css, .intro), dura 1.5 s y no espera
   a que cargue React. Se muestra una vez por visita y nunca con movimiento reducido. */
const IDS = ['ruah', 'instintos', 'srsburger', 'beautymina', 'gestia', 'denti7', 'hotelmadrid', 'oxford', 'yuridia', 'littlecakes', 'websights', 'prettythings', 'funeraria', 'streamly'];
const RADII = [30, 42, 36, 48];

// Corre antes de pintar: decide si se muestra y en qué idioma.
const PRE = `try{var d=document.documentElement,s=sessionStorage;if(s.getItem('atm_intro')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-off')}else{s.setItem('atm_intro','1')}var l=(navigator.language||'es').slice(0,2);d.setAttribute('data-intro-lang',l==='en'||l==='pt'?l:'es')}catch(e){}`;

export default function IntroVortex() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRE }} />
      <div className="intro" aria-hidden>
        {IDS.map((id, i) => (
          <span
            key={id}
            className="intro-item"
            style={
              {
                '--a': `${(360 / IDS.length) * i}deg`,
                '--r': `${RADII[i % RADII.length]}vmax`,
                '--t': `${(i % 2 ? 1 : -1) * 18}deg`,
                '--d': `${(i % 5) * 0.025}s`,
              } as React.CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/assets/img/intro/${id}.webp`} alt="" width={256} height={160} decoding="async" fetchPriority="high" />
          </span>
        ))}
        <span className="intro-ring" />
        <span className="intro-core" />
        <p className="intro-text font-display">
          <span data-l="es">¿Listo para comenzar?</span>
          <span data-l="en">Ready to get started?</span>
          <span data-l="pt">Pronto para começar?</span>
        </p>
      </div>
    </>
  );
}
