const wheelCanvas = document.getElementById('wheelCanvas');
const ctx = wheelCanvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popupMessage');
const closePopup = document.getElementById('closePopup');
const resultTable = document.getElementById('resultTable').querySelector('tbody');

let names = JSON.parse(localStorage.getItem('names')) || [];
let gifts = JSON.parse(localStorage.getItem('gifts')) || [];
let results = JSON.parse(localStorage.getItem('results')) || [];

function saveLists() {
  const namesInput = document.getElementById('namesInput').value.trim();
  const giftsInput = document.getElementById('giftsInput').value.trim();
  names = namesInput.split(',').map(n => n.trim()).filter(n => n);
  gifts = giftsInput.split(',').map(g => g.trim()).filter(g => g);
  localStorage.setItem('names', JSON.stringify(names));
  localStorage.setItem('gifts', JSON.stringify(gifts));
  alert('Đã lưu danh sách!');
}

function loadLists() {
  document.getElementById('namesInput').value = names.join(', ');
  document.getElementById('giftsInput').value = gifts.join(', ');
}

function clearAll() {
  if (confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu không?')) {
    localStorage.clear();
    names = [];
    gifts = [];
    results = [];
    location.reload();
  }
}

function drawWheel() {
  const numSlices = gifts.length || 1;
  const angle = 2 * Math.PI / numSlices;
  for (let i = 0; i < numSlices; i++) {
    const start = i * angle;
    const end = start + angle;
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 150, start, end);
    ctx.fillStyle = randomColor();
    ctx.fill();
    ctx.stroke();
    if (gifts.length > 0) {
      ctx.save();
      ctx.translate(150, 150);
      ctx.rotate(start + angle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#000';
      ctx.font = '14px sans-serif';
      ctx.fillText(gifts[i], 140, 5);
      ctx.restore();
    }
  }
}

function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 70%)`;
}

let rotation = 0;
let spinning = false;

function spin() {
  if (spinning || names.length === 0 || gifts.length === 0) return;
  spinning = true;
  const randomName = names[Math.floor(Math.random() * names.length)];
  const special = Math.random() < 0.01 && gifts.includes('Giải đặc biệt');
  let selectedGift = special ? 'Giải đặc biệt' : gifts[Math.floor(Math.random() * gifts.length)];
  const spinAngle = 360 * 5 + Math.random() * 360;
  const duration = 4000;
  const start = Date.now();

  function animate() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    rotation = spinAngle * (1 - Math.pow(1 - progress, 3));
    ctx.clearRect(0, 0, 300, 300);
    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-150, -150);
    drawWheel();
    ctx.restore();
    if (progress < 1) requestAnimationFrame(animate);
    else {
      spinning = false;
      showResult(randomName, selectedGift, special);
    }
  }
  animate();
}

function showResult(name, gift, isSpecial) {
  popupMessage.textContent = `${name} nhận được ${gift}!`;
  popup.classList.add('show');
  const record = { name, gift, time: new Date().toLocaleString() };
  results.push(record);
  localStorage.setItem('results', JSON.stringify(results));
  renderResults();
  if (isSpecial) fireworks();
}

function renderResults() {
  resultTable.innerHTML = '';
  results.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.name}</td><td>${r.gift}</td><td>${r.time}</td>
    <td><button onclick="deleteResult(${i})">Xóa</button></td>`;
    resultTable.appendChild(tr);
  });
}

function deleteResult(i) {
  results.splice(i, 1);
  localStorage.setItem('results', JSON.stringify(results));
  renderResults();
}

function fireworks() {
  const end = Date.now() + 2 * 1000;
  const colors = ['#bb0000', '#ffffff', '#ffcc00'];
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

document.getElementById('saveLists').onclick = saveLists;
document.getElementById('clearAll').onclick = clearAll;
spinBtn.onclick = spin;
closePopup.onclick = () => popup.classList.remove('show');

loadLists();
drawWheel();
renderResults();
