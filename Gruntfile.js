'use strict';

module.exports = function(grunt) {
  var npmProps = grunt.file.readJSON('package.json');
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
    
    gitcheckout: {
        maintenance: {
            options: {
                branch: grunt.config('maintenance.branch'),
                create: true
            }
        }
    },
    
    release: {
        options: {
          npm: false,
          indentation: '\t', 
          tagMessage: 'Tagging version <%= version %>', //default: 'Version <%= version %>',
          beforeRelease: [], // optional grunt tasks to run after release version is bumped up but before release is packaged
          afterRelease: [], // optional grunt tasks to run after release is packaged
          updateVars: [], // optional grunt config objects to update (this will update/set the version property on the object specified)
        }
  }
  });

  grunt.registerTask('maintenance-branch', function() {
      var version = npmProps.version;
      //Get up to minor version.
      var last = version.indexOf('.',version.indexOf('.')+1);
      var branch = version.substring(0, last+1).concat('x');
      
      //Create the maintenance branch.      
      console.log('Creating maintenance branch => ', branch);
      
      //Make native calls 
      var exec = require('sync-exec');
  
      var ret = exec('git branch ' + branch);
      console.log(ret.stdout, ret.stderr);
      
      if(ret.status === 0) {
          ret = exec('git push --set-upstream origin ' + branch);
          console.log(ret.stdout, ret.stderr);
      }
      
      console.log(exec('git status').stdout);
  });
  
  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit']);

};
