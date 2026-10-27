(function(){
  'use strict';
  const data=window.MECHANICS, app=document.getElementById('app');
  let answers=Array(12).fill(null), current=0, resultType=null, ownResult=false;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function score(values){
    if(!Array.isArray(values)||values.length!==data.questions.length||values.some((a,i)=>!data.questions[i].options.some(o=>o[0]===a)))throw new Error('请完成全部12题');
    const counts=Object.fromEntries('EISNTFJP'.split('').map(c=>[c,0]));
    values.forEach(a=>counts[a]++);
    return {type:data.dimensions.map(d=>counts[d.pair[0]]>counts[d.pair[1]]?d.pair[0]:d.pair[1]).join(''),counts};
  }
  // 纯函数供离线计分核验使用。
  window.MechanicsQuiz={score,data};
  const courseFor=type=>data.courses.find(c=>c.types.includes(type));
  function top(){window.scrollTo(0,0);app.focus({preventScroll:true});}
  function gallery(){return '<div class="section-head"><h2>八门力学，十六种同频</h2><p>点击卡片，翻开完整人格图鉴 ↗</p></div><div class="gallery">'+data.courses.map((c,i)=>`<button class="course-thumb" data-course="${c.id}" aria-label="查看${c.name}图鉴"><img src="${c.image}" alt="${c.name}人格图鉴" loading="lazy" width="640" height="640"><strong>${String(i+1).padStart(2,'0')} / ${c.name}</strong><small>${c.types.join(' · ')}</small></button>`).join('')+'</div>';}
  function bindGallery(){app.querySelectorAll('[data-course]').forEach(b=>b.addEventListener('click',()=>imageDialog(data.courses.find(c=>c.id===b.dataset.course))));}
  function home(){
    resultType=null;history.replaceState(null,'',location.pathname+location.search);document.title='力学 MBTI · 你是哪一门力学？';
    app.innerHTML=`<section class="hero"><div><span class="eyebrow">A LITTLE QUIZ, A NEW CONNECTION</span><h1>如果性格有引力，<br>你会与哪门<br><span class="underline">力学同频？</span></h1><p class="lead">把日常里的小习惯，放进力学的世界。<br>12个校园小情境，找到你的力学人格。</p><div class="chips"><span class="chip">12题 · 二选一</span><span class="chip">约2分钟</span><span class="chip">16种人格</span></div><button class="primary" id="start">开始寻找我的同频 <span aria-hidden="true">↗</span></button><p class="privacy">无需登录 · 答案仅在当前页面内计算</p></div><figure class="hero-art"><img src="assets/theoretical.jpg" alt="两位同学在教室中讨论，纸张上写着理论力学人格" width="960" height="960"><figcaption class="caption">MECHANICS PERSONALITY ATLAS / 力学人格图鉴</figcaption></figure></section>${gallery()}<details class="explainer"><summary>这份测试如何得出结果？</summary><p>四个维度 E/I、S/N、T/F、J/P 各3题。每题选择一项，每维按多数票确定一个字母，组成16种类型之一，再按图鉴约定映射到8门课程。课程与性格的联系是趣味创作，12题未经过心理测量验证，不提供心理诊断或选专业建议。</p><p>页面不设置登录、问卷上传、Cookie 或统计追踪；刷新后答题进度会清空。托管服务仍可能记录常规访问日志。</p></details>`;
    document.getElementById('start').onclick=start;bindGallery();top();
  }
  // 校园填写入口仅在页面内校验；字段不发送、不持久化，也不放进 URL。
  function start(){
    resultType=null;document.title='开始测试 · 力学 MBTI';
    history.replaceState(null,'',location.pathname+location.search);
    app.innerHTML=`<section class="entry-wrap" aria-labelledby="entry-title"><span class="eyebrow">校园趣味测试 / 入场券</span><div class="paper entry-paper"><span class="entry-stamp" aria-hidden="true">力学人格研究所 · CAMPUS</span><h1 id="entry-title">找到你的<br><span class="underline">力学同频</span></h1><p class="entry-lead">先填好这张小小的校园入场券，再开启12道趣味选择题。</p><form id="entry-form" novalidate autocomplete="off"><div class="entry-field"><label for="student-id">学号 <span aria-hidden="true">*</span></label><input id="student-id" name="student-id" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="请输入学号（仅数字）" autocomplete="off" aria-describedby="student-id-error" required><p class="entry-error" id="student-id-error" role="status"></p></div><div class="entry-field"><label for="class-name">班级 <span aria-hidden="true">*</span></label><input id="class-name" name="class-name" type="text" placeholder="例如：力学2401" autocomplete="off" aria-describedby="class-name-error" required><p class="entry-error" id="class-name-error" role="status"></p></div><button class="primary entry-submit" type="submit">填写完成，开始测试 →</button></form><p class="entry-privacy">仅检查填写格式，不核验学生身份。填写内容不会上传或由本站保存，进入测试后即不再使用。</p></div><p class="quiz-tip">这是一份校园趣味测试，并非学校身份认证。</p></section>`;
    const form=app.querySelector('#entry-form'),id=form.querySelector('#student-id'),className=form.querySelector('#class-name');
    function setError(input,message){
      const err=form.querySelector('#'+input.id+'-error');err.textContent=message;
      input.setAttribute('aria-invalid',String(Boolean(message)));
    }
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const studentId=id.value.trim(),classValue=className.value.trim();
      const idError=!studentId?'请填写学号。':!/^[0-9]+$/.test(studentId)?'学号仅支持数字，请检查后重试。':'';
      const classError=!classValue?'请填写班级。':! /^[\u3400-\u9fff]+[0-9]+$/.test(classValue)?'班级格式应为“汉字+数字”，例如：力学2401。':'';
      setError(id,idError);setError(className,classError);
      if(idError||classError){(idError?id:className).focus();return;}
      // 丢弃输入字段及其内容，不建立用户记录。
      form.reset();startQuiz();
    });
    [id,className].forEach(input=>input.addEventListener('input',()=>setError(input,'')));
    top();
  }
  function startQuiz(){document.title='力学 MBTI · 你是哪一门力学？';answers=Array(12).fill(null);current=0;resultType=null;history.replaceState(null,'',location.pathname+location.search);renderQuestion();}
  function renderQuestion(){
    const q=data.questions[current];
    app.innerHTML=`<section class="quiz-wrap" aria-labelledby="question-title"><div class="quiz-meta"><span>凭日常直觉选择，没有标准答案</span><span>${current+1} / 12</span></div><div class="progress" role="progressbar" aria-label="答题进度" aria-valuemin="0" aria-valuemax="12" aria-valuenow="${answers.filter(Boolean).length}"><div style="width:${answers.filter(Boolean).length/12*100}%"></div></div><div class="paper"><div class="question-number">QUESTION ${String(current+1).padStart(2,'0')} / ${q.scene}</div><h1 class="question-title" id="question-title">${q.text}</h1><div class="options" role="group" aria-label="选择更接近日常的选项">${q.options.map((o,i)=>`<button class="option" data-answer="${o[0]}" aria-pressed="${answers[current]===o[0]}"><span class="letter" aria-hidden="true">${i?'B':'A'}</span><span>${o[1]}</span></button>`).join('')}</div><div class="quiz-nav"><button class="text-button" id="prev" ${current===0?'disabled':''}>← 上一题</button><button class="primary" id="next" ${answers[current]?'':'disabled'}>${current===11?'查看我的结果':'下一题 →'}</button></div></div><p class="quiz-tip">选更像平时的自己；两项都像时，选更常见的一项。</p></section>`;
    app.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{answers[current]=b.dataset.answer;app.querySelectorAll('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.getElementById('next').disabled=false;const n=answers.filter(Boolean).length;app.querySelector('.progress').setAttribute('aria-valuenow',n);app.querySelector('.progress div').style.width=n/12*100+'%';});
    document.getElementById('prev').onclick=()=>{if(current>0){current--;renderQuestion();}};
    document.getElementById('next').onclick=()=>{if(!answers[current])return;if(current<11){current++;renderQuestion();}else{const r=score(answers);result(r.type,r.counts);}};top();
  }
  function result(type,counts){
    const course=courseFor(type);if(!course){home();return;}
    resultType=type;ownResult=Boolean(counts);const profile=data.profiles[type];
    history.replaceState(null,'',location.pathname+location.search+'#type='+type);document.title=type+' · '+course.name+' | 力学 MBTI';
    const scores=counts?`<section class="scores"><h3>这一次，你的答题倾向</h3>${data.dimensions.map(d=>`<div class="score-row"><div class="score-labels"><span>${d.left} · ${counts[d.pair[0]]}票</span><span>${d.right} · ${counts[d.pair[1]]}票</span></div><div class="score-bar" role="img" aria-label="${d.left}${counts[d.pair[0]]}票，${d.right}${counts[d.pair[1]]}票"><span style="width:${counts[d.pair[0]]/3*100}%"></span></div></div>`).join('')}<p class="score-note">每维3票，多数决定字母。票数只描述本次选择，不是人格强度或测量准确率。</p></section>`:'<p class="quiz-tip">这是朋友分享的类型展示，未包含答题记录。你的同频，等你来发现。</p>';
    app.innerHTML=`<div class="result-intro"><span class="eyebrow">${counts?'YOUR MECHANICS PERSONALITY':'A FRIEND’S MECHANICS PERSONALITY'}</span><p class="small">${counts?'你的力学同频已找到':'你收到了一张力学人格名片'}</p></div><section class="result-layout" aria-label="人格结果"><div class="result-copy"><h1 class="result-type" style="color:${course.color}">${type}</h1><p class="role">${profile[0]}</p><p class="traits">${profile[1]}</p><div class="course-label">与你同频的课程</div><h2 class="course-name">${course.name}</h2><p class="tagline">${course.tag}</p><p class="result-desc">${course.desc}</p><div class="result-actions"><button class="primary" id="share-result">分享我的同频 ↗</button><button class="secondary" id="restart">${counts?'重新测试':'我也测一测'}</button></div></div><figure class="result-art hero-art"><button id="open-result-image" aria-label="打开${course.name}完整图鉴"><img src="${course.image}" alt="${course.name}，对应 ${course.types.join('、')}，点击查看完整图鉴" width="960" height="960"></button><figcaption>点击查看完整图鉴 · 长按图片可保存</figcaption></figure></section>${scores}<p class="quiz-tip">性格是流动的，结果只是此刻的一张趣味侧写。<br>所有类型都值得欣赏，课程对应不表示能力高低。</p>${gallery()}`;
    if(!counts)document.getElementById('share-result').textContent='分享这张名片 ↗';
    document.getElementById('restart').onclick=start;document.getElementById('share-result').onclick=share;document.getElementById('open-result-image').onclick=()=>imageDialog(course);bindGallery();top();
  }
  function openDialog(d){if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');}
  function closeDialog(d){if(typeof d.close==='function')d.close();else d.removeAttribute('open');}
  function imageDialog(course){
    const old=document.getElementById('image-dialog');if(old)old.remove();const d=document.createElement('dialog');d.id='image-dialog';d.setAttribute('aria-label',course.name+'完整图鉴');d.innerHTML=`<button class="close" aria-label="关闭图鉴">×</button><img src="${course.image}" alt="${course.name}人格图鉴，${course.types.join('、')}"><p class="small">${course.name} · ${course.types.join(' / ')}<br>长按图片保存，或 <a href="${course.image}" target="_blank" rel="noopener">打开图片</a></p>`;document.body.append(d);d.querySelector('button').onclick=()=>closeDialog(d);d.onclick=e=>{if(e.target===d)closeDialog(d);};openDialog(d);
  }
  function share(){
    const d=document.getElementById('share-dialog'), c=courseFor(resultType), url=location.href;
    document.getElementById('share-message').textContent=`${ownResult?'我的力学人格':'这张力学人格名片'}是 ${resultType}，与「${c.name}」同频。你是哪一门力学？`;
    document.getElementById('share-link').value=url;document.getElementById('share-status').textContent=location.protocol==='file:'?'当前为本地预览；部署到 HTTPS 后才能发送有效网页链接。':'';openDialog(d);
  }
  document.getElementById('close-share').onclick=()=>closeDialog(document.getElementById('share-dialog'));
  document.getElementById('share-dialog').onclick=e=>{if(e.target===e.currentTarget)closeDialog(e.currentTarget);};
  document.getElementById('copy-link').onclick=async()=>{
    const input=document.getElementById('share-link'),status=document.getElementById('share-status');
    if(location.protocol==='file:'){status.textContent='请先部署网页，再复制分享链接。现在可以截图分享。';return;}
    try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(input.value);else{input.focus();input.select();input.setSelectionRange(0,input.value.length);if(!document.execCommand('copy'))throw new Error('copy');}status.textContent='链接已复制，可以粘贴给朋友。';}catch{input.focus();input.select();input.setSelectionRange(0,input.value.length);status.textContent='请长按上方链接，选择复制。';}
  };
  document.getElementById('brand').onclick=e=>{e.preventDefault();start();};
  function route(){const m=location.hash.match(/^#type=([A-Z]{4})$/);if(m&&courseFor(m[1]))result(m[1]);else start();}
  window.addEventListener('hashchange',route);document.addEventListener('error',e=>{if(e.target.tagName==='IMG'){e.target.alt='图鉴暂时无法载入，请稍后重试。';e.target.classList.add('image-error');}},true);route();
})();

