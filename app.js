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

var routes = [
    { path: '/', component: sPostList },
    { path: '/post/:id', component: sArticle },
    { path: '/post/:id/edit', component: sEditor }
];

var router = new VueRouter({
    routes: routes,
    //mode: 'history',
    base: '/'
});

var app = new Vue({
    el: "#postlist",
    router: router,
    data: {
        posts: []
    },
    methods: {
        postPath(id) {
            return "post/" + id;
        }
    },
    async created() {
        const vm = this;

        var postRef = firebase.database().ref("posts");
        this.posts = (await postRef.once('value')).val();
    }
});
