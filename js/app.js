/**
 *  Para finalidades de teste, criamos uma variavel para atribuir valores e
 *  avalia-los em tempo de desenvolvimento
 */
var area51 = {};

/**
 *
 *  Exemplo de agenda criada com jquery
 *    - Como não temos acesso a um servidor (backend), nossos dados ficam em um objeto local
 *    - Pelo mesmo motivo, ao incluir ou remover, faremos uma chamada ajax, que sempre nos retorna
 *      um mesmo resultado, OK para adição ou remoção, porem removemos da lista local
 *    - Não utilizamos webstorage por causa do tempo que tivemos
 *    - O script possui várias instruções de "console.log" que deve ser evitada em codígo de produção
 *      ou seja é util somente em desenvolvimento, ao enviar para produção devem ser removidas.
 *    - Aqui crio um Modulo chamado AgendaTarefas e passo para o jQuery, isso facilita testes e define melhor o escopo
 *    - No console posso acessá-lo usando AgendaTarefas.listaTarefas
 */
var AgendaTarefas = {

    // Definimos as urls para integração com o servidor
    // observe que estamos passando a extesao, mas somente pq estamos
    // interagindo com arquivos locais, diversas tecnologias de backend
    // nos permitem não informar a extensão
    url: "/dados.json",
    urlRemocao: "/removeItem.json",
    urlSalva: "/salvaItem.json",


    // Usaremos uma variável para armazenamos os dados retornados pelo servidor,
    // centralizando todo processamento nesta
    listaTarefas: [],

    // cache de objetos jQuery, evita que façamos um find no DOM a cada vez que precisemos usar um dos elementos
    $tblListaTarefas: [],
    $templateLinhaListaTarefas: [],
    $frmAddTarefa: [],
    $inputTarefaId: [],
    $inputTarefaDescricao: [],
    $inputTarefaHora: [],
    $inputTarefaConcluida: [],
    $inputBusca: [],


    // Inicia a agenda
    init: function () {
        console.log('Iniciando agenda tarefas');

        //------- INICIA CACHE DE ELEMENTOS ----------

        AgendaTarefas.$tblListaTarefas = $('#tblListaTarefas');
        AgendaTarefas.$inputTarefaId = $('#tarefaId');
        AgendaTarefas.$inputTarefaDescricao = $('#tarefaDescricao');
        AgendaTarefas.$inputTarefaDescricao.val('');

        AgendaTarefas.$inputTarefaHora = $('#tarefaHora');

        AgendaTarefas.$inputTarefaConcluida = $('#tarefaConcluida');

        AgendaTarefas.$inputBusca = $('#busca');

        AgendaTarefas.$templateLinhaListaTarefas = $('#templateLinhaListaTarefas');

        AgendaTarefas.$frmAddTarefa = $('#frmAddTarefa');




        // ------ BIND DE EVENTOS NOS ELEMENTOS --------

        // O imput tarefa é um componente do tipo time do nosso plugin
        // o plugin irá disparar um evento error, quando não passar na
        // validação, então tratamos esse evento aqui.
        AgendaTarefas.$inputTarefaHora.on('error', function (event, data) {
            new PNotify({
                title: 'Mensagem do sistema',
                text: data.message,
                icon: 'glyphicon glyphicon-envelope'
            });
        });

        // adiciona eventos ao botão edit de forma dinamica
        // TODO mostrar uma mensagem mais amigavel
        $(AgendaTarefas.$templateLinhaListaTarefas.find('#edit')).on('click', function () {
            var $btnEdit = $(this);
            var $tr = $btnEdit.closest('tr')
            var tarefaId = $tr.attr('idRegistro');

            var tarefa = AgendaTarefas.listaTarefas[tarefaId];

            AgendaTarefas.$inputTarefaId.val(tarefaId);
            AgendaTarefas.$inputTarefaDescricao.val(tarefa.descricao);
            AgendaTarefas.$inputTarefaHora.val(tarefa.hora);
            AgendaTarefas.$inputTarefaConcluida.prop('checked', (tarefa.concluida === 'true') ? true : false);

        });

        // Remove um item da lista
        // TODO mostrar uma mensagem mais amigável
        AgendaTarefas.$templateLinhaListaTarefas.find('#remove').on('click', function () {
            var $btnRemove = $(this);
            var $tr = $btnRemove.closest('tr');
            var tarefaDescricao = $tr.find('td.tarefaDescricao').html();
            var tarefaId = $tr.attr('idRegistro');

            AgendaTarefas.deleteItem(tarefaId);

        });

        AgendaTarefas.$frmAddTarefa.on('submit', function (event) {
            var mensagemRetorno = "Tarefa ";
            var tipoMensagem = "success";
            event.preventDefault();
            // pegar os valores do formulário
            var $form = $(this);

            // se form mandar via ajax, uso o serialize
            //var dadosFormulario = $form.serializeArray();

            var tarefaId = AgendaTarefas.$inputTarefaId.val();
            var tarefaDescricao = AgendaTarefas.$inputTarefaDescricao.val();
            var tarefaHora = AgendaTarefas.$inputTarefaHora.val();
            var tarefaConcluida = AgendaTarefas.$inputTarefaConcluida.val();


            if (tarefaDescricao.length < 1) {
                mensagemRetorno += " não inserida, escreva algo!";
                tipoMensagem = 'error'
            } else {
                var tarefa = {
                    "descricao": tarefaDescricao,
                    "hora": tarefaHora,
                    "concluida": tarefaConcluida
                };
                if (parseInt(tarefaId) > -1) { // ALTERA UMA MENSAGEM
                    AgendaTarefas.listaTarefas[tarefaId] = tarefa;

                    mensagemRetorno += " <strong>" + tarefaDescricao + "<strong> Alterada com sucesso!";

                } else { // INCLUI UMA NOVA

                    AgendaTarefas.listaTarefas.push(tarefa);
                    mensagemRetorno += " <strong>" + tarefaDescricao + "<strong> Inserida com sucesso!";
                }

                // Limpa os campos
                AgendaTarefas.$inputTarefaId.val('');
                AgendaTarefas.$inputTarefaDescricao.val('');
                AgendaTarefas.$inputTarefaHora.val('');
                AgendaTarefas.$inputTarefaConcluida.checked = false;
            }

            // Mostrar a tabela atualizada
            AgendaTarefas.preencheTabelaDeTarefas();

            // mostrar a resposta do servidor

            new PNotify({
                title: 'Mensagem do sistema',
                text: mensagemRetorno,
                icon: 'glyphicon glyphicon-envelope',
                type: tipoMensagem
            });
        });

        AgendaTarefas.$inputBusca.attr('title', 'Realiza uma busca local nas tarefas usando seletores jQuery, para esconder os resultados não desejados!')
        AgendaTarefas.$inputBusca.on('keyup', function (event) {

            // REALIZA UMA BUSCA COM SELETORES

            // valida se existe a query de busca
            if (this.value.length > 0) {

                // usado se estivesse usando um app de backend
                //AgendaTarefas.atualizaDados(this.value);

                // se estiver trazendo do servidor isso sai fora
                AgendaTarefas.$tblListaTarefas.find('tbody tr').hide();
                AgendaTarefas.$tblListaTarefas.find('tbody tr td.searchable:contains(' + this.value + ')').closest('tr').show();
            } else {
                AgendaTarefas.$tblListaTarefas.find('tbody tr').not('#templateLinhaListaTarefas').show();;
            }

        });

        //---------- chamadas a funções ------------

        // Ao iniciar já pedimos para pegar os dados do servidor (dados.json)
        AgendaTarefas.atualizaDados();
        console.log('Iniciado.');
    },

    /**
     *  Remove um item da lista de tarefas
     *  Enviando a mensagem de remoção ao servidor
     *  id identificador do registro
     */
    deleteItem: function (id) {

        $.ajax({
                url: AgendaTarefas.urlRemocao,
                data: {
                    'query': this.value
                },
                type: 'GET',
                dataType: 'JSON'
            }).done(function (data) {

                if (data.result === 'true') {

                    AgendaTarefas.listaTarefas.splice(id, 1); // ESTA LINHA REMOVE DA LISTA LOCAL, ESTAMOS FAZENDO ISSO POR ESTAR OFFLINE
                    AgendaTarefas.preencheTabelaDeTarefas();

                    new PNotify({
                        title: 'Mensagem do sistema',
                        text: data.mensagem,
                        icon: 'glyphicon glyphicon-envelope'
                    });

                }

            })
            .fail(function () {
                AgendaTarefas.listaTarefas = []
                console.log("error");
                new PNotify({
                    title: 'Mensagem do sistema',
                    text: "Não foi possível remover a tarefa da agenda!",
                    icon: 'glyphicon glyphicon-envelope',
                    type: 'error'
                });
            })
            .always(function (data) {
                console.log(["complete", data]);
            });
    },

    /**
     *  Busca os dados no servidor via ajax (estamos pegando de um arquivo dados.json)
     *  query: string contendo a busca a ser realizada
     */
    atualizaDados: function (query) {
        $.ajax({
                url: AgendaTarefas.url,
                data: {
                    'query': this.value
                },
                type: 'GET',
                dataType: 'JSON'
            }).done(function (data) {
                console.log(['success', data])
                AgendaTarefas.listaTarefas = data;
            })
            .fail(function () {
                AgendaTarefas.listaTarefas = []
                console.log("error");
                new PNotify({
                    title: 'Mensagem do sistema',
                    text: "Ocorreu um erro ao atualizar a agenda!",
                    icon: 'glyphicon glyphicon-envelope',
                    type: 'error'
                });
            })
            .always(function (data) {
                console.log(["complete", data]);
                // Precisa se executado sempre que mudar a lista de tarefas
                // ou seja retrornando valor ou não
                AgendaTarefas.preencheTabelaDeTarefas(true);
            });
        // se colocarmos a instrução para preencher a lista de tarefas aqui
        // não será preenchida, pode testar, porque é um evento assincrono que não ocorre
        // na mesma ordem da function, pois aguarda a resposta do o servidor (dados.json)
    },

    /**
     *  Preencher a tabela de tarefas
     *
     *  param: Array de string com as tarefas
     *  param: boolean define se fará um fadein ao mostrar
     */
    preencheTabelaDeTarefas: function (usaFade) {
        var $tbody = AgendaTarefas.$tblListaTarefas.find('tbody');

        var linhas = $tbody.find('tr').not('#templateLinhaListaTarefas');
        linhas.remove();

        if (AgendaTarefas.listaTarefas.length === 0) {

            var $td = $('<td>').attr({
                'colspan': 5
            }).append('<p class="text-info align-center">Adicione novas tarefas!</p>');
            $tbody.prepend($('<tr>').append($td));

        } else {

            $.each(AgendaTarefas.listaTarefas, function (i, tarefa) {

                // cria a linha da tabela
                var $tr = AgendaTarefas.$templateLinhaListaTarefas.clone(true);

                $tr.removeAttr('id');

                var tempo = 0;
                if (usaFade === true) {
                    tempo = 1500; // magic number !!!
                }
                $tr.show(tempo);

                $tr.find('td.tarefaDescricao').html(tarefa.descricao);
                $tr.find('td.tarefaHora').html(tarefa.hora);
                $tr.find('td.tarefaConcluida').html((tarefa.concluida === 'true') ? 'Sim' : 'Não');

                // adiciona um id unico ao elemento
                $tr.attr('idRegistro', i);
                //jQuery.data($tr, 'idRegistro', i);

                $tbody.prepend($tr);
            });
        }
    }
}


/**
 *  Inicia a Agenda ao termino do carregamento do jQuery
 */

$(AgendaTarefas.init);
// --- ou --
// $(function() { AgendaTarefas.init(); });


/**
 *  O seletor contains do jQuery é case sensitive conforme a documentação
 *  http://api.jquery.com/contains-selector/
 *  O trecho de código abaixo sobrescreve o seletor contais para que ele seja case insensitive
 *  e possamos realizar a busca sem nos preocupar em colocar exatamente a palavra correta.
 */
$.expr[":"].contains = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});
