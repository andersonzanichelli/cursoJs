var listaDeDescricoesDeTarefa = ['Curso JS', 'Curso css', 'Tomar café', 'tomar Agua'];

var listaTarefas = [
    {descricao: 'Curso JS', alerta: '8:20'},
    {descricao: 'Curso CSS', alerta: '8:25'},
    {descricao: 'Tomar café', alerta: '9:20'},
    {descricao: 'Tomar água', alerta: '10:90'}
];

// cache de objetos jQuery
var $tblListaTarefas = [];
var $templateLinhaListaTarefas = [];
var $frmAddTarefa = [];
var $inputIdTarefa = [];
var $inputDescricaoTarefa = [];
var $inputBusca = [];


// Executado toda vez que carrega o jquery
$(function(){
    console.log('Iniciando jquery');

    // inicialização de variaveis (cache)
    $tblListaTarefas = $('#tblListaTarefas');
    $inputIdTarefa = $('#idTarefa');
    $inputDescricaoTarefa = $('#descricaoTarefa');
    $inputDescricaoTarefa.val('');
    $templateLinhaListaTarefas = $('#templateLinhaListaTarefas');
    $inputBusca = $('#busca');

    // adiciona eventos ao botão edit de forma dinamica
    // TODO mostrar uma mensagem mais amigavel
    $($templateLinhaListaTarefas.find('#edit')).on('click', function(){
        var $btnEdit = $(this);
        var $tr = $btnEdit.closest('tr')
        var descricaoTarefa = $tr.find('td.descricaoTarefa').html();
        var idTarefa = $tr.attr('idRegistro');

        $inputIdTarefa.val(idTarefa);
        $inputDescricaoTarefa.val(descricaoTarefa);

    });

    // Remove um item da lista
    // TODO mostrar uma mensagem mais amigável
    $templateLinhaListaTarefas.find('#remove').on('click', function(){
        var $btnRemove = $(this);
        var $tr = $btnRemove.closest('tr')
        var descricaoTarefa = $tr.find('td.descricaoTarefa').html();
        var idTarefa = $tr.attr('idRegistro');
        listaDeDescricoesDeTarefa.splice(idTarefa, 1);
        preencheTabelaDeTarefas(listaDeDescricoesDeTarefa);
        new PNotify({
            title: 'Mensagem do sistema',
            text: "Tarefa '"+descricaoTarefa+ "' removida com sucesso!",
            icon: 'glyphicon glyphicon-envelope'
        });
    });


    $frmAddTarefa = $('#frmAddTarefa');

    $frmAddTarefa.on('submit', function(event){
        var mensagemRetorno = "Tarefa ";
        var tipoMensagem = "success";
        event.preventDefault();
        // pegar os valores do formulário
        var $form = $(this);

        // se form mandar via ajax, uso o serialize
        //var dadosFormulario = $form.serializeArray();

        var descricaoTarefa = $inputDescricaoTarefa.val();
        var idTarefa = $inputIdTarefa.val();

        console.log(['idTarefa', idTarefa, parseInt(idTarefa)]);

        if( descricaoTarefa.length < 1 ){
            mensagemRetorno += " não inserida, escreva algo!";
            tipoMensagem = 'error'
        } else {
            if(parseInt(idTarefa) > -1){ // ALTERA UMA MENSAGEM
                listaDeDescricoesDeTarefa[idTarefa] = descricaoTarefa;
                $inputIdTarefa.val('');
                $inputDescricaoTarefa.val('');
                mensagemRetorno += " <strong>"+descricaoTarefa+"<strong> Alterada com sucesso!";

            } else { // INCLUI UMA NOVA

                listaDeDescricoesDeTarefa.push(descricaoTarefa);
                $inputDescricaoTarefa.val('');
                mensagemRetorno += " <strong>"+descricaoTarefa+"<strong> Inserida com sucesso!";
            }
        }

        // TODO validar valores

        // TODO submter via ajax para o servidor

        // Mostrar a tabela atualizada
        preencheTabelaDeTarefas(listaDeDescricoesDeTarefa);

        // mostrar a resposta do servidor

        new PNotify({
            title: 'Mensagem do sistema',
            text: mensagemRetorno,
            icon: 'glyphicon glyphicon-envelope',
            type: tipoMensagem
        });
    });

    $inputBusca.on('keyup', function(event){


        if( this.value.length > 0){
            $tblListaTarefas.find('tbody tr').hide();
            $tblListaTarefas.find('tbody tr td.searchable:contains('+this.value+')').closest('tr').show();
        } else {
            $tblListaTarefas.find('tbody tr').show();;
        }

    });

    // chamadas a funções
    preencheTabelaDeTarefas(listaDeDescricoesDeTarefa, true);
});

//            $( document ).ready(function() {
//                console.log('Iniciando jquery');
//            });



/**
 *  Preencher a tabela de tarefas
 *
 *  param: Array de string com as tarefas
 *  param: boolean define se fará um fadein ao mostrar
 */
function preencheTabelaDeTarefas(listaTarefas, usaFade) {

    var $tbody = $tblListaTarefas.find('tbody');

    var linhas = $tbody.find('tr').not('#templateLinhaListaTarefas');
    linhas.remove();

    $.each(listaTarefas, function (i, descricao) {

        // cria a linha da tabela
        var $tr = $templateLinhaListaTarefas.clone(true);

        $tr.removeAttr('id');

        var tempo = 0;
        if(usaFade === true){
            tempo = 1500; // magic number !!!
        }
        $tr.show(tempo);

//        console.log(['tds',$tr.find('td')]);
        $tr.find('td.descricaoTarefa').html(descricao);

        // adiciona um id unico ao elemento
        $tr.attr('idRegistro', i);
        //jQuery.data($tr, 'idRegistro', i);


        $tbody.prepend($tr);
    });
}
