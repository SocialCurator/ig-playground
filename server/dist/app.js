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
// ------- simulate db
let user = { userID: 'social-curator-id' };
//------- functions
// get user's profile
const getProfile = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://graph.facebook.com/v13.0/me?fields=id,name,first_name,picture&access_token=${token}`;
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        console.log('user profile', data);
        const profile = {
            name: data.name,
            first_name: data.first_name,
            picture: data.picture
        };
        return profile;
    }
    catch (err) {
        console.log(err.message);
    }
});
// get data about pages that user authorized access to
const getPageInfo = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://graph.facebook.com/v13.0/me/accounts?access_token=${token}`;
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        // array of objects containing information about each page
        console.log('response from FB req', data.data);
        const pageToken = data.data[0].access_token;
        const pageID = data.data[0].id;
        return {
            pageID,
            pageToken
        };
    }
    catch (err) {
        console.log(err.message);
    }
});
// post image to user's facebook page
const postImage = (pageId, imageUrl, pageToken) => __awaiter(void 0, void 0, void 0, function* () {
    const postUrl = `https://graph.facebook.com/${pageId}/photos?url=${imageUrl}&access_token=${pageToken}`;
    const { data } = yield (0, axios_1.default)({
        method: 'post',
        url: postUrl
    });
    console.log('response from FB post image req', data);
    return data.post_id;
});
// update post with caption
const updatePost = (postId, message, pageToken) => __awaiter(void 0, void 0, void 0, function* () {
    const updateUrl = `https://graph.facebook.com/${postId}?message=${message}&access_token=${pageToken}`;
    // update image with caption
    const { data } = yield (0, axios_1.default)({
        method: 'post',
        url: updateUrl
    });
    console.log('response from FB update post req', data);
    return data;
});
//------- routes (facebook)
app.get('/', (req, res) => {
    res.status(200).send('hi I am the server');
});
app.get('/user', (req, res) => {
    res.status(200).send(user);
});
// store token after login is complete
app.post('/authorize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authResponse = req.body.authResponse;
    const accessToken = authResponse.accessToken;
    const userID = authResponse.userID;
    //TODO validate auth token by checking with Facebook if it matches
    // check if auth token is valid
    const auth = {
        accessToken,
        userID
    };
    // get user's profile
    const profile = yield getProfile(accessToken);
    // get user's page info
    const pageInfo = yield getPageInfo(accessToken);
    // set user data
    user.facebook = Object.assign(Object.assign({}, user.facebook), { auth, profile, pages: pageInfo });
    console.log("User's data has been stored in the server.");
    res.status(201).send(profile);
}));
// post to user's facebook page
app.post('/post', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('post', req.body);
    const pageId = user.facebook.pages.pageID;
    const pageToken = user.facebook.pages.pageToken;
    const message = req.body.message;
    const imageUrl = req.body.imageUrl;
    try {
        // post image
        const postId = yield postImage(pageId, imageUrl, pageToken);
        // update post with caption
        const data = yield updatePost(postId, message, pageToken);
        res.send(data);
    }
    catch (err) {
        console.log(err.response);
    }
}));
// init server
server.listen(port, () => {
    return console.log(`Express is listening at https://localhost:${port}`);
});
//# sourceMappingURL=app.js.map