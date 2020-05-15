
Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

var app = new Vue({
    el: "#editor",
    methods: {
        blockIsEditing(i) {
            return (this.editing == true && i == this.selectedIndex);
        },
        addBlock(t) {
            this.unselect();

            this.blocks.push({
                type: t,
                content: ""
            });

            this.selectBlock(this.blocks.length-1);
            this.editing = true;
        },
        deleteBlock(i) {
            this.blocks.splice(i, 1);
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
                this.blocks.move(this.selectedIndex, this.selectedIndex-1);
                this.selectBlock(this.selectedIndex-1);
            }
            else if (tool.text == "move down" && this.selectedIndex < this.blocks.length - 1) {
                this.blocks.move(this.selectedIndex, this.selectedIndex+1);
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
            return this.blocks[this.selectedIndex];
        },
        toolbarStyle() {
            return (this.selectedIndex < 0) ? { visibility: "hidden" } : null;
        },
        visibleEditTools() {
            var excluded = [];
            if (this.editing) excluded.push("edit");
            else excluded.push("save");

            if (this.selectedIndex <= 0) excluded.push("move up");
            else if (this.selectedIndex >= this.blocks.length - 1) excluded.push("move down");

            var tools = this.editTools.filter(tool => {
                return !excluded.includes(tool.text);
            })

            return tools;
        }
    },
    data: {
        editing: false,
        selectedIndex: -1,
        addTooltip: "tooltip",
        blocks: [
            {
                type: "h2",
                content: "The Observation"
            },
            {
                type: "p",
                content: "It is a fairly easy observation to make: Digital interfaces are predominantly set in sans serif typefaces. Operating systems, mobile apps, way finding screens, they all feature fonts without serifs. Some reasons for this are more obvious than others. Looking at the relationship between digital interfaces and their typography can also offer a deeper insight into how we interact with technology."
            },
            {
                type: "h3",
                content: "Rendering fidelity: Heritage from the low-res past"
            },
            {
                type: "img",
                content: "q3kl2jtzr9f21.jpg"
            },
            {
                type: "p",
                content: "For the longest part of computing history the typography of visual user interfaces has been dictacted by low screen resolutions and their limitations. Bitmap fonts commonly had too little resolution to even consider serifs, and even carefully hinted vector fonts that started to appear in the 1990ies have long required a diligent typesetting hand. Especially in the smaller sizes they still ran the danger of becoming indiscernible blurry blobs. Since interfaces often have the implied additional constraint of condensing a lot of information into the available screen real-estate, the combination of serif fonts and small sizes has for a long time equalled sub-par legibility. In the current day of high DPI mobile screens and ultra HD televisions this seems less of a problem, technically speaking. Rendering fidelity, display resolution and anti-aliasing remain issues that still govern interface typesetting, and I am willing to bet they will continue to be for years to come."
            },
            {
                type: "blockquote",
                content: "Visual user interfaces has been dictacted by low screen resolutions and their limitations.",
                footer: "Matthew Gulliver"
            },
            {
                type: "p",
                content: "One joke."
            },
            {
                type: "p",
                content: "It is a fairly easy observation to make: Digital interfaces are predominantly set in sans serif typefaces. Operating systems, mobile apps"
            }
        ],
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
    },
    components: {
        "s-block" : sBlock
    }
})