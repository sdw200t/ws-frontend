class Chat {
  constructor() {
    this.id;
    this.user;
    this.proceed = document.querySelector(".proceed_modal");
    this.apiUrl = "http:/localhost:9090";
    //this.apiUrl = "https://websockets-dz-server.onrender.com/";
    this.chat = document.querySelector(".chat");
    this.usersWindow = document.querySelector(".user_window");
  }

  createMessage(data) {
    let message = document.createElement("div");

    if (data["user"] == this.user) {
      message.className = "my_message";
      message.innerHTML = `<div class="title">
                <div class="user">You,</div>
                <div class="message_date">${data["date"]}</div>
            </div>
            <div class="message_text">${data["message"]}</div>`;
    } else {
      message.className = "message";
      message.innerHTML = `<div class="title my">
                <div class="user my">${data["user"]},</div>
                <div class="message_date my">${data["date"]}</div>
            </div>
            <div class="message_text">${data["message"]}</div>`;
    }

    this.chat.appendChild(message);
  }

  listener() {
    this.proceed.addEventListener("click", (e) => {
      this.CheckUserName(e.target.previousElementSibling.children[0].value);
    });
  }

  ws() {
    this.ws = new WebSocket("ws://localhost:9090/ws");
    //this.ws = new WebSocket("wss://websockets-dz-server.onrender.com/ws");
    this.ws.addEventListener("message", (e) => {
      const chatData = JSON.parse(e.data);
      if (chatData.type == "users") {
        this.displayUsers(chatData.payload.chatUsers);
      }
      if (chatData.type == "lastMessage") {
        this.createMessage(chatData.payload);
      }
    });

    document.addEventListener("keypress", (e) => {
      let messageValue = document.querySelector(".input").value;
      if (e.key === "Enter" && messageValue) {
        const message = {
          user: this.user,
          message: messageValue,
        };
        this.ws.send(JSON.stringify(message));
        document.querySelector(".input").value = "";
      }
    });
  }

  async CheckUserName(userName) {
    if (userName.length > 0) {
      const request = fetch("http://localhost:9090/checkUserName", {
      //const request = fetch("https://websockets-dz-server.onrender.com/checkUserName", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: userName, id: this.id }),
        }
      );
      const result = await request;
      if (result.status == 202) {
        alert("Такой никнейм занят! Вам необходимо выбрать другой.");
      } else {
        this.ws();
        this.user = userName;
        this.showChat();
      }
    }
  }

  showChat() {
    let nickChoice = document.querySelector(".registration");
    let chat = document.querySelector(".chat_area");

    nickChoice.classList.add("fog");
    chat.classList.remove("fog");
  }

  displayUsers(usersList) {
    this.removeChilds(this.usersWindow);
    let usr = "";
    for (let user of Object.values(usersList)) {
      if (user == this.user) {
        usr = "You";
      } else {
        usr = user;
      }
      let displayUser = document.createElement("div");
      displayUser.className = "online_user";
      displayUser.innerHTML = `<div class="circle"></div>
            <div class="username">${usr}</div>`;
      this.usersWindow.insertBefore(displayUser, this.usersWindow.firstChild);
    }
  }

  removeChilds(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}

let worker = new Chat();
worker.listener();
