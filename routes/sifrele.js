const express = require('express');
const router = express.Router();

function metniBitlereAyir(metin) {
    const bytes = Buffer.from(metin, 'utf8');
    return Array.from(bytes).flatMap(byte =>
        byte.toString(2).padStart(8, '0').split('').map(Number)
    );
}

function bitlerdenMetne(bitler) {
    const paddedLength = Math.ceil(bitler.length / 8) * 8;
    const paddedBits = [...bitler, ...Array(paddedLength - bitler.length).fill(0)];

    const bytes = [];
    for (let i = 0; i < paddedBits.length; i += 8) {
        const byteBits = paddedBits.slice(i, i + 8).join('');
        bytes.push(parseInt(byteBits, 2));
    }

    return Buffer.from(bytes).toString('utf8').replace(/\x00+$/g, '');
}

function xorIslemi(metinBits, keyBits) {
    if (keyBits.length === 0) throw new Error('Boş anahtar');
    return metinBits.map((bit, index) => bit ^ keyBits[index % keyBits.length]);
}

function bitlerdenMetne2(bitler) {
    let metin = '';
    for (let i = 0; i < bitler.length; i += 8) {
        const ikiliString = bitler.slice(i, i + 8).join('');
        const asciiDeger = parseInt(ikiliString, 2);
        metin += String.fromCharCode(asciiDeger);
    }
    return metin;
}

router.post('/', (req, res) => {
    try {
        const metin = req.body.message;
        const keyBitArray = metniBitlereAyir(process.env.secretKey || 'varsayilanAnahtar');
        const metninBitArray = metniBitlereAyir(metin);
        const encryptedArray = xorIslemi(metninBitArray, keyBitArray);

        // Log başlığı (sabit genişlikler)
        console.log("\n╔════════════════╤════════════════════════╤════════════════════════╤════════════════╗");
        console.log("║ Karakter       │ Bit Hali               │ XOR'lu Bitler          │ Yeni Karakter  ║");
        console.log("╟────────────────┼────────────────────────┼────────────────────────┼────────────────╢");

        // Karakter bazlı log
        for (let i = 0; i < metin.length; i++) {
            const karakter = metin[i];
            const karakterBits = metniBitlereAyir(karakter);
            const xorluBitler = xorIslemi(karakterBits, keyBitArray);
            const yeniKarakter = bitlerdenMetne2(xorluBitler);

            const formatCell = (text, width) => {
                const cleanText = text.length > width ? text.slice(0, width - 1) + "…" : text;
                return cleanText.padEnd(width, ' ');
            };

            console.log(`║ ${formatCell(karakter, 16)}│ ${formatCell(karakterBits.join(''), 24)}│ ${formatCell(xorluBitler.join(''), 24)}│ ${formatCell(yeniKarakter, 16)}║`);
        }

        console.log("╚════════════════╧════════════════════════╧════════════════════════╧════════════════╝");

        // Şifreli veriyi base64 olarak gönder
        const encryptedBytes = [];
        for (let i = 0; i < encryptedArray.length; i += 8) {
            const byteBits = encryptedArray.slice(i, i + 8).join('');
            encryptedBytes.push(parseInt(byteBits, 2));
        }
        const encryptedText = Buffer.from(encryptedBytes).toString('base64');

        res.json({ veri: encryptedText });
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ hata: 'Şifreleme hatası' });
    }
});

module.exports = router;
