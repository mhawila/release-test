'use strict';

module.exports = function(grunt) {
  
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  
  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      files: ['test/**/*_test.js'],
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'nodeunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'nodeunit']
      },
    },
    release: {
        options: {
          npm: false,
          indentation: '\t', 
          tagMessage: 'Tagging version <%= version %>', //default: 'Version <%= version %>',
          beforeBump: [], // optional grunt tasks to run before file versions are bumped
          afterBump: [], // optional grunt tasks to run after file versions are bumped
          beforeRelease: [], // optional grunt tasks to run after release version is bumped up but before release is packaged
          afterRelease: [], // optional grunt tasks to run after release is packaged
          updateVars: [], // optional grunt config objects to update (this will update/set the version property on the object specified)
        }
  }
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit']);

};
