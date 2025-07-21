/*:
 * @target MZ
 * @plugindesc [DA_HpMpBar] Show HP bar in top of enemy and enemy state on left of HP bar, Change HP UI Both Enemy and Actors, A UI inspired from Sword Art Online Design.
 * @author Dark Asura
 * @help
 * Use HEX Color only in HP / MP Color #XXXXXX
 * Font on Actor is decresing value
 * Font on Enemy is constant
 *
 * NoteTags Enemy HP Bar
 * Example
 * <HPBar>
 * Y : 10
 * X : 20
 * IconY : 10
 * IconX : 10
 * Boss : 3
 * <HPBar>
 *
 * Explaination
 * Y is for the Bar position (Up and Down)
 * X is for the Bar position (Left and Right)
 * IconY is for the Bar position (Up and Down)
 * IconX is for the Bar position (Left and Right)
 * Boss for chance the bar to multiple bar for ex 3, this will give enemy have 3 bar on top of it
 *
 * @param Enemy
 *
 * @param EnemyHPBarFontSize
 * @parent Enemy
 * @text Enemy HP Bar Font Size
 * @type number
 * @default 8
 * @desc Font size of the Enemy HP text on the bar.
 *
 *
 * @param EnemyMirror
 * @parent Enemy
 * @text Enemy HP Bar Mirror and Icon
 * @type boolean
 * @default false
 * @desc Some plugin, will mirror the enemy sprite, this will redo when true. Example : AkeaAnimatedBattleSystem
 *
 * @param ForceEnemyIcon
 * @parent Enemy
 * @text ForceEnemyIcon
 * @type boolean
 * @default false
 * @desc Some condition make the location of icon missing, when true it will force the value from EnemyIconY
 *
 * @param EnemyIconY
 * @parent Enemy
 * @text EnemyIconY
 * @type number
 * @default -105
 * @max 1000
 * @min -1000
 * @desc Customize Enemy icon height.
 *
 *
 *
 * @param Actor
 *
 * @param ActorHPBarFontSize
 * @parent Actor
 * @text Actor HP Bar Font Size
 * @type number
 * @default 18
 * @max 20
 * @min -10
 * @desc Font size of the Actor HP text on the bar ( Main Font - ActorHPBarFontSize ).
 *
 * @param ActorMPBarFontSize
 * @parent Actor
 * @text Actor MP Bar Font Size
 * @type number
 * @default 18
 * @max 20
 * @min -10
 * @desc Font size of the Actor MP text on the bar ( Main Font - ActorMPBarFontSize ).
 *
 * @param HighHPColor1
 * @text High HP Color 1
 * @type string
 * @default #94c94f
 * @desc Gradient start color for high HP.
 *
 * @param HighHPColor2
 * @text High HP Color 2
 * @type string
 * @default #71af1b
 * @desc Gradient end color for high HP.
 *
 * @param MidHPColor1
 * @text Mid HP Color 1
 * @type string
 * @default #e6c84a
 * @desc Gradient start color for mid HP.
 *
 * @param MidHPColor2
 * @text Mid HP Color 2
 * @type string
 * @default #c9a732
 * @desc Gradient end color for mid HP.
 *
 * @param LowHPColor1
 * @text Low HP Color 1
 * @type string
 * @default #d9534f
 * @desc Gradient start color for low HP.
 *
 * @param LowHPColor2
 * @text Low HP Color 2
 * @type string
 * @default #b52b27
 * @desc Gradient end color for low HP.
 *
 * @param MPColor1
 * @parent Actor
 * @text MP Color 1
 * @type string
 * @default 	#0000ff
 * @desc Gradient Start color for MP.
 *
 * @param MPColor2
 * @parent Actor
 * @text MP Color 2
 * @type string
 * @default 	#000c66
 * @desc Gradient end color for MP.
 *
 * @param TimeColor1
 * @parent Actor
 * @text Time Color 1
 * @type string
 * @default 	#62bfff
 * @desc Gradient Start color for Time.
 *
 * @param TimeColor2
 * @parent Actor
 * @text Time Color 2
 * @type string
 * @default 	#95d4ff
 * @desc Gradient end color for Time.
 *
 * @param BackgroundColor
 * @parent Actor
 * @text Background Color
 * @type string
 * @default 	#636363
 * @desc Background bar color.
 *
 */
