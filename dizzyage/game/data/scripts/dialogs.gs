/////////////////////////////////////////////////////////////////////////////////
// dialogs.gs
// Deals with basic dialog functions
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// These dialog functions are used for easy work with the top dialog
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// Open one dialog, same as DlgPush(). Also sets the default font.
/////////////////////////////////////////////////////////////////////////////////
func DialogPush() 				{ DlgPush(); DialogSetFont(FONT_DEFAULT); }

/////////////////////////////////////////////////////////////////////////////////
// Close one dialog, same as DlgPop().
/////////////////////////////////////////////////////////////////////////////////
func DialogPop()				{ DlgPop(); }

/////////////////////////////////////////////////////////////////////////////////
// Close all dialogs, same as DlgPopAll(). 
/////////////////////////////////////////////////////////////////////////////////
func DialogPopAll()				{ DlgPopAll(); }

/////////////////////////////////////////////////////////////////////////////////
// Returns the number of opened dialogs, same as DlgCount().
/////////////////////////////////////////////////////////////////////////////////
func DialogCount()				{ DlgCount(); }

/////////////////////////////////////////////////////////////////////////////////
// IN: int; x; horizontal coordinate in pixels
// IN: int; y; vertical coordinate in pixels
// Set position of the topmost dialog
/////////////////////////////////////////////////////////////////////////////////
func DialogSetPos( x, y )		{ idx=DlgCount()-1; DlgSet(idx,DLG_X,x); DlgSet(idx,DLG_Y,y); }

/////////////////////////////////////////////////////////////////////////////////
// IN: int; w; dialog width in pixels
// IN: int; h; dialog height in pixels
// Set size of the topmost dialog
/////////////////////////////////////////////////////////////////////////////////
func DialogSetSize( w, h )		{ idx=DlgCount()-1; DlgSet(idx,DLG_W,w); DlgSet(idx,DLG_H,h); }

/////////////////////////////////////////////////////////////////////////////////
// IN: int; color; dialog border color
// Set border color of the topmost dialog
/////////////////////////////////////////////////////////////////////////////////
func DialogSetColor( color )	{ idx=DlgCount()-1; DlgSet(idx,DLG_COLOR,color); }

/////////////////////////////////////////////////////////////////////////////////
// IN: int; fontid; dialog font
// Set the font of the topmost dialog, used in painting dialog texts
/////////////////////////////////////////////////////////////////////////////////
func DialogSetFont( font )		{ idx=DlgCount()-1; DlgSet(idx,DLG_FONT,font); }

/////////////////////////////////////////////////////////////////////////////////
// IN: str; text; dialog text
// Set text content of the topmost dialog
/////////////////////////////////////////////////////////////////////////////////
func DialogSetText( text )		{ idx=DlgCount()-1; DlgSetText(idx,text); }

/////////////////////////////////////////////////////////////////////////////////
// OUT: int; dialog width in pixels
// Get width of the topmost dialog
/////////////////////////////////////////////////////////////////////////////////
func DialogTextW()				{ idx=DlgCount()-1; HudFont(DlgGet(idx,DLG_FONT)); return HudGetTextWidth(DlgGetText(idx)); }

