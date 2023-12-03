// A map of playerName to an array of playerPER values
var playerMap = new Map();

// Variables to keep track of constants 
const maxPlayersOnCourt = 5;
const numQuarters = 4;

// Variables to track state throughout the game
var currentQuarter = 0;
var playersOnCourt = 0;
var quarterInPlay = false;


// Variables to track the PER throughout the game
var quarterPER = 0;
var quarterAvePER = 0;
var totalAvePER = 0;

// Function to read in all of the player stats
function processPlayers(allPlayerStats) {
    // Split the data by newline into an array.
    var allPlayerStatLines = allPlayerStats.split(/\r\n|\n/);

    // Remove the header line (first line)
    allPlayerStatLines.shift();

    // Loop through the rows and create a map entry of player name to a list of player PER
    for (var statLine of allPlayerStatLines) {
        // Get all individual stat values
        var stats = statLine.split(',');
        // If it's just an empty line, skip it
        if (!stats || stats.length <= 1) continue; // empty line

        // The second column has the player name
        var playerName = stats[1];

        // Check if player exists in map
        if (!playerMap.has(playerName)) {
            // First time we see the player; Add them in!
            playerMap.set(playerName, []);
        }

        // Get per value for player
        var per = parseFloat(stats[9]);

        // Add per value to player's array (the next quarter)
        playerMap.get(playerName).push(per);
    }

    // Add the players to the bench.
    displayPlayerBench();
}

// Function to add the players to the bench to start the game
function displayPlayerBench() {
    // Get the bench div in which the players will be shown.
    var bench = document.getElementById('playersOnBench');


    // For each player, create a button 
    for (let playerName of playerMap.keys()) {
        // Create a button for each player
        var newPlayer = document.createElement('button');

        // Set the ID to the name of the player so we can get it later
        newPlayer.id = playerName;

        // Identify the style class, which will set the color scheme
        newPlayer.className = 'playerButton';

        // When the button is clicked, call the movePlayer function
        newPlayer.onclick = movePlayer;

        // Add the players image to the button
        var playerImage = document.createElement('img');

        // Set the source (or location) of the image
        playerImage.src = 'images/'+playerName+'.png';

        // Add the image to the button
        newPlayer.appendChild(playerImage);

        // Add the button to the bench
        bench.appendChild(newPlayer);
    }

    // Display cards for all players
    displayPlayerCards();
}

// This function is called at the beginning of the game play to initialize
// PER for each player, and at each quarter to do two things: 
// 1. Ensure the players currently on the court have the correct PER represented
// 2. Update the stats for each player for the current quarter
function displayPlayerCards() {
    // Get the div in which the stats will be shown.
    var playerCardDisplay = document.getElementById('playerCards');

    // For each player, create a player stat card to show the PER for that player for a 
    // specific quarter.
    for (let [playerName, playerStats] of playerMap.entries()) {
        // Create an overall div that will contain the player stat information.
        var playerCard = document.createElement('div');

        // Set an ID for the card so we can get it later
        playerCard.id = playerName + '_card';

        // Set the style class name
        playerCard.className = 'playerCard';

        // Add the player image to the div.
        var playerImage = document.createElement('img');

        // Set the style for the image
        playerImage.className = 'perCard';

        // Load the image
        playerImage.src = 'images/'+playerName+'.png';

        // Add the image to the card
        playerCard.appendChild(playerImage);

        // Add the player's PER to the div.
        var newPlayerPER = document.createElement('p');

        // Set the style for the number
        newPlayerPER.className = 'perCard';

        // Set the text for the PER
        newPlayerPER.innerText = 'PER: ' + playerStats[currentQuarter].toPrecision(4);

        // Add the PER
        playerCard.appendChild(newPlayerPER);

        // Add the player stat card to the game.
        playerCardDisplay.appendChild(playerCard);
    }
}

