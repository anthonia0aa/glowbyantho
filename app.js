const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const cfg=window.GLOW_CONFIG;
const db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
const wa=m=>`https://wa.me/${cfg.WHATSAPP_NUMBER}?text=${encodeURIComponent(m)}`;
let cart=JSON.parse(localStorage.getItem('glow_cart')||'[]');
const saveCart=()=>localStorage.setItem('glow_cart',JSON.stringify(cart));
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2500)};
const openModal=h=>{$('#modalContent').innerHTML=h;$('#modal').classList.remove('hidden')};
$('#closeModal').onclick=()=>$('#modal').classList.add('hidden');
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};
$('#menuBtn').onclick=()=>$('#navLinks').classList.toggle('open');

$$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));$$('.tab-panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.tab).classList.add('active')});
$$('.ingredient').forEach(b=>b.onclick=()=>openModal(`<p class="eyebrow">GUÍA DE INGREDIENTES</p><h2>${b.dataset.title}</h2><p>${b.dataset.text}</p><small>La frecuencia depende de la fórmula, concentración y tolerancia individual.</small>`));
$$('.pair').forEach(b=>b.onclick=()=>{const [t,p]=b.dataset.pair.split('|');openModal(`<p class="eyebrow">PAREJA GLOW</p><h2>${t}</h2><p>${p}</p>`)});

const tests={
facial:[
['¿Cómo se siente tu piel después de lavarla?',['Muy tirante','Cómoda','Con brillo rápido','Tirante en unas zonas y grasa en otras','Con ardor o enrojecimiento']],
['¿Dónde aparece más brillo?',['En ninguna zona','Solo zona T','En todo el rostro','Depende del día']],
['¿Qué te preocupa más?',['Puntos negros','Granitos','Opacidad','Sequedad','Líneas de expresión','Sensibilidad']],
['¿Tienes descamación?',['Nunca','A veces','Frecuentemente','Sí, aunque también tengo brillo']],
['¿Tu piel se enrojece fácilmente?',['No','A veces','Sí, con productos','Sí, frecuentemente']],
['¿Cómo se ven tus poros?',['Poco visibles','Visibles en nariz','Muy visibles en varias zonas','No estoy segura']],
['¿Con qué frecuencia aparecen granitos?',['Casi nunca','A veces','Frecuentemente','Son inflamados o dolorosos']],
['¿Usas protector solar?',['Todos los días','A veces','Casi nunca','No uso']],
['¿Qué productos utilizas?',['Solo limpiador y crema','Sérums','Ácidos o exfoliantes','Retinol','Tratamiento médico','No sé']],
['¿Has tenido reacciones a cosméticos?',['No','Ardor','Picazón','Hinchazón','Granitos']],
['¿Tienes una condición diagnosticada?',['Ninguna','Acné','Rosácea','Dermatitis','Otra']],
['¿Cuándo fue tu última limpieza profesional?',['Nunca','Hace menos de 1 mes','Hace 1–3 meses','Hace más de 3 meses']]
],
capilar:[
['¿Cómo sientes tu cabello?',['Suave','Seco','Áspero','Débil o quebradizo','Graso en raíz y seco en puntas']],
['¿Qué te preocupa más?',['Frizz','Falta de brillo','Sequedad','Puntas abiertas','Quiero alisarlo','Daño químico']],
['¿Tu cabello está teñido o decolorado?',['No','Teñido','Con mechas','Decolorado']],
['¿Con qué frecuencia usas calor?',['Casi nunca','1–2 veces por semana','Varias veces por semana','Todos los días']],
['¿Qué resultado buscas?',['Más brillo','Menos frizz','Alisado','Mejorar puntas','Suavidad']],
['¿Cuándo fue tu último proceso químico?',['Nunca','Hace menos de 2 semanas','Hace 2–4 semanas','Hace más de 1 mes']],
['¿Te has realizado alisado o botox antes?',['No','Alisado','Botox','Ambos','No sé qué producto usaron']],
['¿Cómo están tus puntas?',['Sanas','Un poco secas','Muy abiertas','Delgadas o quebradas']],
['¿Qué pasa con la humedad?',['Se mantiene igual','Se infla','Aumenta mucho el frizz','Pierde el alisado']],
['¿Notas caída del cabello?',['No','Un poco','Mucha','Tengo zonas con menos cabello']],
['¿Tienes irritación o heridas en cuero cabelludo?',['No','Sí','No estoy segura']],
['¿Cuál es el largo aproximado?',['Corto','Hasta hombros','Media espalda','Cintura o más']]
]};
let quiz=null;
function startQuiz(type){quiz={type,index:-1,answers:[],profile:null};renderProfile();$('#quizBox').classList.remove('hidden');$('#quizBox').scrollIntoView({behavior:'smooth'})}
function renderProfile(){
 $('#quizBox').innerHTML=`<p class="eyebrow">${quiz.type==='facial'?'GLOW MATCH FACIAL':'GLOW MATCH CAPILAR'}</p><h3>Antes de comenzar</h3><p>Cuéntanos un poquito sobre ti.</p><form id="profileForm"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px"><input required name="name" placeholder="Nombre"><input required name="age" type="number" min="12" max="99" placeholder="Edad"><input required name="phone" placeholder="WhatsApp"></div><button class="btn primary" style="margin-top:18px">Comenzar ✨</button></form>`;
 $('#profileForm').onsubmit=e=>{e.preventDefault();quiz.profile=Object.fromEntries(new FormData(e.target));quiz.index=0;renderQuestion()};
}
function renderQuestion(){const qs=tests[quiz.type],i=quiz.index,q=qs[i];$('#quizBox').innerHTML=`<p class="eyebrow">${quiz.type==='facial'?'GLOW MATCH FACIAL':'GLOW MATCH CAPILAR'}</p><div class="progress-wrap"><div class="progress" style="width:${((i+1)/qs.length)*100}%"></div></div><h3>${i+1}. ${q[0]}</h3>${q[1].map(o=>`<label class="option"><input type="radio" name="answer" value="${o}"> ${o}</label>`).join('')}<div class="quiz-nav"><button class="btn ghost" id="prevQ" ${i===0?'disabled':''}>Anterior</button><button class="btn primary" id="nextQ">${i===qs.length-1?'Ver mi Glow Match':'Siguiente'}</button></div>`;$('#prevQ').onclick=()=>{if(quiz.index>0){quiz.index--;renderQuestion()}};$('#nextQ').onclick=()=>{const a=$('input[name="answer"]:checked');if(!a){toast('Selecciona una respuesta');return}quiz.answers[quiz.index]=a.value;if(quiz.index<qs.length-1){quiz.index++;renderQuestion()}else finishQuiz()}}
function resultFor(type,answers,age){const a=answers.join(' ');if(type==='facial'){if(/inflamados|dolorosos|Rosácea|Dermatitis|Hinchazón|Tratamiento médico/.test(a))return['Necesita evaluación previa','Evaluación facial personalizada','Consulta por WhatsApp'];if(/Líneas de expresión/.test(a)||+age>=35)return['Piel opaca o con signos de edad','Limpieza rejuvenecimiento antiage','$22.000'];if(/Puntos negros|brillo|Granitos|poros/.test(a))return['Piel mixta, grasa o congestionada','Limpieza profunda premium','$30.000'];return['Piel normal, seca o deshidratada','Limpieza facial básica','$20.000']}if(/Decolorado|Débil|quebradizo|Mucha|zonas con menos cabello|irritación|heridas/.test(a))return['Cabello que necesita evaluación previa','Evaluación capilar personalizada','Consulta por WhatsApp'];if(/alisarlo|Alisado/.test(a))return['Objetivo: alisado duradero','Alisado permanente Diamond Rose','Abono desde $45.000'];if(/Frizz|Sequedad|Áspero/.test(a))return['Cabello con frizz o resequedad','Botox Cirugía Capilar','Abono desde $15.000'];if(/Puntas abiertas|Muy abiertas/.test(a))return['Puntas dañadas','Corte de puntas + Shot de vitaminas','Desde $13.000'];return['Cabello opaco o con falta de brillo','Shot de vitaminas','Abono desde $10.000']}
async function finishQuiz(){
 $('#quizBox').innerHTML='<div style="text-align:center;padding:30px"><div style="font-size:46px">✨</div><h3>Analizando tu Glow Match...</h3><p>Preparando tu resultado personalizado.</p></div>';
 const [result,service,price]=resultFor(quiz.type,quiz.answers,quiz.profile.age);
 const {error}=await db.from('test_results').insert({client_name:quiz.profile.name,phone:quiz.profile.phone,test_type:quiz.type,answers:{age:+quiz.profile.age,responses:quiz.answers},recommendation:`${result} | ${service}`});
 setTimeout(()=>{openModal(`<p class="eyebrow">TU GLOW MATCH</p><h2>${result}</h2><div class="policy-box"><b>Servicio recomendado:</b><br>${service}<br><b>${price}</b></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><a class="btn primary" href="#reservar" onclick="document.querySelector('#modal').classList.add('hidden')">Reservar</a><a class="btn ghost" target="_blank" href="${wa(`Hola, soy ${quiz.profile.name}. Terminé el Glow Match y mi servicio recomendado fue: ${service}. Quisiera consultar 💗`)}">Hablar con Antho</a></div>${error?'<p><small>Hubo un problema al guardar el resultado, pero puedes escribirnos por WhatsApp.</small></p>':''}`);$('#quizBox').classList.add('hidden')},1200);
}
$$('.test-card').forEach(b=>b.onclick=()=>startQuiz(b.dataset.test));

$$('.reserve').forEach(b=>b.onclick=()=>{$('#serviceSelect').value=b.dataset.service;location.hash='reservar'});
$$('.qty').forEach(q=>{const s=$('span',q);$('.plus',q).onclick=()=>s.textContent=+s.textContent+1;$('.minus',q).onclick=()=>s.textContent=Math.max(1,+s.textContent-1)});
$$('.add-cart').forEach(b=>b.onclick=()=>{const card=b.closest('.product-card'),qty=+$('.qty span',card).textContent,x=cart.find(i=>i.name===b.dataset.name);x?x.qty+=qty:cart.push({name:b.dataset.name,price:+b.dataset.price,qty});saveCart();updateCart();toast('Producto agregado')});
function updateCart(){$('#cartCount').textContent=cart.reduce((n,x)=>n+x.qty,0)}updateCart();
$('#cartBtn').onclick=()=>{if(!cart.length){openModal('<h2>Tu carrito está vacío</h2>');return}const total=cart.reduce((n,x)=>n+x.price*x.qty,0);openModal(`<p class="eyebrow">TU CARRITO</p><h2>Glow Shop</h2>${cart.map(x=>`<p>${x.qty} × ${x.name} <b>$${(x.qty*x.price).toLocaleString('es-CL')}</b></p>`).join('')}<h3>Total: $${total.toLocaleString('es-CL')}</h3><form id="orderForm"><input required name="name" placeholder="Nombre completo"><input required name="phone" placeholder="WhatsApp"><input name="rut" placeholder="RUT"><input required name="region" placeholder="Región"><input required name="commune" placeholder="Comuna"><input required name="destination" placeholder="Dirección o sucursal Starken"><button class="btn primary">Comprar por WhatsApp</button></form><small>El despacho se paga al recibir.</small>`);$('#orderForm').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));await db.from('orders').insert({client_name:d.name,rut:d.rut||null,phone:d.phone,region:d.region,commune:d.commune,starken_destination:d.destination,items:cart,products_total:total});const lines=cart.map(x=>`• ${x.name} x${x.qty} — $${(x.price*x.qty).toLocaleString('es-CL')}`).join('\n');window.open(wa(`Hola, vengo desde la página de Glow by Antho 💗\n\nQuisiera comprar:\n${lines}\n\nTotal productos: $${total.toLocaleString('es-CL')}\n\nNombre: ${d.name}\nRUT: ${d.rut}\nTeléfono: ${d.phone}\nRegión: ${d.region}\nComuna: ${d.commune}\nDirección o sucursal Starken: ${d.destination}\n\nEntiendo que el despacho se paga al recibir.`),'_blank')}};

