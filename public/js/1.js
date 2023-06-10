/*// Sélectionnez l'élément d'envoi du message
var sendButton = document.getElementById('send-button');

// Sélectionnez l'élément d'entrée de fichier
var fileInput = document.getElementById('file-input');
  
// Ajoutez un gestionnaire d'événement de clic sur le bouton d'envoi
sendButton.addEventListener('click', sendMessage);

// Ajoutez un gestionnaire d'événement de changement sur l'entrée de fichier
fileInput.addEventListener('change', handleFileUpload);

// Définissez la fonction pour envoyer le message
function sendMessage() {
	// Récupérez le contenu du champ de texte
	var messageInput = document.querySelector('.chat-footer textarea');
	var message = messageInput.value;

	// Vérifiez si le message n'est pas vide
	if (message.trim() !== '') {
		// Créez un nouvel élément de message avec le contenu
		var newMessageElement = document.createElement('div');
		newMessageElement.className = 'chat-r';
		newMessageElement.innerHTML = `
			<div class="sp"></div>
			<div class="mess mess-r">
				<p>${message}</p>
				<div class="check">
					<span>${getCurrentTime()}</span>
				</div>
			</div>
		`;

		// Ajoutez le nouveau message à la boîte de discussion
		var chatBox = document.querySelector('.chat-box');
		chatBox.appendChild(newMessageElement);

		// Effacez le contenu du champ de texte
		messageInput.value = '';

		// Faites défiler la boîte de discussion jusqu'au bas pour afficher le nouveau message
		chatBox.scrollTop = chatBox.scrollHeight;
	}
}

// Fonction de gestion des téléchargements de fichiers
function handleFileUpload() {
	var files = fileInput.files;
  
	// Parcourir tous les fichiers sélectionnés
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
  
		// Créer un objet URL pour le fichier
		var imageURL = URL.createObjectURL(file);
  
		// Créer un élément d'image pour afficher l'image
		var imageElement = document.createElement('img');
		imageElement.src = imageURL;
		imageElement.classList.add('img_chat');
  
		// Créer un nouvel élément de message avec l'image
		var newMessageElement = document.createElement('div');
		newMessageElement.className = 'chat-r';
		newMessageElement.innerHTML = `
			<div class="sp"></div>
			<div class="mess mess-r">
				<img src="${imageURL}" class="img_chat">
				<div class="check">
					<span>${getCurrentTime()}</span>
					<img src="img/check-1.png">
				</div>
			</div>
		`;
  
		// Ajouter le nouvel élément de message à la boîte de discussion
		var chatBox = document.querySelector('.chat-box');
		chatBox.appendChild(newMessageElement);
  
		// Faites défiler la boîte de discussion jusqu'au bas pour afficher le nouveau message
		chatBox.scrollTop = chatBox.scrollHeight;
	}
  
	// Réinitialiser l'entrée de fichier pour permettre la sélection de fichiers multiples
	fileInput.value = '';
}

// Fonction utilitaire pour obtenir l'heure actuelle au format HH:MM AM/PM
function getCurrentTime() {
	var now = new Date();
	var hours = now.getHours();
	var minutes = now.getMinutes();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12 || 12;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	return hours + ':' + minutes + ' ' + ampm;
}
*/
var actionMenuBtn = document.querySelector('#action_menu_btn');
var actionMenu = document.querySelector('.action_menu');

actionMenuBtn.addEventListener('click', function() {
  actionMenu.classList.toggle('active');
});

document.addEventListener("DOMContentLoaded", function() {
  var modeLightToggle = document.getElementById("mode-light");
  var body = document.querySelector("body");

  modeLightToggle.addEventListener("click", function() {
    body.classList.toggle("mode-light");
  });
});


var chatForm = document.getElementById('chat_form');
var chatBox = document.getElementById('chat-box');
var roomName = document.getElementById('roomName');
var userlist = document.getElementById('users');
var socket = io();

// Récupération du nom d'utilisateur et de la salle à partir des paramètres de l'URL
var params = new URLSearchParams(location.search);
var username = params.get('username');
var room = params.get('room');

// Rejoindre une salle de discussion
socket.emit('joinRoom', { username, room });
console.log(username, room);

// Obtenir les informations sur la salle et les utilisateurs
socket.on('roomUsers', function({ room, users }) {
  outputRoomName(room);
  outputUsers(users);
});

var today = new Date();

// Réception d'un message du serveur
socket.on('message', function(message) {
  console.log(message);
  outputMessage(message);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Réception d'une notification du serveur
socket.on('notif', function(message) {
  console.log(message);
  var div = document.createElement('div');
  div.innerText = message;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Écoute de la soumission du formulaire de chat
chatForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var messageInput = document.querySelector('.chat-footer textarea');
  var message = messageInput.value.trim();
  if (message !== '') {
    socket.emit('chatMessage', message);
    outputMessageMe(message);
    messageInput.value = '';
  }
});

// Gestion du clic sur le bouton de déconnexion
document.getElementById('leave').addEventListener('click', function() {
  location.href = 'index.html';
});

// Affichage d'un message dans le DOM
function outputMessage(message) {
  var newMessageElement = document.createElement('div');
  newMessageElement.className = 'chat-l';
  newMessageElement.innerHTML = `
    <div class="mess">
      ${message.username}
      <p>${message.text}</p>
      <div class="check">
        <span>${message.time}</span>
      </div>
    </div>
    <div class="sp"></div>
  `;
  chatBox.appendChild(newMessageElement);
}

// Affichage d'un message de l'utilisateur actuel dans le DOM
function outputMessageMe(message) {
  var newMessageElement = document.createElement('div');
  newMessageElement.className = 'chat-r';
  newMessageElement.innerHTML = `
    <div class="sp"></div>
    <div class="mess mess-r">
      <p>${message}</p>
      <div class="check">
        <span>${getCurrentTime()}</span>
      </div>
    </div>
  `;
  chatBox.appendChild(newMessageElement);
}

// Affichage du nom de la salle dans le DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Affichage de la liste des utilisateurs dans le DOM
function outputUsers(users) {
  userlist.innerHTML = users.map(function(user) {
    return `<p>${user.username}</p>`;
  }).join('');
}

// Envoi de message lors du clic sur le bouton d'envoi
var sendButton = document.getElementById('send-button');
sendButton.addEventListener('click', sendMessage);

// Gestion du téléchargement de fichiers lors du changement de l'entrée de fichier
var fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', handleFileUpload);

// Fonction pour envoyer le message
function sendMessage() {
  var messageInput = document.querySelector('.chat-footer textarea');
  var message = messageInput.value.trim();
  if (message !== '') {
    socket.emit('chatMessage', message);
    outputMessageMe(message);
    messageInput.value = '';
  }
}

// Fonction de gestion des téléchargements de fichiers
function handleFileUpload() {
  var files = fileInput.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var imageURL = URL.createObjectURL(file);

    var imageElement = document.createElement('img');
    imageElement.src = imageURL;
    imageElement.classList.add('img_chat');

    var newMessageElement = document.createElement('div');
    newMessageElement.className = 'chat-r';
    newMessageElement.innerHTML = `
      <div class="sp"></div>
      <div class="mess mess-r">
        <img src="${imageURL}" class="img_chat">
        <div class="check">
          <span>${getCurrentTime()}</span>
          <img src="img/check-1.png">
        </div>
      </div>
    `;

    chatBox.appendChild(newMessageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  fileInput.value = '';
}

// Fonction utilitaire pour obtenir l'heure actuelle au format HH:MM AM/PM
function getCurrentTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}
