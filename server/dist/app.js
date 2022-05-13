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
let user = { id: 'social-curator-id' };
//------- functions
// get user's profile
const getProfile = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://graph.facebook.com/v13.0/me?fields=id,name,first_name,picture&access_token=${token}`;
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        const profile = {
            name: data.name,
            firstName: data.first_name,
            url: data.picture.data.url
        };
        return profile;
    }
    catch (err) {
        console.log(err.message);
    }
});
// get data about pages that user authorized access to
// ? Note that in some cases the app User may grant your app access to more than one Page, in which case you should capture each Page ID and its respective token, and provide a way for the app User to target each of those Pages.
const getPageInfo = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://graph.facebook.com/v13.0/me/accounts?fields=picture,name,access_token&access_token=${token}`;
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        const pagesInfo = data.data;
        const pages = [];
        pagesInfo.forEach((page) => {
            const pageInfo = {
                auth: {
                    id: page.id,
                    token: page.access_token
                },
                profile: {
                    name: page === null || page === void 0 ? void 0 : page.name,
                    url: page === null || page === void 0 ? void 0 : page.picture.data.url
                }
            };
            pages.push(pageInfo);
        });
        return pages;
    }
    catch (err) {
        console.log(err.message);
    }
});
//------- routes (facebook)
app.get('/user', (req, res) => {
    res.status(200).send(user);
});
// store token after login is complete
app.post('/authorization', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authResponse = req.body.authResponse;
    const token = authResponse.accessToken;
    const id = authResponse.userID;
    const auth = {
        token,
        id
    };
    // get user's profile & page info
    const result = yield Promise.all([getProfile(token), getPageInfo(token)]);
    const profile = result[0];
    const pageInfo = result[1];
    // set user data
    if (req.body.type === 'facebook') {
        user.facebook = Object.assign(Object.assign({}, user.facebook), { auth, profile, pages: pageInfo });
    }
    if (req.body.type === 'instagram') {
        user.instagram = Object.assign(Object.assign({}, user.instagram), { auth, profile, pages: pageInfo });
    }
    res.status(201).send({ profile, pageInfo });
}));
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
// post to user's facebook page
app.post('/facebook/publish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('post to facebook', req.body);
    const pageId = user.facebook.pages[0].auth.id;
    const pageToken = user.facebook.pages[0].auth.token;
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
// post to instagram page
app.post('/instagram/publish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO
    const accountId = user.instagram.auth.userID;
    const userId = user.instagram.pages.pageID;
    const accessToken = user.instagram.pages.pageToken;
    const caption = req.body.caption;
    const imageUrl = req.body.imageUrl;
    try {
        // create IG media container (for images)
        const creationId = yield axios_1.default.post(`https://graph.facebook.com/v13.0/${accountId}/media?image_url=${imageUrl}&caption=${caption}&access_token=${accessToken}`);
        // &location_id={location-id}
        // &user_tags={user-tags}
        // publish media container
        yield axios_1.default.post(`https://graph.facebook.com/v13.0/${userId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`);
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