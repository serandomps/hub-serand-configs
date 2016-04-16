var dust = require('dust')();
var serand = require('serand');
var redirect = serand.redirect;

dust.loadSource(dust.compile(require('./template'), 'hub-serand-configs-main'));
dust.loadSource(dust.compile(require('./list'), 'hub-serand-configs-list'));
dust.loadSource(dust.compile(require('./add'), 'hub-serand-configs-add'));
dust.loadSource(dust.compile(require('./details'), 'hub-serand-configs-details'));

var list = function (options, parent, done) {
    $.ajax({
        url: '/apis/v/serand/configs',
        headers: {
            'X-Host': 'hub.serandives.com:4000'
        },
        dataType: 'json',
        success: function (data) {
            dust.render('hub-serand-configs-list', data, function (err, out) {
                if (err) {
                    done(err);
                    return;
                }
                var el = $(out);
                //TODO: add delete and edit buttons
                $('.edit', el).on('click', function () {
                    //TODO trigger edit
                });
                $('.delete', el).on('click', function () {
                    $.ajax({
                        method: 'DELETE',
                        url: '/apis/v/serand/configs/' + $(this).parent().data('name'),
                        headers: {
                            'X-Host': 'hub.serandives.com:4000'
                        },
                        dataType: 'json',
                        success: function (data) {
                            redirect('/serand/configs');
                        },
                        error: function () {

                        }
                    });
                });
                parent.html(el);
                done();
            });
        },
        error: function () {
            done(true);
        }
    });
};

var add = function (options, parent, done) {
    dust.render('hub-serand-configs-add', options, function (err, out) {
        if (err) {
            done(err);
            return;
        }
        var el = $(out);
        $('.add', el).click(function () {
            $.ajax({
                method: 'POST',
                url: '/apis/v/serand/configs',
                headers: {
                    'X-Host': 'hub/serandives.com:4000'
                },
                data: {
                    name: $('.name', el).val(),
                    value: JSON.parse($('.value', el).val())
                },
                dataType: 'json',
                success: function (data) {
                    console.log(data);
                    redirect('/serand/configs');
                },
                error: function () {

                }
            });
            return false;
        });
        parent.html(el);
        done();
    });
};

var render = function (action, sandbox, fn, options, next) {
    dust.render('hub-serand-configs-main', options, function (err, out) {
        if (err) {
            fn(err);
            return;
        }
        var el = $(out).appendTo(sandbox);
        $('.' + action, el).addClass('active');
        next(options, $('.content', el), function (err) {
            fn(err, function () {
                $('.hub-serand-configs-main', sandbox).remove();
            });
        });
    });
};

var listMenu = [
    {
        title: 'Configs',
        url: '/serand/configs',
        action: 'list'
    },
    {
        title: 'Add',
        url: '/serand/configs/add',
        action: 'add'
    }
];

module.exports = function (sandbox, fn, options) {
    var action = options.action || 'list';
    switch (action) {
        case 'list':
            options.menu = listMenu;
            render('list', sandbox, fn, options, list);
            return;
        case 'add':
            options.menu = listMenu;
            render('add', sandbox, fn, options, add);
            return;
    }
};