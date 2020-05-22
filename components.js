var sFormatted = {
    props: ['text'],
    render: function (h) {
        var el = this;

        if (this.text.indexOf("http") < 0) {
            return h('p', this.text);
        }
        var children = []

        var res = this.text;
        var pieces = res.split(" ");
        for (const p of pieces) {
            if (p.startsWith("http")) {
                children.push(h("a", {
                    domProps: {
                        innerHTML: this.shortLink(p)
                    },
                    attrs: {
                        href: p,
                        target: "_blank"
                    },
                }));
            }
            else if (p != " ") {
                children.push(p);
            }
            children.push(" "); //readd spaces
        }
        children.pop(); //trim last space

        return h('p', children);
    },
    methods: {
        shortLink(link) {
            var s = link.split("://")[1];
            s.replace("www.", "");
            return s;
        }
    }
}

var sText = {
props: ['item', 'editing'],
render(createElement) {
    var data = {};
    var type = this.item.type;
    data = {
        on: {
            click: this.onClick
        }
    };
    var child = [];
    if (this.editing == true) {
        child.push(createElement("textarea", {
            domProps: {
                innerHTML: this.item.content
            },
            attrs: {
                rows: this.rows(),
                placeholder: "Write here"
            },
            directives: [{
                name: 'focus'
            }],
            on: {
                input: this.onInput,
                keydown: this.onKeydown
            }
        }));
    }
    else if (!this.item.content) return null;
    else {
        data.domProps = {
            innerHTML: this.item.content
        };

    }

    return createElement(type, data, child);
},
directives: {
    focus: {
        inserted: function (el) {
            el.focus()
        }
    }
},
methods: {
    rows() {
        var el;

        if (!this.$el) return 1; //new block on the block
        else if (!this.$el.children || !this.$el.children[0]) {
            el = this.$el;
        }
        else {
            el = this.$el.children[0];
        }

        var computed = window.getComputedStyle(el);
        var lh = parseInt(computed.getPropertyValue('line-height'));
        var rows = parseInt(el.scrollHeight / lh);

        return rows;
    },
    onInput(event) {
        this.$emit('input', event.target.value);
        //this.$emit('update:text', event.target.value);
    },
    onClick() {
        this.$emit('click');
    },
    onKeydown(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    }
}
}

var sQuote = {
props: ['item', 'editing'],
template: '#s-quote-template',
methods: {
    onClick(){
        this.$emit('click');
    },
    onInput(value) {
        this.item.content = value;
    },
    onInputFooter(value) {
        this.item.footer = value;
    }
},
components: {
    "s-text" : sText
}
}

var sImage = {
props: ['item', 'editing'],
template: '#s-image-template',
methods: {
    onInput(event) {
        var file = event.target.value.split('\\').pop();
        this.$emit('input', file);
    },
    onClick() {
        this.$emit('click');
    }
}
}

var sBlock = {
template: '#s-block-template',
props: ['item', 'editing'],
components: {
    "s-quote": sQuote,
    "s-text": sText,
    "s-image": sImage
},
computed: {
    blocktype() {
        if (this.item.type == "img") {
            return "s-image"
        }
        else if (this.item.type == "blockquote") {
            return "s-quote";
        }
        else {
            return "s-text";
        }
    }
},
methods: {
    onClick() {
        this.$emit('click')
    },
    onInput(value) {
        this.item.content = value;
    }
}
}

var editTools = {
    template: `<aside>
        <ul id="editTools" :style="visibility">
            <li v-for="tool in visibleTools" v-if="tool.show">
                <span class="tooltip">{{tool.text}}</span>
                <img :src="tool.icon" class="icon" @click="useTool(tool)">
            </li>
        </ul>
    </aside>`,
    props: ["visible", "editing", "hiddenTools"],
    computed: {
        visibleTools() { //TODO
            var tools = this.tools.filter(tool => {
                return !this.hiddenTools.includes(tool.text);
            })

            return tools;
        },
        visibility() {
            return this.visible ? null : { visibility: "hidden" };
        }
    },
    methods: {
        useTool(tool) {
            this.$emit("useTool", tool.text);
        }
    },
    data: function() {
        return {
            tools: [
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
            ]
        }
    }
}

var addTools = {
    template: `<div id="addTools">
        <ul>
            <li v-for="tool in addTools" @mouseover="hover(tool.text)" @click="useTool(tool)">
                <img :src="tool.icon" class="icon">
            </li>
        </ul>
        <span class="tooltip">{{addTooltip}}</span>
    </div>`,
    methods: {
        hover(text) {
            this.addTooltip = text
        },
        useTool(tool) {
            this.$emit("useTool", tool.type);
        }
    },
    data: function() {
        return {
            addTooltip: "tooltip",
            addTools: [
                {
                    icon: "svg/heading.svg",
                    text: "Add heading",
                    type: "h3"
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
        }
    }
}
