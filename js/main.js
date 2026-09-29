// Ivoire Vision — données montures (vraies photos détourées) + galerie + sélecteur

const FRAMES = [
  { id: 'rond-acetate', name: 'Le Rond',    cat: 'Acétate classique', price: '68 000 F CFA', img: 'assets/images/rond-acetate.png', ar: 455/155 },
  { id: 'rond-metal',   name: 'Le Rond Fin',cat: 'Métal léger',       price: '82 000 F CFA', img: 'assets/images/rond-metal.png',   ar: 500/644 },
  { id: 'cat-eye-or',   name: 'Cat-Eye',    cat: 'Ligne rétro',       price: '74 000 F CFA', img: 'assets/images/cat-eye-or.png',   ar: 354/128 },
  { id: 'browline',     name: 'Browline',   cat: 'Esprit années 50',  price: '89 000 F CFA', img: 'assets/images/browline.png',     ar: 463/309 },
  { id: 'carre-metal',  name: 'Le Carré',   cat: 'Métal fin',         price: '77 000 F CFA', img: 'assets/images/carre-metal.png',  ar: 443/563 },
];
// ar = ratio largeur/hauteur de l'image, utilisé pour bien placer la monture sur le visage

// ---------- GALERIE COLLECTIONS ----------
const galleryRow = document.getElementById('galleryRow');
FRAMES.forEach(f => {
  const el = document.createElement('div');
  el.className = 'frame-card';
  el.innerHTML = `
    <div class="art"><img src="f.img"alt="{f.img}" alt="f.img"alt="{f.name}"></div>
    <div class="meta">
      <div class="name">${f.name}</div>
      <div class="cat">${f.cat}</div>
      <div class="price">${f.price}</div>
    </div>`;
  galleryRow.appendChild(el);
});

// ---------- SÉLECTEUR ESSAI VIRTUEL ----------
const fpRow = document.getElementById('fpRow');
let activeFrame = FRAMES[0];

function renderPicker(){
  fpRow.innerHTML = '';
  FRAMES.forEach(f => {
    const b = document.createElement('div');
    b.className = 'fp-item' + (f.id === activeFrame.id ? ' active' : '');
    b.innerHTML = `<img src="f.img"alt="{f.img}" alt="f.img"alt="{f.name}">`;
    b.title = f.name;
    b.onclick = () => { activeFrame = f; renderPicker(); };
    fpRow.appendChild(b);
  });
}
renderPicker();

// cacher le sélecteur de teintes (les photos ont déjà leurs couleurs)
const colorBlock = colorRow ? colorRow.closest('.fp-label') || colorRow : null;
if (colorRow) {
  const label = colorRow.previousElementSibling;
  if (label) label.style.display = 'none';
  colorRow.style.display = 'none';
}
