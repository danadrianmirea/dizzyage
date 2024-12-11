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
	ObjSetName(ObjFind(100),"BUCKET");
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
	MusicFade(0,1);								// set music fade options
	MusicPlay(MUSIC_DEFAULT);					// play default music
}

/////////////////////////////////////////////////////////////////////////////////
// Interactions
/////////////////////////////////////////////////////////////////////////////////

func OpenRoom_1_1()
{
	AIInitSnow(1000,60);
}

func UpdateRoom_1_1()
{
	AIUpdateSnow(1000,60,1);
}

func OpenRoom_2_1()
{
	AIInitSnow(1000,60);
}

func UpdateRoom_2_1()
{
	AIUpdateSnow(1000,60,1);
}

/////////////////////////////////////////////////////////////////////////////////
