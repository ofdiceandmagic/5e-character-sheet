jQuery(function($) {



/**
 * Right now, to make a new character you just have to change the name. Data is saved and loaded based on the name of the character.
 *      Change to...
 *          localStorage keys are 'cha1', 'cha2', etc.
 *          currentCha var is the data of current cha
 *          New Character button...
 *              checks local sotrage for the highest numbered cha entry.
 *                  let currentNum, highestFoundNum = 0;
 *                  while currentNum <= highestFoundNum:
 *                      if (localStorage.getItem('cha' + currentNum) !== null) highestFoundNum = currentNum
 *                      currentNum ++;
 *              create a new local storage entry with key 'cha' + highestFoundNum
 *              currentCha = localStorage.getItem('cha' + highestFoundNum)
 *              currentChaKey = 'cha' + highestFoundNum
 * 
 *          Load button... 
 *              populate dropdown...
 *                  let chas = []
 *                  for each local sotrage item that begins with 'cha'...
 *                      chas.push(item)
 *                      for each item in chas...
 *                          add a dropdown option with data-name attribute = chas[i].name
 *              select character from dropdown...
 *                  let selectedCha = the data-name attribute of the option they picked
 *                  define cha...
 *                     let currentNum, highestFoundNum = 0;
    *                  while currentNum <= highestFoundNum:
    *                       if (localStorage.getItem('cha' + currentNum) !== null) highestFoundNum = currentNum;
    *                       let tempCha = localStorage.getItem('cha' + currentNum);
    *                       if (tempCha.name == selectedCha):
    *                           currentCha = tempCha;
    *                           currentChaKey = 'cha' + highestFoundNum
    *                           break;
    *                       currentNum ++;
 *                  run the load function
 * 
 *          Save button...
 *              same as current save function except the localStorage.setItem line.
 *                  localStorage.setItem(currentChaKey, cha)
 */



//define vars
const saveTime = document.querySelector('#saveTime');
let editables = document.querySelectorAll('.editable');
let addedCards = [];

//initialize card ui (editbtn, editables, drag, resize) for all cards when doc loads
initializeCardUI('.card');

//load data from local storage
$('#load').click(function(){

    if (typeof(Storage) !== "undefined") {
        let cha;
        let chaName = prompt('Enter the name of the character you want to load.');

        //load the data from local storage
        console.log(`Loading ${chaName}...`)
        if (localStorage.getItem(chaName) !== null) {
            cha = JSON.parse(localStorage.getItem(chaName));
            console.log(cha);
        } else{
            console.log(`... ${chaName} was not found in local storage.`)
        }
    
        //load contents of each card
        for (let i = 0; i < editables.length; i++) {
            let editableID = editables[i].getAttribute('id');
            editables[i].innerHTML = cha[editableID];
        }

        //load save time
        saveTime.innerHTML = cha.saveTime;

        //load added cards
        addedCards = cha.addedCards || [];
        for (const card of addedCards) {
            addCard(card, false, true);
        }
        console.log('...loaded added cards')
        
        //set cardPopOutStates of cards
        console.log('loading card popout states of cards...',cha.cardPopOutStates);
        for (const [id,state] of Object.entries(cha.cardPopOutStates)){
            $(`#${id}`).css('position',state);
            if (state == 'absolute') $(`#${id} .popOut i`).addClass('fa-rotate-180');
        }
        
        //set position of cards
        console.log('loading position of cards...', cha.cardPositions);
        for (const [id,pos] of Object.entries(cha.cardPositions)){
            let cardTop = pos.top;
            let cardLeft = pos.left;
            let cardpos = $(`#${id}`).css('position');
            console.log(`loading ${id} position. Position = ${cardpos}. Offset = ${cardTop},${cardLeft}.`);
            $(`#${id}`).attr('data-pos-t', cardTop)
                .attr('data-pos-l', cardLeft)
                .offset({top:cardTop, left:cardLeft})
        }

        //set height and width of cards
        console.log('loading height and width of cards...', cha.cardSizes);
        for (const [id,size] of Object.entries(cha.cardSizes)){
            let height = size.height;
            let width = size.width;
            console.log(`loading ${id} size. Height = ${height}, Width = ${width}.`);
            $(`#${id}`).width(width).height(height);
        }
    }    
});

//save character to local storage
function save(){
    let cha = {};
    for (var i = 0; i < editables.length; i++) {
        let editableID = editables[i].getAttribute('id');
        cha[editableID] = editables[i].innerHTML;
    }

    let dateTime = new Date().toLocaleString();
    saveTime.innerHTML = dateTime;
    cha.saveTime = saveTime.innerHTML;

    let chaName = document.querySelector('#name').innerHTML;

    //save pos of all cards that are not 'in-col'
    //    save an object... key is id val is offset.
    let cardPositions = {};
    $('.card[data-pos-t]:not([data-pos-t="in-col"])').each(function(i){
        let id = $(this).attr('id');
        cardPositions[id] = $(this).offset();
    });
    cha.cardPositions = cardPositions;

    //save position absolute/state as popOut
    let cardPopOutStates = {}
    $('.card').each(function(){
        let id = $(this).attr('id');
        cardPopOutStates[id] = $(this).css('position');
    });
    cha.cardPopOutStates = cardPopOutStates;

    //save the height and width of all cards
    let cardSizes = {};
    $('.card[data-pos-t]:not([data-pos-t="in-col"])').each(function(i){
        let id = $(this).attr('id');
        cardSizes[id] = {
            width: $(this).width(),
            height: $(this).height()
        };
    });
    cha.cardSizes = cardSizes;

    //save added cards
    cha.addedCards = addedCards;

    console.log('Saving character in local storage.', cha);
    //save to local storage
    localStorage.setItem(chaName, JSON.stringify(cha));
}


//options menu
$('#optionDots').click(function(){
    $('#optionMenu').toggle();
});

//add card
$('#addCard').on('click', function(){
    addCard();
});

function addCard(card, s=true, l=false){
    //card is either undefined (in the case of creating a new card) or a string of the outerHTML of a card (in the case of loading an addedCard)
    console.log('...adding a card.');
    let col = '#col3';
    let cardID;
    try {  //if card is undefined or doesn't have an id in the specified format...
        cardID = card.match( /(?<=id\=\"card)(.*?)(?=\")/g );
    } catch(err){//... we're adding a new card so give it an id = the length of the array (which will be 1 more than the last one)
        cardID = addedCards.length;
    }
    console.log('added cards: ', addedCards);
    console.log('card: ', card, 'cardID: ', cardID);
    let cardhtml = card || `
        <div class="card" id="card${cardID}" data-pos-t="in-col" data-pos-l="in-col">
            <span class="dragCard"><i class="fas fa-arrows-alt"></i></span>
            <span class="editCard"><i class="fas fa-edit"></i></span>
            <span class="popOut"><i class="fas fa-external-link-alt"></i></span>
            <span class="cardOpts">
                <span class="cardDots"><i class="fas fa-ellipsis-v"></i></span>
                <div class="cardOptsMenu">
                <span class="cardOption">Example</span>
                </div>
            </span>
            <div class="editable" id="editor${addedCards.length+1}" contentEditable="false"></div>
        </div>
    `;
    $(col).append(cardhtml);
    if (s) addedCards.push(cardhtml); //s=false during the load function. This prevents an infinite loop (load func calls this func to load an added card, this line adds that card again to the addedCards array... voila, infinite loop.)
    faFallback();
    
    //make the card draggable and resizable
    initializeCardUI(`#card${cardID}`, l);

    if (s) save();
}

function initializeCardUI(selector, loading = false){
    console.log(`... initializing card ui for ${selector}.`);

    //change contenteditable to true when they click to make a card editable
    //save to local storage when they click on edit again
    $(`${selector} .editCard`).click(function(){
        const cardContent = $(this).parent().find('.editable')[0];
        const cardID = $(this).parent().attr('id');
        if (cardContent.contentEditable == 'true'){
            cardContent.contentEditable = 'false';
            //update the proper entry in the addedcards array (unless its a defCard), then save
            if (cardID.match(/defCard(?=d*)/g)){ //change this when i make def cards a class instead of the id
                console.log('... ... addedCards array not updated...default cards arent added cards');
            } else{
                const cardIDnum = cardID.match(/(?<=card)(.)/g);
                addedCards[cardIDnum] = $(this).parent().prop('outerHTML'); //<-- the card
                console.log(`... ... updated entry ${cardIDnum} in addedCards array.`);
            }
            save();
        } else {
            cardContent.contentEditable = 'true';
        }
    });

    //make it draggable and resizable
    $(selector)
        .draggable({
            handle:'.dragCard',
            create: function(e, ui){
                if (!loading) $(this).css('position','static'); //if this isn't during the load function, give it position static
            }
        })
        .resizable().resizable('destroy').resizable() //for some reason, loaded addedCards weren't resizing. destroying it first fixes it. resizable needs to be called before destory bc 'cannot call methods on resizable before initialization'.
    ;

    //save the position when it has stopped being dragged
    $(selector).on('dragstop', function(e, ui){
        let offset = $(this).offset();
        let left = offset.left;
        let top = offset.top;

        this.setAttribute('data-pos-l', left);
        this.setAttribute('data-pos-t', top);

        save();
    });

    //save after resize
    $(selector).on('resizestop', function(e,ui){
        save();
    });

    //card options menus
    $(`${selector} .cardDots`).click(function(){
        $(this).next().toggle();
    });

    //pop out button
    //on load, check if the card is static or absolute and rotate the popout icon if necesary
    let cardPos = $(selector).css('position');
    if ( cardPos == 'static' ) {
        $(`${selector} .popOut i`).removeClass('fa-rotate-180');
    } else if ( cardPos == 'absolute' ) {
        $(`${selector} .popOut i`).addClass('fa-rotate-180');
    }
    //on click of .popout, rotate the icon as needed and switch between static and absolute positioning
    $(`${selector} .popOut`).click(function(){
        let card = $(this).parent();
        let cardPos = card.css('position');
        let cardID = card.attr('id');
        let cardIDnum = cardID.match(/(?<=card)(.)/g);
        let cardHTML;
        if (cardPos == 'absolute'){
            card.css('position','static');
            $(this).find('i').removeClass('fa-rotate-180');
            //if its an added card, find its entry in the addedCards array and replace 'position: absolute' with 'position: static'
            cardHTML = card.prop('outerHTML');
            if (!card.hasClass('defCard')){
                addedCards[cardIDnum] = cardHTML;
            }
        } else if (cardPos == 'static'){
            card.css('position','absolute');
            $(this).find('i').addClass('fa-rotate-180');
            //if its an added card, find its entry in the addedCards array and replace 'position: static' with 'position: absolute'
            cardHTML = card.prop('outerHTML');
            if (!card.hasClass('defCard')){
                addedCards[cardIDnum] = cardHTML;
            }
        }
        console.log(addedCards[cardIDnum]);
        save()
    });
}





//if font awesome didn't load, load fallbacks for font awesome icons
function faFallback(){
    //change this - #defCard1 to .defCard when I make defCard a class instead of id
    let isFAloaded = ( $('#defCard1 > span.editCard > i').css('fontFamily') );
    if (!isFAloaded){
        //add innerHTML to the icons
        $('.fa-ellipsis-v').html('&#8942;');
        $('.fa-plus').html('&plus;');
        $('.fa-arrows-alt').html('&#8281;');
        $('.fa-edit').html('&#9997');
        $('.fa-external-link-alt').html('&#8599;')
        console.log('fa isnt loaded, fallback activated.');
    }
}
faFallback();

});