$('#bookingForm').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),opt=$('#serviceSelect').selectedOptions[0],abono=+(opt?.dataset.abono||0);const {error}=await db.from('bookings').insert({client_name:d.name,phone:d.phone,service:d.service,appointment_date:d.date,appointment_time:d.time,deposit_amount:abono,estimated_price_text:`Abono desde $${abono.toLocaleString('es-CL')}`,notes:d.notes||null,status:'pendiente'});if(error){toast('No se pudo guardar la reserva');return}window.open(wa(`Hola, vengo desde la página de Glow by Antho y quisiera reservar 💗\n\nNombre: ${d.name}\nTeléfono: ${d.phone}\nServicio: ${d.service}\nFecha: ${d.date}\nHora: ${d.time}\nComentario: ${d.notes||'Sin comentario'}\n\nAbono informado: $${abono.toLocaleString('es-CL')}\nEntiendo que este monto corresponde solamente al abono.`),'_blank');toast('Reserva registrada')};
$('#questionForm').onsubmit=async e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(e.target));
  const {error}=await db.from('questions').insert({
    client_name:d.name,
    phone:d.phone||null,
    category:d.category,
    question:d.question,
    status:'pendiente'
  });
  if(error){toast('No se pudo enviar la pregunta');return}
  e.target.reset();
  toast('Pregunta enviada a Antho ✨');
};


