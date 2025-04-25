// A plugin to provide virtual modules for Node.js dependencies
export default function virtualModules() {
  const modules = {
    'virtual:empty-module': `export default {};`
  };

  return {
    name: 'virtual-modules',
    resolveId(id) {
      if (id in modules) {
        return id;
      }
      return null;
    },
    load(id) {
      if (id in modules) {
        return modules[id];
      }
      return null;
    }
  };
} 