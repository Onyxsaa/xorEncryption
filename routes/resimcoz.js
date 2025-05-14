const express = require('express');
const router = express.Router();

// Metni bitlere ayırma fonksiyonu
function metniBitlereAyir(metin) {
    return Array.from(metin).flatMap(char =>
        char.charCodeAt(0).toString(2).padStart(8, '0').split('').map(Number)
    );
}

// Base64'ü bitlere çevirme fonksiyonu
function base64ToBits(base64) {
    return Array.from(Buffer.from(base64, 'base64')).flatMap(byte =>
        byte.toString(2).padStart(8, '0').split('').map(Number)
    );
}

// Bitlerden Base64'e çevirme fonksiyonu
function bitsToBase64(bits) {
    const byteCount = Math.ceil(bits.length / 8);
    const paddedBits = [...bits, ...Array(byteCount * 8 - bits.length).fill(0)];

    const bytes = [];
    for (let i = 0; i < paddedBits.length; i += 8) {
        const byte = paddedBits.slice(i, i + 8).join('');
        bytes.push(parseInt(byte, 2));
    }

    return Buffer.from(bytes).toString('base64');
}

// XOR işlemi
function xorIslemi(metinBits, keyBits) {
    return metinBits.map((bit, index) => bit ^ keyBits[index % keyBits.length]);
}

// Şifre çözme (POST isteği ile gelen şifreyi çözen işlem)
router.post('/', (req, res) => {
    try {
        const encryptedBase64 = req.body.message;
        if (!encryptedBase64) {
            return res.status(400).json({ hata: 'Şifreli veri bulunamadı' });
        }

        // Şifreli veriyi bitlere çevir
        const encryptedBits = base64ToBits(encryptedBase64);

        // XOR anahtar bitlerini oluştur
        const keyBits = metniBitlereAyir(process.env.secretKey || 'varsayilanAnahtar');

        // XOR çözümlemesi
        const decryptedBits = xorIslemi(encryptedBits, keyBits);

        // Bitlerden tekrar Base64 elde et (orijinal resim base64)
        const originalBase64 = bitsToBase64(decryptedBits);

 

        res.json({ veri: originalBase64 });
    } catch (error) {
   
        res.status(500).json({ hata: 'Çözme işlemi sırasında hata oluştu' });
    }
});

module.exports = router;
