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
// get user's facebook account profile
const getFacebookProfile = (token) => __awaiter(void 0, void 0, void 0, function* () {
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
const getFacebookPages = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://graph.facebook.com/v13.0/me/accounts?fields=picture,name,access_token&access_token=${token}`;
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        if (!data) {
            return;
        }
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
        console.log(err.response);
    }
});
const getInstagramId = (id, token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://graph.facebook.com/v13.0/${id}?fields=instagram_business_account&access_token=${token}`;
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        return data.instagram_business_account.id;
    }
    catch (err) {
        console.log(err.message);
    }
});
const getInstagramProfile = (id, token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://graph.facebook.com/v13.0/${id}?fields=name,profile_picture_url,username&access_token=${token}`;
    try {
        const { data } = yield (0, axios_1.default)({
            method: 'get',
            url
        });
        const profile = {
            username: data.username,
            url: data.profile_picture_url
        };
        return profile;
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
app.post('/facebook/authorization', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authResponse = req.body.authResponse;
    const token = authResponse.accessToken;
    const id = authResponse.userID;
    const auth = {
        token,
        id
    };
    // get user's profile & page info
    const result = yield Promise.all([getFacebookProfile(token), getFacebookPages(token)]);
    const profile = result[0];
    const facebookPages = result[1];
    let instagramPages = [];
    // iterate through page info and get instagram id for each. store each id
    for (let i = 0; i < facebookPages.length; i++) {
        const id = facebookPages[i].auth.id;
        const token = facebookPages[i].auth.token;
        const instagramId = yield getInstagramId(id, token);
        const instagramProfile = yield getInstagramProfile(instagramId, token);
        instagramPages.push({
            auth: { id: instagramId },
            profile: instagramProfile
        });
    }
    user.facebook = Object.assign(Object.assign({}, user.facebook), { auth, profile, pages: facebookPages });
    user.instagram = Object.assign(Object.assign({}, user.instagram), { pages: instagramPages });
    const fbPages = facebookPages.map((page) => {
        return {
            id: page.auth.id,
            profile: page.profile
        };
    });
    const igPages = instagramPages.map((page) => {
        return {
            id: page.auth.id,
            profile: page.profile
        };
    });
    res.status(201).send({ profile, facebookPages: fbPages, instagramPages: igPages });
}));
// post image to user's facebook page
const postImage = (pageId, imageUrl, pageToken) => __awaiter(void 0, void 0, void 0, function* () {
    const postUrl = `https://graph.facebook.com/${pageId}/photos?url=${imageUrl}&access_token=${pageToken}`;
    const { data } = yield (0, axios_1.default)({
        method: 'post',
        url: postUrl
    });
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
    return data;
});
// post to user's facebook page
app.post('/facebook/publish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = req.body.message;
    const imageUrl = req.body.imageUrl;
    const pageId = req.body.pageId;
    const pageToken = user.facebook.pages[0].auth.token; // TODO get token for that page
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
    const igUserId = req.body.userId;
    const imageUrl = req.body.imageUrl;
    const caption = req.body.caption;
    const accessToken = user.facebook.pages[0].auth.token; // TODO get token for that page
    try {
        // create IG media container (for single images)
        const res = yield axios_1.default.post(`https://graph.facebook.com/v13.0/${igUserId}/media?image_url=${imageUrl}&caption=${caption}&access_token=${accessToken}`);
        // &location_id={location-id}
        // &user_tags={user-tags}
        const creationId = res.data.id;
        // publish media container
        yield axios_1.default.post(`https://graph.facebook.com/v13.0/${igUserId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`);
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