// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCD6i_bVMiThtY9IvVIaVtUxQwU9I_ioL4",
    authDomain: "blog-bee9e.firebaseapp.com",
    databaseURL: "https://blog-bee9e.firebaseio.com",
    projectId: "blog-bee9e",
    storageBucket: "blog-bee9e.appspot.com",
    messagingSenderId: "89370705170",
    appId: "1:89370705170:web:1c308df99ea1a2b57e07cb"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var app = new Vue({
    el: "#app",
    router: new VueRouter({
        routes: [
            { path: '/', component: sPostList },
            { path: '/post/:postid', component: sArticle, name: 'post', props: true },
            { path: '/post/:postid/edit', component: sEditor, name: 'edit', props: true },
            { path: '/new', component: sEditor, props: {postdata: {blocks: []}}}
        ],
        //mode: 'history',
        base: '/'
    })
});
