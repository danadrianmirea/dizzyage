/////////////////////////////////////////////////////////////////////////////////
// handlers.gs
// Game handlers (callback functions called by the game engine)
// Must be non-latent, but can request latent events to open if possible
/////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////
// Handler GameInit 
// This handler is called only once, when the application starts.
// Users should initialize game materials or other things that never change during the game.
/////////////////////////////////////////////////////////////////////////////////
func HandlerGameInit()
{
	// println("HANDLER GAMEINIT");
	GameSetName(GAME_TITLE);
	
	// materials
	MaterialSetDensity( MAT_AIR,		MATD_VOID );
	MaterialSetDensity( MAT_WATER,		MATD_VOID );
	MaterialSetDensity( MAT_HURT,		MATD_VOID );
	MaterialSetDensity( MAT_KILL,		MATD_VOID );
	MaterialSetDensity( MAT_CLOUD,		MATD_SOFT );
	MaterialSetDensity( MAT_CLIMB,		MATD_SOFT );
	MaterialSetDensity( MAT_WIND,		MATD_SOFT );
	MaterialSetDensity( MAT_BLOCK,		MATD_HARD );
	MaterialSetDensity( MAT_JUMPFIX,	MATD_JUMP );
	MaterialSetDensity( MAT_JUMPPRO,	MATD_JUMP );
	
	MaterialSetColor( MAT_AIR,			0xFF000000 );
	MaterialSetColor( MAT_WATER,		0xFF0060FF );
	MaterialSetColor( MAT_HURT,			0xFFFF8000 );
	MaterialSetColor( MAT_KILL,			0xFFD00000 );
	MaterialSetColor( MAT_CLOUD,		0xFFC0C0C0 );
	MaterialSetColor( MAT_CLIMB,		0xFF909090 );
	MaterialSetColor( MAT_WIND,			0xFF707070 );
	MaterialSetColor( MAT_BLOCK,		0xFF006000 );
	MaterialSetColor( MAT_JUMPFIX,		0xFF008000 );
	MaterialSetColor( MAT_JUMPPRO,		0xFF00B000 );
}

/////////////////////////////////////////////////////////////////////////////////
// Handler GameStart 
// This handler is called each time the game starts (or restarts).
// Users should reset game and player variables, stop sounds, and request loading.
// By default, the game is paused (G_PAUSE=1) and player has folowing data set:
// P_LAYER=7, P_DELAY=3, P_X=0, P_Y=0, P_DISABLE=1, P_LIFE=100, P_CREDUTS=3 etc.
// The load sequence can be latent to allow drawing of a loading screen. See GameStartLoad().
// Usually the tiles are loaded only once (check the G_RESTART static variable)
// Map should be loaded on each restart, to reset objects and brushes properties.
// Then an Intro or MainMenu sequence may be opened.
/////////////////////////////////////////////////////////////////////////////////
func HandlerGameStart()
{
	// println("HANDLER GAMESTART");

	// globals reset
	for(i=0;i<G_STATIC;i++) GameSet(i,0);
	GameSet(G_VIEWX,8);
	GameSet(G_VIEWY,48);
	GameSet(G_MAPCOLOR,0xff000000);
	GameSet(G_BORDERCOLOR,0xff000000);
	GameSet(G_FPS,36);
	GameSet(G_FFPERIOD,50);
	GameSet(G_PAUSE,1); // start paused

	// player cfg
	PlayerSet(P_LAYER, PLAYER_LAYER);

	// inventory
	InventoryClear();

	// sound
	SampleStopAll();
	
	// request loading
	ScrRequest( gs_fid("GameStartLoad") );
}

