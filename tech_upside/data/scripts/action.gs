/////////////////////////////////////////////////////////////////////////////////
// action.gs
// Respond to the action event and implement basic action flow
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// This is the main latent action function requested by the action handler.
// First it tries "pickup" on a pickable object, if found.
// If not, it tries "action" on an action object, if found.
// If not, it opens the inventory and let you use/drop an item.
// Called by HandlerAction(), see PickupObject(), ActionObject(), UseObject().
/////////////////////////////////////////////////////////////////////////////////
func Action()
{
	idx = FindPickupObject();
	if(idx!=-1)
	{
		PickupObject(idx);
		return;
	}
	idx = FindActionObject();
	if(idx!=-1)
	{
		ActionObject(idx);
		return;
	}
	idx = OpenDialogInventory();
	if(idx!=-1)
	{
		UseObject(idx);
	}
}

/////////////////////////////////////////////////////////////////////////////////
// OUT: int; object index or -1 if not found
// Finds the first pickable object that the player stands in front of.
// Called by Action(), see PlayerTouchObject().
/////////////////////////////////////////////////////////////////////////////////
func FindPickupObject()
{
	pcount = ObjPresentCount();
	for(pidx=pcount-1;pidx>=0;pidx--) // iterate present objects
	{
		idx = ObjPresentIdx(pidx); // object index
		if( ObjGet(idx,O_DISABLE) ) continue;
		if( ObjIsPickup(idx) )
			if( PlayerTouchObjectInRoom(idx) ) // touched objects only
				return idx;
	}
	return -1;
}

