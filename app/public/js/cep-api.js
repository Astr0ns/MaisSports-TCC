$(document).ready(function() {

    function limpa_formulário_cep() {
        // Limpa valores do formulário de cep.
        $("#logradouro").val("");
        $("#bairro").val("");
        $("#cidade").val("");
        $("#estado").val("");
        $("#ibge").val("");
    }
    
    //Quando o campo cep perde o foco.
    $("#cep").blur(function() {

        //Nova variável "cep" somente com dígitos.
        var cep = $(this).val().replace(/\D/g, '');

        //Verifica se campo cep possui valor informado.
        if (cep != "") {

            //Expressão regular para validar o CEP.
            var validacep = /^[0-9]{8}$/;

            //Valida o formato do CEP.
            if(validacep.test(cep)) {

                //Preenche os campos com "..." enquanto consulta webservice.
                $("#logradouro").val("...");
                $("#bairro").val("...");
                $("#cidade").val("...");
                $("#estado").val("...");
                $("#ibge").val("...");

                //Consulta o webservice viacep.com.br/
                $.getJSON("https://viacep.com.br/ws/"+ cep +"/json/?callback=?", function(dados) {

                    if (!("erro" in dados)) {
                        //Atualiza os campos com os valores da consulta.
                        $("#logradouro").val(dados.logradouro);
                        $("#bairro").val(dados.bairro);
                        $("#cidade").val(dados.localidade);
                        $("#estado").val(dados.estado);
                        $("#ibge").val(dados.ibge);
                    } //end if.
                    else {
                        //CEP pesquisado não foi encontrado.
                        limpa_formulário_cep();
                        alert("CEP não encontrado.");
                    }
                });
            } //end if.
            else {
                //cep é inválido.
                limpa_formulário_cep();
                alert("Formato de CEP inválido.");
            }
        } //end if.
        else {
            //cep sem valor, limpa formulário.
            limpa_formulário_cep();
        }
    });
});

function limpa_formulari_cep(){
    // limpa valores do formulario
    document.getElementById('logradouro').value= ("");
    document.getElementById('bairro').value= ("");
    document.getElementById('cidade').value= ("");
    document.getElementById('estado').value= ("");
}

function meu_callback(conteudo){
    if(!("erro" in conteudo)){
        // Atualiza os campos com os valores
        document.getElementById('logradouro').value= (conteudo.logradouro);
    document.getElementById('bairro').value= (conteudo.bairro);
    document.getElementById('cidade').value= (conteudo.localidade);
    document.getElementById('estado').value= (conteudo.estado);
    } //end if
    else{
        //CEP não encontrado
        limpa_formulario_cep();
        notify("Aviso", "CEP não encontrado", "Warning", "center")
    }
}
