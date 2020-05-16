var sPostList = {
	template: `<ul>
        <li v-for="(post,index) in posts">
            <router-link :to="postPath(index)"> {{ post.title }} </router-link>
            <router-link :to="postEditPath(index)">edit</router-link>
        </li>
    </ul>`,
    data: function() {
        return {
            posts: []
        }
    },
    methods: {
            postPath(id) {
                return "post/" + id;
            },
            postEditPath(id) {
                return "post/" + id + "/edit"
            }
        },
    async created() {
            const vm = this;

            var postRef = firebase.database().ref("posts");
            this.posts = (await postRef.once('value')).val();
        }

};

var articleMix = {
    async created() {
        var postRef = firebase.database().ref("posts/").child('0');
        this.post = (await postRef.once('value')).val();
    },
    data() {
        return {
            post: {}
        }
    },
    components: {
        "s-block" : sBlock
    },
}

var sArticle = {
    mixins: [articleMix],
    template: `<article>
            <s-block v-for="(block, index) in post.blocks" :item="block" ></s-block>
            <router-link :to="editPath">Edit</router-link>
        </article>`,
    data: function() {
        return {
            //post: {},
            editPath: "/post/" + this.$route.params.id + "/edit"
        }
    }/*,
    components: {
        "s-block" : sBlock
    },
    async created() {
        var postRef = firebase.database().ref("posts/").child('0');
        this.post = (await postRef.once('value')).val();
    }*/
}

Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

var sEditor = {
    mixins: [articleMix],
    template: `<div id="editor">{{post.title}}
        <edit-tools @useTool="useTool" :visible="selectedIndex >= 0" :editing="editing"></edit-tools>
        <main>
            <article>
                <s-block v-for="(block, index) in post.blocks" :item="block" :editing="blockIsEditing(index)" :key="index" @click="selectBlock(index, false)" :class="{selected: index == selectedIndex}"></s-block>
            </article>
            <add-tools @useTool="addBlock"></add-tools>
        </main>
    </div>`,
    methods: {
        blockIsEditing(i) {
            return (this.editing == true && i == this.selectedIndex);
        },
        addBlock(t) {
            this.unselect();

            this.post.blocks.push({
                type: t,
                content: ""
            });

            this.selectBlock(this.post.blocks.length-1, true);
            this.editing = true;
        },
        deleteBlock(i) {
            this.post.blocks.splice(i, 1);
        },
        selectBlock(i, isnew) {
            if (this.selectedIndex == i) return;
            this.unselect();

            this.editing = isnew; //start editing new block
            this.selectedIndex = i;

            //move tools when dom updated
            this.$nextTick(function () {
                var element = document.getElementsByTagName("article")[0].children[i];
                var middle = element.offsetTop + element.offsetHeight/2;

                var toolbar = document.getElementById("editTools");
                toolbar.style.top = element.offsetTop;
            });
        },
        unselect() {
            if (this.selectedIndex < 0 ) return;
            if (this.selectedBlock && !this.selectedBlock.content) this.deleteBlock(this.selectedIndex);

            this.selectedIndex = -1;
            this.editing = false;
        },

        useTool(tool) {
            if (tool == "delete") {
                this.deleteBlock(this.selectedIndex);
                this.unselect();
            }
            else if (tool == "move up" && this.selectedIndex > 0) {
                this.post.blocks.move(this.selectedIndex, this.selectedIndex-1);
                this.selectBlock(this.selectedIndex-1, false);
            }
            else if (tool == "move down" && this.selectedIndex < this.post.blocks.length - 1) {
                this.post.blocks.move(this.selectedIndex, this.selectedIndex+1);
                this.selectBlock(this.selectedIndex+1, false);
            }
            else if (tool == "edit") {
                var el = document.getElementsByClassName("s-block")[this.selectedIndex];
                this.editing = true;
            }
            else if (tool == "save") {
                this.unselect();
            }
        }
    },
    computed: {
        selectedBlock() {
            return this.post.blocks[this.selectedIndex];
        }
    },
    data() {
        return {
            editing: false,
            selectedIndex: -1
        }
    },
    components: {
        "edit-tools": editTools,
        "add-tools": addTools
    }
}
