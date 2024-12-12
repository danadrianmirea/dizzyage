//////////////////////////////////////////////////////////////////////////////////
// DizzyAGE Editor - User customizations.
// Users can edit this file and customize parts of the editor, lile user scripts, value browsers or object classes.
// For more details about editor's scripts, unpack the editor data and check the default scripts.
//////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////
// Returns objects class names used in the game
// If needed, users can add more classes in this list
//////////////////////////////////////////////////////////////////////////////////
func MOD_GetClassNames()
{
	return {"none","action","hurt","kill","item","coin","food","life","waypoint"};
}

//////////////////////////////////////////////////////////////////////////////////
// BRUSH PROPS BROWSER
// receive brush property index
// Use DlgProps_GetProp(idx) and DlgProps_SetProp(idx,val) to get and set values
//////////////////////////////////////////////////////////////////////////////////
func MOD_BrushPropsBrowser(idx)
{
	// ...
}

//////////////////////////////////////////////////////////////////////////////////
// ROOM PROPS BROWSER
// receive room property index
// Use DlgRoomProps_GetProp(idx) and DlgRoomProps_SetProp(idx,val) to get and set values
//////////////////////////////////////////////////////////////////////////////////
func MOD_RoomPropsBrowser(idx)
{
	// ...
}

//////////////////////////////////////////////////////////////////////////////////
// ROOM TEXTS BROWSER
// receive room text index
// Use DlgRoomProps_GetText(idx) and DlgRoomProps_SetText(idx,txt) to get and set texts
//////////////////////////////////////////////////////////////////////////////////
func MOD_RoomTextsBrowser(idx)
{
	// ...
}

//////////////////////////////////////////////////////////////////////////////////
// return a formated table with the content of the user scripts menu
// entry format:
//		{ category_name,	""}
//		{ command_name,		script_commands,	key_shortcut/-1, 	"tooltip text" }
//////////////////////////////////////////////////////////////////////////////////
func MOD_GetUserScripts()
{
	datatab = { 
		{"User scripts",""},
		{" select coins",	"DlgClose();ScrUserSelectCoins();",				-1,		"a sample script that will select all the coins from the map"}
		// add more entries if you need...
	};
	return datatab;	
}	

//////////////////////////////////////////////////////////////////////////////////
// SAMPLE SCRIPT
// This script goes through all the brushes in the map and
// it selects those that are dynamic and have the "coin" class.
//////////////////////////////////////////////////////////////////////////////////
func ScrUserSelectCoins()
{
	select = 0;
	println("Search coins:");
	WaitCursor(1); // show hourglass cursor
	brushcount=MapBrushCount();
	for(i=0;i<brushcount;i++)
	{
		type = MapBrushGet(i,BRUSH_TYPE);
		class = MapBrushGet(i,BRUSH_CLASS);
		if(type==1 && class==5) // if type is dynamic and class is coin, select it
		{
			select++;
			MapBrushSet(i,BRUSH_SELECT,1);
		}
		else // deselect it (in case it was selected)
			MapBrushSet(i,BRUSH_SELECT,0);
	}
	WaitCursor(0); // show normal cursor
	EdiSet(EDI_SELECT,select); // update editor selection counter, since we might have ruined the previous selection
	if(select==0)
		MsgBoxOk("Message", "no coins has been found.", ICON_INFO);
	else
		MsgBoxOk("Message", (str)select+" coins has been found and selected.", ICON_INFO);
}

// add more functions if you need...

//////////////////////////////////////////////////////////////////////////////////