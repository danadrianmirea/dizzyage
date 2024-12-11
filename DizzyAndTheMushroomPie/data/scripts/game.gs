/////////////////////////////////////////////////////////////////////////////////
// game.gs
// Users write here basic functions specific for their game. Also check the gamedef.gs
// Advanced users may need to adjust other files as well.
//
// Here are the callback functions that usually stay in this file:
//
// Initialization callbacks:
// RoomsSetNames, ObjectsSetNames, RoomSetCustomText, SaveUserData, LoadUserData, BeginNewGame
//
// Rooms interaction callbacks:
// UpdateRoom_RX_RY()		- called by HandlerGameUpdate while player is in room RX,RY (non-latent)
// AfterRoom_RX_RY()			- called by HandlerGameAfterUpdate while player is in room RX,RY (non-latent)
// OpenRoom_RX_RY()			- called by HandlerRoomOpen when room RX,RY is opened (non-latent)
// CloseRoom_RX_RY()		- called by HandlerRoomClose when room RX,RY is closed (non-latent)
// OutRoom_RX_RY()			- called by HandlerRoomOut when player wants to exit room RX,RY (can reposition player here) (non-latent)
//
// Objects interaction callbacks:
// PickupObject_ID()		- called when picking up item ID (latent)
// DropObject_ID()			- called when droping item ID (latent)
// ActionObject_ID()		- called when player hits ACTION key on object ID (latent)
// UseObject_ID( idx )		- called when player wants to use object idx (from inventory) over the ID object (from the map) (latent)
// CollideObject_ID_MODE()	- called when player collides with object ID in mode MODE (0=exit from collision, 1=just entered collision, 2=continuing to collide) (latent)
//
// Player callbacks:
// PlayerDeathMessage( death ) 	- called by PlayerLoseLife and sould just return the death message text. return "" for no death message box (latent)
// RespawnPlayer_DEATH()		- called by PlayerLoseLife for custom death respawns. DEATH is the value of player's P_DEATH property
//
// ID, RX, RY, MODE are to pe replaced with coresponding numbers
//
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// Sets room names (non-latent)
// By default it loads them from the dizzy.nam file, using the RoomsLoadNames() function.
// You can also set the names for each room, by hand, with RoomSetName().
// Ex: RoomSetName( 1,1, "PRESS ACTION TO START" );
/////////////////////////////////////////////////////////////////////////////////
func RoomsSetNames()
{
	RoomsLoadNames(ROOM_NAMESFILE);
}

