var name = '',
    dob = '',
    email = '',
    MRN = 0,
    touchstart = 0,
    touchend = 0;

// on document ready
$(document).ready(function(){    
    listenTouch();
    setupQuestions();
    animateScreens();
});

function listenTouch() {

    $(document).bind('mousedown touchstart', function(){
        touchend = 0;
        touchstart = 0;
        touchstart = new Date().getTime();
    });

    $(document).bind('mouseup touchend', function(){
        elapsed = new Date().getTime() - touchstart;
        touchend(elapsed);        
    }); 
}

function setupQuestions() {
    var exercise = $('#exercise');
    var questions = '';

    $.get('./data/questions.xml',function(data){
        $(data).find('question').each(function(){
            var index = $(this).index() + 1;
            var label = $(this).find('label').text();
            var options = '';
            var choices  = $(this).find('choice');

            choices.each(function(){
                var text = $(this).text();
                options += '<a class="answerBox-option"><table><tr><td>' + text + '</td></tr></table></a>';
            });

            questions += '<div id="question' + index + '" class="question-set';
            
            // if this is the first question
            // make it visible and active
            if(index === 1) {
                questions += ' visible js-active';
            }
            questions += '"><a class="question"><div class="arrow"></div>' + label + '</a><div class="answer"><div class="arrow"></div><span class="userAnswer">...</span></div><div class="answer-options-container">' + options + '</div></div>';

        });
        questions += '<div id="sendButton" class="question-set"><a class="nextScreen">Submit your survey!</a></div>';
        exercise.append(questions);

        listenNextScreen();
        listenNextQuestion();
        listenClickQuestion();
        listenAnswerBox();
    });
}

function listenNextScreen() {
    $(document).on('touchstart click', '.nextScreen', function(e){
        var activeScreen = $('.screen.js-active');
        e.preventDefault();

        if(activeScreen.attr('id') === 'userInformation') {
            updateUserInformation(activeScreen);
            showAnswerBox('.question-set.js-active');
        }

        animateScreens();
    });
}

function animateScreens(target) {
    var activeScreen = $('.screen.js-active');

    if(activeScreen.length < 1) {
        var nextScreen = $('#home');
    }
    else {
        if(target) {
            var nextScreen = $('#'+target); 
        }
        else {
            var nextScreen = activeScreen.next(); 
        }

        activeScreen.removeClass('js-active').slideUp();
    }
    nextScreen.addClass('js-active').slideDown();
}

function updateUserInformation() {
    var firstName = $('#name-first').val();
    var lastName = $('#name-last').val();

    name = firstName + ' ' + lastName;
    dob = $('#dob').val();
    email = $('#email').val();
    MRN = $('#medicalRecordNumber').val();

    $('#profile-name').text(name);
    $('#profile-dob').text(dob);
    $('#profile-email').text(email);
    $('#profile-MRN').text(MRN);
    
    $('#colRight').addClass('js-userProfile');
    scrollQuestion('question1', 'question1');
}

function listenClickQuestion() {
    $(document).on('touchstart click', '.question-set', function(){
        var parent = $(this);
        var currentElement = $('.question-set.js-active');
        var cid = currentElement.attr('id');

        if(! parent.hasClass('js-active')) {
            var id = parent.attr('id');
            // if user clicked on userProfile
            // go back a screen
            if(id === "userProfile") {
                var currentQuestionId = $('.question-set.js-active').attr('id');
                hideAnswerBox(currentQuestionId);
                animateScreens('userInformation');
            }
            else {
                $('.question-set.js-active').removeClass('js-active');
                parent.addClass('js-active');
                scrollQuestion(cid, id);
            }
        }
    });
}

function listenNextQuestion() {
    $('.updateQuestion').click(function(e){

        e.preventDefault();
        var currentElement = $('.question-set.js-active');
        var cid = currentElement.attr('id');
        var direction = $(this).text();
        var nextElement = (direction === 'Next')?  currentElement.next() : currentElement.prev();
        var lastVisibleElement = $('.question.visible:last');
        var lastQuestion = $('.question:last');
        var sendButton = $('#sendButton');        

        // if trying to focus on userProfile
        // go back a screen
        if(nextElement.attr('id') === "userProfile") {
            animateScreens('userInformation');
            hideAnswerBox('#' + id);
        }
        else {
            // remove js-active from the current element
            currentElement.removeClass('js-active');

            var id= nextElement.attr('id');

            $('#'+id).addClass('visible js-active');
            setTimeout(function(){
                scrollQuestion(cid, id);
            }, 150);
        }
    });
}

function hideAnswerBox(currentElement){
    var answerBox = $('#answerBox');

    $('#answerBox-options-container').html('').fadeOut();
    answerBox.animate({
        'bottom' : '-600px'
    });
}

function showAnswerBox(newCurrentElement) {
    if( $('#sendButton.js-active').length < 1) {
        newCurrentElement = $(newCurrentElement);
        var newId = newCurrentElement.attr('id');
        var options = newCurrentElement.find('.answer-options-container').html();
        var answerBox = $('#answerBox');
        var answerBoxOptions = $('#answerBox-options-container');
    
        $('body').attr('class', '');
        $('body').addClass(newId);

        // populate the question's answer options in answerBoxOptions
        answerBox.animate({
            'bottom' : 0
        }, function() {
            answerBoxOptions.html(options).fadeIn();
        }); 
    }
}

function scrollQuestion(cid, id) {
    var exercise = $('#exercise');
    var offsetTop = $('#'+id).offset().top;

    hideAnswerBox('#' + cid);

    if(id !== 'sendButton') {
        showAnswerBox('#' + id);
    }
    else {
        $('body').attr('class', 'sendButton');
    }

    exercise.animate({
        scrollTop : offsetTop
    }, 'slow');
}

function listenAnswerBox() {
    $(document).on('touchstart click', '.answerBox-option', function(){
        var answerBox = $('#answerBox-options-container');
        var activeQuestionSet = $(document).find('.question-set.js-active');
        var activeQuestionAnswer = activeQuestionSet.find('.userAnswer');
        var userAnswerText = $(this).text();

        // toggle js-active class for the current active class and the clicked answer
        answerBox.find('.js-active').toggleClass('js-active');
        $(this).toggleClass('js-active');

        // update answer text
        activeQuestionAnswer.text(userAnswerText);
        
       // mark question as js-answered
        activeQuestionSet.addClass('js-answered');
    });
}