/////////////////////////////////////////////////////////////////////////////////
// OUT: int; object index or -1 if not found
// Finds the first action object that the player stands in front of.
// Called by Action(), see PlayerTouchObject().
/////////////////////////////////////////////////////////////////////////////////
func FindActionObject()
{
	pcount = ObjPresentCount();
	for(pidx=pcount-1;pidx>=0;pidx--) // iterate present objects
	{
		idx = ObjPresentIdx(pidx); // object index
		if( ObjGet(idx,O_DISABLE) ) continue;
		if( ObjIsAction(idx) )
			if( PlayerTouchObjectInRoom(idx) ) // touched objects only
				return idx;
	}
	return -1;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// Picks up an object considering the object class (item, coin, food, life).
// If available, it calls the pickup callback "PickupObject_ID" insteed.
// Called by Action(), see DoPickupObject().
/////////////////////////////////////////////////////////////////////////////////
func PickupObject( idx )
{
	// try callback
	id = ObjGet(idx, O_ID);
	fid = gs_fid("PickupObject_"+(str)id);
	if(fid!=-1)
	{
		call(fid);
		return;
	}

	DoPickupObject(idx);
}
	
/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// Does pick up an object considering the object class (item, coin, food, life),
// without calling the pickup callback, so it may be used from it.
// Called by PickupObject().
/////////////////////////////////////////////////////////////////////////////////
func DoPickupObject(idx)
{
	class = ObjGet(idx, O_CLASS);
	
	if(class==CLASS_ITEM) // items are to be picked up in the inventory
	{
		ok = InventoryAdd(idx); // add item to inventory and return 1 if success or 0 if inventory is full
		if(!ok) // inventory is full
		{
			OpenDialogMessage("YOUR HANDS\nARE FULL!");
			return;
		}
		
		SamplePlay(FX_BEEP1);
		ObjSet(idx, O_DISABLE, 1); // disable object (picked up)
		idx = OpenDialogInventory(1); // open inventory and don't select an item; return selected item or -1
		if(idx!=-1) UseObject( idx ); // must use/drop something
	}
	
	else
	
	if(class==CLASS_COIN) // coins are to be collected
	{
		coins = PlayerGet(P_COINS)+1;
		ObjSet(idx, O_DISABLE, 1); // make disabled (picked up)
		PlayerSet(P_COINS,coins); // store coins counter
		SamplePlay(FX_COIN);
		
		// check if found them all - edit these messages
		if( coins==MAXCOINS )
			OpenDialogMessage("YOU HAVE FOUND\nALL THE COINS");
		else
			OpenDialogMessage("YOU HAVE FOUND\nA COIN");
	}
	
	else	
	
	if(class==CLASS_FOOD) // food gives energy
	{
		life = PlayerGet(P_LIFE);
		if(life>=100) { OpenDialogMessage("MAYBE LATER..."); return; }
		ObjSet(idx, O_DISABLE, 1); // make disabled (picked up)
		SamplePlay(FX_COIN);
		count = 0;
		while(life<100 || count<10)
		{
			PlayerPlayAnimFrames(PTILE_EAT, {0,1} );
			life+=10; if(life>100) life=100;
			PlayerSet(P_LIFE,life);
			count++;
		}
		PlayerEnterIdle();
	}
	
	else
	
	if(class==CLASS_LIFE) // gives one credit
	{
		credits = PlayerGet(P_CREDITS);
		if(credits>=MAXCREDITS) { OpenDialogMessage("MAYBE LATER..."); return; }
		ObjSet(idx, O_DISABLE, 1); // make disabled (picked up)
		SamplePlay(FX_COIN);
		PlayerSet(P_CREDITS,credits+1);
		OpenDialogMessage("YOU HAVE FOUND\nONE LIFE");
	}

	// users can also create other classes ...
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// Use an object from the inventory.
// If player stands in front of an action object (action class), the "UseObject_ID" callback is called.
// If not, the item is simply dropped down.
// Called by Action() and ActionObject(), see DropObject().
/////////////////////////////////////////////////////////////////////////////////
func UseObject( idx )
{
	// find action object with UseObject_ID function
	idx2 = FindActionObject();
	if(idx2!=-1)
	{
		id = ObjGet(idx2, O_ID);
		sz = "UseObject_"+(str)id;
		fid = gs_fid(sz);
		if(fid!=-1)
		{
			call(idx, fid); // sent item idx as parameter
			return;
		}
	}	

	// just drop it
	DropObject(idx);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// Drops an object from the inventory.
// The object is placed on the player's current position.
// If available, it calls the drop object callback "DropObject_ID" insteed.
// Do not call it back, from inside the drop object callback!
// Called by UseObject(), see DoDropObject().
/////////////////////////////////////////////////////////////////////////////////
func DropObject( idx )
{
	if(!IsPlayerSafe() || !IsPlayerStable()) // don't drop if not safe
	{
		OpenDialogMessage("YOUR CAN'T DROP\nTHIS NOW!");
		return; 
	}
	
	// try private function
	id = ObjGet(idx, O_ID);
	fid = gs_fid("DropObject_"+(str)id);
	if(fid!=-1)
	{
		call(fid);
		return;
	}
	
	DoDropObject(idx);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// Does drop the object, enableing and placing it on the player's current position,
// without calling the drop object callback, so it can be used inside this callback.
// Called by DropObject().
/////////////////////////////////////////////////////////////////////////////////
func DoDropObject( idx )
{
	SamplePlay(FX_BEEP2);
	InventorySub(idx);
	ObjSet(idx,O_DISABLE,0);
	ObjSet(idx,O_X, PlayerGet(P_X)-ObjGet(idx,O_W)/2);
	ObjSet(idx,O_Y, PlayerGet(P_Y)+PlayerGet(P_H)/2-ObjGet(idx,O_H));
	ObjPresent(idx); // force it to be present in current room
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// Action performed on the object the player stands in front of.
// If available, it calls the action callback "ActionObject_ID".
// If not, opens inventory and allows use /drop of the selected item.
// Called by Action(), see UseObject().
/////////////////////////////////////////////////////////////////////////////////
func ActionObject( idx )
{
	// try private function
	id = ObjGet(idx, O_ID);
	sz = "ActionObject_"+(str)id;
	fid = gs_fid(sz);
	if(fid!=-1)
	{
		call(fid);
		return;
	}
	
	// open inventory to use/drop something
	idx2 = OpenDialogInventory();
	if(idx2!=-1) UseObject(idx2);
}
	
/////////////////////////////////////////////////////////////////////////////////
