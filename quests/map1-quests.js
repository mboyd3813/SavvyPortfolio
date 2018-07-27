// ========================================================================== //
// ========================================================================== //

function talkToFatherQuest(){

    Quest.apply(this, arguments);

    this.id = "talkToFather";
    this.map = 'map1';
    this.actors = ['boy1', 'fisher'];

    this.invite = {
        text: "Hello! I'm in trouble, could you help me?",
        yesText: "Yes",
        noText: "No, sorry"
    };

    this.steps = [
        {
            target: {type: "ActorNPC", name: "boy1"},
            text: "My father went to the pier to repair his boat and left the door closed. I can't enter my home! Please, meet him on the east pier and bring me the key!",
            summary: "Find the Fisher",
            onComplete: function(actor){
                showMessage('You have got an <b>objective</b>. Complete <b>objectives</b> to advance the story. Current <b>objective</b> is displayed in the top left corner.');
                actor.setText("Please, meet my Father!");
            }
        },
        {
            target: {type: "ActorNPC", name: "fisher"},
            text: "My son sent you? Well, here is the key. Please, don't lose it. Now go, poor boy is waiting for you.",
            summary: "Bring key to the boy",
            onComplete: function(actor){
                showMessage('You received an <b>item</b>. All of your <b>items</b> are stored in the inventory. Some interactive <b>items</b> (like weapons, armor, potions) can be activated (weared) with mouse click');
                actor.setText("Hurry up! My little boy is alone there!");
                world.player.giveItem('key', {name:'fisherKey', title:'Fisher Key'});
            }
        },
        {
            target: {type: "ActorNPC", name: "boy1"},
            text: "Thank you so much! You can stay in our house if you want to have some rest.",
            onVerify: function(){
                return world.player.hasItem('fisherKey');
            },
            onComplete: function(actor){
                actor.isWalk = false;
                world.player.removeItem('fisherKey');
                actor.setDestination(6, 38, function(){
                    actor.rotateTo(directions.up);
                    world.objects['d_house'].toggle(function(){
                        actor.setDestination(6, 37);
                        world.actors["fisher"].setText("I appretiate your help, stranger");
                        world.player.questFinish();
                    });
                });
            }
        }
    ];

}

// ========================================================================== //
// ========================================================================== //

function caveEscapeQuest(){

    Quest.apply(this, arguments);

    this.id = "caveEscape";
    this.map = 'map1';
    this.actors = ['guardcom', 'guardlost'];

    this.onInviteVerify = function(actor){
        return world.player.isQuestCompleted('talkToFather');
    };

    this.invite = {
        text: "The road is closed. Too many rogues walking around. But... we may pass you in exchange for a favor.",
        declineText: "I've heard that a little son of a fisher is waiting for help. Go check him.",
        yesText: "What I have to do?",
        noText: "Bye"
    };

    this.steps = [
        {
            target: {type: "ActorNPC", name: "guardcom"},
            text: "One of our guards was sent to explore a cave in western hill. He had to get back many hours ago. Looks like he can't find the way back from the cave. Go find him and bring him back to me.",
            summary: "Find a Guard in the cave",
            onComplete: function(actor){
                actor.setText("Have you found him? No? That means we have nothing to talk about.");
            }
        },
        {
            target: {type: "ActorNPC", name: "guardlost"},
            text: "Oh, man! How happy I'm to see you! Please, help me to leave this scary place!",
            summary: "Escort Guard back to Commander",
            onComplete: function(actor){
                actor.setText("I'm following you!");
                actor.followPlayer();
            }
        },
        {
            target: {type: "ActorNPC", name: "guardcom"},
            text: "Ha! Finally you've found him! Well, I never lie. Guards! Let this good man go to the road!",
            onComplete: function(actor){

                world.actors['guardlost'].stop();
                game.saveActorState(game.currentMap, 'guardlost', 'isFollower', 0);
                game.saveActorPosition(game.currentMap, 'guardlost', world.actors['guardlost'].posCell);

                world.actors['guard1'].setDestination(37, 6, function(){
                    world.actors['guard1'].rotateTo(directions.right);
                    game.saveActorPosition(game.currentMap, 'guard1', world.actors['guard1'].posCell);
                });

                world.actors['guard2'].setDestination(43, 5, function(){
                    world.actors['guard2'].rotateTo(directions.left);
                    game.saveActorPosition(game.currentMap, 'guard2', world.actors['guard2'].posCell);
                });
                
                world.actors["guardcom"].setText('Good boy. Thanks for help.');

            }
        }
    ];

}

// ========================================================================== //
// ========================================================================== //

