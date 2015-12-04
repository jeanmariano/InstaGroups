var apiUrl = 'https://api.instagram.com/v1/';
var accessToken = '1652918716.b0bba2e.48f51f52d2d042cbae709bf251d2169f';
var geocodingAPIKey = 'AIzaSyCT-NQto5Ni6Ooxy0udyXqDAdb8ywyeeL8';
var mainuser = "mikaandshalefan";
var groups = {
  'sample':[],
  'group':[],
  'try me':[]
};
var cache = [];
var mediacache = {};
var addCache = [];
var removeCache = [];
var currentUserAdd = '';
var currentGroupAdd= '';
var home = true;

function newGroup(name) {
  groups[name] = [];  
}

function isGroup(name) {
  return groups[name] !== undefined;
}

function addToGroup(user,group) {
  if (!isInGroup(user.id,group)) {
    groups[group].push(user)
  }
  else {
    alert('User is already in group');
  }  
}

function editGroupName(oldName, newName) {  
  groups[newName] = groups[oldName];
  delete groups[oldName];
}

function deleteGroup(group) {
  delete groups[group];
}

function isInGroup(id,group) {
  group = groups[group];

  var index = -1;
  for (var i=0; i < group.length; i++) {
    if (group[i].id === id) {
      index = i;
      break;
    }
  }
  if (index > -1) {
    return true;
  }
  else {
    return false;
  }
}

function removeFromGroup(id,group) {
  group = groups[group];
  for (var i=0; i < group.length; i++) {
    if (group[i].id === id) {
      group.splice(i,1);
      break;
    }
  }
}

function getPopular() {
  $.ajax({
    type: 'GET',
    headers: {Accept: 'application/json'},
    url: apiUrl+'media/popular?access_token='+accessToken,
    dataType: "jsonp"
  }).done(function (result) {
    for (var i=0; i< result.data.length; i++) {
      cache[result.data[i].user.id]= result.data[i].user;
    }
    var html = displayMedia(result); 
    $('#mediapopular').empty();
    $('#loadingPopular').css('display','block');
    setTimeout(function() {
    $('#loadingPopular').css('display','none');
    $('#mediapopular').append(html);       
  }, 500); 
  });
}

function getUser(id) {
  var query = 'users/'+id+'/?';
  $.ajax({
    type: 'GET',
    headers: {Accept: 'application/json'},
    url: apiUrl+query+'access_token='+accessToken,
    dataType: "jsonp"
  }).done(function (result) {
    displayUser(result.data);    
  });
}

function searchInsta(query,type) { 
  var initialquery = query;
  if (type != undefined || type != null) {
    if (type === 'user') {
      query = 'users/search?q='+query+'&';
    }
    else if (type === 'media by tags') {
      query = 'tags/'+query+'/media/recent?';
    }
    $.ajax({
      type: 'GET',
      headers: {Accept: 'application/json'},
      url: apiUrl+query+'access_token='+accessToken,
      dataType: "jsonp"
    }).done(function (result) {
      $('#searchresults').empty();
      if (result.data.length ===0) {
        $('#searchresultsheader').text('No results found for \''+initialquery+'\'');
      }
      else {
        if (type === 'user') {
          $('#searchresultsheader').text('User results for \''+initialquery+'\'');
          cache = [];
          for (var i=0; i < result.data.length; i++) {
            cache[result.data[i].id] = result.data[i];
          }
          displayUserResults(result,initialquery);
        }
        else if (type === 'media by tags') {
          $('#searchresultsheader').text('Media results for tag \''+initialquery+'\'');
          var html = displayMedia(result);          
          $('#searchresults').append(html);
        }
      }
    });
  }  
}

function getRecentMedia (id) {
  query = 'users/'+id+'/media/recent/?';
  $.ajax({
    type: 'GET',
    headers: {Accept: 'application/json'},
    url: apiUrl+query+'access_token='+accessToken,
    dataType: "jsonp"
  }).done(function (result) {
    $('#viewRecentMedia').empty();
    var html = displayMedia(result);          
    $('#viewRecentMedia').append(html);
  });
}

function contains(elem,arr) {
  return arr.indexOf(elem) > -1;
}

function remove(elem,arr) {
  var i = arr.indexOf(elem);
  if (i > -1) {
    arr.splice(i,1);
  }
}

