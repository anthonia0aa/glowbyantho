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

// Preguntas públicas + formulario
$('#questionForm').onsubmit=async e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(e.target));
  const {error}=await db.from('questions').insert({
    client_name:d.name,
    phone:d.phone||null,
    category:d.category,
    question:d.question,
    status:'pendiente',
    is_public:false
  });
  if(error){toast('No se pudo enviar la pregunta');return}
  e.target.reset();
  toast('Pregunta enviada a Antho ✨');
};

const toggleQuestions=$('#toggleQuestions');
const questionsDrawer=$('#questionsDrawer');
if(toggleQuestions) toggleQuestions.onclick=()=>{questionsDrawer.classList.toggle('hidden');if(!questionsDrawer.classList.contains('hidden')) loadPublicQuestions()};
if($('#closeQuestions')) $('#closeQuestions').onclick=()=>questionsDrawer.classList.add('hidden');

async function loadPublicQuestions(){
  const list=$('#publicQuestionsList');
  if(!list)return;
  list.innerHTML='<p class="questions-loading">Cargando preguntas…</p>';
  const {data:questions,error}=await db.from('questions')
    .select('id,client_name,category,question,answer,answered_at,created_at')
    .eq('is_public',true)
    .eq('status','respondida')
    .order('answered_at',{ascending:false});
  if(error){list.innerHTML='<p class="questions-empty">Aún no se pudieron cargar las preguntas.</p>';return}
  if(!questions?.length){list.innerHTML='<p class="questions-empty">Todavía no hay preguntas respondidas públicamente.</p>';return}

  const ids=questions.map(q=>q.id);
  let comments=[];
  const {data:commentData}=await db.from('question_comments')
    .select('id,question_id,name,comment,created_at')
    .in('question_id',ids)
    .eq('approved',true)
    .order('created_at',{ascending:true});
  comments=commentData||[];

  list.innerHTML=questions.map(q=>{
    const qComments=comments.filter(c=>c.question_id===q.id);
    const date=new Intl.DateTimeFormat('es-CL',{day:'numeric',month:'short',year:'numeric'}).format(new Date(q.answered_at||q.created_at));
    return `<details class="public-question">
      <summary>
        <span class="public-question-title"><b>${escapeHtml(q.question)}</b><small>${escapeHtml(q.client_name)} · ${escapeHtml(q.category)} · ${date}</small></span>
        <span class="public-question-status">Respondida por Antho</span>
      </summary>
      <div class="public-question-content">
        <div class="official-answer"><strong>💗 Respuesta de Antho</strong><p>${escapeHtml(q.answer||'')}</p></div>
        <div class="comments-list">${qComments.length?qComments.map(c=>`<div class="public-comment"><b>${escapeHtml(c.name)}:</b> ${escapeHtml(c.comment)}</div>`).join(''):'<small>Aún no hay comentarios aprobados.</small>'}</div>
        <form class="comment-form" data-question-id="${q.id}">
          <input required name="name" placeholder="Tu nombre">
          <input required name="comment" placeholder="Escribe un comentario">
          <button>Comentar</button>
        </form>
      </div>
    </details>`;
  }).join('');

  $$('.comment-form',list).forEach(form=>form.onsubmit=async e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(form));
    const {error:commentError}=await db.from('question_comments').insert({
      question_id:form.dataset.questionId,
      name:d.name,
      comment:d.comment,
      approved:false
    });
    if(commentError){toast('No se pudo enviar el comentario');return}
    form.reset();
    toast('Comentario enviado para revisión ✨');
  });
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

// Hero interactivo
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
  glowHero.addEventListener('mouseleave',()=>glowHero.querySelectorAll('[data-depth]').forEach(product=>product.style.translate='0 0'));
}

