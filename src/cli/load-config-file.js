import { existsSync, readFileSync } from 'fs';
import { extname, resolve } from 'path';
import { pathToFileURL } from 'url';

/**
 * Load a JSON or JavaScript config file. A JavaScript file must export the config as its default export.
 *
 * @param {String} filePath Path to the config file
 * @return {Promise<Object>}
 */
export const loadConfigFile = async (filePath) => {
  const absolutePath = resolve(filePath);

  if(!existsSync(absolutePath)) {
    throw new Error(`Could not find the config file: ${filePath}`);
  }

  if(extname(absolutePath).toLowerCase() === '.json') {
    return JSON.parse(readFileSync(absolutePath, 'utf8'));
  }

  const loadedModule = await import(/* webpackIgnore: true */ pathToFileURL(absolutePath).href);

  return loadedModule.default || loadedModule;
};
