//=============================================================================
// Keyboard Entry
// TUR_KeyboardEntry.js
//=============================================================================

window.Imported = window.Imported || {};
Imported.TUR_KeyEntry = true;

window.TUR = window.TUR || {};
TUR.KeyEntry = TUR.KeyEntry || {};
TUR.KeyEntry.version = 1.2;

/*:
 * @plugindesc Use the keyboard for the name input and input number screens
 * @author ATT_Turan
 * @version 1.2
 * @target MZ
 * @help
 *
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * The default screens for name input entry and input number are rather
 * cumbersome for PC users, forcing them to use their mouse or manually scroll
 * across the alphabet.
 *
 * This plugin allows the user to simply type into either of those screens,
 * bypassing the normal input methods.
 *
 * ============================================================================
 * Notes
 * ============================================================================
 *
 * This plugin will only function with Latin characters. Users desiring other
 * characters can continue to use the on-screen input.
 *
 * Version 1.2:
 * - Changed default cursor position in name input to OK for typine name and pressing Enter
 *
 * Version 1.1:
 * - Fixed handling of Shift and Space Bar
 *
 * Version 1.0:
 * - Release version
 *
 */

Input.keyMapper[8] = "escape"; // backspace

Input._onKeyDown = function(event) 
{
    if (this._shouldPreventDefault(event.keyCode))
        event.preventDefault();
	
    if (event.keyCode === 144)    // Numlock
        this.clear();
		
	if (SceneManager._scene instanceof Scene_Name)
	{
		let key = event.key;
		
		if (key.length == 1 && ((key >= "0" && key <= "9") || (key >= "A" && key <= "Z") || (key >= "a" && key <= "z")))
			this._currentState[key] = true;
		
		else if (event.keyCode == 32)
			this._currentState["SpcBtn"] = true;
		
		else if (event.keyCode != 16 && this.keyMapper[event.keyCode])
			this._currentState[this.keyMapper[event.keyCode]] = true;
	}
	else if ((Utils.RPGMAKER_NAME=="MV" && SceneManager._scene._messageWindow && SceneManager._scene._messageWindow._numberWindow.active) ||
			(Utils.RPGMAKER_NAME=="MZ" && SceneManager._scene._numberInputWindow && SceneManager._scene._numberInputWindow.active))
	{
		let key = event.key;
		
		if (key.length == 1 && (key >= "0" && key <= "9"))
			this._currentState[key] = true;
		
		else if (this.keyMapper[event.keyCode])
			this._currentState[this.keyMapper[event.keyCode]] = true;
	}
	else
	{
		var buttonName = this.keyMapper[event.keyCode];
    
		if (Utils.RPGMAKER_NAME=="MV" && ResourceHandler.exists() && buttonName === 'ok')
			ResourceHandler.retry();
		else if (buttonName)
			this._currentState[buttonName] = true;
		else
			this._currentState[event.keyCode] = true;
	}
};

Input._onKeyUp = function(event) 
{
	if (SceneManager._scene instanceof Scene_Name)
	{
		let key = event.key;
		
		if (key.length == 1 && ((key >= "0" && key <= "9") || (key >= "A" && key <= "Z")))
			this._currentState[key] = false;
		
		else if (key >= "a" && key <= "z")
		{
			this._currentState[key] = false;
			this._currentState[key.toUpperCase()] = false;
		}
		
		else if (event.keyCode == 32)
			this._currentState["SpcBtn"] = false;
		
		else if (event.keyCode != 16 && this.keyMapper[event.keyCode])
			this._currentState[this.keyMapper[event.keyCode]] = false;
	}
	else if ((Utils.RPGMAKER_NAME=="MV" && SceneManager._scene._messageWindow && SceneManager._scene._messageWindow._numberWindow.active) ||
			(Utils.RPGMAKER_NAME=="MZ" && SceneManager._scene._numberInputWindow && SceneManager._scene._numberInputWindow.active))
	{
		let key = event.key;
		
		if (key.length == 1 && (key >= "0" && key <= "9"))
			this._currentState[key] = false;
		
		else if (this.keyMapper[event.keyCode])
			this._currentState[this.keyMapper[event.keyCode]] = false;
	}
	else
	{
		var buttonName = this.keyMapper[event.keyCode];

		if (buttonName)
			this._currentState[buttonName] = false;
		else if (event.keyCode)
			this._currentState[event.keyCode] = false;

		if (Utils.RPGMAKER_NAME=="MV" && event.keyCode === 0) // For QtWebEngine on OS X
			this.clear();
	}
};

TUR.KeyEntry.inputInitialize = Window_NameInput.prototype.initialize;
Window_NameInput.prototype.initialize = function(rect) 
{
	TUR.KeyEntry.inputInitialize.call(this, rect);
    this._index = 89;
};

Window_NameInput.prototype.processHandling = function() 
{
    if (this.isOpen() && this.active) 
	{
		if (Input.isRepeated('cancel')) 
            this.processBack();

        else if (Input.isRepeated('ok')) 
            this.processOk();
        
		else
		{
			let key = Object.keys(Input._currentState).find(buttCode => {return (buttCode.length == 1 || buttCode == "SpcBtn") && Input._currentState[buttCode] == true});

			if (key && (key.length == 1 || key == "SpcBtn") && Input.isRepeated(key))
			{
				this.playOkSound();
				this._editWindow.add(key == "SpcBtn" ? " " : key);
			}
		}
    }
};

Window_NumberInput.prototype.processHandling = function() 
{
    if (this.isOpenAndActive()) 
	{
        if (this.isOkEnabled() && this.isOkTriggered()) 
            return this.processOk();

        if (this.isCancelEnabled() && this.isCancelTriggered()) 
            return this.processCancel();

        if (this.isHandled("pagedown") && Input.isTriggered("pagedown")) 
            return this.processPagedown();

        if (this.isHandled("pageup") && Input.isTriggered("pageup")) 
            return this.processPageup();

			let key = Object.keys(Input._currentState).find(buttCode => {return buttCode.length == 1 && Input._currentState[buttCode] == true});

			if (key && key.length == 1 && Input.isRepeated(key))
			{
				const index = this.index();
				const place = Math.pow(10, this._maxDigits - 1 - index);
				let n = Math.floor(this._number / place) % 10;
				this._number -= n * place;
				n = Number(key);
				this._number += n * place;
				this.cursorRight(false);
				this.refresh();
				this.playOkSound();
			}		
    }
};