/////////////////////////////////////////////////////////////////////////////////
// OUT: int; dialog height in pixels
// Get height of the topmost dialog
/////////////////////////////////////////////////////////////////////////////////
func DialogTextH()				{ idx=DlgCount()-1; HudFont(DlgGet(idx,DLG_FONT)); return HudGetTextHeight(DlgGetText(idx)); }

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; dialog index
// Draw a dialog with border and text.
// Should be called only from HandlerDrawHud().
// Do NOT abuse it !
/////////////////////////////////////////////////////////////////////////////////
func DialogDraw( idx )
{
	x = DlgGet(idx,DLG_X)+GameGet(G_VIEWX);
	y = DlgGet(idx,DLG_Y)+GameGet(G_VIEWY);
	w = DlgGet(idx,DLG_W);
	h = DlgGet(idx,DLG_H);
	HudColor( DlgGet(idx,DLG_COLOR) );

	boxid = 3; // border tile
	HudDrawTile( boxid, x-16,y-16,16,16, 	0,0,16,16, 0, 0 );
	HudDrawTile( boxid, x,y-16,w,16, 		16,0,8,16, 0, 0 );
	HudDrawTile( boxid, x+w,y-16,16,16, 	24,0,16,16, 0, 0 );

	HudDrawTile( boxid, x-16,y,16,h, 		0,16,16,8, 0, 0 );
	HudDrawTile( boxid, x,y,w,h, 			16,16,8,8, 0, 0 );
	HudDrawTile( boxid, x+w,y,16,h, 		24,16,16,8, 0, 0 );
	
	HudDrawTile( boxid, x-16,y+h,16,16, 	0,24,16,40, 0, 0 );
	HudDrawTile( boxid, x,y+h,w,16, 		16,24,8,40, 0, 0 );
	HudDrawTile( boxid, x+w,y+h,16,16, 	24,24,16,40, 0, 0 );

	fontid = DlgGet(idx,DLG_FONT);
	HudFont(fontid);
	HudDrawText( fontid, x, y+4, w, h, DlgGetText(idx), 0 );
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; x; horizontal coordinate in pixels
// IN: int; y; verical coordinate in pixels
// Sets position of the last dialog.
// Auto sets the dialog size to contain all the text.
// It prevents the dialog from getting out of the screen, if possible, by adjusting the dialog position.
/////////////////////////////////////////////////////////////////////////////////
func DialogFitAt(x,y)
{
	border = 16;
	w = DialogTextW()+8; // plus some space
	h = DialogTextH()+8; // plus some space
	DialogSetSize(w,h);
	roomw = GameGet(G_ROOMW);
	roomh = GameGet(G_ROOMH);
	if(x+w+border>roomw) x=roomw-w-border;
	if(x<border) x=border;
	if(y+h+border>roomh) y=roomh-h-border;
	if(y<border) y=border;
	DialogSetPos(x,y);
}

/////////////////////////////////////////////////////////////////////////////////
// Auto sets position of the last dialog in the center of the screen.
// Auto sets the dialog size to contain all the text.
/////////////////////////////////////////////////////////////////////////////////
func DialogFitCenter()
{
	border = 16;
	w = DialogTextW()+8; // plus some space
	h = DialogTextH()+8; // plus some space
	DialogSetSize(w,h);
	x = (GameGet(G_ROOMW)-w)/2;
	y = (GameGet(G_ROOMH)-h)/2;
	DialogSetPos(x,y);
}

/////////////////////////////////////////////////////////////////////////////////
// Runs a simple dialog, waiting until the MENU key or the ACTION key are pressed.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func DialogRun()
{
	while(true)
	{
		stop;
		if( GetKeyHit(KEY_MENU) || GetKeyHit(KEY_ACTION) ) break;
	}
	ClearKeys();
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; fid_dialog; id of the dialog function that creates a dialog
// IN: int; count; how many selections are available in the dialog
// [IN]: int; default=0; default selection when the dialog is opened
// [IN]: int; norefuse=0; if the dialog can be closed without choosing a selection
// OUT: int; selection index or -1 if dialog was refused and nothing was choosed
// Runs a multi-selection dialog.
// Uses LEFT and RIGHT (or UP and DOWN) keys to navigate and ACTION key to select.
// If norefuse, you can't press MENU key to close without selecting something.
// The dialog creation function (fid_dialog) receives the current selection index as a parameter.
// Latent function.
/////////////////////////////////////////////////////////////////////////////////
func RunDialogSelect( fid_dialog, count, default, norefuse )
{
	if(fid_dialog==-1) return;
	if(!?default) default = 0;
	if(!?norefuse) norefuse = false;
	
	select = default;
	while(true)
	{
		call( select, fid_dialog );
		refresh = false;
		while(!refresh)
		{
			stop;
			if(GetKeyHit(KEY_LEFT) || GetKeyHit(KEY_UP)) 
			{ 
				select--; 
				if(select<0) select=count-1;
				refresh=true; 
			}
			else
			if(GetKeyHit(KEY_RIGHT) || GetKeyHit(KEY_DOWN))
			{
				select++; 
				if(select>count-1) select=0;
				refresh=true; 
			}
			else
			if(GetKeyHit(KEY_ACTION))
			{
				DialogPop();
				ClearKeys();
				return select;
			}
			if(GetKeyHit(KEY_MENU) && !norefuse) 
			{
				DialogPop();
				ClearKeys();
				return -1;
			}
		}
		DialogPop();
	}
}

/////////////////////////////////////////////////////////////////////////////////
// IN: str; text; message text
// [IN]: int; color=COLOR_DIALOG; border color
// Opens a simple message dialog and runs it, waiting for MENU or ACTION key to be pressed.
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogMessage( text, color )
{
	if(!?color) color = COLOR_DIALOG;
	GamePause(1);
	DialogPush();
	DialogSetText(text);
	DialogSetColor(color);
	DialogFitCenter();
	DialogRun();
	DialogPop();
	GamePause(0);
}

str g_dlgquestion_text;
/////////////////////////////////////////////////////////////////////////////////
// IN: str; text; question text
// [IN]: int; default=0; default selected answer, 0=yes, 1=no
// OUT: int; selected answer, 0=yes, 1=no
// Opens a simple question yes/no dialog.
// Uses DialogQuestion() function for dialog creation.
/////////////////////////////////////////////////////////////////////////////////
func OpenDialogQuestion( text, default )
{
	if(!?default) default=0;
	color = COLOR_DIALOG;
	g_dlgquestion_text = text;
	select = RunDialogSelect( gs_fid("DialogQuestion"), 2, default, true );
	return (select==0);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; select; current selection index 0=yes, 1=no
// Dialog creation function used by OpenDialogQuestion().
/////////////////////////////////////////////////////////////////////////////////
func DialogQuestion( select )
{
	text = "{a:center}"+g_dlgquestion_text+"\n\n{c:0xff0000}";
	if(select==0) 	text += "{f:1}YES{f:0}   NO";
	else			text += "YES   {f:1}NO{f:0}";
	DialogPush();
	DialogSetText(text);
	DialogSetColor(COLOR_DIALOG);
	DialogFitCenter();
}

/////////////////////////////////////////////////////////////////////////////////
