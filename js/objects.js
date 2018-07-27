function GameObject () {

    this.onInitialize = function() { }

    this.initialize = function(options) {
    
        this.name = options.name;

        this.isStepable = false;
        this.isTouchable = false;

		if (!options.properties) { options.properties = {}; }

        this.options = options.properties;

        this.isHover = false;

        this.state = ("state" in this.options) ? Number(this.options.state) : 0;
        this.nextState = false;
        this.nextStateCallback = null;

        this.pos = {
            x: options.x,
            y: options.y
        }

        this.posCell = {
            x: Math.round(options.x / scene.config.tileSize),
            y: Math.round(options.y / scene.config.tileSize)
        }

        this.size = {
            w: Math.round(options.width / scene.config.tileSize),
            h: Math.round(options.height / scene.config.tileSize),
            wPx: Number(options.width),
            hPx: Number(options.height)
        }

        this.animation = {
            isActive: false,
            speed: ("speed" in this.options) ? Number(this.options.speed) : 6,
            counter: 0,
            frame: 0,
            framesCount: ("frames" in this.options) ? Number(this.options.frames) : 2,
            offsetX: 0
        }

        if (this.state == 1){
            this.animation.frame = this.animation.framesCount - 1;
            this.animation.offsetX = this.animation.frame * this.size.wPx;
        }

        this.onInitialize();

    }

    this.onMouseOver = function(){}
    this.onMouseOut = function(){}

    this.setHover = function(isHoverNow){

        if (isHoverNow && !this.isHover){this.onMouseOver();}
        if (!isHoverNow && this.isHover){this.onMouseOut();}

        this.isHover = isHoverNow;

    }

    this.setState = function(state) {this.state = state;}
    this.getState = function() {return this.state;}

    this.hitTestCell = function(cell) {

        if (
            ((cell.x >= this.posCell.x) && (cell.x < (this.posCell.x + this.size.w))) &&
            ((cell.y >= this.posCell.y) && (cell.y < (this.posCell.y + this.size.h)))
        ) {
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
    
    this.distanceToActor = function(actor){

        var dX = Math.abs(this.posCell.x - actor.posCell.x);
        var dY = Math.abs(this.posCell.y - actor.posCell.y);

        var dist = Math.round(Math.sqrt(dX*dX + dY*dY));

        return dist;

    }

    this.update = function() { 
    
        var distToPlayer = this.distanceToActor(world.player);
    
        return this.onUpdate(distToPlayer);
        
    }
    
    this.onUpdate = function (distToPlayer){
        
        return true;
        
    }

    this.isVisible = function(){
        if (
            this.pos.x < scene.camera.x - (scene.config.tileSize * this.size.w) ||
            this.pos.x > scene.camera.x + scene.width ||
            this.pos.y < scene.camera.y - (scene.config.tileSize * this.size.h) ||
            this.pos.y > scene.camera.y + scene.height
        ){
            return false;
        } else {
            return true;
        }
    }

    this.draw = function(){ }

    this.onActorStep = function(actor) { }

    this.onPlayerTouch = function() { }

    this.animationNextFrame = function (){

        if (!this.animation.isActive){return;}

        this.animation.counter++;

        if (this.animation.counter == this.animation.speed){

            this.animation.counter = 0;

            var isFinish = false;

            if( this.nextState > this.state ){
                this.animation.frame++;
                if (this.animation.frame >= this.animation.framesCount-1){isFinish = true;}
            } else {
                this.animation.frame--;
                if (this.animation.frame <= 0){isFinish = true;}
            }

            if (isFinish){
                this.animationStop();
                this.setState(this.nextState);
                this.nextState = false;
                if (typeof(this.nextStateCallback)=='function'){
                    this.nextStateCallback();
                    this.nextStateCallback = null;
                }
            }

            this.animation.offsetX = this.animation.frame*this.size.wPx;

        }

    }

    this.animationPlay = function (){

       this.animation.isActive = true;

    }

    this.animationStop = function (){

        this.animation.isActive = false;
        this.animation.counter = 0;

    }
    
}

// ========================================================================== //
// ========================================================================== //

function SpawnObject () {
    
    GameObject.apply(this, arguments);

    this.onInitialize = function(){
        if (game.previousMap == null){            
            world.player.setPosition(this.posCell.x, this.posCell.y);
        }
    }
    
}

// ========================================================================== //
// ========================================================================== //

function PortalObject () {

    GameObject.apply(this, arguments);

    this.onInitialize = function(){

        this.isStepable = true;

        if ("from" in this.options) {
            if (this.options.from == game.previousMap){

                if (game.previousPortal == null || !("portal" in this.options) || this.options.portal == game.previousPortal){

                    world.player.setPosition(this.posCell.x, this.posCell.y);

                    if (typeof(this.options.face)!='undefined'){
                        world.player.rotateTo(directions[this.options.face]);
                    }
                    
                }

            }
        }

        this.isDark = ("isDark" in this.options) ? Boolean(Number(this.options.isDark)) : false;

    }

    this.onActorStep = function(actor){

        if (!("to" in this.options)) {return;}

        var nextMap = this.options.to;

        if (actor.type == 'Player'){
            if (this.isDark && (actor.getSkills().vision<4)){
                actor.stop();
                actor.say('There is too dark. I need a lamp to get in.');
                return;
            }
        }

        world.onActorChangeMap(actor, nextMap, this.name);

    }
    
}

// ========================================================================== //
// ========================================================================== //

function TriggerObject () {

    GameObject.apply(this, arguments);

    this.onInitialize = function(){
        this.isStepable = true;
    }

    this.onActorStep = function(actor){
        if (actor.type == this.options.target){
            actor[this.options.action]();
        }
    }

}

// ========================================================================== //
// ========================================================================== //

function SwitchObject () {

    GameObject.apply(this, arguments);

    this.onInitialize = function(){

        this.isTouchable = true;

        this.image = new Image();
        this.image.src = 'gfx/sprites/' + this.options.sprite + '.png';

        this.offsetY = 0;
        
        if(this.options.target.indexOf('[')>=0) { 
            this.options.target = JSON.parse(this.options.target);
        }
        
        if (!("map" in this.options)){
            this.options.map = game.currentMap;
            this.isRemote = false;
        } else {
            this.isRemote = true;
        }

    }

    this.onMouseOver = function(){this.offsetY = 1;}
    this.onMouseOut = function(){this.offsetY = 0;}
    this.onPlayerTouch = function(){this.toggle();}

    this.toggle = function(){        
        this.setState( Number( !this.state ) );
    }
    
    this.setState = function(state){

        this.state = state;
        this.offsetX = this.state;

        game.saveObjectState(game.currentMap, this.name, this.state);

        if ("target" in this.options){
            
            if (typeof(this.options.target) == 'string'){
                if (!this.isRemote){world.objects[this.options.target].toggle();}
                game.saveObjectState(this.options.map, this.options.target, this.state);
            }
            
            if (typeof(this.options.target) == 'object'){               
                for(var targetIdx in this.options.target){                                                            
                    var target = this.options.target[targetIdx];
                    console.log(target);
                    if (!this.isRemote){world.objects[target].toggle();}
                    game.saveObjectState(this.options.map, target, this.state);
                }
            }
            
        }
        
        if ("isLight" in this.options){
            world.map.options.isDark = !Boolean(this.state);
        }
        
    }

    this.draw = function(){

        var screenX = this.pos.x - scene.camera.x;
        var screenY = this.pos.y - scene.camera.y;
        
        var frameX = this.state * this.size.wPx;
        var frameY = this.offsetY *  this.size.hPx;
        
        scene.context.drawImage(
            this.image,
            frameX, frameY, this.size.wPx, this.size.hPx,
            screenX, screenY, this.size.wPx, this.size.hPx
        );
            
    }

}

// ========================================================================== //
// ========================================================================== //

function PlateObject () {

    GameObject.apply(this, arguments);

    this.onInitialize = function(){

        this.isStepable = true;

        this.isOnce = ("isOnce" in this.options) ? Number(this.options.isOnce) : 0;
        this.isPlayerOnly = ("isPlayerOnly" in this.options) ? Number(this.options.isPlayerOnly) : 0;
        this.isStopMoving = ("isStopMoving" in this.options) ? Number(this.options.isStopMoving) : 0;
        
        this.alreadyUsed = false;

        if (!("map" in this.options)){
            this.options.map = game.currentMap;
            this.isRemote = false;
        } else {
            this.isRemote = true;
        }

    }

    this.onActorStep = function(actor){

        if (!("target" in this.options)) {return;}
        
        if (this.isOnce && this.alreadyUsed) { return; }

        if (actor.type == 'Player' || !this.isPlayerOnly){            
            if (this.isStopMoving) { actor.stop(); }
            this.alreadyUsed = true;            
            if (!("target" in this.options)) {return;}
            this.toggle();
        }

    }

    this.toggle = function(){        
        this.setState( Number( !this.state ) );
    }
    
    this.setState = function(state){

        this.state = state;
        this.offsetX = this.state;

        game.saveObjectState(game.currentMap, this.name, this.state);

        if ("target" in this.options){
            if (!this.isRemote){world.objects[this.options.target].toggle();}
            game.saveObjectState(this.options.map, this.options.target, this.state);
        }
        
        if ("isLight" in this.options){
            world.map.options.isDark = !Boolean(this.state);
        }
        
    }

    this.draw = function(){

        return;

    }

}

// ========================================================================== //
// ========================================================================== //

function DoorObject () {

    GameObject.apply(this, arguments);

    this.onInitialize = function(){

        this.image = new Image();
        this.image.src = 'gfx/sprites/' + this.options.sprite + '.png';

        if (this.state == 1){
            for(var y=0; y<this.size.h; y++){
                for(var x=0; x<this.size.w; x++){                
                    world.map.objectObstacles.push({x: x+this.posCell.x, y: y+this.posCell.y});
                }            
            }
        }

    }

    this.toggle = function(callback){
        this.nextState = Number( !this.state );
        this.animationPlay();
        this.nextStateCallback = callback;
    }

    this.setState = function( state ){
        
        this.state = state;

        this.animationStop();

        if (this.state == 1){
            this.animation.frame = this.animation.framesCount - 1;
            this.animation.offsetX = this.animation.frame * this.size.wPx;
        } else {
            this.animation.frame = 0;
            this.animation.offsetX = 0;
        }

        var maxY = ("onlyTop" in this.options) ? 1 : this.size.h;
        var minY = ("onlyBottom" in this.options) ? this.size.h-1 : 0;

        for(var y=minY; y<maxY; y++){                        
            for(var x=0; x<this.size.w; x++){                
                var cellX = x + this.posCell.x;
                var cellY = y + this.posCell.y;
                world.map.obstaclesGrid[cellY][cellX] = this.state;
            }
        }

        game.saveObjectState(game.currentMap, this.name, state);

    }

    this.draw = function(){

        var screenX = this.pos.x - scene.camera.x;
        var screenY = this.pos.y - scene.camera.y;
        
        var frameX = this.animation.offsetX;
        var frameY = 0;
        
        scene.context.drawImage(
            this.image, 
            frameX, frameY, this.size.wPx, this.size.hPx,
            screenX, screenY, this.size.wPx, this.size.hPx
        );

        this.animationNextFrame();
            
    }

}

// ========================================================================== //
// ========================================================================== //

function ChestObject () {

    GameObject.apply(this, arguments);

    this.onInitialize = function(){
        this.isTouchable = true;
        this.image = new Image();
        this.image.src = 'gfx/sprites/' + this.options.sprite + '.png';
        this.state = 0;
        this.offsetY = 0;
    }

    this.onMouseOver = function(){this.offsetY = 1;}
    this.onMouseOut = function(){this.offsetY = 0;}
    this.onPlayerTouch = function(){
        if (this.state == 1) {return;}
        this.toggle();
    }

    this.toggle = function(callback){

        this.nextState = 1;
        this.animationPlay();
        this.nextStateCallback = function(){
            if ("itemType" in this.options) {
                var itemData = ("itemData" in this.options) ? JSON.parse(this.options.itemData) : null;
                var itemQty = ("itemQty" in this.options) ? Number(this.options.itemQty) : 1;
                world.player.giveItem(this.options.itemType, itemData, itemQty);
            }
            if ("gold" in this.options) {
                world.player.addGold(Number(this.options.gold));
            }
        };

    }

    this.setState = function( state ){

        this.state = state;
        this.animationStop();

        if (this.state == 1){
            this.animation.frame = this.animation.framesCount - 1;
            this.animation.offsetX = this.animation.frame * this.size.wPx;
        } else {
            this.animation.frame = 0;
            this.animation.offsetX = 0;
        }

        game.saveObjectState(game.currentMap, this.name, state);

    }

    this.draw = function(){

        var screenX = this.pos.x - scene.camera.x;
        var screenY = this.pos.y - scene.camera.y;

        var frameX = this.animation.offsetX;
        var frameY = this.offsetY *  this.size.hPx;

        scene.context.drawImage(
            this.image,
            frameX, frameY, this.size.wPx, this.size.hPx,
            screenX, screenY, this.size.wPx, this.size.hPx
        );
            
        this.animationNextFrame();

    }

}

// ========================================================================== //
// ========================================================================== //

function TrapObject () {

    GameObject.apply(this, arguments);

    this.onInitialize = function(){
        
        this.isStepable = true;
        this.image = new Image();
        this.image.src = 'gfx/sprites/' + this.options.sprite + '.png';
        this.state = 0;
        
        this.damage = ("damage" in this.options) ? Number(this.options.damage) : 1;
        this.radius = ("radius" in this.options) ? Number(this.options.radius) : 0;
        
        this.cooldownTimer = 0;
        this.cooldown = ("cooldown" in this.options) ? Number(this.options.cooldown) : 100;
        this.isCooling = false;
        this.isHitted = false;
        
    }

    this.onActorStep = function(actor){

        if (actor.type == 'Player' && this.state == 1 && !this.isHitted){
            actor.hit(this.damage);
            this.isHitted = true;
        }
        
    }

    this.toggle = function(callback){

        this.nextState = Number( !this.state );
        this.animationPlay();
        this.nextStateCallback = function(){
            if (this.state == 0){
                this.isHitted = false;
            }
            if (this.state == 1){
                var distToPlayer = this.distanceToActor(world.player);
                if (distToPlayer == 0 && !this.isHitted){
                    world.player.hit(this.damage);
                    this.isHitted = true;
                }
            }
        };

    }
    
    this.onUpdate = function(distToPlayer){
        
        if (this.isCooling){
            if (this.cooldownTimer < this.cooldown){ this.cooldownTimer++; }
            if (this.cooldownTimer == this.cooldown && distToPlayer > this.radius){
                this.cooldownTimer = 0;         
                this.isCooling = false;
                this.toggle();
            }
            return true;
        }
        
        if ((distToPlayer <= this.radius) && this.state == 0 && !this.isCooling){
            this.toggle();
            this.isCooling = true;
        }
        
        return true;
        
    }

    this.setState = function( state ){

        this.state = state;
        this.animationStop();

        if (this.state == 1){
            this.animation.frame = this.animation.framesCount - 1;
            this.animation.offsetX = this.animation.frame * this.size.wPx;
        } else {
            this.animation.frame = 0;
            this.animation.offsetX = 0;
        }

    }

    this.draw = function(){

        var screenX = this.pos.x - scene.camera.x;
        var screenY = this.pos.y - scene.camera.y;

        var frameX = this.animation.offsetX;

        scene.context.drawImage(
            this.image,
            frameX, 0, this.size.wPx, this.size.hPx,
            screenX, screenY, this.size.wPx, this.size.hPx
        );
            
        this.animationNextFrame();

    }

}

// ========================================================================== //
// ========================================================================== //

function SignObject () {

    GameObject.apply(this, arguments);

    this.onInitialize = function(){

        this.isTouchable = true;

        this.image = new Image();
        this.image.src = 'gfx/sprites/' + this.options.sprite + '.png';

        this.offsetY = 0;

    }

    this.onMouseOver = function(){this.offsetY = 1;}
    this.onMouseOut = function(){this.offsetY = 0;}
    this.onPlayerTouch = function(){this.showText();}

    this.showText = function(){
        showSignMessage(this.options.sprite, this.options.text);
    }

    this.draw = function(){

        var screenX = this.pos.x - scene.camera.x;
        var screenY = this.pos.y - scene.camera.y;

        var frameX = 0;
        var frameY = this.offsetY *  this.size.h *  scene.config.tileSize;

        scene.context.drawImage(
            this.image,
            frameX, frameY, this.size.w * scene.config.tileSize, this.size.h * scene.config.tileSize,
            screenX, screenY, this.size.w * scene.config.tileSize, this.size.h * scene.config.tileSize
        );

    }

}



// ========================================================================== //
// ========================================================================== //


