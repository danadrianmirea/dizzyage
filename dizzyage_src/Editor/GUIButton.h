//////////////////////////////////////////////////////////////////////////////////////////////////
// GUIButton.h
//////////////////////////////////////////////////////////////////////////////////////////////////
#ifndef __GUIBUTTON_H__
#define __GUIBUTTON_H__

#include "GUIItem.h"


//////////////////////////////////////////////////////////////////////////////////////////////////
// cGUIButton
// Obs:
// 1. overwrite pressed style
//////////////////////////////////////////////////////////////////////////////////////////////////

class cGUIButton : public cGUIItem
{
public:

						cGUIButton			();
virtual					~cGUIButton			();

virtual	void			Update				();					// update 
virtual	void			Draw				();					// draw 

};


//////////////////////////////////////////////////////////////////////////////////////////////////
// cGUICheck
// Obs:
// 1. uses image1 and image2 only (no styles)
//////////////////////////////////////////////////////////////////////////////////////////////////

class cGUICheck : public cGUIButton
{
public:

						cGUICheck			();
virtual					~cGUICheck			();

virtual	void			Update				();					// update 
virtual	void			Action				();					// action
};


//////////////////////////////////////////////////////////////////////////////////////////////////
// cGUIRadio
// Obs:
// 1. uses image1 and image2 only (no styles)
//////////////////////////////////////////////////////////////////////////////////////////////////

class cGUIRadio: public cGUIButton
{
public:

						cGUIRadio			();
virtual					~cGUIRadio			();

virtual	void			Update				();					// update 
virtual	void			Action				();					// action
};

#endif
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////