// This function is called each time a player button is clicked. A player
// button being clicked indicates the players is either moving to the court
// or to the bench for a water break
function movePlayer() {
    // Don't let the coach change players during a quarter.
    if(quarterInPlay) {
        return;
    }

    // Get the div where this button currently is (either bench or court).
    var parentDiv = this.parentElement;

    // Check whether the player is currently on the bench.
    if(parentDiv.id == 'playersOnBench') {
        // If there are already five players on the court, don't let the player
        // move to the court, and alert the coach that there are enough players.
        if(playersOnCourt >= maxPlayersOnCourt){
            alert('You can only have ' + maxPlayersOnCourt + ' players on the court at a time.');
        } else {
            // If there is room on the court, update the number of players on
            // the court, and update the average PER for the quarter based on
            // this player moving to the court.
            playersOnCourt++;
            quarterPER += playerMap.get(this.id)[currentQuarter];
            quarterAvePER = quarterPER / playersOnCourt;
            document.getElementById('currentPER').innerText = 'Current PER: '+ quarterAvePER.toPrecision(4);
            
            // Move the player to the court.
            document.getElementById('playersOnCourt').appendChild(this);
        }
    } else {
        // If the player is being taken off the court for a water break, decrement
        // the number of players on the bench and remove the player's PER from the
        // average.
        playersOnCourt--;

        if(playersOnCourt != 0) {
            quarterPER -= playerMap.get(this.id)[currentQuarter];
            quarterAvePER = quarterPER / playersOnCourt;
        } else {
            // If there are no more players on the court, set the values to 0.
            quarterPER = 0;
            quarterAvePER = 0;
        }

        // Update the PER average. This might result in a zero value if your team is particularly tired.
        document.getElementById('currentPER').innerText = 'Current PER: '+ quarterAvePER.toPrecision(4);

        // Move the player to the bench.
        document.getElementById('playersOnBench').appendChild(this);
    }
}

// At the start of each quarter, do two things: 
// 1. Ensure the players currently on the court have the correct PER represented
// 2. Update the stats for each player for the current quarter.
function updateCardsInGame() {
    // For each player, update their player stat card to show PER for that player for 
    // a specific quarter.
    for (let [playerName, playerStats] of playerMap.entries()) {
        document.getElementById(playerName + '_card').children[1].innerText = 'PER: '+playerStats[currentQuarter].toPrecision(4);
    }

    // Reset the current quarter's total PER.
    quarterPER = 0;
    quarterAvePER = 0;

    // Get a list of all the players currently on the court.
    var currentPlayers = document.getElementById('playersOnCourt').children;

    // Loop through each of the players currently on the court.
    for(var playerIndex = 0; playerIndex < currentPlayers.length; playerIndex++) {
        // Get the name of the player
        var playerName = currentPlayers[playerIndex].id;

        // Get the PER for the player
        var playerPER = playerMap.get(playerName)[currentQuarter];

        // Add the PER to the quarter PER total
        quarterPER += playerPER;
    }

    // Get the average PER for the start of the quarter.
    quarterAvePER = quarterPER / playersOnCourt;

    // Update Current PER with the new average PER for the quarter now that the
    // stats have been updated.
    document.getElementById('currentPER').innerText = 'Current PER: '+ quarterAvePER.toPrecision(4);
}

// At the end of each quarter, show the coach the average PER
// for that quarter, allow the coach to make changes to the
// players on the court again, and add the stats for the next quarter to the game.
function endQuarter() {
    // Update the clock display
    document.getElementById('timer').innerText = 'Q '+ (currentQuarter + 1) + ' Time: 0:00';

    // Allow the coach to move players again.
    quarterInPlay = false;

    // Add the average PER of the quarter to the total count.
    totalAvePER += parseFloat(quarterAvePER.toPrecision(4));

    // Add the value to the display counter above the stats column.
    document.getElementById('averagePER').innerText += quarterAvePER + ' + ';

    // Progress to the next quarter.
    currentQuarter++;

    // Update the stats so that they reflect the next quarter.
    updateCardsInGame();

    // Let the coach know that the new PER stats are up to date. 
    alert('Q' + (currentQuarter+1) + ' PER stats are in!');

    // Encourage the coach to consider new players.
    document.getElementById('quarter').innerText = 'Choose Players for Q'+(currentQuarter+1);

    // Update the button text.
    document.getElementById('start').innerText = 'Start Q'+(currentQuarter+1);
}

// At the end of the game, show the coach the average PER
// for the entire game and clean up the final view of the app.
function endGame() {
    // Don't let the coach move players around; the game is over.
    quarterInPlay = true;

    // Calculate the average PER for the entire game, including the last quarter.
    totalAvePER += parseFloat(quarterAvePER);
    var averagePER = totalAvePER/numQuarters;

    // Let the coach know that the game is over and what the PER was for the game.
    alert('Game Over. Game Average PER was: ' + averagePER.toPrecision(4));
    document.getElementById('averagePER').innerText += quarterAvePER.toPrecision(4) + ' = ' + averagePER.toPrecision(4);

    // Clean up the web app view.
    document.getElementById('timer').innerText = 'That\'s All Folks!';
    document.getElementById('gameButton').innerText = '';
    document.getElementById('quarter').innerText = '';
    document.getElementById('currentPER').innerText = '';
}

