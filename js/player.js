function Player () {

    Actor.apply(this, arguments);

    this.onInitialize = function(){

        this.type = 'Player';

        delete this.image;

        this.imageBody = new Image();
        this.imageBody.src = 'gfx/actors/player-body.png';
        this.imageHead = new Image();
        this.imageHead.src = 'gfx/actors/player-head.png';

        this.offsetBody = 0;
        this.offsetHead = 0;
        this.speed = 3;

        //
        // Dont forget about game.saveProgress() !
        //

        this.quest = null;
        this.hasQuest = false;
        this.completedQuests = {}

        this.skills = {
            attack: 2,
            hitSpeed: 8,
            armor: 0,
            health: 50,
            mana: 50,
            vision: 2,
            hpRegen: 3,
            mpRegen: 3
        }

        this.realSkills = {};

        this.health = this.skills.health;
        this.mana = this.skills.health;
        
        this.regen = {
            cooldown: 250,
            timerHP: 0,
            timerMP: 0,
            isActiveHP: false,
            isActiveMP: false
        }

        this.slots = {
            'meta': null,
            'hand1': null,
            'hand2': null,
            'head': null,
            'body': null,
            'scroll' : null
        }

        this.items = [];
        this.gold = 0;

        this.updateAllGUI();

        this.centerCamera();

    }

// ========================================================================== //
// ========================================================================== //

    this.updateAllGUI = function(){

        this.recountSkills();

        updateGoldGUI(this.gold);
        updateHealthGUI(this.health, this.skills.health);
        updateManaGUI(this.mana, this.skills.mana);
        updateInventoryGUI(this.items);

    }

// ========================================================================== //
// ========================================================================== //

    this.onUpdate = function(){
        
        //
        // Regenerate HP
        //        
        if (this.health < this.skills.health){
            if (!this.regen.isActiveHP){
                this.regen.timerHP = 0;
                this.regen.isActiveHP = true;
            }
        }
        
        if (this.regen.isActiveHP){
            this.regen.timerHP++;
            if (this.regen.timerHP >= this.regen.cooldown){
                this.regen.isActiveHP = false;
                this.heal(this.skills.hpRegen, false);
            }
        }
        
        //
        // Regenerate MP
        //        
        if (this.mana < this.skills.mana){
            if (!this.regen.isActiveMP){
                this.regen.timerMP = 0;
                this.regen.isActiveMP = true;
            }
        }
        
        if (this.regen.isActiveMP){
            this.regen.timerMP++;
            if (this.regen.timerMP >= this.regen.cooldown){
                this.regen.isActiveMP = false;
                this.healMana(this.skills.mpRegen, false);
            }
        }
        
    }

// ========================================================================== //
// ========================================================================== //

    this.onSetPosition = function(){
        this.centerCamera();
    }

// ========================================================================== //
// ========================================================================== //

    this.centerCamera = function(){

        cameraX = (this.pos.x + 16) - Math.round(scene.width/2);
        cameraY = (this.pos.y + 16) - Math.round(scene.height/2);

        var maxX = (world.map.width * scene.config.tileSize) - scene.width;
        var maxY = (world.map.height * scene.config.tileSize) - scene.height;

        if (cameraX < 0) {cameraX = 0;}
        if (cameraX > maxX) {cameraX = maxX;}
        if (cameraY < 0) {cameraY = 0;}
        if (cameraY > maxY) {cameraY = maxY;}

        scene.camera.x = cameraX;
        scene.camera.y = cameraY;

    }

// ========================================================================== //
// ========================================================================== //

    this.stop = function(){
        this.isMoving = false;
        this.path = [];
    }

// ========================================================================== //
// ========================================================================== //

    this.onMove = function(){
        this.centerCamera();
    }

// ========================================================================== //
// ========================================================================== //

    this.drawPath = function (){

        if (this.path.length > 0 || this.isMoving){

            var pointIdx = 0;
            var points = this.path.slice();            
            points.unshift({x: this.posCell.x, y: this.posCell.y});

            for(var k in points){
                
                pointIdx++;

                if (pointIdx != points.length){continue;}
                
                var point = points[k];

                var x = point.x * scene.config.tileSize;
                var y = point.y * scene.config.tileSize;

                var screenX = x - scene.camera.x;// + (scene.config.tileSize/2);
                var screenY = y - scene.camera.y;// + (scene.config.tileSize/2);
                
                scene.context.fillStyle = 'rgba(0,0,0,0.15)';
                scene.context.fillRect(screenX, screenY, scene.config.tileSize, scene.config.tileSize);

            }

        }

    }
    
    this.drawMagicCrosshair = function(){
        
        if (this.slots.scroll !== null && game.isHover){
            
            var scroll = this.items[this.slots.scroll];
            
            scene.context.beginPath();
            scene.context.arc(game.mouseX, game.mouseY, scene.config.tileSize/2, 0, 2 * Math.PI, false);
            scene.context.fillStyle = 'rgba(0,0,0,0.5)';
            scene.context.fill();  
            scene.context.closePath();            
            
            scene.context.beginPath();
            scene.context.arc(game.mouseX, game.mouseY, scroll.radius*scene.config.tileSize, 0, 2 * Math.PI, false);
            scene.context.lineWidth = 4;
            scene.context.strokeStyle = 'rgba(0,0,0,0.5)';
            scene.context.stroke();  
            scene.context.closePath();            
            
        }
        
    }

    this.draw = function () {

        this.drawPath();
        this.drawMagicCrosshair();

        var screenX = this.pos.x - scene.camera.x;
        var screenY = this.pos.y - scene.camera.y + this.topOffset;

        var frameX = (this.animation.frame * scene.config.tileSize) + (this.offsetBody * 96);
        var frameY = (this.animation.offsetY * scene.config.tileSize);

        scene.context.drawImage(
            this.imageBody,
            frameX, frameY, scene.config.tileSize, scene.config.tileSize,
            screenX, screenY, scene.config.tileSize, scene.config.tileSize
        );

        frameX = (this.animation.frame * scene.config.tileSize) + (this.offsetHead * 96);

        scene.context.drawImage(
            this.imageHead,
            frameX, frameY, scene.config.tileSize, scene.config.tileSize,
            screenX, screenY, scene.config.tileSize, scene.config.tileSize
        );

        this.animationNextFrame();

    }

// ========================================================================== //
// ========================================================================== //

    this.magicShoot = function(scroll, cellX, cellY){
        
        if ("manaCost" in scroll){
            if (this.mana < scroll.manaCost){
                this.spawnText('No Mana', '255,0,0');
                return false;
            } else {
                this.spawnText('-'+scroll.manaCost, '51,153,204');
                this.mana -= scroll.manaCost;
                updateManaGUI(this.mana, this.skills.mana);
            }
        }
        
        if ("bullet" in scroll){
                        
            $.extend(scroll.bullet, {sprite:"fireball", speed:10});
            
            var bullet = new BulletSprite({
                
                fromCellX: this.posCell.x,
                fromCellY: this.posCell.y,
                toCellX: cellX,
                toCellY: cellY,
                sprite: scroll.bullet.sprite,
                speed: scroll.bullet.speed, 
                damageAmount: scroll.damage, 
                damageRadius: scroll.radius,
                explodeSprite: 
                    new Sprite({
                        sprite:'effects/' + scroll.explosion.sprite,
                        frames: scroll.explosion.frames,
                        cols: scroll.explosion.cols,
                        rows: scroll.explosion.rows,
                        speed: scroll.explosion.speed
                    })                
            }, this.magicExplode)
            
            world.sprites.push(bullet);
            
        } else {
            
            this.magicExplode(cellX, cellY, scroll.radius, scroll.damage, new Sprite({
                sprite:'effects/' + scroll.explosion.sprite,
                cellX: cellX,
                cellY: cellY,
                frames: scroll.explosion.frames,
                cols: scroll.explosion.cols,
                rows: scroll.explosion.rows,
                speed: scroll.explosion.speed
            }));
            
        }
        
        return true;
        
    }
    
    this.magicExplode = function(cellX, cellY, radius, damage, explodeSprite){
        
        world.sprites.push(explodeSprite);

        world.eachActor(function(actor){
            if (actor.type != 'ActorEnemy') {return;}
            var isNear = actor.distanceToCell({x: cellX, y: cellY}) <= radius;
            if (isNear) {
                actor.hit(damage);
            }
        });
        
        if (world.player.distanceToCell({x: cellX, y: cellY}) <= radius){
            world.player.hit(damage);
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.onMapClick = function (event, cellX, cellY) {

        var isVisibleCell = (!world.map.options.isIndoor || (cellX+','+cellY in world.visibleCells));
        var isActiveScroll = (this.slots.scroll !== null);

        if (isActiveScroll){
            var scrollId = this.slots.scroll;
            var scroll = this.items[ scrollId ];
        }

        //
        // Left key clicked
        //
        if (event.which == mouseKeys.left){
        
            if (isVisibleCell && !isActiveScroll) {
                this.setDestination(cellX, cellY);   
            }

            if (isActiveScroll){

                if (this.magicShoot(scroll, cellX, cellY)){

                    if (!("charges" in scroll) || (--scroll.charges <= 0)){
                        this.removeItem(scrollId);
                    } else {
                        this.unwearItem(scroll, scrollId);
                    }

                } else {
                    this.unwearItem(scroll, scrollId);
                }

            }
            
        }
        
        //
        // Right key clicked
        //
        if (event.which == mouseKeys.right){
            if (isActiveScroll){
                this.unwearItem(scroll, scrollId);
            }
        }
        
    }

// ========================================================================== //
// ========================================================================== //

    this.onTouchObject = function (object){

        var dir = this.directionToActor(object);
        this.rotateTo( dir );

    }

// ========================================================================== //
// ========================================================================== //

    this.onTouchActor = function (actor){

        var dir = this.directionToActor(actor);
        this.rotateTo( dir );

        if (actor.type != 'ActorNPC'){
            this.attackActor(actor, dir);
        }

    }

// ========================================================================== //
// ========================================================================== //

    this.acceptQuest = function (quest){
        this.quest = quest;
        this.hasQuest = true;
    }

    this.questCompleted = function (){

        this.hasQuest = false;

        var mapName = this.quest.map;
        var questId = this.quest.id;

        if (!(mapName in this.completedQuests)){
            this.completedQuests[mapName] = {};
        }

        if ("actors" in this.quest){
            for(var a in this.quest.actors){
                var actorName = this.quest.actors[a];
                if (actorName in world.actors){
                    world.actors[actorName].restoreOriginalText();
                }
            }
        }

        this.completedQuests[mapName][questId] = true;

        hideQuestSummary();

    }

    this.isQuestCompleted = function (questId, mapName){

        if (typeof(mapName)=='undefined') {mapName = game.currentMap;}

        if (!(mapName in this.completedQuests)){return false;}

        if (!(questId in this.completedQuests[mapName])){
            return false;
        } else {
            return true;
        }

    }

    this.questFinish = function(){
        delete this.quest;
        this.quest = null;
    }

// ========================================================================== //
// ========================================================================== //

    this.onHit = function(damage){
        updateHealthGUI(this.health, this.skills.health);
    }

    this.onDie = function(){
        game.over();
    }

// ========================================================================== //
// ========================================================================== //

    this.getSkills = function(){
        return this.realSkills;
    }

    this.recountSkills = function(){

        var baseSkills = {};

        $.extend(baseSkills, this.skills);

        this.offsetHead = 0;
        this.offsetBody = 0;

        for(var sId in this.slots){

            if (this.slots[sId] == null) {continue;}
            for(var prop in this.items[ this.slots[sId] ]){

                var value = this.items[ this.slots[sId] ][prop];

                if (prop in this.skills){
                    if (prop != 'hitSpeed'){
                        baseSkills[prop] += this.items[ this.slots[sId] ][prop];
                    } else {
                        baseSkills[prop] = this.items[ this.slots[sId] ][prop];
                    }
                    continue;
                }

                if (prop=='offsetHead') {this.offsetHead = value;}
                if (prop=='offsetBody') {this.offsetBody = value;}

            }

        }

        this.realSkills = baseSkills;

        updateSkillsGUI(this.realSkills);

    }

// ========================================================================== //
// ========================================================================== //

    this.addGold = function(amount){
        this.gold += amount;
        this.spawnText('+ '+amount+' gold', '255,255,0');
        updateGoldGUI(this.gold);
    }

    this.heal = function(amount, noText){
        this.health += amount;
        var maxHp = this.getSkills().health;
        if (this.health > maxHp) {this.health = maxHp;}
        if (typeof(noText)=='undefined') { this.spawnText('+ '+amount, '0,255,0'); }
        updateHealthGUI(this.health, maxHp);
    }

    this.healMana = function(amount, noText){
        this.mana += amount;
        var maxMp = this.getSkills().mana;
        if (this.mana > maxMp) {this.mana = maxMp;}
        if (typeof(noText)=='undefined') { this.spawnText('+ '+amount, '51,153,204'); }
        updateManaGUI(this.mana, maxMp);
    }

// ========================================================================== //
// ========================================================================== //

    this.giveItem = function(itemType, itemData, qty){

        if (typeof(qty) == 'undefined') {qty = 1;}
        
        for (var q=0; q<qty; q++){

            var item = getItem(itemType, itemData);

            if (!("name" in item)) {item.name = itemType;}

            var id = this.items.push(item) - 1;

            if ("slot" in item){
                if (item.slot != 'scroll' && this.slots[item.slot] == null){
                    this.wearItem(id);
                }
            }

        }

        var qtyText = (qty>1) ? ' x '+qty : '';
        this.spawnText('+ '+item.title+qtyText, '255,255,0');

        updateInventoryGUI(this.items);

    }

    this.removeItem = function(itemNameOrId){

        var itemId = (typeof(itemNameOrId) == 'string') ? false : itemNameOrId;
        var item = null;

        if (!itemId){
            for(var i in this.items){
                item = this.items[i];
                if (itemNameOrId == item.name){
                    itemId = i;
                }
            }
        }

        if (itemId !== false){
            
            item = this.items[itemId];
            
            if (item.isActive && ("slot" in item)){
                this.slots[item.slot] = null;
            }
            
            Array.remove(this.items, itemId);
            updateInventoryGUI(this.items);
            return true;
            
        }

        return false;

    }

    this.hasItem = function(itemName){
        for(var i in this.items){
            var item = this.items[i];
            if (itemName == item.name){
                return true;
            }
        }
        return false;
    }

    this.wearItem = function(itemId){

        var item = this.items[ itemId ];
        
        if ("isActive" in item){
            return this.unwearItem(item, itemId);
        }

        if (item.isPotion){
            return item.onDrink(this, itemId);
        }

        if (!("slot" in item)){return;}

        if (this.slots[item.slot] != null){
            var currentId = this.slots[item.slot];
            delete this.items[currentId].isActive;
        }

        this.slots[item.slot] = itemId;
        
        item.isActive = true;

        this.recountSkills();
        
        updateInventoryGUI(this.items);

    }
    
    this.unwearItem = function(item, itemId){
        
        delete this.items[itemId].isActive;
        
        if (("slot" in item)){this.slots[item.slot] = null;}
        
        this.recountSkills();
        
        updateInventoryGUI(this.items);
        
        return true;
        
    }

// ========================================================================== //
// ========================================================================== //

}
