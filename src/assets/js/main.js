"use strict";

new WOW().init();


$('.scrolldown_posts').click(function(){
    $('html, body').animate({scrollTop:$('#main_content').position().top}, 700);
});







