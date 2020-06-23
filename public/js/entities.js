import { loadPanda } from './entities/Panda.js';

export function loadEntities(audioContext) {
  const entityFactories = {};

  function addAs(name) {
    return factory => entityFactories[name] = factory;
  }

  return Promise.all([
    loadPanda(audioContext).then(addAs('panda')),
  ])
  .then(() => entityFactories);
}
