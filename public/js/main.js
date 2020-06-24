import Level from './Level.js';
import Timer from './Timer.js';
import { createLevelLoader } from './loaders/level.js';
import { loadFont } from './loaders/font.js';
import { loadEntities } from './entities.js';
import { makePlayer, createPlayerEnv, findPlayers } from './player.js';
import { setupKeyboard } from './input.js';
import { createCameraLayer } from './layers/camera.js';
import { createCollisionLayer } from './layers/collision.js';
import { createDashboardLayer } from './layers/dashboard.js';
import { createPlayerProgressLayer } from './layers/player-progress.js';
import { createColorLayer } from './layers/color.js';
import { createTextLayer } from './layers/text.js';
import SceneRunner from './SceneRunner.js';
import TimedScene from './TimedScene.js';
import Scene from './Scene.js';

async function main(canvas) {
  const videoContext = canvas.getContext('2d');
  const audioContext = new AudioContext();

  const [entityFactory, font] = await Promise.all([
    loadEntities(audioContext),
    loadFont()
  ]);

  const loadLevel = await createLevelLoader(entityFactory);

  const sceneRunner = new SceneRunner();
  const panda = entityFactory.panda();
  makePlayer(panda, "PANDA");

  const inputRouter = setupKeyboard(window);
  inputRouter.addReceiver(panda);

  async function runLevel(name) {
    const level = await loadLevel(name);

    const loadScreen = new Scene();
    loadScreen.comp.layers.push(createColorLayer('#000'));
    loadScreen.comp.layers.push(createTextLayer(font, `Loading ${name}`));
    sceneRunner.addScene(loadScreen);
    sceneRunner.runNext();

    level.events.listen(Level.EVENT_TRIGGER, (spec, trigger, touches) => {
      if (spec.type === 'goto') {
        for (const _ of findPlayers(touches)) {
          runLevel(spec.name);
          return;
        }
      }
    });

    const playerProgressLayer = createPlayerProgressLayer(font, level); 
    const dashboardLayer = createDashboardLayer(font, level);

    panda.pos.set(96, 120);
    level.entities.add(panda);

    const playerEnv = createPlayerEnv(panda);
    level.entities.add(playerEnv);

    const waitScreen = new TimedScene();
    waitScreen.comp.layers.push(createColorLayer('#000'));
    waitScreen.comp.layers.push(dashboardLayer);
    waitScreen.comp.layers.push(playerProgressLayer);
    sceneRunner.addScene(waitScreen);

    // show collision outlines
    level.comp.layers.push(createCollisionLayer(level));
    level.comp.layers.push(dashboardLayer)
    sceneRunner.addScene(level);

    sceneRunner.runNext();
  }

  const gameContext = {
    audioContext,
    videoContext,
    entityFactory,
    deltaTime: null
  }

  const timer = new Timer(1/60);
  timer.update = function update(deltaTime) {
    gameContext.deltaTime = deltaTime;
    sceneRunner.update(gameContext);
  }

  timer.start();

  runLevel('5th');
};

const canvas = document.getElementById('screen');
const start = () => {
  main(canvas);
  window.removeEventListener('click', start);
}
window.addEventListener('click', start);
