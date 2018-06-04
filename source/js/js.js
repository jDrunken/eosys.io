// --------------------------------------------------------------------------------
// news feed update
// --------------------------------------------------------------------------------
(function ($) {
    var lang = $('html').attr('lang');

    var locale = (function (_lang) {
        return _lang === 'ko' ? '이오시스' : 'eosys'
    })(lang);

    // 데이터 세팅을 해야겠구나
    var post = {
        // static set
        url : {
            blockProducer : {
                rss_url: 'https://medium.com/feed/eosys/tagged/' + 'blockproducer'
            },
            newsClipping : {
                rss_url: 'https://medium.com/feed/eosys/tagged/' + 'newsclipping'
            },
            ecoSystem : {
                rss_url: 'https://medium.com/feed/eosys/tagged/' + 'ecosystem'
            },
            eeg : {
                rss_url: 'https://medium.com/feed/eosys/tagged/' + 'eeg'
            }
        },
        api : 'https://api.rss2json.com/v1/api.json',

        content : {
            blockProducer :[],
            mix : [],            // 에코시스템과 뉴스클리핑을 섞어서 보여줌
            eeg :[],
            newsclipping : [],
            ecoSystem : [],
        }
    }

    post.makeData = function (name,_array,target,filter) {
        $.each(_array, function (i, item) {

            var isConditionBlob = item.categories.join()
            var regex = new RegExp(locale);

            // console.log(name,item.title,isConditionBlob);

            if (regex.test(isConditionBlob)) {
                target.push({
                    title : item.title,
                    thumbnail : item.thumbnail,
                    link : item.link,
                    desc : item.description.replace(/<.+?>/gim,'').replace(/\t\n\r/gi,'').replace(/\s$/gi,'').substring(0,120) + '…'
                });

                if (target.length === 3) {
                    return false;           // jQuery.each를 중단함.
                }
            }
        });

        return target;
    };

    post.binding = function (_array) {
        var item = _array;
        var max = _array.length;
        var dom = '';

        for (var i=0; i<max; i++) {
            dom += '<a href="' + item[i].link + '" >';
            dom += '<span style="background-image:url(' + item[i].thumbnail + ');"></span>';
            dom += '<h3>' + item[i].title + '</h3>';
            dom += '<p>' + item[i].desc + '</p>';
            dom += '</a>';
        }

        return dom;
    };

    post.get = {
        blockProducer: $.get(post.api, post.url.blockProducer),
        newsClipping:  $.get(post.api, post.url.newsClipping),
        ecoSystem:     $.get(post.api, post.url.ecoSystem),
        eeg:           $.get(post.api, post.url.eeg)
    };

    // get data > Processing > bind dom
    $.when(
        post.get.blockProducer,
        post.get.newsClipping,
        post.get.ecoSystem,
        post.get.eeg
    ).then(function (blockProducer, newsClipping, ecoSystem, eeg) {
        post.makeData('blockproducer', blockProducer[0].items, post.content.blockProducer, locale);
        post.makeData('eeg', eeg[0].items, post.content.eeg, locale);

        // 뉴스클리핑과 에코시스템을 섞어서 하나의 데이터로 만들어 가공함
        var mix = newsClipping[0].items.concat(ecoSystem[0].items);

        mix.sort(function(a,b){
            var aTime = parseInt(a.pubDate.replace( /[-\s:]/gi,''))
            ,   bTime = parseInt(b.pubDate.replace( /[-\s:]/gi,''))
            ;

            return bTime-aTime;
        });

        post.makeData('mix', mix, post.content.mix, locale);

    }).done(function (){
        var blockProducer = post.binding(post.content.blockProducer)
        ,   mix = post.binding(post.content.mix)
        ,   eeg = post.binding(post.content.eeg)
        ;

        // 두개의
        $('#newsMix').html(blockProducer).append(mix);
        // $('#mix').html(mix);
        $('#eeg').html(eeg);
    });

})(jQuery);