var DA = DA || {};

const parametersHpMpBar = PluginManager.parameters("DA_HpMpBar");
const ENEMY_FONT_SIZE = Number(parametersHpMpBar["EnemyHPBarFontSize"]);
const ENEMY_MIRROR = parametersHpMpBar["EnemyMirror"];
const ACTOR_HP_FONT_SIZE = Number(parametersHpMpBar["ActorHPBarFontSize"]);
const ACTOR_MP_FONT_SIZE = Number(parametersHpMpBar["ActorMPBarFontSize"]);
const HIGH_HP_COLOR1 = parametersHpMpBar["HighHPColor1"];
const HIGH_HP_COLOR2 = parametersHpMpBar["HighHPColor2"];
const MID_HP_COLOR1 = parametersHpMpBar["MidHPColor1"];
const MID_HP_COLOR2 = parametersHpMpBar["MidHPColor2"];
const LOW_HP_COLOR1 = parametersHpMpBar["LowHPColor1"];
const LOW_HP_COLOR2 = parametersHpMpBar["LowHPColor2"];
const MP_COLOR1 = parametersHpMpBar["MPColor1"];
const MP_COLOR2 = parametersHpMpBar["MPColor2"];
const TIME_COLOR1 = parametersHpMpBar["TimeColor1"];
const TIME_COLOR2 = parametersHpMpBar["TimeColor2"];
const BACKGROUND_COLOR = parametersHpMpBar["BackgroundColor"];
const ENEMY_ICON_Y = parametersHpMpBar["EnemyIconY"];
const FORCE_ENEMY_ICON = parametersHpMpBar["ForceEnemyIcon"];

// Enemy HP
DA.Sprite_Enemy_initialize = Sprite_Enemy.prototype.initialize;
Sprite_Enemy.prototype.initialize = function (battler) {
  DA.Sprite_Enemy_initialize.call(this, battler);
  this.createHpBar();
};

Sprite_Enemy.prototype.createHpBar = function () {
  let boss = DA.getBossFromDataEnemiesEnemyId(this._battler._enemyId);
  let heightBar = 30 * boss;
  this._hpBar = new Sprite(new Bitmap(100, heightBar));
  if (ENEMY_MIRROR === "true") {
    this._hpBar.scale.x *= -1;
  }
  this._hpBar.bitmap.fontSize = ENEMY_FONT_SIZE;
  this.addChild(this._hpBar);
  this.updateHpBar();
};

DA.getXFromDataEnemiesEnemyId = function (Id) {
  let dataEnemies = $dataEnemies[Id];
  if (!dataEnemies || !dataEnemies.note) return 0;

  let match = dataEnemies.note.match(/<HPBar>[^]*?X\s*:\s*(-?\d+)[^]*?<HPBar>/i);
  return match ? Number(match[1]) : 0;
};
DA.getYFromDataEnemiesEnemyId = function (Id) {
  let dataEnemies = $dataEnemies[Id];
  if (!dataEnemies || !dataEnemies.note) return 0;

  let match = dataEnemies.note.match(/<HPBar>[^]*?Y\s*:\s*(-?\d+)[^]*?<HPBar>/i);
  return match ? Number(match[1]) : 0;
};
DA.getBossFromDataEnemiesEnemyId = function (Id) {
  let dataEnemies = $dataEnemies[Id];
  if (!dataEnemies || !dataEnemies.note) return 1;

  let match = dataEnemies.note.match(/<HPBar>[^]*?Boss\s*:\s*(\d+)[^]*?<HPBar>/i);
  return match ? (Number(match[1]) > 1 ? Number(match[1]) : 1) : 1;
};

