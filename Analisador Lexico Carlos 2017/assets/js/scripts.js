var Tokens = [];
var Estados = [[]];
var EstadoGlobal = 0;
var EstadoIteracao = [0];
var Tabela = [];

function insereToken(){
	var token = $("#input-insere").val();
	if(token) { //Testa se tem algo escrito(válido)
		if (Tokens.indexOf(token) < 0 && token.length > 0) { // fazer o teste se ja existe a palavra no dicionario
			$("#table-tokens").append("<tr class=tk-"+token+"><td>"+token+"</td><td><span class='badge badge-danger badge-icon' onclick=\"removeToken('"+token+"')\"><i class='fa fa-times' aria-hidden='true'></i><span>Remover</span></span></td></tr>")
			Tokens.push(token);
			$("#input-insere").val("");
		}
	}
	monta_estados();
	Tabela = gerar_linhas();
	tabela_para_html(Tabela);

	$('#buscar').keyup(function(e){
		if(Tabela.length > 0){
			valida_palavra(e);
		}
	});
}


/** function lettersOnly(evt) {
    evt = (evt) ? evt : event;
    var charCode = (evt.charCode) ? evt.charCode : ((evt.keyCode) ? evt.keyCode :
        ((evt.which) ? evt.which : 0));
    if (charCode > 31 && (charCode < 65 || charCode > 90) &&
        (charCode < 97 || charCode > 122)) {
        alert("Digite apenas Letras de a-z.");
        return false;
    }
    return true;
}
*/

function removeToken(token){
	var index = Tokens.indexOf(token);
	if (index >= 0 && token.length > 0) {
		Tokens.splice(index, 1);
		$(".tk-"+token).hide();
	}

	//Limpa tudo e refaz
	$("#automato").html("");
	Estados = [[]];
	EstadoGlobal = 0;
	EstadoIteracao = [0];
	Tabela = [];
	monta_estados();
	Tabela = gerar_linhas();
	tabela_para_html(Tabela);
}


 // aqui ele monta os estados apartir dos tokens que foram digitados
 
function monta_estados(){
	for (var i = 0; i < Tokens.length; i++) {
		var estado_atual = 0;
		var palavra_vetor = Tokens[i];
		for(var j = 0; j < palavra_vetor.length; j++){
			if(typeof Estados[estado_atual][palavra_vetor[j]] === 'undefined'){
				var proximo_estado = EstadoGlobal + 1;
				Estados[estado_atual][palavra_vetor[j]] = proximo_estado;
				Estados[proximo_estado] = [];
				EstadoGlobal = estado_atual = proximo_estado;
			} else {
				estado_atual = Estados[estado_atual][palavra_vetor[j]];
			}

			if(j == palavra_vetor.length - 1){
				Estados[estado_atual]['final'] = true;
			}
		};
	};
}

// monta as linhas da tabela

function gerar_linhas(){
	var vetor_estados = [];
	for (var i = 0; i < Estados.length; i++) {
		var aux = [];
		aux['estado'] = i;
		var primeiro = 'a';
		var ultimo = 'z';
		for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
			var letra = String.fromCharCode(j);
			if(typeof Estados[i][letra] === 'undefined'){
				aux[letra] = '-'
			} else {
				aux[letra] = Estados[i][letra]
			}
		}
		if(typeof Estados[i]['final'] !== 'undefined'){
			aux['final'] = true;
		}
		vetor_estados.push(aux);
	};
	console.log(vetor_estados);
	return vetor_estados;
}

// monta a tabela no html 

