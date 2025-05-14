const express = require('express');
const router = express.Router();

function metniBitlereAyir(metin) {
    const bytes = Buffer.from(metin, 'utf8');
    return Array.from(bytes).flatMap(byte =>
        byte.toString(2).padStart(8, '0').split('').map(Number)
    );
}

function bitlerdenMetne(bitler) {
    const bytes = [];
    for (let i = 0; i < bitler.length; i += 8) {
        const byteBits = bitler.slice(i, i + 8);
        const byte = parseInt(byteBits.join(''), 2);
        bytes.push(byte);
    }
    return Buffer.from(bytes).toString('utf8').replace(/\x00+$/g, '');
}

function xorIslemi(metinBits, keyBits) {
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
        const encryptedBase64 = req.body.message;
        const keyBits = metniBitlereAyir(process.env.secretKey || 'varsayilanAnahtar');

        const encryptedBytes = Buffer.from(encryptedBase64, 'base64');
        const encryptedBits = Array.from(encryptedBytes).flatMap(byte =>
            byte.toString(2).padStart(8, '0').split('').map(Number)
        );

        const decryptedBits = xorIslemi(encryptedBits, keyBits);
        const decryptedText = bitlerdenMetne(decryptedBits);

        // Loglama başlıkları ve çerçeve
        const padCell = (text, width) => {
            const cleanText = text.length > width ? text.slice(0, width - 1) + "…" : text;
            return cleanText.padEnd(width, ' ');
        };

        const colWidths = {
            encryptedChar: 18,
            xorBits: 26,
            originalBits: 26,
            decryptedChar: 18
        };

        const drawRow = (col1, col2, col3, col4) => {
            return `║ ${padCell(col1, colWidths.encryptedChar)} │ ${padCell(col2, colWidths.xorBits)} │ ${padCell(col3, colWidths.originalBits)} │ ${padCell(col4, colWidths.decryptedChar)} ║`;
        };

        const drawLine = (left, mid, right, fill) => {
            return left +
                `${fill.repeat(colWidths.encryptedChar + 2)}${mid}` +
                `${fill.repeat(colWidths.xorBits + 2)}${mid}` +
                `${fill.repeat(colWidths.originalBits + 2)}${mid}` +
                `${fill.repeat(colWidths.decryptedChar + 2)}` +
                right;
        };

        console.log('\n' + drawLine('╔', '╤', '╗', '═'));
        console.log(drawRow('Şifreli Karakter', 'XOR Bitleri', 'Orijinal Bitler', 'Çözülen Karakter'));
        console.log(drawLine('╟', '┼', '╢', '─'));

        for (let i = 0; i < decryptedText.length; i++) {
            const decryptedChar = decryptedText[i];
            const charBits = metniBitlereAyir(decryptedChar);
            const xorBits = xorIslemi(charBits, keyBits);
            const encryptedChar = bitlerdenMetne2(xorBits);

            console.log(drawRow(encryptedChar, xorBits.join(''), charBits.join(''), decryptedChar));
        }

        console.log(drawLine('╚', '╧', '╝', '═'));

        res.json({ veri: decryptedText });
    } catch (error) {
        console.error('Hata:', error);
        res.status(400).json({ hata: "Geçersiz veri formatı" });
    }
});

module.exports = router;
