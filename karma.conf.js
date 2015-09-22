module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'public/bower_components/angular/angular.js',
      'public/bower_components/angular-route/angular-route.js',
      'public/bower_components/angular-mocks/angular-mocks.js',
	  'public/bower_components/angular-resource/angular-resource.js',
      'public/app/*.js',
      'public/app/**/*.js',
	  'public/app/components/**/*.js',
	  
	  // fixtures
	  {
		pattern: 'test_data/*.json', watched: true, served: true, included: false
	  }
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
