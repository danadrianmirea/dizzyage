/////////////////////////////////////////////////////////////////////////////////
// upsidedown.gs
// included by game.gs
// Utils used in the Upside Down Demo
// The game variable G_UPSIDEDOWN is used to specify upside down mode (0/1)
/////////////////////////////////////////////////////////////////////////////////

// Set player upsidedown or normal
func UpsideDownPlayer( upsidedown )
{
	//roomy = GameGet(G_ROOMY);
	roomh = GameGet(G_ROOMH);
	py = PlayerGet(P_Y);
	ph = PlayerGet(P_H);
	roomy = py / roomh;
	if( upsidedown ) 
	{
		PlayerSet(P_USER+10,py); // store real position
		PlayerSet(P_FLIP,(PlayerGet(P_FLIP)&FLIPX)|FLIPY);
		y = roomy*roomh + roomh-1 - (py-roomy*roomh); // mirror y
		y += 5; // compensate because player's position is not in the center of the tile, but in the center of the bounding box
		if( y>=(roomy+1)*roomh ) y=(roomy+1)*roomh-1;
	}
	else
	{
		// don't bother with the reverese formula
		PlayerSet(P_FLIP, PlayerGet(P_FLIP)&FLIPX);
		y = PlayerGet(P_USER+10); // restore real position
		// debug movement will not work because of this
	}
	PlayerSet(P_Y,y); // small offset
}

// Toggles objects upsidedown
func UpsideDownObject( idx, upsidedown )
{
	roomy = GameGet(G_ROOMY);
	roomh = GameGet(G_ROOMH);
	flip = ObjGet(idx,O_FLIP) ^ FLIPY; // flip y
	y = ObjGet(idx,O_Y) + ObjGet(idx,O_H); // bottom will be up
	y = roomy*roomh + roomh-1 - (y-roomy*roomh); // mirror y
	ObjSet(idx,O_FLIP,flip);
	ObjSet(idx,O_Y,y);
}

// Toggle all objects upsidedown
func UpsideDownAllObjects( upsidedown )
{
	pcount = ObjPresentCount();
	for(pidx=0;pidx<pcount;pidx++) // iterate present objects
	{
		idx = ObjPresentIdx(pidx); // object index
		if(ObjGet(idx,O_DISABLE) || (ObjGet(idx,O_DRAW)&1==0) ) continue; // skip non-visible
		UpsideDownObject(idx, upsidedown);
	}
}

/////////////////////////////////////////////////////////////////////////////////