/////////////////////////////////////////////////////////////////////////////////
// Handler GameUpdate
// This handler is called once every game cycle.
// Used to update dynamic objects and other stuff like that.
// By default it calls UpdateRoom_RX_RY callback, if found (RX and RY the current room coordinates).
// Do NOT abuse this handler !
/////////////////////////////////////////////////////////////////////////////////
func HandlerGameUpdate()
{
	// println("HANDLER GAMEUPDATE");

	if(!GameGet(G_RESTART)) return; // in loading, no objects available

	if( SUPPORT_JUMPUP )
		UseUpForJump();
	
	// shake and rumble updates
	UpdateShakeAndRumble();

	if(GameGet(G_PAUSE)) return; // don't update if game paused

	PlayerSet(P_SAFE,1); // suppose player is safe to store safe position
	
	// update some particluar object(s) that need to be updated no matter in what room we are
	// ...
	
	// current room update
	fid = gs_fid( "UpdateRoom_"+(str)GameGet(G_ROOMX)+"_"+(str)GameGet(G_ROOMY) );
	if(fid!=-1) call(fid);
}

/////////////////////////////////////////////////////////////////////////////////
// Handler GameAfterUpdate
// This handler is called once every game cycle after all was updated.
// Here, everything is just in place before draw.
// Do NOT abuse this handler !
/////////////////////////////////////////////////////////////////////////////////
func HandlerGameAfterUpdate()
{
	// println("HANDLER GAMEAFTERUPDATE");
	if(!GameGet(G_RESTART)) return; // in loading, no objects available
	
	// current room after update
	fid = gs_fid( "AfterUpdateRoom_"+(str)GameGet(G_ROOMX)+"_"+(str)GameGet(G_ROOMY) );
	if(fid!=-1) call(fid);

	// scrolling games support
	if( GameGet(G_VIEWPORTMODE) )
	{
		roomw = GameGet(G_ROOMW);
		roomh = GameGet(G_ROOMH);
		GameSet( G_VIEWPORTX, GameGet(G_ROOMX)*roomw - PlayerGet(P_X) + roomw/2 );
		GameSet( G_VIEWPORTY, GameGet(G_ROOMY)*roomh - PlayerGet(P_Y) + roomh/2 );
	}
	
	// ...
}

/////////////////////////////////////////////////////////////////////////////////
// Handler RoomOpen
// This handler is called when a room is opened (set as current).
// It is supposed to initialize room data.
// By default it calls OpenRoom_RX_RY callback.
/////////////////////////////////////////////////////////////////////////////////
func HandlerRoomOpen()
{
	// println("HANDLER ROOMOPEN");
	fid = gs_fid( "OpenRoom_"+(str)GameGet(G_ROOMX)+"_"+(str)GameGet(G_ROOMY) );
	if(fid!=-1) call(fid);
}

/////////////////////////////////////////////////////////////////////////////////
// Handler RoomClose
// This handler is called when a room is closed (a new one is about to be opened).
// It is supposed to deinitialize room data.
// By default it calls CloseRoom_RX_RY callback.
/////////////////////////////////////////////////////////////////////////////////
func HandlerRoomClose()
{
	// println("HANDLER ROOMCLOSE");
	fid = gs_fid( "CloseRoom_"+(str)GameGet(G_ROOMX)+"_"+(str)GameGet(G_ROOMY) );
	if(fid!=-1) call(fid);
}

/////////////////////////////////////////////////////////////////////////////////
// Handler RoomOut
// This handler is called each time the player wants to exit current room.
// It is supposed to set player's new position if special behaviour is needed.
// By default it calls OutRoom_RX_RY callback. 
/////////////////////////////////////////////////////////////////////////////////
func HandlerRoomOut()
{
	// println("HANDLER ROOMOUT");
	fid = gs_fid( "OutRoom_"+(str)GameGet(G_ROOMX)+"_"+(str)GameGet(G_ROOMY) );
	if(fid!=-1) call(fid);
}

