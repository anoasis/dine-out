var {WebSocketSubject} = rxjs.webSocket;
var {Subject,Observable,combineLatest} = rxjs;
var socket$ = new WebSocketSubject('ws://localhost:8081');

$(document).ready(function () {
    getLocation();
    $('#search').click(function(e) {
      $('#stream').empty();
      window.entries = [];
      var searchReq = {
        "keyword":$('#keyword').val(),
        "lat": $('#lat').val(),
        "lng":$('#lng').val(),
        "radius":$('#radius').val()
      };
      socket$.next(searchReq);
    });
    socket$.subscribe(
        (data) => listup(data),
        (err) => console.error(err),
        () => console.warn('Completed!')
    );
});
window.logs = {};

function listup(resultSet){
  resultSet.forEach(item => {
    window.entries.push(item);
  });
  $('#stream').empty();
  window.entries.sort((a,b)=>b.totalScore - a.totalScore);
  for (let i = 0; i < window.entries.length; i++) {
    var li = document.createElement('li');
    li.innerHTML = parseToDom(window.entries[i]);
    document.getElementById('stream').appendChild(li);
  }
}

function parseToDom(item){
  return `<h3>${item.name}
      <span><i id="${item.placeId}" name="${item.placeId}-UP"" onClick="vote('${item.placeId}',true)" class="fa fa-thumbs-up"></i></span>
      <span><i id="${item.placeId}" name="${item.placeId}-DOWN" onClick="vote('${item.placeId}',false)" class="fa fa-thumbs-down"></i></span></h3>
      <span>Up Votes:${item.upVoteCount}</span> <span>Down Votes:${item.downVoteCount}</span> <span>Total Score: ${item.totalScore}</span><br/>
      <span>Reviews: ++${item.highlyPositiveReviewCount} / +${item.positiveReviewCount} / -${item.negativeReviewCount} / --${item.extremelyNegativeReviewCount}</span> <span>Google rating: ${item.googleRating}</span><br/>
      <span>${item.phoneNumber}</span><br/><span>${item.address}</span>`
}

function vote(placeId, upVote) {
    if($('#userId').val()){
      var voteReq = { 
        userId: $('#userId').val(),
        vote: {
          placeId: placeId,
          upVote: upVote
        }
      }
      console.log(voteReq);
      $.ajax({
        type: "POST",
        url: "http://localhost:8080/vote",
        data: JSON.stringify(voteReq),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(){
          check(placeId, upVote);
        },
        failure: function(errMsg) {
            alert(errMsg);
        }
      });
    }else{
      alert("Please enter your User ID before voting.");
    }
}

function check(placeId, upVote){
  window.logs[placeId] = upVote;
  var exist = (window.logs[placeId]==upVote)? true:false;
  if(exist) unhighlight(placeId, !upVote);
  highlight(placeId, upVote);
}

function highlight(placeId,upVote){
  (upVote) ? $('[name="'+placeId+'-UP"]').addClass("upVoted") : $('[name="'+placeId+'-DOWN"]').addClass("downVoted");
}

function unhighlight(placeId,upVote){
  (upVote) ? $('[name="'+placeId+'-UP"]').removeClass("upVoted") : $('[name="'+placeId+'-DOWN"]').removeClass("downVoted");
}

function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }
  }
  
function showPosition(position) {
    $('#lat').val(position.coords.latitude);
    $('#lng').val(position.coords.longitude); 
}

window.addEventListener('beforeunload', function() {
  socket$.complete();
});