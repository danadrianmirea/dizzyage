/////////////////////////////////////////////////////////////////////////////////
// gamedef.gs
// Game defines file
// Users adjust values in this file to match needs of their game.
// Advanced users may need to adjust values in other files as well.
/////////////////////////////////////////////////////////////////////////////////
#def GAME_AUTHOR		"ALEXANDRU SIMION"					// game's author name (for the credits dialog)
#def GAME_TITLE			"DizzyAGE Default Template"			// game's title (for the window title)
#def GAME_WEBSITE 		"http://www.yolkfolk.com/dizzyage"	// game's website (for the final dialog)
#def GAME_ID			"DT080127"							// game's id text, used in saved games - change this when you release a new version, to prevent old saved games to be loaded.

#def MAXCREDITS			3		// max number of credits
#def MAXCOINS			4		// max number of coins or diamonds to find (set it to the number of coins you added in your map)
#def MAXINVENTORY		3		// max number of inventory items ( max 10 items )
#def LOADINGTIME		1		// minimum number of seconds to wait on the loading page
#def MUSIC_DEFAULT		1		// id of the default music, for more details see the sound.gs file
#def FONT_DEFAULT		4		// id of the default font

#def MAINMENU_ATTRACT	0		// set to 1 if you want attract mode in MainMenu (check mainmenu.gs)
#def PLAYER_MAINMENUX	400		// set the player's position x in the mainmenu room (attract mode room)
#def PLAYER_MAINMENUY	246		// set the player's position y in the mainmenu room (attract mode room)
#def PLAYER_LAYER		5		// set the player's layer in the game (player gets painted last in it's layer)
#def PLAYER_BEGINX		640		// set the starting positon x of the player in map (when a new game begins)
#def PLAYER_BEGINY		246		// set the starting positon y of the player in map (when a new game begins)
#def PLAYER_BUBBLES		12		// set this to the count of air bubble objects you placed in the map. used in WaterPlay

#def SUPPORT_WATERPLAY	0		// set to 1 if player can enter in water, swim, etc, or to 0 otherwise
#def SUPPORT_JUMPUP		1		// set to 1 if player can jump by pressing the up key, or to 0 otherwise

// WaterPlay items: scuba and flippers
// For more details see HandlerPlayerUpdate and PlayerCanSwim functions
#def ID_SCUBA			-1		// set scuba item's id if you have a scuba in your game and you want to wear it as a costume for WaterPlay
#def ID_FLIPPERS		-1		// set flipers item's id if you have any flippers in your game and you want to swim in WaterPlay (or you can set the id of the scuba if no flippers item)
#def ID_BUBBLES			-1		// set this to the first valid bubble object. the rest of the PLAYER_BUBBLES bubbles have consecutive ids. used in WaterPlay

// Global variables
// Those used in game logic are recomended to start from 100 up to 200 to avoid the ones used by the engine or the template
// ...

/////////////////////////////////////////////////////////////////////////////////
