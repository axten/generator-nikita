'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

var NikitaGenerator = yeoman.generators.Base.extend({

	initializing: function ()
	{
		this.pkg = require('../package.json');
	},
	
	prompting: function ()
	{
		var that = this;
		
		var done = this.async();
		
		// Have Yeoman greet the user.
		this.log(yosay(
			'Welcome to the Nikita Project Generator!'
		));
		
		var promptInput = function (name, question, defaultValue)
		{
			return {
				type: 'input',
				name: name,
				message: question,
				default: that.config.get(name, defaultValue)
			};
		};
		
		var promptConfirm = function (name, question, defaultValue)
		{
			return {
				type: 'confirm',
				name: name,
				message: question,
				default: that.config.get(name, defaultValue)
			};
		};
		
		var promptCheckbox = function(name, question, choices, defaultChoices)
		{
			return {
				type: 'checkbox',
				name: name,
				message: question,
				choices: choices,
				default: that.config.get(name, defaultChoices || choices)
			};
		};
		
		var prompts = [
			promptInput('name', 'Your project name', this.appname),
			promptConfirm('private', 'Is this project private?', true),
			promptCheckbox('features', 'Which features do you want to use?', [
				{
					name: 'Self hosted webfonts, a fonts-folder will be added to your project',
					value: 'webfonts'
				}, {
					name: 'Browser Reset Styles, a _reset.scss will be added to your project',
					value: 'browserReset'
				}, {
					name: 'Use background SVG files as base64 encoded dataURIs with placeholder extends (grunt-grunticon + grunt-string-replace + svg-background-mixin)',
					value: 'svgBackgrounds'
				}, {
					name: 'Split your main CSS-file into several small ones to support IE9 and lower (grunt-csssplit)',
					value: 'cssSplit'
				}, {
					name: 'Create a CSS Styleguide (grunt-styleguide)',
					value: 'cssStyleGuide'
				}, {
					name: 'Create a JS Documentation (grunt-jsdoc)',
					value: 'jsDoc'
				}, {
					name: 'Measure Pagespeed (grunt-pagespeed)',
					value: 'measurePagespeed'
				}, {
					name: 'Measure Frontend-Performance (grunt-phantomas)',
					value: 'measurePerformance'
				}, {
					name: 'Take screenshots to diff your changes (grunt-photobox)',
					value: 'takeScreenshots'
				}
			]),
			promptCheckbox('nikitaCssMixins', 'Which nikita.css mixins do you want to use?', [
				{
					name: 'Centering: Horizontally and/or vertically centering elements with the translate-method (IE9+)',
					value: 'centering'
				}, {
					name: 'Fixed-Ratiobox: Use intrinsic ratio to force child elements like images, videos or frames to fluidly scale at a given ratio',
					value: 'fixed-ratiobox'
				}, {
					name: 'Font-Smoothing: Turn font-smoothing on/off for a better font-rendering on OS X',
					value: 'font-smoothing'
				}, {
					name: 'Layering: A function for managing z-index layers within a Sass map',
					value: 'layering'
				}, {
					name: 'PX-to-REM: Convert pixel values to rem values',
					value: 'px-to-rem'
				}, {
					name: 'Respond-To: Easy managing your media queries',
					value: 'respond-to'
				}, {
					name: 'Triangle: Easy generating arrow-like triangles with the border-method',
					value: 'triangle'
				}
			]),
			promptCheckbox('nikitaCssExtends', 'Which nikita.css extends do you want to use?', [
				{
					name: 'a11y: Hide elements in sake of accessibility',
					value: 'a11y'
				}, {
					name: 'cf: Micro clearfix',
					value: 'cf'
				}, {
					name: 'ellipsis: Ellipsis to point out text',
					value: 'ellipsis'
				}, {
					name: 'hide-text: Hide text on elements in sake of accessibility',
					value: 'hide-text'
				}, {
					name: 'ib: Use the inline-block method as an alternative to float elements',
					value: 'ib'
				}
			]),
			promptConfirm('formFramework', 'Do you want to use the nikita form framework?', true)
		];
		
		this.prompt(prompts, function (props)
		{
			for (var key in props)
			{
				if (props.hasOwnProperty(key))
				{
					that.config.set(key, props[key]);
				}
			}
			
			if (!that.config.get('svgBackgrounds') && that.config.get('formFramework'))
			{
				console.info('You need the SVG backgrounds feature to enable the nikita form framework. Activating this option now.');
				that.config.set('svgBackgrounds', true);
			}
			
			var hasExtend = function (extend) {
				return that.config.get('nikitaCssExtends') && that.config.get('nikitaCssExtends').indexOf(extend) !== -1 ? true : false;
			}
			
			if ((!hasExtend('a11y') || !hasExtend('cf') || !hasExtend('ellipsis')) && that.config.get('formFramework'))
			{
				console.info('You need the nikita.css mixins to enable the nikita form framework. Activating this option now.');
				that.config.set('nikitaCssExtends', ['a11y', 'cf', 'ellipsis', 'hide-text', 'ib']);
			}
			
			var hasMixin = function (mixin) {
				return that.config.get('nikitaCssMixins') && that.config.get('nikitaCssMixins').indexOf(mixin) !== -1 ? true : false;
			}
			
			if ((!hasMixin('px-to-rem') || !hasMixin('respond-to')) && that.config.get('formFramework'))
			{
				console.info('You need the nikita.css mixins to enable the nikita form framework. Activating this option now.');
				that.config.set('nikitaCssMixins', ['centering', 'fixed-ratiobox', 'font-smoothing', 'layering', 'px-to-rem', 'respond-to', 'triangle']);
			}
			
			done();
		});
	},
	
	writing: {
		app: function ()
		{
			var packageJsonData = this.src.readJSON('_package.json');
			var bowerJsonData = this.src.readJSON('_bower.json');
			
			packageJsonData['name'] = this.config.get('name');
			bowerJsonData['name'] = this.config.get('name');
			
			packageJsonData['private'] = this.config.get('private');
			
			// Standard Files & Folders
			this.template('.gitignore.ejs', '.gitignore');
			this.template('.scss-lint.yml.ejs', '.scss-lint.yml');
			this.template('Gemfile.ejs', 'Gemfile');
			this.template('Gruntfile.js.ejs', 'Gruntfile.js');
			this.template('NIKITA-LICENSE.md.ejs', 'NIKITA-LICENSE.md');
			this.template('README.md.ejs', 'README.md');
			this.template('setup-dev-env.sh.ejs', 'setup-dev-env.sh');
			
			// Basic Project Folders
			this.dest.mkdir('source/img');
			this.dest.mkdir('source/img/bgs'); // svg-background-extend
			this.dest.mkdir('source/img/icons'); // svgstore-task
			this.dest.mkdir('source/sass/mixins');
			this.directory('source/img/appicons', 'source/img/appicons');
			
			// SASS Basic Files
			this.template('source/sass/styles.scss.ejs', 'source/sass/styles.scss');
			this.template('source/sass/universal.scss.ejs', 'source/sass/universal.scss');
			this.template('source/sass/_basics.scss.ejs', 'source/sass/_basics.scss');
			
			// SASS Extra Files
			this.template('source/sass/blocks/_rwd-testing.scss.ejs', 'source/sass/blocks/_rwd-testing.scss');
			this.template('source/sass/extends/ui-components/_buttons.scss.ejs', 'source/sass/extends/ui-components/_buttons.scss');
			
			// SASS Variables
			this.template('source/sass/variables/_color.scss.ejs', 'source/sass/variables/_color.scss');
			this.template('source/sass/variables/_timing.scss.ejs', 'source/sass/variables/_timing.scss');
			this.template('source/sass/variables/_typography.scss.ejs', 'source/sass/variables/_typography.scss');
			
			// Assemble Files
			this.template('source/assemble/pages/index.hbs.ejs', 'source/assemble/pages/index.hbs');
			this.template('source/assemble/pages/rwd-testing.hbs.ejs', 'source/assemble/pages/rwd-testing.hbs');
			this.template('source/assemble/layouts/lyt-default.hbs.ejs', 'source/assemble/layouts/lyt-default.hbs');
			
			// Assemble Folders
			this.directory('source/assemble/data', 'source/assemble/data');
			this.directory('source/assemble/helpers', 'source/assemble/helpers');
			
			// Image README Files
			this.template('source/img/bgs/README.md.ejs', 'source/img/bgs/README.md');
			this.template('source/img/dev/README.md.ejs', 'source/img/dev/README.md');
			this.template('source/img/icons/README.md.ejs', 'source/img/icons/README.md');
			this.template('source/img/temp/README.md.ejs', 'source/img/temp/README.md');
			
			// Optional Browser Reset SASS-Partial
			if (this.config.get('browserReset'))
			{
				this.template('source/sass/_reset.scss.ejs', 'source/sass/_reset.scss');
			}
			
			// Optional Webfonts folder and SASS-Partial
			if (this.config.get('features').indexOf('webfonts') != -1)
			{
				this.directory('source/fonts', 'source/fonts');
				this.template('source/sass/_webfonts.scss.ejs', 'source/sass/_webfonts.scss');
			}
			
			// Optional Layering-Mixin
			if (this.config.get('nikitaCssMixins').indexOf('layering') != -1)
			{
				this.template('source/sass/variables/_z-layers.scss.ejs', 'source/sass/variables/_z-layers.scss');
			}
			
			// Optional Respond-To-Mixin
			if (this.config.get('nikitaCssMixins').indexOf('respond-to') != -1)
			{
				this.template('source/sass/variables/_breakpoints.scss.ejs', 'source/sass/variables/_breakpoints.scss');
			}
			
			// Optional SVG Backgrounds
			if (this.config.get('svgBackgrounds'))
			{
				this.template('source/sass/grunticon/.gitignore.ejs', 'source/sass/grunticon/.gitignore');
				this.template('source/sass/svg-bg-extends/.gitignore.ejs', 'source/sass/svg-bg-extends/.gitignore');
				this.template('source/sass/mixins/_svg-background.scss.ejs', 'source/sass/mixins/_svg-background.scss');
			}
			else
			{
				delete packageJsonData['devDependencies']['grunt-grunticon'];
				delete packageJsonData['devDependencies']['grunt-string-replace'];
			}
			
			// Optional Form Framework
			if (this.config.get('formFramework'))
			{
				this.template('source/assemble/pages/forms.hbs.ejs', 'source/assemble/pages/forms.hbs');
				this.template('source/sass/blocks/_forms.scss.ejs', 'source/sass/blocks/_forms.scss');
				this.src.copy('source/img/bgs/form-select-arrow-down.svg', 'source/img/bgs/form-select-arrow-down.svg');
			}
			
			// Optional CSS Splitting for IE9 and lower
			if (this.config.get('features').indexOf('cssSplit') == -1)
			{
				delete packageJsonData['devDependencies']['grunt-csssplit'];
			}
			
			// Optional CSS Styleguide
			if (this.config.get('features').indexOf('cssStyleGuide') == -1)
			{
				delete packageJsonData['devDependencies']['grunt-styleguide'];
			}
			else
			{
				this.template('source/sass/blocks/styleguide.md.ejs', 'source/sass/blocks/styleguide.md');
				this.directory('source/styleguide-template', 'source/styleguide-template');
			}
			
			// Optional JS Documentation
			if (this.config.get('features').indexOf('jsDoc') == -1)
			{
				delete packageJsonData['devDependencies']['grunt-jsdoc'];
			}
			
			// Optional Pagespeed Measuring
			if (this.config.get('features').indexOf('measurePagespeed') == -1)
			{
				delete packageJsonData['devDependencies']['grunt-pagespeed'];
			}
			
			// Optional Performance Measuring
			if (this.config.get('features').indexOf('measurePerformance') == -1)
			{
				delete packageJsonData['devDependencies']['grunt-phantomas'];
			}
			
			// Optional Screenshots Diffing
			if (this.config.get('features').indexOf('takeScreenshots') == -1)
			{
				delete packageJsonData['devDependencies']['grunt-photobox'];
			}
			
			this.dest.write('package.json', JSON.stringify(packageJsonData, null, 4));
			this.dest.write('bower.json', JSON.stringify(bowerJsonData, null, 4));
		},
		
		projectfiles: function ()
		{
		}
	},
	
	end: function ()
	{
		this.installDependencies();
	}
});

module.exports = NikitaGenerator;
