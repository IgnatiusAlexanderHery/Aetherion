/*:
 * @target MZ
 * @plugindesc [DA_BattleUi] Change Equipment UI to show Hp and Mp too
 * @author Dark Asura
 * @help
 *
 */

Window_EquipStatus.prototype.refresh = function () {
  this.contents.clear();
  if (this._actor) {
    const nameRect = this.itemLineRect(0);
    this.drawActorName(this._actor, nameRect.x + 100, 0, nameRect.width);
    this.drawActorFace(this._actor, nameRect.x, 0, 100);
    this.drawAllParams();
  }
};

Window_EquipStatus.prototype.drawAllParams = function () {
  for (let i = 0; i < 8; i++) {
    const x = this.itemPadding();
    const y = this.paramY(i);
    this.drawItem(x, y - 75, i);
  }
};

Window_EquipStatus.prototype.drawItem = function (x, y, paramId) {
  const paramX = this.paramX();
  const paramWidth = this.paramWidth();
  const rightArrowWidth = this.rightArrowWidth();
  this.drawParamName(x, y, paramId);
  if (this._actor) {
    this.drawCurrentParam(paramX, y, paramId);
  }
  this.drawRightArrow(paramX + paramWidth, y);
  if (this._tempActor) {
    this.drawNewParam(paramX + paramWidth + rightArrowWidth, y, paramId);
  }
};

Window_EquipStatus.prototype.drawActorFace = function (actor, x, y, width, height) {
  this.drawFaceCustom(actor.faceName(), actor.faceIndex(), x, y, width, height);
};

Window_EquipStatus.prototype.drawFaceCustom = function (faceName, faceIndex, x, y, width, height) {
  width = width || ImageManager.faceWidth;
  height = height || ImageManager.faceHeight;
  const bitmap = ImageManager.loadFace(faceName);

  bitmap.addLoadListener(() => {
    const pw = ImageManager.faceWidth;
    const ph = ImageManager.faceHeight;
    const scaleX = width / pw;
    const scaleY = height / ph;
    const scale = Math.min(scaleX, scaleY);
    const sw = Math.floor(pw * scale);
    const sh = Math.floor(ph * scale);
    const sx = (faceIndex % 4) * pw;
    const sy = Math.floor(faceIndex / 4) * ph;
    const dx = Math.floor(x + (width - sw) / 2);
    const dy = Math.floor(y + (height - sh) / 2);
    this.contents.blt(bitmap, sx, sy, pw, ph, dx, dy, sw, sh);
  });
};
