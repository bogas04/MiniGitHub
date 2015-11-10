var trending = [];
var events = [];
var ei = 0;
var traverse = 0;
function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function formateventobj(obj,type)
{
    if (type == "WatchEvent") {
        return obj['actor']['login'] + ' starred the repository ' + obj['repo']['name'];
    }
    else if (type == "ForkEvent") {
        return obj['actor']['login'] + ' forked the repository ' + obj['repo']['name'];
    }
    else if (type == "PushEvent") {
        return obj['actor']['login'] + ' pushed changes to the repository ' + obj['repo']['name'];
    }
}

function buildhome(u,t)
{
    $.ajax({
        url:'https://mbad0la.pythonanywhere.com/user',
        type:'post',
        dataType:'json',
        data:{user:u,token:t},
        success:function(r){
            console.log(r['name']);
            $('#wrapper').prepend('<img id="myimg" src="'+r['avatar_url']+'"/>');
            $('#wrapper').find('#myimg').load(function(){
                $('#loader,#wall,#footer').fadeOut().remove();
                $('#wrapper').append('<div id="statwrap"><div class="stats"><span class="count">'+r['followers']+'</span><br>Follower</div><div class="stats"><span class="count">'+r['following']+'</span><br>Following</div></div>');
                $('#addonoptions').append('<div id="getnotif" class="optab optabopt"><span class="octicon octicon-bell"></span><br><span class="optag">Notifications</span></div><div id="gettrending" class="optab optabopt"><span class="octicon octicon-flame"></span><br><span class="optag">Trending</span></div><div id="getevents" class="optab optabopt"><span class="octicon octicon-rss"></span><br><span class="optag">Events</span></div>');
                $('#wrapper>div,#wrapper>img').fadeIn();
            });
        },
        error:function(r){console.log(r);}
    });
    $('body').append('<img id="loader" src="ajax-loader.gif"/>');
}

$("#wrapper").on('click','#btn',function(){
    var u = $('#username').val();
    $.ajax({
        url:'https://mbad0la.pythonanywhere.com/authenticate',
        type:'post',
        dataType:'json',
        data:{user:u,token:$('#cred').val()},
        success:function(r){
        AppData = u+'@'+r;
        createCookie('minigithubcookie',AppData,5);
        buildhome(u,r);
        },
        error:function(r){console.log(r);}
    });
    $('#username,#cred,#btn').remove();
    $('#wall').css('top',50);
});

self.port.on("show", function onShow() {
    var user = readCookie('minigithubcookie');
    
    if (user==null) {
        $("#wrapper").empty().append('<div id="wall"><span class="mega-octicon octicon-mark-github"></span></div><input type="text" id="username" placeholder="Username"/></br><input type="password" id="cred" placeholder="Password"/><div id="btn">Go!</div>');
        
        //$('#wrapper').append('<img id="wall" src="github_icon.png"/><div id="statwrap"><div class="stats"><span class="count">5</span><br>Follower</div><div class="stats"><span class="count">5</span><br>Following</div></div>');
    }
    else
    {
        $('#wrapper,#addonoptions').empty();
        $('#addonoptions').css('top',0);
        $('#addon_head').css('visibility','visible')
        $('.datawrap').css('display','none');
        user = user.split('@');
        buildhome(user[0],user[1]);
    }
});

$('#goTorepo').click(function(){
    self.port.emit("redirect_to_repo");
});

$('#addon_head>span.mega-octicon').click(function(){
   self.port.emit("redirect_to_github"); 
});

$('#wrapper').on('focus','#username',function(){$(this).attr('placeholder','');});
$('#wrapper').on('focusout','#username',function(){$(this).attr('placeholder','Username');});

$('#wrapper').on('focus','#cred',function(){$(this).attr('placeholder','');});
$('#wrapper').on('focusout','#cred',function(){$(this).attr('placeholder','Password');});

