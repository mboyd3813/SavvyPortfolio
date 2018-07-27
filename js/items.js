//
// Items definitions
//
function getItem(itemType, itemData){
    
    var item = {};
    
    // last sprite = 21
    
    switch (itemType){
            
            // tools
            case 'lamp':item = {spriteId: 0, title: 'Lamp', slot: 'meta', vision: 5};break;

            // weapons
            case 'key':item = {spriteId: 1, title: 'Key'};break;
            case 'knife':item = {spriteId: 2, title: 'Knife', slot: 'hand1', attack:2, hitSpeed: 7};break;
            case 'sword':item = {spriteId: 3, title: 'Sword', slot: 'hand1', attack:6, hitSpeed: 5};break;
            case 'axe':item = {spriteId: 4, title: 'Axe', slot: 'hand1', attack:12, hitSpeed: 3};break;
            case 'shield1':item = {spriteId: 5, title: 'Shield', slot: 'hand2', armor:1};break;
            case 'shield2':item = {spriteId: 6, title: 'Durable Shield', slot: 'hand2', armor:2};break;
            
            // armors
            case 'cape':item = {spriteId: 7, title: 'Cape', slot: 'body', armor:2, offsetBody: 1};break;
            case 'hood':item = {spriteId: 8, title: 'Hood', slot: 'head', armor:1, offsetHead: 1};break;
            case 'armor':item = {spriteId: 9, title: 'Armor', slot: 'body', armor:4, offsetBody: 2};break;
            case 'helmet':item = {spriteId: 10, title: 'Helmet', slot: 'head', armor:3, offsetHead: 2};break;
            case 'goldarmor':item = {spriteId: 11, title: 'Golden Armor', slot: 'body', armor:6, offsetBody: 3};break;
            case 'goldhelmet':item = {spriteId: 12, title: 'Golden Helmet', slot: 'head', armor:5, offsetHead: 3};break;
            
            // potions
            case 'hp':item = {spriteId: 14, title: 'Health Potion', health:30, isPotion:true, onDrink: onDrinkHealthPotion};break;
            case 'hp-big':item = {spriteId: 15, title: 'Large Health Potion', health:100, isPotion:true, onDrink: onDrinkHealthPotion};break;
            case 'mp':item = {spriteId: 20, title: 'Mana Potion', mana:20, isPotion:true, onDrink: onDrinkManaPotion};break;
            case 'mp-big':item = {spriteId: 21, title: 'Large Mana Potion', mana:100, isPotion:true, onDrink: onDrinkManaPotion};break;
            
            // quest items
            case 'harp':item = {spriteId: 13, title: 'Harp'};break;
            case 'letter':item = {spriteId: 16, title: 'Letter'};break;
            case 'hammer':item = {spriteId: 17, title: 'Forge Hammer'};break;
            
            // scrolls
            case 'scroll_fire':
                item = {
                    spriteId: 18, 
                    title: 'Scroll of Fire', 
                    slot: 'scroll', 
                    charges: 3,
                    manaCost: 10,
                    damage:25, 
                    radius:2,                    
                    bullet: {
                        sprite: 'fireball',
                        speed: 10
                    }, 
                    explosion: {
                        sprite:'explosion2',
                        frames:12,
                        cols:3,
                        rows:4,
                        speed:2
                    }
                };        
                break;
                
            case 'scroll_dark':
                item = {
                    spriteId: 19, 
                    title: 'Scroll of Darkness', 
                    slot: 'scroll', 
                    charges: 4, 
                    manaCost: 10,
                    damage:15, 
                    radius:2,                    
                    explosion: {
                        sprite:'darkness',
                        frames:10,
                        cols:5,
                        rows:2,
                        speed:3
                    }               
                };
                break;
            
    }    
        
    if (typeof(itemData) == 'object'){ $.extend(item, itemData); }
    
    return item;
        
}

//
// Items callbacks
//
function onDrinkHealthPotion(player, id){
    player.heal(this.health);
    player.removeItem(id);
    return true;
}
function onDrinkManaPotion(player, id){
    player.healMana(this.mana);
    player.removeItem(id);
    return true;
}