Sprite_Enemy.prototype.updateHpBar = function () {
  if (!this._battler) return;
  const width = 100;
  const height = 10;
  let x = DA.getXFromDataEnemiesEnemyId(this._battler._enemyId);
  let y = DA.getYFromDataEnemiesEnemyId(this._battler._enemyId);
  let boss = DA.getBossFromDataEnemiesEnemyId(this._battler._enemyId);

  let hpPerBar = this._battler.mhp / boss;
  let remainingHp = this._battler.hp;

  let color1, color2;

  this._hpBar.bitmap.clear();

  for (let i = boss; i > 0; i--) {
    let offsetY = i * (height + 2);
    let hpRate = Math.max(0, Math.min(remainingHp / hpPerBar, 1));
    if (hpRate > 0.5) {
      color1 = HIGH_HP_COLOR1;
      color2 = HIGH_HP_COLOR2;
    } else if (hpRate > 0.3) {
      color1 = MID_HP_COLOR1;
      color2 = MID_HP_COLOR2;
    } else {
      color1 = LOW_HP_COLOR1;
      color2 = LOW_HP_COLOR2;
    }

    this._hpBar.bitmap.fillRect(0, offsetY, width, height / 2, "#444");
    this._hpBar.bitmap.fillRect(0, offsetY + height / 2, width / 2, height / 2, "#444");

    this._hpBar.bitmap.gradientFillRect(0, offsetY, width * hpRate, height / 2, color1, color2);
    this._hpBar.bitmap.gradientFillRect(0, offsetY + height / 2, (width / 2) * Math.min(hpRate * 2, 1), height / 2, color1, color2);

    remainingHp -= hpPerBar;
  }

  const text = `${this._battler.hp} / ${this._battler.mhp}`;
  let textOffsetY = boss * (height + 2);
  this._hpBar.bitmap.drawText(text, 0, textOffsetY + height - 2, width, 4, "right");

  this._hpBar.x = -width / 2 + x;
  this._hpBar.y = -this.height - 20 + y;
};

DA.getIconXFromDataEnemiesEnemyId = function (Id) {
  let dataEnemies = $dataEnemies[Id];
  if (!dataEnemies || !dataEnemies.note) return 0;

  let match = dataEnemies.note.match(/<HPBar>[^]*?IconX\s*:\s*(-?\d+)[^]*?<HPBar>/i);
  return match ? Number(match[1]) : 0;
};
DA.getIconYFromDataEnemiesEnemyId = function (Id) {
  let dataEnemies = $dataEnemies[Id];
  if (!dataEnemies || !dataEnemies.note) return 0;

  let match = dataEnemies.note.match(/<HPBar>[^]*?IconY\s*:\s*(-?\d+)[^]*?<HPBar>/i);
  return match ? Number(match[1]) : 0;
};

Sprite_Enemy.prototype.updateStateSprite = function () {
  this._stateIconSprite.y = -Math.round(this.bitmap.height) + 2;
  this._stateIconSprite.x = 70;
  this._stateIconSprite.scale.x = 0.5;
  this._stateIconSprite.scale.y = 0.5;
  if (ENEMY_MIRROR === "true") {
    this._stateIconSprite.scale.x *= -1;
    this._stateIconSprite.x *= -1;
  }
  if (Number.isNaN(this._stateIconSprite.y) || FORCE_ENEMY_ICON === "true") {
    this._stateIconSprite.y = ENEMY_ICON_Y;
  }
  let x = DA.getIconXFromDataEnemiesEnemyId(this._battler._enemyId);
  let y = DA.getIconYFromDataEnemiesEnemyId(this._battler._enemyId);
  this.placeStateIcon(this._battler, this._stateIconSprite.x + x, this._stateIconSprite.y - y);
};

Sprite_Enemy.prototype.placeStateIcon = function (actor, x, y) {
  const sprite = this._stateIconSprite;
  sprite.setup(actor);
  sprite.move(x, y);
  sprite.show();
};

