const express = require('express');
const path = require('path');

const app = express();
const port = 6969;

app.use(express.json());
app.use('/', express.static('public'));

app.get('*', (_, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

try {
    app.listen(port, () => console.log(`Back-end app starts at port: ${port}`));
} catch (e) {
    console.log('Error: ' + e.message);
    exit(1);
}