function displayUser(result) {
  var bio = result.bio,
    full_name = result.full_name,
    profile_picture = result.profile_picture,
    username = result.username;
  getRecentMedia(result.id);
  $('#viewUsername').text(username);
  $('#viewFullName').text(full_name);
  $($('#viewFullName').siblings('.username')[0]).text(username);
  $($('#viewFullName').siblings('.username')[0]).attr('id',result.id);
  if (home) {
    $('#viewProfileAdd').css('display','none');    
  }
  else {
    $('#viewProfileAdd').css('display','inline-block');    
  }
  $('#viewUserImg').attr('src',profile_picture);
  $('#viewUrl').attr('href','http://instagram.com/'+username);

  $('#viewProfile').css('display','block');
  $('#viewRecentMedia').css('display','none');    

  $('#search').css('display','none');
  $('#browse').css('display','none');
  $('#mygroups').css('display','none');

  $('#loadingRecentMedia').css('display','block');
  setTimeout(function() {
    $('#loadingRecentMedia').css('display','none');
    $('#viewRecentMedia').css('display','block');    
  }, 500);  
}

function displayUserResults(result) {
  result = result.data;
  $('#searchresults').empty();
  $('#searchresults').append('<ul class="list-group">');
  for (var i=0; i < result.length; i++) {
    $('#searchresults ul').append('<li class="list-group-item">'+displayUserSearch(result[i])+'</li>');
  }
}

function displayUserSearch(entry) {
  var username = entry.username;
  var profpic = entry.profile_picture;
  var id = entry.id;
  var user = '<img src="'+profpic+'" class="mediauserimg" />'+
    '<a id="'+id+'" class="username" onclick="getUser(\''+id+'\')">'+username+"</a>"+
    '<button class="btn btn-default btn-xs add pull-right" data-toggle="modal" data-target="#addToGroup">GROUP MEMBERSHIP</button>'; 
  return user;
}

function displayMedia(result) {  
  result = result.data;
  var row = 1;
  var html = '';  
  for (var i=0; i < result.length; i++) {
    mediacache[result[i].id] = result[i];
    var thumbhtml = displayMediaThumbnail(result[i]);
    if (row === 1)
      html = html + '<div class="row">'+thumbhtml;       
    if (row === 2)
      html = html + thumbhtml;
    if (row === 3 || i === result[i]-1) {
      html = html + thumbhtml+'</div>';
      row=0;
    }    
    row++;
  }
  return html; 
}

function displayMediaThumbnail(obj) {
  var likes='', user='', mediahtml=''; 
  if (obj.videos != undefined) {
    var url = obj.videos.standard_resolution.url;
    mediahtml = '<video data-toggle="modal" data-target="#mediaView" onclick="viewMedia(\''+obj.id+'\')"><source src="'+url+'"></video>';
  }
  else {
    var url = obj.images.standard_resolution.url;
    mediahtml = '<img data-toggle="modal" data-target="#mediaView" onclick="viewMedia(\''+obj.id+'\')" src="'+url+'" />';
  }
  likes = obj.likes.count;
  user = obj.user.username;
  var thumbhtml = '<div class="col-md-4 col-xs-4"><div class="thumbnail">'+
    '<a class="mediausername username" onclick="getUser(\''+obj.user.id+'\')">'+user+'</a>'+             
    mediahtml+
    '<div class="text-right">'+
      '<span class="glyphicon glyphicon-heart" aria-hidden="true"></span> '+likes+
    '</div></div></div>';
  return thumbhtml;
}

function displayGroups() {
  $('#groupList').empty();
  $('#addToGroupList').empty();  
  if (Object.keys(groups).length === 0) {    
    $('#groupList').append('You have no groups.');
  }
  else {
    for (var group in groups) {
      var grouphtml = '<a class="list-group-item clearfix groupListGroup" data-toggle="modal" data-target="#editgroup">'+
          '<span class="groupName">'+group.replace(/_/g,' ')+'</span>'+          
        '</a>'
      $('#groupList').append(grouphtml);
    }
  }
}

function displayGroupsWithUser(id,username) {
  $('#addToGroupList').empty();  
  for (var group in groups) {
    var active = '';
    if (isInGroup(id,group)) {
      active = '<a class="list-group-item clearfix addGroupListGroup active">';
    }
    else {
      active = '<a class="list-group-item clearfix addGroupListGroup">';
    }
    var grouphtml = active+
        '<span class="groupName">'+group.replace(/_/g,' ')+'</span>'+
        '<span class="small glyphicon glyphicon-ok pull-right" aria-hidden="true" style="color:#fff;"></span>'+
      '</a>'
    $('#addToGroupList').append(grouphtml);
    $('#addToGroupUser').text(username);
  }
}

