/////////////////////////////////////////////////////////////////////////////////
// util.gs
// General utilitary functions, used in other files
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// IN: int; frames; number of game cycles to wait
// Waits a specified number of game cycles. 
// Latent function. Call only from latent functions.
/////////////////////////////////////////////////////////////////////////////////
func WaitFrames( frames )
{
	for(i=0;i<frames;i++) stop;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; frames; number of game cycles to wait
// Waits a specified number of game cycles and clear input keys.
// Latent function. Call only from latent functions.
/////////////////////////////////////////////////////////////////////////////////
func WaitFramesClearKeys( frames )
{
	for(i=0;i<frames;i++) { ClearKeys(); stop; }
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; seconds; number of seconds to wait
// Waits a specified number of seconds.
// Latent function. Call only from latent functions.
/////////////////////////////////////////////////////////////////////////////////
func WaitTime( seconds )
{
	frames = seconds*GameGet(G_FPS);
	for(i=0;i<frames;i++) stop;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; key; key index [0..6]
// OUT: int; 0/1
// Tests if a key is pressed down.
// KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN, KEY_JUMP, KEY_ACTION, KEY_MENU
/////////////////////////////////////////////////////////////////////////////////
func GetKey( key )
{
	return (GameGet(G_KEYS) & (1<<key))?1:0;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; key; key index [0..6]
// OUT: int; 0/1
// Tests if a key has just been pressed (hit).
// The hit test is compares the key state with the state from the previous game cycle.
// KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN, KEY_JUMP, KEY_ACTION, KEY_MENU
/////////////////////////////////////////////////////////////////////////////////
func GetKeyHit( key )
{
	return (GameGet(G_KEYSHIT) & (1<<key))?1:0;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; key; key index [0..6]
// Overwrites a key value.
// Can be used to simulate player's input.
// KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN, KEY_JUMP, KEY_ACTION, KEY_MENU
/////////////////////////////////////////////////////////////////////////////////
func SetKey( key, val )
{
	keys = GameGet(G_KEYS);
	keys &= ~(1<<key);
	keys |= val<<key;
	GameSet(G_KEYS,keys);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; key; key index [0..6]
// Overwrites a key hit value.
// Can be used to simulate player's input.
// KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN, KEY_JUMP, KEY_ACTION, KEY_MENU
/////////////////////////////////////////////////////////////////////////////////
func SetKeyHit( key, val )
{
	keys = GameGet(G_KEYSHIT);
	keys &= ~(1<<key);
	keys |= val<<key;
	GameSet(G_KEYSHIT,keys);
}

/////////////////////////////////////////////////////////////////////////////////
// Clears key values.
// Can be used after closing menus, to prevent them from reopening.
/////////////////////////////////////////////////////////////////////////////////
func ClearKeys()
{
	GameSet(G_KEYS,0);
	GameSet(G_KEYSHIT,0);
}

/////////////////////////////////////////////////////////////////////////////////
// Call this in GameUpdate handler to allow jumping with the up key.
// It sets the 'jump' key if  the 'up' key is pressed.
/////////////////////////////////////////////////////////////////////////////////
func UseUpForJump()
{
	keys = GameGet(G_KEYS);
	jump = (keys & (1<<KEY_UP)) ? 1 : 0;
	keys |= (jump<<KEY_JUMP);
	GameSet(G_KEYS,keys);

	keys = GameGet(G_KEYSHIT);
	jump = (keys & (1<<KEY_UP)) ? 1 : 0;
	keys |= (jump<<KEY_JUMP);
	GameSet(G_KEYSHIT,keys);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; delay; number of frames
// OUT: int; 0/1
// Test if it's time for an object's update, once each delay frames.
// Usually delay is object's O_DELAY.
/////////////////////////////////////////////////////////////////////////////////
func IsUpdate( delay )
{
	if(delay==0) return true;
	return (GameFrame()%delay==0);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; on; 0=unpause, 1=pause
// Pauses or unpauses the game.
/////////////////////////////////////////////////////////////////////////////////
func GamePause( on )
{
	GameSet(G_PAUSE,on);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// OUT: int; 0/1
// Tests if object is pickable, by class.
/////////////////////////////////////////////////////////////////////////////////
func ObjIsPickup( idx )
{
	class = ObjGet(idx,O_CLASS);
	return ( class==CLASS_ITEM || class==CLASS_COIN || class==CLASS_FOOD || class==CLASS_LIFE );
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// OUT: int; 0/1
// Tests if object is action, by class.
/////////////////////////////////////////////////////////////////////////////////
func ObjIsAction( idx )
{
	class = ObjGet(idx,O_CLASS);
	return ( class==CLASS_ACTION );
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// Object plays all frames from the current tile's animation.
/////////////////////////////////////////////////////////////////////////////////
func ObjPlayAnim( idx )
{
	ObjSet( idx, O_FRAME, 0 );
	ObjSet( idx, O_ANIM, 1 );
	tileidx = TileFind( ObjGet(idx, O_TILE) );
	frames = TileGet( tileidx, TILE_FRAMES ) * ObjGet( idx, O_DELAY );
	WaitFrames(frames);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// IN: tab; frames; list with frames to play
// Object plays all the frames specified in the table from the current tile.
// Waits object's O_DELAY game cycles between each frame. 
/////////////////////////////////////////////////////////////////////////////////
func ObjPlayAnimFrames( idx, frames )
{
	ObjSet( idx, O_ANIM, 0 );
	delay = ObjGet( idx, O_DELAY );
	for(i=0;i<sizeof(frames);i++)
	{
		ObjSet( idx, O_FRAME, frames[i] );
		WaitFrames(delay);
	}
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; frames; number of game cycles to rumble
// Request rumble for a number of frames
/////////////////////////////////////////////////////////////////////////////////
func DoRumble( frames )
{
	if(frames>GameGet(G_RUMBLE)) GameSet(G_RUMBLE,frames);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; frames; number of game cycles to shake
// Request shake for a number of frames
/////////////////////////////////////////////////////////////////////////////////
func DoShake( frames )
{
	if(frames>GameGet(G_SHAKE)) GameSet(G_SHAKE,frames);
}	

/////////////////////////////////////////////////////////////////////////////////
// IN: int; magnitudex; shake horizontal magnitude
// IN: int; frequencyx; shake horizontal frequency
// IN: int; magnitudey; shake vertical magnitude
// IN: int; frequencyy; shake vertical frequency
// Set shake offsets using sine courves
/////////////////////////////////////////////////////////////////////////////////
func ApplyShake( magnitudex, magnitudey, frequencyx, frequencyy )
{
	sx = gs_cos( (float)gs_time() / (float)frequencyx ) * ((float)magnitudex + 0.1);
	sy = gs_sin( (float)gs_time() / (float)frequencyy ) * ((float)magnitudey + 0.1);
	GameSet(G_SHAKEX,(int)sx);
	GameSet(G_SHAKEY,(int)sy);
}

/////////////////////////////////////////////////////////////////////////////////
// Updates shake and rumble - call in GameUpdate handler
/////////////////////////////////////////////////////////////////////////////////
func UpdateShakeAndRumble()
{
	shake = GameGet(G_SHAKE);
	if(shake>0)
	{
		shake--; 
		if(shake>0)	ApplyShake(4,2,30,10); else { GameSet(G_SHAKEX,0); GameSet(G_SHAKEY,0); }
		GameSet(G_SHAKE,shake);
	}
	rumble = GameGet(G_RUMBLE);
	if(rumble>0)
	{
		rumble--; 
		GameSet(G_FFPERIOD,100);
		GameSet(G_FFMAGNITUDE,(rumble>0)?100:0); 
		GameSet(G_RUMBLE,rumble);
	}
}

/////////////////////////////////////////////////////////////////////////////////
// Stores music id and music position to use when player dies and gets respawned
/////////////////////////////////////////////////////////////////////////////////
func MusicStore()
{
	GameSet(G_MUSICSAFE,MusicPlaying());
	GameSet(G_MUSICPOSSAFE,MusicPosition());
}

/////////////////////////////////////////////////////////////////////////////////
// Restores and play music, used when player gets respawned
/////////////////////////////////////////////////////////////////////////////////
func MusicRestore()
{
	MusicStop();
	MusicPlay(GameGet(G_MUSICSAFE),GameGet(G_MUSICPOSSAFE));
}

/////////////////////////////////////////////////////////////////////////////////
