const  sideMenu = document.querySelector('aside');
const menuBtn = document.querySelector('#menu_bar');
const closeBtn = document.querySelector('#close_btn');


const themeToggler = document.querySelector('.theme-toggler');



menuBtn.addEventListener('click',()=>{
       sideMenu.style.display = "block"
})
closeBtn.addEventListener('click',()=>{
    sideMenu.style.display = "none"
})

themeToggler.addEventListener('click',()=>{
     document.body.classList.toggle('dark-theme-variables')
     themeToggler.querySelector('span:nth-child(1').classList.toggle('active')
     themeToggler.querySelector('span:nth-child(2').classList.toggle('active')
})
document.getElementById('send-button').addEventListener('click', function() {
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');
    
    const message = messageInput.value;
    if (message.trim() === '') return;
    
    const messageElement = document.createElement('p');
    messageElement.classList.add('chat-message');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    
    messageInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight; // Rolar para o fundo
});
