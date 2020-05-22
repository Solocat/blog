var sPostList = {
	template: `<div>
	<router-link :to="{ name: 'new'}">New post</router-link>
	<ul>
        <li v-for="(post,index) in posts">
            <router-link :to="{name: 'post', params: { postid:index, postdata: post } }"> {{ post.title }} </router-link>
            <router-link :to="{name: 'edit', params: { postid:index, postdata: post } }">edit</router-link>
        </li>
    </ul>
	</div>`,
    data: function() {
        return {
            posts: []
        }
    },
    async created() {
        const vm = this;

        var postRef = firebase.database().ref("posts");
        this.posts = (await postRef.once('value')).val();
    }

};

var sArticle = {
    template: `<div v-if="loading">Loading...</div>
        <article v-else>
            <s-block v-for="(block, index) in post.blocks" :item="block" ></s-block>
            <router-link :to="{name: 'edit', params: { postid: $route.params.postid, postdata: post } }">Edit</router-link>
        </article>`,
	props: ['postdata'],
    async created() {
		if (!this.postdata && this.$route.params.postid) {
            this.loading = true;
			var postRef = firebase.database().ref("posts/").child(this.$route.params.postid);
            this.post = (await postRef.once('value')).val();
            this.loading = false;
		}
    },
    data() {
        return {
            loading: false,
            post: this.postdata,
            editPath: "/post/" + this.$route.params.postid + "/edit"
        }
    },
    components: {
        "s-block" : sBlock
    }
}

Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

var sEditor = {
    mixins: [sArticle], //inherit from article
    template: `<div v-if="loading">Loading...</div>
    <div id="editor" v-else>
        <edit-tools @useTool="useTool" :visible="selectedIndex >= 0" :editing="editing" :hiddenTools="hiddenEditTools()"></edit-tools>
        <main>
			<button @click="upload">Save post</button>
			<button @click="clear">Clear post</button>
            <article>
                <s-block v-for="(block, index) in post.blocks" :item="block" :editing="blockIsEditing(index)" :key="index" @click="selectBlock(index, false)" :class="{selected: index == selectedIndex}"></s-block>
            </article>
            <add-tools @useTool="addBlock"></add-tools>
        </main>
    </div>`,
    methods: {
        hiddenEditTools() { //TODO
            var excluded = [];
            if (this.editing) excluded.push("edit");
            else excluded.push("save");

            if (this.selectedIndex <= 0) excluded.push("move up");
            if (this.selectedIndex >= this.post.blocks.length - 1) excluded.push("move down");

            return excluded;
        },
		upload() {
			this.unselect();
			if (this.$route.params.postid) {
				var postRef = firebase.database().ref("posts/").child(this.$route.params.postid);
			}
			else {
				var postRef = firebase.database().ref("posts/").push();
            }
            this.post.title = this.post.blocks[0].content;
            this.post.time = "";
            this.post.author = "me";
			postRef.set(this.post, function(error) {
			    if (error) {
			      // The write failed...
			    } else {
			      console.log("Post saved!");
			    }
			  });
		},
		clear() {
			this.unselect();
			this.post = {};
		},
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
