$(document).ready(function () {
    getLocation();
    $('#search').click(function () {
      var keyword = $('#keyword').val();
      var lat = $('#lat').val();
      var lng = $('#lng').val();
      var radius = $('#radius').val()

      $.getJSON('http://localhost:8080/place/search?keyword='+keyword+'&lat='+lat+'&lng='+lng+'&radius='+radius, function (data) {
        $('#stream').empty();
        listup(data);
      });
    });
});
window.logs = [];

function listup(resultSet){
  for (let i = 0; i < resultSet.length; i++) {
    let li = document.createElement('li');
    li.innerHTML = parseToDom(resultSet[i]);
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

function highlight(placeId,upvote){
  (upvote) ? $('[name="'+placeId+'-UP"]').addClass("upVoted") : $('[name="'+placeId+'-DOWN"]').addClass("downVoted");
}

function unhighlight(placeId,upvote){
  (upvote) ? $('[name="'+placeId+'-UP"]').removeClass("upVoted") : $('[name="'+placeId+'-DOWN"]').removeClass("downVoted");
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