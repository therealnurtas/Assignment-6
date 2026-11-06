$(function () {

/* ---------- 1. THE ARRAY (the picture, guests from left to right) ---------- */
function G(name, color, time, aitu, things) {
  return { name: name, color: color, time: time, aitu: aitu, things: things ? things.split(' ') : [] };
}
var party = [
  { name: 'Balcony', floor: 2, guests: [
    G('Aigerim', 'green', '20:45', 1, 'cup crumbs'), G('Aliya', 'black', '21:15', 0, 'phone cup'),
    G('Madina', 'green', '22:10', 0, 'phone bag crumbs'), G('Ivan', 'black', '20:10', 1, 'cup') ] },
  { name: 'Hall', floor: 2, guests: [
    G('Arman', 'yellow', '20:35', 0, 'bag glasses'), G('Sophia', 'purple', '21:20', 1, 'phone'),
    G('Dias', 'green', '19:45', 1, ''), G('Bekzat', 'purple', '20:55', 0, 'bag cup crumbs'),
    G('Aruzhan', 'black', '21:50', 1, 'phone'), G('Saule', 'green', '21:25', 0, 'glasses') ] },
  { name: 'Kitchen', floor: 1, guests: [
    G('Nurlan', 'red', '19:40', 1, 'phone cup'), G('Emma', 'black', '20:15', 0, 'bag'),
    G('Timur', 'green', '21:05', 1, 'phone bag crumbs'), G('Sergey', 'yellow', '20:50', 0, ''),
    G('Yerlan', 'red', '21:40', 1, 'glasses phone'), G('Kamila', 'black', '20:05', 0, 'cup') ] },
  { name: 'Living room', floor: 1, guests: [
    G('Daniel', 'blue', '19:55', 0, 'glasses'), G('Zarina', 'green', '21:10', 0, 'bag phone crumbs'),
    G('Natasha', 'yellow', '20:30', 1, ''), G('Askar', 'black', '21:00', 1, 'phone'),
    G('Inkar', 'purple', '20:20', 0, 'bag') ] }
];
var COLOR = { red: '#d9363e', blue: '#2f6fd6', green: '#2a9d5c', black: '#222', yellow: '#f0b323', purple: '#8e5bd0' };
var ICON = { phone: '\uD83D\uDCF1', glasses: '\uD83D\uDC53', bag: '\uD83D\uDC5C', cup: '\u2615', crumbs: '\uD83C\uDF70' };

function mins(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
function roomObj(name) { return $.grep(party, function (r) { return r.name === name; })[0]; }

/* ---------- 2. BUILD THE PAGE FROM THE ARRAY ---------- */
function card(g, room) {
  var cls = ['guest', 'c-' + g.color, g.aitu ? 'aitu' : 'not-aitu'].concat(g.things).join(' ');
  var $c = $('<div>').addClass(cls).attr({
    'data-name': g.name, 'data-color': g.color, 'data-time': g.time, 'data-min': mins(g.time),
    'data-room': room, 'data-things': g.things.join(' ')
  }).data('g', g);
  var icons = $.map(g.things, function (t) { return '<span title="' + t + '">' + ICON[t] + '</span>'; }).join(' ');
  $c.append(
    $('<div class="in">').append(
      $('<div class="av">').css('border-color', COLOR[g.color])
        .append($('<img>').attr({ src: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=' + g.name, alt: g.name }))
        .append(g.aitu ? '<span class="badge" title="AITU student">\uD83C\uDF93</span>' : ''),
      '<b>' + g.name + '</b>', '<small>\u23F1 ' + g.time + '</small>', '<div class="th">' + icons + '</div>'));
  return $c;
}

function build() {
  var $h = $('#house').empty();
  $.each([2, 1], function (_, f) {
    var $f = $('<div class="floor">').attr('data-floor', f).append('<span class="fl">FLOOR ' + f + '</span>').appendTo($h);
    $.each(party, function (_, r) {
      if (r.floor !== f) return;
      var $r = $('<div class="room">').attr('data-room', r.name).appendTo($f);
      $r.append('<div class="rh"><h3>' + r.name + '</h3></div>');
      var $gs = $('<div class="guests">').appendTo($r);
      $.each(r.guests, function (_, g) { $gs.append(card(g, r.name)); });
    });
  });
}

/* ---------- 3/4. THE 20 CASES: one jQuery chain each, searching the PAGE ---------- */
var CASES = [
  ['Who is in the hall?', function () { return $('.room[data-room="Hall"] .guest'); }],
  ['Who is dressed in yellow or purple?', function () { return $('.guest[data-color=yellow], .guest[data-color=purple]'); }],
  ['Which AITU students are upstairs?', function () { return $('.floor[data-floor=2] .guest.aitu'); }],
  ['Who has glasses or a bag?', function () { return $('.guest.glasses, .guest.bag'); }],
  ['Who came with nothing at all?', function () { return $('.guest[data-things=""]'); }],
  ['Who has a phone but no bag?', function () { return $('.guest.phone:not(.bag)'); }],
  ['Who arrived between 20:30 and 21:00, both included?', function () { return $('.guest').filter(function () { var m = $(this).data('min'); return m >= 1230 && m <= 1260; }); }],
  ['Who arrived after 21:00 and is not an AITU student?', function () { return $('.guest.not-aitu').filter(function () { return $(this).data('min') > 1260; }); }],
  ['Who stands right next to Askar?', function () { return $('.guest[data-name=Askar]').prev().add('.guest[data-name=Askar] + .guest'); }],
  ['Who stands last in each room?', function () { return $('.guests .guest:last-child'); }],
  ['Who stands third in each room?', function () { return $('.guests .guest:nth-child(3)'); }],
  ['Who stands after Timur in his room?', function () { return $('.guest[data-name=Timur]').nextAll(); }],
  ['Who stands right before someone in black?', function () { return $('.guest[data-color=black]').prev(); }],
  ['In which room is Aruzhan?', function () { return $('.guest[data-name=Aruzhan]').closest('.room'); }],
  ['Which rooms have fewer than 6 guests?', function () { return $('.room').filter(function () { return $(this).find('.guest').length < 6; }); }],
  ['In which rooms does somebody have a cup, but nobody wears glasses?', function () { return $('.room:has(.guest.cup):not(:has(.guest.glasses))'); }],
  ['Who came first to each room?', function () { return $('.room').map(function () { return $(this).find('.guest').toArray().sort(function (a, b) { return $(a).data('min') - $(b).data('min'); })[0]; }); }, 0],
  ['Miras (AITU, blue, 21:20, phone) joins between Askar and Inkar', function () { return card(G('Miras', 'blue', '21:20', 1, 'phone'), 'Living room').hide().insertAfter('.guest[data-name=Askar]').fadeIn(900); }, 1],
  ['Natasha says goodbye and goes home', function () { return $('.guest[data-name=Natasha]').fadeOut(800, function () { $(this).remove(); }); }, 1],
  ['Who took the cake?', function () { return $('.floor[data-floor=1] .guest.crumbs:not(.cup)').filter(function () { var m = $(this).data('min'); return m > 1260 && m < 1290; }).filter(function () { return $(this).prev('.aitu').length + $(this).next('.aitu').length > 0; }); }]
];

$.each(CASES, function (i, c) {
  $('<button>').text((i + 1) + '. ' + c[0].split(' (')[0]).attr('title', c[0]).data('i', i).appendTo('#cases');
});

function runCase(i) {
  build();
  $('#cases button').removeClass('on').filter(function () { return $(this).data('i') === i; }).addClass('on');
  var c = CASES[i], $f = c[1](), isRoom = $f.first().hasClass('room');
  var names = $f.map(function () { return $(this).attr(isRoom ? 'data-room' : 'data-name'); }).get();
  $('#chain').text(c[1].toString().replace(/^function\s*\(\)\s*\{\s*return\s*/, '').replace(/;?\s*\}$/, ''));
  $('#result').text('Case ' + (i + 1) + ': ' + c[0] + '  ->  ' + names.length + ' found: ' + (names.join(', ') || 'nobody'));
  if (!c[2]) $f.addClass('hit');
  // the found guests (or room titles) jump once
  (isRoom ? $f.find('h3') : $f.find('.av')).stop(true, true).animate({ top: -14 }, 130).animate({ top: 0 }, 130);
}

$('#cases').on('click', 'button', function () { runCase($(this).data('i')); });

build();
});
