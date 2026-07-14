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
// Portada interactiva: movimiento suave de los productos con el mouse
const heroStage=document.querySelector('#parallaxHero');
if(heroStage){
  heroStage.addEventListener('mousemove',e=>{
    const rect=heroStage.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width-.5;
    const y=(e.clientY-rect.top)/rect.height-.5;
    heroStage.querySelectorAll('[data-depth]').forEach(el=>{
      const depth=Number(el.dataset.depth||10);
      el.style.translate=`${x*depth}px ${y*depth}px`;
    });
  });
  heroStage.addEventListener('mouseleave',()=>{
    heroStage.querySelectorAll('[data-depth]').forEach(el=>el.style.translate='0 0');
  });
}
document.querySelectorAll('.service-card,.product-card,.ingredient,.pair').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const rx=((e.clientY-r.top)/r.height-.5)*-4;
    const ry=((e.clientX-r.left)/r.width-.5)*4;
    card.style.transform=`translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
});