/////////////////////////////////////////////////////////////////////////////////
// Sets names to object items (non-latent)
// All items tht you might pick up and view in the inventory, must have names set.
// Use the ID you specified for the object in the map editor, to find the object.
// See ObjSetName() and ObjFind().
// Ex: ObjSetName(ObjFind(100),"BUCKET");
/////////////////////////////////////////////////////////////////////////////////
func ObjectsSetNames()
{
	ObjSetName( ObjFind(200), "OLD PICKAXE" );
	ObjSetName( ObjFind(201), "ELEVATOR KEY" );
	ObjSetName( ObjFind(202), "PILE OF GRASS" );
	ObjSetName( ObjFind(203), "MUSHROOMS" );
	ObjSetName( ObjFind(204), "DELICIOUS PIE" );
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; rx; room x coordinate
// IN: int; ry; room y coordinate
// IN: int; idx; room custom text index (0-3)
// IN: ref; strref; string reference to the custom text
// Sets custom texts for each room (non-latent)
// There are 4 custom texts per room, that can be set from the map editor.
// They are saved by default in the ROOM_TEXTSFILE file (dizzy.rt)
// Each game receives these texts through this callback when the map is loaded
// and it can interpret them as it wants, for example to fill custom structures
// per each room, like ambient sounds, or any other things.
// Only non-empty strings are saved from the editor.
// This function uses string reference for speed.
/////////////////////////////////////////////////////////////////////////////////
func RoomSetCustomText( rx, ry, idx, refstr )
{
	// println("RCT: ",rx,",",ry,",",idx," = ",(*refstr));
	// ...
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; death; cause of death
// Returns the player death message. Called by PlayerLoseLife().
// Declare more death defines in gamedef.gs (like DEATH_INFIRE, or DEATH_BATS)
// and set them to hurt and kill objects or just set them in the player's 
// P_DEATH property, then return specific messages in this callback, 
// for each cacuse of death .
/////////////////////////////////////////////////////////////////////////////////
func PlayerDeathMessage( death )
{
	if(death==-1)					return "";
	// ...
	return "YOU HAVE DIED!";		// default
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; file; file handler
// OUT: int; return 0 if something has failed, or 1 if operation was successful
// Saves additional user data.
// Users can save here the additional data (like global GS9 variables) they might need to place in the saved game file.
// Called from SaveGame(). See LoadUserData().
// Ex: if(!gs_filewriteint(g_myvariable,file)) return 0;
/////////////////////////////////////////////////////////////////////////////////
func SaveUserData( file )
{
	// ...
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; file; file handler
// OUT: int; return 0 if something has failed, or 1 if operation was successful
// Load additional user data.
// Users can load here the additional data (like global GS9 variables) they saved before.
// They can also set various things, that depends on the just loaded data.
// For example, since the room's or object's names are not stored in the saved game, 
// if such a name is changed as the result of a solved puzzle, when the game is loaded, 
// it must be changed again, accordingly to the status of the puzzle.
// Called from LoadGame(). See SaveUserData(). 
// Ex: if(!gs_filereadint(&g_myvariable, file)) return 0;
/////////////////////////////////////////////////////////////////////////////////
func LoadUserData( file )
{
	// ...
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// This function is called from MainMenu when a new game begins.
// Users must write here whatever they need their game to do, when it's started.
// For example here can be placed or called an intro sequence.
// In the end, the game must be unpaused, the player must be positioned where he must start, game music can be played, etc.
// In the Default Template this also opens a "Hello World!" message.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func BeginNewGame()
{
	GameSet(G_PAUSE,0);							// unpause the game
	PlayerSet(P_DISABLE,0);						// enable player
	PlayerSetPos(PLAYER_BEGINX,PLAYER_BEGINY);	// set begin position
	MusicFade(1,1);								// set music fade options
	MusicPlay(MUSIC_TUNE1);						// play default music

	//DoShake(40);DoRumble(40);
	
	//Message0(0,0,"AS YOU ENTER THE CAVE,\nYOU HEAR THE ENTRANCE\nCOLLAPSING BEHIND YOU.");
	//MessagePop();
	//Message1(12,2,"\"OH,NO!\nI'M TRAPPED!\"");
	//MessageNext("\"EVEN IF I FIND\nTHE MUSHROOMS,\nI'LL NEVER BE ABLE\nTO GET OUT OF HERE.\"");
	//MessagePop();
	//MessageNext("\"GRAND DIZZY WILL\nSURE MISS HIS PIE.\"");
	//MessagePop();

	//PlayerSetPos(1608,390);
	PlayerSetPos(1588,198);
}

/////////////////////////////////////////////////////////////////////////////////
// Interactions
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// ROOM: DEEP CAVE
/////////////////////////////////////////////////////////////////////////////////
func UpdateRoom_1_2()
{
	AIUpdateTrain( ObjFind(110) ); // bat 1
	AIUpdateTrain( ObjFind(111) ); // bat 2
}

/////////////////////////////////////////////////////////////////////////////////
// ROOM: CAVE ENTRANCE
/////////////////////////////////////////////////////////////////////////////////
func UseObject_120( idx ) // blocking rocks
{
	if(ObjGet(idx,O_ID)!=200) { DoDropObject(idx); return; }
	objidx = ObjFind(120);
	status = ObjGet(objidx,O_STATUS);
	if(status==0)
	{
		SamplePlay(FX_SUCCESS);
		Message0(2,2,"YOU HIT HARD\nWITH THE PICKAXE\nAND...");
		MessageNext("SOME OF THE ROCKS\nCRUMBLE DOWN.");
		MessagePop();
		ObjSet( ObjFind(121), O_DISABLE, 1 );
		GameCommand(CMD_REFRESH);
		status=1;
	}
	else
	if(status==1)
	{
		SamplePlay(FX_SUCCESS);
		Message0(8,3,"YOU HIT AGAIN,\nEVEN HARDER.\nAND FINALLY...");
		MessageNext("THE ENTRANCE IS CLEARED.");
		MessagePop();
		ObjSet( ObjFind(122), O_DISABLE, 1 );
		ObjSet( ObjFind(123), O_DISABLE, 1 );
		BrushSet( BrushFind(124), B_DRAW, 0 );
		ObjSet( objidx,O_DISABLE,1 ); // disable trigger
		GameCommand(CMD_REFRESH);
		status=2;
	}
	ObjSet(objidx,O_STATUS,status);
}

/////////////////////////////////////////////////////////////////////////////////
// ROOM: DYLAN'S HOUSE
/////////////////////////////////////////////////////////////////////////////////
func UpdateRoom_3_1()
{
	AIUpdateChainLink( ObjFind(146) ); 	// spider wire
	AIUpdateSpider( ObjFind(147) ); 	// spider
}

/////////////////////////////////////////////////////////////////////////////////
// ROOM: TREE ELEVATOR 
/////////////////////////////////////////////////////////////////////////////////
func UpdateRoom_3_2()
{
	AIUpdateTrain( ObjFind(100) ); 		// elevator bottom
	AIUpdateTrain( ObjFind(101) ); 		// elevator top
	AIUpdateChainLink( ObjFind(102) ); 	// elevator chain
}

/////////////////////////////////////////////////////////////////////////////////
// DYLAN id=103
/////////////////////////////////////////////////////////////////////////////////
func CollideObject_103_1( idx ) // dylan
{
	objidx = ObjFind(103);
	if(ObjGet(objidx,O_STATUS)==0) // not spoken to
	{
		Message1(4,8,"\"HI DYLAN!\""); 
		MessagePop();
		Message2(10,2,"\"OH,DIZZY!\nTERRIBLE THING HAPPENED!\""); 
		MessageNext("\"I WAS WALKING\nBY THE RIVER AND\nI'M AFRAID I'VE LOST\nMY ELEVATOR'S KEY.\""); 
		MessagePop();
		Message1(0,6,"\"SORRY DYLAN,\nBUT I'M IN A BIG HURRY.\nI MUST...\""); 
		MessagePop();
		Message2(8,4,"\"PLEASE DIZZY,\nI CAN'T GO UP WITHOUT IT!\nIT'S GETTING DARK,\nYOU KNOW...\"");
		MessagePop();
		Message1(2,6,"\"OH, I'LL SEE\nWHAT I CAN DO.\""); 
		MessagePop();
		ObjSet(objidx,O_STATUS,1);
	}
}

func UseObject_103( idx ) // dylan
{
	objidx = ObjFind(103);
	if(ObjGet(objidx,O_STATUS)!=1) { DropObject(idx); return; }
	if(ObjGet(idx,O_ID)!=201)
	{
		Message2(10,2,"\"NEED THE KEY,DIZZY!\nTHE ELEVATOR'S KEY!\"");
		MessagePop();
		return;
	}
	
	SamplePlay(FX_SUCCESS);
	Message1(0,4,"\"HERE IS YOUR KEY,DYLAN.\nBE MORE CAREFUL NEXT TIME\""); 
	MessagePop();
	Message2(8,2,"\"THANKS DIZZY!\nI PROMISE I WILL.\""); 
	MessagePop();
	InventorySub(idx);
	ObjSet(objidx,O_STATUS,2);
	ObjSet(objidx,O_X,792);
	ObjSet(objidx,O_Y,216);
	ObjSet(objidx,O_TILE,175); //happy
	
	// elevator
	ObjSet(ObjFind(100),O_STATUS,1);
	ObjSet(ObjFind(101),O_STATUS,1);
}

/////////////////////////////////////////////////////////////////////////////////
// ROOM: RIVER CROSS
/////////////////////////////////////////////////////////////////////////////////
func UpdateRoom_4_2()
{
	idx = ObjFind(105); // boat
	ObjPresent(idx);
	AIUpdateTrain( idx );
}

/////////////////////////////////////////////////////////////////////////////////
// ROOM: GRASS FIELDS
/////////////////////////////////////////////////////////////////////////////////
func UpdateRoom_5_2()
{
	idx = ObjFind(105); // boat
	ObjPresent(idx);
	AIUpdateTrain( idx );
}

func OutRoom_5_2()
{
	if(PlayerGet(P_X)<1440) return;
	idxmushroom = ObjFind(203);
	if( InventoryFind(idxmushroom)==-1 && ObjGet(idxmushroom,O_X)<1440 && ObjGet(idxmushroom,O_DISABLE)==0 ) // if left behind
	{
		PlayerSet(P_X,1440-DIZ_STEP);
		ScrRequest( gs_fid( "RoomDenied" ) );
	}
}

func RoomDenied()
{
	Message1(20,3,"\"I BETTER DON'T RETURN\nWITHOUT THE MUSHROOMS.\"");
	MessagePop();
	PlayerEnterIdle();
}

/////////////////////////////////////////////////////////////////////////////////
// TROLL id=130
// status 0=not spoked to, 1=spoken to, 2=dizzy warned, 3=paid the coins
/////////////////////////////////////////////////////////////////////////////////
func CollideObject_130_1( idx ) // troll
{
	objidx = ObjFind(130);
	status = ObjGet(objidx,O_STATUS);
	if(status==0) // first time
	{
		Message2(20,4,"\"NOT SO FAST...\""); 
		MessagePop();
		PlayerSetPos(1360,374);
		PlayerEnterIdle();
		Message1(2,5,"\"YOU AGAIN!\n WHAT DO YOU WANT\nTHIS TIME?\"");
		MessagePop();
		Message2(10,4,"\"THE BRIDGE TAX OF COURSE!\nNO MONEY, NO CROSS.\""); 
		MessagePop();
		Message1(0,2,"\"THE BOAT YOU MEAN?\nTHAT'S NO BRIDGE!\nAND I'VE ALREADY\nCROSSED IT.\"");
		MessageNext("\"YOU SHOULD'VE STAYED\nON THE OTHER SIDE.\"");
		MessagePop();
		Message2(10,2,"\"NO! NO! THAT'S WHAT\nTHE OTHER GUY SAID,\nWHEN I STAYED THERE.\""); 
		MessageNext("\"I'LL NOT BE FOOLED AGAIN!\nNOW I TAX BOTH WAYS.\""); 
		MessagePop();
		Message1(0,3,"\"OH! I SEE...\nHOW MUCH THEN?\"");
		MessagePop();
		Message2(12,3,"\"THAT WILL BE\nTHREE COINS, SIR!\""); 
		MessagePop();
		
		if(PlayerGet(P_COINS)<3)
		{
			Message1(0,3,"\"BUT I DON'T HAVE\nTHAT MUCH!\""); 
			MessagePop();
			Message2(12,3,"\"SORRY!\nNO TAX, NO PASS!\""); 
			MessagePop();
		}
		
		status = 1;
	}
	else
	if(status==1) // second time
	{
		Message2(12,3,"\"NOW, DON'T GET ME ANGRY!\nTHREE COINS.\nBE WARNED!\"");
		MessagePop();
		status=2;
		PlayerSetPos(1360,374);
		PlayerEnterIdle();
	}
	else
	if(status==2) // last time
	{
		Message2(12,3,"\"ARRRR!\nTHAT DOES IT!\"");
		MessagePop();
		status=1;
		PlayerSet(P_XSAFE,1360); PlayerSet(P_YSAFE,374);
		PlayerEnterJump(-1,DIZ_POW+5);
	}
	ObjSet(objidx,O_STATUS,status);
}

func ActionObject_130() // troll
{
	objidx = ObjFind(130);
	status = ObjGet(objidx,O_STATUS);
	if(status==0 || status==3) 
	{
		idx = OpenDialogInventory();
		if(idx!=-1)	UseObject(idx);
		return; // not spoken to him yet or already paid him
	}
	
	if(PlayerGet(P_COINS)<3)
	{
		Message1(2,4,"\"I DON'T HAVE\nENOUGH COINS YET.\"");
		MessagePop();
		return;
	}
	
	SamplePlay(FX_SUCCESS);
	Message1(2,3,"\"THERE YOU GO!\nTHREE GOLDEN COINS,\nAS YOU ASKED.");
	MessagePop();
	PlayerSet(P_COINS,0);
	Message2(10,4,"\"THANK YOU, SIR!\nYOU CAN PASS NOW.\"");
	MessagePop();
	ObjSet(objidx,O_STATUS,3);
}

/////////////////////////////////////////////////////////////////////////////////
// DAISY id=140
// status 0=waiting for mushrooms, 1=got the mushrooms
/////////////////////////////////////////////////////////////////////////////////
func UseObject_140( idx ) // daisy
{
	objidx = ObjFind(140);
	status = ObjGet(objidx,O_STATUS);
	if(ObjGet(idx,O_ID)!=203)
	{
		if(status==0)
		{
			Message2(20,2,"\"DIZZY, WHERE ARE\nTHE MUSHROOMS?\"");
			MessagePop();
			return;
		}
		else
		if(status==1)
		{
			Message2(20,2,"\"GRAND DIZZY IS\nWAITING FOR HIS PIE.\nWHAT ARE YOU WAITING FOR?\"");
			MessagePop();
			return;
		}
	}

	SamplePlay(FX_SUCCESS);
	PlayerSetPos(1608,390);
	PlayerEnterIdle();
	Message1(2,6,"\"LOOK, DAISY!\nI GOT THE MUSHROOMS!\"");
	MessagePop();
	InventorySub(idx);
	Message2(20,2,"\"IT WAS ABOUT TIME!\nWAIT HERE UNTIL\nI BAKE THE PIE.\"");
	MessagePop();
	ObjSet(objidx,O_DISABLE,1);
	Message0(2,2,"HALF AN HOUR LATER...");
	ObjSet(objidx,O_DISABLE,0);
	ObjSet(ObjFind(204),O_DISABLE,0);
	Message2(20,2,"\"READY! GRAND DIZZY\nIS WORKING UPSTAIRS\nGO AND GIVE HIM A PIECE.\"");
	MessagePop();
	ObjSet(objidx,O_STATUS,1);
}

/////////////////////////////////////////////////////////////////////////////////
// GRAND DIZZY id=145
/////////////////////////////////////////////////////////////////////////////////
func UseObject_145( idx ) // grand dizzy
{
	objidx = ObjFind(145);
	status = ObjGet(objidx,O_STATUS);
	if(ObjGet(idx,O_ID)!=204)
	{
		Message2(20,11,"\"BOY I'M HUNGRY!\nI WONDER IF THAT PIE\nIS READY.\"");
		MessagePop();
		return;
	}
	
	SamplePlay(FX_SUCCESS);
	PlayerSetPos(1588,198);
	Message1(3,2,"\"HERE IS YOUR PIE,\nGRAND DIZZY!\"");
	MessageNext("\"AM I TOO LATE?\"");
	MessagePop();
	InventorySub(idx);
	Message2(20,11,"\"WELL,\nTOO LATE FOR STORIES,\nI'D SAY.\"");
	MessagePop();
	Message1(2,2,"\"PLEASE, TELL ME THE ONE,\nABOUT DIZZY AGE!\"");
	MessagePop();
	Message2(20,11,"\"OH...THAT ONE WOULD BE\nA VERY LONG STORY.\"");
	MessageNext("\"WHY DON'T YOU CHECK\nTHEIR WEB SITE?\"\n\n{c:0xff0080ff}WWW.YOLKFOLK.COM/DIZZYAGE\n");
	MessagePop();
	Message1(3,2,"\"THANKS! I'LL DO THAT.\"");
	MessageNext("\"ENJOY THE PIE!\"");
	MessagePop();
	
	OpenDialogFinish();
}

/////////////////////////////////////////////////////////////////////////////////
// MUSIC
// triggers that may change the tune on collision
/////////////////////////////////////////////////////////////////////////////////
func CollideObject_125_1( idx ) // music cave 1 (up hole)
{
	MusicFade(1,0);
	MusicPlay(MUSIC_TUNE1);
}

func CollideObject_126_1( idx ) // music cave 2 (entrance)
{
	MusicFade(1,0);
	MusicPlay(MUSIC_TUNE1);
}

func CollideObject_127_1( idx ) // music outside
{
	MusicFade(1,0);
	MusicPlay(MUSIC_TUNE2);
}

/////////////////////////////////////////////////////////////////////////////////
