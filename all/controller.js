var fs = require('fs');
var path = require('path');
var watson = require('watson-developer-cloud');
var prompt = require('prompt-sync')();
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var alchemy_language = watson.alchemy_language({
  api_key: 'b995bc51d9ddafddfc4a7ed8090e7e875a63a97e'
});
var pageNum = 11;
var parameters = {
  extract: 'entities,keywords,doc-emotion,doc-sentiment',
  sentiment: 1,
  maxRetrieve: 3,
  html: 'http://www.literaturepage.com/read/mobydick-'+pageNum+'.html'
};

// Set up Conversation service.
var conversation = new ConversationV1({
  username: '99b1ead6-4522-45a0-9a0a-4406ef27ef55',
  password: 'R3MqydARcKKn',
  path: { workspace_id: '7534aa12-a3a9-44da-a122-921218d0a629', }, // replace with workspace ID
  version_date: '2016-07-11'
});

function analyze(updated_params){
  console.log("analysis complete!");
return alchemy_language.combined(updated_params, function (err, response) {
  if (err)
    console.log('error:', err);
  else
    data = response;
    title = data.title;
    keywords_array = [];
    keywords = data.keywords.sort(function(a, b) {
    return parseFloat(b.relevance) - parseFloat(a.relevance);
});
    for (var key in keywords) {
      if (keywords.hasOwnProperty(key)) {
        keyword = keywords[key];
        if (keyword.sentiment.type == 'neutral'){
          keyword_sent = 'Key Phrase: "'.concat(keyword.text,'" has a ',keyword.sentiment.type,' sentiment');}
        else {
        keyword_sent = 'Key Phrase: "'.concat(keyword.text,'" has a ',keyword.sentiment.type,' sentiment score of ',keyword.sentiment.score);}
        keywords_array.push(keyword_sent);
      }
    }
    docEmotions = data.docEmotions;
    dict = docEmotions;
    var items = Object.keys(dict).map(function(key) {
        return [key, dict[key]];
    });
    items.sort(function(first, second) {
        return second[1] - first[1];
    });
    docEmotions = items.slice(0, 5);
    docSentiment = data.docSentiment;
    docSentimentSentence = 'The overall sentiment is: '.concat(docSentiment.score);
    authors = data.authors;
    // console.log(title);
    emotions_array = [];
    for (var key in docEmotions) {
  if (docEmotions.hasOwnProperty(key)) {
    emotions_array.push(docEmotions[key][0] + " has a score of " + docEmotions[key][1]);
  }
}
    entities = data.entities.sort(function(a, b) {
    return parseFloat(b.relevance) - parseFloat(a.relevance);
});
    entities_array = [];
    // console.log(entities);
    for (var key in entities){
      if (entities.hasOwnProperty(key)) {
        entity = entities[key];
        if (entity.sentiment.type == 'neutral'){
          entities_array.push("The text '" + entity.text + "' of type " + entity.type + " has a " + entity.sentiment.type + " sentiment.");
        } else {entities_array.push("The text '" + entity.text + "' of type " + entity.type + " has a " + entity.sentiment.type + " score of " + entity.sentiment.score + ".");
      }}
        }
    // console.log(docSentimentSentence);
    author = "The author is ".concat(authors.names[0]);
});;}

// Start conversation with empty message.
conversation.message({}, processResponse);

// Process the conversation response.
function processResponse(err, response) {
  // console.log(response);
  if (err) {
    console.error(err); // something went wrong
    return;
  }
  if (response.entities.length > 0) {
    var json = response;
    var book = json.entities[0].value;
  }
  // If an intent was detected, log it out to the console.
  if (response.intents.length > 0) {
    console.log('Detected intent: #' + response.intents[0].intent);
    if (response.intents[0].intent=='sentiment') {
      console.log(pageNum);
      response.output.text[0] = docSentimentSentence;
      response.output.text[1] = keywords_array;
      response.output.text[2] = emotions_array;
      response.output.text[3] = entities_array;
    }
    if (response.intents[0].intent=='end_conversation'){
    }
    if (response.intents[0].intent=='turn_page'){
      pageNum = pageNum + 1;
      new_parameters = {
        extract: 'entities,keywords,authors,doc-emotion,pub-date,doc-sentiment,title',
        sentiment: 1,
        maxRetrieve: 1,
        url: 'http://www.literaturepage.com/read/mobydick-'+pageNum+'.html'
      };
      analyze(new_parameters);
      console.log(pageNum);
    }
  }
  // Display the output from dialog, if any.
  if (response.output.text.length != 0) {
      for(key in response.output.text) {
        if (response.output.text.hasOwnProperty(key)) {
          console.log(response.output.text[key].toString());
        }
      }
  }

  // Prompt for the next round of input.
    var newMessageFromUser = prompt('>> ');
    // Send back the context to maintain state.
    conversation.message({
      input: { text: newMessageFromUser },
      context : response.context,
    }, processResponse)
}
