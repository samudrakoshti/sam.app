let currentUser = null;
let html5Qr;

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function acceptPermissions() {
  // Let's actually request camera permission so the user sees the popup
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // Stop the stream immediately, just needed permission
        stream.getTracks().forEach(track => track.stop());
        show('loginScreen');
      })
      .catch(err => {
        alert("Camera permission is recommended to scan QR codes.");
        show('loginScreen'); // Still proceed
      });
  } else {
    show('loginScreen');
  }
}

function login() {
  const email = document.getElementById('email').value;
  if (!email) return alert("Enter email");
  currentUser = email;
  show('homeScreen');
}

function logout() {
  currentUser = null;
  show('loginScreen');
}

function goHome() {
  if (html5Qr) {
    try {
      let p = html5Qr.stop();
      if (p && p.catch) p.catch(() => { });
    } catch (e) { }
    try { html5Qr.clear(); } catch (e) { }
    html5Qr = null;
  }
  show('homeScreen');
}

function openScanner() {
  show('scannerScreen');
  html5Qr = new Html5Qrcode("reader");

  const config = { fps: 10, qrbox: 250 };
  const onScan = qrText => {
    saveScan(qrText);
    alert("Scanned: " + qrText);
    goHome();
  };

  html5Qr.start({ facingMode: "environment" }, config, onScan)
    .catch(err => {
      // Fallback to user-facing camera if environment is not available (e.g. on laptops)
      html5Qr.start({ facingMode: "user" }, config, onScan)
        .catch(err2 => {
          alert("Camera start failed! Please grant permissions.");
          goHome();
        });
    });
}

function openGenerator() {
  show('generatorScreen');
}

function generateQR() {
  const text = document.getElementById('qrText').value;
  document.getElementById('qrResult').innerHTML =
    `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}">`;
}

function saveScan(data) {
  let saved = JSON.parse(localStorage.getItem('scans') || '[]');
  saved.push({ data, time: new Date().toLocaleString() });
  localStorage.setItem('scans', JSON.stringify(saved));
}

function openSaved() {
  show('savedScreen');
  const list = document.getElementById('savedList');
  list.innerHTML = "";
  let saved = JSON.parse(localStorage.getItem('scans') || '[]');
  saved.forEach(s => {
    let li = document.createElement('li');
    li.textContent = `${s.data} (${s.time})`;
    list.appendChild(li);
  });
}

function clearSaved() {
  localStorage.removeItem('scans');
  openSaved();
}

function openSettings() {
  show('settingsScreen');
}

function setTheme(theme) {
  document.body.className = theme;
}
