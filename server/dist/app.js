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
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
// TODO: need endpoint to check validity of accessToken
// TODO: need a function that stores accessToken inside of document for specific user in Mongo, and type of account
// TODO: separate oAuth process for Ig?
// ? 3 IG + 3 FB accounts
// ? need to log into FB to access IG (Business Accounts)
// ? each log in -> 1 IG + 1 FB?
// import localhost cert
const key = fs_1.default.readFileSync('./localhost/localhost.decrypted.key');
const cert = fs_1.default.readFileSync('./localhost/localhost.crt');
// init express
const app = (0, express_1.default)();
const port = 4000;
const server = https_1.default.createServer({ key, cert }, app);
// parse application/json
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
let user = { userId: 'social-curator-id' };
//------- routes (facebook)
app.get('/', (req, res) => {
    res.status(200).send('hi I am the server');
});
// store token after login is complete
app.post('/authorize', (req, res) => {
    const authResponse = req.body.authResponse;
    const fbAuth = {
        accessToken: authResponse.accessToken,
        userId: authResponse.userID
    };
    user.facebook = Object.assign(Object.assign({}, user.facebook), { auth: fbAuth });
    res.status(201).send(`access token has been stored: ${authResponse.accessToken}`);
});
// get token
app.get('/token', (req, res) => {
    res.status(200).send(user.facebook.auth.accessToken);
});
// get user's facebook profile
app.get('/getprofile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = user.facebook.auth.accessToken;
    const url = `https://graph.facebook.com/v13.0/me?fields=id,name,first_name,picture&access_token=${accessToken}`;
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        console.log('response from FB req', data);
        const fbProfile = {
            name: data.name,
            first_name: data.first_name,
            picture: data.picture
        };
        user.facebook = Object.assign(Object.assign({}, user.facebook), { profile: fbProfile });
        res.status(200).send(fbProfile);
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