// This function is called when the Game button is selected. Each time the button is selected,
// it runs through a 12-second timer (simulating 12 minutes) and then updates the game
// to the next quarter.
function startNextQuarter() {
    // If there aren't exactly five players on the court, alert the coach that the game can't start.
    if(playersOnCourt != maxPlayersOnCourt){
        alert('Choose exactly ' + maxPlayersOnCourt + ' players to be on the court.');
        return;
    }

    // Update the button to indicate a quarter is in progress.
    document.getElementById('start').innerText = 'Q' + (currentQuarter + 1) + ' is in progress';

    // Define the interval period for the quarter; in this case, it's 12 seconds.
    var secondsInQuarter = 12;

    // Set the quarterInPlay variable to true so that the coach
    // can't move players during gameplay
    quarterInPlay = true;

    // Update the count down every 1 second, as indicated by the `1000` as
    // the second parameter to the setInterval function
    var x = setInterval(function() {        
        // Display the current time on the court board.
        document.getElementById('timer').innerText = 'Q '+ (currentQuarter + 1) + ' Time: ' + secondsInQuarter + ':00';

        // Decrement the interval counter for this quarter.
        secondsInQuarter--;

        // If the quarter has ended, reset the interval timer and get ready for the next quarter.
        if (secondsInQuarter < 0) {
            clearInterval(x);
            if(currentQuarter < 3) {
                endQuarter();
            }
            else {
                endGame();
            }
        }
    }, 1000);
}

