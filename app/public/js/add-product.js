

document.addEventListener('DOMContentLoaded', initPlanSelection);

function initPlanSelection() {
    const plans = document.querySelectorAll('input[type="radio"]');
    
    // Garantir que o primeiro plano fique marcado inicialmente
    const firstPlan = document.querySelector('.plan');
    selectPlan(firstPlan); // Marcar o primeiro plano como selecionado

    plans.forEach(plan => {
        plan.addEventListener('change', function() {
            selectPlan(this.parentElement);
        });
    });
}

function selectPlan(selectedPlanElement) {
    // Remove 'selected' class de todos os planos e reseta os ícones
    document.querySelectorAll('.plan').forEach(p => {
        p.classList.remove('selected');
        p.querySelector('.bi-circle').style.display = 'inline-block';
        p.querySelector('.bi-check-circle-fill').style.display = 'none';
        p.style.backgroundColor = "initial"; // Resetando a cor do plano
    });

    // Adiciona 'selected' class ao plano selecionado
    selectedPlanElement.classList.add('selected');
    selectedPlanElement.querySelector('.bi-circle').style.display = 'none';
    selectedPlanElement.querySelector('.bi-check-circle-fill').style.display = 'inline-block';
    const corSelected = document.querySelector('.corSelected').innerHTML;
    selectedPlanElement.style.backgroundColor = corSelected; // Define a cor do plano selecionado
    // Aqui, busque o input de rádio associado
    const selectedInput = selectedPlanElement.querySelector('input[type="radio"]');
    
   
    if (selectedInput.value >= 30) {
        document.getElementById("duracao_plano").innerHTML = `Plano de ${selectedInput.value / 30} Meses`;
    } else {
        document.getElementById("duracao_plano").innerHTML = `Plano de ${selectedInput.value} Dias`;
   }
}


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

    const CorFundoAssinaturaData = document.querySelectorAll(".assinatura-data")
    CorFundoAssinaturaData.forEach(cor => {
        cor.style.backgroundColor = "rgb(4, 20, 41)";
    });

    document.querySelector(".plan").style.backgroundColor = "rgb(4, 20, 41)";
    const prices = document.querySelectorAll(".plan .price");
    prices.forEach(price => {
        price.style.color = "#fff";
    });

    const corSelctedBlack = "rgb(17, 53, 100)";
    document.querySelector('.corSelected').innerHTML = corSelctedBlack
    document.querySelector("#card-black").style.display = "flex";
    document.querySelector("#card-medio").style.display = "none";
    document.querySelector("#card-basico").style.display = "none";

    document.querySelector('.confirmarPagamento .assinatura-data h2').innerHTML = "10 É FAIXA";

    const selectedPlan = document.querySelector('.selected');
    if (selectedPlan) {
        selectPlan(selectedPlan);
    }

    const idPlanoSelected = document.getElementById('idPlano');
    idPlanoSelected.value = 1; // Atualiza o valor no campo oculto

    saberPreco(3.5)

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

    const CorFundoAssinaturaData = document.querySelectorAll(".assinatura-data")
    CorFundoAssinaturaData.forEach(cor => {
        cor.style.backgroundColor = "rgb(4, 20, 41)";
    });
    document.querySelector(".plan").style.backgroundColor = "rgb(4, 20, 41)";
    const prices = document.querySelectorAll(".plan .price");
    prices.forEach(price => {
        price.style.color = "#fff";
    });

    const corSelctedBlack = "rgb(11, 80, 170)";
    document.querySelector('.corSelected').innerHTML = corSelctedBlack
    document.querySelector("#card-black").style.display = "none";
    document.querySelector("#card-medio").style.display = "flex";
    document.querySelector("#card-basico").style.display = "none";

    document.querySelector('.confirmarPagamento .assinatura-data h2').innerHTML = "CRAQUE";

    const selectedPlan = document.querySelector('.selected');
    if (selectedPlan) {
        selectPlan(selectedPlan);
    }

    const idPlanoSelected = document.getElementById('idPlano');
    idPlanoSelected.value = 2; // Atualiza o valor no campo oculto

    saberPreco(2.5)
}

function selectNormal() {
    // Mudar o background do body
    document.body.style.backgroundColor = "#fff";
    
    // Mudar o background da seção assinatura-data
    document.querySelector(".card").style.backgroundColor = "#f5f5f5";

    // assinatura informações
    document.querySelector(".assinatura-info").style.backgroundColor = "#fff";
    document.querySelector(".assinatura-info").style.color = "#000";
    document.querySelector(".assinatura-info h2").style.color = "#f72ba5";

    document.querySelector(".assinatura-info h3 i").style.color = "#f72ba5";

    
    const CorFundoAssinaturaData = document.querySelectorAll(".assinatura-data")
    CorFundoAssinaturaData.forEach(cor => {
        cor.style.backgroundColor = "#f5f5f5";
    });
    document.querySelector(".plan").style.backgroundColor = "#f5f5f5";
    const prices = document.querySelectorAll(".plan .price");
    prices.forEach(price => {
        price.style.color = "#000";
    });

    const corSelctedBlack = "rgba(107, 107, 107, .1)";
    document.querySelector('.corSelected').innerHTML = corSelctedBlack
    document.querySelector("#card-black").style.display = "none";
    document.querySelector("#card-medio").style.display = "none";
    document.querySelector("#card-basico").style.display = "flex";

    document.querySelector('.confirmarPagamento .assinatura-data h2').innerHTML = "BASICO";

    const selectedPlan = document.querySelector('.selected');
    if (selectedPlan) {
        selectPlan(selectedPlan);
    }

    const idPlanoSelected = document.getElementById('idPlano');
    idPlanoSelected.value = 3; // Atualiza o valor no campo oculto

    saberPreco(1.5);


}


