const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname), { dotfiles: 'ignore' }));

app.listen(process.env.PORT || 3000, '0.0.0.0');
