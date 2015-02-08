module.exports = function (grunt) {
  grunt.initConfig({
    browserify: {
      build: {
        src: 'lib/*.js',
        dest: 'build/browser.js'
      }
    },

    exec: {
      bundle: 'cd bower_components/forge; npm run bundle'
    },

    concat: {
      options: {
        separator: ';'
      },

      dist: {
        src: ['bower_components/forge/js/forge.bundle.js', 'build/browser.js'],
        dest: 'dist/slide.js'
      }
    },

    jshint: {
      files: ['lib/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    watch: {
      jshint: {
        files: ['lib/**/*.js'],
        tasks: ['jshint']
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'logs/tests.log'
        },
        src: 'tests/*.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('environment', function () {
    if (!process.env.TARGET || process.env.TARGET === 'node') {
      global.env = {};
      global.env.TARGET = 'node';
      global.env.HOST = 'localhost:9292';
    } else if (process.env.TARGET === 'browser') {
      window.env = {};
      window.env.TARGET = 'browser';
      window.env.HOST = 'localhost:9292';
    } else {
      throw new Error('Invalid target');
    }
  });
  grunt.registerTask('default', ['environment', 'browserify', 'exec', 'concat']);
  grunt.registerTask('test', ['environment', 'mochaTest']);
};