function saberPreco(valorDia) {
    const dias = [7, 30, 90];
    const desconto = [0.9, 0.85];
    

    const precoLista = [
        dias[0] * valorDia,
        dias[1] * valorDia * desconto[0],
        dias[2] * valorDia * desconto[1]
    ];
    const precoListaSemDesc = [
        dias[0] * valorDia,
        dias[1] * valorDia,
        dias[2] * valorDia
    ];
    const prices = document.querySelectorAll(".price");

    prices.forEach((priceElement, index) => {
        if(index == 0){
            priceElement.innerHTML = `<span></span>R$${precoLista[index].toFixed(2)}`;
        } else {
            priceElement.innerHTML = `<span>R$${precoListaSemDesc[index].toFixed(2)}</span> <br>R$${precoLista[index].toFixed(2)}`;
        }

    });

    

}

function NextAddProduct(num_page) {

    // essa parte so chega se os campo estão preenchidos corretamente
    if (num_page === 2) {
        // Validação dos campos
        const tituloProd = document.getElementById('titulo_prod').value.trim();
        const categoriaProd = document.querySelector('select[name="categoria_prod"]').value;
        const tipoProd = document.querySelector('select[name="tipo_prod"]').value;
        const valorProd = document.getElementById('valor_prod').value.trim();
        const linkProd = document.getElementById('link_prod').value.trim();
        const descricaoProd = document.getElementById('descricao_prod').value.trim();

        // Verifica se todos os campos obrigatórios estão preenchidos
        if (!tituloProd || !categoriaProd || !tipoProd || !valorProd || !linkProd || !descricaoProd) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return; // Impede a transição para a próxima página
        }
    }

    // Esconder a seção atual
    if(num_page == 1){
        document.querySelector('.assinatura-page').classList.add('desativar_container');
        document.querySelector('.assinatura-page').classList.remove('assinatura-page');

        document.querySelector('#product-card-stl').classList.add('product-card');
        document.querySelector('#product-card-stl').classList.remove('desativar_container');
        
        document.querySelector('#product-info-stl').classList.add('product-info');
        document.querySelector('#product-info-stl').classList.remove('desativar_container');

        document.body.style.backgroundColor = "#fff";
        document.querySelector(".card").style.backgroundColor = "#f5f5f5";

    } else if (num_page == 2){

        document.querySelector('#product-card-stl').classList.remove('product-card');
        document.querySelector('#product-card-stl').classList.add('desativar_container');
        
        document.querySelector('#product-info-stl').classList.remove('product-info');
        document.querySelector('#product-info-stl').classList.add('desativar_container');

        document.querySelector(".finalizar-add-product").style.display = "flex";

        document.querySelector(".nomeProdForm").innerHTML = document.getElementById("titulo_prod").value;
        document.querySelector(".preco p").innerHTML = `R$ ${document.getElementById("valor_prod").value} à vista`;
        
        const selectedInput = document.querySelector('.selected .price span').innerHTML;
        const selectedInput2 = document.querySelector('.selected .price').innerHTML;

        const resultado = selectedInput2.replace(selectedInput, '').trim();



        // Função para extrair o número
        function extrairNumero(s) {
            // Remove tudo que não é dígito ou ponto
            return s.replace(/[^0-9.]+/g, '');
        }

        // Extraindo o número
        const numeroExtraido = extrairNumero(resultado);

        
        document.querySelector('.confirmarText p span').innerHTML = numeroExtraido;

        const valorPlanoSelected = document.getElementById('valorPlano');
        valorPlanoSelected.value = parseFloat(numeroExtraido); // Atualiza o valor no campo oculto
        

    }
    

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
    roupaSelect.addEventListener('change', function() {
        const selectedValue = this.value;

        if (selectedValue === 'calcados') {
            document.querySelector(".tam-roupa").style.display = "none";
            document.querySelector(".tam-calcado").style.display = "grid";
            document.querySelector(".tam-inf").style.display = "block";
            
        
            // Adicione o código que você tem para calçados aqui

        } else if (selectedValue === 'acessorio') {
            document.querySelector(".tam-calcado").style.display = "none";
            document.querySelector(".tam-inf").style.display = "none";
            document.querySelector(".tam-roupa").style.display = "none";
       
            return
            // Adicione o código que você tem para acessórios aqui

        } else if (selectedValue !== ""){
            document.querySelector(".tam-calcado").style.display = "none";
            document.querySelector(".tam-inf").style.display = "block";
            document.querySelector(".tam-roupa").style.display = "grid";
  
            // Adicione o código que você tem para outras peças de roupa aqui
        }
    });
});



