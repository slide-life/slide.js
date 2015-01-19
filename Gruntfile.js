module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      build: ['build/'],
      release: ['dist']
    },

    transpile: {
      main: {
        type: 'cjs',
        files: [{
          cwd: 'lib/',
          expand: true,
          dest: 'build/',
          src: '**/*.js'
        }]
      }
    },

    browserify: {
      build: {
        src: 'build/*.js',
        dest: 'build/browser.js'
      }
    },

    exec: {
      "bundle": "( cd bower_components/forge; npm run bundle )"
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['bower_components/forge/js/forge.bundle.js', 'build/browser.js'],
        dest: 'dist/slide.js'
      },
      jquery: {
        src: ['jquery.js', 'dist/slide.js'],
        dest: 'dist/slide.jquery.js'
      }
    },

    jshint: {
      files: ['lib/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['clean', 'transpile', 'browserify', 'exec', 'concat']);
  grunt.registerTask('test', 'jshint');
};
