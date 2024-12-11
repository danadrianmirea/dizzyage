/////////////////////////////////////////////////////////////////////////////////
// menus.gs
// Deals with main menu, game menu, inventory menu and other related menus
// The MainMenu is a looping game sequence called when the game starts, from start.gs
// It usually shows a cover screen and it allows players to start a new game.
// It can also open a dialog menu, allowing players to load a saved game, read info, exit, etc.
// The game menu pauses the game and open a dialog menu allowing player to save, load, or restart the current game.
// The inventory pauses the game and allows the player to select an item from the inventory.
// Advanced users can rewrite menus behaiour, to match their game's needs.
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// MainMenu
// For classic game menu, with cover screen and optional attract mode.
// Uses KEY_ACTION to begin game and KEY_MENU to open dialog menu.
// Set MAINMENU_ATTRACT to 1 in gamedef.gs if you want to allow attract mode.
// For attract mode, your mainmenu room must have some valid content.
/////////////////////////////////////////////////////////////////////////////////
func MainMenu()
{
	GameSet(G_PAUSE,0);								// unpause the game
	PlayerSetPos(PLAYER_MAINMENUX,PLAYER_MAINMENUY);// set player position in the mainmenu room
	GameSet(G_COVER,1);								// show cover screen
	MusicStop();									// stop any playing music
	MusicFade(0,0);									// set music fade options
	MusicPlay(MUSIC_INTRO);							// plays default music	

	// mainmenu loop
	ret = 1;	
	frame = 0;
	framemax = 474; // frames interval to toggle attract mode on and off
	mode = 0; // 0=cover, 1=attract
	while(true)
	{
		stop;
		
		frame++;
		if(frame>=framemax && MAINMENU_ATTRACT) 
		{
			frame = 0;
			mode = !mode; // toggle attract mode
			RoomSetName( GameGet(G_ROOMX), GameGet(G_ROOMY), (mode==0)?"PRESS ACTION TO START":"...ATTRACT MODE..." );
		}
		
		GameSet(G_COVER,mode==0);
		PlayerSet(P_DISABLE,mode==0);
		
		if( mode==0 ) // cover mode
		{
			ret = 1;
			if( GetKeyHit(KEY_ACTION) ) break; // start
			if( GetKeyHit(KEY_MENU) ) // main menu
			{
				ret = OpenDialogMainMenu(); // 1=start,2=load,0=nothing
				if(ret) break; // start
				frame = 0;
			}
		}		
		else
		if( mode==1 ) // attract mode
		{
			// foul around
			if(gs_rand(10)==1 && PlayerGet(P_STATUS)==STATUS_WALK)
				PlayerSet(P_DIR,gs_rand(2)?-1:1);
			
			if(PlayerGet(P_DIR)==-1)
				SetKey(KEY_LEFT,1);
			else
				SetKey(KEY_RIGHT,1);
				
			if(gs_rand(20)==0) 
			 	SetKey(KEY_JUMP,1);
			 	
			if(gs_rand(20)==0 && PlayerGet(P_STATUS)==STATUS_WALK)
				PlayerEnterSpin(gs_rand(2)?-1:1);

			if( GameGet(G_KEYSHIT)!=0 ) // any key hit
			{
				frame=0;
				mode = 0;
			}
		}
	}

	ClearKeys(); // clear any resident keys
	
	if(ret==1) // start new game
	{
		GameSet(G_COVER,0);		// hide cover
		GameSet(G_PAUSE,0);		// unpause the game
		PlayerSet(P_DISABLE,0);	// enable the player
		PlayerEnterIdle();		// start in idle
		BeginNewGame();			// call user function to begin a new game (set player's position, etc)
	}
}

