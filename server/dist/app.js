"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
// import localhost cert
const key = fs_1.default.readFileSync('./localhost/localhost.decrypted.key');
const cert = fs_1.default.readFileSync('./localhost/localhost.crt');
const app = (0, express_1.default)();
const port = 4000;
const https = require('https');
const server = https.createServer({ key, cert }, app);
// parse application/json
app.use(body_parser_1.default.json());
// routes
app.get('/', (req, res) => {
    res.status(200).send('hi I am the server');
});
app.post('/api/authorize', (req, res) => {
    console.log(1, req);
    res.json({ yourtoken: `sir!`, originalBody: req.body });
});
const getProfile = () => __awaiter(void 0, void 0, void 0, function* () {
    const uid = "165385175924266";
    const accessToken = "EAAKE4Xd4HZCQBAMiny6RuUHaOmFMZAdRqQonjipoqseDD856r3KFRtLyWLwDBNkjYPMxitVDdVF8FSeUlfqhHN5U489QZBMNFMyyqZAzgnl1KDjiTAZCW23E7wcegKZCgGS2pZACYQwrU937BzhioieNfNJ71dBa98fnAmkpQhWHa666UFiqVdbusnS6yx3nPPek1NgPf0RpnAQxkewVvA2";
    const url = `https://graph.facebook.com/v13.0/me?access_token=${accessToken}`;
    console.log(url);
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        console.log('response from FB req', data);
    }
    catch (err) {
        console.log(err.response.data);
    }
});
getProfile();
app.get('/getprofile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = "165385175924266";
    const accessToken = "EAAKE4Xd4HZCQBAMiny6RuUHaOmFMZAdRqQonjipoqseDD856r3KFRtLyWLwDBNkjYPMxitVDdVF8FSeUlfqhHN5U489QZBMNFMyyqZAzgnl1KDjiTAZCW23E7wcegKZCgGS2pZACYQwrU937BzhioieNfNJ71dBa98fnAmkpQhWHa666UFiqVdbusnS6yx3nPPek1NgPf0RpnAQxkewVvA2";
    const url = `https://graph.facebook.com/v13.0/me?access_token=${accessToken}`;
    console.log(url);
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        console.log('response from FB req', data);
    }
    catch (err) {
        console.log(err.message);
    }
}));
// init server
server.listen(port, () => {
    return console.log(`Express is listening at https://localhost:${port}`);
});
//# sourceMappingURL=app.js.map