const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const cfg=window.GLOW_CONFIG,db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const wa=(p,m)=>`https://wa.me/${String(p||'').replace(/\D/g,'')}?text=${encodeURIComponent(m)}`;
let cache={tests:[],bookings:[],questions:[],orders:[],comments:[]};

$('#loginBtn').onclick=async()=>{
  $('#loginError').textContent='';
  const {error}=await db.auth.signInWithPassword({email:$('#email').value,password:$('#password').value});
  if(error){$('#loginError').textContent='Revisa el correo y la contraseña.';return}
  show();
};
$('#logout').onclick=async()=>{await db.auth.signOut();location.reload()};
$$('.tabs-admin button').forEach(b=>b.onclick=()=>{
  $$('.tabs-admin button').forEach(x=>x.classList.remove('active'));
  $$('.panel').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');$('#'+b.dataset.panel).classList.add('active')
});
$('#refreshData').onclick=()=>load();
$('#adminSearch').oninput=()=>render($('#adminSearch').value.trim().toLowerCase());

async function show(){
  $('#login').classList.add('hidden');
  $('#dashboard').classList.remove('hidden');
  await load();
}
async function load(){
  const [tr,br,qr,or,cr]=await Promise.all([
    db.from('test_results').select('*').order('created_at',{ascending:false}),
    db.from('bookings').select('*').order('created_at',{ascending:false}),
    db.from('questions').select('*').order('created_at',{ascending:false}),
    db.from('orders').select('*').order('created_at',{ascending:false}),
    db.from('question_comments').select('*,questions(question)').order('created_at',{ascending:false})
  ]);
  cache={tests:tr.data||[],bookings:br.data||[],questions:qr.data||[],orders:or.data||[],comments:cr.data||[]};
  render($('#adminSearch').value.trim().toLowerCase());
}
function match(record,term){
  if(!term)return true;
  return JSON.stringify(record).toLowerCase().includes(term);
}
function render(term=''){
  const t=cache.tests.filter(x=>match(x,term));
  const b=cache.bookings.filter(x=>match(x,term));
  const q=cache.questions.filter(x=>match(x,term));
  const o=cache.orders.filter(x=>match(x,term));
  const c=cache.comments.filter(x=>match(x,term));

  $('#sTests').textContent=cache.tests.filter(x=>!x.reviewed).length;
  $('#sBookings').textContent=cache.bookings.filter(x=>!['realizada','cancelada'].includes(x.status)).length;
  $('#sQuestions').textContent=cache.questions.filter(x=>x.status==='pendiente').length;
  $('#sOrders').textContent=cache.orders.filter(x=>!['entregado','cancelado'].includes(x.shipping_status)).length;

  $('#tests').innerHTML='<h2>Glow Match recibidos</h2>'+(t.length?t.map(x=>{
    const age=x.answers?.age??'No indicada';
    const responses=x.answers?.responses??x.answers;
    return `<div class="record"><div class="head"><div><b>${esc(x.client_name)} · ${esc(x.test_type)}</b><p>Edad: ${esc(age)} · ${esc(x.phone)}</p></div><span class="status">${x.reviewed?'Revisado':'Nuevo'}</span></div><p><b>Resultado:</b> ${esc(x.recommendation)}</p><details><summary>Ver las 12 respuestas</summary><pre>${esc(JSON.stringify(responses,null,2))}</pre></details><div class="actions"><a target="_blank" href="${wa(x.phone,`Hola ${x.client_name} 💗 Soy Anthonia de Glow by Antho. Vi que realizaste nuestro Glow Match y quería orientarte sobre tu resultado: ${x.recommendation}.`)}">Hablar por WhatsApp</a>${x.reviewed?'':`<button onclick="review('${x.id}')">Marcar revisado</button>`}</div></div>`
  }).join(''):'<p>No se encontraron tests.</p>');

  $('#bookings').innerHTML='<h2>Reservas</h2>'+(b.length?b.map(x=>`<div class="record"><div class="head"><div><b>${esc(x.client_name)} — ${esc(x.service)}</b><p>${esc(x.appointment_date)} · ${esc(x.appointment_time)} · ${esc(x.phone)}</p></div><span class="status">${esc(x.status)}</span></div><p>Abono informado: $${Number(x.deposit_amount||0).toLocaleString('es-CL')}</p><p>${esc(x.notes||'Sin comentario')}</p><div class="actions"><a target="_blank" href="${wa(x.phone,`Hola ${x.client_name} 💗 Recibí tu solicitud para ${x.service}, el ${x.appointment_date} a las ${x.appointment_time}.`)}">WhatsApp</a><button onclick="bookingStatus('${x.id}','confirmada')">Confirmar</button><button onclick="bookingStatus('${x.id}','realizada')">Realizada</button><button onclick="bookingStatus('${x.id}','cancelada')">Cancelar</button></div></div>`).join(''):'<p>No se encontraron reservas.</p>');

  $('#questions').innerHTML='<h2>Preguntas</h2>'+(q.length?q.map(x=>`<div class="record"><div class="head"><div><b>${esc(x.client_name)} · ${esc(x.category)}</b><p>${esc(x.phone||'Sin WhatsApp registrado')}</p></div><span class="status">${esc(x.status)}</span></div><p>${esc(x.question)}</p><textarea id="a-${x.id}" placeholder="Escribe tu respuesta">${esc(x.answer||'')}</textarea><div class="actions"><button onclick="saveAnswer('${x.id}')">Guardar respuesta</button>${x.phone?`<a target="_blank" href="${wa(x.phone,`Hola ${x.client_name} 💗 Soy Anthonia de Glow by Antho. Respecto a tu pregunta: ${x.question}`)}">Responder por WhatsApp</a>`:''}</div></div>`).join(''):'<p>No se encontraron preguntas.</p>');

  $('#orders').innerHTML='<h2>Pedidos</h2>'+(o.length?o.map(x=>`<div class="record"><div class="head"><div><b>Pedido #${x.order_number||'—'} · ${esc(x.client_name)}</b><p>${esc(x.phone)} · ${esc(x.commune)} · ${esc(x.starken_destination)}</p></div><span class="status">${esc(x.payment_status)} / ${esc(x.shipping_status)}</span></div><pre>${esc(JSON.stringify(x.items,null,2))}</pre><p><b>Total productos:</b> $${Number(x.products_total||0).toLocaleString('es-CL')}</p><div class="actions"><a target="_blank" href="${wa(x.phone,`Hola ${x.client_name} 💗 Recibí tu pedido de Glow by Antho por $${Number(x.products_total||0).toLocaleString('es-CL')}.`)}">WhatsApp</a><button onclick="orderStatus('${x.id}','pago_confirmado','preparando')">Pago recibido</button><button onclick="orderStatus('${x.id}','pago_confirmado','enviado')">Enviado</button><button onclick="orderStatus('${x.id}','pago_confirmado','entregado')">Entregado</button></div></div>`).join('') :'<p>No se encontraron pedidos.</p>');

  $('#comments').innerHTML='<h2>Comentarios de preguntas</h2>'+(c.length?c.map(x=>`<div class="record"><div class="head"><div><b>${esc(x.name)}</b><p>Pregunta: ${esc(x.questions?.question||'')}</p></div><span class="status">${x.approved?'Aprobado':'Pendiente'}</span></div><p>${esc(x.comment)}</p><div class="actions">${x.approved?'':`<button onclick="approveComment('${x.id}')">Aprobar</button>`}<button onclick="deleteComment('${x.id}')">Eliminar</button></div></div>`).join(''):'<p>No se encontraron comentarios.</p>');
}
window.review=async id=>{await db.from('test_results').update({reviewed:true}).eq('id',id);load()};
window.bookingStatus=async(id,status)=>{await db.from('bookings').update({status}).eq('id',id);load()};
window.saveAnswer=async id=>{await db.from('questions').update({answer:$('#a-'+id).value,status:'respondida',is_public:true,answered_at:new Date().toISOString()}).eq('id',id);load()};
window.orderStatus=async(id,payment_status,shipping_status)=>{await db.from('orders').update({payment_status,shipping_status}).eq('id',id);load()};
(async()=>{const {data}=await db.auth.getSession();if(data.session)show()})();
window.approveComment=async id=>{await db.from('question_comments').update({approved:true}).eq('id',id);load()};
window.deleteComment=async id=>{await db.from('question_comments').delete().eq('id',id);load()};
