var a = true;

function World(){

    this.map = {};
    this.isMapLoaded = false;

    this.player = null;

    this.actors = {};
    this.objects = {};
    this.sprites = [];
    
    this.lastTime = (new Date()).getTime();
    this.fpsCounter = 0;
    this.framesCounter = 0;
    
    this.visibleCells = {};

//    this.imageClouds = new Image();
//    this.imageClouds.src = 'gfx/clouds.png';

// ========================================================================== //
// ========================================================================== //

    this.unloadMap = function(callbackFunction){

        this.mapIsLoaded = false;

        delete this.objects;
        delete this.actors;
        delete this.sprites;

        this.objects = {};
        this.actors = {};
        this.sprites = [];

        this.player.stop();

        if (typeof(callbackFunction) == "function"){
            callbackFunction();
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.loadMap = function(mapName){

        $.ajax({
            url: "maps/" + mapName +".json",
            dataType: "json",
            context: this,
            success: function(map){

                // prepare map object
                this.map = {
                    height: map.height,
                    width: map.width,
                    layers: map.layers,
                    tileset: {
                        name: map.tilesets[0].name,
                        width: map.tilesets[0].imagewidth / scene.config.tileSize,
                        height: map.tilesets[0].imageheight / scene.config.tileSize
                    },
                    options: map.properties,
                    objectObstacles: []
                }

                delete map;

                // load map tileset
                this.map.tileset.image = new Image();
                this.map.tileset.image.src = 'gfx/tiles/' + this.map.tileset.name + '.png';

                // check map is dark
                if(!("isDark" in this.map.options)){
                    this.map.options.isDark = false;
                }

                // check map is indoor
                if(!("isIndoor" in this.map.options)){
                    this.map.options.isIndoor = false;
                }

                // check map background color
                if(!("color" in this.map.options)){
                    this.map.options.color = "#000000";
                }

                // check map have quests
                if(!("hasQuests" in this.map.options)){
                    this.map.options.hasQuests = false;
                }

                // load quests if needed
                if (this.map.options.hasQuests){
                    includeScript('quests/'+mapName+'-quests.js');
                }

                // parse meta layers
                for(layerIndex in this.map.layers){
                    var layer = this.map.layers[layerIndex];
                    if (layer.name == 'obstacles') {this.parseObstaclesLayer(layer);}
                    if (layer.name == 'objects') {this.parseObjectsLayer(layer);}
                    if (layer.name == 'actors') {this.parseActorsLayer(layer);}
                    if (layer.name == 'vision') {this.parseVisionLayer(layer);}
                }

                // restore states
                game.restoreObjectStates();
                game.restoreActorStates();
                game.restoreActorPositions();

                // all done
                this.isMapLoaded = true;
                game.isActive = true;

                // check auto save
                if("autoSave" in this.map.options){
                    game.saveProgress();
                }

            }
        });

    }

// ========================================================================== //
// ========================================================================== //

    this.parseObstaclesLayer = function( layer ){

        var cellIndex = 0;
        var obstaclesGrid = [];

        for(var y=0; y < this.map.height; y++){
            obstaclesGrid.push([]);
            for(var x=0; x < this.map.width; x++){

                var isFilled = layer.data[cellIndex] > 0 ? 1 : 0;

                obstaclesGrid[y].push( isFilled );
                cellIndex++;

            }
        }

        if (this.map.objectObstacles.length > 0){
            for(var idx in this.map.objectObstacles){
                var cell = this.map.objectObstacles[idx];
                obstaclesGrid[cell.y][cell.x] = 1;
            }
        }

        this.map.obstaclesGrid = obstaclesGrid;

    }
    
// ========================================================================== //
// ========================================================================== //

    this.parseVisionLayer = function( layer ){

        var cellIndex = 0;
        var visionGrid = [];

        for(var y=0; y < this.map.height; y++){
            visionGrid.push([]);
            for(var x=0; x < this.map.width; x++){

                var isFilled = layer.data[cellIndex] > 0 ? 1 : 0;

                visionGrid[y].push( isFilled );
                cellIndex++;

            }
        }

        this.map.visionGrid = visionGrid;

    }

// ========================================================================== //
// ========================================================================== //

    this.parseObjectsLayer = function( layer ){

        for(idx in layer.objects){

            var options = layer.objects[idx];

            var object = null;

            switch (options.type){

                case 'spawn':
                    object = new SpawnObject();
                    break;
                case 'portal':
                    object = new PortalObject();
                    break;
                case 'trigger':
                    object = new TriggerObject();
                    break;
                case 'switch':
                    object = new SwitchObject();
                    break;
                case 'plate':
                    object = new PlateObject();
                    break;
                case 'door':
                    object = new DoorObject();
                    break;
                case 'chest':
                    object = new ChestObject();
                    break;
                case 'trap':
                    object = new TrapObject();
                    break;
                case 'sign':
                    object = new SignObject();
                    break;
                case 'sprite':
                    this.sprites.push(new Sprite({
                        sprite: options.properties.sprite,
                        cellX:  Number(options.x) / scene.config.tileSize,
                        cellY:  Number(options.y) / scene.config.tileSize,
                        frames: Number(options.properties.frames),
                        cols:   Number(options.properties.cols),
                        rows:   Number(options.properties.rows),
                        speed:  Number(options.properties.speed),
                        isForever: 1
                    }));
                    break;

            }

            if (object != null){
                object.initialize(options);
                this.objects[object.name] = object;
            }

        }

    }

// ========================================================================== //
// ========================================================================== //

    this.parseActorsLayer = function( layer ){

        for(idx in layer.objects){

            var options = layer.objects[idx];

            var actor = null;

            switch (options.type){

                case 'actor':
                    actor = new Actor();
                    break;
                case 'npc':
                    actor = new ActorNPC();
                    break;
                case 'enemy':
                    actor = new ActorEnemy();
                    break;
                case 'boss':
                    actor = new Boss();
                    break;

            }

            if (actor != null){
                actor.initialize(options);
                this.actors[actor.name] = actor;
            }

        }

    }

// ========================================================================== //
// ========================================================================== //

    this.addPlayer = function(options){

        this.player = new Player();
        this.player.initialize(options);

    }

// ========================================================================== //
// ========================================================================== //

    this.getObstaclesGrid = function(callerActor){

        var grid = [];

        for(var y=0; y < this.map.height; y++){
            grid.push([]);
            for(var x=0; x < this.map.width; x++){
                grid[y].push( this.map.obstaclesGrid[y][x] );
            }
        }

        for(actorId in this.actors){
            if (actorId != callerActor.name){
                if(typeof(this.actors[actorId]) != "undefined"){
                    var actor = this.actors[actorId];
                    if (!actor.isSolid){ continue; }
                    if (actor.type != 'Boss'){
                        grid[actor.posCell.y][actor.posCell.x] = 1;
                    } else {
                        for(y=-1; y<=1; y++){
                            for(x=-1; x<=1; x++){
                                grid[actor.posCell.y+y][actor.posCell.x+x] = 1;
                            }
                        }
                    }
                }
            }
        }

        return grid;

    }

// ========================================================================== //
// ========================================================================== //

    this.isObstacleAt = function(cellX, cellY){
        
        if (cellX < 0 || cellX > this.map.width-1){return true;}
        if (cellY < 0 || cellY > this.map.height-1){return true;}
        
        return (this.map.obstaclesGrid[cellY][cellX] == 1);
        
    }

    this.isVisionObstacleAt = function(cellX, cellY){
        
        if (cellX < 0 || cellX > this.map.width-1){return true;}
        if (cellY < 0 || cellY > this.map.height-1){return true;}
        
        return (this.map.visionGrid[cellY][cellX] == 1);
        
    }

// ========================================================================== //
// ========================================================================== //

    this.update = function(){

        if (!game.isActive) {return;}
        if (!this.isMapLoaded) {return;}

        if (this.player != null) { this.player.update(); }

        for(var actorId in this.actors){
            if(typeof(this.actors[actorId]) != "undefined"){
                if (!this.actors[actorId].update()){
                    delete this.actors[actorId];
                }
            }
        }

        for(var objectId in this.objects){
            if(typeof(this.objects[objectId]) != "undefined"){
                if (!this.objects[objectId].update()){
                    delete this.objects[objectId];
                }
            }
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.draw = function(){

        scene.context.fillStyle = this.map.options.color;
        scene.context.fillRect(0, 0, scene.width, scene.height);
        scene.top.context.clearRect(0, 0, scene.width, scene.height);

        // Draw map, objects and actors
        this.drawMap();
        
        // Draw sprites       
        this.drawSprites();
        
        // Draw fog of war
        this.drawFogOfWar();
        
        // Draw top buffer
        scene.context.drawImage(scene.top.canvas, 0, 0);
        
        // Draw FPS
        this.drawFPS();       
        
    }

// ========================================================================== //
// ========================================================================== //

    this.drawMap = function(){

        if (!game.isActive) {return;}
        if (!this.isMapLoaded) {return;}

        for(var layerIndex in this.map.layers){

            var currentLayer = this.map.layers[layerIndex];

            if (currentLayer.name == 'obstacles') {continue;}

            //
            // Draw objects (and actors) layer
            //
            if (currentLayer.name == 'objects'){

                for(var objId in this.objects){
                    if (typeof(this.objects[objId]) != "undefined"){
                        if (this.objects[objId].isVisible()){
                            this.objects[objId].draw();
                        }
                    }
                }

                continue;

            }

            if (currentLayer.name == 'actors'){

                for(var actorId in this.actors){
                    if (typeof(this.actors[actorId]) != "undefined"){
                        if (this.actors[actorId].isVisible()){
                            this.actors[actorId].draw();
                        }
                    }
                }

                if (this.player != null) {this.player.draw();}

                continue;

            }
            
            //
            // Calculate FOV
            //
            if (this.map.options.isIndoor){

                var vision = 25; //this.player.getSkills().vision;

                var fov = new PreciseShadowcasting(function(x, y) {
                    return world.isVisionObstacleAt(x, y) == false;
                });

                this.visibleCells = {};

                fov.compute(this.player.posCell.x, this.player.posCell.y, vision, function(x, y, r, visibility) {
                    if (visibility) {
                        world.visibleCells[x+","+y] = visibility;
                    }
                });

            }            
            
            //
            // Draw tiles layer
            //
            for(var y=0; y <= scene.config.height; y++){
                for(var x=0; x <= scene.config.width; x++){

                        //position of cell in layer, in cells
                        var cellX = x + Math.floor(scene.camera.x / scene.config.tileSize);
                        var cellY = y + Math.floor(scene.camera.y / scene.config.tileSize);

                        if (this.map.options.isIndoor && !(cellX+','+cellY in this.visibleCells)){ continue; }

                        var tileIndex = currentLayer.data[ cellX + (cellY*scene.config.width) + (cellY*(this.map.width-scene.config.width)) ];

                        if (tileIndex == 0) {continue;}

                        //position of tile in tileset, in cells
                        var tileY = Math.ceil( tileIndex / this.map.tileset.width ) -1;
                        var tileX = tileIndex - (tileY * this.map.tileset.width) -1;

                        //position of tile on screen, in pixels
                        var screenX = x*scene.config.tileSize - (scene.camera.x - (Math.floor(scene.camera.x/scene.config.tileSize)*scene.config.tileSize));
                        var screenY = y*scene.config.tileSize - (scene.camera.y - (Math.floor(scene.camera.y/scene.config.tileSize)*scene.config.tileSize));

                        scene.context.drawImage(
                            this.map.tileset.image,
                            tileX*scene.config.tileSize, tileY*scene.config.tileSize, scene.config.tileSize, scene.config.tileSize,
                            screenX, screenY, scene.config.tileSize, scene.config.tileSize
                        );

                    }

            }

        }
        
    }

// ========================================================================== //
// ========================================================================== //

    this.drawSprites = function(){
        for(var sId in this.sprites){
            if (this.sprites[sId]){
                if (!this.sprites[sId].draw()){
                    delete this.sprites[sId];
                }
            }
        }        
    }

// ========================================================================== //
// ========================================================================== //

    this.drawFogOfWar = function(){
        if (this.map.options.isIndoor){
            for(y=0; y <= scene.config.height; y++){
                for(x=0; x <= scene.config.width; x++){

                        //position of cell in layer, in cells
                        cellX = x + Math.floor(scene.camera.x / scene.config.tileSize);
                        cellY = y + Math.floor(scene.camera.y / scene.config.tileSize);

                        if ((cellX+','+cellY in this.visibleCells)){ continue; }

                        //position of tile on screen, in pixels
                        screenX = x*scene.config.tileSize - (scene.camera.x - (Math.floor(scene.camera.x/scene.config.tileSize)*scene.config.tileSize));
                        screenY = y*scene.config.tileSize - (scene.camera.y - (Math.floor(scene.camera.y/scene.config.tileSize)*scene.config.tileSize));

                        scene.context.fillStyle = this.map.options.color;
                        scene.context.fillRect(screenX, screenY, scene.config.tileSize, scene.config.tileSize);

                }
            }
        }
    }

// ========================================================================== //
// ========================================================================== //

    this.drawFPS = function(){
        
        //
        // Calculate FPS
        //
        this.framesCounter++;
        
        var now = (new Date()).getTime();
        
        if (now - this.lastTime >= 1000){
            this.fpsCounter = this.framesCounter;
            this.lastTime = now;            
            this.framesCounter = 0;
        }        

        //
        // Draw FPS
        //
        if (this.fpsCounter > 0){
            scene.context.font = '10pt Arial';
            scene.context.fillStyle = '#000000';
            scene.context.fillText("FPS: "+this.fpsCounter, 10, 21);
            scene.context.fillStyle = '#FFFFFF';
            scene.context.fillText("FPS: "+this.fpsCounter, 10, 20);
        }
        
    }

// ========================================================================== //
// ========================================================================== //

    this.onActorChangePos = function(callerActor){

        // check actor steps on any object
        this.eachObject(function(object){
            if (!object.isStepable) {return;}
            var isCollide = object.hitTestCell( callerActor.posCell );
            if (!isCollide) {return;}
            object.onActorStep(callerActor);
        });

        // player? tell to all actors about his movement
        if (callerActor.type == 'Player'){
            this.eachActor(function(actor){
                actor.onPlayerChangePos();
            });
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.onActorChangeMap = function(callerActor, toMap, portalName){

        if (callerActor.type == 'ActorNPC'){

            delete this.actors[callerActor.name];

            game.saveActorState(game.currentMap, callerActor.name, 'isExists', 0);

            if (typeof(toMap) != 'undefined'){
                game.saveActorState(toMap, callerActor.name, 'isExists', 1);
            }

        }

        if (callerActor.type == 'Player'){

            this.eachActor(function(actor){
                actor.onPlayerChangeMap(toMap);
            });

            game.changeMap(toMap, portalName);

        }

    }

// ========================================================================== //
// ========================================================================== //

    this.onMapClick = function(event, cellX, cellY){

        this.player.onMapClick(event, cellX, cellY);

        if (event.which == mouseKeys.left){

            this.eachObject(function(object){
                if (!object.isTouchable) {return;}
                var isNear = object.distanceToCell( world.player.posCell ) <= 1;
                var isClicked = object.hitTestCell( {x: cellX, y: cellY} );
                if (isNear && isClicked) {
                    object.onPlayerTouch();
                    world.player.onTouchObject(object);
                }
            });

            this.eachActor(function(actor){
                var isNear = actor.distanceToActor(world.player) <= 1;
                var isClicked = actor.hitTestCell( {x: cellX, y: cellY} );
                if (isNear && isClicked) {
                    actor.onPlayerTouch();
                    world.player.onTouchActor(actor);
                }
            });
            
        }

    }

    this.onMapHover = function(cellX, cellY){

        this.eachObject(function(object){
            var isHover = object.hitTestCell( {x: cellX, y: cellY} );
            object.setHover( isHover );
        });

        this.eachActor(function(actor){
            var isHover = actor.hitTestCell( {x: cellX, y: cellY} );
            actor.setHover( isHover );
        });

    }

// ========================================================================== //
// ========================================================================== //

    this.eachObject = function(callbackFunction){

        if (!game.isActive) {return;}

        for(var idx in this.objects){
            if (!game.isActive) {break;}
            var object = this.objects[idx];
            callbackFunction(object);
        }

    }

    this.eachActor = function(callbackFunction){

        if (!game.isActive) {return;}

        for(var idx in this.actors){
            if (!game.isActive) {break;}
            var actor = this.actors[idx];
            callbackFunction(actor);
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.createSprite = function(){

//        var s = new TextSprite({
//            text: "Р—Р°РґР°РЅРёРµ РІС‹РїРѕР»РЅРµРЅРѕ",
//            cellX:this.player.posCell.x,
//            cellY:this.player.posCell.y
//        });

        var s = new Sprite({
            sprite:'swing'+this.player.direction.offset,
            cellX:this.player.posCell.x,
            cellY:this.player.posCell.y,
            frames:12,
            cols:4,
            rows:3,
            speed: 1
        });

        this.sprites.push(s);

    }

// ========================================================================== //
// ========================================================================== //

}