window.onload = function() {processPlayers(`minutes,player_name,TS%,AST,TO,USG,ORR,DRR,REBR,PER
0,Sylvester,0.6037994941296065,31.556229560404145,14.247461674191653,33.690663214713915,8.162352923904775,17.397835599983598,13.293430352694593,27.5946815515922
0,Marvin the Martian,0.6003955378955129,31.099253666099266,13.83443488361614,29.850942796897073,7.52171006685956,25.82922539357016,11.127022549543284,17.21643503335638
0,Road Runner,0.6128198852887055,23.66157916639098,13.965229320717846,38.26477215718653,6.721815602646059,24.98885502763505,10.607260298142457,22.15957318531562
0,Foghorn Leghorn,0.6111304484979425,27.530811071163832,14.591909450481795,32.15884535552619,6.463586397158988,22.84847741552963,15.548104318617522,26.68695440333875
0,Bugs Bunny,0.6432986488723497,30.74195890573362,16.08148214825431,33.95303169100636,6.483486942596075,21.320479343589497,14.703668562954425,28.85053913931016
0,Elmer Fudd,0.6280334679573035,31.120862134529766,16.480488598832192,38.92711843495718,4.434927772050728,23.368560217281324,13.108324338410155,27.80710734826842
0,Lola Bunny,0.6347430811162186,31.913293658916245,13.673786628900812,37.08012483957427,4.69347728072727,21.169678286199954,13.03917286122242,29.922950189421176
0,Porky Pig,0.6103176921582277,33.5865286102901,15.47493522668911,36.52289224231184,7.008949569155799,11.66926298502942,16.091444263284018,36.90147220655042
0,Tasmanian Devil,0.6259922635139138,30.65935730620354,15.426857558378938,37.27561199699589,2.457328941193046,16.41536097424344,8.627176490713275,25.825566824813148
0,Gossamer,0.6227823871099192,30.08762091546168,14.267514520927328,34.562669916689735,6.089879587953199,16.630228733336715,12.249021323264325,28.588617495805725
0,Granny,0.6061942027212271,27.542131442971137,13.707309813361274,33.13183992706126,6.875358650120952,20.91684937148548,15.766730044626634,28.878356986201187
0,Wile E. Coyote,0.6090102592896859,33.6862225010501,14.742058083074504,32.44634552274032,7.703454430267088,21.912268377329248,13.991661725023818,25.368490929058442
0,Tweety,0.6116235773494003,25.74530755964834,13.361884771475324,36.44771819791753,5.5937520302240085,25.227563607106106,11.270177294099401,22.599034441721347
0,Penelope,0.6031543851804664,28.862487036308814,14.393047980443967,30.044714642371652,8.254342362063936,18.332006278472843,10.548424969721548,20.61603321735495
0,Daffy Duck,0.630206015595036,27.465693980165803,14.086961465292882,34.313308018707886,7.522477175833802,21.280780053047366,15.601494925608657,30.117694803758116
12,Sylvester,0.6231236629427267,28.43689149911685,14.518451245930097,36.91595848931514,7.560012682033771,20.867482361539004,11.887141184938123,26.219601517494734
12,Marvin the Martian,0.6141055711560054,31.36891653859338,14.460285456461895,33.129411089551446,6.34602318377185,21.28347372168065,12.674433002035213,24.89849330026043
12,Road Runner,0.6255332952517898,31.670309547667493,13.041736130035943,35.44398760170825,4.735820904669509,25.66393441674469,12.379200544955639,25.03529632024355
12,Foghorn Leghorn,0.6220127207264822,30.607995325213764,17.196790141630643,35.73313415604279,6.995777209823919,16.73376679556037,14.353172756387636,30.297168074216206
12,Bugs Bunny,0.6354978350997513,32.26470433376699,16.396066255317397,36.19241167301027,4.641905791881806,25.01072138592845,15.914597747424459,29.57975684798709
12,Elmer Fudd,0.6297453764510894,29.045240162647797,16.231995473983808,33.60361408634159,4.455857356911681,19.820680532869016,15.488678668857855,30.146503293850518
12,Lola Bunny,0.634961458099899,30.616559043923065,14.748954407589782,41.53661419104026,7.310944868913967,23.966430980688735,16.70400051340877,34.576889169822735
12,Porky Pig,0.6124340125535433,30.27860061386023,16.56129620074347,36.98630834562338,5.7406402226863085,19.567710926931372,13.844979879868983,28.67751247666376
12,Tasmanian Devil,0.6043800016658292,24.207755742787302,15.359138384637845,38.90391857888024,5.160228596859415,25.78579324079252,11.122978828283438,21.95449159216935
12,Gossamer,0.6142396877999721,32.53436923297691,13.826748192893659,33.556019692150954,6.447275326131501,13.679600975552624,11.658967615553099,28.903859153252714
12,Granny,0.6237734611253216,29.488191855234618,14.067506661200502,33.559932536985315,5.270911121054615,22.13962608453022,15.746717579493113,29.74463801490184
12,Wile E. Coyote,0.6200134416087653,28.28285993425879,12.984269687270977,35.194132255826936,5.021356545496862,23.6925262294397,14.013567413363543,27.68820280962903
12,Tweety,0.626919381737299,29.133263844924706,12.572388231971413,37.927853705875116,6.953971901210632,25.83070931554525,13.155258174877506,27.030629704818583
12,Penelope,0.6244078617305169,26.54351011323211,15.04563484102098,29.93608113001538,9.270228987390256,18.20411097227569,9.461948627917472,19.486467232779194
12,Daffy Duck,0.6384141304825636,30.066145201285547,15.366453666442547,40.593228929028754,5.82120821672494,20.258473579783377,13.122529398845797,31.510373948495054
24,Sylvester,0.6165167203570533,31.952643596027112,14.10614147219552,36.53934382362005,7.827363082582493,17.75348785628401,12.655109288448012,29.12065681792595
24,Marvin the Martian,0.6169669119136199,32.66094516768301,15.179650429365298,33.99341833940998,5.877046427575032,28.66333946905302,13.476578925641856,21.965747672246
24,Road Runner,0.6095916429242308,30.168893846364384,13.822814249151662,37.73176252062633,5.67660355703246,27.03839400405265,13.810810880284551,25.81529587413502
24,Foghorn Leghorn,0.602790121226176,31.999507990385037,17.372659625945094,34.231321244903675,5.796574143175553,23.006912617025318,14.257467224206406,24.624167182217693
24,Bugs Bunny,0.6338686434383141,33.19750261457753,16.202315830972413,35.80767332147137,7.909112203052561,15.31988051211348,14.842102101781743,33.15001856633222
24,Elmer Fudd,0.6109953344943557,31.637569881254663,16.739619100021763,33.1649897689538,4.048223630700218,22.041385013183977,15.048004824209228,26.903572004502013
24,Lola Bunny,0.6351288622309897,34.11218692178605,15.409407319810288,39.15665285164975,2.9874068708383765,23.440748016079702,14.398339849762932,31.347928910538425
24,Porky Pig,0.5972765564591395,29.343892883559054,15.399112747311738,31.553568119701556,4.444306081396458,14.054335106861807,10.436587235979326,24.123980564738122
24,Tasmanian Devil,0.6119519003334367,26.757430589274627,15.818215299515554,34.40983301727758,6.232423740834137,24.144312307989388,6.958451898435141,14.65613094899911
24,Gossamer,0.6206705374815823,33.96150308428197,15.24385886035229,34.26588176090524,5.354195669268761,11.287643632826924,16.283695843852634,37.22323033422737
24,Granny,0.6253295824811697,28.673618531376047,15.206749678618674,36.98644000162375,5.229841582050703,22.39201036174417,13.63276174548093,28.091654989057997
24,Wile E. Coyote,0.6182671738406887,29.156988116411895,13.379760626567741,35.23652281503046,7.638824010142988,18.1775961539729,12.889704224422383,28.679230480596214
24,Tweety,0.6051525885921919,27.822964910079165,13.650314415053192,36.443849269460195,6.556248643034047,25.039866126988006,12.461697581038077,23.800677952415324
24,Penelope,0.6086033915389504,26.270826695604736,16.163519567283362,27.566459424893477,6.950860593414061,17.745000011603814,9.408613520704629,17.311069321125775
24,Daffy Duck,0.6180334826412384,28.702917611332204,14.106461183103486,35.39837734442774,6.335237128622124,21.122110131768718,14.851065161302264,29.539906348666722
36,Sylvester,0.6256867574776135,28.258885409504348,14.32802723519956,35.19363369503445,7.417553768866258,19.07205602661205,12.456893445553863,27.361107605574592
36,Marvin the Martian,0.6161888100860886,32.377447203865344,12.651753859969961,33.67477463664113,6.1827003770362134,20.877433487235564,13.391068428951067,27.736083003949506
36,Road Runner,0.6321773232718849,27.823658865665532,14.01741458240204,35.70584117170302,6.880597366807046,29.858064967870803,12.142985001727787,21.185216056604933
36,Foghorn Leghorn,0.6299103310291885,30.577703109170997,14.399287536126675,35.454407731150596,5.69485284700476,21.43696503662543,12.155357259588483,26.495279903467083
36,Bugs Bunny,0.6384102664649134,29.81184253053817,17.029412387851533,33.888447501859886,7.114551520920471,17.958731927903653,11.137950374978427,24.88923787104422
36,Elmer Fudd,0.6298525939245498,27.72303783854191,15.491524551437083,33.23087223616166,5.232987620829311,22.55335628558841,15.676227638794298,28.583585136103718
36,Lola Bunny,0.6365212486669903,31.714998429187677,13.73950605342369,32.933342259590965,6.497485180183251,22.737258768248378,14.726197546158346,28.40205685557685
36,Porky Pig,0.5945885895282004,30.64423484790004,15.454377467874528,37.05172431307929,6.715195869444401,25.103701719203727,12.100603460181315,22.25662677068402
36,Tasmanian Devil,0.6156974405300525,25.2760046581068,16.081817731721966,35.324688033075205,6.660048353260855,20.058116504731068,10.820788651130389,22.910251520690903
36,Gossamer,0.6213038088639434,29.20867797151906,15.780342307839001,38.40440554647191,5.330748119583327,14.504043680129874,17.009898010353886,37.99398551165659
36,Granny,0.6081598171322123,26.021605015105386,14.814805236921746,31.721274176699445,6.422251664181616,22.213857000000477,16.454224891199935,27.64453465859061
36,Wile E. Coyote,0.6287331255557337,31.218117601539625,13.889446361055933,33.24452404477995,4.701971029954342,21.822751388381057,14.885719539602258,29.251325919096164
36,Tweety,0.6147303246162087,27.013301792448672,12.907983277405807,39.42579631359779,7.716531164154312,24.756671247123585,12.018309664315176,25.734226753645235
36,Penelope,0.5987788687868651,28.055876841600135,14.682573249446513,30.810428206571313,7.406857262017597,19.659072803149982,10.80696317216916,20.334734266547553
36,Daffy Duck,0.6351427504516964,28.87366969836302,15.055379986366297,31.873038903936198,5.855495718190808,22.557538820489178,15.696238130147579,28.296165066608996
`)};