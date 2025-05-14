const express = require('express');
const router = express.Router();

// Metni bitlere ayırma
function metniBitlereAyir(metin) {
    return Array.from(Buffer.from(metin, 'utf8')).flatMap(byte =>
        byte.toString(2).padStart(8, '0').split('').map(Number)
    );
}

// XOR işlemi
function xorIslemi(dataBits, keyBits) {
    if (!keyBits.length) throw new Error('Boş anahtar');
    return dataBits.map((bit, i) => bit ^ keyBits[i % keyBits.length]);
}

// Base64'ü bitlere çevirme
function base64ToBits(base64) {
    return Array.from(Buffer.from(base64, 'base64')).flatMap(byte =>
        byte.toString(2).padStart(8, '0').split('').map(Number)
    );
}

// Bitlerden Base64'e çevirme
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

router.post('/', (req, res) => {
    try {
        const base64Image = req.body.message;
        if (!base64Image) {
            return res.status(400).json({ hata: 'Resim verisi bulunamadı' });
        }

        const imageBits = base64ToBits(base64Image);
        const keyBits = metniBitlereAyir(process.env.secretKey || 'varsayilanAnahtar');
        const encryptedBits = xorIslemi(imageBits, keyBits);
        const encryptedBase64 = bitsToBase64(encryptedBits);

        console.log("Resmin şifrelenmiş hali:", encryptedBase64);

        res.json({ veri: encryptedBase64 });
    } catch (error) {
        console.error('Hata:', error.message);
        res.status(500).json({ hata: 'Şifreleme hatası' });
    }
});

module.exports = router;
