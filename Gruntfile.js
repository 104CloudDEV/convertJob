module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // This line makes your node configurations available for use
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'app/**/*.js', 'test/**/*.js'],
      options: {
          node: true,
          curly: false,
          eqnull: true,
          asi: true,
          loopfunc:true
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  //grunt.loadNpmTasks('grunt-npm-install');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['npm-install', 'jshint']);

};