$('#addonoptions').on('click','#gettrending',function(){
    if ($('#addonoptions').position().top!=0)
    {
        $('#addonoptions').css('top',-1*$('#addonoptions').position().top);
        $('#wrapper>div,#wrapper>img,#addon_head').css('visibility','hidden');
        $('#getnotif').css('z-index',3);
        $('#gettrending').css('z-index',4);
        $('#gettrending>span.octicon').removeClass('octicon-flame').addClass('octicon-home');
        $(this).find('.optag').text('Home');
        $('#getevents').css('z-index',2);
        $('#gettrending').css('top',-1*$('#gettrending').position().top);
        $('#getevents').css('top',-1*$('#getevents').position().top);
        $(this).css({'height':48,'color':'#333'});
        $(this).find('.octicon.octicon-home').css('color','#333');
        var user = readCookie('minigithubcookie');
        user = user.split('@');
        if(trending.length == 0)    
        {
        $.ajax({
            url:'https://mbad0la.pythonanywhere.com/trending',
            type:'post',
            dataType:'json',
            data:{user:user[0],token:user[1]},
            success:function(r){
                console.log(r['items'].length);
                trending = r['items'];
                $('#Head1').text(trending[traverse]['full_name']);
                $('#description1').text(trending[traverse]['description']);
                $('#watchers').text(trending[traverse]['watchers_count']);
                $('#stars').text(trending[traverse]['stars_count']);
                $('#forks').text(trending[traverse]['forks_count']);
                $('#loader').fadeOut().remove();
                $('#datawrap1').fadeIn();
            },
            error:function(r){console.log(r);}
        });
        $('body').append('<img id="loader" src="ajax-loader.gif"/>');
        }
        else
        {
                $('#Head1').text(trending[traverse]['full_name']);
                $('#description1').text(trending[traverse]['description']);
                $('#watchers').text(trending[traverse]['watchers_count']);
                $('#stars').text(trending[traverse]['stars_count']);
                $('#forks').text(trending[traverse]['forks_count']);
                $('#datawrap1').fadeIn();
        }
    }
    else
    {
        $('#gettrending>span.octicon').removeClass('octicon-home').addClass('octicon-flame');
        $(this).find('.optag').text('Trending');
        $('#addonoptions').css('top',-1*$('#addonoptions').position().top);
        $('#wrapper>div,#wrapper>img,#addon_head').css('visibility','visible');
        $('#gettrending').css('top',-1*$('#gettrending').position().top);
        $('#getevents').css('top',-1*$('#getevents').position().top);
        $(this).css({'height':26,'color':'lightgray'});
        $(this).find('.octicon.octicon-flame').css('color','lightgray');
        $('#datawrap1').css('display','none');
    }
    
    
    
});

$('#addonoptions').on('click','#getnotif',function(){
    if ($('#addonoptions').position().top!=0)
    {
        $('#addonoptions').css('top',-1*$('#addonoptions').position().top);
        $('#wrapper>div,#wrapper>img,#addon_head').css('visibility','hidden');
        $('#getnotif').css('z-index',4);
        $('#getnotif>span.octicon').removeClass('octicon-bell').addClass('octicon-home');
        $(this).find('.optag').text('Home');
        $('#gettrending').css('z-index',3);
        $('#getevents').css('z-index',2);
        $('#gettrending').css('top',-1*$('#gettrending').position().top);
        $('#getevents').css('top',-1*$('#getevents').position().top);
        $(this).css({'height':48,'color':'#333'});
        $(this).find('.octicon.octicon-home').css('color','#333');
        var user = readCookie('minigithubcookie');
        user = user.split('@');
        $.ajax({
            url:'https://mbad0la.pythonanywhere.com/notifications',
            type:'post',
            dataType:'json',
            data:{user:user[0],token:user[1]},
            success:function(r){
                console.log(r.length);
                var val = Math.floor((Math.random() * 4));
                $('#loader').fadeOut().remove();
                $('#left2,#right2').css('display','none');
                if (val == 0) {
                    $('#Head2').text('Relax!');
                    $('#description2').css('text-align','center').text('You have no new notifications');
                   
                }
                else if (val!=1) {
                    $('#Head2').text('Suit Up!');
                    $('#description2').css('text-align','center').text('You have '+val+' new notifications');
                    
                }
                else
                {
                    $('#Head2').text('Almost Nothing!');
                    $('#description2').css('text-align','center').text('You have '+val+' new notification');
                }
                $('#datawrap2').fadeIn();
            },
            error:function(r){console.log(r);}
        });
        $('body').append('<img id="loader" src="ajax-loader.gif"/>');
    }
    else
    {
        $('#getnotif>span.octicon').removeClass('octicon-home').addClass('octicon-bell');
        $(this).find('.optag').text('Notifications');
        $('#addonoptions').css('top',-1*$('#addonoptions').position().top);
        $('#wrapper>div,#wrapper>img,#addon_head').css('visibility','visible');
        $('#gettrending').css('top',-1*$('#gettrending').position().top);
        $('#getevents').css('top',-1*$('#getevents').position().top);
        $(this).css({'height':26,'color':'lightgray'});
        $(this).find('.octicon.octicon-bell').css('color','lightgray');
        $('#datawrap2').css('display','none');
    }
    
});

