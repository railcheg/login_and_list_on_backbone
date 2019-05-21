module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			concat: {
				files: [

					'public_html/js/services/*',

					'public_html/js/modules/login/*',
					'public_html/js/modules/login/*/*',
					
                    'public_html/js/modules/contractor/*',
                    'public_html/js/modules/contractor/*/*',

                    'public_html/js/modules/registry/*',
                    'public_html/js/modules/registry/*/*',


                    'public_html/js/modules/common/*',
					'public_html/js/modules/common/*/*'

				],
				tasks: "default",
				options: {
					spawn: true
				}
			}
		},
		handlebars: {
			compile2: {
				files: {
					"public_html/js/modules/login/templates/compile/login.js": [
						"public_html/js/modules/login/templates/*.handlebars"
					],
                    "public_html/js/modules/registry/templates/compile/registry.js": [
                        "public_html/js/modules/registry/templates/*.handlebars"
                    ],
					"public_html/js/modules/common/templates/compile/common.js": [
						"public_html/js/modules/common/templates/*.handlebars"
					],
                    "public_html/js/modules/contractor/templates/compile/contractor.js": [
                        "public_html/js/modules/contractor/templates/*.handlebars"
                    ],
					"public_html/js/layouts/main/tpl/compile/main.js": [
						"public_html/js/layouts/main/tpl/*.handlebars"
					]
				},
				options: {
					//amd: 'JST',
					amd: true,
					namespace: "JST",
					//partialsUseNamespace: true,
					processName: function(filePath) {
						var file = filePath.replace(/.*\/([\w-]+)\.handlebars/, '$1');
						return file;
					}
				}

			}
		},
		jshint: {
			options: {
				reporter: require('jshint-stylish'),
				sub: true
			},
			all: [//TODO:: jshint for all
				'public_html/js/services/*'
			]
		}
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jst');

	grunt.registerTask('default', ['handlebars']);


};
