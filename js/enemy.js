function ActorEnemy(){

    Actor.apply(this, arguments);

    this.onInitialize = function() {

        this.type = 'ActorEnemy';

        this.imageTalk = new Image();
        this.imageTalk.src = 'gfx/sprites/talk.png';

        // respawn this enemy, or he is appears just once?
        this.isOne = ("isOne" in this.options) ? Boolean(Number(this.options.isOne)): false;

        // if walking is not enabled, BUT player followed - then enable walking
        if (!this.isWalk && this.isFollower) {this.isWalk = true;}

        if ("text" in this.options) {
            this.originalText = this.options.text;
        }

        this.skills = {
            attack: 1,
            health: 10,
            hitSpeed: 4,
            armor: 0,
            vision: 3
        };

        if ("skills" in this.options){
            $.extend(this.skills, JSON.parse(this.options.skills));
        }

        this.skills.health = ("health" in this.options) ? Number(this.options.health) : this.skills.health;
        this.health = this.skills.health;

        this.isDead = false;

    }

// ========================================================================== //
// ========================================================================== //

    this.onChangePos = function(){
        this.onPlayerChangePos();
    }

    this.onNextCell = function() {
        var free = world.getObstaclesGrid(this)[this.nextCell.y][this.nextCell.x] == 0;
        return free;
    }

    this.onUpdate = function(distToPlayer) {

        // chase player if needed
        if (this.options.isWalk){
            if (distToPlayer <= this.skills.vision){
                this.followPlayer();
            } else {
                this.stopFollowPlayer();
            }
        }

        // rotate to player, if nearby
        if (!this.hasDestination && !this.isMoving && distToPlayer==1){
            var dir = this.directionToActor(world.player);
            this.rotateTo( dir );
            this.attackActor(world.player, dir);
        }

        return !this.isDead;

    }

// ========================================================================== //
// ========================================================================== //

this.onDraw = function() {

        var distToPlayer = this.distanceToActor(world.player);

        if (this.isHover){
            var screenX = this.pos.x - scene.camera.x;
            var screenY = this.pos.y - scene.camera.y + this.topOffset;
        }

        // draw speech bubble icon
        if (this.isHover && distToPlayer==1 && ('text' in this.options)){

            scene.top.context.drawImage(
                this.imageTalk,
                0, 0, 16, 15,
                screenX + (scene.config.tileSize/2), screenY-(scene.config.tileSize/2), 16, 15
            );

        }

        // draw enemy health
        if (this.isHover){

            var hpWidth = Math.round((this.health * scene.config.tileSize)/this.skills.health);

            scene.top.context.fillStyle = '#000';
            scene.top.context.fillRect(screenX, screenY-7, scene.config.tileSize, 4);

            var colors = ['#F00', '#ff7f00', '#bfbf00', '#0F0'];

            scene.top.context.fillStyle = colors[ Math.floor(hpWidth/10) ];
            scene.top.context.fillRect(screenX+1, screenY-6, hpWidth-2, 2);

        }

    }

// ========================================================================== //
// ========================================================================== //

    this.setText = function(text){
        this.options.text = text;
    }

    this.restoreOriginalText = function(){
        if (!("originalText" in this)) {delete this.options.text;}
        this.options.text = this.originalText;
    }

// ========================================================================== //
// ========================================================================== //

    this.onPlayerTouch = function(){

        //
        // Try to just say something
        //
        if ("text" in this.options) {
            showActorMessage(this, this.options.text);
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.hold = function(){
        this.isWalk = false;
        this.stop();
    }

// ========================================================================== //
// ========================================================================== //

    this.onDie = function(){

        this.spawnSprite({
            sprite:'effects/explosion',
            cellX:this.posCell.x,
            cellY:this.posCell.y,
            frames:40,
            cols:8,
            rows:5,
            speed: 1
        });

        if (this.isOne){
            game.saveActorState(game.currentMap, this.name, 'isExists', 0);
        }

        if ("itemType" in this.options) {
            var itemData = ("itemData" in this.options) ? JSON.parse(this.options.itemData) : null;
            world.player.giveItem(this.options.itemType, itemData);
        }
        if ("gold" in this.options) {
            world.player.addGold(Number(this.options.gold));
        }

        this.isDead = true;

    }

// ========================================================================== //
// ========================================================================== //

}
