
const suits = ['H', 'S', 'D', 'C'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
var deck = new Array();

var stock = new Array();
var waste = new Array();
var foundations = new Array(4);
for (var i=0; i<foundations.length; i++){
  foundations[i] = [];
}
var tableau = new Array(7);
for (var i=0; i<tableau.length; i++){
  tableau[i] = [];
}


function getDeck(){
  var deck = new Array();

  for (const suit in suits){
    var i = 0;
    var color = '';
    if (suit == 0 || suit == 2){
      color = 'red';
    } else{
      color = 'black';
    }
    for (const value in values){
      var card = {Value: values[value], Suit: suits[suit], Rank: ranks[i], Color: color, Flipped: false}
      deck.push(card);
      i++;
    }
  }

  return deck;
}


function shuffleDeck(deck){
  var shuffled = new Array();

  while (deck.length > 0){
    var index = (Math.random() * deck.length);
    shuffled.push(deck.splice(index, 1)[0]);
  }

  deck = shuffled.slice();
  return deck;
}


function deal(deck){

  for (var i=0; i<tableau.length; i++){
    for (var j=0; j<=i; j++){
      var card = deck.pop();
      if(j == i){
        card.Flipped = true;
      }
      tableau[i].push(card);
    }
  }

  stock = deck.slice();
}


function tableauToFoundations(){
  var moved = false;
  for (var i=0; i<tableau.length; i++){
    if (tableau[i].length > 0){
      var card = tableau[i][tableau[i].length-1];
      for (var j=0; j<foundations.length; j++){
        if (card.Rank == 1 && foundations[j].length == 0){
          foundations[j][0] = tableau[i].pop();
          moved = true;
          if (tableau[i].length > 0){
            tableau[i][tableau[i].length-1].Flipped = true;
          }
          break;
        } else if (foundations[j].length > 0) {
          if (card.Rank == foundations[j][foundations[j].length-1].Rank + 1
            && card.Suit == foundations[j][foundations[j].length-1].Suit){
            foundations[j].push(tableau[i].pop());
            moved = true;
            if (tableau[i].length > 0){
              tableau[i][tableau[i].length-1].Flipped = true;
            }
            break;
          }
        }
      }
    }
  }
  return moved;
}


function moveColumns(){
  var moved = false;
  for (var i=tableau.length-1; i>=0; i--){
    if (tableau[i].length > 0){
      // get first flipped card
      var j = 0;
      while(!tableau[i][j].Flipped){
        j++;
      }
      var card = tableau[i][j];

      // see if the card can be moved onto another column
      if (!(card.Rank == 13 && j == 0)){
        for (var k=0; k<tableau.length; k++){
          if (k != i && tableau[k].length > 0){
            if (card.Color != tableau[k][tableau[k].length-1].Color
              && card.Rank == tableau[k][tableau[k].length-1].Rank - 1){
              moveTableauCards(i, j, k);
              moved = true;
              break;
            }
          } else if (k != i && card.Rank == 13 && tableau[k].length == 0){
            moveTableauCards(i, j, k);
            moved = true;
            break;
          }
        }
      }
    }
  }
  return moved;
}


function takeFromStock(){
  if (stock.length == 0){
    stock = waste.reverse().slice();
    waste = [];
    return false;
  }
  for(var i=0; i<stock.length; i++){
    stock[i].Flipped = false;
  }
  for (var i=0; i<3; i++){
    if (stock.length > 0){
      stock[stock.length-1].Flipped = true;
      waste.push(stock.pop());
    }
  }
  return true;
}


function moveFromWaste(){
  var moved = false;
  if (waste.length == 0){
    return moved;
  }
  var card = waste[waste.length-1];
  //move to foundations
  for (var i=0; i<foundations.length; i++){
    if (foundations[i].length == 0 && card.Rank == 1){
      foundations[i][0] = waste.pop();
      moved = true;
      return moved;
    } else if (foundations[i].length > 0){
      if (card.Suit == foundations[i][foundations[i].length-1].Suit
        && card.Rank ==  foundations[i][foundations[i].length-1].Rank + 1){
        foundations[i].push(waste.pop());
        moved = true;
        return moved;
      }
    }
  }
  //move to tableau
  for (var i=0; i<tableau.length; i++){
    if (tableau[i].length > 0){
      if (card.Color != tableau[i][tableau[i].length-1].Color
      && card.Rank == tableau[i][tableau[i].length-1].Rank - 1){
        tableau[i].push(waste.pop());
        moved = true;
        return moved;
      }
    } else if (card.Rank == 13 && tableau[i].length == 0){
      tableau[i][0] = waste.pop();
      moved = true;
      return moved;
    }
  }
  return moved;
}


function moveTableauCards(i, j, k){
  var toMove = tableau[i].splice(j);
  var toAddTo = tableau[k];
  var full = toAddTo.concat(toMove);
  tableau[k] = full.slice();
  if(tableau[i].length>0){
    tableau[i][tableau[i].length-1].Flipped = true;
  }
}


function moveFromFoundationsForStock(){
  var wasteCard = waste[waste.length-1];
  for (var i=0; i<tableau.length; i++){
    if (tableau[i].length > 0){
      //both same color and both even or both odd
      //OR different colors and one even and one odd
      var tableauCard = tableau[i][tableau[i].length-1];
      if (((wasteCard.Color == tableauCard.Color && (wasteCard.Rank % 2) == (tableauCard.Rank % 2))
      || (wasteCard.Color != tableauCard.Color && (wasteCard.Rank % 2) != (tableauCard.Rank % 2)))
      && wasteCard.Rank < tableauCard.Rank - 1){
        //find foundation that contains a card needed to move down
        for (var k=0; k<foundations.length; k++){
          if(foundations[k].length > 0){
            var foundationsCard = foundations[k][foundations[k].length-1];
            if (foundationsCard.Rank > wasteCard.Rank){
              //try to move foundationsCard to tableau
              for (var m=0; m<tableau.length; m++){
                if (tableau[m].length > 0){
                  if (foundationsCard.Color != tableau[m][tableau[m].length-1].Color
                  && foundationsCard.Rank == tableau[m][tableau[m].length-1].Rank - 1){
                    tableau[m].push(foundations[k].pop());
                    //go through foundations again after moving something
                    k = 0;
                    console.log("(stock)moved down from foundations "+foundationsCard.Rank+foundationsCard.Suit);
                    var moved = moveFromWaste();
                    if (moved){
                      console.log("moved from waste "+wasteCard.Rank+wasteCard.Suit);
                      return true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    //try to move things back to the foundations
    var moved = true;
    while (moved == true){
      moved = tableauToFoundations();
    }
    renderCards();
  }
  return false;
}


function moveFromFoundationsForTableau(){
  for (var i=tableau.length-1; i>=0; i--){
    //find possible stack to move
    if (tableau[i].length > 0){
      var cardToMove;
      for (var k=0; k<tableau[i].length; k++){
        if (tableau[i][k].Flipped == true){
          cardToMove = tableau[i][k];
          break;
        }
      }
      //find stack to move on to
      for (var m=0; m<tableau.length; m++){
        var tableauCard = tableau[m][tableau[m].length-1];
        if (tableau[m].length > 0){
          if (((cardToMove.Color == tableauCard.Color && (cardToMove.Rank % 2) == (tableauCard.Rank % 2))
          || (cardToMove.Color != tableauCard.Color && (cardToMove.Rank % 2) != (tableauCard.Rank % 2)))
          && cardToMove.Rank < tableauCard.Rank - 1){
            //find foundation card to move down
            for (var n=0; n<foundations.length; n++){
              if (foundations[n].length > 0){
                foundationsCard = foundations[n][foundations[n].length-1];
                if (foundationsCard.Rank > cardToMove.Rank){
                  for (var s=0; s<tableau.length; s++){
                    if (tableau[s].length > 0){
                      if (foundationsCard.Color != tableau[s][tableau[s].length-1].Color
                      && foundationsCard.Rank == tableau[s][tableau[s].length-1].Rank - 1){
                        tableau[s].push(foundations[n].pop());
                        n = 0;
                        console.log("(tableau)moved from foundations: "+foundationsCard.Rank+foundationsCard.Suit);
                        var moved = moveColumns();
                        if (moved){
                          console.log("moved columns "+cardToMove.Rank+cardToMove.Suit);
                          return true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      var moved = true;
      while (moved == true){
        moved = tableauToFoundations();
      }
      renderCards();
    }
  }
  return false;
}


function makeCardAvailable(){
  for (var i=0; i<foundations.length; i++){
    if (foundations[i].length > 0){
      var foundationsCard = foundations[i][foundations[i].length-1];
      for (var j=0; j<tableau.length; j++){
        for (var k=0; k<tableau[j].length; k++){
          if (tableau[j][k].Suit == foundationsCard.Suit
          && tableau[j][k].Rank == foundationsCard.Rank + 1
          && tableau[j][k].Flipped == true){
            var available = false;
            var moved = false;
            while (!available){
              moved = moveToDifferentTableauPile(j);
              if (!moved){
                var movedFromFoundations = moveFromFoundationsForAvailable(j);
                var movedFromTableau = moveToDifferentTableauPile(j);
                moved = (movedFromFoundations || movedFromTableau);
                available = (tableau[j][k] == tableau[j][tableau[j].length-1]);
                console.log("available: "+available);
                if (available){
                  return true;
                }
              }
              if (!moved){
                break;
              }
            }
          }
        }
      }
    }
  }
  return false;
}


function moveToDifferentTableauPile(index){
  var cardToMove = tableau[index][tableau[index].length-1];
  for (var i=0; i<tableau.length; i++){
    if (tableau[i].length > 0 && i != index){
      var tableauCard = tableau[i][tableau[i].length-1];
      if (tableauCard.Color != cardToMove.Color && tableauCard.Rank == cardToMove.Rank + 1){
        tableau[i].push(tableau[index].pop());
        return true;
      }
    }
  }
  return false;
}

function moveFromFoundationsForAvailable(index){
  var cardToMove = tableau[index][tableau[index].length-1];
  for (var i=0; i<foundations.length; i++){
    if (foundations[i].length > 0){
      var foundationsCard = foundations[i][foundations[i].length-1];
      if (foundationsCard.Rank > cardToMove.Rank){
        for (var j=0; j<tableau.length; j++){
          if (tableau[j].length > 0 && j != index){
            var tableauCard = tableau[j][tableau[j].length-1];
            if (foundationsCard.Color != tableauCard.Color
            && foundationsCard.Rank == tableauCard.Rank -  1){
              tableau[j].push(foundations[i].pop());
              console.log("(available)moved down "+foundationsCard.Rank+foundationsCard.Suit);
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}


function moveCardToFoundations(index1, index2){
  if (tableau[index1][index2] == tableau[index1][tableau[index1].length-1]){
    return true;
  } else{
    return false;
  }
}


function allFlipped(){
  var allFlipped = true;
  for (var i=0; i<tableau.length; i++){
    for (var j=0; j<tableau[i].length; j++){
      if (tableau[i][j].Flipped == false){
        allFlipped = false;
        return allFlipped;
      }
    }
  }
  return allFlipped;
}


function won(){
  if (stock.length == 0 && waste.length == 0 && allFlipped()){
    return true;
  } else{
    return false;
  }
}


function renderPiles(){

  //render stock and waste piles
  var unturned = document.createElement("div");
  unturned.className = "pile";
  unturned.style.left = "10px";
  unturned.setAttribute("id", "stock");
  document.getElementById("deck").appendChild(unturned);

  var turned = document.createElement("div");
  turned.className = "pile";
  turned.style.left = (document.getElementById("deck").clientWidth / 2) + "px";
  turned.setAttribute("id", "waste");
  document.getElementById("deck").appendChild(turned);

  //render foundations piles
  for (var i=0; i<foundations.length; i++){
    var pile = document.createElement("div");
    pile.className = "pile";
    pile.style.left = (document.getElementById("foundations").clientWidth / 4) * i + "px";
    pile.setAttribute("id", "foundation"+i);
    document.getElementById("foundations").appendChild(pile);
  }

  //render tableau piles
  for (var i=0; i<tableau.length; i++){
    var pile = document.createElement("div");
    pile.className = "pile";
    pile.style.left = (document.getElementById("tableau").clientWidth / 7) * i + 10 + "px";
    pile.setAttribute("id", "column"+i);
    document.getElementById("tableau").appendChild(pile);
  }
}


function renderCards(){

  //clear previous render
  document.getElementById("stock").innerHTML = '';
  document.getElementById("waste").innerHTML = '';
  for (var i=0; i<foundations.length; i++){
    document.getElementById("foundation"+i).innerHTML = '';
  }
  for (var i=0; i<tableau.length; i++){
    document.getElementById("column"+i).innerHTML = '';
  }

  //render cards in stock
  for (var i=0; i<stock.length; i++){
    var card = document.createElement("div");
    card.className = "card";
    card.innerHTML = "<img src=cards/back.png>";
    document.getElementById("stock").appendChild(card);
  }

  //render waste
  for (var i=0; i<waste.length; i++){
    var card = document.createElement("div");
    card.className = "card";
    card.innerHTML = "<img src=cards/" + waste[i].Value + waste[i].Suit + ".png>";
    document.getElementById("waste").appendChild(card);
  }

  //render foundations
  for (var i=0; i<foundations.length; i++){
    for (var j=0; j<foundations[i].length; j++){
      var card = document.createElement("div");
      card.className = "card";
      card.innerHTML = "<img src=cards/" + foundations[i][j].Value + foundations[i][j].Suit + ".png>";
      document.getElementById("foundation"+i).appendChild(card);
    }
  }

  //render tableau
  for (var i=0; i<tableau.length; i++){
    for (var j=0; j<tableau[i].length; j++){
      var card = document.createElement("div");
      card.className = "card";
      card.style.top = j * 20 + "px";
      if (tableau[i][j].Flipped){
        card.innerHTML = "<img src=cards/" + tableau[i][j].Value + tableau[i][j].Suit + ".png>";
      } else {
        card.innerHTML = "<img src=cards/back.png>";
      }
      document.getElementById("column"+i).appendChild(card);
    }
  }
}


async function play(){
  var lost = false;
  while (!won() && !lost){
    var noMoreMoves = false;
    while (!noMoreMoves){
      var moved = true;
      while (moved){
        moved = tableauToFoundations();
        if (moved){
          moveColumns();
        } else{
          moved = moveColumns();
        }
        await sleep(100);
        renderCards();
      }
      var startOfStock = false;
      while (!moved){
        if (waste.length == 0){
          startOfStock = true;
        }
        moved = moveFromWaste();
        await sleep(100);
        renderCards();
        if (moved){
          startOfStock = false;
          break;
        } else{
          if (startOfStock && stock.length == 0){
            noMoreMoves = true;
            break;
          }
          takeFromStock();
          await sleep(100);
          renderCards();
        }
      }
    }
    if (won()){
      console.log("winner winner chicken dinner");
      return true;
    }else {
      var moved = false;
      moved = moveFromFoundationsForTableau();
      await sleep(100);
      renderCards();
      if (!moved){
        //move waste back to stock
        takeFromStock();
        await sleep(100);
        renderCards();
        //move three cards from stock to waste
        var cardsInStock = takeFromStock();
        await sleep(100);
        renderCards();
        while (cardsInStock){
          await sleep(100);
          moved = moveFromFoundationsForStock();
          cardsInStock = takeFromStock();
          await sleep(100);
          renderCards();
          if (moved){
            break;
          }
        }
        //make card available to move more to foundations
        moved = makeCardAvailable();
        await sleep(100);
        renderCards();
      }
      lost = !moved;
      if(lost){
        console.log("loser loser chicken snoozer");
        return false;
      }
    }
  }
}


function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}


deck = getDeck();
deck = shuffleDeck(deck);
deal(deck);
renderPiles();
renderCards();
play();