/////////////////////////////////////////////////////////////////////////////////
// Opens the MainMenu dialog.
// Uses DialogMainMenu() function for dialog creation.
// Returns 1 if game must start with intro, 2 if game was loaded, 0 otherwise
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogMainMenu()
{
	GamePause(1);
	select = RunDialogSelect( gs_fid("DialogMainMenu"), 5, 0 );
	ret = 0;
	if(select==0)
	{
		ret = 1;
	}
	else
	if(select==1)
	{
		ret = OpenDialogFiles(0) ? 2 : 0;
	}
	else
	if(select==2)
	{
		OpenDialogOptions();
	}
	else
	if(select==3)
	{
		OpenDialogCredits();
	}
	else
	if(select==4)
	{
		if(OpenDialogQuestion("EXIT GAME ?",1))
			GameCommand(CMD_EXIT);
	}
	GamePause(0);
	return ret;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; select; default selection
// Dialog creation function used by OpenDialogMainMenu().
/////////////////////////////////////////////////////////////////////////////////
func DialogMainMenu( select )
{
	text = "{a:center}GAME MENU\n\n{c:0xff0000}";
	if(select==0) text += "{f:1}START{f:0}\n"; 		else text += "START\n";
	if(select==1) text += "{f:1}LOAD{f:0}\n"; 		else text += "LOAD\n";
	if(select==2) text += "{f:1}OPTIONS{f:0}\n"; 	else text += "OPTIONS\n";
	if(select==3) text += "{f:1}CREDITS{f:0}\n"; 	else text += "CREDITS\n";
	if(select==4) text += "{f:1}EXIT{f:0}"; 		else text += "EXIT";
	DialogPush();
	DialogSetText(text);
	DialogSetColor(COLOR_DIALOG);
	DialogFitCenter();
}

/////////////////////////////////////////////////////////////////////////////////
// Opens the GameMenu dialog.
// Uses DialogGameMenu() function for dialog creation.
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogGameMenu()
{
	GamePause(1);
	select = RunDialogSelect( gs_fid("DialogGameMenu"), 6, 0 );
	if(select==1)
	{
		OpenDialogFiles(1);
	}
	else
	if(select==2)
	{
		OpenDialogFiles(0);
	}
	else
	if(select==3)
	{
		OpenDialogOptions();
	}
	else
	if(select==4)
	{
		if(OpenDialogQuestion("RESTART GAME ?",1))
			 GameCommand(CMD_START);
	}
	else
	if(select==5)
	{
		if(OpenDialogQuestion("EXIT GAME ?",1))
			GameCommand(CMD_EXIT);
	}
	GamePause(0); 
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; select; default selection
// Dialog creation function used by OpenDialogGameMenu().
/////////////////////////////////////////////////////////////////////////////////
func DialogGameMenu( select )
{
	text = "{a:center}GAME PAUSED\n\n{c:0xff0000}";
	if(select==0) text += "{f:1}RESUME{f:0}\n"; 	else text += "RESUME\n";
	if(select==1) text += "{f:1}SAVE{f:0}\n"; 		else text += "SAVE\n";
	if(select==2) text += "{f:1}LOAD{f:0}\n"; 		else text += "LOAD\n";
	if(select==3) text += "{f:1}OPTIONS{f:0}\n"; 	else text += "OPTIONS\n";
	if(select==4) text += "{f:1}RESTART{f:0}\n"; 	else text += "RESTART\n";
	if(select==5) text += "{f:1}EXIT{f:0}"; 		else text += "EXIT";
	DialogPush();
	DialogSetText(text);
	DialogSetColor(COLOR_DIALOG);
	DialogFitCenter();
}

/////////////////////////////////////////////////////////////////////////////////
// Opens the Options dialog.
// Uses DialogOptions() function for dialog creation.
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogOptions()
{
	GamePause(1);
	select=0;
loop:
	select = RunDialogSelect( gs_fid("DialogOptions"), 4, select );
	DialogPopAll();

	if(select==0)
	{
		vol = 100;
		if(gs_inigetint("dizzy.ini","AUDIO","volfx",&vol))
		vol+=10;
		if(vol>100) vol=0;
		gs_inisetint("dizzy.ini","AUDIO","volfx",vol);
		SampleVolume(vol);
		SamplePlay(FX_BEEP2);
		goto loop;
	}
	else
	if(select==1)
	{
		vol = 100;
		if(gs_inigetint("dizzy.ini","AUDIO","volmusic",&vol))
		vol+=10;
		if(vol>100) vol=0;
		gs_inisetint("dizzy.ini","AUDIO","volmusic",vol);
		MusicVolume(vol);
		goto loop;
	}
	else
	if(select==2)
	{
		OpenDialogControls();
	}
	GamePause(0); 
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; select; default selection
// Dialog creation function used by OpenDialogOptions().
/////////////////////////////////////////////////////////////////////////////////
func DialogOptions( select )
{
	// sound volumes
	volfx = 100;
	volmusic = 100;
	gs_inigetint("dizzy.ini","AUDIO","volfx",&volfx);
	gs_inigetint("dizzy.ini","AUDIO","volmusic",&volmusic);
	
	text = "{a:center}GAME OPTIONS\n\n{c:0xff0000}";
	if(select==0) 
		text += "{f:1}FX VOLUME " +(str)volfx+ "%{f:0}\n"; 
	else 
		text +="FX VOLUME " +(str)volfx+ "%\n";
	if(select==1) 
		text += "{f:1}MUSIC VOLUME " +(str)volmusic+ "%{f:0}\n"; 
	else 
		text +="MUSIC VOLUME " +(str)volmusic+ "%\n";
	if(select==2) text += "{f:1}CONTROLS{f:0}\n"; 	else text += "CONTROLS\n";
	text+="\n";
	if(select==3) text += "{f:1}RETURN{f:0}"; 		else text += "RETURN";

	DialogPush();
	DialogSetText(text);
	DialogSetColor(COLOR_DIALOG);
	w = 18*8; // keep large and fixed
	h = DialogTextH()+8; // add some space
	DialogSetSize(w,h);
	x = (GameGet(G_ROOMW)-w)/2;
	y = (GameGet(G_ROOMH)-h)/2;
	DialogSetPos(x,y);
}

/////////////////////////////////////////////////////////////////////////////////
// Opens the Controls dialog.
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogControls()
{
	text = "{a:center}";
    text += "{c:0xffff00}GAME CONTROLS\n\n{a:left}";
    text += " {c:0xffffff}Z{c:0xffff00} OR {c:0xffffff}LEFT{c:0xffff00}   - MOVE LEFT\n";
    text += " {c:0xffffff}X{c:0xffff00} OR {c:0xffffff}RIGHT{c:0xffff00}  - MOVE RIGHT\n";
    text += " {c:0xffffff}SPACE{c:0xffff00} OR {c:0xffffff}UP{c:0xffff00} - JUMP\n";
    text += " {c:0xffffff}ENTER{c:0xffff00}       - ACTION\n";
    text += " {c:0xffffff}ESCAPE{c:0xffff00} OR {c:0xffffff}Q{c:0xffff00} - MENU\n\n";
    text += " {c:0xffffff}F9{c:0xffff00}  - MUTE ALL SOUND\n";
    text += " {c:0xffffff}F10{c:0xffff00} - TOGGLE SCREEN\n";
	OpenDialogMessage(text);
}

/////////////////////////////////////////////////////////////////////////////////
// Opens the Credits dialog with the authors information.
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogCredits()
{
	// first page
	text = "{a:center}CREDITS\n\n{c:0xffffffff}";
	text += "GAME CREATED BY\n";
	text += "{c:0xff0080ff}" + GAME_AUTHOR + "{c:0xffffffff}\n\n";
	text += "ORIGINAL DIZZY GAMES BY\n";
	text += "{c:0xff0080ff}OLIVER TWINS\nAND CODEMASTERS{c:0xffffff00}\n";
	OpenDialogMessage(text);
}

str g_dialogfiles_title;
/////////////////////////////////////////////////////////////////////////////////
// IN: int; mode; 0=load mode, 1=save mode
// Opens the game files dialog for load or for save.
// Uses DialogFiles() function for dialog creation.
// Returns 1 if game was loaded or saved, 0 otherwise
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogFiles( mode )
{
	g_dialogfiles_title = (mode==0) ? "LOAD GAME" : "SAVE GAME";
	select = RunDialogSelect( gs_fid("DialogFiles"), 4, 0 );
	if(select==3 || select==-1) return 0; // give up
	file = "save"+(str)(select+1)+".gam";
	info = gs_fileinfo(file);
	if(mode==0)
	{
		if(strempty(info))
		{
			OpenDialogMessage( "SLOT IS EMPTY", 0xffff0000 ); 
			return 0;
		}
		return LoadGame(file);
	}
	else
	{
		if(!strempty(info))
		{
			if(!OpenDialogQuestion("OVERWRITE FILE ?",1)) return 0;
		}
		return SaveGame(file);
	}
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; select; default selection
// Dialog creation function used by OpenDialogFiles().
/////////////////////////////////////////////////////////////////////////////////
func DialogFiles( select )
{
	text = "{a:center}"+g_dialogfiles_title+"\n\n{c:0xff0000}";
	for(i=0;i<3;i++)
	{
		if(select==i) text+="{f:1}";
		file = "save"+(str)(i+1)+".gam";
		info = gs_fileinfo(file);
		if(strempty(info))
		{
			text+=" EMPTY  ";
			text+="SLOT        ";
		}
		else
		{
			text+=" FILE"+(str)(i+1)+"  ";
			text+=strupr(strsub(info,4,12));
		}
		if(select==i) text+="{f:0}";
		text += " \n";
	}
	text += "\n";
	if(select==3) text += "{f:1}RETURN{f:0}"; else text += "RETURN";
	DialogPush();
	DialogSetText(text);
	DialogSetColor(COLOR_DIALOG);
	DialogFitCenter();
}

/////////////////////////////////////////////////////////////////////////////////
// Opens the Finish dialog
// Uses DialogFinish() function for dialog creation.
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogFinish()
{
	GamePause(1);
	select = RunDialogSelect( gs_fid("DialogFinish"), 3, 0, 1 );
	if(select==0)
	{
		gs_shell(GAME_WEBSITE);
		GameCommand(CMD_START);
	}
	if(select==1)
	{
		GameCommand(CMD_START);
	}
	else
	if(select==2)
	{
		GameCommand(CMD_EXIT);
	}
	GamePause(0);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; select; default selection
// Dialog creation function used by OpenDialogFinish().
/////////////////////////////////////////////////////////////////////////////////
func DialogFinish( select )
{
	text = "{a:center}GAME COMPLETED\n\n{c:0xff0000}";
	if(select==0) text += "{f:1}WEB SITE{f:0}\n";	else text += "WEB SITE\n";
	if(select==1) text += "{f:1}RESTART{f:0}\n"; 	else text += "RESTART\n";
	if(select==2) text += "{f:1}EXIT{f:0}"; 		else text += "EXIT";
	DialogPush();
	DialogSetText(text);
	DialogSetColor(COLOR_DIALOG);
	DialogFitCenter();
}

/////////////////////////////////////////////////////////////////////////////////
// [IN]: int; defaultexit=0; default selection, 0=top item (last picked), 1=exit without dropping
// OUT: int; object's index, or -1 for exiting without selecting an item
// Opens the Inventory dialog and allows the player to choose one item for use (or drop).
// Internally, the selection goes from [0 to InventoryCount()] (last selection means return without dropping).
// Uses DialogInventory() function for dialog creation.
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogInventory( defaultexit )
{
	if(!?defaultexit) defaultexit=0;
	GamePause(1);
	count = InventoryCount();
	default = 0;
	if(defaultexit) default = count;
	select = RunDialogSelect( gs_fid("DialogInventory"), count+1, default );
	DialogPopAll();
	GamePause(0);
	if( select==count || select==-1 ) return -1; // no selection
	idx = InventoryGet(count-1-select); // item selected
	return idx;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; select; default selection
// Dialog creation function used by OpenDialogInventory().
/////////////////////////////////////////////////////////////////////////////////
func DialogInventory( select )
{
	DialogPopAll(); // close all old dialogs (RunDialogSelect can handle only one)
	
	// construct text
	text = "{a:center}YOU ARE CARRYING\n\n{c:0xff0000}";
	
	// push elements names in reverse order (last is first)
	count = InventoryCount();
	if(count>0)
	{
		for(i=count-1;i>=0;i--)
		{
			idx = InventoryGet(i);
			if(select==count-1-i) text += "{f:1}";
			text += ObjGetName(idx);
			if(select==count-1-i) text += "{f:0}";
			text += "\n";
		}
		height = 5+count;
	}
	else	
	{
		text += "{c:0xffffffff}N O T H I N G\n";
		height = 5+1;
	}
	
	if(select==count) text += "{f:1}";
	text += "\nEXIT AND DON'T DROP";
	if(select==count) text += "{f:0}";
	
	// construct dialog
	DialogPush();
	DialogSetText(text);
	DialogSetColor(COLOR_DIALOG);
	//DialogFitCenter();
	// compute position considering the tooltip dialog
	border = 16;
	w = DialogTextW()+8; // add some space
	h = DialogTextH()+8; // add some space
	DialogSetSize(w,h);
	x = (GameGet(G_ROOMW)-w)/2;
	y = (GameGet(G_ROOMH)-h-40)/2; // tooltip dialog (40)
	y2 = y+h+border;
	DialogSetPos(x,y);

	// tooltip dialog	
	DialogPush();
	DialogSetText("{c:0xff00ffff}CHOOSE ITEM TO\nUSE OR DROP");
	DialogSetColor(0xffffffff);
	w = DialogTextW()+8; // add some space
	h = DialogTextH()+8; // add some space
	DialogSetSize(w,h);
	x = (GameGet(G_ROOMW)-w)/2;
	DialogSetPos(x,y2);
}

/////////////////////////////////////////////////////////////////////////////////
