// ========================================================================== //
// ========================================================================== //

function saveMyHarpQuest(){

    Quest.apply(this, arguments);

    this.id = "saveMyHarp";
    this.map = 'roadtocity';
    this.actors = ['musician'];

    this.invite = {
        text: "Hello, Stranger! Please, help me! Terrible thing has happened with me",
        yesText: "What happened?",
        noText: "No, sorry"
    };

    this.steps = [
        {
            target: {type: "ActorNPC", name: "musician"},
            text: "I'm a strolling musician. I was walking north, to the city, when rogues attacked me. They took away my Harp, this is so terrible! I can't play without my instrument! Please take the harp from them and return it to me.",
            onComplete: function(actor){
                actor.onPlayerTouch();
            }
        },
        {
            target: {type: "ActorNPC", name: "musician"},
            text: "They are many and they are armed. I'll give you a healing elixir, use it when needed. Be careful! Lure them one at a time.",
            summary: "Kill rogues and find the Harp",
            onComplete: function(actor){
                showMessage('You received a <b>potion</b>. You can click <b>potion</b> in the inventory to drink it, when needed.');
                actor.setText("Have you found my Harp?");
                world.player.giveItem('hp');
            }
        },
        {
            target: {type: "ActorNPC", name: "musician"},
            text: "My Harp! You're the best, Stranger! Music is back!",
            onVerify: function(){
                return world.player.hasItem('harp');
            },
            onComplete: function(actor){
                world.player.removeItem('harp');
                world.actors["musician"].setText('Thank you a lot, Stranger!');
            }
        }
    ];

}

// ========================================================================== //
// ========================================================================== //