// Glow Hero V2.0: profundidad suave, sin afectar las funciones del sitio
const glowHero=document.querySelector('#parallaxHero');
if(glowHero){
  glowHero.addEventListener('mousemove',(event)=>{
    const rect=glowHero.getBoundingClientRect();
    const px=(event.clientX-rect.left)/rect.width-.5;
    const py=(event.clientY-rect.top)/rect.height-.5;
    glowHero.querySelectorAll('[data-depth]').forEach(product=>{
      const depth=Number(product.dataset.depth||10);
      product.style.translate=`${px*depth}px ${py*depth}px`;
    });
  });
  glowHero.addEventListener('mouseleave',()=>{
    glowHero.querySelectorAll('[data-depth]').forEach(product=>{
      product.style.translate='0 0';
    });
  });
}


// Mi Rutina Glow: guardado diario en el dispositivo
(function initGlowRoutine(){
  const checks=[...document.querySelectorAll('.routine-check')];
  if(!checks.length)return;
  const today=new Date().toISOString().slice(0,10);
  const dateLabel=document.querySelector('#routineDate');
  if(dateLabel) dateLabel.textContent=new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long'}).format(new Date());

  let saved={};
  try{saved=JSON.parse(localStorage.getItem('glowRoutineToday')||'{}')}catch(e){}
  if(saved.date!==today)saved={date:today,steps:{}};

  const update=()=>{
    checks.forEach(c=>{
      c.checked=Boolean(saved.steps[c.dataset.step]);
      c.closest('label')?.classList.toggle('completed',c.checked);
    });
    const done=checks.filter(c=>c.checked).length;
    const pct=Math.round(done/checks.length*100);
    const bar=document.querySelector('#routineProgress');
    if(bar)bar.style.width=pct+'%';
    const message=document.querySelector('#routineMessage');
    if(message)message.textContent=pct===100?'¡Rutina completa! Tu constancia también es parte del glow ✨':pct>=50?'Vas muy bien, ya completaste más de la mitad 💗':'Comienza marcando cada paso que realices.';
    if(pct===100&&!saved.completed){
      saved.completed=true;
      const last=localStorage.getItem('glowLastCompleted');
      let streak=Number(localStorage.getItem('glowStreak')||0);
      const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
      streak=last===yesterday?streak+1:(last===today?streak:1);
      localStorage.setItem('glowStreak',String(streak));
      localStorage.setItem('glowLastCompleted',today);
    }
    localStorage.setItem('glowRoutineToday',JSON.stringify(saved));
    const streakNumber=document.querySelector('#streakNumber');
    if(streakNumber)streakNumber.textContent=localStorage.getItem('glowStreak')||0;
  };
  checks.forEach(c=>c.addEventListener('change',()=>{saved.steps[c.dataset.step]=c.checked;update()}));
  update();
})();

