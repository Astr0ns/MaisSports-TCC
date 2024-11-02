$(document).ready(function(){
    var contador = $('#quantidade .contador span');

    var btn_quantidade_mais = $('#quantidade-mais');
    btn_quantidade_mais.on('click', funcao_incrementa);

    var btn_quantidade_menos = $('#quantidade-menos');
    btn_quantidade_menos.on('click', funcao_decrementa);

    function funcao_incrementa(){
        var contagem = parseInt(contador.text().trim(), 10);
        if (!isNaN(contagem)) {
            contador.text(contagem + 1);
        } else {
            contador.text(1); // Caso o valor inicial não seja um número, inicializa com 1
        }
    }

    function funcao_decrementa(){
        var contagem = parseInt(contador.text().trim(), 10);
        if (!isNaN(contagem) && contagem > 0) {
            contador.text(contagem - 1);
        } else {
            contador.text(0); // Caso o valor inicial não seja um número ou seja menor ou igual a zero, inicializa com 0
        }
    }
});
