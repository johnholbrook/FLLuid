class Scrollable{
    _current_scroll = 1;
    _updating = null;
    _last_time = null;
    _table = null;
    _current_img = 0;

    static _defaults = {
        "speed": 70,//pixels per second
        "fps": 45,//table scroll frames per second
        "tableClasses": "",//extra classes to apply to the table object
        "showStickyHeaders": true
    }

    /**
     * Initialize a scrollable display
     * @param {HTMLElement} display - The HTML element where the scrolling display will be shown
     * @param {Object} options - Display configuration options
     */
    constructor(display, options={}){
        //initialize options
        this.display = display;

        this.updateOptions(Scrollable._defaults, false);
        this.updateOptions(options, false);

        this.display.innerHTML = `<div style="/*display:inline-block; vertical-align:top;*/  position:fixed; left:50%; transform:translate(-50%); width:90%; background: white;"></div>
        <div style="position:fixed; left:50%; transform:translate(-50%); width:90%; z-index: -1;"></div>`;
        // this.scrollable_container = this.display.firstElementChild;
        this.sticky_headers_area = this.display.firstElementChild;
        this.scrollable_container = this.display.children[1];

        this.image_files = [];
    }

    /**
     * Update the specified options
     * @param {Object} options 
     */
    updateOptions(options, start=true){
        this.speed = options.hasOwnProperty("speed") ? options.speed : this.speed;
        this.fps = options.hasOwnProperty("fps") ? options.fps : this.fps;
        this.extraClasses = options.hasOwnProperty("extraClasses") ? options.extraClasses : this.extraClasses;
        this.showStickyHeaders = options.hasOwnProperty("showStickyHeaders") ? options.showStickyHeaders : this.showStickyHeaders;

        // this._updateStickyHeaders();
        if (start){
            this.start();
        }
    }

    /**
     * Set the content of the display
     * @param {String[]} content - 2D Array representing the table content
     * @param {Boolean} useHeaders - Treat first row of table as headers
     */
    setTable(content, useHeaders=true){
        this._table = this._generateTable(content, useHeaders);
        if (this.scrollable_container.childElementCount == 0 && this._table != null){
            this.scrollable_container.appendChild(this._table.cloneNode(true));
        }
    }

    /**
     * Set images to be displayed between instances of the table
     * @param {Array} imgs - Array of file paths to images
     */
    setImages(imgs){
        this.image_files = imgs
    }

    /**
     * Get the path of the next image to display
     * @returns {String}
     */
    _getNextImage(){
        this._current_img += 1;
        if (this._current_img >= this.image_files.length){
            this._current_img = 0;
        }
        return this.image_files[this._current_img];
    }

    /**
     * Start scrolling
     */
    start(){        

        this._last_time = Date.now();
        this.stop();
        this._updating = setInterval(this._advanceScroll.bind(this), 1000/this.fps);
        this._updateStickyHeaders();

        this._table.className = `scrollable-table ${this.extraClasses}`;
    }

    /**
     * Stop scrolling
     */
    stop(){
        clearInterval(this._updating);
    }

    /**
     * Generate an HTML table from the given content
     * @param {Array} content
     * @param {Boolean} useHeaders
     * @returns {HTMLElement}
     */
    _generateTable(content, useHeaders){
        let parser = new DOMParser();
        let doc = parser.parseFromString("", "text/html");
        let table = doc.createElement("table");
        table.className = `scrollable-table ${this.extraClasses}`;

        if (content == []) return null;

        // add first row as header (if applicable)
        if (useHeaders){
            let thead = doc.createElement("thead");
            let row = doc.createElement("tr");
            content[0].forEach(cell => {
                let tmp = doc.createElement("th");
                tmp.innerHTML = `<div>${cell}</div>`;
                row.append(tmp);
            });
            thead.append(row);
            table.append(thead);
        }

        //add subsequent rows
        let tbody = doc.createElement("tbody");
        content.slice(useHeaders?1:0, content.length+1).forEach(input_row => {
            let table_row = doc.createElement("tr");
            input_row.forEach(cell => {
                let tmp = doc.createElement("td");
                tmp.innerHTML = `<div>${cell}</div>`;
                table_row.append(tmp);
            });
            tbody.append(table_row);
        });
        table.append(tbody);

        return table;
    }

    /**
     * Advance the scrolling by the appropriate amount. Called once per frame.
     */
    _advanceScroll(){
        //update the position of the table
        let now = Date.now();
        let time_elapsed = now - this._last_time;
        let amt_to_scroll = time_elapsed * this.speed/1000;
        this._current_scroll += amt_to_scroll;
        this._last_time = now;

        this.scrollable_container.style.top = -this._current_scroll + "px";

        //has the top element gone off the screen? if so, remove it
        if (this._current_scroll >= this.scrollable_container.firstElementChild.offsetHeight) {
            // current_scroll = -1 * document.documentElement.clientHeight;
            // console.log("top element has gone off screen, removing it");
            let scrollable = this.scrollable_container;
            scrollable.removeChild(scrollable.firstElementChild);
            this._current_scroll = 0;
            scrollable.style.top = -this._current_scroll + 'px';

            this._updateStickyHeaders();
        }

        //is there new space at the bottom of the screen?
        //if so, insert a new element there (table or image, as appropriate)
        if (-1 * this._current_scroll + this.scrollable_container.offsetHeight < window.innerHeight) {
            if (this.scrollable_container.lastElementChild.tagName == 'IMG' || this.image_files.length == 0) {
                this.scrollable_container.appendChild(this._table.cloneNode(true));
            } else {
                let new_element = document.createElement('img');
                new_element.src = this._getNextImage();
                new_element.style.maxWidth = "100%";
                new_element.style.maxHeight = "50vh";
                new_element.style.display = "block";
                new_element.style.margin = "0 auto";
                this.scrollable_container.appendChild(new_element);
            }

        }
    
    }

    /**
     * Update the "sticky headers" at the top of the table
     */
    _updateStickyHeaders(){
        if (this.scrollable_container){
            if (this.showStickyHeaders){
                //create the table header element
                let header = document.createElement("table");
                header.className = `scrollable-sticky-header ${this.extraClasses}`;
                header.style.margin = 0;
    
                //build the initial list of headers
                // let th_list = this.scrollable_container.querySelectorAll("th");
                let th_list = this.scrollable_container.querySelector(".scrollable-table").querySelectorAll("th");
                let header_row = document.createElement("tr")
                th_list.forEach(item => {
                    let tmp = document.createElement("th");
                    tmp.innerHTML = item.innerHTML;
                    tmp.style.width = item.offsetWidth + 'px';
                    header_row.append(tmp);
                });
                header.append(header_row);
    
                this.sticky_headers_area.innerHTML = header.outerHTML;
            }
            else{
                this.sticky_headers_area.innerHTML = "";
            }
        }
    }
}

if (typeof module != 'undefined'){
    module.exports = Scrollable;
}