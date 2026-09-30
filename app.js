const catalog=window.TIVOLI_CATALOG||{categories:[],products:[]};

const money=n=>Number(n||0).toFixed(2), 
read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}}, 
write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const query=new URLSearchParams(location.search), currentCategory=query.get('category')||query.get('category_id')||query.get('id');
const availableProductPhotos={100:'product_100_1787768217.jpg',101:'product_101_1787768108.jpg',102:'product_102_1787767834.jpg',103:'product_103_1787767635.jpg',104:'product_104_1787767591.jpg',105:'product_105_1787767540.jpg',106:'product_106_1787767453.jpg',107:'product_107_1787773743.jpg',108:'product_108_1787773714.jpg',109:'product_109_1787773683.jpg',110:'product_110_1787773617.jpg'};
function hasOwnProductImage(p){return !!(window.TIVOLI_IMAGES?.products?.[p.id]||p.image||availableProductPhotos[p.id])}
function productImage(p){return window.TIVOLI_IMAGES?.products?.[p.id]||p.image||(availableProductPhotos[p.id]?`assets/products/${availableProductPhotos[p.id]}`:'assets/logo-tivoli.webp')}
function categoryImage(c){return window.TIVOLI_IMAGES?.categories?.[c.id]||c.image||''}


function sectionTitle(s){return ({food:'المأكولات',
    drinks:'المشروبات',
    desserts:'الحلويات',
    shisha:'الشيشة'
})[s]||'أقسام أخرى'
}

function render(){
 const host=document.getElementById('catalog');if(!host)return;const nav=document.getElementById('category-nav');
 const order=['food','drinks','shisha','desserts'];

 const labels={food:
    ['🍔 المأكولات','Fresh food & delicious meals'],
    drinks:['☕ المشروبات','Hot & cold beverages'],
    shisha:['💨 الشيشة','Premium shisha flavors'],
    desserts:['🍰 الحلويات','Sweet desserts & treats']
};

 if(!currentCategory){
  if(nav)nav.innerHTML=order.map(s=>`<a href="#section-${s}">${labels[s][0]}</a>`).join('');
  host.innerHTML=order.map(section=>{const cats=catalog.categories.filter(c=>c.section===section);if(!cats.length)return '';const [title,subtitle]=labels[section];return `<section id="section-${section}" class="category-section category-showcase" 
  data-category-section="${section}"><div class="category-header"><h2>
  ${title}</h2><p>${subtitle}</p></div><div class="category-rail">
  ${cats.map(c=>`<a class="category-tile" href="category.html?category=${c.id}"><span
     class="active-badge">ACTIVE</span>
     <div class="category-tile-image">
     ${categoryImage(c)?`<img src="${categoryImage(c)}" 
     alt="${esc(c.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<span>✦</span>'">`:'<span>✦</span>'}</div><h3>${esc(c.name)}</h3><div class="category-tile-footer"><span>MENU</span><b>→</b></div></a>`).join('')}</div></section>`}).join('');
  return;
 }
 if(nav)nav.innerHTML=`<a href="index.html#menu">كل الأقسام</a>`;
 const cat=catalog.categories.find(c=>String(c.id)===currentCategory);document.title=(cat?cat.name:'القائمة')+' | TIVOLI';
 if(!cat){host.innerHTML='<div class="empty-state">القسم غير موجود.</div>';return}


 const products=catalog.products.filter(p=>p.categoryId===cat.id);host.innerHTML=`<section class="category-section product-showcase" data-category-section="${cat.section}"><div class="category-header"><h2>${esc(cat.name)}</h2><p>${products.length} منتج</p></div><div class="product-rail-controls" aria-label="تصفح المنتجات"><button type="button" data-rail-dir="previous" aria-label="المنتجات السابقة">→</button><span>اسحب أو استخدم الأسهم لمشاهدة المنتجات</span><button type="button" data-rail-dir="next" aria-label="المنتجات التالية">←</button></div><div class="category-rail product-rail">${products.map(p=>card(p)).join('')}</div></section>`;
 const rail=host.querySelector('.product-rail');
 host.querySelectorAll('[data-rail-dir]').forEach(btn=>btn.onclick=()=>scrollProductRail(rail,btn.dataset.railDir));
 enableHorizontalWheel(rail);
 host.querySelectorAll('[data-add]').forEach(btn=>btn.onclick=()=>{const p=catalog.products.find(x=>x.id===Number(btn.dataset.add));if(p)addToCart(p)});host.querySelectorAll('[data-fav]').forEach(btn=>btn.onclick=()=>toggleFav(Number(btn.dataset.fav)));updateFavButtons()
}



