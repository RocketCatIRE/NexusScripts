
gmcpf = typeof gmcpf != 'undefined' || {}

gmcpf.map = {
  ['Char.Name']                : {use: 'original', original: 'charname',             lean: 'leanCharname'             },
  ['Char.StatusVars']          : {use: 'original', original: 'charsvars',            lean: 'leanCharsvars'            },
  ['Char.Status']              : {use: 'original', original: 'status',               lean: 'leanStatus'               },
  ['Char.Vitals']              : {use: 'original', original: 'vitals',               lean: 'leanVitals'               },
  ['Char.Skills.Groups']       : {use: 'lean',     original: 'skillgroups',          lean: 'leanSkillgroups'          },
  ['Char.Skills.List']         : {use: 'original', original: 'skillList',            lean: 'leanSkillList'            },
  ['Char.Skills.Info']         : {use: 'original', original: 'skillinfo',            lean: 'leanSkillinfo'            },
  ['Char.Afflictions.List']    : {use: 'lean',     original: 'afflictionlist',       lean: 'leanAfflictionlist'       },
  ['Char.Afflictions.Add']     : {use: 'lean',     original: 'afflictionadd',        lean: 'leanAfflictionadd'        },
  ['Char.Afflictions.Remove']  : {use: 'lean',     original: 'afflictionremove',     lean: 'leanAfflictionremove'     },
  ['Char.Defences.List']       : {use: 'lean',     original: 'defencelist',          lean: 'leanDefencelist'          },
  ['Char.Defences.Add']        : {use: 'lean',     original: 'defenceadd',           lean: 'leanDefenceadd'           },
  ['Char.Defences.Remove']     : {use: 'lean',     original: 'defenceremove',        lean: 'leanDefenceremove'        },
  ['Room.AddPlayer']           : {use: 'original', original: 'roomAddplayer',        lean: 'leanRoomAddplayer'        },
  ['Room.RemovePlayer']        : {use: 'original', original: 'roomRemoveplayer',     lean: 'leanRoomRemoveplayer'     },
  ['Room.Players']             : {use: 'original', original: 'roomplayers',          lean: 'leanRoomplayers'          },
  ['Char.Items.Add']           : {use: 'original', original: 'charAdditems',         lean: 'leanCharAdditems'         },
  ['Char.Items.Update']        : {use: 'original', original: 'charUpdateitems',      lean: 'leanCharUpdateitems'      },
  ['Char.Items.Remove']        : {use: 'original', original: 'charRemoveitems',      lean: 'leanCharRemoveitems'      },
  ['Char.Items.List']          : {use: 'original', original: 'charListitems',        lean: 'leanCharListitems'        },
  ['IRE.Display.Help']         : {use: 'original', original: 'ireDisplayhelp',       lean: 'leanIreDisplayhelp'       },
  ['IRE.Display.Window']       : {use: 'original', original: 'ireDisplaywindow',     lean: 'leanIreDisplaywindow'     },
  ['IRE.Display.FixedFont']    : {use: 'original', original: 'ireDisplayfixedfont',  lean: 'leanIreDisplayfixedfont'  },
  ['IRE.Display.AutoFill']     : {use: 'original', original: 'ireDisplayautofill',   lean: 'leanIreDisplayautofill'   },
  ['IRE.Display.HidePopup']    : {use: 'original', original: 'ireDisplayhidepopup',  lean: 'leanIreDisplayhidepopup'  },
  ['IRE.Display.HideAllPopups']: {use: 'original', original: 'ireDisplayhidepopups', lean: 'leanIreDisplayhidepopups' },
  ['IRE.Display.Popup']        : {use: 'original', original: 'ireDisplaypopup',      lean: 'leanIreDisplaypopup'      },
}

gmcpf.init = function() {
  for (var k in gmcpf.map) {
    let m = gmcpf.map[k]
    $(document).off('gmcp-' + k)
    $(document).on('gmcp-' + k, function(data) {
      if (typeof gmcpf[m[m.use]] == 'function') {
        gmcpf[m[m.use]](data) 
      }
    })
  } }

