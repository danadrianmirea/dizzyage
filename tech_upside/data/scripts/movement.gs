/////////////////////////////////////////////////////////////////////////////////
// movement.gs
// Custom player movement
/////////////////////////////////////////////////////////////////////////////////

#def CM_STEPX			4			// move step x
#def CM_STEPY			4			// move step y; used in adjustments
#def CM_STEPYMAX		7			// move step y; used in jumps and falls
#def CM_BOXW			16			// collision box width
#def CM_BOXH			20			// collision box height

func MIN(a,b) { return (a<b)?a:b; }

/////////////////////////////////////////////////////////////////////////////////
// Custom Move - main update function
/////////////////////////////////////////////////////////////////////////////////
func CM_Update()
{
	status = PlayerGet(P_STATUS);
	
	// input status
	if( status==STATUS_IDLE || status==STATUS_WALK )
	{
		CM_EnterKeyState();
		status = PlayerGet(P_STATUS); // re-read status
	}
	
	if( status==STATUS_IDLE )
		CM_UpdateIdle();
	else
	if( status==STATUS_WALK )
		CM_UpdateWalk();
	else
	if( status==STATUS_JUMP )
		CM_UpdateJump();
	else
	if( status==STATUS_FALL )
		CM_UpdateFall();
	else
	if( status==STATUS_SCRIPTED )
		CM_UpdateScripted();
	
	if( PlayerGet(P_STATUS)!=STATUS_SCRIPTED )
	{
		snap = CM_CheckCollidersSnap();
		status = PlayerGet(P_STATUS);

		// stand check only if not already snapped to collider
		if( !snap && (status==STATUS_IDLE || status==STATUS_WALK) )
		{
			h = CM_CheckFallY(1); // see if it can fall 
			if(h>0) // if any space below then enter in fall
			{
				CM_EnterFall();
				PlayerSet(P_Y,PlayerGet(P_Y)+1); 
				PlayerSet(P_POW,PlayerGet(P_POW)+1); // force one step down (DIZZYMATCH)
			}
		}
		
		// fix collision by rising dizzy
		CM_CheckCollision();
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////
// ENTER STATES
//////////////////////////////////////////////////////////////////////////////////////////////////

func CM_EnterIdle()
{
	PlayerSet(P_STATUS, STATUS_IDLE);
	PlayerSet(P_DIR, 0);
	PlayerSet(P_POW, 0);
	PlayerSet(P_FLIP, PlayerGet(P_FLIP) & FLIPY);

	tile = PlayerGet(P_COSTUME)+PlayerGet(P_TILEIDLE)+PlayerGet(P_EMOTION);
	if( PlayerGet(P_TILE)!=tile )
	{
		PlayerSet(P_FRAME, 0);
		PlayerSet(P_TILE, tile);
	}
}

func CM_EnterWalk( dir )
{
	PlayerSet(P_STATUS, STATUS_WALK); 
	PlayerSet(P_DIR, dir);
	PlayerSet(P_POW, 0);
	PlayerSet(P_FLIP, (PlayerGet(P_FLIP) & FLIPY) | (dir==-1));

	tile = PlayerGet(P_COSTUME)+PlayerGet(P_TILEWALK);
	if( PlayerGet(P_TILE)!=tile )
	{
		PlayerSet(P_FRAME, 0);
		PlayerSet(P_TILE, tile);
	}
}

func CM_EnterJump( dir, pow )
{
	PlayerSet(P_STATUS, STATUS_JUMP); 
	PlayerSet(P_DIR, dir);
	PlayerSet(P_POW, pow);
	PlayerSet(P_FLIP, (PlayerGet(P_FLIP) & FLIPY) | (dir==-1));

	costume = PlayerGet(P_COSTUME);
	if( dir==0 && PlayerGet(P_TILE)!=costume+PlayerGet(P_TILEUP) )
	{
		PlayerSet(P_FRAME, 0);
		PlayerSet(P_TILE, costume+PlayerGet(P_TILEUP));
	}
	else 
	if( dir!=0 && PlayerGet(P_TILE)!=costume+PlayerGet(P_TILEJUMP) )
	{
		PlayerSet(P_FRAME, 0);
		PlayerSet(P_TILE, costume+PlayerGet(P_TILEJUMP));
	}
}

func CM_EnterFall()
{
	PlayerSet(P_STATUS, STATUS_FALL);
	PlayerSet(P_POW, 1);
	// don't change tile and frame
}

func CM_EnterRoll()
{
	PlayerSet(P_POW,1); // cut fall power to roll on ground
	
	tile = PlayerGet(P_TILE);
	costume = PlayerGet(P_COSTUME);
	if( tile==costume+PlayerGet(P_TILEUP) || tile==costume+PlayerGet(P_TILEJUMP) ) // only when jumping
	{
		tileframes = TileGet(TileFind(tile),TILE_FRAMES);
		frame = CM_ComputeFrame( PlayerGet(P_FRAME), tileframes, PlayerGet(P_ANIM) );
		//if( frame < tile->m_frames-1 ) return; // don't enter idle unless last frame reached; untill then stay in roll
		if( frame != 0 ) return; // don't enter idle unless last frame reached; untill then stay in roll
	}

	CM_EnterKeyState(); // be sure to stop the fall, just in case the fall handler doesn't

	HandlerFall();
	
	PlayerSet(P_STUNLEVEL,0); // clear stun level
}

func CM_EnterJumper( mat )
{
	if(PlayerGet(P_LIFE)==0) { CM_EnterIdle(); return; } // no more jumps for mr. dead guy

	dir = 0;
	pow = 0;

	// direction
	if(GetKey(KEY_RIGHT))	dir++;
	if(GetKey(KEY_LEFT))	dir--;

	// call jump handler to determine the power of the jump
	ScrSetHandlerData(0,mat); // send the material
	ScrSetHandlerData(1,0); // clean return for safety
	HandlerJump();
	pow = ScrGetHandlerData(1); // receive power

	if(pow>0)
		CM_EnterJump(dir,pow); // still jumpy
	else
		CM_EnterRoll(); // roll
}

func CM_EnterSpin( dir )
{
	CM_EnterFall();
	PlayerSet(P_DIR, dir);
	PlayerSet(P_TILE, PlayerGet(P_COSTUME)+PlayerGet(P_TILEJUMP));
	PlayerSet(P_FLIP, (PlayerGet(P_FLIP) & FLIPY) | (dir==-1));
	PlayerSet(P_FRAME, 1);
}

func CM_EnterKeyState()
{
	if( PlayerGet(P_LIFE)<=0 ) { CM_EnterIdle(); return; } // prepare to die

	dir = 0;
	if( GetKey(KEY_RIGHT) )	dir++;
	if( GetKey(KEY_LEFT) )	dir--;
	if( GetKey(KEY_JUMP) )		
	{
		// call jump handler to determine the power of the jump
		ScrSetHandlerData(0,-1); // send no material
		ScrSetHandlerData(1,0);  // clean return for safety
		HandlerJump();
		pow = ScrGetHandlerData(1); // receive power
		if(pow>0) CM_EnterJump(dir,pow); // 7 would be the default jump power
	}
	else
	if(dir!=0)
	{
		CM_EnterWalk(dir);
	}
	else 
	{
		CM_EnterIdle();
	}
}

/////////////////////////////////////////////////////////////////////////////////
// UPDATE STATES
/////////////////////////////////////////////////////////////////////////////////

func CM_UpdateIdle()
{
	PlayerSet(P_FRAME,PlayerGet(P_FRAME)+1);
}

func CM_UpdateWalk()
{
	if( CM_CheckWalkX() )
		PlayerSet(P_X, PlayerGet(P_X) + PlayerGet(P_DIR)*CM_STEPX);

	PlayerSet(P_FRAME,PlayerGet(P_FRAME)+1);
}

func CM_UpdateJump()
{
	if( CM_CheckJumpX() )
		PlayerSet(P_X, PlayerGet(P_X) + PlayerGet(P_DIR)*CM_STEPX);

	pow = PlayerGet(P_POW);
	step = MIN(pow,CM_STEPYMAX);
	step = CM_CheckJumpY(step);

	PlayerSet(P_Y, PlayerGet(P_Y)-step);
	pow--;
	PlayerSet(P_POW,pow);

	PlayerSet(P_FRAME,PlayerGet(P_FRAME)+1);

	if( pow<0 ) // done jumping - see where to go idle or fall
	{
		under = CM_CheckFallY(1);
		if(under==0)
			CM_EnterKeyState();
		else
			CM_EnterFall();
	}
}

func CM_UpdateFall()
{
	if( CM_CheckFallX() )
		PlayerSet(P_X, PlayerGet(P_X) + PlayerGet(P_DIR)*CM_STEPX);

	pow = PlayerGet(P_POW);
	step = MIN(pow,CM_STEPYMAX);
	step2 = CM_CheckFallY(step);
	PlayerSet(P_Y, PlayerGet(P_Y)+step2);

	PlayerSet(P_FRAME, PlayerGet(P_FRAME)+1); // keep last tile
	PlayerSet(P_STUNLEVEL, PlayerGet(P_STUNLEVEL)+1);

	// stopping fall if fall step was reduced
	if(step2<step)
	{
		// check for jumpers
		mat = CM_CheckJumper();
		if( mat>=0 ) // it's a jumper!
			CM_EnterJumper( mat );
		else
			CM_EnterRoll();
	}
	else
	{
		pow++;
		PlayerSet(P_POW,pow);
	}
}

func CM_UpdateScripted()
{
	if(PlayerGet(P_ANIM)!=0) 
		PlayerSet(P_FRAME, PlayerGet(P_FRAME)+1);
}

/////////////////////////////////////////////////////////////////////////////////
// CHECKS
/////////////////////////////////////////////////////////////////////////////////

// check side, only above 8 bottom pixels. if bottom is blocked it will step-up on it
func CM_CheckWalkX()
{
	x1=0;y1=0;x2=0;y2=0;
	PlayerMakeBB(&x1,&y1,&x2,&y2);
	dir = PlayerGet(P_DIR);
	if(dir==1)
		return MaterialCheckFree( x2,y1,x2+CM_STEPX,y2-8 );
	else
	if(dir==-1)
		return MaterialCheckFree( x1-CM_STEPX,y1,x1,y2-8 );
	else
		return false;
}

func CM_CheckJumpX()
{
	x1=0;y1=0;x2=0;y2=0;
	PlayerMakeBB(&x1,&y1,&x2,&y2);
	dir = PlayerGet(P_DIR);
	if(dir==1)
		return MaterialCheckFree( x2,y1,x2+CM_STEPX,y2-8 );
	else
	if(dir==-1)	
		return MaterialCheckFree( x1-CM_STEPX,y1,x1,y2-8 );
	else
		return false;
}

// check material above the box and see how far can it go
func CM_CheckJumpY( step )
{
	x1=0;y1=0;x2=0;y2=0;
	PlayerMakeBB(&x1,&y1,&x2,&y2);
	return MaterialGetFreeDist(x1,y1-step,x2,y1,1,1); // bottom to top
}

func CM_CheckFallX()
{
	x1=0;y1=0;x2=0;y2=0;
	PlayerMakeBB(&x1,&y1,&x2,&y2);
	dir = PlayerGet(P_DIR);
	if(dir==1)	
		return MaterialCheckFree( x2,y1,x2+CM_STEPX,y2-8 );
	else
	if(dir==-1)	
		return MaterialCheckFree( x1-CM_STEPX,y1,x1,y2-8 );
	else
		return false;
}

// check material under the box and see how far can it go
func CM_CheckFallY( step )
{
	x1=0;y1=0;x2=0;y2=0;
	PlayerMakeBB(&x1,&y1,&x2,&y2);
	return MaterialGetFreeDist(x1,y2,x2,y2+step,0,0); // top to bottom
}

// collision inside box bottom will rise dizzy up with maximum CM_STEPY 
func CM_CheckCollision()
{
	x1=0;y1=0;x2=0;y2=0;
	PlayerMakeBB(&x1,&y1,&x2,&y2);
	step = MaterialGetFreeDist(x1,y2-CM_STEPY,x2,y2,0,1); // top to bottom
	if(step<CM_STEPY) // has some block
		PlayerSet(P_Y,PlayerGet(P_Y)-(CM_STEPY-step)); // rise up
}

// return material if jumper or -1 if not
func CM_CheckJumper()
{
	x1=0;y1=0;x2=0;y2=0;
	PlayerMakeBB(&x1,&y1,&x2,&y2);
	materials = MaterialRead(x1,y2,x2,y2+1); // read materials under the player

	// check all jump materials bits and return the material if found or -1 if no jumper
	// add more if your game has more jumping materials ...
	if( materials & (1<<MAT_JUMPFIX) ) return MAT_JUMPFIX;
	else
	if( materials & (1<<MAT_JUMPPRO) ) return MAT_JUMPPRO;
	else
	return -1; // no jumpers
}

func CM_CheckCollidersSnap()
{
	snap = 0;
	x1=0;y1=0;x2=0;y2=0;
	PlayerMakeBBW(&x1,&y1,&x2,&y2); // bound in world

	// test snap up - get max colliders distance inside player's bound
	dist = ColliderSnapDistance(x1,y1,x2,y2);
	if(dist>0) // got collision
	{
		step = MIN(dist,CM_STEPY);
		PlayerSet(P_Y, PlayerGet(P_Y)-step);
		snap=1; // snap up
	}
	else
	{
		// test snap down - get min colliders distance below player's bound
		dist = ColliderSnapDistance(x1,y2,x2,y2+CM_STEPY+1); // max
		step = CM_STEPY+1-dist; // min
		if(step<=CM_STEPY) // got collision under
		{
			PlayerSet(P_Y, PlayerGet(P_Y)+step);
			snap=1; // snap down
		}
	}	
	
	if( snap && PlayerGet(P_STATUS)==STATUS_FALL ) // stop falls
		CM_EnterRoll();
	
	return snap;
}

/////////////////////////////////////////////////////////////////////////////////

// return clamped and animated frame
func  CM_ComputeFrame( frame, framecount, anim )
{
	if( anim==1 ) // play
	{
		if( frame>framecount-1 ) 
			frame=framecount-1;
		else
		if( frame<0 )
			frame=0;
	}
	else
	if( anim==2 ) // loopl
	{
		if( framecount>0 ) 
			frame = frame % framecount;
		else
			frame = 0;
	}
	return frame;
}

/////////////////////////////////////////////////////////////////////////////////