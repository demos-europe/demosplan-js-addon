# demosplan-addon js tooling

> Base dependency for frontend configuration in demosplan-core addons.

`yarn add -D @demos-europe/demosplan-addon`

This repo contains the webpack configuration builder for demosplan-core addons.
It can and should be used when creating addons for demosplan-core that contain
a web user interface.

After installation, only the addon's name and entrypoints have to be defined
in `config.webpack.js`:

```js
const DemosplanAddon = require('@demos-europe/demosplan-addon')
  
module.exports = DemosplanAddon.build(
    'my-addon-name', 
    { 
        'MyAddon': DemosplanAddon.resolve('src/index.js') 
    }
)
```
