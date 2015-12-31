# CASE

> Markup builder on gulp without jokes

## Why?

- Cause it's just simple. You have to change only `gulpfile.js` to control your build process.
- You don't need to change more. It works out of the box.
- Own sequencer let you process tasks in correct order even with errors.
- Watcher continue works with thrown errors. And you still have the ability to use CI for testing.
- You have the ability to customize source and destination directories any time. Just edit `caseconf.json`.

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

### caseconf.json

#### app

Type: `string`
Default: `app`

Source files directory.

#### assets

Type: `string`
Default: `public`

Destination for js, css and img.

#### markup

Type: `boolean`, `string`
Default: `true`

Destination for markup and directory for server. If `true` then will be used assets path.

#### server

Type: `boolean`
Default: `true`

Enables local server, `markup:false` also disables this feature.

#### port

Type: `number{2,5}`
Default: `8080`

Local server port like `localhost:8080`.


### Commands

```shell
# Creates file structure
$ gulp init

# Creates files if they don't exist, but doesn't add templates. Uses default conf.
$ gulp init-safe

# Starts server
$ gulp server --open

# Builds public
$ gulp build --min --lint --clean

# Builds public, starts server and watches for changes
$ gulp dev --min --lint --clean --open

# Partials
$ gulp script --min --lint
$ gulp script:lint
$ gulp style --min --lint
$ gulp style:lint
$ gulp markup
$ gulp image
```

#### Flags

- `--min`, `-m` cssnano for style and uglify for script
- `--lint`, `-l` stylelint for style and eslint for script
- `--open`, `-o` open site in browser. Works only with enabled server. See [opn](https://github.com/sindresorhus/opn)
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
- [postcss-inline-svg](https://github.com/TrySound/postcss-inline-svg)
- [postcss-clearfix](https://github.com/seaneking/postcss-clearfix)
- [postcss-pseudo-class-enter](https://github.com/jonathantneal/postcss-pseudo-class-enter)

You can add any other plugin, just `npm install PLUGIN_NAME -D` and require it to processor list of `style` task

```js
postcss([
	require('precss')
])
```

### Script

Used [rollup](https://github.com/rollup/rollup) es2015-modules bundler with plugins

- [rollup-plugin-uglify](https://github.com/TrySound/rollup-plugin-uglify)

***

MIT © [Bogdan Chadkin](mailto:trysound@yandex.ru)
