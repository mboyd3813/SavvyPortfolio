function Quest(){

    this.id = '';
    this.invite = {};
    this.steps = [];
    this.actors = [];

    this.onInviteVerify = function(actor) { return true; }

// ========================================================================== //
// ========================================================================== //

    this.getCurrentStep = function(){
        return this.steps[0];
    }

    this.getNextStep = function(){
        if (this.steps.length <= 1) { return false; }
        return this.steps[1];
    }

    this.progress = function(){

        this.steps.shift();

        if (this.steps.length == 0) { world.player.questCompleted(); }

    }

    this.isFinished = function(){
        return (this.steps.length == 0);
    }

// ========================================================================== //
// ========================================================================== //

}


