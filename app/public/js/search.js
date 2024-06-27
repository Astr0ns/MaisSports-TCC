let products = {
  data: [
    {
      productName: "CHUTEIRA NIKE ZOOM MERCURIAL VAPOR 15 ELITE KM FG",
      category: "NIKE",
      price: "799,90",
      image: "https://shoxstore.com.br/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/9/e/9e8fda5e.jpg",
    },
    {
      productName: "MEIAS MILANO 23",
      category: "ADIDAS",
      price: "49,99",
      image: "https://assets.adidas.com/imagem/w_1920,h_1920,f_auto,q_auto,fl_lossy,c_fill,g_auto/970a752980d047068677af0201014192_9366/Meias_Milano_23_Preto_HT6538_03_standard.jpg",
    },
    {
      productName: "CANELEIRAS NEYMAR JR ULTRA LIGHT STRAP",
      category: "PUMA",
      price: "159,90",
      image: "https://imagem.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/030902/01/fnd/BRA/w/1000/h/1000/fmt/png",
    },
    {
      productName: "Sporty SmartWatch",
      category: "MIZUNO",
      price: "99",
      image: "https://shoxstore.com.br/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/9/e/9e8fda5e.jpg",
    },
    {
      productName: "Camiseta Nike Corinthians Infantil",
      category: "NIKE",
      price: "179,99",
      image: "https://imgnike-a.akamaihd.net/768x768/027054ID.jpg",
    },
    {
      productName: "CHUTEIRA X CRAZYFAST.4 FUTSAL",
      category: "ADIDAS",
      price: "329,99",
      image: "https://assets.adidas.com/imagem/w_766,h_766,f_auto,q_auto,fl_lossy,c_fill,g_auto/1d04af992c0a46648c6dd89afda115c0_9366/chuteira-x-crazyfast.4-futsal.jpg",
    },
    {
      productName: "SHORTS NEYMAR JR FOOTBALL JUVENIL",
      category: "PUMA",
      price: "219,90",
      image: "https://imagem.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/658798/01/mod01/fnd/BRA/w/1000/h/1000/fmt/png",
    },
    {
      productName: "CHUTEIRA PREDATOR ACCURACY.4 FLEXIBLE",
      category: "ADIDAS",
      price: "649,99",
      image: "https://assets.adidas.com/imagem/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/e1453c0235a740ca839eaf7b0081f6ad_9366/Chuteira_Predator_Accuracy.4_Flexible_Preto_GW4605_01_standard_hover.jpg",
    },
    {
      productName: "CHUTEIRA DE CAMPO FUTURE PLAY NJR BDP",
      category: "PUMA",
      price: "499,90",
      image: "https://imagem.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/107800/01/sv01/fnd/BRA/w/1000/h/1000/fmt/png",
    },
    {
      productName: "Shorts Nike Dri-FIT Academy Masculino",
      category: "NIKE",
      price: "149,99",
      image: "https://imgnike-a.akamaihd.net/768x768/010700IM.jpg",
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

  let price = document.createElement("h6");
  price.innerText = "R$" + i.price;
  container.appendChild(price);
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