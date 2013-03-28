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
// 2013-03-27

if (!app.documents.length || !app.windows.length) exit();

if (!Array.prototype.map) {
    Array.prototype.map = function(fun) {
        
        var mappedValue = [];
        
        for (var i = 0, l = this.length; i < l; i++) {
            mappedValue[i] = fun.call(this, this[i], i);
        }
        return mappedValue;
    };
}

;(function(){
    var doc = app.activeDocument;

    // имена разворотов
    var spreadNames = doc.spreads.everyItem().getElements().map(function(spread) {
        return spread.pages.everyItem().name.join(" - ");
    });

    // только один разворот
    if (spreadNames.length == 1) {
        app.pasteInPlace();
        exit();
    }

    // диалог
    var dialog = new Window ("dialog", "MultiPaste");
    dialog.orientation = "row";
    dialog.alignChildren = "top";
    
    var mainGroup = dialog.add ("panel");
    mainGroup.alignChildren = "left";
    mainGroup.orientation = "column";
    mainGroup.add ("statictext", undefined, "Choice pages:");

    // список страниц
    var listbox = mainGroup.add (
        "listbox", 
        undefined, 
        spreadNames, 
        {multiselect: true});
    listbox.minimumSize = {width: 200, height: 9};
    listbox.maximumSize = {width: 200, height: 700};
    listbox.onChange = function(){okButton.enabled = listbox.selection;};
    // add helpTip
    var tip = "To select multiple items, you need to hold down the ";
    tip += File.fs == "Macintosh" ? "Command" : "Control";
    tip += " key.";
    listbox.helpTip = tip;
    
    // кнопки быстрого выбора
    var auxButtons = mainGroup.add ("group");
    var auxFont = ScriptUI.newFont("dialog", "Bold", 9);
    
    var auxText = auxButtons.add ("statictext", undefined, "Select:");
    auxText.graphics.font = auxFont;
    
    var allButton = auxButtons.add ("button", undefined, "All");
    allButton.graphics.font = auxFont;
    allButton.maximumSize = {width: 33, height: 16};
    allButton.onClick = function() {selectPages(true, true)};
    
    var leftButton = auxButtons.add ("button", undefined, "Left");
    leftButton.graphics.font = auxFont;
    leftButton.maximumSize = {width: 44, height: 16};
    leftButton.onClick = function() {selectPages(true, false)};
    
    var rightButton = auxButtons.add ("button", undefined, "Right");
    rightButton.graphics.font = auxFont;
    rightButton.maximumSize = {width: 44, height: 16};
    rightButton.onClick = function() {selectPages(false, true)};
    
    // основные кнопки
    var buttonGroup = dialog.add ("group");
    buttonGroup.alignChildren = "fill";
    buttonGroup.orientation = "column";
    
    var okButton = buttonGroup.add ("button", undefined, "OK", {name: "ok"});
    buttonGroup.add ("button", undefined, "Cancel", {name: "cancel"});
    
    // специальные виды выделения при удержании Ctrl, Alt
    var selectPages = function (left, right) {
        if (!left && !right) return;
        
        if (left && right) {
            listbox.selection = listbox.items;
            return;
        }
        listbox.selection = null;
        
        doc.pages.everyItem().getElements().map(function(page) {
            listbox.items[page.parent.index].selected = 
                (left && page.side == PageSideOptions.LEFT_HAND) ||
                (right && page.side == PageSideOptions.RIGHT_HAND) ||
                listbox.items[page.parent.index].selected;
        });
    }
    selectPages(ScriptUI.environment.keyboardState.ctrlKey, 
        ScriptUI.environment.keyboardState.altKey);
    
    listbox.onChange();

    // отобразим диалог
    if (dialog.show() != 1 || !listbox.selection) exit();

    var layoutWindow = doc.layoutWindows[0];
    var currSpread = layoutWindow.activeSpread;

    // обработка выделенных элементов
    listbox.selection.map(function(item) {
        try {
            // переход на нужный разворот
            layoutWindow.activeSpread = doc.spreads[item.index];
            
            // вставка
            app.pasteInPlace();
        } catch (e) {}
    });

    // восстановим первоначальную страницу
    layoutWindow.activeSpread = currSpread;
})();
