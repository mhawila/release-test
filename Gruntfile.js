'use strict';

module.exports = function(grunt) {
  
  function _splitVersionNumber(version) {
      var parts = version.split('.');
      return {
          array: parts,
          major: parts[0],
          minor: parts[1],
          patch: parts[2]
      };
  }
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
      var npmProps = grunt.file.readJSON('package.json');
      var versionParts = _splitVersionNumber(npmProps.version);
      
      var branch = versionParts.major + '.' + versionParts.minor + '.x';
      
      //Create the maintenance branch.      
      console.log('Creating maintenance branch => ', branch);
      
      //Make native calls 
      var exec = require('sync-exec');
  
      var ret = exec('git branch ' + branch);
      console.log(ret.stdout, ret.stderr);
      
      if(ret.status === 0) {
          console.log('Setting ', branch, ' to track upstream/', branch);
          ret = exec('git branch --set-upstream-to=origin/' + branch + ' ' + branch);
          console.log(ret.stdout, ret.stderr);
      }
      
      console.log(exec('git status').stdout);
  });
  
  grunt.registerTask('snapshot', function(target) {
      //Here we update the master to snapshot version.
      var npmProps = grunt.config.readJSON('package.json');
      
      var vParts = _splitVersionNumber(npmProps.version);
      var minor = vParts.minor;
      var patch = 0;
      if(target === 'minor') {
          minor += 1;
      } else {  //Patch version is to be upgraded
          patch = vParts.patch += 1;
      }
      var snapshotVersion = vParts.major + '.' + minor + '.' + patch + '-SNAPSHOT';
      
      npmProps.version = snapshotVersion;
      grunt.config.writeJSON('package.json');
  });
  
  
  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit']);

};
