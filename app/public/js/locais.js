let products = {
  data: [
    {
      productName: "QUADRA DE BASQUETE VILA LOBOS - JAGUARÉ-SP ",
      category: "BASQUETE",
      local: "25 KM",
      image: "imagem/quad-bsk-2.jpg",
    },
    {
      productName: "PISTA DE SKATE PARQUE DOS CAMARGOS - BARUERI-SP",
      category: "SKATE",
      local: "5 KM",
      image: "imagem/pist-skt.jpg",
    },
    {
      productName: "QUADRA DE FUTSAL NO COMPLEXO ESPORTIVO SILVAL PEREIRA - BARUERI-SP",
      category: "FUTSAL",
      local: "10 KM",
      image: "imagem/quad-fute.jpg",
    },
    {
      productName: "CAMPINHO DE AREIA NO PARQUE MUNICIPAL DE BARUERI - BARUERI-SP",
      category: "FUTSAL",
      local: "10 KM",
      image: "imagem/quad-fute-2.jpg",
    },
    {
      productName: "QUADRA DE BASQUETE NO JARDIM PAULISTA - BARUERI-SP",
      category: "BASQUETE",
      local: "500 M",
      image: "imagem/quad-bsk.jpg",
    },
    {
      productName: "NADA AINDA, VOLTE MAIS TARDE",
      category: "VOLEI",
      local: "0",
      image: "imagem/404-ERROR.jpg",
    },
  ],
};

for (let i of products.data) {

  //cria o Card

  let card = document.createElement("div");

  //O cartão deve ter categoria e permanecer oculto inicialmente

  card.classList.add("card", i.category, "hide");

  //image div

  let imgContainer = document.createElement("div");
  imgContainer.classList.add("image-container");

  //img tag

  let image = document.createElement("img");
  image.setAttribute("src", i.image);
  imgContainer.appendChild(image);
  card.appendChild(imgContainer);

  //container

  let container = document.createElement("div");
  container.classList.add("container");

  //nome do produto

  let name = document.createElement("h5");
  name.classList.add("product-name");
  name.innerText = i.productName.toUpperCase();
  container.appendChild(name);

  //preço

  let local = document.createElement("h6");
  local.innerText = "Aproximadamente: " + i.local;
  container.appendChild(local);
  card.appendChild(container);
  document.getElementById("products").appendChild(card);
}
//Parâmetro passado do botão (parâmetro igual à categoria)

function filterProduct(value) {

  //Button class code

  let buttons = document.querySelectorAll(".button-value");
  buttons.forEach((button) => {

    //verifica se o valor é igual a innerText

    if (value.toUpperCase() == button.innerText.toUpperCase()) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  //seleciona todos os cards

  let elements = document.querySelectorAll(".card");

  //percorre todos os cards

  elements.forEach((element) => {

    //exibir todos os cards no botão 'alls', clique
    if (value == "all") {
      element.classList.remove("hide");
    } else {

      //Verifica se o elemento contém classe de categoria
      if (element.classList.contains(value)) {

        //exibe o elemento com base na categoria
        element.classList.remove("hide");
      } else {

        //ocultar outros elementos
        element.classList.add("hide");
      }
    }
  });
}

//Clique do botão Pesquisar

document.getElementById("search").addEventListener("click", () => {

  //initializations

  let searchInput = document.getElementById("search-input").value;
  let elements = document.querySelectorAll(".product-name");
  let cards = document.querySelectorAll(".card");

  //percorre todos os elementos

  elements.forEach((element, index) => {

    //verifica se o texto inclui o valor de pesquisa

    if (element.innerText.includes(searchInput.toUpperCase())) {

      //exibi card correspondente
      cards[index].classList.remove("hide");

    } else {

      //oculta os outros
      cards[index].classList.add("hide");
    }
  });
});

//Exibir inicialmente todos os produtos
window.onload = () => {
  filterProduct("all");
};