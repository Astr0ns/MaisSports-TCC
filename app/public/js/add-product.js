document.addEventListener('DOMContentLoaded', function() {
    const plans = document.querySelectorAll('input[type="radio"]');

    // Garantir que o primeiro plano fique marcado inicialmente
    const firstPlan = document.querySelector('.plan');
    
    firstPlan.classList.add('selected');
    firstPlan.querySelector('.bi-circle').style.display = 'none';
    firstPlan.querySelector('.bi-check-circle-fill').style.display = 'inline-block';

    plans.forEach(plan => {
        plan.addEventListener('change', function() {
            // Remove 'selected' class de todos os planos e reseta os ícones
            document.querySelectorAll('.plan').forEach(p => {
                p.classList.remove('selected');
                p.querySelector('.bi-circle').style.display = 'inline-block';
                p.querySelector('.bi-check-circle-fill').style.display = 'none';
                p.style.backgroundColor = "initial"; // Resetando a cor do plano
            });

            // Adiciona 'selected' class ao plano selecionado
            const selectedPlanElement = this.parentElement;
            selectedPlanElement.classList.add('selected');
            selectedPlanElement.querySelector('.bi-circle').style.display = 'none';
            selectedPlanElement.querySelector('.bi-check-circle-fill').style.display = 'inline-block';
            const corSelected = document.querySelector('.corSelected').innerHTML
            selectedPlanElement.style.backgroundColor = corSelected; // Define a cor do plano selecionado
            console.log("viado")
        });
    });
});

function selectBlack() {
    // Mudar o background do body
    document.body.style.backgroundColor = "#010c1aa9";
    
    // Mudar o background da seção assinatura-data
    document.querySelector(".card").style.backgroundColor = "#010c1a8e";

    // assinatura informações
    document.querySelector(".assinatura-info").style.backgroundColor = "#010c1a";
    document.querySelector(".assinatura-info").style.color = "#fff";
    document.querySelector(".assinatura-info h2").style.color = "#f72ba5";

    document.querySelector(".assinatura-info h3 i").style.color = "#f72ba5";

    document.querySelector(".assinatura-data").style.backgroundColor = "rgb(4, 20, 41)";
    document.querySelector(".plan").style.backgroundColor = "rgb(4, 20, 41)";

    const corSelctedBlack = "rgb(17, 53, 100)";
    document.querySelector('.corSelected').innerHTML = corSelctedBlack
    document.querySelector("#card-black").style.display = "flex";
    document.querySelector("#card-medio").style.display = "none";
    document.querySelector("#card-basico").style.display = "none";
}

function selectMedio() {
    // Mudar o background do body
    document.body.style.backgroundColor = "#010c1aa9";
    
    // Mudar o background da seção assinatura-data
    document.querySelector(".card").style.backgroundColor = "#010c1a8e";

    // assinatura informações
    document.querySelector(".assinatura-info").style.backgroundColor = "#2763b1";
    document.querySelector(".assinatura-info").style.color = "#fff";
    document.querySelector(".assinatura-info h2").style.color = "#f72ba5";

    document.querySelector(".assinatura-info h3 i").style.color = "#f72ba5";

    document.querySelector(".assinatura-data").style.backgroundColor = "rgb(4, 20, 41)";
    document.querySelector(".plan").style.backgroundColor = "rgb(4, 20, 41)";

    const corSelctedBlack = "rgb(17, 53, 100)";
    document.querySelector('.corSelected').innerHTML = corSelctedBlack
    document.querySelector("#card-black").style.display = "none";
    document.querySelector("#card-medio").style.display = "flex";
    document.querySelector("#card-basico").style.display = "none";
}

function selectNormal() {
    // Mudar o background do body
    document.body.style.backgroundColor = "#010c1aa9";
    
    // Mudar o background da seção assinatura-data
    document.querySelector(".card").style.backgroundColor = "#010c1a8e";

    // assinatura informações
    document.querySelector(".assinatura-info").style.backgroundColor = "#010c1a";
    document.querySelector(".assinatura-info").style.color = "#fff";
    document.querySelector(".assinatura-info h2").style.color = "#f72ba5";

    document.querySelector(".assinatura-info h3 i").style.color = "#f72ba5";

    document.querySelector(".assinatura-data").style.backgroundColor = "rgb(4, 20, 41)";
    document.querySelector(".plan").style.backgroundColor = "rgb(4, 20, 41)";

    const corSelctedBlack = "rgb(17, 53, 100)";
    document.querySelector('.corSelected').innerHTML = corSelctedBlack
    document.querySelector("#card-black").style.display = "none";
    document.querySelector("#card-medio").style.display = "none";
    document.querySelector("#card-basico").style.display = "flex";
}


document.addEventListener("DOMContentLoaded", function() {
    const tipoProdSelect = document.querySelector('.tipo_prod');
    const roupaProdSection = document.getElementById('roupa_prod');
    const roupaSelect = document.querySelector('select[name="roupa_prod"]');

    tipoProdSelect.addEventListener('change', function() {
        if (this.value === 'roupa') {
            roupaProdSection.style.display = 'block';
        } else {
            roupaProdSection.style.display = 'none';
            roupaSelect.selectedIndex = 0; // Reseta para "Selecione"
        }
    });
});