gmcpf.charname = function(data) {
  GMCP.Character = data
  logged_in      = true
  document.title = GMCP.Character.name + ' - ' + game
  $('#character_module_name').html(GMCP.Character.name)
  request_avatar()
  setTimeout( function() { if (client.load_settings) { gmcp_import_system() } }, 1000 ) }

gmcpf.charsvars = function(data) { GMCP.StatusVars = data }

gmcpf.status = function(data) {
  if (GMCP.Status == null) { GMCP.Status = {} }
  var s = data
  for (var v in s) { GMCP.Status[v] = s[v] }
  var status = GMCP.Status // [?delete]
  client.draw_affdef_tab() }

gmcpf.vitals = function(data) {
  if (data.charstats) {
    GMCP.CharStats = data.charstats
    client.update_affdef_stats()
  }
  var vote_display = data.vote ? 'block' : 'none'
  if (vote_display != $('#vote').css('display')) {
    $('#vote').css('display', vote_display)
    relayout_status_bar()
  }
  GMCP.gauge_data = data;
  for (var v in data) {
    if (v == 'charstats') { continue }
    client.set_variable('my_' + v, data[v])
  }
  parse_gauges(data)
  if (client.game == 'Lusternia') { parse_lusternia_wounds(data) }
  client.handle_event('GMCP', 'Char.Vitals', '') }

gmcpf.skillgroups = function(data) {
  $('#tbl_skills').html('<table><tbody></tbody></table>')
  var skills = $('#tbl_skills tbody')
  var temp   = ''
      temp  += '<tr><td class=\'skill_group\' style=\'padding: 1px; font-weight: bolder;\''
      temp  += 'group=\'DATA_NAMEG\'>DATA_NAME&nbsp;</td>'
      temp  += '<td style=\'padding: 1px;\'>DATA_RANK</td></tr>'
  var str    = ''
  for (var i in data) {
    str += temp.replace('DATA_NAMEG', data[i].name).replace('DATA_NAME', data[i].name).replace('DATA_RANK', data[i].rank)
  }
  // reduced multiple appending to single call
  skills.append(str)
  $('#tbl_skills tr').css('cursor', 'pointer').click( function() {
    send_GMCP('Char.Skills.Get', {'group': $(this).find('.skill_group').attr('group')})
    GMCP.WaitingForSkills = true
  }) }

gmcpf.skillList = function(data) {
  if (GMCP.WaitingForSkills == true) {
    var dsl = $('<div/>')
    var div = '<div id=\'group_skills\' class=\'\' title=\'Abilities in ' + ucfirst(data.group) + '\' style=\'font-size:0.8em;\'>'
    div += '<table id=\'skill_listing\'>'
    for (var i = 0; i < data.list.length; ++i) {
      var desc = ''
      if (data.descs && (data.desc.length > i)) { desc = data.descs[i] }
      div += '<tr class=\'skill_name\' group=\'' + data.group + '\' skill=\'' + data.list[i] + '\'><td>' + data.list[i] + '</td><td>' + desc + '</td></tr>'
    }
    div += '</table>'
    dsl.append(div).find('.skill_name').click(function() {
      send_GMCP('Char.Skills.Get', {'group': $(this).attr('group'), 'name': $(this).attr('skill') })
    })
    cm_dialog('#', {id: 'skill_list', top_align: 40, title: 'Abilities in ' + ucfirst(data.group), width: ($('#container').width() & .4), height: ($('#container').height() * 0.5), content: dsl })
    GMCP.WaitingForSkills = false
  } }

gmcpf.skillinfo = function(data) {
  var dsl = $('<div/>')
  var div = '<div id=\'group_skills_skill\' class=\'\' title=\'' + ucfirst(data.skill) + '\' style=\'font-size: 0.8em;\'>'
  if (data.info != '') {
    div += '<p>' + client.escape_html(data.info).replace(/\n/g,'<br />') + '</p>'
  } else {
    div += '<p>You have not yet learned that ability.</p>'
  }
  dsl.append(div)
  cm_dialog('#', {id: 'skill_info', top_align: 40, title: ucfirst(data.skill), width: ($('#container').width() * 0.5), height: ($('#container').height() * 0.5), content: dsl })
}

gmcpf.afflictionlist = function(data) {
  GMCP.Afflictions = {}
  for (var i = 0; i < data.length; ++i) {
    var aff = data[i]
    GMCP.Afflictions[aff.name] = aff
  }
  client.draw_affdef_tab() }