// --------------------------------------------------------------------------------
// hash location + smooth scrolling
// 모든 anchor에 이벤트 바인딩하자. internal link로 판명될 경우 smooth scrolling 처리
// 최초 로딩,URL에서 hash가 변경될 경우 smooth scrolling 하지 않기로
// --------------------------------------------------------------------------------
(function ($) {
    var _isSetClassName = true;

    function smoothScrollTo(hash, e) {
        if (hash === '') { return false; } 

        if ($(hash).length > 0) {

            if(typeof e !== 'undefined') {
                if ('scrollRestoration' in history) {
                    history.scrollRestoration = 'manual';
                }

                e.preventDefault();
                var insertQuery;

                if (e.type === 'click') {

                    insertQuery = $(e.target).attr('href');
                    history.pushState(null, null, insertQuery);
                }
            }

            _isSetClassName = false;

            $('html,body').animate({
                scrollTop: $(hash).offset().top
            }, 350, function() {
                _isSetClassName = true;
            });
            // !!!! element의 길이에 따라서 스크롤 이동하는 타이밍 받도록 변경해야 됨
        }

    }

    $(function() {
        $('#header nav a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(e) {
            $('#header a[href*="#"]').removeClass('viewing');
            $(this).addClass('viewing');
            smoothScrollTo(this.hash, e);
        });

        smoothScrollTo(location.hash);

        $(window).on('hashchange',function (e){
            smoothScrollTo(location.hash, e);
        });
    });


    $(function (){
        // 스크롤 위치에 따른 GNB color changing (by class binding)
        function headerInteraction (target,window,wall) {
            var target = $(target)
            ,   scrollPosition = parseInt($(window).scrollTop())
            ,   changeScrollPosition = parseInt($(wall).outerHeight())
            ;

            scrollPosition > changeScrollPosition - 40 ?  target.addClass('invert') : target.removeClass('invert');
        }

        // 로딩시 바인딩
        headerInteraction($('#header'),$(window),$('#summary'))

        $(document).on('scroll', function(e) {
            headerInteraction($('#header'),$(window),$('#summary'))

        }); 
        
        // 스크롤 위치에 따라서 link에 클래스 바인딩을 한다.
        var sectionHeight = (function (sectionGroup) {
            var sectionGroup
            ,   max = sectionGroup.length
            ;

            var result = [];

            $.each(sectionGroup, function(i, section) {
                if (!!$(section).attr('id')) {
                    result.push({
                        id : $(section).attr('id'),
                        position : {
                            from : $(section).offset().top,
                            to : $(section).offset().top + $(section).outerHeight()
                        },
                        hash : (function (id){
                            return id === 'summary' ? null : '#'+id
                        })($(section).attr('id'))
                    })
                }
            });
            return result;

        })($('article > section'));

        $(document).on('scroll', function(e) {
            var scrollTop = $(document).scrollTop()
            ,   element
            ;

            for (var i=0; i < sectionHeight.length; i++) {
                if (sectionHeight[i].position.from <= scrollTop && sectionHeight[i].position.to > scrollTop) {
                    element = sectionHeight[i].id;
                    if (_isSetClassName) {

                        $('#header a[href*="#"]').removeClass('viewing');
                        $('#header a[href="#' + element + '"]').addClass('viewing');
                    }
                }
            }
        });
    });
})(jQuery);


// --------------------------------------------------------------------------------
// 팀의 더 보기 버튼 인터랙션 추가
// 모바일 기준 : 320px;
// --------------------------------------------------------------------------------

(function ($) {
    var deviceWidth = {
        mobile : 1000,
    };

    $(function (){

        if ($(window).width() > deviceWidth.mobile) {
            return false;
        }

        var lang = (function () {
            var result = {};

            var isLang = $('html').attr('lang');
            if (isLang === 'ko') {
                result.more = '더 보기';
                result.close = '닫기';
            }

            if (isLang === 'en') {
                result.more = 'View more';
                result.close = 'Close';
            }
            return result;
        })();


        var targetGroup = $('#team button.for_mobile');
        $.each(targetGroup, function(i,target) {
            $(target).click('', function () {
                ($(target).hasClass('un')) ?  $(target).text(lang.more).removeClass('un') : $(target).text(lang.close).addClass('un');
            })
        })
    });
})(jQuery);


// --------------------------------------------------------------------------------
// tabview
// --------------------------------------------------------------------------------
(function ($) {
    $(function (){
        var actionGroup = $('#projectTabview button');

        var displaySectionGroup = $('#projectTabview dd');
        var manipulationImage = $('#projectTabview dd img');
        $.each(actionGroup, function(i,action) {
            $(action).click(function (){
                $(actionGroup).parent('dt').removeClass('viewing');
                $(this).parent('dt').addClass('viewing');
            });
        });
    });
})(jQuery);




// --------------------------------------------------------------------------------
// 팀 :: 자세히보기 팝업
// --------------------------------------------------------------------------------
(function ($) {
    $(function (){
        var element = $('#team .container').html(),
            target = $('#popup'),
            container = $('#popup .container');


            // $(target).addClass('viewing').css('display','block');
            // $(container).html(element);
            // $('body').css({
            //     'overflow':'hidden',
            // });

        var openPopupbutton = $('#team button.view_detail.for_desktop');

        $(openPopupbutton).click(function(){
            $(target).addClass('viewing');
            $(container).html(element);
            $('body').css({
                'overflow':'hidden',
            });
        });

        var closePopupButton = $('#popupClose');

        $(closePopupButton).click(function(){
            $(target).removeClass('viewing');
            $(container).html();
            $('body').css({
                'overflow': ''
            });
        });
    });
})(jQuery);

