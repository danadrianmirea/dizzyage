/////////////////////////////////////////////////////////////////////////////////
// file.gs
// Save and load game operations.
// Static brushes with ids are saved and loaded automated, from the .brs exported file.
// Advanced users can also save and load global script variables.
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// IN: str; file; file name
// OUT: int; 0=fail, 1=success
// Loads a game and display the result message.
// Loads static brushes with IDs. See LoadStaticBrushes().
// Restores old music and handle objects present.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func LoadGame( file )
{
	f = gs_fileopen(file,0); if(!f) goto fileerrorrecover;

	val=0;
	sz="";
	
	// load id
	if(!gs_filereadtext(&sz,f)) goto fileerrorrecover;
	if(sz!="DIZZYAGE") goto fileerrorrecover;

	// load game id
	if(!gs_filereadtext(&sz,f)) goto fileerrorrecover;
	if(sz!=GAME_ID) goto fileerrorrecover;
	
	// load game data
	for(i=0;i<G_MAX;i++)
	{
		if(!gs_filereadint(&val, f)) goto fileerror;
		GameSet(i,val);
	}

	// load objects data
	for(o=0;o<ObjCount();o++)
	{
		for(i=0;i<O_MAX;i++)
		{
			if(!gs_filereadint(&val, f)) goto fileerror;
			ObjSet(o,i,val);
		}
	}

	// load player data
	for(i=0;i<P_MAX;i++)
	{
		if(!gs_filereadint(&val, f)) goto fileerror;
		PlayerSet(i,val);
	}

	// load static brushes with valid ids
	if(!LoadStaticBrushes(f)) goto fileerror;
	
	// load music
	music = -1;
	musicpos = -1;
	if(!gs_filereadint(&music,f)) goto fileerror;
	if(!gs_filereadint(&musicpos,f)) goto fileerror;
	
	// load room props
	if(!LoadRoomProperties(f)) goto fileerror;
	
	// load user data
	if(!LoadUserData(f)) goto fileerror;

	gs_fileclose(f);
	
	// reload room
	SampleStopAll();
	MusicStop(); 
	MusicFade(0,3);	
	MusicPlay(music,musicpos);
	GameCommand(CMD_REFRESH);
	ObjPresentGather(); // refresh present list	
	SamplePlay(FX_RESPAWN);
	OpenDialogMessage( "LOAD SUCCESSFUL!", COLOR_YELLOW );
	return 1;
	
fileerror:
	OpenDialogMessage( "FILE ERROR!", COLOR_RED );
	gs_fileclose(f);
	GameCommand(CMD_EXIT);
	return 0;
	
fileerrorrecover:
	OpenDialogMessage( "FILE ERROR!", COLOR_RED ); 
	gs_fileclose(f);
	return 0;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: str; file; file name
// OUT: int; 0=fail, 1=success
// Saves a game and display the result message.
// Saves static brushes with IDs. See SaveStaticBrushes().
// Stores current music.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func SaveGame( file )
{
	f = gs_fileopen(file,1); if(!f) goto fileerror;
	
	// save id
	if(!gs_filewritetext( "DIZZYAGE", f )) goto fileerror;
	
	// save game id
	if(!gs_filewritetext( GAME_ID, f )) goto fileerror;

	// save game data
	for(i=0;i<G_MAX;i++)
	{
		if(!gs_filewriteint(GameGet(i), f)) goto fileerror;
	}
	
	// save objects data
	for(o=0;o<ObjCount();o++)
	{
		for(i=0;i<O_MAX;i++)
		{
			if(!gs_filewriteint(ObjGet(o,i), f)) goto fileerror;
		}
	}
	
	// save player data
	for(i=0;i<P_MAX;i++)
	{
		if(!gs_filewriteint(PlayerGet(i), f)) goto fileerror;
	}

	// save static brushes with valid ids
	if(!SaveStaticBrushes(f)) goto fileerror;

	// save music
	if(!gs_filewriteint(MusicPlaying(),f)) goto fileerror;
	if(!gs_filewriteint(MusicPosition(),f)) goto fileerror;

	// save room props
	if(!SaveRoomProperties(f)) goto fileerror;

	// save user data
	if(!SaveUserData(f)) goto fileerror;

	gs_fileclose(f);
	
	SamplePlay(FX_COIN);
	OpenDialogMessage( "SAVE SUCCESSFUL!", COLOR_YELLOW ); 
	return 1;
	
fileerror:
	OpenDialogMessage( "FILE ERROR!", COLOR_RED );
	gs_fileclose(f);
	return 0;			
}

/////////////////////////////////////////////////////////////////////////////////
// static brushes
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// IN: int; file; file handler
// IN: int; id; brush id
// OUT: int; 0=fail, 1=success
// Loads a brush from a file.
/////////////////////////////////////////////////////////////////////////////////
func LoadBrush( file, id )
{
	val=0;
	b = BrushFind(id); 
	if(b==-1) return 0;
	for(i=0;i<B_MAX;i++)
	{
		if(!gs_filereadint(&val, file)) return 0;
		BrushSet(b,i,val);
	}
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; file; file handler
// IN: int; id; brush id
// OUT: int; 0=fail, 1=success
// Saves a brush into a file.
/////////////////////////////////////////////////////////////////////////////////
func SaveBrush( file, id )
{
	val=0;
	b = BrushFind(id); 
	if(b==-1) return 0;
	for(i=0;i<B_MAX;i++)
	{
		if(!gs_filewriteint(BrushGet(b,i), file)) return 0;
	}
	return 1;	
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; file; file handler
// OUT: int; 0=fail, 1=success
// Loads brushes from the brushes ids file exported from editor in the dizzy.brs file.
// Called from the LoadGame() function.
/////////////////////////////////////////////////////////////////////////////////
func LoadStaticBrushes( file )
{
	f = gs_fileopen("data\\map\\dizzy.brs",0);
	if(!f) return 1; // no brushes
	while(true)
	{
		id = "";
		eof = (gs_filereadtext(&id,f)==0);
		if(eof) break;
		if(!LoadBrush(file,(int)id)) return 0;
	}
	gs_fileclose(f);
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; file; file handler
// OUT: int; 0=fail, 1=success
// Saves brushes from the brushes ids file exported from editor in the dizzy.brs file.
// Called from the SaveGame() function.
/////////////////////////////////////////////////////////////////////////////////
func SaveStaticBrushes( file )
{
	f = gs_fileopen("data\\map\\dizzy.brs",0);
	if(!f) return 1; // no brushes
	while(true)
	{
		id = "";
		eof = (gs_filereadtext(&id,f)==0);
		if(eof) break;
		if(!SaveBrush(file,(int)id)) return 0;
	}
	gs_fileclose(f);
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
