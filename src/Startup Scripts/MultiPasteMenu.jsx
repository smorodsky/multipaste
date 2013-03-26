//MultiPasteMenu.jsx
//An InDesign JavaScript

/*
License: MIT    
    
Copyright (C) 2013 Konstantin Smorodsky

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to 
deal in the Software without restriction, including without limitation the 
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
sell copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
IN THE SOFTWARE.
*/
// 2013-03-26

//@targetengine "multipaste"

// menu installer

//seek script file
try {
    thisFile = app.activeScript;
} catch (e) {
    thisFile = e.fileName;
}
scriptFile = new File((new File(thisFile)).parent.absoluteURI + '/MultiPaste.jsx');

if (!scriptFile.exists) {
    scriptFile = new File((new File(thisFile)).parent.parent.absoluteURI + '/MultiPaste.jsx');
}

if (!scriptFile.exists) exit();

// add menu action
action = app.scriptMenuActions.add("MultiPaste...");

action.eventListeners.add('onInvoke', function(event) {
    try {
        app.doScript(
            scriptFile, 
            ScriptLanguage.JAVASCRIPT, 
            undefined, 
            UndoModes.ENTIRE_SCRIPT, 
            'MultiPaste');
    } catch (e) {}
});

action.eventListeners.add('beforeDisplay', function(event) {
    try {
        event.target.enabled = app.documents.length && app.windows.length;
    } catch (e) {}
});

menuEdit = app.menus.item("$ID/Main").submenus.item("$ID/&Edit");

try {
    menuEdit.menuItems.itemByName("MultiPaste...").remove();
} catch (e) {}

nextMenuItem = menuEdit.menuItems.itemByName("Clear");

// non-english versions
if (!nextMenuItem.isValid) {
    nextMenuItem = menuEdit.menuSeparators[1];
}
menuEdit.menuItems.add(action, LocationOptions.BEFORE, nextMenuItem);
