# CASE

> Markup builder on gulp without jokes

## Installation

```shell
$ git clone --depth 1 https://github.com/TrySound/case.git PROJECT_DIR
$ cd PROJECT_DIR
$ rm -r .git
$ npm i
```

## Usage

Initialize your project with

```shell
$ gulp init
```

You will be asked where you want to contain source files and where they will be copied to.

Then start the server and watch your sources

```shell
$ gulp dev
```

## caseconf.json

**app** *type*: `string`

Source files directory, *default*: `app`

**assets** *type*: `string`

Destination for js, css and img, *default*: `public`

**markup** *type*: `string`, `false`

Destination for markup and directory for server, *default*: `public`

**server** *type*: `boolean`

Enables local server, `markup:false` also disables this feature, *default*: `true`

**port** *type*: `number{2,5}`

Local server port like `localhost:8080`, *default*: `8080`

**open** *type*: `boolean`, `string`

Opens default or specified browser on server start, see [opn](https://github.com/sindresorhus/opn), *default*: `true`


## Commands

```shell
# Creates file structure
$ gulp init

# Creates files if they don't exist, but doesn't add templates. Uses default conf.
$ gulp init-safe

# Starts server
$ gulp server

# Builds public
$ gulp build --min --lint --clean

# Builds public, starts server and watches for changes
$ gulp dev --min --lint --clean

# Partials
$ gulp script --min --lint
$ gulp script:lint
$ gulp style --min --lint
$ gulp style:lint
$ gulp markup
$ gulp sprite
$ gulp image
```

### Flags

- `--min`, `-m` cssnano for style and uglify for script
- `--lint`, `-l` stylelint for style and eslint for script
- `--clean` clears dst directory before build

## Workflow

### Markup

Used [gulp-file-include](https://github.com/coderhaoxin/gulp-file-include) with `//=` prefix

You can include files like

```
<div class="wrapper">
	//= include('modules/module.html')
</div>
```

### Style

Used [postcss](https://github.com/postcss/postcss) modular processor with plugins

- [postcss-import](https://github.com/postcss/postcss-import)
- [postcss-nested](https://github.com/postcss/postcss-nested)
- [postcss-clearfix](https://github.com/seaneking/postcss-clearfix)
- [postcss-pseudo-class-enter](https://github.com/jonathantneal/postcss-pseudo-class-enter)

You can add any other plugin, just `npm install PLUGIN_NAME -D` and require it to processor list of `style` task

```js
postcss([
	require('precss')
])
```

### Script

Used [browserify](https://github.com/substack/node-browserify)

You can add transformations as an options in `script` task

```js
browserify({
	transform: [
		require('stringify')(['.tpl'])
	]
})
```

### Sprite

svg files minifies and compiles to one `img/sprite.svg` with symbols

You can load it with ajax or use [svg4everybody](https://github.com/jonathantneal/svg4everybody) or [svg-sprite-injector](https://github.com/TrySound/svg-sprite-injector)

***

MIT © [Bogdan Chadkin](mailto:trysound@yandex.ru)