gmcpf.afflictionadd = function(data) {
  var aff = data
  GMCP.Afflictions[data.name] = data
  client.draw_affdef_tab()
  client.handle_event('GMCP', 'Char.Afflictions.Add', data) }

gmcpf.afflictionremove = function(data) {
  for (var i = 0; i < data.length; ++i) {
    delete GMCP.Afflictions[data[i]]
  }
  client.draw_affdef_tab()
  client.handle_event('GMCP', 'Char.Afflictions.Add', data) }

gmcpf.defencelist = function(data) {
  GMCP.Defences = {}
  for (var i = 0; i < data.length; ++i) {
    GMCP.Defences[data[i].name] = data[i]
  }
  client.draw_affdef_tab() }

gmcpf.defenceadd = function(data) {
  GMCP.Defences[data.name] = data
  client.draw_affdef_tab()
  client.handle_event('GMCP', 'Char.Defences.Add', data) }

gmcpf.defenceremove = function(data) {
  for (var i = 0; i < data.length; ++i) {
    delete GMCP.Defences[data[i]]
  }
  client.draw_affdef_tab()
  client.handle_event('GMCP', 'Char.Afflictions.Add', data) }

gmcpf.roomAddplayer = function(data) {
  if (data.name != GMCP.Character.name) {
    var name = data.name.toLowerCase()
    $('#div_room_players #' + name).remove()
    $('#div_room_players).append('<p class=\'no_border item\' id=\'' + name + '\'><span class=\'item_icon\'></span><span class=\'player_name\'>' + data.fullname + '</span></p>')
    client.handle_event('GMCP', 'Room.AddPlayer', data.name) 
  } }

gmcpf.roomRemoveplayer = function(data) {
  var name = data.toLowerCase()
  $('#div_room_players #' + name).remove()
  client.handle_event('GMCP', 'Room.RemovePlayer', data) }

gmcpf.roomplayers = function(data) {
  setTimeout(function() {
    $('#div_room_players').html('')
    for (var k in data) {
     if (data[k].name.toLowerCase() != GMCP.Character.name.toLowerCase()) {
       var html = '<p class=\'no_border item\' id=\'' + data[k].name.toLowerCase() + '\'><span class=\'item_icon\'></span><span class=\'player_name\'>' + data[k].fullname + '</span>'
       $('#div_room_players').append(html)
     }
    }
  }, 0) }

gmcpf.charAdditems = function(data) {
  var div_id = itemlist_divid( data.location, data.item )
  if (div_id == null) { return }
  $(div_id).append( itemlist_entry(data.item) )
  itemlist_events( data.item )
  update_item_visibility() }

gmcpf.charUpdateitems = function(data) {
  var div_id = itemlist_divid(data.location, data.item)
  if (div_id == null) { return }
  var orig = $(div_id + ' #' + data.item.id)
  var orig_crosstype = $('#div_inventory #' + data.item.id)
  if (orig_crosstype.length > orig.length) {
    orig_crosstype.remove()
    crossbuttons = true
    orig = new Array()
  }
  var buttons = $('#div_inventory .buttons_' + data.item.id)
  buttons.remove()
  var newtext = itemlist_entry(data.item)
  if (orig.length) {
    orig.replaceWith(newtext)
  } else {
    $(div_id).append(newtext)
  }
  itemlist_events(data.item)
  var room = (data.location == 'room')
  var parentid = room ? '#container_room_contents' : '#tab_content_inventory'
  if (buttons.length) { item_button_click($(parentid + ' #' + data.item.id), !room) }
  update_item_visibility() }

gmcpf.charRemoveitems = function(data) {
  if (typeof data.item.id != 'undefined') {
    temp_item_id = data.item.id 
  } else {
    temp_item_id = data.item 
  }
  if (data.location == 'room') {
    div_id = '#container_room_contents'
    $(div_id + ' #' + temp_item_id).remove()
    $(div_id + ' .buttons_' + temp_item_id).remove()
  } else {
    $('#div_inventory #' + temp_item_id).remove()
    $('#div_inventory .buttons_' + temp_item_id).remove()
  } }

