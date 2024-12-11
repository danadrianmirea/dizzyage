/////////////////////////////////////////////////////////////////////////////////
// roomprops.gs
// Room properties functions used for names, custom texts and numeric props
/////////////////////////////////////////////////////////////////////////////////
#def ROOM_NAMESFILE		"Data\\Map\\dizzy.nam"
#def ROOM_PROPSFILE		"Data\\Map\\dizzy.rp"
#def ROOM_TEXTSFILE		"Data\\Map\\dizzy.rt"

/////////////////////////////////////////////////////////////////////////////////
// IN: str; filename; file name, usually dizzy.nam
// Loads rooms names saved from the editor
// Each line in the file has the folowing format: ROOMX; ROOMY; ROOMNAME
/////////////////////////////////////////////////////////////////////////////////
func RoomsLoadNames( filename )
{
	f = gs_fileopen(filename,0);
	if(!f) return false;
	while(true)
	{
		entry = "";
		eof = (gs_filereadtext(&entry,f)==0);
		if(eof) break;
		t = strexplode(entry,';');
		if(sizeof(t)!=3) continue;
		RoomSetName((int)t[0],(int)t[1],t[2]);
	}
	gs_fileclose(f);	
	return true;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: str; filename; file name, usually dizzy.rt
// Loads rooms custom texts saved from the editor
// Each line in the file has the folowing format: ROOMX; ROOMY; TEXT0; TEXT1; TEXT2; TEXT3
// It calls the RoomSetCustomText(rx,ry,idx,refstr), for each non-empty text loaded
/////////////////////////////////////////////////////////////////////////////////
func RoomsLoadTexts( filename )
{
	fid = gs_fid("RoomSetCustomText"); // user callback
	if(fid==-1) return;
	f = gs_fileopen(filename,0);
	if(!f) return false;
	while(true)
	{
		entry = "";
		eof = (gs_filereadtext(&entry,f)==0);
		if(eof) break;
		t = strexplode(entry,';');
		if(sizeof(t)<3) continue;
		rx = (int)t[0];
		ry = (int)t[1];
		if( rx<0 || rx>=GameGet(G_MAPW) || ry<0 || ry>=GameGet(G_MAPH) ) continue; // invalid room
		for(i=2;i<sizeof(t);i++)
			call(rx,ry,i-2,&(t[i]),fid);
	}
	gs_fileclose(f);	
	return true;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: str; filename; file name, usually dizzy.rp
// Loads rooms numeric properties saved from the editor
// Each line in the file has the folowing format: ROOMX; ROOMY; INT0; INT1; INT2; ... INT7
// The engine exports the max number properties per room in R_MAX (8)
/////////////////////////////////////////////////////////////////////////////////
func RoomsLoadProps( filename )
{
	f = gs_fileopen(filename,0);
	if(!f) return false;
	while(true)
	{
		entry = "";
		eof = (gs_filereadtext(&entry,f)==0);
		if(eof) break;
		t = strexplode(entry,';');
		if(sizeof(t)<3) continue;
		rx = (int)t[0];
		ry = (int)t[1];
		if( rx<0 || rx>=GameGet(G_MAPW) || ry<0 || ry>=GameGet(G_MAPH) ) continue; // invalid room
		size = R_MAX;
		if(size>sizeof(t)-2) size=sizeof(t)-2;
		for(idx=0;idx<size;idx++)
			RoomSet(rx,ry,idx,(int)t[2+idx]);
	}
	gs_fileclose(f);	
	return true;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; file; file handler
// OUT: int; 0=fail, 1=success
// Loads room numeric properties from the saved game
// Called from the LoadGame() function.
/////////////////////////////////////////////////////////////////////////////////
func LoadRoomProperties( file )
{
	val = 0;
	for(ry=0;ry<GameGet(G_MAPH);ry++)
	{
		for(rx=0;rx<GameGet(G_MAPW);rx++)
		{
			for(idx=0;idx<R_MAX;idx++)
			{
				if(!gs_filereadint(&val, file)) return 0;
				RoomSet(rx,ry,idx,val);
			}
		}
	}
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; file; file handler
// OUT: int; 0=fail, 1=success
// Saves room numeric properties in the saved game
// Called from the SaveGame() function.
/////////////////////////////////////////////////////////////////////////////////
func SaveRoomProperties( file )
{
	for(ry=0;ry<GameGet(G_MAPH);ry++)
	{
		for(rx=0;rx<GameGet(G_MAPW);rx++)
		{
			for(idx=0;idx<R_MAX;idx++)
			{
				if(!gs_filewriteint(RoomGet(rx,ry,idx), file)) return 0;
			}
		}
	}
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
