//MultiPaste.jsx
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

if (!app.documents.length || !app.windows.length) exit();

doc = app.activeDocument;

if (!Array.prototype.map) {
    Array.prototype.map = function(fun) {
        
        var mappedValue = [];
        
        for (var i = 0, l = this.length; i < l; i++) {
            mappedValue[i] = fun.call(this, this[i], i);
        }
        return mappedValue;
    };
}

// имена разворотов
spreadNames = doc.spreads.everyItem().getElements().map(function(spread) {
    return spread.pages.everyItem().name.join(" - ");
});

// только один разворот
if (spreadNames.length == 1) {
    app.pasteInPlace();
    exit();
}

// диалог
dialog = new Window ("dialog", "MultiPaste");
dialog.orientation = "row";
dialog.alignChildren = "top";
mainGroup = dialog.add ("panel");
mainGroup.alignChildren = "left";
mainGroup.orientation = "column";
mainGroup.add ("statictext", undefined, "Choice pages:");

// список страниц
listbox = mainGroup.add (
    "listbox", 
    undefined, 
    spreadNames, 
    {multiselect: true});
listbox.minimumSize = {width: 200, height: 9};
listbox.maximumSize = {width: 200, height: 700};
listbox.onClick = function(){okButton.enabled = listbox.selection;};
listbox.onDoubleClick = function(){listbox.selection = listbox.items;};
// add helpTip
tip = "To select multiple items, you need to hold down the ";
tip += File.fs == "Macintosh" ? "Command" : "Control";
tip += " key. \n\nDouble-click it for select all pages.";
listbox.helpTip = tip;

// кнопки
buttonGroup = dialog.add ("group");
buttonGroup.alignChildren = "fill";
buttonGroup.orientation = "column";
okButton = buttonGroup.add ("button", undefined, "OK", {name: "ok"});
buttonGroup.add ("button", undefined, "Cancel", {name: "cancel"});

// специальные виды выделения при удержании Shift, Ctrl, Alt
if (ScriptUI.environment.keyboardState.shiftKey) {
    listbox.selection = listbox.items;
} else if (ScriptUI.environment.keyboardState.ctrlKey || 
    ScriptUI.environment.keyboardState.altKey) {
    
    doc.pages.everyItem().getElements().map(function(page) {
        listbox.items[page.parent.index].selected = 
            listbox.items[page.parent.index].selected ||
            (ScriptUI.environment.keyboardState.ctrlKey && 
            page.side == PageSideOptions.LEFT_HAND) ||
            (ScriptUI.environment.keyboardState.altKey && 
            page.side == PageSideOptions.RIGHT_HAND);
    });
}
listbox.onClick();

// отобразим диалог
if (dialog.show() != 1 || !listbox.selection) exit();

layoutWindow = doc.layoutWindows[0];
currSpread = layoutWindow.activeSpread;

// обработка выделенных элементов
listbox.selection.map(function(item) {
    // переход на нужный разворот
    layoutWindow.activeSpread = doc.spreads[item.index];
    
    // вставка
    app.pasteInPlace();
});

// восстановим первоначальную страницу
layoutWindow.activeSpread = currSpread;
