/////////////////////////////////////////////////////////////////////////////////
// player.gs
// Deals with player general actions and other player related functions
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// Utils
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// OUT: int; 0/1
// Tests if player should update this frame.
// It can also be used to syncronize the update of other objects with the update of the player.
/////////////////////////////////////////////////////////////////////////////////
func IsPlayerUpdate()
{
	return IsUpdate(PlayerGet(P_DELAY));
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; mat; material
// OUT: int; 0/1
// Tests if the specified material is found inside player's bounding box.
/////////////////////////////////////////////////////////////////////////////////
func IsMaterialInsidePlayer( mat )
{
	return PlayerGet(P_MATINSIDE) & (1<<mat);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; mat; material
// OUT: int; 0/1
// Tests if the material is found just under player's bounding box.
/////////////////////////////////////////////////////////////////////////////////
func IsMaterialUnderPlayer( mat )
{
	return PlayerGet(P_MATUNDER) & (1<<mat);
}

/////////////////////////////////////////////////////////////////////////////////
// OUT: int; 0/1
// Tests if player's position is considered safe for respawning or dropping objects.
/////////////////////////////////////////////////////////////////////////////////
func IsPlayerSafe()
{
	matmask = (1<<MAT_AIR)|(1<<MAT_WATER)|(1<<MAT_CLOUD)|(1<<MAT_CLIMB)|(1<<MAT_WIND); // only those are allowed inside player's box
	return ( 0 == ( PlayerGet(P_MATINSIDE) & (~matmask) ) ); // no other materials are allowed
}

/////////////////////////////////////////////////////////////////////////////////
// OUT: int; 0/1
// Tests if player's position is considered stable for respawning or dropping objects.
/////////////////////////////////////////////////////////////////////////////////
func IsPlayerStable()
{
	matmask = (1<<MAT_BLOCK)|(1<<MAT_JUMPFIX)|(1<<MAT_JUMPPRO)|(1<<MAT_CLIMB); // at least one material with hard density must be under the player
	return ( 0 != ( PlayerGet(P_MATUNDER) & matmask ) );
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; x1; left
// IN: int; y1; top
// IN: int; x2; right
// IN: int; y2; bottom
// OUT: int; 0/1
// Tests if player touches a rectangle (bounding boxes intersect)
/////////////////////////////////////////////////////////////////////////////////
func PlayerTouchRect( x1, y1, x2, y2 )
{
	pw = PlayerGet(P_W)+4; // use a small horisontal boggus (-2/+2) so it can pick hard objects
	ph = PlayerGet(P_H);
	px1 = PlayerGet(P_X)-pw/2;
	py1 = PlayerGet(P_Y)-ph/2;
	px2 = px1+pw;
	py2 = py1+ph;
	if( px1>=x2 || px2<=x1 ) return 0;
	if( py1>=y2 || py2<=y1 ) return 0;
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// OUT: int; 0/1
// Tests if player touches an object (bounding boxes intersect)
/////////////////////////////////////////////////////////////////////////////////
func PlayerTouchObject( idx )
{
	pw = PlayerGet(P_W)+4; // use a small horisontal boggus (-2/+2) so it can pick hard objects
	ph = PlayerGet(P_H);
	px1 = PlayerGet(P_X)-pw/2;
	py1 = PlayerGet(P_Y)-ph/2;
	px2 = px1+pw;
	py2 = py1+ph;
	ox1 = ObjGet(idx,O_X);
	oy1 = ObjGet(idx,O_Y);
	ox2 = ox1+ObjGet(idx,O_W);
	oy2 = oy1+ObjGet(idx,O_H);
	if( px1>=ox2 || px2<=ox1 ) return 0;
	if( py1>=oy2 || py2<=oy1 ) return 0;
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// OUT: int; 0/1
// Tests if player touches an object that's visible in the current room (bounding boxes intersect)
/////////////////////////////////////////////////////////////////////////////////
func PlayerTouchObjectInRoom( idx )
{
	pw = PlayerGet(P_W)+4; // use a small horisontal boggus (-2/+2) so it can pick hard objects
	ph = PlayerGet(P_H);
	px1 = PlayerGet(P_X)-pw/2;
	py1 = PlayerGet(P_Y)-ph/2;
	px2 = px1+pw;
	py2 = py1+ph;
	ox1 = ObjGet(idx,O_X);
	oy1 = ObjGet(idx,O_Y);
	ox2 = ox1+ObjGet(idx,O_W);
	oy2 = oy1+ObjGet(idx,O_H);
	if( px1>=ox2 || px2<=ox1 ) return 0;
	if( py1>=oy2 || py2<=oy1 ) return 0;
	// check room visibility
	rw = GameGet(G_ROOMW);
	rh = GameGet(G_ROOMH);
	rx = GameGet(G_ROOMX)*rw;
	ry = GameGet(G_ROOMY)*rh;
	if( ox2<rx || ox1>=rx+rw || oy2<ry || oy1>=ry+rh ) return 0; // out of current room
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// Enter states
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// Set player in idle state
/////////////////////////////////////////////////////////////////////////////////
func PlayerEnterIdle()
{
	PlayerSet(P_STATUS,STATUS_IDLE);
	PlayerSet(P_DIR,0);
	PlayerSet(P_POW,0);
	PlayerSet(P_FLIP,PlayerGet(P_FLIP)&FLIPY);
	PlayerSet(P_FRAME,0);
	PlayerSet(P_ANIM,2);
	PlayerSet(P_TILE,PlayerGet(P_COSTUME)+PlayerGet(P_TILEIDLE)+PlayerGet(P_EMOTION));
	PlayerSet(P_STUNLEVEL,0); // avoid resident stun :)
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; dir; direction -1=left, 1=right
// Set player in walk state
/////////////////////////////////////////////////////////////////////////////////
func PlayerEnterWalk( dir )
{
	PlayerSet(P_STATUS,STATUS_WALK);
	PlayerSet(P_DIR,dir);
	PlayerSet(P_POW,0);
	PlayerSet(P_FLIP,(PlayerGet(P_FLIP)&FLIPY)|(dir==-1));
	PlayerSet(P_FRAME,0);
	PlayerSet(P_ANIM,2);
	PlayerSet(P_TILE,PlayerGet(P_COSTUME)+PlayerGet(P_TILEWALK));
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; dir; direction -1=left, 0=up; 1=right
// IN: int; pow; jump power
// Set player in walk state
/////////////////////////////////////////////////////////////////////////////////
func PlayerEnterJump( dir, pow )
{
	PlayerSet(P_STATUS,STATUS_JUMP);
	PlayerSet(P_DIR,dir);
	PlayerSet(P_POW,pow);
	PlayerSet(P_FLIP,(PlayerGet(P_FLIP)&FLIPY)|(dir==-1));
	PlayerSet(P_FRAME,0);
	PlayerSet(P_ANIM,2);
	if(dir==0)
		PlayerSet(P_TILE,PlayerGet(P_COSTUME)+PlayerGet(P_TILEUP));
	else
		PlayerSet(P_TILE,PlayerGet(P_COSTUME)+PlayerGet(P_TILEJUMP));
}

/////////////////////////////////////////////////////////////////////////////////
// Set player in fall state
/////////////////////////////////////////////////////////////////////////////////
func PlayerEnterFall()
{
	PlayerSet(P_STATUS,STATUS_FALL);
	PlayerSet(P_POW,1);
	PlayerSet(P_ANIM,2);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; dir; direction -1=left, 0=up; 1=right
// Set player in fall state
/////////////////////////////////////////////////////////////////////////////////
func PlayerEnterSpin( dir )
{
	PlayerEnterFall();
	PlayerSet(P_DIR,dir);
	PlayerSet(P_POW,0);
	PlayerSet(P_FLIP,(PlayerGet(P_FLIP)&FLIPY)|(dir==-1));
	PlayerSet(P_FRAME,1);
	PlayerSet(P_ANIM,2);
	PlayerSet(P_TILE,PlayerGet(P_COSTUME)+PlayerGet(P_TILEJUMP));
}

/////////////////////////////////////////////////////////////////////////////////
// Set player in scripted state
/////////////////////////////////////////////////////////////////////////////////
func PlayerEnterScripted()
{
	PlayerSet(P_STATUS,STATUS_SCRIPTED);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; x; horizontal coordinate in world
// IN: int; y; vertical coordinate in world
// Set player's position
/////////////////////////////////////////////////////////////////////////////////
func PlayerSetPos( x, y )
{
	PlayerSet(P_X,(x/4)*4); // multiple of 4
	PlayerSet(P_Y,y);
}

/////////////////////////////////////////////////////////////////////////////////
// Animations
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// IN: int; tile; tile id
// Player plays all frames from the tile's animation.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func PlayerPlayAnim( tile )
{
	tile += PlayerGet(P_COSTUME);
	PlayerSet( P_STATUS, STATUS_SCRIPTED );
	PlayerSet( P_TILE, tile );
	PlayerSet( P_FRAME, 0 );
	PlayerSet( P_ANIM, 1 );
	idx = TileFind( tile );
	frames = TileGet( idx, TILE_FRAMES ) * PlayerGet( P_DELAY );
	WaitFrames(frames);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; tile; tile id
// IN: tab; frames; list of frames to play
// Players plays all the frames specified in the table.
// Optional value for breaking the animation if player dies during it.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func PlayerPlayAnimFrames( tile, frames, breakdead )
{
	if(!?breakdead) breakdead=false;
	tile += PlayerGet(P_COSTUME);
	PlayerSet( P_STATUS, STATUS_SCRIPTED );
	PlayerSet( P_TILE, tile );
	PlayerSet( P_ANIM, 0 );
	idx = TileFind( tile );
	delay = PlayerGet( P_DELAY );
	for(i=0;i<sizeof(frames);i++)
	{
		if(breakdead && PlayerGet(P_LIFE)==0) break;
		PlayerSet( P_FRAME, frames[i] );
		WaitFrames(delay);
	}
}

/////////////////////////////////////////////////////////////////////////////////
// Stun event requested by HandlerFall() when falling from too high.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func PlayerPlayStun()
{
	if( IsPlayerStable() && PlayerGet(P_LIFE) ) // hit hard
	{
		DoRumble(20); // DoShake(20);
		SamplePlay(FX_STUN);
		PlayerPlayAnimFrames(PTILE_STUN, {0,1,0,1,0,1,0,1,2,3,2,3,2,3,2,3,4,4,4,4}, true );
	}
	PlayerEnterIdle();
}

/////////////////////////////////////////////////////////////////////////////////
// Dead event requested by HandlerPlayerUpdate when player died on ground.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func PlayerPlayDead()
{
	SamplePlay(FX_DEATH);
	PlayerPlayAnim(PTILE_DEAD);
	PlayerLoseLife();
}

/////////////////////////////////////////////////////////////////////////////////
// Dead in water event requested by HandlerPlayerUpdate() when player died in water.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func PlayerPlayDeadWater()
{
	SamplePlay(FX_DEATH);
	PlayerSet( P_STATUS, STATUS_SCRIPTED );
	PlayerSet( P_TILE, PlayerGet(P_COSTUME)+PTILE_DRAWN );
	
	delay = PlayerGet(P_DELAY);
	while(PlayerGet(P_MATCENTER)==MAT_WATER)
	{
		if(IsPlayerUpdate())
			PlayerSet(P_Y, PlayerGet(P_Y)-2);
		stop;
	}
	
	WaitFrames(delay*10); // wait a few more cycles
	
	PlayerLoseLife();
}

/////////////////////////////////////////////////////////////////////////////////
// Lose life event.
// Test P_DEATH to request the death message from the PlayerDeathMessage callback.
// Calls PlayerRespawn_DEATH callback, if available
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func PlayerLoseLife()
{
	credit = PlayerGet(P_CREDITS)-1;
	PlayerSet(P_CREDITS, credit);

	death = PlayerGet(P_DEATH);
	msg = PlayerDeathMessage(death);
	if(msg!="") OpenDialogMessage(msg);
	
	if(credit==0)
	{
		OpenDialogMessage("YOU HAVE LOST\nALL YOUR LIVES!");
		GameCommand(CMD_START);
	}
	else
	{
		// custom death respawn
		fid = gs_fid("PlayerRespawn_"+(str)death);
		if(fid!=-1) 
			call(fid);
		else 
			PlayerRespawn(); // default respawn, at previous safe position
	}
}

/////////////////////////////////////////////////////////////////////////////////
// Default player respawn
// Can also be called at the beginning of the PlayerRespawn_DEATH respawn callbacks,
// since it resets some general properties
/////////////////////////////////////////////////////////////////////////////////
func PlayerRespawn()
{
	// respawn
	SamplePlay(FX_RESPAWN);
	PlayerSet(P_DEATH, 0);
	PlayerSet(P_LIFE, 100);
	PlayerSet(P_X, PlayerGet(P_XSAFE));
	PlayerSet(P_Y, PlayerGet(P_YSAFE));
	PlayerEnterIdle();
	MusicFade(0,3);
	MusicRestore();
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; damage; amount of damage
// Player hurt event (non-latent).
// Just take some energy and play a hurt sound.
/////////////////////////////////////////////////////////////////////////////////
func PlayerHurt( damage )
{
	DoRumble(6); // DoShake(2);
	SamplePlay(FX_HURT);
	life = PlayerGet(P_LIFE) - damage;
	if(life<=0) life=0;
	PlayerSet(P_LIFE,life);
	PlayerSet(P_SAFE,0); // not safe
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; emotion; tile id offest
// Change player's emotion and apply frame
/////////////////////////////////////////////////////////////////////////////////
func PlayerEmotion( emotion )
{
	PlayerSet(P_EMOTION,emotion);
	tile = PlayerGet(P_COSTUME)+PlayerGet(P_TILEIDLE)+PlayerGet(P_EMOTION);
	if( PlayerGet(P_TILE)!=tile )
	{
		PlayerSet(P_FRAME, 1);
		PlayerSet(P_TILE, tile);
	}
}

/////////////////////////////////////////////////////////////////////////////////
// WaterPlay
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// Update water stuff, called from HandlerPlayerUpdate(), if your game supports WaterPlay (non-latent).
/////////////////////////////////////////////////////////////////////////////////
func PlayerUpdateWaterPlay()
{
	costume = PlayerGet(P_COSTUME);
	inwater = (PlayerGet(P_MATCENTER)==MAT_WATER);
	bubbledebit = 0;
	bubblespeed = 0;

	if(!inwater)
	{
		PlayerSet(P_AIRLEVEL, AIR_LEVEL);
		emotion = PlayerGet(P_EMOTION);
		if( emotion == EMOTION_NOAIR1 ||
			emotion == EMOTION_NOAIR2 ||
			emotion == EMOTION_NOAIR3 )
		{
			PlayerSet(P_EMOTION,0); // only if in drawning emotions
		}
		
		// NO SWIM
		PlayerSet(P_DELAY,3);
		PlayerSet(P_TILEUP,PTILE_UP);
		PlayerSet(P_TILEJUMP,PTILE_JUMP);
		// quick restore from swimming tiles (when jumping out of the water)
		tile = PlayerGet(P_TILE)-costume;
		if(tile==PTILE_SWIMUP) PlayerSet(P_TILE,costume+PTILE_UP); 
		if(tile==PTILE_SWIM || tile==PTILE_SWIMJUMP) PlayerSet(P_TILE,costume+PTILE_JUMP);
	}
	else // in water
	{
		if(costume==0) // no scuba
		{
			bubbledebit = 12; bubblespeed = 4;
			airlevel = PlayerGet(P_AIRLEVEL);
			if( airlevel>0 )			{ PlayerSet(P_AIRLEVEL,airlevel-1); }
			if( airlevel<AIR_LEVEL/2 )	{ PlayerSet(P_EMOTION, EMOTION_NOAIR1); }
			if( airlevel<AIR_LEVEL/4 )	{ PlayerSet(P_EMOTION, EMOTION_NOAIR2); bubbledebit=2; bubblespeed=6; }
			if( airlevel==0 )
			{ 
				PlayerSet(P_EMOTION, EMOTION_NOAIR3); 
				if(PlayerGet(P_LIFE)>0)
				{
					PlayerSet(P_LIFE,PlayerGet(P_LIFE)-2); 
					if(PlayerGet(P_LIFE)<=0) PlayerSet(P_DEATH,0); // set cause of death if needed
				}
			}
		}
		else // scuba
		{
			bubbledebit = 2; bubblespeed = 6;
			PlayerSet(P_AIRLEVEL, AIR_LEVEL);
			PlayerSet(P_EMOTION,0);
		}
		
		// SWIM
		PlayerSet(P_DELAY,4);
		PlayerSwim();
	}	

	if(PlayerGet(P_LIFE)<=0) // player is dead
	{
		bubbledebit = 0; bubblespeed = 0;
	}
	
	// airbubbles
	if(ID_BUBBLES!=-1)
		AIUpdateBubbles(ID_BUBBLES,PLAYER_BUBBLES,bubbledebit,bubblespeed,24);
}

/////////////////////////////////////////////////////////////////////////////////
// OUT: int; 0/1
// Return 1 if player can swim in water, or 0 if not
// Users can test if flippers item is in the inventory (or other options)
/////////////////////////////////////////////////////////////////////////////////
func PlayerCanSwim()
{
	if( ID_FLIPPERS==-1 ) return 0;
	return InventoryHasItem(ID_FLIPPERS);
}

int g_swimoldjump; // used to store last jump key value

/////////////////////////////////////////////////////////////////////////////////
// Player swim update, called while in water, from PlayerUpdateWaterPlay() (non-latent).
/////////////////////////////////////////////////////////////////////////////////
func PlayerSwim()
{
	canswim = PlayerCanSwim();
	status = PlayerGet(P_STATUS);
	costume = PlayerGet(P_COSTUME);

	// power and stun
	if(PlayerGet(P_POW)>10) PlayerSet(P_POW,10); 
	PlayerSet(P_STUNLEVEL,0);

	// tiles
	PlayerSet(P_TILEUP, PTILE_SWIMUP);
	PlayerSet(P_TILEJUMP, canswim ? PTILE_SWIM : PTILE_SWIMJUMP);
	if( status==STATUS_JUMP || status==STATUS_FALL) // clamp swim anim
	{
		if(IsPlayerStable()) { PlayerEnterIdle(); return; } // no rolls in the water
		if(PlayerGet(P_DIR)!=0 && canswim)
			if(PlayerGet(P_FRAME)>3) PlayerSet(P_FRAME,3); // clamp swimming animation (3=4-1)
	}

	// underwater directions
	if( status==STATUS_JUMP || status==STATUS_FALL )
	{
		k_left = GetKey(KEY_LEFT);
		k_right = GetKey(KEY_RIGHT);
		if(k_left)
		{
			PlayerSet(P_DIR,-1);
			PlayerSet(P_TILE,costume+PlayerGet(P_TILEJUMP));
			PlayerSet(P_FLIP,(PlayerGet(P_FLIP)&FLIPY)|1);
		}
		else
		if(k_right)
		{
			PlayerSet(P_DIR,1);
			PlayerSet(P_TILE,costume+PlayerGet(P_TILEJUMP));
			PlayerSet(P_FLIP,(PlayerGet(P_FLIP)&FLIPY));
		}
		else
		{
			PlayerSet(P_DIR,0);
			PlayerSet(P_TILE,costume+PlayerGet(P_TILEUP));
		}
	
		if(canswim)
		{	
			if(!g_swimoldjump && GetKey(KEY_JUMP) && PlayerGet(P_DIR)!=0) // stroke
			{
				pow = PlayerGet(P_POW); 
				if(pow<4) pow=4;
				if(pow>7) pow=7; // hm
				PlayerSet(P_STATUS,STATUS_JUMP);
				PlayerSet(P_POW,pow);
				PlayerSet(P_FRAME,-1);
			}
			g_swimoldjump = GetKey(KEY_JUMP);
		}		
	}
}

/////////////////////////////////////////////////////////////////////////////////