function tabela_para_html(vetor_estados){
	tabela = $('#automato');
	tabela.html('');
	// Define o cabeçalho da tabela
	var tr = $( document.createElement('tr') );
	var th = $( document.createElement('th') );
	th.html('Estado'); // Adiciona o titulo da coluna de estado
	tr.append(th);
	var primeiro = 'a';
	var ultimo = 'z';
	for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) { // Adiciona todas as letras no cabeçalho da tabela
		var th = $( document.createElement('th') );
		th.html(String.fromCharCode(j));
		tr.append(th);
	}
	tabela.append(tr);

	// Itera entre os estados
	for(var i = 0; i < vetor_estados.length; i++){
		var tr = $( document.createElement('tr') ); // Cria uma nova linha para cada estado
		var td = $( document.createElement('td') ); // Cria a celula do estado
		if(vetor_estados[i]['final']){
			td.html('q' + vetor_estados[i]['estado'] + '*');
		} else {
			td.html('q' + vetor_estados[i]['estado']);
		}
		tr.append(td);
		tr.addClass('estado_'+vetor_estados[i]['estado']);
		var primeiro = 'a';
		var ultimo = 'z';
		for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
			var letra = String.fromCharCode(j);
			var td = $( document.createElement('td') );
			td.addClass('letra_'+letra);
			if(vetor_estados[i][letra] != '-'){
				td.html('q' + vetor_estados[i][letra]);
			}
			tr.append(td);
		}
		tabela.append(tr);
	}
}

// faz a validação das linhas digitas no insere 
function valida_palavra(event){
	var primeiro = 'a'; // se é valido o que foi digitado
	var ultimo = 'z';
	var palavras = $('#buscar').val(); // pega os valores do campo
	if(palavras.length == 0){ // se for vazio reseta a tabela
		$('#box').removeClass('acerto');
		$('#box').removeClass('erro');
		$('#automato tr').removeClass('estado_selecionado');
		$('#automato td').removeClass('letra_selecionada');
	}
	var estado = 0; // estado inicial
	var letter_error = false;
	for (var i = 0; i < palavras.length; i++) {
		// verifica se o que foi digitado é valido conforme esta no dicionario de a-z 
		if(palavras[i].charCodeAt(0) >= primeiro.charCodeAt(0) && palavras[i].charCodeAt(0) <= ultimo.charCodeAt(0) && letter_error == false){
			highlightState(estado, palavras[i]);
			if(Tabela[estado][palavras[i]] != '-'){ // se o estado nao for de erro ele aceita
				estado = Tabela[estado][palavras[i]];
				inAccept();
			} else { // Rejeita caso o estado seja de erro
				inError();
				letter_error = true;
				// break;
			}
		} else if(palavras[i] == ' '){ // Caso tenha digitado um espaço
			if (letter_error == false) {
				if (Tabela[estado]['final']) { //Se o estado for final da Encontrado se não da Estado não final
					$("#table-search").append("<tr><td>"+palavras+"</td><td><span class='badge badge-success badge-icon'><i class='fa fa-check' aria-hidden='true'></i><span>Encontrada</span></span></td></tr>")
				} else {
					$("#table-search").append("<tr><td>"+palavras+"</td><td><span class='badge badge-warning badge-icon'><i class='fa fa-times' aria-hidden='true'></i><span>Estado não final</span></span></td></tr>")
				}
			} else {
				$("#table-search").append("<tr><td>"+palavras+"</td><td><span class='badge badge-danger badge-icon'><i class='fa fa-times' aria-hidden='true'></i><span>Não Encontrada</span></span></td></tr>")
			}
			$('#box').removeClass('acerto');
			$('#box').removeClass('erro');
			$('#automato tr').removeClass('estado_selecionado');
			$('#automato td').removeClass('letra_selecionada');
			$('#buscar').val("");
		} else if(letter_error == false) {
			inError();
			alert('Caractere Inválido: ' + palavras[i]); // Se for digitado um caractere fora do epaço de a até z ele dá mensagem dizendo é inválido
			// break;
		}
	};
}

function inError(){
	$('#box').removeClass('acerto');
	$('#box').addClass('erro');
}
function inAccept(){
	$('#box').addClass('acerto');
	$('#box').removeClass('erro');
}

function highlightState(state, letter){
	$('#automato tr').removeClass('estado_selecionado');
	$('#automato td').removeClass('letra_selecionada');
	$('#automato .estado_' + state).addClass('estado_selecionado');
	$('#automato .letra_' + letter).addClass('letra_selecionada');
}