DA.Sprite_Enemy_update = Sprite_Enemy.prototype.update;
Sprite_Enemy.prototype.update = function () {
  DA.Sprite_Enemy_update.call(this);
  this.updateHpBar();
};

Sprite_Gauge.prototype.drawGaugeRect = function (x, y, width, height) {
  const rate = this.gaugeRate();
  const fillW = Math.floor((width - 2) * rate);
  const fillH = height - 2;
  const color0 = this.gaugeBackColor();
  const color1 = this.gaugeColor1(rate);
  const color2 = this.gaugeColor2(rate);
  if (this._statusType === "hp") {
    this.bitmap.fillRect(x, y / 2, width, height, color0);
    this.bitmap.fillRect(x, y + height / 2, width / 2, height / 2, color0);

    this.bitmap.gradientFillRect(x, y / 2, width * rate, height, color1, color2);
    this.bitmap.gradientFillRect(x, y + height / 2, (width / 2) * Math.min(rate * 2, 1), height / 2, color1, color2);
  } else if (this._statusType === "mp") {
    this.bitmap.fillRect(x, y / 2, width, height, color0);
    this.bitmap.fillRect(x, y + height / 2, width / 2, height / 2, color0);

    this.bitmap.gradientFillRect(x, y / 2, width * rate, height, color1, color2);
    this.bitmap.gradientFillRect(x, y + height / 2, (width / 2) * Math.min(rate * 2, 1), height / 2, color1, color2);
  } else if (!$plugins.some((p) => p.name === "DA_BattleUI" && p.status) && !this._statusType === "time") {
    this.bitmap.fillRect(x, y, width, height, color0);
    this.bitmap.gradientFillRect(x + 1, y + 1, fillW, fillH, color1, color2);
  }
};

Sprite_Gauge.prototype.drawValue = function () {
  const currentValue = this.currentValue();
  const width = this.bitmapWidth();
  const height = this.textHeight();
  this.setupValueFont();
  this.bitmap.fontSize = $gameSystem.mainFontSize();
  if (this._statusType === "hp") {
    this.bitmap.fontSize = $gameSystem.mainFontSize() - ACTOR_HP_FONT_SIZE;
    this.bitmap.drawText(currentValue + "/" + this._battler.mhp, 0, 10, width, height, "right");
  } else if (this._statusType === "mp") {
    this.bitmap.fontSize = $gameSystem.mainFontSize() - ACTOR_MP_FONT_SIZE;
    this.bitmap.drawText(currentValue + "/" + this._battler.mmp, 0, 10, width, height, "right");
  } else {
    this.bitmap.drawText(currentValue, 0, 10, width, height, "right");
  }
};

Sprite_Gauge.prototype.gaugeColor1 = function (rate) {
  if (rate > 0.5) {
    colorhp = HIGH_HP_COLOR2;
  } else if (rate > 0.3) {
    colorhp = MID_HP_COLOR2;
  } else {
    colorhp = LOW_HP_COLOR2;
  }
  switch (this._statusType) {
    case "hp":
      return colorhp;
    case "mp":
      return MP_COLOR2;
    case "tp":
      return ColorManager.tpGaugeColor1();
    case "time":
      return TIME_COLOR2;
    default:
      return ColorManager.normalColor();
  }
};

Sprite_Gauge.prototype.gaugeColor2 = function (rate) {
  if (rate > 0.5) {
    colorhp = HIGH_HP_COLOR1;
  } else if (rate > 0.3) {
    colorhp = MID_HP_COLOR1;
  } else {
    colorhp = LOW_HP_COLOR1;
  }
  switch (this._statusType) {
    case "hp":
      return colorhp;
    case "mp":
      return MP_COLOR1;
    case "tp":
      return ColorManager.tpGaugeColor2();
    case "time":
      return TIME_COLOR1;
    default:
      return ColorManager.normalColor();
  }
};

Sprite_Gauge.prototype.gaugeBackColor = function () {
  return BACKGROUND_COLOR;
};
