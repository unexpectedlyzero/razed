window.__rmAnalytics="";window.__rmBase=document.documentElement.getAttribute("data-base")||"";window.__rmPath=function(){var p=location.pathname||"/",b=window.__rmBase;if(b&&p.indexOf(b)===0)p=p.slice(b.length)||"/";p=p||"/";if(location.hostname.indexOf("store.")===0&&!/^\/store(\/|$)/.test(p))p="/store"+p;return p;};window.__rmIsHome=function(){var p=window.__rmPath();return p==="/"||p==="/index.html";};try{var _s=function(u){return u.hostname.indexOf("store.")===0||/^(?:\/[a-z]{2})?\/store(?:\/|$)/.test(u.pathname||"");},_r=document.referrer?new URL(document.referrer):null,_here=_s(location),_refStore=!!_r&&_r.origin===location.origin&&_s(_r),_wasStore=false;try{_wasStore=sessionStorage.getItem("rm-instore")==="1";}catch(e2){}if(_here&&(_refStore||(_wasStore&&(!_r||_r.origin===location.origin))))document.documentElement.classList.add("rm-quietload");try{sessionStorage.setItem("rm-instore",_here?"1":"0");}catch(e3){}}catch(e){}
;
!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);
;
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  if (location.hash && location.hash.length > 1) {
    window.__rmPendingHash = location.hash;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }
  window.scrollTo(0, 0);
;
(function () {
  var body = document.body;
  var src = body && body.getAttribute('data-rm-page');
  if (!src) return;

  var JS_TYPE = /^(|text\/javascript|application\/javascript|module)$/i;
  var heldReady = false;
  var failed = false;

  function showError() {
    if (failed) return;
    failed = true;
    var p = document.createElement('p');
    p.style.cssText = 'margin:0;padding:2rem;color:#fff;font:16px/1.5 system-ui,sans-serif';
    p.textContent = 'This page could not be loaded. Please refresh.';
    body.appendChild(p);
  }

  function holdJqueryReady() {
    if (heldReady || !window.jQuery || !window.jQuery.holdReady) return;
    heldReady = true;
    window.jQuery.holdReady(true);
  }

  function cloneScript(old) {
    var script = document.createElement('script');
    for (var i = 0; i < old.attributes.length; i++) {
      var attr = old.attributes[i];
      if (attr.name !== 'defer' && attr.name !== 'async') script.setAttribute(attr.name, attr.value);
    }
    return script;
  }

  var localFailed = false;

  function watchFailure(old) {
    return function () {
      var src = old.getAttribute('src') || '';
      var local;
      try { local = new URL(src, location.href).origin === location.origin; } catch (e) { local = false; }
      if (!local) return;
      localFailed = true;
      retryOnce();
    };
  }

  function runInOrder(list, done, afterRun) {
    var left = list.length;
    if (!left) {
      done();
      return;
    }
    list.forEach(function (old) {
      var script = cloneScript(old);
      script.addEventListener('error', watchFailure(old), { once: true });
      var settle = function () {
        holdJqueryReady();
        if (afterRun) afterRun(old);
        left -= 1;
        if (left === 0) done();
      };
      script.async = false;
      script.addEventListener('load', settle, { once: true });
      script.addEventListener('error', settle, { once: true });
      old.parentNode.replaceChild(script, old);
    });
  }

  function runOneByOne(list, index, done, afterRun) {
    if (index >= list.length) {
      done();
      return;
    }
    var old = list[index];
    var script = cloneScript(old);
    var next = function () {
      holdJqueryReady();
      if (afterRun) afterRun(old);
      runOneByOne(list, index + 1, done, afterRun);
    };
    if (old.hasAttribute('src')) {
      script.async = false;
      script.addEventListener('error', watchFailure(old), { once: true });
      script.addEventListener('load', next, { once: true });
      script.addEventListener('error', next, { once: true });
      old.parentNode.replaceChild(script, old);
    } else {
      script.text = old.textContent;
      old.parentNode.replaceChild(script, old);
      next();
    }
  }

  function fireLoadWhenReady() {
    var fired = false;
    var fire = function () {
      if (fired) return;
      fired = true;
      window.dispatchEvent(new Event('load'));
      try {
        window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }));
      } catch (e) {}
    };
    var pending = [].slice.call(document.images).filter(function (img) {
      return !img.complete && img.loading !== 'lazy';
    });
    if (!pending.length) {
      setTimeout(fire, 0);
      return;
    }
    var left = pending.length;
    pending.forEach(function (img) {
      var one = function () {
        left -= 1;
        if (left <= 0) fire();
      };
      img.addEventListener('load', one, { once: true });
      img.addEventListener('error', one, { once: true });
    });
    setTimeout(fire, 8000);
  }

  function signalReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        if (heldReady) setTimeout(function () { window.jQuery.holdReady(false); }, 0);
      }, { once: true });
      return;
    }
    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
    if (heldReady) window.jQuery.holdReady(false);
    if (document.readyState === 'complete') fireLoadWhenReady();
  }

  function render(fragment) {
    var holder = document.createElement('template');
    holder.innerHTML = fragment;
    var scripts = [].slice.call(holder.content.querySelectorAll('script')).filter(function (s) {
      return JS_TYPE.test((s.getAttribute('type') || '').trim());
    });
    var noscript = body.querySelector('noscript');
    if (noscript) noscript.parentNode.removeChild(noscript);
    body.insertBefore(holder.content, body.firstChild);
    var ordered = scripts.filter(function (s) { return !s.hasAttribute('defer'); })
      .concat(scripts.filter(function (s) { return s.hasAttribute('defer'); }));
    var gates = [];
    [].slice.call(body.querySelectorAll('#rm-boot')).forEach(function (el) {
      var owner = null;
      for (var i = 0; i < ordered.length; i++) {
        if (el.compareDocumentPosition(ordered[i]) & Node.DOCUMENT_POSITION_FOLLOWING) {
          owner = ordered[i];
          break;
        }
      }
      if (!owner) return;
      el.style.visibility = 'hidden';
      gates.push({ el: el, owner: owner });
    });
    var afterRun = function (old) {
      gates.forEach(function (g) {
        if (g.owner === old) g.el.style.visibility = '';
      });
    };
    var finish = function () {
      if (localFailed) unblock();
      else clearRetry();
      signalReady();
    };
    var allExternal = ordered.every(function (s) { return s.hasAttribute('src'); });
    if (allExternal) runInOrder(ordered, finish, afterRun);
    else runOneByOne(ordered, 0, finish, afterRun);
  }

  var retryKey = 'rm-retry:' + location.pathname;

  function retryOnce() {
    try {
      if (sessionStorage.getItem(retryKey)) return false;
      sessionStorage.setItem(retryKey, '1');
    } catch (e) {
      return false;
    }
    location.reload();
    return true;
  }

  function clearRetry() {
    try { sessionStorage.removeItem(retryKey); } catch (e) {}
  }

  function recover() {
    if (retryOnce()) return;
    clearRetry();
    showError();
  }

  function unblock() {
    clearRetry();
    [].slice.call(document.querySelectorAll('[data-rm-pagefade]')).forEach(function (el) {
      el.classList.remove('is-active');
    });
    var boot = document.getElementById('rm-boot');
    if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
  }

  fetch(src, { credentials: 'same-origin' })
    .then(function (res) {
      if (!res.ok) throw new Error(String(res.status));
      return res.text();
    })
    .then(render)
    .catch(recover);
})();
