var game = null;

function initialize(){

    $('body').disableSelection();

    game = new Game();

    scene.canvas = document.getElementById('game');
    scene.context = scene.canvas.getContext('2d');
    scene.context.drawRotatedImage = drawRotatedImage;

    scene.width = scene.config.width * scene.config.tileSize;
    scene.height = scene.config.height * scene.config.tileSize;

    scene.canvas.width = scene.width;
    scene.canvas.height = scene.height;
    scene.canvas.oncontextmenu = function() { return false; };
    scene.canvas.onmousedown = game.canvasClick;
    scene.canvas.onmousemove = game.canvasMouseMove;
    scene.canvas.onmouseout = game.canvasMouseOut;

    scene.top = {
        canvas: document.createElement('canvas')
    };
    
    scene.top.canvas.width = scene.width;
    scene.top.canvas.height = scene.height;
    scene.top.context = scene.top.canvas.getContext('2d');

    game.clearLocalStorage();

    imagePreloadNext();

}

function Game(){

    this.currentMap = null;
    this.previousMap = null;
    this.previousPortal = null;

    this.isActive = false;
    this.isPaused = false;

    this.mouseCellX = 0;
    this.mouseCellY = 0;

    this.objectStates = {};

// ========================================================================== //
// ========================================================================== //

    this.loadingComplete = function(){
        $('.loading').remove();
        $('.interface').show();
        this.start();
    }

// ========================================================================== //
// ========================================================================== //

    this.start = function (){

        scene.canvas.pos = $('#game').position();
        window.onresize = function(){ scene.canvas.pos = $('#game').position(); }

        world = new World();

        this.currentMap = 'map1';

        world.addPlayer({x:0, y:0, properties: { sprite:'player' }});

        this.loadProgress();

        world.loadMap( this.currentMap );

        setInterval('game.tick()', tickInterval);

    }

// ========================================================================== //
// ========================================================================== //

    this.changeMap = function (mapName, portalName){

        this.isActive = false;

        this.previousMap = this.currentMap;
        this.currentMap = mapName;

        if (typeof(portalName) == 'undefined') { portalName = null; }
        this.previousPortal = portalName;

        world.unloadMap(function(){
            world.loadMap( mapName );
        });

    }

// ========================================================================== //
// ========================================================================== //

    this.over = function(){

        this.isActive = false;
        showGameOverMessage();

    }

// ========================================================================== //
// ========================================================================== //

    this.tick = function(){

        if (this.isActive){

            if (!this.isPaused) { world.update(); }

            world.draw();

        } else {

            scene.context.fillStyle = '#000000';
            scene.context.fillRect(0, 0, scene.config.width*scene.config.tileSize, scene.config.height*scene.config.tileSize);

        }

    }

// ========================================================================== //
// ========================================================================== //

    this.canvasClick = function (event){

        event.preventDefault();
        
        if (!game.isActive){ return; }

        world.onMapClick(event, game.mouseCellX, game.mouseCellY);

    }

    this.canvasMouseMove = function (e){

        e.preventDefault();

        game.isHover = true;

        if (!game.isActive){ return; }

        var x = Math.floor((e.pageX - scene.canvas.pos.left) / scene.config.tileSize);
        var y = Math.floor((e.pageY - scene.canvas.pos.top) / scene.config.tileSize);

        game.mouseX = (e.pageX - scene.canvas.pos.left);
        game.mouseY = (e.pageY - scene.canvas.pos.top);

        game.mouseCellX = x + Math.round(scene.camera.x / scene.config.tileSize);
        game.mouseCellY = y + Math.round(scene.camera.y / scene.config.tileSize);

        world.onMapHover(game.mouseCellX, game.mouseCellY);

    }
    
    this.canvasMouseOut = function (e){
        
        game.isHover = false;
        
    }

// ========================================================================== //
// ========================================================================== //

    this.saveProgress = function(callback){

        console.log('saving...');

        var saveGame = {};

        saveGame.map = this.currentMap;
        saveGame.objectStates = localStorage.getItem('game:objectStates');
        saveGame.actorStates = localStorage.getItem('game:actorStates');
        saveGame.actorPos = localStorage.getItem('game:actorPos');

        saveGame.playerData = {
            pos: world.player.pos,
            posCell: world.player.posCell,
            direction: world.player.direction,
            items: world.player.items,
            skills: world.player.skills,
            completedQuests: world.player.completedQuests,
            slots: world.player.slots,
            health: world.player.health,
            gold: world.player.gold
        }

        localStorage.setItem('game:progress', JSON.stringify( saveGame ));

        if (typeof(callback) == 'function') { callback(); }

    }

    this.loadProgress = function(){

        var saveGame = localStorage.getItem('game:progress');

        if (saveGame == null) { return; }

        saveGame = JSON.parse(saveGame);

        localStorage.setItem('game:objectStates', saveGame.objectStates);
        localStorage.setItem('game:actorStates', saveGame.actorStates);
        localStorage.setItem('game:actorPos', saveGame.actorPos);

        $.extend(world.player, saveGame.playerData);

        world.player.updateAllGUI();

        this.currentMap = saveGame.map;

    }

// ========================================================================== //
// ========================================================================== //

    this.saveObjectState = function(mapName, objectName, state){

        var statesList = JSON.parse( localStorage.getItem('game:objectStates') );
        if (statesList == null){ statesList = {} }

        if (!(mapName in statesList)){
            statesList[mapName] = {};
        }

        statesList[mapName][objectName] = state;

        localStorage.setItem('game:objectStates', JSON.stringify( statesList ));

    }

    this.restoreObjectStates = function(){

        var mapName = this.currentMap;
        var statesList = JSON.parse( localStorage.getItem('game:objectStates') );

        if (statesList == null){ return; }

        if (typeof(statesList[mapName]) == 'undefined'){ return; }

        for(var objectName in statesList[mapName]){
            var state = statesList[mapName][objectName];
            world.objects[objectName].setState( state );
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.saveActorState = function(mapName, actorName, property, value){

        var statesList = JSON.parse( localStorage.getItem('game:actorStates') );
        if (statesList == null){ statesList = {} }

        if (!(mapName in statesList)){
            statesList[mapName] = {};
        }

        if (!(actorName in statesList[mapName])){
            statesList[mapName][actorName] = {};
        }

        statesList[mapName][actorName][property] = value;

        localStorage.setItem('game:actorStates', JSON.stringify( statesList ));

    }

    this.restoreActorStates = function(){

        var mapName = this.currentMap;
        var statesList = JSON.parse( localStorage.getItem('game:actorStates') );

        if (statesList == null){ statesList = {} }

        if (!(mapName in statesList)){ statesList[mapName] = {}; }

        // restore actors properties
        for(var actorName in world.actors){

            var actor = world.actors[actorName];

            if (!(actorName in statesList[mapName])){
                statesList[mapName][actorName] = {};
            }

            if (actor.options.isOutside && (typeof(statesList[mapName][actorName]['isExists'])=='undefined')){
                delete world.actors[actorName];
                continue;
            }

            for(var property in statesList[mapName][actorName]){
                var value = statesList[mapName][actorName][property];
                switch (property){
                    case 'isExists':
                        if (value==0){ delete world.actors[actorName]; }
                        break;
                    default:
                        world.actors[actorName][property] = value;
                        break;
                }
            }

        }

    }

// ========================================================================== //
// ========================================================================== //

    this.saveActorPosition = function(mapName, actorName, pos){

        if (typeof(mapName)=='undefined') { mapName = this.currentMap; }

        if (typeof(pos)=='undefined') { pos = world.actors[actorName].posCell; }

        var posList = JSON.parse( localStorage.getItem('game:actorPos') );
        if (posList == null){ posList = {} }

        if (!(mapName in posList)){
            posList[mapName] = {};
        }

        posList[mapName][actorName] = pos;

        localStorage.setItem('game:actorPos', JSON.stringify( posList ));

    }

    this.restoreActorPositions = function(){

        var mapName = this.currentMap;
        var posList = JSON.parse( localStorage.getItem('game:actorPos') );

        if (posList == null) { posList = {} }

        if (!(mapName in posList)){
            posList[mapName] = {};
        }

        for(var actorName in posList[mapName]){
            var actor = world.actors[actorName];
            if (typeof(actor) == 'undefined'){ continue; }
            if (!(actorName in posList[mapName])){ continue; }
            var pos = posList[mapName][actorName];
            actor.setPosition(pos.x, pos.y);
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.clearLocalStorage = function(){

        localStorage.removeItem('game:objectStates');
        localStorage.removeItem('game:actorStates');
        localStorage.removeItem('game:actorPos');

    }

// ========================================================================== //
// ========================================================================== //

}

function continueGame(){
    window.location.href = 'game.html';
}

function newGame(){
    localStorage.removeItem('game:progress');
    window.location.href = 'game.html';
}