// FINAL 3.0 — Glow Score + herramientas para volver a la página
(function enhanceGlowRoutine(){
  const checks=[...document.querySelectorAll('.routine-check')];
  const score=document.querySelector('#glowScore');
  if(checks.length&&score){
    const updateScore=()=>{
      const pct=Math.round(checks.filter(x=>x.checked).length/checks.length*100);
      score.textContent=pct+'%';
    };
    checks.forEach(c=>c.addEventListener('change',updateScore));
    updateScore();
  }

  const spfButton=document.querySelector('#spfReminder');
  if(spfButton){
    const key='glowSpfReminderDate';
    const today=new Date().toISOString().slice(0,10);
    const syncSpf=()=>{
      const done=localStorage.getItem(key)===today;
      spfButton.textContent=done?'Recordatorio completado ✓':'Marcar recordado';
      spfButton.closest('.return-card')?.classList.toggle('completed',done);
    };
    spfButton.addEventListener('click',()=>{localStorage.setItem(key,today);syncSpf()});
    syncSpf();
  }

  const maskDay=document.querySelector('#maskDay');
  const maskText=document.querySelector('#maskDayText');
  if(maskDay&&maskText){
    const saved=localStorage.getItem('glowMaskDay')||'';
    maskDay.value=saved;
    const render=()=>maskText.textContent=maskDay.value?`Tu momento de mascarilla será cada ${maskDay.value.toLowerCase()} 💗`:'Elige un día semanal para tu momento de hidratación.';
    maskDay.addEventListener('change',()=>{localStorage.setItem('glowMaskDay',maskDay.value);render()});
    render();
  }

  const cleaning=document.querySelector('#nextCleaning');
  const cleaningText=document.querySelector('#nextCleaningText');
  if(cleaning&&cleaningText){
    const saved=localStorage.getItem('glowNextCleaning')||'';
    cleaning.value=saved;
    const render=()=>{
      if(!cleaning.value){cleaningText.textContent='Registra tu próxima fecha para volver a verla aquí.';return}
      const date=new Date(cleaning.value+'T12:00:00');
      cleaningText.textContent='Tu próxima limpieza está registrada para el '+new Intl.DateTimeFormat('es-CL',{day:'numeric',month:'long',year:'numeric'}).format(date)+'.';
    };
    cleaning.addEventListener('change',()=>{localStorage.setItem('glowNextCleaning',cleaning.value);render()});
    render();
  }
})();

