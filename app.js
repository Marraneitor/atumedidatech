(() => {
  const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('DOMContentLoaded', () => {
    /* Custom cursor */
    const cursor = document.querySelector('.cursor');
    if (cursor && !('ontouchstart' in window)) {
      let idleTimeout;

      const setHidden = (hidden) => {
        cursor.classList.toggle('cursor--hidden', hidden);
      };

      const resetIdle = () => {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => setHidden(true), 2500);
      };

      window.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        setHidden(false);
        resetIdle();
      });

      ['a','button','.card','.card__case','.btn'].forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          el.addEventListener('mouseenter', () => cursor.classList.add('cursor--active'));
          el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--active'));
        });
      });

      resetIdle();
    } else if (cursor) {
      cursor.style.display = 'none';
    }

    /* Counters */
    const counters = document.querySelectorAll('.metricCounter');
    if (counters.length && !isReduced) {
      const animateCounter = (el) => {
        const target = Number(el.getAttribute('data-target') || '0');
        let current = 0;
        const duration = 1600;
        const start = performance.now();

        const step = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          current = Math.floor(target * progress);
          el.textContent = current.toString();
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target.toString();
        };

        requestAnimationFrame(step);
      };

      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );

      counters.forEach((el) => io.observe(el));
    }

    /* GSAP reveal animations (solo si ScrollTrigger está disponible) */
    if (!isReduced && window.gsap && window.ScrollTrigger) {
      const { gsap } = window;
      const { ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('.section').forEach((section) => {
        const children = section.querySelectorAll('[data-aos]');
        if (!children.length) return;
        gsap.from(children, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
          },
        });
      });
    }
  });
})();
