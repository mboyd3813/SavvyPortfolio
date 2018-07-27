
function Actor () {

    this.topOffset = 0;

    this.isReady = false;

    this.initialize = function(options){

        this.name = options.name;

        this.pos = {x:options.x, y:options.y};

        this.posCell = {
            x: options.x/scene.config.tileSize,
            y: options.y/scene.config.tileSize
        };

        this.posDest = this.posCell;
        this.nextCell = this.posCell;
        this.isMoving = false;
        this.direction = directions.down;
        this.hasDestination = false;
        this.destinationCallback = null;
        this.path = [];

        this.disabled = false;

        this.options = options.properties;
        
        this.isSolid = ("isSolid" in this.options) ? Number(this.options.isSolid): 1;

        this.speed = ("speed" in this.options) ? Number(this.options.speed): 2;
        this.isFollower = ("isFollower" in this.options) ? Boolean(Number(this.options.isFollower)): false;

        // is walking?
        this.isWalk = ("isWalk" in this.options) ? Boolean(Number(this.options.isWalk)): false;

        // if walking is not enabled, BUT player followed - then enable walking
        if (!this.isWalk && this.isFollower) {this.isWalk = true;}

        // how far can actor walk from start point?
        this.walkRadius = ("walkRadius" in this.options) ? Number(this.options.walkRadius) : false;

        // prepare other walking parameters
        this.walkPause = ("walkPause" in this.options) ? Number(this.options.walkPause) : 100;
        this.walkCooldown = 10;
        this.walkZone = {
            minX: this.posCell.x - this.walkRadius,
            maxX: this.posCell.x + this.walkRadius,
            minY: this.posCell.y - this.walkRadius,
            maxY: this.posCell.y + this.walkRadius
        };

        this.image = new Image();
        this.image.src = 'gfx/actors/' + this.options.sprite + '.png';

        // always animated?
        this.alwaysAnimated = ("alwaysAnimated" in this.options) ? Number(this.options.alwaysAnimated) : false;

        this.animation = {
            isActive: this.alwaysAnimated,
            speed: 6,
            counter: 0,
            frame: 1,
            framesCount: 3,
            offsetY: 0
        }

        // where is actor looking to?
        if ("face" in this.options) {
            this.rotateTo(directions[this.options.face]);
        }
        
        this.attack = {counter: 0, isReady: true}

        this.skills = {}

        this.isHover = false;

        this.onInitialize();

        this.isReady = true;

    }

    this.onInitialize = function() { }

// ========================================================================== //
// ========================================================================== //

    this.disable = function(){
        this.stop();
        this.disabled = true;
    }

    this.enabled = function(){
        this.disabled = false;
    }

// ========================================================================== //
// ========================================================================== //

    this.getSkills = function(){
        return this.skills;
    }

// ========================================================================== //
// ========================================================================== //

    this.setPosition = function (cellX, cellY) {

        this.posCell = {x:cellX, y:cellY};

        this.posDest = this.posCell;
        this.nextCell = this.posCell;

        this.pos = {
            x: cellX * scene.config.tileSize,
            y: cellY * scene.config.tileSize
        }

        this.isMoving = false;

        this.onSetPosition();

    }

    this.onSetPosition = function() { }

    this.setDestination = function (cellX, cellY, callback){

        if (this.disabled) {return;}

        this.posDest = {x:cellX, y:cellY};

        this.path = [];

        var startPoint = [this.posCell.x, this.posCell.y];
        var endPoint = [this.posDest.x, this.posDest.y];

        var result = [];
        var searchCount = 0;

        while(!result.length){

            result = AStar(world.getObstaclesGrid(this), startPoint, endPoint, "Euclidean");

            if (!result.length){

                searchCount++;

                if (searchCount == 5) {break;}

                if (this.posDest.x < this.posCell.x){endPoint[0]++;}
                else if (this.posDest.x > this.posCell.x){endPoint[0]--;}

                if (this.posDest.y < this.posCell.y){endPoint[1]++;}
                else if (this.posDest.y > this.posCell.y){endPoint[1]--;}

            }

        }

        if (result.length){

            for(var k=0; k<result.length; k++){
                this.path.push({x:result[k][0], y:result[k][1]});
            }

            this.destinationCallback = (typeof(callback)=='function') ? callback : null;

        }

        this.onSetDestination();

    }

    this.onSetDestination = function() { }

// ========================================================================== //
// ========================================================================== //

    this.rotateTo = function(direction){
        this.animation.offsetY = direction.offset;
    }

// ========================================================================== //
// ========================================================================== //

    this.detectMoveDirection = function(){

        var dirLeftRight = false;
        var dirUpDown = false;

        if (this.nextCell.x < this.posCell.x){
            dirLeftRight = 'left';
        }

        if (this.nextCell.x > this.posCell.x){
            dirLeftRight = 'right';
        }

        if (this.nextCell.y < this.posCell.y){
            dirUpDown = 'up';
        }

        if (this.nextCell.y > this.posCell.y){
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

        this.isMoving = true;
        this.posCell = this.nextCell;
        this.rotateTo(this.direction);
        this.animationPlay();

    }

// ========================================================================== //
// ========================================================================== //

    this.move = function(){

        if (!this.isReady) {return;}

        var speed = this.speed;

        if (this.direction.x && this.direction.y){
            speed = Math.ceil(speed/2);
        }

        this.pos.x += speed * this.direction.x;
        this.pos.y += speed * this.direction.y;

        var nextX = this.nextCell.x * scene.config.tileSize;
        var nextY = this.nextCell.y * scene.config.tileSize;

        if (Math.abs(this.pos.x - nextX) <= speed && Math.abs(this.pos.y - nextY) <= speed){
            this.pos = {
                x: nextX,
                y: nextY
            }
            this.posCell = this.nextCell;
            this.isMoving = false;
            if (!this.alwaysAnimated){this.animationStop();}
            world.onActorChangePos(this);
            this.onChangePos();
            this.runDestinationCallback();
        }

        this.onMove();

    }

    this.onChangePos = function() { }
    this.onMove = function() { }

// ========================================================================== //
// ========================================================================== //

    this.stop = function(){
        this.path = [];
        this.stopFollowPlayer();
        this.runDestinationCallback();
    }

    this.runDestinationCallback = function(){
        if ((this.posCell.x == this.posDest.x) && (this.posCell.y == this.posDest.y) && (typeof(this.destinationCallback) == 'function')){
            this.destinationCallback();
        }
    }

// ========================================================================== //
// ========================================================================== //

    this.update = function (){

        if (!this.isReady) {return;}

        this.onBeforeUpdate();

        this.hasDestination = (this.path.length > 0);

        if ((this.hasDestination > 0) && !this.isMoving){
            this.nextCell = this.path.shift();
            if (!this.onNextCell()) {
                this.nextCell = this.posCell;
                this.path = [];
                this.onChangePos();
           }
        }

        if (((this.nextCell.x != this.posCell.x) || (this.nextCell.y != this.posCell.y)) && !this.isMoving) {
            this.detectMoveDirection();
        }

        if (this.isMoving) {
            this.move();
        }

        if (this.attack.counter > 0){
            this.attack.counter--;
            if (this.attack.counter == 0){
                this.attack.isReady = true;
            }
        }

        var distToPlayer = this.distanceToActor(world.player);  

        // try to set destination for walk
        if (this.options.isWalk && !this.hasDestination && !this.isMoving && distToPlayer > 1){

            if (this.walkCooldown == 0){

                var newX = getRandomInt(this.walkZone.minX, this.walkZone.maxX);
                var newY = getRandomInt(this.walkZone.minY, this.walkZone.maxY);

                if (!(newX==this.posCell.x && newY==this.posCell.y)){
                    this.walkCooldown = this.walkPause;
                    this.setDestination(newX, newY);
                }

            } else {
                this.walkCooldown--;
            }

        }

        return this.onUpdate(distToPlayer);

    }

    this.onNextCell = function() {return true;}

    this.onBeforeUpdate = function() { }
    this.onUpdate = function() {return true;}

// ========================================================================== //
// ========================================================================== //

    this.isVisible = function(){
        if (
            this.pos.x < scene.camera.x - scene.config.tileSize ||
            this.pos.x > scene.camera.x + scene.width ||
            this.pos.y < scene.camera.y - scene.config.tileSize ||
            this.pos.y > scene.camera.y + scene.height
        ){
            return false;
        } else {
            return true;
        }
    }

// ========================================================================== //
// ========================================================================== //

    this.draw = function () {

        this.onBeforeDraw();

        var screenX = this.pos.x - scene.camera.x;
        var screenY = this.pos.y - scene.camera.y + this.topOffset;

        var frameX = this.animation.frame * scene.config.tileSize;
        var frameY = this.animation.offsetY * scene.config.tileSize;

        scene.context.drawImage(
            this.image,
            frameX, frameY, scene.config.tileSize, scene.config.tileSize,
            screenX, screenY, scene.config.tileSize, scene.config.tileSize
        );

        this.animationNextFrame();

        this.onDraw();

    }

    this.onBeforeDraw = function() { }
    this.onDraw = function() { }

// ========================================================================== //
// ========================================================================== //

    this.animationNextFrame = function (){

        if (!this.animation.isActive){return;}

        this.animation.counter++;

        if (this.animation.counter == this.animation.speed){

            this.animation.counter = 0;
            this.animation.frame++;

            if (this.animation.frame >= this.animation.framesCount){
                this.animation.frame = 0;
            }

        }

    }

    this.animationPlay = function (){

       this.animation.isActive = true;

    }

    this.animationStop = function (){

        this.animation.isActive = false;
        this.animation.frame = 1;
        this.animation.counter = 0;

    }

// ========================================================================== //
// ========================================================================== //

    this.directionToCell = function(cell){

        var dirLeftRight = false;
        var dirUpDown = false;
        var direction = directions.down;

        if (cell.x < this.posCell.x){dirLeftRight = 'left';}
        if (cell.x > this.posCell.x){dirLeftRight = 'right';}
        if (cell.y < this.posCell.y){dirUpDown = 'up';}
        if (cell.y > this.posCell.y){dirUpDown = 'down';}

        if (dirLeftRight && dirUpDown){
            direction = directions[ dirLeftRight + '_' + dirUpDown ];
        }
        else if (dirLeftRight) {
            direction = directions[ dirLeftRight ];
        }
        else {
            direction = directions[ dirUpDown ];
        }

        return direction;

    }

    this.hitTestCell = function(cell) {

        if ((cell.x == this.posCell.x) && (cell.y == this.posCell.y)) {
            return true;
        } else {
            return false;
        }

    }
    
    this.distanceToCell = function(cell){

        var dX = Math.abs(this.posCell.x - cell.x);
        var dY = Math.abs(this.posCell.y - cell.y);

        var dist = Math.round(Math.sqrt(dX*dX + dY*dY));

        return dist;

    }    

// ========================================================================== //
// ========================================================================== //

    this.distanceToActor = function(actor){

        var dX = Math.abs(this.posCell.x - actor.posCell.x);
        var dY = Math.abs(this.posCell.y - actor.posCell.y);

        var dist = Math.round(Math.sqrt(dX*dX + dY*dY));

        return dist;

    }

    this.directionToActor = function(actor){
        return this.directionToCell(actor.posCell);
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

    this.onPlayerChangePos = function(){

        if (!this.isFollower) {return false;}

        if (this.distanceToActor(world.player) <= 1) {return false;}

        var playerPos = world.player.posCell;

        this.setDestination(playerPos.x, playerPos.y);

        Array.remove(this.path, -1);

    }

    this.onPlayerChangeMap = function(newMap){

        if (!this.isFollower) {return false;}

        if (this.distanceToActor(world.player) > 6) {return false;}

        world.onActorChangeMap(this, newMap);

    }

// ========================================================================== //
// ========================================================================== //

    this.followPlayer = function(){this.isFollower = true;}
    this.stopFollowPlayer = function(){this.isFollower = false;}

// ========================================================================== //
// ========================================================================== //

    this.spawnText = function(text, textColor){

        if (typeof(textColor)=='undefined'){textColor='255,255,255';}

        world.sprites.push(new TextSprite({
            text: text,
            cellX:this.posCell.x,
            cellY:this.posCell.y,
            color: textColor
        }));

    }

    this.spawnSprite = function(options, callback){

        world.sprites.push(new Sprite(options, callback));

    }

// ========================================================================== //
// ========================================================================== //

    this.attackActor = function(actor, direction){

        if (!this.attack.isReady){return false;}

        this.attack.isReady = false;
        this.attack.counter = 100 - (this.getSkills().hitSpeed * 10);

        this.spawnSprite({
            sprite:'effects/swing'+direction.offset,
            cellX:this.posCell.x,
            cellY:this.posCell.y,
            frames:12,
            cols:4,
            rows:3,
            speed: 1
        });

        var attackMin = this.getSkills().attack - 1;if (attackMin <= 0) {attackMin = 1;}
        var attackMax = this.getSkills().attack + 1;

        var attackPower = getRandomInt(attackMin, attackMax);

        actor.hit(attackPower);

        return true;

    }

// ========================================================================== //
// ========================================================================== //

    this.hit = function(damage){

        var realDamage = damage - this.getSkills().armor;

        if (realDamage <= 0) {realDamage = 1;}

        this.health -= realDamage;

        var color = (this.type=='Player') ? '255,0,0': '0,255,0';
        this.spawnText('-'+realDamage, color);

        this.onHit(realDamage);

        if (this.health <= 0){this.die();}

    }

    this.onHit = function(damage){}

    this.die = function(){
        this.onDie()
    }

    this.onDie = function(){}

// ========================================================================== //
// ========================================================================== //

    this.say = function(textOrQuest, callback){
        showActorMessage(this, textOrQuest, callback);
    }

// ========================================================================== //
// ========================================================================== //

}