// VERSIÓN OFICIAL 1.0 — progreso, jardín y contenido diario
(function initOfficialRoutine(){
  const checks=[...document.querySelectorAll('.routine-check')];
  const plant=document.querySelector('#gardenPlant');
  const stage=document.querySelector('#gardenStage');
  const score=document.querySelector('#glowScore');
  const stages=['Semillita Glow','Primer brote','Rutina en crecimiento','Hojitas de constancia','Primera flor','Jardín Glow completo'];

  const syncGarden=()=>{
    if(!checks.length||!plant)return;
    const done=checks.filter(c=>c.checked).length;
    const pct=Math.round(done/checks.length*100);
    const level=Math.min(5,Math.floor((done/checks.length)*6));
    plant.className='garden-plant level-'+level;
    if(stage)stage.textContent=stages[level];
    if(score)score.textContent=pct+'%';
  };
  checks.forEach(c=>c.addEventListener('change',syncGarden));
  setTimeout(syncGarden,100);

  const tips=[
    ['Piel tirante no siempre significa piel seca','Si tu piel se siente tirante después de lavarla, también puede estar deshidratada. Usa limpieza suave e hidratación.'],
    ['Menos puede ser más','Una rutina corta y constante suele funcionar mejor que usar demasiados productos a la vez.'],
    ['Tu cuello también cuenta','Extiende la hidratación y el protector solar hacia cuello y escote.'],
    ['La barrera primero','Si todo te arde o irrita, pausa activos fuertes y prioriza productos calmantes e hidratantes.'],
    ['Dale tiempo a tu rutina','Los cambios reales necesitan constancia. Evita cambiar todos tus productos cada semana.'],
    ['Protector incluso en días nublados','La radiación UV sigue presente aunque el día se vea gris.'],
    ['No exfolies de más','Más exfoliación no significa mejores resultados. La irritación puede empeorar textura y brillo.']
  ];

  const ingredients=[
    ['Centella asiática','Ayuda a calmar la piel y es una buena aliada cuando la barrera se siente sensible.'],
    ['Niacinamida','Apoya la barrera y ayuda a equilibrar visualmente la piel.'],
    ['Ácido hialurónico','Aporta hidratación y funciona mejor si luego sellas con una crema.'],
    ['Ceramidas','Ayudan a reforzar la barrera y reducir la sensación de tirantez.'],
    ['Vitamina C','Aporta luminosidad y protección antioxidante durante el día.'],
    ['Ácido salicílico','Puede ayudar con poros congestionados y puntos negros si se usa con moderación.'],
    ['Péptidos','Se usan para apoyar una apariencia más suave y cuidada.']
  ];

  const myths=[
    ['“La piel grasa no necesita hidratante”','Mito. Una piel grasa también puede estar deshidratada y necesitar una crema ligera.'],
    ['“Mientras más espuma, mejor limpia”','Mito. Mucha espuma no garantiza una mejor limpieza y puede resecar algunas pieles.'],
    ['“El protector solar es solo para el verano”','Mito. Se recomienda usarlo todos los días.'],
    ['“Los poros se abren y se cierran”','Mito. Pueden verse más o menos notorios, pero no funcionan como puertas.'],
    ['“Ardor significa que el producto está funcionando”','Mito. El ardor intenso puede indicar irritación.'],
    ['“Dormir con maquillaje una vez no importa”','Mito. Puede favorecer irritación y obstrucción.'],
    ['“El cabello se acostumbra al shampoo”','No exactamente. Sus necesidades pueden cambiar por clima, procesos y acumulación.']
  ];

  const antho=[
    'Si recién comienzas una rutina, incorpora un producto nuevo a la vez.',
    'No copies exactamente la rutina de otra persona: tu piel puede necesitar algo distinto.',
    'La constancia con productos suaves puede dar mejores resultados que una rutina agresiva.',
    'Antes de un proceso capilar, siempre cuenta si tienes tintes, decoloración o alisados previos.',
    'No exprimas granitos inflamados; puedes aumentar la irritación y dejar marcas.',
    'Un tratamiento profesional funciona mejor cuando también cuidas tu piel en casa.',
    'Si tu piel está muy sensible, no tienes que usar todos los activos de moda.'
  ];

  const day=Math.floor(Date.now()/86400000);
  const set=(id,text)=>{const e=document.querySelector(id);if(e)e.textContent=text};
  const tip=tips[day%tips.length];
  const ingredient=ingredients[day%ingredients.length];
  const myth=myths[day%myths.length];

  set('#dailyTipTitle',tip[0]);
  set('#dailyTipText',tip[1]);
  set('#dailyIngredientTitle',ingredient[0]);
  set('#dailyIngredientText',ingredient[1]);
  set('#dailyMythTitle',myth[0]);
  set('#dailyMythText',myth[1]);
  set('#anthoAdvice','“'+antho[day%antho.length]+'”');

  const challengeChecks=[...document.querySelectorAll('.challenge-check')];
  if(challengeChecks.length){
    const today=new Date().toISOString().slice(0,10);
    let saved={date:today,items:{}};
    try{
      const parsed=JSON.parse(localStorage.getItem('glowChallenge')||'{}');
      if(parsed.date===today)saved=parsed;
    }catch(e){}

    const render=()=>{
      challengeChecks.forEach(c=>{
        c.checked=Boolean(saved.items[c.dataset.challenge]);
        c.closest('label')?.classList.toggle('completed',c.checked);
      });
      const done=challengeChecks.filter(c=>c.checked).length;
      const result=document.querySelector('#challengeResult');
      if(result){
        result.classList.toggle('complete',done===challengeChecks.length);
        result.textContent=done===challengeChecks.length
          ?'¡Glow completado! Hoy cuidaste de ti de varias formas ✨'
          :`Llevas ${done} de ${challengeChecks.length} hábitos completados.`;
      }
      localStorage.setItem('glowChallenge',JSON.stringify(saved));
    };

    challengeChecks.forEach(c=>c.addEventListener('change',()=>{
      saved.items[c.dataset.challenge]=c.checked;
      render();
    }));
    render();
  }
})();
