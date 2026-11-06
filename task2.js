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
  closeCard(true);
  $('.fly').stop(true).remove();
  var $h = $('#house').empty();
  $.each([2, 1], function (_, f) {
    var $f = $('<div class="floor">').attr('data-floor', f).append('<span class="fl">FLOOR ' + f + '</span>').appendTo($h);
    $.each(party, function (_, r) {
      if (r.floor !== f) return;
      var $r = $('<div class="room">').attr('data-room', r.name).appendTo($f);
      $r.append('<div class="rh"><h3>' + r.name + '</h3><button class="sort">Sort by time</button></div>');
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
$('<button id="clear">Clear</button>').appendTo('#cases');

/* ---------- Task 2.1 SPOTLIGHT ---------- */
function spot($f, isRoom) {
  var $keep = (isRoom ? $f.find('.guest') : $f).find('.in');
  $('.guest .in').not($keep).stop(true).fadeTo(300, 0.2);
  $keep.stop(true).fadeTo(300, 1);
}

function runCase(i) {
  build();
  $('#cases button').removeClass('on').filter(function () { return $(this).data('i') === i; }).addClass('on');
  var c = CASES[i], $f = c[1](), isRoom = $f.first().hasClass('room');
  var names = $f.map(function () { return $(this).attr(isRoom ? 'data-room' : 'data-name'); }).get();
  $('#chain').text(c[1].toString().replace(/^function\s*\(\)\s*\{\s*return\s*/, '').replace(/;?\s*\}$/, ''));
  $('#result').text('Case ' + (i + 1) + ': ' + c[0] + '  ->  ' + names.length + ' found: ' + (names.join(', ') || 'nobody'));
  if (!c[2]) { $f.addClass('hit'); spot($f, isRoom); }
  // the found guests (or room titles) jump once
  (isRoom ? $f.find('h3') : $f.find('.av')).stop(true, true).animate({ top: -14 }, 130).animate({ top: 0 }, 130);
}

$('#cases').on('click', 'button', function () {
  if (this.id === 'clear') {
    $('#cases button').removeClass('on'); $('.hit').removeClass('hit');
    $('.guest .in').stop(true).fadeTo(300, 1); $('#result,#chain').text('');
  } else runCase($(this).data('i'));
});

/* ---------- Task 2.2 GUEST CARD ---------- */
var $card = null;

function facts(g, roomName) {
  var W = { phone: 'a phone', glasses: 'glasses', bag: 'a bag', cup: 'a cup', crumbs: 'cake crumbs' };
  var t = $.map(g.things, function (x) { return W[x]; }), last = t.pop();
  var th = last ? 'Has ' + (t.length ? t.join(', ') + ' and ' : '') + last : 'Came with nothing';
  return '<h4>' + g.name + '</h4><p>Wears ' + g.color + ' clothes</p><p>Came at ' + g.time + '</p>' +
    '<p>' + (g.aitu ? 'AITU student' : 'Not an AITU student') + '</p><p>' + th + '</p><p>Stands in the ' + roomName.toLowerCase() + '</p>';
}

function openCard($g) {
  closeCard();
  var g = $g.data('g'), room = $g.closest('.room').attr('data-room'), $av = $g.find('.av'), o = $av.offset(), W = 230;
  var html = facts(g, room);
  $.each(party, function (_, r) { if (r.name !== room) html += '<button class="mv" data-to="' + r.name + '">Move to the ' + r.name.toLowerCase() + '</button>'; });
  var $c = $('<div id="card">').html(html).css({ visibility: 'hidden', width: W, height: 'auto', left: 0, top: 0 }).appendTo('body');
  var H = $c.outerHeight(), $w = $(window);
  var L = Math.max(8, Math.min(o.left + 24 - W / 2, $w.scrollLeft() + $w.width() - W - 8));
  var T = Math.max($w.scrollTop() + 8, Math.min(o.top - 10, $w.scrollTop() + $w.height() - H - 8));
  $c.css({ left: o.left, top: o.top, width: 48, height: 48, visibility: 'visible' }).data('for', $g).children().css('opacity', 0);
  $c.animate({ left: L, top: T, width: W, height: H }, 280, function () { $c.children().fadeTo(120, 1); });
  $card = $c;
}

function closeCard(now) {
  if (!$card) return;
  var $c = $card, $g = $c.data('for'); $card = null;
  $c.stop(true);
  if (now || !$.contains(document, $g[0])) { $c.remove(); return; }
  var o = $g.find('.av').offset();
  $c.children().stop(true).fadeTo(80, 0);
  $c.animate({ left: o.left, top: o.top, width: 48, height: 48 }, 220, function () { $c.remove(); });
}

$(document).on('click', function (e) {
  var $t = $(e.target);
  if ($t.closest('#card').length) return;
  var $g = $t.closest('.guest');
  if ($g.length) { if ($card && $card.data('for')[0] === $g[0]) closeCard(); else openCard($g); }
  else closeCard();
});
$(document).on('keydown', function (e) { if (e.key === 'Escape') closeCard(); });

/* ---------- Task 2.3 MOVE ---------- */
$(document).on('click', '#card .mv', function () {
  var $g = $card.data('for'); closeCard(true); moveGuest($g, $(this).attr('data-to'));
});

function moveGuest($g, to) {
  var g = $g.data('g'), from = $g.closest('.room').attr('data-room');
  if (from === to) return;
  // 1. change the array, so the cases find the guest in the new room
  var fr = roomObj(from), i = $.inArray(g, fr.guests);
  if (i > -1) { fr.guests.splice(i, 1); roomObj(to).guests.push(g); }
  // 2. start position: the guest card (or the flying copy, if it is still flying)
  var $old = $g.data('fly'), o;
  if ($old) { o = $old.offset(); $old.stop(true).remove(); } else o = $g.offset();
  // 3. the empty place in the old room closes slowly
  var w = $g.outerWidth();
  if (w > 0) $('<div class="gap">').width(w).insertBefore($g).animate({ width: 0 }, 700, function () { $(this).remove(); });
  // 4. put the real card at the end of the new room (full width to measure, then width 0)
  var $to = $('.room[data-room="' + to + '"] .guests');
  $g.stop(true).css({ width: 78, visibility: 'hidden' }).attr('data-room', to).appendTo($to);
  var e = $g.offset();
  // 5. the copy flies, the place in the new room opens slowly
  var $fly = $g.clone().removeClass('guest').addClass('fly').css({ visibility: 'visible', width: 78, left: o.left, top: o.top }).appendTo('body');
  $g.data('fly', $fly).css('width', 0).animate({ width: 78 }, 700);
  $fly.animate({ left: e.left, top: e.top }, 800, function () {
    $fly.remove(); $g.removeData('fly').css('visibility', 'visible');
  });
}

/* ---------- Task 2.4 SORT BY TIME ---------- */
$(document).on('click', '.sort', function () {
  var $r = $(this).closest('.room'), $gs = $r.find('.guests'), $c = $gs.children('.guest'), r = roomObj($r.attr('data-room'));
  var on = !$r.data('sorted'); $r.data('sorted', on);
  $c.stop('sort', true);                                   // only the sort animation is stopped
  var before = $c.map(function () { return $(this).offset(); }).get();
  var order = $c.get().sort(function (a, b) {
    if (on) return $(a).data('min') - $(b).data('min');
    var x = $.inArray($(a).data('g'), r.guests), y = $.inArray($(b).data('g'), r.guests);
    return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
  });
  $c.css({ left: 0, top: 0 });
  $.each(order, function (_, el) { $gs.append(el); });     // new order in the DOM
  $c.each(function (k) {
    var $e = $(this), n = $e.offset();                      // new place
    $e.css({ left: before[k].left - n.left, top: before[k].top - n.top })   // jump back to the old place...
      .animate({ left: 0, top: 0 }, { duration: 600, queue: 'sort' }).dequeue('sort'); // ...and slide
  });
});

build();
});
