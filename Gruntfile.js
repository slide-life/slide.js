module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['bower_components/sjcl/sjcl.js', 'lib/slide-crypto.js', 'lib/slide.js'],
        dest: 'dist/slide.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat']);
}
