//#import {Howl, Howler} from 'howler/howler.js/dist/howler.js';

function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function valid (testee){
    var is_valid = false;
    var is_valid = (typeof testee != 'undefined');
    is_valid = is_valid && (testee != null);
    if (is_valid){
        if (typeof testee == "string") {
            testee = testee.trim();
            if (testee.length < 1){
                is_valid = false;
            }
        }
    };
    return is_valid;
}

// map between two linear ranges
function linlin (x, lowIn, highIn, lowOut, highOut){
    var result = lowOut;
    if(x <= lowIn){
        result = lowOut;
    } else { 
        if (x>=highIn) {
            result = highOut;
        } else {
            result = ((x-lowIn)/(highIn-lowIn)) * ((highOut-lowOut)) + lowOut;
        }
    }
    return result;
}

function sortAudioByX(audio_json){
    //[$x, $y, $dir, $wav, $flac, $meta, $tags, $dur, $user]
    //var keys = Object.keys(users);
    var sortedflacs = audio_json.sort(function(a, b) {
        var ax = a[0];
        var bx = b[0];
        if (ax < bx) {
            return -1; //nameA comes first
        }
        if (ax > bx) {
            return 1; // nameB comes first
        }
        return 0;  // names must be equal
    });
    return sortedflacs;
}

function getNRandSorted(audio_json, n){

    var arr = [];
    for(i=0; i<n ; i++){
        arr.push(audio_json[Math.floor(Math.random() * audio_json.length)]);
    };

    arr = sortAudioByX(arr);
    return arr;
}

