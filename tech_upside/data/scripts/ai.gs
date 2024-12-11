/////////////////////////////////////////////////////////////////////////////////
// ai.gs
// Deals with A.I. beahaviours
// Those are functions used to update specified objects in an 'intelligent' way.
// Like spiders moving up and down, elevators, bubbles, etc.
// Users can add more AI functions for the characters or devices in their game.
/////////////////////////////////////////////////////////////////////////////////

#def O_WAYPOINTSPEED	32		// speed value for class waypoint, used in AIUpdateTrain()
#def O_WAYPOINTFLIP		33		// flip value for class waypoint, used in AIUpdateTrain()

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// Train AI
// Those are objects that move from a waypoint to another.
// Can be used for elevators, moving platforms or a walking creature, like a rat.
// Uses a target waypoint from where it takes speed (O_WAYPOINTSPEED) and flip (O_WAYPOINTFLIP).
// When target waypoint is reached, it gets a new target from the waypoint.
// O_TARGET = id of the current target waypoint
// O_STATUS = enable state, 1=moves, 0=stays
// Waypoint object:
// O_USER = speed value (O_WAYPOINTSPEED)
// O_USER+1 = flip value (O_WAYPOINTFLIP)
/////////////////////////////////////////////////////////////////////////////////
func AIUpdateTrain( idx )
{
	if(idx==-1) return;
	if(ObjGet(idx,O_DISABLE)) return;
	if(!IsUpdate(ObjGet(idx,O_DELAY))) return;
	if(ObjGet(idx,O_STATUS)!=1) return;
	id2 = ObjGet(idx,O_TARGET);
	if(id2==0) return;
	idx2 = ObjFind(id2);
	if(idx2==-1) return;
	speed = ObjGet(idx2,O_WAYPOINTSPEED);
	flip = ObjGet(idx2,O_WAYPOINTFLIP);
	x2 = ObjGet(idx2,O_X);
	y2 = ObjGet(idx2,O_Y);
	
	x = ObjGet(idx,O_X);
	y = ObjGet(idx,O_Y);
	ObjSet(idx,O_FLIP,flip);
	
	if(x<x2) { x+=speed; if(x>x2) x=x2; }
	if(x>x2) { x-=speed; if(x<x2) x=x2; }
	if(y<y2) { y+=speed; if(y>y2) y=y2; }
	if(y>y2) { y-=speed; if(y<y2) y=y2; }
	if(x==x2 && y==y2) // reached waypoint, change target
	{		
		target = ObjGet(idx2,O_TARGET);
		ObjSet(idx,O_TARGET,target);		
	}
	
	ObjSet(idx,O_X,x);
	ObjSet(idx,O_Y,y);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// ChainLink AI
// Updates chain's height, down to the target's y position.
// Used for elevator's chains or spiders wires.
// O_TARGET = target object's id
/////////////////////////////////////////////////////////////////////////////////
func AIUpdateChainLink( idx )
{
	if(idx==-1) return;
	id2 = ObjGet(idx,O_TARGET);
	if(id2==0) return;
	idx2 = ObjFind(id2);
	if(idx2==-1) return;
	len = ObjGet(idx2,O_Y)-ObjGet(idx,O_Y);	
	ObjSet(idx,O_H,len);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// Spider AI
// Moves up and down between two positions.
// Used for classic Dizzy spiders.
// O_USER = upper y value
// O_USER+1 = lower y value
// O_STATUS = direction 0=up, 1=down
/////////////////////////////////////////////////////////////////////////////////
func AIUpdateSpider( idx )
{
	if(idx==-1) return;
	if(ObjGet(idx,O_DISABLE)) return;
	if(!IsUpdate(ObjGet(idx,O_DELAY))) return;
	y = ObjGet(idx,O_Y);
	if(ObjGet(idx,O_STATUS)==0) // up
	{
		ty = ObjGet(idx,O_USER);
		if(y>ty)
			y-=1;
		else
			ObjSet(idx,O_STATUS,1);
	}
	else // down
	{
		ty = ObjGet(idx,O_USER+1);
		if(y<ty)
			y+=4;
		else
			ObjSet(idx,O_STATUS,0);
	}
	ObjSet(idx,O_Y,y);
}

#def O_BUBBLESPEED 	32	// bubble moving speed, set at spawn time, used in AIUpdateBubbles()
#def O_BUBBLETIME 	33	// bubble life time, growing each cycle, used in AIUpdateBubbles()

/////////////////////////////////////////////////////////////////////////////////
// IN: int; id; first bubble object's id
// IN: int; count; maximum number of bubble objects, with ids starting from id, id+1, id+2, etc
// IN: int; debit; the spawning debit delay factor, higher values means rare spawns, 0 means stopped
// IN: int; speed; the moving speed factor of bubbles (with some random variation)
// IN: int; life; the number of cycles a bubble lives, until respawned (with some random variation)
// This is used to manage the air bubbles the player spawns, while in water.
// O_DISABLE = if bubble is active or not (default must be disabled)
// O_USER+0 = bubble particular speed value (O_BUBBLESPEED)
// O_USER+1 = bubble life timer (O_BUBBLETIME)
// User can call it from player update.
// Make sure all bubbles are disabled by default !
/////////////////////////////////////////////////////////////////////////////////
func AIUpdateBubbles( id, count, debit, speed, life )
{
	roomw = GameGet(G_ROOMW);
	roomh = GameGet(G_ROOMH);

	activecount = 0;
	freecount = 0;
	for(i=0;i<count;i++)
	{
		idx = ObjFind(id+i);
		if( ObjGet(idx,O_DISABLE) ) { freecount++; continue; } // inactive
		
		// time and life
		time = ObjGet(idx,O_BUBBLETIME);
		time++;
		if( time > life + gs_rand(10) ) { ObjSet(idx,O_DISABLE,1); continue; } // die
		ObjSet(idx,O_BUBBLETIME,time);
		
		// position
		ofs = (ObjGet(idx,O_MAP+2) - ObjGet(idx,O_MAP))/2;
		speedy = ObjGet(idx,O_BUBBLESPEED);
		speedx = gs_rand(3) ? 0 : (speedy/2 - gs_rand(speedy));
		x = ObjGet(idx,O_X) + speedx;
		y = ObjGet(idx,O_Y) - speedy;

		if( MaterialRead(x%roomw+ofs,y%roomh+ofs,1,1)!=(1<<MAT_WATER) ) { ObjSet(idx,O_DISABLE,1); continue; } // blocked
		ObjSet(idx,O_Y,y);
		ObjSet(idx,O_X,x);
		
		ObjSet(idx,O_DISABLE,0);
		activecount++;
	}

	// spawn
	if( PlayerGet(P_MATCENTER) != MAT_WATER ) return; // player not in water
	if( PlayerGet(P_LIFE)==0) return; // player dead
	if( debit==0 ) return; // stopped
	if( freecount>0 && gs_rand(debit)==0 ) // if we have free bubbles and debit random
	{
		idxfree = -1;
		pick = gs_rand(freecount);
		freecount2 = 0;
		for(i=0;i<count;i++)
		{
			idx = ObjFind(id+i);
			if( ObjGet(idx,O_DISABLE) ) 
			{ 
				if(freecount2==pick) { idxfree=idx; break; }
				freecount2++; 
			}
		}
		
		ofs = (ObjGet(idx,O_MAP+2) - ObjGet(idx,O_MAP))/2;

		// reset bubble around player
		x = PlayerGet(P_X) + 8 - gs_rand(16);
		y = PlayerGet(P_Y) - 16;
		if( MaterialRead(x%roomw,y%roomh,1,1)!=(1<<MAT_WATER) ) return; // out of water
		ObjSet(idxfree,O_DISABLE,0);
		ObjSet(idxfree,O_X,x-ofs);
		ObjSet(idxfree,O_Y,y-ofs);
		ObjSet(idxfree,O_BUBBLESPEED,speed/2+gs_rand(speed));
		ObjSet(idxfree,O_BUBBLETIME,0);
		ObjPresent(idxfree);
	}
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int(object id) text brush
// O_STATUS = 0 for closing, 1 for opening
// O_SCROLLH = box height
// id+1 = box top brush
// id+2 = box middle brush
// id+3 = box bottom brush
/////////////////////////////////////////////////////////////////////////////////
#def O_SCROLLH 32			// height of the scroll box (O_USER)
#def O_SCROLLSTART 33		// internal user for page start (O_USER+1)

func AICommandScroll( id, active )
{
	idxtxt = ObjFind( id );
	if(idxtxt==-1) return;
	if(active) 
	{
		ObjSet(idxtxt,O_DISABLE,0);
		ObjSet(idxtxt, O_SCROLLSTART, -ObjGet(idxtxt,O_SCROLLH));
		ObjSet(idxtxt, O_H, 0);
		ObjSet(ObjFind(id+1),O_DISABLE,0);
		ObjSet(ObjFind(id+2),O_DISABLE,0);
		ObjSet(ObjFind(id+3),O_DISABLE,0);
	}
	ObjSet(idxtxt,O_STATUS,active);
	
}

func AIUpdateScroll( id )
{
	idxtxt = ObjFind( id );
	idxtop = ObjFind( id+1 );
	idxmid = ObjFind( id+2 );
	idxbot = ObjFind( id+3 );
	if( idxtxt==-1 || idxtop==-1 || idxmid==-1 || idxbot==-1 ) return;
	if( ObjGet(idxtxt,O_DISABLE) ) return;
	tiletxt = TileFind(ObjGet(idxtxt,O_TILE));
	if( tiletxt==-1 ) return;
	txth = TileGet(tiletxt,TILE_H);

	y = ObjGet(idxmid,O_Y);
	h = ObjGet(idxmid,O_H);
	boxh = ObjGet(idxtxt,O_SCROLLH);
	
	if(ObjGet(idxtxt,O_STATUS))
	{
		// OPEN
		if(h<boxh) h+=2; 
		if(h<0) h=0;
	}
	else
	{
		// CLOSE
		if(h<0) return; // closed enought
		h-=2;
		if(h<0)
		{
			ObjSet(idxtxt, O_SCROLLSTART, -boxh);
			ObjSet(idxtxt, O_DISABLE, 1);
			ObjSet(idxtop, O_DISABLE, 1);
			ObjSet(idxmid, O_DISABLE, 1);
			ObjSet(idxbot, O_DISABLE, 1);
			return;
		}
	}
	
	ObjSet(idxmid,O_H,h);
	ObjSet(idxbot,O_Y,y+h);

 	start = ObjGet(idxtxt, O_SCROLLSTART);
	ty = y-start;
	if(ty<y) ty = y;
	th = boxh;
	if(ty+th>=y+h) th=y+h-ty;
	if(start+th>=txth) th=txth-start-1;
	if(start>=txth) start = -boxh; // reset
	
	if(h==boxh && IsUpdate(ObjGet(idxtxt,O_DELAY))) start++;
	
	ObjSet(idxtxt,O_SCROLLSTART,start);
	
	my1 = start; 
	if(my1<0) my1=0;
	if(my1>txth) my1=txth;
	my2 = my1+boxh; 
	if(my2>txth) my2=txth;
	
	ObjSet(idxtxt,O_MAP+1,my1);
	ObjSet(idxtxt,O_MAP+3,my2);
	ObjSet(idxtxt,O_Y,ty);
	ObjSet(idxtxt,O_H,th);
}

/////////////////////////////////////////////////////////////////////////////////
