/*:
 * @target MZ
 * @plugindesc [DA_BattleUi] Change Battle UI to horizontal Face | Status | Name | HP | MP | TP, with time on the background
 * @author Dark Asura
 * @help
 * Change Battle UI, just turn on the plugin
 * to change color use DA_MpHpBar.js
 * Put DA_HpMpBar top of DA_BattleUI for timegauge to show
 *
 */

var DA = DA || {};

DA.Sprite_Gauge = Sprite_Gauge.prototype.drawGaugeRect;
DA.Sprite_Gauge.TimeWidth = 0;
DA.Sprite_Gauge.TimeHeight = 0;

Sprite_Gauge.prototype.drawGaugeRect = function (x, y, width, height) {
  DA.Sprite_Gauge.call(this, x, y, width, height);

  if (this._statusType === "time") {
    if (DA.Sprite_Gauge.TimeWidth != 0) {
      width = DA.Sprite_Gauge.TimeWidth;
    }
    if (DA.Sprite_Gauge.TimeHeight != 0) {
      height = DA.Sprite_Gauge.TimeHeight * 2;
    }
    const rate = this.gaugeRate();
    const color0 = "#808080";
    const color1 = this.gaugeColor1(rate);
    const color2 = this.gaugeColor2(rate);
    const fillW = Math.floor((width - 2) * rate);
    const fillH = height - 2;
    this.bitmap = new Bitmap(width, height);
    this.bitmap.fillRect(x, y, width, height / 2, color0);
    this.bitmap.gradientFillRect(x + 1, y + 1, fillW, fillH / 2, color1, color2);
  }
};

Sprite_Gauge.prototype.createBitmap = function () {
  const width = this.bitmapWidth();
  const height = this.bitmapHeight();
  this.bitmap = new Bitmap(width, height);
};

Window_BattleStatus.prototype.maxCols = function () {
  return 1;
};

Window_BattleStatus.prototype.itemHeight = function () {
  return this.innerHeight / 4;
};

Window_BattleStatus.prototype.drawItemStatus = function (index) {
  const actor = this.actor(index);
  const rect = this.itemRectWithPadding(index);
  const faceWidth = 72;
  const gaugeWidth = 125;
  const spacing = 15;
  const faceX = rect.x;
  const faceY = rect.y;
  const nameX = faceX + faceWidth + spacing;
  const nameY = faceY + 10;
  const hpGaugeX = nameX + 150;
  const hpGaugeY = faceY + 10;
  const mpGaugeX = hpGaugeX + gaugeWidth + spacing;
  const mpGaugeY = hpGaugeY;
  const tpGaugeX = mpGaugeX + gaugeWidth + spacing;
  const tpGaugeY = hpGaugeY;
  const StateX = nameX - 20;
  const StateY = nameY + 15;
  const TimeX = nameX;
  const TimeY = rect.y - 11;
  DA.Sprite_Gauge.TimeWidth = rect.width - nameX + 20;
  DA.Sprite_Gauge.TimeHeight = rect.height;
  this.placeTimeGauge(actor, TimeX, TimeY);
  this.placeActorName(actor, nameX, nameY);
  this.placeGauge(actor, "hp", hpGaugeX, hpGaugeY);
  this.placeGauge(actor, "mp", mpGaugeX, mpGaugeY);
  if ($dataSystem.optDisplayTp) {
    this.placeGauge(actor, "tp", tpGaugeX, tpGaugeY);
  }
  this.placeStateIcon(actor, StateX, StateY);
};

Window_StatusBase.prototype.placeTimeGauge = function (actor, x, y) {
  if (BattleManager.isTpb()) {
    this.placeGauge(actor, "time", x, y);
  }
};

Window_BattleStatus.prototype.drawItemImage = function (index) {
  const actor = this.actor(index);
  const rect = this.faceRect(index);
  this.drawActorFace(actor, rect.x, rect.y, 50, 50);
};

Window_BattleStatus.prototype.drawFaceCustom = function (faceName, faceIndex, x, y, width, height) {
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

Window_BattleStatus.prototype.drawActorFace = function (actor, x, y, width, height) {
  this.drawFaceCustom(actor.faceName(), actor.faceIndex(), x, y, width, height);
};
