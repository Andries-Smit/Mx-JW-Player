/*global module, require, define, console*/

module.exports = function (grunt) {
    'use strict';
    var pkg = grunt.file.readJSON("package.json");

    grunt.initConfig({
        pkgName: pkg.name,
        name: pkg.name,
        watch: {
            autoDeployUpdate: {
                "files": ["./src/**/*"],
                "tasks": ["copy:out", "compress", "copy:deployment", "copy:mpks"],
                options: {
                    debounceDelay: 250,
                    livereload: true
                }
            }
        },
        compress: {
            out: {
                options: {
                    archive: "./dist/" + pkg.version + "/" + pkg.name + ".mpk",
                    mode: "zip"
                },
                files: [{
                    expand: true,
                    date: new Date(),
                    store: false,
                    cwd: "./out",
                    src: ["**/*"]
                }]
            }
        },
        copy: {
            out: {
                files: [
                    {dest: "./out", cwd: "./src/", src: ["**/*"], expand: true}
                ]
            },
            deployment: {
                files: [
                    {dest: "./test/Mx7/deployment/web/Widgets", cwd: "./src/", src: ["**/*"], expand: true},
                    {dest: "./test/MxMainline/deployment/web/Widgets", cwd: "./src/", src: ["**/*"], expand: true}
                ]
            },
            mpks: {
                files: [
                    {dest: "./test/Mx7/Widgets", cwd: "./dist/" + pkg.version, src: [pkg.name + ".mpk"], expand: true},
                    {dest: "./test/MxMainline/Widgets", cwd: "./dist/" + pkg.version, src: [pkg.name + ".mpk"], expand: true}
                ]
            }
        },
        clean: {
            build: [
                "./dist/" + pkg.version + "/*",
                "./test/*/deployment/web/Widgets/" + pkg.name + "/*",
                "./test/*/Widgets/" + pkg.name + ".mpk"
            ],
            out : "./out/**/*"
        },
        uglify: {
            distribute: {
                options: {
                    sourceMap: true,
                    banner: "// " + pkg.name + " V" + pkg.version + " Date : <%= grunt.template.today('isoDateTime') %> \n// Copyright: " + pkg.copyright + "\n// Licence: " + pkg.license + "\n"                    
                },
                files: {
                    "out/<%=pkgName%>/widget/<%=name%>.js": ["src/<%=pkgName%>/widget/<%=name%>.js"]
                }
            }
        },
        xmlmin: {
            dist: {
                options: {
                    //preserveComments: true
                },
                files: {
                    "out/<%=pkgName%>/<%=name%>.xml": "src/<%=pkgName%>/<%=name%>.xml"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-newer");
    grunt.loadNpmTasks('grunt-xmlmin');

    grunt.registerTask(
        "default",
        "Watches for changes and automatically creates an MPK file, as well as copying the changes to your deployment folder",
        ["clean build", "watch"]
    );

    grunt.registerTask(
        "clean build",
        "Compiles all the assets and copies the files to the build directory.",
        ["clean", "copy:out", "copy:deployment", "compress", "copy:mpks"]
    );

    grunt.registerTask(
        "build",
        ["clean build"]
    );

    grunt.registerTask(
        "Distribute",
        "Compiles all the assets and copies the files to the build directory.",
        ["clean", "copy:out", "uglify", "xmlmin", "compress", "copy:mpks"]
    );
};
