/////////////////////////////////////////////////////////////////////////////////
// sound.gs
// Deals with music and samples
// Supported formats: YM, MOD, IT, XM, S3M, WAV, OGG
// NOTE: music is streamed from hard disk, but samples are fully loaded in memory, so they can't be too big
/////////////////////////////////////////////////////////////////////////////////

// The sound ID defines corespond to the avaliable sound files, for a more elegant use in scripts.
// Users should change or add more defines like these when they change or add more sound files.

#def MUSIC_NONE		-1
#def MUSIC_A		1
#def MUSIC_B		2
#def MUSIC_C		3
// ...

#def FX_SUCCESS		1
#def FX_STUN		2
#def FX_DEATH		3
#def FX_RESPAWN		4
#def FX_COIN		5
#def FX_HURT		6
#def FX_JUMP		7
#def FX_BEEP1		8
#def FX_BEEP2		9
// ...

/////////////////////////////////////////////////////////////////////////////////
