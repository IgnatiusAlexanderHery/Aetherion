/*:
 * @target MZ
 * @plugindesc [DA_SummonersSystem] Summons actor in front of skill user
 * @author Dark Asura
 *
 * @help
 * Use Note Tag in skill to summon actor:
 *
 * <Summon>
 * Actor Id : X
 * <Summon>
 *
 * Use Note Tag in actor to remove actor after battle:
 *
 * <summon>
 *
 * X is ID actor will be call.
 *
 * - The first summon appears in front of the caster.
 * - The next summon appears next to the previous summon.
 * - If the party is full, the limit automatically increases for summons to enter.
 * - Summons are removed after battle & limits return to normal.
 * - Summons can be summon one time only because the summons are actor up to 10 actor, cannot same actor
 * - Include Plugin Command Change Max Battler Member from 1 up to 8
 *
 * @param MaxBattlerMember
 * @text MaxBattlerMember
 * @type select
 * @option 1
 * @option 2
 * @option 3
 * @option 4
 * @option 5
 * @option 6
 * @option 7
 * @option 8
 * @default 4
 * @desc Set limit for MaxBattlerMember.
 *
 * @command SetMaxBattler
 * @text MaxBattlerMember
 * @desc Set limit for MaxBattler, Do not use on Troop Event, Summon skill will broken. Use it before Battle Processing for changing the MaxBattler
 *
 * @arg maxMembers
 * @number
 * @desc 1 - 8
 *
 */

var DA = DA || {};

const parametersSummoners = PluginManager.parameters("DA_SummonersSystem");
DA.defaultMaxMembers = Number(parametersSummoners["MaxBattlerMember"]);
DA.currentMaxMembers = DA.defaultMaxMembers;
DA.casterIndex = null;
DA.summonCount = 0;

PluginManager.registerCommand("DA_SummonersSystem", "SetMaxBattler", (args) => {
  let newMax = Number(args.maxMembers);
  if (isNaN(newMax) || newMax < 1 || newMax > 8) {
    console.warn("Invalid MaxBattlerMember value. It must be between 1 and 8.");
    return;
  }

  DA.currentMaxMembers = newMax;
});

Game_Party.prototype.maxBattleMembers = function () {
  return DA.currentMaxMembers;
};

DA.getSummonActorIdFromSkill = function (skillId) {
  let skill = $dataSkills[skillId];
  if (!skill || !skill.note) return null;

  let match = skill.note.match(/<Summon>[^]*?Actor Id\s*:\s*(\d+)[^]*?<Summon>/i);
  return match ? Number(match[1]) : null;
};

DA.Game_Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function (target) {
  DA.Game_Action_apply.call(this, target);

  let actorId = DA.getSummonActorIdFromSkill(this.item().id);
  if (actorId) {
    DA.summonActor(actorId, this.subject());
  }
};

DA.ActorExist = function (skillId) {
  let summonedActorId = DA.getSummonActorIdFromSkill(skillId);

  if (DA.summonCount > 10) return false;
  for (let battler of $gameTroop.members().concat($gameParty.members())) {
    if (battler.actorId && battler.actorId() === summonedActorId) {
      return false;
    }
  }
  return true;
};

DA.Game_BattlerBase = Game_BattlerBase.prototype.meetsSkillConditions;
Game_BattlerBase.prototype.meetsSkillConditions = function (skill) {
  return DA.Game_BattlerBase.call(this, skill) && DA.ActorExist.call(this, skill.id);
};

DA.Spriteset_Battle = Spriteset_Battle.prototype.updateActors;

Spriteset_Battle.prototype.updateActors = function () {
  DA.Spriteset_Battle.call(this);
  if (this._actorSprites.length < DA.currentMaxMembers) {
    const members = $gameParty.allMembers();
    const sprite = new Sprite_Actor();
    this._actorSprites.push(sprite);
    this._battleField.addChild(sprite);
    $gameParty.swapOrder(DA.currentMaxMembers - 1, $gameParty.allMembers().length - 1);
    this._actorSprites[DA.currentMaxMembers - 1].setBattler(members[$gameParty.allMembers().length - 1]);
  }
};

DA.summonActor = function (actorId, caster) {
  if (!$gameParty.inBattle()) return;

  let actor = $gameActors.actor(actorId);
  if (!actor || $gameParty.battleMembers().includes(actor)) return;

  if ($gameParty.battleMembers().length >= DA.currentMaxMembers) {
    DA.currentMaxMembers++;
  }

  let casterIndex = $gameParty.battleMembers().indexOf(caster);
  DA.casterIndex = casterIndex;
  $gameActors.actor(actorId).setup(actorId);
  $gameActors.actor(actorId).changeLevel(caster.level, false);
  $gameParty.addActor(actorId);
  actor.initTpbChargeTime();
  actor.clearTpbChargeTime();
};

DA.BattleManager_endBattle = BattleManager.endBattle;
BattleManager.endBattle = function (result) {
  DA.BattleManager_endBattle.call(this, result);

  let summonedActors = $gameParty.members().filter((actor) => actor && actor.actor().meta.summon);
  summonedActors.forEach((actor) => {
    $gameParty.removeActor(actor.actorId());
  });

  DA.currentMaxMembers = DA.defaultMaxMembers;
  DA.summonCount = 0;
};

DA.Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
Sprite_Actor.prototype.setActorHome = function (index) {
  DA.Sprite_Actor_setActorHome.call(this, index);
  if (DA.casterIndex !== null && DA.casterIndex !== undefined) {
    let summonIndex = DA.summonCount;

    let actorTarget = $gameParty.battleMembers()[summonIndex];

    if (actorTarget && $gameParty.members()[index].actor().meta.summon) {
      let baseX;
      if (DA.summonCount > 5) {
        baseX = 650;
      }
      baseX = 450;
      let baseY = 280 + summonIndex * 48 - 40;

      this.setHome(baseX, baseY);
      DA.summonCount++;

      return;
    }
  }

  if (DA.defaultMaxMembers >= 4 && index >= 4) {
    this.setHome(750, 280 + (index - 4) * 48 - 40);
  } else {
    this.setHome(550, 280 + index * 48 - 40);
  }
};

PluginManager.registerCommand("DA_SummonersSystem", "SetMaxBattler", (args) => {
  let newMax = Number(args.maxMembers);
  if (isNaN(newMax) || newMax < 1 || newMax > 8) {
    return;
  }

  DA.currentMaxMembers = newMax;
});
