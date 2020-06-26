import Entity from './Entity.js';
import Player from './traits/Player.js';

export function makePlayer(entity, name) {
  const player = new Player();
  player.name = name;
  entity.addTrait(player);
}

export function* findPlayers(entities) {
  for (const entity of entities) {
    if (entity.traits.has(Player)) {
      yield entity;
    }
  }
}
