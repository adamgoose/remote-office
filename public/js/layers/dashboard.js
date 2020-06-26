import { findPlayers } from '../player.js';
import Player from '../traits/Player.js';

function getPlayerTrait(level) {
  for (const entity of findPlayers(level.entities)) {
    return entity.traits.get(Player);
  }
}

export function createDashboardLayer(font, level) {
  const LINE1 = font.size;
  const LINE2 = font.size * 2;

  return function drawDashboard(context) {
    const playerTrait = getPlayerTrait(level);

    font.print(playerTrait.name, context, 16, LINE1);
    font.print(playerTrait.score.toString().padStart(6, '0'), context, 16, LINE2);

    // font.print('@x' + playerTrait.coins.toString().padStart(2, '0'), context, 96, LINE2);

    font.print('FLOOR', context, 266, LINE1);
    font.print(level.name, context, 282, LINE2);
  }
}