function viewMedia(id) {
  var obj = mediacache[id];
  if (obj !== undefined) {
    var likes='', user='', mediahtml='', caption='', profile_picture='',ts; 
    if (obj.videos != undefined) {
      var url = obj.videos.standard_resolution.url;
      mediahtml = '<video id="media"><source src="'+url+'"></video><br/>';
    }
    else {
      var url = obj.images.standard_resolution.url;
      mediahtml = '<img id="media" src="'+url+'" /><br/>';
    }
    if (obj.caption != null)
      caption = captionParser(obj.caption.text);;
    likes = obj.likes.count;
    user = obj.user.username;
    profile_picture=obj.user.profile_picture;
    $('#mediaViewmedia').empty();
    $('#mediaViewusername').text(user);
    $('#mediaViewusername').siblings('b').attr('id',obj.user.id);
    $('#mediaViewcaption').empty();
    $('#mediaViewcaption').append(caption);
    $('#mediaViewlikes').text(likes);
    $('#mediaViewTimestamp').text(moment.unix(obj.created_time).format("dddd, MMMM Do YYYY, h:mm:ss a"));
    $('#mediaViewuserimg').attr('src',profile_picture);
    $('#mediaViewPermalink').attr('href',obj.link);
    $('#mediaViewmedia').append(mediahtml);    
  }
}

function captionParser(caption) {
  var regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
  var matches = [];
  var match;

  while ((match = regex.exec(caption))) {
    matches.push(match[1]);
  }
  
  for (var i=0; i<matches.length; i++) {
    var html = '<a class="tag" id="'+matches[i]+'">#'+matches[i]+'</a>';
    caption = caption.replace('#'+matches[i],html);
  }
  return caption;
}

