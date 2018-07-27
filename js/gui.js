var skillNames = {
    'attack': {title: 'Attack', sign: ' +'},
    'armor': {title: 'Armor', sign: ' +'},
    'hitSpeed': {title: 'Attack Speed', sign: ' = '},
    'vision': {title: 'Vision', sign: ' = '},
    'health': {title: 'Health', sign: ' +'},    
    'damage': {title: 'Damage', sign: ': '},
    'radius': {title: 'Radius', sign: ': '},
    'charges': {title: 'Charges', sign: ': '},
    'mana': {title: 'Mana', sign: ' +'},
    'manaCost': {title: 'Mana Cost', sign: ' -'}
};

function showSignMessage(sprite, text){
    
    game.isPaused = true;

    $('#dialog-modal-actor .content').html(text);
    $('#dialog-modal-actor .avatar').css('background-image', 'url("gfx/sprites/'+sprite+'.png")');
    $('#dialog-modal-actor .avatar').css('background-position', '0 0');

    $('#dialog-modal-actor').dialog({
        title: '', 
        modal: true,
        width:430,
        buttons: {
            "Ok": function() {
                $(this).dialog("close");
            }
        },
        close: function(event, ui) {game.isPaused = false;}
    });
    
}

function showActorMessage(actor, textOrQuest, callback){

    game.isPaused = true;

    var text = '';
    var quest = null;
    var buttons = {};

    //
    // this dialog is quest invitation
    //
    if (typeof(textOrQuest) == "object"){
        quest = textOrQuest;
        text = quest.invite.text;
        buttons[quest.invite.yesText] = function(){
            world.player.acceptQuest(quest);            
            $(this).dialog("close");
            actor.onPlayerTouch();
        }
        buttons[quest.invite.noText] = function(){
            $(this).dialog("close");
        }
    }

    //
    // this dialog is just speech
    //
    if (typeof(textOrQuest) == "string"){
        text = textOrQuest;
        buttons["Ok"] = function() {
            $(this).dialog("close");
            if (typeof(callback) == 'function'){
                callback(actor);
            }
        }
    }

    //
    // show dialog
    //
    var sprite = actor.options.sprite;
    var actorName = actor.options.name;

    $('#dialog-modal-actor .content').html(text);
    $('#dialog-modal-actor .avatar').css('background-image', 'url("gfx/actors/'+sprite+'.png")');
    $('#dialog-modal-actor .avatar').css('background-position', '-32px 0');

    $('#dialog-modal-actor').dialog({
        title: actorName, 
        modal: true,
        width:430,
        buttons: buttons,
        close: function(event, ui) {game.isPaused = false;}
    });

}

// ========================================================================== //
// ========================================================================== //

function showQuestSummary(text){

    var delay = 700;

    if ($('#quest-info:visible').length){
        $('#quest-info').fadeOut(delay, function(){
            $('#quest-info .summary').html(text);
            $('#quest-info').fadeIn(delay);
        });
    } else {
        $('#quest-info .summary').html(text);
        $('#quest-info').fadeIn(delay);
    }
    
}

function hideQuestSummary(){
    var delay = 700;
    $('#quest-info').fadeOut(delay);
}

// ========================================================================== //
// ========================================================================== //

function showGameOverMessage(){

    $('#dialog-modal-gameover').dialog({
        modal: true,
        width: '430px', 
        buttons: {
            "Загрузить сохранение": function(){
                window.location.href = window.location.href;
            },
            "Новая игра": function(){
                window.localStorage.removeItem('game:progress');
                window.location.href = window.location.href;
            }        
        }
    });

}

function showMessage(text, callback){

    $('#dialog-modal-message .content').html(text);

    $('#dialog-modal-message').dialog({
        modal: true,
        width: '430px', 
        buttons: {
            "Ok": function(){
                $(this).dialog("close");
                if (typeof(callback) == 'function'){
                    callback(actor);
                }
            }
        }
    });

}

// ========================================================================== //
// ========================================================================== //

function updateInventoryGUI(items){
    
    $('#inventory').html('');
    
    $('#item-hint').hide();

    for(var i in items){
        
        var item = items[i];
        var html = '';
        var offset = item.spriteId * 32;

        var classes = ['item'];
        if ("slot" in item || "isPotion" in item){ classes.push('clickable'); }
        if ("isActive" in item){ classes.push('active'); }
        classes = classes.join(" ");
        
        var effects = [];
        for(var p in skillNames){
            if (p in item){
                effects.push(skillNames[p].title+skillNames[p].sign+item[p]);
            }
        }

        effects = (effects.length > 0) ? effects.join('|') : '';

        html += '<li class="'+classes+'" data-title="'+item.title+'" data-id="'+i+'" data-effects="'+effects+'">';
        html += '<div style="background-position: -'+offset+'px top"></div>';
        html += '</li>';
        
        $('#inventory').append(html);
        
    }

    $('#inventory .clickable').bind('click', function(){
        world.player.wearItem( $(this).data('id') );
    });
    
    $('#inventory li').hover(
        function(){

            var e = $(this).data('effects');
            e = e ? e.split('|') : false;

            $('#item-hint .title').html($(this).data('title'));
            $('#item-hint .effects').html('').hide();
            if (e){
                $('#item-hint .effects').show();
                for (var k in e){
                    $('#item-hint .effects').append('<li>'+e[k]+'</li>');
                }
            }

            var p = $(this).position();
            var t = p.top - $('#item-hint').height() - 3;
            var l = p.left - 4;

            $('#item-hint').css('left', l+'px').css('top', t+'px').show();

        },
        function(){
            $('#item-hint').hide();
        }
    );

}

function updateHealthGUI(hp, maxHp){    
    var prc = Math.floor((hp*100)/maxHp);    
    $('#hp-info').attr('title', hp+'/'+maxHp);
    $('#hp-info .value').css('width', prc+'%');    
}

function updateManaGUI(mp, maxMp){    
    var prc = Math.floor((mp*100)/maxMp);    
    $('#mp-info').attr('title', mp+'/'+maxMp);
    $('#mp-info .value').css('width', prc+'%');        
}

function updateSkillsGUI(skills){    
    $('#skills-info .attack').html(skills.attack);
    $('#skills-info .armor').html(skills.armor);
}

var currGold = 0;
function updateGoldGUI(gold){

    if (gold != currGold){
        if (gold > currGold){
            currGold++;
        } else {
            currGold--;
        }
    }

    $('#skills-info .gold').html(currGold);

    if (gold != currGold){ setTimeout('updateGoldGUI('+gold+')', 60); }
    
}

// ========================================================================== //
// ========================================================================== //