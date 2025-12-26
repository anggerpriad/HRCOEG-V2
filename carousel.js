// carousel.js
// Responsive testimonial carousel
(function(){
  const carousel = document.querySelector('.testi-carousel');
  if(!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.testi-slide'));
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const dotsContainer = carousel.querySelector('.carousel-dots');

  let index = 0;
  let slidesToShow = calculateSlidesToShow();
  let autoplayInterval = 4000;
  let autoplayTimer = null;
  let isDragging = false;
  let startX = 0;
  let prevTranslate = 0;

  // init
  function init(){
    createDots();
    setSlidesWidth();
    goTo(index);
    bindEvents();
    startAutoplay();
    window.addEventListener('resize', handleResize);
  }

  function calculateSlidesToShow(){
    const w = window.innerWidth;
    if(w >= 1100) return 3;
    if(w >= 700) return 2;
    return 1;
  }

  function setSlidesWidth(){
    slidesToShow = calculateSlidesToShow();
    const pct = 100 / slidesToShow;
    slides.forEach(s => {
      s.style.width = pct + '%';
    });
    const maxIndex = Math.max(0, slides.length - slidesToShow);
    if(index > maxIndex) index = maxIndex;
    goTo(index, true);
  }

  function goTo(i, instant){
    const maxIndex = Math.max(0, slides.length - slidesToShow);
    index = Math.max(0, Math.min(i, maxIndex));
    const translateX = -(index * (100 / slidesToShow));
    if(instant){
      track.style.transition = 'none';
    } else {
      track.style.transition = '';
    }
    track.style.transform = `translateX(${translateX}%)`;
    updateDots();
  }

  function prev(){
    goTo(index - 1);
    restartAutoplay();
  }
  function next(){
    goTo(index + 1);
    restartAutoplay();
  }

  // Dots
  function createDots(){
    dotsContainer.innerHTML = '';
    const pageCount = Math.max(1, slides.length - slidesToShow + 1);
    for(let i=0;i<pageCount;i++){
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Slide ' + (i+1));
      dot.addEventListener('click', ()=> {
        goTo(i);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }
  function updateDots(){
    const dots = Array.from(dotsContainer.children);
    dots.forEach(d => d.classList.remove('is-active'));
    const activeIndex = Math.min(index, dots.length - 1);
    if(dots[activeIndex]) dots[activeIndex].classList.add('is-active');
  }

  // Autoplay
  function startAutoplay(){
    stopAutoplay();
    autoplayTimer = setInterval(()=> {
      const maxIndex = Math.max(0, slides.length - slidesToShow);
      if(index >= maxIndex) goTo(0); else goTo(index + 1);
    }, autoplayInterval);
  }
  function stopAutoplay(){
    if(autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  function restartAutoplay(){
    stopAutoplay();
    startAutoplay();
  }

  // Drag / Touch
  function bindEvents(){
    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    const viewport = carousel.querySelector('.carousel-track-viewport');
    viewport.addEventListener('touchstart', touchStart, {passive:true});
    viewport.addEventListener('touchmove', touchMove, {passive:false});
    viewport.addEventListener('touchend', touchEnd);
    viewport.addEventListener('mousedown', touchStart);
    viewport.addEventListener('mousemove', touchMove);
    viewport.addEventListener('mouseup', touchEnd);
    viewport.addEventListener('mouseleave', touchEnd);

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);
  }

  function touchStart(event){
    isDragging = true;
    startX = getX(event);
    prevTranslate = parseTranslateX(track);
    track.style.transition = 'none';
  }

  function touchMove(event){
    if(!isDragging) return;
    const x = getX(event);
    const dx = x - startX;
    const percentDx = (dx / carousel.querySelector('.carousel-track-viewport').offsetWidth) * 100;
    track.style.transform = `translateX(${prevTranslate + percentDx}%)`;
    event.preventDefault();
  }

  function touchEnd(){
    if(!isDragging) return;
    isDragging = false;
    const finalTranslate = parseTranslateX(track);
    const movedPercent = finalTranslate - prevTranslate;
    const threshold = 12; // percent
    if(movedPercent < -threshold){
      next();
    } else if (movedPercent > threshold){
      prev();
    } else {
      goTo(index);
    }
    track.style.transition = '';
  }

  function getX(event){
    if(event.touches && event.touches.length) return event.touches[0].clientX;
    return event.clientX || 0;
  }

  function parseTranslateX(el){
    const st = window.getComputedStyle(el);
    const tr = st.transform || st.webkitTransform;
    if(!tr || tr === 'none') return 0;
    const values = tr.match(/matrix.*\((.+)\)/)[1].split(', ');
    const tx = parseFloat(values[4]);
    const vw = carousel.querySelector('.carousel-track-viewport').offsetWidth;
    const pct = (tx / vw) * 100;
    return pct;
  }

  function handleResize(){
    const old = slidesToShow;
    setSlidesWidth();
    if(old !== slidesToShow) {
      createDots();
    }
  }

  // init
  init();
})();