gmcpf.charListitems = function(data) {
  setTimeout(function() {
    if (data.location == 'room') {
      $('#div_room_items, #div_room_mobs').html('')
    } else if (data.location == 'inv') {
      var str  = ''
          str += '<div class=\'subsection\'><div class=\'heading\'>Wielded</div>'
          str += '<div class=\'section_content\' id=\'div_inv_wielded\'></div></div>'
          str += '<div class=\'hrule\'></div><div class=\'subsection\'><div class=\'heading\'>Worn</div>'
          str += '<div class=\'section_content\' id=\'div_inv_worn\'></div></div>'
          str += '<div class=\'hrule\'></div><div class=\'subsection\'><div class=\'heading\'>Other</div>'
          str += '<div class=\'section_content\' id=\'div_inv_items\'></div></div>'
      $('#div_inventory').html(str)
    } else if (data.location.substr(0, 3) == 'rep') {
      var id = data.location.substr(3)
      var container = 'div_inv_container' + id
      $('#' + container).remove()
      $('#' + id + ' > .fa.fa-plus-circle').removeClass('fa-plus-circle').addClass('fa-minus-circle')
      $('#' + id + ', .buttons_' + id).addClass('open_container')
      var after = $('.buttons_' + id)
      if (after.length == 0) { after = $('#' + id) }
      after.after('<div id=\'' + container + '\' class=\'item-container open_container\'></div>')
    }
    for (var k in data.items) {
      var div_id = itemlist_divid(data.location, data.items[k])
      if (div_id == null) { continue }
      $(div_id).append(itemlist_entry(data.items[k]))
      itemlist_events(data.items[k])
    }
    update_item_visibility()
  }, 0) }

gmcpf.ireDisplayhelp = function(data) {
  if (client.popups_help !== true) { return }
  var res = {}
      res.display_help = true
      res.start = (data == 'start')
  return res }

gmcpf.ireDisplaywindow = function(data) {
  var res = {}
      res.display_window = true
      res.start = (parseInt(data.start) == 1)
      res.cmd = data.cmd
  return res }
  
gmcpf.ireDisplayfixedfont = function(data) {
  var res = {}
      res.display_fixed_font = true
      res.start = (data == 'start')
  return res }

gmcpf.ireDisplayautofill = function(data) {
  $('#user_input').val(data.command)
  if (data.highlight && (data.highlight === true || data.highlight == 'true')) {
    document.getElementById('user_input').setSelectionRange(0, document.getElementById('user_input').value.length) }
  $('#user_input').focus() }

gmcpf.ireDisplayhidepopup = function(data) { $('#' + data.id).fadeOut({ complete: function() { $(this).remove() } }) }
gmcpf.ireDisplayhidepopups = function(data) { $('.popup').fadeOut({ complete: function() { $(this).remove() } }) }

gmcpf.ireDisplaypopup = function(data) {
  client.display_gmcp_popup( data.id, data.element, data.src, $('<p/>').html(data.text), data.options, data.commands, data.allow_noshow) }

// Lean Section
gmcpf.leanSkillgroups = function(data) { }

gmcpf.leanAfflictionlist = function(data) {
  GMCP.Afflictions = {}
  for (var i = 0; i < data.length; ++i) {
    var aff = data[i]
    GMCP.Afflictions[aff.name] = aff
  } }
gmcpf.leanAfflictionadd = function(data) { GMCP.Afflictions[data.name] = data }
gmcpf.leanAfflictionremove = function(data) {
  for (var i = 0; i < data.length; ++i) { delete GMCP.Afflictions[data[i]] } }
gmcpf.leanDefencelist = function(data) {
  GMCP.Defences = {}
  for (var i = 0; i < data.length; ++) { GMCP.Defences[data[i].name] = data[i] } }
gmcpf.leanDefenceadd = function(data) { GMCP.Defences[data.name] = data }
gmcpf.leanDefenceremove = function(data) {
  for (var i = 0; i < data.length; ++i) { delete GMCP.Defences[data[i]] } }

