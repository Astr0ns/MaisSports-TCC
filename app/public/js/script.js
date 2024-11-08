class MobileNavbar {
  constructor(mobileMenu, navList, navLinks) {
    this.mobileMenu = document.querySelector(mobileMenu);
    this.navList = document.querySelector(navList);
    this.navLinks = document.querySelectorAll(navLinks);
    this.activeClass = "active";

    this.handleClick = this.handleClick.bind(this);
  }

  animateLinks() {
    this.navLinks.forEach((link, index) => {
      link.style.animation
        ? (link.style.animation = "")
        : (link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`);
    });
  }

  handleClick() {
    // Alterna a classe 'active' no navList e no mobileMenu
    this.navList.classList.toggle(this.activeClass);
    this.mobileMenu.classList.toggle(this.activeClass);
    this.animateLinks();

    // Modifica o overflow do body com base no estado do menu
    if (this.navList.classList.contains(this.activeClass)) {
      document.body.style.overflow = "hidden"; // Desativa o scroll
    } else {
      document.body.style.overflow = "auto"; // Ativa o scroll
    }
  }

  addClickEvent() {
    this.mobileMenu.addEventListener("click", this.handleClick);
  }

  init() {
    if (this.mobileMenu) {
      this.addClickEvent();
    }
    return this;
  }
}

// Inicializando a classe MobileNavbar
const mobileNavbar = new MobileNavbar(
  ".mobile-menu", // Seletor do botão de menu
  ".nav-list", // Seletor da lista de navegação
  ".nav-list li" // Seletor dos links dentro da navbar
);
mobileNavbar.init();
