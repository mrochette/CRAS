var name = '',
    dob = '',
    email = '',
    MRN = 0;

// on document ready
$(document).ready(function(){    
    setupQuestions();
    animateScreens();
    listenNextScreen();
    listenNextQuestion();
    listenClickQuestion();
    listenAnswerBox();
    
});

function setupQuestions() {
    var exercise = $('#exercise');
    var questions = '';

    $.get('./js/questions.xml',function(data){
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
    });
}

function listenNextScreen() {
    $('.nextScreen').click(function(e){
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

    // if this moving to the surveySubmitted page
    // add the class submitted after a few seconds to the screen
    if($(this).parent('#sendButton')) {
        setTimeout(function(){
            $('#surveySubmitted').addClass('submitted');
        }, 10000);
    }
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
    scrollQuestion('question1');
}

function listenClickQuestion() {
    $(document).on('click', '.question-set', function(){
        var parent = $(this);
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
                scrollQuestion(id);
            }
        }
    });
}

function listenNextQuestion() {
    $('.updateQuestion').click(function(e){
        
        e.preventDefault();
        var currentElement = $('.question-set.js-active');
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
                scrollQuestion(id);
            }, 150);
        }
    });
}

function hideAnswerBox(currentElement){
    var answerBox = $('#answerBox');
    var userAnswer = $(currentElement).find('.userAnswer td');
    var chosenOptions = $('.answerBox-option.js-active');
    var userAnswerText = '...';

    if(chosenOptions.length > 0) {
        var counter = 0;

        chosenOptions.each(function(){
            var text = $(this).text();
    
            if(counter === 0) {
                userAnswer = text;
            }
            else {
                userAnswer += ', ' + text;
            }
            counter++;
        });
        // update userAnswer with chosen words
        $(currentElement).find('.userAnswer').text(userAnswer);
    }

    $('#answerBox-options-container').html('').fadeOut();
    answerBox.animate({
        'bottom' : '-600px'
    });
}

function showAnswerBox(newCurrentElement) {
    if( $('#sendButton.js-active').length < 1) {
        newCurrentElement = $(newCurrentElement);
        var options = newCurrentElement.find('.answer-options-container').html();
        var answerBox = $('#answerBox');
        var answerBoxOptions = $('#answerBox-options-container');
    
        // populate the question's answer options in answerBoxOptions
        answerBox.animate({
            'bottom' : 0
        }, function() {
            answerBoxOptions.html(options).fadeIn();
        }); 
    }
}

function scrollQuestion(id) {
    var exercise = $('#exercise');
    var offsetTop = $('#'+id).offset().top;

    hideAnswerBox('#' + id);

    if(id !== 'sendButton') {
        showAnswerBox('#' + id);
    }

    exercise.animate({
        scrollTop : offsetTop
    }, 'slow');
}

function listenAnswerBox() {
    $(document).on('click', '.answerBox-option', function(){
        $(this).toggleClass('js-active');
    });
}