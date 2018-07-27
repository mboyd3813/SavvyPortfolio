var tickInterval = 20;

var scene = {
    canvas: null, 
    context: null,
    config: {
        width: 25,      //tiles
        height: 15,     //tiles
        tileSize: 32,   //px
        padding: 15     //px
    },
    camera: {
        x: 0,           //px
        y: 0            //px
    }    
};

var directions = {
    down: { x:0, y:1, offset:0 }, 
    left: { x:-1, y:0, offset:1 }, 
    right: { x:1, y:0, offset:2 },
    up: { x:0, y:-1, offset:3 }, 
    left_up: { x:-1, y:-1, offset:1 }, 
    right_up: { x:1, y:-1, offset:2 }, 
    left_down: { x:-1, y:1, offset:1 }, 
    right_down: { x:1, y:1, offset:2 }
}

var mouseKeys = {
    left: 1,
    middle: 2, 
    right: 3
}

var imagesForPreload = [
    'gfx/actors/animals/bunny.png', 
    'gfx/actors/animals/rat.png', 
    'gfx/actors/bosses/dragon.png', 
    'gfx/actors/boy1.png', 
    'gfx/actors/fisher.png', 
    'gfx/actors/girl1.png', 
    'gfx/actors/guard-officer.png', 
    'gfx/actors/guard.png', 
    'gfx/actors/man1.png', 
    'gfx/actors/man2.png', 
    'gfx/actors/monsters/bat.png', 
    'gfx/actors/monsters/dark.png', 
    'gfx/actors/monsters/death.png', 
    'gfx/actors/monsters/evillord.png', 
    'gfx/actors/monsters/evilprince.png', 
    'gfx/actors/monsters/fireman.png', 
    'gfx/actors/monsters/fly.png', 
    'gfx/actors/monsters/ogre.png', 
    'gfx/actors/monsters/rogue1.png', 
    'gfx/actors/monsters/rogue2.png', 
    'gfx/actors/monsters/rogue3.png', 
    'gfx/actors/monsters/skeleton.png', 
    'gfx/actors/monsters/spider1.png', 
    'gfx/actors/monsters/spider2.png', 
    'gfx/actors/monsters/spider3.png', 
    'gfx/actors/player-body.png', 
    'gfx/actors/player-head.png', 
    'gfx/actors/player.png', 
    'gfx/actors/smith.png', 
    'gfx/button.png', 
    'gfx/clouds.png', 
    'gfx/logo.png', 
    'gfx/sprites/ambient/campfire1.png', 
    'gfx/sprites/ambient/float.png', 
    'gfx/sprites/doors/bridge1.png', 
    'gfx/sprites/doors/fence1.png', 
    'gfx/sprites/doors/fence2.png', 
    'gfx/sprites/doors/stone1.png', 
    'gfx/sprites/doors/wood1.png', 
    'gfx/sprites/doors/wood2.png', 
    'gfx/sprites/doors/wood3.png', 
    'gfx/sprites/doors/wood4.png', 
    'gfx/sprites/doors/wood5.png', 
    'gfx/sprites/effects/darkness.png', 
    'gfx/sprites/effects/explosion-big.png', 
    'gfx/sprites/effects/explosion-blue.png', 
    'gfx/sprites/effects/explosion.png', 
    'gfx/sprites/effects/explosion2.png', 
    'gfx/sprites/effects/fireball.png', 
    'gfx/sprites/effects/swing0.png', 
    'gfx/sprites/effects/swing1.png', 
    'gfx/sprites/effects/swing2.png', 
    'gfx/sprites/effects/swing3.png', 
    'gfx/sprites/effects/waypoint.png', 
    'gfx/sprites/explosion2.png', 
    'gfx/sprites/fireball.png', 
    'gfx/sprites/icons.png', 
    'gfx/sprites/items.png', 
    'gfx/sprites/objects/chest1.png', 
    'gfx/sprites/objects/chest2.png', 
    'gfx/sprites/objects/lever.png', 
    'gfx/sprites/objects/sign.png', 
    'gfx/sprites/talk.png', 
    'gfx/sprites/traps/hole.png', 
    'gfx/sprites/traps/spikes.png', 
    'gfx/tiles/cave.png', 
    'gfx/tiles/indoor.png', 
    'gfx/tiles/meta.png', 
    'gfx/tiles/outdoor.png', 
];
