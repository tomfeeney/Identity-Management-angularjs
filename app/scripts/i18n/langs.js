'use strict';

angular.module('IdMClientApp')
.config(function($injector, $windowProvider, $translateProvider) {
  
  var locale = URI.parseQuery(URI($windowProvider.$get().location.hash.substr(1)).query()).locale || 'en-US';
  
  $translateProvider
    .translations('en', $injector.get('langs_en'))
    .translations('en-US', $injector.get('langs_en'))
    .translations('en-UK', $injector.get('langs_en'))
    .translations('zh', $injector.get('langs_zh'))
    .translations('zh-CN', $injector.get('langs_zh'))
    .preferredLanguage(locale)
    .fallbackLanguage('en-US');
  
//  $.ajax({
//    type: "GET",
//    url: "/locale",
//    async: false  // must call this api synchronously, otherwise the angular-translate will always use fallbackLangauge. 
//  }).done(function(locale) {
//    $translateProvider
//    .translations('en', $injector.get('langs_en'))
//    .translations('en-US', $injector.get('langs_en'))
//    .translations('en-UK', $injector.get('langs_en'))
//    .translations('zh', $injector.get('langs_zh'))
//    .translations('zh-CN', $injector.get('langs_zh'))
//    .preferredLanguage(locale)
//    .fallbackLanguage('en');
//  });
  
  // doesn't work, don't know why
//  $translateProvider
//    .translations('en', $injector.get('langs_en'))
//    .translations('zh', $injector.get('langs_zh'))
//    .registerAvailableLanguageKeys([ 'en', 'zh' ], {
//      'en_US': 'en',
//      'en_UK': 'en',
//      'zh_CN': 'zh'
//    })
//    .determinePreferredLanguage();    // seems doesn't work properly
//    .fallbackLanguage('en');
  
});