function card(p){let img=productImage(p);return `<article class="product-card"><span class="active-badge">ACTIVE</span><button class="favorite-btn" aria-label="أضف للمفضلة" data-fav="${p.id}">♡</button><div class="product-image ${hasOwnProductImage(p)?'':'logo-fallback'}"><img src="${img}" alt="${esc(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/logo-tivoli.webp';this.parentElement.classList.add('logo-fallback')"></div><div class="product-content"><h3>${esc(p.name)}</h3>${p.nameEn?`<h4>${esc(p.nameEn)}</h4>`:''}</div><div class="product-card-footer"><span class="product-card-price">${money(p.price)} EGP</span><button class="product-card-action" data-add="${p.id}" aria-label="أضف إلى السلة">→</button></div></article>`}
function scrollProductRail(rail,direction){if(!rail)return;const sign=getComputedStyle(rail).direction==='rtl'?-1:1;rail.scrollBy({left:sign*(direction==='next'?1:-1)*Math.max(280,rail.clientWidth*.8),behavior:'smooth'})}
function enableHorizontalWheel(rail){if(!rail||rail.dataset.wheelEnabled)return;rail.dataset.wheelEnabled='true';rail.addEventListener('wheel',event=>{if(Math.abs(event.deltaY)<=Math.abs(event.deltaX)||rail.scrollWidth<=rail.clientWidth+1)return;event.preventDefault();const sign=getComputedStyle(rail).direction==='rtl'?-1:1;rail.scrollBy({left:sign*event.deltaY,behavior:'auto'})},{passive:false})}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
let cart=read('tivoli_static_cart',[]), favs=read('tivoli_static_favs',[]);


function addToCart(p){let x=cart.find(x=>x.id===p.id);x?x.qty++:cart.push({id:p.id,name:p.name,price:p.price,qty:1,image:productImage(p)});saveCart();toast('تمت إضافة '+p.name+' إلى السلة')}
function saveCart(){write('tivoli_static_cart',cart);const list=document.getElementById('cartItems');if(list)list.innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-row"><span>${esc(x.name)}<small>${money(x.price)} EGP</small></span><div><button onclick="qty(${i},-1)">−</button> ${x.qty} <button onclick="qty(${i},1)">+</button></div></div>`).join(''):'<p class="empty-state">السلة فارغة — أضيفوا ما تحبونه من القائمة.</p>';let total=cart.reduce((s,x)=>s+x.price*x.qty,0);document.querySelectorAll('#total').forEach(e=>e.textContent=money(total));document.querySelectorAll('#cartCount').forEach(e=>e.textContent=cart.reduce((s,x)=>s+x.qty,0))}
function qty(i,n){cart[i].qty+=n;if(cart[i].qty<1)cart.splice(i,1);saveCart()} function openCart(){document.getElementById('cartBox').classList.add('show');document.getElementById('cartOverlay').classList.add('show')}function closeCart(){document.getElementById('cartBox').classList.remove('show');document.getElementById('cartOverlay').classList.remove('show')}
function sendOrder(){if(!cart.length)return toast('السلة فارغة');toast('هذه نسخة عرض ثابتة؛ الطلبات لا تُرسل إلى المطعم.')}


function toggleFav(id){favs.includes(id)?favs=favs.filter(x=>x!==id):favs.push(id);write('tivoli_static_favs',favs);updateFavButtons();toggleFavList()}
function updateFavButtons(){document.querySelectorAll('[data-fav]').forEach(b=>b.textContent=favs.includes(Number(b.dataset.fav))?'♥':'♡')}
function toggleFavList(){const l=document.getElementById('favorites-list');if(!l)return;l.innerHTML=favs.length?favs.map(id=>{const p=catalog.products.find(x=>x.id===id);return p?`<div class="favorite-item"><div class="favorite-content"><h4>${esc(p.name)}</h4><p>${money(p.price)} EGP</p></div></div>`:''}).join(''):'<p class="empty-state">لا توجد عناصر مفضلة بعد.</p>'}
function toast(s){const t=document.getElementById('toast');t.textContent=s;t.classList.add('visible');setTimeout(()=>t.classList.remove('visible'),2500)}
document.addEventListener('DOMContentLoaded',()=>{render();saveCart();document.getElementById('open-favorites')?.addEventListener('click',()=>{document.getElementById('favorites-sidebar').classList.add('show');toggleFavList()});document.getElementById('close-favorites')?.addEventListener('click',()=>document.getElementById('favorites-sidebar').classList.remove('show'))});
