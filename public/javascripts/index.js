// Sayfa her yenilendiğinde input alanındaki veriyi ve dosya seçimini sıfırlama
window.onload = function() {
  // Metin inputu sıfırlama
  document.getElementById('inputText').value = '';
  
  // Resim inputu sıfırlama
  document.getElementById('imageInput').value = '';
  
  // Sonuç inputu sıfırlama
  document.getElementById('resultText').value = '';
};

// Kopyala butonunun işlevselliği
document.getElementById('copyButton').addEventListener('click', function () {
  var resultText = document.getElementById('resultText');
  resultText.select();
  resultText.setSelectionRange(0, 99999); // Mobil cihazlar için seçimi genişlet
  document.execCommand('copy');
  alert('Sonuç panoya kopyalandı!');
});

// Şifrele butonunun işlevselliği
document.getElementById('encryptButton').addEventListener('click', function () {
  const text = document.getElementById('inputText').value;
  const imageInput = document.getElementById('imageInput');
  const file = imageInput.files[0];

  if (text) {
    // Eğer metin varsa, metni gönder
    fetch('/sifrele', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('resultText').value = data.veri;
    })
    .catch(error => {
      console.error('Hata:', error);
      alert('Şifreleme sırasında hata oluştu.');
    });
  } else {
    alert("Lütfen metin girin.");
  }
});

// Şifreyi Çöz butonunun işlevselliği
document.getElementById('decryptButton').addEventListener('click', function () {
  const text = document.getElementById('inputText').value;

  fetch('/coz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('resultText').value = data.veri;
  })
  .catch(error => {
    console.error('Çözme hatası:', error);
    alert('Çözme sırasında hata oluştu.');
  });
});

// Resim Şifrele butonunun işlevselliği
document.getElementById('imageEncryptButton').addEventListener('click', function () {
  const imageInput = document.getElementById('imageInput');
  const file = imageInput.files[0];

  if (file) {
    // Eğer resim varsa, base64'e çevirip gönder
    const reader = new FileReader();
    reader.onloadend = function () {
      const base64Image = reader.result.split(',')[1];
      fetch('/sifreleresim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: base64Image })
      })
      .then(response => response.json())
      .then(data => {
        document.getElementById('resultText').value = data.veri;
      })
      .catch(error => {
        console.error('Hata:', error);
        alert('Şifreleme sırasında hata oluştu.');
      });
    };
    reader.readAsDataURL(file);
  } else {
    alert("Lütfen bir resim seçin.");
  }
});

// Resim Çöz butonunun işlevselliği
document.getElementById('imageDecryptButton').addEventListener('click', function () {
  const text = document.getElementById('inputText').value;

  fetch('/resimCoz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('resultText').value = data.veri;
  })
  .catch(error => {
    console.error('Çözme hatası:', error);
    alert('Çözme sırasında hata oluştu.');
  });
});

// Resim Çöz butonunun işlevselliği
document.getElementById('imageDecryptButton').addEventListener('click', function () {
  const text = document.getElementById('inputText').value;

  fetch('/resimCoz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('resultText').value = data.veri;

    // Base64'ten görseli oluştur
    const img = document.getElementById('decodedImage');
    img.src = `data:image/jpeg;base64,${data.veri}`;
    img.style.display = 'block';
  })
  .catch(error => {
    console.error('Çözme hatası:', error);
    alert('Çözme sırasında hata oluştu.');
  });
});
