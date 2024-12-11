/////////////////////////////////////////////////////////////////////////////////
// def.gs
// General defines file
/////////////////////////////////////////////////////////////////////////////////
#def GAME_SCRW		256			// screen's width (fixed by engine to Z80 screen size)
#def GAME_SCRH		192			// screen's height (fixed by engine to Z80 screen size)
#def AIR_LEVEL		100			// player's air critical level
#def STUN_LEVEL		20			// player's stun critical level
#def DIZ_HURT		4			// default hurt level for "hurt" materials
#def WINDPOW		2			// default wind power
#def DIZ_POW		7			// player's jump power (for default movement)
#def DIZ_STEP		4			// player's walk step (for default movement)
#def JUMPFIXPOW		16			// fix jumper power
#def JUMPPROPOW		16			// pro jumper power limit
#def FLIPX			1			// flip x (bit value)
#def FLIPY			2			// flip y (bit value)
#def FLIPR			4			// flip rotate (bit value)

#def PTILE_IDLE		10			// default player's idle tile id
#def PTILE_WALK		11			// default player's walk tile id
#def PTILE_UP		12
#def PTILE_JUMP		13
#def PTILE_STUN		14
#def PTILE_DEAD		15
#def PTILE_NOAIR1	16
#def PTILE_NOAIR2	17
#def PTILE_NOAIR3	18
#def PTILE_EAT		19
#def PTILE_SWIM		20
#def PTILE_SWIMUP	21
#def PTILE_SWIMJUMP	22
#def PTILE_DRAWN	23

#def EMOTION_NOAIR1	6			// player's emotion offset for no air1
#def EMOTION_NOAIR2	7			// player's emotion offset for no air2
#def EMOTION_NOAIR3	8			// player's emotion offset for no air3

#def MAT_AIR		0			// void
#def MAT_WATER		1			// water (void); player can drawn in water
#def MAT_HURT		2			// hurt (void); player gets hurt
#def MAT_KILL		3			// kill (void); player gets killed
#def MAT_CLOUD		4			// clouds (medium); player sinks on clouds
#def MAT_CLIMB		5			// stairs (medium); player stands on
#def MAT_WIND		6			// winds (medium); player is pushed up
#def MAT_BLOCK		7			// ground, walls (hard); blocks the player
#def MAT_JUMPFIX	8			// jumper fix (hard)
#def MAT_JUMPPRO	9			// jumper progressive (hard)

// objects classes
#def CLASS_NONE		0			// default
#def CLASS_ACTION	1			// those objects can be used with action
#def CLASS_HURT		2			// used for objects that should hurt you (no automation implemented)
#def CLASS_KILL		3			// used for objects that should kill you (no automation implemented)
#def CLASS_ITEM		4			// those objects can be picked up in the inventory
#def CLASS_COIN		5			// those objects can be collected as coins
#def CLASS_FOOD		6			// those objects can eaten to grow the life
#def CLASS_LIFE		7			// those objects gives a credit when picked up.
#def CLASS_WAYPOINT	8			// used for dummy waypoints (no automation implemented)

// colors
#def COLOR_BLACK	0xff000000
#def COLOR_BLUE		0xff0000ff
#def COLOR_RED		0xffff0000
#def COLOR_MAGENTA	0xffff00ff	
#def COLOR_GREEN	0xff00ff00
#def COLOR_CYAN		0xff00ffff
#def COLOR_YELLOW	0xffffff00
#def COLOR_WHITE	0xffffffff
#def COLOR_DIALOG	0xff00ff00	// dialog default border color

// global variables starting from G_USER=64 up to G_MAX=256
#def G_SHAKE		64			// shake frames counter
#def G_RUMBLE		65			// rumble frames counter
#def G_COVER		66			// if cover screen is painted
#def G_MUSICSAFE	67			// store music for player respawn
#def G_MUSICPOSSAFE	68			// store music pos for player respawn
#def G_GAME			100			// globals representing game logic are recomended to start from this index up to 200 (add them in gamedef.gs)
#def G_STATIC		240			// the rest of the global variables, starting with this one, are not reseted on restart, see HandlerGameStart()
#def G_RESTART		240			// true after first start, false after that, see GameStartLoad()
// ...

// object variables starting from O_USER=32 up to O_MAX=48
// ...

// player variables starting from P_USER=64 up to P_MAX=128
// ...


/////////////////////////////////////////////////////////////////////////////////
