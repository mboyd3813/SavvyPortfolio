function Boss () {

    this.isReady = false;

    this.initialize = function(options){

        this.type = 'Boss';

        this.name = options.name;
        this.options = options.properties;

        this.health = Number(this.options.health);

        this.isDead = false;
        this.isMoving = false;

        this.pos = {
            x: options.x,
            y: options.y
        };

        this.posCell = {
            x: options.x / scene.config.tileSize,
            y: options.y / scene.config.tileSize
        };

        this.nextCell = this.posCell;

        this.direction = directions.down;

        this.image = new Image();
        this.image.src = 'gfx/actors/' + this.options.sprite + '.png';

        this.isHover = false;

        this.animation = {
            offsetY: 0
        }

        this.attack = {
            damage: Number(this.options.attack),
            speed: Number(this.options.attackSpeed),
            counter: 30
        }

        this.warp = {
            speed: Number(this.options.warpSpeed),
            counter: Number(this.options.warpSpeed)
        }

        this.isReady = true;

    }

// ========================================================================== //
// ========================================================================== //

    this.setPosition = function (cellX, cellY) {

        this.posCell = {x:cellX, y:cellY};

        this.pos = {
            x: cellX * scene.config.tileSize,
            y: cellY * scene.config.tileSize
        }

        this.attack.counter = 0;
        this.warp.counter = 0;

    }

// ========================================================================== //
// ========================================================================== //

    this.rotateTo = function(direction){
        this.animation.offsetY = direction.offset;
    }

// ========================================================================== //
// ========================================================================== //

    this.update = function (){

        if (this.attack.counter > 0){
            this.attack.counter--;
            if (this.attack.counter == 0){
                this.attack.counter = this.attack.speed;
                this.attackPlayer();
            }
        }

        if (this.warp.counter > 0){
            this.warp.counter--;
            if (this.warp.counter == 0){
                this.warp.counter = this.warp.speed;
                this.nextCell.x = getRandomInt(1, world.map.width - 2);
                this.nextCell.y = getRandomInt(1, world.map.height - 2);
                this.isMoving = true;
            }
        }

        if (this.isMoving){

            var nX = this.nextCell.x * scene.config.tileSize;
            var nY = this.nextCell.y * scene.config.tileSize;

            if (this.pos.x < nX) { this.pos.x += 8; }
            else if (this.pos.x > nX) { this.pos.x -= 8; }

            if (this.pos.y < nY) { this.pos.y += 8; }
            else if (this.pos.y > nY) { this.pos.y -= 8; }

            if (this.pos.x == nX && this.pos.y == nY){
                this.isMoving = false;
                this.posCell = this.nextCell;
                this.rotateToPlayer();
            }

        }

        return !this.isDead;

    }

// ========================================================================== //
// ========================================================================== //

    this.isVisible = function(){return true;}

// ========================================================================== //
// ========================================================================== //

    this.draw = function () {

        var screenX = this.pos.x - scene.camera.x - scene.config.tileSize;
        var screenY = this.pos.y - scene.camera.y - scene.config.tileSize;

        var frameX = 0;
        var frameY = this.animation.offsetY * scene.config.tileSize * 3;

        scene.context.drawImage(
            this.image,
            frameX, frameY, scene.config.tileSize*3, scene.config.tileSize*3,
            screenX, screenY, scene.config.tileSize*3, scene.config.tileSize*3
        );

    }

// ========================================================================== //
// ========================================================================== //

    this.rotateToPlayer = function(){

        var playerPos = world.player.posCell;

        var dirLeftRight = false;
        var dirUpDown = false;

        if (playerPos.x < this.posCell.x){
            dirLeftRight = 'left';
        }

        if (playerPos.x > this.posCell.x){
            dirLeftRight = 'right';
        }

        if (playerPos.y < this.posCell.y){
            dirUpDown = 'up';
        }

        if (playerPos.y > this.posCell.y){
            dirUpDown = 'down';
        }

        if (dirLeftRight && dirUpDown){
            this.direction = directions[ dirLeftRight + '_' + dirUpDown ];
        }
        else if (dirLeftRight) {
            this.direction = directions[ dirLeftRight ];
        }
        else {
            this.direction = directions[ dirUpDown ];
        }

        this.animation.offsetY = this.direction.offset;

    }

// ========================================================================== //
// ========================================================================== //

    this.onMouseOver = function(){}
    this.onMouseOut = function(){}

    this.setHover = function(isHoverNow){
        if (isHoverNow && !this.isHover){this.onMouseOver();}
        if (!isHoverNow && this.isHover){this.onMouseOut();}
        this.isHover = isHoverNow;
    }

// ========================================================================== //
// ========================================================================== //

    this.onPlayerTouch = function(){  }

    this.onPlayerChangePos = function(){
        this.rotateToPlayer();
    }

    this.onPlayerChangeMap = function(newMap){
        return false;
    }

// ========================================================================== //
// ========================================================================== //

    this.spawnText = function(text, textColor){
        if (typeof(textColor)=='undefined'){textColor='255,255,255';}
        world.sprites.push(new TextSprite({
            text: text,
            cellX:this.posCell.x,
            cellY:this.posCell.y-1,
            color: textColor
        }));
    }

    this.spawnSprite = function(options, callback){
        world.sprites.push(new Sprite(options, callback));
    }

// ========================================================================== //
// ========================================================================== //

    this.attackPlayer = function(){

        var playerPos = world.player.posCell;

        world.sprites.push(new BulletSprite({
            fromCellX: this.posCell.x,
            fromCellY: this.posCell.y,
            toCellX: playerPos.x,
            toCellY: playerPos.y,
            sprite: 'fireball',
            speed: 6
        }));

        return true;

    }

// ========================================================================== //
// ========================================================================== //

    this.hit = function(damage){

        this.health -= damage;

        var color = '255,0,0';
        this.spawnText('-'+damage, color);

        if (this.health <= 0){this.die();}

    }

    this.onHit = function(damage){}

    this.die = function(){

        this.spawnSprite({
            sprite:'effects/explosion',
            cellX:this.posCell.x,
            cellY:this.posCell.y,
            frames:40,
            cols:8,
            rows:5,
            speed: 1
        });

        game.saveActorState(game.currentMap, this.name, 'isExists', 0);

        this.isDead = true;

    }

// ========================================================================== //
// ========================================================================== //

    this.hitTestCell = function(cell) {

        if ((cell.x >= this.posCell.x-1) &&
            (cell.x <= this.posCell.x+1) &&
            (cell.y >= this.posCell.y-1) &&
            (cell.y <= this.posCell.y+1)) {
            return true;
        } else {
            return false;
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.distanceToActor = function(actor){

        var dX = Math.abs(this.posCell.x - actor.posCell.x);
        var dY = Math.abs(this.posCell.y - actor.posCell.y);

        var dist = Math.round(Math.sqrt(dX*dX + dY*dY))-2;

        return dist;

    }

// ========================================================================== //
// ========================================================================== //

}