/////////////////////////////////////////////////////////////////////////////////
// Handler Collision 
// This handler is called when the player collides with an object that requests collision.
// All collisions are called just before the player update handler.
// Receives the following handler data:
// 0 = index of the object (not object id)
// 1 = collision mode (0=exit,1=enter, 2=touch)
// It is supposed to handle the collision event depending on the colliding object.
// The collision mode values:
// 0 = just exiting from previous collision
// 1 = just entering in collision
// 2 = standing in collision (continuing to collide)
// By default it calls CollideObject_ID_MODE callback. 
/////////////////////////////////////////////////////////////////////////////////
func HandlerCollision()
{
	if(PlayerGet(P_LIFE)==0) return; // don't bother with collisions if player's dead

	idx = ScrGetHandlerData(0);
	mode = ScrGetHandlerData(1);
	
	if(ObjGet(idx,O_CLASS)==CLASS_HURT && mode!=0) // hurt objects
	{
		PlayerHurt(5);
		if(PlayerGet(P_LIFE)==0)
			PlayerSet(P_DEATH, ObjGet(idx,O_DEATH));
		return;
	}
	if(ObjGet(idx,O_CLASS)==CLASS_KILL && mode!=0) // kill objects
	{
		PlayerSet(P_DEATH, ObjGet(idx,O_DEATH));
		PlayerSet(P_LIFE, 0);
		return;
	}
	
	id = ObjGet(idx,O_ID);
	// println("HANDLER COLLISION ", id, " ", mode);
	fid = gs_fid( "CollideObject_"+(str)id+"_"+(str)mode );
	if(fid!=-1)	ScrRequest(fid); // call only if available
	// OBS: this will result in requesting only one collider (even if more objects collide), since they are latent.
	// adjust behaviour with non-latent calls, if your game needs it
}

/////////////////////////////////////////////////////////////////////////////////
// Handler Fall 
// This handler is called when the player falls down (and stops rolling).
// It is supposed to handle the stun event, if stunlevel is high, or other similar stuff.
/////////////////////////////////////////////////////////////////////////////////
func HandlerFall()
{
	// println("HANDLER FALL");
	if( PlayerGet(P_LIFE)==0 || PlayerGet(P_MATCENTER)==MAT_WATER ) { PlayerSet(P_STUNLEVEL,0); return; }
	if( PlayerGet(P_STUNLEVEL)>=STUN_LEVEL )
		ScrRequest( gs_fid("PlayerPlayStun") );
}

/////////////////////////////////////////////////////////////////////////////////
// Handler Jump
// This handler is called when the player wants to jump or falls on a jumper material.
// Receive in handler data[0] the -1 value, if player pressed jump key,                            
// or the material index, if he felt on a jumping material.                                  
// It must send back the jump power, in handler data[1].                            
// If the returned power is greater than 0 then the jump is performed.                                  
/////////////////////////////////////////////////////////////////////////////////
func HandlerJump()
{
	pow = 0;
	mat = ScrGetHandlerData(0);
	// println("HANDLER JUMP (", mat, ")");
	if( mat == -1 ) // key jump
	{
		// if stunned, refuse jump
		if( PlayerGet(P_STUNLEVEL)>=STUN_LEVEL ) { ScrSetHandlerData(1,0); return; }
		pow = DIZ_POW; // default jump
	}
	else
	if( mat == MAT_JUMPFIX ) // fixed jump
	{	
		pow = JUMPFIXPOW;
	}
	else
	if( mat == MAT_JUMPPRO ) // progressive jump
	{
		pow = PlayerGet(P_POW) / 2; // consider current power
		if( GetKey(KEY_JUMP) )		pow += DIZ_POW; // boost
		if( pow>JUMPPROPOW )		pow=JUMPPROPOW; // max power
	}
	
	if(pow<=2) pow=0; 		  // don't jump too low
	PlayerSet(P_STUNLEVEL,0); // reset stun when jump
	ScrSetHandlerData(1,pow); // return jump power
	if(pow>0) SamplePlay(FX_JUMP); // it will jump
}


