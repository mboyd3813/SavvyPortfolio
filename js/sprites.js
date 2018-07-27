function Sprite (options) {

    this.isReady = false;

    this.pos = {
        x: (options.cellX * scene.config.tileSize) + (scene.config.tileSize / 2),
        y: (options.cellY * scene.config.tileSize) + (scene.config.tileSize / 2)
    };

    if (!("rows" in options)) {options.rows = 1;}
    if (!("cols" in options)) {options.cols = options.frames;}
    if (!("speed" in options)) {options.speed = 2;}
    if (!("isForever" in options)) {options.isForever = false;}

    this.speed = options.speed;
    this.counter = 0;
    this.frame = 1;
    this.framesCount = options.frames;
    this.colsCount = options.cols;
    this.rowsCount = options.rows;
    this.col = 0;
    this.row = 0;
    this.offsetY = 0;
    this.isForever = options.isForever;

    this.image = new Image();
    this.image.sprite = this;
    this.image.onload = function() {

        this.sprite.isReady = true;

        this.sprite.frameWidth  = this.width / this.sprite.colsCount;
        this.sprite.frameHeight = this.height / this.sprite.rowsCount;

    }

    this.image.src = 'gfx/sprites/' + options.sprite + '.png';

// ========================================================================== //
// ========================================================================== //

    this.setPosition = function(cellX, cellY){
        this.pos = {
            x: (cellX * scene.config.tileSize) + (scene.config.tileSize / 2),
            y: (cellY * scene.config.tileSize) + (scene.config.tileSize / 2)
        };        
    }

// ========================================================================== //
// ========================================================================== //

    this.draw = function () {

        if (!this.isReady) {return true;}

        var screenX = this.pos.x - scene.camera.x - (this.frameWidth / 2);
        var screenY = this.pos.y - scene.camera.y - (this.frameHeight / 2);

        var frameX = this.col * this.frameWidth;
        var frameY = this.row * this.frameHeight;

        scene.context.drawImage(
            this.image,
            frameX, frameY, this.frameWidth, this.frameHeight,
            screenX, screenY, this.frameWidth, this.frameHeight
        );

        return this.animationNextFrame();

    }

// ========================================================================== //
// ========================================================================== //

    this.animationNextFrame = function (){

        this.counter++;

        if (this.counter == this.speed){

            this.counter = 0;
            this.col++;
            this.frame++;

            if (this.col >= this.colsCount){
                this.row++;
                this.col = 0;
            }

            if (this.frame > this.framesCount){
                if (this.isForever){
                    this.row = 0;
                    this.col = 0;
                    this.frame = 1;
                    return true;
                } else {
                    return false;
                }
            }

        }

        return true;

    }

}

// ========================================================================== //
// ========================================================================== //
// ========================================================================== //
// ========================================================================== //

function TextSprite (options) {

    this.isReady = false;

    this.pos = {
        x: (options.cellX * scene.config.tileSize) + (scene.config.tileSize / 2),
        y: (options.cellY * scene.config.tileSize) - (scene.config.tileSize / 2)
    };

    this.text = options.text;

    this.speed = 2;
    this.counter = 0;
    this.frame = 0;
    this.framesCount = 30;

    this.color = options.color;
    this.speedUp = 2;

    this.isReady = true;

// ========================================================================== //
// ========================================================================== //

    this.draw = function () {

        if (!this.isReady) {return true;}

        scene.context.font = '15pt Arial';

        var metrics = scene.context.measureText(this.text);
        var width = metrics.width;

        var screenX = this.pos.x - scene.camera.x - (width / 2);
        var screenY = this.pos.y - scene.camera.y - (this.frame * this.speedUp);

        scene.context.fillStyle = '#000000';
        scene.context.fillText(this.text, screenX+1, screenY+1);

        scene.context.fillStyle = 'rgb(' + this.color +')';
        scene.context.fillText(this.text, screenX, screenY);

        return this.animationNextFrame();

    }

// ========================================================================== //
// ========================================================================== //

    this.animationNextFrame = function (){

        this.counter++;

        if (this.counter == this.speed){

            this.counter = 0;
            this.frame++;

            if (this.frame > this.framesCount){
                return false;
            }

        }

        return true;

    }

}

// ========================================================================== //
// ========================================================================== //
// ========================================================================== //
// ========================================================================== //

function BulletSprite (options, explodeCallback) {

    this.isReady = false;

    this.pos = {
        x: (options.fromCellX * scene.config.tileSize) + (scene.config.tileSize / 2),
        y: (options.fromCellY * scene.config.tileSize) + (scene.config.tileSize / 2)
    };

    this.dest = {
        x: (options.toCellX * scene.config.tileSize) + (scene.config.tileSize / 2),
        y: (options.toCellY * scene.config.tileSize) + (scene.config.tileSize / 2),
        cellX: options.toCellX,
        cellY: options.toCellY
    };
    
    this.damage = {
        radius: options.damageRadius,
        amount: options.damageAmount
    }

    this.speed = options.speed;
    
    if (typeof(explodeCallback) == 'function') {this.explodeCallback = explodeCallback;}
    
    this.explodeSprite = ("explodeSprite" in options) ? options.explodeSprite : false;

    this.image = new Image();
    this.image.sprite = this;
    this.image.onload = function() {
        this.sprite.initialize();
    }

    this.image.src = 'gfx/sprites/' + options.sprite + '.png';

// ========================================================================== //
// ========================================================================== //

    this.initialize = function(){

        var dX = this.dest.x - this.pos.x;
        var dY = this.dest.y - this.pos.y;

        this.angle = Math.atan2(dY, dX);

        this.isReady = true;

    }

// ========================================================================== //
// ========================================================================== //

    this.draw = function () {

        if (!this.isReady) {return true;}

        var screenX = this.pos.x - scene.camera.x;
        var screenY = this.pos.y - scene.camera.y;

        scene.context.drawRotatedImage(
            this.image,
            screenX, screenY, this.angle
        );

        return this.animationNextFrame();

    }

// ========================================================================== //
// ========================================================================== //

    this.animationNextFrame = function (){

        this.pos.x = this.pos.x + this.speed * Math.cos(this.angle);
        this.pos.y = this.pos.y + this.speed * Math.sin(this.angle);

        var cellX = Math.floor(this.pos.x / scene.config.tileSize);
        var cellY = Math.floor(this.pos.y / scene.config.tileSize);
        
        if (world.isObstacleAt(cellX, cellY)){
            return this.explode(cellX, cellY);
        }

        if (Math.abs(this.pos.x - this.dest.x) <= this.speed && Math.abs(this.pos.y - this.dest.y) <= this.speed){
            return this.explode(cellX, cellY);
        }

        return true;

    }

// ========================================================================== //
// ========================================================================== //

    this.explode = function(cellX, cellY){

        if ("explodeCallback" in this) {
            this.explodeSprite.setPosition(cellX, cellY);
            this.explodeCallback(cellX, cellY, this.damage.radius, this.damage.amount, this.explodeSprite);
        }

        return false;
        
    }

// ========================================================================== //
// ========================================================================== //

}