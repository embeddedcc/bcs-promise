/*
	# Gruntfile
	
	Code quality, build, and mangle tools.
	
	Updated for grunt 0.4.x.
*/

module.exports = function (grunt) {

// Project configuration.
grunt.initConfig({
	// package
	pkg: grunt.file.readJSON('package.json'),
	/*
	lint/jshint automatic code quality checking
	*/
	jshint: {
		all: [
			'bcs.js'
		],
		options: {
			camelcase: true,
			eqeqeq: true,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			sub: true,
			undef: true,
			unused: true,
			// relax
			boss: true,
			smarttabs: true,
			strict: false,
			// environment
			browser: true,
			devel: true,
			esversion: 6,
			globals: {
			}
		}
	},
	/*
	minify builds js for distribution
	*/
	uglify: {
		options: {
			banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
			mangle: false
		},
		index: {
			files: {
				'site/dist/bcs.js': ['bcs.js']
			}
		}
	},
	watch: {
		files: [
			'bcs.js'
		],
		tasks: 'default'
	},
	
	// See https://github.com/thanpolas/grunt-github-pages for pre-requisites
	githubPages: {
		target: {
			options: {
				// The default commit message for the gh-pages branch
				commitMessage: 'push'
			},
			// The folder where your gh-pages repo is
			src: 'site',
			dest: '_site'
		}
	},
	
	jsdoc: {
		dist: {
			src: [ 'bcs.js', 'README.md' ],
			options: {
				destination: 'site',
				template: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
				configure: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json'
			}
		}
	}
});

// Load helpers
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-uglify-es');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-github-pages');
grunt.loadNpmTasks('grunt-jsdoc');
grunt.loadNpmTasks('grunt-mocha');

// Tasks (command line)
grunt.registerTask('default', ['jshint', 'jsdoc']);
grunt.registerTask('dist', ['jshint', 'uglify']);
// create an alias for the githubPages task
grunt.registerTask('gh-pages', ['jshint', 'uglify', 'githubPages:target']);
};