/////////////////////////////////////////////////////////////////////////////////
// Handler PlayerUpdate
// This handler is called each player update (depending on P_DELAY value). 
// It is supposed to customise player behaviour and respond to life lose.
// It may check materials inside player's bound or under it and deal with wind, clouds, water, hurting or killing.
// It is called before keys are checked and player updated by engine.
/////////////////////////////////////////////////////////////////////////////////
func HandlerPlayerUpdate()
{
	// println("HANDLER PLAYERUPDATE");
	
	// Player set costume
	costume = 0;
	if(ID_SCUBA!=-1) costume = InventoryHasItem(ID_SCUBA) ? 30 : 0;
	PlayerSet(P_COSTUME,costume);

	// Check Player Wind
	windinside = IsMaterialInsidePlayer(MAT_WIND);
	windunder = IsMaterialUnderPlayer(MAT_WIND);
	if( windinside || windunder )
	{
		extra = (windinside)?gs_rand(WINDPOW):0;
		power = WINDPOW-gs_rand(WINDPOW*2+1)+extra;
		PlayerSet(P_Y, PlayerGet(P_Y)-power);
	}
	
	// Check clouds
	if(IsMaterialUnderPlayer(MAT_CLOUD))
	{
		PlayerSet(P_Y, PlayerGet(P_Y)+1);
	}
	
	// Check WaterPlay
	if( SUPPORT_WATERPLAY ) 
		PlayerUpdateWaterPlay();
	
	// Check Player damage
	if(IsMaterialInsidePlayer(MAT_KILL)) 
	{
		if(PlayerGet(P_LIFE)>0)
		{
			PlayerSet(P_LIFE,0);
			PlayerSet(P_DEATH,0); // set cause of death if needed
		}
	}
	else
	if(IsMaterialInsidePlayer(MAT_HURT)) 
	{
		if(PlayerGet(P_LIFE)>0)
		{
			PlayerHurt(DIZ_HURT);
			if(PlayerGet(P_LIFE)==0)
				PlayerSet(P_DEATH,0); // set cause of death if needed
		}
	}

	// Check Player must die
	if(PlayerGet(P_LIFE)<0) PlayerSet(P_LIFE,0);

	if(PlayerGet(P_LIFE)<=0 && PlayerGet(P_STATUS)!=STATUS_SCRIPTED)
		if( (PlayerGet(P_MATCENTER)==MAT_WATER) || PlayerGet(P_STATUS)==STATUS_IDLE ) // only if in water or in idle
		{
			if(PlayerGet(P_MATCENTER)==MAT_WATER)
				ScrRequest( gs_fid("PlayerPlayDeadWater") );
			else
				ScrRequest( gs_fid("PlayerPlayDead") );
		}
		
	// Check Respawn Position
	status = PlayerGet(P_STATUS);
	if( ( status==STATUS_IDLE || status==STATUS_WALK ) && 
		IsPlayerSafe() && IsPlayerStable() && 
		PlayerGet(P_SAFE) &&
		PlayerGet(P_LIFE)>0 )
	{
		// remember relevant info to use in case of a respawn event
		PlayerSet(P_XSAFE,PlayerGet(P_X));
		PlayerSet(P_YSAFE,PlayerGet(P_Y));
		MusicStore();
	}
	
	// Custom movement test
	// PlayerSet(P_CUSTOMMOVE,1);
	// CM_Update();
}

/////////////////////////////////////////////////////////////////////////////////
// Handler Action 
// This handler is called when the player hits the action button.
// It is supposed to handle the action event: interact with characters, pick up items, open inventory, etc.
// See Action().
/////////////////////////////////////////////////////////////////////////////////
func HandlerAction()
{
	// println("HANDLER ACTION");
	ScrRequest( gs_fid("Action") );
}

/////////////////////////////////////////////////////////////////////////////////
// Handler Menu
// This handler is called when the player hits the menu button.
// It is supposed to handle the menu event: pause game, open game menu, etc.
/////////////////////////////////////////////////////////////////////////////////
func HandlerMenu()
{
	// println("HANDLER MENU");
	ScrRequest( gs_fid("OpenDialogGameMenu") );
}