$('#addonoptions').on('click','#getevents',function(){
    if ($('#addonoptions').position().top!=0)
    {
        $('#addonoptions').css('top',-1*$('#addonoptions').position().top);
        $('#wrapper>div,#wrapper>img,#addon_head,#gettrending,#getnotif').css('visibility','hidden');
        $('#getnotif').css('z-index',2);
        $('#gettrending').css('z-index',3);
        $('#getevents').css('z-index',4);
        $('#getevents>span.octicon').removeClass('octicon-rss').addClass('octicon-home');
        $(this).find('.optag').text('Home');
        $('#gettrending').css('top',-1*$('#gettrending').position().top);
        $('#getevents').css('top',-1*$('#getevents').position().top);
        $(this).css({'height':48,'color':'#333'});
        $(this).find('.octicon.octicon-home').css('color','#333');
        var user = readCookie('minigithubcookie');
        user = user.split('@');
        if(events.length == 0)    
        {
        $.ajax({
            url:'https://mbad0la.pythonanywhere.com/events',
            type:'post',
            dataType:'json',
            data:{user:user[0],token:user[1]},
            success:function(r){
                events = r;
                if (r[0]['type']=="WatchEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-star"></span>');
                    
                }
                else if (r[0]['type']=="ForkEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-repo-forked"></span>');
                }
                else if (r[0]['type']=="PushEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-repo-push"></span>');
                }
                $('#description3').text(formateventobj(r[0],r[0]['type']));
                $('#loader').fadeOut().remove();
                
                $('#datawrap3').fadeIn();
            },
            error:function(r){console.log(r);}
        });
        $('body').append('<img id="loader" src="ajax-loader.gif"/>');
        }
        else
        {
            if (r[ei]['type']=="WatchEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-star"></span>');
                    
                }
                else if (r[ei]['type']=="ForkEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-repo-forked"></span>');
                }
                else if (r[ei]['type']=="PushEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-repo-push"></span>');
                }
                $('#description3').text(formateventobj(r[ei],r[ei]['type']));
            $('#datawrap3').fadeIn();
        }
    }
    else
    {
        $('#getevents>span.octicon').removeClass('octicon-home').addClass('octicon-rss');
        $(this).find('.optag').text('Events');
        $('#addonoptions').css('top',-1*$('#addonoptions').position().top);
        $('#wrapper>div,#wrapper>img,#addon_head,#gettrending,#getnotif').css('visibility','visible');
        $('#getnotif').css('z-index',2);
        $('#gettrending').css('z-index',3);
        $('#getevents').css('z-index',4);
        $('#gettrending').css('top',-1*$('#gettrending').position().top);
        $('#getevents').css('top',-1*$('#getevents').position().top);
        $(this).css({'height':26,'color':'lighgray'});
        $(this).find('.octicon.octicon-rss').css('color','lightgray');
        $('#datawrap3').css('display','none');
    }
    
});


$('#left1').click(function(){
    traverse = traverse - 1;
    if (traverse == -1) 
        traverse = 24;
    $('#Head1').text(trending[traverse]['full_name']);
    $('#description1').text(trending[traverse]['description']);
    $('#watchers').text(trending[traverse]['watchers_count']);
    $('#stars').text(trending[traverse]['stars_count']);
    $('#forks').text(trending[traverse]['forks_count']);
});

$('#right1').click(function(){
    traverse = traverse + 1;
    if (traverse == 25) 
        traverse = 0;
    $('#Head1').text(trending[traverse]['full_name']);
    $('#description1').text(trending[traverse]['description']);
    $('#watchers').text(trending[traverse]['watchers_count']);
    $('#stars').text(trending[traverse]['stars_count']);
    $('#forks').text(trending[traverse]['forks_count']);
});

$('#left3').click(function(){
    console.log('left');
    ei = ei - 1;
    if (ei == -1) 
        ei = 29;
    if (events[ei]['type']=="WatchEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-star"></span>');
                    
                }
                else if (events[ei]['type']=="ForkEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-repo-forked"></span>');
                }
                else if (events[ei]['type']=="PushEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-repo-push"></span>');
                }
                $('#description3').text(formateventobj(events[ei],events[ei]['type']));
});

$('#right3').click(function(){
    console.log('right');
    ei = ei + 1;
    if (ei == 29) 
        ei = 0;
    if (events[ei]['type']=="WatchEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-star"></span>');
                    
                }
                else if (events[ei]['type']=="ForkEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-repo-forked"></span>');
                }
                else if (events[ei]['type']=="PushEvent") {
                    $('#Head3').empty().append('<span class="mega-octicon more-mega octicon-repo-push"></span>');
                }
                $('#description3').text(formateventobj(events[ei],events[ei]['type']));
});

