/////////////////////////////////////////////////////////////////////////////////
// messages.gs
// Utility functions for displaying conversation message boxes.
// Users can define more functions, with specific color settings for
// their most common game characters.
/////////////////////////////////////////////////////////////////////////////////

int g_msglastx; 	// position x of the last message
int g_msglasty; 	// position y of the last message
int g_msglastink; 	// ink color of the last message
int g_msglastborder;// border color of the last message

/////////////////////////////////////////////////////////////////////////////////
// IN: int; x; horizontal coordinate in characters, multiple of 8 pixels [0,30)
// IN: int; y; vertical coordinate in characters, multiple of 8 pixels [0,17)
// IN: str; text; message text
// IN: int; colorink; the text color
// IN: int; colorborder; the border color
// Stores x, y, and colors, for use with the MessageNext() function.
// This does not closes the dialog. Needs DialogPop(), DialogPopAll(), or usually MessagePop().
/////////////////////////////////////////////////////////////////////////////////
func Message( x, y, text, colorink, colorborder )
{
	g_msglastx = x;
	g_msglasty = y;
	g_msglastink = colorink;
	g_msglastborder = colorborder;

	x*=8; y*=8;
	GamePause(1);
	DialogPush();
	DialogSetText("{c:0x"+(str "%x")colorink+"}"+text);
	DialogSetColor(colorborder);
	DialogFitAt(x,y);
	DialogRun();
	GamePause(0);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: str; text; message text
// [IN]: int; stepx=1; horizontal offset from the last dialog's position, in characters, multiple of 8 pixels
// [IN]: int; stepy=1; vertical offset from the last dialog's position, in characters, multiple of 8 pixels
// Opens another dialog message in cascade, using the position and the colors of the last message.
// This does not closes the dialog. Needs DialogPop(), DialogPopAll(), or usually MessagePop(). See Message().
/////////////////////////////////////////////////////////////////////////////////
func MessageNext( text, stepx, stepy )
{
	if(!?stepx) stepx = 1;
	if(!?stepy) stepy = 1;
	Message( g_msglastx+stepx, g_msglasty+stepy, text, g_msglastink, g_msglastborder );
}

/////////////////////////////////////////////////////////////////////////////////
// Closes all opened messages, same as DialogPopAll().
/////////////////////////////////////////////////////////////////////////////////
func MessagePop()
{
	DialogPopAll();
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; x; horizontal coordinate in characters, multiple of 8 pixels
// IN: int; y; vertical coordinate in characters, multiple of 8 pixels
// IN: str; text; message text
// quick call for Message() with story teller color settings
/////////////////////////////////////////////////////////////////////////////////
func Message0( x, y, text )
{
	Message( x, y, text, COLOR_WHITE, COLOR_RED );
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; x; horizontal coordinate in characters, multiple of 8 pixels
// IN: int; y; vertical coordinate in characters, multiple of 8 pixels
// IN: str; text; message text
// quick call for Message() with player color settings
/////////////////////////////////////////////////////////////////////////////////
func Message1( x, y, text )
{
	Message( x, y, text, COLOR_MAGENTA, COLOR_GREEN );
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; x; horizontal coordinate in characters, multiple of 8 pixels
// IN: int; y; vertical coordinate in characters, multiple of 8 pixels
// IN: str; text; message text
// [IN]: int; color=COLOR_WHITE; text color
// quick call for Message() with other characters color settings
/////////////////////////////////////////////////////////////////////////////////
func Message2( x, y, text, color )
{
	if(!?color) color = COLOR_WHITE;
	Message( x, y, text, color, COLOR_GREEN );
}

/////////////////////////////////////////////////////////////////////////////////