/////////////////////////////////////////////////////////////////////////////////
// Handler DrawHud
// This handler is called once every frame cycle to draw hud menus and dialogs.
// It is called after all updates are done.
// Draw functions are allowed inside it.
// Constants are used instead of view or room real sizes, for faster code.
// Do NOT abuse this handler !
/////////////////////////////////////////////////////////////////////////////////
func HandlerDrawHud()
{
	// LOADING SCREEN
	if(!GameGet(G_RESTART))
	{
		loadid = 6; // loading screen tile
		HudDrawTile( loadid, 0,0,256,192, 0,0,256,192, 0, 0 );
		return;
	}
	
	menuid = 1; // menu tile
	fontid = FONT_DEFAULT;
	HudFont( fontid );
	HudShader( 0 );
	HudColor( 0xffffffff );
	
	// cover
	if(GameGet(G_COVER))
		HudDrawTile( menuid, 8,48,240,136, 8,48,240,136, 0, 0 );

	// dialogs
	for(i=0;i<DlgCount();i++) 
		DialogDraw(i);

	// menu
	HudShader( 0 );
	HudColor( 0xffffffff );
	HudDrawTile( menuid, 0,0,256,48, 		0,0,256,48, 0, 0 );
	HudDrawTile( menuid, 0,48,8,136, 		0,48,8,136, 0, 0 );
	HudDrawTile( menuid, 248,48,8,136, 		248,48,8,136, 0, 0 );
	HudDrawTile( menuid, 0,184,256,8, 		0,184,256,8, 0, 0 );
	
	// lifebar
	lifeid = 2; // life tile
	w = 55*PlayerGet(P_LIFE)/100;
	h = 6;
	HudDrawTile( lifeid, 152, 5, w, h, 0, 0, w, h, 0, 0 );

	// credits
	HudColor( 0xffffff00 );
	credits = PlayerGet(P_CREDITS);
	if(credits>3) credits=3;
	for(i=0;i<credits;i++) 
		HudDrawText( fontid, 78+i*8,4,8,8, "@", 0 );

	// coins
	text = (str "%02i")PlayerGet(P_COINS);
	w = HudGetTextWidth( text );
	HudDrawText( fontid, 56-w/2,4,w,8, text, 0 );
	
	// title
	rx = GameGet(G_ROOMX);
	ry = GameGet(G_ROOMY);
	w = HudGetTextWidth( RoomGetName(rx,ry) );
	HudDrawText( fontid, 128-w/2,29,w,8, RoomGetName(rx,ry), 0 );
}

/////////////////////////////////////////////////////////////////////////////////
// Handler Music Loop
// This handler is called when the current music reaches it's end and is about to loop from the beginning.
// Users can stop the music here, or request another one.
// The handler will not be called if the music is already fading out.
/////////////////////////////////////////////////////////////////////////////////
func HandlerMusicLoop()
{
	// println("HANDLER MUSICLOOP");
}

/////////////////////////////////////////////////////////////////////////////////
// Handler Debug
// This handler is called every game cycle if engine was started with developer option.
// It can be used by developers to display debug informations in the console data slots.
// It is common to edit this during runtime to show some information and reload the script (F5).
// You can use DebugData( slot, text ) to display info in the debug slots.
/////////////////////////////////////////////////////////////////////////////////
func HandlerDebug()
{
	// DebugData( 0, "keys="+(str)GameGet(G_KEYS) );
	// ...
}

/////////////////////////////////////////////////////////////////////////////////
// Handler ReloadMap
// This handler is called after reloading map in debug purposes.
// Developers can reload the map during runtime by pressing F6 (in developer mode).
// Reset rooms and objects names, because they are lost on map load.
/////////////////////////////////////////////////////////////////////////////////
func HandlerReloadMap()
{
	RoomsSetNames();
	ObjectsSetNames();
	RoomsLoadTexts(ROOM_TEXTSFILE);
	RoomsLoadProps(ROOM_PROPSFILE);
	// ...
}

/////////////////////////////////////////////////////////////////////////////////
// Handler ReloadScript
// This handler is called after reloading script for debug purposes.
// Global script variables have been lost, so user may need to restore them.
/////////////////////////////////////////////////////////////////////////////////
func HandlerReloadScript()
{
	RoomsLoadTexts(ROOM_TEXTSFILE);
	// ...
}

/////////////////////////////////////////////////////////////////////////////////
