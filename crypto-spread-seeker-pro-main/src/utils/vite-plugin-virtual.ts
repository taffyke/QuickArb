// A plugin to provide virtual modules for Node.js dependencies
import type { Plugin } from 'vite';

export default function virtualModules(): Plugin {
  const modules: Record<string, string> = {
    'virtual:empty-module': `export default {};`
  };

  return {
    name: 'virtual-modules',
    resolveId(id: string) {
      if (id in modules) {
        return id;
      }
      return null;
    },
    load(id: string) {
      if (id in modules) {
        return modules[id];
      }
      return null;
    }
  };
} 