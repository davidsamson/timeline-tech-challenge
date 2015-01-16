module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jasmine: {
            timeline: {
                src    : 'timelineplayer.js',
                options: {
                    specs: 'timelinetest.js',
                    vendor: [
                        "http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"
                    ]                }
            }
        }
    });

    // jasmine for testing
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    // Default task(s).
    grunt.registerTask('test', ['jasmine']);

};