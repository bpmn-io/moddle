module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'lib',
      tests: 'test',
      dist: 'build',
      samples: 'example'
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        jshintrc: true
      }
    },

    jasmine_node: {
      specNameMatcher: '.*Spec',
      projectRoot: 'test',
      jUnit: {
        report: true,
        savePath : 'tmp/reports/jasmine',
        useDotNotation: true,
        consolidate: true
      }
    },
    watch: {
      test: {
        files: [ '<%= config.sources %>/**/*.js', '<%= config.tests %>/**/*.js'],
        tasks: [ 'jasmine_node']
      }
    },
    jsdoc: {
      dist: {
        src: [ '<%= config.sources %>/**/*.js' ],
        options: {
          destination: 'docs/api',
          plugins: [ 'plugins/markdown' ]
        }
      }
    }
  });

  // tasks
  
  grunt.registerTask('test', [ 'jasmine_node' ]);
  grunt.registerTask('auto-test', [ 'jasmine_node', 'watch:test' ]);

  grunt.registerTask('default', [ 'jshint', 'test', 'jsdoc' ]);
};