gmcpf.init()

  

        if ((gmcp_method == "IRE.Display.Ohmap") && client.map_enabled())
        {
            var res = {};
            res.ohmap = true;
            res.start = (gmcp_args == "start");
            return res;
        }

        if (gmcp_method == "IRE.Display.ButtonActions")
        {
            bottom_buttons_set_defaults(gmcp_args);
        }

        if (gmcp_method == "Comm.Channel.Start")
        {
            var res = {};
            res.channel = gmcp_args;
            res.start = true;
            return res;
        }
        if (gmcp_method == "Comm.Channel.End")
        {
            var res = {};
            res.channel = gmcp_args;
            res.start = false;
            return res;
        }

        if (gmcp_method == "Comm.Channel.Text")
        {
            var channel = gmcp_args.channel;
            var text = gmcp_args.text;
            text = parse_and_format_line(text);
            write_channel(channel, text);
            notifications_channel_text(channel, text, gmcp_args.talker);
        }

        if (gmcp_method == "Comm.Channel.List")
        {
            GMCP.ChannelList = gmcp_args;

            setTimeout(function() {
                $("#div_channels").html("");

                for (var i in GMCP.ChannelList)
                {
                    $("#div_channels").append("<p class=\"no_border item\" style=\"padding: 5px; cursor:pointer\" name=\"" + GMCP.ChannelList[i].name + "\" caption=\"" + GMCP.ChannelList[i].caption + "\" command=\"" + GMCP.ChannelList[i].command + "\">" + ucfirst(GMCP.ChannelList[i].caption) + "</p>");
                }

                $("#div_channels > .item").click(function() {
                    if ($(this).hasClass("bg_medium")) clear = true; else clear = false;

                    $("#div_channels > .item").removeClass("bg_medium");
                    $("#div_channels > .buttons").remove();

                    if (!clear)
                    {
                        $(this).addClass("bg_medium");

                        var name = $(this).attr("name");
                        var caption = $(this).attr("caption");
                        var command = $(this).attr("command");

                        $(this).after("<p class=\"buttons txt_center\" style=\"font-size: .9em;\">" +
                                        "<button class=\"open_channel\" name=\"" + name + "\" caption=\"" + caption + "\" command=\"" + command + "\">Open Channel</button>" +
                                      "</p>");
                        $("#div_channels > .buttons > button.open_channel").button().click(function() {open_channel($(this).attr("name"),$(this).attr("caption"),$(this).attr("command"));});
                    }
                });
            },0);
        }

        if (gmcp_method == "Comm.Channel.Players")
        {
            setTimeout(function () {
                GMCP.WhoList = gmcp_args;

                GMCP.WhoList.sort(function (a,b) {
                    if (a.name < b.name)
                        return -1;
                    if (a.name > b.name)
                        return 1;
                    return 0;
                });

                $("#div_who_channels").html("<p class=\"no_border bg_medium who_channel\" style=\"padding: 5px; cursor:pointer\">All Players</p>");
                $("#div_who_players").html("");

                var channels = [];

                for (var i in GMCP.WhoList)
                {
                    if (GMCP.WhoList[i].channels)
                    {
                        for (var j in GMCP.WhoList[i].channels)
                        {
                            if ($.inArray(GMCP.WhoList[i].channels[j], channels) == -1)
                                channels.push(GMCP.WhoList[i].channels[j])
                        }
                    }

                    $("#div_who_players").append("<p class=\"no_border who_name\" style=\"padding: 2px 5px; cursor:pointer\">" + GMCP.WhoList[i].name + "</p>");
                }

                $("#div_who_players > .who_name").click(function() {
                    var name = $(this).html();
                    send_direct('honours ' + name);
/*
                    if ($(this).hasClass("bg_medium")) clear = true; else clear = false;

                    $("#div_who_players > .who_name").removeClass("bg_medium");
                    $("#div_who_players > .buttons").remove();

                    if (!clear)
                    {
                        $(this).addClass("bg_medium");
                        var name = $(this).html();

                        $(this).after("<p class=\"buttons txt_center\">" +
                                        "<button class=\"send\" rel=\"honours " + name + "\">Honors</button>" +
                                        //"<button class=\"open_channel\"  name=\"Chat with " + name + "\" caption=\"Chat with " + name + "\" command=\"tell " + name + "\">Chat</button>" +
                                      "</p>");
                        $("#div_who_players > .buttons > button.send").button().click(function() {send_direct($(this).attr("rel"), true);});
                        $("#div_who_players > .buttons > button.open_channel").button().click(function() {open_channel($(this).attr("name"),$(this).attr("caption"),$(this).attr("command"));});
                    }
*/
                });

                channels.sort();

                for (var i in channels)
                {
                    $("#div_who_channels").append("<p class=\"no_border who_channel\" style=\"padding: 5px; cursor:pointer\" who_channel=\"" + channels[i] + "\">" + ucfirst(channels[i]) + "</p>");
                }

                $("#div_who_channels > .who_channel").click(function() {

                    if ($(this).hasClass("bg_medium")) clear = true; else clear = false;

                    $("#div_who_channels > .who_channel").removeClass("bg_medium");

                    $(this).addClass("bg_medium");

                    $("#div_who_players").html("");

                    for (var i in GMCP.WhoList)
                    {
                        if ($(this).html() == "All Players" || (GMCP.WhoList[i].channels && $.inArray($(this).attr("who_channel"), GMCP.WhoList[i].channels) > -1))
                        {
                            $("#div_who_players").append("<p class=\"no_border who_name\" style=\"padding: 2px 5px; cursor:pointer\">" + GMCP.WhoList[i].name + "</p>");
                        }
                    }

                    // TODO: don't duplicate things here ...
                    $("#div_who_players > .who_name").click(function() {
                        var name = $(this).html();
                        send_direct('honours ' + name);
/*
                        if ($(this).hasClass("bg_medium")) clear = true; else clear = false;

                        $("#div_who_players > .who_name").removeClass("bg_medium");
                        $("#div_who_players > .buttons").remove();

                        if (!clear)
                        {
                            $(this).addClass("bg_medium");
                            var name = $(this).html();

                            $(this).after("<p class=\"buttons txt_center\">" +
                                            "<button class=\"send\" rel=\"honours " + name + "\">Honors</button>" +
                                            //"<button class=\"open_channel\"  name=\"Chat with " + name + "\" caption=\"Chat with " + name + "\" command=\"tell " + name + "\">Chat</button>" +
                                          "</p>");
                            $("#div_who_players > .buttons > button.send").button().click(function() {send_direct($(this).attr("rel"), true);});
                            $("#div_who_players > .buttons > button.open_channel").button().click(function() {open_channel($(this).attr("name"),$(this).attr("caption"),$(this).attr("command"));});
                        }
*/
                    });
                });

            }, 0);
        }

        if (gmcp_method == "IRE.Rift.Change")
        {
            var name = gmcp_args.name;
            if (gmcp_args.amount)
                GMCP.Rift[name] = { amount: gmcp_args.amount, desc: gmcp_args.desc };
            else
                delete GMCP.Rift[name];

            // update the rift, but only once per 20ms to avoid too much updating
            if (GMCP.rift_update_timeout) window.clearTimeout (GMCP.rift_update_timeout);
            GMCP.rift_update_timeout = window.setTimeout(function () {
                GMCP.rift_update_timeout = null;
                client.render_rift();
            }, 20);
        }

        if (gmcp_method == "IRE.Rift.List")
        {
            GMCP.Rift = {};
            for (var i in gmcp_args) {
                var name = gmcp_args[i].name;
                GMCP.Rift[name] = { amount: gmcp_args[i].amount, desc: gmcp_args[i].desc };
            }
            setTimeout(function () {
                client.render_rift();
            },0);
        }

        if (gmcp_method == "IRE.FileStore.Content")
        {
            var file = gmcp_args;

            if (file.name && file.name == "raw_refresh")
            {
                //console.log(file);
                if (file.text != "")
                {
                    import_system(file.text);
                }

                $.colorbox.close();
            } else if (file.name && file.name == "raw") {
                if (file.text != "")
                {
                    import_system(file.text);
                }
            }
        }

        if (gmcp_method == "IRE.FileStore.List")
        {
            var list = gmcp_args;
            if (client.settings_window && client.settings_window.process_filelist)
                client.settings_window.process_filelist (list);
        }

        if (gmcp_method == "IRE.Tasks.List")
        {
            GMCP.TaskList = {};

            setTimeout(function () {
                /*gmcp_args.sort(function (a,b) {
                    if (a.group < b.group)
                        return -1;
                    if (a.group > b.group)
                        return 1;
                    return 0;
                });*/

                var types = [ "task", "quest", "achievement" ];
                for (var tt = 0; tt < types.length; ++tt) {
                    var type = types[tt];

                    var groups = {};
                    var grouporder = new Array();   // groups in the order in which they were encountered
                    // the "Active" group always exists on the top (only shown if we have such tasks)
                    grouporder.push("Active");
                    // Similarly, the Completed one always exists at the bottom
                    var lastgroups = new Array();
                    lastgroups.push("Completed");
                    for (var i in gmcp_args)
                    {
                        if (gmcp_args[i].type.toLowerCase().indexOf(type) < 0) continue;

                        GMCP.TaskList[type + gmcp_args[i].id] = gmcp_args[i];

                        var group = gmcp_args[i].group;
                        if (groups[group] == null) groups[group] = new Array();

                        groups[group].push(i);
                        if ((grouporder.indexOf(group) < 0) && (lastgroups.indexOf(group) < 0))
                            grouporder.push(group);
                    }

                    for (var g = 0; g < lastgroups.length; ++g)
                        grouporder.push(lastgroups[g]);

                    var tbl = $("#tbl_"+type+"s");
                    tbl.html("");
                    var count = 0;
                    var gid = 0;
                    for (var g = 0; g < grouporder.length; ++g) {
                        var group = grouporder[g];
                        if ((groups[group] == null) || (groups[group].length == 0)) continue;
                        var section = '';
                        gid++;
                        for (var idx = 0; idx < groups[group].length; ++idx) {
                            var i = groups[group][idx];

                            var html = task_html(type, gmcp_args[i]);
                            section += "<div id=\""+type+gmcp_args[i].id+"\" class=\"task_group_" + type + gid + "\">" + html + "</div>";
                        }
                        section = '<div class="subsection"><div class="heading">' + client.escape_html(group) + '</div><div class="section_content">' + section + '</div>';

                        if (count > 0)  tbl.append ('<div class="hrule"></div>');
                        tbl.append (section);
                        for (var idx = 0; idx < groups[group].length; ++idx) {
                            var i = groups[group][idx];
                            task_html_add_handler(type, gmcp_args[i]);
                        }
                        count++;
                    }
                }
            },0);
        }

        if (gmcp_method == "IRE.Tasks.Update")
        {
            setTimeout(function () {

                var types = [ "task", "quest", "achievement" ];
                for (var tt = 0; tt < types.length; ++tt) {
                    var type = types[tt];

                    for (var i in gmcp_args)
                    {
                        if (gmcp_args[i].type.toLowerCase().indexOf(type) < 0) continue;

                        GMCP.TaskList[type + gmcp_args[i].id] = gmcp_args[i];

                        var html = task_html(type, gmcp_args[i]);

                        $("div#"+type+gmcp_args[i].id).html(html);
                        task_html_add_handler(type, gmcp_args[i]);
                    }
                }
            },0);
        }

        if (gmcp_method == "IRE.Time.List")
        {
            GMCP.Time = {};

            //setTimeout(function () {
                for (var i in gmcp_args)
                {
                    GMCP.Time[i] = gmcp_args[i];
                }
            //},0);
        }

        if (gmcp_method == "IRE.Time.Update")
        {
            //setTimeout(function () {
                for (var i in gmcp_args)
                {
                    GMCP.Time[i] = gmcp_args[i]
                }
            //},0);
        }

        if (gmcp_method == "Room.Info")
        {
            setTimeout(function() {

                var map = client.mapper;
                $("#div_room_description").html(gmcp_args.desc.replace(/\n/g,"<br>"))

                map.roomName = gmcp_args.name;
                map.roomExits = gmcp_args.exits;

                // these need to be before the actual map updating
                map.set_map_background(gmcp_args.background);
                map.set_map_linecolor(gmcp_args.linecolor);

                map.cID = gmcp_args.num;
                // if this is not an ohmap room, disable the mode
                if (!gmcp_args.ohmap) map.overhead = false;

                var coords = gmcp_args.coords.split(/,/g);
                var coords_okay = false;
                var area_id = undefined;
                var x = undefined;
                var y = undefined;
                var z = undefined;
                var building = undefined;

                if (coords && coords.length >= 4) {
                    area_id = coords[0];
                    x = coords[1];
                    y = coords[2];
                    z = coords[3];
                    building = (coords.length >= 5) ? coords[4] : 0;

                    if ($.isNumeric(area_id) && $.isNumeric(x) && $.isNumeric(y) && $.isNumeric(z)) coords_okay = true;
                }
                if (!coords_okay)
                    // Coords can't be parsed -- show the supplied area name instead, if any.
                    map.set_area_name(gmcp_args.area);

                last_x = map.cX;
                last_y = map.cY;
                last_z = map.cZ;
                last_building = map.cB;

                map.cX = x;
                map.cY = y;
                map.cZ = z;
                map.cB = building;

                GMCP.CurrentArea.id = area_id;
                GMCP.CurrentArea.level = z;

                if (coords_okay && (map.cArea != area_id))
                {
                    map.cArea = area_id;
                    map.load_map_data();
                } else {
                    if ((map.cZ != last_z) || (map.cB != last_building))
                    {
                        map.draw_map();
                    } else {
                        map.draw_player();
                    }
                }

                client.update_movement_compass(gmcp_args.exits);
            }, 0);

            gmcp_fire_event = true;
            gmcp_event_param = gmcp_args.num;
        }

        if (gmcp_method == "IRE.Composer.Edit")
        {
            //print(JSON.stringify(gmcp_args));

            var composer_edit = gmcp_args;

            if (composer_edit.title != "")
            {
                $("#composer_title").html(composer_edit.title);
            }

            $.colorbox({width: "700px", open:true, inline:true, href:"#m_composer"});

            $("#composer_text").val(composer_edit.text).focus();
        }

        if (gmcp_method == "IRE.Sound.Preload")
        {
            preload_sound('library/' + gmcp_args.name);
        }

        if (gmcp_method == "IRE.Sound.Play")
        {
            fadein = fadeout = loop = false;

            if (typeof gmcp_args.fadein_csec != "undefined")
                fadein = gmcp_args.fadein_csec * 1000; // GMCP provides in seconds, sound lib needs milliseconds //

            if (typeof gmcp_args.fadeout_csec != "undefined")
                fadeout = gmcp_args.fadeout_csec * 1000;

            if (typeof gmcp_args.loop != "undefined" && (gmcp_args.loop == "true" || gmcp_args.loop == true))
                loop = true;

            play_sound('library/' + gmcp_args.name, fadein, fadeout, loop);
        }

        if (gmcp_method == "IRE.Sound.Stop")
        {
            fadeout = false;

            if (typeof gmcp_args.fadeout_csec != "undefined")
                fadeout = gmcp_args.fadeout_csec * 1000;

            stop_sound(gmcp_args.name, fadeout);
        }

        if (gmcp_method == "IRE.Sound.StopAll")
        {
            fadeout = false;

            if (typeof gmcp_args.fadeout_csec != "undefined")
                fadeout = gmcp_args.fadeout_csec * 1000;

            stop_all_sounds(fadeout);
        }

        if (gmcp_method == "IRE.Target.Set")
        {
            var target = gmcp_args;
            var ntarget = parseInt(target);
            if (!isNaN(ntarget)) target = ntarget;
            client.set_current_target(target, false);

            gmcp_fire_event = true;
            gmcp_event_param = target;
        }

        if (gmcp_method == "IRE.Target.Request")
        {
            client.send_GMCP("IRE.Target.Set", (GMCP.Target != undefined) ? GMCP.Target: 0);
        }

        if (gmcp_method == "IRE.Target.Info")
        {
            var tg = parseInt(gmcp_args.id);
            var is_player = (tg == -1);
            if ((!is_player) && (tg != client.current_target())) return;   // nothing if the target has since changed - eliminates race conds. Bypassed for player targets.
            var desc = gmcp_args.short_desc;
            var hp = is_player ? undefined : gmcp_args.hpperc;
            client.set_current_target_info(desc, hp, is_player);
        }

        // used to upload the drupal avatar
        if (gmcp_method == "IRE.Misc.OneTimePassword")
        {
            var pwd = gmcp_args;
            dropzone_kickoff(pwd);
        }