$(document).ready(function() { 
  
  // INITIALIZE PAGE
  getUser('1652918716');
  $('#viewProfile').css('display','block');
  $('#mygroups').css('display','none');  
  $('#search').css('display','none');
  $('#browse').css('display','none');
  $('#viewprofile').css('display','none');
  $('#groupListPopover').css('display','none');
  $('#loadingRecentMedia').css('display','none');
  $('#loadingPopular').css('display','none');
  $('#editGroupNameForm').css('display','none');
  displayGroups();
  getPopular();

  // navigation
  $('.navlink').click(function (e) {
    var page = e.target.closest('li').id;
    if (page === 'homelink') {
      getUser('1652918716');
      $('#viewProfile').css('display','block');
      $('#search').css('display','none');
      $('#browse').css('display','none');
      $('#mygroups').css('display','none');
      home = true;
    }
    else if (page === 'groupslink') {
      $('#mygroups').css('display','block');
      $('#viewProfile').css('display','none');
      $('#browse').css('display','none');
      $('#search').css('display','none'); 
      home = false;     
    }
    else if (page === 'searchlink') {
      $('#search').css('display','block');
      $('#viewProfile').css('display','none');
      $('#browse').css('display','none');
      $('#mygroups').css('display','none');      
      home = false;
    }
    else {
      $('#browse').css('display','block');
      $('#viewProfile').css('display','none');
      $('#search').css('display','none');
      $('#mygroups').css('display','none');
      home = false;
    }
  });

  // press enter to search
  $('input').keydown(function (e) {
    if (e.keyCode === 13) {
      var query = $('#searchbar').val(),
          type = $('#searchtype').val();
      if (query != '') {
        searchInsta(query,type);
      }
    }
  });

  // search
  $('#searchbutton').click(function() {
    var query = $('#searchbar').val(),
        type = $('#searchtype').val();
      if (query != '') {
        searchInsta(query,type);
      }
  });

  // new group
  $('#newGroupSubmit').submit(function(e) {
    e.preventDefault();
    var name = $('#newGroupField').val();
    if (name !== '') {
      if (!isGroup(name)) {
        newGroup(name.replace(/ /g,'_'));
        $('#newGroupField').val('');
        $('#newGroup').modal('hide');
        displayGroups();
      }
      else {
        alert('A group with that name already exists.');
      }      
    }
  });

  // edit group members
  $('body').on('click','.editGroupUser',function(e) {
    var user = $(e.target)[0].id;
    if ($(e.target).hasClass('active') && removeCache.indexOf(user) === -1) {     
      remove(user,addCache);
      removeCache.push(user);
      $(e.target).removeClass('active');
    }
    else {
      $(e.target).addClass('active'); 
      if (addCache.indexOf(user) === -1) {
        addCache.push(user);
        remove(user,removeCache);
      }
    }
  });

  // view and edit group
  $('body').on('click','.groupListGroup',function(e) {
    var name = $($(e.target).children('.groupName')[0]).text().replace(/ /g,'_');
    currentGroupAdd = name;
    $('#editGroupHeader').text(name.replace(/_/g,' '));
    var group = groups[name];
    $('#edituserlist').empty();
    if (group.length === 0) {
      $('#edituserlist').append("This group is empty.");
    }
    else {
      for (var i=0; i<group.length; i++) {
        var user = group[i];
        var userhtml = '<a class="list-group-item active editGroupUser" id="'+user.id+'">'+
          '<img src="'+user.profile_picture+'" class="editGroupUserImg"/>'+
          user.username+
          '<span class="glyphicon glyphicon-ok pull-right memberCheck"></span>'+
        '</a>';
        $('#edituserlist').append(userhtml);
      }
    }
  });

  // add user to group
  $('body').on('click','.addGroupListGroup',function(e) {
    var name = $(e.target).text().replace('<span class="small glyphicon glyphicon-ok pull-right" aria-hidden="true" style="color:#fff;"></span>','');
    name = name.replace(/ /g,'_');
    if (name !== '' && name !== undefined) {
      if ($(e.target).hasClass('active') && removeCache.indexOf(name) === -1) {
        remove(name,addCache);
        removeCache.push(name);
        $(e.target).removeClass('active');
      }
      else {
        $(e.target).addClass('active'); 
        if (!isInGroup(currentUserAdd,name) && addCache.indexOf(name) === -1) {
          addCache.push(name);
          remove(name,removeCache);
        }
      }
    }
  });

  // button to add user to group
  $('body').on('click','.add', function(e) {
    var user_id = $(e.target).siblings('a')[0].id;
    var username = $($(e.target).siblings('a')[0]).text();
    if (user_id !== '' && user_id !== undefined) { 
      displayGroupsWithUser(user_id,username);            
      currentUserAdd = user_id;   
    }
    else {
      currentUserAdd = '';
    }
  });

  // dismiss modal after selecting groups to add user in
  $('body').on('click','#addToGroupDone', function(e) {
    for (var i=0; i < addCache.length; i++) {
      addToGroup(cache[currentUserAdd],addCache[i]);
    }
    for (var i=0; i < removeCache.length; i++) {
      removeFromGroup(currentUserAdd,removeCache[i]);
    }
    addCache = [];
    removeCache = [];
  }); 

  // dismiss modal after selecting groups to add user in
  $('body').on('click','#editsave', function(e) {  
    for (var i=0; i < removeCache.length; i++) {
      removeFromGroup(removeCache[i],currentGroupAdd);
    }
    addCache = [];
    removeCache = [];
    $('#editGroupNameForm').css('display','none');
    $('#editGroupHeader').css('display','block');
    $('#editGroupName').text('EDIT');
  }); 

  // delete group
  $('body').on('click','#deleteGroup', function(e) {
    var group = $('#editGroupHeader').text().replace(/ /g,'_');
    var del = confirm("Do you really want to delete "+group.replace(/_/g,' ')+"?");
    if (del === true) {
      deleteGroup(group);
      $('#editgroup').modal('hide');
      displayGroups();
    }
  });

  $('body').on('click','.tag', function(e) {
    var tag = e.target.id;
    if (tag !== '') {
      $('#mediaView').modal('hide');      
      searchInsta(tag,'media by tags');
      $('#search').css('display','block');
      $('#viewProfile').css('display','none');
      $('#browse').css('display','none');
      $('#mygroups').css('display','none');      
      home = false;
    }
  });

  $('body').on('click','.username', function(e) {
    var id =  $(e.target).siblings('b')[0].id;
    if (id !== '') {
      $('#mediaView').modal('hide');      
      getUser(id);
    }
  });

  $('body').on('click','#editGroupName', function(e) {
    
    if ($('#editGroupNameForm').css('display') === 'block') {
      $('#editGroupNameForm').css('display','none');
      $('#editGroupHeader').css('display','block');
      $('#editGroupName').text('EDIT');
    }
    else if ($('#editGroupNameForm').css('display') === 'none') {
      $('#editGroupNameForm').css('display','block')
      $('#editGroupHeader').css('display','none');
      $('#editGroupName').text('CANCEL');
    }
  });

  $('#editGroupNameForm').submit(function(e) {
    e.preventDefault();
    var newName = $('#editGroupNameField').val(),
        oldName =$('#editGroupHeader').text();
    if (!isGroup(newName)) {
      editGroupName(oldName,newName.replace(/ /g,'_'));
      displayGroups();
      $('#editGroupNameForm').css('display','none');
      $('#editGroupHeader').css('display','block');
      $('#editGroupName').text('EDIT');
      $('#editGroupHeader').text(newName);   
      $('#editGroupNameField').val('')   
    }
    else {
      alert('Group already exists. Use a different name.');
    }
  }) 

  $('#editgroup').on('hidden.bs.modal', function () {
    $('#editGroupNameForm').css('display','none');
    $('#editGroupHeader').css('display','block');
    $('#editGroupName').text('EDIT');
  })
});
