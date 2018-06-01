// --------------------------------------------------------------------------------
// news feed update
// --------------------------------------------------------------------------------
(function ($) {
    var lang = $('html').attr('lang');

    var locale = (function (_lang) {
        return _lang === 'ko' ? '이오시스' : 'eosys'
    })(lang);

    var url = {
        blockproducer : {
            rss_url: 'https://medium.com/feed/eosys' + '/tagged/' + 'blockproducer'
        },
        other : {
            rss_url: 'https://medium.com/feed/eosys' + '/tagged/' + locale
        },
        eeg : {
            rss_url: 'https://medium.com/feed/eosys' + '/tagged/' + 'eeg'
        }
    };

    var content = {
                blockproducer : []  // 상단에 blockproducer가 담길거
            ,   other : []
            ,   eeg : []
        }
    ;


    // 데이터 세팅을 해야겠구나.. 쿼리를 네번 던져야되나..?
    var makeData = function (_array,item,i) {
        _array.push({
            title : item.title,
            thumbnail : item.thumbnail,
            link : item.link,
            desc : item.description.replace(/<.+?>/gim,'').replace(/\t\n\r/gi,'').replace(/\s$/gi,'').substring(0,120) + '…'
        });

        return 'data pushed';
    }

    // 블록프로듀서 글 3개 가지고 와서 바인딩
    $.get('https://api.rss2json.com/v1/api.json', url.blockproducer, function(response) {
        if (response.status == 'ok') {

            $.each(response.items, function(i, item) {
                var isConditionBlob = item.categories.join()
                // 이 중 블록프로듀서에는 blockproducer 태그를 가지고 온다.
                if (lang ==='ko' && !!/이오시스/gi.test(isConditionBlob)) {
                    if (content.blockproducer.length === 3) {
                        return false;
                    }
                    makeData(content.blockproducer,item,'qda');

                } else if (lang ==='en' && /eosys/gi.test(isConditionBlob)) {
                    if (content.blockproducer.length === 3) {
                        return false;
                    }
                    makeData(content.blockproducer,item);

                }
            });
        }

        $(function() {
            var $blockproducer = $('#blockproducer');

            var dom = ''

            if (!content.blockproducer) {
                return;
            } else {
                for (var i=0; i < content.blockproducer.length; i++) {
                    dom += '<a href="' + content.blockproducer[i].link + '" >';
                    dom += '<span style="background-image:url(' + content.blockproducer[i].thumbnail + ');"></span>';
                    dom += '<h3>' + content.blockproducer[i].title + '</h3>';
                    dom += '<p>' + content.blockproducer[i].desc + '</p>';
                    dom += '</a>';
                }
            }
            $blockproducer.html(dom);
        });
    });

    // 그외 언어에 맞는 글 가지고 오기
    // $.get('https://api.rss2json.com/v1/api.json', url.other, function(response) {

    //     if (response.status == 'ok') {
    //         $.each(response.items, function(i, item) {
    //             var isConditionBlob = item.categories.join()
    //             // if (!/blockproducer/.test(isConditionBlob)) {
    //             if (/newsclipping/gi.test(isConditionBlob) || /ecosystem/gi.test(isConditionBlob)) {
    //                 makeData(content.other,item);

    //                 if (content.other.length === 3) {
    //                     return false;
    //                 }
    //             }
    //         });
    //     }

    //     $(function() {
    //         var $other = $('#other');

    //         var dom = ''

    //         if (!content.other) {
    //             return;
    //         } else {
    //             for (var i=0; i < content.other.length; i++) {
    //                 dom += '<a href="' + content.other[i].link + '" >';
    //                 dom += '<span style="background-image:url(' + content.other[i].thumbnail + ');"></span>';
    //                 dom += '<h3>' + content.other[i].title + '</h3>';
    //                 dom += '<p>' + content.other[i].desc + '</p>';
    //                 dom += '</a>';
    //             }
    //         }
    //         $other.html(dom);
    //     });
    // });

    // eeg 컨텐트 가지고 오기
    $.get('https://api.rss2json.com/v1/api.json', url.eeg, function(response) {
        if (response.status == 'ok') {

            $.each(response.items, function(i, item) {
                var isConditionBlob = item.categories.join()
                // 이 중 블록프로듀서에는 blockproducer 태그를 가지고 온다.
                if (lang ==='ko' && !!/이오시스/gi.test(isConditionBlob)) {
                    if (content.eeg.length === 3) {
                        return false;
                    }
                    makeData(content.eeg,item,'qda');

                } else if (lang ==='en' && /eosys/gi.test(isConditionBlob)) {
                    if (content.eeg.length === 3) {
                        return false;
                    }
                    makeData(content.eeg,item);

                }
            });
        }

        $(function() {
            var eeg = $('#eeg');

            var dom = ''

            if (!content.blockproducer) {
                return;
            } else {
                for (var i=0; i < content.eeg.length; i++) {
                    dom += '<a href="' + content.eeg[i].link + '" >';
                    dom += '<span style="background-image:url(' + content.eeg[i].thumbnail + ');"></span>';
                    dom += '<h3>' + content.eeg[i].title + '</h3>';
                    dom += '<p>' + content.eeg[i].desc + '</p>';
                    dom += '</a>';
                }
            }
            eeg.html(dom);
        });
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

