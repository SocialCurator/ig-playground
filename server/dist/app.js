"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
// import localhost cert
const key = fs_1.default.readFileSync('./localhost/localhost.decrypted.key');
const cert = fs_1.default.readFileSync('./localhost/localhost.crt');
// init app
const app = (0, express_1.default)();
const port = 4000;
// init server
const https = require('https');
const server = https.createServer({ key, cert }, app);
// parse application/json
app.use(body_parser_1.default.json());
// routes
app.get('/', (req, res) => {
    res.status(200).send('hi I am the server');
});
app.post('/api/authorize', (req, res) => {
    console.log(req.body);
    res.json({ yourtoken: `sir!`, originalBody: req.body });
});
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
// server.listen(port, () => {
//     return console.log(`Express is listening at https://localhost:${port}`)
// })
//# sourceMappingURL=app.js.map