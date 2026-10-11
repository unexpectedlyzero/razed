(function(){
    var boot=document.getElementById('rm-boot'); if(!boot) return;
    var p=window.__rmPath(), isHome=window.__rmIsHome();
    var seen=false; try{ seen=sessionStorage.getItem('homeLoaderSeen')==='1'; }catch(e){}
    var mob=window.matchMedia&&window.matchMedia('(max-width:767px)').matches;
    window.__bootReady=false;
    function ready(){ if(window.__bootReady) return; window.__bootReady=true; try{ if(window.__bootResObs) window.__bootResObs.disconnect(); }catch(e){} var f=window.__onBootReady; window.__onBootReady=null; if(typeof f==='function') f(); }

    if(!isHome||seen||mob){ if(boot.parentNode) boot.parentNode.removeChild(boot); ready(); return; }
    var blocks=[].slice.call(boot.querySelectorAll('.rm-boot_bar > i')), pctEl=boot.querySelector('.rm-boot_pct'), litN=-1, shown=0;
    function paint(p){
      var n=Math.floor(p/100*blocks.length+1e-6);
      if(n===litN) return;
      litN=n;
      for(var i=0;i<blocks.length;i++) blocks[i].classList.toggle('is-on',i<n);
    }

    var t0=null, EST=1600, doneAt=null, VIDCAP=7000, ASSETCAP=9000;

    var fontsOK=!(document.fonts&&document.fonts.ready);
    if(!fontsOK) document.fonts.ready.then(function(){ fontsOK=true; });

    var lastResAt=0, resObs=null, QUIET=700;
    try{
      resObs=new PerformanceObserver(function(list){
        var es=list.getEntries();
        for(var i=0;i<es.length;i++){
          var it=es[i].initiatorType;
          if(it==='video'||it==='audio'||it==='beacon') continue;
          lastResAt=performance.now();
        }
      });
      resObs.observe({type:'resource',buffered:true});
      window.__bootResObs=resObs;
    }catch(err){}
    function netQuiet(){ return lastResAt===0 || (performance.now()-lastResAt)>QUIET; }

    var heroImgs=null;
    function heroImgsReady(){
      if(heroImgs===null){
        heroImgs=[].slice.call(document.querySelectorAll('.section-img img,.navbar-brand_letter img,.navbar-brand_letter_bottom img,.rm-feat-bg_img'))
          .filter(function(im){ return im.getAttribute('src')&&im.getAttribute('loading')!=='lazy'; });
      }
      for(var i=0;i<heroImgs.length;i++){
        var im=heroImgs[i];
        if(!(im.complete&&im.naturalWidth>0)) return false;
      }
      return true;
    }

    function whoVidsReady(){
      var vs=[].slice.call(document.querySelectorAll('video')).filter(function(v){ return v.autoplay; });
      if(!vs.length) return true;
      var ok=0; for(var i=0;i<vs.length;i++){ if(vs[i].readyState>=3) ok++; }
      return ok >= Math.ceil(vs.length*0.7);
    }
    function tick(ts){
      if(t0===null) t0=ts;
      var e=ts-t0;

      var assetsOK=(heroImgsReady()&&fontsOK&&netQuiet())||e>ASSETCAP;
      var loaded=(document.readyState==='complete') && (window.__revealArmed===true) && (whoVidsReady() || e>VIDCAP) && assetsOK;
      var pct;
      if(loaded){ if(doneAt===null) doneAt=e; pct=Math.min(100, 95 + (e-doneAt)/8); }
      else { pct=95*(1-Math.exp(-e/EST)); }
      pct=Math.max(shown,pct); shown=pct;
      paint(pct); pctEl.textContent=Math.round(pct)+'%';
      if(pct>=100){
        boot.classList.add('is-final');
        var lab=boot.querySelector('.rm-boot_label');
        if(lab) lab.textContent='INITIALIZED';
        setTimeout(ready, 460);
        return;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    setTimeout(ready, 12000);
  })();
;
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const triggerElement = null;
    if (!navbar || !triggerElement) return;
    let lastScrollY = window.scrollY;
    const isAtBottom = () => window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
    window.addEventListener(
      'scroll',
      () => {
        const currentScrollY = window.scrollY;
        const triggerPoint = triggerElement.getBoundingClientRect().top + window.scrollY;
        const isMobile = window.innerWidth <= 767;
        if (isAtBottom()) {
          if (isMobile) {
            navbar.style.opacity = '0';
            navbar.style.pointerEvents = 'none';
          } else {
            navbar.style.opacity = '1';
            navbar.style.pointerEvents = 'auto';
          }
        } else if (currentScrollY > triggerPoint) {
          if (currentScrollY > lastScrollY) {
            navbar.style.opacity = '0';
            navbar.style.pointerEvents = 'none';
          } else {
            navbar.style.opacity = '1';
            navbar.style.pointerEvents = 'auto';
          }
        } else {
          navbar.style.opacity = '1';
          navbar.style.pointerEvents = 'auto';
        }
        lastScrollY = currentScrollY;
      },
      { passive: true },
    );
  });
;
document.addEventListener('DOMContentLoaded', () => {
    const mm = gsap.matchMedia();
    mm.add('(max-width: 767px)', () => {
      const SLIDE_DURATION = 12;
      const blocks = gsap.utils.toArray('[data-hero-mod-block]');
      const videos = gsap.utils.toArray('[data-hero-mod-video]');
      const stopBtn = document.querySelector('[data-hero-mod-stop]');
      const tlWrapper = document.querySelector('[data-hero-mod-timeline-wrapper]');
      if (!blocks.length || !tlWrapper) return;
      tlWrapper.innerHTML = '';
      const timelineItems = blocks.map((_, i) => {
        const item = document.createElement('div');
        item.className = 'home_hero2_mod-block_timeline';
        item.dataset.heroModTimeline = i;
        const bar = document.createElement('div');
        bar.className = 'home_hero2_mod-block_timeline_bar';
        bar.dataset.heroModTimelineBar = i;
        gsap.set(bar, { width: '0%' });
        item.appendChild(bar);
        tlWrapper.appendChild(item);
        return { item, bar };
      });
      let currentIndex = 0;
      let isStopped = false;
      let activeTween = null;
      const getVideo = (key) => videos.find((v) => v.dataset.heroModVideo === key)?.querySelector('video');
      const stopAllVideos = () => {
        videos.forEach((v) => {
          const vid = v.querySelector('video');
          if (vid) {
            vid.pause();
            vid.currentTime = 0;
          }
          v.classList.remove('is-active');
        });
      };
      const activateSlide = (index) => {
        blocks.forEach((b) => b.classList.remove('is-active'));
        stopAllVideos();
        timelineItems.forEach(({ bar }) => gsap.set(bar, { width: '0%' }));
        const block = blocks[index];
        const key = block?.dataset.heroModBlock;
        const video = getVideo(key);
        const { bar } = timelineItems[index];
        block?.classList.add('is-active');
        const videoWrapper = videos.find((v) => v.dataset.heroModVideo === key);
        if (videoWrapper) videoWrapper.classList.add('is-active');
        if (video) {
          video.currentTime = 0;
          video.play();
        }
        if (isStopped) return;
        if (activeTween) activeTween.kill();
        activeTween = gsap.fromTo(
          bar,
          { width: '0%' },
          {
            width: '100%',
            duration: SLIDE_DURATION,
            ease: 'none',
            onComplete: () => {
              if (isStopped) return;
              currentIndex = (index + 1) % blocks.length;
              activateSlide(currentIndex);
            },
          },
        );
      };
      const pauseIcon = `<svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.33333 12.6666V3.33331H12V12.6666H9.33333ZM4 12.6666V3.33331H6.66667V12.6666H4Z" fill="white"/></svg>`;
      const playIcon = `<svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3.33331L12 7.99998L4 12.6666V3.33331Z" fill="white"/></svg>`;
      if (stopBtn) {
        stopBtn.addEventListener('click', () => {
          isStopped = !isStopped;
          const iconEl = stopBtn.querySelector('.icon');
          const video = getVideo(blocks[currentIndex]?.dataset.heroModBlock);
          if (isStopped) {
            if (activeTween) activeTween.pause();
            if (video) video.pause();
            if (iconEl) iconEl.innerHTML = playIcon;
          } else {
            if (activeTween) activeTween.resume();
            if (video) video.play();
            if (iconEl) iconEl.innerHTML = pauseIcon;
          }
        });
      }
      activateSlide(0);
      return () => {
        if (activeTween) activeTween.kill();
        stopAllVideos();
      };
    });
    if (window.matchMedia('(min-width: 768px)').matches) {
      const floating = document.querySelector('.mod-floating');
      const images = document.querySelectorAll('.home_hero2_mod_video-item');
      const initLetters = (container) => {
        const letters = container.querySelectorAll('.mod-item');
        if (!letters.length) return;
        letters.forEach((letter, index) => {
          letter.addEventListener('mouseenter', () => {
            images.forEach((image) => {
              image.style.transform = `translateY(${index * -100}%)`;
            });
          });
        });
      };
      const initFloating = () => {
        if (!floating) return;
        floating.style.left = '0px';
        floating.style.top = '0px';
        const offset = 16;
        const lerp = 0.32;
        let mouseX = 0,
          mouseY = 0;
        let currentX = 0,
          currentY = 0;
        let seeded = false;
        const fw = () => floating.offsetWidth || 0;
        const fh = () => floating.offsetHeight || 0;
        window.addEventListener('mousemove', (e) => {
          mouseX = Math.min(e.clientX + offset, window.innerWidth - fw() - 8);
          mouseY = Math.min(e.clientY + offset, window.innerHeight - fh() - 8);
          if (!seeded) { currentX = mouseX; currentY = mouseY; seeded = true; }
        }, { passive: true });
        const tick = () => {
          currentX += (mouseX - currentX) * lerp;
          currentY += (mouseY - currentY) * lerp;
          floating.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
          requestAnimationFrame(tick);
        };
        tick();
      };
      document.querySelectorAll('.mod-wrapper').forEach(initLetters);
      initFloating();
    }
    const videoLinks = document.querySelectorAll('a[data-video-play-link]');
    videoLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        const url = new URL(href, window.location.origin);
        url.searchParams.set('trailer', 'play');
        link.setAttribute('href', url.pathname + url.search + url.hash);
      }
    });
  });
;
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const section = document.querySelector('.section-who');
    const texts = gsap.utils.toArray('[data-who-video-text]');
    const wrapper = document.querySelector('[data-who-video-wrapper]');
    const videos = gsap.utils.toArray('[data-who-video]');
    const mainWrapper = document.querySelector('[data-who-video-main]');
    const mainItems = mainWrapper ? gsap.utils.toArray(mainWrapper.children) : [];
    const tag = document.querySelector('.who-video-main_tag');
    const videoComponent = gsap.utils.toArray('[data-wf--component-who-video--variant="base"]');
    if (!section || !wrapper) return;

    if (videoComponent.length) gsap.set(videoComponent, { visibility: 'visible' });

    gsap.set(wrapper, { scale: 1, transformOrigin: '50% 50%' });
    if (mainItems.length) {
      gsap.set(mainItems, { opacity: 0 });
      gsap.set(mainItems[0], { opacity: 1 });
    }

    const resetVid = (item) => {
      if (!item) return;
      const v = item.querySelector('video');
      if (!v) return;

      mainItems.forEach((it) => { if (it !== item) { const ov = it.querySelector('video'); if (ov && !ov.paused) { try { ov.pause(); } catch (e) {} } } });
      try { v.currentTime = 0; const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) {}
    };

    texts.forEach((el) => {
      const split = new SplitText(el, { type: 'words', wordsClass: 'word-inner' });
      split.words.forEach((word) => {
        const mask = document.createElement('span');
        mask.className = 'word-mask';
        word.replaceWith(mask);
        mask.appendChild(word);
      });
      el._words = split.words;
      gsap.set(split.words, { yPercent: 20, opacity: 0 });
    });

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const clipInset = isMobile ? 'inset(0.6rem)' : 'inset(1.6rem)';

    const tl = gsap.timeline({ paused: true, onComplete: () => {
      const next = document.querySelector('#community');
      const r = section.getBoundingClientRect();

      if (next && window.lenis && r.top <= 5 && r.bottom > window.innerHeight * 0.6) {
        if (!isMobile) {
          window.__patEntranceArmed = true;
          if (window.__primePatEntrance) window.__primePatEntrance();
        }
        const targetY = next.getBoundingClientRect().top + window.scrollY;
        if (window.__rmGlideTo) window.__rmGlideTo(targetY);
        else window.lenis.scrollTo(targetY, {
          duration: 1.2, easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        });
      }
    } });

    tl.to(wrapper, { scale: 1, duration: 0.9 }, 0);
    if (mainItems[0]) tl.call(() => resetVid(mainItems[0]), null, 0);

    if (tag) tl.to(tag, { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in' }, 0.55);

    texts.forEach((el, i) => {
      tl.fromTo(el._words,
        { yPercent: 20, opacity: 0, filter: 'blur(13px)', scale: 1.03 },
        { yPercent: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.15, ease: 'power2.out', stagger: { each: 0.022, ease: 'power2.out' } },
        i === 0 ? 0.8 : '>');
      if (i > 0) {
        if (i < mainItems.length) {
          tl.to(mainItems[i], { opacity: 1, duration: 0.58, ease: 'power2.out', onStart: () => resetVid(mainItems[i]) }, '<');
        }

        if (mainWrapper) tl.to(mainWrapper, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '<');
      }
      tl.to(el._words,
        { yPercent: -12, opacity: 0, filter: 'blur(11px)', scale: 1.03, duration: 0.6, ease: 'power1.in', stagger: { each: 0.016 } },
        '+=0.95');

      if (mainWrapper && i < texts.length - 1) {
        tl.to(mainWrapper, { opacity: 0.62, duration: 0.55, ease: 'power1.in' }, '<');
      }
    });

    const clipTargets = videos.concat(mainWrapper ? [mainWrapper] : []);
    if (isMobile) {
      tl.to({}, { duration: 0.6 });
    } else {
      tl.to(wrapper, { scale: 0.5, duration: 1.1, ease: 'power2.inOut' }, '+=0.25');
      tl.to(clipTargets, { clipPath: clipInset, duration: 1.1, ease: 'power2.inOut' }, '<');
    }

    const playAllVids = () => {

      section.querySelectorAll('[data-who-video] video').forEach((v) => { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); });
    };
    const kickVids = () => { const go = () => { playAllVids(); setTimeout(playAllVids, 260); setTimeout(playAllVids, 750); }; if (window.__rmWhenSettled) window.__rmWhenSettled(go); else go(); };

    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      end: 'bottom top',
      onEnter: () => { tl.restart(); kickVids(); },
      onEnterBack: () => { tl.restart(); kickVids(); },
      onLeaveBack: () => { if (window.__rmWhenSettled) window.__rmWhenSettled(() => tl.pause(0)); else tl.pause(0); },
    });

    let wdT = null;
    const artWatchdog = () => {
      clearTimeout(wdT);
      wdT = setTimeout(() => {
        const r = section.getBoundingClientRect();
        const vh = window.innerHeight;
        if (Math.abs(r.top) < vh * 0.5 && r.bottom > vh * 0.5 && tl.paused() && tl.progress() < 0.05) {
          tl.restart();
          kickVids();
        }
      }, 350);
    };
    window.addEventListener('scroll', artWatchdog, { passive: true });
    if (window.lenis && window.lenis.on) window.lenis.on('scroll', artWatchdog);
  });
;
document.addEventListener('DOMContentLoaded', function () {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = document.querySelector('[data-links-trigger]');
    const wrapper = document.querySelector('[data-links-wrapper]');
    const buttons = [...document.querySelectorAll('[data-links-button]')];
    if (!trigger || !wrapper || !buttons.length) return;
    const count = buttons.length;
    const MAX_DISTANCE = 2.5;
    function update(activeIndexFloat) {
      const shift = -100 * activeIndexFloat;
      gsap.set(wrapper, { y: `${shift}%` });
      const btnHeight = buttons[0].offsetHeight;
      buttons.forEach((btn, i) => {
        const distance = Math.min(Math.abs(i - activeIndexFloat), MAX_DISTANCE);
        const t = distance / MAX_DISTANCE;
        const opacity = gsap.utils.mapRange(0, 1, 1, 0.35, t);
        const scale = gsap.utils.mapRange(0, 1, 1, 0.62, t);
        const dir = i > activeIndexFloat ? -1 : 1;
        let translateY = (dir * btnHeight * (1 - scale)) / 2;
        const from = Math.min(i, activeIndexFloat);
        const to = Math.max(i, activeIndexFloat);
        buttons.forEach((other, j) => {
          if (j <= from || j >= to) return;
          const otherDistance = Math.min(Math.abs(j - activeIndexFloat), MAX_DISTANCE);
          const otherT = otherDistance / MAX_DISTANCE;
          const otherScale = gsap.utils.mapRange(0, 1, 1, 0.6, otherT);
          translateY += dir * btnHeight * (1 - otherScale);
        });
        gsap.set(btn, { opacity, scale, y: translateY });
      });
    }
    update(Math.floor((count - 1) / 2));
  });
;
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    function initFooterParallax() {
      document.querySelectorAll('[data-footer-parallax]').forEach((el) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'clamp(top bottom)',
            end: 'clamp(top top)',
            scrub: true,
          },
        });
        const inner = el.querySelector('[data-footer-parallax-inner]');
        const dark = el.querySelector('[data-footer-parallax-dark]');
        if (inner) {
          tl.from(inner, { yPercent: -25, ease: 'linear' });
        }
        if (dark) {
          tl.from(dark, { opacity: 0.5, ease: 'linear' }, '<');
        }
      });
    }
    initFooterParallax();
    (function(){
      var atBottom=function(){var de=document.documentElement;
        return window.scrollY+window.innerHeight>=de.scrollHeight-2;};
      var sync=function(){
        try{ScrollTrigger.update();}catch(e){}
        if(!atBottom())return;
        try{ScrollTrigger.getAll().forEach(function(st){
          var t=st.trigger;
          if(t&&t.hasAttribute&&t.hasAttribute('data-footer-parallax')&&st.animation)st.animation.progress(1);
        });}catch(e){}
      };
      ['scroll','scrollend','touchend','touchcancel','pointerup','resize'].forEach(function(ev){
        window.addEventListener(ev,sync,{passive:true});
      });
    })();
  });
;
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t||self).Lenis=e()}(this,function(){function t(t,e){for(var i=0;i<e.length;i++){var o=e[i];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,"symbol"==typeof(n=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,"string");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(o.key))?n:String(n),o)}var n}function e(e,i,o){return i&&t(e.prototype,i),o&&t(e,o),Object.defineProperty(e,"prototype",{writable:!1}),e}function i(){return i=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var o in i)Object.prototype.hasOwnProperty.call(i,o)&&(t[o]=i[o])}return t},i.apply(this,arguments)}function o(t,e,i){return Math.max(t,Math.min(e,i))}var n=/*#__PURE__*/function(){function t(){}var e=t.prototype;return e.advance=function(t){var e,i,n,s;if(this.isRunning){var r=!1;if(this.lerp)this.value=(i=this.value,n=this.to,(1-(s=1-Math.exp(-60*this.lerp*t)))*i+s*n),Math.round(this.value)===this.to&&(this.value=this.to,r=!0);else{this.currentTime+=t;var l=o(0,this.currentTime/this.duration,1),h=(r=l>=1)?1:this.easing(l);this.value=this.from+(this.to-this.from)*h}null==(e=this.onUpdate)||e.call(this,this.value,{completed:r}),r&&this.stop()}},e.stop=function(){this.isRunning=!1},e.fromTo=function(t,e,i){var o=i.lerp,n=void 0===o?.1:o,s=i.duration,r=void 0===s?1:s,l=i.easing,h=void 0===l?function(t){return t}:l,a=i.onUpdate;this.from=this.value=t,this.to=e,this.lerp=n,this.duration=r,this.easing=h,this.currentTime=0,this.isRunning=!0,this.onUpdate=a},t}(),s=/*#__PURE__*/function(){function t(t){var e,i,o=this,n=void 0===t?{}:t,s=n.wrapper,r=n.content,l=n.autoResize,h=void 0===l||l;if(this.resize=function(){o.onWrapperResize(),o.onContentResize()},this.onWrapperResize=function(){o.wrapper===window?(o.width=window.innerWidth,o.height=window.innerHeight):(o.width=o.wrapper.clientWidth,o.height=o.wrapper.clientHeight)},this.onContentResize=function(){o.scrollHeight=o.content.scrollHeight,o.scrollWidth=o.content.scrollWidth},this.wrapper=s,this.content=r,h){var a=(e=this.resize,function(){var t=arguments,o=this;clearTimeout(i),i=setTimeout(function(){e.apply(o,t)},250)});this.wrapper!==window&&(this.wrapperResizeObserver=new ResizeObserver(a),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(a),this.contentResizeObserver.observe(this.content)}this.resize()}return t.prototype.destroy=function(){var t,e;null==(t=this.wrapperResizeObserver)||t.disconnect(),null==(e=this.contentResizeObserver)||e.disconnect()},e(t,[{key:"limit",get:function(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}}]),t}(),r=/*#__PURE__*/function(){function t(){this.events={}}var e=t.prototype;return e.emit=function(t){for(var e=this.events[t]||[],i=0,o=e.length;i<o;i++)e[i].apply(e,[].slice.call(arguments,1))},e.on=function(t,e){var i,o=this;return(null==(i=this.events[t])?void 0:i.push(e))||(this.events[t]=[e]),function(){var i;o.events[t]=null==(i=o.events[t])?void 0:i.filter(function(t){return e!==t})}},e.off=function(t,e){var i;this.events[t]=null==(i=this.events[t])?void 0:i.filter(function(t){return e!==t})},e.destroy=function(){this.events={}},t}(),l=/*#__PURE__*/function(){function t(t,e){var i=this,n=e.wheelMultiplier,s=void 0===n?1:n,l=e.touchMultiplier,h=void 0===l?2:l,a=e.normalizeWheel,c=void 0!==a&&a;this.onTouchStart=function(t){var e=t.targetTouches?t.targetTouches[0]:t,o=e.clientY;i.touchStart.x=e.clientX,i.touchStart.y=o,i.lastDelta={x:0,y:0}},this.onTouchMove=function(t){var e=t.targetTouches?t.targetTouches[0]:t,o=e.clientX,n=e.clientY,s=-(o-i.touchStart.x)*i.touchMultiplier,r=-(n-i.touchStart.y)*i.touchMultiplier;i.touchStart.x=o,i.touchStart.y=n,i.lastDelta={x:s,y:r},i.emitter.emit("scroll",{deltaX:s,deltaY:r,event:t})},this.onTouchEnd=function(t){i.emitter.emit("scroll",{deltaX:i.lastDelta.x,deltaY:i.lastDelta.y,event:t})},this.onWheel=function(t){var e=t.deltaX,n=t.deltaY;i.normalizeWheel&&(e=o(-100,e,100),n=o(-100,n,100)),i.emitter.emit("scroll",{deltaX:e*=i.wheelMultiplier,deltaY:n*=i.wheelMultiplier,event:t})},this.element=t,this.wheelMultiplier=s,this.touchMultiplier=h,this.normalizeWheel=c,this.touchStart={x:null,y:null},this.emitter=new r,this.element.addEventListener("wheel",this.onWheel,{passive:!1}),this.element.addEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.addEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.addEventListener("touchend",this.onTouchEnd,{passive:!1})}var e=t.prototype;return e.on=function(t,e){return this.emitter.on(t,e)},e.destroy=function(){this.emitter.destroy(),this.element.removeEventListener("wheel",this.onWheel,{passive:!1}),this.element.removeEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.removeEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.removeEventListener("touchend",this.onTouchEnd,{passive:!1})},t}();/*#__PURE__*/
return function(){function t(t){var e=this,o=void 0===t?{}:t,h=o.wrapper,a=void 0===h?window:h,c=o.content,u=void 0===c?document.documentElement:c,p=o.wheelEventsTarget,d=void 0===p?a:p,v=o.smoothWheel,m=void 0===v||v,f=o.smoothTouch,g=void 0!==f&&f,S=o.syncTouch,y=void 0!==S&&S,w=o.syncTouchLerp,T=void 0===w?.1:w,b=o.__iosNoInertiaSyncTouchLerp,z=void 0===b?.4:b,E=o.touchInertiaMultiplier,L=void 0===E?35:E,M=o.duration,_=o.easing,O=void 0===_?function(t){return Math.min(1,1.001-Math.pow(2,-10*t))}:_,R=o.lerp,W=void 0===R?M&&.1:R,k=o.infinite,x=void 0!==k&&k,H=o.orientation,j=void 0===H?"vertical":H,A=o.gestureOrientation,X=void 0===A?"vertical":A,Y=o.touchMultiplier,D=void 0===Y?1:Y,I=o.wheelMultiplier,P=void 0===I?1:I,C=o.normalizeWheel,N=void 0!==C&&C,U=o.autoResize,V=void 0===U||U;this.onVirtualScroll=function(t){var o=t.deltaX,n=t.deltaY,s=t.event;if(!s.ctrlKey){var r=s.type.includes("touch"),l=s.type.includes("wheel");if(!("vertical"===e.options.gestureOrientation&&0===n||"horizontal"===e.options.gestureOrientation&&0===o||r&&"vertical"===e.options.gestureOrientation&&0===e.scroll&&!e.options.infinite&&n<=0)){var h=s.composedPath();if(!(h=h.slice(0,h.indexOf(e.rootElement))).find(function(t){var e;return(null==t.hasAttribute?void 0:t.hasAttribute("data-lenis-prevent"))||r&&(null==t.hasAttribute?void 0:t.hasAttribute("data-lenis-prevent-touch"))||l&&(null==t.hasAttribute?void 0:t.hasAttribute("data-lenis-prevent-wheel"))||(null==(e=t.classList)?void 0:e.contains("lenis"))}))if(e.isStopped||e.isLocked)s.preventDefault();else{if(e.isSmooth=(e.options.smoothTouch||e.options.syncTouch)&&r||e.options.smoothWheel&&l,!e.isSmooth)return e.isScrolling=!1,void e.animate.stop();s.preventDefault();var a=n;"both"===e.options.gestureOrientation?a=Math.abs(n)>Math.abs(o)?n:o:"horizontal"===e.options.gestureOrientation&&(a=o);var c=r&&e.options.syncTouch,u=r&&"touchend"===s.type&&Math.abs(a)>1;u&&(a=e.velocity*e.options.touchInertiaMultiplier),e.scrollTo(e.targetScroll+a,i({programmatic:!1},c&&{lerp:u?e.syncTouchLerp:e.options.__iosNoInertiaSyncTouchLerp}))}}}},this.onScroll=function(){if(!e.isScrolling){var t=e.animatedScroll;e.animatedScroll=e.targetScroll=e.actualScroll,e.velocity=0,e.direction=Math.sign(e.animatedScroll-t),e.emit()}},window.lenisVersion="1.0.23",a!==document.documentElement&&a!==document.body||(a=window),this.options={wrapper:a,content:u,wheelEventsTarget:d,smoothWheel:m,smoothTouch:g,syncTouch:y,syncTouchLerp:T,__iosNoInertiaSyncTouchLerp:z,touchInertiaMultiplier:L,duration:M,easing:O,lerp:W,infinite:x,gestureOrientation:X,orientation:j,touchMultiplier:D,wheelMultiplier:P,normalizeWheel:N,autoResize:V},this.dimensions=new s({wrapper:a,content:u,autoResize:V}),this.rootElement.classList.add("lenis"),this.velocity=0,this.isStopped=!1,this.isSmooth=m||g,this.isScrolling=!1,this.targetScroll=this.animatedScroll=this.actualScroll,this.animate=new n,this.emitter=new r,this.options.wrapper.addEventListener("scroll",this.onScroll,{passive:!1}),this.virtualScroll=new l(d,{touchMultiplier:D,wheelMultiplier:P,normalizeWheel:N}),this.virtualScroll.on("scroll",this.onVirtualScroll)}var h=t.prototype;return h.destroy=function(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onScroll,{passive:!1}),this.virtualScroll.destroy(),this.dimensions.destroy(),this.rootElement.classList.remove("lenis"),this.rootElement.classList.remove("lenis-smooth"),this.rootElement.classList.remove("lenis-scrolling"),this.rootElement.classList.remove("lenis-stopped")},h.on=function(t,e){return this.emitter.on(t,e)},h.off=function(t,e){return this.emitter.off(t,e)},h.setScroll=function(t){this.isHorizontal?this.rootElement.scrollLeft=t:this.rootElement.scrollTop=t},h.resize=function(){this.dimensions.resize()},h.emit=function(){this.emitter.emit("scroll",this)},h.reset=function(){this.isLocked=!1,this.isScrolling=!1,this.velocity=0,this.animate.stop()},h.start=function(){this.isStopped=!1,this.reset()},h.stop=function(){this.isStopped=!0,this.animate.stop(),this.reset()},h.raf=function(t){var e=t-(this.time||t);this.time=t,this.animate.advance(.001*e)},h.scrollTo=function(t,e){var i=this,n=void 0===e?{}:e,s=n.offset,r=void 0===s?0:s,l=n.immediate,h=void 0!==l&&l,a=n.lock,c=void 0!==a&&a,u=n.duration,p=void 0===u?this.options.duration:u,d=n.easing,v=void 0===d?this.options.easing:d,m=n.lerp,f=void 0===m?!p&&this.options.lerp:m,g=n.onComplete,S=void 0===g?null:g,y=n.force,w=n.programmatic,T=void 0===w||w;if(!this.isStopped||void 0!==y&&y){if(["top","left","start"].includes(t))t=0;else if(["bottom","right","end"].includes(t))t=this.limit;else{var b,z;if("string"==typeof t?z=document.querySelector(t):null!=(b=t)&&b.nodeType&&(z=t),z){if(this.options.wrapper!==window){var E=this.options.wrapper.getBoundingClientRect();r-=this.isHorizontal?E.left:E.top}var L=z.getBoundingClientRect();t=(this.isHorizontal?L.left:L.top)+this.animatedScroll}}if("number"==typeof t){if(t+=r,t=Math.round(t),this.options.infinite?T&&(this.targetScroll=this.animatedScroll=this.scroll):t=o(0,t,this.limit),h)return this.animatedScroll=this.targetScroll=t,this.setScroll(this.scroll),this.reset(),this.emit(),void(null==S||S());if(!T){if(t===this.targetScroll)return;this.targetScroll=t}this.animate.fromTo(this.animatedScroll,t,{duration:p,easing:v,lerp:f,onUpdate:function(t,e){var o=e.completed;c&&(i.isLocked=!0),i.isScrolling=!0,i.velocity=t-i.animatedScroll,i.direction=Math.sign(i.velocity),i.animatedScroll=t,i.setScroll(i.scroll),T&&(i.targetScroll=t),o&&(c&&(i.isLocked=!1),requestAnimationFrame(function(){i.isScrolling=!1}),i.velocity=0,null==S||S()),i.emit()}})}}},e(t,[{key:"rootElement",get:function(){return this.options.wrapper===window?this.options.content:this.options.wrapper}},{key:"limit",get:function(){return this.dimensions.limit[this.isHorizontal?"x":"y"]}},{key:"isHorizontal",get:function(){return"horizontal"===this.options.orientation}},{key:"actualScroll",get:function(){return this.isHorizontal?this.rootElement.scrollLeft:this.rootElement.scrollTop}},{key:"scroll",get:function(){return this.options.infinite?(this.animatedScroll%(t=this.limit)+t)%t:this.animatedScroll;var t}},{key:"progress",get:function(){return 0===this.limit?1:this.scroll/this.limit}},{key:"isSmooth",get:function(){return this.__isSmooth},set:function(t){this.__isSmooth!==t&&(this.rootElement.classList.toggle("lenis-smooth",t),this.__isSmooth=t)}},{key:"isScrolling",get:function(){return this.__isScrolling},set:function(t){this.__isScrolling!==t&&(this.rootElement.classList.toggle("lenis-scrolling",t),this.__isScrolling=t)}},{key:"isStopped",get:function(){return this.__isStopped},set:function(t){this.__isStopped!==t&&(this.rootElement.classList.toggle("lenis-stopped",t),this.__isStopped=t)}},{key:"className",get:function(){var t="lenis";return this.isStopped&&(t+=" lenis-stopped"),this.isScrolling&&(t+=" lenis-scrolling"),this.isSmooth&&(t+=" lenis-smooth"),t}}]),t}()});
;
/*!
 * GSAP 3.13.0
 * https://gsap.com
 * 
 * @license Copyright 2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license.
 * @author: Jack Doyle, jack@greensock.com
 */

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t=t||self).window=t.window||{})}(this,function(e){"use strict";function _inheritsLoose(t,e){t.prototype=Object.create(e.prototype),(t.prototype.constructor=t).__proto__=e}function _assertThisInitialized(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function r(t){return"string"==typeof t}function s(t){return"function"==typeof t}function t(t){return"number"==typeof t}function u(t){return void 0===t}function v(t){return"object"==typeof t}function w(t){return!1!==t}function x(){return"undefined"!=typeof window}function y(t){return s(t)||r(t)}function P(t){return(i=yt(t,ot))&&ze}function Q(t,e){return console.warn("Invalid property",t,"set to",e,"Missing plugin? gsap.registerPlugin()")}function R(t,e){return!e&&console.warn(t)}function S(t,e){return t&&(ot[t]=e)&&i&&(i[t]=e)||ot}function T(){return 0}function ea(t){var e,r,i=t[0];if(v(i)||s(i)||(t=[t]),!(e=(i._gsap||{}).harness)){for(r=gt.length;r--&&!gt[r].targetTest(i););e=gt[r]}for(r=t.length;r--;)t[r]&&(t[r]._gsap||(t[r]._gsap=new Zt(t[r],e)))||t.splice(r,1);return t}function fa(t){return t._gsap||ea(Ot(t))[0]._gsap}function ga(t,e,r){return(r=t[e])&&s(r)?t[e]():u(r)&&t.getAttribute&&t.getAttribute(e)||r}function ha(t,e){return(t=t.split(",")).forEach(e)||t}function ia(t){return Math.round(1e5*t)/1e5||0}function ja(t){return Math.round(1e7*t)/1e7||0}function ka(t,e){var r=e.charAt(0),i=parseFloat(e.substr(2));return t=parseFloat(t),"+"===r?t+i:"-"===r?t-i:"*"===r?t*i:t/i}function la(t,e){for(var r=e.length,i=0;t.indexOf(e[i])<0&&++i<r;);return i<r}function ma(){var t,e,r=dt.length,i=dt.slice(0);for(ct={},t=dt.length=0;t<r;t++)(e=i[t])&&e._lazy&&(e.render(e._lazy[0],e._lazy[1],!0)._lazy=0)}function na(t){return!!(t._initted||t._startAt||t.add)}function oa(t,e,r,i){dt.length&&!L&&ma(),t.render(e,r,i||!!(L&&e<0&&na(t))),dt.length&&!L&&ma()}function pa(t){var e=parseFloat(t);return(e||0===e)&&(t+"").match(at).length<2?e:r(t)?t.trim():t}function qa(t){return t}function ra(t,e){for(var r in e)r in t||(t[r]=e[r]);return t}function ua(t,e){for(var r in e)"__proto__"!==r&&"constructor"!==r&&"prototype"!==r&&(t[r]=v(e[r])?ua(t[r]||(t[r]={}),e[r]):e[r]);return t}function va(t,e){var r,i={};for(r in t)r in e||(i[r]=t[r]);return i}function wa(t){var e=t.parent||I,r=t.keyframes?function _setKeyframeDefaults(i){return function(t,e){for(var r in e)r in t||"duration"===r&&i||"ease"===r||(t[r]=e[r])}}($(t.keyframes)):ra;if(w(t.inherit))for(;e;)r(t,e.vars.defaults),e=e.parent||e._dp;return t}function ya(t,e,r,i,n){void 0===r&&(r="_first"),void 0===i&&(i="_last");var a,s=t[i];if(n)for(a=e[n];s&&s[n]>a;)s=s._prev;return s?(e._next=s._next,s._next=e):(e._next=t[r],t[r]=e),e._next?e._next._prev=e:t[i]=e,e._prev=s,e.parent=e._dp=t,e}function za(t,e,r,i){void 0===r&&(r="_first"),void 0===i&&(i="_last");var n=e._prev,a=e._next;n?n._next=a:t[r]===e&&(t[r]=a),a?a._prev=n:t[i]===e&&(t[i]=n),e._next=e._prev=e.parent=null}function Aa(t,e){t.parent&&(!e||t.parent.autoRemoveChildren)&&t.parent.remove&&t.parent.remove(t),t._act=0}function Ba(t,e){if(t&&(!e||e._end>t._dur||e._start<0))for(var r=t;r;)r._dirty=1,r=r.parent;return t}function Da(t,e,r,i){return t._startAt&&(L?t._startAt.revert(ht):t.vars.immediateRender&&!t.vars.autoRevert||t._startAt.render(e,!0,i))}function Fa(t){return t._repeat?Tt(t._tTime,t=t.duration()+t._rDelay)*t:0}function Ha(t,e){return(t-e._start)*e._ts+(0<=e._ts?0:e._dirty?e.totalDuration():e._tDur)}function Ia(t){return t._end=ja(t._start+(t._tDur/Math.abs(t._ts||t._rts||U)||0))}function Ja(t,e){var r=t._dp;return r&&r.smoothChildTiming&&t._ts&&(t._start=ja(r._time-(0<t._ts?e/t._ts:((t._dirty?t.totalDuration():t._tDur)-e)/-t._ts)),Ia(t),r._dirty||Ba(r,t)),t}function Ka(t,e){var r;if((e._time||!e._dur&&e._initted||e._start<t._time&&(e._dur||!e.add))&&(r=Ha(t.rawTime(),e),(!e._dur||Mt(0,e.totalDuration(),r)-e._tTime>U)&&e.render(r,!0)),Ba(t,e)._dp&&t._initted&&t._time>=t._dur&&t._ts){if(t._dur<t.duration())for(r=t;r._dp;)0<=r.rawTime()&&r.totalTime(r._tTime),r=r._dp;t._zTime=-U}}function La(e,r,i,n){return r.parent&&Aa(r),r._start=ja((t(i)?i:i||e!==I?xt(e,i,r):e._time)+r._delay),r._end=ja(r._start+(r.totalDuration()/Math.abs(r.timeScale())||0)),ya(e,r,"_first","_last",e._sort?"_start":0),bt(r)||(e._recent=r),n||Ka(e,r),e._ts<0&&Ja(e,e._tTime),e}function Ma(t,e){return(ot.ScrollTrigger||Q("scrollTrigger",e))&&ot.ScrollTrigger.create(e,t)}function Na(t,e,r,i,n){return Wt(t,e,n),t._initted?!r&&t._pt&&!L&&(t._dur&&!1!==t.vars.lazy||!t._dur&&t.vars.lazy)&&f!==Rt.frame?(dt.push(t),t._lazy=[n,i],1):void 0:1}function Sa(t,e,r,i){var n=t._repeat,a=ja(e)||0,s=t._tTime/t._tDur;return s&&!i&&(t._time*=a/t._dur),t._dur=a,t._tDur=n?n<0?1e10:ja(a*(n+1)+t._rDelay*n):a,0<s&&!i&&Ja(t,t._tTime=t._tDur*s),t.parent&&Ia(t),r||Ba(t.parent,t),t}function Ta(t){return t instanceof Qt?Ba(t):Sa(t,t._dur)}function Wa(e,r,i){var n,a,s=t(r[1]),o=(s?2:1)+(e<2?0:1),u=r[o];if(s&&(u.duration=r[1]),u.parent=i,e){for(n=u,a=i;a&&!("immediateRender"in n);)n=a.vars.defaults||{},a=w(a.vars.inherit)&&a.parent;u.immediateRender=w(n.immediateRender),e<2?u.runBackwards=1:u.startAt=r[o-1]}return new Jt(r[0],u,r[1+o])}function Xa(t,e){return t||0===t?e(t):e}function Za(t,e){return r(t)&&(e=st.exec(t))?e[1]:""}function ab(t,e){return t&&v(t)&&"length"in t&&(!e&&!t.length||t.length-1 in t&&v(t[0]))&&!t.nodeType&&t!==h}function db(r){return r=Ot(r)[0]||R("Invalid scope")||{},function(t){var e=r.current||r.nativeElement||r;return Ot(t,e.querySelectorAll?e:e===r?R("Invalid scope")||a.createElement("div"):r)}}function eb(t){return t.sort(function(){return.5-Math.random()})}function fb(t){if(s(t))return t;var p=v(t)?t:{each:t},_=Yt(p.ease),m=p.from||0,g=parseFloat(p.base)||0,y={},e=0<m&&m<1,T=isNaN(m)||e,b=p.axis,w=m,x=m;return r(m)?w=x={center:.5,edges:.5,end:1}[m]||0:!e&&T&&(w=m[0],x=m[1]),function(t,e,r){var i,n,a,s,o,u,h,l,f,d=(r||p).length,c=y[d];if(!c){if(!(f="auto"===p.grid?0:(p.grid||[1,N])[1])){for(h=-N;h<(h=r[f++].getBoundingClientRect().left)&&f<d;);f<d&&f--}for(c=y[d]=[],i=T?Math.min(f,d)*w-.5:m%f,n=f===N?0:T?d*x/f-.5:m/f|0,l=N,u=h=0;u<d;u++)a=u%f-i,s=n-(u/f|0),c[u]=o=b?Math.abs("y"===b?s:a):G(a*a+s*s),h<o&&(h=o),o<l&&(l=o);"random"===m&&eb(c),c.max=h-l,c.min=l,c.v=d=(parseFloat(p.amount)||parseFloat(p.each)*(d<f?d-1:b?"y"===b?d/f:f:Math.max(f,d/f))||0)*("edges"===m?-1:1),c.b=d<0?g-d:g,c.u=Za(p.amount||p.each)||0,_=_&&d<0?jt(_):_}return d=(c[t]-c.min)/c.max||0,ja(c.b+(_?_(d):d)*c.v)+c.u}}function gb(i){var n=Math.pow(10,((i+"").split(".")[1]||"").length);return function(e){var r=ja(Math.round(parseFloat(e)/i)*i*n);return(r-r%1)/n+(t(e)?0:Za(e))}}function hb(h,e){var l,f,r=$(h);return!r&&v(h)&&(l=r=h.radius||N,h.values?(h=Ot(h.values),(f=!t(h[0]))&&(l*=l)):h=gb(h.increment)),Xa(e,r?s(h)?function(t){return f=h(t),Math.abs(f-t)<=l?f:t}:function(e){for(var r,i,n=parseFloat(f?e.x:e),a=parseFloat(f?e.y:0),s=N,o=0,u=h.length;u--;)(r=f?(r=h[u].x-n)*r+(i=h[u].y-a)*i:Math.abs(h[u]-n))<s&&(s=r,o=u);return o=!l||s<=l?h[o]:e,f||o===e||t(e)?o:o+Za(e)}:gb(h))}function ib(t,e,r,i){return Xa($(t)?!e:!0===r?!!(r=0):!i,function(){return $(t)?t[~~(Math.random()*t.length)]:(r=r||1e-5)&&(i=r<1?Math.pow(10,(r+"").length-2):1)&&Math.floor(Math.round((t-r/2+Math.random()*(e-t+.99*r))/r)*r*i)/i})}function mb(e,r,t){return Xa(t,function(t){return e[~~r(t)]})}function pb(t){for(var e,r,i,n,a=0,s="";~(e=t.indexOf("random(",a));)i=t.indexOf(")",e),n="["===t.charAt(e+7),r=t.substr(e+7,i-e-7).match(n?at:tt),s+=t.substr(a,e-a)+ib(n?r:+r[0],n?0:+r[1],+r[2]||1e-5),a=i+1;return s+t.substr(a,t.length-a)}function sb(t,e,r){var i,n,a,s=t.labels,o=N;for(i in s)(n=s[i]-e)<0==!!r&&n&&o>(n=Math.abs(n))&&(a=i,o=n);return a}function ub(t){return Aa(t),t.scrollTrigger&&t.scrollTrigger.kill(!!L),t.progress()<1&&Pt(t,"onInterrupt"),t}function xb(t){if(t)if(t=!t.name&&t.default||t,x()||t.headless){var e=t.name,r=s(t),i=e&&!r&&t.init?function(){this._props=[]}:t,n={init:T,render:ue,add:Vt,kill:de,modifier:he,rawVars:0},a={targetTest:0,get:0,getSetter:ie,aliases:{},register:0};if(Ft(),t!==i){if(pt[e])return;ra(i,ra(va(t,n),a)),yt(i.prototype,yt(n,va(t,a))),pt[i.prop=e]=i,t.targetTest&&(gt.push(i),ft[e]=1),e=("css"===e?"CSS":e.charAt(0).toUpperCase()+e.substr(1))+"Plugin"}S(e,i),t.register&&t.register(ze,i,ge)}else Ct.push(t)}function Ab(t,e,r){return(6*(t+=t<0?1:1<t?-1:0)<1?e+(r-e)*t*6:t<.5?r:3*t<2?e+(r-e)*(2/3-t)*6:e)*St+.5|0}function Bb(e,r,i){var n,a,s,o,u,h,l,f,d,c,p=e?t(e)?[e>>16,e>>8&St,e&St]:0:Dt.black;if(!p){if(","===e.substr(-1)&&(e=e.substr(0,e.length-1)),Dt[e])p=Dt[e];else if("#"===e.charAt(0)){if(e.length<6&&(e="#"+(n=e.charAt(1))+n+(a=e.charAt(2))+a+(s=e.charAt(3))+s+(5===e.length?e.charAt(4)+e.charAt(4):"")),9===e.length)return[(p=parseInt(e.substr(1,6),16))>>16,p>>8&St,p&St,parseInt(e.substr(7),16)/255];p=[(e=parseInt(e.substr(1),16))>>16,e>>8&St,e&St]}else if("hsl"===e.substr(0,3))if(p=c=e.match(tt),r){if(~e.indexOf("="))return p=e.match(et),i&&p.length<4&&(p[3]=1),p}else o=+p[0]%360/360,u=p[1]/100,n=2*(h=p[2]/100)-(a=h<=.5?h*(u+1):h+u-h*u),3<p.length&&(p[3]*=1),p[0]=Ab(o+1/3,n,a),p[1]=Ab(o,n,a),p[2]=Ab(o-1/3,n,a);else p=e.match(tt)||Dt.transparent;p=p.map(Number)}return r&&!c&&(n=p[0]/St,a=p[1]/St,s=p[2]/St,h=((l=Math.max(n,a,s))+(f=Math.min(n,a,s)))/2,l===f?o=u=0:(d=l-f,u=.5<h?d/(2-l-f):d/(l+f),o=l===n?(a-s)/d+(a<s?6:0):l===a?(s-n)/d+2:(n-a)/d+4,o*=60),p[0]=~~(o+.5),p[1]=~~(100*u+.5),p[2]=~~(100*h+.5)),i&&p.length<4&&(p[3]=1),p}function Cb(t){var r=[],i=[],n=-1;return t.split(zt).forEach(function(t){var e=t.match(rt)||[];r.push.apply(r,e),i.push(n+=e.length+1)}),r.c=i,r}function Db(t,e,r){var i,n,a,s,o="",u=(t+o).match(zt),h=e?"hsla(":"rgba(",l=0;if(!u)return t;if(u=u.map(function(t){return(t=Bb(t,e,1))&&h+(e?t[0]+","+t[1]+"%,"+t[2]+"%,"+t[3]:t.join(","))+")"}),r&&(a=Cb(t),(i=r.c).join(o)!==a.c.join(o)))for(s=(n=t.replace(zt,"1").split(rt)).length-1;l<s;l++)o+=n[l]+(~i.indexOf(l)?u.shift()||h+"0,0,0,0)":(a.length?a:u.length?u:r).shift());if(!n)for(s=(n=t.split(zt)).length-1;l<s;l++)o+=n[l]+u[l];return o+n[s]}function Gb(t){var e,r=t.join(" ");if(zt.lastIndex=0,zt.test(r))return e=Et.test(r),t[1]=Db(t[1],e),t[0]=Db(t[0],e,Cb(t[1])),!0}function Pb(t){var e=(t+"").split("("),r=Lt[e[0]];return r&&1<e.length&&r.config?r.config.apply(null,~t.indexOf("{")?[function _parseObjectInString(t){for(var e,r,i,n={},a=t.substr(1,t.length-3).split(":"),s=a[0],o=1,u=a.length;o<u;o++)r=a[o],e=o!==u-1?r.lastIndexOf(","):r.length,i=r.substr(0,e),n[s]=isNaN(i)?i.replace(Bt,"").trim():+i,s=r.substr(e+1).trim();return n}(e[1])]:function _valueInParentheses(t){var e=t.indexOf("(")+1,r=t.indexOf(")"),i=t.indexOf("(",e);return t.substring(e,~i&&i<r?t.indexOf(")",r+1):r)}(t).split(",").map(pa)):Lt._CE&&It.test(t)?Lt._CE("",t):r}function Rb(t,e){for(var r,i=t._first;i;)i instanceof Qt?Rb(i,e):!i.vars.yoyoEase||i._yoyo&&i._repeat||i._yoyo===e||(i.timeline?Rb(i.timeline,e):(r=i._ease,i._ease=i._yEase,i._yEase=r,i._yoyo=e)),i=i._next}function Tb(t,e,r,i){void 0===r&&(r=function easeOut(t){return 1-e(1-t)}),void 0===i&&(i=function easeInOut(t){return t<.5?e(2*t)/2:1-e(2*(1-t))/2});var n,a={easeIn:e,easeOut:r,easeInOut:i};return ha(t,function(t){for(var e in Lt[t]=ot[t]=a,Lt[n=t.toLowerCase()]=r,a)Lt[n+("easeIn"===e?".in":"easeOut"===e?".out":".inOut")]=Lt[t+"."+e]=a[e]}),a}function Ub(e){return function(t){return t<.5?(1-e(1-2*t))/2:.5+e(2*(t-.5))/2}}function Vb(r,t,e){function Lm(t){return 1===t?1:i*Math.pow(2,-10*t)*K((t-a)*n)+1}var i=1<=t?t:1,n=(e||(r?.3:.45))/(t<1?t:1),a=n/q*(Math.asin(1/i)||0),s="out"===r?Lm:"in"===r?function(t){return 1-Lm(1-t)}:Ub(Lm);return n=q/n,s.config=function(t,e){return Vb(r,t,e)},s}function Wb(e,r){function Tm(t){return t?--t*t*((r+1)*t+r)+1:0}void 0===r&&(r=1.70158);var t="out"===e?Tm:"in"===e?function(t){return 1-Tm(1-t)}:Ub(Tm);return t.config=function(t){return Wb(e,t)},t}var F,L,l,I,h,n,a,i,o,f,d,c,p,_,m,g,b,M,k,O,A,C,D,z,E,B,j,Y,X={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},Z={duration:.5,overwrite:!1,delay:0},N=1e8,U=1/N,q=2*Math.PI,V=q/4,W=0,G=Math.sqrt,H=Math.cos,K=Math.sin,J="function"==typeof ArrayBuffer&&ArrayBuffer.isView||function(){},$=Array.isArray,tt=/(?:-?\.?\d|\.)+/gi,et=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,rt=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,it=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,nt=/[+-]=-?[.\d]+/,at=/[^,'"\[\]\s]+/gi,st=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,ot={},ut={suppressEvents:!0,isStart:!0,kill:!1},ht={suppressEvents:!0,kill:!1},lt={suppressEvents:!0},ft={},dt=[],ct={},pt={},_t={},mt=30,gt=[],vt="",yt=function _merge(t,e){for(var r in e)t[r]=e[r];return t},Tt=function _animationCycle(t,e){var r=Math.floor(t=ja(t/e));return t&&r===t?r-1:r},bt=function _isFromOrFromStart(t){var e=t.data;return"isFromStart"===e||"isStart"===e},wt={_start:0,endTime:T,totalDuration:T},xt=function _parsePosition(t,e,i){var n,a,s,o=t.labels,u=t._recent||wt,h=t.duration()>=N?u.endTime(!1):t._dur;return r(e)&&(isNaN(e)||e in o)?(a=e.charAt(0),s="%"===e.substr(-1),n=e.indexOf("="),"<"===a||">"===a?(0<=n&&(e=e.replace(/=/,"")),("<"===a?u._start:u.endTime(0<=u._repeat))+(parseFloat(e.substr(1))||0)*(s?(n<0?u:i).totalDuration()/100:1)):n<0?(e in o||(o[e]=h),o[e]):(a=parseFloat(e.charAt(n-1)+e.substr(n+1)),s&&i&&(a=a/100*($(i)?i[0]:i).totalDuration()),1<n?_parsePosition(t,e.substr(0,n-1),i)+a:h+a)):null==e?h:+e},Mt=function _clamp(t,e,r){return r<t?t:e<r?e:r},kt=[].slice,Ot=function toArray(t,e,i){return l&&!e&&l.selector?l.selector(t):!r(t)||i||!n&&Ft()?$(t)?function _flatten(t,e,i){return void 0===i&&(i=[]),t.forEach(function(t){return r(t)&&!e||ab(t,1)?i.push.apply(i,Ot(t)):i.push(t)})||i}(t,i):ab(t)?kt.call(t,0):t?[t]:[]:kt.call((e||a).querySelectorAll(t),0)},At=function mapRange(e,t,r,i,n){var a=t-e,s=i-r;return Xa(n,function(t){return r+((t-e)/a*s||0)})},Pt=function _callback(t,e,r){var i,n,a,s=t.vars,o=s[e],u=l,h=t._ctx;if(o)return i=s[e+"Params"],n=s.callbackScope||t,r&&dt.length&&ma(),h&&(l=h),a=i?o.apply(n,i):o.call(n),l=u,a},Ct=[],St=255,Dt={aqua:[0,St,St],lime:[0,St,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,St],navy:[0,0,128],white:[St,St,St],olive:[128,128,0],yellow:[St,St,0],orange:[St,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[St,0,0],pink:[St,192,203],cyan:[0,St,St],transparent:[St,St,St,0]},zt=function(){var t,e="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b";for(t in Dt)e+="|"+t+"\\b";return new RegExp(e+")","gi")}(),Et=/hsl[a]?\(/,Rt=(k=Date.now,O=500,A=33,C=k(),D=C,E=z=1e3/240,g={time:0,frame:0,tick:function tick(){Al(!0)},deltaRatio:function deltaRatio(t){return b/(1e3/(t||60))},wake:function wake(){o&&(!n&&x()&&(h=n=window,a=h.document||{},ot.gsap=ze,(h.gsapVersions||(h.gsapVersions=[])).push(ze.version),P(i||h.GreenSockGlobals||!h.gsap&&h||{}),Ct.forEach(xb)),m="undefined"!=typeof requestAnimationFrame&&requestAnimationFrame,p&&g.sleep(),_=m||function(t){return setTimeout(t,E-1e3*g.time+1|0)},c=1,Al(2))},sleep:function sleep(){(m?cancelAnimationFrame:clearTimeout)(p),c=0,_=T},lagSmoothing:function lagSmoothing(t,e){O=t||1/0,A=Math.min(e||33,O)},fps:function fps(t){z=1e3/(t||240),E=1e3*g.time+z},add:function add(n,t,e){var a=t?function(t,e,r,i){n(t,e,r,i),g.remove(a)}:n;return g.remove(n),B[e?"unshift":"push"](a),Ft(),a},remove:function remove(t,e){~(e=B.indexOf(t))&&B.splice(e,1)&&e<=M&&M--},_listeners:B=[]}),Ft=function _wake(){return!c&&Rt.wake()},Lt={},It=/^[\d.\-M][\d.\-,\s]/,Bt=/["']/g,jt=function _invertEase(e){return function(t){return 1-e(1-t)}},Yt=function _parseEase(t,e){return t&&(s(t)?t:Lt[t]||Pb(t))||e};function Al(t){var e,r,i,n,a=k()-D,s=!0===t;if((O<a||a<0)&&(C+=a-A),(0<(e=(i=(D+=a)-C)-E)||s)&&(n=++g.frame,b=i-1e3*g.time,g.time=i/=1e3,E+=e+(z<=e?4:z-e),r=1),s||(p=_(Al)),r)for(M=0;M<B.length;M++)B[M](i,b,n,t)}function jn(t){return t<Y?j*t*t:t<.7272727272727273?j*Math.pow(t-1.5/2.75,2)+.75:t<.9090909090909092?j*(t-=2.25/2.75)*t+.9375:j*Math.pow(t-2.625/2.75,2)+.984375}ha("Linear,Quad,Cubic,Quart,Quint,Strong",function(t,e){var r=e<5?e+1:e;Tb(t+",Power"+(r-1),e?function(t){return Math.pow(t,r)}:function(t){return t},function(t){return 1-Math.pow(1-t,r)},function(t){return t<.5?Math.pow(2*t,r)/2:1-Math.pow(2*(1-t),r)/2})}),Lt.Linear.easeNone=Lt.none=Lt.Linear.easeIn,Tb("Elastic",Vb("in"),Vb("out"),Vb()),j=7.5625,Y=1/2.75,Tb("Bounce",function(t){return 1-jn(1-t)},jn),Tb("Expo",function(t){return Math.pow(2,10*(t-1))*t+t*t*t*t*t*t*(1-t)}),Tb("Circ",function(t){return-(G(1-t*t)-1)}),Tb("Sine",function(t){return 1===t?1:1-H(t*V)}),Tb("Back",Wb("in"),Wb("out"),Wb()),Lt.SteppedEase=Lt.steps=ot.SteppedEase={config:function config(t,e){void 0===t&&(t=1);var r=1/t,i=t+(e?0:1),n=e?1:0;return function(t){return((i*Mt(0,.99999999,t)|0)+n)*r}}},Z.ease=Lt["quad.out"],ha("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(t){return vt+=t+","+t+"Params,"});var Xt,Zt=function GSCache(t,e){this.id=W++,(t._gsap=this).target=t,this.harness=e,this.get=e?e.get:ga,this.set=e?e.getSetter:ie},Nt=((Xt=Animation.prototype).delay=function delay(t){return t||0===t?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+t-this._delay),this._delay=t,this):this._delay},Xt.duration=function duration(t){return arguments.length?this.totalDuration(0<this._repeat?t+(t+this._rDelay)*this._repeat:t):this.totalDuration()&&this._dur},Xt.totalDuration=function totalDuration(t){return arguments.length?(this._dirty=0,Sa(this,this._repeat<0?t:(t-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},Xt.totalTime=function totalTime(t,e){if(Ft(),!arguments.length)return this._tTime;var r=this._dp;if(r&&r.smoothChildTiming&&this._ts){for(Ja(this,t),!r._dp||r.parent||Ka(r,this);r&&r.parent;)r.parent._time!==r._start+(0<=r._ts?r._tTime/r._ts:(r.totalDuration()-r._tTime)/-r._ts)&&r.totalTime(r._tTime,!0),r=r.parent;!this.parent&&this._dp.autoRemoveChildren&&(0<this._ts&&t<this._tDur||this._ts<0&&0<t||!this._tDur&&!t)&&La(this._dp,this,this._start-this._delay)}return(this._tTime!==t||!this._dur&&!e||this._initted&&Math.abs(this._zTime)===U||!t&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=t),oa(this,t,e)),this},Xt.time=function time(t,e){return arguments.length?this.totalTime(Math.min(this.totalDuration(),t+Fa(this))%(this._dur+this._rDelay)||(t?this._dur:0),e):this._time},Xt.totalProgress=function totalProgress(t,e){return arguments.length?this.totalTime(this.totalDuration()*t,e):this.totalDuration()?Math.min(1,this._tTime/this._tDur):0<=this.rawTime()&&this._initted?1:0},Xt.progress=function progress(t,e){return arguments.length?this.totalTime(this.duration()*(!this._yoyo||1&this.iteration()?t:1-t)+Fa(this),e):this.duration()?Math.min(1,this._time/this._dur):0<this.rawTime()?1:0},Xt.iteration=function iteration(t,e){var r=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(t-1)*r,e):this._repeat?Tt(this._tTime,r)+1:1},Xt.timeScale=function timeScale(t,e){if(!arguments.length)return this._rts===-U?0:this._rts;if(this._rts===t)return this;var r=this.parent&&this._ts?Ha(this.parent._time,this):this._tTime;return this._rts=+t||0,this._ts=this._ps||t===-U?0:this._rts,this.totalTime(Mt(-Math.abs(this._delay),this.totalDuration(),r),!1!==e),Ia(this),function _recacheAncestors(t){for(var e=t.parent;e&&e.parent;)e._dirty=1,e.totalDuration(),e=e.parent;return t}(this)},Xt.paused=function paused(t){return arguments.length?(this._ps!==t&&((this._ps=t)?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(Ft(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,1===this.progress()&&Math.abs(this._zTime)!==U&&(this._tTime-=U)))),this):this._ps},Xt.startTime=function startTime(t){if(arguments.length){this._start=t;var e=this.parent||this._dp;return!e||!e._sort&&this.parent||La(e,this,t-this._delay),this}return this._start},Xt.endTime=function endTime(t){return this._start+(w(t)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},Xt.rawTime=function rawTime(t){var e=this.parent||this._dp;return e?t&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Ha(e.rawTime(t),this):this._tTime:this._tTime},Xt.revert=function revert(t){void 0===t&&(t=lt);var e=L;return L=t,na(this)&&(this.timeline&&this.timeline.revert(t),this.totalTime(-.01,t.suppressEvents)),"nested"!==this.data&&!1!==t.kill&&this.kill(),L=e,this},Xt.globalTime=function globalTime(t){for(var e=this,r=arguments.length?t:e.rawTime();e;)r=e._start+r/(Math.abs(e._ts)||1),e=e._dp;return!this.parent&&this._sat?this._sat.globalTime(t):r},Xt.repeat=function repeat(t){return arguments.length?(this._repeat=t===1/0?-2:t,Ta(this)):-2===this._repeat?1/0:this._repeat},Xt.repeatDelay=function repeatDelay(t){if(arguments.length){var e=this._time;return this._rDelay=t,Ta(this),e?this.time(e):this}return this._rDelay},Xt.yoyo=function yoyo(t){return arguments.length?(this._yoyo=t,this):this._yoyo},Xt.seek=function seek(t,e){return this.totalTime(xt(this,t),w(e))},Xt.restart=function restart(t,e){return this.play().totalTime(t?-this._delay:0,w(e)),this._dur||(this._zTime=-U),this},Xt.play=function play(t,e){return null!=t&&this.seek(t,e),this.reversed(!1).paused(!1)},Xt.reverse=function reverse(t,e){return null!=t&&this.seek(t||this.totalDuration(),e),this.reversed(!0).paused(!1)},Xt.pause=function pause(t,e){return null!=t&&this.seek(t,e),this.paused(!0)},Xt.resume=function resume(){return this.paused(!1)},Xt.reversed=function reversed(t){return arguments.length?(!!t!==this.reversed()&&this.timeScale(-this._rts||(t?-U:0)),this):this._rts<0},Xt.invalidate=function invalidate(){return this._initted=this._act=0,this._zTime=-U,this},Xt.isActive=function isActive(){var t,e=this.parent||this._dp,r=this._start;return!(e&&!(this._ts&&this._initted&&e.isActive()&&(t=e.rawTime(!0))>=r&&t<this.endTime(!0)-U))},Xt.eventCallback=function eventCallback(t,e,r){var i=this.vars;return 1<arguments.length?(e?(i[t]=e,r&&(i[t+"Params"]=r),"onUpdate"===t&&(this._onUpdate=e)):delete i[t],this):i[t]},Xt.then=function then(t){var i=this;return new Promise(function(e){function Eo(){var t=i.then;i.then=null,s(r)&&(r=r(i))&&(r.then||r===i)&&(i.then=t),e(r),i.then=t}var r=s(t)?t:qa;i._initted&&1===i.totalProgress()&&0<=i._ts||!i._tTime&&i._ts<0?Eo():i._prom=Eo})},Xt.kill=function kill(){ub(this)},Animation);function Animation(t){this.vars=t,this._delay=+t.delay||0,(this._repeat=t.repeat===1/0?-2:t.repeat||0)&&(this._rDelay=t.repeatDelay||0,this._yoyo=!!t.yoyo||!!t.yoyoEase),this._ts=1,Sa(this,+t.duration,1,1),this.data=t.data,l&&(this._ctx=l).data.push(this),c||Rt.wake()}ra(Nt.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-U,_prom:0,_ps:!1,_rts:1});var Qt=function(i){function Timeline(t,e){var r;return void 0===t&&(t={}),(r=i.call(this,t)||this).labels={},r.smoothChildTiming=!!t.smoothChildTiming,r.autoRemoveChildren=!!t.autoRemoveChildren,r._sort=w(t.sortChildren),I&&La(t.parent||I,_assertThisInitialized(r),e),t.reversed&&r.reverse(),t.paused&&r.paused(!0),t.scrollTrigger&&Ma(_assertThisInitialized(r),t.scrollTrigger),r}_inheritsLoose(Timeline,i);var e=Timeline.prototype;return e.to=function to(t,e,r){return Wa(0,arguments,this),this},e.from=function from(t,e,r){return Wa(1,arguments,this),this},e.fromTo=function fromTo(t,e,r,i){return Wa(2,arguments,this),this},e.set=function set(t,e,r){return e.duration=0,e.parent=this,wa(e).repeatDelay||(e.repeat=0),e.immediateRender=!!e.immediateRender,new Jt(t,e,xt(this,r),1),this},e.call=function call(t,e,r){return La(this,Jt.delayedCall(0,t,e),r)},e.staggerTo=function staggerTo(t,e,r,i,n,a,s){return r.duration=e,r.stagger=r.stagger||i,r.onComplete=a,r.onCompleteParams=s,r.parent=this,new Jt(t,r,xt(this,n)),this},e.staggerFrom=function staggerFrom(t,e,r,i,n,a,s){return r.runBackwards=1,wa(r).immediateRender=w(r.immediateRender),this.staggerTo(t,e,r,i,n,a,s)},e.staggerFromTo=function staggerFromTo(t,e,r,i,n,a,s,o){return i.startAt=r,wa(i).immediateRender=w(i.immediateRender),this.staggerTo(t,e,i,n,a,s,o)},e.render=function render(t,e,r){var i,n,a,s,o,u,h,l,f,d,c,p,_=this._time,m=this._dirty?this.totalDuration():this._tDur,g=this._dur,v=t<=0?0:ja(t),y=this._zTime<0!=t<0&&(this._initted||!g);if(this!==I&&m<v&&0<=t&&(v=m),v!==this._tTime||r||y){if(_!==this._time&&g&&(v+=this._time-_,t+=this._time-_),i=v,f=this._start,u=!(l=this._ts),y&&(g||(_=this._zTime),!t&&e||(this._zTime=t)),this._repeat){if(c=this._yoyo,o=g+this._rDelay,this._repeat<-1&&t<0)return this.totalTime(100*o+t,e,r);if(i=ja(v%o),v===m?(s=this._repeat,i=g):((s=~~(d=ja(v/o)))&&s===d&&(i=g,s--),g<i&&(i=g)),d=Tt(this._tTime,o),!_&&this._tTime&&d!==s&&this._tTime-d*o-this._dur<=0&&(d=s),c&&1&s&&(i=g-i,p=1),s!==d&&!this._lock){var T=c&&1&d,b=T===(c&&1&s);if(s<d&&(T=!T),_=T?0:v%g?g:v,this._lock=1,this.render(_||(p?0:ja(s*o)),e,!g)._lock=0,this._tTime=v,!e&&this.parent&&Pt(this,"onRepeat"),this.vars.repeatRefresh&&!p&&(this.invalidate()._lock=1),_&&_!==this._time||u!=!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(g=this._dur,m=this._tDur,b&&(this._lock=2,_=T?g:-1e-4,this.render(_,!0),this.vars.repeatRefresh&&!p&&this.invalidate()),this._lock=0,!this._ts&&!u)return this;Rb(this,p)}}if(this._hasPause&&!this._forcing&&this._lock<2&&(h=function _findNextPauseTween(t,e,r){var i;if(e<r)for(i=t._first;i&&i._start<=r;){if("isPause"===i.data&&i._start>e)return i;i=i._next}else for(i=t._last;i&&i._start>=r;){if("isPause"===i.data&&i._start<e)return i;i=i._prev}}(this,ja(_),ja(i)))&&(v-=i-(i=h._start)),this._tTime=v,this._time=i,this._act=!l,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=t,_=0),!_&&v&&!e&&!d&&(Pt(this,"onStart"),this._tTime!==v))return this;if(_<=i&&0<=t)for(n=this._first;n;){if(a=n._next,(n._act||i>=n._start)&&n._ts&&h!==n){if(n.parent!==this)return this.render(t,e,r);if(n.render(0<n._ts?(i-n._start)*n._ts:(n._dirty?n.totalDuration():n._tDur)+(i-n._start)*n._ts,e,r),i!==this._time||!this._ts&&!u){h=0,a&&(v+=this._zTime=-U);break}}n=a}else{n=this._last;for(var w=t<0?t:i;n;){if(a=n._prev,(n._act||w<=n._end)&&n._ts&&h!==n){if(n.parent!==this)return this.render(t,e,r);if(n.render(0<n._ts?(w-n._start)*n._ts:(n._dirty?n.totalDuration():n._tDur)+(w-n._start)*n._ts,e,r||L&&na(n)),i!==this._time||!this._ts&&!u){h=0,a&&(v+=this._zTime=w?-U:U);break}}n=a}}if(h&&!e&&(this.pause(),h.render(_<=i?0:-U)._zTime=_<=i?1:-1,this._ts))return this._start=f,Ia(this),this.render(t,e,r);this._onUpdate&&!e&&Pt(this,"onUpdate",!0),(v===m&&this._tTime>=this.totalDuration()||!v&&_)&&(f!==this._start&&Math.abs(l)===Math.abs(this._ts)||this._lock||(!t&&g||!(v===m&&0<this._ts||!v&&this._ts<0)||Aa(this,1),e||t<0&&!_||!v&&!_&&m||(Pt(this,v===m&&0<=t?"onComplete":"onReverseComplete",!0),!this._prom||v<m&&0<this.timeScale()||this._prom())))}return this},e.add=function add(e,i){var n=this;if(t(i)||(i=xt(this,i,e)),!(e instanceof Nt)){if($(e))return e.forEach(function(t){return n.add(t,i)}),this;if(r(e))return this.addLabel(e,i);if(!s(e))return this;e=Jt.delayedCall(0,e)}return this!==e?La(this,e,i):this},e.getChildren=function getChildren(t,e,r,i){void 0===t&&(t=!0),void 0===e&&(e=!0),void 0===r&&(r=!0),void 0===i&&(i=-N);for(var n=[],a=this._first;a;)a._start>=i&&(a instanceof Jt?e&&n.push(a):(r&&n.push(a),t&&n.push.apply(n,a.getChildren(!0,e,r)))),a=a._next;return n},e.getById=function getById(t){for(var e=this.getChildren(1,1,1),r=e.length;r--;)if(e[r].vars.id===t)return e[r]},e.remove=function remove(t){return r(t)?this.removeLabel(t):s(t)?this.killTweensOf(t):(t.parent===this&&za(this,t),t===this._recent&&(this._recent=this._last),Ba(this))},e.totalTime=function totalTime(t,e){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=ja(Rt.time-(0<this._ts?t/this._ts:(this.totalDuration()-t)/-this._ts))),i.prototype.totalTime.call(this,t,e),this._forcing=0,this):this._tTime},e.addLabel=function addLabel(t,e){return this.labels[t]=xt(this,e),this},e.removeLabel=function removeLabel(t){return delete this.labels[t],this},e.addPause=function addPause(t,e,r){var i=Jt.delayedCall(0,e||T,r);return i.data="isPause",this._hasPause=1,La(this,i,xt(this,t))},e.removePause=function removePause(t){var e=this._first;for(t=xt(this,t);e;)e._start===t&&"isPause"===e.data&&Aa(e),e=e._next},e.killTweensOf=function killTweensOf(t,e,r){for(var i=this.getTweensOf(t,r),n=i.length;n--;)Ut!==i[n]&&i[n].kill(t,e);return this},e.getTweensOf=function getTweensOf(e,r){for(var i,n=[],a=Ot(e),s=this._first,o=t(r);s;)s instanceof Jt?la(s._targets,a)&&(o?(!Ut||s._initted&&s._ts)&&s.globalTime(0)<=r&&s.globalTime(s.totalDuration())>r:!r||s.isActive())&&n.push(s):(i=s.getTweensOf(a,r)).length&&n.push.apply(n,i),s=s._next;return n},e.tweenTo=function tweenTo(t,e){e=e||{};var r,i=this,n=xt(i,t),a=e.startAt,s=e.onStart,o=e.onStartParams,u=e.immediateRender,h=Jt.to(i,ra({ease:e.ease||"none",lazy:!1,immediateRender:!1,time:n,overwrite:"auto",duration:e.duration||Math.abs((n-(a&&"time"in a?a.time:i._time))/i.timeScale())||U,onStart:function onStart(){if(i.pause(),!r){var t=e.duration||Math.abs((n-(a&&"time"in a?a.time:i._time))/i.timeScale());h._dur!==t&&Sa(h,t,0,1).render(h._time,!0,!0),r=1}s&&s.apply(h,o||[])}},e));return u?h.render(0):h},e.tweenFromTo=function tweenFromTo(t,e,r){return this.tweenTo(e,ra({startAt:{time:xt(this,t)}},r))},e.recent=function recent(){return this._recent},e.nextLabel=function nextLabel(t){return void 0===t&&(t=this._time),sb(this,xt(this,t))},e.previousLabel=function previousLabel(t){return void 0===t&&(t=this._time),sb(this,xt(this,t),1)},e.currentLabel=function currentLabel(t){return arguments.length?this.seek(t,!0):this.previousLabel(this._time+U)},e.shiftChildren=function shiftChildren(t,e,r){void 0===r&&(r=0);for(var i,n=this._first,a=this.labels;n;)n._start>=r&&(n._start+=t,n._end+=t),n=n._next;if(e)for(i in a)a[i]>=r&&(a[i]+=t);return Ba(this)},e.invalidate=function invalidate(t){var e=this._first;for(this._lock=0;e;)e.invalidate(t),e=e._next;return i.prototype.invalidate.call(this,t)},e.clear=function clear(t){void 0===t&&(t=!0);for(var e,r=this._first;r;)e=r._next,this.remove(r),r=e;return this._dp&&(this._time=this._tTime=this._pTime=0),t&&(this.labels={}),Ba(this)},e.totalDuration=function totalDuration(t){var e,r,i,n=0,a=this,s=a._last,o=N;if(arguments.length)return a.timeScale((a._repeat<0?a.duration():a.totalDuration())/(a.reversed()?-t:t));if(a._dirty){for(i=a.parent;s;)e=s._prev,s._dirty&&s.totalDuration(),o<(r=s._start)&&a._sort&&s._ts&&!a._lock?(a._lock=1,La(a,s,r-s._delay,1)._lock=0):o=r,r<0&&s._ts&&(n-=r,(!i&&!a._dp||i&&i.smoothChildTiming)&&(a._start+=r/a._ts,a._time-=r,a._tTime-=r),a.shiftChildren(-r,!1,-Infinity),o=0),s._end>n&&s._ts&&(n=s._end),s=e;Sa(a,a===I&&a._time>n?a._time:n,1,1),a._dirty=0}return a._tDur},Timeline.updateRoot=function updateRoot(t){if(I._ts&&(oa(I,Ha(t,I)),f=Rt.frame),Rt.frame>=mt){mt+=X.autoSleep||120;var e=I._first;if((!e||!e._ts)&&X.autoSleep&&Rt._listeners.length<2){for(;e&&!e._ts;)e=e._next;e||Rt.sleep()}}},Timeline}(Nt);ra(Qt.prototype,{_lock:0,_hasPause:0,_forcing:0});function bc(t,e,i,n,a,o){var u,h,l,f;if(pt[t]&&!1!==(u=new pt[t]).init(a,u.rawVars?e[t]:function _processVars(t,e,i,n,a){if(s(t)&&(t=Gt(t,a,e,i,n)),!v(t)||t.style&&t.nodeType||$(t)||J(t))return r(t)?Gt(t,a,e,i,n):t;var o,u={};for(o in t)u[o]=Gt(t[o],a,e,i,n);return u}(e[t],n,a,o,i),i,n,o)&&(i._pt=h=new ge(i._pt,a,t,0,1,u.render,u,0,u.priority),i!==d))for(l=i._ptLookup[i._targets.indexOf(a)],f=u._props.length;f--;)l[u._props[f]]=h;return u}function hc(t,r,e,i){var n,a,s=r.ease||i||"power1.inOut";if($(r))a=e[t]||(e[t]=[]),r.forEach(function(t,e){return a.push({t:e/(r.length-1)*100,v:t,e:s})});else for(n in r)a=e[n]||(e[n]=[]),"ease"===n||a.push({t:parseFloat(t),v:r[n],e:s})}var Ut,qt,Vt=function _addPropTween(t,e,i,n,a,o,u,h,l,f){s(n)&&(n=n(a||0,t,o));var d,c=t[e],p="get"!==i?i:s(c)?l?t[e.indexOf("set")||!s(t["get"+e.substr(3)])?e:"get"+e.substr(3)](l):t[e]():c,_=s(c)?l?re:te:$t;if(r(n)&&(~n.indexOf("random(")&&(n=pb(n)),"="===n.charAt(1)&&(!(d=ka(p,n)+(Za(p)||0))&&0!==d||(n=d))),!f||p!==n||qt)return isNaN(p*n)||""===n?(c||e in t||Q(e,n),function _addComplexStringPropTween(t,e,r,i,n,a,s){var o,u,h,l,f,d,c,p,_=new ge(this._pt,t,e,0,1,oe,null,n),m=0,g=0;for(_.b=r,_.e=i,r+="",(c=~(i+="").indexOf("random("))&&(i=pb(i)),a&&(a(p=[r,i],t,e),r=p[0],i=p[1]),u=r.match(it)||[];o=it.exec(i);)l=o[0],f=i.substring(m,o.index),h?h=(h+1)%5:"rgba("===f.substr(-5)&&(h=1),l!==u[g++]&&(d=parseFloat(u[g-1])||0,_._pt={_next:_._pt,p:f||1===g?f:",",s:d,c:"="===l.charAt(1)?ka(d,l)-d:parseFloat(l)-d,m:h&&h<4?Math.round:0},m=it.lastIndex);return _.c=m<i.length?i.substring(m,i.length):"",_.fp=s,(nt.test(i)||c)&&(_.e=0),this._pt=_}.call(this,t,e,p,n,_,h||X.stringFilter,l)):(d=new ge(this._pt,t,e,+p||0,n-(p||0),"boolean"==typeof c?se:ne,0,_),l&&(d.fp=l),u&&d.modifier(u,this,t),this._pt=d)},Wt=function _initTween(t,e,r){var i,n,a,s,o,u,h,l,f,d,c,p,_,m=t.vars,g=m.ease,v=m.startAt,y=m.immediateRender,T=m.lazy,b=m.onUpdate,x=m.runBackwards,M=m.yoyoEase,k=m.keyframes,O=m.autoRevert,A=t._dur,P=t._startAt,C=t._targets,S=t.parent,D=S&&"nested"===S.data?S.vars.targets:C,z="auto"===t._overwrite&&!F,E=t.timeline;if(!E||k&&g||(g="none"),t._ease=Yt(g,Z.ease),t._yEase=M?jt(Yt(!0===M?g:M,Z.ease)):0,M&&t._yoyo&&!t._repeat&&(M=t._yEase,t._yEase=t._ease,t._ease=M),t._from=!E&&!!m.runBackwards,!E||k&&!m.stagger){if(p=(l=C[0]?fa(C[0]).harness:0)&&m[l.prop],i=va(m,ft),P&&(P._zTime<0&&P.progress(1),e<0&&x&&y&&!O?P.render(-1,!0):P.revert(x&&A?ht:ut),P._lazy=0),v){if(Aa(t._startAt=Jt.set(C,ra({data:"isStart",overwrite:!1,parent:S,immediateRender:!0,lazy:!P&&w(T),startAt:null,delay:0,onUpdate:b&&function(){return Pt(t,"onUpdate")},stagger:0},v))),t._startAt._dp=0,t._startAt._sat=t,e<0&&(L||!y&&!O)&&t._startAt.revert(ht),y&&A&&e<=0&&r<=0)return void(e&&(t._zTime=e))}else if(x&&A&&!P)if(e&&(y=!1),a=ra({overwrite:!1,data:"isFromStart",lazy:y&&!P&&w(T),immediateRender:y,stagger:0,parent:S},i),p&&(a[l.prop]=p),Aa(t._startAt=Jt.set(C,a)),t._startAt._dp=0,t._startAt._sat=t,e<0&&(L?t._startAt.revert(ht):t._startAt.render(-1,!0)),t._zTime=e,y){if(!e)return}else _initTween(t._startAt,U,U);for(t._pt=t._ptCache=0,T=A&&w(T)||T&&!A,n=0;n<C.length;n++){if(h=(o=C[n])._gsap||ea(C)[n]._gsap,t._ptLookup[n]=d={},ct[h.id]&&dt.length&&ma(),c=D===C?n:D.indexOf(o),l&&!1!==(f=new l).init(o,p||i,t,c,D)&&(t._pt=s=new ge(t._pt,o,f.name,0,1,f.render,f,0,f.priority),f._props.forEach(function(t){d[t]=s}),f.priority&&(u=1)),!l||p)for(a in i)pt[a]&&(f=bc(a,i,t,c,o,D))?f.priority&&(u=1):d[a]=s=Vt.call(t,o,a,"get",i[a],c,D,0,m.stringFilter);t._op&&t._op[n]&&t.kill(o,t._op[n]),z&&t._pt&&(Ut=t,I.killTweensOf(o,d,t.globalTime(e)),_=!t.parent,Ut=0),t._pt&&T&&(ct[h.id]=1)}u&&_e(t),t._onInit&&t._onInit(t)}t._onUpdate=b,t._initted=(!t._op||t._pt)&&!_,k&&e<=0&&E.render(N,!0,!0)},Gt=function _parseFuncOrString(t,e,i,n,a){return s(t)?t.call(e,i,n,a):r(t)&&~t.indexOf("random(")?pb(t):t},Ht=vt+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",Kt={};ha(Ht+",id,stagger,delay,duration,paused,scrollTrigger",function(t){return Kt[t]=1});var Jt=function(E){function Tween(e,r,i,n){var a;"number"==typeof r&&(i.duration=r,r=i,i=null);var s,o,u,h,l,f,d,c,p=(a=E.call(this,n?r:wa(r))||this).vars,_=p.duration,m=p.delay,g=p.immediateRender,T=p.stagger,b=p.overwrite,x=p.keyframes,M=p.defaults,k=p.scrollTrigger,O=p.yoyoEase,A=r.parent||I,P=($(e)||J(e)?t(e[0]):"length"in r)?[e]:Ot(e);if(a._targets=P.length?ea(P):R("GSAP target "+e+" not found. https://gsap.com",!X.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=b,x||T||y(_)||y(m)){if(r=a.vars,(s=a.timeline=new Qt({data:"nested",defaults:M||{},targets:A&&"nested"===A.data?A.vars.targets:P})).kill(),s.parent=s._dp=_assertThisInitialized(a),s._start=0,T||y(_)||y(m)){if(h=P.length,d=T&&fb(T),v(T))for(l in T)~Ht.indexOf(l)&&((c=c||{})[l]=T[l]);for(o=0;o<h;o++)(u=va(r,Kt)).stagger=0,O&&(u.yoyoEase=O),c&&yt(u,c),f=P[o],u.duration=+Gt(_,_assertThisInitialized(a),o,f,P),u.delay=(+Gt(m,_assertThisInitialized(a),o,f,P)||0)-a._delay,!T&&1===h&&u.delay&&(a._delay=m=u.delay,a._start+=m,u.delay=0),s.to(f,u,d?d(o,f,P):0),s._ease=Lt.none;s.duration()?_=m=0:a.timeline=0}else if(x){wa(ra(s.vars.defaults,{ease:"none"})),s._ease=Yt(x.ease||r.ease||"none");var C,S,D,z=0;if($(x))x.forEach(function(t){return s.to(P,t,">")}),s.duration();else{for(l in u={},x)"ease"===l||"easeEach"===l||hc(l,x[l],u,x.easeEach);for(l in u)for(C=u[l].sort(function(t,e){return t.t-e.t}),o=z=0;o<C.length;o++)(D={ease:(S=C[o]).e,duration:(S.t-(o?C[o-1].t:0))/100*_})[l]=S.v,s.to(P,D,z),z+=D.duration;s.duration()<_&&s.to({},{duration:_-s.duration()})}}_||a.duration(_=s.duration())}else a.timeline=0;return!0!==b||F||(Ut=_assertThisInitialized(a),I.killTweensOf(P),Ut=0),La(A,_assertThisInitialized(a),i),r.reversed&&a.reverse(),r.paused&&a.paused(!0),(g||!_&&!x&&a._start===ja(A._time)&&w(g)&&function _hasNoPausedAncestors(t){return!t||t._ts&&_hasNoPausedAncestors(t.parent)}(_assertThisInitialized(a))&&"nested"!==A.data)&&(a._tTime=-U,a.render(Math.max(0,-m)||0)),k&&Ma(_assertThisInitialized(a),k),a}_inheritsLoose(Tween,E);var e=Tween.prototype;return e.render=function render(t,e,r){var i,n,a,s,o,u,h,l,f,d=this._time,c=this._tDur,p=this._dur,_=t<0,m=c-U<t&&!_?c:t<U?0:t;if(p){if(m!==this._tTime||!t||r||!this._initted&&this._tTime||this._startAt&&this._zTime<0!=_||this._lazy){if(i=m,l=this.timeline,this._repeat){if(s=p+this._rDelay,this._repeat<-1&&_)return this.totalTime(100*s+t,e,r);if(i=ja(m%s),m===c?(a=this._repeat,i=p):(a=~~(o=ja(m/s)))&&a===o?(i=p,a--):p<i&&(i=p),(u=this._yoyo&&1&a)&&(f=this._yEase,i=p-i),o=Tt(this._tTime,s),i===d&&!r&&this._initted&&a===o)return this._tTime=m,this;a!==o&&(l&&this._yEase&&Rb(l,u),this.vars.repeatRefresh&&!u&&!this._lock&&i!==s&&this._initted&&(this._lock=r=1,this.render(ja(s*a),!0).invalidate()._lock=0))}if(!this._initted){if(Na(this,_?t:i,r,e,m))return this._tTime=0,this;if(!(d===this._time||r&&this.vars.repeatRefresh&&a!==o))return this;if(p!==this._dur)return this.render(t,e,r)}if(this._tTime=m,this._time=i,!this._act&&this._ts&&(this._act=1,this._lazy=0),this.ratio=h=(f||this._ease)(i/p),this._from&&(this.ratio=h=1-h),!d&&m&&!e&&!o&&(Pt(this,"onStart"),this._tTime!==m))return this;for(n=this._pt;n;)n.r(h,n.d),n=n._next;l&&l.render(t<0?t:l._dur*l._ease(i/this._dur),e,r)||this._startAt&&(this._zTime=t),this._onUpdate&&!e&&(_&&Da(this,t,0,r),Pt(this,"onUpdate")),this._repeat&&a!==o&&this.vars.onRepeat&&!e&&this.parent&&Pt(this,"onRepeat"),m!==this._tDur&&m||this._tTime!==m||(_&&!this._onUpdate&&Da(this,t,0,!0),!t&&p||!(m===this._tDur&&0<this._ts||!m&&this._ts<0)||Aa(this,1),e||_&&!d||!(m||d||u)||(Pt(this,m===c?"onComplete":"onReverseComplete",!0),!this._prom||m<c&&0<this.timeScale()||this._prom()))}}else!function _renderZeroDurationTween(t,e,r,i){var n,a,s,o=t.ratio,u=e<0||!e&&(!t._start&&function _parentPlayheadIsBeforeStart(t){var e=t.parent;return e&&e._ts&&e._initted&&!e._lock&&(e.rawTime()<0||_parentPlayheadIsBeforeStart(e))}(t)&&(t._initted||!bt(t))||(t._ts<0||t._dp._ts<0)&&!bt(t))?0:1,h=t._rDelay,l=0;if(h&&t._repeat&&(l=Mt(0,t._tDur,e),a=Tt(l,h),t._yoyo&&1&a&&(u=1-u),a!==Tt(t._tTime,h)&&(o=1-u,t.vars.repeatRefresh&&t._initted&&t.invalidate())),u!==o||L||i||t._zTime===U||!e&&t._zTime){if(!t._initted&&Na(t,e,i,r,l))return;for(s=t._zTime,t._zTime=e||(r?U:0),r=r||e&&!s,t.ratio=u,t._from&&(u=1-u),t._time=0,t._tTime=l,n=t._pt;n;)n.r(u,n.d),n=n._next;e<0&&Da(t,e,0,!0),t._onUpdate&&!r&&Pt(t,"onUpdate"),l&&t._repeat&&!r&&t.parent&&Pt(t,"onRepeat"),(e>=t._tDur||e<0)&&t.ratio===u&&(u&&Aa(t,1),r||L||(Pt(t,u?"onComplete":"onReverseComplete",!0),t._prom&&t._prom()))}else t._zTime||(t._zTime=e)}(this,t,e,r);return this},e.targets=function targets(){return this._targets},e.invalidate=function invalidate(t){return t&&this.vars.runBackwards||(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(t),E.prototype.invalidate.call(this,t)},e.resetTo=function resetTo(t,e,r,i,n){c||Rt.wake(),this._ts||this.play();var a,s=Math.min(this._dur,(this._dp._time-this._start)*this._ts);return this._initted||Wt(this,s),a=this._ease(s/this._dur),function _updatePropTweens(t,e,r,i,n,a,s,o){var u,h,l,f,d=(t._pt&&t._ptCache||(t._ptCache={}))[e];if(!d)for(d=t._ptCache[e]=[],l=t._ptLookup,f=t._targets.length;f--;){if((u=l[f][e])&&u.d&&u.d._pt)for(u=u.d._pt;u&&u.p!==e&&u.fp!==e;)u=u._next;if(!u)return qt=1,t.vars[e]="+=0",Wt(t,s),qt=0,o?R(e+" not eligible for reset"):1;d.push(u)}for(f=d.length;f--;)(u=(h=d[f])._pt||h).s=!i&&0!==i||n?u.s+(i||0)+a*u.c:i,u.c=r-u.s,h.e&&(h.e=ia(r)+Za(h.e)),h.b&&(h.b=u.s+Za(h.b))}(this,t,e,r,i,a,s,n)?this.resetTo(t,e,r,i,1):(Ja(this,0),this.parent||ya(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},e.kill=function kill(t,e){if(void 0===e&&(e="all"),!(t||e&&"all"!==e))return this._lazy=this._pt=0,this.parent?ub(this):this.scrollTrigger&&this.scrollTrigger.kill(!!L),this;if(this.timeline){var i=this.timeline.totalDuration();return this.timeline.killTweensOf(t,e,Ut&&!0!==Ut.vars.overwrite)._first||ub(this),this.parent&&i!==this.timeline.totalDuration()&&Sa(this,this._dur*this.timeline._tDur/i,0,1),this}var n,a,s,o,u,h,l,f=this._targets,d=t?Ot(t):f,c=this._ptLookup,p=this._pt;if((!e||"all"===e)&&function _arraysMatch(t,e){for(var r=t.length,i=r===e.length;i&&r--&&t[r]===e[r];);return r<0}(f,d))return"all"===e&&(this._pt=0),ub(this);for(n=this._op=this._op||[],"all"!==e&&(r(e)&&(u={},ha(e,function(t){return u[t]=1}),e=u),e=function _addAliasesToVars(t,e){var r,i,n,a,s=t[0]?fa(t[0]).harness:0,o=s&&s.aliases;if(!o)return e;for(i in r=yt({},e),o)if(i in r)for(n=(a=o[i].split(",")).length;n--;)r[a[n]]=r[i];return r}(f,e)),l=f.length;l--;)if(~d.indexOf(f[l]))for(u in a=c[l],"all"===e?(n[l]=e,o=a,s={}):(s=n[l]=n[l]||{},o=e),o)(h=a&&a[u])&&("kill"in h.d&&!0!==h.d.kill(u)||za(this,h,"_pt"),delete a[u]),"all"!==s&&(s[u]=1);return this._initted&&!this._pt&&p&&ub(this),this},Tween.to=function to(t,e,r){return new Tween(t,e,r)},Tween.from=function from(t,e){return Wa(1,arguments)},Tween.delayedCall=function delayedCall(t,e,r,i){return new Tween(e,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:t,onComplete:e,onReverseComplete:e,onCompleteParams:r,onReverseCompleteParams:r,callbackScope:i})},Tween.fromTo=function fromTo(t,e,r){return Wa(2,arguments)},Tween.set=function set(t,e){return e.duration=0,e.repeatDelay||(e.repeat=0),new Tween(t,e)},Tween.killTweensOf=function killTweensOf(t,e,r){return I.killTweensOf(t,e,r)},Tween}(Nt);ra(Jt.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0}),ha("staggerTo,staggerFrom,staggerFromTo",function(r){Jt[r]=function(){var t=new Qt,e=kt.call(arguments,0);return e.splice("staggerFromTo"===r?5:4,0,0),t[r].apply(t,e)}});function pc(t,e,r){return t.setAttribute(e,r)}function xc(t,e,r,i){i.mSet(t,e,i.m.call(i.tween,r,i.mt),i)}var $t=function _setterPlain(t,e,r){return t[e]=r},te=function _setterFunc(t,e,r){return t[e](r)},re=function _setterFuncWithParam(t,e,r,i){return t[e](i.fp,r)},ie=function _getSetter(t,e){return s(t[e])?te:u(t[e])&&t.setAttribute?pc:$t},ne=function _renderPlain(t,e){return e.set(e.t,e.p,Math.round(1e6*(e.s+e.c*t))/1e6,e)},se=function _renderBoolean(t,e){return e.set(e.t,e.p,!!(e.s+e.c*t),e)},oe=function _renderComplexString(t,e){var r=e._pt,i="";if(!t&&e.b)i=e.b;else if(1===t&&e.e)i=e.e;else{for(;r;)i=r.p+(r.m?r.m(r.s+r.c*t):Math.round(1e4*(r.s+r.c*t))/1e4)+i,r=r._next;i+=e.c}e.set(e.t,e.p,i,e)},ue=function _renderPropTweens(t,e){for(var r=e._pt;r;)r.r(t,r.d),r=r._next},he=function _addPluginModifier(t,e,r,i){for(var n,a=this._pt;a;)n=a._next,a.p===i&&a.modifier(t,e,r),a=n},de=function _killPropTweensOf(t){for(var e,r,i=this._pt;i;)r=i._next,i.p===t&&!i.op||i.op===t?za(this,i,"_pt"):i.dep||(e=1),i=r;return!e},_e=function _sortPropTweensByPriority(t){for(var e,r,i,n,a=t._pt;a;){for(e=a._next,r=i;r&&r.pr>a.pr;)r=r._next;(a._prev=r?r._prev:n)?a._prev._next=a:i=a,(a._next=r)?r._prev=a:n=a,a=e}t._pt=i},ge=(PropTween.prototype.modifier=function modifier(t,e,r){this.mSet=this.mSet||this.set,this.set=xc,this.m=t,this.mt=r,this.tween=e},PropTween);function PropTween(t,e,r,i,n,a,s,o,u){this.t=e,this.s=i,this.c=n,this.p=r,this.r=a||ne,this.d=s||this,this.set=o||$t,this.pr=u||0,(this._next=t)&&(t._prev=this)}ha(vt+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",function(t){return ft[t]=1}),ot.TweenMax=ot.TweenLite=Jt,ot.TimelineLite=ot.TimelineMax=Qt,I=new Qt({sortChildren:!1,defaults:Z,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0}),X.stringFilter=Gb;function Fc(t){return(be[t]||Me).map(function(t){return t()})}function Gc(){var t=Date.now(),o=[];2<t-Oe&&(Fc("matchMediaInit"),Te.forEach(function(t){var e,r,i,n,a=t.queries,s=t.conditions;for(r in a)(e=h.matchMedia(a[r]).matches)&&(i=1),e!==s[r]&&(s[r]=e,n=1);n&&(t.revert(),i&&o.push(t))}),Fc("matchMediaRevert"),o.forEach(function(e){return e.onMatch(e,function(t){return e.add(null,t)})}),Oe=t,Fc("matchMedia"))}var ve,Te=[],be={},Me=[],Oe=0,Ae=0,Pe=((ve=Context.prototype).add=function add(t,i,n){function Iw(){var t,e=l,r=a.selector;return e&&e!==a&&e.data.push(a),n&&(a.selector=db(n)),l=a,t=i.apply(a,arguments),s(t)&&a._r.push(t),l=e,a.selector=r,a.isReverted=!1,t}s(t)&&(n=i,i=t,t=s);var a=this;return a.last=Iw,t===s?Iw(a,function(t){return a.add(null,t)}):t?a[t]=Iw:Iw},ve.ignore=function ignore(t){var e=l;l=null,t(this),l=e},ve.getTweens=function getTweens(){var e=[];return this.data.forEach(function(t){return t instanceof Context?e.push.apply(e,t.getTweens()):t instanceof Jt&&!(t.parent&&"nested"===t.parent.data)&&e.push(t)}),e},ve.clear=function clear(){this._r.length=this.data.length=0},ve.kill=function kill(i,t){var n=this;if(i?function(){for(var t,e=n.getTweens(),r=n.data.length;r--;)"isFlip"===(t=n.data[r]).data&&(t.revert(),t.getChildren(!0,!0,!1).forEach(function(t){return e.splice(e.indexOf(t),1)}));for(e.map(function(t){return{g:t._dur||t._delay||t._sat&&!t._sat.vars.immediateRender?t.globalTime(0):-1/0,t:t}}).sort(function(t,e){return e.g-t.g||-1/0}).forEach(function(t){return t.t.revert(i)}),r=n.data.length;r--;)(t=n.data[r])instanceof Qt?"nested"!==t.data&&(t.scrollTrigger&&t.scrollTrigger.revert(),t.kill()):t instanceof Jt||!t.revert||t.revert(i);n._r.forEach(function(t){return t(i,n)}),n.isReverted=!0}():this.data.forEach(function(t){return t.kill&&t.kill()}),this.clear(),t)for(var e=Te.length;e--;)Te[e].id===this.id&&Te.splice(e,1)},ve.revert=function revert(t){this.kill(t||{})},Context);function Context(t,e){this.selector=e&&db(e),this.data=[],this._r=[],this.isReverted=!1,this.id=Ae++,t&&this.add(t)}var Ce,Se=((Ce=MatchMedia.prototype).add=function add(t,e,r){v(t)||(t={matches:t});var i,n,a,s=new Pe(0,r||this.scope),o=s.conditions={};for(n in l&&!s.selector&&(s.selector=l.selector),this.contexts.push(s),e=s.add("onMatch",e),s.queries=t)"all"===n?a=1:(i=h.matchMedia(t[n]))&&(Te.indexOf(s)<0&&Te.push(s),(o[n]=i.matches)&&(a=1),i.addListener?i.addListener(Gc):i.addEventListener("change",Gc));return a&&e(s,function(t){return s.add(null,t)}),this},Ce.revert=function revert(t){this.kill(t||{})},Ce.kill=function kill(e){this.contexts.forEach(function(t){return t.kill(e,!0)})},MatchMedia);function MatchMedia(t){this.contexts=[],this.scope=t,l&&l.data.push(this)}var De={registerPlugin:function registerPlugin(){for(var t=arguments.length,e=new Array(t),r=0;r<t;r++)e[r]=arguments[r];e.forEach(function(t){return xb(t)})},timeline:function timeline(t){return new Qt(t)},getTweensOf:function getTweensOf(t,e){return I.getTweensOf(t,e)},getProperty:function getProperty(i,t,e,n){r(i)&&(i=Ot(i)[0]);var a=fa(i||{}).get,s=e?qa:pa;return"native"===e&&(e=""),i?t?s((pt[t]&&pt[t].get||a)(i,t,e,n)):function(t,e,r){return s((pt[t]&&pt[t].get||a)(i,t,e,r))}:i},quickSetter:function quickSetter(r,e,i){if(1<(r=Ot(r)).length){var n=r.map(function(t){return ze.quickSetter(t,e,i)}),a=n.length;return function(t){for(var e=a;e--;)n[e](t)}}r=r[0]||{};var s=pt[e],o=fa(r),u=o.harness&&(o.harness.aliases||{})[e]||e,h=s?function(t){var e=new s;d._pt=0,e.init(r,i?t+i:t,d,0,[r]),e.render(1,e),d._pt&&ue(1,d)}:o.set(r,u);return s?h:function(t){return h(r,u,i?t+i:t,o,1)}},quickTo:function quickTo(t,i,e){function ay(t,e,r){return n.resetTo(i,t,e,r)}var r,n=ze.to(t,ra(((r={})[i]="+=0.1",r.paused=!0,r.stagger=0,r),e||{}));return ay.tween=n,ay},isTweening:function isTweening(t){return 0<I.getTweensOf(t,!0).length},defaults:function defaults(t){return t&&t.ease&&(t.ease=Yt(t.ease,Z.ease)),ua(Z,t||{})},config:function config(t){return ua(X,t||{})},registerEffect:function registerEffect(t){var i=t.name,n=t.effect,e=t.plugins,a=t.defaults,r=t.extendTimeline;(e||"").split(",").forEach(function(t){return t&&!pt[t]&&!ot[t]&&R(i+" effect requires "+t+" plugin.")}),_t[i]=function(t,e,r){return n(Ot(t),ra(e||{},a),r)},r&&(Qt.prototype[i]=function(t,e,r){return this.add(_t[i](t,v(e)?e:(r=e)&&{},this),r)})},registerEase:function registerEase(t,e){Lt[t]=Yt(e)},parseEase:function parseEase(t,e){return arguments.length?Yt(t,e):Lt},getById:function getById(t){return I.getById(t)},exportRoot:function exportRoot(t,e){void 0===t&&(t={});var r,i,n=new Qt(t);for(n.smoothChildTiming=w(t.smoothChildTiming),I.remove(n),n._dp=0,n._time=n._tTime=I._time,r=I._first;r;)i=r._next,!e&&!r._dur&&r instanceof Jt&&r.vars.onComplete===r._targets[0]||La(n,r,r._start-r._delay),r=i;return La(I,n,0),n},context:function context(t,e){return t?new Pe(t,e):l},matchMedia:function matchMedia(t){return new Se(t)},matchMediaRefresh:function matchMediaRefresh(){return Te.forEach(function(t){var e,r,i=t.conditions;for(r in i)i[r]&&(i[r]=!1,e=1);e&&t.revert()})||Gc()},addEventListener:function addEventListener(t,e){var r=be[t]||(be[t]=[]);~r.indexOf(e)||r.push(e)},removeEventListener:function removeEventListener(t,e){var r=be[t],i=r&&r.indexOf(e);0<=i&&r.splice(i,1)},utils:{wrap:function wrap(e,t,r){var i=t-e;return $(e)?mb(e,wrap(0,e.length),t):Xa(r,function(t){return(i+(t-e)%i)%i+e})},wrapYoyo:function wrapYoyo(e,t,r){var i=t-e,n=2*i;return $(e)?mb(e,wrapYoyo(0,e.length-1),t):Xa(r,function(t){return e+(i<(t=(n+(t-e)%n)%n||0)?n-t:t)})},distribute:fb,random:ib,snap:hb,normalize:function normalize(t,e,r){return At(t,e,0,1,r)},getUnit:Za,clamp:function clamp(e,r,t){return Xa(t,function(t){return Mt(e,r,t)})},splitColor:Bb,toArray:Ot,selector:db,mapRange:At,pipe:function pipe(){for(var t=arguments.length,e=new Array(t),r=0;r<t;r++)e[r]=arguments[r];return function(t){return e.reduce(function(t,e){return e(t)},t)}},unitize:function unitize(e,r){return function(t){return e(parseFloat(t))+(r||Za(t))}},interpolate:function interpolate(e,i,t,n){var a=isNaN(e+i)?0:function(t){return(1-t)*e+t*i};if(!a){var s,o,u,h,l,f=r(e),d={};if(!0===t&&(n=1)&&(t=null),f)e={p:e},i={p:i};else if($(e)&&!$(i)){for(u=[],h=e.length,l=h-2,o=1;o<h;o++)u.push(interpolate(e[o-1],e[o]));h--,a=function func(t){t*=h;var e=Math.min(l,~~t);return u[e](t-e)},t=i}else n||(e=yt($(e)?[]:{},e));if(!u){for(s in i)Vt.call(d,e,s,"get",i[s]);a=function func(t){return ue(t,d)||(f?e.p:e)}}}return Xa(t,a)},shuffle:eb},install:P,effects:_t,ticker:Rt,updateRoot:Qt.updateRoot,plugins:pt,globalTimeline:I,core:{PropTween:ge,globals:S,Tween:Jt,Timeline:Qt,Animation:Nt,getCache:fa,_removeLinkedListItem:za,reverting:function reverting(){return L},context:function context(t){return t&&l&&(l.data.push(t),t._ctx=l),l},suppressOverwrites:function suppressOverwrites(t){return F=t}}};ha("to,from,fromTo,delayedCall,set,killTweensOf",function(t){return De[t]=Jt[t]}),Rt.add(Qt.updateRoot),d=De.to({},{duration:0});function Kc(t,e){for(var r=t._pt;r&&r.p!==e&&r.op!==e&&r.fp!==e;)r=r._next;return r}function Mc(t,a){return{name:t,headless:1,rawVars:1,init:function init(t,n,e){e._onInit=function(t){var e,i;if(r(n)&&(e={},ha(n,function(t){return e[t]=1}),n=e),a){for(i in e={},n)e[i]=a(n[i]);n=e}!function _addModifiers(t,e){var r,i,n,a=t._targets;for(r in e)for(i=a.length;i--;)(n=(n=t._ptLookup[i][r])&&n.d)&&(n._pt&&(n=Kc(n,r)),n&&n.modifier&&n.modifier(e[r],t,a[i],r))}(t,n)}}}}var ze=De.registerPlugin({name:"attr",init:function init(t,e,r,i,n){var a,s,o;for(a in this.tween=r,e)o=t.getAttribute(a)||"",(s=this.add(t,"setAttribute",(o||0)+"",e[a],i,n,0,0,a)).op=a,s.b=o,this._props.push(a)},render:function render(t,e){for(var r=e._pt;r;)L?r.set(r.t,r.p,r.b,r):r.r(t,r.d),r=r._next}},{name:"endArray",headless:1,init:function init(t,e){for(var r=e.length;r--;)this.add(t,r,t[r]||0,e[r],0,0,0,0,0,1)}},Mc("roundProps",gb),Mc("modifiers"),Mc("snap",hb))||De;Jt.version=Qt.version=ze.version="3.13.0",o=1,x()&&Ft();function wd(t,e){return e.set(e.t,e.p,Math.round(1e4*(e.s+e.c*t))/1e4+e.u,e)}function xd(t,e){return e.set(e.t,e.p,1===t?e.e:Math.round(1e4*(e.s+e.c*t))/1e4+e.u,e)}function yd(t,e){return e.set(e.t,e.p,t?Math.round(1e4*(e.s+e.c*t))/1e4+e.u:e.b,e)}function zd(t,e){var r=e.s+e.c*t;e.set(e.t,e.p,~~(r+(r<0?-.5:.5))+e.u,e)}function Ad(t,e){return e.set(e.t,e.p,t?e.e:e.b,e)}function Bd(t,e){return e.set(e.t,e.p,1!==t?e.b:e.e,e)}function Cd(t,e,r){return t.style[e]=r}function Dd(t,e,r){return t.style.setProperty(e,r)}function Ed(t,e,r){return t._gsap[e]=r}function Fd(t,e,r){return t._gsap.scaleX=t._gsap.scaleY=r}function Gd(t,e,r,i,n){var a=t._gsap;a.scaleX=a.scaleY=r,a.renderTransform(n,a)}function Hd(t,e,r,i,n){var a=t._gsap;a[e]=r,a.renderTransform(n,a)}function Kd(t,e){var r=this,i=this.target,n=i.style,a=i._gsap;if(t in sr&&n){if(this.tfm=this.tfm||{},"transform"===t)return cr.transform.split(",").forEach(function(t){return Kd.call(r,t,e)});if(~(t=cr[t]||t).indexOf(",")?t.split(",").forEach(function(t){return r.tfm[t]=Tr(i,t)}):this.tfm[t]=a.x?a[t]:Tr(i,t),t===_r&&(this.tfm.zOrigin=a.zOrigin),0<=this.props.indexOf(pr))return;a.svg&&(this.svgo=i.getAttribute("data-svg-origin"),this.props.push(_r,e,"")),t=pr}(n||e)&&this.props.push(t,e,n[t])}function Ld(t){t.translate&&(t.removeProperty("translate"),t.removeProperty("scale"),t.removeProperty("rotate"))}function Md(){var t,e,r=this.props,i=this.target,n=i.style,a=i._gsap;for(t=0;t<r.length;t+=3)r[t+1]?2===r[t+1]?i[r[t]](r[t+2]):i[r[t]]=r[t+2]:r[t+2]?n[r[t]]=r[t+2]:n.removeProperty("--"===r[t].substr(0,2)?r[t]:r[t].replace(lr,"-$1").toLowerCase());if(this.tfm){for(e in this.tfm)a[e]=this.tfm[e];a.svg&&(a.renderTransform(),i.setAttribute("data-svg-origin",this.svgo||"")),(t=Ye())&&t.isStart||n[pr]||(Ld(n),a.zOrigin&&n[_r]&&(n[_r]+=" "+a.zOrigin+"px",a.zOrigin=0,a.renderTransform()),a.uncache=1)}}function Nd(t,e){var r={target:t,props:[],revert:Md,save:Kd};return t._gsap||ze.core.getCache(t),e&&t.style&&t.nodeType&&e.split(",").forEach(function(t){return r.save(t)}),r}function Pd(t,e){var r=Re.createElementNS?Re.createElementNS((e||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),t):Re.createElement(t);return r&&r.style?r:Re.createElement(t)}function Qd(t,e,r){var i=getComputedStyle(t);return i[e]||i.getPropertyValue(e.replace(lr,"-$1").toLowerCase())||i.getPropertyValue(e)||!r&&Qd(t,gr(e)||e,1)||""}function Td(){(function _windowExists(){return"undefined"!=typeof window})()&&window.document&&(Ee=window,Re=Ee.document,Fe=Re.documentElement,Ie=Pd("div")||{style:{}},Pd("div"),pr=gr(pr),_r=pr+"Origin",Ie.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",Xe=!!gr("perspective"),Ye=ze.core.reverting,Le=1)}function Ud(t){var e,r=t.ownerSVGElement,i=Pd("svg",r&&r.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),n=t.cloneNode(!0);n.style.display="block",i.appendChild(n),Fe.appendChild(i);try{e=n.getBBox()}catch(t){}return i.removeChild(n),Fe.removeChild(i),e}function Vd(t,e){for(var r=e.length;r--;)if(t.hasAttribute(e[r]))return t.getAttribute(e[r])}function Wd(e){var r,i;try{r=e.getBBox()}catch(t){r=Ud(e),i=1}return r&&(r.width||r.height)||i||(r=Ud(e)),!r||r.width||r.x||r.y?r:{x:+Vd(e,["x","cx","x1"])||0,y:+Vd(e,["y","cy","y1"])||0,width:0,height:0}}function Xd(t){return!(!t.getCTM||t.parentNode&&!t.ownerSVGElement||!Wd(t))}function Yd(t,e){if(e){var r,i=t.style;e in sr&&e!==_r&&(e=pr),i.removeProperty?("ms"!==(r=e.substr(0,2))&&"webkit"!==e.substr(0,6)||(e="-"+e),i.removeProperty("--"===r?e:e.replace(lr,"-$1").toLowerCase())):i.removeAttribute(e)}}function Zd(t,e,r,i,n,a){var s=new ge(t._pt,e,r,0,1,a?Bd:Ad);return(t._pt=s).b=i,s.e=n,t._props.push(r),s}function ae(t,e,r,i){var n,a,s,o,u=parseFloat(r)||0,h=(r+"").trim().substr((u+"").length)||"px",l=Ie.style,f=fr.test(e),d="svg"===t.tagName.toLowerCase(),c=(d?"client":"offset")+(f?"Width":"Height"),p="px"===i,_="%"===i;if(i===h||!u||vr[i]||vr[h])return u;if("px"===h||p||(u=ae(t,e,r,"px")),o=t.getCTM&&Xd(t),(_||"%"===h)&&(sr[e]||~e.indexOf("adius")))return n=o?t.getBBox()[f?"width":"height"]:t[c],ia(_?u/n*100:u/100*n);if(l[f?"width":"height"]=100+(p?h:i),a="rem"!==i&&~e.indexOf("adius")||"em"===i&&t.appendChild&&!d?t:t.parentNode,o&&(a=(t.ownerSVGElement||{}).parentNode),a&&a!==Re&&a.appendChild||(a=Re.body),(s=a._gsap)&&_&&s.width&&f&&s.time===Rt.time&&!s.uncache)return ia(u/s.width*100);if(!_||"height"!==e&&"width"!==e)!_&&"%"!==h||yr[Qd(a,"display")]||(l.position=Qd(t,"position")),a===t&&(l.position="static"),a.appendChild(Ie),n=Ie[c],a.removeChild(Ie),l.position="absolute";else{var m=t.style[e];t.style[e]=100+i,n=t[c],m?t.style[e]=m:Yd(t,e)}return f&&_&&((s=fa(a)).time=Rt.time,s.width=a[c]),ia(p?n*u/100:n&&u?100/n*u:0)}function ce(t,e,r,i){if(!r||"none"===r){var n=gr(e,t,1),a=n&&Qd(t,n,1);a&&a!==r?(e=n,r=a):"borderColor"===e&&(r=Qd(t,"borderTopColor"))}var s,o,u,h,l,f,d,c,p,_,m,g=new ge(this._pt,t.style,e,0,1,oe),v=0,y=0;if(g.b=r,g.e=i,r+="","var(--"===(i+="").substring(0,6)&&(i=Qd(t,i.substring(4,i.indexOf(")")))),"auto"===i&&(f=t.style[e],t.style[e]=i,i=Qd(t,e)||i,f?t.style[e]=f:Yd(t,e)),Gb(s=[r,i]),i=s[1],u=(r=s[0]).match(rt)||[],(i.match(rt)||[]).length){for(;o=rt.exec(i);)d=o[0],p=i.substring(v,o.index),l?l=(l+1)%5:"rgba("!==p.substr(-5)&&"hsla("!==p.substr(-5)||(l=1),d!==(f=u[y++]||"")&&(h=parseFloat(f)||0,m=f.substr((h+"").length),"="===d.charAt(1)&&(d=ka(h,d)+m),c=parseFloat(d),_=d.substr((c+"").length),v=rt.lastIndex-_.length,_||(_=_||X.units[e]||m,v===i.length&&(i+=_,g.e+=_)),m!==_&&(h=ae(t,e,f,_)||0),g._pt={_next:g._pt,p:p||1===y?p:",",s:h,c:c-h,m:l&&l<4||"zIndex"===e?Math.round:0});g.c=v<i.length?i.substring(v,i.length):""}else g.r="display"===e&&"none"===i?Bd:Ad;return nt.test(i)&&(g.e=0),this._pt=g}function ee(t){var e=t.split(" "),r=e[0],i=e[1]||"50%";return"top"!==r&&"bottom"!==r&&"left"!==i&&"right"!==i||(t=r,r=i,i=t),e[0]=br[r]||r,e[1]=br[i]||i,e.join(" ")}function fe(t,e){if(e.tween&&e.tween._time===e.tween._dur){var r,i,n,a=e.t,s=a.style,o=e.u,u=a._gsap;if("all"===o||!0===o)s.cssText="",i=1;else for(n=(o=o.split(",")).length;-1<--n;)r=o[n],sr[r]&&(i=1,r="transformOrigin"===r?_r:pr),Yd(a,r);i&&(Yd(a,pr),u&&(u.svg&&a.removeAttribute("transform"),s.scale=s.rotate=s.translate="none",kr(a,1),u.uncache=1,Ld(s)))}}function je(t){return"matrix(1, 0, 0, 1, 0, 0)"===t||"none"===t||!t}function ke(t){var e=Qd(t,pr);return je(e)?xr:e.substr(7).match(et).map(ia)}function le(t,e){var r,i,n,a,s=t._gsap||fa(t),o=t.style,u=ke(t);return s.svg&&t.getAttribute("transform")?"1,0,0,1,0,0"===(u=[(n=t.transform.baseVal.consolidate().matrix).a,n.b,n.c,n.d,n.e,n.f]).join(",")?xr:u:(u!==xr||t.offsetParent||t===Fe||s.svg||(n=o.display,o.display="block",(r=t.parentNode)&&(t.offsetParent||t.getBoundingClientRect().width)||(a=1,i=t.nextElementSibling,Fe.appendChild(t)),u=ke(t),n?o.display=n:Yd(t,"display"),a&&(i?r.insertBefore(t,i):r?r.appendChild(t):Fe.removeChild(t))),e&&6<u.length?[u[0],u[1],u[4],u[5],u[12],u[13]]:u)}function me(t,e,r,i,n,a){var s,o,u,h=t._gsap,l=n||le(t,!0),f=h.xOrigin||0,d=h.yOrigin||0,c=h.xOffset||0,p=h.yOffset||0,_=l[0],m=l[1],g=l[2],v=l[3],y=l[4],T=l[5],b=e.split(" "),w=parseFloat(b[0])||0,x=parseFloat(b[1])||0;r?l!==xr&&(o=_*v-m*g)&&(u=w*(-m/o)+x*(_/o)-(_*T-m*y)/o,w=w*(v/o)+x*(-g/o)+(g*T-v*y)/o,x=u):(w=(s=Wd(t)).x+(~b[0].indexOf("%")?w/100*s.width:w),x=s.y+(~(b[1]||b[0]).indexOf("%")?x/100*s.height:x)),i||!1!==i&&h.smooth?(y=w-f,T=x-d,h.xOffset=c+(y*_+T*g)-y,h.yOffset=p+(y*m+T*v)-T):h.xOffset=h.yOffset=0,h.xOrigin=w,h.yOrigin=x,h.smooth=!!i,h.origin=e,h.originIsAbsolute=!!r,t.style[_r]="0px 0px",a&&(Zd(a,h,"xOrigin",f,w),Zd(a,h,"yOrigin",d,x),Zd(a,h,"xOffset",c,h.xOffset),Zd(a,h,"yOffset",p,h.yOffset)),t.setAttribute("data-svg-origin",w+" "+x)}function pe(t,e,r){var i=Za(e);return ia(parseFloat(e)+parseFloat(ae(t,"x",r+"px",i)))+i}function we(t,e,i,n,a){var s,o,u=360,h=r(a),l=parseFloat(a)*(h&&~a.indexOf("rad")?or:1)-n,f=n+l+"deg";return h&&("short"===(s=a.split("_")[1])&&(l%=u)!==l%180&&(l+=l<0?u:-u),"cw"===s&&l<0?l=(l+36e9)%u-~~(l/u)*u:"ccw"===s&&0<l&&(l=(l-36e9)%u-~~(l/u)*u)),t._pt=o=new ge(t._pt,e,i,n,l,xd),o.e=f,o.u="deg",t._props.push(i),o}function xe(t,e){for(var r in e)t[r]=e[r];return t}function ye(t,e,r){var i,n,a,s,o,u,h,l=xe({},r._gsap),f=r.style;for(n in l.svg?(a=r.getAttribute("transform"),r.setAttribute("transform",""),f[pr]=e,i=kr(r,1),Yd(r,pr),r.setAttribute("transform",a)):(a=getComputedStyle(r)[pr],f[pr]=e,i=kr(r,1),f[pr]=a),sr)(a=l[n])!==(s=i[n])&&"perspective,force3D,transformOrigin,svgOrigin".indexOf(n)<0&&(o=Za(a)!==(h=Za(s))?ae(r,n,a,h):parseFloat(a),u=parseFloat(s),t._pt=new ge(t._pt,i,n,o,u-o,wd),t._pt.u=h||0,t._props.push(n));xe(i,l)}var Ee,Re,Fe,Le,Ie,Be,Ye,Xe,Ze=Lt.Power0,Ne=Lt.Power1,Qe=Lt.Power2,Ue=Lt.Power3,qe=Lt.Power4,Ve=Lt.Linear,We=Lt.Quad,Ge=Lt.Cubic,He=Lt.Quart,Ke=Lt.Quint,Je=Lt.Strong,$e=Lt.Elastic,tr=Lt.Back,er=Lt.SteppedEase,rr=Lt.Bounce,ir=Lt.Sine,nr=Lt.Expo,ar=Lt.Circ,sr={},or=180/Math.PI,ur=Math.PI/180,hr=Math.atan2,lr=/([A-Z])/g,fr=/(left|right|width|margin|padding|x)/i,dr=/[\s,\(]\S/,cr={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},pr="transform",_r=pr+"Origin",mr="O,Moz,ms,Ms,Webkit".split(","),gr=function _checkPropPrefix(t,e,r){var i=(e||Ie).style,n=5;if(t in i&&!r)return t;for(t=t.charAt(0).toUpperCase()+t.substr(1);n--&&!(mr[n]+t in i););return n<0?null:(3===n?"ms":0<=n?mr[n]:"")+t},vr={deg:1,rad:1,turn:1},yr={grid:1,flex:1},Tr=function _get(t,e,r,i){var n;return Le||Td(),e in cr&&"transform"!==e&&~(e=cr[e]).indexOf(",")&&(e=e.split(",")[0]),sr[e]&&"transform"!==e?(n=kr(t,i),n="transformOrigin"!==e?n[e]:n.svg?n.origin:Or(Qd(t,_r))+" "+n.zOrigin+"px"):(n=t.style[e])&&"auto"!==n&&!i&&!~(n+"").indexOf("calc(")||(n=wr[e]&&wr[e](t,e,r)||Qd(t,e)||ga(t,e)||("opacity"===e?1:0)),r&&!~(n+"").trim().indexOf(" ")?ae(t,e,n,r)+r:n},br={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},wr={clearProps:function clearProps(t,e,r,i,n){if("isFromStart"!==n.data){var a=t._pt=new ge(t._pt,e,r,0,0,fe);return a.u=i,a.pr=-10,a.tween=n,t._props.push(r),1}}},xr=[1,0,0,1,0,0],Mr={},kr=function _parseTransform(t,e){var r=t._gsap||new Zt(t);if("x"in r&&!e&&!r.uncache)return r;var i,n,a,s,o,u,h,l,f,d,c,p,_,m,g,v,y,T,b,w,x,M,k,O,A,P,C,S,D,z,E,R,F=t.style,L=r.scaleX<0,I="deg",B=getComputedStyle(t),j=Qd(t,_r)||"0";return i=n=a=u=h=l=f=d=c=0,s=o=1,r.svg=!(!t.getCTM||!Xd(t)),B.translate&&("none"===B.translate&&"none"===B.scale&&"none"===B.rotate||(F[pr]=("none"!==B.translate?"translate3d("+(B.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+("none"!==B.rotate?"rotate("+B.rotate+") ":"")+("none"!==B.scale?"scale("+B.scale.split(" ").join(",")+") ":"")+("none"!==B[pr]?B[pr]:"")),F.scale=F.rotate=F.translate="none"),m=le(t,r.svg),r.svg&&(O=r.uncache?(A=t.getBBox(),j=r.xOrigin-A.x+"px "+(r.yOrigin-A.y)+"px",""):!e&&t.getAttribute("data-svg-origin"),me(t,O||j,!!O||r.originIsAbsolute,!1!==r.smooth,m)),p=r.xOrigin||0,_=r.yOrigin||0,m!==xr&&(T=m[0],b=m[1],w=m[2],x=m[3],i=M=m[4],n=k=m[5],6===m.length?(s=Math.sqrt(T*T+b*b),o=Math.sqrt(x*x+w*w),u=T||b?hr(b,T)*or:0,(f=w||x?hr(w,x)*or+u:0)&&(o*=Math.abs(Math.cos(f*ur))),r.svg&&(i-=p-(p*T+_*w),n-=_-(p*b+_*x))):(R=m[6],z=m[7],C=m[8],S=m[9],D=m[10],E=m[11],i=m[12],n=m[13],a=m[14],h=(g=hr(R,D))*or,g&&(O=M*(v=Math.cos(-g))+C*(y=Math.sin(-g)),A=k*v+S*y,P=R*v+D*y,C=M*-y+C*v,S=k*-y+S*v,D=R*-y+D*v,E=z*-y+E*v,M=O,k=A,R=P),l=(g=hr(-w,D))*or,g&&(v=Math.cos(-g),E=x*(y=Math.sin(-g))+E*v,T=O=T*v-C*y,b=A=b*v-S*y,w=P=w*v-D*y),u=(g=hr(b,T))*or,g&&(O=T*(v=Math.cos(g))+b*(y=Math.sin(g)),A=M*v+k*y,b=b*v-T*y,k=k*v-M*y,T=O,M=A),h&&359.9<Math.abs(h)+Math.abs(u)&&(h=u=0,l=180-l),s=ia(Math.sqrt(T*T+b*b+w*w)),o=ia(Math.sqrt(k*k+R*R)),g=hr(M,k),f=2e-4<Math.abs(g)?g*or:0,c=E?1/(E<0?-E:E):0),r.svg&&(O=t.getAttribute("transform"),r.forceCSS=t.setAttribute("transform","")||!je(Qd(t,pr)),O&&t.setAttribute("transform",O))),90<Math.abs(f)&&Math.abs(f)<270&&(L?(s*=-1,f+=u<=0?180:-180,u+=u<=0?180:-180):(o*=-1,f+=f<=0?180:-180)),e=e||r.uncache,r.x=i-((r.xPercent=i&&(!e&&r.xPercent||(Math.round(t.offsetWidth/2)===Math.round(-i)?-50:0)))?t.offsetWidth*r.xPercent/100:0)+"px",r.y=n-((r.yPercent=n&&(!e&&r.yPercent||(Math.round(t.offsetHeight/2)===Math.round(-n)?-50:0)))?t.offsetHeight*r.yPercent/100:0)+"px",r.z=a+"px",r.scaleX=ia(s),r.scaleY=ia(o),r.rotation=ia(u)+I,r.rotationX=ia(h)+I,r.rotationY=ia(l)+I,r.skewX=f+I,r.skewY=d+I,r.transformPerspective=c+"px",(r.zOrigin=parseFloat(j.split(" ")[2])||!e&&r.zOrigin||0)&&(F[_r]=Or(j)),r.xOffset=r.yOffset=0,r.force3D=X.force3D,r.renderTransform=r.svg?zr:Xe?Dr:Ar,r.uncache=0,r},Or=function _firstTwoOnly(t){return(t=t.split(" "))[0]+" "+t[1]},Ar=function _renderNon3DTransforms(t,e){e.z="0px",e.rotationY=e.rotationX="0deg",e.force3D=0,Dr(t,e)},Pr="0deg",Cr="0px",Sr=") ",Dr=function _renderCSSTransforms(t,e){var r=e||this,i=r.xPercent,n=r.yPercent,a=r.x,s=r.y,o=r.z,u=r.rotation,h=r.rotationY,l=r.rotationX,f=r.skewX,d=r.skewY,c=r.scaleX,p=r.scaleY,_=r.transformPerspective,m=r.force3D,g=r.target,v=r.zOrigin,y="",T="auto"===m&&t&&1!==t||!0===m;if(v&&(l!==Pr||h!==Pr)){var b,w=parseFloat(h)*ur,x=Math.sin(w),M=Math.cos(w);w=parseFloat(l)*ur,b=Math.cos(w),a=pe(g,a,x*b*-v),s=pe(g,s,-Math.sin(w)*-v),o=pe(g,o,M*b*-v+v)}_!==Cr&&(y+="perspective("+_+Sr),(i||n)&&(y+="translate("+i+"%, "+n+"%) "),!T&&a===Cr&&s===Cr&&o===Cr||(y+=o!==Cr||T?"translate3d("+a+", "+s+", "+o+") ":"translate("+a+", "+s+Sr),u!==Pr&&(y+="rotate("+u+Sr),h!==Pr&&(y+="rotateY("+h+Sr),l!==Pr&&(y+="rotateX("+l+Sr),f===Pr&&d===Pr||(y+="skew("+f+", "+d+Sr),1===c&&1===p||(y+="scale("+c+", "+p+Sr),g.style[pr]=y||"translate(0, 0)"},zr=function _renderSVGTransforms(t,e){var r,i,n,a,s,o=e||this,u=o.xPercent,h=o.yPercent,l=o.x,f=o.y,d=o.rotation,c=o.skewX,p=o.skewY,_=o.scaleX,m=o.scaleY,g=o.target,v=o.xOrigin,y=o.yOrigin,T=o.xOffset,b=o.yOffset,w=o.forceCSS,x=parseFloat(l),M=parseFloat(f);d=parseFloat(d),c=parseFloat(c),(p=parseFloat(p))&&(c+=p=parseFloat(p),d+=p),d||c?(d*=ur,c*=ur,r=Math.cos(d)*_,i=Math.sin(d)*_,n=Math.sin(d-c)*-m,a=Math.cos(d-c)*m,c&&(p*=ur,s=Math.tan(c-p),n*=s=Math.sqrt(1+s*s),a*=s,p&&(s=Math.tan(p),r*=s=Math.sqrt(1+s*s),i*=s)),r=ia(r),i=ia(i),n=ia(n),a=ia(a)):(r=_,a=m,i=n=0),(x&&!~(l+"").indexOf("px")||M&&!~(f+"").indexOf("px"))&&(x=ae(g,"x",l,"px"),M=ae(g,"y",f,"px")),(v||y||T||b)&&(x=ia(x+v-(v*r+y*n)+T),M=ia(M+y-(v*i+y*a)+b)),(u||h)&&(s=g.getBBox(),x=ia(x+u/100*s.width),M=ia(M+h/100*s.height)),s="matrix("+r+","+i+","+n+","+a+","+x+","+M+")",g.setAttribute("transform",s),w&&(g.style[pr]=s)};ha("padding,margin,Width,Radius",function(e,r){var t="Right",i="Bottom",n="Left",o=(r<3?["Top",t,i,n]:["Top"+n,"Top"+t,i+t,i+n]).map(function(t){return r<2?e+t:"border"+t+e});wr[1<r?"border"+e:e]=function(e,t,r,i,n){var a,s;if(arguments.length<4)return a=o.map(function(t){return Tr(e,t,r)}),5===(s=a.join(" ")).split(a[0]).length?a[0]:s;a=(i+"").split(" "),s={},o.forEach(function(t,e){return s[t]=a[e]=a[e]||a[(e-1)/2|0]}),e.init(t,s,n)}});var Er,Rr,Fr,Lr={name:"css",register:Td,targetTest:function targetTest(t){return t.style&&t.nodeType},init:function init(t,e,i,n,a){var s,o,u,h,l,f,d,c,p,_,m,g,v,y,T,b,w=this._props,x=t.style,M=i.vars.startAt;for(d in Le||Td(),this.styles=this.styles||Nd(t),b=this.styles.props,this.tween=i,e)if("autoRound"!==d&&(o=e[d],!pt[d]||!bc(d,e,i,n,t,a)))if(l=typeof o,f=wr[d],"function"===l&&(l=typeof(o=o.call(i,n,t,a))),"string"===l&&~o.indexOf("random(")&&(o=pb(o)),f)f(this,t,d,o,i)&&(T=1);else if("--"===d.substr(0,2))s=(getComputedStyle(t).getPropertyValue(d)+"").trim(),o+="",zt.lastIndex=0,zt.test(s)||(c=Za(s),p=Za(o)),p?c!==p&&(s=ae(t,d,s,p)+p):c&&(o+=c),this.add(x,"setProperty",s,o,n,a,0,0,d),w.push(d),b.push(d,0,x[d]);else if("undefined"!==l){if(M&&d in M?(s="function"==typeof M[d]?M[d].call(i,n,t,a):M[d],r(s)&&~s.indexOf("random(")&&(s=pb(s)),Za(s+"")||"auto"===s||(s+=X.units[d]||Za(Tr(t,d))||""),"="===(s+"").charAt(1)&&(s=Tr(t,d))):s=Tr(t,d),h=parseFloat(s),(_="string"===l&&"="===o.charAt(1)&&o.substr(0,2))&&(o=o.substr(2)),u=parseFloat(o),d in cr&&("autoAlpha"===d&&(1===h&&"hidden"===Tr(t,"visibility")&&u&&(h=0),b.push("visibility",0,x.visibility),Zd(this,x,"visibility",h?"inherit":"hidden",u?"inherit":"hidden",!u)),"scale"!==d&&"transform"!==d&&~(d=cr[d]).indexOf(",")&&(d=d.split(",")[0])),m=d in sr)if(this.styles.save(d),"string"===l&&"var(--"===o.substring(0,6)&&(o=Qd(t,o.substring(4,o.indexOf(")"))),u=parseFloat(o)),g||((v=t._gsap).renderTransform&&!e.parseTransform||kr(t,e.parseTransform),y=!1!==e.smoothOrigin&&v.smooth,(g=this._pt=new ge(this._pt,x,pr,0,1,v.renderTransform,v,0,-1)).dep=1),"scale"===d)this._pt=new ge(this._pt,v,"scaleY",v.scaleY,(_?ka(v.scaleY,_+u):u)-v.scaleY||0,wd),this._pt.u=0,w.push("scaleY",d),d+="X";else{if("transformOrigin"===d){b.push(_r,0,x[_r]),o=ee(o),v.svg?me(t,o,0,y,0,this):((p=parseFloat(o.split(" ")[2])||0)!==v.zOrigin&&Zd(this,v,"zOrigin",v.zOrigin,p),Zd(this,x,d,Or(s),Or(o)));continue}if("svgOrigin"===d){me(t,o,1,y,0,this);continue}if(d in Mr){we(this,v,d,h,_?ka(h,_+o):o);continue}if("smoothOrigin"===d){Zd(this,v,"smooth",v.smooth,o);continue}if("force3D"===d){v[d]=o;continue}if("transform"===d){ye(this,o,t);continue}}else d in x||(d=gr(d)||d);if(m||(u||0===u)&&(h||0===h)&&!dr.test(o)&&d in x)u=u||0,(c=(s+"").substr((h+"").length))!==(p=Za(o)||(d in X.units?X.units[d]:c))&&(h=ae(t,d,s,p)),this._pt=new ge(this._pt,m?v:x,d,h,(_?ka(h,_+u):u)-h,m||"px"!==p&&"zIndex"!==d||!1===e.autoRound?wd:zd),this._pt.u=p||0,c!==p&&"%"!==p&&(this._pt.b=s,this._pt.r=yd);else if(d in x)ce.call(this,t,d,s,_?_+o:o);else if(d in t)this.add(t,d,s||t[d],_?_+o:o,n,a);else if("parseTransform"!==d){Q(d,o);continue}m||(d in x?b.push(d,0,x[d]):"function"==typeof t[d]?b.push(d,2,t[d]()):b.push(d,1,s||t[d])),w.push(d)}T&&_e(this)},render:function render(t,e){if(e.tween._time||!Ye())for(var r=e._pt;r;)r.r(t,r.d),r=r._next;else e.styles.revert()},get:Tr,aliases:cr,getSetter:function getSetter(t,e,r){var i=cr[e];return i&&i.indexOf(",")<0&&(e=i),e in sr&&e!==_r&&(t._gsap.x||Tr(t,"x"))?r&&Be===r?"scale"===e?Fd:Ed:(Be=r||{})&&("scale"===e?Gd:Hd):t.style&&!u(t.style[e])?Cd:~e.indexOf("-")?Dd:ie(t,e)},core:{_removeProperty:Yd,_getMatrix:le}};ze.utils.checkPrefix=gr,ze.core.getStyleSaver=Nd,Fr=ha((Er="x,y,z,scale,scaleX,scaleY,xPercent,yPercent")+","+(Rr="rotation,rotationX,rotationY,skewX,skewY")+",transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective",function(t){sr[t]=1}),ha(Rr,function(t){X.units[t]="deg",Mr[t]=1}),cr[Fr[13]]=Er+","+Rr,ha("0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY",function(t){var e=t.split(":");cr[e[1]]=Fr[e[0]]}),ha("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(t){X.units[t]="px"}),ze.registerPlugin(Lr);var Ir=ze.registerPlugin(Lr)||ze,Br=Ir.core.Tween;e.Back=tr,e.Bounce=rr,e.CSSPlugin=Lr,e.Circ=ar,e.Cubic=Ge,e.Elastic=$e,e.Expo=nr,e.Linear=Ve,e.Power0=Ze,e.Power1=Ne,e.Power2=Qe,e.Power3=Ue,e.Power4=qe,e.Quad=We,e.Quart=He,e.Quint=Ke,e.Sine=ir,e.SteppedEase=er,e.Strong=Je,e.TimelineLite=Qt,e.TimelineMax=Qt,e.TweenLite=Jt,e.TweenMax=Br,e.default=Ir,e.gsap=Ir;if (typeof(window)==="undefined"||window!==e){Object.defineProperty(e,"__esModule",{value:!0})} else {delete e.default}});

;
/*!
 * ScrollTrigger 3.13.0
 * https://gsap.com
 * 
 * @license Copyright 2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license.
 * @author: Jack Doyle, jack@greensock.com
 */

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).window=e.window||{})}(this,function(e){"use strict";function _defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function r(){return Se||"undefined"!=typeof window&&(Se=window.gsap)&&Se.registerPlugin&&Se}function z(e,t){return~Ye.indexOf(e)&&Ye[Ye.indexOf(e)+1][t]}function A(e){return!!~t.indexOf(e)}function B(e,t,r,n,i){return e.addEventListener(t,r,{passive:!1!==n,capture:!!i})}function C(e,t,r,n){return e.removeEventListener(t,r,!!n)}function F(){return Re&&Re.isPressed||ze.cache++}function G(r,n){function ed(e){if(e||0===e){i&&(Te.history.scrollRestoration="manual");var t=Re&&Re.isPressed;e=ed.v=Math.round(e)||(Re&&Re.iOS?1:0),r(e),ed.cacheID=ze.cache,t&&o("ss",e)}else(n||ze.cache!==ed.cacheID||o("ref"))&&(ed.cacheID=ze.cache,ed.v=r());return ed.v+ed.offset}return ed.offset=0,r&&ed}function J(e,t){return(t&&t._ctx&&t._ctx.selector||Se.utils.toArray)(e)[0]||("string"==typeof e&&!1!==Se.config().nullTargetWarn?console.warn("Element not found:",e):null)}function L(t,e){var r=e.s,n=e.sc;A(t)&&(t=Ce.scrollingElement||Me);var i=ze.indexOf(t),o=n===qe.sc?1:2;~i||(i=ze.push(t)-1),ze[i+o]||B(t,"scroll",F);var a=ze[i+o],s=a||(ze[i+o]=G(z(t,r),!0)||(A(t)?n:G(function(e){return arguments.length?t[r]=e:t[r]})));return s.target=t,a||(s.smooth="smooth"===Se.getProperty(t,"scrollBehavior")),s}function M(e,t,i){function Gd(e,t){var r=Le();t||n<r-s?(a=o,o=e,l=s,s=r):i?o+=e:o=a+(e-a)/(r-l)*(s-l)}var o=e,a=e,s=Le(),l=s,n=t||50,c=Math.max(500,3*n);return{update:Gd,reset:function reset(){a=o=i?0:o,l=s=0},getVelocity:function getVelocity(e){var t=l,r=a,n=Le();return!e&&0!==e||e===o||Gd(e),s===l||c<n-l?0:(o+(i?r:-r))/((i?n:s)-t)*1e3}}}function N(e,t){return t&&!e._gsapAllow&&e.preventDefault(),e.changedTouches?e.changedTouches[0]:e}function O(e){var t=Math.max.apply(Math,e),r=Math.min.apply(Math,e);return Math.abs(t)>=Math.abs(r)?t:r}function P(){(Ae=Se.core.globals().ScrollTrigger)&&Ae.core&&function _integrate(){var e=Ae.core,r=e.bridge||{},t=e._scrollers,n=e._proxies;t.push.apply(t,ze),n.push.apply(n,Ye),ze=t,Ye=n,o=function _bridge(e,t){return r[e](t)}}()}function Q(e){return Se=e||r(),!ke&&Se&&"undefined"!=typeof document&&document.body&&(Te=window,Me=(Ce=document).documentElement,Ee=Ce.body,t=[Te,Ce,Me,Ee],Se.utils.clamp,Be=Se.core.context||function(){},Oe="onpointerenter"in Ee?"pointer":"mouse",Pe=E.isTouch=Te.matchMedia&&Te.matchMedia("(hover: none), (pointer: coarse)").matches?1:"ontouchstart"in Te||0<navigator.maxTouchPoints||0<navigator.msMaxTouchPoints?2:0,De=E.eventTypes=("ontouchstart"in Me?"touchstart,touchmove,touchcancel,touchend":"onpointerdown"in Me?"pointerdown,pointermove,pointercancel,pointerup":"mousedown,mousemove,mouseup,mouseup").split(","),setTimeout(function(){return i=0},500),P(),ke=1),ke}var Se,ke,Te,Ce,Me,Ee,Pe,Oe,Ae,t,Re,De,Be,i=1,Ie=[],ze=[],Ye=[],Le=Date.now,o=function _bridge(e,t){return t},n="scrollLeft",a="scrollTop",He={s:n,p:"left",p2:"Left",os:"right",os2:"Right",d:"width",d2:"Width",a:"x",sc:G(function(e){return arguments.length?Te.scrollTo(e,qe.sc()):Te.pageXOffset||Ce[n]||Me[n]||Ee[n]||0})},qe={s:a,p:"top",p2:"Top",os:"bottom",os2:"Bottom",d:"height",d2:"Height",a:"y",op:He,sc:G(function(e){return arguments.length?Te.scrollTo(He.sc(),e):Te.pageYOffset||Ce[a]||Me[a]||Ee[a]||0})};He.op=qe,ze.cache=0;var E=(Observer.prototype.init=function init(e){ke||Q(Se)||console.warn("Please gsap.registerPlugin(Observer)"),Ae||P();var i=e.tolerance,a=e.dragMinimum,t=e.type,o=e.target,r=e.lineHeight,n=e.debounce,s=e.preventDefault,l=e.onStop,c=e.onStopDelay,u=e.ignore,f=e.wheelSpeed,d=e.event,p=e.onDragStart,g=e.onDragEnd,h=e.onDrag,v=e.onPress,b=e.onRelease,m=e.onRight,y=e.onLeft,x=e.onUp,_=e.onDown,w=e.onChangeX,S=e.onChangeY,k=e.onChange,T=e.onToggleX,E=e.onToggleY,R=e.onHover,D=e.onHoverEnd,I=e.onMove,z=e.ignoreCheck,Y=e.isNormalizer,H=e.onGestureStart,q=e.onGestureEnd,X=e.onWheel,U=e.onEnable,W=e.onDisable,G=e.onClick,V=e.scrollSpeed,K=e.capture,j=e.allowClicks,Z=e.lockAxis,$=e.onLockAxis;function gf(){return xe=Le()}function hf(e,t){return(se.event=e)&&u&&function _isWithin(e,t){for(var r=t.length;r--;)if(t[r]===e||t[r].contains(e))return!0;return!1}(e.target,u)||t&&he&&"touch"!==e.pointerType||z&&z(e,t)}function kf(){var e=se.deltaX=O(me),t=se.deltaY=O(ye),r=Math.abs(e)>=i,n=Math.abs(t)>=i;k&&(r||n)&&k(se,e,t,me,ye),r&&(m&&0<se.deltaX&&m(se),y&&se.deltaX<0&&y(se),w&&w(se),T&&se.deltaX<0!=le<0&&T(se),le=se.deltaX,me[0]=me[1]=me[2]=0),n&&(_&&0<se.deltaY&&_(se),x&&se.deltaY<0&&x(se),S&&S(se),E&&se.deltaY<0!=ce<0&&E(se),ce=se.deltaY,ye[0]=ye[1]=ye[2]=0),(ne||re)&&(I&&I(se),re&&(p&&1===re&&p(se),h&&h(se),re=0),ne=!1),oe&&!(oe=!1)&&$&&$(se),ie&&(X(se),ie=!1),ee=0}function lf(e,t,r){me[r]+=e,ye[r]+=t,se._vx.update(e),se._vy.update(t),n?ee=ee||requestAnimationFrame(kf):kf()}function mf(e,t){Z&&!ae&&(se.axis=ae=Math.abs(e)>Math.abs(t)?"x":"y",oe=!0),"y"!==ae&&(me[2]+=e,se._vx.update(e,!0)),"x"!==ae&&(ye[2]+=t,se._vy.update(t,!0)),n?ee=ee||requestAnimationFrame(kf):kf()}function nf(e){if(!hf(e,1)){var t=(e=N(e,s)).clientX,r=e.clientY,n=t-se.x,i=r-se.y,o=se.isDragging;se.x=t,se.y=r,(o||(n||i)&&(Math.abs(se.startX-t)>=a||Math.abs(se.startY-r)>=a))&&(re=o?2:1,o||(se.isDragging=!0),mf(n,i))}}function qf(e){return e.touches&&1<e.touches.length&&(se.isGesturing=!0)&&H(e,se.isDragging)}function rf(){return(se.isGesturing=!1)||q(se)}function sf(e){if(!hf(e)){var t=fe(),r=de();lf((t-pe)*V,(r-ge)*V,1),pe=t,ge=r,l&&te.restart(!0)}}function tf(e){if(!hf(e)){e=N(e,s),X&&(ie=!0);var t=(1===e.deltaMode?r:2===e.deltaMode?Te.innerHeight:1)*f;lf(e.deltaX*t,e.deltaY*t,0),l&&!Y&&te.restart(!0)}}function uf(e){if(!hf(e)){var t=e.clientX,r=e.clientY,n=t-se.x,i=r-se.y;se.x=t,se.y=r,ne=!0,l&&te.restart(!0),(n||i)&&mf(n,i)}}function vf(e){se.event=e,R(se)}function wf(e){se.event=e,D(se)}function xf(e){return hf(e)||N(e,s)&&G(se)}this.target=o=J(o)||Me,this.vars=e,u=u&&Se.utils.toArray(u),i=i||1e-9,a=a||0,f=f||1,V=V||1,t=t||"wheel,touch,pointer",n=!1!==n,r=r||parseFloat(Te.getComputedStyle(Ee).lineHeight)||22;var ee,te,re,ne,ie,oe,ae,se=this,le=0,ce=0,ue=e.passive||!s&&!1!==e.passive,fe=L(o,He),de=L(o,qe),pe=fe(),ge=de(),he=~t.indexOf("touch")&&!~t.indexOf("pointer")&&"pointerdown"===De[0],ve=A(o),be=o.ownerDocument||Ce,me=[0,0,0],ye=[0,0,0],xe=0,_e=se.onPress=function(e){hf(e,1)||e&&e.button||(se.axis=ae=null,te.pause(),se.isPressed=!0,e=N(e),le=ce=0,se.startX=se.x=e.clientX,se.startY=se.y=e.clientY,se._vx.reset(),se._vy.reset(),B(Y?o:be,De[1],nf,ue,!0),se.deltaX=se.deltaY=0,v&&v(se))},we=se.onRelease=function(t){if(!hf(t,1)){C(Y?o:be,De[1],nf,!0);var e=!isNaN(se.y-se.startY),r=se.isDragging,n=r&&(3<Math.abs(se.x-se.startX)||3<Math.abs(se.y-se.startY)),i=N(t);!n&&e&&(se._vx.reset(),se._vy.reset(),s&&j&&Se.delayedCall(.08,function(){if(300<Le()-xe&&!t.defaultPrevented)if(t.target.click)t.target.click();else if(be.createEvent){var e=be.createEvent("MouseEvents");e.initMouseEvent("click",!0,!0,Te,1,i.screenX,i.screenY,i.clientX,i.clientY,!1,!1,!1,!1,0,null),t.target.dispatchEvent(e)}})),se.isDragging=se.isGesturing=se.isPressed=!1,l&&r&&!Y&&te.restart(!0),re&&kf(),g&&r&&g(se),b&&b(se,n)}};te=se._dc=Se.delayedCall(c||.25,function onStopFunc(){se._vx.reset(),se._vy.reset(),te.pause(),l&&l(se)}).pause(),se.deltaX=se.deltaY=0,se._vx=M(0,50,!0),se._vy=M(0,50,!0),se.scrollX=fe,se.scrollY=de,se.isDragging=se.isGesturing=se.isPressed=!1,Be(this),se.enable=function(e){return se.isEnabled||(B(ve?be:o,"scroll",F),0<=t.indexOf("scroll")&&B(ve?be:o,"scroll",sf,ue,K),0<=t.indexOf("wheel")&&B(o,"wheel",tf,ue,K),(0<=t.indexOf("touch")&&Pe||0<=t.indexOf("pointer"))&&(B(o,De[0],_e,ue,K),B(be,De[2],we),B(be,De[3],we),j&&B(o,"click",gf,!0,!0),G&&B(o,"click",xf),H&&B(be,"gesturestart",qf),q&&B(be,"gestureend",rf),R&&B(o,Oe+"enter",vf),D&&B(o,Oe+"leave",wf),I&&B(o,Oe+"move",uf)),se.isEnabled=!0,se.isDragging=se.isGesturing=se.isPressed=ne=re=!1,se._vx.reset(),se._vy.reset(),pe=fe(),ge=de(),e&&e.type&&_e(e),U&&U(se)),se},se.disable=function(){se.isEnabled&&(Ie.filter(function(e){return e!==se&&A(e.target)}).length||C(ve?be:o,"scroll",F),se.isPressed&&(se._vx.reset(),se._vy.reset(),C(Y?o:be,De[1],nf,!0)),C(ve?be:o,"scroll",sf,K),C(o,"wheel",tf,K),C(o,De[0],_e,K),C(be,De[2],we),C(be,De[3],we),C(o,"click",gf,!0),C(o,"click",xf),C(be,"gesturestart",qf),C(be,"gestureend",rf),C(o,Oe+"enter",vf),C(o,Oe+"leave",wf),C(o,Oe+"move",uf),se.isEnabled=se.isPressed=se.isDragging=!1,W&&W(se))},se.kill=se.revert=function(){se.disable();var e=Ie.indexOf(se);0<=e&&Ie.splice(e,1),Re===se&&(Re=0)},Ie.push(se),Y&&A(o)&&(Re=se),se.enable(d)},function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),e}(Observer,[{key:"velocityX",get:function get(){return this._vx.getVelocity()}},{key:"velocityY",get:function get(){return this._vy.getVelocity()}}]),Observer);function Observer(e){this.init(e)}E.version="3.13.0",E.create=function(e){return new E(e)},E.register=Q,E.getAll=function(){return Ie.slice()},E.getById=function(t){return Ie.filter(function(e){return e.vars.id===t})[0]},r()&&Se.registerPlugin(E);function Da(e,t,r){var n=ct(e)&&("clamp("===e.substr(0,6)||-1<e.indexOf("max"));return(r["_"+t+"Clamp"]=n)?e.substr(6,e.length-7):e}function Ea(e,t){return!t||ct(e)&&"clamp("===e.substr(0,6)?e:"clamp("+e+")"}function Ga(){return Qe=1}function Ha(){return Qe=0}function Ia(e){return e}function Ja(e){return Math.round(1e5*e)/1e5||0}function Ka(){return"undefined"!=typeof window}function La(){return Ne||Ka()&&(Ne=window.gsap)&&Ne.registerPlugin&&Ne}function Ma(e){return!!~l.indexOf(e)}function Na(e){return("Height"===e?S:Xe["inner"+e])||Ue["client"+e]||We["client"+e]}function Oa(e){return z(e,"getBoundingClientRect")||(Ma(e)?function(){return Ot.width=Xe.innerWidth,Ot.height=S,Ot}:function(){return _t(e)})}function Ra(e,t){var r=t.s,n=t.d2,i=t.d,o=t.a;return Math.max(0,(r="scroll"+n)&&(o=z(e,r))?o()-Oa(e)()[i]:Ma(e)?(Ue[r]||We[r])-Na(n):e[r]-e["offset"+n])}function Sa(e,t){for(var r=0;r<g.length;r+=3)t&&!~t.indexOf(g[r+1])||e(g[r],g[r+1],g[r+2])}function Ua(e){return"function"==typeof e}function Va(e){return"number"==typeof e}function Wa(e){return"object"==typeof e}function Xa(e,t,r){return e&&e.progress(t?0:1)&&r&&e.pause()}function Ya(e,t){if(e.enabled){var r=e._ctx?e._ctx.add(function(){return t(e)}):t(e);r&&r.totalTime&&(e.callbackAnimation=r)}}function nb(e){return Xe.getComputedStyle(e)}function pb(e,t){for(var r in t)r in e||(e[r]=t[r]);return e}function rb(e,t){var r=t.d2;return e["offset"+r]||e["client"+r]||0}function sb(e){var t,r=[],n=e.labels,i=e.duration();for(t in n)r.push(n[t]/i);return r}function ub(i){var o=Ne.utils.snap(i),a=Array.isArray(i)&&i.slice(0).sort(function(e,t){return e-t});return a?function(e,t,r){var n;if(void 0===r&&(r=.001),!t)return o(e);if(0<t){for(e-=r,n=0;n<a.length;n++)if(a[n]>=e)return a[n];return a[n-1]}for(n=a.length,e+=r;n--;)if(a[n]<=e)return a[n];return a[0]}:function(e,t,r){void 0===r&&(r=.001);var n=o(e);return!t||Math.abs(n-e)<r||n-e<0==t<0?n:o(t<0?e-i:e+i)}}function wb(t,r,e,n){return e.split(",").forEach(function(e){return t(r,e,n)})}function xb(e,t,r,n,i){return e.addEventListener(t,r,{passive:!n,capture:!!i})}function yb(e,t,r,n){return e.removeEventListener(t,r,!!n)}function zb(e,t,r){(r=r&&r.wheelHandler)&&(e(t,"wheel",r),e(t,"touchmove",r))}function Db(e,t){if(ct(e)){var r=e.indexOf("="),n=~r?(e.charAt(r-1)+1)*parseFloat(e.substr(r+1)):0;~r&&(e.indexOf("%")>r&&(n*=t/100),e=e.substr(0,r-1)),e=n+(e in q?q[e]*t:~e.indexOf("%")?parseFloat(e)*t/100:parseFloat(e)||0)}return e}function Eb(e,t,r,n,i,o,a,s){var l=i.startColor,c=i.endColor,u=i.fontSize,f=i.indent,d=i.fontWeight,p=Fe.createElement("div"),g=Ma(r)||"fixed"===z(r,"pinType"),h=-1!==e.indexOf("scroller"),v=g?We:r,b=-1!==e.indexOf("start"),m=b?l:c,y="border-color:"+m+";font-size:"+u+";color:"+m+";font-weight:"+d+";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";return y+="position:"+((h||s)&&g?"fixed;":"absolute;"),!h&&!s&&g||(y+=(n===qe?I:Y)+":"+(o+parseFloat(f))+"px;"),a&&(y+="box-sizing:border-box;text-align:left;width:"+a.offsetWidth+"px;"),p._isStart=b,p.setAttribute("class","gsap-marker-"+e+(t?" marker-"+t:"")),p.style.cssText=y,p.innerText=t||0===t?e+"-"+t:e,v.children[0]?v.insertBefore(p,v.children[0]):v.appendChild(p),p._offset=p["offset"+n.op.d2],X(p,0,n,b),p}function Jb(){return 34<at()-st&&(T=T||requestAnimationFrame(Z))}function Kb(){v&&v.isPressed&&!(v.startX>We.clientWidth)||(ze.cache++,v?T=T||requestAnimationFrame(Z):Z(),st||V("scrollStart"),st=at())}function Lb(){y=Xe.innerWidth,m=Xe.innerHeight}function Mb(e){ze.cache++,!0!==e&&(Ke||h||Fe.fullscreenElement||Fe.webkitFullscreenElement||b&&y===Xe.innerWidth&&!(Math.abs(Xe.innerHeight-m)>.25*Xe.innerHeight))||c.restart(!0)}function Pb(){return yb(ne,"scrollEnd",Pb)||Mt(!0)}function Sb(e){for(var t=0;t<K.length;t+=5)(!e||K[t+4]&&K[t+4].query===e)&&(K[t].style.cssText=K[t+1],K[t].getBBox&&K[t].setAttribute("transform",K[t+2]||""),K[t+3].uncache=1)}function Tb(e,t){var r;for(je=0;je<kt.length;je++)!(r=kt[je])||t&&r._ctx!==t||(e?r.kill(1):r.revert(!0,!0));k=!0,t&&Sb(t),t||V("revert")}function Ub(e,t){ze.cache++,!t&&rt||ze.forEach(function(e){return Ua(e)&&e.cacheID++&&(e.rec=0)}),ct(e)&&(Xe.history.scrollRestoration=_=e)}function Zb(){We.appendChild(w),S=!v&&w.offsetHeight||Xe.innerHeight,We.removeChild(w)}function $b(t){return Je(".gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end").forEach(function(e){return e.style.display=t?"none":"block"})}function hc(e,t,r,n){if(!e._gsap.swappedIn){for(var i,o=$.length,a=t.style,s=e.style;o--;)a[i=$[o]]=r[i];a.position="absolute"===r.position?"absolute":"relative","inline"===r.display&&(a.display="inline-block"),s[Y]=s[I]="auto",a.flexBasis=r.flexBasis||"auto",a.overflow="visible",a.boxSizing="border-box",a[ft]=rb(e,He)+xt,a[dt]=rb(e,qe)+xt,a[bt]=s[mt]=s.top=s.left="0",Pt(n),s[ft]=s.maxWidth=r[ft],s[dt]=s.maxHeight=r[dt],s[bt]=r[bt],e.parentNode!==t&&(e.parentNode.insertBefore(t,e),t.appendChild(e)),e._gsap.swappedIn=!0}}function kc(e){for(var t=ee.length,r=e.style,n=[],i=0;i<t;i++)n.push(ee[i],r[ee[i]]);return n.t=e,n}function nc(e,t,r,n,i,o,a,s,l,c,u,f,d,p){Ua(e)&&(e=e(s)),ct(e)&&"max"===e.substr(0,3)&&(e=f+("="===e.charAt(4)?Db("0"+e.substr(3),r):0));var g,h,v,b=d?d.time():0;if(d&&d.seek(0),isNaN(e)||(e=+e),Va(e))d&&(e=Ne.utils.mapRange(d.scrollTrigger.start,d.scrollTrigger.end,0,f,e)),a&&X(a,r,n,!0);else{Ua(t)&&(t=t(s));var m,y,x,_,w=(e||"0").split(" ");v=J(t,s)||We,(m=_t(v)||{})&&(m.left||m.top)||"none"!==nb(v).display||(_=v.style.display,v.style.display="block",m=_t(v),_?v.style.display=_:v.style.removeProperty("display")),y=Db(w[0],m[n.d]),x=Db(w[1]||"0",r),e=m[n.p]-l[n.p]-c+y+i-x,a&&X(a,x,n,r-x<20||a._isStart&&20<x),r-=r-x}if(p&&(s[p]=e||-.001,e<0&&(e=0)),o){var S=e+r,k=o._isStart;g="scroll"+n.d2,X(o,S,n,k&&20<S||!k&&(u?Math.max(We[g],Ue[g]):o.parentNode[g])<=S+1),u&&(l=_t(a),u&&(o.style[n.op.p]=l[n.op.p]-n.op.m-o._offset+xt))}return d&&v&&(g=_t(v),d.seek(f),h=_t(v),d._caScrollDist=g[n.p]-h[n.p],e=e/d._caScrollDist*f),d&&d.seek(b),d?e:Math.round(e)}function pc(e,t,r,n){if(e.parentNode!==t){var i,o,a=e.style;if(t===We){for(i in e._stOrig=a.cssText,o=nb(e))+i||re.test(i)||!o[i]||"string"!=typeof a[i]||"0"===i||(a[i]=o[i]);a.top=r,a.left=n}else a.cssText=e._stOrig;Ne.core.getCache(e).uncache=1,t.appendChild(e)}}function qc(r,e,n){var i=e,o=i;return function(e){var t=Math.round(r());return t!==i&&t!==o&&3<Math.abs(t-i)&&3<Math.abs(t-o)&&(e=t,n&&n()),o=i,i=Math.round(e)}}function rc(e,t,r){var n={};n[t.p]="+="+r,Ne.set(e,n)}function sc(c,e){function Hk(e,t,r,n,i){var o=Hk.tween,a=t.onComplete,s={};r=r||u();var l=qc(u,r,function(){o.kill(),Hk.tween=0});return i=n&&i||0,n=n||e-r,o&&o.kill(),t[f]=e,t.inherit=!1,(t.modifiers=s)[f]=function(){return l(r+n*o.ratio+i*o.ratio*o.ratio)},t.onUpdate=function(){ze.cache++,Hk.tween&&Z()},t.onComplete=function(){Hk.tween=0,a&&a.call(o)},o=Hk.tween=Ne.to(c,t)}var u=L(c,e),f="_scroll"+e.p2;return(c[f]=u).wheelHandler=function(){return Hk.tween&&Hk.tween.kill()&&(Hk.tween=0)},xb(c,"wheel",u.wheelHandler),ne.isTouch&&xb(c,"touchmove",u.wheelHandler),Hk}var Ne,s,Xe,Fe,Ue,We,l,c,Je,Ge,Ve,u,Ke,Qe,f,je,d,p,g,Ze,$e,h,v,b,m,y,R,x,_,w,S,k,et,tt,T,rt,nt,it,ot=1,at=Date.now,D=at(),st=0,lt=0,ct=function _isString(e){return"string"==typeof e},ut=Math.abs,I="right",Y="bottom",ft="width",dt="height",pt="Right",gt="Left",ht="Top",vt="Bottom",bt="padding",mt="margin",yt="Width",H="Height",xt="px",_t=function _getBounds(e,t){var r=t&&"matrix(1, 0, 0, 1, 0, 0)"!==nb(e)[f]&&Ne.to(e,{x:0,y:0,xPercent:0,yPercent:0,rotation:0,rotationX:0,rotationY:0,scale:1,skewX:0,skewY:0}).progress(1),n=e.getBoundingClientRect();return r&&r.progress(0).kill(),n},wt={startColor:"green",endColor:"red",indent:0,fontSize:"16px",fontWeight:"normal"},St={toggleActions:"play",anticipatePin:0},q={top:0,left:0,center:.5,bottom:1,right:1},X=function _positionMarker(e,t,r,n){var i={display:"block"},o=r[n?"os2":"p2"],a=r[n?"p2":"os2"];e._isFlipped=n,i[r.a+"Percent"]=n?-100:0,i[r.a]=n?"1px":0,i["border"+o+yt]=1,i["border"+a+yt]=0,i[r.p]=t+"px",Ne.set(e,i)},kt=[],Tt={},U={},W=[],V=function _dispatch(e){return U[e]&&U[e].map(function(e){return e()})||W},K=[],Ct=0,Mt=function _refreshAll(e,t){if(Ue=Fe.documentElement,We=Fe.body,l=[Xe,Fe,Ue,We],!st||e||k){Zb(),rt=ne.isRefreshing=!0,ze.forEach(function(e){return Ua(e)&&++e.cacheID&&(e.rec=e())});var r=V("refreshInit");Ze&&ne.sort(),t||Tb(),ze.forEach(function(e){Ua(e)&&(e.smooth&&(e.target.style.scrollBehavior="auto"),e(0))}),kt.slice(0).forEach(function(e){return e.refresh()}),k=!1,kt.forEach(function(e){if(e._subPinOffset&&e.pin){var t=e.vars.horizontal?"offsetWidth":"offsetHeight",r=e.pin[t];e.revert(!0,1),e.adjustPinSpacing(e.pin[t]-r),e.refresh()}}),et=1,$b(!0),kt.forEach(function(e){var t=Ra(e.scroller,e._dir),r="max"===e.vars.end||e._endClamp&&e.end>t,n=e._startClamp&&e.start>=t;(r||n)&&e.setPositions(n?t-1:e.start,r?Math.max(n?t:e.start+1,t):e.end,!0)}),$b(!1),et=0,r.forEach(function(e){return e&&e.render&&e.render(-1)}),ze.forEach(function(e){Ua(e)&&(e.smooth&&requestAnimationFrame(function(){return e.target.style.scrollBehavior="smooth"}),e.rec&&e(e.rec))}),Ub(_,1),c.pause(),Ct++,Z(rt=2),kt.forEach(function(e){return Ua(e.vars.onRefresh)&&e.vars.onRefresh(e)}),rt=ne.isRefreshing=!1,V("refresh")}else xb(ne,"scrollEnd",Pb)},j=0,Et=1,Z=function _updateAll(e){if(2===e||!rt&&!k){ne.isUpdating=!0,it&&it.update(0);var t=kt.length,r=at(),n=50<=r-D,i=t&&kt[0].scroll();if(Et=i<j?-1:1,rt||(j=i),n&&(st&&!Qe&&200<r-st&&(st=0,V("scrollEnd")),Ve=D,D=r),Et<0){for(je=t;0<je--;)kt[je]&&kt[je].update(0,n);Et=1}else for(je=0;je<t;je++)kt[je]&&kt[je].update(0,n);ne.isUpdating=!1}T=0},$=["left","top",Y,I,mt+vt,mt+pt,mt+ht,mt+gt,"display","flexShrink","float","zIndex","gridColumnStart","gridColumnEnd","gridRowStart","gridRowEnd","gridArea","justifySelf","alignSelf","placeSelf","order"],ee=$.concat([ft,dt,"boxSizing","max"+yt,"max"+H,"position",mt,bt,bt+ht,bt+pt,bt+vt,bt+gt]),te=/([A-Z])/g,Pt=function _setState(e){if(e){var t,r,n=e.t.style,i=e.length,o=0;for((e.t._gsap||Ne.core.getCache(e.t)).uncache=1;o<i;o+=2)r=e[o+1],t=e[o],r?n[t]=r:n[t]&&n.removeProperty(t.replace(te,"-$1").toLowerCase())}},Ot={left:0,top:0},re=/(webkit|moz|length|cssText|inset)/i,ne=(ScrollTrigger.prototype.init=function init(P,O){if(this.progress=this.start=0,this.vars&&this.kill(!0,!0),lt){var A,n,p,R,D,B,I,Y,H,q,N,e,X,F,U,W,G,V,t,K,b,Q,j,m,Z,y,$,x,r,_,w,ee,i,g,te,re,ne,S,o,k=(P=pb(ct(P)||Va(P)||P.nodeType?{trigger:P}:P,St)).onUpdate,T=P.toggleClass,a=P.id,C=P.onToggle,ie=P.onRefresh,M=P.scrub,oe=P.trigger,ae=P.pin,se=P.pinSpacing,le=P.invalidateOnRefresh,E=P.anticipatePin,s=P.onScrubComplete,h=P.onSnapComplete,ce=P.once,ue=P.snap,fe=P.pinReparent,l=P.pinSpacer,de=P.containerAnimation,pe=P.fastScrollEnd,ge=P.preventOverlaps,he=P.horizontal||P.containerAnimation&&!1!==P.horizontal?He:qe,ve=!M&&0!==M,be=J(P.scroller||Xe),c=Ne.core.getCache(be),me=Ma(be),ye="fixed"===("pinType"in P?P.pinType:z(be,"pinType")||me&&"fixed"),xe=[P.onEnter,P.onLeave,P.onEnterBack,P.onLeaveBack],_e=ve&&P.toggleActions.split(" "),we="markers"in P?P.markers:St.markers,Se=me?0:parseFloat(nb(be)["border"+he.p2+yt])||0,ke=this,Te=P.onRefreshInit&&function(){return P.onRefreshInit(ke)},Ce=function _getSizeFunc(e,t,r){var n=r.d,i=r.d2,o=r.a;return(o=z(e,"getBoundingClientRect"))?function(){return o()[n]}:function(){return(t?Na(i):e["client"+i])||0}}(be,me,he),Me=function _getOffsetsFunc(e,t){return!t||~Ye.indexOf(e)?Oa(e):function(){return Ot}}(be,me),Ee=0,Pe=0,Oe=0,Ae=L(be,he);if(ke._startClamp=ke._endClamp=!1,ke._dir=he,E*=45,ke.scroller=be,ke.scroll=de?de.time.bind(de):Ae,R=Ae(),ke.vars=P,O=O||P.animation,"refreshPriority"in P&&(Ze=1,-9999===P.refreshPriority&&(it=ke)),c.tweenScroll=c.tweenScroll||{top:sc(be,qe),left:sc(be,He)},ke.tweenTo=A=c.tweenScroll[he.p],ke.scrubDuration=function(e){(i=Va(e)&&e)?ee?ee.duration(e):ee=Ne.to(O,{ease:"expo",totalProgress:"+=0",inherit:!1,duration:i,paused:!0,onComplete:function onComplete(){return s&&s(ke)}}):(ee&&ee.progress(1).kill(),ee=0)},O&&(O.vars.lazy=!1,O._initted&&!ke.isReverted||!1!==O.vars.immediateRender&&!1!==P.immediateRender&&O.duration()&&O.render(0,!0,!0),ke.animation=O.pause(),(O.scrollTrigger=ke).scrubDuration(M),_=0,a=a||O.vars.id),ue&&(Wa(ue)&&!ue.push||(ue={snapTo:ue}),"scrollBehavior"in We.style&&Ne.set(me?[We,Ue]:be,{scrollBehavior:"auto"}),ze.forEach(function(e){return Ua(e)&&e.target===(me?Fe.scrollingElement||Ue:be)&&(e.smooth=!1)}),p=Ua(ue.snapTo)?ue.snapTo:"labels"===ue.snapTo?function _getClosestLabel(t){return function(e){return Ne.utils.snap(sb(t),e)}}(O):"labelsDirectional"===ue.snapTo?function _getLabelAtDirection(r){return function(e,t){return ub(sb(r))(e,t.direction)}}(O):!1!==ue.directional?function(e,t){return ub(ue.snapTo)(e,at()-Pe<500?0:t.direction)}:Ne.utils.snap(ue.snapTo),g=ue.duration||{min:.1,max:2},g=Wa(g)?Ge(g.min,g.max):Ge(g,g),te=Ne.delayedCall(ue.delay||i/2||.1,function(){var e=Ae(),t=at()-Pe<500,r=A.tween;if(!(t||Math.abs(ke.getVelocity())<10)||r||Qe||Ee===e)ke.isActive&&Ee!==e&&te.restart(!0);else{var n,i,o=(e-B)/F,a=O&&!ve?O.totalProgress():o,s=t?0:(a-w)/(at()-Ve)*1e3||0,l=Ne.utils.clamp(-o,1-o,ut(s/2)*s/.185),c=o+(!1===ue.inertia?0:l),u=ue.onStart,f=ue.onInterrupt,d=ue.onComplete;if(n=p(c,ke),Va(n)||(n=c),i=Math.max(0,Math.round(B+n*F)),e<=I&&B<=e&&i!==e){if(r&&!r._initted&&r.data<=ut(i-e))return;!1===ue.inertia&&(l=n-o),A(i,{duration:g(ut(.185*Math.max(ut(c-a),ut(n-a))/s/.05||0)),ease:ue.ease||"power3",data:ut(i-e),onInterrupt:function onInterrupt(){return te.restart(!0)&&f&&f(ke)},onComplete:function onComplete(){ke.update(),Ee=Ae(),O&&!ve&&(ee?ee.resetTo("totalProgress",n,O._tTime/O._tDur):O.progress(n)),_=w=O&&!ve?O.totalProgress():ke.progress,h&&h(ke),d&&d(ke)}},e,l*F,i-e-l*F),u&&u(ke,A.tween)}}}).pause()),a&&(Tt[a]=ke),o=(o=(oe=ke.trigger=J(oe||!0!==ae&&ae))&&oe._gsap&&oe._gsap.stRevert)&&o(ke),ae=!0===ae?oe:J(ae),ct(T)&&(T={targets:oe,className:T}),ae&&(!1===se||se===mt||(se=!(!se&&ae.parentNode&&ae.parentNode.style&&"flex"===nb(ae.parentNode).display)&&bt),ke.pin=ae,(n=Ne.core.getCache(ae)).spacer?U=n.pinState:(l&&((l=J(l))&&!l.nodeType&&(l=l.current||l.nativeElement),n.spacerIsNative=!!l,l&&(n.spacerState=kc(l))),n.spacer=V=l||Fe.createElement("div"),V.classList.add("pin-spacer"),a&&V.classList.add("pin-spacer-"+a),n.pinState=U=kc(ae)),!1!==P.force3D&&Ne.set(ae,{force3D:!0}),ke.spacer=V=n.spacer,r=nb(ae),m=r[se+he.os2],K=Ne.getProperty(ae),b=Ne.quickSetter(ae,he.a,xt),hc(ae,V,r),G=kc(ae)),we){e=Wa(we)?pb(we,wt):wt,q=Eb("scroller-start",a,be,he,e,0),N=Eb("scroller-end",a,be,he,e,0,q),t=q["offset"+he.op.d2];var u=J(z(be,"content")||be);Y=this.markerStart=Eb("start",a,u,he,e,t,0,de),H=this.markerEnd=Eb("end",a,u,he,e,t,0,de),de&&(S=Ne.quickSetter([Y,H],he.a,xt)),ye||Ye.length&&!0===z(be,"fixedMarkers")||(function _makePositionable(e){var t=nb(e).position;e.style.position="absolute"===t||"fixed"===t?t:"relative"}(me?We:be),Ne.set([q,N],{force3D:!0}),y=Ne.quickSetter(q,he.a,xt),x=Ne.quickSetter(N,he.a,xt))}if(de){var f=de.vars.onUpdate,d=de.vars.onUpdateParams;de.eventCallback("onUpdate",function(){ke.update(0,0,1),f&&f.apply(de,d||[])})}if(ke.previous=function(){return kt[kt.indexOf(ke)-1]},ke.next=function(){return kt[kt.indexOf(ke)+1]},ke.revert=function(e,t){if(!t)return ke.kill(!0);var r=!1!==e||!ke.enabled,n=Ke;r!==ke.isReverted&&(r&&(re=Math.max(Ae(),ke.scroll.rec||0),Oe=ke.progress,ne=O&&O.progress()),Y&&[Y,H,q,N].forEach(function(e){return e.style.display=r?"none":"block"}),r&&(Ke=ke).update(r),!ae||fe&&ke.isActive||(r?function _swapPinOut(e,t,r){Pt(r);var n=e._gsap;if(n.spacerIsNative)Pt(n.spacerState);else if(e._gsap.swappedIn){var i=t.parentNode;i&&(i.insertBefore(e,t),i.removeChild(t))}e._gsap.swappedIn=!1}(ae,V,U):hc(ae,V,nb(ae),Z)),r||ke.update(r),Ke=n,ke.isReverted=r)},ke.refresh=function(e,t,r,n){if(!Ke&&ke.enabled||t)if(ae&&e&&st)xb(ScrollTrigger,"scrollEnd",Pb);else{!rt&&Te&&Te(ke),Ke=ke,A.tween&&!r&&(A.tween.kill(),A.tween=0),ee&&ee.pause(),le&&O&&(O.revert({kill:!1}).invalidate(),O.getChildren&&O.getChildren(!0,!0,!1).forEach(function(e){return e.vars.immediateRender&&e.render(0,!0,!0)})),ke.isReverted||ke.revert(!0,!0),ke._subPinOffset=!1;var i,o,a,s,l,c,u,f,d,p,g,h,v,b=Ce(),m=Me(),y=de?de.duration():Ra(be,he),x=F<=.01||!F,_=0,w=n||0,S=Wa(r)?r.end:P.end,k=P.endTrigger||oe,T=Wa(r)?r.start:P.start||(0!==P.start&&oe?ae?"0 0":"0 100%":0),C=ke.pinnedContainer=P.pinnedContainer&&J(P.pinnedContainer,ke),M=oe&&Math.max(0,kt.indexOf(ke))||0,E=M;for(we&&Wa(r)&&(h=Ne.getProperty(q,he.p),v=Ne.getProperty(N,he.p));0<E--;)(c=kt[E]).end||c.refresh(0,1)||(Ke=ke),!(u=c.pin)||u!==oe&&u!==ae&&u!==C||c.isReverted||((p=p||[]).unshift(c),c.revert(!0,!0)),c!==kt[E]&&(M--,E--);for(Ua(T)&&(T=T(ke)),T=Da(T,"start",ke),B=nc(T,oe,b,he,Ae(),Y,q,ke,m,Se,ye,y,de,ke._startClamp&&"_startClamp")||(ae?-.001:0),Ua(S)&&(S=S(ke)),ct(S)&&!S.indexOf("+=")&&(~S.indexOf(" ")?S=(ct(T)?T.split(" ")[0]:"")+S:(_=Db(S.substr(2),b),S=ct(T)?T:(de?Ne.utils.mapRange(0,de.duration(),de.scrollTrigger.start,de.scrollTrigger.end,B):B)+_,k=oe)),S=Da(S,"end",ke),I=Math.max(B,nc(S||(k?"100% 0":y),k,b,he,Ae()+_,H,N,ke,m,Se,ye,y,de,ke._endClamp&&"_endClamp"))||-.001,_=0,E=M;E--;)(u=(c=kt[E]).pin)&&c.start-c._pinPush<=B&&!de&&0<c.end&&(i=c.end-(ke._startClamp?Math.max(0,c.start):c.start),(u===oe&&c.start-c._pinPush<B||u===C)&&isNaN(T)&&(_+=i*(1-c.progress)),u===ae&&(w+=i));if(B+=_,I+=_,ke._startClamp&&(ke._startClamp+=_),ke._endClamp&&!rt&&(ke._endClamp=I||-.001,I=Math.min(I,Ra(be,he))),F=I-B||(B-=.01)&&.001,x&&(Oe=Ne.utils.clamp(0,1,Ne.utils.normalize(B,I,re))),ke._pinPush=w,Y&&_&&((i={})[he.a]="+="+_,C&&(i[he.p]="-="+Ae()),Ne.set([Y,H],i)),!ae||et&&ke.end>=Ra(be,he)){if(oe&&Ae()&&!de)for(o=oe.parentNode;o&&o!==We;)o._pinOffset&&(B-=o._pinOffset,I-=o._pinOffset),o=o.parentNode}else i=nb(ae),s=he===qe,a=Ae(),Q=parseFloat(K(he.a))+w,!y&&1<I&&(g={style:g=(me?Fe.scrollingElement||Ue:be).style,value:g["overflow"+he.a.toUpperCase()]},me&&"scroll"!==nb(We)["overflow"+he.a.toUpperCase()]&&(g.style["overflow"+he.a.toUpperCase()]="scroll")),hc(ae,V,i),G=kc(ae),o=_t(ae,!0),f=ye&&L(be,s?He:qe)(),se?((Z=[se+he.os2,F+w+xt]).t=V,(E=se===bt?rb(ae,he)+F+w:0)&&(Z.push(he.d,E+xt),"auto"!==V.style.flexBasis&&(V.style.flexBasis=E+xt)),Pt(Z),C&&kt.forEach(function(e){e.pin===C&&!1!==e.vars.pinSpacing&&(e._subPinOffset=!0)}),ye&&Ae(re)):(E=rb(ae,he))&&"auto"!==V.style.flexBasis&&(V.style.flexBasis=E+xt),ye&&((l={top:o.top+(s?a-B:f)+xt,left:o.left+(s?f:a-B)+xt,boxSizing:"border-box",position:"fixed"})[ft]=l.maxWidth=Math.ceil(o.width)+xt,l[dt]=l.maxHeight=Math.ceil(o.height)+xt,l[mt]=l[mt+ht]=l[mt+pt]=l[mt+vt]=l[mt+gt]="0",l[bt]=i[bt],l[bt+ht]=i[bt+ht],l[bt+pt]=i[bt+pt],l[bt+vt]=i[bt+vt],l[bt+gt]=i[bt+gt],W=function _copyState(e,t,r){for(var n,i=[],o=e.length,a=r?8:0;a<o;a+=2)n=e[a],i.push(n,n in t?t[n]:e[a+1]);return i.t=e.t,i}(U,l,fe),rt&&Ae(0)),O?(d=O._initted,$e(1),O.render(O.duration(),!0,!0),j=K(he.a)-Q+F+w,$=1<Math.abs(F-j),ye&&$&&W.splice(W.length-2,2),O.render(0,!0,!0),d||O.invalidate(!0),O.parent||O.totalTime(O.totalTime()),$e(0)):j=F,g&&(g.value?g.style["overflow"+he.a.toUpperCase()]=g.value:g.style.removeProperty("overflow-"+he.a));p&&p.forEach(function(e){return e.revert(!1,!0)}),ke.start=B,ke.end=I,R=D=rt?re:Ae(),de||rt||(R<re&&Ae(re),ke.scroll.rec=0),ke.revert(!1,!0),Pe=at(),te&&(Ee=-1,te.restart(!0)),Ke=0,O&&ve&&(O._initted||ne)&&O.progress()!==ne&&O.progress(ne||0,!0).render(O.time(),!0,!0),(x||Oe!==ke.progress||de||le||O&&!O._initted)&&(O&&!ve&&(O._initted||Oe||!1!==O.vars.immediateRender)&&O.totalProgress(de&&B<-.001&&!Oe?Ne.utils.normalize(B,I,0):Oe,!0),ke.progress=x||(R-B)/F===Oe?0:Oe),ae&&se&&(V._pinOffset=Math.round(ke.progress*j)),ee&&ee.invalidate(),isNaN(h)||(h-=Ne.getProperty(q,he.p),v-=Ne.getProperty(N,he.p),rc(q,he,h),rc(Y,he,h-(n||0)),rc(N,he,v),rc(H,he,v-(n||0))),x&&!rt&&ke.update(),!ie||rt||X||(X=!0,ie(ke),X=!1)}},ke.getVelocity=function(){return(Ae()-D)/(at()-Ve)*1e3||0},ke.endAnimation=function(){Xa(ke.callbackAnimation),O&&(ee?ee.progress(1):O.paused()?ve||Xa(O,ke.direction<0,1):Xa(O,O.reversed()))},ke.labelToScroll=function(e){return O&&O.labels&&(B||ke.refresh()||B)+O.labels[e]/O.duration()*F||0},ke.getTrailing=function(t){var e=kt.indexOf(ke),r=0<ke.direction?kt.slice(0,e).reverse():kt.slice(e+1);return(ct(t)?r.filter(function(e){return e.vars.preventOverlaps===t}):r).filter(function(e){return 0<ke.direction?e.end<=B:e.start>=I})},ke.update=function(e,t,r){if(!de||r||e){var n,i,o,a,s,l,c,u=!0===rt?re:ke.scroll(),f=e?0:(u-B)/F,d=f<0?0:1<f?1:f||0,p=ke.progress;if(t&&(D=R,R=de?Ae():u,ue&&(w=_,_=O&&!ve?O.totalProgress():d)),E&&ae&&!Ke&&!ot&&st&&(!d&&B<u+(u-D)/(at()-Ve)*E?d=1e-4:1===d&&I>u+(u-D)/(at()-Ve)*E&&(d=.9999)),d!==p&&ke.enabled){if(a=(s=(n=ke.isActive=!!d&&d<1)!=(!!p&&p<1))||!!d!=!!p,ke.direction=p<d?1:-1,ke.progress=d,a&&!Ke&&(i=d&&!p?0:1===d?1:1===p?2:3,ve&&(o=!s&&"none"!==_e[i+1]&&_e[i+1]||_e[i],c=O&&("complete"===o||"reset"===o||o in O))),ge&&(s||c)&&(c||M||!O)&&(Ua(ge)?ge(ke):ke.getTrailing(ge).forEach(function(e){return e.endAnimation()})),ve||(!ee||Ke||ot?O&&O.totalProgress(d,!(!Ke||!Pe&&!e)):(ee._dp._time-ee._start!==ee._time&&ee.render(ee._dp._time-ee._start),ee.resetTo?ee.resetTo("totalProgress",d,O._tTime/O._tDur):(ee.vars.totalProgress=d,ee.invalidate().restart()))),ae)if(e&&se&&(V.style[se+he.os2]=m),ye){if(a){if(l=!e&&p<d&&u<I+1&&u+1>=Ra(be,he),fe)if(e||!n&&!l)pc(ae,V);else{var g=_t(ae,!0),h=u-B;pc(ae,We,g.top+(he===qe?h:0)+xt,g.left+(he===qe?0:h)+xt)}Pt(n||l?W:G),$&&d<1&&n||b(Q+(1!==d||l?0:j))}}else b(Ja(Q+j*d));!ue||A.tween||Ke||ot||te.restart(!0),T&&(s||ce&&d&&(d<1||!tt))&&Je(T.targets).forEach(function(e){return e.classList[n||ce?"add":"remove"](T.className)}),!k||ve||e||k(ke),a&&!Ke?(ve&&(c&&("complete"===o?O.pause().totalProgress(1):"reset"===o?O.restart(!0).pause():"restart"===o?O.restart(!0):O[o]()),k&&k(ke)),!s&&tt||(C&&s&&Ya(ke,C),xe[i]&&Ya(ke,xe[i]),ce&&(1===d?ke.kill(!1,1):xe[i]=0),s||xe[i=1===d?1:3]&&Ya(ke,xe[i])),pe&&!n&&Math.abs(ke.getVelocity())>(Va(pe)?pe:2500)&&(Xa(ke.callbackAnimation),ee?ee.progress(1):Xa(O,"reverse"===o?1:!d,1))):ve&&k&&!Ke&&k(ke)}if(x){var v=de?u/de.duration()*(de._caScrollDist||0):u;y(v+(q._isFlipped?1:0)),x(v)}S&&S(-u/de.duration()*(de._caScrollDist||0))}},ke.enable=function(e,t){ke.enabled||(ke.enabled=!0,xb(be,"resize",Mb),me||xb(be,"scroll",Kb),Te&&xb(ScrollTrigger,"refreshInit",Te),!1!==e&&(ke.progress=Oe=0,R=D=Ee=Ae()),!1!==t&&ke.refresh())},ke.getTween=function(e){return e&&A?A.tween:ee},ke.setPositions=function(e,t,r,n){if(de){var i=de.scrollTrigger,o=de.duration(),a=i.end-i.start;e=i.start+a*e/o,t=i.start+a*t/o}ke.refresh(!1,!1,{start:Ea(e,r&&!!ke._startClamp),end:Ea(t,r&&!!ke._endClamp)},n),ke.update()},ke.adjustPinSpacing=function(e){if(Z&&e){var t=Z.indexOf(he.d)+1;Z[t]=parseFloat(Z[t])+e+xt,Z[1]=parseFloat(Z[1])+e+xt,Pt(Z)}},ke.disable=function(e,t){if(ke.enabled&&(!1!==e&&ke.revert(!0,!0),ke.enabled=ke.isActive=!1,t||ee&&ee.pause(),re=0,n&&(n.uncache=1),Te&&yb(ScrollTrigger,"refreshInit",Te),te&&(te.pause(),A.tween&&A.tween.kill()&&(A.tween=0)),!me)){for(var r=kt.length;r--;)if(kt[r].scroller===be&&kt[r]!==ke)return;yb(be,"resize",Mb),me||yb(be,"scroll",Kb)}},ke.kill=function(e,t){ke.disable(e,t),ee&&!t&&ee.kill(),a&&delete Tt[a];var r=kt.indexOf(ke);0<=r&&kt.splice(r,1),r===je&&0<Et&&je--,r=0,kt.forEach(function(e){return e.scroller===ke.scroller&&(r=1)}),r||rt||(ke.scroll.rec=0),O&&(O.scrollTrigger=null,e&&O.revert({kill:!1}),t||O.kill()),Y&&[Y,H,q,N].forEach(function(e){return e.parentNode&&e.parentNode.removeChild(e)}),it===ke&&(it=0),ae&&(n&&(n.uncache=1),r=0,kt.forEach(function(e){return e.pin===ae&&r++}),r||(n.spacer=0)),P.onKill&&P.onKill(ke)},kt.push(ke),ke.enable(!1,!1),o&&o(ke),O&&O.add&&!F){var v=ke.update;ke.update=function(){ke.update=v,ze.cache++,B||I||ke.refresh()},Ne.delayedCall(.01,ke.update),F=.01,B=I=0}else ke.refresh();ae&&function _queueRefreshAll(){if(nt!==Ct){var e=nt=Ct;requestAnimationFrame(function(){return e===Ct&&Mt(!0)})}}()}else this.update=this.refresh=this.kill=Ia},ScrollTrigger.register=function register(e){return s||(Ne=e||La(),Ka()&&window.document&&ScrollTrigger.enable(),s=lt),s},ScrollTrigger.defaults=function defaults(e){if(e)for(var t in e)St[t]=e[t];return St},ScrollTrigger.disable=function disable(t,r){lt=0,kt.forEach(function(e){return e[r?"kill":"disable"](t)}),yb(Xe,"wheel",Kb),yb(Fe,"scroll",Kb),clearInterval(u),yb(Fe,"touchcancel",Ia),yb(We,"touchstart",Ia),wb(yb,Fe,"pointerdown,touchstart,mousedown",Ga),wb(yb,Fe,"pointerup,touchend,mouseup",Ha),c.kill(),Sa(yb);for(var e=0;e<ze.length;e+=3)zb(yb,ze[e],ze[e+1]),zb(yb,ze[e],ze[e+2])},ScrollTrigger.enable=function enable(){if(Xe=window,Fe=document,Ue=Fe.documentElement,We=Fe.body,Ne&&(Je=Ne.utils.toArray,Ge=Ne.utils.clamp,x=Ne.core.context||Ia,$e=Ne.core.suppressOverwrites||Ia,_=Xe.history.scrollRestoration||"auto",j=Xe.pageYOffset||0,Ne.core.globals("ScrollTrigger",ScrollTrigger),We)){lt=1,(w=document.createElement("div")).style.height="100vh",w.style.position="absolute",Zb(),function _rafBugFix(){return lt&&requestAnimationFrame(_rafBugFix)}(),E.register(Ne),ScrollTrigger.isTouch=E.isTouch,R=E.isTouch&&/(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent),b=1===E.isTouch,xb(Xe,"wheel",Kb),l=[Xe,Fe,Ue,We],Ne.matchMedia?(ScrollTrigger.matchMedia=function(e){var t,r=Ne.matchMedia();for(t in e)r.add(t,e[t]);return r},Ne.addEventListener("matchMediaInit",function(){return Tb()}),Ne.addEventListener("matchMediaRevert",function(){return Sb()}),Ne.addEventListener("matchMedia",function(){Mt(0,1),V("matchMedia")}),Ne.matchMedia().add("(orientation: portrait)",function(){return Lb(),Lb})):console.warn("Requires GSAP 3.11.0 or later"),Lb(),xb(Fe,"scroll",Kb);var e,t,r=We.hasAttribute("style"),n=We.style,i=n.borderTopStyle,o=Ne.core.Animation.prototype;for(o.revert||Object.defineProperty(o,"revert",{value:function value(){return this.time(-.01,!0)}}),n.borderTopStyle="solid",e=_t(We),qe.m=Math.round(e.top+qe.sc())||0,He.m=Math.round(e.left+He.sc())||0,i?n.borderTopStyle=i:n.removeProperty("border-top-style"),r||(We.setAttribute("style",""),We.removeAttribute("style")),u=setInterval(Jb,250),Ne.delayedCall(.5,function(){return ot=0}),xb(Fe,"touchcancel",Ia),xb(We,"touchstart",Ia),wb(xb,Fe,"pointerdown,touchstart,mousedown",Ga),wb(xb,Fe,"pointerup,touchend,mouseup",Ha),f=Ne.utils.checkPrefix("transform"),ee.push(f),s=at(),c=Ne.delayedCall(.2,Mt).pause(),g=[Fe,"visibilitychange",function(){var e=Xe.innerWidth,t=Xe.innerHeight;Fe.hidden?(d=e,p=t):d===e&&p===t||Mb()},Fe,"DOMContentLoaded",Mt,Xe,"load",Mt,Xe,"resize",Mb],Sa(xb),kt.forEach(function(e){return e.enable(0,1)}),t=0;t<ze.length;t+=3)zb(yb,ze[t],ze[t+1]),zb(yb,ze[t],ze[t+2])}},ScrollTrigger.config=function config(e){"limitCallbacks"in e&&(tt=!!e.limitCallbacks);var t=e.syncInterval;t&&clearInterval(u)||(u=t)&&setInterval(Jb,t),"ignoreMobileResize"in e&&(b=1===ScrollTrigger.isTouch&&e.ignoreMobileResize),"autoRefreshEvents"in e&&(Sa(yb)||Sa(xb,e.autoRefreshEvents||"none"),h=-1===(e.autoRefreshEvents+"").indexOf("resize"))},ScrollTrigger.scrollerProxy=function scrollerProxy(e,t){var r=J(e),n=ze.indexOf(r),i=Ma(r);~n&&ze.splice(n,i?6:2),t&&(i?Ye.unshift(Xe,t,We,t,Ue,t):Ye.unshift(r,t))},ScrollTrigger.clearMatchMedia=function clearMatchMedia(t){kt.forEach(function(e){return e._ctx&&e._ctx.query===t&&e._ctx.kill(!0,!0)})},ScrollTrigger.isInViewport=function isInViewport(e,t,r){var n=(ct(e)?J(e):e).getBoundingClientRect(),i=n[r?ft:dt]*t||0;return r?0<n.right-i&&n.left+i<Xe.innerWidth:0<n.bottom-i&&n.top+i<Xe.innerHeight},ScrollTrigger.positionInViewport=function positionInViewport(e,t,r){ct(e)&&(e=J(e));var n=e.getBoundingClientRect(),i=n[r?ft:dt],o=null==t?i/2:t in q?q[t]*i:~t.indexOf("%")?parseFloat(t)*i/100:parseFloat(t)||0;return r?(n.left+o)/Xe.innerWidth:(n.top+o)/Xe.innerHeight},ScrollTrigger.killAll=function killAll(e){if(kt.slice(0).forEach(function(e){return"ScrollSmoother"!==e.vars.id&&e.kill()}),!0!==e){var t=U.killAll||[];U={},t.forEach(function(e){return e()})}},ScrollTrigger);function ScrollTrigger(e,t){s||ScrollTrigger.register(Ne)||console.warn("Please gsap.registerPlugin(ScrollTrigger)"),x(this),this.init(e,t)}ne.version="3.13.0",ne.saveStyles=function(e){return e?Je(e).forEach(function(e){if(e&&e.style){var t=K.indexOf(e);0<=t&&K.splice(t,5),K.push(e,e.style.cssText,e.getBBox&&e.getAttribute("transform"),Ne.core.getCache(e),x())}}):K},ne.revert=function(e,t){return Tb(!e,t)},ne.create=function(e,t){return new ne(e,t)},ne.refresh=function(e){return e?Mb(!0):(s||ne.register())&&Mt(!0)},ne.update=function(e){return++ze.cache&&Z(!0===e?2:0)},ne.clearScrollMemory=Ub,ne.maxScroll=function(e,t){return Ra(e,t?He:qe)},ne.getScrollFunc=function(e,t){return L(J(e),t?He:qe)},ne.getById=function(e){return Tt[e]},ne.getAll=function(){return kt.filter(function(e){return"ScrollSmoother"!==e.vars.id})},ne.isScrolling=function(){return!!st},ne.snapDirectional=ub,ne.addEventListener=function(e,t){var r=U[e]||(U[e]=[]);~r.indexOf(t)||r.push(t)},ne.removeEventListener=function(e,t){var r=U[e],n=r&&r.indexOf(t);0<=n&&r.splice(n,1)},ne.batch=function(e,t){function Jp(e,t){var r=[],n=[],i=Ne.delayedCall(o,function(){t(r,n),r=[],n=[]}).pause();return function(e){r.length||i.restart(!0),r.push(e.trigger),n.push(e),a<=r.length&&i.progress(1)}}var r,n=[],i={},o=t.interval||.016,a=t.batchMax||1e9;for(r in t)i[r]="on"===r.substr(0,2)&&Ua(t[r])&&"onRefreshInit"!==r?Jp(0,t[r]):t[r];return Ua(a)&&(a=a(),xb(ne,"refresh",function(){return a=t.batchMax()})),Je(e).forEach(function(e){var t={};for(r in i)t[r]=i[r];t.trigger=e,n.push(ne.create(t))}),n};function uc(e,t,r,n){return n<t?e(n):t<0&&e(0),n<r?(n-t)/(r-t):r<0?t/(t-r):1}function vc(e,t){!0===t?e.style.removeProperty("touch-action"):e.style.touchAction=!0===t?"auto":t?"pan-"+t+(E.isTouch?" pinch-zoom":""):"none",e===Ue&&vc(We,t)}function xc(e){var t,r=e.event,n=e.target,i=e.axis,o=(r.changedTouches?r.changedTouches[0]:r).target,a=o._gsap||Ne.core.getCache(o),s=at();if(!a._isScrollT||2e3<s-a._isScrollT){for(;o&&o!==We&&(o.scrollHeight<=o.clientHeight&&o.scrollWidth<=o.clientWidth||!oe[(t=nb(o)).overflowY]&&!oe[t.overflowX]);)o=o.parentNode;a._isScroll=o&&o!==n&&!Ma(o)&&(oe[(t=nb(o)).overflowY]||oe[t.overflowX]),a._isScrollT=s}!a._isScroll&&"x"!==i||(r.stopPropagation(),r._gsapAllow=!0)}function yc(e,t,r,n){return E.create({target:e,capture:!0,debounce:!1,lockAxis:!0,type:t,onWheel:n=n&&xc,onPress:n,onDrag:n,onScroll:n,onEnable:function onEnable(){return r&&xb(Fe,E.eventTypes[0],se,!1,!0)},onDisable:function onDisable(){return yb(Fe,E.eventTypes[0],se,!0)}})}function Cc(e){function Gq(){return i=!1}function Jq(){o=Ra(p,qe),T=Ge(R?1:0,o),f&&(k=Ge(0,Ra(p,He))),l=Ct}function Kq(){v._gsap.y=Ja(parseFloat(v._gsap.y)+b.offset)+"px",v.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+parseFloat(v._gsap.y)+", 0, 1)",b.offset=b.cacheID=0}function Qq(){Jq(),a.isActive()&&a.vars.scrollY>o&&(b()>o?a.progress(1)&&b(o):a.resetTo("scrollY",o))}Wa(e)||(e={}),e.preventDefault=e.isNormalizer=e.allowClicks=!0,e.type||(e.type="wheel,touch"),e.debounce=!!e.debounce,e.id=e.id||"normalizer";var n,o,l,i,a,c,u,s,f=e.normalizeScrollX,t=e.momentum,r=e.allowNestedScroll,d=e.onRelease,p=J(e.target)||Ue,g=Ne.core.globals().ScrollSmoother,h=g&&g.get(),v=R&&(e.content&&J(e.content)||h&&!1!==e.content&&!h.smooth()&&h.content()),b=L(p,qe),m=L(p,He),y=1,x=(E.isTouch&&Xe.visualViewport?Xe.visualViewport.scale*Xe.visualViewport.width:Xe.outerWidth)/Xe.innerWidth,_=0,w=Ua(t)?function(){return t(n)}:function(){return t||2.8},S=yc(p,e.type,!0,r),k=Ia,T=Ia;return v&&Ne.set(v,{y:"+=0"}),e.ignoreCheck=function(e){return R&&"touchmove"===e.type&&function ignoreDrag(){if(i){requestAnimationFrame(Gq);var e=Ja(n.deltaY/2),t=T(b.v-e);if(v&&t!==b.v+b.offset){b.offset=t-b.v;var r=Ja((parseFloat(v&&v._gsap.y)||0)-b.offset);v.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+r+", 0, 1)",v._gsap.y=r+"px",b.cacheID=ze.cache,Z()}return!0}b.offset&&Kq(),i=!0}()||1.05<y&&"touchstart"!==e.type||n.isGesturing||e.touches&&1<e.touches.length},e.onPress=function(){i=!1;var e=y;y=Ja((Xe.visualViewport&&Xe.visualViewport.scale||1)/x),a.pause(),e!==y&&vc(p,1.01<y||!f&&"x"),c=m(),u=b(),Jq(),l=Ct},e.onRelease=e.onGestureStart=function(e,t){if(b.offset&&Kq(),t){ze.cache++;var r,n,i=w();f&&(n=(r=m())+.05*i*-e.velocityX/.227,i*=uc(m,r,n,Ra(p,He)),a.vars.scrollX=k(n)),n=(r=b())+.05*i*-e.velocityY/.227,i*=uc(b,r,n,Ra(p,qe)),a.vars.scrollY=T(n),a.invalidate().duration(i).play(.01),(R&&a.vars.scrollY>=o||o-1<=r)&&Ne.to({},{onUpdate:Qq,duration:i})}else s.restart(!0);d&&d(e)},e.onWheel=function(){a._ts&&a.pause(),1e3<at()-_&&(l=0,_=at())},e.onChange=function(e,t,r,n,i){if(Ct!==l&&Jq(),t&&f&&m(k(n[2]===t?c+(e.startX-e.x):m()+t-n[1])),r){b.offset&&Kq();var o=i[2]===r,a=o?u+e.startY-e.y:b()+r-i[1],s=T(a);o&&a!==s&&(u+=s-a),b(s)}(r||t)&&Z()},e.onEnable=function(){vc(p,!f&&"x"),ne.addEventListener("refresh",Qq),xb(Xe,"resize",Qq),b.smooth&&(b.target.style.scrollBehavior="auto",b.smooth=m.smooth=!1),S.enable()},e.onDisable=function(){vc(p,!0),yb(Xe,"resize",Qq),ne.removeEventListener("refresh",Qq),S.kill()},e.lockAxis=!1!==e.lockAxis,((n=new E(e)).iOS=R)&&!b()&&b(1),R&&Ne.ticker.add(Ia),s=n._dc,a=Ne.to(n,{ease:"power4",paused:!0,inherit:!1,scrollX:f?"+=0.1":"+=0",scrollY:"+=0.1",modifiers:{scrollY:qc(b,b(),function(){return a.pause()})},onUpdate:Z,onComplete:s.vars.onComplete}),n}var ie,oe={auto:1,scroll:1},ae=/(input|label|select|textarea)/i,se=function _captureInputs(e){var t=ae.test(e.target.tagName);(t||ie)&&(e._gsapAllow=!0,ie=t)};ne.sort=function(e){if(Ua(e))return kt.sort(e);var t=Xe.pageYOffset||0;return ne.getAll().forEach(function(e){return e._sortY=e.trigger?t+e.trigger.getBoundingClientRect().top:e.start+Xe.innerHeight}),kt.sort(e||function(e,t){return-1e6*(e.vars.refreshPriority||0)+(e.vars.containerAnimation?1e6:e._sortY)-((t.vars.containerAnimation?1e6:t._sortY)+-1e6*(t.vars.refreshPriority||0))})},ne.observe=function(e){return new E(e)},ne.normalizeScroll=function(e){if(void 0===e)return v;if(!0===e&&v)return v.enable();if(!1===e)return v&&v.kill(),void(v=e);var t=e instanceof E?e:Cc(e);return v&&v.target===t.target&&v.kill(),Ma(t.target)&&(v=t),t},ne.core={_getVelocityProp:M,_inputObserver:yc,_scrollers:ze,_proxies:Ye,bridge:{ss:function ss(){st||V("scrollStart"),st=at()},ref:function ref(){return Ke}}},La()&&Ne.registerPlugin(ne),e.ScrollTrigger=ne,e.default=ne;if (typeof(window)==="undefined"||window!==e){Object.defineProperty(e,"__esModule",{value:!0})} else {delete e.default}});

;
/*!
 * SplitText 3.13.0
 * https://gsap.com
 *
 * @license Copyright 2025, GreenSock. All rights reserved. Subject to the terms at https://gsap.com/standard-license.
 * @author: Jack Doyle
 */

(function(B,A){typeof exports=="object"&&typeof module!="undefined"?A(exports):typeof define=="function"&&define.amd?define(["exports"],A):(B=typeof globalThis!="undefined"?globalThis:B||self,A(B.window=B.window||{}))})(this,function(B){"use strict";let A,_,G,re=()=>G||U.register(window.gsap),V=typeof Intl!="undefined"?new Intl.Segmenter:0,P=e=>typeof e=="string"?P(document.querySelectorAll(e)):"length"in e?Array.from(e):[e],X=e=>P(e).filter(t=>t instanceof HTMLElement),J=[],K=function(){},oe=/\s+/g,Y=new RegExp("\\p{RI}\\p{RI}|\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?(\\u{200D}\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?)*|.","gu"),Z={left:0,top:0,width:0,height:0},ee=(e,t)=>{if(t){let s=new Set(e.join("").match(t)||J),i=e.length,o,c,n,a;if(s.size)for(;--i>-1;){c=e[i];for(n of s)if(n.startsWith(c)&&n.length>c.length){for(o=0,a=c;n.startsWith(a+=e[i+ ++o])&&a.length<n.length;);if(o&&a.length===n.length){e[i]=n,e.splice(i+1,o);break}}}}return e},te=e=>window.getComputedStyle(e).display==="inline"&&(e.style.display="inline-block"),z=(e,t,s)=>t.insertBefore(typeof e=="string"?document.createTextNode(e):e,s),Q=(e,t,s)=>{let i=t[e+"sClass"]||"",{tag:o="div",aria:c="auto",propIndex:n=!1}=t,a=e==="line"?"block":"inline-block",h=i.indexOf("++")>-1,b=x=>{let g=document.createElement(o),C=s.length+1;return i&&(g.className=i+(h?" "+i+C:"")),n&&g.style.setProperty("--"+e,C+""),c!=="none"&&g.setAttribute("aria-hidden","true"),o!=="span"&&(g.style.position="relative",g.style.display=a),g.textContent=x,s.push(g),g};return h&&(i=i.replace("++","")),b.collection=s,b},ae=(e,t,s,i)=>{let o=Q("line",s,i),c=window.getComputedStyle(e).textAlign||"left";return(n,a)=>{let h=o("");for(h.style.textAlign=c,e.insertBefore(h,t[n]);n<a;n++)h.appendChild(t[n]);h.normalize()}},ie=(e,t,s,i,o,c,n,a,h,b)=>{var x;let g=Array.from(e.childNodes),C=0,{wordDelimiter:R,reduceWhiteSpace:L=!0,prepareText:$}=t,q=e.getBoundingClientRect(),j=q,D=!L&&window.getComputedStyle(e).whiteSpace.substring(0,3)==="pre",E=0,v=s.collection,r,f,H,l,m,y,I,d,u,W,S,O,T,F,w,p,k,N;for(typeof R=="object"?(H=R.delimiter||R,f=R.replaceWith||""):f=R===""?"":R||" ",r=f!==" ";C<g.length;C++)if(l=g[C],l.nodeType===3){for(w=l.textContent||"",L?w=w.replace(oe," "):D&&(w=w.replace(/\n/g,f+`
`)),$&&(w=$(w,e)),l.textContent=w,m=f||H?w.split(H||f):w.match(a)||J,k=m[m.length-1],d=r?k.slice(-1)===" ":!k,k||m.pop(),j=q,I=r?m[0].charAt(0)===" ":!m[0],I&&z(" ",e,l),m[0]||m.shift(),ee(m,h),c&&b||(l.textContent=""),u=1;u<=m.length;u++)if(p=m[u-1],!L&&D&&p.charAt(0)===`
`&&((x=l.previousSibling)==null||x.remove(),z(document.createElement("br"),e,l),p=p.slice(1)),!L&&p==="")z(f,e,l);else if(p===" ")e.insertBefore(document.createTextNode(" "),l);else{if(r&&p.charAt(0)===" "&&z(" ",e,l),E&&u===1&&!I&&v.indexOf(E.parentNode)>-1?(y=v[v.length-1],y.appendChild(document.createTextNode(i?"":p))):(y=s(i?"":p),z(y,e,l),E&&u===1&&!I&&y.insertBefore(E,y.firstChild)),i)for(S=V?ee([...V.segment(p)].map(M=>M.segment),h):p.match(a)||J,N=0;N<S.length;N++)y.appendChild(S[N]===" "?document.createTextNode(" "):i(S[N]));if(c&&b){if(w=l.textContent=w.substring(p.length+1,w.length),W=y.getBoundingClientRect(),W.top>j.top&&W.left<=j.left){for(O=e.cloneNode(),T=e.childNodes[0];T&&T!==y;)F=T,T=T.nextSibling,O.appendChild(F);e.parentNode.insertBefore(O,e),o&&te(O)}j=W}(u<m.length||d)&&z(u>=m.length?" ":r&&p.slice(-1)===" "?" "+f:f,e,l)}e.removeChild(l),E=0}else l.nodeType===1&&(n&&n.indexOf(l)>-1?(v.indexOf(l.previousSibling)>-1&&v[v.length-1].appendChild(l),E=l):(ie(l,t,s,i,o,c,n,a,h,!0),E=0),o&&te(l))};const ne=class se{constructor(t,s){this.isSplit=!1,re(),this.elements=X(t),this.chars=[],this.words=[],this.lines=[],this.masks=[],this.vars=s,this._split=()=>this.isSplit&&this.split(this.vars);let i=[],o,c=()=>{let n=i.length,a;for(;n--;){a=i[n];let h=a.element.offsetWidth;if(h!==a.width){a.width=h,this._split();return}}};this._data={orig:i,obs:typeof ResizeObserver!="undefined"&&new ResizeObserver(()=>{clearTimeout(o),o=setTimeout(c,200)})},K(this),this.split(s)}split(t){this.isSplit&&this.revert(),this.vars=t=t||this.vars||{};let{type:s="chars,words,lines",aria:i="auto",deepSlice:o=!0,smartWrap:c,onSplit:n,autoSplit:a=!1,specialChars:h,mask:b}=this.vars,x=s.indexOf("lines")>-1,g=s.indexOf("chars")>-1,C=s.indexOf("words")>-1,R=g&&!C&&!x,L=h&&("push"in h?new RegExp("(?:"+h.join("|")+")","gu"):h),$=L?new RegExp(L.source+"|"+Y.source,"gu"):Y,q=!!t.ignore&&X(t.ignore),{orig:j,animTime:D,obs:E}=this._data,v;return(g||C||x)&&(this.elements.forEach((r,f)=>{j[f]={element:r,html:r.innerHTML,ariaL:r.getAttribute("aria-label"),ariaH:r.getAttribute("aria-hidden")},i==="auto"?r.setAttribute("aria-label",(r.textContent||"").trim()):i==="hidden"&&r.setAttribute("aria-hidden","true");let H=[],l=[],m=[],y=g?Q("char",t,H):null,I=Q("word",t,l),d,u,W,S;if(ie(r,t,I,y,R,o&&(x||R),q,$,L,!1),x){let O=P(r.childNodes),T=ae(r,O,t,m),F,w=[],p=0,k=O.map(M=>M.nodeType===1?M.getBoundingClientRect():Z),N=Z;for(d=0;d<O.length;d++)F=O[d],F.nodeType===1&&(F.nodeName==="BR"?(w.push(F),T(p,d+1),p=d+1,N=k[p]):(d&&k[d].top>N.top&&k[d].left<=N.left&&(T(p,d),p=d),N=k[d]));p<d&&T(p,d),w.forEach(M=>{var le;return(le=M.parentNode)==null?void 0:le.removeChild(M)})}if(!C){for(d=0;d<l.length;d++)if(u=l[d],g||!u.nextSibling||u.nextSibling.nodeType!==3)if(c&&!x){for(W=document.createElement("span"),W.style.whiteSpace="nowrap";u.firstChild;)W.appendChild(u.firstChild);u.replaceWith(W)}else u.replaceWith(...u.childNodes);else S=u.nextSibling,S&&S.nodeType===3&&(S.textContent=(u.textContent||"")+(S.textContent||""),u.remove());l.length=0,r.normalize()}this.lines.push(...m),this.words.push(...l),this.chars.push(...H)}),b&&this[b]&&this.masks.push(...this[b].map(r=>{let f=r.cloneNode();return r.replaceWith(f),f.appendChild(r),r.className&&(f.className=r.className.replace(/(\b\w+\b)/g,"$1-mask")),f.style.overflow="clip",f}))),this.isSplit=!0,_&&(a?_.addEventListener("loadingdone",this._split):_.status==="loading"&&console.warn("SplitText called before fonts loaded")),(v=n&&n(this))&&v.totalTime&&(this._data.anim=D?v.totalTime(D):v),x&&a&&this.elements.forEach((r,f)=>{j[f].width=r.offsetWidth,E&&E.observe(r)}),this}revert(){var t,s;let{orig:i,anim:o,obs:c}=this._data;return c&&c.disconnect(),i.forEach(({element:n,html:a,ariaL:h,ariaH:b})=>{n.innerHTML=a,h?n.setAttribute("aria-label",h):n.removeAttribute("aria-label"),b?n.setAttribute("aria-hidden",b):n.removeAttribute("aria-hidden")}),this.chars.length=this.words.length=this.lines.length=i.length=this.masks.length=0,this.isSplit=!1,_==null||_.removeEventListener("loadingdone",this._split),o&&(this._data.animTime=o.totalTime(),o.revert()),(s=(t=this.vars).onRevert)==null||s.call(t,this),this}static create(t,s){return new se(t,s)}static register(t){A=A||t||window.gsap,A&&(P=A.utils.toArray,K=A.core.context||K),!G&&window.innerWidth>0&&(_=document.fonts,G=!0)}};ne.version="3.13.0";let U=ne;B.SplitText=U,B.default=U,Object.defineProperty(B,"__esModule",{value:!0})});
;
/*!
 * ScrollToPlugin 3.12.5
 * https://gsap.com
 * 
 * @license Copyright 2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).window=e.window||{})}(this,function(e){"use strict";function l(){return"undefined"!=typeof window}function m(){return f||l()&&(f=window.gsap)&&f.registerPlugin&&f}function n(e){return"string"==typeof e}function o(e){return"function"==typeof e}function p(e,t){var o="x"===t?"Width":"Height",n="scroll"+o,r="client"+o;return e===T||e===i||e===c?Math.max(i[n],c[n])-(T["inner"+o]||i[r]||c[r]):e[n]-e["offset"+o]}function q(e,t){var o="scroll"+("x"===t?"Left":"Top");return e===T&&(null!=e.pageXOffset?o="page"+t.toUpperCase()+"Offset":e=null!=i[o]?i:c),function(){return e[o]}}function s(e,t){if(!(e=y(e)[0])||!e.getBoundingClientRect)return console.warn("scrollTo target doesn't exist. Using 0")||{x:0,y:0};var o=e.getBoundingClientRect(),n=!t||t===T||t===c,r=n?{top:i.clientTop-(T.pageYOffset||i.scrollTop||c.scrollTop||0),left:i.clientLeft-(T.pageXOffset||i.scrollLeft||c.scrollLeft||0)}:t.getBoundingClientRect(),l={x:o.left-r.left,y:o.top-r.top};return!n&&t&&(l.x+=q(t,"x")(),l.y+=q(t,"y")()),l}function t(e,t,o,r,l){return isNaN(e)||"object"==typeof e?n(e)&&"="===e.charAt(1)?parseFloat(e.substr(2))*("-"===e.charAt(0)?-1:1)+r-l:"max"===e?p(t,o)-l:Math.min(p(t,o),s(e,t)[o]-l):parseFloat(e)-l}function u(){f=m(),l()&&f&&"undefined"!=typeof document&&document.body&&(T=window,c=document.body,i=document.documentElement,y=f.utils.toArray,f.config({autoKillThreshold:7}),h=f.config(),a=1)}var f,a,T,i,c,y,h,v,r={version:"3.12.5",name:"scrollTo",rawVars:1,register:function register(e){f=e,u()},init:function init(e,r,l,s,i){a||u();var p=this,c=f.getProperty(e,"scrollSnapType");p.isWin=e===T,p.target=e,p.tween=l,r=function _clean(e,t,r,l){if(o(e)&&(e=e(t,r,l)),"object"!=typeof e)return n(e)&&"max"!==e&&"="!==e.charAt(1)?{x:e,y:e}:{y:e};if(e.nodeType)return{y:e,x:e};var s,i={};for(s in e)i[s]="onAutoKill"!==s&&o(e[s])?e[s](t,r,l):e[s];return i}(r,s,e,i),p.vars=r,p.autoKill=!!r.autoKill,p.getX=q(e,"x"),p.getY=q(e,"y"),p.x=p.xPrev=p.getX(),p.y=p.yPrev=p.getY(),v=v||f.core.globals().ScrollTrigger,"smooth"===f.getProperty(e,"scrollBehavior")&&f.set(e,{scrollBehavior:"auto"}),c&&"none"!==c&&(p.snap=1,p.snapInline=e.style.scrollSnapType,e.style.scrollSnapType="none"),null!=r.x?(p.add(p,"x",p.x,t(r.x,e,"x",p.x,r.offsetX||0),s,i),p._props.push("scrollTo_x")):p.skipX=1,null!=r.y?(p.add(p,"y",p.y,t(r.y,e,"y",p.y,r.offsetY||0),s,i),p._props.push("scrollTo_y")):p.skipY=1},render:function render(e,t){for(var o,n,r,l,s,i=t._pt,c=t.target,u=t.tween,f=t.autoKill,a=t.xPrev,y=t.yPrev,d=t.isWin,g=t.snap,x=t.snapInline;i;)i.r(e,i.d),i=i._next;o=d||!t.skipX?t.getX():a,r=(n=d||!t.skipY?t.getY():y)-y,l=o-a,s=h.autoKillThreshold,t.x<0&&(t.x=0),t.y<0&&(t.y=0),f&&(!t.skipX&&(s<l||l<-s)&&o<p(c,"x")&&(t.skipX=1),!t.skipY&&(s<r||r<-s)&&n<p(c,"y")&&(t.skipY=1),t.skipX&&t.skipY&&(u.kill(),t.vars.onAutoKill&&t.vars.onAutoKill.apply(u,t.vars.onAutoKillParams||[]))),d?T.scrollTo(t.skipX?o:t.x,t.skipY?n:t.y):(t.skipY||(c.scrollTop=t.y),t.skipX||(c.scrollLeft=t.x)),!g||1!==e&&0!==e||(n=c.scrollTop,o=c.scrollLeft,x?c.style.scrollSnapType=x:c.style.removeProperty("scroll-snap-type"),c.scrollTop=n+1,c.scrollLeft=o+1,c.scrollTop=n,c.scrollLeft=o),t.xPrev=t.x,t.yPrev=t.y,v&&v.update()},kill:function kill(e){var t="scrollTo"===e,o=this._props.indexOf(e);return!t&&"scrollTo_x"!==e||(this.skipX=1),!t&&"scrollTo_y"!==e||(this.skipY=1),-1<o&&this._props.splice(o,1),!this._props.length}};r.max=p,r.getOffset=s,r.buildGetter=q,m()&&f.registerPlugin(r),e.ScrollToPlugin=r,e.default=r;if (typeof(window)==="undefined"||window!==e){Object.defineProperty(e,"__esModule",{value:!0})} else {delete e.default}});

;
/*!
 * ScrambleTextPlugin 3.13.0
 * https://gsap.com
 * 
 * @license Copyright 2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license.
 * @author: Jack Doyle, jack@greensock.com
 */

!function(D,u){"object"==typeof exports&&"undefined"!=typeof module?u(exports):"function"==typeof define&&define.amd?define(["exports"],u):u((D=D||self).window=D.window||{})}(this,function(D){"use strict";var s=/(?:^\s+|\s+$)/g,a=/([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2642\u2640]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDD27\uDCBC\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCC\uDFCB]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;function getText(D){var u=D.nodeType,F="";if(1===u||9===u||11===u){if("string"==typeof D.textContent)return D.textContent;for(D=D.firstChild;D;D=D.nextSibling)F+=getText(D)}else if(3===u||4===u)return D.nodeValue;return F}function emojiSafeSplit(D,u,F,C,E){if(D+="",F&&(D=D.trim?D.trim():D.replace(s,"")),u&&""!==u)return D.replace(/>/g,"&gt;").replace(/</g,"&lt;").split(u);for(var e,t,i=[],n=D.length,r=0;r<n;r++)(55296<=(t=D.charAt(r)).charCodeAt(0)&&t.charCodeAt(0)<=56319||65024<=D.charCodeAt(r+1)&&D.charCodeAt(r+1)<=65039)&&(e=((D.substr(r,12).split(a)||[])[1]||"").length||2,t=D.substr(r,e),r+=e-(i.emoji=1)),i.push(E?t:">"===t?"&gt;":"<"===t?"&lt;":!C||" "!==t||" "!==D.charAt(r-1)&&" "!==D.charAt(r+1)?t:"&nbsp;");return i}var o=(CharSet.prototype.grow=function grow(D){for(var u=0;u<20;u++)this.sets[u]+=F(D-this.length,this.chars);this.length=D},CharSet);function CharSet(D){this.chars=emojiSafeSplit(D),this.sets=[],this.length=50;for(var u=0;u<20;u++)this.sets[u]=F(80,this.chars)}function i(){return u||"undefined"!=typeof window&&(u=window.gsap)&&u.registerPlugin&&u}function p(){B=u=i()}var u,B,l=/\s+/g,F=function _scrambleText(D,u){for(var F=u.length,C="";-1<--D;)C+=u[~~(Math.random()*F)];return C},C="ABCDEFGHIJKLMNOPQRSTUVWXYZ",E=C.toLowerCase(),A={upperCase:new o(C),lowerCase:new o(E),upperAndLowerCase:new o(C+E)},e={version:"3.13.0",name:"scrambleText",register:function register(D){u=D,p()},init:function init(D,u,F){if(B||p(),this.prop="innerHTML"in D?"innerHTML":"textContent"in D?"textContent":0,this.prop){this.target=D,"object"!=typeof u&&(u={text:u});var C,E,e,t,i=u.text||u.value||"",n=!1!==u.trim,r=this;return r.delimiter=C=u.delimiter||"",r.original=emojiSafeSplit(getText(D).replace(l," ").split("&nbsp;").join(""),C,n),"{original}"!==i&&!0!==i&&null!=i||(i=r.original.join(C)),r.text=emojiSafeSplit((i||"").replace(l," "),C,n),r.hasClass=!(!u.newClass&&!u.oldClass),r.newClass=u.newClass,r.oldClass=u.oldClass,t=""===C,r.textHasEmoji=t&&!!r.text.emoji,r.charsHaveEmoji=!!u.chars&&!!emojiSafeSplit(u.chars).emoji,r.length=t?r.original.length:r.original.join(C).length,r.lengthDif=(t?r.text.length:r.text.join(C).length)-r.length,r.fillChar=u.fillChar||u.chars&&~u.chars.indexOf(" ")?"&nbsp;":"",r.charSet=e=A[u.chars||"upperCase"]||new o(u.chars),r.speed=.05/(u.speed||1),r.prevScrambleTime=0,r.setIndex=20*Math.random()|0,(E=r.length+Math.max(r.lengthDif,0))>e.length&&e.grow(E),r.chars=e.sets[r.setIndex],r.revealDelay=u.revealDelay||0,r.tweenLength=!1!==u.tweenLength,r.tween=F,r.rightToLeft=!!u.rightToLeft,r._props.push("scrambleText","text"),1}},render:function render(D,u){var F,C,E,e,t,i,n,r,s,a,o,B=u.target,l=u.prop,A=u.text,h=u.delimiter,p=u.tween,f=u.prevScrambleTime,g=u.revealDelay,c=u.setIndex,d=u.chars,m=u.charSet,x=u.length,S=u.textHasEmoji,j=u.charsHaveEmoji,w=u.lengthDif,b=u.tweenLength,v=u.oldClass,T=u.newClass,_=u.rightToLeft,y=u.fillChar,L=u.speed,M=u.original,H=u.hasClass,I=A.length,P=p._time,O=P-f;g&&(p._from&&(P=p._dur-P),D=0===P?0:P<g?1e-6:P===p._dur?1:p._ease((P-g)/(p._dur-g))),D<0?D=0:1<D&&(D=1),_&&(D=1-D),F=~~(D*I+.5),e=D?((L<O||O<-L)&&(u.setIndex=c=(c+(19*Math.random()|0))%20,u.chars=m.sets[c],u.prevScrambleTime+=O),d):M.join(h),o=p._from?D:1-D,a=x+(b?p._from?o*o*o:1-o*o*o:1)*w,e=_?1!==D||!p._from&&"isFromStart"!==p.data?(n=A.slice(F).join(h),E=j?emojiSafeSplit(e).slice(0,a-(S?emojiSafeSplit(n):n).length+.5|0).join(""):e.substr(0,a-(S?emojiSafeSplit(n):n).length+.5|0),n):(E="",M.join(h)):(E=A.slice(0,F).join(h),C=(S?emojiSafeSplit(E):E).length,j?emojiSafeSplit(e).slice(C,a+.5|0).join(""):e.substr(C,a-C+.5|0)),n=H?((t=(r=_?v:T)&&0!=F)?"<span class='"+r+"'>":"")+E+(t?"</span>":"")+((i=(s=_?T:v)&&F!==I)?"<span class='"+s+"'>":"")+h+e+(i?"</span>":""):E+h+e,B[l]="&nbsp;"===y&&~n.indexOf("  ")?n.split("  ").join("&nbsp;&nbsp;"):n}};e.emojiSafeSplit=emojiSafeSplit,e.getText=getText,i()&&u.registerPlugin(e),D.ScrambleTextPlugin=e,D.default=e;if (typeof(window)==="undefined"||window!==D){Object.defineProperty(D,"__esModule",{value:!0})} else {delete D.default}});

;
/*!
 * Flip 3.13.0
 * https://gsap.com
 * 
 * @license Copyright 2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license.
 * @author: Jack Doyle, jack@greensock.com
 */

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t=t||self).window=t.window||{})}(this,function(e){"use strict";function p(t){var e=t.ownerDocument||t;!(k in t.style)&&"msTransform"in t.style&&(C=(k="msTransform")+"Origin");for(;e.parentNode&&(e=e.parentNode););if(y=window,m=new F,e){a=(g=e).documentElement,b=e.body,(s=g.createElementNS("http://www.w3.org/2000/svg","g")).style.transform="none";var i=e.createElement("div"),n=e.createElement("div"),r=e&&(e.body||e.firstElementChild);r&&r.appendChild&&(r.appendChild(i),i.appendChild(n),i.setAttribute("style","position:static;transform:translate3d(0,0,1px)"),w=n.offsetParent!==i,r.removeChild(i))}return e}function t(){return y.pageYOffset||g.scrollTop||a.scrollTop||b.scrollTop||0}function u(){return y.pageXOffset||g.scrollLeft||a.scrollLeft||b.scrollLeft||0}function v(t){return t.ownerSVGElement||("svg"===(t.tagName+"").toLowerCase()?t:null)}function x(t,e){if(t.parentNode&&(g||p(t))){var i=v(t),n=i?i.getAttribute("xmlns")||"http://www.w3.org/2000/svg":"http://www.w3.org/1999/xhtml",r=i?e?"rect":"g":"div",a=2!==e?0:100,s=3===e?100:0,o="position:absolute;display:block;pointer-events:none;margin:0;padding:0;",l=g.createElementNS?g.createElementNS(n.replace(/^https/,"http"),r):g.createElement(r);return e&&(i?(d=d||x(t),l.setAttribute("width",.01),l.setAttribute("height",.01),l.setAttribute("transform","translate("+a+","+s+")"),d.appendChild(l)):(f||((f=x(t)).style.cssText=o),l.style.cssText=o+"width:0.1px;height:0.1px;top:"+s+"px;left:"+a+"px",f.appendChild(l))),l}throw"Need document and parent."}function z(t){var e,i=t.getCTM();return i||(e=t.style[k],t.style[k]="none",t.appendChild(s),i=s.getCTM(),t.removeChild(s),e?t.style[k]=e:t.style.removeProperty(k.replace(/([A-Z])/g,"-$1").toLowerCase())),i||m.clone()}function A(t,e){var i,n,r,a,s,o,l=v(t),u=t===l,h=l?E:M,p=t.parentNode,c=p&&!l&&p.shadowRoot&&p.shadowRoot.appendChild?p.shadowRoot:p;if(t===y)return t;if(h.length||h.push(x(t,1),x(t,2),x(t,3)),i=l?d:f,l)u?(a=-(r=z(t)).e/r.a,s=-r.f/r.d,n=m):t.getBBox?(r=t.getBBox(),a=(n=(n=t.transform?t.transform.baseVal:{}).numberOfItems?1<n.numberOfItems?function _consolidate(t){for(var e=new F,i=0;i<t.numberOfItems;i++)e.multiply(t.getItem(i).matrix);return e}(n):n.getItem(0).matrix:m).a*r.x+n.c*r.y,s=n.b*r.x+n.d*r.y):(n=new F,a=s=0),e&&"g"===t.tagName.toLowerCase()&&(a=s=0),(u?l:p).appendChild(i),i.setAttribute("transform","matrix("+n.a+","+n.b+","+n.c+","+n.d+","+(n.e+a)+","+(n.f+s)+")");else{if(a=s=0,w)for(n=t.offsetParent,r=t;(r=r&&r.parentNode)&&r!==n&&r.parentNode;)4<(y.getComputedStyle(r)[k]+"").length&&(a=r.offsetLeft,s=r.offsetTop,r=0);if("absolute"!==(o=y.getComputedStyle(t)).position&&"fixed"!==o.position)for(n=t.offsetParent;p&&p!==n;)a+=p.scrollLeft||0,s+=p.scrollTop||0,p=p.parentNode;(r=i.style).top=t.offsetTop-s+"px",r.left=t.offsetLeft-a+"px",r[k]=o[k],r[C]=o[C],r.position="fixed"===o.position?"fixed":"absolute",c.appendChild(i)}return i}function B(t,e,i,n,r,a,s){return t.a=e,t.b=i,t.c=n,t.d=r,t.e=a,t.f=s,t}var g,y,a,b,f,d,m,s,w,i,k="transform",C=k+"Origin",E=[],M=[],F=((i=Matrix2D.prototype).inverse=function inverse(){var t=this.a,e=this.b,i=this.c,n=this.d,r=this.e,a=this.f,s=t*n-e*i||1e-10;return B(this,n/s,-e/s,-i/s,t/s,(i*a-n*r)/s,-(t*a-e*r)/s)},i.multiply=function multiply(t){var e=this.a,i=this.b,n=this.c,r=this.d,a=this.e,s=this.f,o=t.a,l=t.c,u=t.b,h=t.d,p=t.e,c=t.f;return B(this,o*e+u*n,o*i+u*r,l*e+h*n,l*i+h*r,a+p*e+c*n,s+p*i+c*r)},i.clone=function clone(){return new Matrix2D(this.a,this.b,this.c,this.d,this.e,this.f)},i.equals=function equals(t){var e=this.a,i=this.b,n=this.c,r=this.d,a=this.e,s=this.f;return e===t.a&&i===t.b&&n===t.c&&r===t.d&&a===t.e&&s===t.f},i.apply=function apply(t,e){void 0===e&&(e={});var i=t.x,n=t.y,r=this.a,a=this.b,s=this.c,o=this.d,l=this.e,u=this.f;return e.x=i*r+n*s+l||0,e.y=i*a+n*o+u||0,e},Matrix2D);function Matrix2D(t,e,i,n,r,a){void 0===t&&(t=1),void 0===e&&(e=0),void 0===i&&(i=0),void 0===n&&(n=1),void 0===r&&(r=0),void 0===a&&(a=0),B(this,t,e,i,n,r,a)}function getGlobalMatrix(e,i,n,r){if(!e||!e.parentNode||(g||p(e)).documentElement===e)return new F;var a=function _forceNonZeroScale(t){for(var e,i;t&&t!==b;)(i=t._gsap)&&i.uncache&&i.get(t,"x"),i&&!i.scaleX&&!i.scaleY&&i.renderTransform&&(i.scaleX=i.scaleY=1e-4,i.renderTransform(1,i),e?e.push(i):e=[i]),t=t.parentNode;return e}(e),s=v(e)?E:M,o=A(e,n),l=s[0].getBoundingClientRect(),h=s[1].getBoundingClientRect(),c=s[2].getBoundingClientRect(),f=o.parentNode,d=!r&&function _isFixed(t){return"fixed"===y.getComputedStyle(t).position||((t=t.parentNode)&&1===t.nodeType?_isFixed(t):void 0)}(e),m=new F((h.left-l.left)/100,(h.top-l.top)/100,(c.left-l.left)/100,(c.top-l.top)/100,l.left+(d?0:u()),l.top+(d?0:t()));if(f.removeChild(o),a)for(l=a.length;l--;)(h=a[l]).scaleX=h.scaleY=0,h.renderTransform(1,h);return i?m.inverse():m}function L(t,e){return t.actions.forEach(function(t){return t.vars[e]&&t.vars[e](t)})}function S(t){return"string"==typeof t?t.split(" ").join("").split(","):t}function V(t){return I(t)[0]||console.warn("Element not found:",t)}function W(t){return Math.round(1e4*t)/1e4||0}function X(t,e,i){return t.forEach(function(t){return t.classList[i](e)})}function $(t){return t.replace(/([A-Z])/g,"-$1").toLowerCase()}function _(t,e){var i,n={};for(i in t)e[i]||(n[i]=t[i]);return n}function ba(t){var e=st[t]=S(t);return et[t]=e.concat(nt),e}function ea(t,e,i){return t.forEach(function(t){return t.d=function _getDOMDepth(t,e,i){void 0===i&&(i=0);for(var n=t.parentNode,r=1e3*Math.pow(10,i)*(e?-1:1),a=e?900*-r:0;t;)a+=r,t=t.previousSibling;return n?a+_getDOMDepth(n,e,i+1):a}(i?t.element:t.t,e)}),t.sort(function(t,e){return t.d-e.d}),t}function fa(t,e){for(var i,n,r=t.element.style,a=t.css=t.css||[],s=e.length;s--;)n=r[i=e[s]]||r.getPropertyValue(i),a.push(n?i:Y[i]||(Y[i]=$(i)),n);return r}function ga(t){var e=t.css,i=t.element.style,n=0;for(t.cache.uncache=1;n<e.length;n+=2)e[n+1]?i[e[n]]=e[n+1]:i.removeProperty(e[n]);!e[e.indexOf("transform")+1]&&i.translate&&(i.removeProperty("translate"),i.removeProperty("scale"),i.removeProperty("rotate"))}function ha(t,e){t.forEach(function(t){return t.a.cache.uncache=1}),e||t.finalStates.forEach(ga)}function ja(e,i,n){var r,a,s,o=e.element,l=e.width,h=e.height,p=e.uncache,c=e.getProp,f=o.style,d=4;if("object"!=typeof i&&(i=e),tt&&1!==n)return tt._abs.push({t:o,b:e,a:e,sd:0}),tt._final.push(function(){return(e.cache.uncache=1)&&ga(e)}),o;for(a="none"===c("display"),e.isVisible&&!a||(a&&(fa(e,["display"]).display=i.display),e.matrix=i.matrix,e.width=l=e.width||i.width,e.height=h=e.height||i.height),fa(e,R),s=window.getComputedStyle(o);d--;)f[R[d]]=s[R[d]];if(f.gridArea="1 / 1 / 1 / 1",f.transition="none",f.position="absolute",f.width=l+"px",f.height=h+"px",f.top||(f.top="0px"),f.left||(f.left="0px"),p)r=new ht(o);else if((r=_(e,D)).position="absolute",e.simple){var m=o.getBoundingClientRect();r.matrix=new F(1,0,0,1,m.left+u(),m.top+t())}else r.matrix=getGlobalMatrix(o,!1,!1,!0);return r=ot(r,e,!0),e.x=P(r.x,.01),e.y=P(r.y,.01),o}function ka(t,e){return!0!==e&&(e=I(e),t=t.filter(function(t){if(-1!==e.indexOf((t.sd<0?t.b:t.a).element))return!0;t.t._gsap.renderTransform(1),t.b.isVisible&&(t.t.style.width=t.b.width+"px",t.t.style.height=t.b.height+"px")})),t}function la(t){return ea(t,!0).forEach(function(t){return(t.a.isVisible||t.b.isVisible)&&ja(t.sd<0?t.b:t.a,t.b,1)})}function pa(t,e){var i,n=t.style||t;for(i in e)n[i]=e[i]}function ra(t){return t.map(function(t){return t.element})}function sa(t,e,i){return t&&e.length&&i.add(t(ra(e),i,new ut(e,0,!0)),0)}function ua(t,e){return t instanceof ut?t:new ut(t,e)}function va(t,e,i){var n=t.idLookup[i],r=t.alt[i];return!r.isVisible||(e.getElementState(r.element)||r).isVisible&&n.isVisible?n:r}function za(t){if(t!==l){var e=o.style,i=o.clientWidth===window.outerWidth,n=o.clientHeight===window.outerHeight,r=4;if(t&&(i||n)){for(;r--;)j[r]=e[H[r]];i&&(e.width=o.clientWidth+"px",e.overflowY="hidden"),n&&(e.height=o.clientHeight+"px",e.overflowX="hidden"),l=t}else if(l){for(;r--;)j[r]?e[H[r]]=j[r]:e.removeProperty($(H[r]));l=t}}}function Aa(t,e,r,i){t instanceof ut&&e instanceof ut||console.warn("Not a valid state object.");var a,s,o,l,u,h,p,c,f,n,d,m,g,v,y,x=(r=r||{}).clearProps,b=r.onEnter,w=r.onLeave,S=r.absolute,k=r.absoluteOnLeave,C=r.custom,V=r.delay,E=r.paused,M=r.repeat,B=r.repeatDelay,F=r.yoyo,I=r.toggleClass,L=r.nested,P=r.zIndex,A=r.scale,T=r.fade,O=r.stagger,N=r.spin,D=r.prune,z=("props"in r?r:t).props,Y=_(r,rt),R=Q.timeline({delay:V,paused:E,repeat:M,repeatDelay:B,yoyo:F,data:"isFlip"}),W=Y,G=[],j=[],H=[],q=[],$=!0===N?1:N||0,Z="function"==typeof N?N:function(){return $},J=t.interrupted||e.interrupted,U=R[1!==i?"to":"from"];for(s in e.idLookup)d=e.alt[s]?va(e,t,s):e.idLookup[s],u=d.element,n=t.idLookup[s],!t.alt[s]||u!==n.element||!t.alt[s].isVisible&&d.isVisible||(n=t.alt[s]),n?(h={t:u,b:n,a:d,sd:n.element===u?0:d.isVisible?1:-1},H.push(h),h.sd&&(h.sd<0&&(h.b=d,h.a=n),J&&fa(h.b,z?et[z]:nt),T&&H.push(h.swap={t:n.element,b:h.b,a:h.a,sd:-h.sd,swap:h})),u._flip=n.element._flip=tt?tt.timeline:R):d.isVisible&&(H.push({t:u,b:_(d,{isVisible:1}),a:d,sd:0,entering:1}),u._flip=tt?tt.timeline:R);z&&(st[z]||ba(z)).forEach(function(e){return Y[e]=function(t){return H[t].a.props[e]}}),H.finalStates=f=[],m=function run(){for(ea(H),za(!0),l=0;l<H.length;l++)h=H[l],g=h.a,v=h.b,!D||g.isDifferent(v)||h.entering?(u=h.t,!L||h.sd<0||!l||(g.matrix=getGlobalMatrix(u,!1,!1,!0)),v.isVisible&&g.isVisible?(h.sd<0?(p=new ht(u,z,t.simple),ot(p,g,A,0,0,p),p.matrix=getGlobalMatrix(u,!1,!1,!0),p.css=h.b.css,h.a=g=p,T&&(u.style.opacity=J?v.opacity:g.opacity),O&&q.push(u)):0<h.sd&&T&&(u.style.opacity=J?g.opacity-v.opacity:"0"),ot(g,v,A,z)):v.isVisible!==g.isVisible&&(v.isVisible?g.isVisible||(v.css=g.css,j.push(v),H.splice(l--,1),S&&L&&ot(g,v,A,z)):(g.isVisible&&G.push(g),H.splice(l--,1))),A||(u.style.maxWidth=Math.max(g.width,v.width)+"px",u.style.maxHeight=Math.max(g.height,v.height)+"px",u.style.minWidth=Math.min(g.width,v.width)+"px",u.style.minHeight=Math.min(g.height,v.height)+"px"),L&&I&&u.classList.add(I)):H.splice(l--,1),f.push(g);var e;if(I&&(e=f.map(function(t){return t.element}),L&&e.forEach(function(t){return t.classList.remove(I)})),za(!1),A?(Y.scaleX=function(t){return H[t].a.scaleX},Y.scaleY=function(t){return H[t].a.scaleY}):(Y.width=function(t){return H[t].a.width+"px"},Y.height=function(t){return H[t].a.height+"px"},Y.autoRound=r.autoRound||!1),Y.x=function(t){return H[t].a.x+"px"},Y.y=function(t){return H[t].a.y+"px"},Y.rotation=function(t){return H[t].a.rotation+(N?360*Z(t,c[t],c):0)},Y.skewX=function(t){return H[t].a.skewX},c=H.map(function(t){return t.t}),!P&&0!==P||(Y.modifiers={zIndex:function zIndex(){return P}},Y.zIndex=P,Y.immediateRender=!1!==r.immediateRender),T&&(Y.opacity=function(t){return H[t].sd<0?0:0<H[t].sd?H[t].a.opacity:"+=0"}),q.length){O=Q.utils.distribute(O);var i=c.slice(q.length);Y.stagger=function(t,e){return O(~q.indexOf(e)?c.indexOf(H[t].swap.t):t,e,i)}}if(it.forEach(function(t){return r[t]&&R.eventCallback(t,r[t],r[t+"Params"])}),C&&c.length)for(s in W=_(Y,rt),"scale"in C&&(C.scaleX=C.scaleY=C.scale,delete C.scale),C)(a=_(C[s],at))[s]=Y[s],!("duration"in a)&&"duration"in Y&&(a.duration=Y.duration),a.stagger=Y.stagger,U.call(R,c,a,0),delete W[s];(c.length||j.length||G.length)&&(I&&R.add(function(){return X(e,I,R._zTime<0?"remove":"add")},0)&&!E&&X(e,I,"add"),c.length&&U.call(R,c,W,0)),sa(b,G,R),sa(w,j,R);var n=tt&&tt.timeline;n&&(n.add(R,0),tt._final.push(function(){return ha(H,!x)})),o=R.duration(),R.call(function(){var t=R.time()>=o;t&&!n&&ha(H,!x),I&&X(e,I,t?"remove":"add")})},k&&(S=H.filter(function(t){return!t.sd&&!t.a.isVisible&&t.b.isVisible}).map(function(t){return t.a.element})),tt?(S&&(y=tt._abs).push.apply(y,ka(H,S)),tt._run.push(m)):(S&&la(ka(H,S)),m());var K=tt?tt.timeline:R;return K.revert=function(){return lt(K,1,1)},K}function Da(t){for(var e,i=t.idLookup={},n=t.alt={},r=t.elementStates,a=r.length;a--;)i[(e=r[a]).id]?n[e.id]=e:i[e.id]=e}var I,Q,tt,r,o,P,T,l,n,c=1,h={},O=180/Math.PI,N=Math.PI/180,D={},Y={},et={},it=S("onStart,onUpdate,onComplete,onReverseComplete,onInterrupt"),nt=S("transform,transformOrigin,width,height,position,top,left,opacity,zIndex,maxWidth,maxHeight,minWidth,minHeight"),rt={zIndex:1,kill:1,simple:1,spin:1,clearProps:1,targets:1,toggleClass:1,onComplete:1,onUpdate:1,onInterrupt:1,onStart:1,delay:1,repeat:1,repeatDelay:1,yoyo:1,scale:1,fade:1,absolute:1,props:1,onEnter:1,onLeave:1,custom:1,paused:1,nested:1,prune:1,absoluteOnLeave:1},at={zIndex:1,simple:1,clearProps:1,scale:1,absolute:1,fitChild:1,getVars:1,props:1},st={},R="paddingTop,paddingRight,paddingBottom,paddingLeft,gridArea,transition".split(","),G=function _parseElementState(t,e,i,n){return t instanceof ht?t:t instanceof ut?function _findElStateInState(t,e){return e&&t.idLookup[G(e).id]||t.elementStates[0]}(t,n):new ht("string"==typeof t?V(t)||console.warn(t+" not found"):t,e,i)},ot=function _fit(t,e,i,n,r,a){var s,o,l,u,h,p,c,f=t.element,d=t.cache,m=t.parent,g=t.x,v=t.y,y=e.width,x=e.height,b=e.scaleX,w=e.scaleY,S=e.rotation,k=e.bounds,_=a&&T&&T(f,"transform,width,height"),C=t,V=e.matrix,E=V.e,M=V.f,B=t.bounds.width!==k.width||t.bounds.height!==k.height||t.scaleX!==b||t.scaleY!==w||t.rotation!==S,F=!B&&t.simple&&e.simple&&!r;return F||!m?(b=w=1,S=s=0):(p=(h=function _getInverseGlobalMatrix(t){var e=t._gsap||Q.core.getCache(t);return e.gmCache===Q.ticker.frame?e.gMatrix:(e.gmCache=Q.ticker.frame,e.gMatrix=getGlobalMatrix(t,!0,!1,!0))}(m)).clone().multiply(e.ctm?e.matrix.clone().multiply(e.ctm):e.matrix),S=W(Math.atan2(p.b,p.a)*O),s=W(Math.atan2(p.c,p.d)*O+S)%360,b=Math.sqrt(Math.pow(p.a,2)+Math.pow(p.b,2)),w=Math.sqrt(Math.pow(p.c,2)+Math.pow(p.d,2))*Math.cos(s*N),r&&(r=I(r)[0],u=Q.getProperty(r),c=r.getBBox&&"function"==typeof r.getBBox&&r.getBBox(),C={scaleX:u("scaleX"),scaleY:u("scaleY"),width:c?c.width:Math.ceil(parseFloat(u("width","px"))),height:c?c.height:parseFloat(u("height","px"))}),d.rotation=S+"deg",d.skewX=s+"deg"),i?(b*=y!==C.width&&C.width?y/C.width:1,w*=x!==C.height&&C.height?x/C.height:1,d.scaleX=b,d.scaleY=w):(y=P(y*b/C.scaleX,0),x=P(x*w/C.scaleY,0),f.style.width=y+"px",f.style.height=x+"px"),n&&pa(f,e.props),F||!m?(g+=E-t.matrix.e,v+=M-t.matrix.f):B||m!==e.parent?(d.renderTransform(1,d),p=getGlobalMatrix(r||f,!1,!1,!0),o=h.apply({x:p.e,y:p.f}),g+=(l=h.apply({x:E,y:M})).x-o.x,v+=l.y-o.y):(h.e=h.f=0,g+=(l=h.apply({x:E-t.matrix.e,y:M-t.matrix.f})).x,v+=l.y),g=P(g,.02),v=P(v,.02),!a||a instanceof ht?(d.x=g+"px",d.y=v+"px",d.renderTransform(1,d)):_&&_.revert(),a&&(a.x=g,a.y=v,a.rotation=S,a.skewX=s,i?(a.scaleX=b,a.scaleY=w):(a.width=y,a.height=x)),a||d},j=[],H="width,height,overflowX,overflowY".split(","),lt=function _killFlip(t,e,i){if(t&&t.progress()<1&&(!t.paused()||i))return e&&(function _interrupt(t){t.vars.onInterrupt&&t.vars.onInterrupt.apply(t,t.vars.onInterruptParams||[]),t.getChildren(!0,!1,!0).forEach(_interrupt)}(t),e<2&&t.progress(1),t.kill()),!0},ut=((n=FlipState.prototype).update=function update(t){var e=this;return this.elementStates=this.targets.map(function(t){return new ht(t,e.props,e.simple)}),Da(this),this.interrupt(t),this.recordInlineStyles(),this},n.clear=function clear(){return this.targets.length=this.elementStates.length=0,Da(this),this},n.fit=function fit(t,e,i){for(var n,r,a=ea(this.elementStates.slice(0),!1,!0),s=(t||this).idLookup,o=0;o<a.length;o++)n=a[o],i&&(n.matrix=getGlobalMatrix(n.element,!1,!1,!0)),(r=s[n.id])&&ot(n,r,e,!0,0,n),n.matrix=getGlobalMatrix(n.element,!1,!1,!0);return this},n.getProperty=function getProperty(t,e){var i=this.getElementState(t)||D;return(e in i?i:i.props||D)[e]},n.add=function add(t){for(var e,i,n,r=t.targets.length,a=this.idLookup,s=this.alt;r--;)(n=a[(i=t.elementStates[r]).id])&&(i.element===n.element||s[i.id]&&s[i.id].element===i.element)?(e=this.elementStates.indexOf(i.element===n.element?n:s[i.id]),this.targets.splice(e,1,t.targets[r]),this.elementStates.splice(e,1,i)):(this.targets.push(t.targets[r]),this.elementStates.push(i));return t.interrupted&&(this.interrupted=!0),t.simple||(this.simple=!1),Da(this),this},n.compare=function compare(t){function lh(t,e,i){return(t.isVisible!==e.isVisible?t.isVisible?f:d:t.isVisible?c:p).push(i)&&m.push(i)}function mh(t,e,i){return m.indexOf(i)<0&&lh(t,e,i)}var e,i,n,r,a,s,o,l,u=t.idLookup,h=this.idLookup,p=[],c=[],f=[],d=[],m=[],g=t.alt,v=this.alt;for(n in u)a=g[n],s=v[n],r=(e=a?va(t,this,n):u[n]).element,i=h[n],s?(l=i.isVisible||!s.isVisible&&r===i.element?i:s,(o=!a||e.isVisible||a.isVisible||l.element!==a.element?e:a).isVisible&&l.isVisible&&o.element!==l.element?((o.isDifferent(l)?c:p).push(o.element,l.element),m.push(o.element,l.element)):lh(o,l,o.element),a&&o.element===a.element&&(a=u[n]),mh(o.element!==i.element&&a?a:o,i,i.element),mh(a&&a.element===s.element?a:o,s,s.element),a&&mh(a,s.element===a.element?s:i,a.element)):(i?i.isDifferent(e)?lh(e,i,r):p.push(r):f.push(r),a&&mh(a,i,a.element));for(n in h)u[n]||(d.push(h[n].element),v[n]&&d.push(v[n].element));return{changed:c,unchanged:p,enter:f,leave:d}},n.recordInlineStyles=function recordInlineStyles(){for(var t=et[this.props]||nt,e=this.elementStates.length;e--;)fa(this.elementStates[e],t)},n.interrupt=function interrupt(n){var r=this,a=[];this.targets.forEach(function(t){var e=t._flip,i=lt(e,n?0:1);n&&i&&a.indexOf(e)<0&&e.add(function(){return r.updateVisibility()}),i&&a.push(e)}),!n&&a.length&&this.updateVisibility(),this.interrupted||(this.interrupted=!!a.length)},n.updateVisibility=function updateVisibility(){this.elementStates.forEach(function(t){var e=t.element.getBoundingClientRect();t.isVisible=!!(e.width||e.height||e.top||e.left),t.uncache=1})},n.getElementState=function getElementState(t){return this.elementStates[this.targets.indexOf(V(t))]},n.makeAbsolute=function makeAbsolute(){return ea(this.elementStates.slice(0),!0,!0).map(ja)},FlipState);function FlipState(t,e,i){if(this.props=e&&e.props,this.simple=!(!e||!e.simple),i)this.targets=ra(t),this.elementStates=t,Da(this);else{this.targets=I(t);var n=e&&(!1===e.kill||e.batch&&!e.kill);tt&&!n&&tt._kill.push(this),this.update(n||!!tt)}}var q,ht=((q=ElementState.prototype).isDifferent=function isDifferent(t){var e=this.bounds,i=t.bounds;return e.top!==i.top||e.left!==i.left||e.width!==i.width||e.height!==i.height||!this.matrix.equals(t.matrix)||this.opacity!==t.opacity||this.props&&t.props&&JSON.stringify(this.props)!==JSON.stringify(t.props)},q.update=function update(e,i){var n=this,r=n.element,a=Q.getProperty(r),s=Q.core.getCache(r),o=r.getBoundingClientRect(),l=r.getBBox&&"function"==typeof r.getBBox&&"svg"!==r.nodeName.toLowerCase()&&r.getBBox(),h=i?new F(1,0,0,1,o.left+u(),o.top+t()):getGlobalMatrix(r,!1,!1,!0);s.uncache=1,n.getProp=a,n.element=r,n.id=function _getID(t){var e=t.getAttribute("data-flip-id");return e||t.setAttribute("data-flip-id",e="auto-"+c++),e}(r),n.matrix=h,n.cache=s,n.bounds=o,n.isVisible=!!(o.width||o.height||o.left||o.top),n.display=a("display"),n.position=a("position"),n.parent=r.parentNode,n.x=a("x"),n.y=a("y"),n.scaleX=s.scaleX,n.scaleY=s.scaleY,n.rotation=a("rotation"),n.skewX=a("skewX"),n.opacity=a("opacity"),n.width=l?l.width:P(a("width","px"),.04),n.height=l?l.height:P(a("height","px"),.04),e&&function _recordProps(t,e){for(var i=Q.getProperty(t.element,null,"native"),n=t.props={},r=e.length;r--;)n[e[r]]=(i(e[r])+"").trim();n.zIndex&&(n.zIndex=parseFloat(n.zIndex)||0)}(n,st[e]||ba(e)),n.ctm=r.getCTM&&"svg"===r.nodeName.toLowerCase()&&z(r).inverse(),n.simple=i||1===W(h.a)&&!W(h.b)&&!W(h.c)&&1===W(h.d),n.uncache=0},ElementState);function ElementState(t,e,i){this.element=t,this.update(e,i)}var Z,J=((Z=FlipAction.prototype).getStateById=function getStateById(t){for(var e=this.states.length;e--;)if(this.states[e].idLookup[t])return this.states[e]},Z.kill=function kill(){this.batch.remove(this)},FlipAction);function FlipAction(t,e){this.vars=t,this.batch=e,this.states=[],this.timeline=e.timeline}var U,K=((U=FlipBatch.prototype).add=function add(e){var t=this.actions.filter(function(t){return t.vars===e});return t.length?t[0]:(t=new J("function"==typeof e?{animate:e}:e,this),this.actions.push(t),t)},U.remove=function remove(t){var e=this.actions.indexOf(t);return 0<=e&&this.actions.splice(e,1),this},U.getState=function getState(e){var i=this,t=tt,n=r;return(tt=this).state.clear(),this._kill.length=0,this.actions.forEach(function(t){t.vars.getState&&(t.states.length=0,(r=t).state=t.vars.getState(t)),e&&t.states.forEach(function(t){return i.state.add(t)})}),r=n,tt=t,this.killConflicts(),this},U.animate=function animate(){var t,e,i=this,n=tt,r=this.timeline,a=this.actions.length;for(tt=this,r.clear(),this._abs.length=this._final.length=this._run.length=0,this.actions.forEach(function(t){t.vars.animate&&t.vars.animate(t);var e,i,n=t.vars.onEnter,r=t.vars.onLeave,a=t.targets;a&&a.length&&(n||r)&&(e=new ut,t.states.forEach(function(t){return e.add(t)}),(i=e.compare(pt.getState(a))).enter.length&&n&&n(i.enter),i.leave.length&&r&&r(i.leave))}),la(this._abs),this._run.forEach(function(t){return t()}),e=r.duration(),t=this._final.slice(0),r.add(function(){e<=r.time()&&(t.forEach(function(t){return t()}),L(i,"onComplete"))}),tt=n;a--;)this.actions[a].vars.once&&this.actions[a].kill();return L(this,"onStart"),r.restart(),this},U.loadState=function loadState(n){n=n||function done(){return 0};var r=[];return this.actions.forEach(function(e){if(e.vars.loadState){var i,t=function f(t){t&&(e.targets=t),~(i=r.indexOf(f))&&(r.splice(i,1),r.length||n())};r.push(t),e.vars.loadState(t)}}),r.length||n(),this},U.setState=function setState(){return this.actions.forEach(function(t){return t.targets=t.vars.setState&&t.vars.setState(t)}),this},U.killConflicts=function killConflicts(e){return this.state.interrupt(e),this._kill.forEach(function(t){return t.interrupt(e)}),this},U.run=function run(t,e){var i=this;return this!==tt&&(t||this.getState(e),this.loadState(function(){i._killed||(i.setState(),i.animate())})),this},U.clear=function clear(t){this.state.clear(),t||(this.actions.length=0)},U.getStateById=function getStateById(t){for(var e,i=this.actions.length;i--;)if(e=this.actions[i].getStateById(t))return e;return this.state.idLookup[t]&&this.state},U.kill=function kill(){this._killed=1,this.clear(),delete h[this.id]},FlipBatch);function FlipBatch(t){this.id=t,this.actions=[],this._kill=[],this._final=[],this._abs=[],this._run=[],this.data={},this.state=new ut,this.timeline=Q.timeline()}var pt=(Flip.getState=function getState(t,e){var i=ua(t,e);return r&&r.states.push(i),e&&e.batch&&Flip.batch(e.batch).state.add(i),i},Flip.from=function from(t,e){return"clearProps"in(e=e||{})||(e.clearProps=!0),Aa(t,ua(e.targets||t.targets,{props:e.props||t.props,simple:e.simple,kill:!!e.kill}),e,-1)},Flip.to=function to(t,e){return Aa(t,ua(e.targets||t.targets,{props:e.props||t.props,simple:e.simple,kill:!!e.kill}),e,1)},Flip.fromTo=function fromTo(t,e,i){return Aa(t,e,i)},Flip.fit=function fit(t,e,i){var n=i?_(i,at):{},r=i||n,a=r.absolute,s=r.scale,o=r.getVars,l=r.props,u=r.runBackwards,h=r.onComplete,p=r.simple,c=i&&i.fitChild&&V(i.fitChild),f=G(e,l,p,t),d=G(t,0,p,f),m=l?et[l]:nt,g=Q.context();return l&&pa(n,f.props),fa(d,m),u&&("immediateRender"in n||(n.immediateRender=!0),n.onComplete=function(){ga(d),h&&h.apply(this,arguments)}),a&&ja(d,f),n=ot(d,f,s||c,!n.duration&&l,c,n.duration||o?n:0),"object"==typeof i&&"zIndex"in i&&(n.zIndex=i.zIndex),g&&!o&&g.add(function(){return function(){return ga(d)}}),o?n:n.duration?Q.to(d.element,n):null},Flip.makeAbsolute=function makeAbsolute(t,e){return(t instanceof ut?t:new ut(t,e)).makeAbsolute()},Flip.batch=function batch(t){return h[t=t||"default"]||(h[t]=new K(t))},Flip.killFlipsOf=function killFlipsOf(t,e){(t instanceof ut?t.targets:I(t)).forEach(function(t){return t&&lt(t._flip,!1!==e?1:2)})},Flip.isFlipping=function isFlipping(t){var e=Flip.getByTarget(t);return!!e&&e.isActive()},Flip.getByTarget=function getByTarget(t){return(V(t)||D)._flip},Flip.getElementState=function getElementState(t,e){return new ht(V(t),e)},Flip.convertCoordinates=function convertCoordinates(t,e,i){var n=getGlobalMatrix(e,!0,!0).multiply(getGlobalMatrix(t));return i?n.apply(i):n},Flip.register=function register(t){if(o="undefined"!=typeof document&&document.body){Q=t,p(o),I=Q.utils.toArray,T=Q.core.getStyleSaver;var i=Q.utils.snap(.1);P=function _closestTenth(t,e){return i(parseFloat(t)+e)}}},Flip);function Flip(){}pt.version="3.13.0","undefined"!=typeof window&&window.gsap&&window.gsap.registerPlugin(pt),e.Flip=pt,e.default=pt;if (typeof(window)==="undefined"||window!==e){Object.defineProperty(e,"__esModule",{value:!0})} else {delete e.default}});

;
document.addEventListener('DOMContentLoaded', () => {
    window.lenis = new Lenis({
      lerp: 0.16,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.82,
      gestureOrientation: 'vertical',
      normalizeWheel: false,
      smoothTouch: false,
    });
    if (typeof gsap !== 'undefined' && gsap.ticker) {
      gsap.ticker.add((time) => { window.lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
    if (window.ScrollTrigger) {
      window.lenis.on('scroll', window.ScrollTrigger.update);
    }
    document.querySelectorAll('[data-lenis-start]').forEach((el) => {
      el.addEventListener('click', () => window.lenis.start());
    });
    document.querySelectorAll('[data-lenis-stop]').forEach((el) => {
      el.addEventListener('click', () => window.lenis.stop());
    });
    document.querySelectorAll('[data-lenis-toggle]').forEach((el) => {
      el.addEventListener('click', function () {
        this.classList.toggle('stop-scroll');
        if (this.classList.contains('stop-scroll')) {
          window.lenis.stop();
        } else {
          window.lenis.start();
        }
      });
    });
  });
;
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
    const pageWrapper = document.querySelector('.page-wrapper');
    const isHome = window.__rmIsHome();
    if (pageWrapper) {
      pageWrapper.style.opacity = '1';
      pageWrapper.style.pointerEvents = 'auto';
    }
    if (!isHome) {
      document.querySelectorAll('[data-loader-scramble]').forEach((el) => {
        el.style.visibility = 'visible';
      });
    }
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
      const targetUrl = new URL(href, window.location.origin);
      if (targetUrl.origin === window.location.origin && targetUrl.pathname === window.location.pathname && targetUrl.hash) return;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (pageWrapper) pageWrapper.style.opacity = '0';
        setTimeout(() => {
          window.location.href = href;
        }, 250);
      });
    });
    if (!isHome) {
      if (pageWrapper) {
        pageWrapper.style.opacity = '1';
        pageWrapper.style.pointerEvents = 'auto';
      }
      return;
    }
    const hasSeenHomeLoader = sessionStorage.getItem('homeLoaderSeen') === '1';
    sessionStorage.setItem('homeLoaderSeen', '1');
    if (window.__rmSkipHeroIntro) {
      document.querySelectorAll('[data-loader-hide-content]').forEach((el) => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      });
      document.querySelectorAll('[data-loader-scramble]').forEach((el) => {
        el.style.visibility = 'visible';
      });
      if (document.readyState === 'complete') {
        if (pageWrapper) {
          pageWrapper.style.opacity = '1';
          pageWrapper.style.pointerEvents = 'auto';
        }
      } else {
        window.addEventListener(
          'load',
          () => {
            if (pageWrapper) {
              pageWrapper.style.opacity = '1';
              pageWrapper.style.pointerEvents = 'auto';
            }
          },
          { once: true },
        );
      }
      return;
    }
    const hideEl = document.querySelector('[data-navbar-brand-hide]');
    const showEl = document.querySelector('[data-navbar-brand-show]');
    const showInnerEl = document.querySelector('[data-navbar-brand-show-inner]');
    const loaderScrambleEls = document.querySelectorAll('[data-loader-scramble]');
    const loaderHideContentEls = document.querySelectorAll('[data-loader-hide-content]');
    if (!hideEl || !showEl) {
      loaderHideContentEls.forEach((el) => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      });
      loaderScrambleEls.forEach((el) => {
        el.style.visibility = 'visible';
      });
      return;
    }
    const originalBrandText = hideEl.textContent.trim();
    if (hasSeenHomeLoader) {
      loaderHideContentEls.forEach((el) => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      });
      loaderScrambleEls.forEach((el) => {
        el.style.visibility = 'visible';
      });
      gsap.set(showEl, { visibility: 'hidden' });
      prepareLogoMasks();
      revealPage(true);
      return;
    }
    loaderHideContentEls.forEach((el) => {
      el.style.opacity = '0';
    });
    gsap.set(showEl, { visibility: 'hidden' });
    if (window.lenis) window.lenis.stop();

    let revealStarted = false;
    function startReveal() {
      if (revealStarted) return; revealStarted = true;
      const boot = document.getElementById('rm-boot');
      if (boot) {
        boot.classList.add('rm-boot-done');
        setTimeout(() => { if (boot.parentNode) boot.parentNode.removeChild(boot); }, 650);
      }
      prepareLogoMasks();
      revealPage(false);
      scrambleLoaderElements();
      setTimeout(function () {
        if (window._logoSplit) return;
        try { gsap.killTweensOf(hideEl); } catch (e) {}
        hideEl.textContent = originalBrandText;
        prepareHideSplit();
        if (window.__rmBootLogoScroll) window.__rmBootLogoScroll();
      }, 4000);
    }
    window.__revealArmed = true;
    if (window.__bootReady) startReveal();
    else window.__onBootReady = startReveal;
    setTimeout(startReveal, 14000);

    function waitForPageLoad() {

      let done = false;
      const go = () => { if (done) return; done = true; waitForVideos(); };
      const heroImg = document.querySelector('img[src*="hero-img-scale"]');
      if (heroImg && !heroImg.complete) {
        heroImg.addEventListener('load', go, { once: true });
        heroImg.addEventListener('error', go, { once: true });
        setTimeout(go, 1200);
      } else {
        go();
      }
    }
    let videosDone = false;
    function onVideosReadyOnce() { if (videosDone) return; videosDone = true; onVideosReady(); }
    function waitForVideos() {
      setTimeout(onVideosReadyOnce, 2500);
      const videos = [...document.querySelectorAll('video')].filter((v) => { if (v.preload === 'none' || v.hasAttribute('data-loader-skip')) return false; const r = v.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0; });
      if (!videos.length) {
        onVideosReadyOnce();
        return;
      }
      let loaded = 0;
      const onLoad = () => {
        loaded++;
        if (loaded >= videos.length) onVideosReadyOnce();
      };
      videos.forEach((v) => {
        if (v.readyState >= 3) {
          onLoad();
        } else {
          v.addEventListener('canplaythrough', onLoad, { once: true });
          v.addEventListener('error', onLoad, { once: true });
        }
      });
    }
    function onVideosReady() {

      const pct = { v: 0 };
      gsap.to(pct, {
        v: 100,
        duration: 1,
        ease: 'steps(20)',
        onUpdate: () => { hideEl.textContent = 'COMPILING SHADERS... ' + Math.round(pct.v) + '%'; },
        onComplete: () => {
          hideEl.textContent = 'COMPILING SHADERS... 100%';
          gsap.to(hideEl, {
            duration: 0.5,
            delay: 0.2,
            scrambleText: {
              text: 'DONE',
              chars: 'upperCase',
              speed: 0.6,
            },
            onComplete: scrambleLoaderElements,
          });
        },
      });
    }
    function scrambleLoaderElements() {
      if (!loaderScrambleEls.length) {
        onAllScrambled();
        return;
      }
      const tasks = [];
      loaderScrambleEls.forEach((el) => {
        const hasDirectText = el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE;
        if (hasDirectText) {
          tasks.push({ els: [el] });
        } else {
          const children = [...el.querySelectorAll('*')].filter((child) => child.childNodes.length === 1 && child.childNodes[0].nodeType === Node.TEXT_NODE);
          tasks.push({ els: children.length ? children : [el] });
        }
      });
      tasks.forEach(({ els }) => {
        els.forEach((el) => {
          el.closest('[data-loader-scramble]').style.visibility = 'visible';
          el.style.visibility = 'visible';
          el._scrambleOriginal = el.textContent.trim();
          el.textContent = '';
        });
      });
      let completed = 0;
      tasks.forEach(({ els }, taskIndex) => {
        let taskDone = 0;
        els.forEach((el) => {
          gsap.to(el, {
            delay: taskIndex * 0.15,
            duration: 0.8,
            scrambleText: {
              text: el._scrambleOriginal,
              chars: 'upperCase',
              speed: 0.5,
              revealDelay: 0,
            },
            onComplete: () => {
              taskDone++;
              if (taskDone >= els.length) {
                completed++;
                if (completed >= tasks.length) onAllScrambled();
              }
            },
          });
        });
      });
    }
    function onAllScrambled() {
      gsap.to(window._logoSplit ? window._logoSplit.words : hideEl, {
        duration: 0.8,
        scrambleText: {
          text: originalBrandText,
          chars: 'upperCase',
          speed: 0.6,
        },
        onComplete: () => {
          prepareHideSplit();
          if (window.__rmBootLogoScroll) window.__rmBootLogoScroll();
        },
      });
    }
    function prepareHideSplit() {
      if (window._logoSplit) return;
      const inner = document.createElement('div');
      inner.className = 'word-inner';
      inner.textContent = originalBrandText;
      const mask = document.createElement('div');
      mask.className = 'logo-mask';
      mask.appendChild(inner);
      const line = document.createElement('div');
      line.appendChild(mask);
      hideEl.textContent = '';
      hideEl.appendChild(line);
      window._logoSplit = { words: [inner] };
    }
    function prepareShowMasks() {
      if (window._logoLettersToShow) return;
      const lettersToShow = showEl.querySelectorAll('.navbar-brand_letter');
      lettersToShow.forEach((child) => {
        const mask = document.createElement('div');
        mask.className = 'logo-mask';
        child.classList.add('word-inner');
        child.replaceWith(mask);
        mask.appendChild(child);
      });
      window._logoLettersToShow = lettersToShow;
    }
    function prepareLogoMasks() {
      prepareHideSplit();
      prepareShowMasks();
    }
    function honourIncomingHash() {
      const h = window.__rmPendingHash || window.location.hash;
      window.__rmPendingHash = '';
      if (!h || h.length < 2) return;
      let target = null;
      try { target = document.querySelector(h); } catch (e) { return; }
      if (!target) return;
      let cancelled = false;
      const cancel = () => { cancelled = true; };
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => {
        window.addEventListener(t, cancel, { once: true, passive: true });
      });
      const jump = () => {
        const y = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, y);
        if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true });
      };
      jump();
      const until = Date.now() + 700;
      const tick = () => {
        if (cancelled) return;
        jump();
        if (Date.now() < until) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    function revealPage(skipLoaderReveal) {
      if (window.lenis) window.lenis.start();
      honourIncomingHash();

      document.documentElement.classList.add('rm-loader-done');
      if (!skipLoaderReveal) {
        loaderHideContentEls.forEach((el) => {
          el.style.transition = 'none';
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
        });
        prepareShowMasks();
      }
      const lettersToShow = window._logoLettersToShow;
      let innerItems = [];
      if (showInnerEl) {
        innerItems = [...showInnerEl.children];
        gsap.set(innerItems, { opacity: 0, y: 8 });
      }
      const remNow = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
      const heroFS = () => Math.min(window.innerWidth / 138, remNow() * 0.95);
      const finalFS = () => (window.innerWidth < 768 ? '0.026rem' : (remNow() * 0.06) + 'px');
      function placeHero() {
        const rmHost = window.innerWidth < 768 ? document.querySelector('.home-hero_body') : null;
        if (!showEl._rmHome) { showEl._rmHome = showEl.parentElement; showEl._rmNext = showEl.nextSibling; }
        if (rmHost && showEl.parentElement !== rmHost) rmHost.appendChild(showEl);
        if (!rmHost && showEl.parentElement !== showEl._rmHome) showEl._rmHome.insertBefore(showEl, showEl._rmNext && showEl._rmNext.parentNode === showEl._rmHome ? showEl._rmNext : null);
        gsap.set(showEl, { fontSize: heroFS() + 'px', x: 0, y: 0, scale: 1, transformOrigin: '0 0', opacity: 1, visibility: 'visible' });
        const r = showEl.getBoundingClientRect();
        const rmBottom = rmHost ? rmHost.getBoundingClientRect().top + rmHost.offsetHeight : window.innerHeight;
        gsap.set(showEl, { x: window.innerWidth / 2 - (r.left + r.width / 2), y: rmBottom - r.bottom - remNow() * 4.4 });
      }
      placeHero();
      gsap.from(lettersToShow, {
        yPercent: 100,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
      });
      window.rmReplayHero = function () {
        try {
          placeHero();
          gsap.fromTo(lettersToShow, { yPercent: 100 }, { yPercent: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        } catch (e) {}
      };
      let scrollAnim = null;
      window.__rmBootLogoScroll = function () {
        if (scrollAnim || !window._logoSplit) return;
        scrollAnim = initScrollAnimation(window._logoSplit, innerItems, finalFS());
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      };
      window.__rmBootLogoScroll();
      let rzT;
      let rzW = window.innerWidth;
      window.addEventListener('resize', () => {
        if (window.innerWidth === rzW && window.matchMedia('(max-width: 767px)').matches) return;
        rzW = window.innerWidth;
        clearTimeout(rzT);
        rzT = setTimeout(() => {
          if (scrollAnim && scrollAnim.destroy) scrollAnim.destroy();
          scrollAnim = null;
          placeHero();
          if (window._logoSplit) scrollAnim = initScrollAnimation(window._logoSplit, innerItems, finalFS());
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        }, 180);
      });
    }
    function initScrollAnimation(split, innerItems, finalFontSize) {
      const proxy = document.createElement('div');
      Object.assign(proxy.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '1px',
        height: '48vh',
        pointerEvents: 'none',
      });
      document.body.appendChild(proxy);
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: proxy,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.25,
          invalidateOnRefresh: true,
          onToggle: (self) => { showEl.style.willChange = self.isActive ? 'transform' : ''; },
        },
      });
      scrollTl.to(split.words, {
        yPercent: -100,
        stagger: 0.02,
        ease: 'power2.in',
        duration: 0.4,
      });
      const rmSmall = window.innerWidth < 768;
      if (rmSmall) {
        scrollTl.to({}, { duration: 0.7 }, 0);
      } else {
        scrollTl.fromTo(showEl, { scale: 1 }, { scale: () => { const was = showEl.style.fontSize; const w0 = showEl.offsetWidth; showEl.style.fontSize = Math.max(1, Math.round(parseFloat(finalFontSize))) + 'px'; const w1 = showEl.offsetWidth; showEl.style.fontSize = was; return w0 ? w1 / w0 : 1; }, transformOrigin: '0 0', x: 0, y: 0, ease: 'power2.inOut', duration: 1, immediateRender: false }, 0);
      }

      if (innerItems.length > 0 && !rmSmall) {
        gsap.set(innerItems, { opacity: 0, y: 8 });
        scrollTl.to(innerItems, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5, stagger: 0.02 }, 0.42);
      }
      window._logoScrollTl = scrollTl;
      let innerST = null;
      return {
        destroy() {
          if (scrollTl.scrollTrigger) scrollTl.scrollTrigger.kill();
          scrollTl.kill();
          if (innerST) innerST.kill();
          proxy.remove();
        },
      };
    }
  });
;
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-toggle-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const value = trigger.getAttribute('data-toggle-trigger');
        document.querySelectorAll(`[data-toggle-target="${value}"]`).forEach((target) => {
          target.classList.toggle('is-clicked');
        });
      });
    });
  });
;
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      if (typeof SplitText !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger, SplitText);
        const textTargets = document.querySelectorAll('[data-h-animation]');
        textTargets.forEach((textTarget) => {
          const isHero = textTarget.hasAttribute('data-hero-element');
          const split = new SplitText(textTarget, { type: 'words', wordsClass: 'word-inner' });
          split.words.forEach((word) => {
            const mask = document.createElement('span');
            mask.className = 'word-mask';
            word.replaceWith(mask);
            mask.appendChild(word);
          });
          if (isHero) {
            gsap.set(textTarget, { visibility: 'visible' });
          }
          gsap.fromTo(
            split.words,
            { yPercent: 150 },
            {
              yPercent: 0,
              duration: 0.6,
              stagger: 0.04,
              ease: 'power2.out',

              onComplete: () => { try { split.revert(); } catch (e) {} },
              scrollTrigger: isHero
                ? null
                : {
                    trigger: textTarget,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                  },
            },
          );
        });
      } else {
        gsap.registerPlugin(ScrollTrigger);
      }
      const gridTargets = document.querySelectorAll('[data-grid-animation]');
      gridTargets.forEach((grid) => {
        const children = grid.children;
        if (children.length) {
          gsap.fromTo(
            children,
            {
              opacity: 0,
              yPercent: 150,
            },
            {
              opacity: 1,
              yPercent: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: grid,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            },
          );
        }
      });
    }
  });
;
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrambleTextPlugin);
    const targets = document.querySelectorAll('[data-scramble-hover]:not([data-loader-scramble]), [data-scramble-click]');
    targets.forEach((target) => {
      if (target.closest('.navbar_menu')) return;
      const originalText = target.textContent;
      let clickTimeout = null;
      if (target.hasAttribute('data-scramble-hover')) {
        const hoverText = target.getAttribute('data-scramble-hover') || originalText;
        target.addEventListener('mouseenter', () => {
          gsap.to(target, {
            duration: 1,
            scrambleText: {
              text: hoverText,
              chars: 'upperCase',
              revealDelay: 0.1,
              speed: 0.5,
            },
          });
        });
        target.addEventListener('mouseleave', () => {
          gsap.to(target, {
            duration: 0.6,
            scrambleText: {
              text: originalText,
              chars: 'upperCase',
              speed: 1,
            },
          });
        });
      }
      if (target.hasAttribute('data-scramble-click')) {
        const clickText = target.getAttribute('data-scramble-click');
        target.addEventListener('click', () => {
          if (clickTimeout) clearTimeout(clickTimeout);
          gsap.to(target, {
            duration: 0.8,
            scrambleText: {
              text: clickText,
              chars: 'upperCase',
              revealDelay: 0.05,
              speed: 0.6,
            },
          });
          clickTimeout = setTimeout(() => {
            gsap.to(target, {
              duration: 0.6,
              scrambleText: {
                text: originalText,
                chars: 'upperCase',
                speed: 1,
              },
            });
            clickTimeout = null;
          }, 3000);
        });
      }
    });
  });
;
class VideoObserver {
    static defaults = {
      threshold: 0.3,
      rootMargin: '0px',
      muted: true,
      playsInline: true,
      selector: 'video',
    };
    constructor(options = {}) {
      this._instanceCfg = { ...VideoObserver.defaults, ...options };
      this._intersectionObservers = new Map();
      this._mutationObserver = null;
    }
    init() {
      if (this._mutationObserver) return this;
      this._observeAll();
      this._mutationObserver = new MutationObserver(this._onMutation.bind(this));
      this._mutationObserver.observe(document.body, { childList: true, subtree: true });
      return this;
    }
    destroy() {
      this._intersectionObservers.forEach((obs) => obs.disconnect());
      this._intersectionObservers.clear();
      this._mutationObserver?.disconnect();
      this._mutationObserver = null;
    }
    observe(videoEl) {
      if (!(videoEl instanceof HTMLVideoElement)) return;
      const cfg = this._resolveConfig(videoEl);
      this._prepare(videoEl, cfg);
      this._getObserver(cfg).observe(videoEl);
    }
    unobserve(videoEl) {
      this._intersectionObservers.forEach((obs) => obs.unobserve(videoEl));
      if (!videoEl.paused) videoEl.pause();
    }
    _resolveConfig(videoEl) {
      const d = videoEl.dataset;
      return {
        threshold: d.threshold !== undefined ? parseFloat(d.threshold) : this._instanceCfg.threshold,
        rootMargin: d.rootMargin !== undefined ? d.rootMargin : this._instanceCfg.rootMargin,
        muted: d.muted !== undefined ? d.muted !== 'false' : this._instanceCfg.muted,
        playsInline: d.playsInline !== undefined ? d.playsInline !== 'false' : this._instanceCfg.playsInline,
        selector: this._instanceCfg.selector,
      };
    }
    _getObserver(cfg) {
      const key = `${cfg.threshold}|${cfg.rootMargin}`;
      if (!this._intersectionObservers.has(key)) {
        const obs = new IntersectionObserver(this._onIntersection.bind(this), {
          threshold: cfg.threshold,
          rootMargin: cfg.rootMargin,
        });
        this._intersectionObservers.set(key, obs);
      }
      return this._intersectionObservers.get(key);
    }
    _prepare(videoEl, cfg) {
      if (cfg.muted) videoEl.muted = true;
      if (cfg.playsInline) videoEl.playsInline = true;
    }
    _observeAll() {
      document.querySelectorAll(this._instanceCfg.selector).forEach((v) => this.observe(v));
    }
    _onIntersection(entries) {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.paused) {
            video.play().catch(() => {
              video.muted = true;
              video.play().catch(() => {});
            });
          }
        } else {
          if (!video.paused) video.pause();
        }
      });
    }
    _onMutation(mutations) {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches?.(this._instanceCfg.selector)) this.observe(node);
          node.querySelectorAll?.(this._instanceCfg.selector).forEach((v) => this.observe(v));
        });
      });
    }
  }
  class ProximityObserver {
    static defaults = {
      margin: '0px',
      threshold: 0,
      once: true,
    };
    constructor(options = {}) {
      this.params = { ...ProximityObserver.defaults, ...options };
      this.state = { observersByConfig: new Map() };
    }
    observe(el, config = {}) {
      const margin = config.margin ?? this.params.margin;
      const threshold = config.threshold ?? this.params.threshold;
      const once = config.once ?? this.params.once;
      el.__proximityConfig = { onEnter: config.onEnter, onLeave: config.onLeave, once };
      this._getOrCreateObserver(margin, threshold).observe(el);
    }
    unobserve(el) {
      this.state.observersByConfig.forEach((observer) => observer.unobserve(el));
      delete el.__proximityConfig;
    }
    destroy() {
      this.state.observersByConfig.forEach((observer) => observer.disconnect());
      this.state.observersByConfig.clear();
    }
    _getOrCreateObserver(margin, threshold) {
      const normalizedMargin = this._normalizeMargin(margin);
      const key = `${normalizedMargin}|${threshold}`;
      if (!this.state.observersByConfig.has(key)) {
        const observer = new IntersectionObserver(this._handleIntersection.bind(this), {
          rootMargin: normalizedMargin,
          threshold,
        });
        this.state.observersByConfig.set(key, observer);
      }
      return this.state.observersByConfig.get(key);
    }
    _normalizeMargin(margin) {
      if (typeof margin === 'number') return `0px 0px ${margin}px 0px`;
      if (margin.includes('vh')) {
        const pixels = (parseFloat(margin) / 100) * window.innerHeight;
        return `0px 0px ${pixels}px 0px`;
      }
      return `0px 0px ${margin} 0px`;
    }
    _handleIntersection(entries, observer) {
      entries.forEach((entry) => {
        const el = entry.target;
        const config = el.__proximityConfig;
        if (!config) return;
        if (entry.isIntersecting) {
          config.onEnter?.(entry);
          if (config.once) observer.unobserve(el);
        } else {
          config.onLeave?.(entry);
        }
      });
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    const po = new ProximityObserver();
    document.querySelectorAll('video[preload="none"][data-wf-proximity]').forEach((video) => {
      po.observe(video, {
        margin: '100vh',
        once: true,
        onEnter: () => {
          video.preload = 'auto';
          video.load();
        },
      });
    });
    const vo = new VideoObserver({ selector: 'video[data-wf-observe]' }).init();
  });
;
(function(){
  var o=document.querySelector('[data-rm-pagefade]'); if(!o) return;
  var navKick=function(){
    var n=document.querySelector('.rm-navbg');
    if(!n) return;
    n.style.webkitBackdropFilter='none'; n.style.backdropFilter='none';
    requestAnimationFrame(function(){
      n.style.webkitBackdropFilter=''; n.style.backdropFilter='';
    });
  };
  var hide=function(){
    o.classList.remove('is-active');
    [0,180,700,1600].forEach(function(ms){ setTimeout(navKick,ms); });
  };
  window.addEventListener('pageshow',function(e){
    navKick();
    setTimeout(navKick,220);
    if(!e.persisted) return;
    o.classList.remove('is-active','is-exit','is-plain','is-away');
  });
  var labEl=o.querySelector('.rm-pf_label'), labHTML=labEl?labEl.innerHTML:'';
  var bar0=o.querySelector('[data-rm-pf-bar]'), pct0=o.querySelector('[data-rm-pf-pct]');
  var blocks=bar0?[].slice.call(bar0.children):[], litN=-1;
  var paint=function(p){
    var n=Math.floor(p/100*blocks.length+1e-6);
    if(n===litN) return;
    litN=n;
    for(var i=0;i<blocks.length;i++) blocks[i].classList.toggle('is-on',i<n);
  };
  window.__rmPageFadeReset=function(){
    o.classList.remove('is-final');
    if(labEl) labEl.innerHTML=labHTML;
    paint(0);
    if(pct0) pct0.textContent='0%';
  };
  if(document.getElementById('rm-boot')){ hide(); return; }
  var pctEl=pct0;
  var quietNav=document.documentElement.classList.contains('rm-quietload');
  var heroSrc=(function(){
    var v=document.querySelector('.rm-store_hero_vid');
    if(v&&v.getAttribute('poster')) return v.getAttribute('poster');
    var i=document.querySelector('[data-pf-hero]');
    return i?(i.currentSrc||i.src):'';
  })();
  if(quietNav||!blocks.length||!pctEl){
    var lift=function(){ requestAnimationFrame(function(){ requestAnimationFrame(hide); }); };
    var gotLoad=false, gotHero=!heroSrc, done=false;
    var settle=function(){ if(done||!gotLoad||!gotHero) return; done=true; lift(); };
    if(heroSrc){
      var im=new Image();
      var mark=function(){ gotHero=true; settle(); };
      im.onload=function(){ if(im.decode) im.decode().then(mark,mark); else mark(); };
      im.onerror=mark;
      im.src=heroSrc;
      if(im.complete) mark();
      setTimeout(mark,2400);
    }
    var seal=function(){ gotLoad=true; settle(); };
    if(document.readyState==='complete') seal();
    else window.addEventListener('load',seal,{once:true});
    setTimeout(function(){ gotLoad=true; gotHero=true; settle(); },heroSrc?2600:1400);
    setTimeout(hide,heroSrc?3200:1600);
    return;
  }
  var lastRes=0, shown=0, heroOK=!heroSrc;
  if(heroSrc){
    var hImg=new Image(), hDone=function(){ heroOK=true; };
    hImg.onload=function(){ if(hImg.decode) hImg.decode().then(hDone,hDone); else hDone(); };
    hImg.onerror=hDone;
    hImg.src=heroSrc;
    if(hImg.complete) hDone();
    setTimeout(hDone,2400);
  }
  try{
    performance.getEntriesByType('resource').forEach(function(en){
      var t=en.initiatorType; if(t==='video'||t==='audio'||t==='beacon') return;
      if(en.responseEnd>lastRes) lastRes=en.responseEnd;
    });
  }catch(e){}
  try{
    new PerformanceObserver(function(l){
      var es=l.getEntries();
      for(var i=0;i<es.length;i++){ var t=es[i].initiatorType; if(t==='video'||t==='audio'||t==='beacon') continue; lastRes=performance.now(); }
    }).observe({type:'resource',buffered:true});
  }catch(e){}
  var quiet=function(){ return lastRes===0||(performance.now()-lastRes)>350; };
  var t0=null, EST=420, doneAt=null, CAP=4000, MIN=380;
  function tick(ts){
    if(t0===null) t0=ts;
    var e=ts-t0, p;
    var ready=(document.readyState==='complete')&&quiet()&&heroOK;
    if(ready||e>CAP){ if(doneAt===null) doneAt=e; p=Math.min(100,92+(e-doneAt)/3); }
    else { p=92*(1-Math.exp(-e/EST)); }
    p=Math.max(shown,p); shown=p;
    paint(p); pctEl.textContent=Math.round(p)+'%';
    if(p>=100&&e>=MIN){
      o.classList.add('is-final');
      var lab=o.querySelector('.rm-pf_label');
      if(lab) lab.textContent='INITIALIZED';
      setTimeout(hide,440);
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  setTimeout(hide,6000);
})();
;
document.addEventListener('DOMContentLoaded',function(){
  var RM_BASE=document.documentElement.getAttribute('data-base')||'';
  var rmPath=window.__rmPath||function(){
    var p=location.pathname||'/';
    if(RM_BASE&&p.indexOf(RM_BASE)===0) p=p.slice(RM_BASE.length)||'/';
    p=p||'/';
    if(location.hostname.indexOf('store.')===0&&!/^\/store(\/|$)/.test(p)) p='/store'+p;
    return p;
  };
  window.__rmPath=rmPath;
  var rmIsDesktop = !!(window.matchMedia && window.matchMedia('(min-width:768px)').matches);
  window.__rmDeskVid = function(u){ return (rmIsDesktop && u) ? u.replace(/\.mp4($|\?|#)/, '-desktop.mp4$1') : (u||''); };
  (function(){ if(!rmIsDesktop) return;
    document.querySelectorAll('.home_hero2_mod_video-item video source').forEach(function(s){
      var u=s.getAttribute('src'); if(u) s.setAttribute('src', window.__rmDeskVid(u));
    });
  })();
  (function(){ var m=document.querySelector('[data-who-video-main]'); if(m&&!m.querySelector('.rm-ad-vignette')){ var d=document.createElement('div'); d.className='rm-ad-vignette'; m.appendChild(d); } })();
  document.querySelectorAll('a[href*="#"],[data-rm-jump]').forEach(function(a){
    if(a.hasAttribute('data-rm-jump')){
      a.addEventListener('keydown',function(e){
        if(e.key!=='Enter'&&e.key!==' '&&e.key!=='Spacebar') return;
        e.preventDefault(); this.click();
      });
    }
    a.addEventListener('click',function(e){
      var raw=this.getAttribute('data-rm-jump')||this.getAttribute('href');
      var url; try{ url=new URL(raw,location.href); }catch(err){ return; }
      var norm=function(p){return p.replace(/index\.html$/,'').replace(/[/]+$/,'')||'/';};
      if(url.origin===location.origin&&norm(url.pathname)===norm(location.pathname)&&url.hash){
        var t; try{ t=document.querySelector(url.hash); }catch(err){ t=null; }
        if(t){
          e.preventDefault();e.stopImmediatePropagation();
          window.__rmProgScroll=true;
          var sm=0; try{ sm=parseFloat(getComputedStyle(t).scrollMarginTop)||0; }catch(err2){}
          if(window.lenis){window.lenis.scrollTo(t,{immediate:true,offset:-sm});}else{t.scrollIntoView();}
          var rv=function(){ try{ if(window.__rmStoreReveal) window.__rmStoreReveal(); }catch(_e){} };
          rv(); requestAnimationFrame(rv); setTimeout(rv,160); setTimeout(rv,420);
          if(window.scrollY>window.innerHeight*0.5){
            var settleLogo=function(n){
              var tl=window._logoScrollTl;
              if(tl&&tl.progress){
                try{ tl.progress(1); }catch(_e){}
                try{ if(tl.scrollTrigger&&tl.scrollTrigger.update) tl.scrollTrigger.update(); }catch(_e){}
                return;
              }
              if(n<20) setTimeout(function(){ settleLogo(n+1); },60);
            };
            settleLogo(0);
          }
          setTimeout(function(){window.__rmProgScroll=false;},300);
        }
      }
    },true);
  });
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('.rm-lang_opt'):null;
    if(!a) return;
    try{ localStorage.setItem('rm-lang',a.getAttribute('hreflang')||''); }catch(_){}
    var mid=window.innerHeight/2,best='',bd=Infinity;
    [].slice.call(document.querySelectorAll('#art-direction,#community,#links,#mods,#patreon')).forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.bottom<=0||r.top>=window.innerHeight) return;
      var d=Math.abs(r.top+r.height/2-mid);
      if(d<bd){ bd=d; best=el.id; }
    });
    var base=(a.getAttribute('href')||'').split('#')[0];
    a.setAttribute('href',base+(best?'#'+best:''));
  },true);
  (function(){ var p=rmPath(); if((p==='/'||p==='/index.html')&&location.hash){ window.__rmPendingHash=location.hash; try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} if(window.scrollTo) window.scrollTo(0,0); } })();
  window.__rmWhenSettled=function(fn){
    if(!window.__rmSnapping){ fn(); return; }
    var done=false, t=setInterval(function(){ if(!window.__rmSnapping){ clearInterval(t); if(!done){ done=true; fn(); } } },40);
    setTimeout(function(){ clearInterval(t); if(!done){ done=true; fn(); } },1500);
  };
  window.__rmVidOnScreen=function(v){
    var r=v.getBoundingClientRect();
    if(!(r.bottom>2&&r.top<window.innerHeight-2)) return false;
    var sec=v.closest('.section-who');
    if(sec){ var sr=sec.getBoundingClientRect(); if(!(sr.bottom>2&&sr.top<window.innerHeight-2)) return false; }
    return true;
  };
  var vio=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var v=en.target;
      if(en.isIntersecting&&window.__rmVidOnScreen(v)){
        if(v.dataset.rmState==='playing'&&!v.paused) return;
        if(v.dataset.rmWasPlaying==='1'||v.autoplay||v.dataset.rmAuto==='1'){
          v.dataset.rmState='pending';
          window.__rmWhenSettled(function(){
            if(v.dataset.rmState!=='pending') return;
            if(!window.__rmVidOnScreen(v)){ v.dataset.rmState='paused'; if(!v.paused) v.pause(); return; }
            var pr=v.play();
            if(pr&&pr.then){ pr.then(function(){ v.dataset.rmState='playing'; }).catch(function(){ v.dataset.rmState=''; }); }
            else { v.dataset.rmState='playing'; }
          });
        }
      } else {
        if(v.dataset.rmState==='paused') return;
        v.dataset.rmState='paused';
        window.__rmWhenSettled(function(){
          if(v.dataset.rmState!=='paused') return;
          if(!v.paused){ v.dataset.rmWasPlaying='1'; }
          v.pause();
        });
      }
    });
  },{rootMargin:'-2px 0px',threshold:0});
  [].slice.call(document.querySelectorAll('video:not([data-mod-hero-vid])')).filter(function(v){ return !v.closest('[data-who-video-main]'); }).forEach(function(v){ vio.observe(v); });
  (function(){
    var lazy=[].slice.call(document.querySelectorAll('video[data-rm-lazy]'));
    if(!lazy.length) return;
    function attach(v){
      if(v.dataset.rmLazyDone) return; v.dataset.rmLazyDone='1';
      [].slice.call(v.querySelectorAll('source[data-src]')).forEach(function(s){ s.setAttribute('src',s.getAttribute('data-src')); });
      v.dataset.rmAuto='1'; v.preload='auto';
      try{ v.load(); }catch(e){}
    }
    if(!('IntersectionObserver' in window)){ lazy.forEach(attach); return; }
    var lio=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ attach(en.target); lio.unobserve(en.target); } });
    },{rootMargin:'35% 0px',threshold:0});
    lazy.forEach(function(v){ lio.observe(v); });
  })();
  function rmSet(el,props){ if(!el) return; for(var k in props){ el.style[k]=props[k]; } }
  function rmAlignNav(){
    var body=document.querySelector('.navbar_body'); if(!body) return;
    var menu=document.querySelector('.navbar_menu'); if(!menu) return;
    var wrap=menu.querySelector('.navbar_menu_link-wrapper');
    var about=menu.querySelector('a[href$="/about"],a[href$="about.html"]');
    var contact=menu.querySelector('a[href^="mailto:"]');
    if(window.__rmHealHero) window.__rmHealHero();
    if(window.innerWidth<768){
      body.style.position='';
      [menu,wrap,about,contact].forEach(function(el){ if(!el) return;
        ['position','left','right','top','bottom','transform','display','gap','margin','pointerEvents','justifyContent','alignItems'].forEach(function(k){ el.style[k]=''; });
      });
      return;
    }
    body.style.position='relative';
    var GAP='2rem';
    rmSet(menu,{position:'absolute',left:'0',right:'0',top:'0',bottom:'0',display:'flex',alignItems:'center',justifyContent:'center',gap:GAP,margin:'0',pointerEvents:'none'});
    rmSet(wrap,{position:'static',display:'flex',alignItems:'center',gap:GAP,margin:'0',pointerEvents:'auto',left:'',top:'',right:'',transform:''});
    rmSet(about,{position:'relative',margin:'0',pointerEvents:'auto',left:'',top:'',right:'',transform:''});
    rmSet(contact,{position:'absolute',right:'0',top:'50%',transform:'translateY(-50%)',pointerEvents:'auto'});
  }
  rmAlignNav();
  (function(){
    var wasSmall=window.innerWidth<768, t=null;
    function healHero(){
      var el=document.querySelector('.navbar-brand_letter-wrapper');
      if(!el||!window.rmReplayHero) return;
      var r=el.getBoundingClientRect();
      if(r.width>window.innerWidth+8||r.right<-8||r.left>window.innerWidth+8){
        try{ window.rmReplayHero(); }catch(e){}
      }
    }
    function settle(){
      if(window.innerWidth<768!==wasSmall){
        wasSmall=window.innerWidth<768;
        try{ if(window.rmReplayHero) window.rmReplayHero(); }catch(e){}
      }
      healHero();
      try{ if(window.ScrollTrigger) window.ScrollTrigger.refresh(); }catch(e){}
    }
    window.__rmHealHero=healHero;
    window.addEventListener('resize',function(){ clearTimeout(t); t=setTimeout(settle,260); });
    if(window.ResizeObserver){
      try{ new ResizeObserver(function(){ clearTimeout(t); t=setTimeout(settle,260); }).observe(document.documentElement); }catch(e){}
    }
    [600,1600,3200].forEach(function(ms){ setTimeout(healHero,ms); });
  })();
  window.addEventListener('resize',rmAlignNav);
  window.addEventListener('load',rmAlignNav);
  [300,800,1500,3000,5000].forEach(function(ms){setTimeout(rmAlignNav,ms);});
  (function(){
    var el=document.querySelector('.home-hero2_body p');
    if(!el) return;
    var full=el.textContent;
    el.style.minHeight=el.offsetHeight+'px';
    el.textContent='';
    var txt=document.createElement('span'), cur=document.createElement('span');
    cur.className='rm-cursor'; cur.textContent='▋';
    el.appendChild(txt); el.appendChild(cur);
    var timer=null;
    function type(){
      if(timer) clearTimeout(timer);
      var i=0;
      (function tick(){
        txt.textContent=full.slice(0,i);
        if(i<full.length){ i++; timer=setTimeout(tick, 30+Math.random()*40); } else { timer=null; }
      })();
    }
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) type(); });
    },{threshold:0.6});
    io.observe(el);
  })();
  (function(){
    var isHome=rmPath()==='/'||rmPath()==='/index.html';
    if(!isHome||!document.querySelector('.navbar_brand')) return;
    document.addEventListener('click',function(e){
      var b=e.target.closest?e.target.closest('.navbar_brand'):null;
      if(!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var ov=document.querySelector('[data-rm-pagefade]');
      if(ov) ov.classList.add('is-plain','is-active');
      setTimeout(function(){
        if(window.lenis) window.lenis.scrollTo(0,{immediate:true}); else window.scrollTo(0,0);
        if(window.ScrollTrigger) try{ window.ScrollTrigger.update(); }catch(_){}
        try{ window.rmReplayHero && window.rmReplayHero(); }catch(_){}
        setTimeout(function(){ if(ov){ ov.classList.remove('is-active'); setTimeout(function(){ ov.classList.remove('is-plain'); },420); } }, 120);
      }, 430);
    },true);
  })();
  (function(){
    var flash=document.querySelector('[data-rm-flash]');
    var hero2=document.querySelector('.home-hero2_body');
    var endEl=hero2||document.querySelector('.home-hero_body');
    if(!flash||!endEl) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var CLS=['is-flash-1','is-flash-2','is-flash-3'];
    function allFlash(){ return document.querySelectorAll('.rm-flash'); }
    function clearCls(){ allFlash().forEach(function(f){ f.classList.remove(CLS[0],CLS[1],CLS[2]); }); }
    flash.addEventListener('animationend',clearCls);
    var timer=null, active=false, crossed=false;
    function strike(){ clearCls(); void flash.offsetWidth; var c=CLS[Math.floor(Math.random()*3)]; allFlash().forEach(function(f){ f.classList.add(c); }); }
    function schedule(delay){ if(timer)clearTimeout(timer); timer=setTimeout(function(){ if(active){ strike(); schedule(); } }, delay||(4500+Math.random()*4000)); }
    function inZone(){ return endEl.getBoundingClientRect().bottom > window.innerHeight*0.35; }
    function tick(){
      var now=inZone();
      if(now&&!active){ active=true; if(!timer) schedule(1600+Math.random()*1800); }
      else if(!now&&active){ active=false; if(timer){ clearTimeout(timer); timer=null; } }
      if(hero2){
        var top=hero2.getBoundingClientRect().top, vh=window.innerHeight;
        if(!crossed && top<vh*0.62){ crossed=true; if(!window.__rmProgScroll) strike(); }
        else if(crossed && top>vh*0.92){ crossed=false; }
      }
    }
    tick();
    window.addEventListener('scroll',tick,{passive:true});
    if(window.lenis&&window.lenis.on) window.lenis.on('scroll',tick);
    window.addEventListener('resize',tick);
  })();
  (function(){
    var root=document.querySelector('[data-rm-featured]'); if(!root) return;
    var ticks=[].slice.call(root.querySelectorAll('[data-rm-feat-tick]')); if(!ticks.length) return;
    var nameEl=root.querySelector('[data-rm-feat-name]'),gameEl=root.querySelector('[data-rm-feat-game]'),
        ctaEl=root.querySelector('[data-rm-feat-cta]'),learnEl=root.querySelector('[data-rm-feat-learn]'),
        vbufs=[].slice.call(root.querySelectorAll('[data-rm-feat-vbuf]')),
        poster=root.querySelector('[data-rm-feat-poster]'),pp=root.querySelector('[data-rm-feat-playpause]');
    function activeVideo(){ for(var i=0;i<vbufs.length;i++){ if(vbufs[i].classList.contains('is-on')) return vbufs[i]; } return null; }
    function vurl(u){ return window.__rmDeskVid?window.__rmDeskVid(u):u; }
    function setVideo(u){
      if(vbufs.length<2||!u) return;
      var real=vurl(u), outgoing=activeVideo();
      if(!outgoing){
        var v0=vbufs[0],s0=v0.querySelector('source');
        if((v0.currentSrc||s0.getAttribute('src'))!==real){ s0.setAttribute('src',real); }
        try{v0.load();}catch(e){} v0.preload='auto'; if(!paused) v0.play().catch(function(){});
        var d0=false,on0=function(){ if(d0)return; d0=true; v0.classList.add('is-on'); if(poster) poster.style.opacity='0'; };
        if(v0.readyState>=3) on0(); else { v0.addEventListener('canplay',on0,{once:true}); setTimeout(on0,1600); }
        return;
      }
      if((outgoing.currentSrc||outgoing.querySelector('source').getAttribute('src'))===real) return;
      var incoming=(vbufs[0]===outgoing)?vbufs[1]:vbufs[0], isrc=incoming.querySelector('source');
      if((incoming.currentSrc||isrc.getAttribute('src'))!==real){ isrc.setAttribute('src',real); try{incoming.load();}catch(e){} incoming.preload='auto'; }
      if(!paused) incoming.play().catch(function(){});
      var done=false, swap=function(){ if(done)return; done=true;
        incoming.classList.add('is-on'); outgoing.classList.remove('is-on');
        setTimeout(function(){ if(!outgoing.classList.contains('is-on')){ try{outgoing.pause();}catch(e){} } },600);
      };
      if(incoming.readyState>=3) swap(); else { incoming.addEventListener('canplay',swap,{once:true}); setTimeout(swap,1600); }
    }
    if(window.ScrambleTextPlugin&&typeof gsap!=='undefined'&&gsap.registerPlugin) gsap.registerPlugin(ScrambleTextPlugin);
    var bgImgs=[].slice.call(document.querySelectorAll('[data-rm-feat-bg-img]'));
    ticks.forEach(function(t){ var a=t.getAttribute('data-art'); if(a){ var im=new Image(); im.src=a; } });
    function zoomIn(el){
      try{ if(el._zoom) el._zoom.cancel(); }catch(e){}
      try{ el._zoom=el.animate([{transform:'scale(1.03)'},{transform:'scale(1.17)'}],{duration:11000,easing:'linear',fill:'forwards'}); }catch(e){}
    }
    function setBg(url){
      if(bgImgs.length<2||!url) return;
      var outgoing=null,i; for(i=0;i<bgImgs.length;i++){ if(bgImgs[i].classList.contains('is-on')){ outgoing=bgImgs[i]; break; } }
      if(!outgoing) outgoing=bgImgs[0];
      var incoming=(outgoing===bgImgs[0])?bgImgs[1]:bgImgs[0];
      if((outgoing.currentSrc||outgoing.getAttribute('src'))===url) return;
      var done=false;
      var fin=function(){ if(done)return; done=true;
        incoming.classList.add('is-on'); outgoing.classList.remove('is-on');
        try{ incoming.animate([{opacity:0},{opacity:1}],{duration:1200,easing:'ease'});
             outgoing.animate([{opacity:1},{opacity:0}],{duration:1200,easing:'ease'}); }catch(e){}
        zoomIn(incoming);
      };
      incoming.onload=fin; incoming.onerror=function(){done=true;};
      incoming.setAttribute('src',url);
      if(incoming.complete&&incoming.naturalWidth) fin();
    }
    (function(){ var on=null,j; for(j=0;j<bgImgs.length;j++){ if(bgImgs[j].classList.contains('is-on')){ on=bgImgs[j]; break; } } if(on) zoomIn(on); })();
    var n=ticks.length,idx=-1,DUR=6000,paused=false,visible=false,startT=0,raf=null;
    function activeFill(){ return idx>=0?ticks[idx].querySelector('.rm-featured_tick_fill'):null; }
    function frac(){ var f=activeFill(); return f?(parseFloat(f.style.width)||0)/100:0; }
    function go(i,skip){
      idx=i; var t=ticks[i];
      var name=t.getAttribute('data-name'),game=t.getAttribute('data-game'),path=t.getAttribute('data-path'),
          vid=t.getAttribute('data-video'),art=t.getAttribute('data-art');
      ticks.forEach(function(x,j){ x.classList.toggle('is-active',j===i); if(j!==i){var f=x.querySelector('.rm-featured_tick_fill'); if(f)f.style.width='0%';} });
      setBg(art);
      setVideo(vid);
      if(nameEl){ if(!skip&&typeof gsap!=='undefined'&&gsap.to&&window.ScrambleTextPlugin){ gsap.to(nameEl,{duration:0.8,scrambleText:{text:name,chars:'upperCase',speed:0.6}}); } else nameEl.textContent=name; }
      if(gameEl){ gameEl.style.opacity='0'; setTimeout(function(){gameEl.textContent=game;gameEl.style.opacity='1';},150); }
      if(ctaEl) ctaEl.setAttribute('href',path+'?trailer=play');
      if(learnEl) learnEl.setAttribute('href',path);
      startT=performance.now();
    }
    function tick(now){
      raf=requestAnimationFrame(tick);
      if(paused||!visible) return;
      var fr=Math.min(1,(now-startT)/DUR);
      var f=activeFill(); if(f) f.style.width=(fr*100)+'%';
      if(fr>=1) go((idx+1)%n,false);
    }
    function setPaused(p){
      paused=p; root.classList.toggle('is-paused',p);
      if(pp) pp.setAttribute('aria-label',p?'Play':'Pause');
      var av=activeVideo(); if(av){ if(p) av.pause(); else av.play().catch(function(){}); }
      if(!p) startT=performance.now()-frac()*DUR;
    }
    ticks.forEach(function(t,i){ t.addEventListener('click',function(){ go(i,false); if(paused) setPaused(false); }); });
    if(pp) pp.addEventListener('click',function(){ setPaused(!paused); });
    go(0,true);
    raf=requestAnimationFrame(tick);
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){
      visible=e.isIntersecting;
      if(visible){ if(!paused){ startT=performance.now()-frac()*DUR; var av=activeVideo(); if(av) av.play().catch(function(){}); } }
      else { vbufs.forEach(function(v){ try{v.pause();}catch(e){} }); }
    }); },{threshold:0.35});
    io.observe(root);
  })();
  (function(){
    var root=document.querySelector('[data-rm-trailer]');
    var featured=document.querySelector('[data-rm-featured]');
    if(!root||!featured) return;
    var iframe=root.querySelector('[data-rm-trailer-iframe]');
    function currentTrailer(){
      var t=featured.querySelector('[data-rm-feat-tick].is-active')||featured.querySelector('[data-rm-feat-tick]');
      return t?t.getAttribute('data-trailer'):'';
    }
    function open(url){
      if(!url) return false;
      root.classList.add('is-open');
      if(window.lenis) window.lenis.stop();
      document.documentElement.style.overflow='hidden';
      var sep=url.indexOf('?')>-1?'&':'?';
      setTimeout(function(){ if(iframe) iframe.setAttribute('src', url+sep+'autoplay=1&rel=0&playsinline=1'); },180);
      return true;
    }
    function close(){
      root.classList.remove('is-open');
      if(iframe) iframe.setAttribute('src','');
      if(window.lenis) window.lenis.start();
      document.documentElement.style.overflow='';
    }
    root.querySelectorAll('[data-rm-trailer-close]').forEach(function(el){ el.addEventListener('click',close); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&root.classList.contains('is-open')) close(); });
    document.addEventListener('click',function(e){
      var cta=e.target.closest?e.target.closest('[data-rm-feat-cta]'):null;
      if(!cta) return;
      var url=currentTrailer();
      if(url){ e.preventDefault(); e.stopImmediatePropagation(); open(url); }
    },true);
  })();
  (function(){
    var items=[].slice.call(document.querySelectorAll('.mod-item'));
    var vids=[].slice.call(document.querySelectorAll('.home_hero2_mod_video-item video'));
    items.forEach(function(it,i){
      var v=vids[i]; if(!v) return;
      it.addEventListener('mouseenter',function(){ if(v.preload==='none'){v.preload='auto';v.load();} v.play().catch(function(){}); });
      it.addEventListener('mouseleave',function(){ v.pause(); });
    });
  })();
  (function(){
    if(!('IntersectionObserver' in window)) return;
    var vids=[].slice.call(document.querySelectorAll('video')).filter(function(v){ return v.autoplay; });
    if(!vids.length) return;
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var v=e.target;
        if(e.isIntersecting){ if(v.paused){ v.play().catch(function(){}); } }
        else if(!v.paused){ v.pause(); }
      });
    },{rootMargin:'200px 0px'});
    vids.forEach(function(v){ try{v.preload='auto';}catch(_){} io.observe(v); });
  })();
  (function(){
    var lw=document.querySelector('.links_wrapper');
    if(!lw||typeof gsap==='undefined') return;
    var btns=[].slice.call(lw.querySelectorAll('[data-links-button]'));
    if(btns.length<2) return;
    if(window.ScrollTrigger){ ScrollTrigger.getAll().forEach(function(s){ try{ var t=s.trigger; if(t&&t.closest&&t.closest('#links')) s.kill(); }catch(e){} }); }
    var MAXD=2.5, center=(btns.length-1)/2, cur={v:center}, target=center;
    var host=lw.parentElement||lw;
    function mr(t,a,b){ return a+(b-a)*t; }
    function layout(af){
      gsap.set(lw,{y:(-100*af)+'%'});
      var bh=btns[0].offsetHeight;
      btns.forEach(function(btn,i){
        var d=Math.min(Math.abs(i-af),MAXD),t=d/MAXD;
        var op=0.16+0.84*Math.pow(1-t,1.7),sc=mr(t,1,0.62),dir=i>af?-1:1;
        var ty=(dir*bh*(1-sc))/2, from=Math.min(i,af), to=Math.max(i,af);
        btns.forEach(function(o,j){ if(j<=from||j>=to)return; var od=Math.min(Math.abs(j-af),MAXD),ot=od/MAXD,os=mr(ot,1,0.62); ty+=dir*bh*(1-os); });
        gsap.set(btn,{opacity:op,scale:sc,y:ty});
      });
    }
    layout(center);
    setTimeout(function(){ layout(cur.v); },500);
    window.addEventListener('resize',function(){ layout(cur.v); });
    function animateTo(idx){ gsap.to(cur,{v:idx,duration:0.34,ease:'power3.out',overwrite:true,onUpdate:function(){layout(cur.v);}}); }
    function highlight(idx){ btns.forEach(function(x,i){x.classList.toggle('rm-hovered',i===idx);}); }
    highlight(center);
    function inColX(x){ var w=lw.getBoundingClientRect(); return x>=w.left&&x<=w.right; }
    function liveZone(y){ var best=target,bd=Infinity; for(var i=0;i<btns.length;i++){ var r=btns[i].getBoundingClientRect(); var d=Math.abs((r.top+r.bottom)/2-y); if(d<bd){bd=d;best=i;} } return best; }
    var lockUntil=0, GLIDE=360;
    var scrolling=false, scrollT=null, lastX=null, lastY=null;
    function onScroll(){ scrolling=true; clearTimeout(scrollT); scrollT=setTimeout(function(){ scrolling=false; },180); }
    window.addEventListener('scroll',onScroll,{passive:true});
    if(window.lenis&&window.lenis.on) window.lenis.on('scroll',onScroll);
    host.addEventListener('mouseenter',function(){ lw.classList.add('rm-hovering'); });
    host.addEventListener('mousemove',function(e){
      if(scrolling) return;
      if(e.clientX===lastX && e.clientY===lastY) return;
      lastX=e.clientX; lastY=e.clientY;
      if(!inColX(e.clientX)) return;
      lw.classList.add('rm-hovering');
      var now=(window.performance&&performance.now)?performance.now():+new Date();
      if(now<lockUntil) return;
      var i=liveZone(e.clientY);
      if(i!==target){ target=i; animateTo(i); highlight(i); lockUntil=now+GLIDE; }
    });
    host.addEventListener('mouseleave',function(){ lw.classList.remove('rm-hovering'); target=center; animateTo(center); highlight(center); });

    var tY=null,tMoved=false;
    host.addEventListener('touchstart',function(e){
      if(!e.touches||e.touches.length!==1) return;
      tY=e.touches[0].clientY; tMoved=false;
      lw.classList.add('rm-hovering');
    },{passive:true});
    host.addEventListener('touchmove',function(e){
      if(tY===null||!e.touches||e.touches.length!==1) return;
      var y=e.touches[0].clientY;
      if(!tMoved&&Math.abs(y-tY)<7) return;
      tMoved=true;
      var now=(window.performance&&performance.now)?performance.now():+new Date();
      if(now<lockUntil) return;
      var i=liveZone(y);
      if(i!==target){ target=i; animateTo(i); highlight(i); lockUntil=now+GLIDE; }
    },{passive:true});
    host.addEventListener('touchend',function(e){
      if(tY===null) return;
      var moved=tMoved; tY=null;
      lw.classList.remove('rm-hovering');
      if(moved) return;
      var t=e.changedTouches&&e.changedTouches[0]; if(!t) return;
      var i=liveZone(t.clientY);
      if(i!==target){ if(e.cancelable) e.preventDefault(); target=i; animateTo(i); highlight(i); }
    },{passive:false});
  })();

  (function(){
    var el=document.querySelector('.section-links .links_bottom .mw-430 p'); if(!el) return;
    var full=el.textContent.trim();
    if(!full) return;
    el.textContent=''; el.style.minHeight='1.2em';
    var frag=document.createDocumentFragment();
    var head=document.createElement('span');
    head.className='rm-ch is-on';
    frag.appendChild(head);
    var chars=[head];
    for(var ci=0;ci<full.length;ci++){
      var sp=document.createElement('span');
      sp.className='rm-ch';
      sp.textContent=full.charAt(ci);
      frag.appendChild(sp);
      chars.push(sp);
    }
    el.appendChild(frag);
    var run=0, cursorAt=0, shown=0;
    function setCursor(i){
      if(chars[cursorAt]) chars[cursorAt].classList.remove('is-cursor');
      cursorAt=i;
      if(chars[cursorAt]) chars[cursorAt].classList.add('is-cursor');
    }
    function showUpTo(n){
      if(n>shown){ for(var k=shown+1;k<=n;k++) chars[k].classList.add('is-on'); }
      else if(n<shown){ for(var j=shown;j>n;j--) chars[j].classList.remove('is-on'); }
      shown=n;
    }
    function type(){
      var mine=++run, i=0;
      showUpTo(0); setCursor(0);
      (function step(){
        if(mine!==run) return;
        showUpTo(i); setCursor(i);
        if(i<chars.length-1){ i++; setTimeout(step,32); }
      })();
    }
    function reset(){ run++; showUpTo(0); setCursor(0); }
    if(window.ScrollTrigger){ ScrollTrigger.create({trigger:'#links',start:'top 70%',end:'bottom 30%',onEnter:type,onEnterBack:type,onLeave:reset,onLeaveBack:reset}); }
    else { setTimeout(type,600); }
  })();

  (function(){
    var lw=document.querySelector('.section-links .links_wrapper'); if(!lw) return;
    var MAG=9;
    var DIRS=[[1,0],[0.71,0.71],[0,1],[-0.71,0.71],[-1,0],[-0.71,-0.71],[0,-1],[0.71,-0.71]];
    var last=-1;
    function roll(){
      var i; do { i=Math.floor(Math.random()*DIRS.length); } while(i===last);
      last=i;
      lw.style.setProperty('--cx',(DIRS[i][0]*MAG).toFixed(2)+'px');
      lw.style.setProperty('--cy',(DIRS[i][1]*MAG).toFixed(2)+'px');
      setTimeout(roll, 1150+Math.random()*950);
    }
    roll();
  })();

  (function(){
    var sec=document.getElementById('community');
    if(!sec) return;
    try{ if(/firefox/i.test(navigator.userAgent||'')) document.documentElement.classList.add('rm-ff'); }catch(e){}
    var G=(typeof gsap!=='undefined');
    var ST=(G&&window.ScrambleTextPlugin);
    var stage=sec.querySelector('.rm-pat_stage');
    var grid=sec.querySelector('[data-pat-grid]');
    var kids=[].slice.call(sec.querySelectorAll('.rm-pat_inner > *')).filter(function(el){ return !el.classList.contains('rm-pat_headline') && !el.classList.contains('rm-pat_membership'); });
    var numEl=sec.querySelector('.rm-pat_count_num');
    (function(){ var ep=numEl&&numEl.getAttribute('data-pat-live'); if(!ep||!window.fetch) return;
      fetch(ep,{cache:'no-store'}).then(function(r){return r.json();}).then(function(d){
        var n=d&&parseInt(d.count,10); if(!(n>0)) return;
        numEl.setAttribute('data-pat-count',n);
        if(numEl.textContent && numEl.textContent!=='0' && !sec.classList.contains('rm-pat-primed')) numEl.textContent=n.toLocaleString('en-US');
      }).catch(function(){}); })();
    var brandEl=sec.querySelector('[data-pat-brand]');
    var memb=sec.querySelector('[data-pat-tiers]');
    var panel=sec.querySelector('[data-pat-panel]');
    var tabs=[].slice.call(sec.querySelectorAll('.rm-pat_tab'));
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!stage) return;

    var DATA=[]; try{ DATA=JSON.parse(sec.querySelector('[data-pat-json]').textContent)||[]; }catch(e){}
    var cur=Math.max(0,tabs.findIndex(function(t){return t.classList.contains('is-active');}));
    var pName=panel&&panel.querySelector('[data-pat-name]');
    var pPrice=panel&&panel.querySelector('[data-pat-price]');
    var pPeriod=panel&&panel.querySelector('[data-pat-period]');
    var pSum=panel&&panel.querySelector('[data-pat-summary]');
    var pNote=panel&&panel.querySelector('[data-pat-note]');
    var pPerks=panel&&panel.querySelector('[data-pat-perks]');
    var pCta=panel&&panel.querySelector('[data-pat-cta]');
    var headEl=sec.querySelector('.rm-pat_headline');
    var patUrl=(sec.querySelector('.rm-pat_brand')&&sec.querySelector('.rm-pat_brand').getAttribute('href'))||'https://patreon.com/razedmods';
    var headWords=null;
    if(headEl&&G&&typeof SplitText!=='undefined'){
      try{
        var sp=new SplitText(headEl,{type:'words',wordsClass:'rm-pat_word'});
        sp.words.forEach(function(word){
          var mask=document.createElement('span'); mask.className='rm-pat_wmask'; word.replaceWith(mask); mask.appendChild(word);
          if(word.textContent.trim().toLowerCase()==='patreon'){
            word.classList.add('rm-pat_hlink'); word.setAttribute('role','link'); word.setAttribute('tabindex','0');
            var go=function(){ window.open(patUrl,'_blank','noopener'); };
            word.addEventListener('click',go);
            word.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } });
          }
        });
        headWords=sp.words;
        gsap.set(headWords,{yPercent:118,autoAlpha:0});
      }catch(e){ headWords=null; }
    }
    function revealHead(){
      if(!headWords){ if(headEl) gsap.set(headEl,{autoAlpha:1}); return; }
      if(headEl) gsap.set(headEl,{autoAlpha:1});
      if(reduce){ gsap.set(headWords,{yPercent:0,autoAlpha:1}); return; }
      gsap.killTweensOf(headWords);
      gsap.set(headWords,{yPercent:118,autoAlpha:0});
      gsap.to(headWords,{yPercent:0,autoAlpha:1,duration:1.75,ease:'expo.out',stagger:0.14});
    }
    function headFinal(){ if(headEl) gsap.set(headEl,{autoAlpha:1}); if(headWords) gsap.set(headWords,{yPercent:0,autoAlpha:1}); }
    function lockPanelHeight(){
      if(!panel||!DATA.length) return;
      var prev=cur, hadIn=panel.classList.contains('rm-pat-in');
      panel.style.minHeight='';
      if(window.matchMedia('(max-width: 767px)').matches) return;
      panel.classList.add('rm-pat-in');
      var max=0;
      DATA.forEach(function(d,i){ renderTier(i,false); var h=panel.offsetHeight; if(h>max) max=h; });
      panel.style.minHeight=max+'px';
      renderTier(prev,false);
      if(!hadIn) panel.classList.remove('rm-pat-in');
    }
    var S=0.976, LR=0.35, BLUR=20;
    var played=false, timers=[], curZoom=null, curBlur=null;
    function clearTimers(){ timers.forEach(clearTimeout); timers=[]; }
    function later(fn,ms){ timers.push(setTimeout(fn,ms)); }

    function decode(el,text,dur,chars){
      if(!el) return;
      if(!ST||reduce){ el.textContent=text; return; }
      gsap.killTweensOf(el);
      gsap.fromTo(el,{opacity:1},{duration:dur,ease:'none',
        scrambleText:{text:text,chars:chars||'upperCase',speed:0.7,revealDelay:dur*0.2,tweenLength:false}});
    }
    function countUp(el,dur){
      var target=parseInt(el.getAttribute('data-pat-count'),10)||0;
      if(!G||reduce){ el.textContent=target.toLocaleString('en-US'); return; }
      var o=el._cu||(el._cu={v:0}); gsap.killTweensOf(o); o.v=0; el.textContent='0';
      gsap.to(o,{v:target,duration:dur,ease:'power2.out',
        onUpdate:function(){ el.textContent=Math.round(o.v).toLocaleString('en-US'); },
        onComplete:function(){ el.textContent=target.toLocaleString('en-US'); }});
    }

    function buildPerks(list){
      if(!pPerks) return;
      pPerks.innerHTML='';
      (list||[]).forEach(function(k){
        var li=document.createElement('li'); li.className='rm-pat_perk';
        var mk=document.createElement('span'); mk.className='rm-pat_perk_mk'; mk.setAttribute('aria-hidden','true');
        var sp=document.createElement('span'); sp.textContent=k;
        li.appendChild(mk); li.appendChild(sp); pPerks.appendChild(li);
      });
    }
    function seqEls(){
      if(!panel) return [];
      var a=[panel.querySelector('.rm-pat_panel_id'),panel.querySelector('.rm-pat_panel_price'),pSum];
      a=a.concat([].slice.call(pPerks?pPerks.querySelectorAll('.rm-pat_perk'):[]));
      a.push(pNote,pCta);
      return a.filter(function(el){ return el && (el===pCta || el===pNote ? (el===pCta || el.textContent) : true); });
    }
    function playPanelSeq(){
      if(!G||reduce||!panel) return;
      var name=panel.querySelector('.rm-pat_panel_id'), price=panel.querySelector('.rm-pat_panel_price');
      var perks=[].slice.call(pPerks?pPerks.querySelectorAll('.rm-pat_perk'):[]);
      perks.sort(function(a,b){ var ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
        return (Math.round(ra.top)-Math.round(rb.top)) || (ra.left-rb.left); });
      var rise=[name,price,pSum].concat(perks);
      if(pNote&&pNote.textContent) rise.push(pNote);
      rise=rise.filter(Boolean);
      gsap.killTweensOf(rise); if(pCta) gsap.killTweensOf(pCta);
      gsap.set(rise,{autoAlpha:0});
      if(pCta) gsap.set(pCta,{autoAlpha:0});
      var tl=gsap.timeline();
      tl.to(rise,{autoAlpha:1,duration:0.9,ease:'sine.inOut',stagger:0.09});
      if(pCta) tl.to(pCta,{autoAlpha:1,duration:0.7,ease:'sine.inOut'}, rise.length*0.09);
    }
    var ROLE_RE=/supporter"?\s*role/i;
    function cumulativePerks(i){
      var seen={}, out=[];
      for(var t=0;t<=i;t++){ (DATA[t].perks||[]).forEach(function(p){
        if(ROLE_RE.test(p)) return;
        if(!seen[p]){ seen[p]=1; out.push(p); }
      }); }
      var role=null;
      for(var r=i;r>=0&&!role;r--){ (DATA[r].perks||[]).forEach(function(p){ if(!role&&ROLE_RE.test(p)) role=p; }); }
      if(role) out.push(role);
      return out;
    }
    function renderTier(i,animate){
      var d=DATA[i]; if(!d) return;
      cur=i;
      if(pName) pName.className='rm-pat_panel_name is-'+String(d.name||'').toLowerCase();
      tabs.forEach(function(t,j){ var on=j===i; t.classList.toggle('is-active',on); t.setAttribute('aria-selected',on?'true':'false'); });
      if(pPrice) pPrice.textContent=d.price;
      if(pPeriod) pPeriod.textContent=d.period;
      if(pCta) pCta.setAttribute('href',d.href);
      buildPerks(cumulativePerks(i));
      if(pSum) pSum.textContent=pSum.getAttribute('data-pat-sum-label')||"What's included";
      if(pNote){ var nTxt=pNote.querySelector('[data-pat-note-t]')||pNote;
        nTxt.textContent=d.note||''; pNote.classList.toggle('is-empty',!d.note); }
      if(pName) pName.textContent=d.title||(d.name+' Tier');
      if(panel) panel.classList.add('rm-pat-in');
      if(animate&&!reduce){ playPanelSeq(); }
      else if(G){ gsap.killTweensOf(seqEls()); gsap.set(seqEls(),{clearProps:'opacity,visibility,transform'}); }
    }

    function reveal(){
      if(!G||reduce){ if(numEl&&DATA) ; if(panel) panel.classList.add('rm-pat-in'); return; }
      if(numEl) countUp(numEl, 3.2);
      if(brandEl) later(function(){ decode(brandEl, brandEl.dataset.patFinal||(brandEl.dataset.patFinal=brandEl.textContent), 0.5); },140);
      later(revealHead, 1750);
      later(function(){ renderTier(cur,true); }, 520);
    }

    function startInset(){
      var rem=parseFloat(getComputedStyle(document.documentElement).fontSize)||16;
      var lr=LR*rem, tb=lr+Math.max(0,(1-S)/S*0.5*(window.innerWidth-window.innerHeight));
      return 'inset('+tb+'px '+lr+'px '+tb+'px '+lr+'px)';
    }
    function zoomIn(dur){ if(curZoom) curZoom.kill(); gsap.set(stage,{clipPath:startInset(),scale:S,transformOrigin:'50% 50%'});
      curZoom=gsap.to(stage,{clipPath:'inset(0rem)',scale:1,duration:dur,ease:'power2.inOut',onComplete:function(){ gsap.set(stage,{clearProps:'transform,clipPath'}); }}); }
    function blurIn(dur){ if(curBlur) curBlur.kill(); gsap.set(stage,{filter:'blur('+BLUR+'px)'});
      curBlur=gsap.to(stage,{filter:'blur(0px)',duration:dur,ease:'power2.out',onComplete:function(){ gsap.set(stage,{clearProps:'filter,webkitFilter'}); }}); }
    function stageRest(){ if(!G) return; if(curZoom){curZoom.kill();curZoom=null;} if(curBlur){curBlur.kill();curBlur=null;}
      gsap.set(stage,{clearProps:'transform,clipPath,filter,webkitFilter,willChange'});
      gsap.set(kids,{clearProps:'transform,willChange'}); }
    var GZ_OUT=0.9;
    function gridPrime(){ if(grid) gsap.set(grid,{scale:GZ_OUT,transformOrigin:'50% 50%'}); }
    function gridZoom(){ if(!grid) return; gsap.killTweensOf(grid);
      gsap.set(grid,{scale:GZ_OUT,transformOrigin:'50% 50%'});
      gsap.to(grid,{scale:1,duration:4.0,ease:'power2.out'}); }
    function gridFinal(){ if(grid){ gsap.killTweensOf(grid); gsap.set(grid,{clearProps:'transform,willChange,filter'}); } }
    var gridVids=[].slice.call(sec.querySelectorAll('.rm-pat_gvid')), gridPreloaded=false;
    gridVids.forEach(function(v){ try{ v.disablePictureInPicture=true; }catch(e){} });
    (function(){
      var srcEls=gridVids.map(function(v){ return v.querySelector('source'); });
      if(srcEls.length<2||srcEls.indexOf(null)!==-1) return;
      var pool=((grid&&grid.getAttribute('data-pat-pool'))||'').split('|').filter(Boolean);
      var urls=pool.length>=srcEls.length?pool.slice():srcEls.map(function(s){ return s.getAttribute('src'); });
      for(var i=urls.length-1;i>0;i--){
        var j=Math.floor(Math.random()*(i+1)), t=urls[i]; urls[i]=urls[j]; urls[j]=t;
      }
      srcEls.forEach(function(s,i){ s.setAttribute('src',urls[i]); });
    })();
    var whenSettled=window.__rmWhenSettled||function(fn){ fn(); };
    function preloadGrid(){ if(gridPreloaded||!gridVids.length) return; gridPreloaded=true;
      whenSettled(function(){ gridVids.forEach(function(v){ try{ v.preload='auto'; v.load(); }catch(e){} }); }); }
    function playGrid(){ whenSettled(function(){ gridVids.forEach(function(v,i){ setTimeout(function(){
      try{ v.muted=true; var pr=v.play(); if(pr&&pr.catch) pr.catch(function(){ setTimeout(function(){ try{v.play().catch(function(){});}catch(e){} },600); }); }catch(e){}
    }, i*110); }); }); }

    function showFinal(){
      clearTimers();
      sec.classList.remove('rm-pat-primed');
      if(curZoom){ curZoom.kill(); curZoom=null; }
      if(curBlur){ curBlur.kill(); curBlur=null; }
      if(G){ gsap.killTweensOf(kids); stageRest(); gridFinal(); gsap.set(kids,{clearProps:'opacity,transform,willChange'}); }
      if(numEl&&ST) gsap.killTweensOf(numEl);
      if(numEl) numEl.textContent=(parseInt(numEl.getAttribute('data-pat-count'),10)||0).toLocaleString('en-US');
      headFinal();
      renderTier(cur,false);
    }
    function primeContent(){
      if(!G||reduce) return;
      clearTimers();
      gsap.set(kids,{opacity:0,y:16});
      if(numEl) numEl.textContent='0';
      if(headEl) gsap.set(headEl,{autoAlpha:0});
      if(headWords){ gsap.killTweensOf(headWords); gsap.set(headWords,{yPercent:118,autoAlpha:0}); }
      if(panel) panel.classList.remove('rm-pat-in');
      var e=seqEls(); if(e.length){ gsap.killTweensOf(e); gsap.set(e,{autoAlpha:0}); }
    }
    function primePat(){
      if(played||reduce||!G) return;
      sec.classList.add('rm-pat-primed');
      preloadGrid();
      gsap.set(stage,{clipPath:startInset(),scale:S,transformOrigin:'50% 50%',filter:'blur('+BLUR+'px)'});
      gridPrime();
      primeContent();
    }
    function play(armed){
      clearTimers();
      window.__patLastPlay=Date.now();
      sec.classList.remove('rm-pat-primed');
      if(armed){ zoomIn(1.8); blurIn(1.4); gridZoom(); later(stageRest,1900); } else { stageRest(); gridFinal(); }
      preloadGrid(); playGrid();
      if(G) gsap.to(kids,{opacity:1,y:0,duration:0.85,stagger:0.08,ease:'power2.out',clearProps:'transform,willChange'});
      later(reveal, armed?720:60);
      later(function(){ stageRest(); gridFinal(); if(G){ gsap.set(kids,{opacity:1}); gsap.set(kids,{clearProps:'transform,willChange'}); } headFinal(); },5200);
    }

    window.__primePatEntrance=primePat;
    window.__replayPatreon=function(){
      clearTimers();
      played=false;
      primeContent();
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        played=true; play(false);
      }); });
    };
    showFinal();
    lockPanelHeight();
    window.addEventListener('load',lockPanelHeight);
    if(G&&!reduce) primeContent();

    if(G&&typeof ScrollTrigger!=='undefined'){
      ScrollTrigger.create({trigger:'#community',start:'top center',end:'bottom center',
        onToggle:function(self){ if(self.isActive && !played){ played=true; play(window.__patEntranceArmed&&!reduce); } }});
      ScrollTrigger.create({trigger:'#community',start:'top bottom',end:'bottom top',
        onEnter:preloadGrid,onEnterBack:preloadGrid,
        onLeaveBack:function(){ played=false; window.__patEntranceArmed=false; primeContent(); },
        onLeave:function(){ played=false; window.__patEntranceArmed=false; primeContent(); }});
    }

    var hoverT=null;
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){ clearTimeout(hoverT); if(i!==cur) renderTier(i,true); });
      t.addEventListener('mouseenter',function(){ clearTimeout(hoverT); hoverT=setTimeout(function(){ if(i!==cur) renderTier(i,true); },130); });
      t.addEventListener('mouseleave',function(){ clearTimeout(hoverT); });
    });

    var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(function(){ lockPanelHeight(); if(!played){ if(window.__patEntranceArmed) primePat(); else primeContent(); } },200); });
  })();
  (function(){
    var trg=document.querySelector('[data-mods-toggle]'); if(!trg) return;
    var mega=document.querySelector('[data-mods-mega]');
    var root=document.documentElement;
    function navH(){
      if(window.matchMedia('(max-width:767px)').matches){
        var b=document.querySelector('.navbar_body')||document.querySelector('.navbar_brand');
        var r=b?b.getBoundingClientRect():null;
        return Math.max(40,Math.min(78,Math.round(r&&r.bottom>0?r.bottom+4:56)));
      }
      var t=trg.getBoundingClientRect(); var h=(t&&t.bottom>0)?t.bottom+14:80; return Math.max(48,Math.min(120,Math.round(h)));
    }
    function pubNav(){ root.style.setProperty('--rm-nav-h',navH()+'px'); }
    pubNav();
    var closeTimer=null;
    function set(open){
      if(open){ pubNav(); if(closeTimer){clearTimeout(closeTimer);closeTimer=null;} root.classList.remove('rm-mods-closing'); }
      root.classList.toggle('rm-mods-open',open);
      trg.setAttribute('aria-expanded',open?'true':'false');
      if(mega) mega.setAttribute('aria-hidden',open?'false':'true');
      if(!open){
        root.classList.add('rm-mods-closing');
        if(closeTimer) clearTimeout(closeTimer);
        closeTimer=setTimeout(function(){ root.classList.remove('rm-mods-closing'); closeTimer=null; }, 900);
      }
    }
    window.__rmCloseMods=function(){ if(root.classList.contains('rm-mods-open')) set(false); };
    var nav=trg.closest('[data-mods-nav]');
    var isSmall=function(){ return window.matchMedia('(max-width:767px)').matches; };
    var sub=null;
    function buildSub(){
      if(sub||!nav||!mega) return sub;
      var grid=mega.querySelector('.rm-mods-mega_grid'); if(!grid) return null;
      sub=document.createElement('div'); sub.className='rm-mods-sub';
      var inner=document.createElement('div'); inner.className='rm-mods-sub_in';
      var list=document.createElement('div'); list.className='rm-mods-sub_list';
      [].slice.call(grid.querySelectorAll('.rm-mods-card')).forEach(function(card){
        list.appendChild(card.cloneNode(true));
      });
      inner.appendChild(list); sub.appendChild(inner); nav.appendChild(sub);
      return sub;
    }
    function setSub(open){
      if(!buildSub()) return;
      nav.classList.toggle('is-sub-open',open);
      trg.setAttribute('aria-expanded',open?'true':'false');
    }
    window.__rmCloseModsSub=function(){ if(nav) setSub(false); };
    trg.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation();
      if(isSmall()){ setSub(!nav.classList.contains('is-sub-open')); return; }
      var next=!root.classList.contains('rm-mods-open');
      if(next&&window.__rmCloseLang) window.__rmCloseLang();
      set(next);
    });
    document.addEventListener('click',function(e){ if(root.classList.contains('rm-mods-open')&&!e.target.closest('[data-mods-mega]')&&!e.target.closest('[data-mods-toggle]')) set(false); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') set(false); });
    window.addEventListener('resize',pubNav);
    window.addEventListener('wheel',function(e){
      if(!root.classList.contains('rm-mods-open')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if(e.deltaY>0) set(false);
    },{passive:false,capture:true});
    var lastY=window.pageYOffset||document.documentElement.scrollTop||0;
    window.addEventListener('scroll',function(){
      var y=window.pageYOffset||document.documentElement.scrollTop||0;
      if(y>lastY+2&&root.classList.contains('rm-mods-open')) set(false);
      lastY=y;
    },{passive:true});
  })();

  (function(){
    var root=document.documentElement;
    var isHome=(rmPath()==='/'||rmPath()==='/index.html');
    var lastY=window.pageYOffset||root.scrollTop||0;
    function heroH(){
      var h=document.querySelector('.main-wrapper section')||document.querySelector('.home-hero_body');
      return h?h.getBoundingClientRect().height:window.innerHeight;
    }
    function upd(){
      if(root.style.overflow==='hidden') return;
      var y=window.pageYOffset||root.scrollTop||0;
      var hh=heroH();
      var solid = isHome ? y>hh*0.98 : y>4;
      var canHide = isHome ? y>hh*0.45 : y>80;
      root.classList.toggle('rm-nav-solid',solid);
      if(root.classList.contains('rm-mods-open')){ root.classList.remove('rm-nav-hidden'); lastY=y; return; }
      if(canHide && y>lastY+3){ root.classList.add('rm-nav-hidden'); }
      else if(y<lastY-3 || !canHide){ root.classList.remove('rm-nav-hidden'); }
      lastY=y;
    }
    upd();
    window.addEventListener('scroll',upd,{passive:true});
    (function bindLenis(n){
      if(window.lenis&&window.lenis.on){ window.lenis.on('scroll',upd); upd(); return; }
      if(n<60) setTimeout(function(){ bindLenis(n+1); },100);
    })(0);
    window.addEventListener('resize',upd);
    window.addEventListener('load',upd);
    window.addEventListener('pageshow',upd);
    document.addEventListener('visibilitychange',function(){ if(!document.hidden) upd(); });
    requestAnimationFrame(upd);
    [50,180,450,900,1600].forEach(function(ms){ setTimeout(upd,ms); });
    var peeking=false;
    window.addEventListener('mousemove',function(e){
      var y=e.clientY;
      if(!peeking && y<=88){ peeking=true; root.classList.add('rm-nav-peek'); }
      else if(peeking && y>130){ peeking=false; root.classList.remove('rm-nav-peek'); }
    },{passive:true});
    document.addEventListener('mouseleave',function(){ if(peeking){ peeking=false; root.classList.remove('rm-nav-peek'); } });
    window.__rmArmNavPeek=function(){ peeking=true; root.classList.remove('rm-nav-peek'); };
  })();

  (function(){
    var root=document.documentElement;
    function solid(on){ root.classList.toggle('rm-logo-solid',!!on); }
    var isHome=(rmPath()==='/'||rmPath()==='/index.html');
    if(!isHome){ solid(true); return; }
    var tries=0;
    (function check(){
      if(window._logoScrollTl&&window._logoScrollTl.progress){
        var upd=function(){ var tl=window._logoScrollTl; if(tl&&tl.progress) solid(tl.progress()>=0.5); };
        upd(); setInterval(upd,150);
        return;
      }
      if(tries++<200){ setTimeout(check,50); return; }
      solid(true);
    })();
  })();

  (function(){
    var p=rmPath();
    if(p!=='/'&&p!=='/index.html') return;
    var root=document.documentElement;
    var present=['.home-hero2_body','#art-direction','#community','#links'].filter(function(s){ return document.querySelector(s); });
    if(!present.length) return;
    var bar=document.createElement('div'); bar.className='rm-progress is-hero'; bar.setAttribute('aria-hidden','true');
    var track=document.createElement('span'); track.className='rm-progress_track';
    var fill=document.createElement('i'); fill.className='rm-progress_fill'; track.appendChild(fill);
    var n=present.length+1, cur=0, goal=0, raf=0;
    bar.appendChild(track);
    document.body.appendChild(bar);
    var bounds=[];
    function measure(){
      var y=window.scrollY||window.pageYOffset||0;
      var maxY=Math.max(0,root.scrollHeight-window.innerHeight);
      bounds=[0];
      present.forEach(function(s){
        var el=document.querySelector(s);
        var t=el?el.getBoundingClientRect().top+y:maxY;
        bounds.push(Math.min(Math.max(t,bounds[bounds.length-1]),maxY));
      });
      var foot=document.querySelector('.footer-wrap');
      var endY=foot?foot.getBoundingClientRect().top+y-window.innerHeight*0.5:maxY;
      bounds.push(Math.min(Math.max(endY,bounds[bounds.length-1]),maxY));
    }
    function glide(){
      cur+=(goal-cur)*0.2;
      if(Math.abs(goal-cur)<0.0005) cur=goal;
      bar.style.setProperty('--p',cur.toFixed(4));
      raf=cur===goal?0:requestAnimationFrame(glide);
    }
    function paint(){
      if(root.style.overflow==='hidden'||!bounds.length) return;
      var y=(window.scrollY||window.pageYOffset||0)+1, done=0;
      for(var i=0;i<n;i++){
        var a=bounds[i], b=bounds[i+1];
        done+=Math.max(0,Math.min(1,b>a?(y-a)/(b-a):(y>=b?1:0)));
      }
      goal=done/n;
      if(!raf) raf=requestAnimationFrame(glide);
      bar.classList.toggle('is-hero',y<bounds[1]*0.6);
      bar.classList.toggle('is-end',done>=n);
    }
    function refresh(){ measure(); paint(); }
    refresh();
    var rt=null;
    window.addEventListener('scroll',paint,{passive:true});
    window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(refresh,240); });
    window.addEventListener('load',refresh);
    window.addEventListener('pageshow',refresh);
    [300,1200,3000,6000].forEach(function(ms){ setTimeout(refresh,ms); });
    (function bindLenis(n){
      if(window.lenis&&window.lenis.on){ window.lenis.on('scroll',paint); refresh(); return; }
      if(n<60) setTimeout(function(){ bindLenis(n+1); },100);
    })(0);
    (function bindST(n){
      if(window.ScrollTrigger&&window.ScrollTrigger.addEventListener){ window.ScrollTrigger.addEventListener('refresh',refresh); return; }
      if(n<60) setTimeout(function(){ bindST(n+1); },100);
    })(0);
  })();

  (function(){
    if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined') return;
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var grid=document.querySelector('.is-mod .mod-gallery_list');
    if(!grid) return;
    var tiles=[].slice.call(grid.children);
    if(!tiles.length) return;
    var reading=function(b){
      return b.slice().sort(function(a,c){
        var ra=a.getBoundingClientRect(), rc=c.getBoundingClientRect();
        if(Math.abs(ra.top-rc.top)>4) return ra.top-rc.top;
        return ra.left-rc.left;
      });
    };
    var run=function(){
      gsap.set(tiles,{opacity:0,y:16});
      ScrollTrigger.batch(tiles,{
        start:'top 99%',
        onEnter:function(b){
          var s=reading(b);
          gsap.to(s,{opacity:1,y:0,duration:.95,ease:'power1.out',stagger:{each:.09},overwrite:true,
            onComplete:function(){ gsap.set(s,{clearProps:'transform'}); }});
        },
        onLeaveBack:function(b){
          gsap.to(reading(b),{opacity:0,y:16,duration:.45,ease:'power1.in',stagger:{each:.04,from:'end'},overwrite:true});
        }
      });
      try{ ScrollTrigger.refresh(); }catch(e){}
      setTimeout(function(){
        tiles.forEach(function(t){
          var r=t.getBoundingClientRect();
          if(r.top<window.innerHeight&&r.bottom>0&&parseFloat(getComputedStyle(t).opacity)<0.05){
            gsap.set(t,{opacity:1,y:0,clearProps:'transform'});
          }
        });
      },2500);
    };
    if(document.readyState==='complete') setTimeout(run,140);
    else window.addEventListener('load',function(){ setTimeout(run,140); });
  })();
  (function(){
    if(typeof gsap==='undefined'||typeof SplitText==='undefined'||typeof ScrollTrigger==='undefined') return;
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var targets=[].slice.call(document.querySelectorAll('.text-size-44--32[data-h-animation],.rm-footer_cta h2'));
    if(!targets.length) return;
    var built=false;
    var mob=function(){ return window.matchMedia&&window.matchMedia('(max-width:767px)').matches; };
    var buildOne=function(el){
      try{
        ScrollTrigger.getAll().forEach(function(t){
          if(t.trigger===el){ if(t.animation) t.animation.kill(); t.kill(false); }
        });
        gsap.killTweensOf(el.querySelectorAll('.word-inner'));
      }catch(e){}
      var txt=(el.textContent||'').trim();
      if(!txt) return;
      el.textContent=txt;
      gsap.set(el,{visibility:'visible'});
      var split;
      try{ split=new SplitText(el,{type:'lines',linesClass:'rm-line'}); }catch(e){ return; }
      if(!split.lines.length) return;
      var st={trigger:el,start:'top 90%',invalidateOnRefresh:true};
      if(mob()) st.once=true; else st.toggleActions='play none none reverse';
      gsap.fromTo(split.lines,{clipPath:'inset(-14% -2% 100% -2%)'},{
        clipPath:'inset(-14% -2% -29% -2%)', duration:.9, ease:'power2.out', stagger:.11, immediateRender:true,
        scrollTrigger:st
      });
    };
    var build=function(){
      targets.forEach(buildOne);
      built=true;
      try{ ScrollTrigger.refresh(); }catch(e){}
    };
    var kick=function(){ setTimeout(build,140); };
    if(document.readyState==='complete') kick();
    else window.addEventListener('load',kick);
    var rt, lastW=window.innerWidth;
    window.addEventListener('resize',function(){
      if(!built) return;
      if(window.innerWidth===lastW) return;
      lastW=window.innerWidth;
      clearTimeout(rt);
      rt=setTimeout(function(){ built=false; build(); },220);
    });
  })();
  (function(){
    if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined') return;
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var SIZES=['.text-size-80--32','.text-size-68--32'];
    var SEL=SIZES.map(function(c){ return c+'[data-h-animation]'; })
      .concat(SIZES.map(function(c){ return c+' [data-h-animation]'; })).join(',');
    var run=function(){
      var els=[].slice.call(document.querySelectorAll(SEL));
      if(!els.length) return;
      try{ gsap.registerPlugin(ScrollTrigger); }catch(e){}
      els.forEach(function(el){
        var box=el.getBoundingClientRect();
        if(box.top+window.scrollY < window.innerHeight*0.9) return;
        var words=[].slice.call(el.querySelectorAll('.word-inner'));
        if(!words.length&&typeof SplitText!=='undefined'){
          try{ words=new SplitText(el,{type:'words',wordsClass:'word-inner'}).words; }catch(e){ words=[]; }
        }
        if(!words.length) return;
        try{
          ScrollTrigger.getAll().forEach(function(t){
            if(t.trigger===el){ if(t.animation) t.animation.kill(); t.kill(false); }
          });
        }catch(e){}
        gsap.killTweensOf(words);
        gsap.set(el,{visibility:'visible'});
        gsap.set(words,{yPercent:0,clearProps:'transform'});
        gsap.fromTo(words,{opacity:.16},{
          opacity:1, ease:'none', duration:.5, stagger:{each:.09},
          scrollTrigger:{trigger:el,start:'top 85%',end:'bottom 45%',scrub:.4}
        });
      });
      try{ ScrollTrigger.refresh(); }catch(e){}
    };
    var kick=function(){ setTimeout(run,120); };
    if(document.readyState==='complete') kick();
    else window.addEventListener('load',kick);
  })();
  (function(){
    var els=[].slice.call(document.querySelectorAll('[data-copy-email]'));
    if(!els.length) return;
    var toast;
    function legacyCopy(t){ try{ var ta=document.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;left:0;opacity:0'; document.body.appendChild(ta); ta.select(); var ok=document.execCommand('copy'); ta.remove(); return ok; }catch(e){ return false; } }
    function show(el,msg){
      if(!toast){ toast=document.createElement('div'); toast.className='rm-copy-toast'; document.body.appendChild(toast); }
      toast.textContent=msg;
      toast.classList.remove('is-show'); void toast.offsetWidth; toast.classList.add('is-show');
      clearTimeout(toast._t); toast._t=setTimeout(function(){ toast.classList.remove('is-show'); },2200);
    }
    els.forEach(function(el){
      var email=el.getAttribute('data-copy-email');
      el.addEventListener('click',function(e){
        e.preventDefault();
        var done=function(ok){ show(el,ok?'Email copied to clipboard':email); };
        if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(email).then(function(){done(true);},function(){done(legacyCopy(email));}); }
        else { done(legacyCopy(email)); }
      });
    });
  })();

  (function(){
    var vids=[].slice.call(document.querySelectorAll('video[data-rate]'));
    if(!vids.length) return;
    vids.forEach(function(v){
      var rate=parseFloat(v.getAttribute('data-rate'));
      if(!(rate>0)) return;
      var apply=function(){ if(v.playbackRate!==rate) v.playbackRate=rate; };
      apply();
      ['loadedmetadata','loadeddata','canplay','play','playing'].forEach(function(ev){
        v.addEventListener(ev,apply);
      });
    });
  })();

  (function(){
    if(document.querySelector('.rm-scroll-arrow')) return;
    if(document.body.classList.contains('rm-detail')) return;
    var a=document.createElement('div'); a.className='rm-scroll-arrow';
    a.innerHTML='<div class="rm-scroll-arrow_inner"><svg viewBox="0 0 32 15" fill="none" aria-hidden="true"><path d="M3 4l13 8 13-8" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
    document.body.appendChild(a);
    function fade(){ var y=window.scrollY||window.pageYOffset||0; var o=Math.max(0,Math.min(1,1-y/(window.innerHeight*0.35))); a.style.opacity=o; a.style.visibility=o<=0.01?'hidden':'visible'; }
    fade();
    window.addEventListener('scroll',fade,{passive:true});
    if(window.lenis&&window.lenis.on) window.lenis.on('scroll',fade);
  })();

  (function(){
    if(!window.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var root=document.documentElement;
    var blob=document.createElement('div'); blob.className='rm-cursor-blob';
    var dot=document.createElement('div'); dot.className='rm-cursor-dot';
    var arrow=document.createElement('div'); arrow.className='rm-cursor-arrow';
    arrow.innerHTML='<span><svg viewBox="0 0 24 24" fill="#fff" stroke="rgba(10,12,20,.5)" stroke-width="1.1" stroke-linejoin="round"><path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z"></path></svg></span>';
    document.body.appendChild(blob); document.body.appendChild(dot); document.body.appendChild(arrow);
    root.classList.add('rm-cursor-on');
    var mx=window.innerWidth/2, my=window.innerHeight/2, bx=mx, by=my, ready=false;
    var HIT='a,button,[role="button"],[role="link"],input,textarea,select,label,summary,.rm-featured_playpause,.rm-featured_media,[data-links-button],[data-rm-cmp],[onclick]';
    var TEXT='p,h1,h2,h3,h4,h5,h6,li,blockquote,figcaption,dd,dt,td,th,.about-info_team-item div,.rm-footer_bar>div:first-child';
    var NOTEXT='.mod-list,.home_hero2_mod-block,.mod-floating,.section-who';
    var lineCache=null, lineEl=null, lineAt=0;
    function lineBoxes(el){
      var now=Date.now();
      if(lineEl===el&&lineCache&&now-lineAt<250) return lineCache;
      var rg=document.createRange();
      try{ rg.selectNodeContents(el); }catch(err){ return null; }
      var rs=rg.getClientRects(), out=[];
      for(var i=0;i<rs.length;i++){
        var b=rs[i];
        if(b.width<=0.5||b.height<=0.5) continue;
        var merged=false;
        for(var j=0;j<out.length;j++){
          var g=out[j];
          var ov=Math.min(g.bottom,b.bottom)-Math.max(g.top,b.top);
          if(ov>Math.min(g.bottom-g.top,b.height)*0.55){
            g.left=Math.min(g.left,b.left); g.right=Math.max(g.right,b.right);
            g.top=Math.min(g.top,b.top); g.bottom=Math.max(g.bottom,b.bottom);
            merged=true; break;
          }
        }
        if(!merged) out.push({left:b.left,right:b.right,top:b.top,bottom:b.bottom});
      }
      lineEl=el; lineCache=out; lineAt=now;
      return out;
    }
    function onGlyphs(el,x,y){
      var rs=lineBoxes(el);
      if(!rs||!rs.length) return true;
      for(var i=0;i<rs.length;i++){
        var b=rs[i];
        if(x>=b.left-2&&x<=b.right+2&&y>=b.top-1&&y<=b.bottom+1) return true;
      }
      return false;
    }
    var glyphEl=null;
    window.addEventListener('mousemove',function(e){
      mx=e.clientX; my=e.clientY;
      dot.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
      arrow.style.transform='translate('+mx+'px,'+my+'px) translate(-3px,-3px)';
      if(!ready){ ready=true; bx=mx; by=my; root.classList.add('rm-cursor-ready'); }
      var t=e.target&&e.target.closest?e.target.closest(HIT):null;
      root.classList.toggle('rm-cursor-hover',!!t);
      var tx=(!t&&e.target&&e.target.closest)?e.target.closest(TEXT):null;
      if(tx&&e.target.closest(NOTEXT)) tx=null;
      if(tx&&!onGlyphs(tx,mx,my)) tx=null;
      if(glyphEl&&glyphEl!==tx) glyphEl.classList.remove('rm-glyph-hit');
      if(tx) tx.classList.add('rm-glyph-hit');
      glyphEl=tx;
      root.classList.toggle('rm-cursor-text',!!tx);
    },{passive:true});
    window.addEventListener('mouseleave',function(){ root.classList.remove('rm-cursor-ready'); });
    window.addEventListener('mouseenter',function(){ root.classList.add('rm-cursor-ready'); });
    (function loop(){
      bx+=(mx-bx)*0.18; by+=(my-by)*0.18;
      blob.style.transform='translate3d('+Math.round(bx)+'px,'+Math.round(by)+'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
  })();
  (function(){
    var p=rmPath();
    var isHome=(p==='/'||p==='/index.html');
    if(!isHome) return;
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var coarse=window.matchMedia('(pointer: coarse)').matches;
    if(reduce||!window.lenis||coarse) return;
    var ease=function(x){ return 1-Math.pow(1-x,3); };
    var SELS=['.home-hero2_body','#art-direction','#community','#links'];
    var FIT=['.home-hero2_body','#community'];
    function topOf(sel){ var el=document.querySelector(sel); if(!el) return null; return el.getBoundingClientRect().top+window.scrollY; }
    function beats(){
      var maxY=document.documentElement.scrollHeight-window.innerHeight, ys=[0];
      var clamp=function(y){ return Math.max(0,Math.min(y,maxY)); };
      SELS.forEach(function(s){ var t=topOf(s); if(t!=null) ys.push(clamp(t)); });
      if(coarse) FIT.forEach(function(s){
        var el=document.querySelector(s); if(!el) return;
        var r=el.getBoundingClientRect(), over=r.height-window.innerHeight;
        if(over>24) ys.push(clamp(r.top+window.scrollY+over));
      });
      return ys.filter(function(v,i){return ys.indexOf(v)===i;}).sort(function(a,b){return a-b;});
    }
    var animating=false, aimY=null, lastStep=0;
    function glideTo(target){
      var dist=Math.abs(target-window.scrollY);
      if(dist<2) return;
      var dur=Math.max(0.75,Math.min(1.5,dist/1440));
      var heavy=[].slice.call(document.querySelectorAll('.section-who video,.rm-pat_gvid')).filter(function(v){ return !v.paused; }), parked=[];
      (function park(){ heavy.splice(0,3).forEach(function(v){ v.dataset.rmState='paused'; v.pause(); parked.push(v); }); if(heavy.length) requestAnimationFrame(park); })();
      animating=true; aimY=target; window.__rmSnapping=true;
      var cleared=false;
      var clear=function(){
        if(cleared) return; cleared=true;
        animating=false; aimY=null; window.__rmSnapping=false; if(window.lenis.isLocked) window.lenis.isLocked=false;
        parked.forEach(function(v){ var item=v.closest('[data-who-video-main] > *'), shown=!item||parseFloat(getComputedStyle(item).opacity)>0.05;
          if(shown&&window.__rmVidOnScreen(v)){ v.dataset.rmState='playing'; v.play().catch(function(){}); } else { v.dataset.rmWasPlaying='1'; } });
      };
      window.lenis.scrollTo(target,{duration:dur,easing:ease,lock:true,onComplete:function(){ setTimeout(clear,50); }});
      setTimeout(clear,dur*1000+380);
    }
    window.__rmGlideTo=glideTo;
    function step(dir){
      var B=beats(), from=(animating&&aimY!=null)?aimY:window.scrollY, target=null, i;
      if(dir>0){ for(i=0;i<B.length;i++){ if(B[i]>from+4){ target=B[i]; break; } } }
      else     { for(i=B.length-1;i>=0;i--){ if(B[i]<from-4){ target=B[i]; break; } } }
      if(target!=null) glideTo(target);
    }
    function gate(dir){
      var now=Date.now();
      if(animating){ lastStep=now; return; }
      if(now-lastStep<220) return;
      lastStep=now;
      step(dir);
    }
    function onWheel(e){
      if(window.__rmSnapPaused || window.lenis.isStopped) return;
      if(document.documentElement.classList.contains('rm-mods-open')) return;
      if(e.target && e.target.closest && e.target.closest('[data-lenis-prevent]')) return;
      var y=window.scrollY, down=e.deltaY>0, cTop=topOf('#community');
      if(cTop!=null && (down ? y >= cTop-6 : y > cTop+6)) return;
      e.preventDefault(); e.stopImmediatePropagation();
      gate(down?1:-1);
    }
    if(coarse){
      var tx=null, ty=null, claim=null, fired=false, touching=false, native=0, settleT=null;
      var blocked=function(t){
        if(window.__rmSnapPaused || window.lenis.isStopped) return true;
        var cl=document.documentElement.classList;
        if(cl.contains('rm-mods-open')||cl.contains('rm-lb-zoomed')) return true;
        if(document.querySelector('.gallery-popup.is-active,.w-nav-overlay[style*="block"]')) return true;
        return !!(t && t.closest && t.closest('[data-lenis-prevent],input,textarea,select,.w-nav-menu[data-nav-menu-open]'));
      };
      window.addEventListener('touchstart',function(e){
        touching=true; clearTimeout(settleT);
        if(!e.touches||e.touches.length!==1){ ty=null; return; }
        tx=e.touches[0].clientX; ty=e.touches[0].clientY; claim=null; fired=false;
      },{passive:true,capture:true});
      window.addEventListener('touchmove',function(e){
        if(ty===null||!e.touches||e.touches.length!==1) return;
        var dx=e.touches[0].clientX-tx, dy=e.touches[0].clientY-ty;
        if(claim===null){
          if(!dy && !dx) return;
          var y=window.scrollY, cTop=topOf('#links'), dir=dy<0?1:-1;
          if(blocked(e.target) || Math.abs(dx)>Math.abs(dy)*1.2) claim=false;
          else if(cTop!=null && ((dir>0 && y>=cTop-6) || (dir<0 && y>cTop+6))) claim=false;
          else claim=true;
          if(!claim) native=Date.now();
        }
        if(!claim) return;
        if(e.cancelable) e.preventDefault();
        if(!fired && Math.abs(dy)>=26) fired=dy<0?1:-1;
      },{passive:false,capture:true});
      var endTouch=function(e){
        touching=false;
        var d=0, wasClaim=claim;
        if(ty!==null && claim){
          d=fired;
          if(!d && e.changedTouches && e.changedTouches[0]){
            var dy=e.changedTouches[0].clientY-ty;
            if(Math.abs(dy)>=10) d=dy<0?1:-1;
          }
        }
        ty=null; claim=null; fired=false;
        setTimeout(function(){
          if(animating&&aimY!=null){ var a=aimY; animating=false; glideTo(a); return; }
          if(wasClaim&&d) gate(d);
        },0);
      };
      window.addEventListener('touchend',endTouch,{passive:true,capture:true});
      window.addEventListener('touchcancel',endTouch,{passive:true,capture:true});
      var settle=function(){
        if(touching||animating||Date.now()-native>4000||blocked(null)) return;
        var y=window.scrollY, cTop=topOf('#links');
        if(cTop==null||y>=cTop-6) return;
        var B=beats(), best=null;
        B.forEach(function(b){ if(best===null||Math.abs(b-y)<Math.abs(best-y)) best=b; });
        native=0;
        if(best!=null&&Math.abs(best-y)>3) glideTo(best);
      };
      window.addEventListener('scroll',function(){
        if(touching||animating||!native) return;
        clearTimeout(settleT); settleT=setTimeout(settle,160);
      },{passive:true});
    } else {
      window.addEventListener('wheel', onWheel, {passive:false, capture:true});
    }
    window.addEventListener('keydown',function(e){
      var t=e.target; if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName||'')) return;
      var dir=0;
      if(e.key==='ArrowDown'||e.key==='PageDown'||(e.key===' '&&!e.shiftKey)) dir=1;
      else if(e.key==='ArrowUp'||e.key==='PageUp'||(e.key===' '&&e.shiftKey)) dir=-1;
      else if(e.key==='Home'){ e.preventDefault(); glideTo(0); return; }
      else if(e.key==='End'){ e.preventDefault(); glideTo(document.documentElement.scrollHeight); return; }
      if(!dir) return;
      e.preventDefault();
      if(Date.now()-lastStep<240) return;
      lastStep=Date.now();
      var fT=topOf('.footer-wrap'), B=beats(); if(fT!=null) B.push(fT); B.sort(function(a,b){return a-b;});
      var y=(animating&&aimY!=null)?aimY:window.scrollY, target=null, i;
      if(dir>0){ for(i=0;i<B.length;i++){ if(B[i]>y+4){ target=B[i]; break; } } }
      else     { for(i=B.length-1;i>=0;i--){ if(B[i]<y-4){ target=B[i]; break; } } }
      if(target!=null) glideTo(target);
    });
    var reT=null;
    window.addEventListener('resize',function(){ clearTimeout(reT); reT=setTimeout(function(){ if(window.ScrollTrigger) ScrollTrigger.refresh(); },250); });
  })();
  (function(){
    var ov=document.querySelector('[data-rm-pagefade]'); if(!ov) return;
    var norm=function(p){ return p.replace(/index\.html$/,'').replace(/\/+$/,'')||'/'; };
    var going=false;
    document.addEventListener('click',function(e){
      if(going) return;
      var a=e.target.closest?e.target.closest('a[href]'):null; if(!a) return;
      if(a.target==='_blank') return;
      var href=a.getAttribute('href')||''; if(/^(mailto:|tel:)/.test(href)) return;
      var u; try{ u=new URL(href,location.href); }catch(_){ return; }
      var site=function(h){ return h.replace(/^(www|store)\./,''); };
      var same=u.origin===location.origin;
      if(!same&&!(u.protocol===location.protocol&&u.port===location.port&&site(u.hostname)===site(location.hostname))) return;
      if(same&&norm(u.pathname)===norm(location.pathname)){
        if(u.hash) return;
        e.preventDefault(); e.stopImmediatePropagation();
        going=true; ov.classList.add('is-plain','is-active');
        setTimeout(function(){
          if(window.lenis) window.lenis.scrollTo(0,{immediate:true}); else window.scrollTo(0,0);
          try{ if(window._logoScrollTl){ window._logoScrollTl.progress(0); if(window._logoScrollTl.scrollTrigger){ window._logoScrollTl.scrollTrigger.update(); } } }catch(_){}
          if(window.ScrollTrigger) window.ScrollTrigger.update();
          setTimeout(function(){
            ov.classList.remove('is-active');
            setTimeout(function(){ ov.classList.remove('is-plain'); going=false; }, 450);
          }, 230);
        }, 400);
        return;
      }
      e.preventDefault(); e.stopImmediatePropagation();
      try{ sessionStorage.setItem('homeLoaderSeen','1'); }catch(_){}
      going=true;
      try{ if(window.__rmPageFadeReset) window.__rmPageFadeReset(); }catch(_){}
      var toStore=u.hostname.indexOf('store.')===0||/^(?:\/[a-z]{2})?\/store(?:\/|$)/.test(u.pathname);
      ov.classList.toggle('is-away',!toStore);
      ov.classList.add('is-plain','is-exit','is-active');
      setTimeout(function(){ location.href=href; }, 190);
    },true);
  })();
  (function(){
    var go=function(el){
      var u=el.getAttribute('data-rm-go'); if(!u) return;
      var w=window.open(u,'_blank','noopener');
      if(w) w.opener=null;
    };
    document.querySelectorAll('[data-rm-go]').forEach(function(el){
      el.addEventListener('click',function(e){ e.preventDefault(); go(el); });
      el.addEventListener('keydown',function(e){
        if(e.key!=='Enter'&&e.key!==' '&&e.key!=='Spacebar') return;
        e.preventDefault(); go(el);
      });
    });
  })();
  (function(){
    var els=[].slice.call(document.querySelectorAll('[data-dl-href]'));
    if(!els.length) return;
    var fire=function(el){
      var u=el.getAttribute('data-dl-href'); if(!u) return;
      if(el.hasAttribute('data-dl-tab')){
        var w=window.open(u,'_blank','noopener');
        if(w) w.opener=null;
      } else {
        var a=document.createElement('a');
        a.href=u; a.rel='noopener'; a.style.display='none';
        document.body.appendChild(a); a.click();
        setTimeout(function(){ if(a.parentNode) a.parentNode.removeChild(a); },0);
      }
      if(window.__rmTrack) window.__rmTrack(el);
      if(window.__rmCommunity) window.__rmCommunity(el);
    };
    els.forEach(function(el){
      el.addEventListener('click',function(e){ e.preventDefault(); fire(el); });
      el.addEventListener('keydown',function(e){
        if(e.key!=='Enter'&&e.key!==' '&&e.key!=='Spacebar') return;
        e.preventDefault(); fire(el);
      });
    });
  })();
  (function(){
    var base=window.__rmAnalytics;
    if(!base) return;
    base=base.replace(/\/+$/,'');
    var gpc=(navigator.globalPrivacyControl===true)||navigator.doNotTrack==='1';
    if(gpc) return;
    function send(path,payload){
      var body=JSON.stringify(payload);
      try{
        if(navigator.sendBeacon&&navigator.sendBeacon(base+path,
            new Blob([body],{type:'text/plain;charset=UTF-8'}))) return;
      }catch(_){}
      try{ fetch(base+path,{method:'POST',body:body,keepalive:true,mode:'cors'}); }catch(_){}
    }
    window.__rmTrack=function(el){
      var mod=el&&el.getAttribute('data-dl-mod');
      if(!mod) return;
      send('/d',{mod:mod,mirror:el.getAttribute('data-dl-mirror')||'unknown'});
    };
    var path=location.pathname,ref=document.referrer||'';
    if(location.hostname.indexOf('store.')===0){
      var lm=path.match(/^\/(es|pt|fr|de|ru|ja)(\/.*)?$/);
      path=lm?'/'+lm[1]+'/store'+(lm[2]||'/'):'/store'+path;
    }
    try{ if(ref&&/(^|\.)razedmods\.com$/.test(new URL(ref).hostname)) ref=''; }catch(_){}
    send('/v',{p:path,r:ref,
      m:window.matchMedia('(max-width:767px)').matches?1:0});
  })();
  (function(){
    var solo=document.querySelector('[data-rm-community]');
    if(!solo) return;
    var last=null;
    function open(){
      if(solo.classList.contains('is-open')) return;
      last=document.activeElement;
      solo.classList.add('is-open');
      if(window.lenis) window.lenis.stop();
      document.documentElement.style.overflow='hidden';
      var btn=solo.querySelector('.rm-comm_btn');
      if(btn) setTimeout(function(){ try{ btn.focus(); }catch(_){} },90);
    }
    function close(){
      if(!solo.classList.contains('is-open')) return;
      solo.classList.remove('is-open');
      if(window.lenis) window.lenis.start();
      document.documentElement.style.overflow='';
      if(last&&last.focus) try{ last.focus(); }catch(_){}
    }
    window.__rmCommunity=function(el){
      if(el&&el.classList.contains('rm-mirror_opt')) return;
      setTimeout(open,650);
    };
    solo.querySelectorAll('[data-rm-community-close]').forEach(function(el){
      el.addEventListener('click',close);
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape') close();
    });
  })();
  (function(){
    var bub=document.querySelector('[data-store-bubble]');
    if(!bub) return;
    if(window.matchMedia&&window.matchMedia('(max-width:767px),(pointer:coarse)').matches) return;
    var tail=document.querySelector('.rm-store_faq')||document.querySelector('#faq');
    function update(){
      var past=window.scrollY >= window.innerHeight*0.6;
      var before=true;
      if(tail){ before=tail.getBoundingClientRect().bottom > window.innerHeight*0.85; }
      bub.classList.toggle('is-on', past&&before);
    }
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update,{passive:true});
    update();
  })();
  (function(){
    var modal=document.querySelector('[data-rm-mirror]');
    if(!modal) return;
    var opener=document.querySelector('[data-dl-modal]');
    var last=null;
    function open(){
      last=document.activeElement;
      modal.classList.add('is-open');
      if(window.lenis) window.lenis.stop();
      document.documentElement.style.overflow='hidden';
      var first=modal.querySelector('.rm-mirror_opt');
      if(first) setTimeout(function(){ try{ first.focus(); }catch(_){} },90);
    }
    function close(){
      if(!modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      if(window.lenis) window.lenis.start();
      document.documentElement.style.overflow='';
      if(last&&last.focus) try{ last.focus(); }catch(_){}
    }
    if(opener){
      opener.addEventListener('click',function(e){ e.preventDefault(); open(); });
      opener.addEventListener('keydown',function(e){
        if(e.key!=='Enter'&&e.key!==' '&&e.key!=='Spacebar') return;
        e.preventDefault(); open();
      });
    }
    modal.querySelectorAll('[data-rm-mirror-close]').forEach(function(el){
      el.addEventListener('click',close);
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&modal.classList.contains('is-open')) close();
    });
  })();
  (function(){
    var host=document.querySelector('[data-mod-player],[data-rm-player]');
    var modal=document.querySelector('[data-rm-trailer]');
    if(!host||!modal) return;
    var url=host.getAttribute('data-mod-video');
    var btn=host.querySelector('[data-video-open]');
    if(!url||!btn) return;
    var frame=modal.querySelector('[data-rm-trailer-iframe]');
    function open(){
      modal.classList.add('is-open');
      if(window.lenis) window.lenis.stop();
      document.documentElement.style.overflow='hidden';
      var sep=url.indexOf('?')>-1?'&':'?';
      setTimeout(function(){ if(frame) frame.setAttribute('src',url+sep+'autoplay=1&rel=0&playsinline=1'); },180);
    }
    function close(){
      modal.classList.remove('is-open');
      if(frame) frame.setAttribute('src','');
      if(window.lenis) window.lenis.start();
      document.documentElement.style.overflow='';
    }
    btn.addEventListener('click',function(e){ e.preventDefault(); open(); });
    modal.querySelectorAll('[data-rm-trailer-close]').forEach(function(el){ el.addEventListener('click',close); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&modal.classList.contains('is-open')) close(); });
    try{
      if(new URLSearchParams(window.location.search).get('trailer')==='play') open();
    }catch(_){}
  })();
  (function(){
    var root=document.documentElement;
    var SEL='.rm-trailer_frame,.video-popup_video,.video-popup_embed';
    var frames=[].slice.call(document.querySelectorAll(SEL));
    if(!frames.length) return;
    var hide=function(){ root.classList.add('rm-iframe-cursor'); };
    var show=function(){ root.classList.remove('rm-iframe-cursor'); };
    frames.forEach(function(f){
      f.addEventListener('mouseenter',hide);
      f.addEventListener('mouseleave',show);
    });
    document.addEventListener('mousemove',function(e){
      if(!root.classList.contains('rm-iframe-cursor')) return;
      var t=e.target;
      if(!t||!t.closest||!t.closest(SEL)) show();
    },{passive:true});
    document.addEventListener('mouseleave',show);
  })();
  (function(){
    var items=[].slice.call(document.querySelectorAll('[data-gallery-slider-popup] [data-full-img], [data-gallery-slider-popup] [data-rm-cmp], .rm-pkg_stage'))
      .filter(function(el){ return !(el.hasAttribute('data-full-img')&&el.closest('[data-rm-cmp]')); });
    if(!items.length) return;
    if(window.matchMedia('(pointer: coarse)').matches) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cur=document.createElement('div');
    cur.className='rm-zoomcur';
    cur.setAttribute('aria-hidden','true');
    cur.innerHTML='<div class="rm-zoomcur_inner"><svg viewBox="0 0 24 24">'+
      '<circle cx="10.5" cy="10.5" r="7.25"></circle>'+
      '<line x1="15.9" y1="15.9" x2="21" y2="21"></line>'+
      '<line x1="10.5" y1="7.6" x2="10.5" y2="13.4"></line>'+
      '<line x1="7.6" y1="10.5" x2="13.4" y2="10.5"></line></svg></div>';
    document.body.appendChild(cur);
    document.documentElement.classList.add('rm-zoomcur-on');
    var tx=0,ty=0,x=0,y=0,on=false,raf=null,placed=false;
    function loop(){
      x+=(tx-x)*0.22; y+=(ty-y)*0.22;
      cur.style.transform='translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0)';
      if(on||Math.abs(tx-x)>0.5||Math.abs(ty-y)>0.5){ raf=requestAnimationFrame(loop); }
      else { raf=null; }
    }
    document.addEventListener('mousemove',function(e){
      tx=e.clientX; ty=e.clientY;
      if(!placed){ x=tx; y=ty; placed=true; }
      if(!on && !document.documentElement.classList.contains('rm-zoom-open')
         && e.target && e.target.closest && e.target.closest('.rm-pkg_stage')){
        on=true; cur.classList.add('is-on'); document.documentElement.classList.add('rm-zoomcur-hover');
      }
      if(!raf) raf=requestAnimationFrame(loop);
    },{passive:true});
    items.forEach(function(item){
      item.addEventListener('mouseenter',function(){ on=true; cur.classList.add('is-on'); document.documentElement.classList.add('rm-zoomcur-hover'); if(!raf) raf=requestAnimationFrame(loop); });
      item.addEventListener('mouseleave',function(){ on=false; cur.classList.remove('is-on','is-down'); document.documentElement.classList.remove('rm-zoomcur-hover'); });
      item.addEventListener('mousedown',function(e){ if(!(e.target.closest&&e.target.closest('[data-rm-cmp-handle]'))) cur.classList.add('is-down'); });
      [].slice.call(item.querySelectorAll('.mod-gallery_item_button, [data-rm-cmp-handle]')).forEach(function(dl){
        dl.addEventListener('mouseenter',function(){ on=false; cur.classList.remove('is-on'); document.documentElement.classList.remove('rm-zoomcur-hover'); });
        dl.addEventListener('mouseleave',function(){ on=true; cur.classList.add('is-on'); document.documentElement.classList.add('rm-zoomcur-hover'); if(!raf) raf=requestAnimationFrame(loop); });
      });
    });
    document.addEventListener('mouseup',function(){ cur.classList.remove('is-down'); });
    var zoomHit=function(t){ return t&&t.closest&&t.closest('.rm-zoom.is-open')&&!t.closest('.rm-zoom_nav'); };
    document.addEventListener('mouseover',function(e){
      if(!document.documentElement.classList.contains('rm-zoom-open')) return;
      if(zoomHit(e.target)){
        on=true; cur.classList.add('is-on'); document.documentElement.classList.add('rm-zoomcur-hover');
        if(!raf) raf=requestAnimationFrame(loop);
      }else{
        on=false; cur.classList.remove('is-on','is-down'); document.documentElement.classList.remove('rm-zoomcur-hover');
      }
    },{passive:true});
    document.addEventListener('mousedown',function(e){ if(zoomHit(e.target)) cur.classList.add('is-down'); });
    document.addEventListener('click',function(e){
      if(e.target&&e.target.closest&&e.target.closest('[data-gallery-slider-popup] [data-full-img], [data-gallery-slider-popup] [data-rm-cmp]')) return;
      if(e.target&&e.target.closest&&e.target.closest('.rm-pkg_stage')) return;
      if(zoomHit(e.target)) return;
      on=false; cur.classList.remove('is-on','is-down'); document.documentElement.classList.remove('rm-zoomcur-hover');
    });
  })();
  (function(){
    var popup=document.querySelector('[data-gallery-slider-popup]');
    if(!popup) return;
    document.addEventListener('keydown',function(e){
      if(e.key!=='Escape') return;
      var cs=getComputedStyle(popup);
      if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)===0) return;
      if(!popup.getBoundingClientRect().height) return;
      var btn=popup.querySelector('[data-gallery-slider-close]');
      if(btn) btn.click();
    });
  })();
  (function(){
    var popup=document.querySelector('[data-gallery-slider-popup]');
    if(!popup) return;
    popup.querySelectorAll('[data-full-img]').forEach(function(img){
      var slide=img.closest('[data-gallery-slider-slide]');
      if(!slide) return;
      var cmp=slide.querySelector('[data-rm-cmp]');
      var before=cmp?cmp.querySelector('.rm-cmp_before img'):null;
      var pending=before?2:1;
      var done=function(){
        if(pending<=0) return;
        if(--pending>0) return;
        slide.classList.add('is-loaded');
        if(cmp) cmp.classList.remove('is-hold');
      };
      var release=function(){ pending=1; done(); };
      var watch=function(el){
        if(el.complete&&el.naturalWidth){ done(); return; }
        el.addEventListener('load',done,{once:true});
        el.addEventListener('error',done,{once:true});
      };
      watch(img);
      if(before){
        cmp.classList.add('is-hold');
        var arm=function(){
          watch(before);
          setTimeout(release,8000);
        };
        if(before.getAttribute('src')) arm();
        else new MutationObserver(function(recs,ob){
          if(!before.getAttribute('src')) return;
          ob.disconnect(); arm();
        }).observe(before,{attributes:true,attributeFilter:['src']});
      }
    });
  })();
  (function(){
    var v=document.querySelector('[data-mod-hero-vid]'); if(!v) return;
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(reduce){ v.parentNode.removeChild(v); return; }
    var cut=parseFloat(v.getAttribute('data-hero-cut'));
    if(!(cut>0)) cut=Infinity;
    var dip=document.querySelector('[data-mod-hero-dip]');
    var fade=parseFloat(v.getAttribute('data-hero-fade'));
    var DIP_IN=fade>0?fade:2000, DIP_OUT=2000;
    var holdAttr=parseFloat(v.getAttribute('data-hero-hold'));
    var HOLD=holdAttr>0?holdAttr:8000;
    var REVIVE_IN=1200, REVIVE_OUT=1200;
    var settled=false, cycleTimer=null, reviveTimer=null, settleTimer=null, gen=0, inView=true;
    var cancelSettle=function(){ gen++; clearTimeout(settleTimer); settleTimer=null; };
    var finish=function(){
      v.classList.add('is-done'); v.style.transition='none'; v.style.opacity='0';
      try{ v.pause(); }catch(e){}
    };
    var schedule=function(){
      clearTimeout(cycleTimer);
      cycleTimer=setTimeout(revive,HOLD);
    };
    var restore=function(){
      cancelSettle();
      settled=false;
      try{ v.currentTime=0; }catch(e){}
      v.classList.remove('is-done');
      v.style.transition='none'; v.style.opacity='1'; void v.offsetWidth;
      try{ v.muted=true; var p=v.play(); if(p&&p['catch']) p['catch'](bail); }catch(e){ bail(); }
      watch();
    };
    var revive=function(){
      if(document.hidden||!inView){ schedule(); return; }
      if(!dip){ restore(); return; }
      clearTimeout(reviveTimer);
      dip.style.transition='opacity '+(REVIVE_IN/1000)+'s ease';
      dip.style.opacity='1';
      reviveTimer=setTimeout(function(){
        restore();
        void dip.offsetWidth;
        dip.style.transition='opacity '+(REVIVE_OUT/1000)+'s ease';
        dip.style.opacity='0';
      },REVIVE_IN);
    };
    var settle=function(){
      if(settled) return; settled=true;
      if(!dip){ finish(); schedule(); return; }
      var g=gen;
      dip.style.transition='opacity '+(DIP_IN/1000)+'s ease';
      dip.style.opacity='1';
      clearTimeout(settleTimer);
      settleTimer=setTimeout(function(){
        if(g!==gen) return;
        finish();
        void dip.offsetWidth;
        dip.style.transition='opacity '+(DIP_OUT/1000)+'s ease';
        dip.style.opacity='0';
        schedule();
      },DIP_IN);
    };
    var bail=function(){
      if(settled) return;
      if(v.error){ settled=true; finish(); return; }
      var t0=v.currentTime;
      setTimeout(function(){
        if(settled) return;
        if(!v.paused&&v.currentTime>t0) return;
        settled=true; finish();
      },400);
    };
    var watch=function(){
      if(settled) return;
      if(v.currentTime>=cut){ settle(); return; }
      if(v.requestVideoFrameCallback) v.requestVideoFrameCallback(watch);
    };
    v.addEventListener('ended',settle);
    v.addEventListener('error',bail);
    v.addEventListener('timeupdate',function(){ if(v.currentTime>=cut) settle(); });
    var started=false, poll=null;
    var start=function(force){
      if(started||!inView) return;
      if(!force && window.lenis && window.lenis.isStopped) return;
      if(!force && document.querySelector('[data-rm-pagefade].is-active')) return;
      if(!force && v.readyState<3) return;
      started=true; if(poll) clearInterval(poll);
      try{ if(v.currentTime>0.04) v.currentTime=0; }catch(e){}
      try{ v.muted=true; var p=v.play(); if(p&&p['catch']) p['catch'](bail); }catch(e){ bail(); }
      watch();
    };
    poll=setInterval(function(){ start(false); },120);
    setTimeout(function(){ start(true); },8000);
    var reset=function(){
      cancelSettle();
      settled=false; started=false; clearTimeout(cycleTimer); clearTimeout(reviveTimer);
      if(dip){ dip.style.transition='none'; dip.style.opacity='0'; void dip.offsetWidth; }
      v.classList.remove('is-done'); v.style.transition='none'; v.style.opacity='1'; void v.offsetWidth;
      try{ v.pause(); v.currentTime=0; }catch(e){}
    };
    if(window.IntersectionObserver){
      var wasOut=false;
      new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(!e.isIntersecting){ inView=false; wasOut=true; reset(); }
          else { inView=true; if(wasOut){ wasOut=false; reset(); start(true); } }
        });
      },{threshold:0}).observe(v);
    }
  })();
  (function(){
    var lang=document.querySelector('[data-rm-lang]');
    var menu=document.querySelector('.navbar_menu');
    if(!lang||!menu) return;
    var home=lang.parentNode, after=lang.nextSibling;
    var mq=window.matchMedia('(max-width:767px)');
    (function(){
      var trig=lang.querySelector('.rm-lang_trigger');
      var cur=lang.querySelector('.rm-lang_opt.is-current .rm-lang_opt_name');
      if(!trig||!cur||trig.querySelector('.rm-lang_curname')) return;
      var s=document.createElement('span');
      s.className='rm-lang_curname';
      s.textContent=cur.textContent;
      trig.appendChild(s);
    })();
    function place(){
      if(mq.matches){ if(lang.parentNode!==menu) menu.appendChild(lang); }
      else if(lang.parentNode!==home){ home.insertBefore(lang,after); }
    }
    place();
    window.addEventListener('resize',place);
  })();
  (function(){
    var btn=document.querySelector('.navbar_menu-button');
    var menu=document.querySelector('.navbar_menu');
    if(!btn||!menu) return;
    var root=document.documentElement;
    function set(open){
      if(open===root.classList.contains('rm-nav-open')) return;
      root.classList.toggle('rm-nav-open',open);
      btn.setAttribute('aria-expanded',open?'true':'false');
      if(open){
        if(window.__rmCloseMods) window.__rmCloseMods();
        if(window.__rmCloseLang) window.__rmCloseLang();
        if(window.lenis) window.lenis.stop();
        root.style.overflow='hidden';
      }else{
        if(window.__rmCloseModsSub) window.__rmCloseModsSub();
        if(window.lenis) window.lenis.start();
        root.style.overflow='';
      }
    }
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Menu');
    window.__rmCloseNav=function(){ set(false); };
    btn.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation();
      set(!root.classList.contains('rm-nav-open'));
    });
    menu.addEventListener('click',function(e){
      if(e.target.closest&&e.target.closest('a')) set(false);
    },true);
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') set(false); });
    window.addEventListener('resize',function(){ if(window.innerWidth>767) set(false); });
  })();
  (function(){
    var root=document.querySelector('[data-rm-lang]'); if(!root) return;
    var btn=root.querySelector('[data-rm-lang-toggle]');
    var menu=root.querySelector('[data-rm-lang-menu]');
    if(!btn||!menu) return;
    var open=function(state){
      if(state&&!root.classList.contains('is-open')) void getComputedStyle(menu).clipPath;
      root.classList.toggle('is-open',state);
      btn.setAttribute('aria-expanded',state?'true':'false');
      menu.setAttribute('aria-hidden',state?'false':'true');
    };
    window.__rmCloseLang=function(){ if(root.classList.contains('is-open')) open(false); };
    btn.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation();
      var next=!root.classList.contains('is-open');
      if(next){
        if(window.__rmCloseMods) window.__rmCloseMods();
        if(window.__rmCloseNav&&!root.closest('.navbar_menu')) window.__rmCloseNav();
      }
      open(next);
    });
    document.addEventListener('click',function(e){
      if(!root.contains(e.target)) open(false);
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&root.classList.contains('is-open')){ open(false); btn.focus(); }
    });
    function sectionInView(){
      var els=[].slice.call(document.querySelectorAll('#art-direction,#community,#links,#mods,#patreon'));
      if(!els.length) return '';
      var mid=window.innerHeight/2,best='',bd=Infinity;
      els.forEach(function(el){
        var r=el.getBoundingClientRect();
        if(r.bottom<=0||r.top>=window.innerHeight) return;
        var d=Math.abs(r.top+r.height/2-mid);
        if(d<bd){ bd=d; best=el.id; }
      });
      return best;
    }
    var opts=[].slice.call(root.querySelectorAll('.rm-lang_opt'));
    var bases=opts.map(function(a){ return (a.getAttribute('href')||'').split('#')[0]; });
    function syncHashes(){
      var id=sectionInView();
      opts.forEach(function(a,i){ a.setAttribute('href',bases[i]+(id?'#'+id:'')); });
    }
    syncHashes();
    var sh=null;
    function queueSync(){ clearTimeout(sh); sh=setTimeout(syncHashes,120); }
    window.addEventListener('scroll',queueSync,{passive:true});
    if(window.lenis&&window.lenis.on) window.lenis.on('scroll',queueSync);
  })();
  (function(){
    var links=[].slice.call(document.querySelectorAll('.navbar_menu a,.navbar_menu_mobile a,.navbar_menu_link-wrapper a'));
    if(!links.length) return;
    var lock=function(){
      links.forEach(function(a){ a.style.minWidth=''; });
      links.forEach(function(a){
        var w=a.getBoundingClientRect().width;
        if(w) a.style.minWidth=(Math.ceil(w)+1)+'px';
      });
    };
    var run=function(){ lock(); };
    if(document.fonts&&document.fonts.ready&&document.fonts.ready.then) document.fonts.ready.then(run);
    else setTimeout(run,600);
    var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(lock,200); });
  })();
  (function(){
    if(!document.querySelector('[data-patreon]')) return;
    document.addEventListener('click',function(e){
      var a=e.target&&e.target.closest?e.target.closest('a[href$="#community"]'):null;
      if(!a) return;
      setTimeout(function(){
        if(!window.__replayPatreon) return;
        if(window.__patLastPlay&&Date.now()-window.__patLastPlay<1400) return;
        window.__replayPatreon();
      },1000);
    },true);
  })();
  (function(){
    var eb=document.querySelector('.mod-hero_eyebrow'), ti=document.querySelector('.mod-hero_title');
    if(!eb||!ti) return;
    var cv=document.createElement('canvas').getContext('2d');
    function fix(el){
      var t=(el.textContent||'').trim(); if(!t) return;
      var cs=getComputedStyle(el);
      el.style.marginLeft='';
      cv.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
      var m=cv.measureText(t.charAt(0));
      if(!m||typeof m.actualBoundingBoxLeft!=='number') return;
      var d=m.actualBoundingBoxLeft;
      if(Math.abs(d)>0.05) el.style.marginLeft=d.toFixed(2)+'px';
    }
    function run(){ fix(eb); fix(ti); }
    if(document.fonts&&document.fonts.ready&&document.fonts.ready.then) document.fonts.ready.then(run);
    else setTimeout(run,600);
    var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(run,180); });
  })();
  (function(){
    var cmps=Array.prototype.slice.call(document.querySelectorAll('[data-rm-cmp]'));
    if(!cmps.length) return;
    var wrap=document.querySelector('[data-gallery-slider-wrapper]');
    var moved=false;

    function setSplit(cmp,clientX){
      var r=cmp.getBoundingClientRect();
      if(!r.width) return;
      var pct=((clientX-r.left)/r.width)*100;
      cmp.style.setProperty('--cmp',Math.max(0,Math.min(100,pct)).toFixed(3)+'%');
    }

    cmps.forEach(function(cmp){
      var id=null,startX=0,dragging=false;
      cmp.addEventListener('dragstart',function(e){ e.preventDefault(); });
      cmp.addEventListener('pointerdown',function(e){
        if(e.button!==undefined&&e.button!==0) return;
        id=e.pointerId; startX=e.clientX; dragging=false;
        if(e.target&&e.target.closest&&e.target.closest('[data-rm-cmp-handle]')){
          dragging=true;
          if(cmp.setPointerCapture) cmp.setPointerCapture(id);
          cmp.classList.add('is-dragging');
          document.documentElement.classList.add('rm-cmp-drag');
          setSplit(cmp,e.clientX);
          e.preventDefault();
        }
      });
      cmp.addEventListener('pointermove',function(e){
        if(id===null||e.pointerId!==id) return;
        if(!dragging){
          if(Math.abs(e.clientX-startX)<4) return;
          dragging=true;
          if(cmp.setPointerCapture) cmp.setPointerCapture(id);
          cmp.classList.add('is-dragging');
          document.documentElement.classList.add('rm-cmp-drag');
        }
        moved=true;
        setSplit(cmp,e.clientX);
      });
      function end(e){
        if(id===null||(e.pointerId!==undefined&&e.pointerId!==id)) return;
        if(cmp.releasePointerCapture&&cmp.hasPointerCapture&&cmp.hasPointerCapture(id)) cmp.releasePointerCapture(id);
        id=null; dragging=false;
        cmp.classList.remove('is-dragging');
        document.documentElement.classList.remove('rm-cmp-drag');
      }
      cmp.addEventListener('pointerup',end);
      cmp.addEventListener('pointercancel',end);
    });

    var clearDrag=function(){
      document.documentElement.classList.remove('rm-cmp-drag');
      cmps.forEach(function(c){ c.classList.remove('is-dragging'); });
    };
    window.addEventListener('pointerup',clearDrag);
    window.addEventListener('blur',clearDrag);

    if(wrap){
      wrap.addEventListener('click',function(e){
        if(!moved) return;
        if(!e.target||!e.target.closest||!e.target.closest('[data-rm-cmp]')) return;
        moved=false;
        e.stopPropagation();
      },true);
    }

    var loadBefore=function(cmp){
      var img=cmp.querySelector('.rm-cmp_before img');
      if(!img||img.getAttribute('src')) return;
      var src=img.getAttribute('data-cmp-src');
      if(src) img.setAttribute('src',src);
    };
    cmps.forEach(function(cmp){
      var full=cmp.querySelector('[data-full-img]');
      if(!full) return;
      if(full.getAttribute('src')){ loadBefore(cmp); return; }
      new MutationObserver(function(recs,ob){
        if(!full.getAttribute('src')) return;
        loadBefore(cmp); ob.disconnect();
      }).observe(full,{attributes:true,attributeFilter:['src']});
    });
  })();
});
