/*:
 * @target MZ
 * @plugindesc [DA_RecoverSystem] Adjust Hp, Mp when increase by level up, change class and equipment
 * @author Dark Asura
 *
 * @help
 *
 */

var DA = DA || {};

DA.LevelUp = Game_Actor.prototype.levelUp;
DA.changeClass = Game_Actor.prototype.changeClass;
DA.OnItemOk = Scene_Equip.prototype.onItemOk;
DA.CommandOptimize = Scene_Equip.prototype.commandOptimize;
DA.CommandClear = Scene_Equip.prototype.commandClear;

Game_Actor.prototype.levelUp = function () {
  let hpPercentage = this.hpRate();
  let mpPercentage = this.mpRate();
  DA.LevelUp.call(this);
  this._hp = Math.floor(this.mhp * hpPercentage);
  this._mp = Math.floor(this.mmp * mpPercentage);
};

Game_Actor.prototype.changeClass = function (classId, keepExp) {
  let hpPercentage = this.hpRate();
  let mpPercentage = this.mpRate();
  DA.changeClass.call(this, classId, keepExp);
  this._hp = Math.floor(this.mhp * hpPercentage);
  this._mp = Math.floor(this.mmp * mpPercentage);
};

Scene_Equip.prototype.onItemOk = function () {
  let oldItem = this._slotWindow.item();
  let newItem = this._itemWindow.item();

  if (oldItem) {
    this.actor()._hp = Math.max(1, this.actor()._hp - oldItem.params[0]);
    this.actor()._mp = Math.max(0, this.actor()._mp - oldItem.params[1]);
  }

  DA.OnItemOk.call(this);

  if (newItem) {
    this.actor()._hp = Math.max(1, this.actor()._hp + newItem.params[0]);
    this.actor()._mp = Math.max(0, this.actor()._mp + newItem.params[1]);
  }

  this._statusWindow.refresh();
};

Scene_Equip.prototype.commandOptimize = function () {
  let MHP = this.actor().mhp;
  let MMP = this.actor().mmp;
  let hp = this.actor()._hp;
  let mp = this.actor()._mp;

  DA.CommandOptimize.call(this);

  if (this.actor().isAlive()) {
    this.actor()._hp = Math.max(1, hp + (this.actor().mhp - MHP));
  }
  this.actor()._mp = Math.max(0, mp + (this.actor().mmp - MMP));
};

Scene_Equip.prototype.commandClear = function () {
  let MHP = this.actor().mhp;
  let MMP = this.actor().mmp;
  let hp = this.actor()._hp;
  let mp = this.actor()._mp;

  DA.CommandClear.call(this);

  this.actor()._hp = Math.max(1, hp + (this.actor().mhp - MHP));
  this.actor()._mp = Math.max(0, mp - (MMP - this.actor().mmp));
};
