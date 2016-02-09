/*global module, require, define, console*/
// Generated on 2015-11-20 using generator-mendix 1.0.0 :: http://github.com/[object Object]

var path = require('path'),
    mendixApp = require('node-mendix-modeler-path'),
    base64 = require('node-base64-image'),
    fs = require('fs'),
    xml2js = require('xml2js'),
    parser = new xml2js.Parser(),
    builder = new xml2js.Builder(),
    shelljs = require('shelljs');

// In case you seem to have trouble starting Mendix through `grunt start-mendix`, you might have to set the path to the Mendix application.
// If it works, leave MODELER_PATH at null
var MODELER_PATH = null;
var MODELER_ARGS = '/file:{path}';

// In case you have a different path to the test project (currently in ./test/Test.mpr) point TEST_PATH to the Test-project (full path). Otherwise, leave at null
var TEST_PATH = null;
// Use this example if you want to point it to a different subfolder and specific Test project Name:
// var TEST_PATH = path.join(shelljs.pwd(), './<custom folder>/<Custom Test Project Name>.mpr');

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
                    {dest: "./test/Mx5.14.1/deployment/web/Widgets", cwd: "./src/", src: ["**/*"], expand: true},
                    {dest: "./test/Mx5.21/deployment/web/Widgets", cwd: "./src/", src: ["**/*"], expand: true},
                    {dest: "./test/MxMainline/deployment/web/Widgets", cwd: "./src/", src: ["**/*"], expand: true}
                ]
            },
            mpks: {
                files: [
                    {dest: "./test/Mx5.14.1/Widgets", cwd: "./dist/" + pkg.version, src: [pkg.name + ".mpk"], expand: true},
                    {dest: "./test/Mx5.21/Widgets", cwd: "./dist/" + pkg.version, src: [pkg.name + ".mpk"], expand: true},
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

    grunt.registerTask("start-mendix", function () {
        var done = this.async(),
            testProjectPath = TEST_PATH !== null ? TEST_PATH : path.join(shelljs.pwd(), '/test/Test.mpr');

        if (MODELER_PATH !== null || (mendixApp.err === null && mendixApp.output !== null && mendixApp.output.cmd && mendixApp.output.arg)) {
            grunt.util.spawn({
                cmd: MODELER_PATH || mendixApp.output.cmd,
                args: [
                    (MODELER_PATH !== null ? MODELER_ARGS : mendixApp.output.arg).replace('{path}', testProjectPath)
                ]
            }, function () {
                done();
            });
        } else {
            console.error('Cannot start Modeler, see error:');
            console.log(mendixApp.err);
            done();
        }
    });

    grunt.registerTask("generate-icon", function () {
        var iconPath = path.join(shelljs.pwd(), '/icon.png'),
            widgetXml = path.join(shelljs.pwd(), '/src/', pkg.name, '/', pkg.name + '.xml'),
            options = {localFile: true, string: true},
            done = this.async();

        grunt.log.writeln('Processing icon');

        if (!grunt.file.exists(iconPath) || !grunt.file.exists(widgetXml)) {
            grunt.log.error("can't generate icon");
            return done();
        }

        base64.base64encoder(iconPath, options, function (err, image) {
            if (!err) {
                var xmlOld = grunt.file.read(widgetXml);
                parser.parseString(xmlOld, function (err, result) {
                    if (!err) {
                        if (result && result.widget && result.widget.icon) {
                            result.widget.icon[0] = image;
                        }
                        var xmlString = builder.buildObject(result);
                        grunt.file.write(widgetXml, xmlString);
                        done();
                    }
                });
            }
        });
    });

    grunt.registerTask(
        "default",
        "Watches for changes and automatically creates an MPK file, as well as copying the changes to your deployment folder",
        ["watch"]
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