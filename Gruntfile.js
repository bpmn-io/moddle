'use strict';

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

    release: {
      options: {
        tagName: 'v<%= version %>',
        commitMessage: 'chore(project): release v<%= version %>',
        tagMessage: 'chore(project): tag v<%= version %>'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: [
            './test/expect.js'
          ]
        },
        src: ['test/**/*.js']
      }
    },

    watch: {
      test: {
        files: [ '<%= config.sources %>/**/*.js', '<%= config.tests %>/**/*.js'],
        tasks: [ 'test' ]
      }
    }

  });

  // tasks

  grunt.registerTask('test', [ 'mochaTest' ]);
  grunt.registerTask('auto-test', [ 'test', 'watch:test' ]);

  grunt.registerTask('default', [ 'jshint', 'test' ]);
};