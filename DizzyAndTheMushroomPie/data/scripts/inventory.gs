/////////////////////////////////////////////////////////////////////////////////
// Inventory
// Items are stored as object indexes in game variables starting with G_INVENTORY
// Items are stored consecutive, followed by a -1 value
// -1 value in inventory means no item
// There could be a maximum of G_USER-G_INVENTORY items in the inventory (<=14)
// MAXINVENTORY is defined to limit the number of items the player can carry
/////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////
// OUT: int; items count
// Returns the current number of items from the inventory.
/////////////////////////////////////////////////////////////////////////////////
func InventoryCount()
{
	for(i=0;i<MAXINVENTORY;i++)
		if(GameGet(G_INVENTORY+i)==-1)
			break;
	return i;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// OUT: int; 0=no slots available in inventory, 1=success
// Adds an item to the inventory, if possible.
/////////////////////////////////////////////////////////////////////////////////
func InventoryAdd( idx )
{
	count = InventoryCount();
	if(count==MAXINVENTORY) return 0; // inventory is full
	GameSet(G_INVENTORY+count,idx);
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// OUT: int; 0=object not found in inventory, 1=success
// Removes an item from the inventory.
/////////////////////////////////////////////////////////////////////////////////
func InventorySub( idx )
{
	count = InventoryCount();
	// find item slot
	for(i=0;i<count;i++)
		if(GameGet(G_INVENTORY+i)==idx)
			break;

	if(i==count) return 0; // item not found

	// shift remaining elements over the found one
	while(i<count-1)
	{
		idx = GameGet(G_INVENTORY+i+1);
		GameSet(G_INVENTORY+i,idx);
		i++;
	}
		
	// clear last
	GameSet(G_INVENTORY+count-1,-1);
		
	return 1;
}

/////////////////////////////////////////////////////////////////////////////////
// Removes all items from the inventory.
/////////////////////////////////////////////////////////////////////////////////
func InventoryClear()
{
	for(i=0;i<MAXINVENTORY;i++)
		GameSet(G_INVENTORY+i,-1);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; idx; object index
// OUT: int; inventory slot or -1 if object not found in inventory
// Returns the coresponding inventory position for an item.
/////////////////////////////////////////////////////////////////////////////////
func InventoryFind( idx )
{
	count = InventoryCount();
	for(i=0;i<count;i++)
		if( GameGet(G_INVENTORY+i)==idx )
			return i;
	return -1;
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; slot; inventory slot position
// OUT: int; object index or -1 if slot is empty
// Returns the index of an item object placed on a specified inventory slot.
/////////////////////////////////////////////////////////////////////////////////
func InventoryGet( slot )
{
	if(slot<0 || slot>=MAXINVENTORY) return -1;
	return GameGet(G_INVENTORY+slot);
}

/////////////////////////////////////////////////////////////////////////////////
// IN: int; id; item object's id
// OUT: int; 0=not in inventory, 1=prezent in the inventory
// Tells if an item, specified by it's object's id, is currently prezent in the inventory or not.
/////////////////////////////////////////////////////////////////////////////////
func InventoryHasItem( id )
{
	idx = ObjFind(id);
	if(idx==-1) return 0;
	return InventoryFind(idx)!=-1; 
}

/////////////////////////////////////////////////////////////////////////////////