// Mi Rutina: una sola fuente de verdad para progreso, constancia y planta
(function initRoutine(){
  const checks=[...document.querySelectorAll('.routine-check')];
  if(!checks.length)return;
  const today=new Date().toISOString().slice(0,10);
  const dateLabel=$('#routineDate');
  if(dateLabel)dateLabel.textContent=new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long'}).format(new Date());

  let saved={date:today,steps:{},completed:false};
  try{
    const parsed=JSON.parse(localStorage.getItem('glowRoutineToday')||'{}');
    if(parsed.date===today)saved=parsed;
  }catch(e){}

  const stages=[
    ['Semillita Glow','Tu progreso recién comienza.'],
    ['Primer brote','Ya diste tus primeros pasos.'],
    ['En crecimiento','Tu constancia comienza a notarse.'],
    ['Hojitas de constancia','Tu rutina está tomando forma.'],
    ['Primera flor','Ya casi completas tu cuidado del día.'],
    ['Rutina florecida','¡Completaste todos tus pasos de hoy!']
  ];

  const render=()=>{
    checks.forEach(c=>{
      c.checked=Boolean(saved.steps[c.dataset.step]);
      c.closest('label')?.classList.toggle('completed',c.checked);
    });
    const done=checks.filter(c=>c.checked).length;
    const pct=Math.round(done/checks.length*100);
    const level=Math.min(5,Math.floor(done/checks.length*6));
    if($('#routineProgress'))$('#routineProgress').style.width=pct+'%';
    if($('#glowScore'))$('#glowScore').textContent=pct+'%';
    if($('#routinePlant'))$('#routinePlant').className='routine-plant stage-'+level;
    if($('#plantStageName'))$('#plantStageName').textContent=stages[level][0];
    if($('#plantStageText'))$('#plantStageText').textContent=stages[level][1];
    if($('#routineMessage'))$('#routineMessage').textContent=pct===100?'¡Rutina completa! Tu constancia también es parte del glow ✨':pct>=50?'Vas muy bien, ya completaste más de la mitad 💗':'Comienza marcando cada paso que realices.';

    if(pct===100&&!saved.completed){
      saved.completed=true;
      const last=localStorage.getItem('glowLastCompleted');
      let streak=Number(localStorage.getItem('glowStreak')||0);
      const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
      streak=last===yesterday?streak+1:(last===today?streak:1);
      localStorage.setItem('glowStreak',String(streak));
      localStorage.setItem('glowLastCompleted',today);
    }
    if($('#streakNumber'))$('#streakNumber').textContent=localStorage.getItem('glowStreak')||0;
    localStorage.setItem('glowRoutineToday',JSON.stringify(saved));
  };

  checks.forEach(c=>c.addEventListener('change',()=>{saved.steps[c.dataset.step]=c.checked;render()}));
  render();

  const spfButton=$('#spfReminder');
  if(spfButton){
    const key='glowSpfReminderDate';
    const sync=()=>{
      const done=localStorage.getItem(key)===today;
      spfButton.textContent=done?'Protección marcada ✓':'Sí, ya lo hice';
      spfButton.closest('.return-card-clean')?.classList.toggle('completed',done);
    };
    spfButton.onclick=()=>{localStorage.setItem(key,today);sync()};
    sync();
  }

  const maskDay=$('#maskDay'),maskText=$('#maskDayText');
  if(maskDay&&maskText){
    maskDay.value=localStorage.getItem('glowMaskDay')||'';
    const sync=()=>maskText.textContent=maskDay.value?`Tu momento de mascarilla será cada ${maskDay.value.toLowerCase()} 💗`:'Elige tu día semanal de hidratación.';
    maskDay.onchange=()=>{localStorage.setItem('glowMaskDay',maskDay.value);sync()};
    sync();
  }

  const cleaning=$('#nextCleaning'),cleaningText=$('#nextCleaningText');
  if(cleaning&&cleaningText){
    cleaning.value=localStorage.getItem('glowNextCleaning')||'';
    const sync=()=>{
      if(!cleaning.value){cleaningText.textContent='Cuando vuelvas desde este dispositivo, tu fecha seguirá aquí.';return}
      const date=new Date(cleaning.value+'T12:00:00');
      cleaningText.textContent='Tu próxima fecha está guardada para el '+new Intl.DateTimeFormat('es-CL',{day:'numeric',month:'long',year:'numeric'}).format(date)+'.';
    };
    cleaning.onchange=()=>{localStorage.setItem('glowNextCleaning',cleaning.value);sync()};
    sync();
  }
})();

