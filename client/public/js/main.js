$(document).ready(function () {
    window.logs = [];
    getLocation();
    $('#search').click(function () {
      var result = $('#result');
      var keyword = $('#keyword').val();
      var lat = $('#lat').val();
      var lng = $('#lng').val();

      $.getJSON('http://server:8080/place/search?keyword='+keyword+'&lat='+lat+'&lng='+lng, function (data) {
        var items = data.map(function (item) {
          return '<li><h3>'+item.name 
          +'<span><i id="'+item.placeId+'" name="'+item.placeId+'-UP" upVote=true class="fa fa-thumbs-up"></i></span>'
          +'<span><i id="'+item.placeId+'" name="'+item.placeId+'-DOWN" upVote=false class="fa fa-thumbs-down"></i></span></h3></li>'
          +'<span>Up Votes:' + item.upVoteCount + '</span>'+' <span>Down Votes:' + item.downVoteCount + '</span>'+' <span>Google rating:' + item.googleRating + '</span><br/>'
          +'<span>Reviews: ++'+item.highlyPositiveReviewCount+'/ +'+item.positiveReviewCount+'/ -'+item.negativeReviewCount+'/ --'+item.extremelyNegativeReviewCount+'</span><br/>'
          +'<span>'+item.phoneNumber+'</span><br/><span>'+item.address+'</span>';
        });
        result.empty();
  
        if (items.length) {
          var list = $('<ol />').html(items);
          result.append(list);
        }
        $('ol li i').click(function(e) {
          if($('#userId').val()){
            var vot = $(this).attr('upVote')=="true"? true:false;
          
            var voteReq = { 
              userId: $('#userId').val(),
              vote: {
                placeId: $(this).attr('id'),
                upVote: vot
              }
            }
            console.log(voteReq);
            $.ajax({
              type: "POST",
              url: "http://server:8080/vote",
              data: JSON.stringify(voteReq),
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              success: function(vote){
                check(vote.placeId, vote.upVote);
              },
              failure: function(errMsg) {
                  alert(errMsg);
              }
            });
          }else{
            alert("Please enter your User ID before voting.");
          }
        });
      });
  
      result.text('Loading the search result...');
    });

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
  });
  