function getNRandSortedExcluding(audio_json, n, excluded){

    var arr = [];
    var picked;
    var tries = 0;
    var index;
    var indexes=[];

    while((arr.length < n) && (tries < (n*3))){
        index = Math.floor(Math.random() * audio_json.length);
        picked = audio_json[index];
        if (!excluded.includes(picked)){
            arr.push(picked);
        } else {console.log("already present");}
        tries++;
    };

    //arr = sortAudioByX(arr);
    arr.sort(function(a,b){return(a[0]-b[0])});
    return arr;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function rrand(low, high){
    var mulval = high-low;
    var num = Math.random() * mulval;
    num = num + low;
    return num;
}

class ImgHandler {
    constructor(url, div, width, height, disp_h, scroller){
        this.url = url;
        //this.img = new Image();
        //this.img.src = this.url; 
        this.width =width;
        this.height= height;
        this.ratio = width/height;
        
        this.disp_w = this.ratio * disp_h;//div.offsetHeight;
        this.disp_h = disp_h; //div.offsetHeight;

        this.points = [];
        this.canvas;
        this.ctx;
        this.div = div;
        this.active = true;
        this.unused = true;
        this.fading = false;
        this.scroller = scroller;
        this.opacity = 0;
        

        this.setUrl = function(url) {
            this.url = url;
            if(valid(this.img)){
                this.img.src = this.url;
                var self = this;
                this.img.onload = function(){

                    // get data
                    //self.width = self.img.naturalWidth;
                    //self.height = self.img.naturalHeight;
                    //self.ratio = self.width / self.height;

                    // set size and location based on the holder
                    self.img.classList.add("playback-img") ; //"arr-img anchor-img";
                    //self.img.height = div.clientHeight;
                    //self.img.width = div.clientWidth;
                    //var w, h;
                    //w = self.img.style.getPropertyValue("width");
                    //h = self.img.style.getPropertyValue("height");
                    self.img.width = self.disp_w;
                    self.img.height = self.disp_h;

                    // try to make the images the same
                    self.img.style.flex = "0 0 " + self.disp_w + "px";

                    //console.log("w " + w + " h " + h);

                    //var x_offset = self.div.offsetLeft;
                    //var y_offset = self.div.offsetTop;:
                    
                    self.img.style.opacity = self.opacity;//img.style.opacity

                    self.img.style.objectFit = "cover";
                    self.img.style.overflow = "hidden";

                    div.appendChild(self.img);
                    self.img.style.opacity = self.opacity; //0 // double check
                    self.img.style.position = "absolute";
                    var border = 2;
                    //console.log(div.style.borderWidth);
                    if(valid(div.style.borderWidth)){
                        border = div.style.borderWidth;
                        console.log("border " + border);
                    }

                    this.ot = div.offsetTop + border;
                    this.ol = div.offsetLeft + border;
                    self.img.style.top = this.ot + "px";//div.style.left + 'px';//self.left + 'px';
                    self.img.style.left = this.ol + "px";//div.style.top + 'px';//self.top + 'px';

                    if(valid(self.canvas)){
                        /*
                        var h = div.clientHeight;
                        var x_offset = this.img.offsetLeft;
                        var y_offset = this.img.offsetTop;

                        canvas.height = h;
                        canvas.width =  h * this.ratio;

                        canvas.style.left = x_offset + 'px';
                        canvas.style.top = y_offset + 'px';
                        */
                       self.setCanvas(self.canvas);
                    }
                    
                    
                    
                }
            }
        }


        this.img = new Image(div.width, div.height);
        this.img.style.opacity = 0;
        this.setUrl(url);
        
        //this.img.class = "arr-img";
        

        this.setImg = function(img){
            this.img = img;
            if(valid(img)){
                if(this.img.naturalHeight > 0){
                    this.width = this.img.naturalWidth;
                    this.height = this.img.naturalHeight;
                    this.ratio = this.width / this.height;
                }
            }
        }


        this.getPercent = function(x, y){
            var percent = 0;
            if (this.width > 0){ // width loads asynchornously
                percent = (x/this.width) * 100;
            }
            return(percent);
        }


        this.setPercent = function(percent){
            if(valid(this.img)){
            this.img.style.objectPosition = percent + "% 0";
            }
        }

        this.setXVisible = function (x){
            var percent = this.getPrecent(x,0);
            this.setPercent(percent);
        }

        this.setCanvas = function (canvas){
            if (valid(canvas)){
                if(valid(this.img)){
                    var x_offset = this.img.offsetLeft;
                    var y_offset = this.img.offsetTop;
                    var w = this.img.clientWidth;
                    var h = this.img.clientHeight;
                    // surely the canvas is already there?
                    //var imgParent = this.img.parentNode;
                    //imgParent.appendChild(canvas);
                    canvas.style.zIndex = 100;
                    //var wBh = 0;
                    //if(this.height> 0) {
                    //    wBh = this.width / this.height;
                    //}

                    canvas.height = h;
                    canvas.width =  h * this.ratio; //wBh; // (c.w/c.h = wBh)

                    // position it over the image
                    canvas.style.left = x_offset + 'px';
                    canvas.style.top = y_offset + 'px';
                    
                    
                }

                canvas.style.flex = "0 0 " + self.disp_w + "px";

                canvas.style.objectFit = "cover";
                canvas.style.overflow = "hidden";

                this.canvas = canvas;
                this.ctx = this.canvas.getContext('2d');
                this.ctx.fillStyle = 'red';
                this.ctx.strokeStyle = 'red';
                this.ctx.lineWidth = 2;

                console.log("set canvas");
            }
        }

        this.drawPoint = function(x, y, r){
            //this.setXVisible(x);

            if(this.unused){
                // re-initiatise the canvas
                this.unused = false;
                this.setCanvas(this.canvas);
            }
            
            //this.setPercent(percent);
            if (valid(this.canvas) && valid (this.ctx)){
                // draw the new point

                var percent = this.getPercent(x,y);

                //$scaleh = 360;
                //$scalew = $ratio * $scaleh;
                // $percentx = ($x/$width); //* 100;
                //$percenty = ($y/$height);
                //$scalex = floor($scalew * $percentx);
                //$scaley = floor($scaleh * $percenty);
                var percentx = percent;
                var percenty = 0;
                if(this.height > 0){
                    percenty = y/ this.height * 100;
                }
                var scaledX = Math.floor(this.canvas.width * (percentx/ 100));
                var scaledY = Math.floor(this.canvas.height * (percenty/ 100));  
                
                var radius = r;
                if(!valid(radius)){
                    radius = 5;
                }

                this.ctx = this.canvas.getContext('2d');
                this.ctx.fillStyle = 'red';
                this.ctx.strokeStyle = 'red';
                this.ctx.lineWidth = 2;

                // Just one point at a time
                this.clearPoints();
        
                this.ctx.beginPath();
                this.ctx.arc(scaledX, scaledY, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();

                this.img.style.objectPosition = percent + "% 0";
                this.canvas.style.objectPosition = percent + "% 50%"
                console.log("Drew " + x + ", " + y + ", " + scaledX + ", " + scaledY);
            } else {
                console.log("Couldn't draw");
            }

        }

        

        this.clearPoints = function(){
            //this.points = [];
            if(valid(this.ctx) && valid(this.canvas)){
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        this.fadeOut = function() {
            this.active = false;
            this.fading = true;
            console.log("fadeOut");
            if(valid(this.img)){
                self = this;
                var fadefunc = function(){
                    var fading = false;
                    if(valid(self.img)){
                        if(valid(self.img.style.opacity)){
                            if(self.opacity > 0){
                                self.opacity = self.opacity - 0.1;
                                self.img.style.opacity = self.opacity;
                                fading = true;
                                setTimeout(fadefunc, 100);
                                console.log("fading");
                            } else {
                                self.img.style.zIndex = -1;
                                //self.img.class = "arr-img";
                            }
                        } else {console.log("not opaque");}
                    }
                    self.fading = fading;
                }
                setTimeout(fadefunc, 10);
            }
            
        }

        this.fadeIn = function() {

            this.active = true;
            this.fading = true;

            console.log("fadeIn ")

            if(valid(this.img)){

                // bring it invisibly to the front
                //this.img.class = "playback-img" ;//"anchor-img playing-img";
                this.img.style.opacity = 0;

                if(valid(div)){
                    this.img.style.zIndex = div.childNodes.length;
                } else {
                    this.img.style.zIndex = 4;
                }

                

                self = this;
                
                var fadefunc = function(){
                    var fading = false;
                    if(valid(self.img)){
                        if(valid(self.img.style.opacity)){
                            if(self.opacity < 1){
                                self.opacity = self.opacity +0.1;
                                self.img.style.opacity = self.opacity;
                                fading = true;
                                setTimeout(fadefunc, 100);
                            }
                        }
                    }
                    self.fading = fading;
                }
                setTimeout(fadefunc, 10);
            }
        }

        this.id = function(id) {
            if(valid(this.img)){
                this.img.id = id;
            }
        }
    }
}

class Ramp {
    constructor() {

        this.mintime = 20;
        this.maxtime = 120;
        this.start = 0;
        this.middle = 0;
        this.end = 0;
        this.duration = 0;
        this.startTime = 0;

        this.init = function (start, startTime) {

            if (start) {
                this.start = start;
            } else {
                this.start = rrand(1, 5);
            }

            this.end = rrand(1, 5);
            this.middle = ((this.end - this.start) / 2) + this.start;


            this.duration = rrand(this.mintime, this.maxtime) * 1000;

            if (startTime) {
                this.startTime = startTime;
            } else {
                var d = new Date();
                this.startTime = d.getTime();
            }
        };

        this.init();

        this.value = function () {
            var d = new Date();
            var time = d.getTime();
            var elapsed = time - this.startTime;
            //var durmilis = this.duration * 1000;
            // figureing out the current time might include the computer going to sleep, etc
            if (elapsed > this.duration) {
                if ((elapsed) < (this.maxtime * 2)) {
                    var flag = true;
                    while (flag) {
                        this.init(this.end, this.startTime + this.duration);
                        flag = ((time - this.startTime) > this.duration);
                    }
                } else {
                    this.init();
                }
            }

            var slope = (this.end - this.start) / this.duration; //slope = rise over run
            return ((slope * elapsed) + this.start); // rise = slope * run

        };
    }
}


class AudioClip {
    constructor(json_arr, page_no, imgurl) {
        //[$x, $y, $dir, $wav, $flac, $meta, $tags, $dur, $user]
        this.x = json_arr[0];
        this.y = json_arr[1];
        this.tags = json_arr[6];
        this.scores = json_arr[5];
        this.artist = json_arr[8];
        this.pos = 0;
        this.ampltiude = 0.5;
        this.rate = 1;
        this.src = "processed_audio/" + [json_arr[2] + "/" + json_arr[4]];
        this.dur = -1;
        this.times = 1;
        this.loop = false;
        this.page_no = page_no;
        this.imgurl = imgurl;

        var self = this;

        this.howl = new Howl({
            src: this.src,
            preload: true,
            volume: this.amplitude,
            loop: false /*,
            onend: function(foo){
                if(valid(this.clip)){
                    if(this.clip.loop == false) {
                        if (valid(this.whenFinished)){
                            this.whenFinished();
                        }
                    } else { console.log("looping");
                        // shake things up a bit
                        this.clip.setRate(rrand(0.9, 1.1));
        
                        this.times = this.times -1;
                        this.clip.loop = (this.times> 1);
                    }
                }
            }   */
        });

        this.whenFinished = new function () { };

        this.arr = json_arr;
        //this.clip = "";
        //this.clip = new Howl ({ 
        //    src: this.src, 
        //    preload: true,
        //    volume: this.amplitude,
        //    loop: false ,
        //    onload:  function () {
        //        /*
        //        queue.push(howl);
        //        if (! started){
        //            started = true;
        //            //var active = queue.shift();
        //            setTimeout(player, rrand(200, 3000));
        //        }
        //        */
        //        this.dur = clip.duration();
        //    },
        //    onend: function() {
        //        this.unload();
        //    }
        //});
        this.pan = function (pos) {
            this.pos = pos;
            this.howl.stereo(pos);
        };
        this.amp = function (volume) {
            this.amplitude = volume;
            this.howl.volume(volume);
        };
        this.setRate = function (rate) {
            this.rate = rate;
            this.howl.rate(rate);
        };

        this.xcomparesort = function (a, b) {
            if (a.x < b.x) {
                return -1; //nameA comes first
            }
            if (a.x > b.x) {
                return 1; // nameB comes first
            }
            return 0; // names must be equal
        };

        this.xcompare = function (other) {
            return this.xcomparesort(this, other);
        };

        this.isCopy = function (other) {
            return (this.src == other.src);
        };

        this.loaded = function () {
            return (this.howl.state() == "loaded");
        };

        /*
        this.load = function() {
            this.clip = new Howl ({
                src: this.src,
                preload: true,
                volume: this.amplitude,
                loop: false
            });
    
            //this.clip.on("load",function(){
            //    dur = this.clip.duration();
            //});
            //this.clip.on("end", function(){
            //    this.unload();
            //})
        };
        */
        this.unload = function () {
            this.howl.unload();
        };

        //this.load();
        this.howl.on('load', function () {
            //console.log("dur " + self.howl.duration());
            self.dur = self.howl.duration();
        });
        //this.clip.on("end", function(){
        //    this.unload();
        //});
        //const fuck = Howl(this.clip);
        
        this.howl.on('end', function(){
            //console.log("this "+ typeof self);
            //console.log("howl "+ typeof self.howl);
            if(valid(self.howl)){
                if(self.loop == false) {
                    self.howl.loop(self.loop);
                    if (valid(self.whenFinished)){
                        if (typeof self.whenFinished == "function"){
                            self.whenFinished();
                        } else {
                            console.log("whenfinished is a " + typeof self.whenfinished);
                        }
                    }
                } else { console.log("looping");
                    // shake things up a bit
                    self.howl.rate(rrand(0.9, 1.1));
    
                    self.times--;
                    self.loop = (self.times> 1);
                    self.howl.loop(self.loop);
                }
            }else {
                console.log("not valid");
            }
        });
        
        //this.howl.on('end', function () {
        //    console.log("this " + typeof this);
        //    console.log("howl " + typeof self.howl);
        //});


        //this.dur = function(){
        //    return this.clip.duration();
        //}
        this.setRepeats = function (n) {
            this.times = n;
            this.loop = (n > 1);
            this.howl.loop(this.loop);
        };

        this.setFinished = function (doneAction) {
            this.whenFinished = doneAction;
        };

        
    }
}
