(function () {
  'use strict';

  /* ============================================================
     IMAGE FADE-IN HANDLER
     ============================================================ */
  function markLoaded(img){
    if(!img.classList.contains('lazy-img')) return;
    img.classList.add('loaded');
  }
  function watchImage(img){
    if(img.complete && img.naturalHeight !== 0){
      markLoaded(img);
    } else {
      img.addEventListener('load', function(){ markLoaded(img); }, { once:true });
      img.addEventListener('error', function(){ markLoaded(img); }, { once:true });
    }
  }
  function scanImages(root){
    if(!root || root.nodeType !== 1) return;
    if(root.tagName === 'IMG'){ watchImage(root); return; }
    if(root.querySelectorAll) root.querySelectorAll('img.lazy-img').forEach(watchImage);
  }
  function initImageHandlers(){
    document.querySelectorAll('img.lazy-img').forEach(watchImage);
    var mo = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        m.addedNodes.forEach(function(n){ scanImages(n); });
      });
    });
    mo.observe(document.body, { childList:true, subtree:true });
    setTimeout(function(){
      document.querySelectorAll('img.lazy-img').forEach(markLoaded);
    }, 4000);
    window.addEventListener('load', function(){
      setTimeout(function(){
        document.querySelectorAll('img.lazy-img').forEach(function(img){
          if(img.complete) markLoaded(img);
        });
      }, 300);
    });
  }
  initImageHandlers();

  /* ============================================================
     SERVICES SLIDER (only runs if #servicesSlider exists)
     ============================================================ */
  (function initSlider(){
    var slider = document.getElementById('servicesSlider');
    if(!slider) return;

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var dots   = Array.prototype.slice.call(slider.querySelectorAll('.slider-dots button'));
    var prev   = slider.querySelector('.slider-nav.prev');
    var next   = slider.querySelector('.slider-nav.next');
    if(slides.length < 2) return;

    var idx = 0, timer = null;
    var INTERVAL = 4500;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(i){
      idx = (i + slides.length) % slides.length;
      slides.forEach(function(s, n){ s.classList.toggle('is-active', n === idx); });
      dots.forEach(function(d, n){
        var on = n === idx;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    function tick(){ if(!slider.offsetParent) return; go(idx + 1); }
    function start(){ if(reduceMotion) return; stop(); timer = setInterval(tick, INTERVAL); }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    function restart(){ stop(); start(); }

    prev.addEventListener('click', function(){ go(idx - 1); restart(); });
    next.addEventListener('click', function(){ go(idx + 1); restart(); });
    dots.forEach(function(d, n){
      d.addEventListener('click', function(){ go(n); restart(); });
    });

    document.addEventListener('visibilitychange', function(){
      if(document.hidden) stop(); else start();
    });

    var x0 = null;
    slider.addEventListener('touchstart', function(e){
      x0 = e.touches[0].clientX; stop();
    }, { passive:true });
    slider.addEventListener('touchend', function(e){
      if(x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if(Math.abs(dx) > 40) go(dx < 0 ? idx + 1 : idx - 1);
      x0 = null;
      start();
    }, { passive:true });

    go(0);
    start();
  })();

  /* ============================================================
     FAQ — only one open at a time
     ============================================================ */
  (function initFaq(){
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function(item){
      item.addEventListener('toggle', function(){
        if(!item.open) return;
        items.forEach(function(other){ if(other !== item) other.open = false; });
      });
    });
  })();

  /* ============================================================
     STAT COUNTERS
     ============================================================ */
  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(function(el){
      if (el.dataset.animated === '1') return;
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || '';
      if (isNaN(target)) return;
      el.dataset.animated = '1';
      var duration = 1200;
      var start = performance.now();
      function step(now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    });
  }
  var statsBox = document.querySelector('.stats');
  if ('IntersectionObserver' in window && statsBox) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          animateCounters();
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    io.observe(statsBox);
  }

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  var backTop = document.getElementById('backTop');
  if (backTop) {
    var scrollTicking = false;
    window.addEventListener('scroll', function(){
      if(scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(function(){
        backTop.classList.toggle('show', window.scrollY > 400);
        scrollTicking = false;
      });
    }, { passive: true });
    backTop.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ============================================================
     FORM FEEDBACK
     ============================================================ */
  var form = document.getElementById('contact-form');
  var feedback = document.getElementById('formFeedback');
  if (form && feedback) {
    form.addEventListener('submit', function () {
      feedback.textContent = 'Sending your message…';
      feedback.style.color = '#8B5A2B';
    });
  }

  /* ============================================================
     YEAR
     ============================================================ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     CHATBOT
     ============================================================ */
  var CONTACT = {
    phone1: '+256742184626',
    phone2: '+256774448990',
    email: 'ikconstructioncompany@gmail.com',
    address: 'Kalerwe-Gayaza Rd, Kampala, Uganda',
    hours: 'Monday – Friday, 8:00 AM – 6:00 PM'
  };

  var KB = [
    { id:'greeting',
      keywords:['hello','hi','hey','good morning','good afternoon','good evening','greetings','yo','hi there','hello there'],
      response:'Hello! 👋 Welcome to <strong>IK Construction Company</strong>. I can help you with our services, projects, pricing, location, contact details, or booking a free quote. What would you like to know?'
    },
    { id:'services_all',
      keywords:['services','service','what do you offer','what do you do','what can you do','offerings','solutions','capabilities'],
      response:'We offer <strong>10 core construction services</strong> in Uganda:<ul>'+
        '<li>🏗️ Building &amp; Construction</li>'+
        '<li>🎨 Finishing</li>'+
        '<li>📐 Architecture Design</li>'+
        '<li>🌉 Infrastructure</li>'+
        '<li>➕ Extensions</li>'+
        '<li>🔨 Renovation</li>'+
        '<li>🛋️ Interior Designing</li>'+
        '<li>🌳 Compound Designing</li>'+
        '<li>🚿 Plumbing</li>'+
        '<li>⚡ Electrical Installation</li></ul>'+
        'Which one would you like to know more about?'
    },
    { id:'svc_building',
      keywords:['building and construction','building','construct','construction','build a house','home construction','townhouse','office tower','retail space','hotel'],
      response:'<strong>Building &amp; Construction</strong> 🏗️<br>We build custom homes, townhouses, office towers, retail spaces, hotels &amp; hospitality projects — at minimal cost with guaranteed skilled work output. <a href="contact.html">Request a free quote →</a>'
    },
    { id:'svc_finishing',
      keywords:['finishing','finish','painting','plastering','molding','moulding','tiling','paint'],
      response:'<strong>Finishing</strong> 🎨<br>We deliver durable, luxury and comfortable finishings tailored to your desires, project value and safety. Services include painting, plastering, molding and other premium finishing skills. <a href="contact.html">Get a quote →</a>'
    },
    { id:'svc_architecture',
      keywords:['architecture','architectural','design','blueprint','blue print','sketch','plan','drawing','cost estimation','estimate'],
      response:'<strong>Architecture Design</strong> 📐<br>Accurate structure sketch development based on your vision — precise measurements, innovative designs and reliable architecture trends from classical to post-modern. <a href="contact.html">Talk to us →</a>'
    },
    { id:'svc_infrastructure',
      keywords:['infrastructure','bridge','road','roads','civil engineering','civil works','large scale'],
      response:'<strong>Infrastructure</strong> 🌉<br>Quality infrastructure development for individuals, investors and government projects — including bridges, roads and large-scale civil engineering works. <a href="contact.html">Request a quote →</a>'
    },
    { id:'svc_extensions',
      keywords:['extension','extensions','add a room','extra space','expand','additional room'],
      response:'<strong>Extensions</strong> ➕<br>Legal and non-destructive extension process. We work according to your extension needs — creating extra space for family members or any other requirement. <a href="contact.html">Get started →</a>'
    },
    { id:'svc_renovation',
      keywords:['renovation','renovate','remodel','remodelling','remodeling','modernize','upgrade'],
      response:'<strong>Renovation</strong> 🔨<br>A flexible renovation process. We provide a variety of options to tackle any challenge — cost-friendly and efficient. <a href="contact.html">Request a quote →</a>'
    },
    { id:'svc_interior',
      keywords:['interior','interior design','interior designing','inside design','room design','furnishing'],
      response:'<strong>Interior Designing</strong> 🛋️<br>Our skillful interior designers help you create valuable, comfortable and luxurious interiors — turning your desires into comfort and elegance. <a href="contact.html">Book a consultation →</a>'
    },
    { id:'svc_compound',
      keywords:['compound','compound design','compound designing','outdoor','landscape','landscaping','garden','yard'],
      response:'<strong>Compound Designing</strong> 🌳<br>We use creative compound designs to deliver protective, durable and expressive outdoor spaces — where art meets functionality. <a href="contact.html">Request a quote →</a>'
    },
    { id:'svc_plumbing',
      keywords:['plumbing','plumber','water','pipes','pipe','drainage','leak','tap','water security'],
      response:'<strong>Plumbing</strong> 🚿<br>Day-to-day plumbing challenges solved — installation, repairs and maintenance. Our experienced plumbers protect water security in your community. <a href="contact.html">Get a plumber →</a>'
    },
    { id:'svc_electrical',
      keywords:['electrical','electric','electrician','wiring','wire','lighting','power','socket','installation'],
      response:'<strong>Electrical Installation</strong> ⚡<br>Guaranteed safe electrical installations, maintenance and repairs — handled by certified electricians for all your electrical needs. <a href="contact.html">Request a quote →</a>'
    },
    { id:'contact',
      keywords:['contact','reach you','get in touch','phone','telephone','call','email','whatsapp','number','how do i contact'],
      response:'You can reach us through:<ul>'+
        '<li>📞 <strong>'+CONTACT.phone1+'</strong> or <strong>'+CONTACT.phone2+'</strong></li>'+
        '<li>✉️ <strong>'+CONTACT.email+'</strong></li>'+
        '<li>📍 <strong>'+CONTACT.address+'</strong></li>'+
        '<li>🕗 '+CONTACT.hours+'</li></ul>'+
        'Or use the <a href="contact.html">contact form</a> — we reply within 24 hours.'
    },
    { id:'location',
      keywords:['location','located','where are you','where is','address','office','headquarters','situated','find you'],
      response:'📍 Our headquarters is at <strong>'+CONTACT.address+'</strong>.<br>We are highly versatile and operate in <strong>every region of Uganda</strong>, as long as the site is accessible and basic human needs are available.'
    },
    { id:'hours',
      keywords:['hours','open','opening','closing','what time','when are you open','working hours','available'],
      response:'🕗 Our working hours are <strong>'+CONTACT.hours+'</strong>.<br>You can also send us an email anytime at '+CONTACT.email+' and we\'ll get back within 24 hours.'
    },
    { id:'quote',
      keywords:['quote','free quote','quotation','estimate','get a quote','request quote','pricing quote'],
      response:'Getting a <strong>free quote</strong> is easy! 😊<br>Just fill out our <a href="contact.html">contact form</a> with your project details, or call us directly on <strong>'+CONTACT.phone2+'</strong>. We usually respond within 24 hours with an estimate.'
    },
    { id:'pricing',
      keywords:['price','pricing','cost','how much','budget','expensive','cheap','rate','rates','fees','charge','charges'],
      response:'💰 Project pricing <strong>varies</strong> depending on the type, size, materials and location of your project. We offer competitive rates and always aim for minimal cost with maximum quality.<br><br>For an accurate estimate, please <a href="contact.html">request a free quote</a> or call <strong>'+CONTACT.phone2+'</strong>.'
    },
    { id:'founder',
      keywords:['founder','owner','who started','who founded','ceo','director','ibrahim','kyeyune','engineer'],
      response:'👷 The company was founded by <strong>Engineer Ibrahim Kyeyune</strong>, who serves as Founder &amp; CEO. Under his leadership, IK Construction has grown into one of Uganda\'s trusted construction firms since 2012.'
    },
    { id:'experience',
      keywords:['experience','how long','how many years','since when','established','founded','started','history'],
      response:'🏆 IK Construction Company has been operating since <strong>2012</strong> — that\'s over <strong>10 years of experience</strong> in residential, commercial and social infrastructure construction across Uganda.'
    },
    { id:'stats',
      keywords:['clients','how many clients','how many projects','completed projects','satisfied','track record','portfolio size'],
      response:'📊 Our track record:<ul>'+
        '<li><strong>10+ years</strong> of experience</li>'+
        '<li><strong>250+ happy clients</strong></li>'+
        '<li><strong>222 completed projects</strong></li></ul>'
    },
    { id:'mission',
      keywords:['mission','vision','values','core values','what do you stand for'],
      response:'🎯 <strong>Our Mission:</strong> To create enduring structures that elevate communities, with transparent processes and cutting-edge technology.<br><br>'+
        '👁️ <strong>Our Vision:</strong> Redefining modern construction through sustainable innovation and exceptional partnership.<br><br>'+
        '💚 <strong>Core Values:</strong> Safety, integrity, excellence and collaboration in every brick we lay.'
    },
    { id:'about',
      keywords:['about','who are you','tell me about','company','your company','what is ik construction'],
      response:'IK CONSTRUCTION COMPANY–UGANDA is a locally founded construction firm operating in commercial and residential infrastructure development. Founded in <strong>2012</strong> by <strong>Engineer Ibrahim Kyeyune</strong>, we\'ve served 250+ satisfied clients and completed 222 projects across Uganda.<br><br><a href="about.html">Read more about us →</a>'
    },
    { id:'projects',
      keywords:['projects','portfolio','work','past work','samples','examples','show me','completed','case study','gallery'],
      response:'🏗️ Some of our recent completed projects include:<ul>'+
        '<li>Rubaga Heights — Residential</li>'+
        '<li>MRC Plaza — Commercial</li>'+
        '<li>JK Education Centre — Social infrastructure</li>'+
        '<li>Kampala Villas — Luxury finishing</li></ul>'+
        'See the full gallery on our <a href="projects.html">Projects page</a>.'
    },
    { id:'coverage',
      keywords:['area','regions','do you work in','cover','which areas','outside kampala','upcountry','nationwide','uganda'],
      response:'🗺️ We operate in <strong>every region of Uganda</strong> — not just Kampala. As long as the site is accessible and basic human needs are available, we can take on your project. <a href="contact.html">Tell us your location →</a>'
    },
    { id:'materials',
      keywords:['materials','material','supply','supplies','who provides materials','cement','bricks','steel'],
      response:'🧱 Material supply is flexible and depends on negotiation between us and the client.<br><br>'+
        '• If you prefer handling materials yourself, we cooperate strongly with your suppliers.<br>'+
        '• If you hand the task to our team, we involve our trustworthy suppliers.<br><br>Either way, you stay in control.'
    },
    { id:'team',
      keywords:['labour','labor','workers','team','engineers','skilled','staff','craftsmen','qualified','trained'],
      response:'👷‍♂️ Yes! We use <strong>registered and approved professionals</strong>: architects, civil engineers, mechanical engineers, builders, and certified craftsmen. Each has a minimum national certificate and 6 months of verifiable experience.'
    },
    { id:'legal',
      keywords:['permit','permits','legal','law','laws','approval','compliance','licence','license','building permit','kcca'],
      response:'⚖️ We strictly follow and enforce <strong>legal building laws</strong>. During consultation, we help clients understand how to obtain building permits and avoid penalties — ensuring full compliance for every building class.'
    },
    { id:'timeline',
      keywords:['how long','duration','timeline','deadline','when will','how many months','how many weeks','finish'],
      response:'⏱️ Project timelines vary widely depending on size, complexity and scope. We are known for <strong>on-time delivery without compromising quality</strong>.<br><br>Share your project details via the <a href="contact.html">contact form</a> and we\'ll give you a realistic timeline in our estimate.'
    },
    { id:'payment',
      keywords:['payment','pay','deposit','installment','instalment','mobile money','bank','how do i pay'],
      response:'💳 Payment terms are discussed and agreed during consultation, based on project scope and milestones. For specifics, please <a href="contact.html">contact us</a> or call <strong>'+CONTACT.phone2+'</strong>.'
    },
    { id:'thanks',
      keywords:['thank','thanks','thank you','appreciate','great','awesome','nice'],
      response:'You\'re very welcome! 😊 Is there anything else I can help you with? You can also <a href="contact.html">request a free quote</a> anytime.'
    },
    { id:'bye',
      keywords:['bye','goodbye','see you','later','cheers','farewell'],
      response:'Goodbye! 👋 Thanks for chatting with IK Construction. Feel free to reach out anytime at <strong>'+CONTACT.phone2+'</strong> or '+CONTACT.email+'. Have a great day!'
    },
    { id:'help',
      keywords:['help','what can you do','how can you help','options','menu'],
      response:'I can help you with:<ul>'+
        '<li>🛠️ Our construction services</li>'+
        '<li>🏗️ Our completed projects</li>'+
        '<li>💰 Pricing and free quotes</li>'+
        '<li>📍 Location and contact details</li>'+
        '<li>👷 Our team, founder &amp; experience</li>'+
        '<li>❓ Answers to common FAQs</li></ul>Just ask your question!'
    }
  ];

  function normalize(str){
    return ' ' + str.toLowerCase().replace(/[^\w\s']/g,' ').replace(/\s+/g,' ').trim() + ' ';
  }
  function findBestMatch(userText){
    var text = normalize(userText);
    if(!text.trim()) return null;
    var best = null, bestScore = 0;
    for(var i = 0; i < KB.length; i++){
      var entry = KB[i], score = 0;
      for(var j = 0; j < entry.keywords.length; j++){
        var k = normalize(entry.keywords[j]).trim();
        if(!k) continue;
        if(text.indexOf(' ' + k + ' ') !== -1 || text.indexOf(' ' + k) !== -1){
          score += k.split(' ').length * 2 + 1;
        }
      }
      if(score > bestScore){ bestScore = score; best = entry; }
    }
    return bestScore > 0 ? best : null;
  }

  var toggleBtn  = document.getElementById('chat-toggle');
  if (!toggleBtn) return; // chatbot markup not on this page

  var toggleIcon = document.getElementById('chat-toggle-icon');
  var badge      = document.getElementById('chat-badge');
  var panel      = document.getElementById('chat-panel');
  var closeBtn   = document.getElementById('chat-close');
  var body       = document.getElementById('chat-body');
  var input      = document.getElementById('chat-input');
  var sendBtn    = document.getElementById('chat-send');
  var quickWrap  = document.getElementById('chat-quick');

  var greeted = false, busy = false;

  function openChat(){
    panel.classList.add('open');
    toggleBtn.classList.add('open');
    toggleBtn.setAttribute('aria-expanded','true');
    toggleIcon.className = 'fas fa-times';
    badge.style.display = 'none';
    if(!greeted){
      greeted = true;
      setTimeout(function(){
        botSay('Hello! 👋 I\'m the <strong>IK Construction assistant</strong>. Ask me anything about our services, projects, pricing or how to get a free quote. You can also tap a quick option below.');
      }, 250);
    }
    setTimeout(function(){ input.focus(); }, 400);
  }
  function closeChat(){
    panel.classList.remove('open');
    toggleBtn.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded','false');
    toggleIcon.className = 'fas fa-comments';
  }
  toggleBtn.addEventListener('click', function(){
    if(panel.classList.contains('open')) closeChat(); else openChat();
  });
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && panel.classList.contains('open')) closeChat();
  });

  function addMessage(html, who){
    var div = document.createElement('div');
    div.className = 'msg ' + who;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }
  function showTyping(){
    var t = document.createElement('div');
    t.className = 'typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    return t;
  }
  function botSay(html, delay){
    busy = true;
    var typing = showTyping();
    var wait = delay != null ? delay : Math.min(900, 380 + html.length * 2);
    setTimeout(function(){
      typing.remove();
      addMessage(html, 'bot');
      busy = false;
    }, wait);
  }
  function userSay(text){ addMessage(escapeHtml(text), 'user'); }
  function escapeHtml(s){
    return s.replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function handleSend(text){
    var msg = (text || '').trim();
    if(!msg || busy) return;
    userSay(msg);
    input.value = '';
    var match = findBestMatch(msg);
    if(match){
      botSay(match.response);
    } else {
      botSay('Hmm, I\'m not sure I understood that fully. 🤔<br><br>I can help with <strong>our services</strong>, <strong>projects</strong>, <strong>pricing</strong>, <strong>location</strong>, <strong>contact details</strong> and <strong>free quotes</strong>.<br><br>For anything more specific, please <a href="contact.html">contact our team</a> or call <strong>'+CONTACT.phone2+'</strong>.');
    }
  }

  sendBtn.addEventListener('click', function(){ handleSend(input.value); });
  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){ e.preventDefault(); handleSend(input.value); }
  });
  quickWrap.addEventListener('click', function(e){
    var btn = e.target.closest('button[data-q]');
    if(!btn) return;
    handleSend(btn.dataset.q);
  });

  var nudged = false;
  window.addEventListener('scroll', function(){
    if(nudged) return;
    if(window.scrollY > 900 && !panel.classList.contains('open')){
      nudged = true;
      badge.style.display = 'block';
    }
  }, { passive:true });

})();