// Nota diaria de Antho
(function initDailyNote(){
  const notes=["Hoy quería recordarte que una rutina sencilla y constante puede ayudarte más que usar muchos productos sin saber si realmente los necesitas.", "Si tu piel se siente tirante después de limpiarla, prueba una limpieza más suave y no olvides sellar la hidratación con una crema.", "No necesitas tener una rutina perfecta. Lo importante es encontrar una que puedas mantener y que se sienta bien para ti.", "Si vas a incorporar un activo nuevo, úsalo poco a poco. Tu piel también necesita tiempo para adaptarse.", "Recuerda aplicar protector solar también en cuello y escote. Son zonas que muchas veces olvidamos cuidar.", "Si hoy no alcanzaste a completar toda tu rutina, no pasa nada. Volver mañana también es parte de la constancia.", "Antes de comprar un producto porque está de moda, pregúntate qué necesita realmente tu piel.", "Una piel grasa también puede estar deshidratada. La hidratación no es exclusiva de las pieles secas.", "Si notas ardor intenso, picazón o irritación persistente, detén el producto. El dolor no significa que esté funcionando mejor.", "Los cambios de la piel toman tiempo. Sé paciente y evita cambiar toda tu rutina cada pocos días.", "Si usas plancha, secador u ondulador, el protector térmico es un paso pequeño que puede marcar una gran diferencia.", "Tu cabello no necesita el mismo tratamiento todos los días. Obsérvalo y adapta tus cuidados según cómo se sienta.", "Después de un proceso químico, dale prioridad a la suavidad, la hidratación y el uso moderado de herramientas de calor.", "Si tus puntas están muy abiertas, ningún producto puede cerrarlas por completo. Un corte suave puede mejorar mucho el acabado.", "No apliques aceites capilares en exceso. Una pequeña cantidad en medios y puntas suele ser suficiente.", "Si tienes el cuero cabelludo irritado o con heridas, evita realizar procesos químicos hasta que esté recuperado.", "Un tratamiento capilar se ve mejor cuando también mantienes cuidados simples en casa.", "Si tu cabello está decolorado, cuenta siempre tus procesos anteriores antes de realizarte un alisado o tratamiento intenso.", "Hoy regálate aunque sean cinco minutos para cuidarte. El autocuidado no tiene que ser largo para ser importante.", "Tu piel y tu cabello no determinan tu valor. Cuidarlos debe ser una forma de acompañarte, no de exigirte.", "Descansar, beber agua y alimentarte bien también forman parte del cuidado personal.", "No te compares con resultados editados en redes sociales. Tu proceso tiene su propio ritmo.", "Ser constante no significa hacerlo todo perfecto; significa volver cada vez que puedas.", "Gracias por visitar Glow by Antho. Espero que este espacio te ayude a disfrutar más el cuidado de tu piel y cabello.", "Si hoy tuviste un día difícil, limpiar tu rostro y aplicar hidratante también puede ser una pequeña forma de decirte: me cuido.", "Una buena rutina no tiene que ser costosa. La limpieza suave, la hidratación y el protector solar son una base muy valiosa.", "Evita exfoliar tu piel todos los días. Darle descanso también ayuda a mantener una barrera más cómoda.", "No olvides lavar tus brochas y esponjas de maquillaje con frecuencia para evitar acumulación de residuos.", "Aplicar más cantidad de un producto no siempre mejora sus resultados. Sigue una cantidad razonable y observa cómo responde tu piel.", "Si un producto le funciona a otra persona, no significa que sea el ideal para ti. Cada piel tiene necesidades distintas.", "El agua muy caliente puede aumentar la sensación de tirantez en la piel y resecar el cabello. Prefiere temperaturas más suaves.", "Desenreda el cabello con paciencia, comenzando por las puntas y avanzando hacia arriba para reducir quiebres.", "Si vas a dormir con el cabello húmedo, recuerda que puede aumentar el frizz y la fragilidad. Intenta secarlo suavemente antes.", "El brillo bonito del cabello también se construye evitando el exceso de calor y cuidando las puntas.", "No necesitas lavar tu rostro muchas veces al día. Una limpieza excesiva puede alterar la comodidad de tu piel.", "Cuando pruebes un producto nuevo, evita estrenar varios a la vez. Así sabrás cuál te ayudó o cuál te causó irritación.", "Tu cuello, manos y labios también merecen hidratación y protección diaria.", "Si tu piel está sensible, simplificar tu rutina durante unos días puede ser una muy buena decisión.", "Una mascarilla puede complementar tu rutina, pero no reemplaza la limpieza, la hidratación ni el protector solar.", "Escucha las señales de tu piel. La tirantez, el ardor y la descamación son razones para bajar la intensidad de los activos.", "Si te realizaste una limpieza facial, sigue las indicaciones posteriores y evita manipular demasiado la piel.", "Para mantener un alisado o botox capilar, utiliza productos suaves y evita abusar de temperaturas muy altas.", "Tu rutina debe adaptarse a ti, no tú a ella. Hazla sencilla, agradable y posible.", "Hoy recuerda que cada pequeño hábito suma, aunque los resultados todavía no sean visibles.", "Gracias por confiar en Glow by Antho. Todo este espacio fue creado con mucho cariño para acompañarte.", "Si tienes una duda, pregunta con confianza. Aprender a cuidar tu piel y cabello también forma parte del proceso.", "No persigas una piel sin textura. La piel real tiene poros, líneas y cambios, y aun así puede estar sana y cuidada.", "El protector solar es un hábito de todos los días, incluso cuando el cielo está nublado.", "Si tu cabello se siente pesado, quizá necesita menos producto y una limpieza adecuada, no necesariamente más tratamientos.", "Regálate paciencia. Cuidarte también significa tratarte con amabilidad durante el proceso."];
  const farewells=["Mañana encontrarás una nueva nota esperándote. Espero volver a verte por aquí. 🤍", "Gracias por regalarme un momento de tu día. Te espero mañana con una nueva nota. 💗", "Cada día preparo una nota distinta con mucho cariño para ti. Nos vemos mañana. 🤍", "Espero que esta pequeña nota te haya acompañado hoy. Mañana habrá otra esperándote. ✨", "Gracias por formar parte de Glow by Antho. Siempre habrá una nueva nota para ti. 🤍", "Tu constancia también se construye con pequeños pasos. Te espero mañana con otra nota. 🌸", "Vuelve mañana: tendré un nuevo mensajito preparado con cariño para ti. 💗", "Gracias por pasar por este rincón de Glow by Antho. Nos encontramos nuevamente mañana. 🤍"];
  const day=Math.floor(Date.now()/86400000);
  if($('#anthoDailyNote'))$('#anthoDailyNote').textContent=notes[day%notes.length];
  if($('#anthoReturnMessage'))$('#anthoReturnMessage').textContent=farewells[day%farewells.length];
  const card=$('#anthoNoteCard');
  if(card)card.className='antho-note reveal note-theme-'+(day%6);
})();
