// server.js

const express = require('express');
const app = express();
const PORT = 3001;

// Middleware untuk menyajikan file statis
app.use(express.static('public'));

// Route untuk halaman utama
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
