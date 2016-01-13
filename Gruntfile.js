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
    
    jsonprettify: {
        options: {
          space: '\t'
        },
 
        tools: { src: ['package.json', 'bower.json'] }
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
    },
    
    gitcommit: {
        snapshot: {
            options: {
                message: 'Committing version change to SNAPSHOT version',
                noVerify: false,
                noStatus: false
            },
            files: {
                src: ['package.json']
            }
        }
    },
    
    gitpush: {
        snapshot: {
            options: {
                remote: 'origin'
            }
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
      var npmProps = grunt.file.readJSON('package.json');
      
      var vParts = _splitVersionNumber(npmProps.version);
      var minor = Number(vParts.minor);
      var patch = 0;
      if(target === 'minor') {
          minor++;
      } else {  //Patch version is to be upgraded
          if(!isNaN(vParts.patch)) {
              patch++;
          } else {
              // Try to get the initial part.
              var i=0;
              var num = '';
              while(i < vParts.patch.length) {
                  if(isNaN(vParts.patch[i])){
                      break;
                  }
                  num = num.concat(vParts.patch[i]);
                  i++;
              }
              patch = num.length>0 ? Number(num)+1 : 0;
          }
      }
      var snapshotVersion = vParts.major + '.' + minor + '.' + patch + '-SNAPSHOT';
      
      //Store it in config params for commit message
      grunt.config('snapshot.version', snapshotVersion);
      
      npmProps.version = snapshotVersion;
      grunt.file.write('package.json', JSON.stringify(npmProps));
      grunt.task.run(['jsonprettify']);
      
      //Commit the changes & push to remote
      grunt.task.run(['gitcommit:snapshot', 'gitpush:snapshot']);
  });
  
  grunt.registerTask('release-prepare', function(target) {
      // release
      if(target) {
          grunt.task.run('release:target');
      } else {
          grunt.task.run('release');
      }
      
      // build
    //   grunt.task.run('build');
      
      // Create maintenance branch if minor or major 
      if(target === 'major' || target === 'minor') {
          grunt.task.run('maintenance-branch');
      }
      
      // Update versions to snapshot.
      if(target === 'major' || target === 'minor') { //Both update minor version
          grunt.task.run('snapshot:minor');
      } else {
          grunt.task.run('snapshot');
      } 
  });
  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit']);

};
