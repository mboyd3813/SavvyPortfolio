// ========================================================================== //
// ========================================================================== //

function bringMeHammerQuest(){

    Quest.apply(this, arguments);

    this.id = "bringMeHammer";
    this.map = 'city';
    this.actors = ['smith'];

    this.invite = {
        text: "Good day, Stranger. We could be helpful to each other. But you have to do something for me first.",
        yesText: "Tell me more",
        noText: "No, thanks"
    };

    this.steps = [
        {
            target: {type: "ActorNPC", name: "smith"},
            text: "I've been forging armor and weapons for the City for many years. Unfortunately, my forge hammer become broken.",
            onComplete: function(actor){
                actor.onPlayerTouch();
            }
        },
        {
            target: {type: "ActorNPC", name: "smith"},
            text: "I can't forge without hammer. People say, that abandoded Mine to right from my house may still contain some tools.",
            onComplete: function(actor){
                actor.onPlayerTouch();
            }
        },
        {
            target: {type: "ActorNPC", name: "smith"},
            text: "Go in the Mine and find a new hammer for me. I will make greater armor and sword for you then!",
            summary: "Find Hammer in the Mine", 
            onComplete: function(actor){
                actor.setText("I'm waiting for new hammer");
            }
        },
        {
            target: {type: "ActorNPC", name: "guard1"},
            text: "I can't let you in, there is too dangerous. But, if you help me, maybe I will step away.",
            onComplete: function(actor){
                actor.onPlayerTouch();
            }
        },               
        {
            target: {type: "ActorNPC", name: "guard1"},
            text: "I've written a letter for my fiance. You will take her a letter, and I'll let you go to the Mine. She waits at the square near the city clock",
            summary: "Bring the letter to the Guard's fiancee", 
            onComplete: function(actor){
                actor.setText("Meet my fiance first");
                world.player.giveItem('letter', {name:'guardLetter', title: "Guard's Letter"});
            }
        },               
        {
            target: {type: "ActorNPC", name: "girl1"},
            text: "Thanks God, I'm so happy! This letter is very important for me, Stranger! Thank you!",
            summary: "Talk to Guard", 
            onVerify: function(){
                return world.player.hasItem('guardLetter');
            },
            onComplete: function(actor){
                world.player.removeItem('guardLetter');
                actor.setText("Can't wait my bridegroom from his duty!");
            }
        },
        {
            target: {type: "ActorNPC", name: "guard1"},
            text: "Have you delivered the letter? Thanks, my friend! You may go inside now, but be careful - some evil things happen there.",
            summary: "Find hammer in the Mine", 
            onVerify: function(){
                return !world.player.hasItem('guardLetter');
            }, 
            onComplete: function(actor){

                var newX = 48;
                var newY = 9;

                actor.setText("Thanks for your help!");

                game.saveActorPosition(game.currentMap, 'guard1', {x: newX, y: newY});                    

                actor.setDestination(newX, newY, function(){
                    actor.rotateTo(directions.right);
                });
                
            }
        },        
        {
            target: {type: "ActorNPC", name: "smith"},
            text: "Wow! This hammer looks like new! Thank you, Stranger. Come back later, we'll see what I can offer to you.",
            onVerify: function(){
                return world.player.hasItem('hammer');
            },
            onComplete: function(actor){     
                world.player.removeItem('hammer');
            }
        }
    ];

}

// ========================================================================== //
// ========================================================================== //

