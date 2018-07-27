function ActorNPC(){

    Actor.apply(this, arguments);

    this.onInitialize = function() {

        this.type = 'ActorNPC';

        this.imageTalk = new Image();
        this.imageTalk.src = 'gfx/sprites/talk.png';

        if ("text" in this.options) {
            this.originalText = this.options.text;
            this.text = this.options.text;
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.onUpdate = function(distToPlayer) {

        // rotate to player, if nearby
        if (!this.hasDestination && !this.isMoving && this.distanceToActor(world.player)==1){
            this.rotateTo(this.directionToActor(world.player));
        }

        return true;

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

        // draw NPC name
        if (this.isHover && distToPlayer>1 && ('name' in this.options)){

            scene.top.context.font = '11pt Arial';

            var metrics = scene.top.context.measureText(this.options.name);
            var width = metrics.width;

            screenX = screenX + (scene.config.tileSize/2) - (width/2);
            screenY = screenY-(scene.config.tileSize/3);

            scene.top.context.fillStyle = '#000000';
            scene.top.context.fillText(this.options.name, screenX+1, screenY+1);

            scene.top.context.fillStyle = '#FFF';
            scene.top.context.fillText(this.options.name, screenX, screenY);

        }

    }

// ========================================================================== //
// ========================================================================== //

    this.setText = function(text){
        this.text = text;
        game.saveActorState(game.currentMap, this.name, 'text', text);
    }

    this.restoreOriginalText = function(){
        if (!("originalText" in this)) { delete this.text; }
        this.text = this.originalText;
    }

// ========================================================================== //
// ========================================================================== //

    this.onPlayerTouch = function(){

        //
        // Check is this NPC are target of current quest
        //
        if (world.player.hasQuest){

            var currStep = world.player.quest.getCurrentStep();
            var isCurrStepMy = ((currStep.target.type == 'ActorNPC') && (currStep.target.name == this.name));

            if ( isCurrStepMy ){

                var isCurrStepAllowed = true;
                var callback = null;

                if (!("onVerify" in currStep)){ isCurrStepAllowed = true; }
                else { isCurrStepAllowed = currStep.onVerify(); }

                if (isCurrStepAllowed){

                    world.player.quest.progress();

                    callback = function(target){
                        if(typeof(currStep.onComplete)=='function') { currStep.onComplete(target); }
                        if ("summary" in currStep){ showQuestSummary(currStep.summary); }
                        if (world.player.quest.isFinished()) { world.player.spawnText('Quest Completed'); }
                    }

                    this.say(currStep.text, callback);
                    return;

                }

            }

        }

        //
        // Check is this NPC can give a new quest
        //
        if (("quest" in this.options) && !(world.player.hasQuest)) {
            if (!world.player.isQuestCompleted(this.options.quest)){
                var quest = new window[ this.options.quest + 'Quest' ]();
                if (quest.onInviteVerify(this)){
                    this.say(quest);
                } else {
                    this.say(quest.invite.declineText);
                }
                return;
            }
        }

        //
        // Try to just say something
        //
        if ("text" in this.options) {
            this.say(this.text);
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

}
