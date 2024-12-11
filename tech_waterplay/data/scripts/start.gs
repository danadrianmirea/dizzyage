/////////////////////////////////////////////////////////////////////////////////
// start.gs
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// Game Start latent function requested by the HandlerGameStart().
// Should loads tiles and sound (usually only once) and map (each time).
// Also sets rooms and objects names since they may have changed during gameplay.
// Then, it calls the MainMenu().
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func GameStartLoad()
{
	// FIRST TIME LOADING
	if(!GameGet(G_RESTART))
	{
		time = gs_time();
		
		// TILES
		TileLoad("data\\tiles\\loading\\");
		stop; // wait for one draw, to paint the loading screen
		TileUnload(); // avoid find the loading as duplicate
		TileLoad("data\\tiles\\");
		if(TileCount()==0)
		{
			gs_messagebox("No tiles loaded!","ERROR");
			GameCommand(CMD_EXIT);
			stop;
		}
		
		// SOUNDS
		MusicLoad( "data\\music" );
		SampleLoad( "data\\samples" );
		
		// FONTS
		FontLoad("data\\fonts");
		
		// if loading was too fast, wait a few seconds to see the loading screen page
		if(gs_time()-time<LOADINGTIME*1000) WaitTime(LOADINGTIME); 
	}
	
	// RELOAD MAP
	ok = MapLoad("data\\map\\dizzy.map");
	if(!ok)
	{
		gs_messagebox("Map loading failed!","ERROR");
		GameCommand(CMD_EXIT);
		stop;
	}
	
	// set rooms and objects names
	RoomsSetNames();
	ObjectsSetNames();
	RoomsLoadTexts(ROOM_TEXTSFILE);
	RoomsLoadProps(ROOM_PROPSFILE);
	
	GameSet(G_RESTART,1);
	
	// INTRO
	BeginNewGame(); // use this to skip the MainMenu, for quick testing
	// MainMenu();
}

/////////////////////////////////////////////////////////////////////////////////
