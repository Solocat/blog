Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

var sArticle = {
    template: `<article>
            <s-block v-for="(block, index) in post.blocks" :item="block" ></s-block>
            <p>{{$route.params.id}}</p>

            <router-link to="0/edit"> Contact </router-link>
            <a href="edit.html">Edit post</a>
        </article>`,
    data: function() {
        return {
            post: {}
        }
    },
    components: {
        "s-block" : sBlock
    },
    async created() {
        var postRef = firebase.database().ref("posts/").child('0');
            this.post = (await postRef.once('value')).val();
    }
}

var Editor = {
    template: `<div id="editor">
        <aside>
            <ul id="editTools" :style="toolbarStyle">
                <li v-for="tool in visibleEditTools" v-if="tool.show">
                    <span class="tooltip">{{tool.text}}</span>
                    <img :src="tool.icon" class="icon" @click="useTool(tool)">
                </li>
            </ul>
        </aside>
        <main>
            <article>
                <s-block v-for="(block, index) in post.blocks" :item="block" :editing="blockIsEditing(index)" :key="index" @click="selectBlock(index)" :class="{selected: index == selectedIndex}"></s-block>


            </article>
            <div id="addTools">
                <ul>
                    <li v-for="tool in addTools" @mouseover="hover(tool.text)" @click="addBlock(tool.type)">
                        <img :src="tool.icon" class="icon">
                    </li>
                </ul>
                <span class="tooltip">{{addTooltip}}</span>
            </div>
        </main>
    </div>`,
    async created() {
        var postRef = firebase.database().ref("posts/").child('0');
            this.post = (await postRef.once('value')).val();
    },
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

            this.selectBlock(this.post.blocks.length-1);
            this.editing = true;
        },
        deleteBlock(i) {
            this.post.blocks.splice(i, 1);
        },
        selectBlock(i) {
            if (this.selectedIndex == i) return;
            this.unselect();

            this.editing = false;
            this.selectedIndex = i;

            var element = document.getElementsByTagName("article")[0].children[i];
            var middle = element.offsetTop + element.offsetHeight/2;

            var toolbar = document.getElementById("editTools");
            toolbar.style.top = element.offsetTop;
        },
        unselect() {
            if (this.selectedIndex < 0 ) return;
            if (this.selectedBlock && !this.selectedBlock.content) this.deleteBlock(this.selectedIndex);

            this.selectedIndex = -1;
            this.editing = false;
        },
        hover(text) {
            this.addTooltip = text
        },
        useTool(tool) {
            if (tool.text == "delete") {
                this.deleteBlock(this.selectedIndex);
                this.unselect();
            }
            else if (tool.text == "move up" && this.selectedIndex > 0) {
                this.post.blocks.move(this.selectedIndex, this.selectedIndex-1);
                this.selectBlock(this.selectedIndex-1);
            }
            else if (tool.text == "move down" && this.selectedIndex < this.post.blocks.length - 1) {
                this.post.blocks.move(this.selectedIndex, this.selectedIndex+1);
                this.selectBlock(this.selectedIndex+1);
            }
            else if (tool.text == "edit") {
                var el = document.getElementsByClassName("s-block")[this.selectedIndex];
                this.editing = true;
            }
            else if (tool.text == "save") {
                this.unselect();
            }
        }
        /*filter(tool) {
            if (tool.filter) return tool.filter();
            else return true;
        }
        visibleEditTools() {
            return this.editTools.filter(function (tool) {
                if (!tool.filter) return true;
                else return tool.filter()
            });
        }*/
    },
    computed: {
        selectedBlock() {
            return this.post.blocks[this.selectedIndex];
        },
        toolbarStyle() {
            return (this.selectedIndex < 0) ? { visibility: "hidden" } : null;
        },
        visibleEditTools() {
            var excluded = [];
            if (this.editing) excluded.push("edit");
            else excluded.push("save");

            if (this.selectedIndex <= 0) excluded.push("move up");
            else if (this.selectedIndex >= this.post.blocks.length - 1) excluded.push("move down");

            var tools = this.editTools.filter(tool => {
                return !excluded.includes(tool.text);
            })

            return tools;
        }
    },
    data() {
        return{

        post: {},
        editing: false,
        selectedIndex: -1,
        addTooltip: "tooltip",
        editTools: [
            {
                icon: "svg/angle-up.svg",
                text: "move up",
                show: true
            },
            {
                icon: "svg/edit.svg",
                text: "edit",
                show: true,
                filter: function() {return !this.editing;}
            },
            {
                icon: "svg/check.svg",
                text: "save",
                show: true,
                filter: function() {return this.editing;}
            },
            {
                icon: "svg/wrench.svg",
                text: "change",
                show: false
            },
            {
                icon: "svg/trash-alt.svg",
                text: "delete",
                show: true
            },
            {
                icon: "svg/angle-down.svg",
                text: "move down",
                show: true
            },
        ],
        addTools: [
            {
                icon: "svg/heading.svg",
                text: "Add heading",
                type: "h2"
            },
            {
                icon: "svg/paragraph.svg",
                text: "Add paragraph",
                type: "p"
            },
            {
                icon: "svg/image.svg",
                text: "Add image",
                type: "img"
            },
            {
                icon: "svg/quote-right.svg",
                text: "Add block quote",
                type: "blockquote"
            }
        ]
    }},
    components: {
        "s-block": sBlock,
        "s-article": sArticle
    }
}
